# Rudraas Careers Portal — Security Model

## Transport & edge

- TLS terminated at the edge nginx (`infra/nginx/career.rudraas.com.conf`);
  HTTP requests are 301-redirected to HTTPS. Modern-only TLS
  (`TLSv1.2`/`TLSv1.3`), HSTS, and standard security headers
  (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- `helmet` is applied in the NestJS app itself as defense-in-depth even
  though nginx sits in front of it.
- Rate limiting exists at two layers: nginx (`limit_req_zone` on
  `/api/v1/applications`) and the application (`@nestjs/throttler`, global
  default + a tighter per-route `@Throttle` on login and public application
  submission). Losing either layer doesn't leave the API unprotected.

## Authentication

- **Access tokens**: short-lived JWTs (`JWT_ACCESS_EXPIRES_IN`, default
  15m), payload `{ sub, email, name, role }`, verified by a Passport JWT
  strategy that **also re-checks `isActive` against the database on every
  request** — deactivating a user takes effect immediately, not at token
  expiry.
- **Refresh tokens are opaque, not JWTs.** A 64-byte random value is
  generated per login/refresh; only its SHA-256 hash is persisted
  (`refresh_tokens.tokenHash`), and the raw value is sent exclusively via an
  `httpOnly`, `secure` (in production), `sameSite=strict` cookie scoped to
  `/api/v1/auth`. This sidesteps the usual JWT-refresh-token pitfalls
  (no way to inspect/decode client-side, no algorithm-confusion surface) and
  means a stolen access token alone can't mint new sessions.
- **Rotation + reuse detection**: every refresh **rotates** the token
  (marks the old one `revoked`, issues a new one). If a revoked token is
  ever presented again — the signature of a stolen-and-replayed token — the
  backend treats it as a compromise signal and **revokes every refresh token
  for that user**, forcing a fresh login everywhere.
- **CSRF (double-submit cookie)**: `/auth/refresh` and `/auth/logout` are
  the only two endpoints authenticated via a cookie rather than a header, so
  they're the only ones vulnerable to CSRF. A second, non-`httpOnly` cookie
  (`career_csrf`) is set alongside the refresh cookie; the admin SPA reads it
  with JS and echoes it in an `X-CSRF-Token` header, which the backend
  compares against the cookie value (`CsrfGuard`). A cross-site request can
  send the cookie automatically but can't read it to set the header.
- **Password storage**: bcrypt, cost factor 12. Minimum length 10 plus a
  complexity rule (upper/lower/digit/symbol) enforced via `class-validator`
  on both create and reset.
- **Generic auth error messages**: login failures return the same message
  ("Invalid email or password") whether the account doesn't exist, is
  deactivated, or the password is wrong — prevents user enumeration.

## Authorization

RBAC via `@Roles()` + a global `RolesGuard`, enforced server-side on every
mutating (and most read) endpoint — see `docs/RBAC.md` for the full matrix.
The frontend's role-based UI hiding is a UX convenience, never the actual
boundary.

## Input handling

- Every DTO is validated with `class-validator` under a global
  `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`
  — unknown fields are rejected outright, not silently dropped or passed
  through.
- **XSS**: HR-authored rich text (job description/responsibilities/
  requirements) is run through an allowlist HTML sanitizer
  (`sanitizeRichText`, `common/utils/sanitize-html.util.ts`) before it's
  persisted — stored HTML is safe to render on the public site via
  `dangerouslySetInnerHTML`. Free-text candidate fields (name, introduction,
  notes, manual-entry source detail) are run through `stripHtml`, which
  strips all markup — these fields should never contain HTML at all.
- **Mongo injection**: Mongoose casts query operators against a schema, and
  every filter the API builds from user input goes through typed DTOs first
  (never `req.query` passed straight into a Mongo filter object) — arbitrary
  operator injection via query params isn't possible through the validated
  DTO layer.

## File uploads (resumes / JD attachments)

- Accepted types restricted to PDF/DOC/DOCX by both MIME type and file
  extension; rejected otherwise (`BadRequestException`, not a silent skip).
- 10 MB hard limit, enforced both by Multer's `limits.fileSize` (fails fast,
  before the whole body is buffered) and again by an explicit size check.
- **Virus scanning**: every upload is streamed to a ClamAV daemon over the
  real `clamd` `INSTREAM` protocol (raw TCP, no fake/no-op scan) before it's
  written to storage; a `FOUND` verdict rejects the upload outright.
  `VIRUS_SCAN_ENABLED=false` is a legitimate, explicitly-documented local-dev
  toggle for environments without a running ClamAV daemon — never disable it
  in production.
- **Private storage, presigned reads only**: the S3/MinIO bucket is
  private — no public-read ACLs anywhere. Every download (single resume,
  bulk zip, JD attachment) goes through a short-lived presigned URL (5
  minutes) minted server-side after an authorization check, never a
  long-lived or public object URL. The `resumeUrl` field stored on a
  `Candidate` document is the backend's own authenticated download-endpoint
  path, not a storage URL — the storage object key
  (`resumeStorageKey`) is `select: false` and only ever read server-side.

## Audit logging

Every state-changing action (auth events, CRUD, publish/close/archive,
status changes, exports, resume downloads, user deactivation) writes an
immutable `AuditLog` entry (`actor`, `action`, `entityType`/`entityId`, a
shallow before/after diff, IP, user agent) — see `docs/DATABASE.md`. Entries
are written explicitly by each service after a successful operation (not via
a generic interceptor), so the before/after snapshot is always accurate to
what actually changed. Only Admins can read the audit log (`GET
/audit-logs`).

## CORS

`CORS_ORIGINS` is an explicit allowlist (the marketing site + the admin SPA
origin) with `credentials: true` — never a wildcard, since cookies are in
play for the refresh-token flow.

## Secrets

Nothing sensitive is committed — every credential-shaped value lives in a
`.env` file (gitignored) populated from the corresponding `.env.example`,
which only ever contains clearly-fake placeholders (`replace-with-...`,
`change-this-...`). See `docs/DEPLOYMENT.md` for how to generate real
secrets and provision least-privilege IAM policies for S3.
