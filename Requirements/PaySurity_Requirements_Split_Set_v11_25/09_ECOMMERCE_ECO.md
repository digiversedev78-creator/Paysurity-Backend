# 09 ECOMMERCE ECO

## Provider capability reuse (FluidPay fast-path)

- **Source of truth:** `08_PAYMENT_ORCHESTRATION_ORC.md` requirement **PSR-EXT-FLUIDPAY-REUSE-20260210-001**.
- Phase 1 ecommerce activation SHALL support reuse-first via provider webshop plugins (e.g., WooCommerce) where it meets requirements, while PaySurity maintains its own ECO data model and reporting.


**Generated:** 2026-02-10 04:03:40 (America/Chicago)

**Covers capability area(s):** E-Commerce (Electronic Commerce) / Online Stores

**Global rules:** See `90_CROSSCUTTING_INVARIANTS.md`.

# E-Commerce (Electronic Commerce) / Online Stores

_Contains 129 requirements._


## Catalog & Inventory

### Catalog API (Application Programming Interface) + categories [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03473
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** CRUD products, variants, inventory. | acceptancetests: - Create product → appears in list & searchable. | risknotes: SHARED-001 | reqid: ECOM-001
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Catalog API (Application Programming Interface) + categories [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 40: The main reason for this hack is to ensure that BroadcastChannel behaves equal to production when it is... [TEST][UI].

- **Ref:** PSR-V6-03500
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 40: The main reason for this hack is to ensure that BroadcastChannel behaves equal to production when it is... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Checkout & Orders

### Cart service (open + auth) [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03472
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Guest and logged carts; merge on login. | acceptancetests: - Add item as guest → login → items persist. | risknotes: ECOM-001 | reqid: ECOM-002
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Cart service (open + auth) [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Checkout + orders [OPS][TEST][UI].

- **Ref:** PSR-V6-03474
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Tax/shipping calc, order create, email receipt. | acceptancetests: - Place order end-to-end in smoke test. | risknotes: ECOM-002 | reqid: ECOM-003
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Checkout + orders [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 339: The PaymentIntent associated with this invoice. The PaymentIntent is generated when the invoice is... [OPS][TEST][UI].

- **Ref:** PSR-V6-03488
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 339: The PaymentIntent associated with this invoice. The PaymentIntent is generated when the invoice is... [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 527: For post-payment credit notes the sum of the refund, credit and outside of Stripe amounts must equal the... [API][TEST][UI].

- **Ref:** PSR-V6-03510
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 527: For post-payment credit notes the sum of the refund, credit and outside of Stripe amounts must equal the... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### Orders admin & exports [OPS][TEST][UI].

- **Ref:** PSR-V6-03527
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Filter by date/status; CSV (Comma-Separated Values) export. | acceptancetests: - Export last 30 days → CSV (Comma-Separated Values) matches grid. | risknotes: ECOM-003 | reqid: ECOM-005
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Orders admin & exports [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Payments via MS gateway [OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-03528
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** Use MS tokens and pricing plans; proper ledgering. | acceptancetests: - Payment success/decline paths logged; refunds work. | risknotes: MS-004 | reqid: ECOM-004
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Payments via MS gateway [OPS][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 120: Note: Ordering of values in the byte arrays used by parse() and stringify() follows... [TEST][UI].

- **Ref:** PSR-V6-03532
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 120: Note: Ordering of values in the byte arrays used by parse() and stringify() follows... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 155: Type of this credit note, one of prepayment or postpayment. A prepayment credit note... [API][TEST][UI].

- **Ref:** PSR-V6-03542
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 155: Type of this credit note, one of prepayment or postpayment. A prepayment credit note... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 1897: order specified. Note that you need to make sure that non-JavaScript files. [OPS][TEST][UI].

- **Ref:** PSR-V6-03545
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 1897: order specified. Note that you need to make sure that non-JavaScript files. [OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 452: The customer's address after a completed Checkout Session. Note: This property is... [SEC][TEST][UI].

- **Ref:** PSR-V6-03562
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 452: The customer's address after a completed Checkout Session. Note: This property is... [SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 89: Note: Ordering of values in the byte arrays used by parse() and stringify() follows... [TEST][UI].

- **Ref:** PSR-V6-03579
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Shopper (Online Shopper)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 89: Note: Ordering of values in the byte arrays used by parse() and stringify() follows... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Shipping & Fulfillment

### System shall provide Line 270: When shippingcost contains the shippingrate from the invoice, the shippingcost is... [TEST][UI].

- **Ref:** PSR-V6-03549
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 270: When shippingcost contains the shippingrate from the invoice, the shippingcost is... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 420: When shippingcost contains the shippingrate from the invoice, the shippingcost is... [TEST][UI].

- **Ref:** PSR-V6-03559
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 420: When shippingcost contains the shippingrate from the invoice, the shippingcost is... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 67: When shippingcost contains the shippingrate from the invoice, the shippingcost is... [TEST][UI].

- **Ref:** PSR-V6-03573
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 67: When shippingcost contains the shippingrate from the invoice, the shippingcost is... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.


## Storefront & Admin

<!-- BEGIN: REHOMED_FROM_FOUNDATION (v1) -->
### E-commerce merchant microsites SHALL include a hero section, product carousel, and an AI shopping assistant driven by the merchant’s online catalog.
- **Original label:** Implement hero and product carousel plus AI shopping assistant on e-commerce merchant microsites using their online catalog.

- **Ref:** PSR-V6-03726
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** a merchant has an enabled storefront and at least one published product in their online catalog, **when** a visitor opens the merchant microsite homepage, **then** the system SHALL render a hero section and a product carousel populated from the merchant’s catalog.
- **Given** the AI shopping assistant is enabled for that microsite, **when** a visitor asks for product suggestions or searches in natural language, **then** the system SHALL respond with catalog-based results (no hallucinated products) and SHALL link to relevant product detail pages.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Merchant microsite hero section and product carousel SHALL be responsive and fully usable on mobile.
- **Original label:** Ensure the hero and product carousel are responsive and fully usable on mobile.

- **Ref:** PSR-V6-03724
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT):**
- **Given** a merchant microsite homepage with hero + carousel is loaded on a mobile viewport, **when** the visitor scrolls and interacts with the hero and carousel, **then** the UI SHALL remain readable, tappable, and free of layout breakage (no overlap/overflow that blocks interaction).
- **Given** the visitor is on a slow network, **when** the page loads, **then** hero and carousel assets SHALL load progressively without blocking core content rendering.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
<!-- END: REHOMED_FROM_FOUNDATION (v1) -->


### Line 1069: Note that if you provide an Error, it will be returned as-is, unmodified and undecorated with any of the. [TEST][UI].

- **Ref:** PSR-V6-03475
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 1069: Note that if you provide an Error, it will be returned as-is, unmodified and undecorated with any of the. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 14288: throw new Error('We just came from a parent so we must have had a parent. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03476
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 14288: throw new Error('We just came from a parent so we must have had a parent. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 14298: throw new Error('We just came from a parent so we must have had a parent. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03477
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 14298: throw new Error('We just came from a parent so we must have had a parent. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 159: Note: As [documented above](#format-options), the prefix is trimmed before format is validated, therefore... [TEST][UI].

- **Ref:** PSR-V6-03478
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 159: Note: As [documented above](#format-options), the prefix is trimmed before format is validated, therefore... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 179704: Note: after calling this, the TextChanges object must be discarded!. [TEST][UI].

- **Ref:** PSR-V6-03479
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 179704: Note: after calling this, the TextChanges object must be discarded!. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 192: New options: We will not add any new options to stylistic rules unless an option is the only way to fix a... [TEST][UI].

- **Ref:** PSR-V6-03480
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 192: New options: We will not add any new options to stylistic rules unless an option is the only way to fix a... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 207: Assert(note && typeof note === 'string', 'Notes must be non-empty strings');. [TEST][UI].

- **Ref:** PSR-V6-03481
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 207: Assert(note && typeof note === 'string', 'Notes must be non-empty strings');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 2136: Generates a schema object that matches a string data type. Note that empty strings are not allowed by... [DATA][TEST][UI].

- **Ref:** PSR-V6-03482
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 2136: Generates a schema object that matches a string data type. Note that empty strings are not allowed by... [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 22202: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].

- **Ref:** PSR-V6-03483
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 22202: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 22212: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].

- **Ref:** PSR-V6-03484
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 22212: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 22259: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].

- **Ref:** PSR-V6-03485
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 22259: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 22269: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].

- **Ref:** PSR-V6-03486
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 22269: throw new Error('We must have new props for new mounts. This error is likely ' + 'caused by a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 26991: throw new Error('This should not happen, please report a bug.');. [TEST][UI].

- **Ref:** PSR-V6-03487
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 26991: throw new Error('This should not happen, please report a bug.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4047: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03489
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4047: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4050: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03490
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4050: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4051: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03491
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4051: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4053: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03492
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4053: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4054: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03493
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4054: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4057: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03494
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4057: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4058: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03495
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4058: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4086: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03496
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4086: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4089: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03497
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4089: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4092: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03498
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4092: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4093: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03499
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4093: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4102: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03501
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4102: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4105: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03502
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4105: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4108: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03503
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4108: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4109: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03504
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4109: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4116: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03505
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4116: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4120: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03506
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4120: throw new Error('The stacks must reach the root at the same time. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4155: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03507
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4155: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 4171: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03508
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 4171: throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 486: Note: As [documented above](#format-options), the prefix is trimmed before format is validated, thus... [TEST][UI].

- **Ref:** PSR-V6-03509
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 486: Note: As [documented above](#format-options), the prefix is trimmed before format is validated, thus... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 529: You may issue multiple credit notes for an invoice. Each credit note will increment the invoice's... [API][TEST][UI].

- **Ref:** PSR-V6-03511
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 529: You may issue multiple credit notes for an invoice. Each credit note will increment the invoice's... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 541: Usage of util.inherits() is discouraged. Please use the ES6 class and extends keywords to get language... [TEST][UI].

- **Ref:** PSR-V6-03512
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 541: Usage of util.inherits() is discouraged. Please use the ES6 class and extends keywords to get language... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 569: Note that the adjust feature will not perform any type validation on the adjusted value and it must match... [TEST][UI].

- **Ref:** PSR-V6-03513
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 569: Note that the adjust feature will not perform any type validation on the adjusted value and it must match... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 5823: time for the TTL calculation. Note that this must be a previous. [TEST][UI].

- **Ref:** PSR-V6-03514
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 5823: time for the TTL calculation. Note that this must be a previous. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6722: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03515
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6722: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6725: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03516
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6725: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6728: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03517
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6728: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6729: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03518
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6729: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6788: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03519
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6788: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6791: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03520
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6791: throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6791: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03521
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6791: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6794: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03522
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6794: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6795: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03523
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6795: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 6857: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].

- **Ref:** PSR-V6-03524
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 6857: throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 8347: Note: IE10+ supports the Selection object, but it does not support. [TEST][UI].

- **Ref:** PSR-V6-03525
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 8347: Note: IE10+ supports the Selection object, but it does not support. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Line 8357: Note: IE10+ supports the Selection object, but it does not support. [TEST][UI].

- **Ref:** PSR-V6-03526
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Line 8357: Note: IE10+ supports the Selection object, but it does not support. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### Public /health & smoke route [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03529
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Clarification:** /health returns ok:true; used by CI (Continuous Integration) smoke. | acceptancetests: - CI (Continuous Integration) smoke passes green. | risknotes: GEN-007 | reqid: ECOM-006
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “Public /health & smoke route [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 100: The tax rates which apply to the credit note line item. Only valid when the type is... [API][TEST][UI].

- **Ref:** PSR-V6-03530
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 100: The tax rates which apply to the credit note line item. Only valid when the type is... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 11575: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].

- **Ref:** PSR-V6-03531
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 11575: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 1235: Note: This function only supports comparing values with tags of. [TEST][UI].

- **Ref:** PSR-V6-03533
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 1235: Note: This function only supports comparing values with tags of. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 129: API (Application Programming Interface) is available. Please note: It is highly... [API][TEST][UI].

- **Ref:** PSR-V6-03534
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 129: API (Application Programming Interface) is available. Please note: It is highly... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 130: The integer amount in cents (or local equivalent) representing the amount of the... [TEST][UI].

- **Ref:** PSR-V6-03535
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 130: The integer amount in cents (or local equivalent) representing the amount of the... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 135: The integer amount in cents (or local equivalent) representing the amount of the... [TEST][UI].

- **Ref:** PSR-V6-03536
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 135: The integer amount in cents (or local equivalent) representing the amount of the... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 13: > Note that Function provides its own .toString() that returns the function's code. [TEST][UI].

- **Ref:** PSR-V6-03537
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 13: > Note that Function provides its own .toString() that returns the function's code. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 13: Note that certain report types can only be run based on your live-mode data (not... [DATA][TEST][UI].

- **Ref:** PSR-V6-03538
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 13: Note that certain report types can only be run based on your live-mode data (not... [DATA][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 1425: NOTE: this us query-only operation and does not generate any output on disk. [TEST][UI].

- **Ref:** PSR-V6-03539
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Could
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 1425: NOTE: this us query-only operation and does not generate any output on disk. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 145: The integer amount in cents (or local equivalent) representing the total amount of... [TEST][UI].

- **Ref:** PSR-V6-03540
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 145: The integer amount in cents (or local equivalent) representing the total amount of... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 150: The integer amount in cents (or local equivalent) representing the total amount of... [TEST][UI].

- **Ref:** PSR-V6-03541
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 150: The integer amount in cents (or local equivalent) representing the total amount of... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 157: A bug fix in a rule that results in ESLint reporting fewer linting errors. [TEST][UI].

- **Ref:** PSR-V6-03543
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 157: A bug fix in a rule that results in ESLint reporting fewer linting errors. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 163: A bug fix in a rule that results in ESLint reporting more linting errors. [TEST][UI].

- **Ref:** PSR-V6-03544
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 163: A bug fix in a rule that results in ESLint reporting more linting errors. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 1986: Note: this method is private for now because it does not really fit the WebSocket... [TEST][UI].

- **Ref:** PSR-V6-03546
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 1986: Note: this method is private for now because it does not really fit the WebSocket... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 22: The integer amount in cents (or local equivalent) representing the total amount of the... [TEST][UI].

- **Ref:** PSR-V6-03547
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 22: The integer amount in cents (or local equivalent) representing the total amount of the... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 2635: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].

- **Ref:** PSR-V6-03548
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 2635: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 298: A list of up to 10 tax amounts for the credit note line item. Cannot be mixed with... [API][TEST][UI].

- **Ref:** PSR-V6-03550
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 298: A list of up to 10 tax amounts for the credit note line item. Cannot be mixed with... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 303: The tax rates which apply to the credit note line item. Only valid when the type is... [API][TEST][UI].

- **Ref:** PSR-V6-03551
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 303: The tax rates which apply to the credit note line item. Only valid when the type is... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 32: Note: This function only supports cloning values with tags of. [TEST][UI].

- **Ref:** PSR-V6-03552
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 32: Note: This function only supports cloning values with tags of. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 3318: - [BUGFIX] Fix bug in tokens.retrieve API (Xavi). [API][SEC][TEST][UI].

- **Ref:** PSR-V6-03553
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 3318: - [BUGFIX] Fix bug in tokens.retrieve API (Xavi). [API][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 34: Note: This function only supports comparing values with tags of. [TEST][UI].

- **Ref:** PSR-V6-03554
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 34: Note: This function only supports comparing values with tags of. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 4180: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03555
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 4180: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 4183: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03556
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 4183: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 4186: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03557
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 4186: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 4187: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03558
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 4187: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 4249: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].

- **Ref:** PSR-V6-03560
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 4249: throw new Error('Tried to pop a Context at the root of the app. This is a bug in... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 448: A list of up to 10 tax amounts for the credit note line item. Cannot be mixed with... [API][TEST][UI].

- **Ref:** PSR-V6-03561
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 448: A list of up to 10 tax amounts for the credit note line item. Cannot be mixed with... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 453: The tax rates which apply to the credit note line item. Only valid when the type is... [API][TEST][UI].

- **Ref:** PSR-V6-03563
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 453: The tax rates which apply to the credit note line item. Only valid when the type is... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 463: - Fixed a bug with OAuth2 login where error callback was fired twice if getToken was... [OPS][SEC][TEST][UI].

- **Ref:** PSR-V6-03564
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 463: - Fixed a bug with OAuth2 login where error callback was fired twice if getToken was... [OPS][SEC][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 47: Customer balance transaction related to this credit note. [API][TEST][UI].

- **Ref:** PSR-V6-03565
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 47: Customer balance transaction related to this credit note. [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 490: Note: This method supports comparing arrays, booleans, Date objects, numbers, Object... [TEST][UI].

- **Ref:** PSR-V6-03566
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 490: Note: This method supports comparing arrays, booleans, Date objects, numbers, Object... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 518: its amountdue. For a status=paid invoice, a credit note does not affect its... [API][TEST][UI].

- **Ref:** PSR-V6-03567
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 518: its amountdue. For a status=paid invoice, a credit note does not affect its... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 520: Note: This method supports comparing arrays, booleans, Date objects, numbers, Object... [TEST][UI].

- **Ref:** PSR-V6-03568
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 520: Note: This method supports comparing arrays, booleans, Date objects, numbers, Object... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 5741: Note: This function only supports comparing values with tags of. [TEST][UI].

- **Ref:** PSR-V6-03569
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 5741: Note: This function only supports comparing values with tags of. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 599: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].

- **Ref:** PSR-V6-03570
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 599: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 6240: Note: This function only supports cloning values with tags of. [TEST][UI].

- **Ref:** PSR-V6-03571
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 6240: Note: This function only supports cloning values with tags of. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 65: This is a hack, but basically we want to keep the full 'API (Application Programming... [API][TEST][UI].

- **Ref:** PSR-V6-03572
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 65: This is a hack, but basically we want to keep the full 'API (Application Programming... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 70: The type of the credit note line item, one of invoicelineitem or customlineitem. When... [API][TEST][UI].

- **Ref:** PSR-V6-03574
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 70: The type of the credit note line item, one of invoicelineitem or customlineitem. When... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 7: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].

- **Ref:** PSR-V6-03575
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 7: Note: This method supports comparing arrays, array buffers, booleans,. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 853: Note: This method supports comparing the same values as .isEqual. [TEST][UI].

- **Ref:** PSR-V6-03576
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 853: Note: This method supports comparing the same values as .isEqual. [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 85: Customer-facing text that appears on the credit note PDF. [API][OPS][TEST][UI].

- **Ref:** PSR-V6-03577
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** nonfunctional/ops
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 85: Customer-facing text that appears on the credit note PDF. [API][OPS][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 86: Note: This method is loosely based on the structured clone algorithm and supports... [TEST][UI].

- **Ref:** PSR-V6-03578
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 86: Note: This method is loosely based on the structured clone algorithm and supports... [TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 92: API (Application Programming Interface) is available. Please note: It is highly... [API][TEST][UI].

- **Ref:** PSR-V6-03580
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 92: API (Application Programming Interface) is available. Please note: It is highly... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 95: A list of up to 10 tax amounts for the credit note line item. Cannot be mixed with... [API][TEST][UI].

- **Ref:** PSR-V6-03581
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 95: A list of up to 10 tax amounts for the credit note line item. Cannot be mixed with... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** the action completes successfully or fails with a handled error, **when** an administrator reviews audit logs, **then** an audit record SHALL exist with at minimum: actor identity (if authenticated), timestamp, action, target entity, result status, and a correlation identifier for troubleshooting.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.
  - Audit log evidence: sample record schema + query path in Admin Console (Admin Console).

### System shall provide Line 95: A unique number that identifies this particular credit note and appears on the PDF of... [API][TEST][UI].

- **Ref:** PSR-V6-03582
- **Domain/Module:** ECO / E-Commerce/Online Stores
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 95: A unique number that identifies this particular credit note and appears on the PDF of... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Line 9719: Note that it is assumed that when asked about semantic diagnostics through this API... [API][TEST][UI].

- **Ref:** PSR-V6-03583
- **Domain/Module:** ECO / AI (Artificial Intelligence) Hero Assistant + Product Carousel
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Acceptance Criteria (Given/When/Then) (GWT) (Given/When/Then):**
- **Given** the system is operational and the actor is `Store Manager (Store Manager)`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Line 9719: Note that it is assumed that when asked about semantic diagnostics through this API... [API][TEST][UI].”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (Hypertext Transfer Protocol (HTTP) 403 Forbidden (HTTP 403)) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Procurement & Purchase Orders (rehomed)

### DB schema SHALL define table `purchaseorderlines` for merchant operations

- **Ref:** PSR-V6-00544
- **Domain/Module:** ECO / E-commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Anonymous`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `purchaseorderlines` for merchant operations.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### DB schema SHALL define table `purchaseorders` for merchant operations

- **Ref:** PSR-V6-00545
- **Domain/Module:** ECO / E-commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Anonymous`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “DB schema SHALL define table `purchaseorders` for merchant operations.”.
- **Given** an anonymous visitor, **when** the visitor accesses the relevant User Interface (UI) (User Interface) surface, **then** the content SHALL render without authentication and SHALL not expose any sensitive data.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.



## Rehomed requirements (from ONB doc correction 2026-02-09)

_These requirements were originally placed under merchant onboarding during the initial split. They have been re-homed semantically to reduce agent confusion._

### API: DELETE /storefronts/:id

- **Ref:** PSR-V6-00228
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: DELETE /storefronts/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /merchants/:merchantId/storefronts

- **Ref:** PSR-V6-00247
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /merchants/:merchantId/storefronts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /storefronts/:id

- **Ref:** PSR-V6-00269
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /storefronts/:id.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /storefronts/:storefrontId/orders

- **Ref:** PSR-V6-00270
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /storefronts/:storefrontId/orders.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: GET /storefronts/:storefrontId/products

- **Ref:** PSR-V6-00271
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: GET /storefronts/:storefrontId/products.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### API: POST /storefronts

- **Ref:** PSR-V6-00310
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “API: POST /storefronts.”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

### System shall provide Developer Guide: See e-commerce API (Application Programming Interface) endpoints for order..

- **Ref:** PSR-V6-01453
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Acceptance Criteria (GWT):**
- **Given** the system is operational and the actor is `Merchant Applicant or Underwriter`, **when** the actor performs the relevant action or workflow, **then** the system SHALL satisfy: “System shall provide Developer Guide: See e-commerce API (Application Programming Interface) endpoints for order...”.
- **Given** a user without the required Role-Based Access Control (RBAC) (Role-Based Access Control) permission, **when** the user attempts the same action, **then** the system SHALL deny access (HTTP 403) or present an equivalent User Interface (UI) (User Interface) authorization error, and SHALL NOT change state.
- **Given** automated tests exist for this requirement, **when** the Continuous Integration (CI) (Continuous Integration) workflow runs, **then** the tests SHALL pass and SHALL provide deterministic failure output that points to the failing scenario.
- **Evidence fields (agent must populate during build):**
  - User Interface (UI) (User Interface) route(s) and screenshots or test selectors.
  - Application Programming Interface (API) (Application Programming Interface) endpoint(s) and request/response examples (sanitized).
  - Data model entities touched (tables/collections) and migration reference (if applicable).
  - Test identifiers (unit/integration/end-to-end (E2E) (End-to-End)) and Continuous Integration (CI) (Continuous Integration) run link.

## Addendum (2026-02-10): PaySurity Checkout + cart widget + platform plugins (Shopify/WooCommerce first)

- **Ref:** PSR-EXT-ECO-20260210-001
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Provide “PaySurity Checkout” as (a) hosted checkout page and (b) embeddable checkout component, integrated via ORC, with order confirmation + receipts + webhooks.
- **Acceptance Criteria (GWT):**
- **Given** a merchant site initiates checkout, **when** PaySurity Checkout is invoked, **then** the customer SHALL complete payment and receive confirmation, and the merchant SHALL receive an order event.
- **Given** payment fails, **when** the customer retries, **then** idempotency SHALL prevent duplicate orders/charges.

- **Ref:** PSR-EXT-ECO-20260210-002
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** Provide “PaySurity Cart Widget” as a drop-in cart + mini-storefront for merchants without Shopify/WooCommerce, sharing the same product catalog model and checkout.
- **Acceptance Criteria (GWT):**
- **Given** a merchant embeds the widget, **when** a buyer adds items, **then** the cart SHALL compute totals and route to PaySurity Checkout.
- **Given** catalog data changes in POS/ECO, **when** the widget loads, **then** it SHALL render current inventory/pricing.

- **Ref:** PSR-EXT-ECO-20260210-003
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Provide an official WooCommerce plugin that supports: catalog mapping, checkout/payments, refunds/voids, webhooks, and order status synchronization.
- **Acceptance Criteria (GWT):**
- **Given** a WooCommerce store installs the plugin, **when** checkout occurs, **then** the order and payment statuses SHALL remain consistent between WooCommerce and PaySurity.
- **Given** a refund is issued, **when** it is processed, **then** both systems SHALL reflect the refund and reconciliation metadata.

- **Ref:** PSR-EXT-ECO-20260210-004
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** Provide a Shopify Phase 1 integration using an external-provider redirect model (Shopify checkout redirects to PaySurity Checkout), with return URL, order confirmation sync, and reconciliation mapping.
- **Acceptance Criteria (GWT):**
- **Given** a Shopify order triggers payment, **when** redirect checkout is used, **then** the customer SHALL complete PaySurity Checkout and return to Shopify with a confirmed order state.
- **Given** the redirect flow is interrupted, **when** the customer returns later, **then** the system SHALL reconcile the payment and order state without duplicates.

- **Ref:** PSR-EXT-ECO-20260210-005
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Should
- **Type:** functional
- **Details:** E-Commerce platform connectors SHALL be modular and extensible to additional platforms (e.g., Magento, BigCommerce, Wix, Squarespace) without changing the core checkout and event contracts.
- **Acceptance Criteria (GWT):**
- **Given** a new platform connector is added, **when** it passes contract tests, **then** it SHALL integrate via the standard checkout/order webhook interface without ECO core rewrites.

- **Ref:** PSR-EXT-ECO-20260210-006
- **Domain/Module:** ECO / E-Commerce
- **Phase:** Phase 1
- **Priority:** Must
- **Type:** functional
- **Details:** ECO SHALL support product/catalog CRUD and auto-sync across POS devices, merchant microsites, and platform connectors (POS ↔ ECO ↔ plugins), including barcodes/SKUs, images, categories, variants, and inventory.
- **Acceptance Criteria (GWT):**
- **Given** a merchant updates catalog items in POS or web, **when** sync completes, **then** all connected channels SHALL reflect the change deterministically and auditably.
- **Given** conflicts occur, **when** sync resolves, **then** conflict resolution rules SHALL be applied and logged.