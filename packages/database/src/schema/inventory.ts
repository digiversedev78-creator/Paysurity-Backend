import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// â”€â”€â”€ Inventory Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const inventory_items = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  warehouseId: uuid('warehouse_id'),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  partnerRefId: varchar('partner_ref_id', { length: 255 }), // EMV L3 Mandatory
  commodityCode: varchar('commodity_code', { length: 100 }), // EMV L3 Mandatory
  productCode: varchar('product_code', { length: 100 }), // EMV L3 Mandatory
  unitCost: integer('unit_cost').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  unitPrice: integer('unit_price').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  quantityOnHand: integer('quantity_on_hand').default(0),
  quantityReserved: integer('quantity_reserved').default(0),
  reorderPoint: integer('reorder_point').default(0),
  reorderQuantity: integer('reorder_quantity').default(0),
  unitOfMeasure: varchar('unit_of_measure', { length: 30 }).default('EACH'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('inventory_items_tenant_id_idx').on(table.tenantId),
  };
});

// â”€â”€â”€ Warehouses / Storage Locations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  address: text('address'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('warehouses_tenant_id_idx').on(table.tenantId),
  };
});

// â”€â”€â”€ Inventory Movements / Ledger â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const inventory_movements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  itemId: uuid('item_id').notNull(),
  warehouseId: uuid('warehouse_id'),
  movementType: varchar('movement_type', { length: 40 }).notNull(), // RECEIPT | SALE | TRANSFER | ADJUSTMENT | RETURN | WASTE
  quantityChange: integer('quantity_change').notNull(),
  unitCost: integer('unit_cost'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  reference: varchar('reference', { length: 100 }), // PO number, order ID, etc.
  notes: text('notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('inventory_movements_tenant_id_idx').on(table.tenantId),
  };
});

export type InventoryItem = typeof inventory_items.$inferSelect;
export type NewInventoryItem = typeof inventory_items.$inferInsert;
export type Warehouse = typeof warehouses.$inferSelect;
export type InventoryMovement = typeof inventory_movements.$inferSelect;

export const purchaseOrders = pgTable('purchase_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    vendorId: uuid('vendor_id').notNull(),
    status: varchar('status', { length: 50 }).default('DRAFT'),
    totalAmount: integer('total_amount').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return { tenantIdIdx: index('purchase_orders_tenant_id_idx').on(table.tenantId) };
});

export const purchaseOrderItems = pgTable('purchase_order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    purchaseOrderId: uuid('purchase_order_id').notNull(),
    itemId: uuid('item_id').notNull(),
    quantity: integer('quantity').default(0),
    unitCost: integer('unit_cost').default(0),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return { tenantIdIdx: index('po_items_tenant_id_idx').on(table.tenantId) };
});
