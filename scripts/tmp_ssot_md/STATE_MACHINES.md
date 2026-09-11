# PaySurity Platform — Entity State Machines
**Document:** STATE_MACHINES.md | **Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** Solutions Architecture — No status transition may exist in code that is not defined here

> Every `status` field on every entity has exactly the transitions defined below.  
> A developer must not add a status value or transition without updating this document.  
> State transitions enforce: **who can trigger it**, **what validates it**, **what side effects it fires**.

---

## Order Status

```
OPEN ──────────────────────────────→ CANCELLED (void; manager auth required for any items already fired)
  │                                      ↑
  ├──[fireToKDS()]──→ SENT_TO_KDS ───────┤
  │                       │               
  │              [all items FIRED]        
  │                       ↓               
  │                   ALL_FIRED ──────────┤
  │                       │               
  │              [kitchen marks all items READY]
  │                       ↓               
  │                     READY ────────────┤
  │                       │               
  │              [closeOrder()]           
  │                       ↓               
  └──────────────────→ FULFILLED ─────────┤
                           │               
                   [refund issued]         
                           ↓               
                       REFUNDED
```

| Transition | Trigger | Actor | Validation | Side Effects |
|---|---|---|---|---|
| OPEN → SENT_TO_KDS | `fireToKDS()` | Server / AI / Aggregator | At least 1 unfired item | Publishes to KDS via Socket.io; sets `fired_at` |
| SENT_TO_KDS → ALL_FIRED | `markItemReady()` (last item) | Kitchen Staff (KDS UI) | All `order_items.kds_status = READY` | Fires `order.ready` webhook; triggers NOT engine notification |
| ALL_FIRED → READY | Auto (same as above, immediately) | System | — | Consumer notified pickup/delivery ready |
| READY → FULFILLED | `closeOrder()` | Cashier / POS / AI | Payment captured | LOY earning; settlement entry; `fulfilled_at` set |
| OPEN → CANCELLED | Void (any state via manager) | Manager (LOCATION_MANAGER+) | If SENT_TO_KDS: manager required | LOY reversal if earned; table freed; KDS cleared |
| SENT_TO_KDS → CANCELLED | Void | Manager | Manager auth | KDS station receives VOID signal |
| FULFILLED → REFUNDED | `createRefund()` full | Merchant Admin | Full payment refunded | LOY reversal; settlement debit entry |
| FULFILLED → FULFILLED | `createRefund()` partial | Merchant Admin | Partial refund amount | LOY partial reversal; `status` stays FULFILLED |

**`short_id` format:** `{brand_prefix}-{random_4_digit_alpha_numeric}` — e.g., `BB-K3X9`  
Generated: `{brand.slug.substring(0,2).toUpperCase()}-{nanoid(4).toUpperCase()}`  
Uniqueness scope: per `tenant_id` + `location_id` + `shift_date` (reset each day; not globally unique)

---

## Payment Intent Status

```
CREATED ───→ PROCESSING ───→ AUTHORIZED ───→ CAPTURE_PENDING ───→ CAPTURED
                │                  │                                   │
                │              [void]                           [refund partial]
                │                  ↓                                   │
                └──────────→ FAILED              ◄──────────────── PARTIALLY_REFUNDED
                                                                       │
                                                               [refund remainder]
                                                                       ↓
                                                                   REFUNDED
                                                                       
CAPTURED ──→ DISPUTED (chargeback opened externally — cannot transition back without resolution)
```

| Transition | Trigger | Validation | Side Effects |
|---|---|---|---|
| CREATED → PROCESSING | Gateway call initiated | — | Sets `updated_at` |
| PROCESSING → AUTHORIZED | FluidPay response_code 100 | — | Stores `gateway_intent_id`, `auth_code` |
| AUTHORIZED → CAPTURED | Capture call (auto for card-present) | — | Sets `captured_at`; fires `payment.succeeded` |
| PROCESSING → FAILED | Decline or timeout | — | Stores `failure_code`; fires `payment.failed` |
| AUTHORIZED → FAILED | Void after auth | — | Fires `payment.voided` |
| CAPTURED → PARTIALLY_REFUNDED | Partial refund | `refund_amount < captured_amount` | Fires `payment.refunded` |
| PARTIALLY_REFUNDED → REFUNDED | Remaining refunded | Full original captured now refunded | Fires `payment.refunded` |
| CAPTURED → DISPUTED | FluidPay dispute webhook | Dispute created by card network | Fires `dispute.created`; debits settlement |

**Failure codes (stored in `payment_intents.failure_code`):**

| Code | Meaning | Retry? |
|---|---|---|
| `SOFT_DECLINE` | Issuer declined — try different card | No retry; prompt new card |
| `HARD_DECLINE` | Blocked — fraud, stolen, closed account | No retry; prompt new card |
| `GATEWAY_TIMEOUT` | FluidPay did not respond in time | Retry up to `orc.gateway.retry_max_attempts` |
| `INSUFFICIENT_FUNDS` | Card declined — insufficient funds | No retry; prompt new card or cash |
| `EXPIRED_CARD` | Card expiry date in past | No retry; prompt new card |
| `INVALID_CVV` | CVV mismatch | No retry; prompt re-enter |
| `VELOCITY_LIMIT` | Card issuer velocity limit | 60-second wait then retry once |
| `NETWORK_ERROR` | Network failure before gateway response | Retry with same idempotency key |

---

## Dispute Status

```
NEEDS_RESPONSE ──[submitEvidence()]──→ EVIDENCE_SUBMITTED ──→ WON
                                                              ↓
                                                            LOST
NEEDS_RESPONSE ──[deadline passes, no evidence]──→ EXPIRED (auto-lost effectively)
NEEDS_RESPONSE ──[consumer withdraws dispute]──→ WITHDRAWN
```

| Transition | Actor | Timeframe | Side Effects |
|---|---|---|---|
| Open → NEEDS_RESPONSE | FluidPay webhook | — | Debit settlement; charge fee; notify merchant (NOT engine) |
| NEEDS_RESPONSE → EVIDENCE_SUBMITTED | Merchant Admin | Must be before `response_due_at` | Calls FluidPay dispute evidence API |
| EVIDENCE_SUBMITTED → WON | FluidPay webhook | Card network decision | Credit settlement; fire `dispute.won` webhook |
| EVIDENCE_SUBMITTED → LOST | FluidPay webhook | Card network decision | Amount already debited; fire `dispute.lost` webhook |
| NEEDS_RESPONSE → EXPIRED | Batch job (nightly) | `response_due_at` passed, no evidence | Log as constructively LOST; fire `dispute.expired` webhook |
| NEEDS_RESPONSE → WITHDRAWN | FluidPay webhook | Consumer withdrew | Credit settlement; fire `dispute.withdrawn` webhook |

**`response_due_at`:** Read from platform_config `orc.dispute.response_window_days` after dispute creation date.  
**Alert rule:** AT `response_due_at - 3 days`: push + email alert to Merchant Admin. AT `response_due_at - 1 day`: urgent SMS.

---

## Merchant Account Status

```
PENDING_APPLICATION ──[KYB passes]──→ UNDER_REVIEW ──[underwriter approves]──→ APPROVED ──[config complete]──→ ACTIVE
        │                                  │                                         │
        │                          [KYB failed]                              [underwriter rejects]
        │                                  ↓                                         ↓
        │                          KYB_FAILED                              REJECTED (terminal)
        │
ACTIVE ──[payment overdue + grace expired]──→ RESTRICTED ──[balance collected]──→ ACTIVE
ACTIVE ──[legal / compliance hold]──→ SUSPENDED ──[PaySurity internal]──→ ACTIVE | TERMINATED
RESTRICTED ──[14 days unpaid]──→ TERMINATED (terminal; requires new application)
```

| Transition | Actor | Side Effects |
|---|---|---|
| PENDING → UNDER_REVIEW | System (KYB auto-approve) | Notify merchant; queue underwriter |
| UNDER_REVIEW → APPROVED | PaySurity Underwriter | Generate gateway_configurations record |
| APPROVED → ACTIVE | Merchant Admin (completes config) | Activate ALL features per tier |
| ACTIVE → RESTRICTED | Billing batch (overdue) | Disable analytics; disable exports; payment still works |
| RESTRICTED → ACTIVE | Payment received | Re-enable all features within 30min |
| ACTIVE → SUSPENDED | PaySurity Admin (manual) | ALL processing disabled; log reason required; CEO notified |
| SUSPENDED → ACTIVE | PaySurity Admin (manual) | Restore all features; audit reason recorded |

---

## Loyalty Account Status

```
ACTIVE ──[fraud signal detected]──→ FRAUD_HOLD ──[cleared]──→ ACTIVE
ACTIVE ──[inactivity > expiry_days]──→ EXPIRED (batch job)
ACTIVE ──[consumer CCPA deletion request]──→ DELETED
EXPIRED ──[consumer re-enrolls]──→ ACTIVE (new account; prior history retained with privacy token)
FRAUD_HOLD ──[confirmed fraud]──→ DELETED
```

| Transition | Actor | Side Effects |
|---|---|---|
| ACTIVE → FRAUD_HOLD | System (fraud signals) | Redemptions blocked immediately; merchant notified; resolution within 48h |
| FRAUD_HOLD → ACTIVE | Risk Reviewer (manual) | Redemptions re-enabled; consumer notified via NOT engine |
| ACTIVE → EXPIRED | Nightly batch | Points zeroed; breakage record written; expiry notification sent at T-60, T-30 |
| ACTIVE → DELETED | System (CCPA request) | PII replaced with privacy token; points zeroed; transaction history de-identified |

---

## Subscription Status

```
TRIALING ──[trial_end date]──→ PAST_DUE (first invoice) | ACTIVE (if billing method on file)
ACTIVE ──[payment fails]──→ PAST_DUE ──[3 retries fail]──→ GRACE ──[5 days]──→ RESTRICTED ──[7 more days]──→ TERMINATED
ACTIVE ──[merchant downgrades]──→ ACTIVE (new tier at next cycle)
ACTIVE ──[merchant upgrades]──→ ACTIVE (new tier immediately + prorated charge)
GRACE → ACTIVE (payment received during grace)
RESTRICTED → ACTIVE (payment received)
TERMINATED ──[new application]──→ [New merchant application — fresh start]
```

| Status | Features Available |
|---|---|
| ACTIVE | Full tier features |
| PAST_DUE | Full features; 24h warning period |
| GRACE | Full features first 5 days; then features start restricting |
| RESTRICTED | Processing works; analytics off; exports off; portal read-only |
| TERMINATED | Zero access; data readable for export only (30 days) |

---

## Employee (Staff) Status

```
INVITED ──[accepts invite + sets password]──→ ACTIVE
ACTIVE ──[location manager deactivates]──→ SUSPENDED
ACTIVE ──[resignation / termination]──→ TERMINATED
SUSPENDED ──[reinstated by manager]──→ ACTIVE
TERMINATED: terminal — cannot re-activate; must create new employee record
```

**Clock-in gate:** Only `ACTIVE` employees can clock in. `SUSPENDED` employees' POS PIN rejected.  
**Payroll gate:** Only employees with clock-out records in the pay period are included in payroll run.

---

## KDS Item Status

```
PENDING ──[fireToKDS()]──→ SENT ──[kitchen taps item]──→ FIRED ──[kitchen marks done]──→ READY
PENDING → VOIDED (item voided before firing)
SENT → VOIDED (item voided after firing; KDS receives VOID signal; kitchen informed visually)
READY → VOIDED (rare: comp after ready; triggers negative adjustment)
```

---

## Notification Delivery Status

```
QUEUED ──[channel check passes]──→ SENDING ──[provider confirms]──→ DELIVERED
                                              ↓ (provider fails)
                                          RETRY_1 → RETRY_2 → RETRY_3 → RETRY_4 → RETRY_5 → RETRY_6 → FAILED
DELIVERED ──[consumer reads (email/in-portal)]──→ READ
QUEUED: held in quiet hours → QUEUED (held) ──[quiet hours end 7 AM]──→ SENDING
```

**Retry backoff (BullMQ configuration — read from DB, not hardcoded):**

| Attempt | Delay | Config Key |
|---|---|---|
| Retry 1 | 1 minute | `notification.retry.delay_1_sec` = 60 |
| Retry 2 | 5 minutes | `notification.retry.delay_2_sec` = 300 |
| Retry 3 | 30 minutes | `notification.retry.delay_3_sec` = 1800 |
| Retry 4 | 2 hours | `notification.retry.delay_4_sec` = 7200 |
| Retry 5 | 8 hours | `notification.retry.delay_5_sec` = 28800 |
| Retry 6 | 24 hours | `notification.retry.delay_6_sec` = 86400 |

```sql
-- Seed notification retry config
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('notification.retry.delay_1_sec',  '60',    'integer', 'First retry delay in seconds',   FALSE),
  ('notification.retry.delay_2_sec',  '300',   'integer', 'Second retry delay',             FALSE),
  ('notification.retry.delay_3_sec',  '1800',  'integer', 'Third retry delay',              FALSE),
  ('notification.retry.delay_4_sec',  '7200',  'integer', 'Fourth retry delay',             FALSE),
  ('notification.retry.delay_5_sec',  '28800', 'integer', 'Fifth retry delay',              FALSE),
  ('notification.retry.delay_6_sec',  '86400', 'integer', 'Sixth (final) retry delay',      FALSE)
ON CONFLICT (key) DO NOTHING;
```

---

## Payroll Run Status

```
DRAFT ──[calculate()]──→ CALCULATED ──[mgr reviews]──→ PENDING_APPROVAL ──[approves]──→ APPROVED ──[ACH dispatch]──→ PROCESSING ──→ COMPLETED
                                                                              ↓
                                                                      REJECTED (revision required)
APPROVED → CANCELLED (before ACH cutoff only; cannot cancel in-flight ACH)
```

| Transition | Actor | Gate | Side Effects |
|---|---|---|---|
| DRAFT → CALCULATED | System (payroll service) | All employees clocked out | Calculates gross, deductions, net per employee |
| CALCULATED → PENDING_APPROVAL | System (automatic; or manager initiates) | — | Notifies approver via NOT engine |
| PENDING_APPROVAL → APPROVED | Payroll Admin (MFA required) | — | Queues ACH file generation |
| PENDING_APPROVAL → REJECTED | Payroll Admin | Reason required | Returns to DRAFT for correction |
| APPROVED → PROCESSING | Batch job (ACH dispatch window) | `orc.ach.settlement_days` config | Generates NACHA ACH file; submits to FluidPay ACH; fires `payroll.approved` webhook |
| PROCESSING → COMPLETED | FluidPay ACH confirmation | ACH file processed | Employee wallets credited; pay stubs generated; `payroll.completed` webhook |
