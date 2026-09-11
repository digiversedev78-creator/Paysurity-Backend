import { pgTable, uuid, text, varchar, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
// ─── Returns / RMA ────────────────────────────────────────────────────────────
export const returns = pgTable('returns', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    orderId: uuid('order_id').notNull(),
    customerId: uuid('customer_id'),
    rmaNumber: varchar('rma_number', { length: 50 }),
    status: varchar('status', { length: 40 }).default('REQUESTED'), // REQUESTED | APPROVED | IN_TRANSIT | RECEIVED | REFUNDED | REJECTED
    reason: varchar('reason', { length: 100 }),
    reasonNotes: text('reason_notes'),
    refundAmount: integer('refund_amount'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    refundMethod: varchar('refund_method', { length: 50 }), // ORIGINAL_PAYMENT | STORE_CREDIT | CASH
    lineItems: jsonb('line_items'),
    inspectionNotes: text('inspection_notes'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('returns_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Store Credits ────────────────────────────────────────────────────────────
export const store_credits = pgTable('store_credits', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    customerId: uuid('customer_id').notNull(),
    balanceCents: integer('balance_cents').default(0),
    issuedReason: varchar('issued_reason', { length: 100 }),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('store_credits_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=returns.js.map