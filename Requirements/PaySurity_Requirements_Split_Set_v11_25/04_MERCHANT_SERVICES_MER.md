# 04 MERCHANT SERVICES MER (Polished v1)

**Generated:** 2026-02-10 04:09:51 (America/Chicago)

**Covers capability area(s):** Merchant Services & Merchant Portal

_Contains 163 requirements._
**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

## Scope notes (avoid confusion)
- PaySurity.com SEO pages and top-of-funnel CTAs live in `03_PUBLIC_WEBSITE_COM.md`.
- Contract acceptance/e-sign workflows live in `05_MERCHANT_ONBOARDING_ONB.md`; this module focuses on merchant-facing operations after onboarding.
- RBAC, audit logs, test runner, health dashboards, and job queue controls live in `01_FOUNDATION_ADM.md`.
- POS/E-commerce inventory/product CRUD lives in `09_ECOMMERCE_ECO.md` and POS modules; this module focuses on payment processing + merchant portal operations.

# Merchant Services & Merchant Portal

## Core Processing & Portal

### App and 1 Other Functions

- **Ref:** PSR-V6-02778
- **Domain/Module:** MER / Merchant Portal
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “App and 1 Other Functions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Business document upload

- **Ref:** PSR-V6-02588
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Upload and verify business license, bank statements, ownership docs | AcceptanceCriteria: OCR extracts text | Document type validated | Storage encrypted | Verification status tracked | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Business document upload.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02594
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02595
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02596
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02597
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02598
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02599
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02600
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02601
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `IF` for merchant operations

- **Ref:** PSR-V6-02602
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `IF` for merchant operations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Level II/III data support

- **Ref:** PSR-V6-02610
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Capture extra fields to lower interchange where eligible. | acceptancetests: - Eligible B2B txns show reduced fees in statement. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Level II/III data support.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant account hierarchy and locations

- **Ref:** PSR-V6-02612
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Support master merchant accounts with child locations and sub merchants each with configuration limits fee plans and reporting
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant account hierarchy and locations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant KYB capture

- **Ref:** PSR-V6-02613
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Complete business verification with EIN, ownership details and bank account validation | AcceptanceCriteria: Form validates required fields | Owner KYC (Know Your Customer) screened | Bank micro-deposit verified | Status moves Pending→Approved | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant KYB capture.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Merchant KYB onboarding

- **Ref:** PSR-V6-02614
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** End-to-end merchant onboarding with business verification, owner KYC (Know Your Customer), and banking setup | AcceptanceCriteria: Collects business info, EIN, UBO details | Verifies business licenses | Validates bank accounts | Generates unique Merchant ID | Moves application through Ready/Pending/Rejected states | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant KYB onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Mobile Merchant Onboarding

- **Ref:** PSR-V6-02619
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Mobile-first merchant signup with instant form validation and document upload | AcceptanceCriteria: Form validates required fields | Document OCR extracts text | Real-time KYC (Know Your Customer) scoring | Status moves Pending→Approved in <2min | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Mobile Merchant Onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Multi-gateway payment processing

- **Ref:** PSR-V6-02620
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Process payments through multiple gateways (Stripe/PayPal/Adyen) with failover support | AcceptanceCriteria: Routes transactions to configured gateway | Handles gateway failures with automatic retry | Maintains idempotency keys | Returns standardized response format | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi-gateway payment processing.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Multi-gateway routing

- **Ref:** PSR-V6-02621
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Route transactions to primary/secondary processors with failover | AcceptanceCriteria: Primary processor selected | Failover on timeout | Least-cost routing | Circuit breaker active | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi-gateway routing.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Check file integrity and formatting

- **Ref:** PSR-V6-02622
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check file integrity and formatting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure UI (User Interface) is responsive and accessible

- **Ref:** PSR-V6-02623
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure UI (User Interface) is responsive and accessible.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure uniqueness validation is enforced

- **Ref:** PSR-V6-02625
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure uniqueness validation is enforced.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensures case queue workflow functions

- **Ref:** PSR-V6-02627
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures case queue workflow functions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Focus on validation and successful creation

- **Ref:** PSR-V6-02628
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Focus on validation and successful creation.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include edge cases with new product adoption mid-cycle

- **Ref:** PSR-V6-02630
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include edge cases with new product adoption mid-cycle.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test baseline real-time scoring

- **Ref:** PSR-V6-02632
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test baseline real-time scoring.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test boundary and invalid inputs

- **Ref:** PSR-V6-02634
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test boundary and invalid inputs.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test configuration inheritance logic

- **Ref:** PSR-V6-02635
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test configuration inheritance logic.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test edge cases like date range at system limits

- **Ref:** PSR-V6-02636
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test edge cases like date range at system limits.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test error message clarity and UI (User Interface) behavior

- **Ref:** PSR-V6-02637
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test error message clarity and UI (User Interface) behavior.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test escalation path if resolution fails

- **Ref:** PSR-V6-02638
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test escalation path if resolution fails.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test input validation robustness

- **Ref:** PSR-V6-02641
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test input validation robustness.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test opt-out of email notifications

- **Ref:** PSR-V6-02642
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test opt-out of email notifications.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test retry mechanism on email failure

- **Ref:** PSR-V6-02644
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test retry mechanism on email failure.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test validation errors and approval workflow for large adjustments

- **Ref:** PSR-V6-02645
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test validation errors and approval workflow for large adjustments.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with both matching and mismatching data

- **Ref:** PSR-V6-02646
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with both matching and mismatching data.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with multiple acquirer file formats

- **Ref:** PSR-V6-02647
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with multiple acquirer file formats.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with various document formats and sizes within limits

- **Ref:** PSR-V6-02648
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with various document formats and sizes within limits.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with various document types and sizes

- **Ref:** PSR-V6-02649
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with various document types and sizes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validate compliance with EMV standards

- **Ref:** PSR-V6-02651
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate compliance with EMV standards.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Validate data accuracy and performance

- **Ref:** PSR-V6-02652
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate data accuracy and performance.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validate required fields and default configurations

- **Ref:** PSR-V6-02653
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate required fields and default configurations.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates DLQ handling and alerting

- **Ref:** PSR-V6-02654
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates DLQ handling and alerting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates replay protection mechanisms

- **Ref:** PSR-V6-02656
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates replay protection mechanisms.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify error if transaction already captured

- **Ref:** PSR-V6-02659
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify error if transaction already captured.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify error messages are clear and specific

- **Ref:** PSR-V6-02660
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify error messages are clear and specific.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify uniqueness of serial number

- **Ref:** PSR-V6-02665
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify uniqueness of serial number.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify update flow and confirmation

- **Ref:** PSR-V6-02666
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify update flow and confirmation.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Reserve calculation

- **Ref:** PSR-V6-02674
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Calculate and maintain risk-based reserve accounts | AcceptanceCriteria: Reserve % calculated | Funds held appropriately | Release schedules tracked | Reports generated | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Reserve calculation.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Results + PDF + CTA

- **Ref:** PSR-V6-02675
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Show breakdown + downloadable PDF + 'Talk to Sales'. | acceptancetests: - PDF renders clean; CTA creates lead. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Results + PDF + CTA.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Level II/III data support

- **Ref:** PSR-V6-03800
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Details:** Capture extra fields to lower interchange where eligible.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Level II/III data support.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Smart transaction routing

- **Ref:** PSR-V6-03787
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Route by BIN/cost/health; automatic failover
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Smart transaction routing.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Terminals

- **Ref:** PSR-V6-03799
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Details:** Device registry, firmware, EMV.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Terminals.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Savings computation

- **Ref:** PSR-V6-02678
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Compare current costs vs PaySurity plan(s). | acceptancetests: - Outputs effective rate now vs proposed; sensitivity slider shows ranges. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Savings computation.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Transaction monitoring

- **Ref:** PSR-V6-02686
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Real-time scoring and flagging of suspicious transactions | AcceptanceCriteria: Score > threshold holds funds | Alert to compliance team | Logs all decisions | Supports rule updates | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Transaction monitoring.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### UI (User Interface) Component: <Route path="/auth" element={<AuthPage />} />

- **Ref:** PSR-V6-02689
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/auth" element={<AuthPage />} />.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: async del(path: string, options: RequestInit = {}) {

- **Ref:** PSR-V6-02690
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: async del(path: string, options: RequestInit = {}) {.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: async get(path: string, options: RequestInit = {}) {

- **Ref:** PSR-V6-02691
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: async get(path: string, options: RequestInit = {}) {.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: async post(path: string, body: any, options: RequestInit = {}) {

- **Ref:** PSR-V6-02692
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: async post(path: string, body: any, options: RequestInit = {}) {.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: async put(path: string, body: any, options: RequestInit = {}) {

- **Ref:** PSR-V6-02693
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: async put(path: string, body: any, options: RequestInit = {}) {.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: component: ChartWidget,

- **Ref:** PSR-V6-02694
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: component: ChartWidget,.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: component: MetricsWidget,

- **Ref:** PSR-V6-02695
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: component: MetricsWidget,.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Tests batch processing accuracy

- **Ref:** PSR-V6-02650
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Tests batch processing accuracy.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Pricing & Fees

### API (Application Programming Interface) Rate Limiting

- **Ref:** PSR-V6-02579
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Throttle API (Application Programming Interface) calls to 100 RPM per merchant with burst handling | AcceptanceCriteria: Token bucket algorithm with Redis | Jitter for burst traffic | Zero 429 errors at 1,000 RPM | Metrics exported | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Rate Limiting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Configurable pricing and fee programs

- **Ref:** PSR-V6-02592
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Provide rule engine for interchange plus flat rate surcharging cash discount and convenience fee programs at multiple levels
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Configurable pricing and fee programs.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Fee & rate normalization

- **Ref:** PSR-V6-02604
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Map statement fields to canonical model. | acceptancetests: - Normalized record includes volume, avg ticket, auths, chargebacks, fixed/variable fees. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Fee & rate normalization.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Interchange optimization

- **Ref:** PSR-V6-02606
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Capture Level 2/3 data for interchange cost reduction | AcceptanceCriteria: Level 2 data submitted | Level 3 data captured | Durbin compliance verified | Routing optimized | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Interchange optimization.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant statements and fee transparency

- **Ref:** PSR-V6-02618
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Generate monthly and on demand statements showing volume fees chargebacks adjustments and net deposits with export options
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant statements and fee transparency.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include cases with waived fees

- **Ref:** PSR-V6-02629
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include cases with waived fees.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test basic flat fee configuration

- **Ref:** PSR-V6-02633
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test basic flat fee configuration.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test full refund and over-refund separately

- **Ref:** PSR-V6-02639
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test full refund and over-refund separately.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Test inheritance of fee plan if not specified

- **Ref:** PSR-V6-02640
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test inheritance of fee plan if not specified.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test partial capture in separate test

- **Ref:** PSR-V6-02643
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test partial capture in separate test.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify both PDF and CSV (Comma-Separated Values) exports

- **Ref:** PSR-V6-02658
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify both PDF and CSV (Comma-Separated Values) exports.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify fee calculation accuracy

- **Ref:** PSR-V6-02661
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify fee calculation accuracy.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify fee calculation accuracy in statement

- **Ref:** PSR-V6-02662
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify fee calculation accuracy in statement.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify manual override process separately

- **Ref:** PSR-V6-02663
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify manual override process separately.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Pricing & fees

- **Ref:** PSR-V6-02668
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Flat/interchange++/blended; statement of fees; calculator. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Pricing & fees.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Pricing & fees

- **Ref:** PSR-V6-02669
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Flat/interchange++/blended; statement of fees; calculator. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Pricing & fees.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Pricing & fees

- **Ref:** PSR-V6-02670
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Flat/interchange++/blended; statement of fees; calculator. | SemanticNotes: The provided code bundle contains no files or code related to pricing, fees, or calculators. The only files present relate to unrelated modules such as affiliates and GitHub workflows. There is no implementation of the pricing module or any pricing/fee calculation logic. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Pricing & fees.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Pricing & fees

- **Ref:** PSR-V6-03795
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Flat/interchange++/blended; statement of fees; calculator.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Pricing & fees.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Transparent fee structure

- **Ref:** PSR-V6-02688
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Clear and transparent fee disclosure with no hidden charges | AcceptanceCriteria: Fee disclosure | No hidden charges | Real-time calculation | Refund policy clear | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Transparent fee structure.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Risk & Fraud Controls

## Billing & Invoicing

### Auto-Recurring Billing

- **Ref:** PSR-V6-02586
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Recurring billing with stored payment instruments and dunning workflows | AcceptanceCriteria: Charges process on due date | Retry failed charges 3x over 7 days | Webhook alerts for failures | 99.9% success rate | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auto-Recurring Billing.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Subscription Billing

- **Ref:** PSR-V6-02685
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Tiered subscription plans with prorated upgrades and downgrades | AcceptanceCriteria: $99/month base plan | Prorated billing logic | 95% merchant retention | Usage metrics | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Subscription Billing.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Core Processing & Portal

## Settlement & Funding

### MER API: GET /api/payouts

- **Ref:** PSR-V6-02565
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: GET /api/payouts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Automated settlement

- **Ref:** PSR-V6-02587
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Batch and settle transactions to merchant accounts with reconciliation | AcceptanceCriteria: Batch creation daily | Settlement files generated | Reconciliation reports | Exception handling | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Automated settlement.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Daily batch settlement

- **Ref:** PSR-V6-02593
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Process daily batches and generate settlement reports | AcceptanceCriteria: Batches closed by 2AM | Settlement files generated | Funding calculated | Reports distributed | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Daily batch settlement.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Merchant settlement reporting

- **Ref:** PSR-V6-02617
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Generate daily settlement reports with fee calculations | AcceptanceCriteria: Fees calculated correctly | Net amounts accurate | Reports generated daily | Export formats supported | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant settlement reporting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Settlement & payouts

- **Ref:** PSR-V6-03792
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Funding schedule, fees netting, reconciliation.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Settlement & payouts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Settlement & payouts (D+2 baseline)

- **Ref:** PSR-V6-02681
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Compute payouts, create reports, flag variances. | acceptancetests: - Ingest batch; compute payout; mismatch > threshold raises alert. - Export CSV (Comma-Separated Values)/PDF per cycle. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Settlement & payouts (D+2 baseline).”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Settlement & payouts

- **Ref:** PSR-V6-02679
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Funding schedule, fees netting, reconciliation. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Settlement & payouts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Settlement & payouts

- **Ref:** PSR-V6-02680
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Funding schedule, fees netting, reconciliation. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Settlement & payouts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Settlement calendar

- **Ref:** PSR-V6-02682
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Automated settlement with reserve accounting and holiday-aware scheduling | AcceptanceCriteria: D+0/1/2 schedules calculated | Weekend/holiday logic applied | Reserve ledgers maintained | GL mapping correct | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Settlement calendar.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Settlement reconciliation and exceptions

- **Ref:** PSR-V6-02683
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Reconcile acquirer settlement files funding events and merchant balances and highlight breaks and missing deposits with resolution workflows
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Settlement reconciliation and exceptions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## Rehomed from 03_PUBLIC_WEBSITE_COM (polish pass)

## Disputes, Refunds & Chargebacks

### Auth/Capture/Refund core

- **Ref:** PSR-V6-02580
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Support auth, capture, void, refund with idempotency | AcceptanceCriteria: Auth returns token | Capture settles with batch id | Refund idempotent | Errors logged | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auth/Capture/Refund core.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Auth/Capture/Void/Refund

- **Ref:** PSR-V6-02585
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Card-present/online; retries; 3DS; partial captures/refunds. | SemanticNotes: The provided code bundle contains only configuration files and linting setups with no implementation of payment processing logic or any functions related to authorization, capture, void, refund, retries, 3DS, or partial operations. There is no evidence of any code implementing the MS-003 requirement. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auth/Capture/Void/Refund.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Auth/Capture/Void/Refund

- **Ref:** PSR-V6-02581
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Support payment operations with idempotency and partial capture capability | AcceptanceCriteria: Auth returns token | Capture settles with batch id | Refund idempotent | Partial capture supported | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auth/Capture/Void/Refund.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Auth/Capture/Void/Refund

- **Ref:** PSR-V6-02582
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Card-present/online; retries; 3DS; partial captures/refunds. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auth/Capture/Void/Refund.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Auth/Capture/Void/Refund

- **Ref:** PSR-V6-02583
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Card-present/online; retries; 3DS; partial captures/refunds. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auth/Capture/Void/Refund.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Auth/Capture/Void/Refund

- **Ref:** PSR-V6-02584
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Auth/Capture/Void/Refund.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Chargebacks & disputes

- **Ref:** PSR-V6-02590
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Evidence pack, deadlines, notifications. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Chargebacks & disputes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Chargebacks & disputes

- **Ref:** PSR-V6-02591
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Evidence pack, deadlines, notifications. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Chargebacks & disputes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Disputes & chargebacks

- **Ref:** PSR-V6-02603
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Ingest disputes; deadlines; evidence pack creation. | acceptancetests: - Create dispute; upload evidence; status synced. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Disputes & chargebacks.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates refund amount limits

- **Ref:** PSR-V6-02655
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates refund amount limits.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Auth/Capture/Void/Refund

- **Ref:** PSR-V6-03791
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Card-present/online; retries; 3DS; partial captures/refunds.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Auth/Capture/Void/Refund.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Chargebacks & disputes

- **Ref:** PSR-V6-03796
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Evidence pack, deadlines, notifications.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Chargebacks & disputes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Disputes automation

- **Ref:** PSR-V6-03789
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Evidence builder, statuses, SLA timers, webhooks
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Disputes automation.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Merchant Reporting & Statements

## Merchant Reporting & Statements

### Notes: Ensure uniqueness of tax ID across sub merchants

- **Ref:** PSR-V6-02624
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure uniqueness of tax ID across sub merchants.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### API (Application Programming Interface) Endpoint: router.get('/dashboard/stats',

- **Ref:** PSR-V6-02572
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/dashboard/stats',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure user is not shown empty or misleading report

- **Ref:** PSR-V6-02626
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure user is not shown empty or misleading report.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify report generation time is within acceptable limits

- **Ref:** PSR-V6-02664
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify report generation time is within acceptable limits.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Reporting

- **Ref:** PSR-V6-02672
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Daily summaries, fee breakdown, interchange detail. | SemanticNotes: The provided code bundle contains no files, functions, classes, or modules related to reporting or the Merchant Services reporting module. There is no implementation of daily summaries, fee breakdowns, or interchange detail reports. The requirement is marked as planned and not implemented, and the code bundle confirms no relevant code exists. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Reporting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Reporting

- **Ref:** PSR-V6-02671
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Daily summaries, fee breakdown, interchange detail. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Reporting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Reporting

- **Ref:** PSR-V6-02673
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Daily summaries, fee breakdown, interchange detail. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Reporting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Reporting

- **Ref:** PSR-V6-03797
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Daily summaries, fee breakdown, interchange detail.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Reporting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Statement upload + OCR

- **Ref:** PSR-V6-02684
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Accept PDF/Images; extract totals, rates, fees, SIC. | acceptancetests: - 3 sample statements parse with ≥ 98% required fields. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Statement upload + OCR.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Transaction reporting

- **Ref:** PSR-V6-02687
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Generate daily settlement reports with fees and net amounts | AcceptanceCriteria: Report includes gross sales | Fees calculated correctly | Net amount matches bank deposit | Available by 6AM local time | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Transaction reporting.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## Pricing & Fees

## Risk & Fraud Controls

### AI KYC (Know Your Customer) Verification

- **Ref:** PSR-V6-02559
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Automated KYC (Know Your Customer) with Alloy API (Application Programming Interface), document OCR, and AI fraud scoring | AcceptanceCriteria: Business license verified | EIN validated | Ownership confirmed | <5% false positives | (Know Your Customer)-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AI KYC (Know Your Customer) Verification.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYB/KYC (Know Your Customer) onboarding

- **Ref:** PSR-V6-02607
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Business/legal/ownership verification; risk scoring; Adyen account link. | SemanticNotes: The provided code bundle only contains a GitHub Actions workflow to enforce PR titles referencing requirement IDs. There is no implementation related to KYB/KYC (Know Your Customer) onboarding, risk scoring, or Adyen integration. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYB/KYC (Know Your Customer) onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYB/KYC (Know Your Customer) onboarding

- **Ref:** PSR-V6-02608
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Business/legal/ownership verification; risk scoring; Adyen account link. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYB/KYC (Know Your Customer) onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYB/KYC (Know Your Customer) onboarding

- **Ref:** PSR-V6-02609
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Business/legal/ownership verification; risk scoring; Adyen account link. | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYB/KYC (Know Your Customer) onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Merchant onboarding & KYB/KYC (Know Your Customer)

- **Ref:** PSR-V6-02615
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Collect business + owner data, run checks, store evidence. | acceptancetests: - Submit application; KYB/KYC (Know Your Customer) statuses tracked (pending/approved/rejected). - Required docs uploaded and retained. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant onboarding & KYB/KYC (Know Your Customer).”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: KYB/KYC onboarding

- **Ref:** PSR-V6-03790
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Business/legal/ownership verification; risk scoring; Adyen account link.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: KYB/KYC onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Merchant onboarding & KYB/KYC

- **Ref:** PSR-V6-03793
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Collect business + owner data, run checks, store evidence.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Merchant onboarding & KYB/KYC.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### AI Fraud Prevention

- **Ref:** PSR-V6-02558
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** AI-driven chargeback prediction and blocklist synchronization | AcceptanceCriteria: Signifyd integration | ML models trained | 40% fraud reduction | Real-time blocking | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AI Fraud Prevention.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant Risk Scoring

- **Ref:** PSR-V6-02616
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Calculate merchant risk scores based on industry, volume, and historical chargebacks | AcceptanceCriteria: Risk scores calculated | Industry factors applied | Chargeback history considered | Approval thresholds met | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Merchant Risk Scoring.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates velocity check enforcement

- **Ref:** PSR-V6-02657
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates velocity check enforcement.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Risk scoring and fraud controls

- **Ref:** PSR-V6-02676
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Details:** Apply real time and batch risk scoring velocity checks and fraud rules on transactions with configurable thresholds and case queues
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Risk scoring and fraud controls.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Risk scoring automation

- **Ref:** PSR-V6-02677
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Automated risk assessment with credit checks and OFAC screening | AcceptanceCriteria: Risk score 0-1000 generated | Auto-approval above 750 | Manual review 400-750 | Decline below 400 | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Risk scoring automation.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Settlement & Funding

## Loyalty & Rewards

### Loyalty Program Engine

- **Ref:** PSR-V6-02611
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Customizable rewards and gift card support with blockchain tracking | AcceptanceCriteria: GraphQL API (Application Programming Interface) | Gift card support | 20% repeat purchase increase | Points tracking | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Loyalty Program Engine.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Integrations & APIs

### MER API: DELETE /api/merchants/:id

- **Ref:** PSR-V6-02560
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: DELETE /api/merchants/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: GET /api/merchants

- **Ref:** PSR-V6-02561
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: GET /api/merchants.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: GET /api/merchants/:id

- **Ref:** PSR-V6-02562
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: GET /api/merchants/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: GET /api/merchants/:id

- **Ref:** PSR-V6-02563
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: GET /api/merchants/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: GET /api/merchantsettings

- **Ref:** PSR-V6-02564
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: GET /api/merchantsettings.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: POST /api/merchants

- **Ref:** PSR-V6-02566
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: POST /api/merchants.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: POST /api/merchants

- **Ref:** PSR-V6-02567
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: POST /api/merchants.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### MER API: POST /api/merchantsettings

- **Ref:** PSR-V6-02568
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER API: POST /api/merchantsettings.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/:id',

- **Ref:** PSR-V6-02569
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/:id',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/:id/metrics',

- **Ref:** PSR-V6-02570
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/:id/metrics',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/applications',

- **Ref:** PSR-V6-02571
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/applications',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.post('/',

- **Ref:** PSR-V6-02573
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.post('/',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.post('/:id/activate',

- **Ref:** PSR-V6-02574
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.post('/:id/activate',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.post('/:id/suspend',

- **Ref:** PSR-V6-02575
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.post('/:id/suspend',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.post('/applications',

- **Ref:** PSR-V6-02576
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.post('/applications',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.post('/applications/:id/review',

- **Ref:** PSR-V6-02577
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.post('/applications/:id/review',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.post('/applications/:id/submit',

- **Ref:** PSR-V6-02578
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.post('/applications/:id/submit',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Card tokenization + vault

- **Ref:** PSR-V6-02589
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Network tokenization + PCI (Payment Card Industry)-safe storage. | acceptancetests: - PAN never stored; tokens used for all ops. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Card tokenization + vault.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### FluidPay integration

- **Ref:** PSR-V6-02605
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Integrate with FluidPay for auth, capture, refund, and settlement | AcceptanceCriteria: Endpoints authenticated | Error handling implemented | Retry logic working | Settlement files processed | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “FluidPay integration.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Simulate API (Application Programming Interface) failures to test retry logic

- **Ref:** PSR-V6-02631
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Simulate API (Application Programming Interface) failures to test retry logic.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### PCI (Payment Card Industry) DSS Tokenization

- **Ref:** PSR-V6-02667
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Details:** Encrypt payment data at rest and in transit with tokenization for card data | AcceptanceCriteria: AES-256 encryption at rest | TLS 1.3 for transit | Tokenization replaces PAN | Quarterly ASV scans pass | - **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “PCI (Payment Card Industry) DSS Tokenization.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Card tokenization + vault

- **Ref:** PSR-V6-03794
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Network tokenization + PCI-safe storage.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Card tokenization + vault.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Network tokenization + vault

- **Ref:** PSR-V6-03788
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** compliance
- **Details:** SAQ A profile; no PAN in our DB
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Network tokenization + vault.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Webhooks

- **Ref:** PSR-V6-03798
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Signatures, replay protection, DLQ.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Webhooks.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/payments/:paymentId',

- **Ref:** PSR-V6-02696
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/payments/:paymentId',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/payments/:paymentId/capture',

- **Ref:** PSR-V6-02697
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/payments/:paymentId/capture',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/v1/payments/{id}',

- **Ref:** PSR-V6-02698
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/v1/payments/{id}',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Webhooks for events

- **Ref:** PSR-V6-02699
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** payment.created/refunded/disputed etc. | acceptancetests: - Subscriber receives signed events; retries on failure. | | 
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Webhooks for events.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Disputes, Refunds & Chargebacks

## Addendum (clarified target-state requirements)

_These requirements close clarity gaps and prevent agent confusion. Temporary IDs until the ID assignment step is run._

### Merchant Portal SHALL display the merchant’s current pricing plan, fee schedule, and effective rate summaries in a human-readable view

- **Ref:** PSR-EXT-MER-20260209-001
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** a Merchant Admin is authenticated in the Merchant Portal, **when** the admin uses the Merchant Services capability, **then** the system SHALL satisfy: “Merchant Portal SHALL display the merchant’s current pricing plan, fee schedule, and effective rate summaries in a human-readable view.”.
- **Given** RBAC denies the action, **when** an unauthorized user attempts it, **then** the system SHALL block the action and return HTTP 403 (or equivalent UI error) without state change.
- **Given** automated tests exist, **when** CI runs, **then** tests SHALL pass with deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoints and sanitized examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### Merchant Portal SHALL provide access to signed onboarding agreements and pricing change history (view/download) with audit logging

- **Ref:** PSR-EXT-MER-20260209-002
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** a Merchant Admin is authenticated in the Merchant Portal, **when** the admin uses the Merchant Services capability, **then** the system SHALL satisfy: “Merchant Portal SHALL provide access to signed onboarding agreements and pricing change history (view/download) with audit logging.”.
- **Given** RBAC denies the action, **when** an unauthorized user attempts it, **then** the system SHALL block the action and return HTTP 403 (or equivalent UI error) without state change.
- **Given** automated tests exist, **when** CI runs, **then** tests SHALL pass with deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoints and sanitized examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### PaySurity loyalty rewards for merchants/tenants SHALL be configurable by Super Admin and SHALL award benefits based on measurable criteria (e.g., volume tiers) with reporting

- **Ref:** PSR-EXT-MER-20260209-003
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** a Merchant Admin is authenticated in the Merchant Portal, **when** the admin uses the Merchant Services capability, **then** the system SHALL satisfy: “PaySurity loyalty rewards for merchants/tenants SHALL be configurable by Super Admin and SHALL award benefits based on measurable criteria (e.g., volume tiers) with reporting.”.
- **Given** RBAC denies the action, **when** an unauthorized user attempts it, **then** the system SHALL block the action and return HTTP 403 (or equivalent UI error) without state change.
- **Given** automated tests exist, **when** CI runs, **then** tests SHALL pass with deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoints and sanitized examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### Each merchant/tenant SHALL be able to configure customer-facing loyalty rewards (points, discounts, offers) that integrate with POS and E-commerce checkout flows

- **Ref:** PSR-EXT-MER-20260209-004
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** a Merchant Admin is authenticated in the Merchant Portal, **when** the admin uses the Merchant Services capability, **then** the system SHALL satisfy: “Each merchant/tenant SHALL be able to configure customer-facing loyalty rewards (points, discounts, offers) that integrate with POS and E-commerce checkout flows.”.
- **Given** RBAC denies the action, **when** an unauthorized user attempts it, **then** the system SHALL block the action and return HTTP 403 (or equivalent UI error) without state change.
- **Given** automated tests exist, **when** CI runs, **then** tests SHALL pass with deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoints and sanitized examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### Merchant Services SHALL expose webhook subscriptions for key payment lifecycle events with signature verification and retry/backoff

- **Ref:** PSR-EXT-MER-20260209-005
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** a Merchant Admin is authenticated in the Merchant Portal, **when** the admin uses the Merchant Services capability, **then** the system SHALL satisfy: “Merchant Services SHALL expose webhook subscriptions for key payment lifecycle events with signature verification and retry/backoff.”.
- **Given** RBAC denies the action, **when** an unauthorized user attempts it, **then** the system SHALL block the action and return HTTP 403 (or equivalent UI error) without state change.
- **Given** automated tests exist, **when** CI runs, **then** tests SHALL pass with deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoints and sanitized examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### Merchant Services SHALL provide an operator-safe “pause processing” control per merchant (freeze/unfreeze) with reason codes, notifications, and audit trail

- **Ref:** PSR-EXT-MER-20260209-006
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** a Merchant Admin is authenticated in the Merchant Portal, **when** the admin uses the Merchant Services capability, **then** the system SHALL satisfy: “Merchant Services SHALL provide an operator-safe “pause processing” control per merchant (freeze/unfreeze) with reason codes, notifications, and audit trail.”.
- **Given** RBAC denies the action, **when** an unauthorized user attempts it, **then** the system SHALL block the action and return HTTP 403 (or equivalent UI error) without state change.
- **Given** automated tests exist, **when** CI runs, **then** tests SHALL pass with deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI route(s), screenshots or test selectors.
  - API endpoints and sanitized examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

## Dedup guidance (do not delete requirements)

Duplicate statements detected; implement once and mark others as “covered by” in evidence:

- DB schema SHALL define table `IF` for merchant operations. (x9)
- Auth/Capture/Void/Refund. (x5)
- Pricing & fees. (x3)
- Reporting. (x3)
- KYB/KYC (Know Your Customer) onboarding. (x3)
- Settlement & payouts. (x2)
- Chargebacks & disputes. (x2)
- MER API: GET /api/merchants/:id. (x2)
- MER API: POST /api/merchants. (x2)

## Addendum (2026-02-10): Statement skin + cadence + print delivery (ISO-only settlement)

- **Ref:** PSR-EXT-MER-20260210-001
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Statements must remain mathematically consistent with processor totals; branding must not alter amounts or descriptors.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Merchant statements SHALL be displayed in PaySurity with a branded ‘skin’ (logo, colors, support contacts, legal footer) while preserving processor-of-record numbers and line items.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI routes/screenshots or stable selectors.
  - API endpoints + example payloads (sanitized).
  - Data entities/migrations (if any).
  - Tests + CI run link/output.

- **Ref:** PSR-EXT-MER-20260210-002
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Daily/weekly views are ‘activity summaries’; monthly is the official statement period. Display timezone and period boundaries.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Merchants SHALL be able to view statements and activity in configurable periods: daily, weekly, and monthly, with real-time/near-real-time transaction activity views and clear cutoff timestamps.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI routes/screenshots or stable selectors.
  - API endpoints + example payloads (sanitized).
  - Data entities/migrations (if any).
  - Tests + CI run link/output.

- **Ref:** PSR-EXT-MER-20260210-003
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Exports must include fee breakdowns, adjustments, chargebacks, refunds, and net settlement amounts as provided by the processor.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Merchants SHALL be able to download/export statement artifacts as PDF and CSV for any period, and schedule recurring email delivery for monthly statements.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI routes/screenshots or stable selectors.
  - API endpoints + example payloads (sanitized).
  - Data entities/migrations (if any).
  - Tests + CI run link/output.

- **Ref:** PSR-EXT-MER-20260210-004
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Print workflow may integrate with a print-and-mail provider (configurable) or internal fulfillment; include audit logs of generation and dispatch.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Merchants SHALL be able to opt in to printed monthly statements, manage mailing addresses, and choose delivery preferences; PaySurity SHALL produce print-ready PDFs and track delivery status.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI routes/screenshots or stable selectors.
  - API endpoints + example payloads (sanitized).
  - Data entities/migrations (if any).
  - Tests + CI run link/output.

- **Ref:** PSR-EXT-MER-20260210-005
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** This is a compliance guardrail to prevent PayFac-like fund flow assumptions; keep wording merchant-friendly.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “PaySurity SHALL NOT custody or remit card settlement funds in Phase 1; the portal SHALL clearly represent that settlement funding is delivered by the processor/acquirer directly to the merchant bank account.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI routes/screenshots or stable selectors.
  - API endpoints + example payloads (sanitized).
  - Data entities/migrations (if any).
  - Tests + CI run link/output.

- **Ref:** PSR-EXT-MER-20260210-006
- **Domain/Module:** MER / Merchant Services
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Includes template versioning, preview, and rollback.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Super Admin/Sub Super Admin SHALL be able to configure statement branding templates, statement period definitions, and print/email delivery settings, and monitor statement generation jobs.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
  - UI routes/screenshots or stable selectors.
  - API endpoints + example payloads (sanitized).
  - Data entities/migrations (if any).
  - Tests + CI run link/output.
