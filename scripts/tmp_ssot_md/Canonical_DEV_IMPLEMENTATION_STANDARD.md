# PaySurity Agentic Developer Implementation Standard
**Document Type:** Engineering Standard — Non-Negotiable  
**Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** Solutions Architecture + CTO

---

## Purpose

This document defines the **mandatory format** for every requirement in the PaySurity canonical set. Requirements are written as **complete implementation prompts** for an agentic AI full-stack developer. A developer (human or AI) reading any requirement should be able to produce: database migrations, seed data, API endpoints, service logic, UI screens, integrations, batch jobs, and acceptance tests — without asking a single clarifying question.

**The standard exists to prevent:**
- Hardcoded values (all configurable values live in database rows, read at runtime)
- Schema ambiguity (every table, column, type, and constraint is specified)
- Silent assumptions (every integration, batch job, and edge case is named)
- Broken UX (every screen and user journey is described)

---

## Non-Negotiable Rules

### Rule 1: No Hardcoded Values — Ever
**Bad:**
```typescript
const EARNING_RATE = 10; // points per dollar
const MIN_REDEMPTION = 500; // points
const GATEWAY_TIMEOUT_MS = 30000;
```

**Good — all values sourced from the database:**
```typescript
// At service startup:
const config = await ConfigService.get('loyalty.earning_rate_per_dollar'); // returns "10.00"
const minRedemption = await ConfigService.get('loyalty.min_redemption_points'); // returns "500"

// Config seeded at DB migration time (see Seed Data section of each requirement)
// ConfigService.get() wraps: SELECT value FROM platform_config WHERE key = $1
// Values cached in Redis with 5-minute TTL; cache invalidated on write
```

Every threshold, rate, timeout, limit, message, label, and business rule is a row in a config or lookup table. Application code reads config; it never defines it.

---

### Rule 2: Seed Actual Data From Day 1
Every migration file has a paired seed file. Seeds contain **real, production-intent data** — not `'TODO'` or `'PLACEHOLDER'` values. Defaults are sensible business values chosen by PaySurity product/finance, documented in the seed file's inline comments.

**Migration file:** `db/migrations/001_loyalty_config.sql`  
**Seed file:** `db/seeds/001_loyalty_config_seed.sql`

Seeds run in all environments: development, staging, and production initial deploy.

---

### Rule 3: Database-First Architecture
Schema is the contract. Write the schema first. Application code is derived from schema, never the reverse.

Every table requires:
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` — no integer sequences for distributed-safe IDs
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` (maintained by trigger)
- `tenant_id UUID NOT NULL REFERENCES tenants(id)` — on all tenant-scoped tables (enforces data isolation at the DB layer, not just application layer)

Row-Level Security (RLS) enabled on all tenant-scoped tables:
```sql
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON [table]
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

### Rule 4: API Completeness
Every requirement that produces data must expose:
- `GET` endpoint(s) for reading that data (with pagination, filtering, sorting)
- `POST` endpoint for creating
- `PATCH` endpoint for partial updates (not `PUT` — use JSON Merge Patch per RFC 7396)
- `DELETE` endpoint where deletion is appropriate
- Webhook event fired on every state change
- All endpoints return `application/json`
- All endpoints include `X-Trace-Id` in response headers
- All state-changing endpoints require an `Idempotency-Key` header

---

### Rule 5: UI/UX Is Part of the Requirement
Every requirement describes:
- Which screens to build (with the full user journey, not just a list of fields)
- What the empty state looks like (no data yet)
- What the error state looks like (validation failures, API errors)
- What the success state confirms (action feedback)
- Which role sees which UI (RBAC on UI, backed by API-level enforcement)

---

### Rule 6: Batch Jobs Are First-Class Deliverables
Every scheduled process is:
- Defined with a cron expression
- Idempotent (safe to run twice with identical result)
- Logged to `batch_job_runs` table (job name, started_at, completed_at, records_processed, status, error_detail)
- Alertable via OPS if it fails or exceeds expected duration

---

### Rule 7: Phone Number Format — E.164 Enforced at ALL Three Layers
**Ambiguity closed:** Phone numbers are E.164 (`+1XXXXXXXXXX`) enforced at **API validation, DB constraint, and UI input** simultaneously. No layer trusts the other.

```typescript
// API layer (Zod schema on all DTOs containing phone):
phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Phone must be E.164 format: +1XXXXXXXXXX')

// DB layer (constraint on every table storing phone):
phone_e164 VARCHAR(20) CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$')

// UI layer (all phone input components):
// Use libphonenumber-js to format on blur before submission
// Display: formatted locale style (e.g. (312) 555-0100)
// Store/transmit: always E.164
```

---

### Rule 8: CCPA/Privacy Deletion — Exact Fields Zeroed vs. Deleted
**Ambiguity closed:** On a consumer's CCPA deletion request, the following is done **in a single DB transaction**:

**Fields replaced with privacy token (`DELETED-{uuid}`):**
- `loyalty_accounts.phone_e164` → `'DELETED-{account_id}'`
- `loyalty_accounts.email` → `'DELETED-{account_id}@deleted.invalid'`
- `loyalty_accounts.first_name` → `'[Deleted]'`
- `consumers.phone_e164` → same pattern
- `consumers.email` → same pattern  
- `consumers.first_name`, `consumers.last_name` → `'[Deleted]'`
- `users.email`, `users.first_name`, `users.last_name` → same pattern (if consumer also has user account)

**Rows hard-deleted:**
- `consumer_payment_methods` — all rows for this consumer
- `consumer_sessions` — all active sessions

**Rows RETAINED (financial record obligation — 7 years):**
- `loyalty_transactions` — points_delta, but `account_id` de-linked (account becomes anonymous)
- `payments` — full record retained (IRS, card network requirement)
- `orders` — retained; consumer_id set to NULL
- `settlements` — retained fully

**Status set to** `DELETED` on `loyalty_accounts` and `consumers`.  
**Audit event written:** `ccpa.deletion_completed` with fields_zeroed, rows_deleted lists.

---

### Rule 9: Tip Pool Algorithm — Explicit Formula
**Ambiguity closed:** When `posr.tip_pool_algorithm = 'HOURS_WEIGHTED'`:
```
Employee share = (employee_shift_hours / total_shift_hours_all_tipped_staff) × total_pooled_tips_cents
```
- `employee_shift_hours`: from `shift_employees.clocked_out_at - shift_employees.clocked_in_at` in this pay period  
- `total_shift_hours_all_tipped_staff`: sum of hours for all employees where `tip_pool_eligible = TRUE` in same period  
- Result rounded to nearest cent; any rounding remainder added to highest-hours employee  
- Written to `payroll_line_items` with `type = 'TIP_POOL_DISTRIBUTION'` per employee  

When `EQUAL`: `total_pooled_tips_cents ÷ count(tip_pool_eligible employees in shift)` — each gets equal share.  
When `POINTS_BASED`: merchant defines a `tip_point_value` per role in `merchant_config`; calculated proportionally.


## Standard Requirement Format

Each requirement follows this exact structure:

```
### REQ-[VRT]-[NNN]: [Requirement Name]
**Priority:** Must | Should | Could  
**Actors:** [Roles who interact with this]  
**Type:** functional | nonfunctional | compliance

---

#### Context & Business Intent
[2–4 sentences: what problem this solves, who it serves, what happens if absent]

---

#### Database Schema

**Migration:** `db/migrations/[NNN]_[vrt]_[feature].sql`

```sql
[Full CREATE TABLE statements with all columns, types, constraints, indexes, RLS policies, triggers]
```

**Seed:** `db/seeds/[NNN]_[vrt]_[feature]_seed.sql`

```sql
[All INSERT statements with real values and inline comments explaining why each value]
```

---

#### Service Layer

**File:** `src/services/[feature].service.ts`

```typescript
[Method signatures with parameter types, return types, validation rules, and algorithm description in comments]
```

---

#### API Endpoints

**Router:** `src/routes/[feature].router.ts`

| Method | Path | Auth | Request Body | Response | Webhook Fired |
|---|---|---|---|---|---|
| POST | /v1/[resource] | Role: X | {schema} | 201 + {schema} | [event.name] |
| GET | /v1/[resource] | Role: X | — | 200 + {paginated list} | — |
| PATCH | /v1/[resource]/{id} | Role: X | {partial schema} | 200 + {updated} | [event.name] |

---

#### UI/UX

**Screen:** [Screen Name] — [Which portal: Merchant, Consumer, Internal, Driver]

[Full user journey: what the user sees first, what they interact with, what the system shows in each state (empty, loading, error, success), what the confirmation/feedback looks like]

---

#### Integrations

[Every external API call, SDK, or service this feature drives — including: which provider, what endpoint, when called, what the retry/failure behavior is]

---

#### Batch Jobs

**Job:** `[job_name]` | **Cron:** `[expression]` | **Idempotent:** Yes/No

[What the job does, how it selects records, what it writes back, how it handles partial failures]

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected Result |
|---|---|---|---|
| [VRT]-[NNN]-T1 | [Happy path] | [inputs] | [expected outputs + DB state + webhook fired] |
| [VRT]-[NNN]-T2 | [Failure path] | [bad inputs] | [expected error code + no side effects] |
```

---

## Config Table Standard

All configurable values stored in one of two tables:

### `platform_config` — System-wide defaults (read-only by merchants)
```sql
CREATE TABLE platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,  -- Format: 'vertical.feature.parameter'
  value TEXT NOT NULL,               -- Always stored as text; cast at read time
  data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'integer', 'decimal', 'boolean', 'json', 'duration_ms')),
  description TEXT NOT NULL,         -- Documents what this value does and its impact
  is_merchant_overridable BOOLEAN NOT NULL DEFAULT FALSE,
  min_value TEXT,                    -- Validated if data_type is numeric
  max_value TEXT,                    -- Validated if data_type is numeric
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `merchant_config` — Per-merchant overrides (writable by Merchant Admin)
```sql
CREATE TABLE merchant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  config_key VARCHAR(255) NOT NULL REFERENCES platform_config(key),
  value TEXT NOT NULL,               -- Must fall within platform_config min/max range
  set_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, config_key)
);
ALTER TABLE merchant_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON merchant_config USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

### Reading config in application code:
```typescript
// ConfigService always returns merchant override if present, else platform default
// Never returns undefined — throws ConfigNotFoundException if key doesn't exist
const rate = await ConfigService.get<number>(tenantId, 'loyalty.earning_rate_per_dollar');
```

---

## Audit Trail Standard

Every state-changing operation appends to the vertical's audit table. The audit record is written in the **same database transaction** as the state change. If the audit write fails, the state change rolls back.

```sql
-- Universal audit pattern (each vertical has its own table for query isolation)
CREATE TABLE [vertical]_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  event_type VARCHAR(100) NOT NULL,      -- e.g., 'loyalty.points.earned', 'frn.menu_lock.changed'
  actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('USER', 'SYSTEM', 'BATCH', 'API_KEY', 'AI_AGENT')),
  actor_id UUID,                         -- user_id, api_key_id, or null for system
  entity_type VARCHAR(50) NOT NULL,      -- e.g., 'loyalty_account', 'brand', 'terminal'
  entity_id UUID NOT NULL,
  changed_fields JSONB,                  -- {field: {old: value, new: value}} — null for creation events
  metadata JSONB,                        -- Additional context: request_id, session_id, ip
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — this table is append-only
);

-- Immutability enforced at DB level
CREATE TRIGGER enforce_[vertical]_audit_immutability
  BEFORE UPDATE OR DELETE ON [vertical]_audit_events
  FOR EACH ROW EXECUTE FUNCTION raise_immutability_exception();
-- Function raise_immutability_exception() defined in 000_base_functions.sql
```

---

## Environment Configuration (Never Hardcode Credentials)

```
# .env.example — commit this; never commit .env
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]
REDIS_URL=redis://[host]:6379
FLUIDS_GATEWAY_API_KEY=[from_secrets_manager]
TAXJAR_API_KEY=[from_secrets_manager]
TWILIO_ACCOUNT_SID=[from_secrets_manager]
TWILIO_AUTH_TOKEN=[from_secrets_manager]
SENDGRID_API_KEY=[from_secrets_manager]
GOOGLE_AI_API_KEY=[from_secrets_manager]
DOORDASH_DEVELOPER_ID=[from_secrets_manager]
DOORDASH_KEY_ID=[from_secrets_manager]
DOORDASH_SIGNING_SECRET=[from_secrets_manager]
UBEREATS_CLIENT_ID=[from_secrets_manager]
UBEREATS_CLIENT_SECRET=[from_secrets_manager]
# All secrets loaded from GCP Secret Manager at startup — never from .env in production
```

---

## Batch Job Registration Standard

All batch jobs registered in:

```sql
CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL UNIQUE,
  cron_expression VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  last_run_status VARCHAR(20),
  last_run_duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE batch_job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL REFERENCES scheduled_jobs(job_name),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL CHECK (status IN ('RUNNING', 'SUCCESS', 'PARTIAL_FAILURE', 'FAILED')),
  records_processed INTEGER,
  records_failed INTEGER,
  error_detail JSONB,
  worker_id VARCHAR(100) -- which compute instance ran this
);
```

---

## Linked Documents
- `00_CANONICAL_INDEX.md` — Master index of all canonical files
- `NFR_PLATFORM_NONFUNCTIONAL.md` — SLAs this code must satisfy
- `SEC_SECURITY_PRIVACY.md` — Security controls applied to every layer
- `COM_COMPLIANCE_LEGAL.md` — Compliance obligations baked into every feature


## PaySurity Advantage (Superiority V2.0)
**ADV-001 [Unified Native ERP]:** Deprecation Notice: Third-party data-syncing for core modules is strictly prohibited. Mandatory Constraint: All financial, inventory, and human capital state must reside within the primary Drizzle schema.
