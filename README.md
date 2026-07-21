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

## Careers Portal

This repo also hosts the source for the **Careers Portal**, a separately
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
