# 12 POS GROCERY POSG

## POS module selection (auto + controlled override)

- **Source of truth:** `05_MERCHANT_ONBOARDING_ONB.md` requirement **PSR-EXT-POS-OVERRIDE-20260210-001**.
- The POS module is auto-selected from merchant NAICS/SIC and MAY be overridden only during onboarding (pre-go-live) with guided confirmation and compatibility checks.
- After go-live (`merchant.go_live_at` set), module changes require a Change Request and Sub Super Admin approval with scheduled cutover + rollback stub + automated compatibility tests.


**Generated:** 2026-02-10 04:16:05 (America/Chicago)

**Covers capability area(s):** POS Grocery (Point of Sale Grocery)

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# POS Grocery (Point of Sale Grocery)

_Contains 64 requirements._


## Core POS

### Age verification [API][COM][OPS][TEST][UI].

- **Ref:** PSR-V6-03060
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** ID scanning for alcohol/tobacco purchases with state-specific rules | AcceptanceCriteria: 100% compliance in tests | AWS Rekognition integration | State rules engine | ReqID: POSG-AGE-019
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Age verification [API][COM][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### AI upselling at checkout [COM][TEST][UI].

- **Ref:** PSR-V6-03061
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Suggest add-ons based on basket contents and purchase history | AcceptanceCriteria: 15% basket size increase | Real-time recommendations | Privacy compliant | ReqID: POSG-AIU-012
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “AI upselling at checkout [COM][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Barcode/PLU/scale [TEST][UI].

- **Ref:** PSR-V6-03062
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** UPC/EAN; price-embedded; weighted items. | ReqID: POSG-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Barcode/PLU/scale [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Barcode/PLU/scale [TEST][UI].

- **Ref:** PSR-V6-03063
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** UPC/EAN; price-embedded; weighted items. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: POSG-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Barcode/PLU/scale [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Checkout with scales [TEST][UI].

- **Ref:** PSR-V6-03065
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process checkout with integrated scales and age verification | AcceptanceCriteria: Items scanned | Weight verified | Age checks performed | Tender processed | ReqID: POSG-CHK-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Checkout with scales [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Coupon processing [COM][OPS][TEST][UI].

- **Ref:** PSR-V6-03066
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Apply manufacturer and store coupons with validation rules | AcceptanceCriteria: Coupon validation | Stacking rules enforced | Limits applied | Audit trail maintained | ReqID: POSG-CPN-021
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Coupon processing [COM][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### E-commerce integration [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03067
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Sync inventory/pricing with Shopify, WooCommerce, and social media | AcceptanceCriteria: 100% inventory accuracy | Real-time updates | Webhook integration | ReqID: POSG-ECO-018
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “E-commerce integration [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### EBT/WIC processing [COM][TEST][UI].

- **Ref:** PSR-V6-03068
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process EBT and WIC transactions with compliance | AcceptanceCriteria: EBT cards accepted | WIC items validated | Balance checks performed | Compliance maintained | ReqID: POSG-EBT-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “EBT/WIC processing [COM][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Expiry date tracking [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03070
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Auto-alert for items at 80% shelf life with discount suggestions | AcceptanceCriteria: Alerts trigger 48hrs pre-expiry | Waste reduced 15% | USDA recall integration | ReqID: POSG-EXP-008
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Expiry date tracking [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Fast checkout scanning [TEST][UI].

- **Ref:** PSR-V6-03071
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Barcode/QR scanning under 500ms latency for grocery items | AcceptanceCriteria: Scan success rate ≥99.9% | Latency <500ms | Supports 100+ concurrent scans | ReqID: POSG-CHK-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Fast checkout scanning [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Grocery payment processing [API][TEST][UI].

- **Ref:** PSR-V6-03073
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process grocery payments with loyalty and discount integration | AcceptanceCriteria: Loyalty points applied | Discounts calculated | Payments processed | Receipts generated | ReqID: POSG-PAY-017
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Grocery payment processing [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Multi-payment support [API][COM][SEC][TEST][UI].

- **Ref:** PSR-V6-03077
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Accept credit/debit, BNPL, crypto, and mobile wallets at POS (Point of Sale) | AcceptanceCriteria: Processes all payment types | PCI (Payment Card Industry)-PTS 6.x compliant | NFC/RFID working | ReqID: POSG-PMT-005
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi-payment support [API][COM][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Critical for weighted produce checkout [TEST][UI].

- **Ref:** PSR-V6-03079
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Critical for weighted produce checkout [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Ensures transaction continuity despite damaged barcodes [TEST][UI].

- **Ref:** PSR-V6-03080
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Ensures transaction continuity despite damaged barcodes [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Fallback for scanning failures [TEST][UI].

- **Ref:** PSR-V6-03081
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Fallback for scanning failures [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include edge cases where stock equals threshold [TEST][UI].

- **Ref:** PSR-V6-03082
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include edge cases where stock equals threshold [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Include test for damaged items flagged correctly [OPS][TEST][UI].

- **Ref:** PSR-V6-03083
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test for damaged items flagged correctly [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test boundary values and invalid inputs [OPS][TEST][UI].

- **Ref:** PSR-V6-03085
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test boundary values and invalid inputs [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test coupon validation and discount application [OPS][TEST][UI].

- **Ref:** PSR-V6-03086
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test coupon validation and discount application [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test mix and match pricing logic [OPS][TEST][UI].

- **Ref:** PSR-V6-03088
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test mix and match pricing logic [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test price-embedded barcode decoding [OPS][TEST][UI].

- **Ref:** PSR-V6-03090
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test price-embedded barcode decoding [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test rejection flow separately [OPS][TEST][UI].

- **Ref:** PSR-V6-03091
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test rejection flow separately [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test retry logic on communication failure [OPS][TEST][UI].

- **Ref:** PSR-V6-03092
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test retry logic on communication failure [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with multiple exempt and non-exempt items [OPS][TEST][UI].

- **Ref:** PSR-V6-03093
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with multiple exempt and non-exempt items [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with multiple transaction types (single item, multiple items) [OPS][TEST][UI].

- **Ref:** PSR-V6-03094
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with multiple transaction types (single item, multiple items) [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Test with sufficient and insufficient EBT balance [OPS][TEST][UI].

- **Ref:** PSR-V6-03095
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with sufficient and insufficient EBT balance [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test with tare weight greater than gross weight to verify error handling [OPS][TEST][UI].

- **Ref:** PSR-V6-03096
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test with tare weight greater than gross weight to verify error handling [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Validate end-to-end reconciliation [OPS][TEST][UI].

- **Ref:** PSR-V6-03097
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Validate end-to-end reconciliation [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify audit log entry is created [COM][OPS][TEST][UI].

- **Ref:** PSR-V6-03098
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify audit log entry is created [COM][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Notes: Verify BOGO discount application [TEST][UI].

- **Ref:** PSR-V6-03099
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify BOGO discount application [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify decimal rounding and currency formatting [OPS][TEST][UI].

- **Ref:** PSR-V6-03100
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify decimal rounding and currency formatting [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify error handling and user guidance [TEST][UI].

- **Ref:** PSR-V6-03101
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify error handling and user guidance [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify membership validation and discount application [TEST][UI].

- **Ref:** PSR-V6-03102
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify membership validation and discount application [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Verify system does not proceed with invalid weight [TEST][UI].

- **Ref:** PSR-V6-03103
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Verify system does not proceed with invalid weight [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Promotions coupons and loyalty [OPS][TEST][UI].

- **Ref:** PSR-V6-03107
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Support promotions coupons and loyalty programs including mix and match pricing and BOGO and member pricing with clear receipt presentation
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Promotions coupons and loyalty [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Returns/voids [TEST][UI].

- **Ref:** PSR-V6-03109
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Lookup; restocking; fraud checks. | SemanticNotes: Seeded automatically from SEMANTICBATCHES.jsonl; semantic implementation not yet evaluated. | ReqID: POSG-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Returns/voids [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Returns/voids [TEST][UI].

- **Ref:** PSR-V6-03110
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Lookup; restocking; fraud checks. | ReqID: POSG-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Returns/voids [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Role-based access control [COM][OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-03111
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/compliance
- **Clarification:** Granular permissions for store roles with audit logging | AcceptanceCriteria: Zero privilege escalation | Role enforcement | Audit trail complete | ReqID: POSG-RBA-020
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Role-based access control [COM][OPS][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Barcode/PLU/scale [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03835
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** UPC/EAN; price-embedded; weighted items.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Barcode/PLU/scale [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Roll-up: Returns/voids [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03838
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Clarification:** Lookup; restocking; fraud checks.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Returns/voids [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Scale integration [API][TEST][UI].

- **Ref:** PSR-V6-03112
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Integrate with digital scales for weighted items (produce/meat) | AcceptanceCriteria: Weight passed to POS (Point of Sale) | Price calculated automatically | Scale calibration check | Rounding rules applied | ReqID: POSG-CHE-010
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Scale integration [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Scale integration for weighted items [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03113
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Integrate with digital scales for PLU-based pricing of weighted produce | AcceptanceCriteria: Scale weight triggers PLU lookup | Price calculates automatically | Weight displays on receipt | Tare function supported | ReqID: POSG-SCL-007
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Scale integration for weighted items [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Self-checkout kiosks [TEST][UI].

- **Ref:** PSR-V6-03114
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Customer-driven checkout with weight verification and anti-theft controls | AcceptanceCriteria: Theft detection 95% accuracy | Weight validation | Age verification prompt | ReqID: POSG-SCK-009
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Self-checkout kiosks [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Self-checkout mode [TEST][UI].

- **Ref:** PSR-V6-03115
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Customer-operated scan-and-pay kiosks with receipt printing and mobile pay | AcceptanceCriteria: Guides customer through scanning process | Accepts multiple payment methods | Prints receipts | Handles age verification for restricted items | ReqID: POSG-CHK-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Self-checkout mode [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Weighted items and scale integration [API][TEST][UI].

- **Ref:** PSR-V6-03116
- **Domain/Module:** POSG / AI (Artificial Intelligence) Hero Assistant + Product Carousel
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Support scale integration for weighted items with price per weight handling tare and label printing
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Weighted items and scale integration [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Devices & Peripherals

### Notes: Include test for printed and emailed receipts [OPS][TEST][UI].

- **Ref:** PSR-V6-03084
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Include test for printed and emailed receipts [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test device registration workflow [OPS][TEST][UI].

- **Ref:** PSR-V6-03087
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test device registration workflow [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Inventory

### Bulk inventory import [TEST][UI].

- **Ref:** PSR-V6-03064
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** CSV (Comma-Separated Values)/Excel mass inventory updates with rollback on error | AcceptanceCriteria: Import 10K SKUs in <5min | Atomic transactions | Error reporting | ReqID: POSG-BUL-010
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Bulk inventory import [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Inventory receiving [API][DATA][TEST][UI].

- **Ref:** PSR-V6-03074
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Receiving with lot/expiry tracking and auto-replenishment | AcceptanceCriteria: Vendor EDI (Electronic Data Interchange) processed | Lot/expiry tracked | Reorder points calculated | Shrink reasons recorded | ReqID: POSG-INV-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Inventory receiving [API][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Inventory replenishment and shrinkage [TEST][UI].

- **Ref:** PSR-V6-03075
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Track on hand inventory suggest replenishment and record shrinkage and adjustments at item and location level
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Inventory replenishment and shrinkage [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Inventory tracking [OPS][TEST][UI].

- **Ref:** PSR-V6-03076
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Track stock levels with low stock alerts and purchase order suggestions | AcceptanceCriteria: Stock decrements on sale | Alerts at threshold | PO suggestions generated | Barcode support | ReqID: POSG-INV-009
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Inventory tracking [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Real-time inventory tracking [OPS][TEST][UI].

- **Ref:** PSR-V6-03108
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Live stock levels with IoT sensors and auto-replenishment alerts | AcceptanceCriteria: Inventory accuracy ≥99.5% | 15s sensor polling | Auto-PO generation | ReqID: POSG-INV-007
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Real-time inventory tracking [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Offline & Sync

### Grocery inventory sync [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03072
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Sync grocery inventory levels across channels with real-time updates | AcceptanceCriteria: Stock levels update across POS (Point of Sale) | Low stock alerts trigger | Sync completes <5s | Conflict resolution works | ReqID: POSG-INV-006
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Grocery inventory sync [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Multi-store sync [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03078
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Centralized inventory/pricing control across all locations | AcceptanceCriteria: Sync latency <5s across 10 stores | Conflict resolution | Central pricing | ReqID: POSG-MST-017
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Multi-store sync [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Notes: Test offline queuing under normal conditions [OPS][TEST][UI].

- **Ref:** PSR-V6-03089
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Notes: Test offline queuing under normal conditions [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Offline mode [OPS][TEST][UI].

- **Ref:** PSR-V6-03104
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Local queue; reconciliation; device registry. | SemanticNotes: Backfilled automatically because this ReqID is present in master.csv but had no semantic entry. | ReqID: POSG-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Offline mode [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Offline mode [OPS][TEST][UI].

- **Ref:** PSR-V6-03105
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Local queue; reconciliation; device registry. | ReqID: POSG-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Offline mode [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Offline transaction mode [API][DATA][TEST][UI].

- **Ref:** PSR-V6-03106
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** Process transactions offline with auto-sync and conflict resolution | AcceptanceCriteria: Handles 2000 offline txns | Zero data loss | Auto-sync on reconnect | ReqID: POSG-OFL-006
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Offline transaction mode [API][DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Roll-up: Offline mode [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03837
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** nonfunctional/ops
- **Clarification:** Local queue; reconciliation; device registry.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Offline mode [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Staffing & Time

### Employee scheduling [API][TEST][UI].

- **Ref:** PSR-V6-03069
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** AI-optimized shifts based on sales trends and staff availability | AcceptanceCriteria: 12% labor cost reduction | Calendar sync | Skill-based assignment | ReqID: POSG-EMP-015
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Employee scheduling [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Tax

### Roll-up: Grocery tax & exemptions [MERGED][ROLLUP][UI (User Interface)].

- **Ref:** PSR-V6-03836
- **Domain/Module:** POSG / POS Grocery (Point of Sale Grocery)
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Clarification:** Food exemptions; SNAP/EBT path; receipts.
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Cashier (Cashier)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Roll-up: Grocery tax & exemptions [MERGED][ROLLUP][UI (User Interface)].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

## Rehomed from 03_PUBLIC_WEBSITE_COM (polish pass)

### departments [OPS][TEST][UI].

- **Ref:** PSR-V6-03592
- **Domain/Module:** WEB / AI (Artificial Intelligence) Hero Assistant
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Clarification:** and items as the product catalog. | ReqID: Implement hero
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “departments [OPS][TEST][UI].”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Implement hero, dark-green themed carousel, and AI shopping assistant on grocery POS (Point of Sale) microsites using aisles, departments, and items as the product catalog.

- **Ref:** PSR-V6-03597
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Implement hero, dark-green themed carousel, and AI shopping assistant on grocery POS (Point of Sale) microsites using aisles, departments, and items as the product catalog.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### POS (Point of Sale) Grocery AI hero integration [API][TEST][UI].

- **Ref:** PSR-V6-03636
- **Domain/Module:** WEB / Public Website
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Anonymous visitor`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “POS (Point of Sale) Grocery AI hero integration [API][TEST][UI].”.
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

The POS Grocery build MUST implement and test these shared requirements wherever applicable.