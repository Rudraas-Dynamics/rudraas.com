# rudraas.com

Official website for **Rudraas Dynamics** — a sovereign Indian defence platform built for the Indo-Pacific.

## Stack

- [Next.js 16](https://nextjs.org/) — framework
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [TypeScript](https://www.typescriptlang.org/) — language

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
pnpm build
pnpm start
```

## Structure

```text
app/          → pages & layout
components/   → page sections (Hero, Header, Careers, Contact…)
components/ui → reusable UI primitives
public/       → static assets & images
```

## Careers (HRMS-backed)

The public `/career` and `/career/:slug` pages read from the Rudraas HRMS
public careers API (`GET /jobs`, `/jobs/filters`, `/jobs/:slug`,
`POST /applications`). Set `NEXT_PUBLIC_CAREER_API_BASE_URL` to
`https://<hrms-host>/api/public/careers` (see `.env.example`), and add this
site's origin to the HRMS `CAREERS_ALLOWED_ORIGINS`. Pages use ISR, so jobs
refresh within ~60s of being published/unpublished. Run unit tests with
`npm test`.

## Legacy Careers Portal (superseded)

The legacy Careers Portal below is superseded by the HRMS Recruitment module
and is no longer used by the website. This repo still hosts the source for the **Careers Portal**, a separately
deployed system (`career.rudraas.com`) that the `/career` and `/career/:slug`
pages above integrate with:

```text
careers-portal/backend/         → NestJS REST API (career.rudraas.com/api)
careers-portal/admin-frontend/  → HR/Admin dashboard SPA (career.rudraas.com)
infra/                          → nginx configs, Mongo init script
docker-compose.yml              → local/self-hosted orchestration
docs/                           → architecture, database, RBAC, security,
                                   and deployment documentation
```

See `docs/ARCHITECTURE.md` for the full system design and
`docs/DEPLOYMENT.md` for how to run or deploy it.
