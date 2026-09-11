# 16 COMPLIANCE LEGAL

**Generated:** 2026-02-10 04:20:55 (America/Chicago)

**Covers capability area(s):** Compliance & Legal

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# Compliance & Legal

_Contains 166 requirements._

## Scope notes (binding)

- This file defines **COM** requirements for compliance and legal operational capability (policies, evidence, audits, filings orchestration, and compliance case management).
- Security controls and privacy invariants live primarily in `15_SECURITY_PRIVACY.md` and `90_CROSSCUTTING_INVARIANTS.md`; COM MUST reference and consume SEC telemetry for evidence.
- Wallet program compliance is **Model B**; PaySurity is **not PayFac** in Phase 1; no merchant settlement funds are held/remitted by PaySurity in Phase 1; no retail cash-in (agent cash-load) in Phase 1.
- Where external government APIs do not exist, the system SHALL support electronic filing via approved channels (portals/SFTP/EDI) and maintain evidence of submission.


## Payroll filing scope (Phase 1 decision gate)

- **Source of truth:** `14_PAYROLL_PAY.md` requirement **PSR-EXT-PAYROLL-FILING-GATE-20260210-001**.
- Compliance posture in Phase 1 is “prepare + export + audit trail by default,” with controlled feature-flag enablement for any submit/e-file/remittance actions.

## Policies & governance

### Compliance registry and policy store [COM][OPS][TEST][UI].

- **Ref:** PSR-V6-02472
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Maintain registry of regulations policies and control mappings across payments wallets and payroll with ownership and review cycles
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Compliance registry and policy store [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Compliance registry and policy store.

- **Ref:** PSR-V6-02473
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Compliance registry and policy store.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Validates input validation on policy creation [COM][TEST].

- **Ref:** PSR-V6-02523
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates input validation on policy creation [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Control frameworks

### Compliance frameworks: list (GET /frameworks)

- **Ref:** PSR-V6-02445
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list frameworks records with filtering, sorting, and pagination via GET /frameworks.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### admin frameworks: create (POST /admin/frameworks)

- **Ref:** PSR-V6-02451
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create admin frameworks records via POST /admin/frameworks, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Centralized KYC (Know Your Customer)/AML (Anti-Money Laundering) framework [API][COM][DATA][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02470
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Unified KYC (Know Your Customer)/AML (Anti-Money Laundering) screening with sanctions and watchlist integration | AcceptanceCriteria: Screens against OFAC and other watchlists | Performs identity verification | Maintains audit trails | Generates compliance reports | ReqID: COMPL-KYC (Know Your Customer)-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Centralized KYC (Know Your Customer)/AML (Anti-Money Laundering) framework [API][COM][DATA][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Database Schema: CREATE TABLE IF NOT EXISTS complianceframeworks ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02485
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS complianceframeworks ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Rules engine

### admin rules: create (POST /admin/rules)

- **Ref:** PSR-V6-02452
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create admin rules records via POST /admin/rules, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS compliancerules ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02488
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS compliancerules ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS ruleerrors ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02492
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS ruleerrors ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Financial compliance programs

### CIP/KYC (Know Your Customer) verification [COM][DATA][SEC][TEST][UI].

- **Ref:** PSR-V6-02471
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Verify customer identity per Customer Identification Program requirements | AcceptanceCriteria: ID document validated | Database checks performed | Risk rating assigned | Results stored | ReqID: COMPL-KYB-014
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “CIP/KYC (Know Your Customer) verification [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Database Schema: CREATE TABLE IF NOT EXISTS amlmatches ( [COM][DATA][SEC][TEST].

- **Ref:** PSR-V6-02483
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS amlmatches ( [COM][DATA][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### KYC (Know Your Customer) identity verification [COM][DATA][SEC][TEST][UI].

- **Ref:** PSR-V6-02500
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Verify customer identity with document validation and biometric check | AcceptanceCriteria: Document validation | Biometric match | Risk scoring | PEP screening | ReqID: COMPL-KYC (Know Your Customer)-025
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer) identity verification [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### OFAC screening [COM][SEC][TEST][UI].

- **Ref:** PSR-V6-02531
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Screen parties against OFAC SDN list with match resolution | AcceptanceCriteria: SDN list updated daily | Potential matches flagged | Resolution workflow | Results documented | ReqID: COMPL-AML (Anti-Money Laundering)-023
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “OFAC screening [COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: KYC/AML screening for wallet users [MERGED][ROLLUP].

- **Ref:** PSR-V6-03844
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Screen PEP/sanctions; ongoing monitoring + SAR workflow.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: KYC/AML screening for wallet users [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### AML (Anti-Money Laundering) transaction monitoring [COM][OPS][SEC][TEST].

- **Ref:** PSR-V6-02410
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Monitor transactions for AML (Anti-Money Laundering) patterns and generate suspicious activity reports | AcceptanceCriteria: Patterns detected in real-time | SARs generated for thresholds | Alerts escalated | Audit trail maintained | ReqID: COMPL-AML (Anti-Money Laundering)-009
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AML (Anti-Money Laundering) transaction monitoring [COM][OPS][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### AML (Anti-Money Laundering) transaction monitoring [COM][OPS][SEC][TEST].

- **Ref:** PSR-V6-02411
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Real-time AML (Anti-Money Laundering) monitoring with suspicious activity reporting | AcceptanceCriteria: Suspicious pattern detection | SAR filing | Real-time alerts | Audit trail | ReqID: COMPL-AML (Anti-Money Laundering)-024
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AML (Anti-Money Laundering) transaction monitoring [COM][OPS][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### AML (Anti-Money Laundering) Transaction Monitoring [COM][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02412
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Monitor transactions for suspicious activity with SAR filing capability | AcceptanceCriteria: Suspicious activity detected | SAR forms generated | Reporting thresholds enforced | Audit trail maintained | ReqID: COMPL-AML (Anti-Money Laundering)-007
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AML (Anti-Money Laundering) Transaction Monitoring [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## PCI program & evidence

### Notes: Validates correct SAQ type selection and evidence completeness [COM][TEST].

- **Ref:** PSR-V6-02521
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates correct SAQ type selection and evidence completeness [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Critical for reducing PCI (PCI) DSS scope and compliance effort [COM][SEC][TEST].

- **Ref:** PSR-V6-02504
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Critical for reducing PCI (PCI) DSS scope and compliance effort [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Ensures compliance with PCI (PCI) DSS scanning requirements [COM][SEC][TEST][UI].

- **Ref:** PSR-V6-02506
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures compliance with PCI (PCI) DSS scanning requirements [COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Ensures reduction of PCI (PCI) DSS scope by tokenization [COM][SEC][TEST].

- **Ref:** PSR-V6-02507
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures reduction of PCI (PCI) DSS scope by tokenization [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify compliance with PCI (PCI) DSS data fields [COM][DATA][SEC][TEST].

- **Ref:** PSR-V6-02526
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify compliance with PCI (PCI) DSS data fields [COM][DATA][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### PCI (PCI) DSS compliance [COM][OPS][SEC][TEST].

- **Ref:** PSR-V6-02533
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Maintain PCI (PCI) DSS 4.0 compliance with encryption and access controls | AcceptanceCriteria: Encryption at rest | Access logging | Regular audits | Vulnerability scans | ReqID: COMPL-PCI (PCI)-026
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “PCI (PCI) DSS compliance [COM][OPS][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### PCI (PCI) DSS compliance [COM][SEC][TEST][UI].

- **Ref:** PSR-V6-02532
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Maintain PCI (PCI) DSS Level 1 certification with required controls | AcceptanceCriteria: Controls implemented | Testing performed | Documentation maintained | Certification valid | ReqID: COMPL-PCI (PCI)-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “PCI (PCI) DSS compliance [COM][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### PCI (PCI) DSS scope & SAQ [COM][SEC][TEST].

- **Ref:** PSR-V6-02534
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Segmentation; tokenization; SAQ type; scans; evidence. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: COMPL-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “PCI (PCI) DSS scope & SAQ [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### PCI (PCI) DSS scope & SAQ [COM][SEC][TEST].

- **Ref:** PSR-V6-02535
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Segmentation; tokenization; SAQ type; scans; evidence. | ReqID: COMPL-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “PCI (PCI) DSS scope & SAQ [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: PCI DSS scope & SAQ [MERGED][ROLLUP][UI][COM].

- **Ref:** PSR-V6-03842
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Segmentation; tokenization; SAQ type; scans; evidence.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: PCI DSS scope & SAQ [MERGED][ROLLUP][UI][COM].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## SOC 2 readiness & evidence

### compliance: list (GET /compliance/soc2)

- **Ref:** PSR-V6-02428
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliance records with filtering, sorting, and pagination via GET /compliance/soc2.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: SOC 2 controls [MERGED][ROLLUP][UI][COM].

- **Ref:** PSR-V6-03845
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Policies; control mapping; automated evidence.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: SOC 2 controls [MERGED][ROLLUP][UI][COM].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### SOC 2 controls [COM][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02545
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Policies; control mapping; automated evidence. | SemanticNotes: The provided code bundle includes extensive compliance automation for multiple regulatory requirements such as CTR, SAR, OFAC, PCI (PCI), BSA, NYDFS, but there is no mention or implementation related to SOC 2 controls. The ComplianceAutomationEngine interface and implementation list 'SOC2' as a possible…
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SOC 2 controls [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### SOC 2 controls [COM][OPS][TEST][UI].

- **Ref:** PSR-V6-02544
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Policies; control mapping; automated evidence. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: COMPL-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SOC 2 controls [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### SOC 2 controls [COM][OPS][TEST][UI].

- **Ref:** PSR-V6-02546
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Policies; control mapping; automated evidence. | ReqID: COMPL-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “SOC 2 controls [COM][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Secrets & Encryption

## Audit trails & immutable evidence

### auditlogs: list (GET /api/auditlogs)

- **Ref:** PSR-V6-02415
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list auditlogs records with filtering, sorting, and pagination via GET /api/auditlogs.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### auditlogs: create (POST /api/auditlogs)

- **Ref:** PSR-V6-02429
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create auditlogs records via POST /api/auditlogs, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Audit trail integrity [COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02468
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Tamper-evident storage for all audit logs with immutable record-keeping | AcceptanceCriteria: Logs all system actions with timestamps | Prevents log modification | Supports log export for audits | Maintains chain of custody | ReqID: COMPL-AUD-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Audit trail integrity [COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Audit trail integrity [COM][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02467
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Tamper-evident audit logs for config, money movement and role changes | AcceptanceCriteria: Append-only storage | Hash-chained entries | Config changes logged | Money movement tracked | ReqID: COMPL-AUD-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Audit trail integrity [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Database Schema: CREATE TABLE documentauditlogs ( [COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02478
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE documentauditlogs ( [COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### KYC (Know Your Customer) and KYB evidence and audit packs [COM][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02499
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Store and retrieve KYC (Know Your Customer) and KYB documents risk decisions and audit logs in structured form for regulator and bank audits
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer) and KYB evidence and audit packs [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### KYC (Know Your Customer) and KYB evidence and audit packs.

- **Ref:** PSR-V6-02498
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer) and KYB evidence and audit packs.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify audit trail logs the update [COM][OPS][TEST].

- **Ref:** PSR-V6-02525
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify audit trail logs the update [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify security of audit trail data [COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02530
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify security of audit trail data [COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## Evidence collection & artifacts

### Compliance evidence: list (GET /evidence)

- **Ref:** PSR-V6-02444
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list evidence records with filtering, sorting, and pagination via GET /evidence.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance evidence: list (POST /evidence)

- **Ref:** PSR-V6-02458
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create evidence records via POST /evidence, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance evidence: list (POST /evidence/:evidenceId/verify)

- **Ref:** PSR-V6-02459
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create evidence records via POST /evidence/:evidenceId/verify, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance evidence: list (POST /evidence/upload)

- **Ref:** PSR-V6-02460
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create evidence records via POST /evidence/upload, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS complianceevidence ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02484
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS complianceevidence ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Tests integration with data sources and evidence collection automation [API][COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02517
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Tests integration with data sources and evidence collection automation [API][COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Automated evidence archive [MERGED][ROLLUP].

- **Ref:** PSR-V6-03851
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Every passed CI run stores artifacts & JSON results for audits.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Automated evidence archive [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Documents & records

### legaldocuments: list (GET /api/legaldocuments)

- **Ref:** PSR-V6-02425
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list legaldocuments records with filtering, sorting, and pagination via GET /api/legaldocuments.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### legaldocuments: create (POST /api/legaldocuments)

- **Ref:** PSR-V6-02436
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create legaldocuments records via POST /api/legaldocuments, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: delete (DELETE /documents/:id)

- **Ref:** PSR-V6-02439
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL delete documents records via DELETE /documents/:id, with safeguards and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: get (GET /documents/:id)

- **Ref:** PSR-V6-02442
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL retrieve a single documents record by id via GET /documents/:id.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: create (POST /documents)

- **Ref:** PSR-V6-02454
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create documents records via POST /documents, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: create (POST /documents/generate)

- **Ref:** PSR-V6-02456
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create documents records via POST /documents/generate, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: create (POST /documents/upload)

- **Ref:** PSR-V6-02457
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create documents records via POST /documents/upload, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE documentapprovals ( [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02477
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE documentapprovals ( [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE documentcategories ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02479
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE documentcategories ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE documentshares ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02480
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE documentshares ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE documentversions ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02481
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE documentversions ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Check for partial data handling if some documents are missing [COM][DATA][TEST].

- **Ref:** PSR-V6-02503
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Check for partial data handling if some documents are missing [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Document mgmt + versioning + e-sign [MERGED][ROLLUP].

- **Ref:** PSR-V6-03853
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Matter-scoped docs, versions, and e-sign envelopes.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Document mgmt + versioning + e-sign [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Legal operations

### legalbilling: list (GET /api/legalbilling)

- **Ref:** PSR-V6-02423
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list legalbilling records with filtering, sorting, and pagination via GET /api/legalbilling.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### legalcases: list (GET /api/legalcases)

- **Ref:** PSR-V6-02424
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list legalcases records with filtering, sorting, and pagination via GET /api/legalcases.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### legalbilling: create (POST /api/legalbilling)

- **Ref:** PSR-V6-02434
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create legalbilling records via POST /api/legalbilling, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### legalcases: create (POST /api/legalcases)

- **Ref:** PSR-V6-02435
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create legalcases records via POST /api/legalcases, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS legaldocs ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02491
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS legaldocs ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Reporting & exports

### reports: delete (DELETE /api/reports/:id)

- **Ref:** PSR-V6-02414
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL delete reports records via DELETE /api/reports/:id, with safeguards and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### compliance: list (GET /api/compliance/reports)

- **Ref:** PSR-V6-02418
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliance records with filtering, sorting, and pagination via GET /api/compliance/reports.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### compliance: list (GET /api/compliance/reports)

- **Ref:** PSR-V6-02419
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliance records with filtering, sorting, and pagination via GET /api/compliance/reports.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### compliancereports: list (GET /api/compliancereports)

- **Ref:** PSR-V6-02422
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliancereports records with filtering, sorting, and pagination via GET /api/compliancereports.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### reports: get by id (GET /api/reports/:id)

- **Ref:** PSR-V6-02426
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL retrieve a single reports record by id via GET /api/reports/:id.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### compliance: create (POST /api/compliance/reports)

- **Ref:** PSR-V6-02432
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create compliance records via POST /api/compliance/reports, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### compliancereports: create (POST /api/compliancereports)

- **Ref:** PSR-V6-02433
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create compliancereports records via POST /api/compliancereports, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### reports: create (POST /api/reports)

- **Ref:** PSR-V6-02437
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create reports records via POST /api/reports, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: get (GET /documents/:id/export)

- **Ref:** PSR-V6-02443
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL retrieve a single documents record by id via GET /documents/:id/export.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### reports: list (GET /reports)

- **Ref:** PSR-V6-02446
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list reports records with filtering, sorting, and pagination via GET /reports.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### reports: list (GET /reports/:reportId/download)

- **Ref:** PSR-V6-02447
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list reports records with filtering, sorting, and pagination via GET /reports/:reportId/download.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### reports: create (POST /reports)

- **Ref:** PSR-V6-02461
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create reports records via POST /reports, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Automated tax reporting [COM][TEST][UI].

- **Ref:** PSR-V6-02469
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Automated tax form generation and e-filing for merchants and users | AcceptanceCriteria: 1099-K generation | E-filing capability | Tax calculation | Compliance verification | ReqID: COMPL-TAX-020
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Automated tax reporting [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Compliance reporting [COM][DATA][OPS][TEST][UI].

- **Ref:** PSR-V6-02474
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Generate regulatory reports for FinCEN, IRS, and state agencies | AcceptanceCriteria: Reports formatted correctly | Deadlines met | Data accurate | Submission tracked | ReqID: COMPL-REP-019
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Compliance reporting [COM][DATA][OPS][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Regulatory reporting [COM][TEST].

- **Ref:** PSR-V6-02539
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Auto-generate reports with preamble + contacts. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: COMPL-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Regulatory reporting [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Regulatory reporting [COM][TEST].

- **Ref:** PSR-V6-02540
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Auto-generate reports with preamble + contacts. | ReqID: COMPL-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Regulatory reporting [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Regulatory reporting generator [COM][DATA][SEC][TEST].

- **Ref:** PSR-V6-02542
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Generate regulatory reports and evidence packs from system data for PCI (PCI) and AML (Anti-Money Laundering) and payroll support with export and workflow
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Regulatory reporting generator [COM][DATA][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Regulatory reporting generator.

- **Ref:** PSR-V6-02541
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Regulatory reporting generator.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Export my data (tenant) [MERGED][ROLLUP].

- **Ref:** PSR-V6-03854
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Tenant admin can export key datasets as CSV/NDJSON.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Export my data (tenant) [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Regulatory reporting [MERGED][ROLLUP][UI].

- **Ref:** PSR-V6-03846
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Auto-generate reports with preamble + contacts.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Regulatory reporting [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Timekeeping & invoicing (LEDES export) [MERGED][ROLLUP].

- **Ref:** PSR-V6-03848
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Track time/expenses; invoice; export LEDES 1998B.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Timekeeping & invoicing (LEDES export) [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### UI Component: fieldPath: 'reportingPeriod', [COM][TEST][UI].

- **Ref:** PSR-V6-02551
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: fieldPath: 'reportingPeriod', [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Status & dashboards

### compliance: list (GET /api/compliance/status)

- **Ref:** PSR-V6-02421
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliance records with filtering, sorting, and pagination via GET /api/compliance/status.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Compliance dashboard: get (GET /dashboard)

- **Ref:** PSR-V6-02441
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list dashboard records with filtering, sorting, and pagination via GET /dashboard.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance status: get (GET /status)

- **Ref:** PSR-V6-02448
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list status records with filtering, sorting, and pagination via GET /status.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Workflows & remediation

### workflows: get by id (GET /workflows/:id)

- **Ref:** PSR-V6-02450
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL retrieve a single workflows record by id via GET /workflows/:id.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance documents: create (POST /documents/:id/workflows)

- **Ref:** PSR-V6-02455
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create documents records via POST /documents/:id/workflows, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Compliance violations: list (POST /violations/:violationId/remediations)

- **Ref:** PSR-V6-02462
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create violations records via POST /violations/:violationId/remediations, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### workflows: create (POST /workflows/:id/send)

- **Ref:** PSR-V6-02463
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create workflows records via POST /workflows/:id/send, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### workflows: create (POST /workflows/:workflowId/signers/:signerId/remind)

- **Ref:** PSR-V6-02464
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create workflows records via POST /workflows/:workflowId/signers/:signerId/remind, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### workflows: create (POST /workflows/:workflowId/signers/:signerId/sign)

- **Ref:** PSR-V6-02465
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create workflows records via POST /workflows/:workflowId/signers/:signerId/sign, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### remediations: update (PUT /remediations/:remediationId/status)

- **Ref:** PSR-V6-02466
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL update remediations records via PUT /remediations/:remediationId/status, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS complianceremediations ( [API][COM][DATA][TEST].

- **Ref:** PSR-V6-02487
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS complianceremediations ( [API][COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE signingworkflows ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02496
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE signingworkflows ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### KYC (Know Your Customer) verification workflow [COM][DATA][SEC][TEST][UI].

- **Ref:** PSR-V6-02501
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Verify customer identity through document validation and database checks | AcceptanceCriteria: Documents validated | Database matches performed | Risk score calculated | Decision recorded | ReqID: COMPL-KYC (Know Your Customer)-010
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “KYC (Know Your Customer) verification workflow [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Validates approval workflow and status updates [COM][TEST][UI].

- **Ref:** PSR-V6-02520
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates approval workflow and status updates [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Validates end-to-end export and workflow integration [API][COM][TEST].

- **Ref:** PSR-V6-02522
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validates end-to-end export and workflow integration [API][COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Violations & exception handling

### Compliance violations: list (GET /violations)

- **Ref:** PSR-V6-02449
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list violations records with filtering, sorting, and pagination via GET /violations.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS complianceviolations ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02489
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS complianceviolations ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Risk scoring & assessments

### compliance: list (GET /api/compliance/risk-scores)

- **Ref:** PSR-V6-02420
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliance records with filtering, sorting, and pagination via GET /api/compliance/risk-scores.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### riskassessments: list (GET /api/riskassessments)

- **Ref:** PSR-V6-02427
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list riskassessments records with filtering, sorting, and pagination via GET /api/riskassessments.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### riskassessments: create (POST /api/riskassessments)

- **Ref:** PSR-V6-02438
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create riskassessments records via POST /api/riskassessments, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Record retention & holds

### UI Component: private validateThreshold(data: any, fieldPath: string, threshold: number): boolean { [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02556
- **Domain/Module:** COM / AI (Artificial Intelligence) Interaction Logging
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: private validateThreshold(data: any, fieldPath: string, threshold: number): boolean { [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Incident Response

## Other COM requirements

### cases: delete (DELETE /api/cases/:id)

- **Ref:** PSR-V6-02413
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL delete cases records via DELETE /api/cases/:id, with safeguards and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### cases: get by id (GET /api/cases/:id)

- **Ref:** PSR-V6-02416
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL retrieve a single cases record by id via GET /api/cases/:id.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### compliance: list (GET /api/compliance/checks)

- **Ref:** PSR-V6-02417
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list compliance records with filtering, sorting, and pagination via GET /api/compliance/checks.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### cases: create (POST /api/cases)

- **Ref:** PSR-V6-02430
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create cases records via POST /api/cases, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### compliance: create (POST /api/compliance/check)

- **Ref:** PSR-V6-02431
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create compliance records via POST /api/compliance/check, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### checks: list (GET /checks)

- **Ref:** PSR-V6-02440
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins SHALL list checks records with filtering, sorting, and pagination via GET /checks.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### checks: create (POST /checks)

- **Ref:** PSR-V6-02453
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Authorized COM admins (or authorized internal services where applicable) SHALL create checks records via POST /checks, with validation and audit logging.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Customer identification program [COM][DATA][SEC][TEST][UI].

- **Ref:** PSR-V6-02475
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Verify customer identity per CIP requirements with document validation | AcceptanceCriteria: Identity documents verified | OFAC screening performed | Risk assessment completed | Records maintained | ReqID: COMPL-KYC (Know Your Customer)-001
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Customer identification program [COM][DATA][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE compliancechecks ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02476
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE compliancechecks ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS alerts ( [COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02482
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS alerts ( [COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS irsfilings ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02490
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS irsfilings ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS userconsents ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02493
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS userconsents ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE notificationsettings ( [COM][DATA][TEST].

- **Ref:** PSR-V6-02494
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE notificationsettings ( [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE signingtokens ( [COM][DATA][SEC][TEST].

- **Ref:** PSR-V6-02495
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE signingtokens ( [COM][DATA][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Enhanced customer due diligence [COM][DATA][SEC][TEST].

- **Ref:** PSR-V6-02497
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Advanced KYC (Know Your Customer) verification with document validation and risk assessment | AcceptanceCriteria: Document verification | Identity validation | Risk scoring | Enhanced due diligence | ReqID: COMPL-KYC (Know Your Customer)-027
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Enhanced customer due diligence [COM][DATA][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Backup deletion is out of scope for immediate test [API][COM][OPS][TEST].

- **Ref:** PSR-V6-02502
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Backup deletion is out of scope for immediate test [API][COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Ensure input validation is effective [COM][TEST].

- **Ref:** PSR-V6-02505
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensure input validation is effective [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Ensures security and role-based access control [COM][SEC][TEST].

- **Ref:** PSR-V6-02508
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures security and role-based access control [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Ensures user is informed when no data matches criteria [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02509
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures user is informed when no data matches criteria [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Focus on correct logging and notification [COM][OPS][TEST].

- **Ref:** PSR-V6-02510
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Focus on correct logging and notification [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Focus on data accuracy and notification delivery [COM][DATA][TEST].

- **Ref:** PSR-V6-02511
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Focus on data accuracy and notification delivery [COM][DATA][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Test end-to-end notification and access [COM][OPS][TEST].

- **Ref:** PSR-V6-02512
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test end-to-end notification and access [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Test escalation if Merchant does not respond [COM][OPS][TEST].

- **Ref:** PSR-V6-02513
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test escalation if Merchant does not respond [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Test notification retry on failure separately [COM][OPS][TEST].

- **Ref:** PSR-V6-02514
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test notification retry on failure separately [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Test system robustness to missing data [COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02515
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test system robustness to missing data [COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Test with policies both due and not due for review [COM][OPS][TEST].

- **Ref:** PSR-V6-02516
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with policies both due and not due for review [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Validate form field validations [COM][TEST][UI].

- **Ref:** PSR-V6-02518
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate form field validations [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Validate mandatory field enforcement [COM][TEST].

- **Ref:** PSR-V6-02519
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate mandatory field enforcement [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Verify alerting on repeated failures [COM][OPS][TEST].

- **Ref:** PSR-V6-02524
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify alerting on repeated failures [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Verify error message clarity and UI behavior [COM][TEST][UI].

- **Ref:** PSR-V6-02528
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify error message clarity and UI behavior [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Notes: Verify role-based access control enforcement [COM][SEC][TEST].

- **Ref:** PSR-V6-02529
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify role-based access control enforcement [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Privacy requests [COM][OPS][TEST].

- **Ref:** PSR-V6-02536
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** DSAR & deletion flows; timers; audit trail. | ReqID: COMPL-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Privacy requests [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Privacy requests [COM][OPS][TEST].

- **Ref:** PSR-V6-02537
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** DSAR & deletion flows; timers; audit trail. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: COMPL-004
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Privacy requests [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Client intake + conflict check + matter open [MERGED][ROLLUP].

- **Ref:** PSR-V6-03847
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Structured intake, conflict search, engagement letter.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Client intake + conflict check + matter open [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: E-file readiness & returns [MERGED][ROLLUP].

- **Ref:** PSR-V6-03850
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Generate validated files for agencies; queue for submission.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: E-file readiness & returns [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Privacy requests [MERGED][ROLLUP][UI].

- **Ref:** PSR-V6-03852
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** DSAR & deletion flows; timers; audit trail.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Privacy requests [MERGED][ROLLUP][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Roll-up: Surcharging/compliance guardrails [MERGED][ROLLUP].

- **Ref:** PSR-V6-03849
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Apply/constrain surcharges per region & card rules.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Surcharging/compliance guardrails [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Trust accounting (IOLTA) + 3-way recon [MERGED][ROLLUP].

- **Ref:** PSR-V6-03843
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Matter trust ledgers; bank/ledger/register reconciliation.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Trust accounting (IOLTA) + 3-way recon [MERGED][ROLLUP].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Sanctions screening [COM][TEST][UI].

- **Ref:** PSR-V6-02543
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Screen customers and transactions against OFAC sanctions lists | AcceptanceCriteria: Real-time screening performed | Matches investigated | Blocked transactions reported | Records maintained | ReqID: COMPL-OFAC-003
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Sanctions screening [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### System shall provide Purpose: Security and authentication. [COM][TEST].

- **Ref:** PSR-V6-02548
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Purpose: Security and authentication. [COM][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### UI Component: <Route path="/" element={<HomePage />} /> [COM][TEST][UI].

- **Ref:** PSR-V6-02550
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: <Route path="/" element={<HomePage />} /> [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### UI Component: private getFieldValue(fieldPath: string, data: Record<string, any>): any { [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02552
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: private getFieldValue(fieldPath: string, data: Record<string, any>): any { [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### UI Component: private getNestedValue(obj: any, path: string): any { [COM][TEST][UI].

- **Ref:** PSR-V6-02553
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: private getNestedValue(obj: any, path: string): any { [COM][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### UI Component: private validateDataFormat(data: any, fieldPath: string, format: string): boolean { [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02554
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: private validateDataFormat(data: any, fieldPath: string, format: string): boolean { [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### UI Component: private validateRequiredField(data: any, fieldPath: string): boolean { [COM][DATA][TEST][UI].

- **Ref:** PSR-V6-02555
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “UI Component: private validateRequiredField(data: any, fieldPath: string): boolean { [COM][DATA][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Database Schema: CREATE TABLE IF NOT EXISTS compliancemonitoringjobs ( [COM][DATA][OPS][TEST].

- **Ref:** PSR-V6-02486
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Database Schema: CREATE TABLE IF NOT EXISTS compliancemonitoringjobs ( [COM][DATA][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Real-time transaction monitoring [COM][OPS][SEC][TEST].

- **Ref:** PSR-V6-02538
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** AI-powered AML (Anti-Money Laundering) monitoring with suspicious activity detection | AcceptanceCriteria: Transaction monitoring active | SAR filing automated | Pattern detection 99.5% accuracy | Regulatory reporting | ReqID: COMPL-AML (Anti-Money Laundering)-015
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Real-time transaction monitoring [COM][OPS][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Suspicious activity monitoring [COM][OPS][TEST].

- **Ref:** PSR-V6-02547
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Monitor transactions and file SARs for suspicious activity | AcceptanceCriteria: Transactions monitored | Alerts generated | SARs filed within 30 days | Documentation complete | ReqID: COMPL-SAR-002
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Suspicious activity monitoring [COM][OPS][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Transaction monitoring [COM][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-02549
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Monitor transactions for suspicious activity and generate SAR flags | AcceptanceCriteria: Pattern detection triggers alerts | SAR forms generated | Threshold monitoring active | Audit trail maintained | ReqID: COMPL-AML (Anti-Money Laundering)-009
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Transaction monitoring [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).


## Regulatory Frameworks

## Addendum: Phase 1/2 scope gates (ISO model + wallet compliance)

### Notes: Verify encryption and access control on stored documents [COM][SEC][TEST].

- **Ref:** PSR-V6-02527
- **Domain/Module:** COM / Compliance (Compliance and Legal)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin (Super Administrator) or Compliance Administrator (Compliance Admin)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify encryption and access control on stored documents [COM][SEC][TEST].”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Addendum (2026-02-10): ISO-only merchant settlement + Model B wallet compliance gates

- **Ref:** PSR-EXT-LEG-20260210-001
- **Domain/Module:** LEG / Compliance & Legal
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Merchant settlement flows directly from processor/acquirer to merchant bank account; PaySurity provides portal/reporting/statement skin only.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “PaySurity SHALL operate merchant card processing in Phase 1 as an ISO/white-label model and SHALL NOT custody or remit merchant card settlement funds.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-LEG-20260210-002
- **Domain/Module:** LEG / Compliance & Legal
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Exact filing obligations may depend on counsel and program partners, but platform must be BSA-ready to avoid redesign.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Digital Wallets (Model B) SHALL be treated as MSB-risk by default and SHALL implement an AML program baseline: KYC/KYB, sanctions screening, transaction monitoring, case management, SAR readiness, and record retention.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-LEG-20260210-003
- **Domain/Module:** LEG / Compliance & Legal
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Required for audits, investigations, and dispute resolution.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “The platform SHALL support evidence-grade audit trails for all wallet transactions, holds, reversals, and compliance actions, including who/what/when and immutable event histories.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-LEG-20260210-004
- **Domain/Module:** LEG / Compliance & Legal
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Operating funds must not be commingled with wallet customer funds; include daily reconciliation jobs.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “The platform SHALL enforce funds safeguarding for wallet value via segregated program accounts and reconciliation controls (program ledger ↔ bank ledger), with alerts for breaks.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-LEG-20260210-005
- **Domain/Module:** LEG / Compliance & Legal
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Feature-flagged capability with preflight checklist and approval workflow.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Cash-in via retail agents SHALL be explicitly out of scope for Phase 1; if enabled in future, the platform SHALL require an explicit scope gate covering agent due diligence, cash reporting, AML monitoring expansion, and any required licensing expansion.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.

- **Ref:** PSR-EXT-LEG-20260210-006
- **Domain/Module:** LEG / Compliance & Legal
- **Phase:** Phase 2
- **Priority:** Should
- **Type:** functional
- **Details:** Keep the roadmap requirement but prevent accidental implementation in Phase 1.
- **Acceptance Criteria (GWT):**
- **Given** the platform is deployed and the actor has the required permissions, **when** the relevant workflow executes, **then** the system SHALL satisfy: “Future ‘merchant settlement custody / PayFac-like’ capability SHALL be deferred and SHALL require an explicit go/no-go gate: licensing posture, sponsor approval, reserve policy, safeguarding design, and expanded monitoring before activation.”.
- **Given** a user without required permission, **when** they attempt the same workflow, **then** the system SHALL deny the action and SHALL log the attempt.
- **Given** CI runs automated tests, **when** the suite executes, **then** tests SHALL pass and SHALL produce deterministic failure output.
- **Evidence fields (agent must populate during build):**
 - UI routes/screenshots or stable selectors.
 - API endpoints + example payloads (sanitized).
 - Data entities/migrations (if any).
 - Tests + CI run link/output.