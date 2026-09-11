// @PAYMENT_CRITICAL
import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';

// ─── Digital Wallets ──────────────────────────────────────────────────────────
export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id'),
  userId: uuid('user_id').notNull(),
  walletType: varchar('wallet_type', { length: 40 }).default('CONSUMER'), // CONSUMER | MERCHANT | PAYROLL | ESCROW
  currency: varchar('currency', { length: 3 }).default('USD'),
  balanceCents: integer('balance_cents').default(0),
  pendingCents: integer('pending_cents').default(0),
  status: varchar('status', { length: 30 }).default('ACTIVE'), // ACTIVE | FROZEN | CLOSED
  kycStatus: varchar('kyc_status', { length: 30 }).default('PENDING'), // PENDING | APPROVED | REJECTED
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('wallets_tenant_id_idx').on(table.tenantId),
    userIdIdx: index('wallets_user_id_idx').on(table.userId),
  };
});

// ─── Wallet Transactions ──────────────────────────────────────────────────────
// @ARCHITECTURAL_INVARIANT: Ledger entries must be immutable (append-only table schema)
export const wallet_transactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull(),
  userId: uuid('user_id').notNull(),
  debits: integer('debits').notNull().default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision
  credits: integer('credits').notNull().default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision
  currency: varchar('currency', { length: 3 }).default('USD'),
  transactionType: varchar('transaction_type', { length: 50 }).notNull(), // CREDIT | DEBIT | TRANSFER | BNPL_DISBURSE | CRYPTO_CONVERT
  status: varchar('status', { length: 30 }).default('PENDING'), // PENDING | COMPLETED | FAILED | REVERSED
  externalRef: varchar('external_ref', { length: 200 }),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    doubleEntryConstraint: check('debits_eq_credits', sql`debits = credits`)
  };
});

// ─── BNPL Installment Plans ────────────────────────────────────────────────────

