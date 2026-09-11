# Canonical Requirements: Operations Management & AI Daily Brief
**Vertical:** Operations Management (OPS) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)

---

## Database Schema

**Migration:** `db/migrations/065_ops_management.sql`

```sql
-- Automated alert rules: configurable thresholds that trigger OPS alerts
CREATE TABLE alert_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),       -- NULL = platform-wide rule
  rule_code       VARCHAR(100) NOT NULL,             -- e.g. 'revenue_drop_pct', 'dispute_rate_pct'
  description     TEXT NOT NULL,
  metric_source   VARCHAR(50) NOT NULL,              -- 'orders', 'payments', 'disputes', etc.
  threshold_config JSONB NOT NULL,                   -- {value, operator: 'GT'|'LT'|'EQ', window: 'HOUR'|'DAY'|'WEEK'}
  severity        VARCHAR(10) NOT NULL DEFAULT 'MEDIUM'
                  CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  notify_roles    TEXT[] NOT NULL DEFAULT '{}',      -- ['ENTERPRISE_ADMIN','LOCATION_MGR']
  notify_channels TEXT[] NOT NULL DEFAULT '["EMAIL","PUSH"]',
  cooldown_minutes INTEGER NOT NULL DEFAULT 60,      -- min minutes between repeat alerts
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alert firings: every time a rule threshold is crossed
CREATE TABLE alert_firings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  rule_id         UUID NOT NULL REFERENCES alert_rules(id),
  fired_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_value    DECIMAL(20,4) NOT NULL,
  threshold_value DECIMAL(20,4) NOT NULL,
  context         JSONB,       -- {location_id, period, comparison_period}
  status          VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN','ACKNOWLEDGED','RESOLVED','FALSE_POSITIVE')),
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT
);
ALTER TABLE alert_firings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON alert_firings USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_alerts_open ON alert_firings(tenant_id, status, fired_at DESC) WHERE status = 'OPEN';

-- AI ops briefs: daily AI-generated summaries per tenant
CREATE TABLE ai_ops_briefs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  brief_date      DATE NOT NULL,
  scope_level     VARCHAR(20) NOT NULL DEFAULT 'TENANT'
                  CHECK (scope_level IN ('LOCATION','BRAND','TENANT','ENTERPRISE')),
  scope_id        UUID,                             -- location_id or brand_id; NULL for TENANT/ENTERPRISE
  headline        TEXT NOT NULL,                    -- single sentence summary
  body            TEXT NOT NULL,                    -- 3-5 bullet points (LLM generated)
  metrics_snapshot JSONB NOT NULL,                  -- the data used to generate the brief
  llm_model       VARCHAR(50) NOT NULL,
  llm_tokens_used INTEGER,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, brief_date, scope_level, scope_id)
);
ALTER TABLE ai_ops_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_ops_briefs USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/065_ops_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('ops.brief.generation_cron',        '0 6 * * *', 'string', 'Daily brief generation: 6 AM UTC', FALSE),
  ('ops.brief.delivery_cron',          '0 7 * * *', 'string', 'Daily brief delivery: 7 AM UTC (after generation)', FALSE),
  ('ops.brief.retention_days',         '90',    'integer', 'Days to retain AI ops briefs', FALSE),
  ('ops.brief.llm_model',              'gemini-1.5-flash', 'string', 'LLM model for daily brief generation', FALSE),
  ('ops.brief.max_bullets',            '5',     'integer', 'Max bullet points in brief body', FALSE),
  ('ops.alert.evaluation_cron',        '*/5 * * * *', 'string', 'Alert rule evaluation interval', FALSE),
  ('ops.alert.cooldown_default_min',   '60',    'integer', 'Default alert cooldown minutes', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Platform-wide default alert rules (seeded; merchants can adjust thresholds)
INSERT INTO alert_rules (rule_code, description, metric_source, threshold_config, severity, notify_roles, notify_channels, cooldown_minutes)
VALUES
  ('revenue_drop_pct_day',  'Revenue drops > 20% vs. same weekday last week',
   'orders', '{"value":20,"operator":"GT","window":"DAY","comparison":"PRIOR_WEEK_SAME_DOW"}',
   'HIGH', '["ENTERPRISE_ADMIN","LOCATION_MGR"]', '["EMAIL","PUSH"]', 240),
  ('dispute_rate_pct',      'Chargeback rate exceeds 0.5% of volume for the month',
   'disputes', '{"value":0.5,"operator":"GT","window":"MONTH","as":"PCT_OF_VOLUME"}',
   'CRITICAL', '["ENTERPRISE_ADMIN","ENTERPRISE_FINANCE"]', '["EMAIL","PUSH","SMS"]', 1440),
  ('gateway_error_rate',    'Payment gateway error rate > 2% in any 1-hour window',
   'payments', '{"value":2,"operator":"GT","window":"HOUR","as":"PCT_OF_ATTEMPTS"}',
   'CRITICAL', '["PAYSURITY_ADMIN"]', '["PAGE","EMAIL"]', 30),
  ('kds_station_offline',   'Any KDS station offline > 5 minutes during service hours',
   'kds', '{"value":5,"operator":"GT","window":"MINUTE","metric":"offline_duration_min"}',
   'HIGH', '["LOCATION_MGR"]', '["PUSH"]', 10),
  ('payroll_approval_due',  'Payroll run in CALCULATED status within 48h of pay date without approval',
   'payroll', '{"value":48,"operator":"LT","window":"HOUR","metric":"hours_until_pay_date"}',
   'HIGH', '["PAYROLL_ADMIN"]', '["EMAIL","PUSH"]', 120),
  ('subscription_past_due', 'Merchant subscription payment failed',
   'subscriptions', '{"value":0,"operator":"GT","metric":"failed_payment_count"}',
   'HIGH', '["PAYSURITY_ADMIN"]', '["EMAIL"]', 1440)
ON CONFLICT DO NOTHING;
```

---

## REQ-OPS-001: AI Daily Operations Brief

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, BRAND_ADMIN, LOCATION_MGR, AI Batch Job

---

#### Service Layer: `src/modules/ops/ai-brief.service.ts`

```typescript
/**
 * generateBriefs(date) — Daily batch: generates briefs for all active tenants.
 * Called by cron job at 6 AM UTC (from config 'ops.brief.generation_cron').
 * For each tenant:
 *   1. Compile metrics_snapshot (DB queries — < 48h window ending at midnight):
 *      - total_revenue_cents (yesterday vs. same day last week → % change)
 *      - order_count (yesterday vs. prior period)
 *      - avg_ticket_cents
 *      - top_3_items_by_revenue
 *      - dispute_count + dispute_rate_pct
 *      - loyalty_accounts_created
 *      - active_alerts_count (open OPS alerts)
 *      - payroll_status (any runs needing approval?)
 *   2. Build LLM prompt (stored in notification_templates, NOT hardcoded):
 *      template_key = 'ops.brief_generation_prompt'
 *      Rendered with metrics_snapshot
 *   3. Call Gemini API (model from config 'ops.brief.llm_model')
 *   4. Parse response: extract headline (first line) + bullet body (remaining)
 *   5. Write ai_ops_briefs record
 * Idempotent: ON CONFLICT (tenant_id, brief_date, scope_level, scope_id) DO NOTHING
 */
async generateBriefs(date: Date): Promise<void>

/**
 * deliverBriefs(date) — Sends generated briefs to ENTERPRISE_ADMIN users.
 * Called 1 hour after generation (config 'ops.brief.delivery_cron').
 * Uses NOT engine: template_key='ops.daily_brief', channel=EMAIL + PUSH
 * consent_class=SERVICE (not marketing — operational communication)
 */
async deliverBriefs(date: Date): Promise<void>
```

**Brief generation prompt template (stored in DB — never hardcoded):**

```sql
INSERT INTO notification_templates (tenant_id, template_key, channel, consent_class, language_code, body_template, version, is_active)
VALUES (NULL, 'ops.brief_generation_prompt', 'IN_APP', 'TRANSACTIONAL', 'en',
'You are PaySurity, an AI operations assistant for {{merchant_name}}.
Write a daily operations brief for {{brief_date}} using the data below.

FORMAT:
1. Headline: One sentence capturing the most important operational insight (positive or negative).
2. Bullets: Max {{max_bullets}} concise bullet points. Focus on: revenue vs prior period, notable anomalies, urgent actions needed. End with one forward-looking recommendation.

RULES:
- Never invent numbers. Use only the provided data.
- Flag any metric that is negative with ⚠️
- Flag any metric that is exceptionally positive with ✅
- Always express revenue changes as % vs prior period.
- If dispute_rate_pct > 1%: call it out explicitly as HIGH RISK.
- Tone: professional, direct, no filler.

DATA:
{{metrics_json}}', 1, TRUE) ON CONFLICT DO NOTHING;
```

---

## REQ-OPS-002: Automated Alert System

**Priority:** Must | **Actors:** Alert Evaluation Batch Job, ENTERPRISE_ADMIN, LOCATION_MGR

---

```typescript
/**
 * evaluateAlerts() — Evaluates all enabled alert rules every 5 minutes.
 * For each active alert_rules row:
 *   1. Execute metric query for rule.metric_source + threshold_config.window
 *   2. Compare result against threshold using operator (GT/LT/EQ)
 *   3. If breach:
 *      a. Check cooldown: if alert_firings exists with fired_at > NOW() - cooldown_minutes → skip (cooldown active)
 *      b. Insert alert_firings record
 *      c. Notify via NOT engine (roles from notify_roles, channels from notify_channels, TRANSACTIONAL)
 *      d. For CRITICAL: also call NOT engine SMS to ENTERPRISE_ADMIN phone
 */
async evaluateAlerts(): Promise<void>
```

---

## REQ-OPS-003: Operations Dashboard UI

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, BRAND_ADMIN, LOCATION_MGR

---

**Central OPS Dashboard screens:**

**Live overview:**  
- Top strip: "Today's Revenue: $4,218 | Orders: 147 | Avg Ticket: $28.70 | Alerts: 2 open"
- Revenue chart: today vs. last week (same DOW), last 30 days line chart
- Real-time order rate gauge (last 15 minutes)
- Open alerts sidebar: severity badges, click → acknowledge

**Daily Brief card:**  
Delivered 7 AM local time; appears at top of dashboard as expandable card.  
Headline prominent; bullets in collapsible accordion; 30-day history accessible.

**Alert Center:**  
Table: Rule | Fired At | Current Value | Threshold | Status | Acknowledge  
Filter by severity, status, date range.  
Acknowledge button → modal: "Resolution note?" → sets status=ACKNOWLEDGED.

**Location Comparison:**  
Grid of all locations: Revenue | Orders | Avg Ticket | Disputes | Loyalty signups — sortable by any column.  
Color-coded: green = above brand avg, red = below brand avg (threshold from config).

---

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/ops/dashboard` | ENTERPRISE_ADMIN, BRAND_ADMIN, LOCATION_MGR | Current dashboard metrics |
| `GET` | `/v1/ops/briefs` | ENTERPRISE_ADMIN | AI briefs (paginated, last 90 days) |
| `GET` | `/v1/ops/briefs/{date}` | ENTERPRISE_ADMIN | Specific date brief |
| `GET` | `/v1/ops/alerts` | ENTERPRISE_ADMIN, LOCATION_MGR | Open + recent alerts |
| `PATCH` | `/v1/ops/alerts/{id}/acknowledge` | ENTERPRISE_ADMIN, LOCATION_MGR | Acknowledge alert |
| `PATCH` | `/v1/ops/alerts/{id}/resolve` | ENTERPRISE_ADMIN | Resolve with note |
| `GET` | `/v1/ops/alert-rules` | ENTERPRISE_ADMIN | Alert rule configuration |
| `PATCH` | `/v1/ops/alert-rules/{id}` | ENTERPRISE_ADMIN | Adjust threshold |

---

#### Batch Jobs

| Job | Cron | Description |
|---|---|---|
| `ops.ai_ops_daily_brief` | `0 6 * * *` | Generate AI briefs for all tenants |
| `ops.brief_delivery` | `0 7 * * *` | Deliver generated briefs via NOT engine |
| `ops.alert_evaluation` | `*/5 * * * *` | Evaluate all alert rules; fire if threshold breached |
| `ops.brief_cleanup` | `0 3 * * 0` | Delete briefs older than `ops.brief.retention_days` |
