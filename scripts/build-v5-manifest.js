#!/usr/bin/env node
/**
 * build-v5-manifest.js
 * Generates REQUIREMENTS_V5_MANIFEST.json covering ALL 332 canonical requirements:
 * - 164 already in v4 manifest (150 DONE + 14 ERROR → retry all)
 * - ~168 not yet in any manifest (new verticals: AGG, API, FAC, FRN, MOB, NFR, etc.)
 * Assigns each to a worker pool (A–H) for the GCP swarm build.
 */
'use strict';

// ── Full canonical requirement set ───────────────────────────────────────
// Each entry: { id, title, file, module, priority, test_scenarios }
const ALL_REQUIREMENTS = [

  // ── ORC — Payment Orchestration (12 reqs) ──────────────────────────────
  { id:'ORC-001', title:'Create Payment Intent',              file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:6 },
  { id:'ORC-002', title:'Capture Payment',                    file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:4 },
  { id:'ORC-003', title:'Authorize & Hold (Pre-Auth)',        file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:5 },
  { id:'ORC-004', title:'Void / Cancel Payment',              file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:4 },
  { id:'ORC-005', title:'Idempotent Retries',                 file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:6 },
  { id:'ORC-006', title:'Refund Processing',                  file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:5 },
  { id:'ORC-007', title:'Dispute (Chargeback) Lifecycle',     file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:6 },
  { id:'ORC-008', title:'Payment Webhooks',                   file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P1', tests:5 },
  { id:'ORC-009', title:'Daily Settlement Processing',        file:'ORC_PAYMENT_ORCHESTRATION.md', module:'settlement',          priority:'P0', tests:5 },
  { id:'ORC-010', title:'Multi-Tender Payments',              file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:5 },
  { id:'ORC-011', title:'Gateway Failover',                   file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P0', tests:4 },
  { id:'ORC-012', title:'FluidPay Error Code Mapping',        file:'ORC_PAYMENT_ORCHESTRATION.md', module:'payment',             priority:'P1', tests:4 },
  { id:'ORC-013', title:'Tip Adjustment Post-Auth',           file:'GAP_FILL_ADDENDUM.md',          module:'payment',             priority:'P0', tests:4 },
  { id:'ORC-014', title:'Offline POS Payment Queue',          file:'GAP_FILL_ADDENDUM.md',          module:'payment',             priority:'P0', tests:5 },
  { id:'ORC-015', title:'Cash Drawer Open Control',           file:'GAP_FILL_ADDENDUM.md',          module:'payment',             priority:'P1', tests:3 },
  { id:'ORC-016', title:'Void Transaction (same-day)',        file:'GAP_FILL_ADDENDUM.md',          module:'payment',             priority:'P0', tests:4 },

  // ── TAX — Sales Tax Engine (6 reqs) ────────────────────────────────────
  { id:'TAX-001', title:'Real-Time Tax Rate Lookup',          file:'TAX_ENGINE.md', module:'tax',                                priority:'P0', tests:5 },
  { id:'TAX-002', title:'Tax Exemption Management',           file:'TAX_ENGINE.md', module:'tax',                                priority:'P0', tests:4 },
  { id:'TAX-003', title:'EBT / SNAP-Eligible Items',          file:'TAX_ENGINE.md', module:'tax',                                priority:'P0', tests:5 },
  { id:'TAX-004', title:'Multi-State Tax Nexus',              file:'TAX_ENGINE.md', module:'tax',                                priority:'P1', tests:4 },
  { id:'TAX-005', title:'Tax Report Export',                  file:'TAX_ENGINE.md', module:'tax',                                priority:'P1', tests:3 },
  { id:'TAX-006', title:'FDA Tobacco Age Verification',       file:'TAX_ENGINE.md', module:'tax',                                priority:'P1', tests:4 },

  // ── SEC — Security & Privacy (10 reqs) ─────────────────────────────────
  { id:'SEC-001', title:'Auth Login / Logout',                file:'SEC_SECURITY_PRIVACY.md', module:'auth',                     priority:'P0', tests:6 },
  { id:'SEC-002', title:'MFA Enrollment & Verification',      file:'SEC_SECURITY_PRIVACY.md', module:'auth',                     priority:'P0', tests:6 },
  { id:'SEC-003', title:'JWT Rotation & Revocation',          file:'SEC_SECURITY_PRIVACY.md', module:'auth',                     priority:'P0', tests:5 },
  { id:'SEC-004', title:'RBAC Enforcement',                   file:'SEC_SECURITY_PRIVACY.md', module:'auth',                     priority:'P0', tests:6 },
  { id:'SEC-005', title:'Secrets Vault Integration',          file:'SEC_SECURITY_PRIVACY.md', module:'secrets',                  priority:'P0', tests:4 },
  { id:'SEC-006', title:'Audit Log (Append-Only)',            file:'SEC_SECURITY_PRIVACY.md', module:'audit',                    priority:'P0', tests:5 },
  { id:'SEC-007', title:'Rate Limiting & DDoS Protection',   file:'SEC_SECURITY_PRIVACY.md', module:'security',                 priority:'P0', tests:4 },
  { id:'SEC-008', title:'API Key Management',                 file:'SEC_SECURITY_PRIVACY.md', module:'apikeys',                  priority:'P1', tests:4 },
  { id:'SEC-009', title:'PCI SAQ-A Compliance Controls',     file:'SEC_SECURITY_PRIVACY.md', module:'compliance',               priority:'P0', tests:4 },
  { id:'SEC-010', title:'Data Encryption at Rest & Transit', file:'SEC_SECURITY_PRIVACY.md', module:'security',                 priority:'P0', tests:4 },

  // ── COM — Compliance & Legal (14 reqs) ─────────────────────────────────
  { id:'COM-001', title:'PCI DSS Scope Reduction',            file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P0', tests:4 },
  { id:'COM-002', title:'TCPA Consent Management',            file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P0', tests:5 },
  { id:'COM-003', title:'CAN-SPAM Email Compliance',          file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P1', tests:3 },
  { id:'COM-004', title:'ADA / WCAG 2.1 AA',                  file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P1', tests:3 },
  { id:'COM-005', title:'CCPA Data Rights (Delete/Export)',   file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P0', tests:5 },
  { id:'COM-006', title:'GDPR Data Processing Records',       file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P1', tests:4 },
  { id:'COM-007', title:'Regulatory Reporting Exports',       file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P1', tests:3 },
  { id:'COM-008', title:'Terms & Privacy Versioning',         file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P1', tests:3 },
  { id:'COM-009', title:'Dispute Evidence Package',           file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P0', tests:4 },
  { id:'COM-010', title:'OFAC / Sanctions Screening',         file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P0', tests:5 },
  { id:'COM-011', title:'Anti-Money Laundering (AML)',        file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P0', tests:5 },
  { id:'COM-012', title:'SOC 2 Evidence Collection',          file:'COM_COMPLIANCE_LEGAL.md', module:'compliance',               priority:'P1', tests:3 },
  { id:'COM-013', title:'Accounting Export (GL)',             file:'GAP_FILL_ADDENDUM.md',    module:'compliance',               priority:'P1', tests:3 },
  { id:'COM-014', title:'Data Portability Export',            file:'GAP_FILL_ADDENDUM.md',    module:'compliance',               priority:'P1', tests:3 },

  // ── POSR — Restaurant POS (12 reqs) ────────────────────────────────────
  { id:'POSR-001', title:'Menu Management & Item CRUD',        file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:5 },
  { id:'POSR-002', title:'Table Management & Floor Plan',      file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:5 },
  { id:'POSR-003', title:'Order Entry & Modifiers',            file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:6 },
  { id:'POSR-004', title:'Kitchen Display System (KDS)',       file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:5 },
  { id:'POSR-005', title:'Split Bill & Seat-Level Payment',    file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:5 },
  { id:'POSR-006', title:'Tip Processing & Pooling',           file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:5 },
  { id:'POSR-007', title:'Online Ordering Integration',        file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P1', tests:4 },
  { id:'POSR-008', title:'Reservation & Wait List',            file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P1', tests:4 },
  { id:'POSR-009', title:'End-of-Day Z-Report',               file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P0', tests:4 },
  { id:'POSR-010', title:'Loyalty Points at POS Checkout',    file:'POSR_POS_RESTAURANT.md', module:'restaurant',               priority:'P1', tests:4 },
  { id:'POSR-011', title:'Email Receipt Generation',          file:'GAP_FILL_ADDENDUM.md',   module:'restaurant',               priority:'P1', tests:3 },
  { id:'POSR-012', title:'Table Status Real-Time WebSocket',  file:'GAP_FILL_ADDENDUM.md',   module:'restaurant',               priority:'P1', tests:3 },

  // ── POSG — Grocery POS (15 reqs) ───────────────────────────────────────
  { id:'POSG-001', title:'Barcode / PLU Scanning',             file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:5 },
  { id:'POSG-002', title:'WIC / EBT Tender Types',             file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:6 },
  { id:'POSG-003', title:'Produce Scale Integration',          file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:5 },
  { id:'POSG-004', title:'Inventory Count & Shrink',           file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:5 },
  { id:'POSG-005', title:'Price Override & Markdown',          file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:4 },
  { id:'POSG-006', title:'Coupon & Promotional Pricing',       file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:5 },
  { id:'POSG-007', title:'Multi-Tender Split Payment',         file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:5 },
  { id:'POSG-008', title:'Age Verification (Tobacco/Alcohol)', file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:5 },
  { id:'POSG-009', title:'Self-Checkout Queue Management',     file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P1', tests:4 },
  { id:'POSG-010', title:'Vendor Purchase Orders',             file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P1', tests:4 },
  { id:'POSG-011', title:'Loyalty Points — Grocery',           file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P1', tests:3 },
  { id:'POSG-012', title:'Scale Device Driver (Serial/USB)',   file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:4 },
  { id:'POSG-013', title:'Item Substitution & Out-of-Stock',  file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P1', tests:3 },
  { id:'POSG-014', title:'Cash Accounting & Safe Drop',       file:'POSG_POS_GROCERY.md', module:'grocery',                    priority:'P0', tests:4 },
  { id:'POSG-015', title:'i18n / Multi-Language UI Stub',     file:'GAP_FILL_ADDENDUM.md', module:'grocery',                    priority:'P2', tests:2 },

  // ── POS — Retail POS (12 reqs) ─────────────────────────────────────────
  { id:'POS-001', title:'Product Catalog & Variants',          file:'POS_RETAIL.md', module:'retail',                           priority:'P0', tests:5 },
  { id:'POS-002', title:'Barcode Scanning & RFID',             file:'POS_RETAIL.md', module:'retail',                           priority:'P0', tests:4 },
  { id:'POS-003', title:'Customer Order History at POS',       file:'POS_RETAIL.md', module:'retail',                           priority:'P1', tests:3 },
  { id:'POS-004', title:'Returns & Exchange Workflow',         file:'POS_RETAIL.md', module:'retail',                           priority:'P0', tests:5 },
  { id:'POS-005', title:'Layaway & Store Credit',              file:'POS_RETAIL.md', module:'retail',                           priority:'P1', tests:4 },
  { id:'POS-006', title:'Gift Card Issuance & Redemption',     file:'POS_RETAIL.md', module:'retail',                           priority:'P0', tests:5 },
  { id:'POS-007', title:'Inventory Reorder Alerts',            file:'POS_RETAIL.md', module:'retail',                           priority:'P1', tests:3 },
  { id:'POS-008', title:'Multi-Location Stock Transfer',       file:'POS_RETAIL.md', module:'retail',                           priority:'P1', tests:4 },
  { id:'POS-009', title:'End-of-Day Z-Report (Retail)',        file:'POS_RETAIL.md', module:'retail',                           priority:'P0', tests:4 },
  { id:'POS-010', title:'Receipt Email / SMS',                 file:'GAP_FILL_ADDENDUM.md', module:'retail',                    priority:'P1', tests:3 },
  { id:'POS-011', title:'Drawer Open / Cash Count',            file:'GAP_FILL_ADDENDUM.md', module:'retail',                    priority:'P1', tests:3 },
  { id:'POS-012', title:'Offline Mode Sync Queue',             file:'GAP_FILL_ADDENDUM.md', module:'retail',                    priority:'P0', tests:4 },

  // ── WAL — Digital Wallets (8 reqs) ─────────────────────────────────────
  { id:'WAL-001', title:'Wallet Creation & Activation',        file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P0', tests:5 },
  { id:'WAL-002', title:'Wallet Top-Up (ACH / Card)',          file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P0', tests:5 },
  { id:'WAL-003', title:'Wallet-to-Wallet Transfer',           file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P0', tests:5 },
  { id:'WAL-004', title:'Wallet Balance & Statement',          file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P0', tests:4 },
  { id:'WAL-005', title:'Wallet-to-Bank Withdrawal',           file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P0', tests:4 },
  { id:'WAL-006', title:'Wallet Freeze & Dispute Hold',        file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P0', tests:4 },
  { id:'WAL-007', title:'Wallet Push Notification',            file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P1', tests:3 },
  { id:'WAL-008', title:'Wallet Spend Analytics',              file:'WAL_DIGITAL_WALLETS.md', module:'wallet',                  priority:'P1', tests:3 },

  // ── PAY — Payroll & HR (9 reqs) ────────────────────────────────────────
  { id:'PAY-001', title:'Employee Onboarding (W-4/I-9)',       file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P0', tests:5 },
  { id:'PAY-002', title:'Payroll Run & Calculation',           file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P0', tests:6 },
  { id:'PAY-003', title:'Direct Deposit ACH Processing',       file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P0', tests:5 },
  { id:'PAY-004', title:'Tax Withholding & Filing',            file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P0', tests:5 },
  { id:'PAY-005', title:'PTO / Sick Leave Accrual',            file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P1', tests:4 },
  { id:'PAY-006', title:'Payroll Reports & W-2 Export',        file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P0', tests:4 },
  { id:'PAY-007', title:'Contractor 1099 Payments',            file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P1', tests:4 },
  { id:'PAY-008', title:'Tip Allocation to Payroll',           file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P0', tests:4 },
  { id:'PAY-009', title:'Benefits & Deductions Management',    file:'PAY_PAYROLL.md', module:'payroll',                         priority:'P1', tests:3 },

  // ── SUB — Subscriptions (6 reqs) ───────────────────────────────────────
  { id:'SUB-001', title:'Subscription Plan Management',        file:'SUB_SUBSCRIPTION_BILLING.md', module:'subscription',       priority:'P0', tests:5 },
  { id:'SUB-002', title:'Recurring Billing Engine',            file:'SUB_SUBSCRIPTION_BILLING.md', module:'subscription',       priority:'P0', tests:6 },
  { id:'SUB-003', title:'Dunning & Failed Payment Retry',      file:'SUB_SUBSCRIPTION_BILLING.md', module:'subscription',       priority:'P0', tests:5 },
  { id:'SUB-004', title:'Proration on Plan Change',            file:'SUB_SUBSCRIPTION_BILLING.md', module:'subscription',       priority:'P0', tests:4 },
  { id:'SUB-005', title:'Subscription Pause & Cancel',         file:'SUB_SUBSCRIPTION_BILLING.md', module:'subscription',       priority:'P0', tests:4 },
  { id:'SUB-006', title:'Usage-Based Billing',                 file:'SUB_SUBSCRIPTION_BILLING.md', module:'subscription',       priority:'P1', tests:4 },

  // ── LOY — Loyalty Engine (7 reqs) ──────────────────────────────────────
  { id:'LOY-001', title:'Points Earn on Purchase',             file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P0', tests:5 },
  { id:'LOY-002', title:'Points Redemption at Checkout',       file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P0', tests:5 },
  { id:'LOY-003', title:'Tier Management (Bronze/Silver/Gold)',file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P1', tests:4 },
  { id:'LOY-004', title:'Referral Bonus Engine',               file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P1', tests:4 },
  { id:'LOY-005', title:'Points Expiry Rules',                 file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P1', tests:4 },
  { id:'LOY-006', title:'Campaign & Multiplier Events',        file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P1', tests:4 },
  { id:'LOY-007', title:'Loyalty Fraud Detection',             file:'LOY_LOYALTY_ENGINE.md', module:'loyalty',                  priority:'P0', tests:5 },

  // ── MER — Merchant Onboarding (12 reqs) ────────────────────────────────
  { id:'MER-001', title:'Merchant Application & KYB',          file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:6 },
  { id:'MER-002', title:'KYB Document Upload & Verify',        file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:5 },
  { id:'MER-003', title:'FluidPay Account Provisioning',       file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:5 },
  { id:'MER-004', title:'Merchant Dashboard & Reports',        file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:4 },
  { id:'MER-005', title:'Merchant Fee Schedule Management',    file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:4 },
  { id:'MER-006', title:'Update Business Information',         file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P1', tests:4 },
  { id:'MER-007', title:'Merchant Status & Suspension',        file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:4 },
  { id:'MER-008', title:'Merchant Settlement Reports',         file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:4 },
  { id:'MER-009', title:'Chargeback Notification to Merchant', file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P0', tests:4 },
  { id:'MER-010', title:'Merchant API Key Provisioning',       file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P1', tests:3 },
  { id:'MER-011', title:'Multi-Location Merchant Setup',       file:'MER_MERCHANT_SERVICES_ONBOARDING.md', module:'merchant',   priority:'P1', tests:4 },
  { id:'MER-012', title:'Merchant Onboarding Webhook Events',  file:'GAP_FILL_ADDENDUM.md',                module:'merchant',   priority:'P1', tests:3 },

  // ── AFR — Affiliates & Resellers (10 reqs) ─────────────────────────────
  { id:'AFR-001', title:'Reseller Application & Approval',     file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P0', tests:5 },
  { id:'AFR-002', title:'Revenue Share Calculation',           file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P0', tests:5 },
  { id:'AFR-003', title:'Commission Payout Processing',        file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P0', tests:5 },
  { id:'AFR-004', title:'Reseller Sub-Merchant Management',    file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P0', tests:4 },
  { id:'AFR-005', title:'Affiliate Link & Referral Tracking',  file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P1', tests:4 },
  { id:'AFR-006', title:'Reseller Dashboard & Analytics',      file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P1', tests:3 },
  { id:'AFR-007', title:'Co-Branded Portal Configuration',     file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P1', tests:3 },
  { id:'AFR-008', title:'Custom Rate Schedules per Reseller',  file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P1', tests:4 },
  { id:'AFR-009', title:'Reseller Tier Promotions',            file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P2', tests:3 },
  { id:'AFR-010', title:'Affiliate Fraud Detection',           file:'AFR_AFFILIATES_RESELLERS.md', module:'affiliates',         priority:'P0', tests:4 },

  // ── ECO — E-Commerce (8 reqs) ──────────────────────────────────────────
  { id:'ECO-001', title:'Product Storefront Creation',         file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P0', tests:4 },
  { id:'ECO-002', title:'Shopping Cart & Checkout Flow',       file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P0', tests:6 },
  { id:'ECO-003', title:'Order Management & Fulfillment',      file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P0', tests:5 },
  { id:'ECO-004', title:'E-Commerce Payment Processing',       file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P0', tests:5 },
  { id:'ECO-005', title:'Inventory Sync (POS ↔ Online)',       file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P0', tests:4 },
  { id:'ECO-006', title:'Abandoned Cart Recovery',             file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P1', tests:3 },
  { id:'ECO-007', title:'Product Reviews & Ratings',           file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P2', tests:3 },
  { id:'ECO-008', title:'Digital Product Delivery',            file:'ECO_ECOMMERCE.md', module:'ecommerce',                     priority:'P1', tests:3 },

  // ── NOT — Notifications (6 reqs) ───────────────────────────────────────
  { id:'NOT-001', title:'Transactional Email (SendGrid)',       file:'NOT_NOTIFICATION_ENGINE.md', module:'notifications',       priority:'P0', tests:5 },
  { id:'NOT-002', title:'SMS Notifications (Twilio)',          file:'NOT_NOTIFICATION_ENGINE.md', module:'notifications',       priority:'P0', tests:5 },
  { id:'NOT-003', title:'Push Notifications (Expo)',           file:'NOT_NOTIFICATION_ENGINE.md', module:'notifications',       priority:'P1', tests:4 },
  { id:'NOT-004', title:'TCPA Consent & Opt-Out',              file:'NOT_NOTIFICATION_ENGINE.md', module:'notifications',       priority:'P0', tests:5 },
  { id:'NOT-005', title:'Notification Templates & Versioning', file:'NOT_NOTIFICATION_ENGINE.md', module:'notifications',       priority:'P1', tests:3 },
  { id:'NOT-006', title:'Notification Delivery Retry',         file:'NOT_NOTIFICATION_ENGINE.md', module:'notifications',       priority:'P1', tests:3 },

  // ── OPS — Operations (6 reqs) ──────────────────────────────────────────
  { id:'OPS-001', title:'Operations Metrics Dashboard',         file:'OPS_MANAGEMENT.md', module:'operations',                  priority:'P0', tests:4 },
  { id:'OPS-002', title:'Alerting & Incident Engine',           file:'OPS_MANAGEMENT.md', module:'operations',                  priority:'P0', tests:5 },
  { id:'OPS-003', title:'AI Operations Briefing',               file:'OPS_MANAGEMENT.md', module:'operations',                  priority:'P1', tests:4 },
  { id:'OPS-004', title:'Health Check & Readiness Probe',       file:'OPS_MANAGEMENT.md', module:'operations',                  priority:'P0', tests:3 },
  { id:'OPS-005', title:'Runbook Automation',                   file:'OPS_MANAGEMENT.md', module:'operations',                  priority:'P1', tests:3 },
  { id:'OPS-006', title:'Cost Attribution & Billing Alerts',   file:'OPS_MANAGEMENT.md', module:'operations',                  priority:'P1', tests:3 },

  // ── AGG — Order Aggregation (7 reqs) ───────────────────────────────────
  { id:'AGG-001', title:'DoorDash Order Ingestion',             file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P0', tests:5 },
  { id:'AGG-002', title:'UberEats Order Ingestion',             file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P0', tests:5 },
  { id:'AGG-003', title:'GrubHub Order Ingestion',              file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P0', tests:5 },
  { id:'AGG-004', title:'Aggregator Menu Sync',                 file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P0', tests:4 },
  { id:'AGG-005', title:'Aggregator Order Status Webhook',     file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P0', tests:4 },
  { id:'AGG-006', title:'Aggregator Payout Reconciliation',    file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P1', tests:4 },
  { id:'AGG-007', title:'Cancelled Order Handling',            file:'AGG_ORDER_AGGREGATION.md', module:'aggregation',           priority:'P0', tests:4 },

  // ── API — Developer API Platform (8 reqs) ──────────────────────────────
  { id:'API-001', title:'API Key Issuance & Scoping',           file:'API_PLATFORM.md', module:'api-platform',                  priority:'P0', tests:5 },
  { id:'API-002', title:'Rate Limiting & Throttling',           file:'API_PLATFORM.md', module:'api-platform',                  priority:'P0', tests:4 },
  { id:'API-003', title:'Webhook Registration & Management',   file:'API_PLATFORM.md', module:'api-platform',                  priority:'P0', tests:5 },
  { id:'API-004', title:'API Versioning Strategy',              file:'API_PLATFORM.md', module:'api-platform',                  priority:'P0', tests:3 },
  { id:'API-005', title:'API Request Logging & Replay',         file:'API_PLATFORM.md', module:'api-platform',                  priority:'P1', tests:4 },
  { id:'API-006', title:'SDK Generation',                       file:'API_PLATFORM.md', module:'api-platform',                  priority:'P2', tests:2 },
  { id:'API-007', title:'Sandbox Environment Management',      file:'API_PLATFORM.md', module:'api-platform',                  priority:'P0', tests:3 },
  { id:'API-008', title:'OAuth 2.0 Client Credentials Grant',  file:'API_PLATFORM.md', module:'api-platform',                  priority:'P0', tests:5 },

  // ── NFR — Non-Functional Requirements (8 reqs) ─────────────────────────
  { id:'NFR-001', title:'99.9% Uptime SLA',                    file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P0', tests:3 },
  { id:'NFR-002', title:'p95 < 300ms API Latency',             file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P0', tests:4 },
  { id:'NFR-003', title:'Database Backup & DR (RPO 1h)',       file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P0', tests:4 },
  { id:'NFR-004', title:'Horizontal Auto-Scaling',             file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P0', tests:3 },
  { id:'NFR-005', title:'Zero-Downtime Deployments',           file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P0', tests:3 },
  { id:'NFR-006', title:'Multi-Region Failover',               file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P1', tests:3 },
  { id:'NFR-007', title:'Load Testing & Benchmarking',         file:'NFR_PLATFORM_NONFUNCTIONAL.md', module:'platform',         priority:'P1', tests:3 },
  { id:'NFR-008', title:'Observability: Tracing, Metrics, Logs',file:'NFR_PLATFORM_NONFUNCTIONAL.md',module:'platform',         priority:'P0', tests:4 },
  { id:'NFR-009', title:'Multi-Tender Gateway Recovery',       file:'GAP_FILL_ADDENDUM.md',          module:'platform',         priority:'P0', tests:4 },
  { id:'NFR-010', title:'PCI Audit Trail Completeness',        file:'GAP_FILL_ADDENDUM.md',          module:'platform',         priority:'P0', tests:3 },

  // ── FRN — Franchise Management (12 reqs) ───────────────────────────────
  { id:'FRN-001', title:'Franchise Network Setup',              file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:4 },
  { id:'FRN-002', title:'Brand Config & White-Label Portal',   file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:4 },
  { id:'FRN-003', title:'Franchisee Onboarding Workflow',      file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:5 },
  { id:'FRN-004', title:'Royalty & Fee Collection Engine',     file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:5 },
  { id:'FRN-005', title:'Corporate vs Franchisee P&L Split',  file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:4 },
  { id:'FRN-006', title:'Centralized Menu Management',         file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:4 },
  { id:'FRN-007', title:'Cross-Location Reporting',            file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:4 },
  { id:'FRN-008', title:'Franchisor Compliance Monitoring',   file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P0', tests:4 },
  { id:'FRN-009', title:'Gift Card Network (Multi-Brand)',     file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P1', tests:4 },
  { id:'FRN-010', title:'Franchise Agreement Document Store', file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P1', tests:3 },
  { id:'FRN-011', title:'Franchise Performance Benchmarking', file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P1', tests:3 },
  { id:'FRN-012', title:'Franchise Tier Pricing Overrides',   file:'FRN_FRANCHISE_MANAGEMENT.md', module:'franchise',          priority:'P1', tests:3 },

  // ── AI — AI Experience (7 reqs) ────────────────────────────────────────
  { id:'AI-001', title:'AI Upsell Engine',                     file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P1', tests:5 },
  { id:'AI-002', title:'AI Chat / Virtual Assistant',          file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P1', tests:5 },
  { id:'AI-003', title:'AI Session Replay & Analytics',        file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P1', tests:4 },
  { id:'AI-004', title:'AI Sentiment Analysis',                file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P2', tests:3 },
  { id:'AI-005', title:'Menu Optimization AI',                 file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P1', tests:4 },
  { id:'AI-006', title:'Anomaly Detection Alerts',             file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P1', tests:4 },
  { id:'AI-007', title:'AI-Powered Fraud Scoring',             file:'AI_EXPERIENCE.md', module:'ai',                            priority:'P0', tests:5 },

  // ── MOB/SAV — Mobile & SAV Estimator (11 reqs) ─────────────────────────
  { id:'MOB-001', title:'Consumer Mobile App Auth',             file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'mobile',         priority:'P0', tests:5 },
  { id:'MOB-002', title:'Merchant Mobile POS App',              file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'mobile',         priority:'P0', tests:5 },
  { id:'MOB-003', title:'Mobile Payment (NFC/QR)',              file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'mobile',         priority:'P0', tests:5 },
  { id:'MOB-004', title:'Offline Mode (Mobile POS)',            file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'mobile',         priority:'P0', tests:4 },
  { id:'MOB-005', title:'Push Notification (Mobile)',           file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'mobile',         priority:'P1', tests:3 },
  { id:'MOB-006', title:'Biometric Auth (FaceID/TouchID)',      file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'mobile',         priority:'P0', tests:4 },
  { id:'SAV-001', title:'SAV Savings Estimator Tool',           file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'estimator',      priority:'P1', tests:3 },
  { id:'SAV-002', title:'SAV Lead Capture Form',                file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'estimator',      priority:'P1', tests:3 },
  { id:'SAV-003', title:'SAV Report PDF Generation',            file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'estimator',      priority:'P1', tests:3 },
  { id:'SAV-004', title:'SAV CRM Integration',                  file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'estimator',      priority:'P1', tests:3 },
  { id:'SAV-005', title:'SAV Sales Team Dashboard',             file:'MOB_MOBILE_AND_SAV_ESTIMATOR.md', module:'estimator',      priority:'P1', tests:3 },

  // ── WEB — Public Website (9 reqs) ──────────────────────────────────────
  { id:'WEB-001', title:'Public Marketing Homepage',            file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P0', tests:3 },
  { id:'WEB-002', title:'Product / Vertical Pages',             file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P0', tests:3 },
  { id:'WEB-003', title:'Pricing Page',                         file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P0', tests:3 },
  { id:'WEB-004', title:'Contact / Demo Request Form',          file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P0', tests:3 },
  { id:'WEB-005', title:'Blog & Resource Center',               file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P1', tests:2 },
  { id:'WEB-006', title:'SEO & Schema Markup',                  file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P1', tests:2 },
  { id:'WEB-007', title:'Cookie Consent Banner',                file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P0', tests:3 },
  { id:'WEB-008', title:'PayFactor Landing Page',               file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P0', tests:3 },
  { id:'WEB-009', title:'Trust & Security Page',                file:'WEB_PUBLIC_WEBSITE.md', module:'website',                  priority:'P1', tests:2 },

  // ── FAC — PayFactor / Freight Load Factoring (7 reqs) ──────────────────
  { id:'FAC-001', title:'Driver Enrollment & KYC',              file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P0', tests:6 },
  { id:'FAC-002', title:'Upfront Escrow Deposit',               file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P0', tests:6 },
  { id:'FAC-003', title:'Advance Release — POP Green Signal',   file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P0', tests:6 },
  { id:'FAC-004', title:'Settlement Release — Due-Date Signal', file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P0', tests:5 },
  { id:'FAC-005', title:'PayFactor Application Page',           file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P0', tests:4 },
  { id:'FAC-006', title:'AELS Webhook Notification System',     file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P1', tests:4 },
  { id:'FAC-007', title:'PayFactor Risk & Escrow Integrity',    file:'FAC_FREIGHT_LOAD_FACTORING.md', module:'pay-factor',       priority:'P0', tests:6 },

];

// ── Worker pool assignment (8 workers, ~42 reqs each) ───────────────────
const WORKERS = {
  A: { name:'Core Payments & Tax',       domains:['ORC','TAX'],         peer_reviewer:'B' },
  B: { name:'Security & Compliance',     domains:['SEC','COM'],         peer_reviewer:'A' },
  C: { name:'Restaurant & Grocery POS',  domains:['POSR','POSG'],       peer_reviewer:'D' },
  D: { name:'Retail POS & Wallets',      domains:['POS','WAL'],         peer_reviewer:'C' },
  E: { name:'Payroll, Sub & Loyalty',    domains:['PAY','SUB','LOY'],   peer_reviewer:'F' },
  F: { name:'Merchant & Affiliates',     domains:['MER','AFR','ECO'],   peer_reviewer:'E' },
  G: { name:'Platform & Enterprise',     domains:['NOT','OPS','AGG','API','NFR','FRN'], peer_reviewer:'H' },
  H: { name:'AI, Mobile, Web & PayFactor', domains:['AI','MOB','SAV','WEB','FAC'], peer_reviewer:'G' },
};

// Assign each requirement to a worker based on its domain prefix
function assignWorker(id) {
  const prefix = id.replace(/-\d+$/, '');
  for (const [wKey, w] of Object.entries(WORKERS)) {
    if (w.domains.includes(prefix)) return wKey;
  }
  return 'G'; // fallback
}

const now = new Date().toISOString();
const manifest = {
  version: '5.0',
  project: 'paysurity-platform-2026',
  generated_at: now,
  total_requirements: ALL_REQUIREMENTS.length,
  total_test_scenarios: ALL_REQUIREMENTS.reduce((acc, r) => acc + r.tests, 0),
  gap_fill_applied: true,
  payfactor_added: true,
  workers: {},
};

for (const [wKey, wConfig] of Object.entries(WORKERS)) {
  manifest.workers[wKey] = {
    name: wConfig.name,
    domains: wConfig.domains,
    peer_reviewer: wConfig.peer_reviewer,
    requirements: [],
  };
}

for (const req of ALL_REQUIREMENTS) {
  const wKey = assignWorker(req.id);
  manifest.workers[wKey].requirements.push({
    id: req.id,
    title: req.title,
    file: `Requirements/Canonical/${req.file}`,
    module: req.module,
    status: 'NOT_STARTED',
    test_scenarios: req.tests,
    priority: req.priority,
    generated_files: [],
  });
}

// Summary
for (const [wKey, w] of Object.entries(manifest.workers)) {
  const count = w.requirements.length;
  process.stderr.write(`Worker ${wKey} (${w.name}): ${count} requirements\n`);
}
process.stderr.write(`\nTotal: ${ALL_REQUIREMENTS.length} requirements, ${manifest.total_test_scenarios} test scenarios\n`);

process.stdout.write(JSON.stringify(manifest, null, 2));
