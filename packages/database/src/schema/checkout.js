import { pgTable, uuid, text, timestamp, index, numeric } from 'drizzle-orm/pg-core';
export const checkouts = pgTable('checkouts', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    status: text('status').notNull().default('pending'),
    totalAmount: numeric('total_amount').notNull(),
    currency: text('currency').notNull().default('USD'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('checkouts_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=checkout.js.map