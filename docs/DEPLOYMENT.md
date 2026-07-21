# Rudraas Careers Portal - Deployment Guide

This repo hosts three applications that are deployed independently:

| App | Location | Deployment target |
|---|---|---|
| Marketing site (existing) | repo root (Next.js 16) | Vercel |
| Career API (new) | `careers-portal/backend` (NestJS 10) | Docker, this guide |
| Career Admin SPA (new) | `careers-portal/admin-frontend` (Vite + React) | Docker (nginx), this guide |

This guide covers the production deployment of the Career API and Career
Admin SPA (and their backing services: MongoDB, S3/MinIO, ClamAV, edge
nginx), plus the one Vercel change needed for the marketing site.

---

## 0. Marketing site (Vercel) - the one change needed

The marketing site already deploys via Vercel's own GitHub App integration
(confirmed: `@vercel/analytics` in the root `package.json`, no
`vercel.json` or GitHub Actions workflow for it in this repo - Vercel
manages the build/deploy config on its own dashboard, not in-repo). No new
Dockerfile, compose service, or CI workflow is needed for it.

The only change required is adding one environment variable in the
Vercel project settings (Project -> Settings -> Environment Variables),
for Production (and Preview, if career pages should work in preview
deployments too):

```
NEXT_PUBLIC_CAREER_API_BASE_URL=https://career.rudraas.com/api/v1
```

Redeploy (or let the next push trigger a deploy) after adding it.

---

## 1. Prerequisites

- A Linux host (or a Kubernetes cluster, if you're translating this compose
  stack to k8s manifests) with:
  - Docker Engine + the Compose plugin (`docker compose version` >= v2)
  - Enough disk for the `mongo-data`, `minio-data`, and `clamav-data`
    volumes (ClamAV's virus signature DB alone is ~200-300MB and grows)
- A domain you control DNS for (`rudraas.com`), specifically the ability to
  add an `A`/`AAAA` record for the `career` subdomain.
- Outbound internet access from the host (ClamAV signature updates, npm/apt
  during image builds, ACME cert issuance).

---

## 2. DNS

| Record | Type | Value |
|---|---|---|
| `career.rudraas.com` | A (or AAAA) | Public IP of the Docker host running the `nginx` compose service |
| `rudraas.com` / `www` | (unchanged) | Vercel's existing records - not part of this change |

Wait for DNS propagation (`dig career.rudraas.com`) before requesting a
certificate in step 3.

---

## 3. TLS certificates

`infra/nginx/career.rudraas.com.conf` expects certs at:

```
infra/nginx/certs/career.rudraas.com/fullchain.pem
infra/nginx/certs/career.rudraas.com/privkey.pem
```

These are placeholder paths - populate them yourself with a real
certificate. Two common ways with certbot (Let's Encrypt):

**Standalone (before nginx is running / port 80 free):**

```bash
sudo certbot certonly --standalone -d career.rudraas.com \
  --preferred-challenges http --http-01-port 80

sudo mkdir -p infra/nginx/certs/career.rudraas.com
sudo cp /etc/letsencrypt/live/career.rudraas.com/fullchain.pem infra/nginx/certs/career.rudraas.com/
sudo cp /etc/letsencrypt/live/career.rudraas.com/privkey.pem   infra/nginx/certs/career.rudraas.com/
```

**Webroot (nginx already running, reuses the `acme-challenge` location
already configured in the HTTP server block):**

```bash
sudo certbot certonly --webroot -w /var/www/certbot -d career.rudraas.com
```

(If you use the webroot method, also bind-mount a shared
`/var/www/certbot` volume between certbot and the `nginx` service, matching
the `location /.well-known/acme-challenge/` block already in
`infra/nginx/career.rudraas.com.conf`.)

**Renewal:** Let's Encrypt certs expire every 90 days. Add a systemd timer
or cron job that renews and reloads nginx:

```cron
0 3 * * * certbot renew --quiet --deploy-hook \
  "cp /etc/letsencrypt/live/career.rudraas.com/*.pem /path/to/repo/infra/nginx/certs/career.rudraas.com/ && docker compose -f /path/to/repo/docker-compose.yml exec nginx nginx -s reload"
```

---

## 4. Environment files

Copy each `.env.example` to `.env` alongside it and fill in real values:

| File | Purpose |
|---|---|
| `.env.example` (repo root) | docker-compose's own top-level vars: Mongo/MinIO root creds, `ADMIN_API_BASE_URL` (Vite build arg) |
| `careers-portal/backend/.env.example` | Career API runtime config: Mongo URI, JWT secrets, S3/MinIO, SMTP, ClamAV, rate limits, seed-admin bootstrap |
| `careers-portal/admin-frontend/.env.example` | `VITE_API_BASE_URL` - only relevant for local `npm run dev`; in the Docker build it's passed as the `VITE_API_BASE_URL` build ARG instead (see `careers-portal/admin-frontend/Dockerfile` and `ADMIN_API_BASE_URL` in the root `.env`) |

Generate real secrets, don't hand-type them - e.g.:

```bash
openssl rand -base64 64   # JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, COOKIE_SECRET
```

---

## 5. MongoDB

Two supported options:

### Option A - MongoDB Atlas (recommended for real production use)

1. Create a dedicated project/cluster for the Careers Portal.
2. Create a database user scoped to the `careers` database only.
3. Restrict network access to the Career API host's IP (or your VPC peering
   / private endpoint, if the host is in the same cloud).
4. Set `MONGODB_URI` in `careers-portal/backend/.env` to the Atlas
   connection string (`mongodb+srv://...`), with `authSource` implied by
   the SRV record.

### Option B - self-hosted via the compose `mongo` service (small deployments only)

The `mongo` service in the root `docker-compose.yml` is provided for
small/local deployments. For this path:

- Set `MONGO_ROOT_USERNAME` / `MONGO_ROOT_PASSWORD` in the root `.env`.
- For simplicity, local/dev `MONGODB_URI` in
  `careers-portal/backend/.env` points directly at those root credentials,
  e.g. `mongodb://<root-user>:<root-pass>@mongo:27017/careers?authSource=admin`.
  **This is acceptable for local/dev only** - it is not a least-privilege
  setup. We deliberately did not script a separate `career_api` app-user
  creation step in `infra/mongo/init-mongo.js`, because the official Mongo
  image's init-script mechanism doesn't offer a stable, version-portable
  way to interpolate a generated password into that script. For anything
  resembling production, use Atlas (Option A) or provision an app-scoped
  user manually against a real replica set out-of-band.
- For actual production self-hosting, run MongoDB as a proper replica set
  (not the single-node `mongo` compose service) with its own backup and
  failover story.

### Index creation in production

`careers-portal/backend/src/database/database.module.ts` disables
Mongoose's `autoIndex` whenever `NODE_ENV=production`
(`autoIndex: config.get('env') !== 'production'`) - this is correct
production behavior (index builds shouldn't happen implicitly on every app
boot), but it means indexes must be created explicitly once, out of band.

The production-safe approach: write (or reuse, if the team adds one to
`src/database/seeds`) a small one-off script that connects using the same
Mongoose models as the app and calls `Model.syncIndexes()` for every
registered schema, e.g.:

```ts
// scripts/sync-indexes.ts (run once against production, NODE_ENV can stay 'production')
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  for (const modelName of ['User', 'Job', 'Application' /* ...all schemas */]) {
    const model = app.get(getModelToken(modelName));
    await model.syncIndexes();
    console.log(`synced indexes for ${modelName}`);
  }
  await app.close();
}
run();
```

Run it once per environment before (or immediately after) first boot, and
again after any schema/index change ships. Avoid the alternative of
temporarily setting `NODE_ENV=development` in production just to get
`autoIndex` - that also flips other production-only behavior in
`main.ts` (Swagger docs get served, CSP gets disabled), which you don't
want exposed on a live host even briefly.

---

## 6. Object storage (resumes)

Two supported options, matching `STORAGE_DRIVER` in
`careers-portal/backend/.env.example`:

### Option A - AWS S3 (recommended for production)

1. Create a private S3 bucket (block all public access), e.g.
   `rudraas-career-resumes`.
2. Create an IAM policy scoped to only that bucket:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:GetObject"],
         "Resource": "arn:aws:s3:::rudraas-career-resumes/*"
       }
     ]
   }
   ```

3. Create an IAM user (or role, if the Career API host runs on EC2/ECS and
   can assume a role instead of static keys) with only that policy
   attached, and generate an access key pair for it.
4. Set in `careers-portal/backend/.env`:
   ```
   STORAGE_DRIVER=s3
   S3_ENDPOINT=
   S3_REGION=<your bucket's region>
   S3_BUCKET=rudraas-career-resumes
   S3_ACCESS_KEY_ID=<the IAM user's access key>
   S3_SECRET_ACCESS_KEY=<the IAM user's secret key>
   S3_FORCE_PATH_STYLE=false
   ```
5. Enable bucket versioning (see Backups, section 9) and consider a
   lifecycle rule to transition old versions to cheaper storage.

### Option B - self-hosted MinIO (compose `minio` service)

Already wired up in `docker-compose.yml` (`minio` + `minio-init`, which
creates the `rudraas-career-resumes` bucket on first boot). Set:

```
STORAGE_DRIVER=s3
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=rudraas-career-resumes
S3_ACCESS_KEY_ID=<MINIO_ROOT_USER from root .env>
S3_SECRET_ACCESS_KEY=<MINIO_ROOT_PASSWORD from root .env>
S3_FORCE_PATH_STYLE=true
```

(`S3_FORCE_PATH_STYLE=true` is required for MinIO - it doesn't support
virtual-hosted-style addressing the way AWS S3 does by default.)

---

## 7. SMTP / email

Set in `careers-portal/backend/.env` (`SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`). Any standard SMTP provider
works; common choices:

- **SendGrid** - `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`,
  `SMTP_USER=apikey`, `SMTP_PASSWORD=<SendGrid API key>`.
- **Amazon SES** - `SMTP_HOST=email-smtp.<region>.amazonaws.com`,
  `SMTP_PORT=587`, credentials from an SES SMTP IAM user (not your regular
  AWS access key - SES issues separate SMTP credentials).
- **Postmark** - `SMTP_HOST=smtp.postmarkapp.com`, `SMTP_PORT=587`,
  `SMTP_USER`/`SMTP_PASSWORD` both set to your Postmark Server API token.

Also set `HR_NOTIFICATION_EMAILS` / `ADMIN_NOTIFICATION_EMAILS` to real
distribution addresses.

---

## 8. First-boot sequence

```bash
# From the repo root, with .env and careers-portal/backend/.env populated:

# 1. Bring up backing services first
docker compose up -d mongo minio clamav

# 2. Wait for them to report healthy
docker compose ps

# 3. Bootstrap the first Admin user (reads SEED_ADMIN_* from
#    careers-portal/backend/.env)
docker compose run --rm career-api npm run seed

# 3b. (Production only) sync indexes once - see section 5
docker compose run --rm career-api node -r tsconfig-paths/register dist/scripts/sync-indexes.js

# 4. Bring up the API, admin SPA, and edge nginx (which needs certs already
#    in place per section 3)
docker compose up -d career-api career-admin nginx
```

### Verify

```bash
curl -s https://career.rudraas.com/api/health | jq
# {"status":"ok","uptimeSeconds":12,"mongo":"up","timestamp":"..."}
```

If `mongo` reports `"down"`, check `MONGODB_URI` and that the `mongo`
service (or Atlas) is reachable from the `career-api` container.

---

## 9. Backups

- **MongoDB:** nightly `mongodump` (or Atlas's built-in continuous
  backup, if using Atlas) to off-host storage (e.g. an S3 bucket separate
  from the resumes bucket). Example cron for the self-hosted path:

  ```cron
  0 2 * * * docker compose -f /path/to/repo/docker-compose.yml exec -T mongo \
    mongodump --uri="$MONGODB_URI" --archive | gzip > /backups/careers-$(date +\%F).archive.gz
  ```

  Retain at least 7 daily + 4 weekly snapshots, and periodically test a
  restore.

- **Resumes (S3/MinIO):** enable bucket versioning (S3: via the console or
  `aws s3api put-bucket-versioning --bucket rudraas-career-resumes
  --versioning-configuration Status=Enabled`; MinIO: `mc version enable
  local/rudraas-career-resumes`). This protects against accidental deletes/
  overwrites and lets you recover a prior version of a resume object.

---

## 10. Scaling notes

- **career-api** is stateless (JWT-based auth, no server-side session
  storage), so it scales horizontally trivially: run multiple replicas
  behind the edge nginx and add an `upstream` block listing each replica
  (or run behind a proper load balancer / orchestrator like k8s, which
  handles this natively). No sticky sessions needed.
- **MongoDB** scales via a real replica set (read replicas + automatic
  failover) or, more simply, an Atlas cluster with the tier bumped up -
  don't try to scale the single-node `mongo` compose service, it's dev/
  small-deployment only (see section 5).
- **career-admin** is a fully static SPA - it's trivially cacheable and
  CDN-able (e.g. put it behind CloudFront/Cloudflare, or just let the edge
  nginx's `location /assets/` immutable-cache headers do the work). It has
  no server-side state at all.
- **ClamAV** is CPU/RAM-bound during scans; if upload volume grows, give it
  its own resource limits/replica rather than co-locating it tightly with
  career-api.

---

## Summary of files this guide assumes

- `docker-compose.yml` (repo root)
- `.env.example` (repo root) / `careers-portal/backend/.env.example` /
  `careers-portal/admin-frontend/.env.example`
- `careers-portal/backend/Dockerfile`, `.dockerignore`
- `careers-portal/admin-frontend/Dockerfile`, `.dockerignore`, `nginx.conf`
- `infra/mongo/init-mongo.js`
- `infra/nginx/career.rudraas.com.conf`, `infra/nginx/certs/` (cert
  material placed here out-of-band)
- `.github/workflows/career-api-ci.yml`,
  `.github/workflows/career-admin-ci.yml`
