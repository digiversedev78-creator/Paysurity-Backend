// @PAYMENT_CRITICAL
import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const orderStatusEnum = pgEnum('order_status', ['OPEN', 'FIRED', 'BILLED', 'PAID', 'CLOSED', 'pending', 'assigned', 'in_transit', 'pending_assignment', 'reassigned']);
export const kdsStatusEnum = pgEnum('kds_status', ['UNFIRED', 'FIRED', 'PREPARING', 'READY', 'VOIDED']);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  driverId: uuid('driver_id'),
  locationId: uuid('location_id'), // Multi-location link
  orderNumber: text('order_number').notNull(),
  status: orderStatusEnum('status').default('OPEN'),
  totalCents: integer('total_cents').default(0),
  subtotalCents: integer('subtotal_cents').default(0),
  taxCents: integer('tax_cents').default(0),
  tipCents: integer('tip_cents').default(0),
  currency: text('currency').default('USD'),
  customerName: text('customer_name'),
  tableNumber: text('table_number'),
  serverName: text('server_name'),

  specialInstructions: text('special_instructions'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('orders_tenant_id_idx').on(table.tenantId),
    locationIdIdx: index('orders_location_id_idx').on(table.locationId),
  };
});

export const order_items = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  menuItemId: uuid('menu_item_id'),
  name: text('name').notNull(),
  quantity: integer('quantity').default(1),
  unitPriceCents: integer('unit_price_cents').default(0),
  totalPriceCents: integer('total_price_cents').default(0),
  specialInstructions: text('special_instructions'),
  kdsStatus: kdsStatusEnum('kds_status').default('UNFIRED'),
  kdsStation: text('kds_station'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('order_items_tenant_id_idx').on(table.tenantId),
  };
});

// Alias for shim compatibility
export const orderItems = order_items;

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  locationId: uuid('location_id'), // Multi-location link
  orderId: uuid('order_id').references(() => orders.id),
  amountCents: integer('amount_cents').notNull(),
  status: text('status').notNull(), // SUCCESS | FAILED | REFUNDED
  paymentMethod: text('payment_method'), // CARD | CASH | WALLET
  gatewayTransactionId: text('gateway_transaction_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('transactions_tenant_id_idx').on(table.tenantId),
  };
});

export const cash_drawers = pgTable('cash_drawers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  status: text('status').default('CLOSED'), // OPEN | CLOSED
  startingBalanceCents: integer('starting_balance_cents').default(0),
  currentBalanceCents: integer('current_balance_cents').default(0),
  openedBy: uuid('opened_by'),
  closedBy: uuid('closed_by'),
  openedAt: timestamp('opened_at'),
  closedAt: timestamp('closed_at'),
}, (table) => {
  return {
    tenantIdIdx: index('cash_drawers_tenant_id_idx').on(table.tenantId),
  };
});

export const cashDrawers = cash_drawers;

export const cash_drawer_transactions = pgTable('cash_drawer_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  drawerId: uuid('drawer_id').notNull().references(() => cash_drawers.id),
  type: text('type').notNull(), // IN | OUT
  amountCents: integer('amount_cents').notNull(),
  reason: text('reason'),
  performedBy: uuid('performed_by'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cashDrawerTransactions = cash_drawer_transactions;

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof order_items.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type CashDrawer = typeof cash_drawers.$inferSelect;

