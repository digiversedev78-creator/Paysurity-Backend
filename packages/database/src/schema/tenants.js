import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
export const tenants = pgTable('tenants', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    vertical: text('vertical'),
    plan: text('plan').default('standard'),
    status: text('status').default('active'),
    kybStatus: text('kyb_status').default('PENDING'),
    platformFeeRateBps: integer('platform_fee_rate_bps').default(290),
    maxTerminals: integer('max_terminals').default(10),
    maxLocations: integer('max_locations').default(1),
    defaultGateway: text('default_gateway'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
// ─── Locations / Stores / Branches ──────────────────────────────────────────
export const stores = pgTable('stores', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    description: text('description'),
    logoUrl: text('logo_url'),
    bannerUrl: text('banner_url'),
    currency: text('currency').default('USD'),
    timezone: text('timezone').default('America/Chicago'),
    isActive: boolean('is_active').default(true),
    settings: jsonb('settings'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('stores_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=tenants.js.map