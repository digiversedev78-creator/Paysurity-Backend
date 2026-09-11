# Canonical Requirements: Public Website (paysurity.com)
**Vertical:** Public Marketing Website (WEB)  
**Version:** v2.0-canonical  
**Date:** 2026-03-12  
**Source Docs:** 03_PUBLIC_WEBSITE_COM.md, 90_CROSSCUTTING_INVARIANTS.md  
**Total Canonical Requirements:** 9 | **Deduplication Ratio:** 92 → 9 (90%)

---

## Business Context
The PaySurity public website (paysurity.com) is the primary top-of-funnel asset. It is the first impression for every prospect merchant, every potential affiliate, every investor, and every job candidate. Its performance determines how much organic traffic PaySurity can capture vs. spending on paid ads — a direct CFO concern. Its conversion rate (visitor → merchant application) determines the cost-per-merchant-acquired — the CEO's growth lever.

**Marketing Position:** The site must communicate PaySurity's "one platform" value proposition — no separate POS, payroll, wallets, or e-commerce vendors — and route every prospect efficiently into the appropriate product onboarding funnel.

**Conversion Funnel:**
```
Organic/Paid Traffic → Landing Page → Calculator / AI Assistant → Lead Capture → "Apply Now" → Onboarding Wizard
```

**Success KPIs (Owned by CMO):**
| Metric | Target |
|---|---|
| Organic traffic growth (MoM) | ≥ 5% |
| Lead capture rate (visitors → lead form submitted) | ≥ 3% |
| Apply Now conversion rate (lead → application started) | ≥ 20% |
| Core Web Vitals (LCP) | < 2.5 seconds |

---

## Capability Groups
| Group | Requirements |
|---|---|
| Site Structure & SEO | REQ-WEB-001 |
| Vertical Landing Pages | REQ-WEB-002 |
| Lead Capture & CRM | REQ-WEB-003, REQ-WEB-006 |
| AI Content & Blog | REQ-WEB-004, REQ-WEB-007 |
| Marketing & Attribution | REQ-WEB-005, REQ-WEB-008, REQ-WEB-009 |

---

### REQ-WEB-001: Core Site Structure & SEO Baseline
**Capability Group:** Site Structure & SEO | **Priority:** Must  
**Source Refs:** PSR-V6-03550, PSR-V6-03551  
**Actors:** Anonymous Visitor | SEO System  
**Type:** functional

**Business Value:** SEO is PaySurity's highest-ROI marketing channel at scale — organic traffic converts at 2–3× paid traffic with near-zero marginal cost per visitor. A site without an auto-generated sitemap, correct canonical URLs, or JSON-LD structured data is invisible to Google's indexing systems. Core Web Vitals directly affect Google's page ranking algorithm. Getting these right from day 1 compounds into a long-term traffic asset.

**Requirement:**
The website SHALL include all core marketing pages (Home, Merchant Services, Digital Wallets, Payroll, all POS vertical pages, About, Contact, Legal/Privacy) with a full SEO baseline: unique title tags, unique meta descriptions, canonical URLs, JSON-LD structured data (schema.org/Organization on Home), and auto-generated sitemaps submitted to major search engines.

**Key Acceptance Criteria:**
- Auto-generated sitemap.xml: includes all published pages; updated within 5 minutes of any content publish; referenced in robots.txt.
- Every page: unique title tag (max 60 characters) and unique meta description (max 160 characters) — no duplicate meta across pages.
- JSON-LD structured data: Organization schema on homepage; WebSite schema with sitelinks search box; Article schema on blog posts.
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms — measured monthly via Google PageSpeed Insights API.
- robots.txt: correctly configured for all environments — staging and dev environments use `Disallow: /` to prevent indexing.
- All images: lazy-loaded, served via CDN, with descriptive alt text.

**Success Metrics (CMO/COO):**
- Google Search Console indexing coverage: ≥ 95% of pages indexed
- Core Web Vitals pass rate (LCP, CLS, INP): 100% of pages
- Organic traffic growth MoM: ≥ 5% after initial indexing period (months 3+)

---

### REQ-WEB-002: Vertical-Specific Landing Pages
**Capability Group:** Vertical Landing Pages | **Priority:** Must  
**Source Refs:** PSR-V6-03555, PSR-V6-03556  
**Actors:** Prospect Merchant | Anonymous Visitor  
**Type:** functional

**Business Value:** Vertical-specific landing pages are the conversion workhorses — a restaurant owner searching "best restaurant POS software" must land on a page that speaks directly to their problem, not a generic "business payments" homepage. Dedicated vertical URLs also unlock the ability to run vertical-specific PPC campaigns with Quality Score optimization. The "Apply Now" CTA with vertical pre-selected removes one more decision point from the prospect's path.

**Requirement:**
Each PaySurity product vertical (BistroBeest, GrocerEase, RetailPro, Digital Wallets, Payroll, Affiliates, E-Commerce) SHALL have a dedicated, search-engine-indexable landing page with tailored vertical-specific messaging, feature highlights, a pricing overview, social proof (testimonials), and a clear "Apply Now" CTA that routes into the merchant onboarding wizard with the vertical pre-selected.

**Key Acceptance Criteria:**
- Dedicated URL per vertical (e.g., /restaurant, /grocery, /retail, /digital-wallets, /payroll, /affiliates).
- Each page: unique title tag and meta description targeting vertical-specific search terms.
- Above-the-fold: primary CTA visible without scrolling on both mobile and desktop viewports.
- "Apply Now" CTA: routes to onboarding wizard with vertical automatically pre-selected based on source page.
- Social proof: at minimum 2 testimonials per vertical page from merchants in that vertical; structured data for Review schema.
- Pricing overview: at minimum a "starting from $X/month" or "competitive interchange++ pricing" callout — enough to qualify the prospect's price sensitivity.

**Success Metrics (CMO):**
- Vertical landing page organic ranking (target: top 10 for primary vertical keyword): tracked monthly
- Apply Now click-through rate from vertical landing pages: ≥ 5%
- Bounce rate on vertical landing pages: ≤ 55%

---

### REQ-WEB-003: Lead Capture & CRM Integration
**Capability Group:** Lead Capture & CRM | **Priority:** Must  
**Source Refs:** PSR-V6-03560, PSR-V6-03561  
**Actors:** Prospect Merchant | Sales Team  
**Type:** functional

**Business Value:** Lead capture is the bridge between anonymous traffic and the merchant relationship. A CRM record with full attribution context (which page, which UTM campaign, which vertical they explored, which referral partner sent them) is the difference between a sales team making a relevant, warm outreach vs. a cold "tell me about your business" call. Pre-populated CRM fields from the savings calculator reduce lead enrichment time by 80%.

**Requirement:**
All contact forms, "Request a Demo" forms, and savings calculator result captures SHALL submit lead records to the CRM within 5 seconds of form submission, with full attribution context. Bot protection SHALL be enforced on all forms.

**Key Acceptance Criteria:**
- CAPTCHA: reCAPTCHA v3 (invisible) on all lead forms; fallback to reCAPTCHA v2 checkbox for low-score sessions.
- CRM record: created within 5 seconds of form submission; includes: name, email, phone (if captured), business type, estimated volume (if calculator source), UTM parameters (source, medium, campaign, content, term), referral QR partner ID (if applicable), and source page URL.
- Auto-responder: email sent to lead within 2 minutes of form submission confirming receipt and setting expectation for follow-up.
- Duplicate handling: if email already exists in CRM, update the existing record with new attribution data rather than creating a duplicate.
- GDPR/CCPA: form includes unchecked opt-in checkbox for marketing communications with compliant disclosure; form submission only requires business contact information — not personal PII consent.

**Success Metrics (CMO/Sales):**
- Lead form submission → CRM record creation time: ≤ 5 seconds (99th percentile)
- Auto-responder delivery rate: ≥ 99%
- Form bot submission rate (blocked by CAPTCHA): < 5% of submissions

---

### REQ-WEB-004: AI Blog & Content Engine
**Capability Group:** AI Content & Blog | **Priority:** Should  
**Source Refs:** PSR-V6-03565, PSR-V6-03566  
**Actors:** Marketing Admin | SEO System  
**Type:** functional

**Business Value:** A blog that publishes 2–4 articles per week on relevant SMB payments, POS, and payroll topics competes directly for the long-tail search queries where PaySurity's prospects make their buying decisions. At $0 marginal CPC, blog-driven SEO traffic has a 3–5 year compounding value that exceeds any paid channel. AI-assisted drafting reduces the content production cost from $300–$500/article to $50–$80 — making consistent publishing economically viable for a startup.

**Requirement:**
The system SHALL support an AI-assisted blog content engine where Marketing Admin configures topic buckets per vertical and the AI generates draft articles. All AI-generated drafts MUST go through human review and approval before publication. Every published post SHALL include structured data, canonicalization, and vertical category taxonomy.

**Key Acceptance Criteria:**
- Topic configuration: Marketing Admin sets topic areas per vertical (e.g., "restaurant POS, tip reporting, kitchen technology" for BistroBeest); AI generates 3–5 draft titles per topic area per week.
- AI drafts: delivered to editorial queue only — no auto-publish path exists; draft includes SEO metadata suggestions (title tag, meta description, target keyword).
- Editorial calendar: scheduling interface for draft review, editing, approval, and publish date setting.
- Published post requirements: unique canonical URL, Article JSON-LD schema, Open Graph tags for social sharing, category tag mapping to a vertical (e.g., `/blog/restaurant-pos/`).
- Reading time estimate and table of contents auto-generated for posts > 1,500 words.

**Success Metrics (CMO):**
- Blog-driven organic sessions per month (at 6 months of consistent publishing): ≥ 5,000 sessions/month
- Publishing cadence with AI assist: ≥ 2 articles/week
- Average time-on-page for blog articles: ≥ 2 minutes (content quality signal)

---

### REQ-WEB-005: Referral QR & UTM Attribution Tracking
**Capability Group:** Marketing & Attribution | **Priority:** Must  
**Source Refs:** PSR-V6-03570, PSR-V6-03571  
**Actors:** Referral Partner | System  
**Type:** functional

**Business Value:** Attribution accuracy is the trust backbone of the Partner Program. A referral partner who brings in 3 merchants but gets credit for 1 (because the UTM was stripped by a redirect) loses confidence in the program and stops referring. Server-side attribution backup ensures that even when browser-side cookies are cleared or blocked (iOS privacy restrictions, Firefox ETP), the referral is recognized.

**Requirement:**
Each Referral Partner SHALL receive a unique QR code and UTM-tagged URL at activation. The website MUST preserve attribution through the full conversion funnel — from first visit to onboarding application submission — via both client-side UTM parameter storage and server-side session attribution records.

**Key Acceptance Criteria:**
- QR code: generated per partner at activation; downloadable immediately in PNG and SVG formats from the partner portal.
- UTM parameters: preserved through all site-side redirects (no stripping); stored in the browser session via first-party cookie AND a server-side session record written at first touch.
- Server-side record: partner ID, timestamp, landing page, and session ID stored at first-touch — provides fallback attribution if cookie is cleared before conversion.
- 30-day attribution window: from first click to application submission; first-touch attribution model.
- CRM write: on lead capture or application submission, Referral Partner ID (from cookie or server-side fallback) written to CRM and application record.
- Attribution immutability: finalized on first live merchant transaction (same as REQ-AFR-008 trigger).

**Success Metrics (CMO/CFO):**
- Referral UTM preservation rate (referral attributed in CRM vs. referral link clicks): ≥ 95%
- Attribution disputes per quarter: < 1% of all referral credits
- QR code download rate (partner activates and downloads materials within 7 days): ≥ 80%

---

### REQ-WEB-006: Savings Calculator Widget (Lead Capture)
**Capability Group:** Lead Capture & CRM | **Priority:** Must  
**Source Refs:** PSR-V6-03575  
**Actors:** Prospect Merchant | Sales Team  
**Type:** functional

**Business Value:** The savings calculator is the highest-converting lead capture tool in the fintech marketing playbook — it creates personalized, quantified value before the prospect even speaks to a salesperson. A prospect who sees "$3,200/year in savings" is 5× more likely to apply than one who just reads a feature list. The email capture gate converts anonymous curiosity into a named lead with qualification data pre-attached.

**Requirement:**
The savings calculator widget SHALL accept the prospect's current monthly processing volume, average ticket size, and current effective rate, and produce a side-by-side savings comparison. Results SHALL be gated behind an email capture form, which simultaneously creates a qualified CRM lead and triggers an emailed PDF report.

**Key Acceptance Criteria:**
- Inputs: monthly processing volume ($), average ticket size ($), current effective rate (%), business type (dropdown).
- Calculation: current monthly cost computed from inputs; PaySurity projected cost applied from the appropriate pricing model for the business type and volume tier.
- Output: current monthly cost, PaySurity projected monthly cost, monthly savings ($), annual savings ($), percentage savings — displayed on-screen.
- Gate: results visible on page only after email (+ first name) form submission with GDPR/CCPA-compliant disclosure.
- PDF report: auto-generated and emailed within 2 minutes of submission; report mirrors on-screen comparison with PaySurity branding.
- CRM write: lead created with all calculator inputs + email + first name; tagged as "Calculator Lead" for sales team prioritization.
- Embeddable: widget embeddable as a JavaScript snippet or iframe on Reseller partner sites; Reseller branding override and attribution carried through.
- Statement file privacy: if a merchant uploads a processing statement PDF for auto-extraction, the file SHALL be deleted from the server within 24 hours of the session end.

**Success Metrics (CMO/CFO):**
- Calculator start-to-gate-submitted conversion rate: ≥ 25%
- Calculator-sourced leads that advance to "Apply Now": ≥ 30%
- PDF report email delivery rate: ≥ 99%

---

### REQ-WEB-007: AI Hero Assistant (Public Site)
**Capability Group:** AI Content & Blog | **Priority:** Should  
**Source Refs:** PSR-V6-03580  
**Actors:** Anonymous Visitor  
**Type:** functional

**Business Value:** An AI assistant on the homepage intercepts the 60%+ of visitors who don't convert via traditional navigation — they have a specific question that the static page layout doesn't answer directly. The assistant converts visitor intent into a guided product discovery path, surfacing the relevant vertical or pricing page. Any question it can't answer gets routed to "Talk to Sales" — turning a frustrated visitor into a warm lead.

**Requirement:**
The public site SHALL include an AI chat assistant widget that answers visitor questions about PaySurity products, pricing, and the sign-up process. The assistant SHALL constrain answers to approved knowledge base content and route complex or unanswered queries to the "Talk to Sales" CTA or live chat if available.

**Key Acceptance Criteria:**
- Knowledge base constraint: assistant answers drawn exclusively from approved content (product pages, FAQ, pricing pages) — no hallucination about unsupported features, rates not yet published, or capabilities not yet live.
- "Talk to Sales" trigger: any question the assistant cannot answer from the knowledge base → assistant offers "Talk to Sales" link or "Request a Demo" CTA.
- PII: no PII collected during AI chat without explicit opt-in; if a visitor voluntarily shares contact info in chat, prompt to fill out the lead form instead.
- Chat transcript: available for Marketing Admin export for content gap analysis (what questions are most asked but unanswered).
- Response latency: assistant response within 2 seconds of query submission.

**Success Metrics (CMO):**
- AI assistant "Talk to Sales" hand-off rate: ≥ 15% of chat sessions (healthy conversion signal)
- Assistant satisfaction rating (thumbs up/down): ≥ 75% positive
- Chat-to-lead capture rate (visitor who chats → fills lead form): ≥ 10%

---

### REQ-WEB-008: Social Media Content Automation
**Capability Group:** Marketing & Attribution | **Priority:** Could  
**Source Refs:** PSR-V6-03585  
**Actors:** Marketing Admin  
**Type:** functional

**Business Value:** Consistent social publishing drives brand recall and referral link distribution — critical for the Affiliate/Reseller program which relies on social sharing. AI-assisted social draft generation from blog posts eliminates the most time-consuming part of social management (content creation), while keeping human approval in the loop to protect brand voice.

**Requirement:**
The system SHOULD provide a social media content scheduling feature that auto-generates draft social posts from published blog content, allows Marketing Admin to review, edit, and schedule, and publishes to configured channels (LinkedIn, Twitter/X, Facebook Page).

**Key Acceptance Criteria:**
- Auto-draft: social post draft generated from published blog post within 1 hour of publish; drafts ready in editorial queue for review.
- Human approval: no post auto-published; Marketing Admin must approve each draft before scheduling.
- Scheduling calendar: visual calendar with platform-specific character limits enforced at draft stage (no truncation surprise at publish).
- Engagement metrics: post-publish metrics (impressions, clicks, shares) pulled via platform APIs and visible per scheduled post in the social calendar.

**Success Metrics (CMO):**
- Social post publication cadence (blog-driven): ≥ 2 posts/week per enabled channel
- Engagement rate per post: tracked as a marketing KPI; segment target varies by platform

---

### REQ-WEB-009: Analytics & Conversion Tracking
**Capability Group:** Marketing & Attribution | **Priority:** Must  
**Source Refs:** PSR-V6-03590  
**Actors:** Marketing Admin  
**Type:** functional

**Business Value:** Marketing without proper conversion tracking is unmeasured spend. Without GA4 + GTM properly configured, PaySurity cannot calculate cost-per-lead, cost-per-application, or which channels (organic, paid, referral) drive the highest-quality merchant applications. This data directly determines the CMO's channel spend allocation decisions.

**Requirement:**
The site SHALL integrate with GA4 and Google Tag Manager. All key conversion events SHALL be tracked via GTM dataLayer pushes and configured as GA4 conversion goals. Monthly summary reports SHALL be auto-generated and delivered to the marketing team.

**Key Acceptance Criteria:**
- GA4 + GTM: installed on all pages; GTM container manages all tag firing — no hardcoded analytics scripts outside GTM.
- Tracked conversion events: contact form submission, demo request, calculator start, calculator gate submission, Apply Now click, savings PDF download.
- First-party data: event data sent to GA4 using first-party cookies (no third-party cookie dependency); CCPA compliance maintained via cookie consent banner that honors opt-out before GA4 fires.
- Auto-report: monthly summary (traffic by source/medium, landing page performance, conversion funnel) auto-generated and emailed to Marketing Admin by the 5th of each month.
- A/B testing: GTM-driven A/B test capability for CTA text and page layout variants; test results visible in GA4 with minimum 95% statistical confidence before declaring a winner.

**Success Metrics (CMO):**
- Conversion event tracking accuracy: confirmed by monthly GA4 vs. CRM lead count reconciliation; target: ≥ 95% match
- Cost per qualified lead (calculator + form captures): tracked monthly; target to decrease MoM
- Monthly organic session-to-lead conversion rate: ≥ 3%
