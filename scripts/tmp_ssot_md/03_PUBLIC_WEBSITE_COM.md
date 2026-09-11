# 03 PUBLIC WEBSITE COM

**Generated:** 2026-02-10 04:03:50 (America/Chicago)

**Covers capability area(s):** Public Website & Marketing

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# Public Website & Marketing

_Contains 91 requirements._


## General

## Polishing notes (v1)
- This file is PaySurity.com only. Product microsite requirements were rehomed to their owning modules to eliminate confusion.
- Requirement statements were normalized (tags removed) to produce clear headings.
- Addendum requirements were added from clarified target-state to close SEO + marketing automation gaps.


# Public Website & Marketing (PaySurity.com)

## Site map & core pages

### Core pages 

- **Ref:** PSR-V6-03588
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** MS, Wallets, Payroll, POS (Point of Sale)-R/G, About, Contact. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: WEB-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Core pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Core pages 

- **Ref:** PSR-V6-03589
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** MS, Wallets, Payroll, POS (Point of Sale)-R/G, About, Contact. | ReqID: WEB-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Core pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Login and 4 Other Functions 

- **Ref:** PSR-V6-03605
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Login and 4 Other Functions .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Pricing & CTAs 

- **Ref:** PSR-V6-03638
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Clear pricing table, fees explainer, and demo CTAs. | acceptancetests: - Click CTA opens scheduling/contact; tracked. | risknotes: SITE-001 | reqid: SITE-005
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Pricing & CTAs .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Core pages 

- **Ref:** PSR-V6-03855
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** MS, Wallets, Payroll, POS-R/G, About, Contact.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Core pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Pricing & CTAs 

- **Ref:** PSR-V6-03861
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Clear pricing table, fees explainer, and demo CTAs.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Pricing & CTAs .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Lead capture & conversion

### Lead capture + CRM handoff 

- **Ref:** PSR-V6-03601
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Contact forms route to inbox + Supabase table for now. | acceptancetests: - Submissions stored with consent & locale. | risknotes: SITE-001 | reqid: SITE-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Lead capture + CRM handoff .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Lead forms 

- **Ref:** PSR-V6-03602
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Contact/demo; spam protection; CRM handoff. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: WEB-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Lead forms .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Lead forms 

- **Ref:** PSR-V6-03603
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Contact/demo; spam protection; CRM handoff. | ReqID: WEB-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Lead forms .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Tests CRM integration failure handling 

- **Ref:** PSR-V6-03625
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Tests CRM integration failure handling .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Lead forms 

- **Ref:** PSR-V6-03859
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Contact/demo; spam protection; CRM handoff.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Lead forms .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.



## Provider capability reuse (FluidPay) — marketing and truth-in-advertising guard

- **Source of truth:** `08_PAYMENT_ORCHESTRATION_ORC.md` requirement **PSR-EXT-FLUIDPAY-REUSE-20260210-001**.
- Public site content SHALL distinguish:
  - **Checkout wallets** (Apple Pay / Google Pay via provider tooling) vs
  - **PaySurity WAL** (stored-value ledger + controls + P2P rules),
  and SHALL NOT imply that provider checkout wallets replace PaySurity WAL functionality.

## SEO

### Database Schema: CREATE TABLE blogposts ( 

- **Ref:** PSR-V6-00372
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE blogposts ( .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Check for correct schema type and required properties 

- **Ref:** PSR-V6-03611
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check for correct schema type and required properties .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Important for SEO and search engine indexing 

- **Ref:** PSR-V6-03614
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Important for SEO and search engine indexing .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test should include schema validation using Google Rich Results Test API (Application Programming Interface) 

- **Ref:** PSR-V6-03622
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test should include schema validation using Google Rich Results Test API (Application Programming Interface) .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: SEO + schema 

- **Ref:** PSR-V6-03856
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Structured data; sitemaps; hreflang; perf budget.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: SEO + schema .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: SEO baseline 

- **Ref:** PSR-V6-03781
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Meta tags, canonical links, sitemap, robots, schema.org.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: SEO baseline .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### SEO + schema 

- **Ref:** PSR-V6-03643
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Structured data; sitemaps; hreflang; perf budget. | ReqID: WEB-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SEO + schema .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### SEO + schema 

- **Ref:** PSR-V6-03644
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Structured data; sitemaps; hreflang; perf budget. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: WEB-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SEO + schema .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### SEO baseline 

- **Ref:** PSR-V6-03645
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Meta tags, canonical links, sitemap, robots, schema.org. | acceptancetests: - Pages indexable; Core Web Vitals pass. | risknotes: SITE-001 | reqid: SITE-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SEO baseline .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### SEO content and landing pages 

- **Ref:** PSR-V6-03646
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Provide content and landing page system for each vertical with metadata schema markup and testing hooks
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SEO content and landing pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Responsive design, SEO optimized, secure payment integration. 

- **Ref:** PSR-V6-01897
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Responsive design, SEO optimized, secure payment integration. .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## AI assistant

### AI responses must avoid abusive or harmful language and redirect clearly unrelated or unsafe requests back to relevant products or categories

- **Ref:** PSR-V6-03584
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AI responses must avoid abusive or harmful language and redirect clearly unrelated or unsafe requests back to relevant products or categories.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Ambiguous query handling 

- **Ref:** PSR-V6-03585
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Ambiguous query handling .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### AI chat components across verticals

- **Ref:** PSR-V6-03586
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AI chat components across verticals.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Compliance-aligned AI logging 

- **Ref:** PSR-V6-03587
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Compliance-aligned AI logging .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Cost-optimized conversation design 

- **Ref:** PSR-V6-03590
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Cost-optimized conversation design .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### E-commerce merchant AI hero integration 

- **Ref:** PSR-V6-03593
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “E-commerce merchant AI hero integration .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Ensure both the hero carousel and AI assistant use the same product data source to avoid inconsistencies

- **Ref:** PSR-V6-03594
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Ensure both the hero carousel and AI assistant use the same product data source to avoid inconsistencies.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Implement hero and product carousel plus AI shopping assistant on e-commerce merchant microsites using their online catalog, categories, and promotions

- **Ref:** PSR-V6-03596
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Implement hero and product carousel plus AI shopping assistant on e-commerce merchant microsites using their online catalog, categories, and promotions.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Limit prompt and response size with a maximum token budget, using compact summaries and truncating conversation history to only recent turns needed for context

- **Ref:** PSR-V6-03604
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Limit prompt and response size with a maximum token budget, using compact summaries and truncating conversation history to only recent turns needed for context.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify email format validation and required fields 

- **Ref:** PSR-V6-03629
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify email format validation and required fields .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Platform - AI Hero Assistant 

- **Ref:** PSR-V6-03635
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Platform - AI Hero Assistant .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Shared data source for AI and UI (User Interface) 

- **Ref:** PSR-V6-03647
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Shared data source for AI and UI (User Interface) .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Token budgeting and truncation 

- **Ref:** PSR-V6-03648
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Token budgeting and truncation .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Localization

### Language switcher (public site) 

- **Ref:** PSR-V6-03599
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Site texts available in EN + priority langs. | acceptancetests: - Switch language without layout break. | risknotes: GEN-003 | reqid: SITE-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Language switcher (public site) .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Check translation status updates in CMS 

- **Ref:** PSR-V6-03613
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check translation status updates in CMS .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Language switcher (public site) 

- **Ref:** PSR-V6-03860
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Site texts available in EN + priority langs.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Language switcher (public site) .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Safety & compliance

### Notes: Check for accessibility compliance 

- **Ref:** PSR-V6-03610
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check for accessibility compliance .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## General

### Dark-green modern theme standard 

- **Ref:** PSR-V6-03591
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Dark-green modern theme standard .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Ensure the hero and product carousel are responsive and fully usable on mobile, tablet, and desktop

- **Ref:** PSR-V6-03595
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Ensure the hero and product carousel are responsive and fully usable on mobile, tablet, and desktop.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Large catalog retrieval strategy 

- **Ref:** PSR-V6-03600
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Large catalog retrieval strategy .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant Services - E-Commerce 

- **Ref:** PSR-V6-03606
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant Services - E-Commerce .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant Services - In-Store 

- **Ref:** PSR-V6-03607
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant Services - In-Store .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MSC landing integration 

- **Ref:** PSR-V6-03608
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Dedicated page feeds files into calculator flow. | acceptancetests: - Upload from landing drives to MSC result page. | risknotes: MSC-001 | reqid: SITE-006
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MSC landing integration .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Multi language public site and localisation 

- **Ref:** PSR-V6-03609
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Support multi language versions of key marketing pages blogs and documentation with locale routing and translation workflow
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi language public site and localisation .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Check logs for synchronization success 

- **Ref:** PSR-V6-03612
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check logs for synchronization success .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Improves user experience and reduces publish errors 

- **Ref:** PSR-V6-03615
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Improves user experience and reduces publish errors .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include tests for both mobile and desktop metrics 

- **Ref:** PSR-V6-03616
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include tests for both mobile and desktop metrics .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include x-default tag for fallback language 

- **Ref:** PSR-V6-03617
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include x-default tag for fallback language .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test modal or new page for team bios 

- **Ref:** PSR-V6-03618
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test modal or new page for team bios .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test other field validations as well 

- **Ref:** PSR-V6-03619
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test other field validations as well .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test persistence by revisiting site after closing browser 

- **Ref:** PSR-V6-03620
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test persistence by revisiting site after closing browser .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test responsiveness on desktop and mobile 

- **Ref:** PSR-V6-03621
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test responsiveness on desktop and mobile .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with various product data including edge cases 

- **Ref:** PSR-V6-03623
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with various product data including edge cases .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Testing hooks must be stable and documented 

- **Ref:** PSR-V6-03624
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Testing hooks must be stable and documented .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validate all required fields are enforced 

- **Ref:** PSR-V6-03626
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate all required fields are enforced .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates client-side and server-side validation 

- **Ref:** PSR-V6-03627
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates client-side and server-side validation .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates spam protection enforcement 

- **Ref:** PSR-V6-03628
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates spam protection enforcement .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify exclusion of noindex URLs 

- **Ref:** PSR-V6-03630
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify exclusion of noindex URLs .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify hreflang tags are present for French pages 

- **Ref:** PSR-V6-03631
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify hreflang tags are present for French pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify HTTP status code 301 or 302 for redirection 

- **Ref:** PSR-V6-03632
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify HTTP status code 301 or 302 for redirection .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify payment processing integration endpoints are correctly configured 

- **Ref:** PSR-V6-03633
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify payment processing integration endpoints are correctly configured .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify rollback capability if needed 

- **Ref:** PSR-V6-03634
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify rollback capability if needed .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Product carousel binding 

- **Ref:** PSR-V6-03639
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Product carousel binding .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Product catalog single source 

- **Ref:** PSR-V6-03640
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Product catalog single source .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Public site IA + pages 

- **Ref:** PSR-V6-03641
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Home, Merchant Services, POS (Point of Sale), Wallets, Payroll, About, Contact. | acceptancetests: - All pages responsive; lighthouse ≥ 90. | risknotes: GEN-003 | reqid: SITE-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Public site IA + pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Responsive hero and carousel 

- **Ref:** PSR-V6-03642
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Responsive hero and carousel .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: MSC landing integration 

- **Ref:** PSR-V6-03862
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Dedicated page feeds files into calculator flow.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: MSC landing integration .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Public site IA + pages 

- **Ref:** PSR-V6-03858
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Home, Merchant Services, POS, Wallets, Payroll, About, Contact.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Public site IA + pages .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Results + PDF + CTA 

- **Ref:** PSR-V6-03857
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Show breakdown + downloadable PDF + 'Talk to Sales'.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Results + PDF + CTA .”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (clarified target-state requirements)

_These items were explicitly clarified and are required for a complete target-state. They use temporary IDs until an ID assignment step is run._

### PaySurity.com SHALL provide an indexable Merchant Savings Estimator landing page that links to the statement-upload workflow and the savings results view

- **Ref:** PSR-EXT-WEB-20260209-001
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “PaySurity.com SHALL provide an indexable Merchant Savings Estimator landing page that links to the statement-upload workflow and the savings results view.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### PaySurity.com SHALL provide dedicated, indexable vertical landing pages for each product vertical, each describing features, pricing approach, and advantages, with clear CTAs into the correct onboarding flow

- **Ref:** PSR-EXT-WEB-20260209-002
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “PaySurity.com SHALL provide dedicated, indexable vertical landing pages for each product vertical, each describing features, pricing approach, and advantages, with clear CTAs into the correct onboarding flow.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### The public site blog SHALL be organized into per-vertical categories and SHALL support internal linking between vertical pages, related articles, and relevant product pages

- **Ref:** PSR-EXT-WEB-20260209-003
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “The public site blog SHALL be organized into per-vertical categories and SHALL support internal linking between vertical pages, related articles, and relevant product pages.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### The system SHALL support configurable blog content sourcing and scheduling (by Super Admin and delegated roles) to publish fresh articles at an admin-configurable cadence

- **Ref:** PSR-EXT-WEB-20260209-004
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “The system SHALL support configurable blog content sourcing and scheduling (by Super Admin and delegated roles) to publish fresh articles at an admin-configurable cadence.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### Blog posts SHALL include safe outbound citations/links to trusted external sources and SHALL avoid copying copyrighted text (summaries + link-outs only)

- **Ref:** PSR-EXT-WEB-20260209-005
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “Blog posts SHALL include safe outbound citations/links to trusted external sources and SHALL avoid copying copyrighted text (summaries + link-outs only).”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### The public site SHALL include links to PaySurity social media pages in the footer and/or header, and SHALL support per-vertical social link blocks where applicable

- **Ref:** PSR-EXT-WEB-20260209-006
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “The public site SHALL include links to PaySurity social media pages in the footer and/or header, and SHALL support per-vertical social link blocks where applicable.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### The platform SHALL support AI-assisted responses to inbound social comments/messages using an approval queue option, audit logging, and pause/resume controls

- **Ref:** PSR-EXT-WEB-20260209-007
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “The platform SHALL support AI-assisted responses to inbound social comments/messages using an approval queue option, audit logging, and pause/resume controls.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### The public site SHALL support campaign attribution via UTM parameters and SHALL generate scannable QR codes that deep-link to tracked landing pages

- **Ref:** PSR-EXT-WEB-20260209-008
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “The public site SHALL support campaign attribution via UTM parameters and SHALL generate scannable QR codes that deep-link to tracked landing pages.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### All onboarding CTAs on PaySurity.com SHALL route the prospect into the correct onboarding wizard (merchant onboarding, wallet user onboarding, payroll onboarding) while preserving a single coherent PaySurity flow

- **Ref:** PSR-EXT-WEB-20260209-009
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “All onboarding CTAs on PaySurity.com SHALL route the prospect into the correct onboarding wizard (merchant onboarding, wallet user onboarding, payroll onboarding) while preserving a single coherent PaySurity flow.”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.


### The public site SHALL be SEO-ready for every vertical page and blog article (canonical URLs, meta tags, sitemap, robots, structured data, OpenGraph)

- **Ref:** PSR-EXT-WEB-20260209-010
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an anonymous visitor on PaySurity.com, **when** the visitor navigates the public site, **then** the system SHALL satisfy: “The public site SHALL be SEO-ready for every vertical page and blog article (canonical URLs, meta tags, sitemap, robots, structured data, OpenGraph).”.
- **Given** the relevant page and workflow exist, **when** the visitor completes the workflow, **then** the system SHALL display a clear next step and SHALL not expose sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoint(s) (if any) with sanitized examples.
  - Tests and CI evidence.




## Rehomed requirements (from ONB doc correction 2026-02-09)

_These requirements were originally placed under merchant onboarding during the initial split. They have been re-homed semantically to reduce agent confusion._

### API: GET /api/newsletters

- **Ref:** PSR-V6-00151
- **Domain/Module:** COM / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/newsletters.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/newsletters

- **Ref:** PSR-V6-00191
- **Domain/Module:** COM / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/newsletters.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (2026-02-10): Vertical hubs + AI blog sourcing + social automation + SEO link-outs

- **Ref:** PSR-EXT-WEB-20260210-001
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Add one public, indexable landing page per vertical (Merchant Services, POS Retail, POS Restaurant, POS Grocery, WAL, PAY, Legal, Dental, Chiropractic, etc.) with features, pricing positioning, FAQs, CTAs, and internal links to onboarding and demos.
- **Acceptance Criteria (GWT):**
- **Given** an anonymous visitor, **when** the visitor navigates to a vertical landing page route, **then** the system SHALL render a complete vertical page with schema metadata and conversion CTAs.
- **Given** a vertical is marked “published” by Super Admin/Sub Super Admin, **when** the site generates sitemaps, **then** the vertical page SHALL be included in the sitemap and internal linking graph.

- **Ref:** PSR-EXT-WEB-20260210-002
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Blog SHALL support “vertical hubs” (category pages) so each vertical has its own news/SEO area (e.g., /blog/pos-retail, /blog/payroll, /blog/digital-wallets).
- **Acceptance Criteria (GWT):**
- **Given** a visitor, **when** the visitor browses a vertical hub, **then** the system SHALL show only posts tagged to that vertical and SHALL expose canonical URLs and pagination.
- **Given** a post is published, **when** it is tagged to a vertical hub, **then** the hub page SHALL update without manual code changes.

- **Ref:** PSR-EXT-WEB-20260210-003
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** The platform SHALL ingest fresh content inputs for blog generation via configurable sources (RSS/Atom feeds, public APIs, and allowlisted web pages) and SHALL maintain a source allowlist/denylist.
- **Acceptance Criteria (GWT):**
- **Given** Super Admin/Sub Super Admin configured sources, **when** the ingestion job runs, **then** the system SHALL fetch, normalize, and store candidate items with source attribution and timestamps.
- **Given** a source is removed or denylisted, **when** ingestion runs, **then** the system SHALL NOT fetch from that source.

- **Ref:** PSR-EXT-WEB-20260210-004
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Blog auto-generation SHALL enforce copyright-safe behavior: avoid long verbatim copying; generate original summaries/analysis; include outbound citations/links; and keep a plagiarism/duplication check.
- **Acceptance Criteria (GWT):**
- **Given** candidate items are ingested, **when** the AI content generator runs, **then** the produced post SHALL be original text, SHALL include source citations/links, and SHALL pass duplication thresholds.
- **Given** duplication thresholds are exceeded, **when** generation runs, **then** the post SHALL be blocked and queued for review (or discarded) and logged.

- **Ref:** PSR-EXT-WEB-20260210-005
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Blog publishing SHALL be scheduled at a configurable interval (daily/weekly/etc.) and optionally per-vertical quotas, controlled by Super Admin/Sub Super Admin.
- **Acceptance Criteria (GWT):**
- **Given** a schedule is configured, **when** the schedule triggers, **then** the system SHALL publish (or queue) a post according to configured cadence and quotas.
- **Given** scheduling is paused, **when** the schedule would have triggered, **then** no post SHALL be published and the skipped event SHALL be logged.

- **Ref:** PSR-EXT-WEB-20260210-006
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** The website SHALL include outbound “authority links” to relevant industry resources (configurable) and SHALL create internal link structures that improve SEO (related posts, related verticals, breadcrumbs).
- **Acceptance Criteria (GWT):**
- **Given** a page is rendered, **when** related content exists, **then** the page SHALL show internal “related” links and appropriate breadcrumbs.
- **Given** outbound authority links are configured, **when** pages render, **then** the links SHALL be present and no broken links SHALL exist (validated by automated link checks).

- **Ref:** PSR-EXT-WEB-20260210-007
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** The website SHALL expose PaySurity social profiles (icons/links) and SHALL support AI-assisted social engagement: auto-draft replies to inbound comments/DMs; optional auto-post behind feature-flag with audit logs.
- **Acceptance Criteria (GWT):**
- **Given** inbound social messages are ingested, **when** AI drafting is enabled, **then** a draft reply SHALL be generated and queued for approval (or auto-posted if explicitly enabled).
- **Given** auto-post is enabled, **when** a reply is posted, **then** the system SHALL log who/what posted and preserve the message history.

- **Ref:** PSR-EXT-WEB-20260210-008
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Marketing QR codes SHALL be supported as first-class campaign assets (unique per source) and SHALL feed attribution analytics (UTM/QR campaign IDs) into onboarding, checkout, and lead flows.
- **Acceptance Criteria (GWT):**
- **Given** a campaign is created, **when** a QR code is generated, **then** scans SHALL be tracked to the campaign and attributed through downstream conversions.
- **Given** campaign routing is updated, **when** scans occur, **then** the QR destination SHALL reflect the latest configuration without regenerating a new code (unless explicitly requested).

## Addendum (2026-02-10): Marketing claim governance for hardware + tap-to-phone (PSR-EXT)

- **Ref:** PSR-EXT-COM-20260210-001
- **Domain/Module:** COM / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** scope-control
- **Details:** The public site MUST avoid unsupported capability claims. Tap-to-phone and hardware-related claims MUST be driven by platform feature flags and “integration readiness” status.
- **Acceptance Criteria (GWT):**
- **Given** an integration-dependent feature (e.g., tap-to-phone) is not enabled in production, **when** a prospect visits the POS pages, **then** the site SHALL NOT claim that the feature is available and SHALL instead present an “Availability: Coming soon / Ask sales” pattern driven by config.
- **Given** Super Admin marks a feature as enabled for production marketing, **when** a page is rendered, **then** the claim SHALL appear consistently across landing pages, product pages, and pricing pages, and tests SHALL validate the gating.