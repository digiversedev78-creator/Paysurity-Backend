import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    customerId: uuid('customer_id').notNull(),
    planId: uuid('plan_id'),
    planName: varchar('plan_name', { length: 100 }),
    status: varchar('status', { length: 30 }).default('ACTIVE'), // ACTIVE | PAUSED | CANCELLED | PAST_DUE | TRIALING
    billingCycleDays: integer('billing_cycle_days').default(30),
    amountCents: integer('amount_cents').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    cancelledAt: timestamp('cancelled_at'),
    trialEndAt: timestamp('trial_end_at'),
    dunningAttempts: integer('dunning_attempts').default(0),
    paymentMethodId: varchar('payment_method_id', { length: 200 }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('subscriptions_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Subscription Plans ───────────────────────────────────────────────────────
export const subscription_plans = pgTable('subscription_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    amountCents: integer('amount_cents').notNull(),
    currency: varchar('currency', { length: 3 }).default('USD'),
    billingCycleDays: integer('billing_cycle_days').default(30),
    trialDays: integer('trial_days').default(0),
    features: jsonb('features').default([]),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('subscription_plans_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=subscriptions.js.map