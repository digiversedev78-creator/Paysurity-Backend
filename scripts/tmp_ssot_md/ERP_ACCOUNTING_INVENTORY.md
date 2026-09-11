# Canonical Requirements: ERP Accounting & Inventory
**Vertical:** ERP Operations (ERP) | **Version:** v1.0-dev | **Date:** 2026-03-23  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Inspiration:** Odoo Enterprise (Double-Entry Ledger, Push/Pull Warehouse Routes, Automated Valuation)
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  

---

## Overview
PaySurity must transcend basic POS operations to become a true Enterprise Resource Planning (ERP) platform. This requires automated Double-Entry Accounting (turning POS Sales into Journal Entries) and Multi-Warehouse Inventory Management (handling stock transfers between central commissaries and retail branch locations).

## Database Schema

**Migration:** `db/migrations/040_erp_accounting.sql`

```sql
-- ─────────────────────────────────────────
-- ERP INVENTORY ROUTING & VALUATION
-- ─────────────────────────────────────────

-- Warehouses/Locations (e.g., Central Kitchen, Retail Store Front, Back-room Storage)
CREATE TABLE erp_warehouses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  name          VARCHAR(100) NOT NULL,            -- "Main Warehouse", "Downtown Sub-Stock"
  location_type VARCHAR(20) NOT NULL DEFAULT 'INTERNAL' CHECK (location_type IN ('INTERNAL', 'VENDOR', 'CUSTOMER', 'TRANSIT', 'VIRTUAL_LOSS')),
  parent_id     UUID REFERENCES erp_warehouses(id), -- Hierarchical locations (Store -> Shelf)
  valuation_method VARCHAR(20) NOT NULL DEFAULT 'STANDARD' CHECK (valuation_method IN ('STANDARD', 'AVCO', 'FIFO')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE erp_warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_warehouses USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ERP Push/Pull Routing Rules (Odoo Parity)
CREATE TABLE erp_routing_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  action          VARCHAR(20) NOT NULL CHECK (action IN ('PULL', 'PUSH', 'BUY', 'MANUFACTURE')),
  source_wh_id    UUID REFERENCES erp_warehouses(id),
  dest_wh_id      UUID REFERENCES erp_warehouses(id),
  trigger_condition VARCHAR(50) NOT NULL, -- e.g., 'ON_ORDER_CONFIRM', 'ON_STOCK_ARRIVAL'
  delay_days      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE erp_routing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_routing_rules USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Stock Quantities per Warehouse (Overrides generic products.stock_level)
CREATE TABLE erp_stock_quants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  product_id      UUID NOT NULL REFERENCES menu_items(id),
  warehouse_id    UUID NOT NULL REFERENCES erp_warehouses(id),
  lot_number      VARCHAR(100), -- References inventory_lots for EXPIRED/SERIAL tracking
  quantity        DECIMAL(10,4) NOT NULL DEFAULT 0,
  reserved_qty    DECIMAL(10,4) NOT NULL DEFAULT 0, -- Stock allocated to pending web orders but not yet shipped
  value_cents     INTEGER NOT NULL DEFAULT 0,       -- FIFO or Average Cost Valuation tracking
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, product_id, warehouse_id, lot_number)
);
ALTER TABLE erp_stock_quants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_stock_quants USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Stock Moves (The physical ledger of inventory motion)
CREATE TABLE erp_stock_moves (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  product_id      UUID NOT NULL REFERENCES menu_items(id),
  source_wh_id    UUID NOT NULL REFERENCES erp_warehouses(id),
  dest_wh_id      UUID NOT NULL REFERENCES erp_warehouses(id),
  quantity        DECIMAL(10,4) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'WAITING', 'CONFIRMED', 'ASSIGNED', 'DONE', 'CANCELLED')),
  order_ref_id    UUID, -- e.g., POS Order ID or Purchase Order ID
  moved_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE erp_stock_moves ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_stock_moves USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Landed Costs (Odoo Parity)
-- Allocates customs, shipping, and handling onto product valuations
CREATE TABLE erp_landed_costs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  move_id         UUID NOT NULL REFERENCES erp_stock_moves(id),
  split_method    VARCHAR(30) NOT NULL CHECK (split_method IN ('EQUAL', 'BY_QUANTITY', 'BY_CURRENT_COST', 'BY_WEIGHT', 'BY_VOLUME')),
  total_cost_cents INTEGER NOT NULL,
  cost_type       VARCHAR(50) NOT NULL, -- 'SHIPPING', 'CUSTOMS', 'INSURANCE'
  status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'VALIDATED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE erp_landed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_landed_costs USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ─────────────────────────────────────────
-- DOUBLE-ENTRY ACCOUNTING LEDGER
-- ─────────────────────────────────────────

-- Chart of Accounts
CREATE TABLE erp_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  code          VARCHAR(20) NOT NULL,             -- "1000", "4000"
  name          VARCHAR(100) NOT NULL,            -- "Accounts Receivable", "Product Sales"
  account_type  VARCHAR(30) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE', 'COGS')),
  reconcilable  BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(tenant_id, code)
);
ALTER TABLE erp_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_accounts USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Journal Entries (The transactional header)
CREATE TABLE erp_journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  journal_type    VARCHAR(20) NOT NULL CHECK (journal_type IN ('SALES', 'PURCHASES', 'CASH', 'BANK', 'MISC')),
  ref             VARCHAR(100),                   -- e.g., "INV-2026-001" or POS Order Short ID
  date            DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'CANCELLED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE erp_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_journal_entries USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Journal Items (The Debit / Credit splits)
CREATE TABLE erp_journal_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  entry_id        UUID NOT NULL REFERENCES erp_journal_entries(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES erp_accounts(id),
  partner_id      UUID,                           -- References consumer_id or supplier_id
  name            VARCHAR(255) NOT NULL,          -- Line description
  debit_cents     INTEGER NOT NULL DEFAULT 0,
  credit_cents    INTEGER NOT NULL DEFAULT 0,
  reconciled      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (debit_cents >= 0 AND credit_cents >= 0)
);
ALTER TABLE erp_journal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON erp_journal_items USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---

## REQ-ERP-001: Automated POS to Journal Entry Orchestration

```typescript
/**
 * REQ-ERP-001: Automated Accounting
 * Triggered asynchronously by `order.fulfilled` from POS Retail/Restaurant.
 * Mimics Odoo's automated stock valuation and sales accounting.
 * 
 * Flow for a $10.00 Sale of a product costing $4.00:
 * 1. DEBIT  [Accounts Receivable] or [Cash/Bank] : $10.00
 * 2. CREDIT [Product Sales (Income)]             : $10.00
 * 3. DEBIT  [Cost of Goods Sold (Expense)]       : $4.00
 * 4. CREDIT [Inventory Valuation (Asset)]        : $4.00
 * 
 * ADV-ANA-02 [Atomic SKU-Level Margin Tracking]: 
 * The accounting layer mandates strict embedding of the per-SKU COGS vs Revenue margin. 
 * This data is natively encoded into the ISO 20022 (pacs.008) transaction metadata payload, empowering agentic margin analysis bridging ledger and settlement layers.
 */
async function generatePosJournalEntry(tenantId: string, orderId: string): Promise<void>
```

---

## REQ-ERP-002: Multi-Warehouse Stock Transfers

```typescript
/**
 * REQ-ERP-002: Stock Moves
 * Replaces simple arithmetic deduction (`stock_level - 1`).
 * Executes a formal Stock Move from 'WH/Stock' to 'Customers' virtual location.
 * Tracks precise LOT numbers and SERIAL ids if the item requires tracking.
 */
async function processStockMove(tenantId: string, productId: string, sourceWh: string, destWh: string, qty: number, lotNumber?: string): Promise<void>
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/erp/warehouses` | TENANT_ADMIN | List physical and virtual routing locations |
| `POST` | `/v1/erp/stock-moves` | INVENTORY_MGR | Manually transfer stock between branches |
| `GET` | `/v1/erp/accounting/journals` | FINANCE_MGR | View all Double-Entry Journal batches |
| `GET` | `/v1/erp/accounting/trial-balance` | FINANCE_MGR | Generate Trial Balance report |
| `POST` | `/v1/erp/invoices/generate/{orderId}`| TENANT_ADMIN | Convert POS Order into B2B PDF Invoice |

---

## REQ-ERP-003: Supply Chain — EDI Automated Ingestion
**Priority:** Must | **Actors:** External Supplier System, Inventory Manager

Eliminates manual Purchase Order entry.
- B2B supply chain vendors transmit Electronic Data Interchange (EDI) feeds directly into PaySurity.
- Ingestion triggers automatic draft Purchase Orders and correlates directly to `erp_stock_moves` waiting on physical receipt scanning.

---

## REQ-ERP-004: Expiry Sentry — Batch-Level Expiry Management
**Priority:** Must | **Actors:** Automated Sentry, Cashier

Prevents the sale of expired inventory via lot tracking.
- Implements automated batch-level management on Perishables.
- Auto-disables an item (SKU) or specific lot dynamically before its recorded expiration date (`inventory_lots.expiration_date`).
- Warns Cashiers at checkout and zeroes out available inventory values to guarantee 100% compliance.
