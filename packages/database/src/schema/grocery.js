import { pgTable, serial, text, timestamp, uuid, index } from 'drizzle-orm/pg-core';
export const grocery = pgTable('grocery', {
    id: serial('id').primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('grocery_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=grocery.js.map