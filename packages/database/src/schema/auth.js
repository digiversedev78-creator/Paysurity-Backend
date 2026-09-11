import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
export const authTokens = pgTable('auth_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id').notNull(),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('auth_tokens_tenant_id_idx').on(table.tenantId),
    };
});
export const RLS_MIGRATION_SQL_AUTH = `ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;`;
//# sourceMappingURL=auth.js.map