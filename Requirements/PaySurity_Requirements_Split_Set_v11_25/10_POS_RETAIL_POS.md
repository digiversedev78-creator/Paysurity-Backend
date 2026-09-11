# 10 POS RETAIL POS

## POS module selection (auto + controlled override)

- **Source of truth:** `05_MERCHANT_ONBOARDING_ONB.md` requirement **PSR-EXT-POS-OVERRIDE-20260210-001**.
- The POS module is auto-selected from merchant NAICS/SIC and MAY be overridden only during onboarding (pre-go-live) with guided confirmation and compatibility checks.
- After go-live (`merchant.go_live_at` set), module changes require a Change Request and Sub Super Admin approval with scheduled cutover + rollback stub + automated compatibility tests.


**Generated:** 2026-02-10 04:16:05 (America/Chicago)

**Covers capability area(s):** POS Suite (Point of Sale Suite)

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# POS Suite (Point of Sale Suite)

_Contains 302 requirements._


## Core POS

### 1. Implement Super Admin Microsite Control. [TEST][UI].

- **Ref:** PSR-V6-02779
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “1. Implement Super Admin Microsite Control. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### accept and 1 Other API (Application Programming Interface) Endpoints [API][TEST][UI].

- **Ref:** PSR-V6-02780
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “accept and 1 Other API (Application Programming Interface) Endpoints [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.post('/api/customers', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02788
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.post('/api/customers', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Checkout and 6 Other Functions [TEST][UI].

- **Ref:** PSR-V6-02794
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Checkout and 6 Other Functions [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Dashboard and 1 Other Functions [TEST][UI].

- **Ref:** PSR-V6-02795
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Dashboard and 1 Other Functions [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Each POS (Point of Sale) system should follow the E-Commerce pattern:. [TEST][UI].

- **Ref:** PSR-V6-02868
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Each POS (Point of Sale) system should follow the E-Commerce pattern:. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Add microsite toggle to Super Admin onboarding workflow. [TEST][UI].

- **Ref:** PSR-V6-02870
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Add microsite toggle to Super Admin onboarding workflow. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Add to onboarding workflow. [TEST][UI].

- **Ref:** PSR-V6-02871
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Add to onboarding workflow. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide All POS (Point of Sale) types include customer-facing microsite. [OPS][TEST][UI].

- **Ref:** PSR-V6-02872
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide All POS (Point of Sale) types include customer-facing microsite. [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide But no Super Admin control. [TEST][UI].

- **Ref:** PSR-V6-02873
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide But no Super Admin control. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Cart and checkout flow. [TEST][UI].

- **Ref:** PSR-V6-02874
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Cart and checkout flow. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Checkout with PaySurity payment. [TEST][UI].

- **Ref:** PSR-V6-02875
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Checkout with PaySurity payment. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Commission tracking per channel. [TEST][UI].

- **Ref:** PSR-V6-02876
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Commission tracking per channel. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Complete customer storefront implemented. [TEST][UI].

- **Ref:** PSR-V6-02877
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Complete customer storefront implemented. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Configure initial branding (logo, colors). [OPS][TEST][UI].

- **Ref:** PSR-V6-02878
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Configure initial branding (logo, colors). [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Configure microsite settings for merchants. [TEST][UI].

- **Ref:** PSR-V6-02879
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Configure microsite settings for merchants. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide During merchant onboarding process. [TEST][UI].

- **Ref:** PSR-V6-02883
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide During merchant onboarding process. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide E-Commerce merchants: Can sell online immediately ✅. [API][TEST][UI].

- **Ref:** PSR-V6-02884
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide E-Commerce merchants: Can sell online immediately ✅. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide E-Commerce Pattern Already Exists ✅. [TEST][UI].

- **Ref:** PSR-V6-02885
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide E-Commerce Pattern Already Exists ✅. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Merchant Portal Has Microsite Feature ⚠️. [TEST][UI].

- **Ref:** PSR-V6-02887
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Merchant Portal Has Microsite Feature ⚠️. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Microsite & POS (Point of Sale) Integration Clarification - October 19, 2025. [API][TEST][UI].

- **Ref:** PSR-V6-02888
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Microsite & POS (Point of Sale) Integration Clarification - October 19, 2025. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Microsite preview in Merchant Portal. [TEST][UI].

- **Ref:** PSR-V6-02889
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Microsite preview in Merchant Portal. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Missing customer-facing storefronts. [OPS][TEST][UI].

- **Ref:** PSR-V6-02890
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Missing customer-facing storefronts. [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide No onboarding integration. [API][TEST][UI].

- **Ref:** PSR-V6-02891
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide No onboarding integration. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Grocery (Priority 2). [TEST][UI].

- **Ref:** PSR-V6-02894
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Grocery (Priority 2). [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Grocery Customer Storefront ?? MEDIUM. [API][TEST][UI].

- **Ref:** PSR-V6-02895
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Grocery Customer Storefront ?? MEDIUM. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Restaurant (Priority 1). [TEST][UI].

- **Ref:** PSR-V6-02896
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Restaurant (Priority 1). [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Restaurant Customer Storefront ?? HIGH. [TEST][UI].

- **Ref:** PSR-V6-02897
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Restaurant Customer Storefront ?? HIGH. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Retail (Priority 3). [TEST][UI].

- **Ref:** PSR-V6-02898
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Retail (Priority 3). [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Retail Customer Storefront ?? MEDIUM. [API][TEST][UI].

- **Ref:** PSR-V6-02899
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Retail Customer Storefront ?? MEDIUM. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide POS (Point of Sale) Systems Are Backend-Only ⚠️. [TEST][UI].

- **Ref:** PSR-V6-02900
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide POS (Point of Sale) Systems Are Backend-Only ⚠️. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Prevents proper merchant onboarding. [TEST][UI].

- **Ref:** PSR-V6-02901
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Prevents proper merchant onboarding. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Public-Facing Merchant Websites (Microsites) - Clarification that microsites are integrated... [OPS][TEST][UI].

- **Ref:** PSR-V6-02902
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Public-Facing Merchant Websites (Microsites) - Clarification that microsites are integrated... [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Restaurant, Grocery, Retail have admin interfaces. [TEST][UI].

- **Ref:** PSR-V6-02903
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Restaurant, Grocery, Retail have admin interfaces. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Review customer activity on microsites. [TEST][UI].

- **Ref:** PSR-V6-02904
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Review customer activity on microsites. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Separate toggle for each POS (Point of Sale) type (Restaurant, Grocery, Retail). [TEST][UI].

- **Ref:** PSR-V6-02905
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Separate toggle for each POS (Point of Sale) type (Restaurant, Grocery, Retail). [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Shopping cart and checkout. [TEST][UI].

- **Ref:** PSR-V6-02906
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Shopping cart and checkout. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Similar admin features as Restaurant POS (Point of Sale). [TEST][UI].

- **Ref:** PSR-V6-02907
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Similar admin features as Restaurant POS (Point of Sale). [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Single dashboard for merchants. [TEST][UI].

- **Ref:** PSR-V6-02908
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Single dashboard for merchants. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Super Admin Cannot Activate Microsites ❌. [TEST][UI].

- **Ref:** PSR-V6-02909
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Super Admin Cannot Activate Microsites ❌. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Super Admin Control - Microsite activation during merchant onboarding. [TEST][UI].

- **Ref:** PSR-V6-02910
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Super Admin Control - Microsite activation during merchant onboarding. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Super Admin Microsite Control ?? HIGH. [TEST][UI].

- **Ref:** PSR-V6-02911
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Super Admin Microsite Control ?? HIGH. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Super Admin Toggle. [TEST][UI].

- **Ref:** PSR-V6-02912
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Super Admin Toggle. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Third-Party Delivery Integration ?? LOW. [API][TEST][UI].

- **Ref:** PSR-V6-02913
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Third-Party Delivery Integration ?? LOW. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Unified dashboard in Merchant Admin. [TEST][UI].

- **Ref:** PSR-V6-02915
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Unified dashboard in Merchant Admin. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Added Super Admin microsite control requirements. [TEST][UI].

- **Ref:** PSR-V6-02917
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Added Super Admin microsite control requirements. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Clarified microsites are integrated components of POS (Point of Sale) systems. [TEST][UI].

- **Ref:** PSR-V6-02918
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Clarified microsites are integrated components of POS (Point of Sale) systems. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Clarified microsites are part of POS (Point of Sale) systems (not separate apps). [TEST][UI].

- **Ref:** PSR-V6-02919
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Clarified microsites are part of POS (Point of Sale) systems (not separate apps). [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Documented Super Admin control requirements. [TEST][UI].

- **Ref:** PSR-V6-02921
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Documented Super Admin control requirements. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Outlined priority action items. [TEST][UI].

- **Ref:** PSR-V6-02922
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Outlined priority action items. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Outlined Super Admin onboarding workflow requirements. [TEST][UI].

- **Ref:** PSR-V6-02923
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Outlined Super Admin onboarding workflow requirements. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/" element={<LandingPage />} /> [TEST][UI].

- **Ref:** PSR-V6-02924
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/" element={<LandingPage />} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02925
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/auth" element={<Auth />} /> [TEST][UI].

- **Ref:** PSR-V6-02926
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/auth" element={<Auth />} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/blog" element={<Blog />} /> [OPS][TEST][UI].

- **Ref:** PSR-V6-02927
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/blog" element={<Blog />} /> [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/blog/:slug" element={<BlogPost />} /> [OPS][TEST][UI].

- **Ref:** PSR-V6-02928
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/blog/:slug" element={<BlogPost />} /> [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02929
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/client-restaurants" element={ [TEST][UI].

- **Ref:** PSR-V6-02930
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/client-restaurants" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/client-restaurants" element={<ProtectedRoute roles={['super-admin',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02931
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/client-restaurants" element={<ProtectedRoute roles={['super-admin',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/contact" element={<ContactForm />} /> [TEST][UI].

- **Ref:** PSR-V6-02932
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/contact" element={<ContactForm />} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/customers" element={ [TEST][UI].

- **Ref:** PSR-V6-02933
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/customers" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/customers" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02934
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/customers" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/deploy" element={ [OPS][TEST][UI].

- **Ref:** PSR-V6-02935
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/deploy" element={ [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/deploy" element={<ProtectedRoute roles={['super-admin']}> [OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02936
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/deploy" element={<ProtectedRoute roles={['super-admin']}> [OPS][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/diagnostics" element={ [TEST][UI].

- **Ref:** PSR-V6-02937
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/diagnostics" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/diagnostics" element={<ProtectedRoute roles={['super-admin',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02938
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/diagnostics" element={<ProtectedRoute roles={['super-admin',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/features" element={<FeatureComparison />} /> [TEST][UI].

- **Ref:** PSR-V6-02942
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/features" element={<FeatureComparison />} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/gift-cards" element={ [TEST][UI].

- **Ref:** PSR-V6-02943
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/gift-cards" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/gift-cards" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02944
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/gift-cards" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/hardware" element={ [TEST][UI].

- **Ref:** PSR-V6-02945
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/hardware" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/locations" element={ [TEST][UI].

- **Ref:** PSR-V6-02950
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/locations" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/loyalty" element={ [TEST][UI].

- **Ref:** PSR-V6-02951
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/loyalty" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/loyalty-programs" element={ [TEST][UI].

- **Ref:** PSR-V6-02952
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/loyalty-programs" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/loyalty-programs" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02953
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/loyalty-programs" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/news" element={<News />} /> [TEST][UI].

- **Ref:** PSR-V6-02954
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/news" element={<News />} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/news/:id" element={<NewsDetail />} /> [TEST][UI].

- **Ref:** PSR-V6-02955
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/news/:id" element={<NewsDetail />} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/onboarding" element={ [TEST][UI].

- **Ref:** PSR-V6-02956
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/onboarding" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/onboarding" element={<ProtectedRoute roles={['business-owner']}> [SEC][TEST][UI].

- **Ref:** PSR-V6-02957
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/onboarding" element={<ProtectedRoute roles={['business-owner']}> [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/payment-processor" element={ [TEST][UI].

- **Ref:** PSR-V6-02958
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/payment-processor" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### UI (User Interface) Component: <Route path="/platform-users" element={ [TEST][UI].

- **Ref:** PSR-V6-02959
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/platform-users" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/platform-users" element={<ProtectedRoute roles={['super-admin',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02960
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/platform-users" element={<ProtectedRoute roles={['super-admin',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos" element={<ProtectedRoute><CashierScreen /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02961
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos" element={<ProtectedRoute><CashierScreen /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant" element={ [TEST][UI].

- **Ref:** PSR-V6-02962
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02963
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/delivery-providers" element={ [TEST][UI].

- **Ref:** PSR-V6-02964
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/delivery-providers" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/delivery-providers" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02965
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/delivery-providers" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/hardware" element={ [TEST][UI].

- **Ref:** PSR-V6-02968
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/hardware" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/locations" element={ [TEST][UI].

- **Ref:** PSR-V6-02969
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/locations" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/locations" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02970
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/locations" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/tv-displays" element={ [TEST][UI].

- **Ref:** PSR-V6-02977
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/tv-displays" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/tv-displays" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02978
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/tv-displays" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/website" element={ [TEST][UI].

- **Ref:** PSR-V6-02979
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/website" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/website" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02980
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/website" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/retail" element={ [TEST][UI].

- **Ref:** PSR-V6-02981
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/retail" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pricing" element={<PricingPage />} /> [OPS][TEST][UI].

- **Ref:** PSR-V6-02982
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pricing" element={<PricingPage />} /> [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02984
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/promotions" element={ [TEST][UI].

- **Ref:** PSR-V6-02985
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/promotions" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/reports" element={ [TEST][UI].

- **Ref:** PSR-V6-02986
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/reports" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/reports" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02987
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/reports" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02988
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02989
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/staff" element={ [TEST][UI].

- **Ref:** PSR-V6-02993
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/staff" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/staff" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02994
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/staff" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/system" element={<ProtectedRoute><SystemStatus /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02995
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/system" element={<ProtectedRoute><SystemStatus /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/test-ui" element={<ProtectedRoute><SharedUITest /></ProtectedRoute>} /> [OPS][TEST][UI].

- **Ref:** PSR-V6-02998
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/test-ui" element={<ProtectedRoute><SharedUITest /></ProtectedRoute>} /> [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/test-ui" element={<SharedUITest />} /> [OPS][TEST][UI].

- **Ref:** PSR-V6-02999
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/test-ui" element={<SharedUITest />} /> [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/vendors" element={ [TEST][UI].

- **Ref:** PSR-V6-03001
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/vendors" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Routes> [TEST][UI].

- **Ref:** PSR-V6-03002
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Routes> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: loadPath: '/locales/{{lng}}/{{ns}}.json', [TEST][UI].

- **Ref:** PSR-V6-03003
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: loadPath: '/locales/{{lng}}/{{ns}}.json', [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: {user?.role === 'super-admin' && (<Route path="/payment-processor"... [SEC][TEST][UI].

- **Ref:** PSR-V6-03004
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: {user?.role === 'super-admin' && (<Route path="/payment-processor"... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## Devices & Peripherals

### Database Schema: CREATE TABLE IF NOT EXISTS groceryhardwaredevices ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02813
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryhardwaredevices ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS poshardwaredevices ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02846
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS poshardwaredevices ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/devices" element={ [TEST][UI].

- **Ref:** PSR-V6-02966
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/devices" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/devices" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02967
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/devices" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Inventory

### API (Application Programming Interface) Endpoint: app.get('/api/inventory', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02782
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.get('/api/inventory', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.post('/api/inventory', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02789
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.post('/api/inventory', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.post('/api/products', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02792
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.post('/api/products', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS groceryproducts ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02819
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryproducts ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS inventorymovements ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02830
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS inventorymovements ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS inventorytransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02831
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS inventorytransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS productcategories ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02848
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS productcategories ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS productvariants ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02849
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS productvariants ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS promotionproducts ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02850
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS promotionproducts ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Inventory and 5 Other Functions [TEST][UI].

- **Ref:** PSR-V6-02869
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Inventory and 5 Other Functions [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Customer Storefront: Home, Products, Cart, Checkout, Order Success. [TEST][UI].

- **Ref:** PSR-V6-02882
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Customer Storefront: Home, Products, Cart, Checkout, Order Success. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Unified inventory across channels. [TEST][UI].

- **Ref:** PSR-V6-02916
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Unified inventory across channels. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/inventory" element={ [TEST][UI].

- **Ref:** PSR-V6-02946
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/inventory" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02947
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/products" element={ [TEST][UI].

- **Ref:** PSR-V6-02983
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/products" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Offline & Sync

### API (Application Programming Interface) Endpoint: app.delete('/api/orders/:id', async (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02781
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.delete('/api/orders/:id', async (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.get('/api/orders/:id', async (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02786
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.get('/api/orders/:id', async (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.post('/api/orders', async (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02791
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.post('/api/orders', async (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: async createTable(table: Omit<RestaurantTable, 'id'.

- **Ref:** PSR-V6-02796
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: async createTable(table: Omit<RestaurantTable, 'id'.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: async createTable(table: Omit<Table, 'id'>): Promise<Table> { [API][DATA][TEST][UI].

- **Ref:** PSR-V6-02797
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: async createTable(table: Omit<Table, 'id'>): Promise<Table> { [API][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS offlinepayments ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02839
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS offlinepayments ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Orders & Workflow

### API (Application Programming Interface) Endpoint: app.get('/api/menu', (req, res) => res.json(menuItems)); [API][TEST][UI].

- **Ref:** PSR-V6-02783
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.get('/api/menu', (req, res) => res.json(menuItems)); [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.get('/api/menu/:id', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02784
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.get('/api/menu/:id', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.get('/api/orders', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02785
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.get('/api/orders', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.get('/api/tables', (req, res) => { [API][DATA][TEST][UI].

- **Ref:** PSR-V6-02787
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.get('/api/tables', (req, res) => { [API][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.post('/api/orders', (req, res) => { [API][TEST][UI].

- **Ref:** PSR-V6-02790
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.post('/api/orders', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: app.put('/api/tables/:id/status', (req, res) => { [API][DATA][TEST][UI].

- **Ref:** PSR-V6-02793
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: app.put('/api/tables/:id/status', (req, res) => { [API][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS %I.orders ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02798
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS %I.orders ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS adminusers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02799
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS adminusers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS ageverifications ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02800
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS ageverifications ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS alerthistory ( [DATA][OPS][TEST][UI].

- **Ref:** PSR-V6-02801
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS alerthistory ( [DATA][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS cardtransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02802
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS cardtransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS customers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02803
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS customers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS deliveryproviders ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02804
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS deliveryproviders ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS ebttransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02805
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS ebttransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS employeeshifts ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02806
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS employeeshifts ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS giftcards ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02807
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS giftcards ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS giftcardtransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02808
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS giftcardtransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerybarcodescans ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02809
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerybarcodescans ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerycoupons ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02810
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerycoupons ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerycustomers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02811
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerycustomers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS groceryemployeeshifts ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02812
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryemployeeshifts ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS groceryloyaltycustomers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02814
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryloyaltycustomers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS groceryloyaltytransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02815
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryloyaltytransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerypayments ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02816
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerypayments ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerypaymenttransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02817
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerypaymenttransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS groceryprintjobs ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02818
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryprintjobs ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerypurchaseorders ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02820
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerypurchaseorders ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerystockalerts ( [DATA][OPS][TEST][UI].

- **Ref:** PSR-V6-02821
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerystockalerts ( [DATA][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerystockmovements ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02822
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerystockmovements ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerystorelocations ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02823
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerystorelocations ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerysuppliers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02824
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerysuppliers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerytimeclockentries ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02825
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerytimeclockentries ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerytransactionitems ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02826
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerytransactionitems ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerytransactions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02827
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerytransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS grocerywasterecords ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02828
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS grocerywasterecords ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS groceryweightreadings ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02829
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS groceryweightreadings ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS kitchenorders ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02832
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS kitchenorders ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS legaldocuments ( [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02833
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS legaldocuments ( [COM][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS loyaltytiers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02834
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS loyaltytiers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS menuitemmodifieroptions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02835
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS menuitemmodifieroptions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS menuitemmodifiers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02836
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS menuitemmodifiers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS menuitems ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02837
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS menuitems ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS notificationpreferences ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02838
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS notificationpreferences ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS orderitemmodifiers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02840
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS orderitemmodifiers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS orderitems ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02841
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS orderitems ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS orderpayments ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02842
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS orderpayments ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS orderratings ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02843
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS orderratings ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS payments ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02844
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS payments ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS payrollcompanies ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02845
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS payrollcompanies ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS printjobs ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02847
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS printjobs ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS promotions ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02851
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS promotions ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS purchaseorderitems ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02852
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS purchaseorderitems ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS purchaseorders ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02853
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS purchaseorders ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS referralprograms ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02854
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS referralprograms ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS resellermerchants ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02855
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS resellermerchants ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS restaurantlocations ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02856
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS restaurantlocations ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS securityevents ( [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02857
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS securityevents ( [COM][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS staffshifts ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02858
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS staffshifts ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS stockalerts ( [DATA][OPS][TEST][UI].

- **Ref:** PSR-V6-02859
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS stockalerts ( [DATA][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS stockmovements ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02860
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS stockmovements ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS suppliers ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02861
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS suppliers ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS systemconfigurations ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02862
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS systemconfigurations ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS tables ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02863
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS tables ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS timeclockentries ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02864
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS timeclockentries ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS userprofiles ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02865
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS userprofiles ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS wasterecords ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02866
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS wasterecords ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS websitesettings ( [DATA][TEST][UI].

- **Ref:** PSR-V6-02867
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS websitesettings ( [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Consolidate all order sources. [TEST][UI].

- **Ref:** PSR-V6-02880
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Consolidate all order sources. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Currently, POS (Point of Sale) merchants need separate solution for online orders. [TEST][UI].

- **Ref:** PSR-V6-02881
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Currently, POS (Point of Sale) merchants need separate solution for online orders. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide In-person POS (Point of Sale) + online ordering in one system. [TEST][UI].

- **Ref:** PSR-V6-02886
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide In-person POS (Point of Sale) + online ordering in one system. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Order tracking for customers. [TEST][UI].

- **Ref:** PSR-V6-02892
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Order tracking for customers. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Order tracking. [TEST][UI].

- **Ref:** PSR-V6-02893
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Order tracking. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Unified admin dashboard for all orders. [TEST][UI].

- **Ref:** PSR-V6-02914
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Unified admin dashboard for all orders. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide ✅ Created detailed status table in requirements document. [DATA][TEST][UI].

- **Ref:** PSR-V6-02920
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide ✅ Created detailed status table in requirements document. [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/kitchen" element={ [TEST][UI].

- **Ref:** PSR-V6-02948
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/kitchen" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/kitchen" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02949
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/kitchen" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/menu" element={ [TEST][UI].

- **Ref:** PSR-V6-02971
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/menu" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/menu" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02972
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/menu" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/orders" element={ [TEST][UI].

- **Ref:** PSR-V6-02973
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/orders" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/pos/restaurant/orders" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02974
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/orders" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Staffing & Time

### UI (User Interface) Component: <Route path="/employee-reports" element={ [TEST][UI].

- **Ref:** PSR-V6-02939
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/employee-reports" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/employee-reports" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02940
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/employee-reports" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-02941
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/shift-closing" element={ [TEST][UI].

- **Ref:** PSR-V6-02990
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/shift-closing" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/shift-closing" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02991
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/shift-closing" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/shifts" element={ [TEST][UI].

- **Ref:** PSR-V6-02992
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/shifts" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: <Route path="/time-clock" element={<ProtectedRoute><TimeClock /></ProtectedRoute>} /> [TEST][UI].

- **Ref:** PSR-V6-03000
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/time-clock" element={<ProtectedRoute><TimeClock /></ProtectedRoute>} /> [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Tax

### UI (User Interface) Component: <Route path="/pos/restaurant/tax-calculator" element={ [TEST][UI].

- **Ref:** PSR-V6-02975
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/tax-calculator" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### UI (User Interface) Component: <Route path="/pos/restaurant/tax-calculator" element={<ProtectedRoute... [TEST][UI].

- **Ref:** PSR-V6-02976
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/pos/restaurant/tax-calculator" element={<ProtectedRoute... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### UI (User Interface) Component: <Route path="/tax-reports" element={ [TEST][UI].

- **Ref:** PSR-V6-02996
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/tax-reports" element={ [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### UI (User Interface) Component: <Route path="/tax-reports" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].

- **Ref:** PSR-V6-02997
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: <Route path="/tax-reports" element={<ProtectedRoute roles={['business-owner',... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## Rehomed requirements (from ONB doc correction 2026-02-09)

_These requirements were originally placed under merchant onboarding during the initial split. They have been re-homed semantically to reduce agent confusion._

### API: POST /api/contactforms

- **Ref:** PSR-V6-00186
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/contactforms.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/data

- **Ref:** PSR-V6-00187
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/data.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/leads

- **Ref:** PSR-V6-00188
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/leads.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/loyaltyaccounts

- **Ref:** PSR-V6-00189
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/loyaltyaccounts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/loyaltyprograms

- **Ref:** PSR-V6-00190
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/loyaltyprograms.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/payment/cancel

- **Ref:** PSR-V6-00192
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/payment/cancel.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### API: POST /api/performance/benchmarks

- **Ref:** PSR-V6-00193
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/performance/benchmarks.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/performance/metrics

- **Ref:** PSR-V6-00195
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/performance/metrics.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/performance/optimization/execute

- **Ref:** PSR-V6-00196
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/performance/optimization/execute.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/pointstransactions

- **Ref:** PSR-V6-00197
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/pointstransactions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/products

- **Ref:** PSR-V6-00198
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/products.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/qr/bulk

- **Ref:** PSR-V6-00199
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/qr/bulk.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/qr/generate

- **Ref:** PSR-V6-00200
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/qr/generate.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/qr/merchant

- **Ref:** PSR-V6-00201
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/qr/merchant.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/qr/process-payment

- **Ref:** PSR-V6-00202
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/qr/process-payment.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### API: POST /api/qr/scan

- **Ref:** PSR-V6-00203
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/qr/scan.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/rewards

- **Ref:** PSR-V6-00211
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/rewards.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/sync

- **Ref:** PSR-V6-00212
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/sync.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/upload

- **Ref:** PSR-V6-00213
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/upload.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/websitecontent

- **Ref:** PSR-V6-00214
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/websitecontent.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /cleanup

- **Ref:** PSR-V6-00215
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /cleanup.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /upload

- **Ref:** PSR-V6-00216
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /upload.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /payments

- **Ref:** PSR-V6-00223
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /payments.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /payments/:paymentId/capture

- **Ref:** PSR-V6-00224
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /payments/:paymentId/capture.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /test

- **Ref:** PSR-V6-00225
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /test.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /printer/queue

- **Ref:** PSR-V6-00256
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /printer/queue.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /admin/optimization-rules

- **Ref:** PSR-V6-00284
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /admin/optimization-rules.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /admin/thresholds

- **Ref:** PSR-V6-00285
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /admin/thresholds.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /applications

- **Ref:** PSR-V6-00286
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /applications.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /apply

- **Ref:** PSR-V6-00287
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /apply.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /barcode/scan

- **Ref:** PSR-V6-00288
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /barcode/scan.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /conversions

- **Ref:** PSR-V6-00290
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /conversions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /files/:fileId/scan

- **Ref:** PSR-V6-00291
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /files/:fileId/scan.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /metrics

- **Ref:** PSR-V6-00292
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /metrics.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /optimizations/execute

- **Ref:** PSR-V6-00293
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /optimizations/execute.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /orders

- **Ref:** PSR-V6-00294
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /orders.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /orders/:id/cancel

- **Ref:** PSR-V6-00295
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /orders/:id/cancel.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /partner-codes

- **Ref:** PSR-V6-00296
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /partner-codes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /payment/cancel/:transactionId

- **Ref:** PSR-V6-00297
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /payment/cancel/:transactionId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### API: POST /payment/initialize/:deviceId

- **Ref:** PSR-V6-00298
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /payment/initialize/:deviceId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### API: POST /payment/process

- **Ref:** PSR-V6-00299
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /payment/process.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### API: POST /payouts/process

- **Ref:** PSR-V6-00300
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /payouts/process.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /printer/cancel/:jobId

- **Ref:** PSR-V6-00301
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /printer/cancel/:jobId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /printer/connect/:printerId

- **Ref:** PSR-V6-00302
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /printer/connect/:printerId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /printer/disconnect/:printerId

- **Ref:** PSR-V6-00303
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /printer/disconnect/:printerId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /printer/print

- **Ref:** PSR-V6-00304
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /printer/print.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /printer/print-receipt

- **Ref:** PSR-V6-00305
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /printer/print-receipt.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /printer/register

- **Ref:** PSR-V6-00306
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /printer/register.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /products

- **Ref:** PSR-V6-00307
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /products.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /register

- **Ref:** PSR-V6-00309
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /register.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /sync

- **Ref:** PSR-V6-00311
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /sync.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /tracking-links

- **Ref:** PSR-V6-00312
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /tracking-links.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /transactions

- **Ref:** PSR-V6-00313
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /transactions.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /upload

- **Ref:** PSR-V6-00314
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /upload.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /upload/bulk

- **Ref:** PSR-V6-00315
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /upload/bulk.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/developer/accounts

- **Ref:** PSR-V6-00327
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/developer/accounts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/developer/api-keys

- **Ref:** PSR-V6-00328
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/developer/api-keys.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/developer/webhooks

- **Ref:** PSR-V6-00329
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/developer/webhooks.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Purpose: Backend API (Application Programming Interface) and server-side logic

- **Ref:** PSR-V6-01860
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Purpose: Backend API (Application Programming Interface) and server-side logic.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/users

- **Ref:** PSR-V6-03675
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/users.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/users

- **Ref:** PSR-V6-03676
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/users.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /access-check

- **Ref:** PSR-V6-03700
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /access-check.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /access-check

- **Ref:** PSR-V6-03701
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /access-check.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /alerts

- **Ref:** PSR-V6-03702
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /alerts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /alerts/:alertId/resolve

- **Ref:** PSR-V6-03703
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /alerts/:alertId/resolve.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /feature-flags

- **Ref:** PSR-V6-03704
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /feature-flags.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /roles

- **Ref:** PSR-V6-03705
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /roles.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /roles

- **Ref:** PSR-V6-03706
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /roles.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /system/initialize

- **Ref:** PSR-V6-03707
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /system/initialize.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /system/initialize

- **Ref:** PSR-V6-03708
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /system/initialize.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /users/:userId/roles/:roleId

- **Ref:** PSR-V6-03709
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /users/:userId/roles/:roleId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /users/:userId/roles/:roleId

- **Ref:** PSR-V6-03710
- **Domain/Module:** POS / Retail POS
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /users/:userId/roles/:roleId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (2026-02-10): Device fleet management + retail vertical profiles

- **Ref:** PSR-EXT-POS-20260210-001
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** POS device fleet management is a shared platform capability for POS Retail, POS Restaurant, and POS Grocery, used by internal staff to remotely support, configure, and update devices with minimal merchant disruption.
- **Acceptance Criteria (GWT):**
- **Given** a POS device is enrolled to a merchant location, **when** the device checks in, **then** the system SHALL satisfy: “The platform SHALL maintain a device inventory (identity, model, OS/app versions, assigned merchant/location, last check-in, health status) and SHALL surface device health and offline/online state to authorized internal staff.”.
- **Given** an authorized internal staff member schedules an update, **when** the update is deployed, **then** the platform SHALL support staged rollout, forced rollout, rollback, and per-location maintenance windows, and SHALL record update results per device.
- **Given** a device is misconfigured (printer/scanner/network), **when** staff applies a remote configuration change, **then** the platform SHALL apply it via a secure channel and SHALL record who changed what and when.
- **Evidence fields (agent must populate during build):**
 - Admin UI: device inventory + device detail view + update/rollback actions (screenshots/selectors).
 - Device policy/config entities + audit log evidence.
 - Tests: device enrollment + update scheduling + rollback + telemetry ingestion.

- **Ref:** PSR-EXT-POS-20260210-002
- **Domain/Module:** POS / POS Systems
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Remote support must be safe-by-default and require explicit merchant visibility/consent where appropriate.
- **Acceptance Criteria (GWT):**
- **Given** internal staff initiates a remote support action affecting a live POS device, **when** the action is requested, **then** the system SHALL satisfy: “Remote support sessions SHALL be time-bound, role-gated, and auditable; the merchant SHALL be able to see that a support session is active and SHALL be able to revoke access.”.
- **Given** a remote support capability could expose sensitive data, **when** the feature is configured, **then** remote screen sharing / remote control SHALL be disabled by default and SHALL require an explicit enablement policy per merchant (and per session where applicable).
- **Evidence fields (agent must populate during build):**
 - Consent UI flows and revocation control (screenshots).
 - Session records in audit logs (who/what/when/duration).
 - Tests: permission checks + session expiry + revocation.

- **Ref:** PSR-EXT-POS-20260210-003
- **Domain/Module:** POS / POS Retail
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Prevent scope creep by implementing a “Retail Vertical Profile” system (feature flags + extension fields) while keeping a universal Retail POS core.
- **Acceptance Criteria (GWT):**
- **Given** a merchant is onboarding Retail POS, **when** they select business type, **then** the system SHALL satisfy: “Retail POS SHALL support a selectable Vertical Profile per tenant/location that controls enabled workflows, UI labels, and additional data fields without changing the universal core SKU/transaction model.”.
- **Given** a Vertical Profile introduces extra fields, **when** products are created/edited, **then** the platform SHALL store profile-specific attributes as schema-governed extensions (extension tables or validated JSON) and SHALL keep core SKU fields stable across all retail merchants.
- **Evidence fields (agent must populate during build):**
 - Profile selector UI + resulting UI/field differences.
 - Extension schema validation and migration evidence.
 - Tests: profile switching (where allowed) + extension field validation.

- **Ref:** PSR-EXT-POS-20260210-004
- **Domain/Module:** POS / POS Retail
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** scope-control
- **Details:** Define initial vertical support order and gate additional vertical complexity behind feature flags.
- **Acceptance Criteria (GWT):**
- **Given** the POS Retail module is deployed for Phase 1, **when** a merchant enables Retail POS, **then** the system SHALL satisfy: “Phase 1 Retail POS SHALL default to the ‘General Retail’ profile (barcode/SKU-first) as the only generally-available vertical profile; additional profiles (e.g., age-restricted retail, coffee/quick-serve) SHALL be feature-flagged and disabled by default.”.
- **Given** a merchant requests restaurant-class workflows (e.g., table service, coursing, full KDS), **when** the request is evaluated, **then** the system SHALL route those requirements to POS Restaurant (POSR) rather than expanding Retail POS scope.
- **Evidence fields (agent must populate during build):**
 - Feature flag config + admin controls.
 - Documentation of supported profiles by phase.
 - Tests: flags enforce availability and UI visibility.

## Addendum (2026-02-10): Hardware kits + tap-to-phone claim gating (PSR-EXT)

- **Ref:** PSR-EXT-POS-20260210-005
- **Domain/Module:** POS / POS Suite
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Standardize and control the POS hardware footprint to minimize support load and prevent scope creep. This addendum defines the minimum hardware “kits” (SKUs) and an approved device list model.
- **Acceptance Criteria (GWT):**
- **Given** Super Admin maintains the platform configuration, **when** Super Admin edits hardware settings, **then** the system SHALL provide an “Approved Hardware Catalog” with: device model, vendor, capabilities (NFC, EMV, magstripe, printer, barcode scanner, cash drawer), certifications (PCI PTS / EMV level where applicable), firmware/app compatibility notes, warranty/service channel, and “Approved/Deprecated/Blocked” status.
- **Given** Super Admin defines a “Hardware Kit SKU” (e.g., Retail Countertop Kit, Retail Mobile Kit), **when** a merchant is onboarded to POS, **then** the system SHALL allow selecting exactly one kit per lane/device role and SHALL auto-apply the compatible peripheral profile (printer type, scanner mode, drawer trigger, receipt templates).
- **Given** a device is marked Deprecated or Blocked, **when** a merchant attempts to enroll or activate it, **then** the system SHALL block activation and show the approved alternatives.

- **Ref:** PSR-EXT-POS-20260210-006
- **Domain/Module:** POS / POS Suite
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Barcode-first inventory + checkout SHALL be supported across POS Retail / POS Restaurant (where relevant) / POS Grocery.
- **Acceptance Criteria (GWT):**
- **Given** a cashier scans a product barcode, **when** the scan is accepted, **then** the POS SHALL resolve the barcode to a product SKU/variant (including weighted items where supported) and SHALL add it to the cart with correct price, tax category, and discount eligibility.
- **Given** a scanned barcode does not exist, **when** the merchant is authorized to create products, **then** the POS SHALL offer “quick create” (minimum fields + optional enrichment) and SHALL sync the new item to the merchant’s central catalog.
- **Given** a product is created/updated in web catalog management, **when** a device sync occurs, **then** the item SHALL appear on devices with the same SKU/barcode mapping (bidirectional sync).

- **Ref:** PSR-EXT-POS-20260210-007
- **Domain/Module:** POS / POS Suite
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** scope-control
- **Details:** Tap-to-phone (SoftPOS) acceptance is a “must” feature, but marketing claims and UI exposure MUST be gated by live provider integration + certification.
- **Acceptance Criteria (GWT):**
- **Given** tap-to-phone is not certified and enabled in the current environment, **when** a merchant views payment methods, **then** the UI SHALL NOT claim “tap-to-phone supported” and SHALL hide/disable the feature.
- **Given** a provider integration is live and certified for tap-to-phone on the target OS/device class, **when** Super Admin enables the feature flag for an allowed merchant cohort, **then** eligible merchant devices SHALL be able to accept contactless card presentment via the phone’s NFC and the platform SHALL log every tap-to-phone transaction with device + provider trace IDs.
- **Given** any marketing page or sales collateral is rendered by the platform, **when** it references tap-to-phone, **then** it SHALL read from the same feature-flag gate and SHALL only claim availability where the integration is enabled.