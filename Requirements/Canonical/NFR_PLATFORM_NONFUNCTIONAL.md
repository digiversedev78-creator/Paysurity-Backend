# Canonical Requirements: Platform Non-Functional Requirements
**Vertical:** NFR (Non-Functional Requirements) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md`  
**Authority:** These SLAs are contractual commitments to merchants. Engineering MUST design to meet them.

---

## SLA Definitions — All Values From DB (Platform Config)

**Migration:** `db/migrations/001_nfr.sql`

```sql
-- SLA registry: every commitment is a row, not a comment in Confluence
CREATE TABLE platform_slas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_code        VARCHAR(50) NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  target_value    DECIMAL(10,4) NOT NULL,
  unit            VARCHAR(20) NOT NULL,              -- 'percent' | 'ms' | 'rps' | 'hours' | 'days'
  measurement_window VARCHAR(20) NOT NULL,           -- 'MINUTE' | 'HOUR' | 'DAY' | 'MONTH'
  applies_to      VARCHAR(100),                      -- service or endpoint pattern
  alert_threshold DECIMAL(10,4) NOT NULL,            -- alert before breaching this
  is_contractual  BOOLEAN NOT NULL DEFAULT TRUE,     -- TRUE = in merchant SLA agreement
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seed:** `db/seeds/001_nfr_seed.sql`

```sql
INSERT INTO platform_slas (sla_code, description, target_value, unit, measurement_window, applies_to, alert_threshold, is_contractual)
VALUES
  -- Availability
  ('api.availability',           'Core API uptime (orders, payments, loyalty)',   99.9,  'percent', 'MONTH',  '/v1/*',               99.5,  TRUE),
  ('kds.availability',           'KDS real-time availability',                    99.5,  'percent', 'MONTH',  'kds.*',               99.0,  TRUE),
  ('ai_session.availability',    'AI assistant availability',                     99.0,  'percent', 'MONTH',  '/v1/ai/*',            98.0,  FALSE),
  ('dashboard.availability',     'Merchant dashboard availability',               99.5,  'percent', 'MONTH',  'merchant.app',        99.0,  TRUE),

  -- Response time (p95 latency)
  ('api.latency.p95',            'API response time p95',                         500,   'ms',      'HOUR',   '/v1/*',               400,   TRUE),
  ('api.latency.p99',            'API response time p99',                         2000,  'ms',      'HOUR',   '/v1/*',               1500,  FALSE),
  ('payment.latency',            'Payment intent create-to-response time',        1500,  'ms',      'HOUR',   '/v1/payments/*',      1000,  TRUE),
  ('kds.latency',                'Order appears on KDS after POS fire',           3000,  'ms',      'HOUR',   'kds.order_fired',     2000,  TRUE),
  ('barcode.scan.latency',       'Barcode-to-item-added on POS screen',           200,   'ms',      'HOUR',   'posg.barcode.resolve',150,   TRUE),
  ('tax.latency',                'Tax calculation (TaxJar quote)',                500,   'ms',      'HOUR',   '/v1/tax/calculate',   400,   TRUE),

  -- Throughput
  ('api.throughput.baseline',    'Sustained API requests per second',             200,   'rps',     'MINUTE', '/v1/*',               150,   FALSE),
  ('api.throughput.peak',        'Peak load (2x baseline — holiday weekend)',     400,   'rps',     'MINUTE', '/v1/*',               350,   FALSE),

  -- Recovery (BCP/DR)
  ('rto.api',                    'Recovery Time Objective — Core API',            1,     'hours',   'INCIDENT','core_api',           0.5,   TRUE),
  ('rto.data',                   'Recovery Time Objective — Database',            4,     'hours',   'INCIDENT','database',           2,     TRUE),
  ('rpo.data',                   'Recovery Point Objective — Transaction data',   0.25,  'hours',   'INCIDENT','database',           0.1,   TRUE),

  -- Batch jobs
  ('batch.payroll_dispatch.window','Payroll ACH must be submitted by this time',  17,    'hours',   'DAY',    'payroll.dispatch',    15,    TRUE),
  ('batch.settlement.window',    'Settlement must complete by this UTC hour',     6,     'hours',   'DAY',    'settlement.batch',    4,     TRUE),
  ('batch.loyalty_expiry.window','Loyalty expiry batch must complete by this hour',7,   'hours',   'DAY',    'loyalty.expiry',      5,     FALSE),

  -- Storage
  ('backup.db.frequency',        'Database backup frequency',                     1,     'hours',   'HOUR',   'database',            2,     TRUE),
  ('backup.retention.days',      'Database backup retention period',              30,    'days',    'MONTH',  'database',            25,    TRUE)
ON CONFLICT (sla_code) DO UPDATE SET target_value=EXCLUDED.target_value, alert_threshold=EXCLUDED.alert_threshold;
```

---

## REQ-NFR-001: Availability Architecture

**Priority:** Must | **Design Target:** 99.9% core API

```
REQUIRED ARCHITECTURE PATTERN:

Infrastructure (GCP):
- Region: us-central1 primary; us-east1 failover (active-passive)
- Compute: Cloud Run (autoscaling 0→1000 instances; min 2 warm instances for core services)
- Database: Cloud SQL PostgreSQL 15 (HA with automatic failover; read replica in failover region)
- Cache: Memorystore Redis (Standard tier with HA replica)
- CDN: Cloud CDN for static assets; cache TTL per asset type from platform_config
- Global LB: Cloud Load Balancing with health checks every 10s

Health checks (all services must implement):
GET /health → { status: 'ok' | 'degraded' | 'down', checks: {db, redis, queue} }
GET /health/live → 200 (Kubernetes liveness; just confirms process is running)
GET /health/ready → 200 (readiness; confirms DB + Redis connectivity)

Circuit breakers (using opossum library):
- TaxJar: timeout=3s, errorThresholdPercentage=50, resetTimeout=30s → fallback to override table
- FluidPay: timeout=10s, errorThresholdPercentage=30, resetTimeout=60s → queue for retry
- External aggregators: timeout=5s, errorThresholdPercentage=40, resetTimeout=30s → hold order
- Gemini AI: timeout=10s, errorThresholdPercentage=60, resetTimeout=120s → escalate to human
```

---

## REQ-NFR-002: Performance Design Requirements

```
DATABASE QUERY RULES (all developers must follow):
- Explain analyze every query before shipping; p95 explain cost < 1000
- No query without a WHERE clause on a indexed column touching > 10k rows
- All list endpoints MUST paginate (default page_size from platform_config 'api.default_page_size' = 20; max 100)
- Report queries (analytics, P&L): run on read replica; never primary
- Soft deletes: archive to GCS after 90 days; never SELECT row-scan on stale data

CACHING STRATEGY (Redis):
- Config values: 5-min TTL (ConfigService.get caches in Redis)
- Tax calculations: TTL from 'tax.taxjar.cache_ttl_sec' config (default 1h)
- Menu reads (POS): 60-sec TTL; invalidated on menu_items write
- Loyalty balances: no cache (always fresh from DB for accuracy)
- Session tokens: TTL = token expiry; revocation via blocklist key

BACKGROUND PROCESSING (BullMQ):
- Payment operations: concurrency=1 per tenant (prevent duplicate charges)
- Webhook deliveries: concurrency=10 (high volume)
- AI sessions: concurrency=50 (stateless LLM calls)
- Payroll dispatch: concurrency=1 (safety; one NACHA batch at a time)
- Report generation: concurrency=5
```

---

## REQ-NFR-003: Backup & Disaster Recovery

```
BACKUP SCHEDULE:
- Full DB snapshot: every 1 hour (Cloud SQL automated backup)
- Transaction log backup: continuous (5-min RPO maintained)
- GCS bucket objects (PDFs, exports): Versioning enabled; 30-day retention
- Backup validation: weekly automated restore test in staging environment
  → Job: 'infra.backup_validation' | Cron: '0 2 * * 0' | Test: restore to isolated DB; run schema validation

FAILOVER PROCEDURE (RTO = 1 hour):
1. Cloud SQL automatic failover: < 60s (GCP-managed)
2. Cloud Run: automatic rerouting via Load Balancer health checks
3. Redis: Memorystore HA automatic failover: < 30s
4. DNS failover to us-east1: manual trigger; estimated 15 min for DNS propagation

OFFLINE RESILIENCE (requires no DR — built into the product):
- POS terminals: [DEPRECATED - See ADV-003] (from 'posr.offline_queue_max_orders' config)
- KDS: last-known menu state cached locally; replays on reconnect (CHRONOLOGICAL order)
- Aggregator webhooks: held in Cloud Tasks with 24h TTL if API is unreachable
```

---

## REQ-NFR-004: Observability Stack

```
REQUIRED ON EVERY SERVICE:
1. Structured logging (JSON) to Cloud Logging:
   Fields: trace_id, tenant_id, user_id, method, path, duration_ms, status_code
2. Distributed tracing: Cloud Trace (propagate X-Trace-Id header across all service calls)
3. Metrics: Cloud Monitoring (custom metrics for: active_orders, payment_latency_p95, queue_depth)
4. Alerts: Cloud Monitoring alert policies for every SLA in platform_slas WHERE is_contractual=TRUE
5. Error budget tracking: SLA % calculated daily; dashboarded for engineering leads

DASHBOARD REQUIREMENTS:
- GCP Monitoring dashboard: API latency heatmap, error rate by service, queue depths
- Business metrics: Cloud Monitoring custom dashboard: orders/min, revenue/hour, loyalty enrollments/day
- SLA burn rate: visual burn rate chart per SLA (30d rolling window)
```


## Valor EMV Harding Protocols
- **Comm-Drop Reconciliation**: Terminals must auto-requeue authorizations dropped mid-transit without duplicate charges.
- **Zero-Tax Retail**: Transactions eligible for Zero-Tax must not round-fail at the L3 validation layer; must pass certification strict bounds.


## PaySurity Advantage (Superiority V2.0)
**ADV-003 [Autonomous Edge-Sync]:** Connectivity Loss protocols are upgraded from Offline Queuing to Full Edge Autonomy: The system must operate with 100% functionality on local nodes, treating the cloud as a secondary synchronization ledger.
