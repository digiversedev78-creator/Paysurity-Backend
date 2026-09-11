// @PAYMENT_CRITICAL
import { sql } from 'drizzle-orm';
import { pgTable, uuid, varchar, integer, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';
export const settlements = pgTable('settlements', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    batchId: varchar('batch_id', { length: 100 }),
    status: varchar('status', { length: 40 }).default('PENDING'),
    grossAmountCents: integer('gross_amount_cents').default(0),
    feesAmountCents: integer('fees_amount_cents').default(0),
    netAmountCents: integer('net_amount_cents').default(0),
    currency: varchar('currency', { length: 3 }).default('USD'),
    transactionCount: integer('transaction_count').default(0),
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    processorRef: varchar('processor_ref', { length: 200 }),
    metadata: jsonb('metadata'),
    settledAt: timestamp('settled_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('settlements_tenant_id_idx').on(table.tenantId),
        statusCreatedAtIdx: index('settlements_status_created_at_idx').on(table.status, table.createdAt),
    };
});
export const refund_requests = pgTable('refund_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    transactionId: uuid('transaction_id').notNull(),
    orderId: uuid('order_id'),
    customerId: uuid('customer_id'),
    requestedAmountCents: integer('requested_amount_cents').notNull(),
    approvedAmountCents: integer('approved_amount_cents'),
    currency: varchar('currency', { length: 3 }).default('USD'),
    reason: varchar('reason', { length: 100 }),
    status: varchar('status', { length: 40 }).default('PENDING'),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at'),
    completedAt: timestamp('completed_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('refund_requests_tenant_id_idx').on(table.tenantId),
    };
});
export const payment_transactions = pgTable('payment_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    orderId: uuid('order_id'),
    customerId: uuid('customer_id'),
    checkoutAmount: integer('checkout_amount').notNull(),
    authAmount: integer('auth_amount').notNull(),
    captureAmount: integer('capture_amount').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    status: varchar('status', { length: 40 }).default('PENDING'),
    gateway: varchar('gateway', { length: 50 }).default('FLUIDPAY'),
    processorRef: varchar('processor_ref', { length: 200 }),
    cardLast4: varchar('card_last4', { length: 4 }),
    cardBrand: varchar('card_brand', { length: 20 }),
    token: varchar('token', { length: 255 }), // PCI-DSS compliance, no raw PAN
    tenderType: varchar('tender_type', { length: 30 }).default('CARD'),
    partnerRefId: varchar('partner_ref_id', { length: 255 }), // EMV L3 Mandatory
    commodityCode: varchar('commodity_code', { length: 100 }), // EMV L3 Mandatory
    productCode: varchar('product_code', { length: 100 }), // EMV L3 Mandatory
    unitCost: integer('unit_cost'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    platformFeeCents: integer('platform_fee_cents').default(0),
    metadata: jsonb('metadata'),
    capturedAt: timestamp('captured_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('payment_transactions_tenant_id_idx').on(table.tenantId),
        authAmountCheck: check('auth_amount_eq_checkout', sql `auth_amount = checkout_amount`),
        captureAmountCheck: check('capture_amount_lte_auth', sql `capture_amount <= auth_amount`)
    };
});
// Alias for shim/API compatibility
export const payments = payment_transactions;
//# sourceMappingURL=payments.js.map