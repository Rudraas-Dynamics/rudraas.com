# Rudraas Careers Portal — System Architecture

## 1. Systems overview

The Careers Portal is a second, independently-deployed product that integrates
with the existing Rudraas marketing site. Three applications, three
deployment targets:

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│   rudraas.com            │        │   career.rudraas.com          │
│   Next.js 16 (Vercel)     │        │   nginx (edge, TLS + routing) │
│                           │        │  ┌────────────┬─────────────┐ │
│   /career            ─────┼───────▶│  │ /           │ /api/       │ │
│   /career/:slug           │  HTTPS │  │ career-admin│ career-api  │ │
│   (Server Components,     │        │  │ (Vite SPA,  │ (NestJS)    │ │
│    fetch career API)      │        │  │  own nginx) │             │ │
└─────────────────────────┘        │  └────────────┴──────┬──────┘ │
                                     └───────────────────────┼────────┘
                                                              │
                                        ┌─────────────────────┼─────────────────┐
                                        │                     │                 │
                                   ┌────▼────┐         ┌──────▼──────┐   ┌──────▼─────┐
                                   │ MongoDB │         │ S3 / MinIO   │   │  ClamAV    │
                                   │ (jobs,  │         │ (resumes,    │   │  (resume   │
                                   │candidates,│       │  JD files)   │   │  virus     │
                                   │users,   │         └──────────────┘   │  scanning) │
                                   │auditlog)│                            └────────────┘
                                   └─────────┘
                                        SMTP (Nodemailer) → HR / Admin / candidate emails
```

- **rudraas.com** (existing, unchanged deployment): public marketing site.
  Two new routes, `/career` and `/career/:slug`, plus an application form,
  call the Career API's **public, unauthenticated** endpoints directly from
  the browser/server (`NEXT_PUBLIC_CAREER_API_BASE_URL`). No new backend
  code runs inside the Next.js app — it is a pure API consumer.
- **career.rudraas.com** (new): the HR/Admin backoffice. A Vite/React SPA
  (`career-admin`) served by its own nginx container, fronted by an edge
  nginx that terminates TLS, applies rate limiting, and reverse-proxies
  `/api/*` to the NestJS backend (`career-api`) and everything else to the
  SPA container.
- **career.rudraas.com/api** : the NestJS REST API, consumed by both the
  admin SPA (authenticated, JWT) and the public marketing site (unauthenticated,
  read-only + application submission).

## 2. Why a separate portal, not a Next.js API route

The product spec calls for the Careers Portal to be **hosted separately**
with its own frontend/backend/database, independent of the marketing site's
release cadence, scaling profile, and (crucially) its Vercel deployment
model, which is not well suited to a stateful RBAC backend with file uploads,
background email delivery, and MongoDB connection pooling. Splitting the
system this way also means the HR backoffice can be iterated on and deployed
without ever touching, rebuilding, or risking the public marketing site.

## 3. Backend: NestJS clean-architecture layering

```
careers-portal/backend/src/
├── main.ts                   # bootstrap: helmet, compression, cookies,
│                              # CORS, versioning, global pipes/filters/
│                              # interceptors, Swagger (non-prod only)
├── app.module.ts              # composition root — wires every feature module
├── config/                    # env loading + validation (class-validator)
├── database/
│   ├── database.module.ts     # Mongoose connection (autoIndex off in prod)
│   ├── schemas/                # Job, Candidate, User, RefreshToken, AuditLog
│   └── seeds/run-seed.ts      # idempotent first-admin bootstrap
├── common/                    # cross-cutting: guards, decorators, filters,
│                              # interceptors, pipes, DTO base classes, utils
│                              # (sanitizer, pagination) — no business logic
└── modules/
    ├── auth/                  # login/refresh/logout, JWT strategy
    ├── users/                 # Admin-only user management (RBAC)
    ├── jobs/                  # opening CRUD + public listing/search
    ├── applications/          # candidate applications (public + backoffice)
    ├── upload/                 # S3/MinIO storage + virus scanning
    ├── email/                  # Nodemailer notifications (Global module)
    ├── export/                 # ExcelJS report generation
    ├── dashboard/              # aggregation-pipeline analytics
    ├── search/                 # cross-entity global search
    └── audit-log/              # immutable audit trail (Global-adjacent)
```

Each feature module is a self-contained Nest module: its own Mongoose model
bindings (`MongooseModule.forFeature`), DTOs (validated with
`class-validator`), a service (business logic + persistence), and a
controller (HTTP + RBAC + Swagger only — controllers never touch Mongoose
directly). Cross-module reads (e.g. Dashboard reading `Job`/`Candidate`, or
Jobs checking for referencing `Candidate` documents before delete) bind the
same schema again via `forFeature` in the consuming module rather than
importing the owning module's service — this keeps modules decoupled and
avoids circular-dependency risk between, e.g., Jobs and Applications.

**Request pipeline** (global, applied in `main.ts`/`app.module.ts` to every
request):

```
Helmet → compression → cookie-parser → CORS → URI versioning (/api/v1)
  → ThrottlerGuard (rate limit) → JwtAuthGuard (unless @Public()) → RolesGuard
  → ValidationPipe (whitelist + transform) → controller handler
  → TransformInterceptor ({success:true,data,meta}) → HttpExceptionFilter (on error)
```

## 4. Frontend: two independent React apps

**Public site** (`rudraas.com`, Next.js App Router): Server Components fetch
the Career API directly (`lib/career-api.ts`), so job listings and detail
pages are SEO-indexable and cache via Next's `fetch` revalidation. The
application form is a Client Component (`components/career/application-form.tsx`)
posting `multipart/form-data` straight to the Career API — no server action
in the middle, since a resume upload has nothing to gain from proxying
through the Next.js server and everything to lose (double upload latency,
Vercel's request body limits).

**Admin SPA** (`career-admin`, Vite + React): a classic SPA — TanStack Query
owns all server state (no Redux/global store), React Hook Form + Zod own all
form state, React Router owns navigation. Auth state (the in-memory access
token + current user) lives in a small `AuthProvider` context; the refresh
token never touches JS — it's an httpOnly cookie, rotated on every refresh,
with double-submit CSRF protection on the two cookie-authenticated endpoints
(`/auth/refresh`, `/auth/logout`). See `docs/SECURITY.md` for the full
rationale.

## 5. Data flow: a public application end-to-end

1. Candidate visits `rudraas.com/career`, a Server Component that calls
   `GET /api/v1/jobs/public` (published, non-closed, non-archived openings
   only; internal fields like `createdBy` are projected out).
2. Candidate opens a job (`/career/:slug` → `GET /jobs/public/:slug`) and
   submits the application form (`POST /applications`, multipart, rate
   limited to 5/min/IP).
3. The backend: validates the DTO → confirms the opening is still open →
   checks the `(opening, email)` uniqueness constraint (both explicitly and
   via the DB's unique index, as a race-condition backstop) → validates the
   resume (MIME/extension/size) → scans it via ClamAV (`upload` module) →
   uploads it to the private S3/MinIO bucket → creates the `Candidate`
   document with `status: APPLIED` and an initial status-history/activity-log
   entry → fires the candidate-acknowledgement and HR-new-application emails
   (best-effort, failures are logged not thrown) → writes an `AuditLog` entry.
4. HR sees the new application on `career.rudraas.com` (`GET /applications`,
   backed by the same `Candidate` collection), moves it through the pipeline
   (`PATCH /applications/:id/status`), and can export the whole filtered set
   to Excel or download the original resume via a short-lived presigned URL.

## 6. Extensibility (explicitly designed for, not yet built)

The schemas and module boundaries leave room for these without a rearchitecture:

- **Interview scheduling** — a new `Interview` collection referencing
  `Candidate`/`User` (interviewer), plus a `dashboard` chart already reads
  `statusHistory`, so a scheduling module would slot in alongside
  `applications` without touching it.
- **Recruiter assignment** — `Job.createdBy` currently stands in for
  "assigned HR" on the HR dashboard; adding a first-class `assignedTo: User[]`
  field to `Job` is additive (optional field, existing indexes untouched).
- **Candidate login / self-service portal** — `Candidate.email` is already
  unique per opening; a separate lightweight auth module for candidates
  (distinct from the Admin/HR `User`/`AuthModule`) can be added without
  touching the existing RBAC model, since `Role` only ever meant
  Admin/HR internally.
- **Offer management** — `ApplicationStatus` already includes
  `OFFER_RELEASED`; an `Offer` sub-document or collection can hang off
  `Candidate._id` the same way `internalNotes`/`statusHistory` do today.
- **HR analytics expansion** — `DashboardService` already isolates every
  chart as its own aggregation; new charts are additive methods, not a
  rewrite.
