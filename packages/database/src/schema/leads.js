import { pgTable, varchar, timestamp, text, index } from 'drizzle-orm/pg-core';
export const leads = pgTable('leads', {
    id: varchar('id', { length: 255 }).primaryKey(),
    firstName: varchar('first_name', { length: 150 }),
    lastName: varchar('last_name', { length: 150 }),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    company: varchar('company', { length: 255 }),
    monthlyVolume: varchar('monthly_volume', { length: 100 }),
    intent: varchar('intent', { length: 100 }),
    notes: text('notes'),
    source: varchar('source', { length: 100 }).notNull(), // 'SavingsEstimator', 'ContactUs'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    tenantId: varchar('tenant_id', { length: 255 }).notNull(),
}, (table) => {
    return {
        tenantIdIdx: index('leads_tenant_id_idx').on(table.tenantId),
    };
});
// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_LEADS = `
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
`;
//# sourceMappingURL=leads.js.map