# 15 SECURITY PRIVACY

**Generated:** 2026-02-10 03:20:00 (America/Chicago)

**Covers capability area(s):** Security & Privacy

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# Security & Privacy

_Contains 23 requirements._

## Scope notes (binding)

- This file defines **SEC** requirements for security controls, admin security surfaces, and secure handling patterns.

- Data classification, PII handling rules, and PCI-oriented invariants are centralized in `90_CROSSCUTTING_INVARIANTS.md`.

- Compliance-specific reporting/filings and legal obligations live in `16_COMPLIANCE_LEGAL.md`.


### Decision gates (agent MUST honor)

- **Program model gate (wallets):** Model B (bank/issuer-led) in Phase 1. If the program model changes (e.g., MSB seller-of-prepaid access), additional AML/BSA controls (COM) become mandatory and SHALL be implemented behind a feature flag and decision gate.
- **Funds flow gate (merchant acquiring):** Phase 1 is **ISO model**: PaySurity does **not** hold/settle merchant funds. If PaySurity later holds/remits funds or becomes PayFac, add settlement controls, reserve/holdback logic, and expanded compliance obligations.
- **Tap-to-phone gate:** Do **not** claim tap-to-phone is live until a gateway/acquirer-certified integration is enabled in production and validated via acceptance tests.

### Responsibility matrix (avoid scope confusion)

- **PaySurity-owned:** identity/RBAC, audit logs, admin dashboards, policy enforcement, secrets management, CI security gates, incident workflows, secure uploads, telemetry, and alert routing.
- **Provider-owned (gateway/acquirer/issuer):** network tokenization, card network rules enforcement at authorization, device kernel/EMV certifications, and settlement processing (in Phase 1 ISO model).
- **Shared:** chargeback evidence collection, device fleet visibility, and compliance evidence exports (PaySurity aggregates; providers may supply source artifacts).

## Security admin surfaces (dashboards + alerts)

### Security dashboard: admin API + UI

- **Ref:** PSR-V6-02396
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Security dashboard API + UI SHALL provide authorized admins with aggregated security posture metrics and drill-down to underlying events and affected entities.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Security alerts: admin API + UI

- **Ref:** PSR-V6-02395
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Security alerts API + UI SHALL provide authorized admins with actionable security alerts (severity, timestamp, source, correlationId) and support acknowledgement/escalation.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Security event logging

### Security event logging for blocked requests

- **Ref:** PSR-V6-02408
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Security event logger SHALL record blocked/denied requests (reason, path, requestId/correlationId, client metadata) without storing sensitive payloads.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## API protections & sensitive operations

### Payment processing endpoint security controls

- **Ref:** PSR-V6-02397
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Payment processing APIs SHALL enforce authN/authZ, input validation, idempotency, and tamper-evident audit logging for all payment attempts and outcomes.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### User profile endpoint security controls

- **Ref:** PSR-V6-02398
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “User profile APIs SHALL enforce authN/authZ, field-level validation, and audit logging for all profile changes (who/what/when/before/after where allowed).”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Sensitive operations require elevated permission

- **Ref:** PSR-V6-02404
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Sensitive operations SHALL require elevated permission, additional verification where configured, and SHALL be fully audited with correlationId.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### POST endpoint security middleware + audit

- **Ref:** PSR-V6-02405
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “All POST endpoints SHALL be registered behind standard security middleware (authN, RBAC, rate limits, validation) and SHALL emit audit events for state-changing actions.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console.

### POST endpoint registration telemetry + audit

- **Ref:** PSR-V6-02406
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Endpoint registration telemetry SHALL record active POST routes and their protection posture to support security monitoring and change control.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console.

### POST endpoint handler contract is test-covered

- **Ref:** PSR-V6-02407
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “POST endpoint handler contracts (request/response schema + auth) SHALL be covered by automated tests in CI.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Operational diagnostics endpoints (safe + controlled)

### Detailed health endpoint: protected + sanitized

- **Ref:** PSR-V6-02399
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Detailed health endpoint SHALL be restricted to authorized roles and SHALL not expose secrets or sensitive operational details; output SHALL be safe for support use.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### User-Agent capture for security analytics (controlled)

- **Ref:** PSR-V6-02401
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “User-Agent (and related client metadata) capture SHALL be available for security analytics and troubleshooting, with access restricted to authorized admins and with PII-safe handling.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## API inventory & change control

### API route inventory & registration telemetry

- **Ref:** PSR-V6-02402
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Platform SHALL maintain an API route inventory (methods, paths, auth requirements, rate limits) for security review and operational diagnostics, exportable by authorized admins.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
 - Audit log evidence: sample record schema + query path in Admin Console.

### API route inventory is test-covered

- **Ref:** PSR-V6-02403
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API route inventory/registry SHALL have automated tests validating expected routes, protections, and that unauthenticated access is blocked.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Secure uploads

### Secure file upload pipeline (restricted + validated)

- **Ref:** PSR-V6-02409
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Uploads SHALL be restricted to controlled storage (no arbitrary filesystem paths), validated (type/size), scanned where applicable, and access-controlled end-to-end.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Secrets & key management

### Secrets management: secrets are never exposed via API

- **Ref:** PSR-V6-02400
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin or Compliance Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System SHALL NOT expose raw secrets (e.g., JWT signing keys) via any API; secrets SHALL be stored in a secret manager, rotated, and access SHALL be least-privilege + audited.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.


## Addendum (2026-02-10): Remote POS support security controls

- **Ref:** PSR-EXT-SEC-20260210-001
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Remote device support and remote configuration changes require just-in-time access controls and immutable audit trails.
- **Acceptance Criteria (GWT):**
- **Given** an internal staff member attempts a remote POS support action, **when** they authenticate, **then** the system SHALL satisfy: “Remote support privileges SHALL require strong authentication (e.g., MFA), role-based authorization, and just-in-time access grants with automatic expiry.”.
- **Given** a remote support session is started/stopped or a remote configuration is changed, **when** the event occurs, **then** the system SHALL record a tamper-evident audit event including actor, device, merchant/location, action type, timestamps, and outcome.
- **Evidence fields (agent must populate during build):**
 - RBAC policy definitions for support roles.
 - Audit log entries and export examples.
 - Tests: unauthorized access blocked; expired grants blocked; logs emitted.

- **Ref:** PSR-EXT-SEC-20260210-002
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Device management and update pipelines must be resilient against tampering and supply-chain attacks.
- **Acceptance Criteria (GWT):**
- **Given** the platform distributes POS application updates or configuration bundles, **when** a device receives an update, **then** the system SHALL satisfy: “All device updates and configuration payloads SHALL be signed and verified before installation/apply; failed verification SHALL block apply and generate an alert.”.
- **Given** a device communicates with PaySurity services, **when** requests are made, **then** device-to-cloud communication SHALL use mutually authenticated channels (device identity + rotation) and SHALL avoid storing long-lived secrets in plaintext on devices.
- **Evidence fields (agent must populate during build):**
 - Signing/verification implementation evidence.
 - Device identity issuance/rotation evidence.
 - Tests: signature verification failures; revoked device identity blocks access.

## Addendum (2026-02-10): Build security gates + incident readiness

- **Ref:** PSR-EXT-SEC-20260210-003
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-nonfunctional
- **Details:** Prevent “unknown insecure builds” from shipping.
- **Acceptance Criteria (GWT):**
- **Given** a change is proposed, **when** CI runs, **then** the system SHALL satisfy: “CI SHALL enforce minimum security gates: secret scanning, dependency vulnerability scanning, and SAST on changed files; builds failing gates SHALL not be deployable.”.
- **Given** a vulnerability is detected above threshold severity, **when** CI runs, **then** the pipeline SHALL fail with actionable output and SHALL create an admin-visible security alert.
- **Evidence fields (agent must populate during build):**
 - CI workflow files + sample failing output.
 - Admin alert UI/API evidence.
 - Tests: gate triggers deterministically.

- **Ref:** PSR-EXT-SEC-20260210-004
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-nonfunctional
- **Details:** Supply-chain transparency for audits and incident response.
- **Acceptance Criteria (GWT):**
- **Given** a build artifact is produced, **when** it is packaged for deployment, **then** the system SHALL satisfy: “Each release SHALL generate an SBOM and store it with the release metadata; artifacts SHALL be traceable to a git commit and CI run.”.
- **Given** an admin investigates an incident, **when** they query release metadata, **then** they SHALL be able to retrieve SBOM + provenance quickly.
- **Evidence fields (agent must populate during build):**
 - SBOM artifact sample + storage location.
 - Release metadata schema + UI/API access points.

- **Ref:** PSR-EXT-SEC-20260210-005
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Minimize blast radius of compromised credentials.
- **Acceptance Criteria (GWT):**
- **Given** secrets/keys exist for environments and tenants, **when** rotation is required, **then** the system SHALL satisfy: “The platform SHALL support key/secret rotation without downtime (where feasible), including per-environment separation and audit logging of rotations.”.
- **Given** a key is suspected compromised, **when** an admin triggers rotation, **then** the system SHALL revoke old credentials and confirm cutover success.
- **Evidence fields (agent must populate during build):**
 - Rotation runbook + audit events.
 - Tests: old credential rejected after rotation.

- **Ref:** PSR-EXT-SEC-20260210-006
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Tamper-evident audit history for security-sensitive actions.
- **Acceptance Criteria (GWT):**
- **Given** security-sensitive admin actions occur (RBAC changes, payout rules, rate changes, device update pushes), **when** they are logged, **then** the system SHALL satisfy: “Security audit logs SHALL be tamper-evident (hash chaining or WORM storage) and exportable for investigations.”.
- **Given** an audit event is altered or missing, **when** integrity checks run, **then** the system SHALL raise a high-severity alert.
- **Evidence fields (agent must populate during build):**
 - Hash-chain/WORM implementation evidence.
 - Integrity-check job evidence + alert UI evidence.

- **Ref:** PSR-EXT-SEC-20260210-007
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Eliminate “permanent super powers” for internal staff.
- **Acceptance Criteria (GWT):**
- **Given** privileged access is needed (support, compliance, platform ops), **when** an action is requested, **then** the system SHALL satisfy: “Privileged actions SHALL require just-in-time approval (where configured), time-bounded elevation, and explicit reason capture.”.
- **Given** the elevation expires, **when** the user attempts further privileged actions, **then** the system SHALL deny and require re-approval.
- **Evidence fields (agent must populate during build):**
 - Elevation workflow UI + policy config.
 - Tests: expired elevation blocked.

- **Ref:** PSR-EXT-SEC-20260210-008
- **Domain/Module:** SEC / Security & Privacy
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** security-functional
- **Details:** Make incidents operationally manageable with minimal manual effort.
- **Acceptance Criteria (GWT):**
- **Given** security alerts trigger (auth anomalies, WAF blocks, integrity failures), **when** an incident is opened, **then** the system SHALL satisfy: “The platform SHALL provide an incident timeline view that auto-links related events by correlationId/entity and supports assignment, notes, and resolution state.”.
- **Given** the incident is closed, **when** audits occur, **then** evidence (timeline + actions) SHALL be exportable.
- **Evidence fields (agent must populate during build):**
 - Incident UI/API evidence.
 - Tests: correlation linking deterministic.