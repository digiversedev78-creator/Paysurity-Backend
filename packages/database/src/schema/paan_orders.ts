import { pgTable, uuid, text, timestamp, integer, jsonb, varchar, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const paanOrders = pgTable('paan_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').notNull(),
  merchantId: text('merchant_id').notNull(),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(), // Assuming a max length for phone numbers
  eventDate: timestamp('event_date', { withTimezone: false }).notNull(), // Stores date and time without timezone info
  quantity: integer('quantity').notNull(),
  paanTypes: jsonb('paan_types').notNull(), // Stores a JSONB object or array for paan types
  depositPct: integer('deposit_pct').notNull().default(25), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  depositAmount: integer('deposit_amount').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  depositPaidAt: timestamp('deposit_paid_at', { withTimezone: true }), // Nullable, as it's set upon payment, with timezone
  status: varchar('status', { length: 50 }).notNull().default('pending'), // E.g., 'pending', 'confirmed', 'completed', 'cancelled'
  notes: text('notes'), // Optional notes, can be null
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    // Indexes for efficient lookups and foreign key equivalents
    tenantIdIdx: index('paan_orders_tenant_id_idx').on(table.tenantId),
    merchantIdIdx: index('paan_orders_merchant_id_idx').on(table.merchantId),
    eventDateIdx: index('paan_orders_event_date_idx').on(table.eventDate),
    // Check constraint for quantity
    quantityCheck: check('paan_orders_quantity_gte_50', sql`${table.quantity} >= 50`),
  };
});

export type PaanOrders = typeof paanOrders.$inferSelect;
export type InsertPaanOrder = typeof paanOrders.$inferInsert;

