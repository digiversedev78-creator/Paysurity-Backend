FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate

# Step 1: Install and Build
FROM base AS builder
WORKDIR /app

# ── Build-time arguments from cloudbuild.yaml ────────────────────────────────
# These MUST be declared before use — Docker ignores --build-arg silently otherwise
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_ENV=staging

# Expose to Next.js build process (NEXT_PUBLIC_ vars are inlined into the browser bundle)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_DASHBOARD_URL=$NEXT_PUBLIC_DASHBOARD_URL
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV

# Activate standalone output (next.config.js checks CI=true)
ENV CI=true

COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install -r --offline
RUN pnpm --filter @paysurity/web build

# Step 2: Extract & Run
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/public-website/public ./apps/public-website/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/public-website/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/public-website/.next/static ./apps/public-website/.next/static



ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/public-website/server.js"]
