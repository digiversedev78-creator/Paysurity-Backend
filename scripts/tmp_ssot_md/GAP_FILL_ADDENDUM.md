# PaySurity — Canonical Requirements: Gap Fill Addendum
**Version:** v2.1 | **Date:** 2026-03-14
**Authority:** These 15 requirements were identified as MISSING from the Phase 1 canonical set and added on this date.
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding

> These requirements carry the same canonical authority as those in the vertical files.
> See `00_CANONICAL_INDEX.md` for cross-reference.
> An implementation status appendix was added on 2026-03-24 (V4.2 audit). Requirement specifications are unchanged.

---

## GAP 1: Tip Pre-Auth & Pool Distribution (CRITICAL)
### REQ-POSR-011: Tip Management
**Vertical:** BistroBeest Restaurant POS | **Actor:** Server, Cashier, Manager

**Acceptance Criteria:**
1. Pre-auth amount: card authorized for subtotal + estimated tip percent (configurable per location via `location_config.tip_preauth_pct`, default 20%)
2. Tip adjustment: server can adjust final tip up or down within configurable window (`location_config.tip_adjust_window_hours`, default 24h) after transaction close
3. Tip pool models: `EQUAL_SPLIT` | `PERCENT_OF_TIPS` | `HOURS_WEIGHTED` | `POINT_BASED` — model and ratios read from `location_config`, never hardcoded
4. Pool distribution calculation executes on shift close — not on individual transactions
5. Tipped minimum wage: system validates final (hourly_rate + tip_credit) ≥ applicable federal/state tipped minimum for the shift period
6. Tip fraud guard: system rejects any tip > `location_config.tip_fraud_max_pct` of subtotal (default 100%) — cannot be bypassed at UI or API layers
7. All pool ratios, percentages, and thresholds sourced from `location_config` — zero hardcoded values

**Tests:** 7 scenarios

---

## GAP 2: Void vs. Refund Distinction (CRITICAL)
### REQ-ORC-013: Void vs Refund Auto-Determination
**Vertical:** All POS | **Actor:** Cashier, Manager, System

**Acceptance Criteria:**
1. Void: pre-settlement cancellation — cancels authorization; no charge to customer; must meet card brand same-day rules
2. Refund: post-settlement return — initiates return to original payment method via gateway
3. System auto-determines correct operation: if `payment_intent.status` is `AUTHORIZED` or `CAPTURE_PENDING` → void; if `CAPTURED` → initiate refund workflow — no manual selection by cashier
4. Manager PIN or TOTP (for financial roles) required for all voids and refunds above `orc.void_manager_threshold_cents` (from `platform_config`)
5. Partial refund: amount ≤ original captured amount; multiple partial refunds allowed; total tracked vs. original
6. Reason code required from enum `{CUSTOMER_REQUEST, DUPLICATE, FRAUDULENT, ORDER_ERROR, QUALITY_ISSUE, OTHER}` — not free-text
7. Void and refund records written to audit trail in same DB transaction as the status change
8. Over-refund prevention: system rejects if cumulative refunds would exceed original capture amount — `OVER_REFUND_REJECTED` error returned

**Tests:** 8 scenarios

---

## GAP 3: Receipt Generation & Delivery (CRITICAL)
### REQ-POS-011: Receipt — Print, Email, SMS, Gift, Return
**Vertical:** All POS | **Actor:** Consumer, Cashier

**Acceptance Criteria:**
1. Print: 80mm ESC/POS thermal format; auto-triggered if printer detected; configurable via `pos.auto_print_receipt` in `merchant_config`
2. Email receipt: branded HTML template (merchant logo + footer from `merchant_config`); sent asynchronously via NOT service; never blocks checkout completion
3. SMS receipt: short URL slug linking to hosted receipt page; only delivered if consumer `sms_consent = true` in their profile
4. Receipt content — mandatory fields: merchant name + address + phone, order items (name, qty, unit price, modifiers, comp flag), subtotal, tax breakdown by jurisdiction (from TAX engine response), tip, total, all payment methods used (card last-4 + brand, or cash tendered + change given), loyalty points earned this visit + new running balance + next expiry date, gateway auth code, platform X-Trace-Id, footer text from `merchant_config.receipt_footer_text`
5. Gift receipt: all line items listed but prices suppressed; physically printed only (no email/SMS for gift receipts)
6. Return receipt: shows returned items + credit amounts + original order `short_id` reference
7. Decline option: consumer explicitly declines receipt — outcome logged as `RECEIPT_DECLINED` in audit trail
8. Duplicate reprint: accessible from order history by any user with `RECEIPT_REPRINT` RBAC permission
9. QR code: appended to receipt if `pos.feedback_qr_enabled = true` in `merchant_config`

**Tests:** 9 scenarios

---

## GAP 4: End-of-Day Report & Shift Close (CRITICAL)
### REQ-POSR-013: Z-Report & Shift Close
**Vertical:** All POS | **Actor:** Manager, Cashier

**Acceptance Criteria:**
1. X-Report: read-only snapshot of current shift totals by tender type — does NOT lock the shift or reset any counters
2. Z-Report: locks the shift (no further transactions accepted), resets daily counters to zero, persists a `z_reports` record, and triggers nightly settlement batch if `posr.auto_settle_on_z = true`
3. Cash count entry: manager enters physical cash counted in drawer before closing; stored in `z_reports.cash_counted_cents`
4. Over/short calculation: `overshort_cents = cash_counted_cents - expected_cash_from_transactions`; shown with +/- indicator and reason field
5. Manager approval gate: if `|overshort_cents| > posr.overshort_approval_threshold_cents` (from `merchant_config`), a second manager TOTP approval is required before Z locks
6. Blind close option: if `merchant_config.blind_close = true`, cashier UI never shows expected cash total before entering their count — prevents anchoring
7. Z-Report summary content: shift open/close timestamp, cashier full name, per-tender subtotals (cash / card / gift card / wallet / EBT), void count + void amount, refund count + refund amount, discount total, net sales, tax by jurisdiction, tip total
8. All summary figures queried from `orders`, `payment_intents`, `shifts` tables at Z-close time — never accumulated counters, never hardcoded
9. `z_reports` record persisted with all summary fields; accessible in merchant portal history indefinitely for audit

**Tests:** 9 scenarios

---

## GAP 5: Cash Drawer Operations (CRITICAL)
### REQ-POS-012: Cash Drawer Operations
**Vertical:** All POS | **Actor:** Cashier, Manager

**Acceptance Criteria:**
1. Open drawer: only on cash transaction, no-sale (manager PIN), or paid-out
2. Starting bank: configurable per shift (default $200)
3. Paid-in: cash added mid-shift
4. Paid-out: cash removed (requires reason)
5. No-sale: opens drawer without transaction — logged, requires manager code
6. Cash drop: safe drops during shift
7. Drawer assignment: one per cashier per shift

**Tests:** 7 scenarios

---

## GAP 6: Split Payment / Multi-Tender (CRITICAL)
### REQ-ORC-014: Multi-Tender Payment
**Vertical:** All POS | **Actor:** Cashier, Consumer

**Acceptance Criteria:**
1. Split by tender: $20 Card A + $15 Card B + $5 cash
2. Split by guest: each guest pays own items
3. Split evenly: divide total by N guests
4. EBT + cash/card: SNAP items on EBT, remainder on card
5. Gift card + card: gift card first, remainder on card
6. Partial payment: if first tender fails, remaining balance clear
7. Each tender on receipt
8. All tenders linked to same order in audit trail

**Tests:** 8 scenarios

---

## GAP 7: Offline POS Mode (CRITICAL)
### REQ-NFR-009: Offline POS Operation
**Vertical:** All POS | **Actor:** Cashier, Manager

**Acceptance Criteria:**
1. Detect internet loss within 5 seconds
2. Queue transactions locally (IndexedDB + service worker)
3. Store-and-forward: offline card transactions processed on reconnect
4. Offline limit: configurable max $/transaction (default $50)
5. Offline limit: configurable max total queue (default $500)
6. Cash: fully functional offline
7. Sync on reconnect: all queued sent, conflicts resolved
8. Visual indicator: online/offline status
9. Menu/inventory cached locally
10. Offline mode auto-disabled for refunds/voids

**Tests:** 10 scenarios

---

## GAP 8: Accounting Export (IMPORTANT)
### REQ-MER-012: Accounting Integration
**Vertical:** All | **Actor:** Accountant, Owner

**Acceptance Criteria:**
1. Export daily journal entries to QuickBooks Online format
2. Export to Xero CSV format
3. Map categories to chart of accounts
4. Auto daily sync via QBO OAuth2 API
5. Manual CSV download for any system
6. Settlement reconciliation: bank deposit = export total
7. Tax liability entries auto-calculated

**Tests:** 7 scenarios

---

## GAP 9: Data Portability (IMPORTANT)
### REQ-COM-013: Merchant Data Export
**Vertical:** Platform | **Actor:** Owner, Compliance Officer

**Acceptance Criteria:**
1. Full data export in CSV/JSON
2. Includes: transactions, customers, inventory, orders, employees, settings
3. Tenant isolation enforced
4. Available within 30 days of request
5. On closure: data preserved 7 years (IRS), then auto-purged
6. Format documented with field descriptions

**Tests:** 6 scenarios

---

## GAP 10: FluidPay Error Mapping (IMPORTANT)
### REQ-ORC-015: Gateway Error Taxonomy
**Vertical:** Payment | **Actor:** System, Support Engineer

**Acceptance Criteria:**
1. Map all FluidPay decline codes to user-friendly messages
2. Categories: hard decline (no retry), soft decline (retry OK), system error
3. Cashier sees friendly message, not raw code
4. Raw + mapped code both logged
5. Decline analytics by merchant/period
6. Decline code reference in merchant portal

**Tests:** 6 scenarios

---

## GAP 11: Gateway Failover (IMPORTANT)
### REQ-ORC-016: Payment Gateway Resilience
**Vertical:** Payment | **Actor:** System, Support Engineer

**Acceptance Criteria:**
1. Health check: ping FluidPay every 30 seconds
2. Circuit breaker: 5 consecutive failures → open circuit
3. Queue mode: transactions queued during outage (max 5 min)
4. Alert: support notified within 60 seconds
5. Fallback UX: "Payment temporarily unavailable"
6. Recovery: auto-retry queued on circuit close
7. Phase 2: secondary gateway as hot failover

**Tests:** 7 scenarios

---

## GAP 12: PCI SAQ-A (IMPORTANT)
### REQ-COM-014: PCI DSS SAQ-A Compliance
**Vertical:** Platform | **Actor:** Compliance Officer

**Acceptance Criteria:**
1. SAQ-A qualification (card data never touches PaySurity servers)
2. All payment forms use FluidPay hosted fields (iframe tokenization)
3. No PAN/CVV/magstripe in any system, log, or DB — EVER
4. Annual SAQ-A self-assessment filed
5. Quarterly ASV scan passed
6. PCI compliance dashboard

**Tests:** 6 scenarios

---

## GAP 13: FDA Tobacco Compliance (IMPORTANT)
### REQ-POSG-015: Age-Restricted Product Compliance
**Vertical:** PayRetail, GrocerEase | **Actor:** Cashier, Manager

**Acceptance Criteria:**
1. Tobacco/vape/alcohol items flagged in catalog
2. POS prompts age verification — CANNOT be bypassed
3. DOB entry: age ≥ 21 for tobacco/alcohol (state-dependent)
4. ID scan option: parse driver's license barcode
5. Manager override NOT allowed for underage — hard block
6. Compliance log: every verification recorded
7. Regulatory audit trail exportable

**Tests:** 7 scenarios

---

## GAP 14: Table Management (IMPORTANT)
### REQ-POSR-012: Table & Seating Management
**Vertical:** BistroBeast | **Actor:** Manager, Waiter

**Acceptance Criteria:**
1. Floor plan editor: drag-drop table layout
2. Table status: available, seated, ordered, served, check-dropped, dirty
3. Server assignment per table
4. Wait time display when full
5. Table merge for large parties
6. Turn time tracking (revenue optimization)
7. Walk-in vs reservation indicator

**Tests:** 7 scenarios

---

## GAP 15: i18n Infrastructure Stub (Deferred Phase 2)
### REQ-NFR-010: Internationalization Infrastructure
**Vertical:** Platform | **Actor:** All

**Acceptance Criteria:**
1. All user-facing strings externalized to locale files (en-US default)
2. Locale selection stored per user preference
3. Date/time/currency formatting respects locale
4. Phase 2: add es-MX, fr-CA
5. No hardcoded strings in components

**Tests:** 5 scenarios

---

## GAP 16: P2P Request Money & Split Bill (IMPORTANT)
### REQ-WAL-004: Peer-to-Peer Requests
**Vertical:** Digital Wallets | **Actor:** Consumer

**Acceptance Criteria:**
1. Request money from any contact via phone/email
2. Split a transaction amount with N contacts
3. Fulfill request: Payee receives push notification and can pay directly from wallet balance
4. Status tracking: PENDING, COMPLETED, CANCELLED, DENIED
5. Transaction recorded as 'TRANSFER_OUT' and 'TRANSFER_IN'

**Tests:** 5 scenarios

---

## GAP 17: QR Code & Universal Links (IMPORTANT)
### REQ-WAL-005: QR & Deep Link Payments
**Vertical:** Digital Wallets | **Actor:** Consumer, Merchant

**Acceptance Criteria:**
1. Static QR: generated per location; consumer scans to open payment UI
2. Dynamic QR: generated per POS transaction with exact `amount_cents` and `order_id`
3. Universal Link: `paysurity.com/pay/{recipient}?amount={cents}` deep links to mobile app
4. Validates recipient and amount before presenting confirmation screen
5. Expiration: Dynamic QRs expire after 5 minutes

**Tests:** 6 scenarios

---

## GAP 18: Savings Goals & Round-ups (IMPORTANT)
### REQ-WAL-006: Sub-accounts & Micro-savings
**Vertical:** Digital Wallets | **Actor:** Consumer

**Acceptance Criteria:**
1. Consumers can create up to 5 labeled savings goals
2. Auto-route percentage of payroll deposits directly to specific goals
3. Round-up feature: round each consumer purchase to nearest $1 and sweep cents to a designated savings goal
4. Transfers between main balance and savings goals must be instant and recorded in double-entry ledger

**Tests:** 8 scenarios

---

## GAP 19: Scheduled & Recurring Transfers (IMPORTANT)
### REQ-WAL-007: Automated Money Movement
**Vertical:** Digital Wallets | **Actor:** Consumer

**Acceptance Criteria:**
1. Setup recurring transfers to external banks or other PaySurity wallets
2. Frequencies supported: WEEKLY, BIWEEKLY, MONTHLY
3. Rule-based: e.g., "Transfer $50 every Friday" or "Transfer 10% of every payroll deposit"
4. Fails safely with insufficient funds alert if balance is too low

**Tests:** 5 scenarios

---

## GAP 20: Family/Teen Sub-wallets (IMPORTANT)
### REQ-WAL-008: Parental Controls & Dependent Accounts
**Vertical:** Digital Wallets | **Actor:** Guardian, Dependent

**Acceptance Criteria:**
1. KYC'd Guardian can provision linked "Teen" sub-wallets
2. Guardian defines daily/monthly spend and load limits for each dependent
3. Transaction approvals: Optional setting requiring Guardian approval for purchases above $X
4. Instant P2P between Guardian and Dependent
5. Guardian has full visibility of Dependent transaction history

**Tests:** 7 scenarios

---

## Updated Totals (as of 2026-03-30 addition)

| Metric | Before | After |
|---|---|---|
| Canonical requirements | 325+ | **330+** |
| Test scenarios | ~840 | **~871** |
| Coverage gaps | 5 | **0** |
| Day-1 blockers | 0 | **0** |

