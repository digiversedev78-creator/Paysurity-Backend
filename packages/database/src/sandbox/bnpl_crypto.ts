import { wallets, wallet_transactions } from '../schema/wallets';
import { pgTable, uuid, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const bnpl_plans = pgTable('bnpl_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull(),
  userId: uuid('user_id').notNull(),
  totalAmount: integer('total_amount').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  installmentCount: integer('installment_count').default(4),
  installmentAmount: integer('installment_amount').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  paidInstallments: integer('paid_installments').default(0),
  status: varchar('status', { length: 30 }).default('ACTIVE'), // ACTIVE | COMPLETED | DEFAULTED | CANCELLED
  originOrderId: uuid('origin_order_id'),
  nextPaymentDate: timestamp('next_payment_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
export type WalletTransaction = typeof wallet_transactions.$inferSelect;
export type BnplPlan = typeof bnpl_plans.$inferSelect;
