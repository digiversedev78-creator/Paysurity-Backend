import { pgTable, uuid, text, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
export const loyalty_programs = pgTable('loyalty_programs', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id'),
    name: text('name'),
    pointsPerDollar: integer('points_per_dollar').default(1), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('loyalty_programs_tenant_id_idx').on(table.tenantId),
    };
});
export const loyalty_points = pgTable('loyalty_points', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id'),
    tenantId: uuid('tenant_id'),
    points: integer('points').default(0),
    totalEarned: integer('total_earned').default(0),
    totalRedeemed: integer('total_redeemed').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('loyalty_points_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=loyalty.js.map