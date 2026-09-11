# PaySurity Architectural Guardrails & Compliance Specification
# Target Environment: GCP Vertex AI Worker Pools / GitHub Actions Native CI
# Core Directive: Autonomous, Zero-Defect Execution with Mandatory Compliance Verification

---

## 1. Multi-Tenant Row-Level Security (RLS) & Isolation
PaySurity is a multi-tenant ecosystem powering distinct commercial verticals (e.g., BistroBeast, GrocerEase, American Eagle Logistics). Data cross-contamination is a catastrophic failure mode.

* **Schema Requirement:** Every database schema definition file under `packages/database/src/schema/` MUST explicitly contain a `tenant_id` column as a foreign key or indexed relation.
* **Database Enforcement:** Agents are strictly prohibited from writing raw, unfiltered database queries. All queries must pipe through a middleware, application decorator, or Knex/Drizzle query abstractor that appends a strict `.where(eq(schema.tenantId, context.tenantId))` clause.
* **Postgres RLS:** All migration generation code must automatically bundle explicit PostgreSQL `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` statements. Policies must evaluate data visibility using the authenticated session tenant claim extracted from the incoming JSON Web Token (JWT).

---

## 2. Cryptographic Ledger Immutability (Double-Entry Accounting)
Transactional ledgers must provide a complete, unalterable trail audit. Deletes or in-place inline mutations of transaction logs are hard-banned.

* **Immutable Inserts:** Any table containing the suffixes `*_ledger`, `*_balance`, `*_transactions`, or `*_payouts` must be treated as append-only. No `UPDATE` or `DELETE` methods may ever be generated for these entities.
* **Balance Recalculation:** Financial balances must be derived mathematically from the cumulative sum of historical delta lines. Agents must map exact Data Transfer Objects (DTOs) for debits and credits symmetrically. A ledger write that fails to balance out to a verified net sum zero across matching accounts must immediately reject.

---

## 3. PCI-DSS Compliance & Data Tokenization (Zero-Plaintext Policy)
Primary Account Numbers (PAN), Bank Routing/Account Numbers, CVV/CVC, and personal identity credentials (PII) must never sit exposed anywhere within the runtime space, caching layers, or cloud trace logs.

* **Redaction Middleware:** Agents must implement and verify standard format redaction interceptors (`FIRST6-LAST4`, e.g., `411111XXXXXX1111`) across all ingestion, outbound routing, and debugging layers.
* **Log Ingestion Protection:** No raw object dump of payment processing bodies (`FluidPay`, `Stripe`, `NMI`, or `Mastercard Send` payloads) may hit GCP Cloud Logging or standard stdout streams in plaintext. The compilation pipeline will execute an active automated validation script searching for regex strings matching numerical credit sequences and fail the build if any are detected unmasked.
* **Encryption-at-Rest:** Fields containing routing indices, account data, or legal IDs must utilize authenticated AES-256-GCM column-level encryption before persisting to the database layer.

---

## 4. Deterministic Reporting & Banking Cutoffs
Fintech compliance demands temporal consistency. Timezone shifting or irregular system clock calls will break reconciliation records.

* **UTC Synchronization:** The use of arbitrary local environment runtime time calls (such as `new Date()` or local machine system ticks) within transaction capture, settlement engines, or batch engines is banned. All temporal milestones must capture timestamps natively relative to standardized UTC execution nodes.
* **Regulatory Calendars:** Settlement routines (e.g., ACH/Nacha operations or payroll disbursements) must call a distinct regulatory cutoff validation engine to evaluate banking calendar clear delays, federal banking holidays, and weekend settlement processing buffers.

---

## 5. Engineering Quality & Zero-Placeholder Code Enforcements
* **Banned Annotations:** The inclusion of `@ts-ignore`, linter-disabling directives (`/* eslint-disable */`), placeholder parameters, or dangling `// TODO` blocks is entirely prohibited.
* **Closed-Loop Verification Requirement:** Any code alteration written by an agent worker must terminate with an active execution check (`pnpm run lint && pnpm run build && pnpm run test:e2e`) yielding an explicit Exit Code 0 inside the GCP container. If a lint error or test failure persists, the pull request generation step must lock out.

### [SWARM EXECUTION INVARIANTS]
* **Validation:** Verify, never assume. Validate all inputs, reject flawed plans with brutal honesty, and propose optimal fixes.
* **Integrity:** Zero orphaned imports. Update cross-dependencies atomically.
* **Tech Debt:** BANNED: `@ts-ignore`, disabled linters, placeholders, TODOs.
* **Verification Mandate:** Tasks must conclude with CLI-driven proof yielding Exit Code 0.
