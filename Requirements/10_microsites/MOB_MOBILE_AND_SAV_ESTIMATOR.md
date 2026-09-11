# Canonical Requirements: Mobile Platform & Savings Estimator

---

# Part 1: Mobile Applications (MOB)
**Vertical:** Mobile Applications (MOB)  
**Version:** v2.0-canonical  
**Date:** 2026-03-12  
**Source Docs:** 17_MOBILE.md, 90_CROSSCUTTING_INVARIANTS.md  
**Total MOB Canonical Requirements:** 6 | **Deduplication Ratio:** 14 → 6 (57%)

---

## Business Context
Mobile presence is not optional in the SMB payments space — 70%+ of merchants check their business metrics from their phone. PaySurity's mobile strategy is PWA-first (avoiding app store review delays and mandatory 30% app store fee for in-app purchases), with native app capabilities (push notifications, NFC, biometric) layered on top for features that require them.

Consumer wallet users are exclusively mobile-first: they expect instant balance visibility, biometric authentication, and real-time payment confirmations. This audience is similar to Venmo and Cash App users — the bar for UX is set by consumer fintech leaders.

**Mobile Product Strategy:**
| App | Primary Audience | Delivery Method |
|---|---|---|
| Consumer Wallet App | Wallet holders | PWA + iOS/Android native |
| Merchant Manager App | Merchant owners + branch managers | PWA (mobile-responsive web) |
| Tap-to-Phone | Micro-merchants, pop-up retail | Android native (NFC) |

---

## Capability Groups
| Group | Requirements |
|---|---|
| Consumer Wallet App | REQ-MOB-001, REQ-MOB-004, REQ-MOB-005 |
| Merchant Mobile Dashboard | REQ-MOB-003 |
| Platform & Device Features | REQ-MOB-002, REQ-MOB-006 |

---

### REQ-MOB-001: Consumer Wallet Mobile App (iOS/Android/PWA)
**Capability Group:** Consumer Wallet App | **Priority:** Must  
**Source Refs:** PSR-V6-03700, PSR-V6-03701  
**Actors:** Wallet User | Parent/Guardian  
**Type:** functional

**Business Value:** The consumer wallet app is the primary engagement surface between PaySurity and the end consumer. Wallet users who open the app daily are 3× more likely to increase their balance and use the wallet for additional payment categories. Biometric authentication is a trust signal — it feels secure. Push notification for every transaction creates real-time awareness and catches unauthorized transactions immediately. WCAG 2.1 AA compliance opens the wallet to consumers with disabilities and is increasingly required by enterprise employers who offer the wallet as a payroll benefit.

**Requirement:**
The system SHALL provide consumer wallet management via both a Progressive Web App (PWA) and native mobile apps (iOS and Android) published to the App Store and Google Play. Core capabilities: balance overview by sub-wallet, transaction history, fund transfers, external bank account linking, QR/NFC payments, loyalty points summary, and parental spending controls.

**Key Acceptance Criteria:**
- Native apps: iOS (minimum supported: iOS 16+) and Android (minimum: Android 10) native apps published and maintained on respective stores.
- PWA: installable from Chrome and Safari; offline fallback page displayed with cached balance when network unavailable; service worker caches last 10 transactions.
- Biometric authentication: Face ID / Touch ID (iOS), Android biometric API — used for app unlock and transaction confirmation; graceful fallback to PIN.
- Push notifications: all transaction events (credit, debit, P2P received, dispute update) deliver push notification within 30 seconds of event.
- Accessibility: WCAG 2.1 Level AA compliance verified by automated accessibility scanner (e.g., Axe) and annual manual review.
- Design standards: follows Material Design 3 (Android) and Apple HIG (iOS) conventions; no non-standard UI patterns that create cognitive friction.

**Success Metrics (CMO/COO):**
- Wallet app daily active user rate: ≥ 35% of registered wallet users
- App store rating: ≥ 4.3/5.0 (iOS) and ≥ 4.3/5.0 (Android)
- Push notification opt-in rate: ≥ 70% of consumer wallet users

**Cross-Vertical Dependencies:** Digital Wallets

---

### REQ-MOB-002: Tap-to-Phone Payment (Merchant NFC Acceptance)
**Capability Group:** Platform & Device Features | **Priority:** Should  
**Source Refs:** PSR-V6-03705  
**Actors:** Merchant | Customer  
**Type:** functional

**Business Value:** Tap-to-Phone eliminates the hardware terminal acquisition barrier for merchants that operate at events, pop-up locations, or small services businesses. A merchant with only a smartphone can accept contactless card payments from day one — no waiting for terminal delivery. This expands the PaySurity serviceable market to micro-merchants and pop-up retail, a segment where Square currently dominates.

**Requirement:**
The PaySurity merchant mobile app SHALL support Tap-to-Phone (COTS — Commercial Off The Shelf software approach) allowing an NFC-enabled Android device to accept contactless card-present payments without dedicated payment terminal hardware. Tap-to-Phone implementation SHALL be certified per applicable card network requirements before production launch.

**Key Acceptance Criteria:**
- Supported devices: NFC-enabled Android 10+ smartphones; device capability check at launch with clear error if incompatible.
- Card network certification: Visa COTS program and Mastercard TapOnPhone certification completed before production launch.
- Payment flow: customer taps card to the back of the merchant's device; confirmation displayed within 5 seconds of tap; digital receipt sent to customer automatically.
- Transaction routing: Tap-to-Phone transactions route through identical Payment Orchestration pipeline as hardware terminal transactions; no separate settlement path.
- PCI scope: Tap-to-Phone implementation meets applicable PCI SPoC (Software-based PIN on COTS) or CPOC (Contactless Payments on COTS) standard.

**Success Metrics (COO/CMO):**
- Tap-to-Phone activation rate among eligible merchants (micro/pop-up): ≥ 40%
- Tap-to-Phone payment success rate: ≥ 99%
- Card network certification completed before Phase 2 launch: 100%

**Cross-Vertical Dependencies:** Payment Orchestration

---

### REQ-MOB-003: Merchant Mobile Dashboard
**Capability Group:** Merchant Mobile Dashboard | **Priority:** Must  
**Source Refs:** PSR-V6-03710, PSR-V6-03711  
**Actors:** Merchant Owner | Branch Manager  
**Type:** functional

**Business Value:** A merchant who can check today's sales while they're at the bank or the farmer's market is a satisfied merchant. Real-time mobile visibility into sales, staff clocking, and alerts is a direct retention driver — merchants who use the mobile dashboard have 45% lower 6-month churn (benchmark vs. PaySurity's target industry). Same RBAC enforcement as the web portal is non-negotiable: a Branch Manager who can see another location's revenue is a data governance failure.

**Requirement:**
The PaySurity Merchant Portal SHALL be fully responsive and deliver a mobile-optimized dashboard experience to merchants accessing it from a smartphone browser, without requiring installation. Features: real-time sales metrics, transaction feed, staff time clock management, and push alerts — all scoped to the authenticated user's RBAC role.

**Key Acceptance Criteria:**
- Real-time metrics on mobile home screen: today's gross sales, transaction count, average ticket, and most recent transaction — refreshed without full page reload via live data.
- Transaction feed on mobile: filterable by date, status, and channel; pull-to-refresh supported; infinite scroll for historical data.
- Staff clock management: manager can view clocked-in staff list, initiate missed-punch correction, and approve timesheets from mobile.
- Mobile push alerts: new chargeback received, large transaction above threshold, declined auth rate spike — all configurable and delivered as mobile push notifications via PWA or browser notification API.
- RBAC enforcement: Branch Manager authenticated on mobile sees only their location data; identical scope enforcement as web session.
- Responsive design: all merchant portal pages render correctly at 375px (iPhone SE) through 428px (iPhone Pro Max) viewports without horizontal scrolling.

**Success Metrics (CMO/COO):**
- Mobile Merchant Portal active usage: ≥ 50% of active merchants access from mobile at least once per week
- Mobile dashboard load time to interactive (P95): < 3 seconds on LTE connection
- Push alert opt-in rate (merchant portal): ≥ 60%

**Cross-Vertical Dependencies:** Merchant Services | Payroll

---

### REQ-MOB-004: AI-Driven Personalized Push Notifications
**Capability Group:** Consumer Wallet App | **Priority:** Should  
**Source Refs:** PSR-V6-03715  
**Actors:** Wallet User  
**Type:** functional

**Business Value:** Personalized push notifications that trigger on meaningful spend events ("You're at 80% of your dining budget") are the highest-ROI behavioral engagement tool in consumer fintech. They create a habit of checking the wallet, increase the user's awareness of their own spending, and establish PaySurity as a proactive financial partner vs. just a payment method. This directly increases monthly active usage rates.

**Requirement:**
The consumer wallet app SHALL deliver AI-driven personalized push notifications triggered by the user's own spending patterns and configured budget limits. All notifications SHALL be actionable — deep-linking directly to the relevant in-app screen. Marketing push notifications SHALL require TCPA-compliant opt-in separate from transactional notification consent.

**Key Acceptance Criteria:**
- User-configurable notification triggers: budget threshold (configurable % of category budget), unusual merchant category (first-time spend in a category), low balance (configurable threshold), large transaction above configurable threshold.
- AI personalization: baseline triggers configured by user; system learns the user's typical spending velocity per category and adjusts sensitivity over 30-day lookback.
- Deep-link: notification tapped → opens specific in-app screen (e.g., budget category detail, transaction detail, alerts settings).
- Granular mute: user can mute specific notification types independently, without disabling all alerts.
- Marketing separation: marketing/promotional push notifications (e.g., "Earn 2× points this weekend") require separate explicit opt-in; disabled by default; governed by TCPA opt-in record.

**Success Metrics (CMO/COO):**
- Push notification open rate (transactional): ≥ 40%
- Budget-triggered notification action rate (user adjusts budget or reviews spend after alert): ≥ 20%
- Notification opt-out rate within 30 days of activation: < 15%

**Cross-Vertical Dependencies:** Digital Wallets

---

### REQ-MOB-005: AI Budgeting & Spend Insights
**Capability Group:** Consumer Wallet App | **Priority:** Should  
**Source Refs:** PSR-V6-03720  
**Actors:** Wallet User  
**Type:** functional

**Business Value:** Spend insights transform PaySurity's consumer wallet from a "pay and move on" tool into a financial wellness partner. Users who actively use budgeting features have 2× higher wallet balance averages and 60% higher monthly transaction volume (analogous fintech data from Chime, Dave). The AI category tagging eliminates the manual expense categorization that causes most users to abandon budget apps.

**Requirement:**
The consumer wallet app SHALL automatically categorize transactions by merchant type (using MCC codes and merchant name NLP) and provide AI-generated spending insights: month-over-month trends by category, budget progress, and plain-language insight cards generated by the AI based on the user's 90-day spending patterns.

**Key Acceptance Criteria:**
- Category auto-tagging: transactions automatically tagged to top-level categories (Dining, Groceries, Entertainment, Transportation, Shopping, Healthcare, Other) using MCC code; user can override any auto-tag.
- Visualizations: bar chart of spending by category (current month); trend line comparing current month vs. prior 2 months; updated within 60 seconds of any new transaction.
- Budget configuration: user sets monthly budget per category; progress bar visible on category detail screen.
- AI insight cards: plain-language cards generated weekly (e.g., "You've spent 40% more on dining than last month. Your top restaurant was Il Cielo."); minimum 1 insight card per category that crosses 20% of monthly budget.
- User data privacy: spending analysis runs on server-side aggregated data only; individual transaction data never used for third-party advertising targeting.

**Success Metrics (CMO/COO):**
- Budget feature adoption rate: ≥ 25% of wallet users configure at least 1 budget category
- Insight card click-through rate (user expands insight to see detail): ≥ 30%
- Wallet balance and transaction volume for budgeting users vs. non-budgeting users: tracked as North Star metric

**Cross-Vertical Dependencies:** Digital Wallets

---

### REQ-MOB-006: Offline Capability & Data Sync
**Capability Group:** Platform & Device Features | **Priority:** Must  
**Source Refs:** 90_CROSSCUTTING_INVARIANTS, Invariant 11  
**Actors:** Wallet User | Merchant  
**Type:** nonfunctional/ops

**Business Value:** Network connectivity is unreliable — restaurant service areas, event venues, and retail back rooms all have dead zones. A consumer wallet app that shows a blank screen when offline has failed its user at the worst possible moment. A merchant time clock app that loses clock-in data on a network glitch creates a payroll correction cycle. Graceful offline degradation with automatic sync converts a potentially catastrophic data loss event into a minor inconvenience.

**Requirement:**
Both the consumer wallet app and merchant mobile interfaces SHALL degrade gracefully when offline, displaying the last-synced cached data with a visible "offline" indicator. All write operations initiated offline (time clock entries, form submissions, scan events) SHALL be queued locally and synchronized automatically when network connectivity is restored, with no data loss.

**Key Acceptance Criteria:**
- Consumer wallet offline: last-known balance and most recent 10 transactions served from local cache; "Last updated: [timestamp]" indicator displayed; no write operations permitted offline (payments, transfers blocked with "offline — cannot process" explanation).
- Merchant dashboard offline: last-synced sales summary and transaction list served from cache; "offline" indicator in header; clock-in/out entries queued locally.
- Queue persistence: offline queue for write operations persists across app restarts (stored in local device storage); no entries lost if app is force-closed while offline.
- Sync on restore: within 10 seconds of network restoration, queued operations sync to server; sync completion confirmed to user.
- Conflict resolution: if a cached record conflicts with server state on sync (e.g., balance changed server-side while offline), server state wins and cache is updated with local timestamp.

**Success Metrics (COO):**
- Offline queue data loss incidents (entries not synced after reconnection): 0
- Sync completion time after connectivity restore (P99): ≤ 10 seconds
- User-reported "app went blank when offline" complaints: 0

**Cross-Vertical Dependencies:** None

---

---

# Part 2: Savings Estimator (SAV)
**Vertical:** Merchant Savings Estimator Tool (SAV)  
**Version:** v2.0-canonical  
**Date:** 2026-03-12  
**Source Docs:** 06_MERCHANT_SAVINGS_ESTIMATOR_SAV.md  
**Total SAV Canonical Requirements:** 5 | **Deduplication Ratio:** 40 → 5 (88%)

---

## Business Context
The Savings Estimator is PaySurity's highest-impact lead qualification tool. Unlike a generic contact form, it creates a personalized, quantified value proposition before the prospect even speaks to a salesperson. A prospect who sees "$38,400/year in potential savings" is emotionally invested in the outcome — their first conversation with a PaySurity sales rep starts from a position of established value, not cold discovery.

The estimator is also a distribution asset: by making it embeddable as a widget on Reseller partner sites, PaySurity turns every Reseller into a lead-generation machine without additional marketing spend.

---

### REQ-SAV-001: Statement Upload & AI-Powered OCR Extraction
**Capability Group:** Statement Processing | **Priority:** Must  
**Source Refs:** PSR-V6-03800, PSR-V6-03801  
**Actors:** Prospect Merchant  
**Type:** functional

**Business Value:** Most merchants don't know their effective rate — they know their processor name and they know they "pay a lot." Statement upload with AI extraction meets the prospect where they are: "just upload your last statement." Auto-extraction of the effective rate, volume, and fee structure eliminates the manual data entry step that causes 60% of calculator sessions to be abandoned (fintech conversion data).

**Requirement:**
The estimator SHALL allow merchants to upload their current processing statement (PDF or image) for automated field extraction via AI/OCR. Extracted fields SHALL be displayed for user confirmation before analysis. Manual data entry SHALL be supported as a fallback for each extracted field.

**Key Acceptance Criteria:**
- Accepted formats: PDF, JPG, PNG, HEIC; maximum 10MB per upload.
- OCR extraction SLA: field extraction completes and is displayed to user within 15 seconds of upload for ≥ 90% of submissions.
- Fields extracted: monthly processing volume, effective rate (blended), per-transaction fee, monthly fee total, and processor name (for CRM context).
- Confidence display: low-confidence extracted fields highlighted with a prompt for user confirmation; any field can be overridden by manual entry.
- Statement file privacy: uploaded file deleted from server storage within 24 hours of session end (regardless of whether the session converted) — deletion confirmed by automated purge job log.

**Success Metrics (CMO/COO):**
- OCR extraction accuracy (correct rate extracted, user did not override): ≥ 80% of uploads
- Session completion rate when statement uploaded vs. manual entry only: benchmark tracked to validate OCR impact on conversion
- Statement deletion compliance (24-hour purge): 100%

**Cross-Vertical Dependencies:** None

---

### REQ-SAV-002: Savings Calculation Engine
**Capability Group:** Savings Analysis | **Priority:** Must  
**Source Refs:** PSR-V6-03805, PSR-V6-03806  
**Actors:** System | Prospect Merchant  
**Type:** functional

**Business Value:** Calculation credibility = lead quality. If the savings estimate is obviously too high, the prospect dismisses it as marketing hype. If it's close to accurate (based on realistic interchange models), the prospect arrives at the sales call ready to discuss their specific deal. The methodology footnote is also a legal protection — it documents that savings are "estimated" and based on stated inputs.

**Requirement:**
The system SHALL compute a side-by-side comparison of the prospect's estimated current processing costs vs. projected costs with PaySurity's applicable pricing model (Interchange+, Flat Rate). Business type and volume tier SHALL determine which pricing model is applied. Results SHALL show monthly and annual savings in both dollar and percentage.

**Key Acceptance Criteria:**
- Calculation inputs: monthly volume, average ticket, card mix (if available from OCR or estimate), current effective rate, business type.
- PaySurity projected cost: computed from the applicable pricing model for the prospect's volume tier and business type; pricing model reference kept current as pricing changes.
- Result display: Current Monthly Cost, PaySurity Projected Monthly Cost, Monthly Savings ($), Annual Savings ($), Percentage Savings — all displayed clearly with a methodology footnote and "Results are estimates based on stated inputs" disclaimer.
- Edge case handling: if inputs produce a result where PaySurity estimated cost is higher, display "Your current rate is competitive — let's talk about other ways we can help" with a CTA to book a consultation.
- Calculation audit: inputs and outputs logged (anonymously, pre-lead-capture) for marketing effectiveness measurement.

**Success Metrics (CMO/CFO):**
- Calculation result display-to-email-gate conversion rate: ≥ 25%
- Calculation accuracy (post-sale comparison of estimate vs. actual first month charges): within ±15% for ≥ 80% of new merchants
- "More expensive" edge case rate (PaySurity shows no savings): < 10% of calculations (signals correct prospect targeting)

**Cross-Vertical Dependencies:** None

---

### REQ-SAV-003: Results Gating & Lead Capture
**Capability Group:** Lead Capture | **Priority:** Must  
**Source Refs:** PSR-V6-03810  
**Actors:** Prospect Merchant | Sales Team  
**Type:** functional

**Business Value:** The email gate is the value exchange: prospect gets personalized savings analysis (high perceived value), PaySurity gets a qualified lead with all the sales-relevant context attached. The PDF report that delivers the analysis is the prospect's take-away — they share it with their accountant or partner, creating additional downstream conversion. The CRM auto-population with all calculator inputs eliminates the discovery call question "so, what are you currently paying?" — the sales rep already knows.

**Requirement:**
Savings calculator results SHALL be gated behind a lead capture form (email + first name minimum). After form submission, the full results are displayed on-screen and a personalized PDF report emailed to the prospect within 2 minutes. A CRM record is simultaneously created with all lead data and calculator inputs.

**Key Acceptance Criteria:**
- Gate form: email and first name required; phone optional; consent checkbox (unchecked, compliant disclosure).
- Results reveal: full on-screen results display immediately after form submission — no redirect, no wait.
- PDF report: auto-generated with PaySurity branding, prospect's inputs, calculated results, methodology footnote, and a "Next Step: Apply Now" CTA with direct link to onboarding wizard; emailed within 2 minutes.
- CRM record: created on form submission with: first name, email, phone (if captured), monthly volume estimate, effective rate, business type, calculator savings estimate, source page, UTM attribution, and Reseller partner ID (if embedded).
- Duplicate: if email already in CRM, update the existing record with new calculator data rather than creating a duplicate.
- GDPR/CCPA: consent to marketing communications is opt-in, unchecked by default; form submission alone does not constitute consent to marketing.

**Success Metrics (CMO/Sales):**
- PDF report delivery within 2 minutes: ≥ 99%
- Calculator lead-to-sales-conversation rate: ≥ 30% (vs. 10% for generic contact form)
- Lead capture form completion rate (saw gate → submitted form): ≥ 25%

**Cross-Vertical Dependencies:** Public Website (CRM integration)

---

### REQ-SAV-004: Embeddable Widget for Partner/Reseller Sites
**Capability Group:** Distribution | **Priority:** Should  
**Source Refs:** PSR-V6-03815  
**Actors:** Reseller | Prospect Merchant  
**Type:** functional

**Business Value:** Making the calculator embeddable on Reseller sites turns every active Reseller into a lead-generation hotspot — as their own prospects use the estimator, leads are automatically attributed back to that Reseller and entered into PaySurity's sales pipeline. This is a zero-additional-CAC lead amplification strategy that benefits both Reseller (better conversion on their own site) and PaySurity (qualified leads with Reseller attribution).

**Requirement:**
The savings estimator SHOULD be embeddable as an iFrame or JavaScript widget on Reseller partner sites, with the Reseller's brand colors and logo applied. Leads captured through embedded widgets SHALL be automatically attributed to the Reseller's partner account in the CRM.

**Key Acceptance Criteria:**
- Embed code: JavaScript snippet or iFrame URL with configurable parameters (reseller_id, primary_color, logo_url); Reseller retrieves from their partner portal.
- Branding: primary color, secondary color, and Reseller logo applied to widget header and CTA buttons; PaySurity attribution footnote displayed per white-label agreement terms.
- Attribution: leads captured via embedded widget have the Reseller's partner ID written to the CRM record and eligibility evaluated for referral commission (per REQ-AFR-008 trigger conditions).
- Responsive: widget renders correctly at 320px minimum width through full desktop width.
- Privacy isolation: embedded widget operates in a privacy-compliant iframe; no cookies set on the parent Reseller site's domain without visitor consent.

**Success Metrics (CMO/COO):**
- Reseller embed adoption rate: ≥ 30% of active Reseller partners deploy the widget within 60 days of availability
- Widget-attributed leads per active Reseller per month: ≥ 5 (target indicating meaningful lead flow)
- Widget-to-lead capture rate: ≥ 20% of widget sessions that reach the gate

**Cross-Vertical Dependencies:** Affiliates/Resellers (attribution)

---

### REQ-SAV-005: Analytics & Conversion Funnel Reporting
**Capability Group:** Analytics | **Priority:** Must  
**Source Refs:** PSR-V6-03820  
**Actors:** Marketing Admin  
**Type:** functional

**Business Value:** The savings estimator's conversion funnel is the clearest view of where prospect drop-off occurs between interest and lead capture. Without funnel analytics, improving conversion is guesswork. A/B testing the gate position (before or after seeing partial results) is known to have 15–30% impact on lead capture rates — data that only funnel tracking enables.

**Requirement:**
The system SHALL track the full estimator usage funnel (page visit → tool start → OCR/manual entry → results computed → gate displayed → email submitted → CTA clicked) and make conversion rates at each step reportable in the marketing analytics dashboard.

**Key Acceptance Criteria:**
- Funnel events tracked via GTM dataLayer pushes: `estimator_page_view`, `estimator_started`, `statement_uploaded`, `results_computed`, `gate_displayed`, `lead_captured`, `apply_now_clicked`.
- Conversion rates at each funnel stage visible in GA4 funnel exploration report.
- A/B testing: GTM-driven variant assignment for CTA text ("See My Savings" vs. "Calculate Now") and gate timing (before/after partial results preview); test results require minimum 95% statistical confidence + 100 sessions per variant before declaring winner.
- Weekly automated report: estimator sessions by source, funnel conversion rates, leads captured, A/B test status — emailed to Marketing Admin every Monday.
- Reseller widget analytics: separate funnel views per Reseller embed (filtered by reseller_id parameter) available to Super Admin and the specific Reseller in their portal.

**Success Metrics (CMO):**
- Top-of-funnel-to-lead conversion rate (page view → email submitted): ≥ 5%
- A/B test cycle velocity: ≥ 1 test concluded per month during active optimization phase
- Marketing Admin weekly report open rate: tracked as an indicator of dashboard relevance
