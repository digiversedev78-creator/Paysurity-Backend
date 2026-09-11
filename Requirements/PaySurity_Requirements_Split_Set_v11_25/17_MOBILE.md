# 17 MOBILE

**Generated:** 2026-02-10 02:52:00 (America/Chicago)

**Covers capability area(s):** Mobile

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# Mobile

_Contains 14 requirements._

## General

### Mobile store listing assets: complete and optimized

- **Ref:** PSR-V6-03649
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Mobile apps SHALL have all required app store listing assets produced, validated (dimensions/format), and stored in a controlled location with versioning; CI SHALL verify presence where feasible.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Mobile store listing copy: descriptions + keywords + localization

- **Ref:** PSR-V6-03650
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL maintain app store listing copy (descriptions, keywords, category, localized variants) for each PaySurity mobile app, with approval workflow and export for publishing.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### App store accounts: configured for publishing

- **Ref:** PSR-V6-03651
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Super Admins SHALL be able to configure and manage the Apple/Google app store account metadata needed to publish PaySurity mobile apps, with audited access and environment separation where applicable.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Signing assets: iOS certs + profiles; Android keystore

- **Ref:** PSR-V6-03652
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL maintain signing credentials required for mobile publishing (iOS certificates/profiles, Android keystore), stored securely, with controlled access and rotation/renewal tracking.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### App store review workflow: monitor + respond + evidence

- **Ref:** PSR-V6-03653
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL support an operational workflow to monitor app store review status, capture reviewer feedback, coordinate responses, and store evidence of actions taken.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### User acquisition campaigns: plan + tracking (UTM/QR) wired

- **Ref:** PSR-V6-03654
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL support planning and tracking of user acquisition campaigns for mobile apps, including UTM/QR attribution and reporting on installs and conversions.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Marketing materials pack: ready for launch

- **Ref:** PSR-V6-03655
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL generate and store a launch-ready marketing materials pack for mobile apps (screens, feature graphics, short demos), aligned with the PaySurity design system.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Legal links: privacy policy + ToS up-to-date and linked

- **Ref:** PSR-V6-03656
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Mobile apps and their store listings SHALL link to current privacy policy and ToS, and the platform SHALL store versioned copies and change history.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Store icon spec: iOS 1024 + Android 512 compliant

- **Ref:** PSR-V6-03657
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Mobile store icons SHALL meet platform sizing/spec requirements (including iOS 1024x1024 and Android 512x512), and validation SHALL be test-covered where feasible.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Mobile monetization configuration: subscriptions/in-app purchase gate

- **Ref:** PSR-V6-03658
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL support a decision gate and configuration for any mobile subscriptions/in-app purchase monetization; if enabled, implementation SHALL comply with store rules and be test-covered.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Customer engagement channel: push + in-app comms baseline

- **Ref:** PSR-V6-03659
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL provide a baseline customer engagement channel for mobile users (push notifications + announcements), with opt-in controls and auditability.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Android notification icon spec: compliant

- **Ref:** PSR-V6-03660
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Android notification icons SHALL meet platform requirements (e.g., 24x24dp and approved formats) and be included in the assets checklist.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### App store asset requirements: master checklist maintained

- **Ref:** PSR-V6-03661
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL maintain a single, authoritative checklist of app store asset requirements (by platform + app type) and expose it to admins as a release readiness checklist.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

### Per-app required assets: checklist per PaySurity mobile app

- **Ref:** PSR-V6-03662
- **Domain/Module:** MOB / Mobile
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Super Admin or Sub Super Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “For each PaySurity mobile app, the platform SHALL maintain a per-app release readiness checklist and asset set (icons/screenshots/copy), with evidence and approvals.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.
