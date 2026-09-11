import { pgTable, uuid, varchar, timestamp, decimal, integer, boolean, date } from 'drizzle-orm/pg-core';
export const erpWarehouses = pgTable('erp_warehouses', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    locationType: varchar('location_type', { length: 20 }).notNull().default('INTERNAL'),
    parentId: uuid('parent_id'),
    valuationMethod: varchar('valuation_method', { length: 20 }).notNull().default('STANDARD'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const erpRoutingRules = pgTable('erp_routing_rules', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    action: varchar('action', { length: 20 }).notNull(),
    sourceWhId: uuid('source_wh_id').references(() => erpWarehouses.id),
    destWhId: uuid('dest_wh_id').references(() => erpWarehouses.id),
    triggerCondition: varchar('trigger_condition', { length: 50 }).notNull(),
    delayDays: integer('delay_days').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const erpStockQuants = pgTable('erp_stock_quants', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    productId: uuid('product_id').notNull(),
    warehouseId: uuid('warehouse_id').notNull().references(() => erpWarehouses.id),
    lotNumber: varchar('lot_number', { length: 100 }),
    quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('0'),
    reservedQty: decimal('reserved_qty', { precision: 10, scale: 4 }).notNull().default('0'),
    valueCents: integer('value_cents').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export const erpStockMoves = pgTable('erp_stock_moves', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    productId: uuid('product_id').notNull(),
    sourceWhId: uuid('source_wh_id').notNull().references(() => erpWarehouses.id),
    destWhId: uuid('dest_wh_id').notNull().references(() => erpWarehouses.id),
    quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    orderRefId: uuid('order_ref_id'),
    movedAt: timestamp('moved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const erpAccounts = pgTable('erp_accounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    accountType: varchar('account_type', { length: 30 }).notNull(),
    reconcilable: boolean('reconcilable').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
});
export const erpJournalEntries = pgTable('erp_journal_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    journalType: varchar('journal_type', { length: 20 }).notNull(),
    ref: varchar('ref', { length: 100 }),
    date: date('date').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const erpJournalItems = pgTable('erp_journal_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    entryId: uuid('entry_id').notNull().references(() => erpJournalEntries.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => erpAccounts.id),
    partnerId: uuid('partner_id'),
    name: varchar('name', { length: 255 }).notNull(),
    debitCents: integer('debit_cents').notNull().default(0),
    creditCents: integer('credit_cents').notNull().default(0),
    reconciled: boolean('reconciled').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const erpLandedCosts = pgTable('erp_landed_costs', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    moveId: uuid('move_id').notNull().references(() => erpStockMoves.id),
    splitMethod: varchar('split_method', { length: 30 }).notNull(),
    totalCostCents: integer('total_cost_cents').notNull(),
    costType: varchar('cost_type', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
//# sourceMappingURL=erp.js.map