# PaySurity Requirements Traceability Matrix (RTM)

| Req ID | Requirement Description | Source | Status | Test Case ID | Test Status |
|--------|-------------------------|--------|--------|--------------|-------------|
| REQ-01 | **Super Admin Billing Features** - Ability to manage subscriptions and billing. | Super Admin Specs | ⚠️ COMPLETED WITH TECHNICAL DEBT (Mocked Auth/DB) | TC-01 | Untested |
| REQ-02 | **Super Admin Billing Features** - View and manage invoices across tenants. | Super Admin Specs | In Progress | TC-02 | Untested |
| REQ-03 | **Super Admin Billing Features** - Set up pricing tiers and plans. | Super Admin Specs | Planned | TC-03 | Untested |
| REQ-04 | **Vertical Marketing Sites** - Independent landing pages tailored to specific verticals (e.g., healthcare, retail). | Marketing Specs | ✅ COMPLETED | TC-04 | Tested |
| REQ-05 | **Vertical Marketing Sites** - SEO optimization and distinct branding per vertical. | Marketing Specs | ✅ COMPLETED | TC-05 | Tested |
| REQ-06 | **Updated Navbar** - Responsive navigation bar with contextual links depending on user role. | UI/UX Specs | ✅ COMPLETED | TC-06 | Tested |
| REQ-07 | **Updated Navbar** - Integration of user profile, notifications, and settings dropdowns. | UI/UX Specs | In Progress | TC-07 | Untested |
| REQ-08 | **Updated Navbar** - Distinct state and styling for active menu items. | UI/UX Specs | In Progress | TC-08 | Untested |

---

## 🛑 POST-AUDIT GAPS (Added 2026-08-06)

### CRM / Customer Service Traceability (apps/admin-portal/src/app/tickets)
| Req ID | Description | Status | Auditor Finding (Gap Analysis) |
| :--- | :--- | :--- | :--- |
| **ADV-CRM-01** | Zero-Knowledge Personas | ❌ FAILED | `workspace.client.tsx` fetches `admin/tickets/secure-data` and renders raw JSON blobs in a plaintext `<pre>` tag. PII is leaked into the DOM. |
| **ADV-CRM-02** | Agentic Auto-Pilot Orchestration | ❌ FAILED (Vaporware) | Codebase contains zero agentic polling logic or ERP integration. It is a simple CRUD app. |
| **ADV-CRM-03** | Standard JSON REST API Attribution Layer | ❌ FAILED (Vaporware) | No `pacs.008` ledger mapping exists anywhere in the CRM code. |
| **ADV-CRM-04** | Predictive LTV Scoring | ❌ FAILED (Vaporware) | Mathematical LTV models are entirely absent. |
| **ADV-CRM-05** | Hyper-Local Geofencing Sentry | ❌ FAILED (Vaporware) | No edge trigger or polygon bound monitoring exists. |
| **UX-CRM-01** | Functional Workflow | ❌ FAILED (Theater) | "Adjudicate", "Configure", and "Initialize Global Override" buttons are dead placeholders. |
| **SEC-CRM-01** | Disjointed Authorization | ❌ FAILED | `disputes` and `flags` modules bypass the `verifyCsrScope` check. |

### Super Admin Portal Traceability (apps/admin-portal)
| Req ID | Description | Status | Auditor Finding (Gap Analysis) |
| :--- | :--- | :--- | :--- |
| **ADM-01** | Global Telemetry (PayFactor / Affiliates) | ❌ FAILED (Vaporware) | The required "PayFactor" tool and Affiliates tracking module are completely missing. |
| **ADM-02** | MDM / IoT Remote Management | ❌ FAILED (Vaporware) | No hardware matrix or `/mdm-remote` WebSocket Gateway exists for POS device commands. |
| **ADM-03** | Secure Tenant Impersonation | ❌ FAILED (Fraud Risk) | The "Impersonate" button writes to client `localStorage`, bypassing the required secure `x-impersonate-tenant` JWT middleware. |
| **ADM-04** | Hardcoded Data Prohibition | ❌ FAILED | KYB Underwriting page uses a massive hardcoded `SEED_APPS` array instead of DB retrieval. |
| **ADM-05** | Secure Client-Side Guards | ❌ FAILED | Operator console relies on client-side cookies/sessionStorage for `x-location-id`, inviting bypass. |
| **ADM-06** | Sub-Admin RBAC Enforcement | ❌ FAILED | `FINANCE_ADMIN` and `SUPPORT_ADMIN` boundaries are not enforced in the UI components. |


## Multi-Tenant RBAC Data-Mapping Matrix (2026-08-07 Addendum)
| Entity/Data Domain | Tenant-Admin (Global View) | Branch-Manager (Local View) |
| :--- | :--- | :--- |
| **Transactions** | Read/Write all branches | Read/Write assigned branch only |
| **Users/Staff** | Manage all staff | Manage branch staff only |
| **Reporting** | Aggregate across all branches | Branch-specific metrics only |
| **Configuration** | Global settings & overrides | Branch-specific settings only |
| **Customers** | View all customer data | View branch customer data |

*Note: This data-mapping ensures strict row-level security per the PAAGF Constitution and Multi-Tenant SSOT mandates.*

## AI Data Sandboxing & Intra-Tenant Privilege Escalation (2026-08-07 Addendum)
**CRITICAL FLAW RESOLVED:** AI agents are explicitly PROHIBITED from operating with tenant-wide scope.
All AI agents MUST inherit and be cryptographically bound to the strict RBAC permissions and identity of the **invoking user**, preventing intra-tenant privilege escalation. A cashier cannot use prompt injection to extract owner-level data.

## AI Process Flow & Data-Mapping Testability (2026-08-07 Addendum)
**CRITICAL FLAW RESOLVED:** All AI process flows and Multi-Tenant RBAC data-mappings MUST be mathematically testable.
- E2E tests MUST explicitly assert that an AI agent inherits the exact RBAC permissions of the invoking user.
- E2E tests MUST explicitly assert that data-mappings prevent cross-tenant and intra-tenant privilege escalation (e.g., verifying a Branch-Manager cannot prompt-inject to read Tenant-Admin data).
- NO AI feature can pass the PoW Gateway without Exit Code 0 proof of these negative security test assertions.
