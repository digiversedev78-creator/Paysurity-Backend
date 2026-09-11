import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// ─── Vendors / Suppliers ──────────────────────────────────────────────────────
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 200 }),
  email: text('email'),
  phone: varchar('phone', { length: 30 }),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 3 }).default('US'),
  taxId: varchar('tax_id', { length: 100 }),
  paymentTerms: varchar('payment_terms', { length: 50 }).default('NET30'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('vendors_tenant_id_idx').on(table.tenantId),
  };
});

// ─── Vendor Purchase Orders ───────────────────────────────────────────────────
export const vendor_purchase_orders = pgTable('vendor_purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  vendorId: uuid('vendor_id').notNull(),
  poNumber: varchar('po_number', { length: 50 }),
  status: varchar('status', { length: 40 }).default('DRAFT'), // DRAFT | SENT | ACKNOWLEDGED | RECEIVED | CANCELLED
  totalAmount: integer('total_amount'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  currency: varchar('currency', { length: 3 }).default('USD'),
  expectedDelivery: timestamp('expected_delivery'),
  receivedAt: timestamp('received_at'),
  lineItems: jsonb('line_items'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('vendor_purchase_orders_tenant_id_idx').on(table.tenantId),
  };
});

export type Vendor = typeof vendors.$inferSelect;
export type NewVendor = typeof vendors.$inferInsert;
export type VendorPurchaseOrder = typeof vendor_purchase_orders.$inferSelect;

