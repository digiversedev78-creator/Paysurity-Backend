import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  name: varchar('name', { length: 500 }).notNull(),
  description: text('description'),
  categoryId: uuid('category_id'),
  storeId: uuid('store_id'),
  price: integer('price').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  compareAtPrice: integer('compare_at_price'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  costPrice: integer('cost_price'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  imageUrl: text('image_url'),
  images: jsonb('images').default([]),
  tags: text('tags').array().default([]),
  weight: integer('weight'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  trackInventory: boolean('track_inventory').default(true),
  quantityOnHand: integer('quantity_on_hand').default(0),
  allowBackorder: boolean('allow_backorder').default(false),
  isDigital: boolean('is_digital').default(false),
  isActive: boolean('is_active').default(true),
  taxable: boolean('taxable').default(true),
  taxCode: varchar('tax_code', { length: 50 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('products_tenant_id_idx').on(table.tenantId),
  };
});

// ─── Product Categories ───────────────────────────────────────────────────────
export const product_categories = pgTable('product_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  storeId: uuid('store_id'),
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }),
  description: text('description'),
  imageUrl: text('image_url'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('product_categories_tenant_id_idx').on(table.tenantId),
  };
});

// ─── Product Reviews ──────────────────────────────────────────────────────────
export const product_reviews = pgTable('product_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  productId: uuid('product_id').notNull(),
  customerId: uuid('customer_id'),
  rating: integer('rating').notNull(), // 1-5
  title: varchar('title', { length: 200 }),
  body: text('body'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false),
  isApproved: boolean('is_approved').default(false),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('product_reviews_tenant_id_idx').on(table.tenantId),
  };
});

// Alias for shim compatibility
export const productReviews = product_reviews;


// ─── Product Variants ─────────────────────────────────────────────────────────
export const product_variants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  optionValues: jsonb('option_values'), // {size: 'M', color: 'Red'}
  price: integer('price'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  quantityOnHand: integer('quantity_on_hand').default(0),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('product_variants_tenant_id_idx').on(table.tenantId),
  };
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductCategory = typeof product_categories.$inferSelect;
export type ProductReview = typeof product_reviews.$inferSelect;
export type ProductVariant = typeof product_variants.$inferSelect;

