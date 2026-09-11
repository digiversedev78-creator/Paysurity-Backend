import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';
// ─── Restaurant Tables (Floor Layout) ────────────────────────────────────────
export const tableStatusEnum = pgEnum('table_status', ['AVAILABLE', 'OCCUPIED', 'BILLED', 'CLEANING']);
export const restaurant_tables = pgTable('restaurant_tables', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    locationId: uuid('location_id').notNull(), // Multi-Tenant-Context
    tableNumber: varchar('table_number', { length: 20 }).notNull(),
    sectionId: uuid('section_id'),
    capacity: integer('capacity').default(4),
    status: tableStatusEnum('status').default('AVAILABLE'),
    qrCodeUrl: varchar('qr_code_url', { length: 500 }),
    xCoordinate: integer('x_coordinate').default(0),
    yCoordinate: integer('y_coordinate').default(0),
    shapeType: varchar('shape_type', { length: 20 }).default('rect'), // rect | circle
    width: integer('width').default(80),
    height: integer('height').default(80),
    isActive: boolean('is_active').default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('restaurant_tables_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Floor Sections ───────────────────────────────────────────────────────────
export const floor_sections = pgTable('floor_sections', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    locationId: uuid('location_id').notNull(), // Multi-Tenant-Context
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('floor_sections_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Table Reservations ───────────────────────────────────────────────────────
export const table_reservations = pgTable('table_reservations', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    locationId: uuid('location_id').notNull(), // Multi-Tenant-Context
    tableId: uuid('table_id').notNull(),
    customerId: uuid('customer_id'),
    guestName: varchar('guest_name', { length: 200 }),
    guestPhone: varchar('guest_phone', { length: 30 }),
    partySize: integer('party_size').default(1),
    reservedAt: timestamp('reserved_at').notNull(),
    status: varchar('status', { length: 30 }).default('PENDING'), // PENDING | CONFIRMED | SEATED | COMPLETED | CANCELLED
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('table_reservations_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=restaurant_tables.js.map