import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// ─── Disputes ─────────────────────────────────────────────────────────────────
export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  transactionId: uuid('transaction_id'),
  customerId: uuid('customer_id'),
  orderId: uuid('order_id'),
  amount: integer('amount').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  currency: varchar('currency', { length: 3 }).default('USD'),
  reason: text('reason').notNull(),
  evidenceUrl: text('evidence_url'),
  status: varchar('status', { length: 50 }).default('PENDING'), // PENDING | UNDER_REVIEW | RESOLVED_MERCHANT | RESOLVED_CUSTOMER | ESCALATED | CLOSED
  resolution: text('resolution'),
  resolvedBy: uuid('resolved_by'),
  resolvedAt: timestamp('resolved_at'),
  chargebackDueDate: timestamp('chargeback_due_date'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('disputes_tenant_id_idx').on(table.tenantId),
  };
});

export type Dispute = typeof disputes.$inferSelect;
export type NewDispute = typeof disputes.$inferInsert;

