# 06 MERCHANT SAVINGS ESTIMATOR SAV (Polished v1)

**Generated:** 2026-02-10 04:09:51 (America/Chicago)

**Covers capability area(s):** Merchant Savings Estimator (statement upload → OCR/parsing → savings estimate → report → CTA into onboarding)

_Contains 40 requirements._
**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

## Scope notes (avoid confusion)
- The SEO landing page and primary entry CTA live in `03_PUBLIC_WEBSITE_COM.md`.
- This document defines the estimator workflow and processing engine requirements.
- Admin/operator tooling for jobs, flags, and audits is governed by `01_FOUNDATION_ADM.md` and `90_CROSSCUTTING_INVARIANTS.md` and is referenced here only where estimator-specific.

## Prospect workflow (canonical)
1) Prospect opens the estimator from PaySurity.com.
2) Prospect uploads statement (PDF/images) and optionally provides lead info.
3) System queues processing and shows status updates.
4) System extracts normalized fields and computes savings estimate with a transparent breakdown.
5) Prospect reviews results; if confidence is low, the system prompts for a review/edit step.
6) Prospect downloads/emails report (if enabled) and clicks CTA to begin onboarding.

## Upload & OCR

### Success Criteria: 98% OCR accuracy, handwritten document support

- **Ref:** PSR-V6-00103
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Success Criteria: 98% OCR accuracy, handwritten document support.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Statement upload + OCR

- **Ref:** PSR-V6-03759
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Statement upload + OCR.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Deliverables: OCR system, document parsing, quality controls

- **Ref:** PSR-V6-01023
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Deliverables: OCR system, document parsing, quality controls.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Week 21: OCR system development

- **Ref:** PSR-V6-01191
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Week 21: OCR system development.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Uploads required documents (business license, tax ID, bank statements)

- **Ref:** PSR-V6-02061
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Uploads required documents (business license, tax ID, bank statements).”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## Savings model & results

### Roll-up: Savings computation

- **Ref:** PSR-V6-03761
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Savings computation.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide 1. Merchant Savings Calculator Web

- **Ref:** PSR-V6-00900
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide 1. Merchant Savings Calculator Web.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Build savings challenges

- **Ref:** PSR-V6-00950
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Build savings challenges.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Success Criteria: 30% reduction in food waste, 25% inventory cost savings

- **Ref:** PSR-V6-01131
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Success Criteria: 30% reduction in food waste, 25% inventory cost savings.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Success Criteria: 95% case classification accuracy, 50% time savings

- **Ref:** PSR-V6-01139
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Success Criteria: 95% case classification accuracy, 50% time savings.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Customer Value: 50% time savings, 80% accuracy improvement

- **Ref:** PSR-V6-01435
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Customer Value: 50% time savings, 80% accuracy improvement.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Enterprise Monitoring: $200,000 annual savings through ML-powered observability

- **Ref:** PSR-V6-01501
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Enterprise Monitoring: $200,000 annual savings through ML-powered observability.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide MER-002: Merchant Savings Calculator

- **Ref:** PSR-V6-01682
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide MER-002: Merchant Savings Calculator.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Merchant Savings Calculator enhancements ($40K-60K, 1-2 weeks)

- **Ref:** PSR-V6-01701
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Merchant Savings Calculator enhancements ($40K-60K, 1-2 weeks).”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Merchant Savings Calculator Web: 0% (13 files, 7644 lines)

- **Ref:** PSR-V6-01702
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Merchant Savings Calculator Web: 0% (13 files, 7644 lines).”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Quality Assurance ROI: $1,074,000 annual savings through automated security and compliance

- **Ref:** PSR-V6-01861
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Quality Assurance ROI: $1,074,000 annual savings through automated security and compliance.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide ✅ Avoided duplicate admin dashboard (60-70% time savings)

- **Ref:** PSR-V6-02096
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Avoided duplicate admin dashboard (60-70% time savings).”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Support & handoff

### Billing Support: expert team for fee, statement, and billing questions

- **Ref:** PSR-V6-00340
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Billing Support: expert team for fee, statement, and billing questions.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Billing Support: Fee, statement, and billing questions

- **Ref:** PSR-V6-00341
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Billing Support: Fee, statement, and billing questions.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## General

### UI (User Interface) Component

- **Ref:** PSR-V6-02241
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component

- **Ref:** PSR-V6-02275
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component

- **Ref:** PSR-V6-02282
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component

- **Ref:** PSR-V6-02283
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component

- **Ref:** PSR-V6-02309
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system is operational and the actor is `Merchant Prospect`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component.”.
- **Given** a user without the required permission, **when** the user attempts a restricted admin/support action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (clarified target-state requirements)

_These requirements close gaps discovered during polish. They use temporary IDs until the ID assignment step is run._

### The estimator SHALL accept uploads of common statement formats (PDF and images) and SHALL support multi-page statements

- **Ref:** PSR-EXT-SAV-20260209-001
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL accept uploads of common statement formats (PDF and images) and SHALL support multi-page statements.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL enforce upload limits (size, page count, and file type) and SHALL provide user-friendly errors and remediation guidance

- **Ref:** PSR-EXT-SAV-20260209-002
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL enforce upload limits (size, page count, and file type) and SHALL provide user-friendly errors and remediation guidance.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL run OCR/parsing asynchronously and SHALL display real-time status (queued, processing, needs review, complete, failed)

- **Ref:** PSR-EXT-SAV-20260209-003
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL run OCR/parsing asynchronously and SHALL display real-time status (queued, processing, needs review, complete, failed).”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL extract and normalize key statement fields (volume, transaction counts, fees, effective rate, major fee categories) into a structured result

- **Ref:** PSR-EXT-SAV-20260209-004
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL extract and normalize key statement fields (volume, transaction counts, fees, effective rate, major fee categories) into a structured result.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL compute a savings estimate using configurable PaySurity pricing assumptions and SHALL show a transparent breakdown (current vs estimated)

- **Ref:** PSR-EXT-SAV-20260209-005
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL compute a savings estimate using configurable PaySurity pricing assumptions and SHALL show a transparent breakdown (current vs estimated).”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL show confidence levels for extracted fields and SHALL allow a manual review/edit step when confidence is low

- **Ref:** PSR-EXT-SAV-20260209-006
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL show confidence levels for extracted fields and SHALL allow a manual review/edit step when confidence is low.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL generate a downloadable/shareable savings report (PDF) and SHALL optionally email the report to the prospect (opt-in)

- **Ref:** PSR-EXT-SAV-20260209-007
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL generate a downloadable/shareable savings report (PDF) and SHALL optionally email the report to the prospect (opt-in).”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL capture lead information (name, business, email, phone) with consent and SHALL create a lead record for follow-up

- **Ref:** PSR-EXT-SAV-20260209-008
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL capture lead information (name, business, email, phone) with consent and SHALL create a lead record for follow-up.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator results page SHALL include a CTA to start merchant onboarding and SHALL carry forward relevant derived metadata (industry/volume/rate bands)

- **Ref:** PSR-EXT-SAV-20260209-009
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator results page SHALL include a CTA to start merchant onboarding and SHALL carry forward relevant derived metadata (industry/volume/rate bands).”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL retain uploaded statements and derived data only per configured retention policy, and SHALL support deletion requests with audit logging

- **Ref:** PSR-EXT-SAV-20260209-010
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL retain uploaded statements and derived data only per configured retention policy, and SHALL support deletion requests with audit logging.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator admin UI SHALL allow configuration of pricing assumptions, thresholds, and disclaimers without code changes

- **Ref:** PSR-EXT-SAV-20260209-011
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator admin UI SHALL allow configuration of pricing assumptions, thresholds, and disclaimers without code changes.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator pipeline SHALL include security controls for uploaded files (validation, private storage, and scanning where feasible)

- **Ref:** PSR-EXT-SAV-20260209-012
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator pipeline SHALL include security controls for uploaded files (validation, private storage, and scanning where feasible).”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL support a controlled sample dataset (“golden statements”) used for regression testing of OCR/parsing and savings computations

- **Ref:** PSR-EXT-SAV-20260209-013
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL support a controlled sample dataset (“golden statements”) used for regression testing of OCR/parsing and savings computations.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL provide operator tools to reprocess a statement with updated parsing rules and to view parsing errors and audit trails

- **Ref:** PSR-EXT-SAV-20260209-014
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL provide operator tools to reprocess a statement with updated parsing rules and to view parsing errors and audit trails.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL log a traceable processing run record (input hash, parser version, timestamps, and outcome) to support reproducibility and audits

- **Ref:** PSR-EXT-SAV-20260209-015
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL log a traceable processing run record (input hash, parser version, timestamps, and outcome) to support reproducibility and audits.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

### The estimator SHALL avoid storing any raw card data; extracted results SHALL be metadata only and SHALL follow the PCI scoping rules in the crosscut invariants

- **Ref:** PSR-EXT-SAV-20260209-016
- **Domain/Module:** SAV / Merchant Savings Estimator
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** an anonymous prospect on PaySurity.com’s estimator flow, **when** the prospect reaches this step, **then** the system SHALL satisfy: “The estimator SHALL avoid storing any raw card data; extracted results SHALL be metadata only and SHALL follow the PCI scoping rules in the crosscut invariants.”.
- **Given** the prospect submits the flow, **when** processing completes or fails, **then** the system SHALL show a clear status and next action without exposing sensitive data.
- **Given** automated tests exist for this requirement, **when** CI runs, **then** tests SHALL pass with deterministic output.
- **Evidence fields (agent must populate during build):**
  - UI route(s) and screenshots or test selectors.
  - API endpoint(s) and sanitized request/response examples.
  - Data entities touched and migration reference.
  - Tests and CI evidence.

## Dedup guidance (do not delete requirements)

The following requirement statements are duplicates. Implement once and mark the others as “covered by” in build evidence:

- UI (User Interface) Component. (x5)