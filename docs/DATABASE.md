# Rudraas Careers Portal — Database Schema & Indexes

MongoDB via Mongoose. Five collections, all defined in
`careers-portal/backend/src/database/schemas/`. `autoIndex` is enabled in
development (indexes build automatically on boot) and disabled in production
— see `docs/DEPLOYMENT.md` §5 for the one-off `Model.syncIndexes()` step
required after the first production deploy and after any index change.

## `users`

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `email` | String | required, **unique**, lowercased |
| `passwordHash` | String | `select: false` — bcrypt, never serialized (stripped again in `toJSON`) |
| `role` | Enum `ADMIN \| HR` | required |
| `isActive` | Boolean | default `true`; `false` = deactivated (soft delete) |
| `lastLoginAt` | Date \| null | |
| `createdBy` | ObjectId → `User` \| null | |
| `passwordResetCount` | Number | incremented on every admin-initiated reset |

**Indexes**: `email` unique; `role`; `isActive`; text index on `name`+`email`
(global search / user-list search).

## `refresh_tokens`

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → `User` | required |
| `tokenHash` | String | **unique** — SHA-256 of the opaque token; the raw token is never persisted |
| `expiresAt` | Date | required |
| `revoked` | Boolean | default `false` |
| `replacedBy` | ObjectId → `RefreshToken` \| null | set on rotation |
| `userAgent`, `ip` | String | audit context |

**Indexes**: `user`; `tokenHash` unique; `expiresAt` as a **TTL index**
(`expireAfterSeconds: 0`) — MongoDB automatically deletes expired tokens, no
cron needed.

## `jobs`

| Field | Type | Notes |
|---|---|---|
| `title` | String | the "Role" from the product spec (named `title` to avoid clashing with the RBAC `Role` enum) |
| `slug` | String | required, **unique**, lowercased — generated from `title` via `slugify` + a short random suffix on collision |
| `department`, `location` | String | required |
| `employmentType` | Enum `FULL_TIME \| PART_TIME \| CONTRACT \| INTERNSHIP \| FREELANCE` | |
| `experience` | `{ minYears, maxYears }` | subdocument |
| `skills` | String[] | |
| `description`, `responsibilities`, `requirements` | String (HTML) | sanitized server-side (`sanitizeRichText`) before persisting |
| `budget` | String \| null | free text — exact figure, range, or "Negotiable" |
| `jdAttachment` | `{ url, fileName, mimeType, sizeBytes }` \| null | optional file alternative/supplement to the rich-text JD |
| `isUrgent`, `isPublished`, `isClosed`, `isArchived` | Boolean | all default `false` |
| `openingDate`, `closingDate` | Date \| null | set automatically on publish/close |
| `createdBy`, `updatedBy` | ObjectId → `User` | `createdBy` required, always an HR user |
| `duplicatedFrom` | ObjectId → `Job` \| null | set when created via "Duplicate Opening" |

**Indexes**:
- `slug` unique
- Compound `{ isPublished, isClosed, isArchived, department, location }` — the public listing's primary filter path
- Compound `{ isPublished, isClosed, isArchived, employmentType }`
- Compound `{ isPublished, isUrgent, createdAt: -1 }` — urgent-first public sort
- `createdAt: -1` — backoffice list default sort
- Text index on `title` + `department` + `skills` + `location` — public search and the backoffice global-search's "jobs" scope

## `candidates` (the "Application" model)

| Field | Type | Notes |
|---|---|---|
| `opening` | ObjectId → `Job` | required |
| `name`, `email`, `mobile` | String | `email` lowercased |
| `linkedin`, `portfolio` | String \| null | |
| `currentCompany`, `designation` | String \| null | |
| `experienceYears` | Number | 0–60 |
| `qualification` | String | |
| `currentCtc` | String \| null | free text (e.g. "₹18 LPA", "Not disclosed") |
| `expectedCtc`, `noticePeriod`, `currentLocation`, `preferredLocation` | String | required |
| `resumeUrl` | String | the backend's own authenticated download-endpoint path, **not** a direct storage URL |
| `resumeStorageKey` | String | `select: false` — the S3/MinIO object key; only ever read server-side to mint a presigned URL |
| `resumeFileName`, `resumeMimeType`, `resumeSizeBytes` | | |
| `introduction` | String \| null | max 2000 chars |
| `source` | Enum `WEBSITE \| LINKEDIN \| NAUKRI \| REFERRAL \| CAMPUS \| WALK_IN \| RECRUITER \| CONSULTANCY \| OTHER` | default `WEBSITE` |
| `sourceDetail` | String \| null | free text, used for manual HR entries (e.g. recruiter/consultancy name) |
| `status` | Enum (12 values — see `RBAC.md`) | default `APPLIED` |
| `internalNotes` | `[{ note, addedBy, createdAt }]` | HR-only notes, never shown to candidates |
| `statusHistory` | `[{ status, changedBy, remark, changedAt }]` | append-only timeline |
| `activityLog` | `[{ action, performedBy, metadata, createdAt }]` | general activity feed (submission, note added, etc.) |
| `consentGiven` | Boolean | required — the application form's consent checkbox |
| `createdBy` | ObjectId → `User` \| null | `null` for public self-submissions, set for HR manual entries |

**Indexes**:
- **Compound unique** `{ opening: 1, email: 1 }` — one application per email per opening; this is the authoritative duplicate-prevention mechanism (the service layer also checks explicitly first, for a clean error message, but the index is what actually prevents a race-condition double-insert)
- `{ status, createdAt: -1 }`, `{ source, createdAt: -1 }`, `{ opening, status }`, `createdAt: -1`
- Text index on `name` + `email` + `currentCompany` — search and global search's "candidates" scope

## `audit_logs`

| Field | Type | Notes |
|---|---|---|
| `actor` | ObjectId → `User` \| null | `null` for unauthenticated events (e.g. `LOGIN_FAILED`) |
| `actorEmail` | String \| null | denormalized so a log entry is still meaningful after a user is deactivated |
| `action` | Enum (`AuditAction` — LOGIN, CREATE, UPDATE, DELETE, PUBLISH, STATUS_CHANGE, EXPORT, RESUME_DOWNLOAD, …) | |
| `entityType` | Enum `USER \| JOB \| APPLICATION \| AUTH` | |
| `entityId` | ObjectId \| null | |
| `before`, `after` | Mixed \| null | shallow before/after snapshots, never full documents with secrets |
| `ip`, `userAgent` | String \| null | |

**Indexes**: `{ entityType, entityId, createdAt: -1 }` (entity history lookups), `createdAt: -1` (recent-activity feed), plus single-field indexes on `actor`/`action`/`entityType`/`entityId` for the Admin audit-log viewer's filters.

No TTL on this collection — audit logs are retained indefinitely (a real
retention/archival policy is an infrastructure decision for the operator, not
something the application enforces).
