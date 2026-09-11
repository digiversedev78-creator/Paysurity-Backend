import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const DrizzleSchema = pgTable('payments', {
  id: text('id').primaryKey(),
  amount: text('amount').notNull(),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isRefunded: boolean('is_refunded').default(false).notNull(),
});
