# Requirements Traceability Matrix (RTM)

| Requirement ID | Description | Schema Asset | Test Spec | Competitive Status |
|---|---|---|---|---|
| REQ-POSR-001 | Core Order Management | `packages/database/src/schema/pos.ts` | `e2e/pos-order.spec.ts` | COVERED |
| REQ-POSR-002 | KDS Integration | `packages/database/src/schema/kds.ts` | `e2e/pos-order.spec.ts` | COVERED |
| REQ-POSR-011 | Tip Management | `packages/database/src/schema/pos.ts` | `e2e/pos-order.spec.ts` | COVERED |
| REQ-MER-001 | Merchant Application & KYB Flow | `packages/database/src/schema/merchant_applications.ts` | `e2e/auth.spec.ts` | COVERED |
| REQ-WAL-001 | Wallet Lifecycle & Double-Entry Ledger | `packages/database/src/schema/wallets.ts` | `scripts/e2e-wallet-flow.spec.ts` | COVERED |
| REQ-PAY-001 | Payroll Calculation Engine | `packages/database/src/schema/payroll.ts` | `e2e/payroll.spec.ts` | COVERED |
| REQ-SEC-001 | Authentication & JWT Flow | `packages/database/src/schema/security.ts` | `e2e/auth.spec.ts` | COVERED |
| REQ-NFR-009 | Offline POS Operation | `packages/database/src/schema/pos.ts` | `e2e/offline.spec.ts` | GAP_IDENTIFIED (Partial) |
| REQ-GAP-001 | Automated Chargeback Representment | `packages/database/src/schema/disputes.ts` | N/A | GAP_IDENTIFIED |
| REQ-GAP-002 | Native Hardware Terminal Management | N/A | N/A | GAP_IDENTIFIED |
| REQ-GAP-003 | Virtual Card Issuance API | N/A | N/A | GAP_IDENTIFIED |
| REQ-GAP-004 | 3rd Party Delivery Aggregation (Olo/UberEats) | N/A | N/A | GAP_IDENTIFIED |
| REQ-GAP-005 | Native Benefits Administration | N/A | N/A | GAP_IDENTIFIED |
