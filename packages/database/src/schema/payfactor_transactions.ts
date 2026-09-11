import { pgTable, uuid, text, timestamp, jsonb, index, integer } from 'drizzle-orm/pg-core';

export const payfactor_transactions = pgTable('payfactor_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id'),
  merchantId: uuid('merchant_id'),
  amount: integer('amount'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  processorReference: text('processor_reference'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('payfactor_transactions_tenant_id_idx').on(table.tenantId),
  };
});

export type PayfactorTransaction = typeof payfactor_transactions.$inferSelect;
export type NewPayfactorTransaction = typeof payfactor_transactions.$inferInsert;

