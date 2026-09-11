# 20 DEFERRED VERTICALS

**Generated:** 2026-02-10 03:20:30 (America/Chicago)

**Covers capability area(s):** Legal Vertical, Dental Practice Management

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.


## Scope notes (agent instructions)
- These verticals are **deferred**. Do not implement in Phase 1 unless required as a hard dependency.
- Any shared primitives (identity, tenants, RBAC, logging, audit, exports, payments) MUST reuse the Phase 1 foundation.
- Deliver Phase 1 with **extension points** (feature flags, module registration, API namespaces) so these verticals can be added without rework.

# Legal Vertical

_Contains 4 requirements._

## Documents & e-sign


### Legal docs: matter-scoped document management + versioning + e-sign

- **Ref:** PSR-V6-03663
- **Domain/Module:** LEG / Legal
- **Phase:** Phase 2 (Deferred)
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Legal Tenant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Legal tenants SHALL manage matter-scoped documents with version history and e-sign envelopes; completed signed PDFs SHALL be stored and linked to the matter with full audit trail.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Timekeeping & billing

### Legal billing: timekeeping + invoicing + LEDES export

- **Ref:** PSR-V6-03664
- **Domain/Module:** LEG / Legal
- **Phase:** Phase 2 (Deferred)
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Legal Tenant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Legal tenants SHALL track time and expenses, generate invoices, and export LEDES 1998B files that validate against sample validators; rounding and totals SHALL be correct.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

## Trust accounting

### Legal trust accounting: IOLTA ledgers + 3-way reconciliation

- **Ref:** PSR-V6-03665
- **Domain/Module:** LEG / Legal
- **Phase:** Phase 2 (Deferred)
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Legal Tenant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Legal tenants SHALL maintain IOLTA trust ledgers per matter and perform bank/ledger/register (3-way) reconciliation; the system SHALL prevent negative trust balances and retain immutable audit evidence.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

# Dental Practice Management

_Contains 2 requirements._


## General

## Case management

### Legal ops: case management roll-up

- **Ref:** PSR-V6-03863
- **Domain/Module:** LEG / Legal
- **Phase:** Phase 2 (Deferred)
- **Priority:** Could
- **Type:** functional
- **Clarification:** Matters, tasks, billing, trust accounting (IOLTA).
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Legal Tenant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL support a legal case management module roll-up (matters, tasks, billing, trust accounting) as a vertically scoped app, integrated with core ADM/SEC/COM logging and reporting.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
 - Test identifiers (unit/integration/E2E) and CI run link.

# Dental Practice Management

_Contains 1 requirement._

## Patient and clinical operations

### Dental ops: patient, scheduling, and charting roll-up

- **Ref:** PSR-V6-03878
- **Domain/Module:** OTH / Dental Practice Management
- **Phase:** Phase 2 (Deferred)
- **Priority:** Could
- **Type:** functional
- **Clarification:** Scheduling; treatment plans; imaging; claims.
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Dental Tenant Admin`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “The platform SHALL support a dental practice module roll-up (patients, scheduling, treatment plans, imaging, and claims) as a vertically scoped app, integrated with core ADM/SEC/COM logging and reporting.”.
- **Given** a user without the required RBAC permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent UI authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the CI workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
 - UI route(s) and screenshots or test selectors.
 - API endpoint(s) and request/response examples (sanitized).
 - Data model entities touched (tables/collections) and migration reference (if applicable).
- No roadmap language. Treat these as **target-state** requirements for deferred verticals; implementation is gated behind Phase 2+ authorization.
 - Test identifiers (unit/integration/E2E) and CI run link.