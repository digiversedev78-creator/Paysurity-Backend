import { pgTable, uuid, text, varchar, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
// ─── E-Commerce Orders ────────────────────────────────────────────────────────
export const ecom_orders = pgTable('ecom_orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    customerId: uuid('customer_id'),
    storeId: uuid('store_id'),
    orderNumber: varchar('order_number', { length: 50 }),
    status: varchar('status', { length: 40 }).default('PENDING'), // PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED | REFUNDED
    fulfillmentType: varchar('fulfillment_type', { length: 30 }).default('SHIP'), // SHIP | PICKUP | DIGITAL
    subtotalCents: integer('subtotal_cents').default(0),
    shippingCents: integer('shipping_cents').default(0),
    taxCents: integer('tax_cents').default(0),
    discountCents: integer('discount_cents').default(0),
    totalCents: integer('total_cents').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    shippingAddress: jsonb('shipping_address'),
    billingAddress: jsonb('billing_address'),
    paymentIntentId: varchar('payment_intent_id', { length: 200 }),
    paymentStatus: varchar('payment_status', { length: 40 }).default('UNPAID'),
    notes: text('notes'),
    metadata: jsonb('metadata'),
    placedAt: timestamp('placed_at').defaultNow(),
    shippedAt: timestamp('shipped_at'),
    deliveredAt: timestamp('delivered_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('ecom_orders_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Carts ────────────────────────────────────────────────────────────────────
export const carts = pgTable('carts', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    customerId: uuid('customer_id'),
    sessionId: varchar('session_id', { length: 200 }),
    storeId: uuid('store_id'),
    items: jsonb('items').default([]),
    couponCode: varchar('coupon_code', { length: 50 }),
    subtotalCents: integer('subtotal_cents').default(0),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('carts_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Shipments ────────────────────────────────────────────────────────────────
export const shipments = pgTable('shipments', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    orderId: uuid('order_id').notNull(),
    carrier: varchar('carrier', { length: 50 }), // USPS | UPS | FEDEX | CUSTOM
    trackingNumber: varchar('tracking_number', { length: 100 }),
    serviceLevel: varchar('service_level', { length: 50 }),
    shippingLabelUrl: text('shipping_label_url'),
    estimatedDelivery: timestamp('estimated_delivery'),
    status: varchar('status', { length: 40 }).default('PENDING'), // PENDING | SHIPPED | IN_TRANSIT | DELIVERED | FAILED
    shipmentCostCents: integer('shipment_cost_cents').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('shipments_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=ecommerce.js.map