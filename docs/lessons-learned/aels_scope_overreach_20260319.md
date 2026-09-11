# Lessons Learned: AI Scope Overreach into AEL Solutions
**Report Type:** Root Cause Analysis — Lessons Learned  
**Incident Date:** 2026-03-19  
**Detected By:** Project Owner  
**Reported By:** Antigravity AI (self-investigation)  
**Location:** `docs/lessons-learned/`  

---

## 1. What Happened (The Incident)

In `scripts/swarm-orchestrator-50pools.js`, the AI assigned **8 worker pools (11–18)** to "AEL Solutions." Of those 8, **4 were unambiguously outside PaySurity's scope:**

| Pool | Task Assigned | Was It PaySurity's Job? |
|------|--------------|------------------------|
| 11 | PayFactor Service (apply/escrow/release) | ✅ YES — PaySurity IS the payment processor |
| 12 | Webhook Handler | ✅ YES — PaySurity notifies AEL of payment events |
| 13 | AELS Tenant Seed in PaySurity DB | ✅ YES — PaySurity needs tenant record |
| **14** | **Driver Management** (delivery.service.ts) | ❌ **NO — AEL Solutions' own codebase** |
| **15** | **Load Factoring Business Logic** | ❌ **NO — AEL Solutions' own business logic** |
| 16 | Settlement Engine | ✅ YES — PaySurity processes settlements |
| **17** | **Dispatch Board** (loads list, driver matching) | ❌ **NO — AEL Solutions' own codebase** |
| 18 | API Key Generation | ✅ YES — PaySurity issues credentials |

Additionally, these files were **already in the PaySurity codebase before this session** (created by prior swarm commit `435aa99`):
- `apps/api/src/modules/delivery/` — full driver assignment module
- `apps/api/src/modules/platform/` — dispatch board logic

Today's swarm (Pool 14, 17) **enhanced and extended** those wrongly-placed files, compounding a pre-existing error.

---

## 2. Root Cause Analysis — Why Did This Happen?

### Root Cause #1 (Primary): Category Confusion — "PaySurity Builds AEL" vs "PaySurity Serves AEL"

**The error:** The AI treated AEL Solutions the same way it treated BistroBeast, GrocerEase, and PaySurity Payroll — as a vertical that PaySurity **builds and owns**.

**The reality:**

```
INCORRECT MENTAL MODEL (led to error):
PaySurity
├── BistroBeast  ← PaySurity builds this ✅
├── GrocerEase   ← PaySurity builds this ✅
├── AEL Solutions ← PaySurity builds this ❌ WRONG
│   └── Driver Management  ← PaySurity builds ❌
│   └── Dispatch Board     ← PaySurity builds ❌

CORRECT MENTAL MODEL:
PaySurity (payment processor / SaaS infrastructure)
├── BistroBeast (PaySurity owns and operates this SaaS) ✅
├── GrocerEase  (PaySurity owns and operates this SaaS) ✅
├── PaySurity Payroll (PaySurity owns this SaaS) ✅
└── AEL Solutions (EXTERNAL COMPANY — pays PaySurity for payment services)
    └── AEL Solutions has its own codebase, their own developers
        └── PaySurity only touches: payment API + webhook + tenant record
```

**Analogy:** Stripe does not build Shopify's inventory system. Stripe builds the payment checkout widget. AEL Solutions is Shopify. PaySurity is Stripe. When Shopify onboards with Stripe, Stripe does not touch Shopify's product management, order fulfillment, or shipping logic.

---

### Root Cause #2: The Term "AEL Solutions" Was Listed Alongside PaySurity's Own Verticals

In prior conversations, the user described AEL Solutions in a list alongside BistroBeast, GrocerEase, etc.:

> *"BistroBeast.com - Restaurant Management System, GrocerEase - Grocery Store Management System, PaySurityPayroll, AEL Solutions..."*

The AI read this as a flat list of "things PaySurity builds." It should have read it as: **"things PaySurity provides payment services to."** The placement in the same sentence created syntactic ambiguity, but the semantic difference is enormous — and the AI should have known to ask.

**Lesson:** When a new entity is introduced in a list with ambiguous role, the AI must pause and explicitly classify it: Is this a PaySurity-owned product, or a PaySurity client/partner?

---

### Root Cause #3: Inherited Bad Files — The AI Normalized Pre-Existing Scope Creep

The `delivery/` module and driver management code were **first introduced in commit `435aa99`** (swarm-v4, 175 workers) — a prior session. The current session found those files already in the codebase and treated them as "accepted" scope.

**The error:** Existing code ≠ correct scope. The AI should have **read and validated** the purpose of any module against the canonical requirements before extending it.

Evidence:
```
git log -- apps/api/src/modules/delivery/delivery.module.ts
→ Created in: 435aa99 feat(swarm-v4): 175-worker final output
```

The current AI session then:
1. Found `delivery/delivery.service.ts` already existed
2. Assumed it was valid
3. Assigned it to Pool 14 for "enhancement"
4. Made the scope problem worse

**Lesson:** Inherited files are not a validation of correctness. Every file must be validated against canonical requirements **regardless of when it was created.**

---

### Root Cause #4: The Swarm Design Was "Build-First, Question-Never"

The swarm orchestrator was optimized for speed — generate code, write files, commit. There was no **pre-flight scope gate** — a step that validates "Is this module within PaySurity's responsibility?" before code generation begins.

The swarm question should have been:  
*"Does this module represent PaySurity as a payment processor, or does it represent a client's internal business logic?"*

It was never asked.

---

### Root Cause #5: Ambiguity in the FAC Requirements Doc Was Misread

The canonical requirements file `FAC_FREIGHT_LOAD_FACTORING.md` says:

> "Freight load factoring is the purchase of a carrier's accounts receivable (a completed load invoice) **by PaySurity**..."

This is PaySurity's financial product — the factoring/payment mechanism. **PaySurity buys the invoice and pays the driver.** That is legitimate PaySurity scope.

However, the AI extrapolated from this to build:
- Driver management (who the drivers are, their CDL, insurance)
- Dispatch (which driver gets which load)
- Load tracking (ETA, status)

These are operational logistics features that **AELS manages** before they send the payment signal to PaySurity. PaySurity's scope starts at "AELS signals PaySurity" — everything before that signal is AEL Solutions' domain.

---

## 3. Correct Scope Definitions — Written as a Permanent Rule

### PaySurity's Scope Regarding AEL Solutions / AELS

PaySurity builds and maintains:

```
PAYFSURITY BUILDS (within apps/api/src/modules/pay-factor/):
  ✅ POST /v1/payfactor/apply           — Driver enrollment & KYC
  ✅ POST /v1/payfactor/escrow          — Receive AELS deposit, hold in escrow
  ✅ POST /v1/payfactor/release-advance — Release Tranche 1 (25%) to driver
  ✅ POST /v1/payfactor/release-settlement — Release Tranche 2 (75%) on due_date
  ✅ Webhook endpoint                   — Receive event calls from AELS
  ✅ AELS tenant record                 — In PaySurity's multi-tenant DB
  ✅ API key management for AELS        — PAYSURITY_API_KEY / SECRET / WEBHOOK_SECRET
  ✅ Settlement processing              — Money movement, ACH initiation
  ✅ Audit trail for all transactions   — PaySurity's standard audit module
```

PaySurity does NOT build:

```
AELS BUILDS IN THEIR OWN CODEBASE (do not touch):
  ❌ Driver profiles, CDL, insurance expiry
  ❌ Load/freight management
  ❌ Dispatch board
  ❌ Proof of pickup / proof of delivery workflows
  ❌ Driver-facing mobile app
  ❌ Shipper management
  ❌ ETA calculation
  ❌ Fleet management
  ❌ Driver payment schedule computation (AELS sends due_date to PaySurity)
  
The trigger from AELS → PaySurity:
  "AELS decides when to send the signal. PaySurity only acts on receiving it."
```

### The General Rule for ALL External Partners

```
IF (entity is a PaySurity client/partner who integrates via API):
  PaySurity scope = Integration endpoints + Tenant record + API keys + Webhooks
  Client scope    = All of the client's own business logic

IF (entity is a PaySurity-owned SaaS product):
  PaySurity scope = Everything in that SaaS product
```

---

## 4. Files That Must Be Evaluated for Removal

These files exist in the PaySurity codebase but are outside PaySurity's scope:

| File | Created | Action Required |
|------|---------|----------------|
| `apps/api/src/modules/delivery/delivery.service.ts` | swarm-v4 | **Review** — if it only assigns PaySurity delivery orders (not AELS driver ops), it may be valid for BistroBeast delivery; rename to clarify |
| `apps/api/src/modules/delivery/delivery-driver-assignment.service.ts` | swarm-v4 | **Review** — if it's AELS-specific, remove |
| `apps/api/src/modules/platform/platform.service.ts` | swarm-50 (today) | **Review** — if it's a dispatch board for AELS, remove |
| `apps/api/src/modules/platform/platform.controller.ts` | swarm-50 (today) | **Review** — same |

> **Note:** "Delivery" as a restaurant delivery module (BistroBeast delivering food) is PaySurity scope. "Delivery" as in freight/trucking driver assignment for AELS is NOT PaySurity scope. The naming collision contributed to the confusion.

---

## 5. Prevention Measures — Process Changes

### 5.1 Pre-Swarm Scope Gate (Mandatory)
Before any swarm assigns a worker pool, the following question must be answered:

```
SCOPE GATE CHECKLIST (run before every new module/worker):
□ Is this entity a PaySurity-OWNED product? → Build everything
□ Is this entity a PaySurity CLIENT/PARTNER integrating via API?
    → Build ONLY: API endpoints + tenant record + webhooks + API keys
    → Do NOT build: any of the client's internal business logic
□ Does this file already exist? → Validate its purpose against canonical requirements FIRST
□ What canonical requirement document justifies this file? → Must cite REQ-XXX-NNN
```

### 5.2 Swarm Orchestrator Enhancement
The `swarm-orchestrator-50pools.js` must include a `scopeOwner` field per pool:

```javascript
{
  id: 14,
  scopeOwner: 'AELS_EXTERNAL', // 'PAYSURITY' | 'AELS_EXTERNAL' | 'THIRD_PARTY'
  // If scopeOwner !== 'PAYSURITY', this pool should not run
}
```

### 5.3 Canonical Requirements as the Single Gate
Every file in `apps/api/src/modules/` must be traceable to a requirement in `Requirements/Canonical/`. If it cannot be traced, it is either:
- Scope creep (delete it), or
- A missing requirement (write the requirement first, then the code)

### 5.4 The "Client vs Owner" Taxonomy Must Be Documented
The `00_CANONICAL_INDEX.md` should have an explicit section:

```markdown
## PaySurity's Relationship to Each Entity
| Entity | Relationship | PaySurity Scope |
|--------|-------------|----------------|
| BistroBeast | PaySurity OWNS this SaaS | Full product |
| GrocerEase | PaySurity OWNS this SaaS | Full product |
| PaySurity Payroll | PaySurity OWNS this SaaS | Full product |
| AEL Solutions | EXTERNAL — PaySurity is their PAYMENT PROCESSOR | PayFactor API only |
| AELS (American Eagle Logistics Service) | External TENANT of AEL Solutions | Merchant account in PaySurity |
```

---

## 6. Immediate Corrective Actions

1. **Remove Pools 14 and 17** from swarm-orchestrator — replace with valid PaySurity work
2. **Review and likely remove** `apps/api/src/modules/delivery/delivery-driver-assignment.*` (AELS-specific) vs retain `delivery.*` (may be valid for BistroBeast food delivery)
3. **Review and likely remove** `apps/api/src/modules/platform/` (dispatch board)
4. **Add scope gate** to canonical index defining all entities and their relationship to PaySurity
5. **Update swarm orchestrator** to include `scopeOwner` validation field

---

## 7. Summary Statement

The root cause was a **category error** — treating an external payment processing client (AEL Solutions) identically to an internally-owned PaySurity product (BistroBeast). This caused the AI to build AEL Solutions' internal logistics features inside PaySurity's codebase, violating the system boundary between PaySurity (payment infrastructure) and AEL Solutions (logistics platform).

The error was compounded by: (1) prior sessions that had already introduced boundary-violating code which was treated as validated, and (2) a swarm design that had no scope validation gate before code generation.

**This must not happen again. The rule is simple:** PaySurity builds payment features. Clients build their own products. PaySurity connects to clients via the PayFactor API. That is the entire relationship boundary.

---
*Report filed: 2026-03-19T06:21:03-05:00*  
*Author: Antigravity AI (self-investigation)*  
*Approved by: [Project Owner]*
