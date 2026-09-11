import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const micrositePageVisits = pgTable('microsite_page_visits', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: text('tenant_id').notNull(),
    merchantId: text('merchant_id'),
    pagePath: text('page_path').notNull(),
    visitorIpHash: text('visitor_ip_hash'),
    referrer: text('referrer'),
    userAgentHash: text('user_agent_hash'),
    sessionId: text('session_id'),
    visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => sql `now()`),
}, (table) => {
    return {
        tenantIdIdx: index('microsite_page_visits_tenant_id_idx').on(table.tenantId),
    };
});
// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_MICROSITE_PAGE_VISITS = `
ALTER TABLE microsite_page_visits ENABLE ROW LEVEL SECURITY;
`;
//# sourceMappingURL=microsite_page_visits.js.map