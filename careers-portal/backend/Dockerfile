# syntax=docker/dockerfile:1

# =============================================================================
# Rudraas Careers Portal API (NestJS 10) - production image
#
# Stages:
#   deps       - installs full (dev+prod) deps, needed to run `nest build`
#   build      - compiles TypeScript -> dist/
#   prod-deps  - installs ONLY production deps in a clean layer (no dev deps,
#                no build toolchain) so the final image stays small and lean
#   runtime    - final image: prod deps + compiled dist/, runs as non-root
# =============================================================================

# ---- deps -------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build -------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY . .
RUN npm run build

# ---- prod-deps ---------------------------------------------------------------
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- runtime -------------------------------------------------------------------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# node:20-alpine already ships an unprivileged "node" user (uid 1000)
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=build /app/dist ./dist

# wget is available in alpine's busybox base and is enough for the HEALTHCHECK
USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health | grep -q '"status":"ok"' || exit 1

CMD ["node", "dist/main.js"]
