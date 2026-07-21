# Rudraas Careers Portal — RBAC & Permissions

Two roles, enforced at the API layer via a global `RolesGuard` (never trust
the frontend for authorization — the admin SPA hides/disables controls the
current user can't use, purely for UX; every mutating endpoint re-checks the
role server-side).

- **Public / unauthenticated** — anyone, no account. Can browse published
  jobs and submit one application per opening.
- **HR** — the primary operator role. Owns the full job-requisition and
  candidate-pipeline lifecycle.
- **ADMIN** — platform administration. Explicitly **cannot** create or edit
  job openings (a deliberate separation of duties from the product spec) but
  can see everything, manage HR/Admin accounts, and access system-wide
  analytics, exports, and the audit log.

## Permission matrix

| Capability | Public | HR | Admin |
|---|:---:|:---:|:---:|
| View published openings, search/filter | ✅ | ✅ (backoffice view, incl. drafts) | ✅ (read-only) |
| Submit an application | ✅ | — | — |
| Create / edit a job opening | — | ✅ | ❌ |
| Publish / close / archive / mark urgent / duplicate a job | — | ✅ | ❌ |
| Delete a job opening (blocked if it has applications) | — | ✅ | ❌ |
| Manually add a candidate (LinkedIn/Naukri/Referral/…) | — | ✅ | — |
| View applications, search/filter | — | ✅ | ✅ |
| Change application status, add internal notes | — | ✅ | ✅ |
| Edit candidate fields | — | ✅ | ✅ |
| Bulk status update / bulk resume download | — | ✅ | ✅ |
| Download a single resume | — | ✅ | ✅ |
| Export applications to Excel | — | ✅ | ✅ |
| **Delete an application** | — | ❌ | ✅ |
| View Admin dashboard (org-wide analytics) | — | ❌ | ✅ |
| View HR dashboard (assigned openings, pipeline) | — | ✅ | ❌ |
| Global search (jobs/candidates/HR/departments) | — | ✅ | ✅ |
| Create / manage Admin & HR user accounts | — | ❌ | ✅ |
| Reset another user's password | — | ❌ | ✅ |
| Deactivate / reactivate a user account | — | ❌ | ✅ |
| View the audit log | — | ❌ | ✅ |

Two policy calls in that table aren't literally spelled out in the product
brief and are worth flagging explicitly:

- **Application delete is Admin-only.** Neither role's capability list in
  the spec explicitly grants deleting a candidate record, but the REST
  surface requires the endpoint to exist. Destroying candidate data
  permanently is higher-risk than any HR status/edit action, so it defaults
  to the more restricted role rather than being opened to HR by default.
- **HR dashboard's "Assigned Openings"** currently means *"openings this HR
  user created"* — there is no recruiter-assignment model yet (a documented
  future feature in `ARCHITECTURE.md` §6). This is a stand-in, not a
  misinterpretation to "fix" without also shipping real assignment.

## How it's enforced (backend)

```ts
@Roles(Role.HR)                 // class- or method-level decorator
@Patch(':id/publish')
publish(@Param('id') id, @CurrentUser() user) { ... }
```

- `@Public()` on a route skips the global `JwtAuthGuard` entirely (used only
  for the public job-listing/detail/apply endpoints and `/health`).
- Every other route requires a valid access-token Bearer header
  (`JwtAuthGuard`), which also re-checks the user's `isActive` flag against
  the database on **every request** — a deactivated user's still-unexpired
  access token stops working immediately, it doesn't wait for token expiry.
- `@Roles(...)` (checked by `RolesGuard`) then narrows to the allowed
  role(s); omitting it means "any authenticated user, any role."
- `POST /auth/refresh` and `POST /auth/logout` additionally require
  `CsrfGuard` (double-submit cookie check) since they're the two endpoints
  that rely on the httpOnly refresh-token cookie instead of an
  `Authorization` header — see `docs/SECURITY.md`.

## How it's enforced (admin frontend)

`RoleRoute` wraps route elements that only one role should ever reach (today,
only `/users` → `allow={['ADMIN']}`), redirecting away otherwise. Individual
components additionally read `useAuth().user.role` to hide/disable
role-inappropriate controls (e.g. the Jobs feature renders a fully read-only
view for Admins — no create/edit form, no Publish/Close/Archive/Duplicate/
Delete actions). This is a UX convenience only; it is not a security
boundary — the API-layer checks above are.
