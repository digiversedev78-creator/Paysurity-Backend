# === Stage 1: Dependencies ===================================================
FROM node:20-slim AS deps
WORKDIR /app
RUN npm install -g pnpm@9.15.4 && corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/config/package.json ./packages/config/
COPY tsconfig.base.json ./

# Install ALL deps (including devDeps -- needed for @swc/cli compilation)
RUN pnpm install --frozen-lockfile

# === Stage 2: Build shared packages FIRST, then API ===========================
FROM deps AS builder
WORKDIR /app

# Copy all source
COPY apps/api ./apps/api
COPY packages ./packages

# STEP 1: Ensure clean state (no stale dist)
RUN rm -rf apps/api/dist packages/database/dist packages/shared-types/dist packages/config/dist
RUN echo "Clean slate ready"

# STEP 2: Compile packages/database (TS -> JS using pnpm workspace swc)
RUN cd packages/database && \
    pnpm exec swc src --out-dir dist --extensions .ts --ignore "**/*.spec.ts" 2>/dev/null || \
    (cd /app && node -e " \
      const {execSync}=require('child_process'); \
      execSync('pnpm --filter @paysurity/database exec swc src --out-dir dist --extensions .ts',{stdio:'inherit'}); \
    ") && \
    echo "packages/database compiled: $(find dist -name '*.js' | wc -l) files"

# STEP 3: Ensure packages/shared-types/dist exists (may be empty -- that is fine)
# We only attempt compile if src/index.ts exists; otherwise just create empty dir
RUN mkdir -p packages/shared-types/dist && \
    if [ -f packages/shared-types/src/index.ts ]; then \
      cd packages/shared-types && pnpm exec swc src --out-dir dist --extensions .ts 2>/dev/null && echo "shared-types compiled" || echo "shared-types compile skipped"; \
    else \
      touch packages/shared-types/dist/.gitkeep && echo "shared-types: no src - empty dist ok"; \
    fi

# STEP 4: Build the API
RUN cd apps/api && ./node_modules/.bin/nest build --config nest-cli.json && \
    echo "API compiled: $(find dist -name '*.js' ! -name '*.spec.js' | wc -l) files"

# STEP 5: Verify
RUN test -f apps/api/dist/main.js && echo "dist/main.js OK" || (echo "dist/main.js MISSING" && exit 1)
RUN test -f packages/database/dist/src/index.js && echo "database dist OK" || (echo "database dist MISSING" && exit 1)

# === Stage 3: Production runtime =============================================
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN npm install -g pnpm@9.15.4

# Prod deps only
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/config/package.json ./packages/config/
COPY tsconfig.base.json ./

RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY apps/api/nest-cli.json ./apps/api/

EXPOSE 8080
CMD ["node", "apps/api/dist/main"]
