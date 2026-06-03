# syntax=docker/dockerfile:1
# Build context = repo root (monorepo). On Render set Dockerfile Path to
# apps/api/Dockerfile and leave Docker Build Context Directory as the repo root.

FROM node:20-slim AS base
# openssl is required by Prisma's query engine at generate + runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# node:20-slim ships an old corepack whose key can't verify pnpm 9.15 — refresh it first
RUN npm install -g corepack@latest && corepack enable
WORKDIR /app

# ── deps: install only @jongjongdi/api and its workspace deps ──────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json       apps/api/package.json
COPY apps/web/package.json       apps/web/package.json
COPY apps/admin/package.json     apps/admin/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/shared/package.json   packages/shared/package.json
RUN pnpm install --frozen-lockfile --filter @jongjongdi/api...

# ── build: bring in source and generate the Prisma client ──────────────────────
FROM deps AS build
COPY packages/ packages/
COPY apps/api/ apps/api/
RUN pnpm --filter @jongjongdi/database exec prisma generate

# ── runner ─────────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages     ./packages
COPY --from=build /app/apps/api     ./apps/api
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
WORKDIR /app/apps/api
# Render injects PORT; the app reads process.env.PORT. Workspace deps ship as
# raw .ts, so run via tsx instead of a tsc/dist build.
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
