# 07 AFFILIATES RESELLERS REFERRALS AFR (Polished v2)

**Generated:** 2026-02-10 01:36:34 (America/Chicago)

**Covers capability area(s):** Referrals, Affiliates, Resellers, partner microsites, tracking/attribution, payouts, compliance/tax artifacts.

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

## Scope notes (avoid confusion)
- These are **three distinct programs**: Referral, Affiliate, Reseller. Each has separate logic, UI, routing, and admin configuration.
- Public entry points are part of PaySurity.com (COM) but the program logic and admin controls are in AFR.
- This document contains only AFR requirements. Any non-AFR (Foundational/ADM) items previously co-located here were re-homed into `01_FOUNDATION_ADM.md` to reduce agent confusion.

_Contains 97 requirements._

## Program overview

### AFF — Affiliate API (Application Programming Interface) Sandbox

- **Ref:** PSR-V6-00122
- **Title:** AFF
- **Statement:** Affiliate API (Application Programming Interface) Sandbox
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AFF-037 | AFF | | Affiliate API (Application Programming Interface) Sandbox | Provide sandbox environment for...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: DELETE /api/affiliates/:id

### System shall provide Purpose — System shall provide Purpose: API (Application Programming Interface) endpoint definitions.

- **Ref:** PSR-V6-03469
- **Title:** System shall provide Purpose
- **Statement:** System shall provide Purpose: API (Application Programming Interface) endpoint definitions.
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Purpose: API (Application Programming Interface) endpoint definitions. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Receives marketing materials and referral tracking links. [TEST].

### Roll-up — Roll-up: Reseller application [MERGED][ROLLUP][UI (User Interface)]

- **Ref:** PSR-V6-03839
- **Title:** Roll-up
- **Statement:** Roll-up: Reseller application [MERGED][ROLLUP][UI (User Interface)]
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Business checks; W-9; e-sign approvals.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Reseller application [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Reseller microsites [MERGED][ROLLUP][UI (User Interface)].

### Roll-up — Roll-up: Microsite generator [MERGED][ROLLUP][UI (User Interface)]

- **Ref:** PSR-V6-03840
- **Title:** Roll-up
- **Statement:** Roll-up: Microsite generator [MERGED][ROLLUP][UI (User Interface)]
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** /resellers/{{slug}}; assets; copy.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Microsite generator [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Reseller application [MERGED][ROLLUP][UI (User Interface)].

### Roll-up — Roll-up: Tracking & payouts [MERGED][ROLLUP][UI (User Interface)]

- **Ref:** PSR-V6-03841
- **Title:** Roll-up
- **Statement:** Roll-up: Tracking & payouts [MERGED][ROLLUP][UI (User Interface)]
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Clicks; trials; conversions; statements.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Tracking & payouts [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide AFF-002: Affiliate Portal and Dashboard. [TEST][UI].

## Referral program

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/referralprograms', (req, res) => {

- **Ref:** PSR-V6-00167
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/referralprograms', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/referralprograms.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/referralrewards

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/referralrewards', (req, res) => {

- **Ref:** PSR-V6-00168
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/referralrewards', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/referralrewards.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/referrals

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/referrals', (req, res) => {

- **Ref:** PSR-V6-00169
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/referrals', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/referrals.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/resellercommissions

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/referralprograms', (req, res) => {

- **Ref:** PSR-V6-00204
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/referralprograms', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/referralprograms.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/referralrewards

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/referralrewards', (req, res) => {

- **Ref:** PSR-V6-00205
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/referralrewards', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/referralrewards.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/referrals

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/referrals', (req, res) => {

- **Ref:** PSR-V6-00206
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/referrals', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/referrals.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/resellercommissions

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.get('/referrals', async (req, res) => {

- **Ref:** PSR-V6-00262
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.get('/referrals', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /referrals.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /resellers/:id

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.post('/referrals', validateRequest({

- **Ref:** PSR-V6-00308
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.post('/referrals', validateRequest({
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /referrals.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Approved Affiliate receives onboarding welcome package

### Customer referral for merchant stores — Customer referral for merchant stores

- **Ref:** PSR-V6-03418
- **Title:** Customer referral for merchant stores
- **Statement:** Customer referral for merchant stores
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Allow merchant customers to refer friends to the merchant via microsites or apps with referral tracking and loyalty or coupon rewards
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Customer referral for merchant stores [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE affiliatecommissions ( [DATA][TEST].

### Merchant referral of new PaySurity merchants — Merchant referral of new PaySurity merchants

- **Ref:** PSR-V6-03419
- **Title:** Merchant referral of new PaySurity merchants
- **Statement:** Merchant referral of new PaySurity merchants
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Allow existing merchants to refer new merchants to PaySurity using referral links or codes with tracked attribution and simple reward rules
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant referral of new PaySurity merchants [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant to merchant referral programme [API][TEST][UI].

### Merchant to merchant referral programme — Merchant to merchant referral programme

- **Ref:** PSR-V6-03420
- **Title:** Merchant to merchant referral programme
- **Statement:** Merchant to merchant referral programme
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Allow existing merchants to refer new merchants using tracked links or codes and reward them via commissions credits or loyalty points once the referred merchant is approved and processes volume
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant to merchant referral programme [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Microsite generator [TEST][UI].

### Notes — Notes: Test with both referral link and manual code entry

- **Ref:** PSR-V6-03445
- **Title:** Notes
- **Statement:** Notes: Test with both referral link and manual code entry
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with both referral link and manual code entry [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with different volume thresholds [OPS][TEST][UI].

### Notes — Notes: Validates happy path referral attribution

- **Ref:** PSR-V6-03454
- **Title:** Notes
- **Statement:** Notes: Validates happy path referral attribution
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates happy path referral attribution [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates public access and rendering of microsite [TEST][UI].

### Referral reward calculation and statements — Referral reward calculation and statements

- **Ref:** PSR-V6-03465
- **Title:** Referral reward calculation and statements
- **Statement:** Referral reward calculation and statements
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Calculate referral rewards according to simple plans and generate statements and exportable reports for referrers and PaySurity ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Referral reward calculation and statements [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Referral tracking attribution and expiry [TEST][UI].

### Referral tracking attribution and expiry — Referral tracking attribution and expiry

- **Ref:** PSR-V6-03466
- **Title:** Referral tracking attribution and expiry
- **Statement:** Referral tracking attribution and expiry
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Track referral events clicks signups and activations with configurable attribution windows and fraud checks
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Referral tracking attribution and expiry [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### RES-009.

## Affiliate program

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.delete('/api/affiliates/:id', async (req, res) => {

- **Ref:** PSR-V6-00135
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.delete('/api/affiliates/:id', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: DELETE /api/affiliates/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: DELETE /api/resellers/:id

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/affiliatecommissions', (req, res) => {

- **Ref:** PSR-V6-00140
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/affiliatecommissions', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/affiliatecommissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/affiliates

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/affiliates', (req, res) => {

- **Ref:** PSR-V6-00141
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/affiliates', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/affiliates.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/affiliates/:id

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/affiliates/:id', async (req, res) => {

- **Ref:** PSR-V6-00142
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/affiliates/:id', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/affiliates/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/referralprograms

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/affiliatecommissions', (req, res) => {

- **Ref:** PSR-V6-00183
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/affiliatecommissions', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/affiliatecommissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/affiliates

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/affiliates', (req, res) => {

- **Ref:** PSR-V6-00184
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/affiliates', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/affiliates.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/affiliates

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/affiliates', async (req, res) => {

- **Ref:** PSR-V6-00185
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/affiliates', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/affiliates.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/referralprograms

### System shall provide Approved Affiliate receives onboarding welcome package — System shall provide Approved Affiliate receives onboarding welcome package.

- **Ref:** PSR-V6-01290
- **Title:** System shall provide Approved Affiliate receives onboarding welcome package
- **Statement:** System shall provide Approved Affiliate receives onboarding welcome package.
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Approved Affiliate receives onboarding welcome package.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Completes affiliate application with business information

### System shall provide Completes affiliate application with business information — System shall provide Completes affiliate application with business information.

- **Ref:** PSR-V6-01365
- **Title:** System shall provide Completes affiliate application with business information
- **Statement:** System shall provide Completes affiliate application with business information.
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Completes affiliate application with business information.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/resellers" element={<ResellerApplicationForm />} />

### Affiliate API (Application Programming Interface) Sandbox — Provide sandbox environment for affiliate...

- **Ref:** PSR-V6-02344
- **Title:** Affiliate API (Application Programming Interface) Sandbox
- **Statement:** Provide sandbox environment for affiliate...
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “| AFF-037 | Affiliate API (Application Programming Interface) Sandbox | Provide sandbox environment for affiliate...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Affiliate self service portal and tracking — Affiliate self service portal and tracking

- **Ref:** PSR-V6-03417
- **Title:** Affiliate self service portal and tracking
- **Statement:** Affiliate self service portal and tracking
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Provide portal where partners obtain links view metrics track conversions and download statements
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Affiliate self service portal and tracking [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Affiliate tracking [COM][DATA][OPS][SEC][TEST][UI].

## Reseller program

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.delete('/api/resellers/:id', async (req, res) => {

- **Ref:** PSR-V6-00137
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.delete('/api/resellers/:id', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: DELETE /api/resellers/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/affiliatecommissions

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/resellercommissions', (req, res) => {

- **Ref:** PSR-V6-00170
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/resellercommissions', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/resellercommissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/resellers

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/resellers', (req, res) => {

- **Ref:** PSR-V6-00171
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/resellers', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/resellers.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/resellers/:id

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/resellers/:id', async (req, res) => {

- **Ref:** PSR-V6-00172
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/resellers/:id', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/resellers/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /api/resellersales

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.get('/api/resellersales', (req, res) => {

- **Ref:** PSR-V6-00173
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.get('/api/resellersales', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/resellersales.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/affiliatecommissions

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/resellercommissions', (req, res) => {

- **Ref:** PSR-V6-00207
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/resellercommissions', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/resellercommissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/resellers

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/resellers', (req, res) => {

- **Ref:** PSR-V6-00208
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/resellers', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/resellers.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/resellers

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/resellers', async (req, res) => {

- **Ref:** PSR-V6-00209
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/resellers', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/resellers.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/resellersales

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: app.post('/api/resellersales', (req, res) => {

- **Ref:** PSR-V6-00210
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: app.post('/api/resellersales', (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/resellersales.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /commissions

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.get('/resellers/:id', async (req, res) => {

- **Ref:** PSR-V6-00264
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.get('/resellers/:id', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /resellers/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /resellers/:id/commissions

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.get('/resellers/:id/commissions', async (req, res) => {

- **Ref:** PSR-V6-00265
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.get('/resellers/:id/commissions', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /resellers/:id/commissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: PATCH /commissions/:id/approve

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.patch('/resellers/:id', async (req, res) => {

- **Ref:** PSR-V6-00282
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.patch('/resellers/:id', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: PATCH /resellers/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: PATCH /resellers/:id/status

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.patch('/resellers/:id/status', async (req, res) => {

- **Ref:** PSR-V6-00283
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.patch('/resellers/:id/status', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: PATCH /resellers/:id/status.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /commissions

### UI (User Interface) Component — UI (User Interface) Component: <Route path="/resellers" element={<ResellerApplicationForm />} />

- **Ref:** PSR-V6-02169
- **Title:** UI (User Interface) Component
- **Statement:** UI (User Interface) Component: <Route path="/resellers" element={<ResellerApplicationForm />} />
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/resellers" element={<ResellerApplicationForm />} />.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### | AFF-037 | Affiliate API (Application Programming Interface) Sandbox | Provide sandbox environment for affiliate..

### Reseller application — Reseller application

- **Ref:** PSR-V6-03467
- **Title:** Reseller application
- **Statement:** Reseller application
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Business checks; W-9; e-sign approvals. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: AFF-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Reseller application [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Reseller application [TEST][UI].

### Reseller application — Reseller application

- **Ref:** PSR-V6-03468
- **Title:** Reseller application
- **Statement:** Reseller application
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Business checks; W-9; e-sign approvals. | ReqID: AFF-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Reseller application [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Reseller microsites [TEST].

## Microsites & tracking links

### Microsite generator — Microsite generator

- **Ref:** PSR-V6-03421
- **Title:** Microsite generator
- **Statement:** Microsite generator
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** /resellers/{{slug}}; assets; copy. | ReqID: AFF-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Microsite generator [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Microsite generator [TEST][UI].

### Microsite generator — Microsite generator

- **Ref:** PSR-V6-03422
- **Title:** Microsite generator
- **Statement:** Microsite generator
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** /resellers/{{slug}}; assets; copy. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: AFF-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Microsite generator [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Check validation for invalid inputs [TEST][UI].

### Notes — Notes: Test covers end-to-end microsite creation and publishing

- **Ref:** PSR-V6-03437
- **Title:** Notes
- **Statement:** Notes: Test covers end-to-end microsite creation and publishing
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test covers end-to-end microsite creation and publishing [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test domain uniqueness validation [OPS][TEST][UI].

### Notes — Notes: Validates public access and rendering of microsite

- **Ref:** PSR-V6-03455
- **Title:** Notes
- **Statement:** Notes: Validates public access and rendering of microsite
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates public access and rendering of microsite [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates uniqueness constraint on slug [TEST][UI].

## Attribution, payouts & statements

### Tracking & payouts — Tracking & payouts

- **Ref:** PSR-V6-03470
- **Title:** Tracking & payouts
- **Statement:** Tracking & payouts
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Clicks; trials; conversions; statements. | ReqID: AFF-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Tracking & payouts [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Tracking & payouts [TEST][UI].

### Tracking & payouts — Tracking & payouts

- **Ref:** PSR-V6-03471
- **Title:** Tracking & payouts
- **Statement:** Tracking & payouts
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Clicks; trials; conversions; statements. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: AFF-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Tracking & payouts [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/affiliates/signup" element={<AffiliateSignUpForm />} /> [TEST][UI].

## APIs & sandbox

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.get('/commissions', async (req, res) => {

- **Ref:** PSR-V6-00234
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.get('/commissions', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /commissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /commissions/dashboard

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.get('/commissions/dashboard', async (req, res) => {

- **Ref:** PSR-V6-00235
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.get('/commissions/dashboard', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /commissions/dashboard.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /referrals

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.patch('/commissions/:id/approve', async (req, res) => {

- **Ref:** PSR-V6-00280
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.patch('/commissions/:id/approve', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: PATCH /commissions/:id/approve.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: PATCH /commissions/:id/reject

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.patch('/commissions/:id/reject', async (req, res) => {

- **Ref:** PSR-V6-00281
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.patch('/commissions/:id/reject', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: PATCH /commissions/:id/reject.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: PATCH /resellers/:id

### API (Application Programming Interface) Endpoint — API (Application Programming Interface) Endpoint: router.post('/commissions', async (req, res) => {

- **Ref:** PSR-V6-00289
- **Title:** API (Application Programming Interface) Endpoint
- **Statement:** API (Application Programming Interface) Endpoint: router.post('/commissions', async (req, res) => {
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /commissions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /referrals

## Security & compliance

### Implement missing security features where needed — Implement missing security features where needed.

- **Ref:** PSR-V6-03416
- **Title:** Implement missing security features where needed
- **Statement:** Implement missing security features where needed.
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “5. Implement missing security features where needed. [COM][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### AFF-010.

### Notes — Notes: Ensures data hygiene and compliance

- **Ref:** PSR-V6-03426
- **Title:** Notes
- **Statement:** Notes: Ensures data hygiene and compliance
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures data hygiene and compliance [COM][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Ensures file size validation is enforced [TEST][UI].

## Notes & constraints

### Notes — Notes: Check validation for invalid inputs

- **Ref:** PSR-V6-03423
- **Title:** Notes
- **Statement:** Notes: Check validation for invalid inputs
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check validation for invalid inputs [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure preview is accurate and isolated from live site [TEST][UI].

### Notes — Notes: Ensure preview is accurate and isolated from live site

- **Ref:** PSR-V6-03424
- **Title:** Notes
- **Statement:** Notes: Ensure preview is accurate and isolated from live site
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure preview is accurate and isolated from live site [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensures asset format validation works [TEST][UI].

### Notes — Notes: Ensures asset format validation works

- **Ref:** PSR-V6-03425
- **Title:** Notes
- **Statement:** Notes: Ensures asset format validation works
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures asset format validation works [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensures data hygiene and compliance [COM][DATA][TEST][UI].

### Notes — Notes: Ensures file size validation is enforced

- **Ref:** PSR-V6-03427
- **Title:** Notes
- **Statement:** Notes: Ensures file size validation is enforced
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures file size validation is enforced [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include test cases for tax ID validation and sanctions screening [OPS][TEST][UI].

### Notes — Notes: Include test cases for tax ID validation and sanctions screening

- **Ref:** PSR-V6-03428
- **Title:** Notes
- **Statement:** Notes: Include test cases for tax ID validation and sanctions screening
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test cases for tax ID validation and sanctions screening [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Include test for reward notification [OPS][TEST][UI].

### Notes — Notes: Include test for reward notification

- **Ref:** PSR-V6-03429
- **Title:** Notes
- **Statement:** Notes: Include test for reward notification
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test for reward notification [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include test for transaction refund and reward revocation [OPS][TEST][UI].

### Notes — Notes: Include test for transaction refund and reward revocation

- **Ref:** PSR-V6-03430
- **Title:** Notes
- **Statement:** Notes: Include test for transaction refund and reward revocation
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test for transaction refund and reward revocation [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Include test for zero reward period [OPS][TEST][UI].

### Notes — Notes: Include test for zero reward period

- **Ref:** PSR-V6-03431
- **Title:** Notes
- **Statement:** Notes: Include test for zero reward period
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test for zero reward period [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include tests for partial period statements on request [OPS][TEST][UI].

### Notes — Notes: Include tests for partial period statements on request

- **Ref:** PSR-V6-03432
- **Title:** Notes
- **Statement:** Notes: Include tests for partial period statements on request
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include tests for partial period statements on request [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include validation for email formats in lead routing [TEST][UI].

### Notes — Notes: Include validation for email formats in lead routing

- **Ref:** PSR-V6-03433
- **Title:** Notes
- **Statement:** Notes: Include validation for email formats in lead routing
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include validation for email formats in lead routing [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test account lockout after multiple failures separately [OPS][TEST][UI].

### Notes — Notes: Test account lockout after multiple failures separately

- **Ref:** PSR-V6-03434
- **Title:** Notes
- **Statement:** Notes: Test account lockout after multiple failures separately
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test account lockout after multiple failures separately [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test both link click and manual code entry [OPS][TEST][UI].

### Notes — Notes: Test both link click and manual code entry

- **Ref:** PSR-V6-03435
- **Title:** Notes
- **Statement:** Notes: Test both link click and manual code entry
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test both link click and manual code entry [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test client and server side validation [OPS][TEST][UI].

### Notes — Notes: Test client and server side validation

- **Ref:** PSR-V6-03436
- **Title:** Notes
- **Statement:** Notes: Test client and server side validation
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test client and server side validation [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test covers end-to-end microsite creation and publishing [OPS][TEST][UI].

### Notes — Notes: Test domain uniqueness validation

- **Ref:** PSR-V6-03438
- **Title:** Notes
- **Statement:** Notes: Test domain uniqueness validation
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test domain uniqueness validation [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test eligibility rules enforcement [OPS][TEST][UI].

### Notes — Notes: Test eligibility rules enforcement

- **Ref:** PSR-V6-03439
- **Title:** Notes
- **Statement:** Notes: Test eligibility rules enforcement
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test eligibility rules enforcement [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test email delivery and logging accuracy [COM][OPS][TEST][UI].

### Notes — Notes: Test email delivery and logging accuracy

- **Ref:** PSR-V6-03440
- **Title:** Notes
- **Statement:** Notes: Test email delivery and logging accuracy
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test email delivery and logging accuracy [COM][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test email delivery via test SMTP [OPS][TEST][UI].

### Notes — Notes: Test email delivery via test SMTP

- **Ref:** PSR-V6-03441
- **Title:** Notes
- **Statement:** Notes: Test email delivery via test SMTP
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test email delivery via test SMTP [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test includes device type capture for mobile clicks [OPS][TEST][UI].

### Notes — Notes: Test includes device type capture for mobile clicks

- **Ref:** PSR-V6-03442
- **Title:** Notes
- **Statement:** Notes: Test includes device type capture for mobile clicks
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test includes device type capture for mobile clicks [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test invalid referral submissions separately [OPS][TEST].

### Notes — Notes: Test link tracking in subsequent flows

- **Ref:** PSR-V6-03443
- **Title:** Notes
- **Statement:** Notes: Test link tracking in subsequent flows
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test link tracking in subsequent flows [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test session timeout separately [OPS][SEC][TEST][UI].

### Notes — Notes: Test session timeout separately

- **Ref:** PSR-V6-03444
- **Title:** Notes
- **Statement:** Notes: Test session timeout separately
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test session timeout separately [OPS][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with both referral link and manual code entry [OPS][TEST][UI].

### Notes — Notes: Test with different volume thresholds

- **Ref:** PSR-V6-03446
- **Title:** Notes
- **Statement:** Notes: Test with different volume thresholds
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with different volume thresholds [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with empty data set as well [DATA][OPS][TEST][UI].

### Notes — Notes: Test with empty data set as well

- **Ref:** PSR-V6-03447
- **Title:** Notes
- **Statement:** Notes: Test with empty data set as well
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with empty data set as well [DATA][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with multiple reward plans to verify correct plan application [OPS][TEST][UI].

### Notes — Notes: Test with multiple reward plans to verify correct plan application

- **Ref:** PSR-V6-03448
- **Title:** Notes
- **Statement:** Notes: Test with multiple reward plans to verify correct plan application
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with multiple reward plans to verify correct plan application [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with transactions including refunds within clawback period [OPS][TEST][UI].

### Notes — Notes: Test with transactions including refunds within clawback period

- **Ref:** PSR-V6-03449
- **Title:** Notes
- **Statement:** Notes: Test with transactions including refunds within clawback period
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with transactions including refunds within clawback period [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Tests attribution window expiry [OPS][TEST][UI].

### Notes — Notes: Tests attribution window expiry

- **Ref:** PSR-V6-03450
- **Title:** Notes
- **Statement:** Notes: Tests attribution window expiry
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Tests attribution window expiry [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validate system prevents invalid assignments [TEST][UI].

### Notes — Notes: Validate system prevents invalid assignments

- **Ref:** PSR-V6-03451
- **Title:** Notes
- **Statement:** Notes: Validate system prevents invalid assignments
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate system prevents invalid assignments [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates admin configuration UI (User Interface) [TEST][UI].

### Notes — Notes: Validates admin configuration UI (User Interface)

- **Ref:** PSR-V6-03452
- **Title:** Notes
- **Statement:** Notes: Validates admin configuration UI (User Interface)
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates admin configuration UI (User Interface) [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates fraud detection logic [OPS][TEST][UI].

### Notes — Notes: Validates fraud detection logic

- **Ref:** PSR-V6-03453
- **Title:** Notes
- **Statement:** Notes: Validates fraud detection logic
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates fraud detection logic [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates happy path referral attribution [TEST][UI].

### Notes — Notes: Validates uniqueness constraint on slug

- **Ref:** PSR-V6-03456
- **Title:** Notes
- **Statement:** Notes: Validates uniqueness constraint on slug
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates uniqueness constraint on slug [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify code format and uniqueness [TEST][UI].

### Notes — Notes: Verify code format and uniqueness

- **Ref:** PSR-V6-03457
- **Title:** Notes
- **Statement:** Notes: Verify code format and uniqueness
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify code format and uniqueness [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify domain uniqueness and branding application [TEST][UI].

### Notes — Notes: Verify domain uniqueness and branding application

- **Ref:** PSR-V6-03458
- **Title:** Notes
- **Statement:** Notes: Verify domain uniqueness and branding application
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify domain uniqueness and branding application [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify effective date enforcement [TEST][UI].

### Notes — Notes: Verify effective date enforcement

- **Ref:** PSR-V6-03459
- **Title:** Notes
- **Statement:** Notes: Verify effective date enforcement
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify effective date enforcement [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify link format and uniqueness [TEST][UI].

### Notes — Notes: Verify link format and uniqueness

- **Ref:** PSR-V6-03460
- **Title:** Notes
- **Statement:** Notes: Verify link format and uniqueness
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify link format and uniqueness [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify no trial conversion recorded if no prior click [TEST][UI].

### Notes — Notes: Verify no trial conversion recorded if no prior click

- **Ref:** PSR-V6-03461
- **Title:** Notes
- **Statement:** Notes: Verify no trial conversion recorded if no prior click
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify no trial conversion recorded if no prior click [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify statement content accuracy [TEST][UI].

### Notes — Notes: Verify statement content accuracy

- **Ref:** PSR-V6-03462
- **Title:** Notes
- **Statement:** Notes: Verify statement content accuracy
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify statement content accuracy [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify system retries after data correction [DATA][TEST][UI].

### Notes — Notes: Verify system retries after data correction

- **Ref:** PSR-V6-03463
- **Title:** Notes
- **Statement:** Notes: Verify system retries after data correction
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify system retries after data correction [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify W-9 upload accepts only PDF or image formats [TEST][UI].

### Notes — Notes: Verify W-9 upload accepts only PDF or image formats

- **Ref:** PSR-V6-03464
- **Title:** Notes
- **Statement:** Notes: Verify W-9 upload accepts only PDF or image formats
- **Domain/Module:** AFR / Affiliates-Resellers-Referrals
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Affiliate (Affiliate Marketer) or Reseller (Reseller Partner)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify W-9 upload accepts only PDF or image formats [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Referral reward calculation and statements [DATA][TEST][UI].

