import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
// ─── Customers (CRM) ──────────────────────────────────────────────────────────
export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id'),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    email: text('email'),
    phone: varchar('phone', { length: 30 }),
    dateOfBirth: timestamp('date_of_birth'),
    addressLine1: text('address_line1'),
    addressLine2: text('address_line2'),
    city: varchar('city', { length: 100 }),
    state: varchar('state', { length: 50 }),
    postalCode: varchar('postal_code', { length: 20 }),
    country: varchar('country', { length: 3 }).default('US'),
    totalOrderCount: integer('total_order_count').default(0),
    totalSpentCents: integer('total_spent_cents').default(0),
    loyaltyPoints: integer('loyalty_points').default(0),
    marketingOptIn: boolean('marketing_opt_in').default(true),
    segment: varchar('segment', { length: 50 }).default('NEW'), // NEW | RETURNING | VIP | AT_RISK | CHURNED
    tags: text('tags').array().default([]),
    notes: text('notes'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('customers_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Gift Cards ───────────────────────────────────────────────────────────────
export const gift_cards = pgTable('gift_cards', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    code: varchar('code', { length: 30 }).notNull().unique(),
    initialBalanceCents: integer('initial_balance_cents').notNull(),
    currentBalanceCents: integer('current_balance_cents').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    recipientEmail: text('recipient_email'),
    purchasedByCustomerId: uuid('purchased_by_customer_id'),
    isActive: boolean('is_active').default(true),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('gift_cards_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Gift Card Transactions ───────────────────────────────────────────────────
export const gift_card_transactions = pgTable('gift_card_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    giftCardId: uuid('gift_card_id').notNull(),
    tenantId: uuid('tenant_id').notNull(),
    amountCents: integer('amount_cents').notNull(),
    transactionType: varchar('transaction_type', { length: 20 }).notNull(), // ISSUE | REDEEM | REFUND | VOID
    orderId: uuid('order_id'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('gift_card_transactions_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=customers.js.map