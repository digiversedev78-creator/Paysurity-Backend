# PaySurity Platform — User Interaction Map
**Version:** v1.0 | **Date:** 2026-03-12  
**Authority:** BINDING — Every interaction listed here MUST have a coded screen/endpoint/webhook. If it's not coded, the requirement is NOT DONE.

---

## Interaction Types

| Type | Meaning | "Done" When |
|---|---|---|
| 🖥️ **Human-Screen** | User sees/interacts with a screen | Component renders, passes Gate 4 |
| 🔗 **System-API** | Service calls an internal API | Endpoint exists, passes Gate 3 |
| 🌐 **External-API** | System calls external service | Circuit breaker + contract verified, passes Gate 5 |
| 📩 **System-Notification** | System sends message to human | Template exists, NOT engine sends, passes Gate 5 |
| ⏰ **System-Batch** | System runs scheduled job | BullMQ job registered, idempotent, passes Gate 5 |
| 🔌 **Webhook-Inbound** | External system calls PaySurity | Signature verification, parsing, passes Gate 3 |
| 🔔 **Webhook-Outbound** | PaySurity notifies merchant system | Event published, delivery engine handles, passes Gate 5 |

---

## POSR — Restaurant POS

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Cashier opens POS terminal | 🖥️ | Cashier | `apps/merchant-dashboard/pages/pos/restaurant/terminal` |
| 2 | Cashier selects menu category | 🖥️ | Cashier | Category tab bar + item grid |
| 3 | Cashier adds item to order | 🖥️🔗 | Cashier → API | POST `/v1/orders/{id}/items` |
| 4 | Cashier applies modifier | 🖥️🔗 | Cashier → API | POST `/v1/orders/{id}/items` (modifiers in body) |
| 5 | Cashier fires order to KDS | 🖥️🔗 | Cashier → API → KDS | PATCH `/v1/orders/{id}/fire` → WebSocket to KDS |
| 6 | KDS station displays ticket | 🖥️ | Kitchen Staff | `apps/merchant-dashboard/pages/pos/restaurant/kds` |
| 7 | KDS marks ticket complete | 🖥️🔗 | Kitchen Staff → API | PATCH `/v1/kds/tickets/{id}/complete` |
| 8 | Cashier processes payment | 🖥️🔗🌐 | Cashier → API → FluidPay | POST `/v1/payments/intents` |
| 9 | System calculates tax at close | 🔗🌐 | API → TaxJar | POST `/v1/tax/calculate` |
| 10 | System commits tax after payment | ⏰ | Batch → TaxJar | `tax.commit_fulfilled_orders` |
| 11 | System earns loyalty points | 🔗 | ORC → LOY | `loyaltyService.earnPoints()` |
| 12 | Receipt printed/emailed | 📩 | System → Consumer | NOT template: `receipt.email` |
| 13 | Order notification to consumer | 📩 | System → Consumer | NOT: `order.status_update` |
| 14 | 86 item propagation to aggregators | 🔗🌐🔔 | API → Agg → DoorDash | AGG `syncMenuItem86()` |
| 15 | Shift close/cash drawer report | 🖥️🔗 | Manager → API | `apps/merchant-dashboard/pages/pos/restaurant/shift-close` |
| 16 | Tip pool distribution | ⏰ | Batch | `posr.tip_pool_distribution` |
| 17 | Manager void/comp | 🖥️🔗 | Manager (PIN) → API | PATCH `/v1/orders/{id}/void` (requires manager PIN) |

---

## POSG — Grocery POS

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Cashier scans barcode | 🖥️🔗 | Cashier → API | GET `/v1/grocery/barcodes/{upc}` |
| 2 | Scale reads weight | 🖥️ | Hardware → POS | USB HID readScale() → auto-fills price |
| 3 | Age verification prompt | 🖥️ | Cashier | Full-screen overlay with 3 buttons |
| 4 | EBT tender split screen | 🖥️🔗🌐 | Cashier → API → Fiserv | POST `/v1/payments/tender-ebt` |
| 5 | WIC tender | 🖥️🔗🌐 | Cashier → API → WIC network | POST `/v1/payments/tender-wic` |
| 6 | Quick tender buttons (Exact/$50/$100) | 🖥️🔗 | Cashier → API | POST `/v1/payments/tender-cash` |
| 7 | Low stock alert | 📩 | System → Location Mgr | NOT: `inventory.low_stock` |

---

## LOY — Loyalty

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Consumer enrolls via POS | 🖥️🔗📩 | Cashier → API → SMS | POST `/v1/loyalty/accounts` |
| 2 | Consumer checks balance (app) | 🖥️ | Consumer | `apps/consumer-mobile/screens/Loyalty` |
| 3 | Consumer redeems at POS | 🖥️🔗 | Cashier → API | POST `/v1/loyalty/redemptions` |
| 4 | Tier upgrade notification | 📩 | System → Consumer | NOT: `loyalty.tier_upgrade` |
| 5 | Points expiry warning | 📩 | System → Consumer | NOT: `loyalty.expiry_warning` |
| 6 | Points expiry execution | ⏰ | Batch | `loyalty.expire_points` |
| 7 | Fraud detection alert | 📩🔗 | System → Admin | OPS alert: `loyalty.fraud_detected` |

---

## WAL — Wallets

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Consumer views wallet (app) | 🖥️ | Consumer | `apps/consumer-mobile/screens/Wallet` |
| 2 | Consumer loads wallet from bank | 🖥️🔗 | Consumer → API | POST `/v1/wallets/{id}/load` |
| 3 | Consumer transfers to bank | 🖥️🔗 | Consumer → API (MFA) | POST `/v1/wallets/{id}/transfer` |
| 4 | Payroll instant credit | 🔗📩 | PAY → WAL → NOT | `walletService.credit()` → push: "Your pay is available!" |
| 5 | Wallet payment at POS | 🖥️🔗 | Cashier → API | Reserve → Capture → Release |

---

## PAY — Payroll

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Admin creates pay period | 🖥️🔗 | Payroll Admin → API | `apps/merchant-dashboard/pages/payroll/periods` |
| 2 | System calculates payroll | 🔗 | API | `payrollService.calculatePayroll()` |
| 3 | Admin reviews + approves (MFA) | 🖥️🔗 | Payroll Admin → API (MFA) | `apps/merchant-dashboard/pages/payroll/approve` |
| 4 | NACHA file dispatch | ⏰🌐 | Batch → Bank | `payroll.ach_dispatch` (NACHA file → bank) |
| 5 | Wallet instant credit | 🔗 | PAY → WAL | `walletService.credit(PAYROLL_CREDIT)` |
| 6 | Pay stub generated + delivered | 📩 | System → Employee | NOT: `payroll.pay_stub_ready` |
| 7 | Employee clocks in/out (mobile) | 🖥️🔗 | Employee → API | `apps/merchant-mobile/features/clock-in-out` |

---

## MER — Merchant Onboarding

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Prospect starts application | 🖥️🔗 | Prospect → API | `apps/public-website/pages/apply` → POST `/v1/applications` |
| 2 | 5-step application wizard | 🖥️ | Prospect | 5 form steps (business, owner, processing, plan, bank) |
| 3 | KYB verification initiated | 🔗🌐 | API → Stripe Identity | `applicationService.runKYBChecks()` |
| 4 | KYB callback webhook | 🔌 | Stripe → API | POST `/webhooks/stripe-identity/kyb` |
| 5 | Underwriting auto-decision | 🔗 | API | `applicationService.runUnderwriting()` |
| 6 | Approval notification | 📩 | System → Merchant | NOT: `mer.application_approved` |
| 7 | Rejection notification | 📩 | System → Merchant | NOT: `mer.application_rejected` |
| 8 | Tenant provisioned | 🔗🌐 | API → FluidPay | `applicationService.provisionTenant()` |
| 9 | CSM assigns onboarding | 🖥️🔗 | PaySurity CSM → Admin | `apps/admin-portal/pages/onboarding` |

---

## AI — AI Experience

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Consumer opens AI chat | 🖥️ | Consumer | Floating chat bubble (ECO storefront or mobile) |
| 2 | Consumer sends message | 🖥️🔗🌐 | Consumer → API → Gemini | POST `/v1/ai/sessions/{id}/messages` |
| 3 | OTP identity verification | 🖥️🔗📩 | Consumer → API → NOT | POST `/v1/ai/sessions/{id}/verify` |
| 4 | AI builds order hold | 🔗 | AI Service | Writes to `ai_order_holds` |
| 5 | Consumer confirms AI order | 🖥️🔗 | Consumer → API | POST `/v1/ai/sessions/{id}/confirm-order` |
| 6 | Escalation to human | 🖥️📩 | System → Staff | NOT: `ai.escalation_needed` + Dashboard alert |

---

## AGG — Order Aggregation

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | DoorDash webhook: new order | 🔌 | DoorDash → API | POST `/webhooks/doordash/orders` |
| 2 | UberEats webhook: new order | 🔌 | UberEats → API | POST `/webhooks/ubereats/orders` |
| 3 | Order appears on KDS | 🖥️ | Kitchen Staff | KDS ticket (source badge: "DoorDash") |
| 4 | Price/menu sync | ⏰🌐 | Batch → Platforms | `agg.menu_sync` |
| 5 | 86 item propagation | 🔗🌐 | API → Platforms | `aggService.syncMenuItem86()` |

---

## SUB — Subscription Billing

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | View current plan | 🖥️ | Enterprise Admin | `apps/merchant-dashboard/pages/settings/subscription` |
| 2 | Upgrade plan (MFA) | 🖥️🔗 | Enterprise Admin → API | POST `/v1/subscriptions/upgrade` |
| 3 | Invoice generated | ⏰📩 | Batch → NOT | `sub.billing_cycle` → NOT: `sub.invoice_issued` |
| 4 | Payment failed (dunning) | ⏰📩 | Batch → NOT | `sub.dunning` → NOT: `sub.payment_failed` |
| 5 | Download invoice PDF | 🖥️🔗 | Finance → API → GCS | GET `/v1/subscriptions/invoices/{id}/download` |

---

## OPS — Operations Management

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Daily brief generated | ⏰🌐 | Batch → Gemini | `ops.ai_ops_daily_brief` |
| 2 | Daily brief delivered | ⏰📩 | Batch → NOT | `ops.brief_delivery` → email + push |
| 3 | View brief on dashboard | 🖥️ | Enterprise Admin | `apps/merchant-dashboard/pages/ops/dashboard` |
| 4 | Alert fires (threshold breach) | ⏰📩 | Batch → NOT | `ops.alert_evaluation` → alert card in dashboard |
| 5 | Acknowledge alert | 🖥️🔗 | Admin → API | PATCH `/v1/ops/alerts/{id}/acknowledge` |
| 6 | Location comparison grid | 🖥️ | Admin | Dashboard: color-coded location metrics |

---

## FRN — Franchise Management

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Create franchise agreement | 🖥️🔗 | Brand Admin → API | `apps/merchant-dashboard/pages/franchise/agreements` |
| 2 | Royalty calculation | ⏰ | Batch | `frn.royalty_calculation` |
| 3 | Royalty statement PDF | ⏰📩 | Batch → GCS → NOT | PDF generated → email to franchisee |
| 4 | Menu governance lock | 🖥️🔗 | Brand Admin → API | Lock level controls on menu items |
| 5 | Franchisee portal | 🖥️ | Franchisee Admin | Revenue, royalties, compliance dashboard |
| 6 | Franchise termination (MFA) | 🖥️🔗 | Enterprise Admin → API | POST `/v1/franchise/agreements/{id}/terminate` |

---

## API — Developer API Platform

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Create API key | 🖥️🔗 | Developer → API | `apps/merchant-dashboard/pages/settings/api-keys` |
| 2 | Webhook endpoint registration | 🖥️🔗 | Developer → API | `apps/merchant-dashboard/pages/settings/webhooks` |
| 3 | Webhook delivery | 🔔 | System → Merchant system | `webhookService.deliverWebhook()` |
| 4 | Test webhook endpoint | 🖥️🔗 | Developer → API | POST `/v1/webhooks/{id}/test` |
| 5 | View API usage metrics | 🖥️ | Developer | `apps/merchant-dashboard/pages/settings/api-usage` |

---

## COM — Compliance

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Consumer submits CCPA request | 🖥️🔗 | Consumer → API | `apps/public-website/pages/privacy/ccpa-request` |
| 2 | CCPA verification email | 📩 | System → Consumer | NOT: `ccpa.verification` |
| 3 | CCPA request fulfilled | 🔗📩 | API → NOT | Data export or deletion completed → confirmation email |
| 4 | PCI compliance dashboard | 🖥️ | PaySurity Admin | `apps/admin-portal/pages/compliance/pci` |

---

## SEC — Security

| # | Interaction | Type | Actors | Screen/Endpoint |
|---|---|---|---|---|
| 1 | Login | 🖥️🔗 | Any user → API | Login form → POST `/v1/auth/login` |
| 2 | MFA verification | 🖥️🔗 | User → API | TOTP code form → POST `/v1/auth/mfa/verify` |
| 3 | Password reset | 🖥️🔗📩 | User → API → NOT | Reset link email → new password form |
| 4 | Session management | 🖥️🔗 | User → API | View active sessions; revoke |
| 5 | Security event log | 🖥️ | PaySurity Admin | `apps/admin-portal/pages/security/events` |
