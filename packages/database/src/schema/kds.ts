import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// ─── KDS Tickets ──────────────────────────────────────────────────────────────
export const kds_tickets = pgTable('kds_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').notNull(),
  orderId: uuid('order_id').notNull(),
  productId: uuid('product_id'),
  tableId: uuid('table_id'),
  quantity: integer('quantity').default(1),
  station: varchar('station', { length: 50 }).default('KITCHEN'), // KITCHEN | BAR | EXPO | GRILL
  status: varchar('status', { length: 30 }).default('PENDING'), // PENDING | PREPARING | READY | SERVED | CANCELLED
  priority: integer('priority').default(3),
  items: jsonb('items'), // Array of line items for this station
  notes: text('notes'),
  estimatedCompletionTime: timestamp('estimated_completion_time'),
  actualCompletionTime: timestamp('actual_completion_time'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('kds_tickets_tenant_id_idx').on(table.tenantId),
  };
});

// ─── KDS Stations ─────────────────────────────────────────────────────────────
export const kds_stations = pgTable('kds_stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: text('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  stationType: varchar('station_type', { length: 50 }).default('KITCHEN'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  categories: jsonb('categories'), // Array of menu categories routed to this station
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('kds_stations_tenant_id_idx').on(table.tenantId),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_KDS_TICKETS = `
ALTER TABLE kds_tickets ENABLE ROW LEVEL SECURITY;
`;
export const RLS_MIGRATION_SQL_KDS_STATIONS = `
ALTER TABLE kds_stations ENABLE ROW LEVEL SECURITY;
`;

export type KdsTicket = typeof kds_tickets.$inferSelect;
export type KdsStation = typeof kds_stations.$inferSelect;

