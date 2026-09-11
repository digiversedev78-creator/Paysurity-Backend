# PaySurity-2026 — Resolved Decisions & Port Allocation
**Date:** 2026-03-13 | **Decided by:** Agentic AI (user delegated all decisions)

---

## Resolved Blocker Decisions

| # | Decision | Resolution | Rationale |
|---|---|---|---|
| 1 | **Node version** | **Node 22 LTS** | TECH_STACK.md says v22. User has nvm4w installed (`C:\nvm4w\nodejs\node.exe`) so can switch easily. `nvm install 22 && nvm use 22` |
| 2 | **Local SSL** | **Hosts file only** (no SSL) | Simplest. NestJS and Next.js dev servers don't need SSL locally. Browser will show localhost without cert warnings. |
| 3 | **shadcn/ui + Tailwind** | **Yes, confirmed** | TECH_STACK.md explicitly selects shadcn/ui + Tailwind v3. AESTHETIC_SYSTEM.md CSS vars will be mapped into Tailwind config as `theme.extend.colors`. Both coexist. |
| 4 | **Repo name** | **PaySurity-2026** | User specified. Will rename folder from `PS-Platform - Copy`. |
| 5 | **Docker** | **Yes, Docker Desktop required** | PostgreSQL + Redis containers. User should keep Docker Desktop running. Our containers use unique names and high ports to avoid collisions. |

---

## Port Allocation (Collision-Free)

### Currently In Use On This Machine

| Port | Process | Project |
|---|---|---|
| **3000** | Node.js | **OCCUPIED** — another project's dev server |
| **3001** | Node.js | **OCCUPIED** — another project's dev server |
| **5433** | PostgreSQL | **OCCUPIED** — another project's PostgreSQL instance |
| 9222 | Chrome debug | Antigravity remote debug |
| 17500 | Dropbox | System service |

### PaySurity-2026 Port Assignments (No Conflicts)

| Service | Port | Rationale |
|---|---|---|
| **PostgreSQL 16** (Docker) | **5436** | Avoids 5432 (default), 5433 (occupied), 5434 (old docker-compose) |
| **Redis 7** (Docker) | **6381** | Avoids 6379 (common default) |
| **NestJS API** | **4000** | Avoids 3000 (occupied) |
| **Merchant Dashboard** (Next.js) | **4001** | Avoids 3001 (occupied) |
| **Consumer Storefront** (Next.js) | **4002** | Free range |
| **Public Website** (Next.js) | **4003** | Free range |
| **Admin Portal** (Next.js) | **4004** | Free range |
| **Bull Board** (job queue dashboard) | **4005** | Free range |
| **Storybook** (component library) | **6006** | Storybook default |

### Hosts File Entry (Updated)
```
127.0.0.1   paysurity.dev
127.0.0.1   api.paysurity.dev
127.0.0.1   merchant.paysurity.dev
127.0.0.1   store.paysurity.dev
127.0.0.1   admin.paysurity.dev
```

Note: Hosts file maps all to 127.0.0.1. Port routing handled by each app's dev server config.

---

## FluidPay Sandbox Credentials

| Key | Value | Source |
|---|---|---|
| **Sandbox URL** | `https://sandbox.v2pconduit.com` | Screenshot |
| **Private API Key** | `api_2wuAslzZsNIUBGGlxNQzrqKnS1B` | User-provided |
| **Public API Key** | `pub_2wuB3MF6cmux0Be00066EFh0Zst` | User-provided |
| **Account** | PaySurity.com / Asit Khwaja | Screenshot |
| **Created** | 05/10/2025 | Screenshot |

**Storage:** These will go into `.env.local` (never committed) and GCP Secret Manager for staging/prod.

```env
# .env.local (DO NOT COMMIT)
FLUIDPAY_ENVIRONMENT=sandbox
FLUIDPAY_BASE_URL=https://sandbox.v2pconduit.com
FLUIDPAY_API_KEY=api_2wuAslzZsNIUBGGlxNQzrqKnS1B
FLUIDPAY_PUBLIC_KEY=pub_2wuB3MF6cmux0Be00066EFh0Zst
```

---

## Docker Container Names (Unique to PaySurity-2026)

```yaml
# These names ensure no collision with other projects' Docker containers
paysurity-2026-db:
  container_name: paysurity_2026_db  # unique name
  ports: "5436:5432"

paysurity-2026-redis:
  container_name: paysurity_2026_redis
  ports: "6381:6379"
```

---

## Docker Desktop Note

**Yes, keep Docker Desktop running.** Our containers (`paysurity_2026_db`, `paysurity_2026_redis`) will coexist with any other project's containers. Each has a unique container name and unique host ports.
