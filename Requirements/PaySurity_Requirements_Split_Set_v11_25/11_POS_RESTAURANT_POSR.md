# 11 POS RESTAURANT POSR

## POS module selection (auto + controlled override)

- **Source of truth:** `05_MERCHANT_ONBOARDING_ONB.md` requirement **PSR-EXT-POS-OVERRIDE-20260210-001**.
- The POS module is auto-selected from merchant NAICS/SIC and MAY be overridden only during onboarding (pre-go-live) with guided confirmation and compatibility checks.
- After go-live (`merchant.go_live_at` set), module changes require a Change Request and Sub Super Admin approval with scheduled cutover + rollback stub + automated compatibility tests.


**Generated:** 2026-02-10 04:16:05 (America/Chicago)

**Covers capability area(s):** POS Restaurant (Point of Sale Restaurant)

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# POS Restaurant (Point of Sale Restaurant)

_Contains 62 requirements._


## Core POS

### Aggregator integrations [API][TEST][UI].

- **Ref:** PSR-V6-03005
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** UberEats/Grubhub/DoorDash via middleware. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: POSR-005
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Aggregator integrations [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Aggregator integrations [API][TEST][UI].

- **Ref:** PSR-V6-03006
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** UberEats/Grubhub/DoorDash via middleware. | ReqID: POSR-005
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Aggregator integrations [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### CP payments [DATA][TEST][UI].

- **Ref:** PSR-V6-03007
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Card-present payments with offline queue and idempotent replay | AcceptanceCriteria: Offline queue maintained | Idempotent replay | Pay-at-table supported | Split tenders allowed | ReqID: POSR-PMT-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “CP payments [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Customer Loyalty Program [API][TEST][UI].

- **Ref:** PSR-V6-03008
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Track customer spend and visits with rewards and digital wallet integration | AcceptanceCriteria: Spend tracking accurate | Reward eligibility correct | Digital wallet sync | Birthday rewards work | ReqID: POSR-LOY-006
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Customer Loyalty Program [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure data validation is effective [DATA][TEST][UI].

- **Ref:** PSR-V6-03015
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure data validation is effective [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure expo view aggregates and updates correctly [TEST][UI].

- **Ref:** PSR-V6-03016
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure expo view aggregates and updates correctly [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensure no data leakage from previous occupancy [DATA][TEST][UI].

- **Ref:** PSR-V6-03017
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure no data leakage from previous occupancy [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensures mandatory fields are enforced [TEST][UI].

- **Ref:** PSR-V6-03018
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures mandatory fields are enforced [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include tests for special instructions and multiple items [OPS][TEST][UI].

- **Ref:** PSR-V6-03019
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include tests for special instructions and multiple items [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test bump and recall flows including error handling [OPS][TEST][UI].

- **Ref:** PSR-V6-03021
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test bump and recall flows including error handling [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test for all supported aggregators [OPS][TEST][UI].

- **Ref:** PSR-V6-03022
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test for all supported aggregators [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test retry and escalation paths [OPS][TEST][UI].

- **Ref:** PSR-V6-03026
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test retry and escalation paths [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test should cover additions, updates, and deletions [OPS][TEST][UI].

- **Ref:** PSR-V6-03027
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test should cover additions, updates, and deletions [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test storage limits and data integrity [DATA][OPS][TEST][UI].

- **Ref:** PSR-V6-03028
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test storage limits and data integrity [DATA][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test system resilience and fallback mechanisms [OPS][TEST][UI].

- **Ref:** PSR-V6-03029
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test system resilience and fallback mechanisms [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test system robustness to configuration errors [OPS][TEST][UI].

- **Ref:** PSR-V6-03030
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test system robustness to configuration errors [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with different payment methods [OPS][TEST][UI].

- **Ref:** PSR-V6-03031
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with different payment methods [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Test with mixed opt-in and opt-out staff [OPS][TEST][UI].

- **Ref:** PSR-V6-03032
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with mixed opt-in and opt-out staff [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with multiple item types and special instructions [OPS][TEST][UI].

- **Ref:** PSR-V6-03033
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with multiple item types and special instructions [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validate concurrency and status validation [TEST][UI].

- **Ref:** PSR-V6-03034
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate concurrency and status validation [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validates price input constraints [TEST][UI].

- **Ref:** PSR-V6-03035
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates price input constraints [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify calculations with multiple staff members [TEST][UI].

- **Ref:** PSR-V6-03036
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify calculations with multiple staff members [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify course sequencing logic [OPS][TEST][UI].

- **Ref:** PSR-V6-03037
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify course sequencing logic [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify escalation triggers and logging [COM][OPS][TEST][UI].

- **Ref:** PSR-V6-03039
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify escalation triggers and logging [COM][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify multi-station routing and priority sorting [TEST][UI].

- **Ref:** PSR-V6-03040
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify multi-station routing and priority sorting [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify report format compliance [COM][TEST][UI].

- **Ref:** PSR-V6-03041
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify report format compliance [COM][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify retry mechanism is triggered [TEST][UI].

- **Ref:** PSR-V6-03042
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify retry mechanism is triggered [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify totals are summed correctly [TEST][UI].

- **Ref:** PSR-V6-03044
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify totals are summed correctly [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify UI (User Interface) responsiveness and data correctness [DATA][TEST][UI].

- **Ref:** PSR-V6-03045
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify UI (User Interface) responsiveness and data correctness [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify UI (User Interface) validations and data persistence [DATA][TEST][UI].

- **Ref:** PSR-V6-03046
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify UI (User Interface) validations and data persistence [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Restaurant payment integration [API][TEST][UI].

- **Ref:** PSR-V6-03057
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process restaurant payments including tips and split bills | AcceptanceCriteria: Tips applied correctly | Splits calculated | Auth captured | Receipt printed | ReqID: POSR-PAY-016
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Restaurant payment integration [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Aggregator integrations [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03834
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** UberEats/Grubhub/DoorDash via middleware.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Aggregator integrations [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Split Tender Payments [OPS][TEST][UI].

- **Ref:** PSR-V6-03058
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Accept multiple payment methods per transaction including offline partial payments | AcceptanceCriteria: Split payments processed | Offline partial payments | Auto-reconciliation | Multiple payment types | ReqID: POSR-PAY-005
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Split Tender Payments [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Tips service charges and payouts [API][TEST][UI].

- **Ref:** PSR-V6-03059
- **Domain/Module:** POSR / AI (Artificial Intelligence) Hero Assistant + Product Carousel
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Handle tips gratuities and service charges including allocation rules tip pooling and payout reporting for payroll integration
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Tips service charges and payouts [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Devices & Peripherals

### KDS & printers [TEST][UI].

- **Ref:** PSR-V6-03009
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Routing; printers; expo; courses. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: POSR-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KDS & printers [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### KDS & printers [TEST][UI].

- **Ref:** PSR-V6-03010
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Routing; printers; expo; courses. | ReqID: POSR-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KDS & printers [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: KDS & printers [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03833
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Routing; printers; expo; courses.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: KDS & printers [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Offline & Sync

### Notes: Test network interruptions during sync [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03023
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test network interruptions during sync [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test real-time synchronization [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03024
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test real-time synchronization [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Offline mode [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03047
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Queue + reconciliation; sync engine. | ReqID: POSR-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Offline mode [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Offline mode [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03048
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Queue + reconciliation; sync engine. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: POSR-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Offline mode [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Offline Order Processing [API][DATA][TEST][UI].

- **Ref:** PSR-V6-03049
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process transactions offline with auto-sync when connection restored | AcceptanceCriteria: Orders processed offline | Auto-sync when online | Conflict resolution works | No data loss | ReqID: POSR-ORD-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Offline Order Processing [API][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Real-time Inventory Sync [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03055
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Track ingredient-level inventory with auto-updates and low-stock alerts | AcceptanceCriteria: Inventory updates in real-time | Low-stock alerts trigger | Ingredient-level tracking | Waste tracking integrated | ReqID: POSR-INV-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Real-time Inventory Sync [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Offline mode [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03832
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Queue + reconciliation; sync engine.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Offline mode [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Orders & Workflow

### Kitchen display and routing [TEST][UI].

- **Ref:** PSR-V6-03011
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Route orders to kitchen display screens or printers by station course and priority with bumping recall and expo views
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Kitchen display and routing [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Kitchen Display System [TEST][UI].

- **Ref:** PSR-V6-03012
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Color-coded order display with prep station routing and timers | AcceptanceCriteria: Orders route to correct station | Color coding by status | Timer accuracy ±5s | Urgent orders highlighted | ReqID: POSR-KDS-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Kitchen Display System [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Kitchen display system [TEST][UI].

- **Ref:** PSR-V6-03013
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Send orders to kitchen display screens with ETA and preparation instructions | AcceptanceCriteria: Routes orders to correct kitchen station | Displays prep instructions and modifiers | Shows order timing | Updates order status | ReqID: POSR-KDS-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Kitchen display system [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Supports order delivery process [TEST][UI].

- **Ref:** PSR-V6-03020
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Supports order delivery process [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify enforcement of forced modifiers [TEST][UI].

- **Ref:** PSR-V6-03038
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify enforcement of forced modifiers [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify table status changes to occupied [DATA][TEST][UI].

- **Ref:** PSR-V6-03043
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify table status changes to occupied [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Online ordering and delivery integration [API][TEST][UI].

- **Ref:** PSR-V6-03050
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Integrate online ordering channels and third party delivery aggregators into the POS (Point of Sale) with menu sync order injection and status updates
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Online ordering and delivery integration [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Order entry and routing [TEST][UI].

- **Ref:** PSR-V6-03051
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Take orders and route to kitchen stations with modifiers | AcceptanceCriteria: Order created | Modifiers applied | Kitchen routing correct | Preparation time tracked | ReqID: POSR-ORD-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Order entry and routing [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Order with modifiers [OPS][TEST][UI].

- **Ref:** PSR-V6-03052
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Accept orders with item modifiers (no/light/extra) and special instructions | AcceptanceCriteria: Modifiers change price | Instructions pass to kitchen | Allergens highlighted | Order totals accurate | ReqID: POSR-ORD-008
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Order with modifiers [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Orders & tables [DATA][TEST][UI].

- **Ref:** PSR-V6-03053
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Dine-in/takeout/delivery; split/merge; tips. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: POSR-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Orders & tables [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Orders & tables [DATA][TEST][UI].

- **Ref:** PSR-V6-03054
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Dine-in/takeout/delivery; split/merge; tips. | ReqID: POSR-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Orders & tables [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Menu & modifiers [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03830
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Variants, forced/optional modifiers; taxes/service charges.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Menu & modifiers [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Orders & tables [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03831
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Dine-in/takeout/delivery; split/merge; tips.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Orders & tables [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Staffing & Time

### Notes: Test real-time update propagation [OPS][TEST][UI].

- **Ref:** PSR-V6-03025
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test real-time update propagation [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Repeating "Phase‑1: seeding + reports…": Caused by re‑invoking the seeding script multiple times or concurrent... [API][TEST][UI].

- **Ref:** PSR-V6-03056
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Repeating "Phase‑1: seeding + reports…": Caused by re‑invoking the seeding script multiple times or concurrent... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Tax

### Notes: Check validation on tax/service charge inputs [API][TEST][UI].

- **Ref:** PSR-V6-03014
- **Domain/Module:** POSR / POS Restaurant (Point of Sale Restaurant)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check validation on tax/service charge inputs [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## Rehomed from 03_PUBLIC_WEBSITE_COM (polish pass)

### Implement hero, dark-green themed carousel, and AI shopping assistant on restaurant POS (Point of Sale) microsites using menu and combo data as the product catalog.

- **Ref:** PSR-V6-03598
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Implement hero, dark-green themed carousel, and AI shopping assistant on restaurant POS (Point of Sale) microsites using menu and combo data as the product catalog.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### POS (Point of Sale) Restaurant AI hero integration [API][TEST][UI].

- **Ref:** PSR-V6-03637
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “POS (Point of Sale) Restaurant AI hero integration [API][TEST][UI].”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (2026-02-10): Shared POS hardware + tap-to-phone claim gating (PSR-EXT)

This module inherits shared POS Suite requirements defined in `10_POS_RETAIL_POS.md` under:
- PSR-EXT-POS-20260210-005 (Approved Hardware Catalog + Kit SKUs)
- PSR-EXT-POS-20260210-006 (Barcode-first inventory + cart)
- PSR-EXT-POS-20260210-007 (Tap-to-phone claim gating + feature flags)

The POS Restaurant build MUST implement and test these shared requirements wherever applicable.