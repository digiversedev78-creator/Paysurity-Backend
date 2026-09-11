FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9 --activate

# Step 1: Build & Deploy
FROM base AS builder
WORKDIR /app

# Copy lockfile and fetch dependencies (leverages pnpm layer caching)
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# Copy the rest of the monorepo config and source
COPY . .

# Install all dependencies (offline using fetched cache)
RUN pnpm install -r --offline

# Execute the NestJS API build (including workspace dependencies)
RUN pnpm --filter @paysurity/api... build

# Use pnpm deploy to isolate the API workspace and its required local dependencies into a standalone directory
RUN pnpm deploy --filter @paysurity/api --prod /deploy
RUN cp -r apps/api/dist /deploy/dist

# Step 2: Production Runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Pull the isolated deployment from builder
COPY --from=builder /deploy /app

# Set port correctly (AdminPortal defaults to 4000)



CMD ["sh", "-c", "ls -R dist && node dist/main.js"]
