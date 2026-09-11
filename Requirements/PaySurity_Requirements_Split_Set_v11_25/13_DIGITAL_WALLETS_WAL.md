# 13 DIGITAL WALLETS WAL

**Generated:** 2026-02-10 01:55:00 (America/Chicago)

**Covers capability area(s):** Digital Wallets

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# Digital Wallets

_Contains 203 requirements._

## Scope decisions (binding)

- Wallet program model: Model B.
- P2P: Employee wallets MAY transfer to any verified wallet user; child↔child is disabled by default and requires parent/guardian enablement (and mutual enablement when both children are involved).
- Phase 1: no cash-in (cash-load) via retail locations/agents (feature-flag only).
- See `16_COMPLIANCE_LEGAL.md` + `15_SECURITY_SEC.md` for compliance and security controls; WAL MUST emit events and enforce policies defined there.

## Core Wallet Platform

### > DigitalWallets-Core/services/bankLinkingService  (API, TEST, UI)

- **Ref:** PSR-V6-03250
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/services/bankLinkingService [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/services/paymentService  (API, TEST, UI)

- **Ref:** PSR-V6-03251
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/services/paymentService [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/services/QRCodeService  (API, TEST, UI)

- **Ref:** PSR-V6-03252
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/services/QRCodeService [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/services/transactionService  (API, TEST, UI)

- **Ref:** PSR-V6-03254
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/services/transactionService [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Bank linking lock duration

- **Ref:** PSR-V6-03295
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Bank linking lock duration.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Bill payment setup  (TEST, UI)

- **Ref:** PSR-V6-03296
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Setup and schedule bill payments to registered payees | AcceptanceCriteria: Payee added | Payment scheduled | Execution confirmed | Status tracked | ReqID: DW-BIL-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Bill payment setup [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Bill payments  (TEST, UI)

- **Ref:** PSR-V6-03297
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Pay utility bills and invoices directly from digital wallet | AcceptanceCriteria: Biller validation | Payment scheduling | Confirmation tracking | ReqID: DW-BIL-023
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Bill payments [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Categories & budgets  (OPS, TEST, UI)

- **Ref:** PSR-V6-03300
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Assign MCC (Merchant Category Code) categories with monthly budgets. | acceptancetests: - Overspend in category declines; alert sent. | risknotes: WAL-002 | reqid: WAL-005
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Categories & budgets [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Digital wallet account creation  (COM, DATA, SEC, TEST, UI)

- **Ref:** PSR-V6-03324
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Create digital wallet with identity verification and funding source | AcceptanceCriteria: Identity verified via KYC (Know Your Customer) | Funding source validated | Wallet ID generated | Status tracked | ReqID: DW-ACT-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Digital wallet account creation [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Digital wallet creation  (API, COM, DATA, SEC, TEST, UI)

- **Ref:** PSR-V6-03327
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** User creates wallet with phone/email verification and minimal KYC (Know Your Customer) | AcceptanceCriteria: Email/SMS OTP (One-Time Password) verified | Basic identity collected | Wallet ID generated | Terms of service accepted | ReqID: DW-ACT-005
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Digital wallet creation [API][COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Digital wallet creation  (COM, DATA, SEC, TEST, UI)

- **Ref:** PSR-V6-03326
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Create secure digital wallet with identity verification and funding | AcceptanceCriteria: KYC (Know Your Customer) verification | Wallet funding options | Secure key storage | ReqID: DW-WAL-021
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Digital wallet creation [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Digital Wallet Creation  (COM, SEC, TEST, UI)

- **Ref:** PSR-V6-03325
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Create digital wallet with customer verification and funding source linking | AcceptanceCriteria: Wallet created successfully | Customer verified | Funding sources linked | PCI (Payment Card Industry) compliance met | ReqID: DW-WAL-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Digital Wallet Creation [COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Digital Wallets – Stubbed Implementations (code skeletons created by script)  (TEST, UI)

- **Ref:** PSR-V6-03328
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Digital Wallets – Stubbed Implementations (code skeletons created by script) [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Hardware-agnostic secure element  (TEST, UI)

- **Ref:** PSR-V6-03340
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Distributed secure computation across multiple devices without hardware dependency | AcceptanceCriteria: MPC across devices | No single point of failure | Real-time key rotation | Hardware agnostic | ReqID: DW-SEC-021
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Hardware-agnostic secure element [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Invalid QR Code Handling  (TEST, UI)

- **Ref:** PSR-V6-03343
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** The system should be able to handle cases where an invalid or expired QR code is scanned. | ReqID: DW-005-DR04
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Invalid QR Code Handling [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Invalid QR Code Handling

- **Ref:** PSR-V6-03344
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Invalid QR Code Handling.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Loyalty points system  (TEST, UI)

- **Ref:** PSR-V6-03348
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Earn and redeem points for purchases with expiration rules | AcceptanceCriteria: Points earned on spend | Balance updates real-time | Redemption applies discount | Expiration enforced | ReqID: DW-LOY-019
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Loyalty points system [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Multi-currency wallet creation  (DATA, OPS, TEST, UI)

- **Ref:** PSR-V6-03349
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Create and verify multi-currency digital wallets supporting fiat and CBDCs | AcceptanceCriteria: Supports multiple currencies per wallet | Validates user identity | Creates virtual account numbers | Sets initial spending limits | ReqID: DW-ONB-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi-currency wallet creation [DATA][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Multi-currency wallet engine  (OPS, TEST, UI)

- **Ref:** PSR-V6-03350
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Support multiple currencies with real-time FX (Foreign Exchange) rates and conversion | AcceptanceCriteria: Multi-currency accounts | Real-time FX (Foreign Exchange) rates | Currency conversion | Balance tracking | ReqID: DW-WLT-018
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi-currency wallet engine [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Closure should be irreversible (TEST, UI)

- **Ref:** PSR-V6-03353
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Closure should be irreversible [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Include edge cases with partial matches (TEST, UI)

- **Ref:** PSR-V6-03357
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include edge cases with partial matches [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Include retry logic for notification failures (OPS, TEST, UI)

- **Ref:** PSR-V6-03358
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include retry logic for notification failures [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Includes verification of transaction blocking during suspension (TEST, UI)

- **Ref:** PSR-V6-03360
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Includes verification of transaction blocking during suspension [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Validate date range input and error handling (TEST, UI)

- **Ref:** PSR-V6-03374
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate date range input and error handling [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Validates FX (Foreign Exchange) and fee calculation (TEST, UI)

- **Ref:** PSR-V6-03375
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates FX (Foreign Exchange) and fee calculation [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Validates system enforcement of regulatory and system limits (TEST, UI)

- **Ref:** PSR-V6-03378
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates system enforcement of regulatory and system limits [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Validates transparency of fees and FX (Foreign Exchange) (TEST, UI)

- **Ref:** PSR-V6-03379
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates transparency of fees and FX (Foreign Exchange) [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify compatibility with accounting software (TEST, UI)

- **Ref:** PSR-V6-03383
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify compatibility with accounting software [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify error handling for invalid bank details separately (TEST, UI)

- **Ref:** PSR-V6-03384
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify error handling for invalid bank details separately [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify error handling for invalid inputs (TEST, UI)

- **Ref:** PSR-V6-03385
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify error handling for invalid inputs [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify messages are user-friendly and informative (TEST, UI)

- **Ref:** PSR-V6-03386
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify messages are user-friendly and informative [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify no transactions are allowed while suspended (TEST, UI)

- **Ref:** PSR-V6-03387
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify no transactions are allowed while suspended [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify spend control enforcement (TEST, UI)

- **Ref:** PSR-V6-03389
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify spend control enforcement [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify token uniqueness and linkage (SEC, TEST, UI)

- **Ref:** PSR-V6-03391
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify token uniqueness and linkage [SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notifications (spend/limits)  (OPS, TEST, UI)

- **Ref:** PSR-V6-03393
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Realtime push/email/SMS for key events. | acceptancetests: - Overspend triggers alert in user locale. | risknotes: SHARED-002 | reqid: WAL-008
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notifications (spend/limits) [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Real-time notification system  (OPS, TEST, UI)

- **Ref:** PSR-V6-03402
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Multi-channel notifications with delivery guarantees and read receipts | AcceptanceCriteria: Push notifications | SMS alerts | Email notifications | Delivery tracking | ReqID: DW-NTF-028
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Real-time notification system [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Receipt Generation  (TEST, UI)

- **Ref:** PSR-V6-03403
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** The system should be able to generate a receipt for a QR payment transaction. | ReqID: DW-005-DR02
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Receipt Generation [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Categories & budgets (MERGED, ROLLUP)

- **Ref:** PSR-V6-03826
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Assign MCC categories with monthly budgets.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Categories & budgets [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Notifications (spend/limits) (MERGED, ROLLUP)

- **Ref:** PSR-V6-03829
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Realtime push/email/SMS for key events.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Notifications (spend/limits) [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: QR payments [UI (User Interface)] (MERGED, ROLLUP)

- **Ref:** PSR-V6-03827
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Static/dynamic QR, refunds, receipts.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: QR payments [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Wallet account creation  (COM, DATA, SEC, TEST, UI)

- **Ref:** PSR-V6-03407
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Create digital wallet with identity verification and funding source | AcceptanceCriteria: KYC (Know Your Customer) verification passed | Bank account linked | Initial funding processed | Wallet activated | ReqID: DW-ACT-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet account creation [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Wallet account linking  (TEST, UI)

- **Ref:** PSR-V6-03408
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Link bank accounts via micro-deposit verification for wallet funding | AcceptanceCriteria: Initiate micro-deposits | Verify amounts within 3 days | Set daily limits | Confirm account ownership | ReqID: DW-LNK-005
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet account linking [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Wallet creation  (TEST, UI)

- **Ref:** PSR-V6-03409
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Custodial wallet setup with double-entry accounting and exactly-once semantics | AcceptanceCriteria: Wallet created with unique ID | Double-entry enforced | Exactly-once processing | Status tracked | ReqID: DW-CRE-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet creation [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Wallet transaction processing  (TEST, UI)

- **Ref:** PSR-V6-03413
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process wallet transactions including transfers and payments | AcceptanceCriteria: Transfers execute | Balances update | Notifications sent | Receipts generated | ReqID: DW-TXN-015
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet transaction processing [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## Employer–Employee Wallets & Expenses

### Test note: Verify allowance enforcement on multiple transactions (TEST, UI)

- **Ref:** PSR-V6-03380
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify allowance enforcement on multiple transactions [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### System shall provide Digital Wallet App: Create mobile application for wallet services

- **Ref:** PSR-V6-01461
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Digital Wallet App: Create mobile application for wallet services.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### System shall provide DigitalWallets-API (Application Programming Interface): 33% (6 files, 678 lines)

- **Ref:** PSR-V6-01466
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide DigitalWallets-API: 33% (6 files, 678 lines).”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### System shall provide Three-Tier Digital Wallet Ecosystem: Complete API (Application Programming Interface), Core,

- **Ref:** PSR-V6-02030
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Three-Tier Digital Wallet Ecosystem: Complete API, Core..”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Identity & Compliance Hooks

### DB schema: cbdccomplianceevents table (COM, DATA, TEST, UI)

- **Ref:** PSR-V6-03304
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS cbdccomplianceevents ( [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: complianceevents table (COM, DATA, TEST, UI)

- **Ref:** PSR-V6-03309
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS complianceevents ( [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Digital Wallets, Foundations, Compliance, and Super Admin pieces that this AI flow depends on  (COM, TEST, UI)

- **Ref:** PSR-V6-03329
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Digital Wallets, Foundations, Compliance, and Super Admin pieces that this AI flow depends on [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Ensures regulatory compliance enforcement (COM, TEST, UI)

- **Ref:** PSR-V6-03356
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures regulatory compliance enforcement [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Test compliance notification mechanism (COM, OPS, TEST, UI)

- **Ref:** PSR-V6-03365
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test compliance notification mechanism [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Verify real-time screening performance (TEST, UI)

- **Ref:** PSR-V6-03388
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify real-time screening performance [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/users/:userId/kyc', authenticate, (req, res) => {  (API, COM, SEC, TEST, UI)

- **Ref:** PSR-V6-03265
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/users/:userId/kyc', authenticate, (req, res) => { [API][COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYC (Know Your Customer) & sanctions  (COM, SEC, TEST, UI)

- **Ref:** PSR-V6-03345
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** OFAC and watchlist screening; risk flags. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: DW-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer) & sanctions [COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYC (Know Your Customer) & sanctions  (COM, SEC, TEST, UI)

- **Ref:** PSR-V6-03346
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** OFAC and watchlist screening; risk flags. | ReqID: DW-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer) & sanctions [COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYC (Know Your Customer)/AML (Anti-Money Laundering) screening for wallet users  (COM, OPS, SEC, TEST, UI)

- **Ref:** PSR-V6-03347
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Screen PEP/sanctions; ongoing monitoring + SAR workflow. | acceptancetests: - New user screened; hit → manual review queue. - Audit shows decisions & reasons. | risknotes: result | reqid: WAL-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer)/AML (Anti-Money Laundering) screening for wallet users [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: KYC & sanctions [UI (User Interface)] (COM, MERGED, ROLLUP)

- **Ref:** PSR-V6-03818
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** OFAC and watchlist screening; risk flags.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: KYC & sanctions [MERGED][ROLLUP][UI][COM].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## Parent–Child Wallets

## Funding & Sources

### > DigitalWallets-Core/services/refundService  (API, TEST, UI)

- **Ref:** PSR-V6-03253
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/services/refundService [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/tests/refundService  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03258
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/tests/refundService [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: router.post('/:walletId/add-funds',  (API, TEST, UI)

- **Ref:** PSR-V6-03291
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.post('/:walletId/add-funds', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Funding sources  (OPS, TEST, UI)

- **Ref:** PSR-V6-03339
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Bank linking, card topup, ACH (Automated Clearing House); limits/holds. | SemanticNotes: The provided code bundle contains configuration and setup files for the Digital Wallets module but no implementation related to funding sources such as bank linking, card topup, ACH (Automated Clearing House), or limits/holds. The requirement DW-006 is marked as planned and no code or tests are present to fulfill it. | ReqID: DW-006
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Funding sources [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Funding sources  (TEST, UI)

- **Ref:** PSR-V6-03337
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Bank linking, card topup, ACH (Automated Clearing House); limits/holds. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: DW-006
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Funding sources [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Funding sources  (TEST, UI)

- **Ref:** PSR-V6-03338
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Bank linking, card topup, ACH (Automated Clearing House); limits/holds. | ReqID: DW-006
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Funding sources [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Insufficient Funds Handling  (OPS, TEST, UI)

- **Ref:** PSR-V6-03341
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** The system should be able to handle cases where the user has insufficient funds for a QR payment. | ReqID: DW-005-DR03
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Insufficient Funds Handling [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Insufficient Funds Handling

- **Ref:** PSR-V6-03342
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Insufficient Funds Handling.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Validates insufficient funds handling (OPS, TEST, UI)

- **Ref:** PSR-V6-03376
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates insufficient funds handling [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Refund Processing  (TEST, UI)

- **Ref:** PSR-V6-03404
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** The system should be able to process full and partial refunds for QR payments. | ReqID: DW-005-DR01
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Refund Processing [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Funding methods (MERGED, ROLLUP)

- **Ref:** PSR-V6-03820
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** ACH, card top-up, payroll split, internal transfer.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Funding methods [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Funding sources [UI (User Interface)] (MERGED, ROLLUP)

- **Ref:** PSR-V6-03823
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Bank linking, card topup, ACH; limits/holds.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Funding sources [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Wallet funding  (TEST, UI)

- **Ref:** PSR-V6-03410
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Multiple funding methods including ACH (Automated Clearing House), instant rails, and card push | AcceptanceCriteria: ACH (Automated Clearing House) std/same-day supported | Instant rails available | Card push funding works | ETAs displayed | ReqID: DW-FND-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet funding [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## Transfers & P2P

### Test note: Validates recipient validation (OPS, TEST, UI)

- **Ref:** PSR-V6-03377
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates recipient validation [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: router.post('/:walletId/transfer',  (API, TEST, UI)

- **Ref:** PSR-V6-03293
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.post('/:walletId/transfer', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: wallettransfers table (DATA, TEST, UI)

- **Ref:** PSR-V6-03323
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS wallettransfers ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Basic domestic transfer happy path (TEST, UI)

- **Ref:** PSR-V6-03352
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Basic domestic transfer happy path [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### P2P (Peer-to-Peer) and remittance transfers  (TEST, UI)

- **Ref:** PSR-V6-03394
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Support domestic and cross border peer to peer wallet transfers with FX (Foreign Exchange) conversion transparent fees and regulatory checks
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “P2P (Peer-to-Peer) and remittance transfers [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### P2P (Peer-to-Peer) and remittance transfers

- **Ref:** PSR-V6-03395
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “P2P (Peer-to-Peer) and remittance transfers.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### P2P (Peer-to-Peer) transfer core  (DATA, OPS, TEST, UI)

- **Ref:** PSR-V6-03396
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Send funds between wallets with balance checks and notifications | AcceptanceCriteria: Sender balance validated | Recipient wallet verified | Both parties notified | Transaction immutable | ReqID: DW-P2P (Peer-to-Peer)-006
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “P2P (Peer-to-Peer) transfer core [DATA][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### P2P (Peer-to-Peer) transfer core  (TEST, UI)

- **Ref:** PSR-V6-03397
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Send and receive peer-to-peer transfers between wallets | AcceptanceCriteria: Transfer initiated | Balances updated | Notifications sent | History recorded | ReqID: DW-TXN-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “P2P (Peer-to-Peer) transfer core [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### P2P (Peer-to-Peer) transfers  (TEST, UI)

- **Ref:** PSR-V6-03398
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Peer-to-peer transfers with real-time balance validation and spending limits | AcceptanceCriteria: Balance validated pre-transfer | Spending limits enforced | Real-time notifications sent | Transaction recorded | ReqID: DW-TXN-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “P2P (Peer-to-Peer) transfers [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### P2P (Peer-to-Peer) transfers  (TEST, UI)

- **Ref:** PSR-V6-03399
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Person-to-person transfers between wallets with instant settlement | AcceptanceCriteria: Transfers <30s | Low fees | Transaction history | Notifications | ReqID: DW-P2P (Peer-to-Peer)-022
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “P2P (Peer-to-Peer) transfers [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Zero-fee P2P (Peer-to-Peer) transfers  (API, TEST, UI)

- **Ref:** PSR-V6-03414
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Completely free person-to-person payments with instant settlement | AcceptanceCriteria: Zero fees applied | <50ms settlement | 99.99% success rate | FedNow integration | ReqID: DW-PMT-008
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Zero-fee P2P (Peer-to-Peer) transfers [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Rehomed requirements (from ONB doc correction 2026-02-09)

_These requirements were originally placed under merchant onboarding during the initial split. They have been re-homed semantically to reduce agent confusion._

## Parent–Child

### Parent–Child controls  (TEST, UI)

- **Ref:** PSR-V6-03400
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Allowances, MCC (Merchant Category Code) category blocks, notifications. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: DW-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Parent (Parent User) or Child (Child User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Parent–Child controls [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Parent–Child controls  (TEST, UI)

- **Ref:** PSR-V6-03401
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Allowances, MCC (Merchant Category Code) category blocks, notifications. | ReqID: DW-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Parent (Parent User) or Child (Child User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Parent–Child controls [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Parent–Child controls [UI (User Interface)] (MERGED, ROLLUP)

- **Ref:** PSR-V6-03821
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Allowances, MCC category blocks, notifications.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Parent (Parent User) or Child (Child User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Parent–Child controls [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Parent→Child wallets (MERGED, ROLLUP)

- **Ref:** PSR-V6-03824
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Limits, categories, spend alerts; freeze/unfreeze.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Parent (Parent User) or Child (Child User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Parent→Child wallets [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Transfers & Payouts

## Employer Wallet & Expense

### Employer–Employee wallet  (TEST, UI)

- **Ref:** PSR-V6-03333
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Sub-wallets, approvals, receipts, GL export. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: DW-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Employer–Employee wallet [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Employer–Employee wallet  (TEST, UI)

- **Ref:** PSR-V6-03334
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Sub-wallets, approvals, receipts, GL export. | ReqID: DW-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Employer–Employee wallet [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Employer–Employee wallet

- **Ref:** PSR-V6-03335
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Employer–Employee wallet.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Employer→Employee wallets  (OPS, TEST, UI)

- **Ref:** PSR-V6-03336
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Parent wallet with sub-accounts; funding, spend, ledger. | acceptancetests: - Create employer wallet; add 2 employee sub-accounts. - Transfer succeeds and ledgers balance. | risknotes: SHARED-001 | reqid: WAL-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Employer→Employee wallets [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify wallet limit does not exceed employer balance (TEST, UI)

- **Ref:** PSR-V6-03392
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify wallet limit does not exceed employer balance [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Employer–Employee wallet [UI (User Interface)] (MERGED, ROLLUP)

- **Ref:** PSR-V6-03822
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Sub-wallets, approvals, receipts, GL export.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Employer–Employee wallet [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Employer→Employee wallets (MERGED, ROLLUP)

- **Ref:** PSR-V6-03819
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Parent wallet with sub-accounts; funding, spend, ledger.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Employer→Employee wallets [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### ✅ DW-004: Employer-Employee wallet system  (TEST, UI)

- **Ref:** PSR-V6-03415
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Employer Administrator (Employer Admin) or Employee (Employee User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “✅ DW-004: Employer-Employee wallet system [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Identity, KYC (Know Your Customer) & AML (Anti-Money Laundering)

## Cards

### Card controls (freeze  (OPS, TEST, UI)

- **Ref:** PSR-V6-03299
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** PIN | acceptancetests: travel) | risknotes: state | reqid: WAL-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Card controls (freeze [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: walletcards table (DATA, TEST, UI)

- **Ref:** PSR-V6-03321
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS walletcards ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test declined card transactions separately (OPS, TEST, UI)

- **Ref:** PSR-V6-03368
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test declined card transactions separately [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify card number format and linkage to wallet (TEST, UI)

- **Ref:** PSR-V6-03382
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify card number format and linkage to wallet [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Card controls (freeze (MERGED, ROLLUP)

- **Ref:** PSR-V6-03825
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** PIN
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Card controls (freeze [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Virtual cards and tokenised payments

- **Ref:** PSR-V6-03406
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Virtual cards and tokenised payments.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Core Wallet

### > echo "Skipping DigitalWallets-API (Application Programming Interface) Jest tests for now (runner misconfig)  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03261
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> echo "Skipping DigitalWallets-API Jest tests for now (runner misconfig) [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: transactioncategorymappings table (DATA, TEST, UI)

- **Ref:** PSR-V6-03315
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS transactioncategorymappings ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Skipping DigitalWallets-API (Application Programming Interface) Jest tests for now (runner misconfig)  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03245
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Skipping DigitalWallets-API Jest tests for now (runner misconfig) [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Cash-Out

## Ledger & Reporting

### Ops requirement: Full Requirements APPLY Sweep Summary (API, COM, OPS, TEST, UI)

- **Ref:** PSR-V6-03247
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “# Full Requirements APPLY Sweep Summary [API][COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:id/balance', (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03272
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:id/balance', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:walletId/balance',  (API, TEST, UI)

- **Ref:** PSR-V6-03275
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:walletId/balance', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:walletId/balance', authenticate, (req, res)...  (API, TEST, UI)

- **Ref:** PSR-V6-03276
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:walletId/balance', authenticate, (req, res).. [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API endpoint: get wallet details (API, TEST, UI)

- **Ref:** PSR-V6-03289
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.get('/:walletId/balance', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: usercarbonmonthly table (DATA, TEST, UI)

- **Ref:** PSR-V6-03316
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS usercarbonmonthly ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Double-entry ledger  (COM, OPS, TEST, UI)

- **Ref:** PSR-V6-03330
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Wallet/sub-wallets; invariants; audit trails. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: DW-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Double-entry ledger [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Double-entry ledger  (COM, OPS, TEST, UI)

- **Ref:** PSR-V6-03331
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Wallet/sub-wallets; invariants; audit trails. | SemanticNotes: The provided code bundle contains only configuration files and a simple index.js with a console log. There is no implementation related to ledger, wallet, sub-wallets, invariants, or audit trails. No relevant functions, classes, or modules are present that address the double-entry ledger requirement. | ReqID: DW-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Double-entry ledger [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Double-entry ledger  (COM, OPS, TEST, UI)

- **Ref:** PSR-V6-03332
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Wallet/sub-wallets; invariants; audit trails. | ReqID: DW-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Double-entry ledger [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Critical test for ledger invariant enforcement (OPS, TEST, UI)

- **Ref:** PSR-V6-03355
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Critical test for ledger invariant enforcement [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Tests balance invariant enforcement (OPS, TEST, UI)

- **Ref:** PSR-V6-03372
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Tests balance invariant enforcement [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify balance check before issuance (TEST, UI)

- **Ref:** PSR-V6-03381
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify balance check before issuance [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Verify statement format and data accuracy (DATA, TEST, UI)

- **Ref:** PSR-V6-03390
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify statement format and data accuracy [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Double-entry ledger [API (Application Programming Interface)][UI (User Interface)] (MERGED, ROLLUP, TEST)

- **Ref:** PSR-V6-03816
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** data
- **Clarification:** Journal->accounts->entries; invariants enforced
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Double-entry ledger [MERGED][ROLLUP][API][UI][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Double-entry ledger [UI (User Interface)] (MERGED, ROLLUP)

- **Ref:** PSR-V6-03817
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Wallet/sub-wallets; invariants; audit trails.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Double-entry ledger [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Statements & exports (MERGED, ROLLUP)

- **Ref:** PSR-V6-03828
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Monthly statement per wallet + CSV export.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Statements & exports [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Statements & exports  (OPS, TEST, UI)

- **Ref:** PSR-V6-03405
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Monthly statement per wallet + CSV (Comma-Separated Values) export. | acceptancetests: - Download PDF; sums match ledger. | risknotes: WAL-001 | reqid: WAL-007
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Statements & exports [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Wallet statements and reconciliation  (OPS, TEST, UI)

- **Ref:** PSR-V6-03412
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Provide periodic and on demand wallet statements transaction histories and reconciliation views for customers employers and operations
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet statements and reconciliation [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Wallet statements and reconciliation

- **Ref:** PSR-V6-03411
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Wallet statements and reconciliation.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## APIs & Integrations

### API endpoint: create virtual card (API, TEST, UI)

- **Ref:** PSR-V6-03294
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.post('/:walletId/virtual-card', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.delete('/api/wallets/:id', async (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03262
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.delete('/api/wallets/:id', async (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/transactions/:id', (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03263
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/transactions/:id', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/users/:userId', authenticate, (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03264
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/users/:userId', authenticate, (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/users/:userId/wallets', authenticate, (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03266
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/users/:userId/wallets', authenticate, (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets', (req, res) => res.json(wallets));  (API, TEST, UI)

- **Ref:** PSR-V6-03268
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets', (req, res) => res.json(wallets)); [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets',  (API, TEST, UI)

- **Ref:** PSR-V6-03267
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets', authenticate, (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03269
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets', authenticate, (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:id', (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03270
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:id', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:id', async (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03271
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:id', async (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:walletId',  (API, TEST, UI)

- **Ref:** PSR-V6-03273
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:walletId', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:walletId', authenticate, (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03274
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:walletId', authenticate, (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:walletId/transactions',  (API, TEST, UI)

- **Ref:** PSR-V6-03277
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:walletId/transactions', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/api/wallets/:walletId/transactions', authenticate, (req,...  (API, TEST, UI)

- **Ref:** PSR-V6-03278
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/api/wallets/:walletId/transactions', authenticate, (req.. [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.get('/health', async (req: Request, res: Response) => {  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03279
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.get('/health', async (req: Request, res: Response) => { [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.post('/api/transactions', (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03281
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/transactions', (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.post('/api/wallets',  (API, TEST, UI)

- **Ref:** PSR-V6-03282
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/wallets', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.post('/api/wallets', async (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03283
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/wallets', async (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.post('/api/wallets', authenticate, (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03284
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/wallets', authenticate, (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.post('/api/wallets/:walletId/transactions',  (API, TEST, UI)

- **Ref:** PSR-V6-03285
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/wallets/:walletId/transactions', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: app.post('/api/wallets/:walletId/transactions', authenticate,...  (API, TEST, UI)

- **Ref:** PSR-V6-03286
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/wallets/:walletId/transactions', authenticate.. [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: router.get('/', async (req: Request, res: Response) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03287
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.get('/', async (req: Request, res: Response) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API endpoint: get wallet details (API, TEST, UI)

- **Ref:** PSR-V6-03288
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.get('/:walletId', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API endpoint: get wallet details (API, TEST, UI)

- **Ref:** PSR-V6-03290
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.get('/:walletId/transactions', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### API (Application Programming Interface) Endpoint: router.post('/:walletId/payment',  (API, TEST, UI)

- **Ref:** PSR-V6-03292
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: router.post('/:walletId/payment', [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### API (Application Programming Interface) Endpoint: app.post('/api/payments/send', authenticate, (req, res) => {  (API, TEST, UI)

- **Ref:** PSR-V6-03280
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API Endpoint: app.post('/api/payments/send', authenticate, (req, res) => { [API][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### System shall provide Mobile Applications: Digital wallet services need mobile app integration (30% gap)

- **Ref:** PSR-V6-01718
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Mobile Applications: Digital wallet services need mobile app integration (30% gap).”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Data Model

### DB schema: aifrauddetection table (DATA, TEST, UI)

- **Ref:** PSR-V6-03301
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS aifrauddetection ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: apikeys table (API, DATA, TEST, UI)

- **Ref:** PSR-V6-03302
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS apikeys ( [API][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: carbonimpactdata table (DATA, TEST, UI)

- **Ref:** PSR-V6-03303
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS carbonimpactdata ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: cbdcexchangerates table (DATA, TEST, UI)

- **Ref:** PSR-V6-03305
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS cbdcexchangerates ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: cbdctransactions table (DATA, TEST, UI)

- **Ref:** PSR-V6-03306
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS cbdctransactions ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: cbdcwallets table (DATA, TEST, UI)

- **Ref:** PSR-V6-03307
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS cbdcwallets ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: companies table (DATA, TEST, UI)

- **Ref:** PSR-V6-03308
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS companies ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: defiintegrations table (API, DATA, TEST, UI)

- **Ref:** PSR-V6-03310
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS defiintegrations ( [API][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: defipools table (DATA, TEST, UI)

- **Ref:** PSR-V6-03311
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS defipools ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: exchangerates table (DATA, TEST, UI)

- **Ref:** PSR-V6-03312
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS exchangerates ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: riskfactors table (DATA, TEST, UI)

- **Ref:** PSR-V6-03313
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS riskfactors ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: transactioncategories table (DATA, TEST, UI)

- **Ref:** PSR-V6-03314
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS transactioncategories ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: usercarbonsettings table (DATA, TEST, UI)

- **Ref:** PSR-V6-03317
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS usercarbonsettings ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: userdevices table (DATA, TEST, UI)

- **Ref:** PSR-V6-03318
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS userdevices ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: voicecommands table (DATA, TEST, UI)

- **Ref:** PSR-V6-03319
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS voicecommands ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: walletbeneficiaries table (DATA, OPS, TEST, UI)

- **Ref:** PSR-V6-03320
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS walletbeneficiaries ( [DATA][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### DB schema: walletlimits table (DATA, TEST, UI)

- **Ref:** PSR-V6-03322
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS walletlimits ( [DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Build & Ops

### Ops requirement: Digital Wallets: Phase 1 Completion Assessment (TEST, UI)

- **Ref:** PSR-V6-03246
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “# Digital Wallets: Phase 1 Completion Assessment [TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Service package requirement: @paysurity/digital-wallets-api@1 (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03248
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> @paysurity/digital-wallets-api@1 [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Service package requirement: @paysurity/digital-wallets-core@1 (OPS, TEST, UI)

- **Ref:** PSR-V6-03249
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> @paysurity/digital-wallets-core@1 [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/tests/bankLinkingService  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03255
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/tests/bankLinkingService [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/tests/paymentService  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03256
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/tests/paymentService [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/tests/QRCodeService  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03257
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/tests/QRCodeService [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > DigitalWallets-Core/tests/transactionService  (API, OPS, TEST, UI)

- **Ref:** PSR-V6-03259
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> DigitalWallets-Core/tests/transactionService [API][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### > echo "No tests for digital-wallet-core  (OPS, TEST, UI)

- **Ref:** PSR-V6-03260
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “> echo "No tests for digital-wallet-core [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### c) If no explicit IDs, it performs keyword+domain inference (requires >= 2 keyword hits + a domain path hint like...  (OPS, TEST, UI)

- **Ref:** PSR-V6-03298
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “c) If no explicit IDs, it performs keyword+domain inference (requires >= 2 keyword hits + a domain path hint like.. [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### No tests for digital-wallet-core  (OPS, TEST, UI)

- **Ref:** PSR-V6-03244
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “No tests for digital-wallet-core [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: ACH (Automated Clearing House) settlement simulation may require backend test hooks (OPS, TEST, UI)

- **Ref:** PSR-V6-03351
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: ACH (Automated Clearing House) settlement simulation may require backend test hooks [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Core double-entry transaction test (OPS, TEST, UI)

- **Ref:** PSR-V6-03354
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Core double-entry transaction test [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Include test with and without discrepancies (OPS, TEST, UI)

- **Ref:** PSR-V6-03359
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test with and without discrepancies [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test appeal workflow and audit trail (COM, OPS, TEST, UI)

- **Ref:** PSR-V6-03361
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test appeal workflow and audit trail [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Test boundary conditions for date range (OPS, TEST, UI)

- **Ref:** PSR-V6-03363
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test boundary conditions for date range [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test boundary conditions for wallet limits (OPS, TEST, UI)

- **Ref:** PSR-V6-03364
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test boundary conditions for wallet limits [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test covers basic static QR payment happy path (OPS, TEST, UI)

- **Ref:** PSR-V6-03366
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test covers basic static QR payment happy path [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Test note: Test covers end-to-end wallet opening and activation (OPS, TEST, UI)

- **Ref:** PSR-V6-03367
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test covers end-to-end wallet opening and activation [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test includes validation of limit enforcement (OPS, TEST, UI)

- **Ref:** PSR-V6-03369
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test includes validation of limit enforcement [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test notification failure and retry logic (OPS, TEST, UI)

- **Ref:** PSR-V6-03370
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test notification failure and retry logic [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test with multiple MCC (Merchant Category Code) categories as well (OPS, TEST, UI)

- **Ref:** PSR-V6-03371
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with multiple MCC (Merchant Category Code) categories as well [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Tests receipt generation and delivery (OPS, TEST, UI)

- **Ref:** PSR-V6-03373
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Tests receipt generation and delivery [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Test note: Test boundary conditions for allowance amount (OPS, TEST, UI)

- **Ref:** PSR-V6-03362
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Wallet User (Wallet User)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test boundary conditions for allowance amount [OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Addendum (2026-02-10): P2P permissions + child controls + no cash-in in Phase 1

- **Ref:** PSR-EXT-WAL-20260210-001
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Recipient discovery must avoid leaking PII; support send-by-handle/phone/email with verification.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Wallets SHALL support P2P transfers for Employees to any other verified PaySurity wallet user, subject to limits and compliance controls.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-002
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** If a child has two guardians configured, both must consent for that child before child↔child is enabled.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Child↔child P2P transfers SHALL be disabled by default and SHALL require explicit enablement by the parent(s)/guardian(s) for each child, including mutual enablement for both children involved.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-003
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Support ‘no cash-out’ as a hard policy; exceptions require parent approval with audit trail.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Parents/guardians SHALL be able to restrict child cash-out (ATM withdrawal or external transfer) via policy toggles, limits, schedules, and recipient allowlists.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-004
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** This avoids retail-agent compliance scope in Phase 1; keep code paths feature-flagged.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Phase 1 SHALL NOT support cash-in (cash-load) via retail locations or cash agents; the UI and APIs SHALL not expose cash-load workflows unless explicitly enabled by a Super Admin feature flag.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-005
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Hold reasons include suspected fraud, sanctions match, KYC pending, chargeback/overpayment recovery.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Wallet P2P and cash-out workflows SHALL support compliance holds, reversals, and dispute handling with immutable audit logs and case linkage.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-006
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Policies should be tiered by verification level and wallet type (Employee vs Child).
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Wallet transfer limits (daily/weekly/monthly), velocity rules, and risk policies SHALL be configurable by Super Admin and enforceable in real time.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-007
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Feeds must be consistent across mobile and web; include timestamps and status lifecycle.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Wallet transaction feeds SHALL provide real-time and periodic (daily/weekly/monthly) summaries aligned with merchant reporting and payroll workflows, with export options and retention controls.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

## Addendum (2026-02-10): WAL economics & monetization (target-state)

- **Ref:** PSR-EXT-WAL-20260210-008
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Monetization levers must be transparent, configurable, and auditable; no hidden fees.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** pricing is configured, **then** the system SHALL satisfy: “The platform SHALL support configurable WAL monetization profiles per wallet program (Employer→Employee, Parent→Child), including subscription fees, optional transaction fees, and premium feature tiers.”.
- **Given** a wallet user views pricing/disclosures, **when** fees may apply to a workflow, **then** the system SHALL display the applicable fee and obtain explicit confirmation where required by policy.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - Admin UI route(s) for pricing configuration + screenshots/selectors.
 - Fee engine rules/config entities + migrations.
 - Example disclosures shown in wallet UI (screenshots).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-009
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Supports employer-funded and parent-funded wallets without PaySurity fronting funds.
- **Acceptance Criteria (GWT):**
- **Given** an Employer or Parent funds a wallet, **when** the funding source is a checking account, **then** the system SHALL satisfy: “Wallet funding SHALL support bank-account verification and ACH debit initiation from the funder’s own checking account(s); PaySurity SHALL NOT be the source of funds for customer wallet loads.”.
- **Given** a funding attempt fails verification or debit, **when** the workflow completes, **then** the system SHALL show actionable error reasons and SHALL not credit wallet balances.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - Funding UI + bank verification flow (screenshots/selectors).
 - Funding API endpoints + example payloads (sanitized).
 - Ledger postings for successful/failed funding attempts.
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-010
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Interchange is program-dependent; system must still model and report it as an internal revenue line item.
- **Acceptance Criteria (GWT):**
- **Given** wallet card spend occurs (virtual/physical), **when** transaction settlements are ingested, **then** the system SHALL satisfy: “The platform SHALL support optional interchange revenue attribution (estimated or actual, when available) and reporting by wallet program, merchant/tenant, and time period.”.
- **Given** interchange data is not available from upstream providers, **when** reports are generated, **then** the system SHALL either (a) use configured estimation rules, or (b) mark the metric as unavailable—never silently omit it.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - Revenue model entities + ledger postings.
 - Sample interchange report output (screenshots/exports).
 - Data ingestion mapping for settlement fields.
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-011
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Enables “instant” payouts/cash-out as an optional paid feature with clear disclosures.
- **Acceptance Criteria (GWT):**
- **Given** a wallet user initiates cash-out or bank transfer, **when** they select an expedited option, **then** the system SHALL satisfy: “The platform SHALL support configurable expedited transfer/cash-out fees (flat or percentage) with real-time fee preview, user confirmation, and ledger posting of the fee.”.
- **Given** expedited transfer is disabled for the user/tier, **when** they attempt to select it, **then** the UI SHALL not offer it or SHALL clearly show it as unavailable.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - Transfer UI fee preview screenshots/selectors.
 - Fee ledger postings + reconciliation example.
 - Admin configuration screen for fee schedules.
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-012
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Employer wallet monetization should be primarily SaaS; parent-child can be freemium with premium controls.
- **Acceptance Criteria (GWT):**
- **Given** an Employer enrolls in WAL, **when** billing is configured, **then** the system SHALL satisfy: “Employer wallet offerings SHALL support subscription billing (per-seat and/or per-tenant tiers), proration, invoicing, and payment collection, with billing events recorded in the audit log.”.
- **Given** a Parent uses Parent→Child wallets, **when** premium controls are enabled, **then** the system SHALL allow feature gating and billing only for premium features, without restricting basic safe wallet functionality.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - Billing configuration UI + invoices sample (sanitized).
 - Subscription entities + audit log evidence.
 - Feature flag/gating configuration evidence.
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-WAL-20260210-013
- **Domain/Module:** WAL / Digital Wallets
- **Phase:** Phase 2
- **Priority:** Could
- **Type:** functional
- **Details:** Only if contractually allowed by program bank/partners; must be disclosed and auditable.
- **Acceptance Criteria (GWT):**
- **Given** the program supports yield/interest sharing, **when** balances accrue yield, **then** the system SHALL satisfy: “The platform SHALL support optional yield/float revenue modeling, allocation rules, and transparent reporting, with strict policy gates and disclosures.”.
- **Given** yield sharing is not allowed, **when** configuration is attempted, **then** the system SHALL block the configuration and record the reason.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - Policy gate config + enforcement evidence.
 - Revenue allocation model entities.
 - Reports/exports showing yield line items.
 - Tests + CI run link/output.

