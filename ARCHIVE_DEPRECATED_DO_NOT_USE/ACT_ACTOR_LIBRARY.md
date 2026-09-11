# Canonical Actor Library — PaySurity Platform
**Document Type:** Actor Library (ACT)  
**Version:** v1.0-canonical  
**Date:** 2026-03-12  
**Scope:** All PaySurity verticals — internal and external human users

---

## Purpose

This document defines every human actor who interacts with the PaySurity platform — directly or indirectly. It answers:

- **Who** are they?
- **What is their goal** every day?
- **What is their fear** (what failure costs them)?
- **How does PaySurity make their life easier?**
- **What does PaySurity capture from them** (revenue, data, trust)?
- **What KPI proves PaySurity is working for them?**

This document governs requirements prioritization: any feature not traceable to at least one actor's goal MUST be challenged for scope justification.

---

## Actor Classification

| Class | Definition |
|---|---|
| **External — Tenant** | The business (merchant) paying PaySurity subscription and processing fees |
| **External — Tenant Staff** | Employees of the tenant who use PaySurity operationally |
| **External — End Consumer** | Customers of the tenant who interact with PaySurity-powered experiences |
| **External — Partner** | Affiliates, resellers, referral partners in the PaySurity partner program |
| **Internal — PaySurity** | PaySurity employees and internal autonomous systems |

---

## Technical Mapping: The 14 System Roles (RBAC)
Every actor above maps to one (or more) of the 14 formal system roles enforced by the `@Roles()` decorators and `role.enum.ts`:
1. `PAYSURITY_ADMIN`
2. `ENTERPRISE_ADMIN`
3. `ENTERPRISE_FINANCE`
4. `BRAND_ADMIN`
5. `LOCATION_MANAGER`
6. `SERVER`
7. `CASHIER`
8. `KITCHEN_STAFF`
9. `PAYROLL_ADMIN`
10. `API_KEY_MERCHANT`
11. `API_KEY_RESELLER`
12. `CONSUMER`
13. `EXTERNAL_ACCOUNTANT`
14. `FRANCHISE_OWNER`

---

# SECTION 1: EXTERNAL — TENANT ACTORS

---

## ACT-T-001: Restaurant Owner / Multi-Location Operator
**Class:** External — Tenant  
**Also Called:** Tenant-Admin, Franchisee, Owner-Operator  
**Verticals:** POSR, PAY, WAL, MER, ECO

### Who They Are
The owner of a restaurant or another type of business — anywhere from a single shop to a multi-location chain under two brand names. They signed up for PaySurity because they're tired of juggling 4 vendors (POS, payroll, online ordering, loyalty) and spending hours every Sunday on paperwork. They don't run the floor every night. They manage the business.

### Daily Reality
```
Monday morning: reviews last week's revenue, labor %, and food cost on phone
                flags two disputes that need responses
                notices Location 3 had a bad Saturday — calls the GM
Wednesday: receives payroll approval request — reviews hours, approves
Friday night: gets an alert that DoorDash orders are stacking up and 
              one server called out — calls the shift manager
```

### Goals
- See profit (not just revenue) across all locations without a bookkeeper call
- Catch problems before they become crises (labor overtime, inventory stockouts, chargeback patterns)
- Grow: add a new location without adding administrative complexity linearly
- Pay their employees on time, every time, with zero IRS problems
- Know that their customer data is building an asset (loyalty), not leaking to competitors

### Fears
- A payroll error triggers an employee complaint or IRS notice
- A chargeback goes unanswered and they lose both the sale and a $100 fee
- Their best GM quits because their POS is too slow and frustrating
- They open a DoorDash and a direct website and can't reconcile where revenue is coming from
- A data breach exposes their customers' card data

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Aggregated cross-location revenue dashboard | REQ-MER-005: Single Pane of Glass Dashboard (multi-location view) |
| Payroll with tip credit, OT, W-2 | REQ-PAY-001 through REQ-PAY-009 |
| Chargeback alerts + guided response | REQ-MER-008: Dispute Management |
| Unified order queue (all channels) | AGG-001 through AGG-004 |
| Employee wallet with early pay | REQ-WAL-001 through REQ-WAL-008 |
| 3rd-party order aggregation | AGG-001: Unified Order Queue |
| Cross-brand franchise P&L | REQ-MER-010: Multi-Location Hierarchy |

### KPIs Proving PaySurity Works For Them
- Time spent on weekly financial admin: target ≤ 30 minutes (vs. industry avg 3–4 hours)
- Chargeback response rate before deadline: ≥ 90%
- Payroll error incidents per year: 0
- Portal daily active usage: ≥ 5 days/week

---

## ACT-T-002: District / Area Manager
**Class:** External — Tenant Staff  
**Verticals:** POSR, POSG, POS, MER

### Who They Are
Responsible for 3–8 locations. They don't operate a register — they interpret data and manage GMs. They spend 60% of their time in the field visiting locations and 40% on the phone or in spreadsheets.

### Goals
- Know which locations are underperforming before visiting (so the visit is purposeful)
- Compare like-for-like: same menu, same city, different labor % and revenue — why?
- Reduce time building comparison reports (currently: manual Excel every week)
- Hold GMs accountable with data, not just intuition

### Fears
- Being blindsided by a location's chargeback rate or a labor audit
- One GM gaming the system (voiding sales, manipulating shifts)
- Not catching a food safety issue that leads to a closed location

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Multi-location benchmarking dashboard | REQ-MER-010 + `REQ-AI-006` (BI Benchmarking) |
| Same-store-sales comparison | OPS-001: Tenant AI Ops Manager weekly brief |
| Labor alert (OT approaching by location) | REQ-PAY-003: Overtime detection |
| Void/discount pattern audit | REQ-MER-005 + immutable audit trail |

### KPIs
- Time to build weekly performance report: target ≤ 10 minutes (vs. 90 minutes manual)
- Location underperformance identified before it's a crisis: ≥ 80% of cases

---

## ACT-T-003: General Manager (Location Level)
**Class:** External — Tenant Staff  
**Verticals:** POSR, PAY, MER

### Who They Are
They run the floor. Every shift. They handle staff problems, customer complaints, comp requests, day to day location-specific operations and inventory. They look at the POS constantly. Their success metric is: how many covers did we do, what was the average ticket, and did labor stay under 35%?

### Goals
- Know in real time if the kitchen is falling behind
- Approve returns, comps, and manager overrides from anywhere (not physically at the register)
- See tonight's labor cost in real time — not tomorrow morning
- Handle a customer complaint fast, before it becomes a Google review

### Fears
- A server takes a comp without authorization
- The kitchen gets into the weeds at 7:30 PM and they don't know until people start complaining
- They can't approve a return because the manager override requires physical access to the terminal

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Live floor view (table status, course progress) | REQ-POSR-002: Table Layout Engine |
| Mobile manager override approval | REQ-POS-001: Cashier returns (manager approval via mobile) |
| Real-time labor cost dashboard | REQ-PAY-001 + REQ-MOB-003: Merchant Mobile Dashboard |
| Kitchen throughput monitor | OPS-002: Tenant AI Ops — kitchen capacity alert |
| Comp / void authorization by mobile | REQ-POSR-003: Pre-Auth & Comp Workflow |

### KPIs
- Manager override requests approved within 2 minutes: ≥ 95%
- Kitchen delay notifications responded to within 5 minutes: ≥ 90%
- Labor OT surprises (discovered after the fact): 0

---

## ACT-T-004: Server / Waiter
**Class:** External — Tenant Staff  
**Verticals:** POSR, PAY, WAL

### Who They Are
They use the POS terminal or handheld device 50–150 times per shift. Their satisfaction with the technology is directly correlated with their nightly tips and their stress level. They are the most frequent daily user of the POS system. If the POS is slow, clunky, or unreliable — they hate it and the owner hears about it.

### Goals
- Fire orders to the kitchen instantly without transcription errors
- Accept payment (any method) without the transaction feeling like a struggle
- Know their tip total for the night at any point during the shift
- Get their tips + wages into their bank the same night, not Friday

### Fears
- A payment declines mid-table — embarrassing for both parties
- They ring in the wrong modifier and the customer sends food back — affects their tip
- They work overtime without catching it and get a smaller net paycheck than expected

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Fast item entry with modifiers | REQ-POSR-001: Order Entry Engine |
| Split check assistance | REQ-POSR-005: Bill Split & Partial Payment |
| Shift tip total visibility | REQ-PAY-006: Tip Management — server-facing view |
| Same-night tip settlement to wallet | REQ-PAY-006 + REQ-WAL-005: Early Pay |
| Shift-end time clock confirmation | REQ-PAY-001: Time Clock |

### KPIs
- Average order entry time (seat to kitchen fire): < 90 seconds
- Tip settlement same-night adoption rate: ≥ 40% of tipped staff
- Order modification rate (sent-back items): < 2% of fired items

---

## ACT-T-005: Bartender
**Class:** External — Tenant Staff  
**Verticals:** POSR

### Who They Are
They manage open bar tabs (sometimes 15–25 simultaneously), pour drinks, handle cash and card payments, and close out tabs at shift end. Their nightmare: a tab that was never closed, a fraudulent card that went through, or a disputed round that management has to comp.

### Goals
- Open, modify, and transfer tabs instantly
- Know which tabs have been sitting idle for 45+ minutes (walk-off risk)
- Get a comp authorized without finding the manager

### Fears
- A customer walks out on an open tab (walk-off loss)
- A chargeback on a bar tab 30 days later with no receipt signature
- Misapplied comps they have to explain at end-of-night

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Open tab management | REQ-POSR-001: Order Engine — bar tab mode |
| Idle tab alert (>45 min no activity) | OPS-002: Tenant AI Ops — idle tab alert |
| Mobile comp authorization | REQ-POSR-003: Manager comp approval |
| Digital receipt with signature capture | REQ-POSR-001 + REQ-ORC-001 |

### KPIs
- Walk-off rate (open tabs never closed): < 0.1% of bar tabs opened
- Chargeback rate on bar tabs: < 0.15%

---

## ACT-T-006: Cook / Kitchen Staff
**Class:** External — Tenant Staff  
**Verticals:** POSR, POSG

### Who They Are
They interact with the Kitchen Display System (KDS) exclusively. They cannot hear the front-of-house and have no visibility into table status. They need to know: what to make, in what order, by when, and with what modifiers/allergies. Their speed determines table turn time. Their accuracy determines food-return rate.

### Goals
- See orders in the correct priority order (dine-in vs. pickup vs. delivery)
- Know dietary modifiers and allergy flags without hunting through a ticket
- Signal to the floor when they're behind without leaving the kitchen
- Not be surprised by a large online order 3 minutes before the ticket is due

### Fears
- A severe allergy order comes through without the allergy flag visible
- Online orders pile up without the front-of-house knowing the kitchen is overwhelmed
- A course fires at the wrong time because the server didn't communicate the table's pace

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Unified KDS with channel badges | AGG-003: Unified KDS View |
| Allergy flag at item level | REQ-POSR-001: Order Engine — modifier schema |
| Kitchen delay signal to floor | OPS-002: Tenant AI Ops — kitchen throughput |
| Online order scheduled visibility | AGG-001: Order Queue with scheduled time display |

### KPIs
- Allergy-related food recalls (wrong item sent): 0
- Average KDS ticket time vs. item prep-time SLA: ≤ 105% (within 5% of target)

---

## ACT-T-007: Cashier
**Class:** External — Tenant Staff  
**Verticals:** POSR, POSG, POS

### Who They Are
Process 100–300 transactions per day. Prefer their POS experience to be zero-friction, zero-ambiguity. The two moments that cause them the most stress: (1) a payment declines and they don't know why, and (2) a return requires a manager override but the manager is across the store.

### Goals
- Complete each transaction in < 30 seconds
- Understand why a card declined so they can communicate it professionally to the customer
- Get return/override approvals without stopping everything

### Fears
- A long queue builds while they wait for a manager to physically appear for an override
- A customer gets hostile over a misunderstood decline

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Detailed decline reason display | REQ-ORC-001: Normalized decline codes with plain-language mapping |
| Remote manager override | REQ-POS-008: RBAC — manager approval via mobile |
| EBT/WIC auto-qualification | REQ-POSG-004: EBT/WIC Integration |
| Gift card balance on scan | REQ-POS-004: Gift Cards — balance inquiry |

### KPIs
- Average checkout transaction time: < 45 seconds (card) / < 30 seconds (cash)
- Manager override wait time (cashier waiting for manager): target ≤ 2 minutes (mobile approval)

---

## ACT-T-008: In-House Delivery Driver
**Class:** External — Tenant Staff  
**Verticals:** POSR, ECO

### Who They Are
Employed directly by the restaurant/retailer (not DoorDash or UberEats). They pick up and deliver orders. Their biggest friction points: finding the right order, confirming delivery, and getting a customer signature or code confirmation.

### Goals
- Know exactly what they're picking up without asking the kitchen
- Confirm delivery without calling the customer
- Have their mileage and tips tracked for payroll

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Driver-facing order queue | AGG-004: Driver Order Queue View |
| Delivery confirmation via customer code | AGG-004 + ECO-006: Order status flow |
| Mileage tracking for payroll | REQ-PAY-001: Payroll inputs (delivery pay type) |

### KPIs
- Delivery order handoff errors (wrong order): < 0.2% of deliveries
- On-time delivery rate: ≥ 90%

---

## ACT-T-009: Grocery Store Owner / Chain Operator
**Class:** External — Tenant  
**Verticals:** POSG, PAY, MER

### Who They Are
Single-store IGA owner, or a 3–12-location regional grocery chain. They deal with: perishable inventory that spoils if not rotated, a complex tax environment (food tax exemptions vary by item type), EBT/WIC compliance, and a payroll that spans butchers, produce staff, cashiers, night stockers, and managers — all with different pay rates and schedules.

### Goals
- Never run out of a top-selling SKU during the week
- Know exactly what EBT transactions, cash transactions, and card transactions look like for their accountant
- Stay compliant with WIC program requirements without manual verification

### Fears
- An EBT/WIC transaction rung up incorrectly creates a state compliance violation
- Perishable shrinkage (expired product thrown away) erodes margin invisibly
- A tax audit reveals incorrect tax rates applied to product categories

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Department-level inventory alerts | REQ-POSG-006: Inventory Management |
| EBT / WIC compliance | REQ-POSG-004: Government Benefits Integration |
| Perishable expiry tracking | REQ-POSG-006: Perishable tracking flag |
| Tax category management | REQ-POSG-001: Checkout — product tax categories |

---

## ACT-T-010: Retail Store Owner / Chain Operator
**Class:** External — Tenant  
**Verticals:** POS, ECO, PAY, MER

### Who They Are
Clothing boutique, electronics store, beauty supply, gift shop — any product-based retailer outside of food. They compete with Amazon and big-box retail. Their survival depends on: personal service, local loyalty, and omnichannel convenience (walk in, buy online, pick up in store).

### Goals
- Know their bestselling SKUs in real time and reorder before they run out
- Drive online traffic to their store via SEO and AI shopping assistant
- Offer BOPIS so they can compete with same-day Amazon delivery
- Give loyal customers a reason to come back

### Fears
- Overselling an item online that's already out of stock in-store
- A competitor opens nearby and their loyal customers don't have a reason to stay

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Unified POS + e-commerce inventory | REQ-ECO-003 + REQ-POS-003: Real-time sync |
| BOPIS fulfillment queue | REQ-POS-009: BOPIS |
| Loyalty program | REQ-POS-005: Customer Loyalty |
| AI online shopping assistant | REQ-ECO-001: Storefront AI |

---

## ACT-T-011: Payroll Admin
**Class:** External — Tenant Staff  
**Verticals:** PAY, MER

### Who They Are
Either an employee at the merchant (HR/office manager) or an external payroll clerk doing it part-time. They run payroll every 1–2 weeks. Their nightmare: entering wrong hours, missing a new hire's W-4, or calculating tip credit incorrectly — any of which creates either an IRS penalty or an angry employee.

### Goals
- Receive hours from the time clock pre-populated — no manual entry
- Calculate gross-to-net automatically with correct withholdings
- File payroll taxes on time without a tax professional
- Approve and release payroll in < 30 minutes

### Fears
- IRS penalty for a late 941 deposit
- Employee calls HR because their paycheck is wrong
- A tipped employee's effective wage falls below minimum — a federal violation

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Time clock feed to payroll | REQ-PAY-001: Time & Attendance → REQ-PAY-002: Gross-to-net |
| Tax calculation + deposit schedule alerts | REQ-PAY-004: Tax Management |
| Tip credit calculation | REQ-PAY-006: Tip & Gratuity Management |
| W-2 / 1099-NEC generation | REQ-PAY-008: Year-End Tax |
| Early pay (employee advance) | REQ-PAY-007: Early Pay |

### KPIs
- Payroll run time (approval to ACH dispatch): ≤ 30 minutes
- Payroll error rate: 0 per pay period
- IRS penalty incidents: 0

---

## ACT-T-012: Employee (Non-Management)
**Class:** External — Tenant Staff  
**Verticals:** PAY, WAL

### Who They Are
The server, the dishwasher, the stock clerk, the barista. They don't have a bank account at a major bank in many cases. They live paycheck-to-paycheck and value: being paid correctly, on time, with visibility into their pay stub before payday. Early pay access is a major retention factor.

### Goals
- See their hours and projected pay in the wallet app during the week
- Get paid the moment their shift ends (early pay) — not wait until Friday
- Build savings without thinking about it (round-up or auto-save feature)
- Understand their W-2 in plain language at tax time

### Fears
- A payroll error that leaves them $200 short on rent week
- Not understanding why taxes withheld changed this paycheck
- Missing hours because a missed punch wasn't corrected

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Wallet app with balance + pay stub | REQ-WAL-001 + REQ-PAY-009: Employee reporting |
| Early pay on demand | REQ-PAY-007: Early Pay Access |
| Missed punch visibility + correction request | REQ-PAY-001: Time Clock — employee missed punch flag |
| W-2 delivery and plain-language explainer | REQ-PAY-008: Year-End Tax — employee distribution |

### KPIs
- Early pay adoption rate: ≥ 35% of eligible employees
- Paycheck dispute rate (employee contests their amount): < 0.5% per pay period

---

## ACT-T-013: Merchant Accountant / Bookkeeper
**Class:** External — Tenant (third-party service provider to tenant)  
**Verticals:** MER, PAY

### Who They Are
The most important *invisible* persona. They never touch the POS. They interact with PaySurity once a month via the portal. But they have enormous influence: if they tell the owner "this system's reports are a mess," the owner considers switching. If they say "this is the cleanest payment data I've ever worked with," the owner is retained.

### Goals
- Download a settlement report that maps directly to their chart of accounts
- Reconcile bank statement to PaySurity statement in < 30 minutes
- Understand what every fee is (interchange, assessment, PaySurity margin) — no mystery lump sums
- Have the 1099-K match what they filed before the IRS questions it

### Fears
- A chargeback reversal that doesn't appear in the settlement export
- Processing fees that don't match between the daily report and the monthly statement
- Missing a Q4 941 deposit deadline because the payroll system didn't alert

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| QuickBooks / Xero export templates | REQ-MER-013 (new): Accountant-Ready Reporting |
| Fee transparency per transaction | REQ-MER-008: Settlement batch report with itemized fees |
| Chargeback adjustments in settlement CSV | REQ-MER-008: Outcome in settlement report |
| 1099-K matching YTD report | REQ-COM-006: 1099-K reporting |
| 941 / payroll tax calendar | REQ-PAY-004: Tax deposit schedule |

### KPIs
- Monthly bank reconciliation time: target ≤ 30 minutes (vs. industry avg 2+ hours)
- Settlement-to-bank-statement discrepancy items: 0 per month (perfect reconciliation)
- Accountant NPS (annual survey): ≥ 40

---

---

# SECTION 2: EXTERNAL — END CONSUMER ACTORS

---

## ACT-C-001: Dine-In Restaurant Customer
**Class:** External — End Consumer  
**Verticals:** POSR, WAL

### Who They Are
They sit at a table, order food, expect prompt service, and want to pay quickly and leave. If they're a loyalty member, they expect recognition. If they're a first-timer, they expect easy payment. Their experience with the **payment moment** defines their last impression of the meal.

### Goals
- Split the check easily without an awkward math conversation
- Pay with whatever they have (card, wallet, phone) without the server making a face
- Get their loyalty points without downloading an app

### Fears
- Sitting at the table for 15 minutes after they're ready to leave, waiting for the check
- Being told their preferred payment method isn't accepted
- Having to explain a loyalty number to a confused cashier

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| QR code pay-at-table | REQ-POSR-005: Self-Pay at Table |
| Multi-tender split check | REQ-POSR-005: Bill Split |
| Loyalty via phone number at POS | REQ-POS-005: Loyalty — phone number lookup |
| Digital receipt to email/text | REQ-POSR-001 + REQ-POS-002 |

### KPIs
- Time from "check requested" to payment complete: target ≤ 4 minutes
- Loyalty enrollment capture rate at table: ≥ 25% (of non-enrolled customers)

---

## ACT-C-002: Online / AI-Ordering Consumer
**Class:** External — End Consumer  
**Verticals:** ECO, AI, WAL

### Who They Are
They order from their phone. They may be on the restaurant's microsite, a 3rd-party app, or texting the AI. They speak whatever language they speak. They expect the ordering experience to be as smooth as ordering an Uber. They do not tolerate friction — any extra step triggers cart abandonment.

### Goals
- Order in their language, get confirmation in their language
- Pay with what's already on their phone (Apple Pay, Google Pay, saved card)
- Know their order is in the kitchen — not "it might have gone through"
- Get their loyalty points even though they ordered online

### Fears
- Ordering something that's sold out — discovering it only when they arrive for pickup
- A payment that goes through twice (poor idempotency)
- Their order isn't at the restaurant because it "didn't come through"

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Multilingual AI assistant | REQ-AI-001 + REQ-AI-005 |
| Identity resolution (returning customer recognized) | REQ-AI-003 |
| Real-time menu availability | AGG-002: Menu Parity — OOS propagation |
| Hosted checkout (Apple Pay / Google Pay) | REQ-ORC-005 + REQ-ECO-004 |
| Order status notifications in their language | REQ-AI-005 + AGG-004 |
| Loyalty credit on online order | REQ-WAL-006 + REQ-AI-002 |

### KPIs
- AI-to-sale conversion rate: ≥ 35%
- Online order accuracy rate (customer received what they ordered): ≥ 99.5%
- Cart abandonment rate (AI-initiated): ≤ 40%

---

## ACT-C-003: Grocery Shopper
**Class:** External — End Consumer  
**Verticals:** POSG, WAL

### Who They Are
A household shopper — maybe a parent feeding a family of 5, an EBT/WIC recipient managing a food budget carefully, or a senior citizen who needs a readable receipt. They interact with the checkout experience — and increasingly with self-checkout kiosks.

### Goals
- Check out without long lines
- Know EBT-eligible items are auto-split correctly before the payment runs
- Get a receipt they can understand (itemized, clear)

### Fears
- EBT card gets declined because the cashier rang WIC items incorrectly
- Price at register doesn't match the shelf tag
- Long checkout line because the cashier doesn't know how to handle a split-tender EBT transaction

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| EBT/WIC auto-split tender | REQ-POSG-004: Government Benefits Integration |
| Price check on any item | REQ-POSG-001: Scan-and-lookup |
| Itemized digital receipt | REQ-POSG-001 + REQ-POS-002 |

---

## ACT-C-004: Retail / E-Commerce Shopper
**Class:** External — End Consumer  
**Verticals:** POS, ECO, WAL

### Who They Are
They shop in-store or online. They expect: inventory accuracy (don't show me it's available if it's not), fast checkout, and easy returns. They want BOPIS if it's the same price as in-store. They want loyalty points regardless of which channel they use.

### Goals
- Buy online, pick up in 2 hours
- Return an online purchase in-store without a hassle
- Get loyalty credit on every purchase, regardless of channel

### Fears
- "Sorry, that item shows in stock online but we don't have it here"
- Return rejected because they bought online and the store system doesn't see the order
- Loyalty points that don't work online

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Real-time cross-channel inventory | REQ-ECO-003 + REQ-POS-003 |
| BOPIS with confirmation code | REQ-POS-009 + AGG-004 |
| Cross-channel returns | REQ-POS-001: Returns linked to original transaction (any channel) |
| Cross-channel loyalty | REQ-POS-005 + REQ-WAL-006 |

---

---

# SECTION 3: EXTERNAL — PARTNER ACTORS

---

## ACT-P-001: Affiliate Partner
**Class:** External — Partner  
**Verticals:** AFR

### Who They Are
An independent sales agent, an accountant who refers clients, a business broker, a chamber of commerce — someone with relationships in the SMB merchant community who earns revenue-share commissions for referring merchants to PaySurity.

### Goals
- Refer merchants, see the commissions come in on a predictable schedule
- Know which referred merchants are active vs. stalled in onboarding
- Grow their portfolio to higher commission tiers

### Fears
- A merchant they referred goes through the funnel without being attributed to them
- Commission calculation is wrong and they don't have the data to dispute it
- PaySurity fails to onboard a referred merchant, damaging their relationship with them

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Referral attribution accuracy | REQ-AFR-008 + REQ-WEB-005 |
| Commission dashboard | REQ-AFR-005: Partner Portal |
| Payout on schedule | REQ-AFR-004: Payout disbursement |
| Dispute mechanism | REQ-AFR-010: Commission Dispute |

---

## ACT-P-002: Reseller Partner
**Class:** External — Partner  
**Verticals:** AFR, MER

### Who They Are
An ISO (Independent Sales Organization), a technology consulting firm, or a regional business services company that white-labels PaySurity as "their own" payments platform for their clients. They own the merchant relationship. PaySurity is invisible to the merchant.

### Goals
- Their clients (sub-merchants) see only Reseller branding — never PaySurity
- Set their own rates above the cost floor and earn the spread
- Onboard new sub-merchants without involving PaySurity support
- Have a clean, aggregated view of their entire portfolio's health

### Fears
- A sub-merchant discovers they're actually on PaySurity and cuts out the Reseller
- A rate configuration error that lets a sub-merchant's rate go below the floor (PaySurity eats the loss)
- Sub-merchant goes into high-risk status and Reseller isn't notified

### How PaySurity Serves Them
| Need | PaySurity Feature |
|---|---|
| Full white-label branding | REQ-AFR-006: White-Label Configuration |
| Sub-merchant management portal | REQ-AFR-007 |
| Rate configuration with floor enforcement | REQ-AFR-006 |
| Sub-merchant risk alerts | REQ-AFR-005: Portfolio alerts |

---

---

# SECTION 4: INTERNAL — PAYSURITY ACTORS

---

## ACT-I-001: PaySurity AI Operations Manager (Autonomous Agent)
**Class:** Internal — Autonomous System (with human escalation)  
**Verticals:** Cross-platform  
**Detail:** See OPS_MANAGEMENT.md, REQ-OPS-001

### Role
Continuous autonomous monitoring of the entire PaySurity platform. Acts within defined authority. Escalates to humans at defined thresholds. Learns from every escalation outcome.

---

## ACT-I-002: PaySurity Support Engineer
**Class:** Internal — PaySurity Staff  
**Verticals:** All

### Who They Are
They receive escalated alerts from the AI Ops Manager and handle: terminal issues, payment processing failures, merchant escalations, and remote troubleshooting.

### Goals
- Resolve a terminal issue remotely without a field visit
- Answer a merchant's "where is my batch?" question in under 5 minutes using X-Trace-Id lookup
- Push a firmware update without disrupting service hours

### How PaySurity Equips Them
| Need | Feature |
|---|---|
| Remote terminal diagnostics | REQ-DEV-003: Remote Diagnostics |
| X-Trace-Id transaction lookup | REQ-ORC-012: Observability |
| Remote firmware push | REQ-DEV-002: Remote Update Lifecycle |
| AI Ops escalation context | REQ-OPS-001: AI Ops escalation payload includes full context |

### KPIs
- First-call resolution rate: ≥ 80%
- Mean time to resolve (terminal offline): ≤ 2 hours
- Remote fix rate (vs. field dispatch): ≥ 85%

---

## ACT-I-003: PaySurity Underwriter
**Class:** Internal — PaySurity Staff  
**Verticals:** MER, COM

### Who They Are
Reviews merchant applications that didn't pass Fast-Track. They apply risk scoring, review KYB/KYC outputs, and make approval/decline decisions. They interact with the underwriting queue daily.

### Goals
- Clear their queue in < 4 hours per day
- Have all the information they need at their fingertips (not hunting through emails)
- Make consistent decisions (not subjective)

### How PaySurity Equips Them
| Need | Feature |
|---|---|
| Structured underwriting queue | REQ-MER-003: Automated & Manual Underwriting |
| KYB evidence pre-loaded | REQ-COM-002: KYB |
| Risk signal summary | REQ-MER-003: Risk signal dashboard |
| Document request in-app | REQ-MER-003: In-app document request |

### KPIs
- Manual review turnaround: ≤ 2 business days
- Decline decision accuracy (no successful appeals): ≥ 90%

---

## ACT-I-004: PaySurity Compliance Officer
**Class:** Internal — PaySurity Staff  
**Verticals:** COM, WAL, PAY

### Who They Are
Manages AML case queue, reviews AI-drafted SAR pre-filings, handles DSAR requests, maintains regulatory evidence archive, and coordinates with the banking partner on any compliance matter.

### Goals
- Clear the AML case queue daily without missing the 30-day SAR window
- Handle a DSAR request in < 30 days every time
- Produce clean regulatory evidence for any examination with < 2 hours of effort

### How PaySurity Equips Them
| Need | Feature |
|---|---|
| AML case management | REQ-COM-003: AML monitoring + case queue |
| SAR pre-file generation | REQ-COM-003: SAR filing capability |
| DSAR management | REQ-COM-007: Data subject rights |
| Audit trail query | REQ-COM-010: Immutable audit trail |

### KPIs
- SAR filing on-time rate: 100%
- DSAR response within 30 days: 100%
- Compliance examination findings: 0 critical per cycle

---

## ACT-I-005: PaySurity Finance Admin
**Class:** Internal — PaySurity Staff  
**Verticals:** MER, ORC, PAY

### Who They Are
Responsible for: ensuring daily settlement reconciliation is clean, resolving any gaps, overseeing 1099-K and 1099-NEC generation, and maintaining the financial integrity of the platform's ledger.

### Goals
- Zero unresolved reconciliation items after 24 hours
- 1099-K and 1099-NEC filed on time every January
- Any fee calculation error identified and corrected before the merchant notices

### How PaySurity Equips Them
| Need | Feature |
|---|---|
| Nightly reconciliation report | REQ-ORC-007: Reconciliation |
| Fee calculation audit | REQ-ORC-008: Merchant fee calculation |
| 1099-K generation | REQ-COM-006 |
| Escalation from AI Ops for gaps | REQ-OPS-001: AI Ops escalation — finance |

### KPIs
- Reconciliation match rate: ≥ 99.99%
- 1099-K on-time delivery: 100%
- Fee error incidents identified before merchant notice: ≥ 95%

---

## Summary: Actor × Feature Traceability

| Actor | Primary Canonical Files |
|---|---|
| Restaurant Owner | POSR, PAY, MER, WAL, OPS, AGG |
| District Manager | MER, OPS, AI |
| General Manager | POSR, PAY, MOB, OPS |
| Server/Waiter | POSR, PAY, WAL |
| Bartender | POSR, OPS |
| Cook/KDS | POSR, AGG, OPS |
| Cashier | POSR, POSG, POS, ORC |
| Delivery Driver (in-house) | AGG, PAY |
| Grocery Owner | POSG, PAY, COM |
| Retail Owner | POS, ECO, MER |
| Payroll Admin | PAY, COM |
| Employee | PAY, WAL, MOB |
| Accountant/Bookkeeper | MER (REQ-MER-013), PAY, COM |
| Franchise Operator | POSR, MER, OPS |
| Dine-In Consumer | POSR, WAL |
| Online/AI Consumer | ECO, AI, WAL, AGG |
| Grocery Consumer | POSG, WAL |
| Retail Consumer | POS, ECO, WAL |
| Affiliate Partner | AFR |
| Reseller Partner | AFR, MER |
| PaySurity AI Ops Agent | OPS |
| Support Engineer | OPS, ORC, DEV |
| Underwriter | MER, COM |
| Compliance Officer | COM, WAL |
| Finance Admin | MER, ORC, COM |
