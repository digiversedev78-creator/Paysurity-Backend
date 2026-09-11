import { pgTable, uuid, integer, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const order_items = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id'),
  productId: uuid('product_id'),
  name: text('name'),
  quantity: integer('quantity').default(1),
  unitPrice: integer('unit_price'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  totalPrice: integer('total_price'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  tenantId: text('tenant_id').notNull(),
}, (table) => {
  return {
    tenantIdIdx: index('order_items_tenant_id_idx').on(table.tenantId),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_ORDER_ITEMS = `
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
`;

export type OrderItem = typeof order_items.$inferSelect;
export type NewOrderItem = typeof order_items.$inferInsert;

