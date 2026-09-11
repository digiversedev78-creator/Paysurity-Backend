# 08 PAYMENT ORCHESTRATION ORC (Polished v1)

**Generated:** 2026-02-10 04:27:05 (America/Chicago)

**Covers capability area(s):** Payment orchestration, gateway abstraction, transaction lifecycle, retries, webhooks, reconciliation.

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

## Scope notes (avoid confusion)
- Merchant onboarding intake and agreements: `05_MERCHANT_ONBOARDING_ONB.md`.
- Merchant services (merchant portal, pricing, statements, disputes): `04_MERCHANT_SERVICES_MER.md`.
- Security baselines (PCI/PII): `15_SECURITY_PRIVACY.md`.

_Contains 100 requirements._

# Payment orchestration requirements


### FluidPay reuse-first integration policy (gateway capability reuse)

- **Ref:** PSR-EXT-FLUIDPAY-REUSE-20260210-001
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** architectural / integration
- **Notes:**
  - FluidPay SHALL be treated as a supported gateway/provider behind the PaySurity ORC abstraction layer.
  - The agent MUST prefer **reusing** provider capabilities where they meet the target-state requirement, instead of rebuilding commodity payment plumbing.
  - Direct coupling from apps/UI/services to FluidPay endpoints SHALL NOT be permitted; all gateway calls SHALL route via ORC adapters.
  - FluidPay “WalletJS / Apple Pay” SHALL be treated as **checkout wallets** (Apple Pay / Google Pay) only; it SHALL NOT be treated as PaySurity WAL stored-value ledger functionality.
  - Payment data handling: card entry SHALL use hosted tokenization/iframe patterns where available; PaySurity SHALL NOT store raw PAN/CVV.
- **Reuse mapping (agent directive):**
  - **Reuse**: Tokenizer/hosted fields for card entry tokenization.
  - **Reuse**: Customer Vault for saving payment methods (vaulted tokens only).
  - **Reuse**: Recurring for subscriptions/scheduled billing (PaySurity provides UI + orchestration).
  - **Reuse**: Invoices / Simple Payments for hosted pay links (PaySurity skins/wraps as needed).
  - **Reuse**: Webhooks for event-driven transaction/settlement updates into PaySurity ledger/reporting.
  - **Reuse**: Settlement Batches and transaction search for reporting and forecasting inputs.
  - **Reuse**: Fee Programs for surcharge/cash discount/dual pricing where supported by provider configuration.
  - **Reuse-first**: Webshop plugins (WooCommerce, Magento, Gravity Forms) for fast ecommerce activation paths.
  - **Build**: PaySurity WAL ledger + controls + P2P rules (provider checkout wallets do not replace this).
  - **Build**: Payroll engine and tax filing workflows.
  - **Build**: POS business logic, offline sync, catalog CRUD and device-first data model.
- **Acceptance Criteria (GWT):**
  - **Given** a requirement is implementable using FluidPay capabilities listed above, **when** the agent plans implementation, **then** the agent SHALL implement it via an ORC FluidPay adapter and SHALL NOT rebuild the underlying payment plumbing.
  - **Given** any PaySurity app or service needs to perform a gateway action (sale/auth/capture/refund/void/vault/recurring/webhook intake), **when** it is implemented, **then** it SHALL call ORC endpoints (not FluidPay directly) and SHALL be covered by contract tests.
  - **Given** a UI flow advertises “digital wallets” for checkout, **when** implemented, **then** it SHALL clearly label Apple Pay / Google Pay as checkout wallets and SHALL NOT imply PaySurity stored-value WAL balances.
  - **Given** the ORC adapter is implemented, **when** running integration tests, **then** sandbox tests SHALL cover: tokenization, vaulted customer, a recurring setup, webhook event intake, and a settlement batch fetch.
- **Evidence fields (agent must populate during build):**
  - ORC adapter code + API contract docs; contract test suite results.
  - Sandbox test run outputs proving: tokenization, vault, recurring, webhook intake, settlement fetch.
  - UI copy evidence showing checkout wallets vs WAL separation.
  - Secrets/keys stored only in approved secret managers; no secrets committed.

## Provider abstraction & routing

### System shall provide API (Application Programming Interface) Catalog: Multi-gateway payment orchestration documented

- **Ref:** PSR-V6-01254
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide API (Application Programming Interface) Catalog: Multi-gateway payment orchestration documented.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

## Core transaction lifecycle

### Database Schema: CREATE TABLE IF NOT EXISTS documents (

- **Ref:** PSR-V6-02720
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS documents (.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS files (

- **Ref:** PSR-V6-02721
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS files (.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS gatewayconfigurations (

- **Ref:** PSR-V6-02722
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS gatewayconfigurations (.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS paymentintents (

- **Ref:** PSR-V6-02723
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS paymentintents (.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Database Schema: CREATE TABLE IF NOT EXISTS signers (

- **Ref:** PSR-V6-02724
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS signers (.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: certificatePath: string;

- **Ref:** PSR-V6-02725
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: certificatePath: string;.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: describe('Critical Path: Payment Processing', () => {

- **Ref:** PSR-V6-02726
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: describe('Critical Path: Payment Processing', () => {.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: healthCheckPath: '/health

- **Ref:** PSR-V6-02727
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: healthCheckPath: '/health.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: healthCheckPath: string;

- **Ref:** PSR-V6-02728
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: healthCheckPath: string;.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: keyPath: string;

- **Ref:** PSR-V6-02729
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: keyPath: string;.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: metricsPath: '/metrics',

- **Ref:** PSR-V6-02730
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: metricsPath: '/metrics',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: metricsPath: string;

- **Ref:** PSR-V6-02731
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: metricsPath: string;.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: route.path,

- **Ref:** PSR-V6-02776
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: route.path,.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: private getRoutePattern(path: string): string | null {

- **Ref:** PSR-V6-02777
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: private getRoutePattern(path: string): string | null {.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Rehomed requirements (from ONB doc correction 2026-02-09)

_These requirements were originally placed under merchant onboarding during the initial split. They have been re-homed semantically to reduce agent confusion._

## Token vault & PCI boundary

### API: GET /api/gateway/status

- **Ref:** PSR-V6-02700
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /api/gateway/status.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /api/auth/logout

- **Ref:** PSR-V6-02702
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/auth/logout.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Webhooks & eventing

### UI (User Interface) Component: path: '/api/audit/events',

- **Ref:** PSR-V6-02737
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/audit/events',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

## Reconciliation, settlement & disputes signals

### Database Schema: CREATE TABLE IF NOT EXISTS commissionpayouts (

- **Ref:** PSR-V6-02719
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS commissionpayouts (.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## APIs

### API (Application Programming Interface) Endpoint: router.get('/discover', authorizationMiddleware('devices',..

- **Ref:** PSR-V6-00237
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/discover', authorizationMiddleware('devices',...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/health', authorizationMiddleware('devices', 'read'),..

- **Ref:** PSR-V6-00243
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/health', authorizationMiddleware('devices', 'read'),...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/status', authorizationMiddleware('devices', 'read'),..

- **Ref:** PSR-V6-00268
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/status', authorizationMiddleware('devices', 'read'),...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Week 1: FluidPay API (Application Programming Interface) integration setup

- **Ref:** PSR-V6-01189
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Week 1: FluidPay API (Application Programming Interface) integration setup.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide API (Application Programming Interface) Gateway: 85% complete with enterprise middleware stack

- **Ref:** PSR-V6-01258
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide API (Application Programming Interface) Gateway: 85% complete with enterprise middleware stack.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide APIGW-001: Enterprise API (Application Programming Interface) Gateway Infrastructure

- **Ref:** PSR-V6-01279
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide APIGW-001: Enterprise API (Application Programming Interface) Gateway Infrastructure.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide APIGW-002: Production-Ready API (Application Programming Interface) Gateway

- **Ref:** PSR-V6-01281
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide APIGW-002: Production-Ready API (Application Programming Interface) Gateway.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Enterprise API (Application Programming Interface) Gateway: Production-ready with Redis, JWT..

- **Ref:** PSR-V6-01498
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Enterprise API (Application Programming Interface) Gateway: Production-ready with Redis, JWT...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Evidence: Complete enterprise API (Application Programming Interface) gateway with 11..

- **Ref:** PSR-V6-01525
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Evidence: Complete enterprise API (Application Programming Interface) gateway with 11...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Evidence: Production-ready API (Application Programming Interface) gateway with advanced..

- **Ref:** PSR-V6-01529
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Evidence: Production-ready API (Application Programming Interface) gateway with advanced...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Gateway-Centric: Route all services through enterprise API (Application Programming Interface)..

- **Ref:** PSR-V6-01565
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Gateway-Centric: Route all services through enterprise API (Application Programming Interface)...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Sophisticated API (Application Programming Interface) Gateway: Production-ready with Redis, JWT..

- **Ref:** PSR-V6-01960
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Sophisticated API (Application Programming Interface) Gateway: Production-ready with Redis, JWT...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET paymentController

- **Ref:** PSR-V6-02703
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET paymentController.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: DELETE /gateway/routes/:id

- **Ref:** PSR-V6-02704
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: DELETE /gateway/routes/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: DELETE /gateway/services/:id/instances/:instanceId

- **Ref:** PSR-V6-02705
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: DELETE /gateway/services/:id/instances/:instanceId.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: this.app.delete(routePath, ...middlewares);

- **Ref:** PSR-V6-02706
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: this.app.delete(routePath, ...middlewares);.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /gateway/info

- **Ref:** PSR-V6-02707
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /gateway/info.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /gateway/routes

- **Ref:** PSR-V6-02708
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /gateway/routes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /gateway/services

- **Ref:** PSR-V6-02709
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /gateway/services.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /live

- **Ref:** PSR-V6-02710
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /live.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /ready

- **Ref:** PSR-V6-02711
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /ready.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: this.app.get(routePath, ...middlewares);

- **Ref:** PSR-V6-02712
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: this.app.get(routePath, ...middlewares);.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: this.app.get(this.config.monitoring.healthCheckPath,..

- **Ref:** PSR-V6-02713
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: this.app.get(this.config.monitoring.healthCheckPath,...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: this.app.get(this.config.monitoring.metricsPath,..

- **Ref:** PSR-V6-02714
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: this.app.get(this.config.monitoring.metricsPath,...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: this.app.patch(routePath, ...middlewares);

- **Ref:** PSR-V6-02715
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: this.app.patch(routePath, ...middlewares);.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /gateway/routes

- **Ref:** PSR-V6-02716
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /gateway/routes.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /gateway/services/:id/instances

- **Ref:** PSR-V6-02717
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /gateway/services/:id/instances.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: this.app.post(routePath, ...middlewares);

- **Ref:** PSR-V6-02718
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: this.app.post(routePath, ...middlewares);.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/affiliates',

- **Ref:** PSR-V6-02733
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/affiliates',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/affiliates/:id/commissions',

- **Ref:** PSR-V6-02734
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/affiliates/:id/commissions',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/alerts',

- **Ref:** PSR-V6-02735
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/alerts',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/alerts/:id/acknowledge',

- **Ref:** PSR-V6-02736
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/alerts/:id/acknowledge',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/backups',

- **Ref:** PSR-V6-02739
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/backups',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/backups/:id/restore',

- **Ref:** PSR-V6-02740
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/backups/:id/restore',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/compliance/gdpr/dsar',

- **Ref:** PSR-V6-02741
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/compliance/gdpr/dsar',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: path: '/api/compliance/kyc',

- **Ref:** PSR-V6-02742
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/compliance/kyc',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: path: '/api/compliance/pcidss/validate',

- **Ref:** PSR-V6-02743
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/compliance/pcidss/validate',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: path: '/api/compliance/reports',

- **Ref:** PSR-V6-02744
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/compliance/reports',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: path: '/api/compliance/soc2/generate',

- **Ref:** PSR-V6-02745
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/compliance/soc2/generate',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: path: '/api/disaster-recovery/plans',

- **Ref:** PSR-V6-02746
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/disaster-recovery/plans',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/disaster-recovery/plans/:id/trigger',

- **Ref:** PSR-V6-02747
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/disaster-recovery/plans/:id/trigger',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/ecommerce/orders',

- **Ref:** PSR-V6-02748
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/ecommerce/orders',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/ecommerce/products',

- **Ref:** PSR-V6-02749
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/ecommerce/products',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/health',

- **Ref:** PSR-V6-02750
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/health',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/health/detailed',

- **Ref:** PSR-V6-02751
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/health/detailed',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/merchants/:id/transactions',

- **Ref:** PSR-V6-02752
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/merchants/:id/transactions',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/metrics',

- **Ref:** PSR-V6-02753
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/metrics',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/monitoring/alerts',

- **Ref:** PSR-V6-02754
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/monitoring/alerts',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/monitoring/alerts/:id/acknowledge',

- **Ref:** PSR-V6-02755
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/monitoring/alerts/:id/acknowledge',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/monitoring/dashboard',

- **Ref:** PSR-V6-02756
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/monitoring/dashboard',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/monitoring/health',

- **Ref:** PSR-V6-02757
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/monitoring/health',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/monitoring/metrics',

- **Ref:** PSR-V6-02758
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/monitoring/metrics',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/payroll/efile',

- **Ref:** PSR-V6-02759
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/payroll/efile',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/payroll/employees/:id',

- **Ref:** PSR-V6-02760
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/payroll/employees/:id',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/payroll/reports',

- **Ref:** PSR-V6-02761
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/payroll/reports',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/payroll/run',

- **Ref:** PSR-V6-02762
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/payroll/run',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/hardware/devices',

- **Ref:** PSR-V6-02763
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/hardware/devices',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/hardware/payment',

- **Ref:** PSR-V6-02764
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/hardware/payment',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

### UI (User Interface) Component: path: '/api/pos/hardware/print',

- **Ref:** PSR-V6-02765
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/hardware/print',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/hardware/scan',

- **Ref:** PSR-V6-02766
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/hardware/scan',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/inventory',

- **Ref:** PSR-V6-02767
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/inventory',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/inventory/alerts',

- **Ref:** PSR-V6-02768
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/inventory/alerts',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/inventory/stock',

- **Ref:** PSR-V6-02769
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/inventory/stock',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/pos/orders/:id',

- **Ref:** PSR-V6-02770
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/pos/orders/:id',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/qr/:id/validate',

- **Ref:** PSR-V6-02771
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/qr/:id/validate',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/qr/generate',

- **Ref:** PSR-V6-02772
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/qr/generate',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/v1/merchants/:id',

- **Ref:** PSR-V6-02773
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/v1/merchants/:id',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/v1/wallets',

- **Ref:** PSR-V6-02774
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/v1/wallets',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/wallets/:id/transfer',

- **Ref:** PSR-V6-02775
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/wallets/:id/transfer',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/activity', authorizationMiddleware('dashboard',..

- **Ref:** PSR-V6-03682
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/activity', authorizationMiddleware('dashboard',...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/alerts', authorizationMiddleware('dashboard',..

- **Ref:** PSR-V6-03683
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/alerts', authorizationMiddleware('dashboard',...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/health', authorizationMiddleware('dashboard',..

- **Ref:** PSR-V6-03690
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/health', authorizationMiddleware('dashboard',...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/metrics', authorizationMiddleware('dashboard',..

- **Ref:** PSR-V6-03691
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/metrics', authorizationMiddleware('dashboard',...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API (Application Programming Interface) Endpoint: router.get('/stats', authorizationMiddleware('dashboard', 'read'),..

- **Ref:** PSR-V6-03693
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API (Application Programming Interface) Endpoint: router.get('/stats', authorizationMiddleware('dashboard', 'read'),...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Logging, traceability & observability

### API: POST /api/auth/login

- **Ref:** PSR-V6-02701
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /api/auth/login.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### UI (User Interface) Component: path: '/api/audit/verify',

- **Ref:** PSR-V6-02738
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: path: '/api/audit/verify',.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console.

## Testing

### UI (User Interface) Component: outputPath: ./test-reports/${environment}

- **Ref:** PSR-V6-02732
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Administrator (Merchant Admin) or System Integrator`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI (User Interface) Component: outputPath: ./test-reports/${environment}.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (provider adapters + provider-neutral experience)

### ORC SHALL support provider adapters for multiple processors/gateways (including FluidPay and Argyle) via a stable internal interface contract

- **Ref:** PSR-EXT-ORC-20260209-001
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Adapter contract MUST cover: auth/capture/sale, refund, void, tokenization, webhook/event mapping, and reconciliation import.
- **Acceptance Criteria (GWT):**
- **Given** PaySurity processes a payment, **when** the orchestration layer executes, **then** the system SHALL satisfy: “ORC SHALL support provider adapters for multiple processors/gateways (including FluidPay and Argyle) via a stable internal interface contract.”.
- **Given** a provider adapter is unavailable, **when** routing/fallback rules apply, **then** the system SHALL follow configured policy and preserve idempotency.
- **Given** CI executes automated tests, **when** the suite runs, **then** contract tests SHALL validate adapters deterministically.
- **Evidence fields (agent must populate during build):**
  - Adapter contracts + fixtures.
  - Routing policy config examples.
  - Webhook signature verification evidence.
  - Tests + CI run evidence.


### ORC SHALL ensure merchant-facing apps and logs do not disclose the underlying provider unless legally required, while preserving internal traceability via provider IDs

- **Ref:** PSR-EXT-ORC-20260209-002
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Expose provider only to Super Admin/staff roles in internal dashboards.
- **Acceptance Criteria (GWT):**
- **Given** PaySurity processes a payment, **when** the orchestration layer executes, **then** the system SHALL satisfy: “ORC SHALL ensure merchant-facing apps and logs do not disclose the underlying provider unless legally required, while preserving internal traceability via provider IDs.”.
- **Given** a provider adapter is unavailable, **when** routing/fallback rules apply, **then** the system SHALL follow configured policy and preserve idempotency.
- **Given** CI executes automated tests, **when** the suite runs, **then** contract tests SHALL validate adapters deterministically.
- **Evidence fields (agent must populate during build):**
  - Adapter contracts + fixtures.
  - Routing policy config examples.
  - Webhook signature verification evidence.
  - Tests + CI run evidence.


### ORC SHALL support per-merchant and per-transaction routing policies, including preferred provider, fallback order, and rule-based routing (e.g., vertical, MCC, card-present vs CNP)

- **Ref:** PSR-EXT-ORC-20260209-003
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Routing policy MUST be auditable and versioned.
- **Acceptance Criteria (GWT):**
- **Given** PaySurity processes a payment, **when** the orchestration layer executes, **then** the system SHALL satisfy: “ORC SHALL support per-merchant and per-transaction routing policies, including preferred provider, fallback order, and rule-based routing (e.g., vertical, MCC, card-present vs CNP).”.
- **Given** a provider adapter is unavailable, **when** routing/fallback rules apply, **then** the system SHALL follow configured policy and preserve idempotency.
- **Given** CI executes automated tests, **when** the suite runs, **then** contract tests SHALL validate adapters deterministically.
- **Evidence fields (agent must populate during build):**
  - Adapter contracts + fixtures.
  - Routing policy config examples.
  - Webhook signature verification evidence.
  - Tests + CI run evidence.


### ORC SHALL support secure document-based onboarding submissions when a provider lacks an API, by generating canonical submission bundles and tracking delivery status

- **Ref:** PSR-EXT-ORC-20260209-004
- **Domain/Module:** ORC / Payment Orchestration
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Pairs with ONB submission; ORC records provider readiness states to prevent attempted API actions when not supported.
- **Acceptance Criteria (GWT):**
- **Given** PaySurity processes a payment, **when** the orchestration layer executes, **then** the system SHALL satisfy: “ORC SHALL support secure document-based onboarding submissions when a provider lacks an API, by generating canonical submission bundles and tracking delivery status.”.
- **Given** a provider adapter is unavailable, **when** routing/fallback rules apply, **then** the system SHALL follow configured policy and preserve idempotency.
- **Given** CI executes automated tests, **when** the suite runs, **then** contract tests SHALL validate adapters deterministically.
- **Evidence fields (agent must populate during build):**
  - Adapter contracts + fixtures.
  - Routing policy config examples.
  - Webhook signature verification evidence.
  - Tests + CI run evidence.

## ORC adapter contract (minimum Phase 1)

This section defines the **minimum stable contract** between PaySurity apps/services and the ORC layer.
Agents SHALL implement these ORC endpoints first, and SHALL implement provider-specific logic behind adapters.

### ORC API surface (PaySurity-facing)
- **Tokenization**
  - `POST /orc/tokenize` → returns provider token (no PAN/CVV stored).
- **Vault**
  - `POST /orc/vault/customers` (create customer)
  - `POST /orc/vault/customers/{id}/payment-methods` (attach method via token)
  - `GET /orc/vault/customers/{id}` (read)
  - `GET /orc/vault/customers/{id}/payment-methods` (list)
- **Transactions**
  - `POST /orc/transactions/authorize`
  - `POST /orc/transactions/capture`
  - `POST /orc/transactions/sale`
  - `POST /orc/transactions/refund`
  - `POST /orc/transactions/void`
  - `GET  /orc/transactions/{id}` (read)
  - `GET  /orc/transactions/search` (query by date, amount, last4 token ref, status, etc.)
- **Recurring / billing**
  - `POST /orc/recurring/plans`
  - `POST /orc/recurring/subscriptions`
  - `POST /orc/recurring/subscriptions/{id}/cancel`
  - `GET  /orc/recurring/subscriptions/{id}`
- **Invoices / pay links**
  - `POST /orc/invoices`
  - `GET  /orc/invoices/{id}`
  - `POST /orc/paylinks` (hosted checkout link)
- **Reporting inputs**
  - `GET /orc/settlements/batches` (by date range)
  - `GET /orc/settlements/batches/{id}` (batch detail)

### Webhooks (provider → PaySurity)
- ORC SHALL expose `POST /orc/webhooks/{provider}` and normalize inbound events into PaySurity event records.
- Minimum normalized event types: `transaction.*`, `refund.*`, `chargeback.*` (if provider supports), `settlement.*`.
- ORC SHALL store raw payload + normalized payload; raw retained per security/compliance policy.

### Adapter rules
- Apps/services MUST call ORC endpoints only (no direct provider calls).
- Each provider adapter MUST have contract tests proving equivalent behavior for: tokenization, vault, sale, refund, webhook intake, and settlement batch fetch.

### Phase 1 default provider stance
- FluidPay capabilities are **reuse-first** per **PSR-EXT-FLUIDPAY-REUSE-20260210-001**.
- Additional providers MAY be added behind ORC without changing app code.

### FluidPay endpoint mapping (Phase 1 minimum)

This mapping reduces adapter ambiguity. Agents SHALL implement ORC endpoints (PaySurity-facing) and map them to the provider (FluidPay) capability equivalents.

| ORC function | ORC endpoint | FluidPay capability (concept) | Notes |
|---|---|---|---|
| Tokenize payment method | `POST /orc/tokenize` | Tokenizer / hosted fields | ORC receives token only; no PAN/CVV stored. |
| Create customer | `POST /orc/vault/customers` | Customer Vault (customer) | Provider customer identifier stored as external ref. |
| Attach payment method | `POST /orc/vault/customers/{id}/payment-methods` | Customer Vault (payment method) | Attach via token; store vaulted token ref. |
| Sale | `POST /orc/transactions/sale` | Sale / charge | Must support idempotency key. |
| Authorize | `POST /orc/transactions/authorize` | Authorization | Optional in Phase 1 if Sale covers immediate capture. |
| Capture | `POST /orc/transactions/capture` | Capture | Required if auth/capture flow enabled. |
| Void | `POST /orc/transactions/void` | Void | Same-day void behavior per provider rules. |
| Refund | `POST /orc/transactions/refund` | Refund | Partial + full refunds where supported. |
| Transaction read/search | `GET /orc/transactions/{id}` + `/search` | Transaction query/search | Used for reconciliation + support. |
| Recurring plan/subscription | `POST /orc/recurring/plans` + `/subscriptions` | Recurring | PaySurity owns UI + business rules; provider executes billing. |
| Cancel subscription | `POST /orc/recurring/subscriptions/{id}/cancel` | Recurring cancel | Preserve audit log. |
| Invoice / pay link | `POST /orc/invoices` + `POST /orc/paylinks` | Invoices / Simple Payments | Public site may wrap/skin. |
| Settlement batches | `GET /orc/settlements/batches` | Settlement/batch reporting | Inputs for dashboards + forecasting. |
| Webhook intake | `POST /orc/webhooks/fluidpay` | Webhooks | Normalize into PaySurity events; store raw + normalized. |
| Checkout wallets | UI (provider JS) | WalletJS (Apple Pay / Google Pay) | Checkout wallet only; not WAL stored-value. |
