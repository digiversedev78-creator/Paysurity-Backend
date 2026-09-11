import { pgTable, uuid, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
export const api_keys = pgTable('api_keys', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    name: text('name').notNull(),
    keyHash: text('key_hash').notNull(),
    prefix: text('prefix').notNull(),
    scopes: text('scopes').array().default([]),
    isActive: boolean('is_active').default(true),
    expiresAt: timestamp('expires_at'),
    lastUsedAt: timestamp('last_used_at'),
    revokedAt: timestamp('revoked_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('api_keys_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=api_keys.js.map