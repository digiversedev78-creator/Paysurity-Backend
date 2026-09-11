# 90_CROSSCUTTING_INVARIANTS (Polished v2)

**Generated:** 2026-02-10 04:09:51 (America/Chicago)
## What this is
This document defines **global rules that apply to every module** (public site, admin, merchant portal, onboarding, Merchant Savings Estimator, e-commerce, POS, wallets, payroll).
If any topic document conflicts with this file, **update the topic document** to match these invariants.

## Authority order
1) `00_INDEX.md`
2) `90_CROSSCUTTING_INVARIANTS.md` (this file)
3) Topic requirement docs (01–20)
4) `99_GLOSSARY.md`

## Phase scope lock (implementation)
Phase 1 implementation is limited to:
- Public website + marketing
- Foundational platform + admin
- Merchant services + onboarding
- Merchant Savings Estimator
- E-commerce + POS retail
- POS restaurant + POS grocery
- Digital wallets
- Payroll

All other verticals remain valid but are deferred unless required as dependencies.

## Global Definition of Done
A requirement is complete only when:
- Required UI and/or API surfaces exist and are usable end-to-end (no dead ends).
- Acceptance criteria are met and verified (automated tests where feasible).
- RBAC is enforced where applicable.
- Audit logging exists for financial/compliance-impacting actions.
- Observability exists (logs + correlation IDs; health checks).
- Documentation is updated (README + operator notes where relevant).
- Evidence fields are recorded (see “Evidence pack”).

---

# Invariants (non-negotiables)

## 0) Canonical requirement format
- Every requirement MUST be a complete statement (no fragments).
- Every requirement MUST include Given/When/Then acceptance criteria (or an explicitly testable equivalent for non-functional requirements).
- “Open decisions” MUST be empty before build starts for that module (or defaults must be recorded as requirements).

## 1) Identity, access, and tenancy
- The system SHALL enforce tenant isolation (data + permissions) for all tenant-scoped objects.
- The system SHALL implement RBAC with least privilege and explicit permission checks on all privileged actions.
- Authentication SHALL support secure sessions/tokens with rotation + revocation.
- Administrative surfaces SHALL require strong authentication; MFA SHOULD be supported where feasible.
- Every write action that changes state SHALL be attributable (who/what/when/where).

## 2) Security baseline
- No secrets SHALL be committed to source control (ever).
- Secrets SHALL be stored only in environment configuration and never logged.
- All network traffic SHALL use TLS.
- Sensitive data at rest SHALL be encrypted (provider-managed or app-managed as appropriate).
- File uploads SHALL be validated (type/size), stored privately by default, and scanned where feasible.
- Input validation + output encoding SHALL be applied (injection/XSS/CSRF/SSRF, etc.).
- Rate limiting + abuse controls SHALL exist for public endpoints, authentication endpoints, and upload-heavy workflows.
- Payment card data handling: **do not store raw card numbers**; use tokenization and provider primitives.


## 2.1) PCI DSS / payment-data handling (scope + non-negotiables)
These rules exist to **minimize PCI scope** and prevent accidental storage/exposure of cardholder data.

**Scope boundary rule**
- The platform MUST be designed so that PaySurity systems **do not store, process, or transmit raw PAN** (card number) or magnetic-stripe data.
- Card data entry MUST use a PCI-compliant provider mechanism (for example hosted fields/redirect, tokenization) so PaySurity services only receive **tokens** and non-sensitive metadata.
- If any component would cause PaySurity to handle cardholder data directly, that design MUST be rejected or replaced unless explicitly approved as a compliance project (separate workstream).

**Storage rule**
- The system MUST NEVER store PAN, full track data, or CVV (security code).
- If a last-4 and brand are stored for UX, it MUST be non-sensitive and MUST be protected by RBAC and audit logging.

**Transmission rule**
- All payment-related calls MUST be over TLS.
- Webhooks/callbacks MUST be signed and verified; secrets MUST be rotated and never logged.

**Segmentation rule**
- Payment processing components MUST be logically and/or network segmented from general application components where feasible.
- Access to payment configuration and keys MUST be restricted to least-privilege roles.

**POS/device rule (if POS accepts cards)**
- Card-present flows SHOULD rely on certified payment devices and provider SDKs that keep card data off PaySurity systems.
- If point-to-point encryption (P2PE) is used by providers/devices, PaySurity MUST not decrypt card data.

**Evidence required**
- A simple data-flow diagram showing where card data enters and proving it never reaches PaySurity servers.
- Proof that stored fields are token/metadata only.
- Automated checks to block logging of sensitive fields.


## 3) Privacy + data governance
- PII MUST be minimized, labeled, and access-controlled by role and tenant.
- Logs MUST avoid storing secrets and SHOULD avoid storing raw PII; use redaction where feasible.
- Data retention rules MUST exist (minimum: configurable retention for uploads, logs, and signed artifacts).
- Backups + restore verification MUST exist for critical data stores.
- Exportability: authorized admins MUST be able to export tenant data (at least CSV/JSON for core entities) with audit logging.

## 4) Auditability
- All financial, compliance, and permission/role changes SHALL write an immutable audit record.
- Audit records SHALL include: actor, tenant, timestamp, action, target entity, result, and correlation ID.
- Audit log access SHALL be restricted to authorized admin roles.
- Audit logs MUST be queryable from the admin UI (filters by time/tenant/actor/action).

## 5) API standards (applies to all APIs)
- APIs MUST have consistent error formats and status codes.
- Idempotency MUST be supported for critical write endpoints (payments, onboarding submissions, uploads, contract signing).
- Pagination MUST be supported for list endpoints (with stable ordering).
- Webhooks (if present) MUST be signed and replay-protected.
- All requests SHOULD propagate a correlation ID end-to-end.

## 6) Observability and runtime health
- All services SHALL emit structured logs with correlation IDs.
- All services SHALL expose health checks that distinguish “up” vs “degraded”.
- Key subsystems SHALL publish basic metrics (latency, error rate, throughput).
- The Super Admin dashboard SHALL show system status with severity states (green/orange/red) and drill-down to evidence (logs/tests/metrics).
- Alerting rules MUST exist for sustained error spikes and degraded health.

## 7) Testing and quality gates
- Each requirement SHALL have automated tests where feasible (unit + integration minimum; end-to-end for core flows).
- CI SHALL block merges when required tests fail.
- Tests SHALL be deterministic and provide actionable failure output.
- The admin dashboard SHALL allow Super Admin (and designated sub-super admins) to trigger test suites and view results.
- Dependency + secret scanning SHOULD run in CI; failures MUST be visible and actionable.

## 8) UI rules (applies to all web/admin apps)
- UI MUST be responsive and usable on common device sizes.
- Accessibility MUST meet WCAG AA for core flows.
- Error states MUST be user-readable, with clear next actions.
- UI text MUST be consistent and SHOULD avoid internal jargon for end users (admins may see more detail).
- Localization MUST be designed-in (language toggle, locale-aware formatting) even if not all languages ship in Phase 1.

## 9) Public site SEO + content baseline
For all public and indexable surfaces:
- Sitemap + robots rules MUST exist and be correct.
- Canonical URLs, meta titles/descriptions, and OpenGraph tags MUST be set.
- Structured data (JSON-LD) MUST be added where applicable (services/articles).
- Performance MUST meet “fast page” expectations (optimize images, avoid layout shift, minimize blocking scripts).
- Internal linking strategy MUST connect: vertical pages ↔ related blog categories ↔ related product pages.
- Social links MUST exist in the site footer/header (where appropriate).

## 10) Content automation governance (blog + “freshness” + distribution)
If content is generated or curated:
- Sources MUST be configurable (allowlist/denylist) by Super Admin.
- Publishing cadence MUST be configurable by Super Admin (and delegated roles).
- The system MUST avoid reproducing copyrighted text; it may summarize and link out.
- A “review before publish” mode MUST be supported, even if auto-publish is enabled.
- Any automated posting to external platforms MUST support approval controls + audit logs (who/what/when).

## 11) Onboarding entrypoint rule (public → product)
- All onboarding journeys intended for prospects SHOULD originate from the public site entrypoints (PaySurity.com CTAs) for consistent branding and SEO benefits.
- After the CTA, the user may be routed into the correct onboarding wizard (merchant, wallet user, payroll) while preserving a single coherent PaySurity flow.

## 12) Merchant Savings Estimator placement rule (SEO + architecture)
- The estimator MUST have an SEO-first landing page on the public site (indexable).
- The estimator processing engine (OCR/parsing/pricing model) MAY be implemented as a separate internal module/service for isolation, security, and reuse.
- The public page SHALL call the estimator module via internal APIs; prospects experience it as a single PaySurity flow.
- Upload handling MUST meet the file-upload security baseline (validation, private storage, scanning where feasible).

## 13) Catalog and data sync invariant (web ↔ POS)
- Merchants SHALL be able to CRUD products in either POS or web admin.
- The system SHALL synchronize catalog/inventory changes across devices and web surfaces.
- Offline operation SHALL queue writes and reconcile on reconnect with defined conflict rules.
- Product identity (SKU/barcode) MUST be consistent across all channels.

## 14) Device-first + peripherals baseline (POS)
- POS flows MUST be optimized for device-first usage (touch-first, fast paths, minimal typing).
- Barcode scanning MUST be supported for product lookup and checkout where applicable.
- Peripheral integration MUST fail gracefully (clear UI error + fallback path).

## 15) E-signing invariant for onboarding
- Acceptance of pricing and terms MUST be captured via an in-house e-sign flow with:
  - signer identity capture, timestamps, tamper-evident signed artifact, and retrieval.
- Signed artifacts MUST be stored and accessible to authorized roles.
- Signing flows MUST be auditable and must support re-display and re-download.

---

# Evidence pack (required per implemented requirement)
For each implemented requirement, the build log MUST capture:
- UI routes/screens (or components) involved.
- API endpoints involved (with sanitized request/response examples).
- Data entities touched (and migrations if applicable).
- Test IDs and CI run evidence.
- Audit log evidence where applicable.
- Any configuration keys required (names only, no secret values).
## 16) Reliability and resilience (save-future-headaches rules)
- All external integrations SHALL use explicit timeouts, retries with backoff, and clear failure modes.
- Critical workflows SHALL implement idempotency and safe replays (no duplicate charges, no duplicate onboarding submissions, no duplicate signed artifacts).
- Where asynchronous processing exists (uploads, OCR, content generation, report builds), the system SHALL use a job queue pattern with:
  - at-least-once delivery handling + idempotent handlers
  - retry limits + dead-letter queue
  - operator visibility (admin can see jobs, retry, cancel, and view last error)
- The platform SHALL provide “reconciliation tools” for critical money-related workflows (settlement, payouts, refunds, chargebacks) so issues can be corrected without database edits.
- The platform SHALL provide a “safe mode” (feature flag / kill switch) to disable high-risk subsystems quickly (uploads, content auto-publish, payment initiation) without taking the whole system down.

## 17) Configuration and feature flags (minimal human intervention)
- All rates, fees, schedules, thresholds, and operational policies SHALL be configurable via admin UI (not hardcoded).
- Configuration changes SHALL be validated, versioned, auditable, and reversible (rollback to prior version).
- Feature flags SHALL support staged rollout (per environment, per tenant, and percentage-based) and fast disable.
- The admin UI SHALL show which features/configs are active for a tenant, with “why” (flag/config source).

## 18) Financial correctness invariants
- Money amounts SHALL use decimal-safe representations (no floating-point math).
- All balances SHALL be derivable from an immutable transaction ledger (no “magic balance edits”).
- Every financial mutation SHALL be idempotent, auditable, and attributable.
- The system SHALL support reconciliation reports that tie UI totals to ledger totals and to provider settlement totals.
- Time and currency handling SHALL be explicit (timezone aware timestamps; currency codes stored with amounts).

## 19) Data ownership and contracts (avoid agent confusion)
- For each core entity (merchant/tenant, user, product, order, transaction, settlement, reward), there MUST be a defined “system of record” and a single canonical identifier.
- If data is synchronized across channels (web ↔ POS), the system SHALL define conflict resolution rules and surface conflicts to operators when automatic resolution is unsafe.
- APIs and events SHALL be versioned or backward compatible; breaking changes MUST be gated behind flags and documented.

## 20) Deployment and migration safety
- Schema changes SHALL be applied using forward-compatible migrations (avoid deploy-time breakage).
- Deployments SHOULD support rollback; critical migrations MUST have an explicit rollback plan.
- Secrets and environment settings MUST be separated by environment (development, staging, production) with least privilege.
- “Zero-downtime” expectations MUST be set for core services: avoid maintenance windows where feasible.

## 21) AI automation governance (reduce risk + reduce manual work)
- AI-powered automations (content generation, social replies, support responses) MUST follow:
  - allowlisted actions (what the AI can do)
  - rate limits and abuse controls
  - prompt-injection defenses for any workflow reading untrusted content
  - an approval queue option (review-before-publish / review-before-post)
  - complete audit logs showing: inputs (redacted), outputs, approver (if any), and publish target
- If AI is used for customer-facing answers, the system MUST provide clear user escalation paths and MUST avoid leaking private tenant data.
- The admin UI SHALL include controls to pause/resume AI automations and configure schedules and sources.

## 22) Admin “operator toolkit” (self-serve fixes)
The platform MUST provide operator tools to avoid engineering-only interventions:
- Re-run failed jobs (by workflow, tenant, and timeframe)
- Reconcile and rebuild derived reports
- Reprocess uploads and parsing results (with versioned parsing rules)
- Trigger synthetic checks / smoke tests post-deploy
- Export/import key tenant configurations (for onboarding and support)

## 23) Evidence requirements for the above sections
For each subsystem that implements these invariants, the build evidence MUST include:
- Where configuration is stored and how it is validated/versioned
- Feature flag controls and rollback proof
- Reconciliation tooling path in admin UI
- Job queue visibility UI and dead-letter handling
- A minimal data-flow map for money movement and uploads

## Crosscut requirements (Ref-backed)

_These requirements were previously tracked in the split set ledger. Keep them Ref-addressable for audits and agent execution._

### System SHALL handle ambiguous/invalid input safely (validation + user-safe errors; no crashes)

- **Original label:** For ambiguous or wild input [TEST].

- **Ref:** PSR-V6-03725
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the system receives malformed, ambiguous, or unexpected input in any public/admin workflow, **when** validation runs, **then** the system SHALL reject unsafe inputs, SHALL not crash, and SHALL present a user-safe error message.
- **Given** the malformed input could be an attack payload, **when** the system processes it, **then** the system SHALL prevent injection/abuse (no state change; request is logged with redaction).
- **Given** automated tests exist for input validation, **when** CI runs, **then** tests SHALL pass and failures SHALL be actionable.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### AI prompts and responses SHALL enforce a maximum token budget and safe truncation

- **Original label:** Limit prompt and response size with a maximum token budget.

- **Ref:** PSR-V6-03727
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** an AI-assisted workflow is invoked, **when** prompts or expected outputs exceed configured token limits, **then** the system SHALL enforce the maximum token budget, SHALL truncate safely, and SHALL not exceed budget thresholds.
- **Given** budgets are configured, **when** consumption approaches the configured warning threshold, **then** the system SHALL raise an alert visible to Super Admin.
- **Given** automated tests exist for token budgeting, **when** CI runs, **then** tests SHALL pass.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Monorepo structure with pnpm workspaces SHALL be used for the platform

- **Original label:** Roll-up: Monorepo structure with pnpm [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03864
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Testing and quality gates” + repository standards.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Testing and quality gates” + repository standards).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### CI/CD SHALL run through GitHub Actions with required quality gates

- **Original label:** Roll-up: GitHub Actions CI/CD [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03865
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Testing and quality gates”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Testing and quality gates”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Secrets management SHALL prevent committing secrets and SHALL use environment/secret stores

- **Original label:** Roll-up: Secrets management [MERGED][ROLLUP][UI (User Interface)][COM].

- **Ref:** PSR-V6-03866
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Security baseline” + “Deployment and migration safety”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Security baseline” + “Deployment and migration safety”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Security baseline controls SHALL be implemented across all modules

- **Original label:** Roll-up: Security baseline [MERGED][ROLLUP][UI (User Interface)][COM].

- **Ref:** PSR-V6-03867
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Security baseline”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Security baseline”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### RBAC matrix SHALL be defined, implemented, and enforced

- **Original label:** Roll-up: RBAC matrix [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03868
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Traceability roll-up; satisfied by Section “Identity, access, and tenancy”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Identity, access, and tenancy”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Audit logging SHALL capture critical actions with immutable records

- **Original label:** Roll-up: Audit logging [MERGED][ROLLUP][UI (User Interface)][COM].

- **Ref:** PSR-V6-03869
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Traceability roll-up; satisfied by Section “Auditability”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Auditability”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### API standards SHALL be consistent (errors, pagination, idempotency, auth)

- **Original label:** Roll-up: API standards [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03870
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “API standards”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “API standards”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Data protection and privacy controls SHALL be implemented and auditable

- **Original label:** Roll-up: Data protection & privacy [MERGED][ROLLUP][UI (User Interface)][COM].

- **Ref:** PSR-V6-03871
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Privacy + data governance”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Privacy + data governance”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Backups and disaster recovery (DR) SHALL be implemented and restore-verified

- **Original label:** Roll-up: Backups & DR [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03872
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Privacy + data governance” + “Deployment and migration safety”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Privacy + data governance” + “Deployment and migration safety”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Language and localization capabilities SHALL be supported as required

- **Original label:** Roll-up: Languages [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03873
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Traceability roll-up; satisfied by Section “UI rules”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “UI rules”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Accessibility SHALL meet WCAG 2.1 AA for core flows

- **Original label:** Roll-up: Accessibility (WCAG 2.1 AA) [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03874
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “UI rules”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “UI rules”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Observability SHALL exist (logs, metrics, health checks) with admin visibility

- **Original label:** Roll-up: Observability [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03875
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Section “Observability and runtime health”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Observability and runtime health”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Feature flags SHALL support staged rollout and fast disable/kill-switch

- **Original label:** Roll-up: Feature flags [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03876
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Traceability roll-up; satisfied by Section “Configuration and feature flags”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Section “Configuration and feature flags”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Documentation and READMEs SHALL be complete and kept current

- **Original label:** Roll-up: Docs & READMEs [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03877
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Global Definition of Done + “Docs & READMEs”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Global Definition of Done + “Docs & READMEs”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Cost monitoring SHALL track AI/API usage and budgets with alerts

- **Original label:** Roll-up: Cost monitoring [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03879
- **Domain/Module:** ADM / Foundational
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** nonfunctional/ops
- **Clarification:** Traceability roll-up; satisfied by Sections “Observability” + “AI automation governance”.
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** the platform is deployed in an environment, **when** the applicable checks for this requirement are executed (automated tests, scans, reviews, or operational verification), **then** the system SHALL meet this requirement as defined in `90_CROSSCUTTING_INVARIANTS.md` (Sections “Observability” + “AI automation governance”).
- **Given** the requirement is applicable to Phase 1 scope, **when** the Super Admin reviews platform readiness, **then** evidence SHALL be available in the admin/operator surfaces (tests, logs, dashboards, configs) proving compliance.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
<!-- END: TRACEABILITY_ROLLUPS -->

