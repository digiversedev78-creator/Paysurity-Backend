# 05 MERCHANT ONBOARDING ONB (Polished v2)

**Generated:** 2026-02-10 04:15:55 (America/Chicago)

**Covers capability area(s):** Merchant onboarding, underwriting intake, document capture, e-sign acceptance.

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

## Scope notes (avoid confusion)
- Payment processing lifecycle, merchant portal operations: `04_MERCHANT_SERVICES_MER.md`.
- Payment orchestration / routing / gateways: `08_PAYMENT_ORCHESTRATION_ORC.md`.
- Public site top-of-funnel SEO pages: `03_PUBLIC_WEBSITE_COM.md`.
- Admin dashboards, audit logs, test runner, health, system metrics: `01_FOUNDATION_ADM.md`.
- PCI/PII/security baselines: `15_SECURITY_PRIVACY.md` and `16_COMPLIANCE_LEGAL.md`.

# Merchant onboarding requirements

## Merchant onboarding workflow

## Go-live (definition and triggers)

### Go-live (definition and triggers)

- **Go-live** is the moment a Merchant transitions from onboarding/configuration to production operations.
- A Merchant SHALL be considered **Go-live = TRUE** when **any** of the following occurs (earliest timestamp wins):
  1) The system records the **first successful production financial transaction** for the Merchant (sale/capture/refund/settlement event marked production), OR
  2) A Super Admin/Sub Super Admin sets `merchant.go_live_at` explicitly (manual activation), OR
  3) A Merchant Admin completes onboarding and clicks an explicit “Activate / Go live” action **and** the system validates all required readiness checks (entitlements, device registration if required, pricing acceptance, compliance flags).
- Once `merchant.go_live_at` is set, “post-go-live” rules apply (e.g., POS module selection becomes change-request + approval only).


### POS module auto-selection and controlled override (onboarding gate)

- **Ref:** PSR-EXT-POS-OVERRIDE-20260210-001
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Notes:**
  - Default POS module SHALL be auto-selected from merchant industry classification (NAICS/SIC).
  - Merchant Admin SHALL be allowed a **controlled override** only during onboarding (pre-go-live).
  - Post-go-live changes SHALL require a request + approval workflow.
- **Acceptance Criteria (GWT):**
  - **Given** a Merchant Admin is completing onboarding and the system has derived a recommended POS module from NAICS/SIC, **when** the Merchant Admin accepts the recommendation, **then** the system SHALL persist the POS module selection for the merchant and for each location using the default mapping rules.
  - **Given** a Merchant Admin is completing onboarding and chooses a non-recommended POS module, **when** the Merchant Admin attempts to save, **then** the UI SHALL display: (a) the recommended module and “why recommended” (NAICS/SIC), (b) key feature deltas/limitations, and (c) a required confirmation checkbox; and SHALL NOT save until the checkbox is checked.
  - **Given** a Merchant Admin selects a POS module that is incompatible with the merchant’s entitlements or required capabilities, **when** the Merchant Admin attempts to save, **then** the system SHALL block the selection and SHALL present actionable remediation steps (upgrade plan, required hardware/capabilities, or contact support).
  - **Given** the POS module selection is saved, **when** any selection or override occurs, **then** the system SHALL create an immutable audit record capturing: actor, timestamp, recommended module, chosen module, location scope, reason string (if provided), and confirmation evidence.
  - ****Given** the merchant has Go-live = TRUE (i.e., `merchant.go_live_at` is set by the first production transaction or explicit activation), **when** a Merchant Admin attempts to change POS module selection directly, **then** the system SHALL deny the direct change and SHALL instead offer a Change Request flow requiring Sub Super Admin approval.
  - **Given** a Sub Super Admin reviews a POS module Change Request after go-live, **when** the Sub Super Admin approves, **then** the system SHALL schedule a cutover window, run an automated compatibility test suite for impacted workflows, and generate a rollback plan stub; and SHALL log the approval decision and cutover artifacts.
- **Evidence fields (agent must populate during build):**
  - UI routes/screens: onboarding module selection step; post-go-live change request form; admin approval UI; confirmation modal/checkbox.
  - APIs: module-selection save endpoint; change-request submit endpoint; approval endpoint; audit-log read endpoint.
  - Data: merchant.industry_codes (NAICS/SIC), merchant.pos_module_selection, location.pos_defaults, change_request records, audit_log entries.
  - Tests: unit tests for mapping rules; integration tests for override gating; E2E tests for onboarding selection + blocked post-go-live edit + approval flow.

### System shall provide Evidence: Complete merchant application workflow with risk assessment

- **Ref:** PSR-V6-01526
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Evidence: Complete merchant application workflow with risk assessment.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide MER-001: Merchant Onboarding Workflow

- **Ref:** PSR-V6-01681
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide MER-001: Merchant Onboarding Workflow.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Super Admin initiates merchant onboarding workflow

- **Ref:** PSR-V6-01976
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Super Admin initiates merchant onboarding workflow.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Underwriting intake data capture

### API: GET /api/performance/cache/stats

- **Ref:** PSR-V6-00157
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/performance/cache/stats.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/performance/cache/clear

- **Ref:** PSR-V6-00194
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/performance/cache/clear.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /cache

- **Ref:** PSR-V6-00233
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /cache.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Approved Merchant receives onboarding invitation email

- **Ref:** PSR-V6-01291
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Approved Merchant receives onboarding invitation email.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Approves or rejects merchant applications with detailed notes

- **Ref:** PSR-V6-01292
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Approves or rejects merchant applications with detailed notes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Completes identity verification and KYC (Know Your Customer) requirements

- **Ref:** PSR-V6-01366
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Completes identity verification and KYC (Know Your Customer) requirements.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### System shall provide Compliance & KYC (Know Your Customer)

- **Ref:** PSR-V6-01370
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Compliance & KYC (Know Your Customer).”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### System shall provide KYC (Know Your Customer) verification

- **Ref:** PSR-V6-01639
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide KYC (Know Your Customer) verification.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### System shall provide Merchant Onboarding System

- **Ref:** PSR-V6-01690
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Merchant Onboarding System.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Merchant Onboarding: Automated KYC (Know Your Customer) verification and approval routing

- **Ref:** PSR-V6-01691
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Merchant Onboarding: Automated KYC (Know Your Customer) verification and approval routing.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### System shall provide Merchant Onboarding: Complete KYB verification with automated risk assessment

- **Ref:** PSR-V6-01692
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Merchant Onboarding: Complete KYB verification with automated risk assessment.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### System shall provide Microsite toggle during merchant onboarding: ❌ Not implemented

- **Ref:** PSR-V6-01715
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Microsite toggle during merchant onboarding: ❌ Not implemented.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Super Admin reviews merchant application

- **Ref:** PSR-V6-01981
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Super Admin reviews merchant application.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Document upload & validation

### MER-023 Merchant Services Support document attachments for KYC (Know Your Customer): voided check, banking..

- **Ref:** PSR-V6-00673
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “MER-023 Merchant Services Support document attachments for KYC (Know Your Customer): voided check, banking...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

## Provider/gateway abstraction (do not reveal provider to applicants)

### System shall provide Assigns payment gateways during merchant onboarding

- **Ref:** PSR-V6-01296
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Assigns payment gateways during merchant onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### System shall provide Gateway configuration during merchant onboarding

- **Ref:** PSR-V6-01561
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Gateway configuration during merchant onboarding.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Testing & evidence

### System shall provide Testing: Merchant onboarding validated in evidence reports

- **Ref:** PSR-V6-02017
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Testing: Merchant onboarding validated in evidence reports.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (multi-provider onboarding + Argyle-compatible requirements)

_These requirements bake in Argyle onboarding needs while keeping the applicant experience provider-neutral. Temporary IDs until the ID assignment step is run._

### Onboarding SHALL implement a processor-agnostic data model that supports multiple payment providers (e.g., FluidPay and Argyle) without exposing the chosen provider to merchant applicants

- **Ref:** PSR-EXT-ONB-20260209-001
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Applicants see generic language (e.g., “payment processing partner”). Provider selection is internal-only.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL implement a processor-agnostic data model that supports multiple payment providers (e.g., FluidPay and Argyle) without exposing the chosen provider to merchant applicants.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL maintain provider profiles containing required fields, document checklists, underwriting rule sets, sponsor bank/processor metadata, and submission formats per provider

- **Ref:** PSR-EXT-ONB-20260209-002
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Profile examples include sponsor bank, processor entity, and required gateway options.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL maintain provider profiles containing required fields, document checklists, underwriting rule sets, sponsor bank/processor metadata, and submission formats per provider.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL capture a superset of merchant application fields needed by common providers, including entity info, DBA/location info, contact info, business description, refund policy, fulfillment details, prior processing, and risk flags (e.g., MATCH, bankruptcy)

- **Ref:** PSR-EXT-ONB-20260209-003
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Derived from Argyle Merchant Processing Agreement application sections.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL capture a superset of merchant application fields needed by common providers, including entity info, DBA/location info, contact info, business description, refund policy, fulfillment details, prior processing, and risk flags (e.g., MATCH, bankruptcy).”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL capture beneficial ownership and control information, supporting multiple owners/officers with identity fields and ownership percentage thresholds configurable per provider profile

- **Ref:** PSR-EXT-ONB-20260209-004
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Ownership prong is 25%+; Argyle form collects owners/officers with 20%+; threshold must be configurable.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL capture beneficial ownership and control information, supporting multiple owners/officers with identity fields and ownership percentage thresholds configurable per provider profile.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL capture banking details and ACH authorization, and SHALL require either a voided check or a bank letter upload before submission

- **Ref:** PSR-EXT-ONB-20260209-005
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Bank/ACH details must support payables, fees, and equipment billing when applicable.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL capture banking details and ACH authorization, and SHALL require either a voided check or a bank letter upload before submission.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL support bank letter validation and template guidance, capturing account name, routing number, account number, bank contact, and date, and SHALL validate that the account name matches the applying entity/DBA per configured policy

- **Ref:** PSR-EXT-ONB-20260209-006
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Template shows bank letter confirming routing + account # and signed banker contact.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL support bank letter validation and template guidance, capturing account name, routing number, account number, bank contact, and date, and SHALL validate that the account name matches the applying entity/DBA per configured policy.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL capture business profile metrics including average ticket, highest ticket, requested monthly volume (AMV), and percent splits for CP/CNP and sales methods, and SHALL validate that percentage splits total 100%

- **Ref:** PSR-EXT-ONB-20260209-007
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Argyle form includes CP/CNP splits; CNP startup merchants may be capped at $25K/AMV.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL capture business profile metrics including average ticket, highest ticket, requested monthly volume (AMV), and percent splits for CP/CNP and sales methods, and SHALL validate that percentage splits total 100%.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL enforce provider-specific document checklist requirements based on merchant type (Retail vs CNP), projected volume, and product category

- **Ref:** PSR-EXT-ONB-20260209-008
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Provider profiles MUST support conditional document checklists, including at minimum: (a) Retail <$100k: complete MPA + unexpired ID for each owner + voided check/bank letter; (b) Retail CBD/Delta/Kratom <$100k: plus COAs (tested within 15 months; <0.30% THC) + product list + vertical addendum(s); (c) CNP <$100k: plus operating agreement if >1 owner + 3 months bank statements + 3 months processing statements (startup capped at $25K/AMV); (d) CNP CBD/Delta/Kratom <$100k: COAs accessible on URL + product list + vertical addendum(s); (e) Seed merchants: COAs/product list not required; cannot market THC/CBD/medical claims; seeds cannot be sold with other products; (f) Monthly volume >=$100k or avg/high ticket >=$1k: require 2 years financials + 3 months business statements (business name must match MPA).
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL enforce provider-specific document checklist requirements based on merchant type (Retail vs CNP), projected volume, and product category.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL support high-risk vertical documentation for CBD/Delta/Kratom, including COAs and product lists, with configurable COA limits by projected volume

- **Ref:** PSR-EXT-ONB-20260209-009
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** COA limits MUST be configurable by projected monthly volume: under $50,000 → up to 25 COAs; $50,001–$100,000 → up to 50 COAs; $100,001+ → unlimited COAs. System MUST prevent submission until required COAs/product lists are present when applicable.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL support high-risk vertical documentation for CBD/Delta/Kratom, including COAs and product lists, with configurable COA limits by projected volume.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL enforce provider underwriting constraints for restricted/prohibited product types and bank-specific policies using a configurable rules engine

- **Ref:** PSR-EXT-ONB-20260209-010
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Rules engine MUST encode bank/provider matrix constraints, including: Delta 8 restricted by state; THC-A restricted by state; THC-O prohibited; HHC prohibited; mushrooms (Amanita) prohibited (no psychedelic/psilocin/psilocybin); mushroom spores prohibited; kava prohibited; hemp seeds prohibited for certain banks; tobacco/nicotine vape/e-cig requires CNP registration (restricted brands); kratom retail only; paraphernalia requires registration (retail only); seed merchants must be stand-alone URL and cannot sell with other products; CBD & nicotine cannot be sold on the same site; disposable cartridge policy is bank-specific and must be configurable.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL enforce provider underwriting constraints for restricted/prohibited product types and bank-specific policies using a configurable rules engine.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding underwriting rules SHALL support state-based restrictions and exception notes (e.g., “restricted by state”, “exceptions apply”)

- **Ref:** PSR-EXT-ONB-20260209-011
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Matrix items marked restricted by state or exceptions apply must be modeled with per-state enablement and exception notes.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding underwriting rules SHALL support state-based restrictions and exception notes (e.g., “restricted by state”, “exceptions apply”).”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL support cash-discount enrollment as an optional pricing program and SHALL require acceptance of a cash-discount addendum and capture proof of customer-facing disclosures/signage requirements

- **Ref:** PSR-EXT-ONB-20260209-012
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** If cash discount program selected, system MUST require addendum acceptance and capture merchant attestation that disclosures/signage are clearly visible. Program applies to all card types including credit & debit; merchant may still owe processing fees per MPA; failure may result in termination. Include signage example text in the merchant disclosure generator.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL support cash-discount enrollment as an optional pricing program and SHALL require acceptance of a cash-discount addendum and capture proof of customer-facing disclosures/signage requirements.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL capture pricing schedule options (e.g., tiered, interchange, bundled rate, cash discount, PIN debit) and associated fees and billing cadence, and SHALL produce a final price sheet for e-sign acceptance

- **Ref:** PSR-EXT-ONB-20260209-013
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Billing method may be daily or monthly (subject to approval) and must be captured in the price sheet.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL capture pricing schedule options (e.g., tiered, interchange, bundled rate, cash discount, PIN debit) and associated fees and billing cadence, and SHALL produce a final price sheet for e-sign acceptance.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL capture gateway configuration selections required by provider (e.g., NMI, Authorize.Net) and any gateway setup/monthly/transaction fees, mapped via provider profile

- **Ref:** PSR-EXT-ONB-20260209-014
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Argyle matrix: gateway requirement options include NMI | Auth.Net | Bill 1st | Fluid Pay; SSB form includes Argyle setup options NMI/Authorize.Net.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL capture gateway configuration selections required by provider (e.g., NMI, Authorize.Net) and any gateway setup/monthly/transaction fees, mapped via provider profile.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Underwriting configuration SHALL support direct-marketing matrices (Nutra, Marketplace/Gadget, Digital Content) with bank-specific prohibitions, limits, and notes

- **Ref:** PSR-EXT-ONB-20260209-015
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Direct marketing underwriting must be configurable by sponsor bank: Nutra: Trial (Registration) prohibited (Esquire, Synovus). Marketplace/Gadget: Straight sale prohibited (Esquire); Continuity prohibited (Synovus, SSB); Trial (Registration) prohibited (Esquire, SSB). Digital Content: allowed with limits. Limits: #MLE per UBO (typically 1); #MIDs per MLE (3–4); AMV per MID ($50k–$75k); total MIDs (3–4). Standard reserve 10%. Notes: price point minimum $6.95 (Synovus) / $7.95 (Esquire); SEO/Web services require prior processing; Marketplace/Gadget may require Processor RDR.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Underwriting configuration SHALL support direct-marketing matrices (Nutra, Marketplace/Gadget, Digital Content) with bank-specific prohibitions, limits, and notes.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Underwriting configuration SHALL support reserve policies (standard reserve %, and conditional reserves based on solvency and vertical) with auditability

- **Ref:** PSR-EXT-ONB-20260209-016
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Argyle matrices: standard reserve 10% for direct marketing; CBD/Delta startups require 5%; Kratom and Seed require 10%; solvency-based reserves supported.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Underwriting configuration SHALL support reserve policies (standard reserve %, and conditional reserves based on solvency and vertical) with auditability.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL support CRM requirement capture for direct marketing profiles when required by provider profile

- **Ref:** PSR-EXT-ONB-20260209-017
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Argyle matrix: CRM requirement for Synovus includes Sticky.io, KNK, or Checkout Champs.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL support CRM requirement capture for direct marketing profiles when required by provider profile.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL support equipment ordering intake and route requests to internal fulfillment workflows

- **Ref:** PSR-EXT-ONB-20260209-018
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Equipment order intake MUST capture: shipping type (ground/2nd day/overnight + options), merchant ID/DBA, contact, mailing address, equipment type/price/qty, download and encryption (PIN debit) yes/no, encryption key, auto-close time & zone, and billing method (credit card one-time authorization or ACH with routing/account/name match). Must require signature/authorization before fulfillment.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL support equipment ordering intake and route requests to internal fulfillment workflows.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL provide a DocuSign-like e-sign flow for merchant agreement acceptance, including required initials/checkbox attestations and collection of signer identities, with immutable signed PDF output and audit logs

- **Ref:** PSR-EXT-ONB-20260209-019
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Must support multi-document packets: MPA + schedule of charges + cash discount addendum + equipment addendum (when selected).
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL provide a DocuSign-like e-sign flow for merchant agreement acceptance, including required initials/checkbox attestations and collection of signer identities, with immutable signed PDF output and audit logs.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL package and submit application data and documents to the selected provider adapter via configured channel (API when available; otherwise secure email/SFTP submission), while preserving an internal canonical submission record

- **Ref:** PSR-EXT-ONB-20260209-020
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Submission channel must be configurable per provider. Example: Argyle packages submitted to Applications@ArgylePayments.com. System must generate an internal submission bundle (PDF packet + attachments) and record submitter, timestamp, provider, and delivery method.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL package and submit application data and documents to the selected provider adapter via configured channel (API when available; otherwise secure email/SFTP submission), while preserving an internal canonical submission record.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL keep merchant-facing wording provider-neutral, while internal staff views show provider, sponsor bank, processor entity, and underwriting matrix decisions for supportability

- **Ref:** PSR-EXT-ONB-20260209-021
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Merchant-facing portal must not expose sponsor bank/processor names unless required by law or explicit disclosure.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL keep merchant-facing wording provider-neutral, while internal staff views show provider, sponsor bank, processor entity, and underwriting matrix decisions for supportability.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


### Onboarding SHALL include automated tests that validate provider profile mappings, document checklist enforcement, and rules-engine decisions using fixture applications

- **Ref:** PSR-EXT-ONB-20260209-022
- **Domain/Module:** ONB / Merchant Onboarding
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Test fixtures must cover: Retail vs CNP; CBD/Delta/Kratom; seed; direct marketing matrices; cash discount; equipment ordering; and bank letter validation.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is applying via PaySurity onboarding, **when** the onboarding flow runs, **then** the system SHALL satisfy: “Onboarding SHALL include automated tests that validate provider profile mappings, document checklist enforcement, and rules-engine decisions using fixture applications.”.
- **Given** an internal user lacks permission, **when** they attempt to view or change underwriting decisions, **then** the system SHALL deny the action and log the attempt.
- **Given** CI executes automated tests, **when** the suite runs, **then** tests SHALL deterministically validate the behavior.
- **Evidence fields (agent must populate during build):**
  - UI route(s) + selectors/screenshots.
  - API endpoints + sanitized payload examples.
  - Data entities + migrations.
  - Tests + CI run evidence.


## Dedup guidance (do not delete requirements)

No duplicate statements detected within ONB selection.
