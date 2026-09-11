FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate

# Step 1: Install and Build
FROM base AS builder
WORKDIR /app

ENV NEXT_PUBLIC_ENV=staging
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install -r --offline
RUN pnpm --filter @paysurity/merchant-dashboard build

# Step 2: Extract & Run
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/merchant-dashboard/public ./apps/merchant-dashboard/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/merchant-dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/merchant-dashboard/.next/static ./apps/merchant-dashboard/.next/static



ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/merchant-dashboard/server.js"]
