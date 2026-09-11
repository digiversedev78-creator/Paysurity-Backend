# Canonical Requirements: Franchise & Multi-Brand Management
**Vertical:** Franchise Management (FRN) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Most mature file in the canonical set — DO NOT simplify or abridge.**

---

## Database Schema

**Migration:** `db/migrations/050_franchise_management.sql`

```sql
-- ─────────────────────────────────────────
-- FRANCHISE CORE TABLES
-- (legal_entities, brands, locations already defined in migration 000_base.sql)
-- ─────────────────────────────────────────

-- Franchise agreements: one per franchisee ↔ franchisor brand relationship
CREATE TABLE franchise_agreements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),   -- franchisor's tenant
  franchisor_brand_id   UUID NOT NULL REFERENCES brands(id),
  franchisee_legal_entity_id UUID NOT NULL REFERENCES legal_entities(id), -- franchisee's FEIN
  franchisee_contact_email VARCHAR(255) NOT NULL,
  agreement_number      VARCHAR(50) NOT NULL UNIQUE,
  status                VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','ACTIVE','SUSPENDED','TERMINATED')),
  effective_date        DATE NOT NULL,
  expiry_date           DATE,
  royalty_structure     VARCHAR(20) NOT NULL DEFAULT 'PERCENT_OF_NET'
                        CHECK (royalty_structure IN (
                          'PERCENT_OF_GROSS',    -- % of gross sales
                          'PERCENT_OF_NET',      -- % of net sales (after refunds/discounts)
                          'FLAT_WEEKLY',         -- fixed dollar amount per week
                          'TIERED_GROSS',        -- tiered % by gross sales band
                          'COMBINED'             -- flat fee floor + % of gross above threshold
                        )),
  royalty_rate_bps      INTEGER,            -- basis points; e.g. 500 = 5%; used for PERCENT_ types
  royalty_flat_cents    INTEGER,            -- for FLAT_WEEKLY: weekly amount in cents
  royalty_tiers         JSONB,              -- for TIERED_GROSS: [{up_to_cents, rate_bps}]
  royalty_combined_floor_cents INTEGER,     -- for COMBINED: flat floor per week
  royalty_frequency     VARCHAR(20) NOT NULL DEFAULT 'WEEKLY'
                        CHECK (royalty_frequency IN ('DAILY','WEEKLY','MONTHLY')),
  royalty_collection_method VARCHAR(20) NOT NULL DEFAULT 'SETTLEMENT_DEDUCTION'
                        CHECK (royalty_collection_method IN ('SETTLEMENT_DEDUCTION','ACH_PULL','MANUAL_INVOICE')),
  marketing_fund_rate_bps INTEGER DEFAULT 0, -- optional marketing fund contribution rate
  territory_description TEXT,
  data_rights_model     VARCHAR(20) NOT NULL DEFAULT 'SHARED'
                        CHECK (data_rights_model IN (
                          'SHARED',        -- franchisor and franchisee both see all data
                          'FRANCHISEE_OWNS', -- franchisee has exclusive consumer data rights
                          'FRANCHISOR_OWNS', -- franchisor retains all data rights
                          'SPLIT'          -- defined by fields in data_rights_detail
                        )),
  data_rights_detail    JSONB,              -- field-level data rights spec if model=SPLIT
  -- AMBIGUITY #11 CLOSED: data portability rights defined per agreement
  -- 'FRANCHISEE_OWNS' → franchisee can export all consumer_ids, loyalty_accounts, orders for their locations
  -- 'FRANCHISOR_OWNS' → franchisee sees aggregate metrics only; no row-level consumer export
  -- 'SHARED' → both parties can export; delink does not destroy data on either side
  -- On agreement termination: see delink procedure in FRN-009
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE franchise_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON franchise_agreements
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Royalty calculations: one row per calculation period per agreement
CREATE TABLE royalty_calculations (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id),
  agreement_id              UUID NOT NULL REFERENCES franchise_agreements(id),
  period_start              DATE NOT NULL,
  period_end                DATE NOT NULL,
  gross_sales_cents         INTEGER NOT NULL DEFAULT 0,
  refunds_cents             INTEGER NOT NULL DEFAULT 0,
  net_sales_cents           INTEGER NOT NULL DEFAULT 0,  -- gross - refunds
  royalty_amount_cents      INTEGER NOT NULL DEFAULT 0,  -- calculated per royalty_structure
  marketing_fund_cents      INTEGER NOT NULL DEFAULT 0,
  total_due_cents           INTEGER NOT NULL DEFAULT 0,  -- royalty + marketing fund
  collection_status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (collection_status IN ('PENDING','COLLECTED','FAILED','WAIVED','DISPUTED')),
  collected_at              TIMESTAMPTZ,
  collection_method_used    VARCHAR(30),
  settlement_batch_id       UUID REFERENCES settlement_batches(id),  -- if deducted from settlement
  statement_pdf_gcs_path    TEXT,            -- gs://paysurity-royalty-statements/{agreement_id}/{period}.pdf
  statement_pdf_signed_url  TEXT,            -- refreshed on GET; 7-day expiry
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agreement_id, period_start)
);
ALTER TABLE royalty_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON royalty_calculations
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Menu governance lock levels: per item per brand
-- Lock levels applied when brand_id sets it; enforced at API layer before any item write
CREATE TABLE menu_governance_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  brand_id        UUID NOT NULL REFERENCES brands(id),
  menu_item_id    UUID REFERENCES menu_items(id),     -- NULL = applies to entire brand menu
  category_id     UUID REFERENCES menu_categories(id),-- NULL = applies to entire brand
  lock_level      VARCHAR(30) NOT NULL
                  CHECK (lock_level IN (
                    'OPEN',           -- Location can change anything
                    'SUGGESTED',      -- Brand suggests; location can override price ±20%
                    'LOCKED_PRICE',   -- Location cannot change price; can add/remove
                    'LOCKED_ITEM',    -- Location cannot remove or price-change; description editable
                    'LOCKED_FULL',    -- Location cannot change anything about this item
                    'BRAND_ONLY'      -- Only Brand Admin can add/remove/change this item
                  )),
  price_variance_pct INTEGER DEFAULT 0,  -- for SUGGESTED: allowed % variance from brand price
  effective_from  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to    TIMESTAMPTZ,           -- NULL = indefinite
  set_by          UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE menu_governance_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON menu_governance_rules
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_governance_brand ON menu_governance_rules(brand_id, effective_from, effective_to)
  WHERE effective_to IS NULL OR effective_to > NOW();

-- External franchisee portal access
CREATE TABLE franchisee_portal_users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id          UUID NOT NULL REFERENCES franchise_agreements(id),
  user_id               UUID NOT NULL REFERENCES users(id),
  portal_role           VARCHAR(30) NOT NULL DEFAULT 'FRANCHISE_OWNER'
                        CHECK (portal_role IN ('FRANCHISE_OWNER','FRANCHISE_FINANCE','FRANCHISE_OPS')),
  data_access_scope     JSONB NOT NULL DEFAULT '{}',  -- {can_export_consumers, can_view_loyalty_pii, ...}
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FRN immutable audit trail
CREATE TABLE frn_audit_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  event_type    VARCHAR(100) NOT NULL,   -- 'frn.agreement.created', 'frn.menu_lock.changed', etc.
  actor_type    VARCHAR(20) NOT NULL CHECK (actor_type IN ('USER','SYSTEM','BATCH','API_KEY')),
  actor_id      UUID,
  entity_type   VARCHAR(50) NOT NULL,
  entity_id     UUID NOT NULL,
  changed_fields JSONB,
  metadata      JSONB,
  digital_certificate TEXT,             -- SHA-256 hash of (event_id + timestamp + changed_fields) for tamper detection
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER enforce_frn_audit_immutability
  BEFORE UPDATE OR DELETE ON frn_audit_events
  FOR EACH ROW EXECUTE FUNCTION raise_immutability_exception();
CREATE INDEX idx_frn_audit_entity ON frn_audit_events(entity_type, entity_id, created_at DESC);
```

**Seed:** `db/seeds/050_frn_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('frn.royalty.calculation_cron',         '0 4 * * 1',  'string',  'Weekly royalty calc: Monday 4 AM UTC', FALSE),
  ('frn.royalty.collection_cron',          '0 5 * * 2',  'string',  'Weekly royalty collect: Tuesday 5 AM UTC', FALSE),
  ('frn.royalty.statement_gcs_bucket',     'paysurity-royalty-statements', 'string', 'GCS bucket for royalty statement PDFs', FALSE),
  ('frn.royalty.statement_url_expiry_days','7',           'integer', 'Days royalty statement signed URL stays valid', FALSE, '1', '30'),
  ('frn.menu_governance.lock_inheritance', 'BRAND_WINS',  'string',  'Conflict resolution: BRAND_WINS locks always beat LOCATION. Cannot be changed.', FALSE),
  ('frn.data_portability.export_format',   'CSV',         'string',  'Export format for franchisee data portability: CSV | JSON', FALSE),
  ('frn.delink.grace_period_days',         '30',          'integer', 'Days franchisee has data access post-termination', FALSE, '7', '90'),
  ('frn.analyst.benchmark_min_locations',  '3',           'integer', 'Min locations for peer benchmark to be statistically meaningful', FALSE, '2', '10')
ON CONFLICT (key) DO NOTHING;

-- BistroBeest demo franchise agreement (self-franchise — Downtown ↔ Express)
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO franchise_agreements (
      id, tenant_id, franchisor_brand_id, franchisee_legal_entity_id,
      franchisee_contact_email, agreement_number, status, effective_date,
      royalty_structure, royalty_rate_bps, royalty_frequency, royalty_collection_method,
      marketing_fund_rate_bps, data_rights_model
    ) VALUES (
      'agr00001-0000-0000-0000-000000000001',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbb0001-0000-0000-0000-000000000001',   -- BistroBeest Downtown is the franchisor brand
      '11111111-1111-1111-1111-111111111111',   -- same FEIN in demo (prod: different entity)
      'franchise@bistrobeest.com',
      'AGR-BB-2024-001',
      'ACTIVE',
      '2024-01-01',
      'PERCENT_OF_NET', 500,                    -- 5% of net sales
      'WEEKLY', 'SETTLEMENT_DEDUCTION',
      100,                                      -- 1% marketing fund contribution
      'SHARED'
    ) ON CONFLICT DO NOTHING;

    -- Menu governance: lock core items on BistroBeest brand
    INSERT INTO menu_governance_rules (tenant_id, brand_id, menu_item_id, lock_level, set_by)
    VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbb0001-0000-0000-0000-000000000001',
       'item0003-0000-0000-0000-000000000003','LOCKED_ITEM','usr00002-0000-0000-0000-000000000002'),  -- Salmon: locked
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbb0001-0000-0000-0000-000000000001',
       'item0004-0000-0000-0000-000000000004','LOCKED_FULL','usr00002-0000-0000-0000-000000000002'),  -- Ribeye: full lock
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbb0001-0000-0000-0000-000000000001',
       'item0002-0000-0000-0000-000000000002','OPEN','usr00002-0000-0000-0000-000000000002'),         -- Soup: open (local daily special)
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbb0001-0000-0000-0000-000000000001',
       'item0001-0000-0000-0000-000000000001','LOCKED_PRICE','usr00002-0000-0000-0000-000000000002') -- Caesar: price locked
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

---

## REQ-FRN-001: 4-Level Hierarchy Entity Model & Role Access

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, BRAND_ADMIN, LOCATION_MGR, FRANCHISE_OWNER

---

See `RBAC_PERMISSION_MATRIX.md` for full access matrix. FRN-specific implementation:

**RLS enforcement for multi-brand:** DB session variable `app.current_brand_id` controls which brand's data is visible. Set per request based on JWT + role scope. Queries that require cross-brand access (ENTERPRISE_ADMIN only) pass `app.current_brand_id = NULL` → no brand filter in RLS policy.

**API:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/franchise/hierarchy` | ENTERPRISE_ADMIN | Full tree: holding company → brands → locations |
| `POST` | `/v1/franchise/brands` | ENTERPRISE_ADMIN | Create brand |
| `POST` | `/v1/franchise/locations` | ENTERPRISE_ADMIN, BRAND_ADMIN | Create location under brand |
| `GET` | `/v1/franchise/agreements` | ENTERPRISE_ADMIN | List franchise agreements |
| `POST` | `/v1/franchise/agreements` | ENTERPRISE_ADMIN | Create franchise agreement |
| `PATCH` | `/v1/franchise/agreements/{id}` | ENTERPRISE_ADMIN | Update agreement terms |

---

## REQ-FRN-002: Menu Governance Engine

**Priority:** Must | **Actors:** BRAND_ADMIN, LOCATION_MGR

---

```typescript
/**
 * enforceMenuGovernance(menuItemId, locationId, updatePayload) — Called by menu.service
 * before any PATCH to a menu item.
 * 1. Fetch effective menu_governance_rules for (brand_id of location's brand, menu_item_id)
 * 2. If lock_level = 'OPEN': allow all changes
 * 3. If lock_level = 'SUGGESTED': allow price change only within ±price_variance_pct
 * 4. If lock_level = 'LOCKED_PRICE': if updatePayload contains price_cents → throw LOCK_LEVEL_VIOLATION
 * 5. If lock_level = 'LOCKED_ITEM': if payload has price_cents or is_active=false → throw LOCK_LEVEL_VIOLATION
 * 6. If lock_level = 'LOCKED_FULL': any payload field change → throw LOCK_LEVEL_VIOLATION
 * 7. If lock_level = 'BRAND_ONLY': LOCATION_MGR caller → throw LOCK_LEVEL_VIOLATION
 * All violations: write to frn_audit_events with event_type='frn.governance_violation_attempt'
 */
async enforceMenuGovernance(menuItemId: string, locationId: string, updatePayload: Partial<MenuItem>, actorRole: string): Promise<void>
```

**UI — Menu Governance (Brand Admin):**
> Menu item table with lock level badge on each row:  
> 🔓 OPEN | 💡 SUGGESTED | 💰 LOCKED_PRICE | 🔒 LOCKED_ITEM | 🛑 LOCKED_FULL | ⭐ BRAND_ONLY  
> "Set Lock Level" dropdown per item or per category  
> "Location Override Report" tab → shows which items any location has locally customized (under SUGGESTED/OPEN locks)

---

## REQ-FRN-003: Consolidated Financial Reporting (P&L)

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, ENTERPRISE_FINANCE, EXTERNAL_ACCOUNTANT

---

```typescript
/**
 * getConsolidatedPL(params) — Real-time P&L aggregated at any hierarchy level.
 * Queries settlement_batches + payroll_runs + royalty_calculations scoped by hierarchy.
 * Returns: { gross_sales, refunds, net_sales, cogs_estimate, payroll_cost, royalties_paid,
 *            processing_fees, subscription_fees, ebitda_estimate }
 * Granularity: DAILY | WEEKLY | MONTHLY | YTD
 * Scope: LOCATION | BRAND | LEGAL_ENTITY | ALL
 * Real-time: queries live data (no materialized view lag); caches at Redis with 5-min TTL
 */
async getConsolidatedPL(params: {
  tenantId: string;
  scope: 'LOCATION' | 'BRAND' | 'LEGAL_ENTITY' | 'ALL';
  scopeId?: string;
  granularity: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YTD';
  startDate: Date;
  endDate: Date;
}): Promise<ConsolidatedPL>
```

**API:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/franchise/reports/pl` | ENTERPRISE_ADMIN, ENTERPRISE_FINANCE, EXTERNAL_ACCOUNTANT | P&L at any scope |
| `GET` | `/v1/franchise/reports/pl/by-location` | All finance roles | Location comparison table |
| `GET` | `/v1/franchise/reports/pl/by-brand` | ENTERPRISE only | Brand vs brand comparison |
| `GET` | `/v1/franchise/reports/royalties` | ENTERPRISE_ADMIN, FRANCHISE_OWNER (own) | Royalty history |
| `POST` | `/v1/franchise/reports/export` | Finance roles | Queue async export → GCS CSV/PDF |

---

## REQ-FRN-004: Royalty Engine

**Priority:** Must | **Actors:** Batch Job, ENTERPRISE_ADMIN, FRANCHISE_OWNER

---

```typescript
/**
 * calculateRoyalties(agreementId, periodStart, periodEnd) — Weekly batch.
 * 1. Sum orders WHERE location_id IN (franchisee locations for this agreement)
 *    AND fulfilled_at BETWEEN period_start AND period_end
 *    AND status IN ('FULFILLED', 'PARTIALLY_REFUNDED')
 * 2. Calculate gross_sales_cents, refunds_cents, net_sales_cents
 * 3. Apply royalty_structure formula (read from agreement — not hardcoded):
 *    PERCENT_OF_GROSS: royalty = gross × (royalty_rate_bps / 10000)
 *    PERCENT_OF_NET:   royalty = net × (royalty_rate_bps / 10000)
 *    FLAT_WEEKLY:      royalty = royalty_flat_cents
 *    TIERED_GROSS:     find tier band for gross; apply that tier's rate_bps
 *    COMBINED:         royalty = MAX(royalty_combined_floor_cents, gross × rate_bps / 10000)
 * 4. Add marketing_fund_cents: gross × (marketing_fund_rate_bps / 10000)
 * 5. Write royalty_calculations record
 * 6. Generate royalty statement PDF (see REQ-FRN-004a below)
 * 7. Queue collection based on royalty_collection_method
 */
async calculateRoyalties(agreementId: string, periodStart: Date, periodEnd: Date): Promise<RoyaltyCalculation>

/**
 * collectRoyalty(calculationId) — Initiates collection based on method.
 * SETTLEMENT_DEDUCTION: writes royalties_deducted_cents to next settlement_batches for the franchisee location
 * ACH_PULL: calls ORC to initiate ACH pull from franchisee's bank account on file
 * MANUAL_INVOICE: sends invoice PDF via NOT engine; collection_status stays PENDING until marked manually
 */
async collectRoyalty(calculationId: string): Promise<void>
```

---

## REQ-FRN-004a: Royalty Statement PDF — Specification (Closes Ambiguity #9)

**AMBIGUITY #9 CLOSED:** Royalty statement PDF format is fully specified here. Generated via HTML template → Puppeteer PDF → GCS upload.

**PDF Template: `src/templates/royalty-statement.hbs`**

```
┌──────────────────────────────────────────────────────────────┐
│  [PaySurity Logo]              ROYALTY STATEMENT             │
│  Prepared by: PaySurity Platform                             │
├──────────────────────────────────────────────────────────────┤
│  Period:     {{period_start}} – {{period_end}}               │
│  Pay Date:   {{pay_date}}                                    │
│  Statement#: {{statement_number}}  (format: RS-{agreement_number}-{period_start_yyyymm})
│  Agreement:  {{agreement_number}}                            │
├──────────────────────────────────────────────────────────────┤
│  FRANCHISOR                    FRANCHISEE                    │
│  {{franchisor_brand_name}}     {{franchisee_legal_entity_name}}
│  FEIN: {{franchisor_fein}}     FEIN: {{franchisee_fein}}     │
│  {{franchisor_address}}        {{franchisee_address}}        │
├──────────────────────────────────────────────────────────────┤
│  SALES SUMMARY                                               │
│  Gross Sales:               ${{gross_sales_formatted}}       │
│  Less Refunds:             (${{refunds_formatted}})          │
│  Net Sales:                 ${{net_sales_formatted}}         │
├──────────────────────────────────────────────────────────────┤
│  ROYALTY CALCULATION                                         │
│  Structure: {{royalty_structure_human}}                      │
│    (e.g. "5.00% of Net Sales")                              │
│  Royalty Amount:            ${{royalty_amount_formatted}}    │
│  Marketing Fund (1.00%):    ${{marketing_fund_formatted}}    │
│  ─────────────────────────────────────────────              │
│  TOTAL DUE:                 ${{total_due_formatted}}         │
├──────────────────────────────────────────────────────────────┤
│  COLLECTION METHOD: {{collection_method_human}}              │
│  Status: {{collection_status}}  |  Collected: {{collected_at}}
├──────────────────────────────────────────────────────────────┤
│  LOCATION BREAKDOWN                                          │
│  Location Name    | Gross Sales | Refunds | Net Sales        │
│  {{#each locations}}                                         │
│  {{name}}         | ${{gross}}  | (${{ref}}) | ${{net}}     │
│  {{/each}}                                                   │
├──────────────────────────────────────────────────────────────┤
│  Digital Certificate: {{digital_certificate_hash}}           │
│  Generated: {{generated_at_utc}} UTC                         │
│  This statement is an immutable record. Any discrepancy      │
│  must be disputed within {{dispute_window_days}} days.       │
└──────────────────────────────────────────────────────────────┘
```

**PDF generation:** `src/services/frn/royalty-statement.service.ts`  
Uses Puppeteer to render the Handlebars template to PDF at 72dpi, letter size.  
Stored: `gs://paysurity-royalty-statements/{agreement_id}/{period_start_yyyymm}.pdf`  
Accessible: signed URL valid 7 days (from config `frn.royalty.statement_url_expiry_days`)  
BOTH franchisor AND franchisee can download their copy (scoped by `data_rights_model`).

---

## REQ-FRN-005: Cross-Location Financial Consolidation & Brand Intelligence

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, ENTERPRISE_FINANCE

---

**API + UI reporting:**
| Report | API Path | Description |
|---|---|---|
| Location vs. Location P&L | `GET /v1/franchise/reports/location-compare` | Side-by-side revenue, cost, profit per location |
| Brand Performance Index | `GET /v1/franchise/reports/brand-performance` | Composite score: revenue growth, avg ticket, loyalty adoption, dispute rate |
| Underperformer Alert | `GET /v1/franchise/reports/underperformers` | Locations > 15% below brand average (threshold from config) |
| AI Insight Cards | `GET /v1/franchise/insights` | LLM-generated 3-sentence summaries per location: "River North is down 12% WoW. Primary driver: $1,800 in refunds on Fri/Sat. Recommend reviewing weekend prep staffing." |

**AI Insight Cards:**  
- Generated by `ops.ai_ops_daily_brief` batch job (already registered in scheduled_jobs seed)
- Delivered to ENTERPRISE_ADMIN dashboard each morning
- Retain 30-day history; no personalization storage (stateless insight generation)

---

## REQ-FRN-006: Cross-Location Workforce Management

**Priority:** Should | **Actors:** ENTERPRISE_ADMIN, PAYROLL_ADMIN, LOCATION_MGR, Employee

---
Employee can clock in at any location within their brand (not cross-brand by default).  
Single employee record across locations: `employees` table already supports this via `user_id` FK.  
Time tracking aggregation: `shift_employees` records from all locations summed for payroll.

**Config:**
```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('frn.workforce.cross_location_enabled',    'true', 'boolean', 'Allow employees to clock in at any location within brand', TRUE),
  ('frn.workforce.cross_brand_enabled',       'false','boolean', 'Allow employees to clock in at any location across brands (requires Enterprise Admin grant)', TRUE)
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-FRN-007: Unified Loyalty Across Brands

**Priority:** Should | **Actors:** Consumer, ENTERPRISE_ADMIN, BRAND_ADMIN

---

Loyalty model set per `loyalty_programs.model` field (seeded from `LOYALTY_ENGINE.md`):

| Model | Consumer Experience | Implementation |
|---|---|---|
| `BRAND_ISOLATED` | Earns/redeems per brand, no cross-brand | One program per brand; separate balances |
| `UNIFIED` | One balance across all brands in holding company | One program at tenant level; brand_id=NULL |
| `CROSS_REDEEM` | Earn at any brand; redeem at any brand | Separate earn pools; unified redemption catalog |
| `TIERED_CROSS` | Tier qualification counts across all brands; brand-specific earn rates | Custom tier logic per program |

Config per holding company:
```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES ('frn.loyalty.default_model', 'BRAND_ISOLATED', 'string', 'Default loyalty model for new franchise groups', TRUE)
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-FRN-008: Franchise Tax Compliance (1099-K, Payroll, Sales Tax by FEIN)

**Priority:** Must | **Actors:** ENTERPRISE_FINANCE, EXTERNAL_ACCOUNTANT, Batch Job

---

All tax reporting scoped by `legal_entity_id` (FEIN).  
A franchise group with 3 FEINs generates 3 separate Form 1099-K, 3 payroll tax filings, and 3 state sales tax reports.

**1099-K threshold check (batch job `tax.1099k_threshold_monitor` | cron `0 9 * * *`):**  
Reads threshold from `platform_config 'tax.1099k_threshold_cents'` (IRS may change annually — never hardcode the $600 or $5,000 figure; always read from DB).  
If FEIN crosses threshold: alert ENTERPRISE_FINANCE via NOT engine; flag in dashboard.

---

## REQ-FRN-009: External Franchisee Data Rights & Delink Procedure (Closes Ambiguity #11)

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, FRANCHISE_OWNER, PAYSURITY_ADMIN

---

**AMBIGUITY #11 CLOSED: Franchisee data portability rights are explicit:**

```typescript
/**
 * exportFranchiseeData(agreementId, exportedBy) — Franchisee requests their data.
 * Checks agreement.data_rights_model:
 *
 * 'FRANCHISEE_OWNS' or 'SHARED':
 *   → Export package includes:
 *     1. All consumers who ordered at franchisee's locations (consumer_id, name, phone, email)
 *     2. All loyalty_accounts for those consumers at this tenant
 *     3. All orders for franchisee's locations (full detail)
 *     4. All employees at franchisee's locations + payroll records (anonymized SSN)
 *   → Format: CSV (from config 'frn.data_portability.export_format')
 *   → Delivered to: franchisee contact email as signed GCS link (7-day expiry)
 *
 * 'FRANCHISOR_OWNS':
 *   → Export package includes ONLY:
 *     1. Aggregated order counts, revenue by period (no consumer PII)
 *     2. Their employee records ONLY (no consumer data)
 *   → Franchisee must sign data access request reviewed by ENTERPRISE_ADMIN
 *
 * On agreement TERMINATION ('delink'):
 *   1. Grace period: frn.delink.grace_period_days (default 30) days of portal access
 *   2. If 'FRANCHISEE_OWNS': franchisee gets one final export before access revoked
 *   3. Franchisor data: orders stay in franchisor platform; consumer_id linkage retained
 *   4. Franchisee data: franchisee_portal_users deactivated after grace period
 *   5. frn_audit_events: TERMINATION event with all scoped export GCS paths as evidence
 *   6. If 'FRANCHISOR_OWNS': franchisee receives ONLY their employee records on delink
 */
async exportFranchiseeData(agreementId: string, exportedBy: string): Promise<ExportJob>
```

**API:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/franchise/agreements/{id}/export` | ENTERPRISE_ADMIN, FRANCHISE_OWNER | Request data export |
| `GET` | `/v1/franchise/agreements/{id}/export/status` | Both | Check export job status |
| `POST` | `/v1/franchise/agreements/{id}/terminate` | ENTERPRISE_ADMIN (MFA + reason required) | Begin delink procedure |
| `GET` | `/v1/franchise/portal` | FRANCHISE_OWNER | Franchisee portal home |
| `GET` | `/v1/franchise/portal/royalties` | FRANCHISE_OWNER | Own royalty statements + PDF download |
| `GET` | `/v1/franchise/portal/performance` | FRANCHISE_OWNER | Own location(s) performance metrics |

---

## REQ-FRN-010: Enterprise Onboarding Phases

**Priority:** Must | **Actors:** PaySurity CSM, ENTERPRISE_ADMIN, PAYSURITY_ADMIN

---

5-phase onboarding (tracked in `onboarding_workspace` table):

| Phase | Duration | What Happens |
|---|---|---|
| **Phase 1: Discovery** | Week 1 | CSM assigned; PaySurity imports: menu CSV, employee list, loyalty member file (existing points honored) |
| **Phase 2: Configuration** | Week 2 | Brand hierarchy built; menu governance locks set; aggregator platforms connected; loyalty program configured |
| **Phase 3: Training** | Week 3 | Staff trained per location; demo run on BistroBeest test tenant data; QA checklist signed off |
| **Phase 4: Parallel Run** | Week 4 | Live on PaySurity + legacy system simultaneously; daily reconciliation; issues resolved |
| **Phase 5: Go Live** | Day 28+ | Legacy system off; PaySurity live; 30-day hyper-care support from CSM |

---

## REQ-FRN-011: Franchise Audit Trail

**Priority:** Must | **Actors:** ENTERPRISE_ADMIN, PAYSURITY_ADMIN, External Auditor

---

All FRN events written to `frn_audit_events` with `digital_certificate`:

```typescript
// Digital certificate generation (tamper detection)
const certificate = crypto.createHash('sha256')
  .update(`${event.id}|${event.created_at.toISOString()}|${JSON.stringify(event.changed_fields)}`)
  .digest('hex');
```

**Audit export:** `POST /v1/franchise/audit/export` → async job → GCS CSV with all frn_audit_events for the date range → digital certificate CSV for each row included → signed URL to download.

External auditors (`EXTERNAL_ACCOUNTANT` role) can request export; delivered via signed GCS URL; does not require PaySurity admin involvement.
