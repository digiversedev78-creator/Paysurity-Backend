# PaySurity 2026 — State of the Union Audit
**Date:** 2026-03-13 05:50 CST | **Auditor:** AG (Lead Architect)  
**Scope:** Full codebase at `PS-Platform - Copy` | **Sprint:** 0 (Foundation)

---

## Pillar 1: Structural Integrity — Identity Hierarchy

### Expected Model
```
Organization (tenant) → Merchant (merchant_applications → tenant) → Location → User
```

### Actual Model (Current State)
```
Tenant → Location → User
         ↑ missing explicit "Merchant" entity as runtime peer of Tenant
```

### Findings

| # | Finding | Severity | Evidence |
|---|---|---|---|
| **S1** | **Tenant ≈ Merchant conflation** | 🟡 MEDIUM | `tenants` table serves as both "organization" and "merchant." A franchise brand (the Organization) and its individual franchisees (the Merchants) would share one tenant_id — breaking the franchise hierarchy. | 
| **S2** | **Merchant entity exists only pre-onboarding** | 🟡 MEDIUM | `merchant_applications` (MER spec) creates a `tenant_id` on approval. After that, the "merchant" identity dissolves into the tenant. There is no runtime `merchants` table. |
| **S3** | **Franchise model saves us** | ✅ OK | `FRN_FRANCHISE_MANAGEMENT.md` has `franchise_agreements` linking a brand tenant to franchisee tenants. This effectively creates the Org → Merchant → Location chain, but ONLY for franchise scenarios. |
| **S4** | **No orphan logic bypasses RLS** | ✅ OK | Every tenant-scoped table has RLS policy. `audit_events` and `security_events` are platform-level (no RLS by design — correct for audit trails). |

### Remediation Required
- **S1/S2**: Add a `merchants` runtime table post-onboarding that lives between `tenants` and `locations`. For non-franchise single-merchant tenants, auto-create a 1:1 merchant row. This prevents the hierarchy from breaking when PaySurity onboards a multi-brand enterprise.

---

## Pillar 2: Instructional Ledger (Model B) Validation

### PCI Risk Scan

| Check | Result | Evidence |
|---|---|---|
| **Storing full PAN?** | ✅ NO | ORC schema stores only `last_four`, `card_brand`, `cardholder_name`. No PAN column exists. |
| **PAN redaction middleware?** | ✅ YES | `pan-redaction.middleware.ts` scans request/response bodies for 13-19 digit sequences and redacts. |
| **Gateway response stored?** | ⚠️ CAUTION | ORC stores `gateway_response JSONB` — FluidPay may return tokenized data but raw responses from some gateways can contain PAN. **Must add a response sanitizer before persisting.** |
| **Token vault?** | ✅ DELEGATED | All card tokens live at FluidPay. PaySurity never stores them locally. |

### PayFac Risk Scan (The "Shadow" Test)

| Check | Result | Evidence |
|---|---|---|
| **Does PaySurity hold merchant funds?** | 🔴 **YES — WAL module** | `digital_wallets` table has `balance_cents`, `available_cents`, `reserved_cents`. The `MERCHANT_FLOAT` wallet type EXPLICITLY holds money that a merchant could theoretically withdraw. |
| **Does PaySurity split fees?** | ⚠️ UNCLEAR | ORC spec mentions gateway fee splitting but doesn't define a `platform_fee_cents` column on `payment_intents`. Fee split logic is implied, not explicit. |
| **Does PaySurity calculate a withdrawable balance?** | 🔴 **YES** | `available_cents = balance_cents - reserved_cents` is a GENERATED COLUMN. This IS a balance calculation. |

> [!CAUTION]
> **The WAL (Digital Wallets) module as designed makes PaySurity a Money Services Business / PayFac.** If PaySurity intends to be an ISO (Independent Sales Organization) using Model B (Instructional Ledger), the wallet must be redesigned:
> - `MERCHANT_FLOAT` wallet type must be removed or re-labeled as a gateway-side construct
> - Consumer wallets must be backed by a licensed custodial partner (e.g., Synapse, Unit, or the issuing bank)
> - PaySurity must NEVER calculate a withdrawable balance — only instruct the gateway/bank to move funds

### Idempotency Key Coverage

| Table | Has `idempotency_key UNIQUE`? | Status |
|---|---|---|
| `payment_intents` | ✅ YES | Line 41: `idempotency_key VARCHAR(255) NOT NULL UNIQUE` |
| `refunds` | ✅ YES | Line 67: `idempotency_key VARCHAR(255) NOT NULL UNIQUE` |
| `orders` | ✅ YES | POSR spec line 66 |
| `wallet_transactions` | ✅ YES | Line 65 |
| `loyalty_transactions` | ✅ YES | LOY spec line 104 |
| `kds_tickets` | ✅ YES | POSR spec line 127 |
| `settlement_batches` | ❌ **NO** | ORC spec has settlement_batches but no idempotency_key |
| `subscription_invoices` | ❌ **NO** | SUB spec — billing cycle runs need idempotency |

---

## Pillar 3: Standard JSON REST API Readiness (November 2026 Mandate)

### Address Field Audit

| Table | Current Schema | Standard JSON REST API Compliant? |
|---|---|---|
| `locations` | `address_line1, address_line2, city, state, zip, country` | 🟡 **PARTIAL** — `address_line1` is unstructured (combines street name + building number) |
| `merchant_applications` | `business_address JSONB {street, city, state, zip, country}` | 🔴 **NO** — JSONB blob with `street` as unstructured string |
| `tenants` | No address at all | 🔴 **MISSING** |

### Standard JSON REST API Required Fields

```
StreetName          VARCHAR(100)  -- "Evergreen Terrace"
BuildingNumber      VARCHAR(16)   -- "742"
BuildingName        VARCHAR(100)  -- optional: "Suite 200"
Floor               VARCHAR(16)   -- optional
PostBox             VARCHAR(16)   -- optional: "PO Box 1234"  
PostCode            VARCHAR(16)   -- "78701"
TownName            VARCHAR(100)  -- "Austin"
CountrySubDivision  VARCHAR(35)   -- "TX"
Country             CHAR(2)       -- "US" (ISO 3166-1 alpha-2)
```

### Remediation Required
**Migration `005_iso20022_addresses.sql`** must:
1. Add structured address columns to `locations` table (keeping `address_line1` temporarily for backward compat)
2. Change `merchant_applications.business_address` JSONB to use Standard JSON REST API field names
3. Add address fields to `tenants` table
4. Create a reusable `addresses` table or composite type for consistency

---

## Pillar 4: Infrastructure & Eventing

### Current Event System

| Component | Status | Technology |
|---|---|---|
| **Event Bus** | ⚠️ **NOT YET BUILT** | TECH_STACK.md specifies BullMQ (Redis-backed). No jobs are registered yet. |
| **GCP Pub/Sub** | ❌ **NOT CONFIGURED** | No Pub/Sub topics, no subscriptions, no Eventarc triggers exist. |
| **Dead Letter Queues** | ❌ **NOT CONFIGURED** | BullMQ supports DLQ natively but none are configured. |

### Event Sources Identified (From Canonical Specs)

| Event | Source | Expected Consumer | Status |
|---|---|---|---|
| `payment.captured` | ORC | LOY (earn points), TAX (commit), AGG (update platform) | 🔴 Dead End |
| `order.created` | POSR | KDS (display ticket), AGG (sync) | 🔴 Dead End |
| `order.status_changed` | POSR | NOT (notify consumer), WebSocket (real-time) | 🔴 Dead End |
| `shift.closed` | POSR | OPS (daily brief), ORC (settlement) | 🔴 Dead End |
| `dispute.opened` | FluidPay webhook | ORC (status update), NOT (alert merchant) | 🔴 Dead End |
| `loyalty.tier_upgraded` | LOY | NOT (congratulate consumer) | 🔴 Dead End |
| `kyb.completed` | Stripe webhook | MER (advance application) | 🔴 Dead End |
| `payroll.disbursed` | PAY | WAL (credit wallets), NOT (pay stubs) | 🔴 Dead End |

> [!WARNING]
> **Every event in the system is currently a Dead End.** No event bus, no consumers, no retry logic. Sprint 1 MUST establish the BullMQ event bus with dead-letter queues before any vertical coding begins, or cross-vertical integrations will fail silently.

---

## Technical Spec: IProviderAdapter V2

### Assessment

The `IProviderAdapter` spec you provided is excellent. Here's how it maps to our existing code:

| Interface Method | ORC Canonical Coverage | Status |
|---|---|---|
| `authorize()` with idempotency | ORC-001 `createPaymentIntent()` | ✅ Mapped — needs adapter wrapping |
| `dispatchInstruction()` for fee split | Not explicitly in ORC schema | 🔴 **GAP** — no `platform_fee_cents` column |
| `syncMerchantIdentity()` Standard JSON REST API | Not in ORC spec | 🔴 **GAP** — add to MER module |
| `getHealthStatus()` | opossum circuit breaker in TECH_STACK | 🟡 Needs explicit `/health` on adapter |

### Immediate Action
Create `/src/interfaces/IProviderAdapter.ts` with the exact contract you specified, then wrap our FluidPay integration as the first driver.

---

## Operations: Three Must-Have Mechanisms

| Mechanism | Canonical Coverage | Status | Sprint |
|---|---|---|---|
| **Drift Monitor** (Ledger vs Settlement) | ORC has `settlement_batches` table | 🔴 No reconciliation job | Sprint 2 |
| **Tenant Quota Engine** | SUB has `subscription_invoices` | 🟡 Billing exists, no usage metering | Sprint 3 |
| **Ghost Audit** (Bank Account Changes) | `audit_events` table exists | 🟡 Table exists, no specific `BANK_ACCOUNT_CHANGED` event type | Sprint 1 |

---

## Immediate Remediation Checklist

| # | Action | Priority | Sprint |
|---|---|---|---|
| **R1** | Add `platform_fee_cents` + `merchant_net_cents` to `payment_intents` (fee split) | 🔴 CRITICAL | 0 |
| **R2** | Create `IProviderAdapter.ts` interface + FluidPay driver | 🔴 CRITICAL | 0 |
| **R3** | Standard JSON REST API address migration for `locations`, `merchant_applications`, `tenants` | 🔴 CRITICAL | 0 |
| **R4** | Sanitize `gateway_response JSONB` before persisting (strip any PAN data) | 🔴 CRITICAL | 0 |
| **R5** | Add idempotency_key to `settlement_batches` and `subscription_invoices` | 🟡 HIGH | 1 |
| **R6** | Establish BullMQ event bus with dead-letter queues | 🟡 HIGH | 1 |
| **R7** | Add `BANK_ACCOUNT_CHANGED` to `security_events.event_type` constraint | 🟡 HIGH | 1 |
| **R8** | Legal review: WAL `MERCHANT_FLOAT` wallet type — PayFac classification risk | 🔴 CRITICAL | Immediate |
| **R9** | Create Drift Monitor reconciliation job | 🟡 HIGH | 2 |
| **R10** | Create Tenant Quota Engine for SaaS billing | 🟡 HIGH | 3 |
