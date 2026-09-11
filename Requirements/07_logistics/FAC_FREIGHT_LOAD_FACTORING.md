# FAC_FREIGHT_LOAD_FACTORING — PayFactor: Freight Load Factoring
**Vertical:** FreightTech Financial Product — AELS Integration  
**Version:** v2.0 (REPLACES v1.0 — Escrow Model Correction)  
**Date:** 2026-03-17  
**Status:** ✅ ACTIVE — Phase 1 Priority: HIGH  
**Partner:** American Eagle Logistics Service (AELS)  
**Product Name:** PayFactor (two-tranche upfront-escrow spot factoring)

---

## ⚠️ V1 vs V2 Correction

| Item | v1 (WRONG — Discarded) | v2 (CORRECT — This Document) |
|---|---|---|
| When AELS sends funds | After delivery (settlement push) | **Before pickup** (upfront escrow of 100% driver-net) |
| Who initiates 75% payment | AELS pays PaySurity → PaySurity pays driver | **AELS signals PaySurity → PaySurity releases from escrow** |
| Trigger for 75% | Delivery confirmation | **AELS release-settlement signal with driver's due_date** |

---

## Domain Overview

Freight load factoring is the purchase of a carrier's accounts receivable (a completed load invoice) by PaySurity in exchange for immediate cash. It is **not a loan**. No new debt is created.

### AELS PayFactor Model — Two-Tranche Upfront Escrow

```
STEP 1: Shipper pays AELS (prepaid load only) ───────────── T-∞
STEP 2: Driver enrolled, approved by PaySurity ─────────── One-time
STEP 3: Driver accepts load →
        AELS deposits 100% of driver-net to PaySurity escrow ─ T=0
        PaySurity holds $900 in escrow. Confirms: escrow_id
STEP 4: Driver arrives at pickup, uploads POP →
        AELS sends "green signal" (release-advance) ────────── T+pickup
        PaySurity releases Tranche 1: 25% minus 3.5% fee
        → ACH $217.12 to driver (same/next-day ACH)
        $675 remains in escrow
STEP 5: Driver delivers, AELS verifies POD →
        AELS sends release-settlement with due_date ─────────── T+delivery
        PaySurity schedules ACH $675 on driver's payment schedule date
        Escrow closed ──────────────────────────────────────── T+due_date
```

### Financial Model
| Item | Amount |
|---|---|
| Gross load rate | $1,000.00 |
| AELS platform fee (~10%) | $100.00 |
| **Driver-net (deposited to escrow)** | **$900.00** |
| Tranche 1 advance (25%) | $225.00 |
| PaySurity fee (3.5% of advance) | $7.88 |
| **Driver receives at pickup (Tranche 1)** | **$217.12** |
| Tranche 2 settlement (75%) | $675.00 |
| **Driver receives on due_date (Tranche 2)** | **$675.00** |
| **Total driver earnings** | **$892.12** |
| **PaySurity revenue** | **$7.88** |

---

## Driver Payment Schedule
Each AELS driver has a `payment_schedule` field: `weekly | biweekly | monthly`.  
AELS computes `settlement_due_date` from this profile.  
PaySurity **must honor the exact due_date** sent by AELS for Tranche 2 ACH.

---

## Requirements

---

### REQ-FAC-001 — PayFactor Driver Enrollment

**ID:** REQ-FAC-001  
**Title:** Driver Enrollment & One-Time KYC Onboarding  
**Priority:** P0  
**API Endpoint:** `POST /v1/payfactor/apply`  

**Description:**  
AELS redirects driver to `paysurity.com/payfactor` via short-lived JWT (15-min expiry). PaySurity performs KYC, soft credit pull, bank account verification, and queues factoring agreement for eSign. Returns approval decision and credit limit.

**Request Schema (AELS → PaySurity):**
```json
{
  "aels_driver_id": "uuid",
  "aels_tenant_id": "uuid",
  "aels_tenant_name": "string",
  "driver": {
    "full_name": "string",
    "email": "string",
    "phone": "string",
    "license_number": "string",
    "license_state": "string (2-char)",
    "license_class": "string",
    "background_check_status": "cleared | pending | failed",
    "background_check_date": "ISO8601",
    "asset_class": "BICYCLE | SCOOTER | CARGO_VAN | TRUCK_BOX | TRUCK_26FT | TRUCK_53FT_CDL | FLATBED | REFRIGERATED",
    "payment_schedule": "weekly | biweekly | monthly",
    "aels_registration_date": "ISO8601",
    "aels_signup_source": "string"
  },
  "referral_code": "AELS-2026",
  "product": "payfactor_spot",
  "advance_rate": 0.25,
  "fee_rate": 0.035
}
```

**Response Schema (PaySurity → AELS):**
```json
{
  "payfactor_driver_id": "uuid",
  "driver_approved": true,
  "credit_limit_usd": 5000.00,
  "status": "active | pending_kyc | denied",
  "agreement_sign_url": "https://paysurity.com/payfactor/sign?...",
  "denial_reason": "KYC_FAILED | AGREEMENT_NOT_SIGNED | null"
}
```

**Webhook → AELS after completion:** `driver_approved` | `driver_denied`

**Acceptance Criteria:**
- [ ] HMAC-SHA256 + API key validated before processing
- [ ] Driver record created with tenantId scoped to AELS tenant
- [ ] `background_check_status = failed` → hard deny, webhook `driver_denied` with `KYC_FAILED`
- [ ] Soft credit pull performed (no hard inquiry)
- [ ] Bank account verification initiated (Plaid or micro-deposit)
- [ ] Factoring agreement PDF queued for eSign
- [ ] Idempotent: duplicate `aels_driver_id` returns existing record
- [ ] AELS notified via webhook: `driver_approved` or `driver_denied`

---

### REQ-FAC-002 — PayFactor Escrow Deposit

**ID:** REQ-FAC-002  
**Title:** Upfront Full Escrow Deposit of Driver-Net  
**Priority:** P0 — CRITICAL  
**API Endpoint:** `POST /v1/payfactor/escrow`  

**Description:**  
When a PayFactor-enrolled driver accepts a qualified load, AELS immediately deposits 100% of the driver-net into PaySurity's escrow account. PaySurity holds these funds pending AELS signals. **This happens before the driver reaches pickup.** No advance is released yet.

**Request Schema (AELS → PaySurity):**
```json
{
  "aels_load_id": "uuid",
  "aels_driver_id": "uuid",
  "aels_transaction_id": "uuid",
  "load": {
    "pickup_location": "string",
    "delivery_location": "string",
    "estimated_pickup": "ISO8601",
    "estimated_delivery": "ISO8601",
    "gross_rate_usd": 1000.00,
    "aels_fee_usd": 100.00,
    "commodity": "string",
    "weight_lbs": 0
  },
  "escrow": {
    "driver_net_usd": 900.00,
    "advance_usd": 225.00,
    "advance_fee_usd": 7.88,
    "net_advance_to_driver_usd": 217.12,
    "settlement_usd": 675.00,
    "settlement_due_date": "ISO8601"
  },
  "webhook_url": "https://api.americaneaglelogistics.net/api/driver/payfactor-webhook"
}
```

**Response Schema (PaySurity → AELS):**
```json
{
  "escrow_id": "uuid",
  "status": "held",
  "driver_net_held_usd": 900.00,
  "advance_reserved_usd": 217.12,
  "settlement_reserved_usd": 675.00,
  "fee_reserved_usd": 7.88
}
```

**Webhook → AELS:** `escrow_confirmed`

**Acceptance Criteria:**
- [ ] AELS must hold sufficient ACH balance to fund escrow deposit; PaySurity validates inbound ACH receipt before marking status=held
- [ ] `DUPLICATE_LOAD` error if same `aels_load_id` already has an open escrow
- [ ] Escrow record created with exact breakdown: advance, fee, settlement
- [ ] Driver's credit exposure incremented by `advance_usd` (not full escrow — escrow is separate liability)
- [ ] `CREDIT_LIMIT_EXCEEDED` if advance portion exceeds driver's remaining credit limit
- [ ] Escrow amount validated: `advance_usd + advance_fee_usd + settlement_usd must equal driver_net_usd`
- [ ] Webhook `escrow_confirmed` sent to AELS on success

---

### REQ-FAC-003 — Advance Release (Tranche 1 — Green Signal)

**ID:** REQ-FAC-003  
**Title:** Release Tranche 1 Advance at Proof of Pickup  
**Priority:** P0  
**API Endpoint:** `POST /v1/payfactor/release-advance`  

**Description:**  
After driver arrives at pickup and AELS verifies the Proof of Pickup (POP), AELS sends a green signal to PaySurity. PaySurity releases Tranche 1 (net advance after fee) from escrow to the driver's verified bank account via ACH.

**Request Schema (AELS → PaySurity):**
```json
{
  "escrow_id": "uuid",
  "aels_load_id": "uuid",
  "aels_driver_id": "uuid",
  "pop_verified": true,
  "pop_url": "https://... (pre-signed, single-use, 15-min expiry)",
  "pop_verified_at": "ISO8601"
}
```

**Response Schema (PaySurity → AELS):**
```json
{
  "paysurity_transaction_id": "uuid",
  "advance_disbursed_usd": 217.12,
  "fee_retained_usd": 7.88,
  "disbursement_eta": "ISO8601",
  "escrow_remaining_usd": 675.00,
  "status": "advance_disbursed"
}
```

**Webhook → AELS:** `advance_disbursed` | `advance_failed`

**Acceptance Criteria:**
- [ ] Escrow must be in `held` state — reject if already released or expired
- [ ] `pop_verified` must be `true` — reject with `POP_MISSING` if false
- [ ] POP URL validated as accessible (HEAD request); reject with `POP_MISSING` if 404/403
- [ ] POP URL timestamp checked: reject with `POP_EXPIRED` if `pop_verified_at` > 15 minutes ago
- [ ] ACH push initiated for `net_advance_to_driver_usd` to driver's verified bank
- [ ] Fee (`advance_fee_usd`) retained by PaySurity — moved from escrow to PaySurity revenue ledger
- [ ] Escrow state updated: `advance_released = true`, `settlement_usd` remains held
- [ ] Webhook `advance_disbursed` sent with exact amount and ETA
- [ ] Idempotent: same `escrow_id` cannot release advance twice
- [ ] SLA: ACH initiated within 30 minutes of green signal receipt

---

### REQ-FAC-004 — Settlement Release (Tranche 2 — Due-Date Signal)

**ID:** REQ-FAC-004  
**Title:** Release Tranche 2 Settlement on Driver's Payment Schedule Date  
**Priority:** P0  
**API Endpoint:** `POST /v1/payfactor/release-settlement`  

**Description:**  
After driver completes delivery and AELS verifies Proof of Delivery (POD), AELS sends a settlement release signal with the driver's exact `due_date` (computed from their `payment_schedule` profile: weekly / biweekly / monthly). PaySurity schedules the Tranche 2 ACH for that exact date. Escrow is closed upon disbursement.

**Request Schema (AELS → PaySurity):**
```json
{
  "escrow_id": "uuid",
  "aels_load_id": "uuid",
  "aels_driver_id": "uuid",
  "settlement_usd": 675.00,
  "due_date": "ISO8601",
  "pod_url": "string",
  "pod_verified_at": "ISO8601"
}
```

**Response Schema (PaySurity → AELS):**
```json
{
  "paysurity_settlement_id": "uuid",
  "settlement_ach_scheduled": true,
  "scheduled_date": "ISO8601",
  "settlement_usd": 675.00,
  "escrow_status": "closed"
}
```

**Webhook → AELS:** `settlement_scheduled` → `settlement_disbursed`

**Acceptance Criteria:**
- [ ] Escrow must be in `advance_released` state — advance must have been released first
- [ ] POD URL validated as accessible
- [ ] `settlement_usd` matches escrow's `settlement_reserved_usd` (within $0.02 tolerance)
- [ ] ACH scheduled for **exactly** `due_date` — PaySurity must not disburse early or late
- [ ] Webhook `settlement_scheduled` sent immediately; `settlement_disbursed` sent when ACH clears
- [ ] Escrow state updated to `closed` after ACH is scheduled
- [ ] Idempotent: same `escrow_id` cannot release settlement twice
- [ ] If `due_date` is in the past: process immediately with warning log

---

### REQ-FAC-005 — PayFactor Driver Application Page

**ID:** REQ-FAC-005  
**Title:** PayFactor Driver-Facing Web Application (paysurity.com/payfactor)  
**Priority:** P0  
**URL:** `https://paysurity.com/payfactor`  

**Description:**  
PaySurity hosts the full driver onboarding experience. AELS redirects drivers via JWT (15-min expiry) with pre-populated identity data. The page handles KYC, bank account setup, factoring agreement eSign, and approval display. AELS renders no UX for this flow.

**Page Flow:**
1. Driver arrives via AELS app → JWT decoded → fields pre-populated
2. Driver verifies/updates bank account (Plaid Link primary; manual routing/account fallback)
3. Driver reviews and eSigns factoring agreement
4. KYC + fraud check (async, < 2 min decision)
5. Approval shown: credit limit, payment schedule, advance terms
6. Auto-enroll toggle for all future eligible loads

**Acceptance Criteria:**
- [ ] JWT expiry enforced — expired token shows clear error with AELS support link
- [ ] All PII from JWT, never from URL query params
- [ ] Plaid Link integration for bank verification
- [ ] Manual routing/account fallback with micro-deposit verification
- [ ] Factoring agreement displayed inline with scroll-to-sign
- [ ] eSign: timestamp, IP, device fingerprint recorded
- [ ] Mobile-responsive (drivers primarily use phones)
- [ ] ADA / WCAG 2.1 AA compliant
- [ ] Page loads < 3s on 4G

---

### REQ-FAC-006 — AELS Outbound Webhook System

**ID:** REQ-FAC-006  
**Title:** Webhook Notification System — PaySurity → AELS  
**Priority:** P1  
**AELS Endpoint:** `POST https://api.americaneaglelogistics.net/api/driver/payfactor-webhook`  

**Webhook Events:**
```json
{
  "event": "driver_approved | driver_denied | escrow_confirmed | advance_disbursed | advance_failed | settlement_scheduled | settlement_disbursed | account_suspended",
  "aels_load_id": "string | null",
  "aels_driver_id": "string",
  "paysurity_transaction_id": "string",
  "amount_usd": 217.12,
  "timestamp": "ISO8601",
  "denial_reason": "string | null",
  "scheduled_date": "ISO8601 | null"
}
```

**Acceptance Criteria:**
- [ ] HMAC-SHA256 signature on all outbound payloads (PaySurity signs, AELS verifies)
- [ ] All 8 event types implemented
- [ ] Retry: exponential backoff, max 5 attempts, 24h TTL
- [ ] Dead-letter queue for undeliverable webhooks
- [ ] Webhook delivery logs retained 90 days

---

### REQ-FAC-007 — PayFactor Risk, Fraud & Escrow Integrity Engine

**ID:** REQ-FAC-007  
**Title:** PayFactor Risk Scoring, Fraud Prevention & Escrow Validation  
**Priority:** P0  
**Vertical:** pay-factor  

**Underwriting Checks — Enrollment:**
| Check | Hard Fail Code |
|---|---|
| AELS background check = failed | `KYC_FAILED` |
| Identity mismatch in KYC | `KYC_FAILED` |
| Bank account unverified | `BANK_ACCOUNT_UNVERIFIED` |
| Factoring agreement unsigned | `AGREEMENT_NOT_SIGNED` |
| Industry "do not fund" match | `KYC_FAILED` |

**Underwriting Checks — Escrow Deposit:**
| Check | Hard Fail Code |
|---|---|
| `advance_usd > driver available credit` | `CREDIT_LIMIT_EXCEEDED` |
| Same `aels_load_id` already has open escrow | `DUPLICATE_LOAD` |
| Math check: `advance + fee + settlement ≠ driver_net` | `INSUFFICIENT_ESCROW_FUNDS` |
| Driver suspended | `DRIVER_SUSPENDED` |

**Underwriting Checks — Advance Release:**
| Check | Hard Fail Code |
|---|---|
| `pop_verified ≠ true` | `POP_MISSING` |
| POP URL inaccessible | `POP_MISSING` |
| POP URL > 15 min old | `POP_EXPIRED` |
| Advance already released for escrow | `DUPLICATE_LOAD` |

**Underwriting Checks — Settlement Release:**
| Check | Hard Fail Code |
|---|---|
| Settlement already released | `DUPLICATE_LOAD` |
| Advance not yet released | reject (400) |
| Settlement amount mismatch > $0.02 | alert + log (non-blocking) |

**Driver Credit Limit Logic:**
- Default: $5,000
- Exposure tracks only the `advance_usd` portion per open escrow
- Settlement portion is held in escrow, not counted against driver credit limit
- Credit limit restored on escrow close (after Tranche 2 disbursement)
- Dynamic limit adjustment: 90-day factoring history, payment adherence

**Acceptance Criteria:**
- [ ] All checks above enforced at each respective endpoint
- [ ] Risk score computed at enrollment and re-evaluated at each escrow deposit
- [ ] "Do not fund" list checked at enrollment and every escrow deposit
- [ ] Fraud suspension triggers `account_suspended` webhook immediately
- [ ] All risk decisions audit-logged with signal detail

---

## Complete Denial Code Catalog

| Code | Trigger |
|---|---|
| `BANK_ACCOUNT_UNVERIFIED` | ACH setup incomplete |
| `KYC_FAILED` | Identity, background, or sanctions failure |
| `LOAD_NOT_PREPAID` | Only prepaid loads qualify |
| `POP_MISSING` | POP not submitted or URL inaccessible |
| `POP_EXPIRED` | POP URL > 15 minutes old |
| `CREDIT_LIMIT_EXCEEDED` | Advance exceeds driver's remaining credit |
| `DRIVER_SUSPENDED` | PaySurity account suspended |
| `DUPLICATE_LOAD` | Load already escrowed or advance already released |
| `AGREEMENT_NOT_SIGNED` | Factoring agreement not eSigned |
| `INSUFFICIENT_ESCROW_FUNDS` | Math validation failed on escrow deposit |

---

## Complete API Contract

| Endpoint | Method | Called By | Purpose |
|---|---|---|---|
| `/v1/payfactor/apply` | POST | AELS | Driver enrollment (one-time) |
| `/v1/payfactor/escrow` | POST | AELS | Upfront escrow deposit of driver-net |
| `/v1/payfactor/release-advance` | POST | AELS | Tranche 1 release (POP green signal) |
| `/v1/payfactor/release-settlement` | POST | AELS | Tranche 2 release (POD due-date signal) |
| `/v1/payfactor/driver/:id` | GET | Driver/AELS | Driver status and credit info |
| `/v1/payfactor/driver/:id/escrows` | GET | Driver/AELS | All escrow records for driver |
| `/v1/payfactor/driver/:id/history` | GET | Driver/AELS | Advance + settlement history |

---

## Dependency Map

| Depends On | Purpose |
|---|---|
| `ORC_PAYMENT_ORCHESTRATION` | ACH disbursement (Tranche 1 advance + Tranche 2 settlement) |
| `PAY_PAYROLL` | Driver payment schedule profiles; payroll date computation |
| `SEC_SECURITY_PRIVACY` | JWT, HMAC, API key management, escrow secret |
| `COM_COMPLIANCE_LEGAL` | Factoring agreement, UCC Article 9, UDAP, FCRA |
| `NOT_NOTIFICATION_ENGINE` | Driver email/SMS (approval, disbursement, scheduling) |
| `WAL_DIGITAL_WALLETS` | Optional: instant advance via PaySurity wallet |

---

## Compliance

| Requirement | Notes |
|---|---|
| UCC Article 9 | Factoring agreement must reference security interest in receivables |
| UDAP | Denial reasons clear, non-deceptive |
| FCRA | Soft pull disclosure at enrollment |
| PCI-DSS | Bank account numbers never logged; encrypted at rest |
| NACHA | ACH debit/credit rules apply to all disbursements |
| State factoring license | CA, ND, MT require license before launch |
| Escrow account | Must be a segregated FBO account, not commingled with PaySurity operating funds |

---

*Requirement v2.0 authored: 2026-03-17 | Replaces v1.0 entirely | Partner: AELS | Author: PaySurity Platform AI*
