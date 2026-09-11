FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate

# Step 1: Install and Build (Monorepo context)
FROM base AS builder
WORKDIR /app

# Enable standalone Next.js tracing for Docker image optimization
ENV GOOGLE_CLOUD_BUILD=true
ENV NEXT_PUBLIC_ENV=staging

# Fetch pnpm lock dependencies safely
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# Copy the entire workspace configuration and dependencies
COPY . .

# Install dependencies (respecting the Turborepo workspace)
RUN pnpm install -r --offline

# Build the specific Next.js workspace
RUN pnpm --filter @paysurity/admin-portal build

# Step 2: Minimalist Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the pre-compiled standalone execution environment
COPY --from=builder /app/apps/admin-portal/public ./apps/admin-portal/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin-portal/.next/static ./apps/admin-portal/.next/static

# Binding variables


ENV HOSTNAME="0.0.0.0"

# Execute the specific nested server.js created by standalone tracing
CMD ["node", "apps/admin-portal/server.js"]
