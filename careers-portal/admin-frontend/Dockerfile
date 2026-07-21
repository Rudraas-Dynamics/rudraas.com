# syntax=docker/dockerfile:1

# =============================================================================
# Rudraas Careers Portal - Admin SPA (Vite + React) - production image
#
# IMPORTANT: Vite inlines every `import.meta.env.VITE_*` reference into the
# built JS bundle at BUILD time (there is no runtime env injection like a
# server-rendered app would have). That means VITE_API_BASE_URL must be
# available as a build ARG/ENV *before* `npm run build` runs, and a change to
# it requires rebuilding the image - it cannot be swapped by just changing a
# container env var at `docker run` time.
# =============================================================================

# ---- build -------------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Build-time only: baked into the static JS bundle by Vite, not a secret.
ARG VITE_API_BASE_URL=https://career.rudraas.com/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# `npm run build` runs `tsc -b && vite build`; VITE_API_BASE_URL must already
# be set in the environment above this line.
RUN npm run build

# ---- runtime -------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
