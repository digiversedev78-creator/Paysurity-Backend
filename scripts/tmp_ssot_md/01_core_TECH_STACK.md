# PaySurity Platform — Technology Stack Decisions
**Document:** TECH_STACK.md | **Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** CTO / Solutions Architecture — ALL selections final unless a new ADR overrides

> Every line of code in the PaySurity platform must be consistent with the decisions in this document.  
> An agentic AI developer reading this document must know exactly which technology to use in every layer — no guessing.

---

## Decision Table

| Layer | Decision | Version / Spec | Ruled Out | Rationale |
|---|---|---|---|---|
| **Backend Runtime** | **Node.js** | v22 LTS | Python, Go, Java | Shared TypeScript types across front and back; team expertise; FluidPay SDK availability |
| **Backend Framework** | **NestJS** | v10+ | Express, Fastify | Module system enforces service boundaries; built-in DI prevents spaghetti; decorator-based RBAC; built-in validation pipe |
| **API Style** | **REST (JSON)** | OpenAPI 3.1 | GraphQL, gRPC | Simpler for 3rd-party integration; REST is lingua franca for merchant integrations; gRPC for internal service mesh (Phase 2) |
| **Frontend** | **Next.js** | v14+ (App Router) | Vite, Remix, CRA | SSR for SEO on public-facing sites; RSC for merchant portal; file-based routing reduces config; Vercel-compatible for future CDN |
| **Database** | **PostgreSQL** | v16+ | MySQL, MongoDB | ACID compliance for financial data; JSONB for flex columns; RLS for tenant isolation; PostGIS if geo needed |
| **ORM / Query** | **Drizzle ORM** | latest stable | Prisma, TypeORM | Lightweight; SQL-first (no magic); type-safe; migration files are plain SQL (human-readable); no runtime overhead |
| **Database Migrations** | **Drizzle Kit (generate SQL)** | paired with Drizzle | Flyway, Liquibase | SQL migration files checked into git; numbered sequentially: `001_`, `002_`... |
| **Cache** | **Redis** | v7+ via GCP Memorystore | Upstash, Valkey | Managed GCP service; Redis Streams for event bus; Pub/Sub for broadcast; session storage |
| **Event / Queue** | **BullMQ** (backed by Redis) | v5+ | RabbitMQ, Kafka, GCP Pub/Sub | Co-located with Redis; retry/dead-letter out of box; Dashboard (Bull Board) for ops visibility; simple enough for current scale |
| **Real-Time Transport** | **Socket.io** | v4+ | native WebSocket, SSE | Room-based broadcasting for KDS stations; namespace isolation per location; auto-reconnect; falls back to long-poll on restricted networks |
| **Authentication** | **Passport.js + custom JWT** in NestJS | Passport v0.7 | Auth0, Clerk, Cognito | Full control over token lifecycle; no external SaaS dependency for auth; JWT access=15min, refresh=30d stored in httpOnly cookie |
| **Session Storage** | **Redis** (httpOnly cookie stores session ID) | — | Database sessions | Stateless services; session resolved by session ID → Redis lookup; RLS `app.current_tenant_id` set per request |
| **Mobile** | **React Native + Expo** | SDK 51+ | Flutter, native iOS/Android | Code sharing with Next.js (shared TypeScript types, some hooks); Expo EAS for OTA updates; Expo Push for notifications |
| **Monorepo** | **Turborepo** | v2+ | Nx, pnpm workspaces alone | Build caching; pipeline DSL; works with pnpm workspaces underneath |
| **Package Manager** | **pnpm** | v9+ | npm, yarn | Workspace support; disk-efficient; strict dependency resolution |
| **Containerization** | **Docker** | 24+ | Podman | Industry standard; GCP Cloud Run / Cloud Build native support |
| **Hosting (API + Web)** | **GCP Cloud Run** | — | GKE, App Engine | Serverless containers; scale-to-zero for dev; auto-scaling; no cluster management |
| **CI/CD** | **GCP Cloud Build** | — | GitHub Actions, CircleCI | Native GCP; worker pools available; parallel steps; existing `cloudbuild-parallel.yaml` convention |
| **Secrets Management** | **GCP Secret Manager** | — | .env files, AWS Secrets, Vault | Never store secrets in code or environment variables in production; all secrets referenced by resource name |
| **Logging** | **GCP Cloud Logging** (structured JSON) | — | DataDog, New Relic | Native GCP; no additional cost at current scale; `console.log(JSON.stringify({level,message,trace_id,tenant_id,...}))` |
| **APM / Tracing** | **GCP Cloud Trace + OpenTelemetry** | OTEL v1.x | DataDog APM | `X-Trace-Id` propagated via OTEL SDK; spans visible in Cloud Trace; no additional vendor |
| **File Storage** | **GCP Cloud Storage** | — | S3, Cloudflare R2 | Receipts, evidence files, menu images, export CSVs; signed URLs for access |
| **Email** | **SendGrid** | — | Mailgun, SES | Transactional + marketing; separate IP pools configured; DKIM + SPF via domain auth |
| **SMS** | **Twilio** | — | Bandwidth, Vonage | 10DLC for transactional; short code for marketing; Messaging Services SID for STOP handling |
| **Push Notifications** | **Firebase Cloud Messaging (FCM) + APNs** via **Expo Push** | — | OneSignal, Pusher | Expo Push abstracts APNs + FCM; one API call; token management handled by Expo SDK |
| **Tax Provider** | **TaxJar** (primary) | API v2 | Avalara, Vertex | Real-time lookup; restaurant category support; e-commerce nexus monitoring; Wayfair compliance built-in |
| **Payment Gateway** | **FluidPay** | v1 | Stripe, Square, Braintree | Existing contract; ISO model; card-present certification; ACH rails |
| **Feature Flags** | **Custom DB table** (`feature_flags`) | Phase 1 | LaunchDarkly, Statsig | Simple Phase 1 needs; DB-backed per tenant; no external SaaS dependency for core flags |
| **Testing (Unit)** | **Jest** | v29+ | Vitest, Mocha | NestJS native support; snapshot testing; coverage thresholds enforceable |
| **Testing (E2E)** | **Playwright** | v1.40+ | Cypress, Selenium | Multi-browser; trace viewer; CI-friendly; mobile emulation |
| **API Contract Testing** | **Supertest** (in Jest) | — | Pact | Service-level HTTP testing; validates request/response contract per endpoint |
| **Linting / Format** | **ESLint + Prettier** | ESLint v9, Prettier v3 | Biome (Phase 2 candidate) | Opinionated; no debate; enforced in CI as pre-commit + PR gate |
| **TypeScript** | **TypeScript** | v5.4+ strict mode | — | `strict: true`; `noUncheckedIndexedAccess: true`; `exactOptionalPropertyTypes: true` |
| **UI Components** | **shadcn/ui** (Radix primitives) | — | MUI, Ant Design, Chakra | Unstyled primitives; full style control; copy-into-repo model (no dependency lock-in); accessible by default |
| **CSS** | **Tailwind CSS** | v3 | CSS Modules, styled-components | shadcn/ui pairing; utility-first; configurable design tokens |

---

## Monorepo Structure

```
paysurity-platform/
├── apps/
│   ├── api/                        # NestJS API (all REST endpoints)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── payment/        # ORC vertical
│   │   │   │   ├── loyalty/        # LOY vertical
│   │   │   │   ├── orders/         # POSR, POSG, POS vertical
│   │   │   │   ├── payroll/        # PAY vertical
│   │   │   │   ├── aggregation/    # AGG vertical
│   │   │   │   ├── notifications/  # NOT vertical
│   │   │   │   ├── franchise/      # FRN vertical
│   │   │   │   ├── wallets/        # WAL vertical
│   │   │   │   ├── tax/            # TAX vertical
│   │   │   │   ├── ai/             # AI vertical
│   │   │   │   ├── ops/            # OPS vertical
│   │   │   │   └── webhooks/       # Inbound webhooks (FluidPay, DoorDash, UberEats, etc.)
│   │   │   ├── shared/
│   │   │   │   ├── guards/         # RBAC guards referencing permission matrix
│   │   │   │   ├── middleware/     # Tenant resolver, X-Trace-Id, rate limiter
│   │   │   │   ├── interceptors/   # Response transform, audit logger
│   │   │   │   └── pipes/          # Validation, sanitization
│   │   │   └── main.ts
│   ├── merchant-portal/            # Next.js (App Router) — Merchant Admin dashboard
│   ├── consumer-wallet/            # Next.js — Consumer-facing micro-sites + checkout
│   ├── pos-terminal/               # Next.js PWA — BistroBeest POS (tablet + desktop)
│   ├── admin-portal/               # Next.js — PaySurity internal operations
│   └── mobile/                     # React Native (Expo) — Consumer wallet app
│
├── packages/
│   ├── database/                   # Drizzle schema + migrations + seed files
│   │   ├── drizzle.config.ts
│   │   ├── migrations/             # 001_base.sql, 002_tenants.sql, 005_orc.sql, 010_posr.sql ...
│   │   ├── seeds/                  # 000_test_tenant_bistrobeest.sql, ...
│   │   └── schema/                 # TypeScript Drizzle schema definitions
│   ├── shared-types/               # Canonical TypeScript interfaces + Zod schemas
│   │   ├── src/
│   │   │   ├── entities/           # Order.ts, Payment.ts, LoyaltyAccount.ts ...
│   │   │   ├── api/                # Request/Response DTOs for every endpoint
│   │   │   ├── events/             # Webhook event payload types
│   │   │   └── enums/              # OrderStatus, PaymentMethodType, etc.
│   ├── config/                     # ConfigService (reads platform_config + merchant_config)
│   ├── ui-components/              # Shared React components (shadcn/ui wrappers)
│   ├── integrations/               # API clients: FluidPay, TaxJar, Twilio, SendGrid, DoorDash, UberEats
│   │   ├── fluids-pay/
│   │   ├── taxjar/
│   │   ├── twilio/
│   │   ├── sendgrid/
│   │   ├── doordash/
│   │   ├── ubereats/
│   │   └── grubhub/
│   └── testing/                    # Shared test utilities, fixtures, factory functions
│
├── infra/                          # Terraform IaC for GCP resources
│   ├── gcp/
│   │   ├── cloud-run.tf
│   │   ├── cloud-sql.tf
│   │   ├── memorystore.tf
│   │   ├── secret-manager.tf
│   │   └── iam.tf
│
├── .github/ or cloudbuild/
│   ├── cloudbuild-parallel.yaml
│   └── pr-checks.yaml
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

---

## Request Lifecycle (Every API Request)

```
Incoming HTTP Request
  ↓
[API Gateway / Cloud Run ingress]
  ↓
NestJS app.useGlobalMiddleware:
  1. X-Trace-Id middleware — generates or forwards trace ID; sets AsyncLocalStorage
  2. Tenant resolver middleware — reads JWT → tenant_id; sets DB session var:
     SET LOCAL "app.current_tenant_id" = '{tenant_id}'   ← enables RLS
     SET LOCAL "app.role" = '{role}'                     ← enables role-based RLS policies
  3. Rate limit check (Redis sliding window)
  ↓
[Route guard] → JwtAuthGuard → RoleGuard (checks permission matrix)
  ↓
[Validation pipe] → Validates request body against Zod schema
  ↓
[Controller] → Calls service
  ↓
[Service] → Business logic; calls DB via Drizzle (RLS enforced automatically)
  ↓
[Audit interceptor] → Writes audit_events record in same transaction
  ↓
[Response transform interceptor] → Wraps response in {data: ..., meta: ..., trace_id: ...}
  ↓
HTTP Response with X-Trace-Id header
```

---

## Configuration Service Pattern

```typescript
// packages/config/src/config.service.ts
// USAGE: await ConfigService.get<number>(tenantId, 'loyalty.earning_rate_per_dollar')
// NEVER: const RATE = 10; // ← PROHIBITED

export class ConfigService {
  private static cache = new RedisCache({ ttl: 300 }); // 5-minute TTL

  static async get<T = string>(
    tenantId: string | null,
    key: string
  ): Promise<T> {
    const cacheKey = `config:${tenantId ?? 'platform'}:${key}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return this.cast<T>(cached);

    const result = await db.execute(sql`
      SELECT COALESCE(mc.value, pc.value) as value, pc.data_type
      FROM platform_config pc
      LEFT JOIN merchant_config mc 
        ON mc.config_key = pc.key AND mc.tenant_id = ${tenantId}
      WHERE pc.key = ${key}
    `);

    if (!result.rows.length) throw new ConfigNotFoundException(key);
    const { value, data_type } = result.rows[0];
    await this.cache.set(cacheKey, value);
    return this.cast<T>(value, data_type);
  }

  // Invalidate on write
  static async set(tenantId: string, key: string, value: string, setBy: string): Promise<void> {
    // Validates value is within platform_config.min_value / max_value
    // Writes to merchant_config
    // Invalidates Redis cache key
    // Writes audit event
  }
}
```

---

## Environment Configuration

```
environments:
  local:       APP_ENVIRONMENT=development | DB=localhost:5432 | All secrets in .env.local (never committed)
  staging:     APP_ENVIRONMENT=staging     | DB=GCP Cloud SQL (staging project) | Secrets in GCP Secret Manager staging
  production:  APP_ENVIRONMENT=production  | DB=GCP Cloud SQL (prod project)   | Secrets in GCP Secret Manager prod
               TEST_TENANT_SEED: skipped in production (environment guard in seed files)
```

---

## Test Coverage Requirements (Enforced in CI)

| Test Type | Coverage Threshold | CI Gate |
|---|---|---|
| Unit (Jest) | 80% line coverage per module | PR blocks merge if below |
| API contract (Supertest) | 100% of documented endpoints | Must have at least happy + error path test |
| E2E (Playwright) | Critical user journeys: payment, loyalty earn, KDS fire, dispute submit | Must pass before release |
| Security scan | OWASP dependency check + ESLint security rules | Block on HIGH severity |
