import { pgTable, uuid, text, timestamp, boolean, jsonb, varchar, index, integer } from 'drizzle-orm/pg-core';

export const micrositeSettings = pgTable(
  'microsite_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: text('tenant_id').notNull(),
    merchantId: uuid('merchant_id'), // Assuming merchants.id is a UUID
    domain: text('domain').unique(),
    heroColor: varchar('hero_color', { length: 7 }), // e.g., #RRGGBB
    heroImageUrl: text('hero_image_url'),
    description: text('description'),
    address: text('address'),
    phone: text('phone'),
    socialLinks: jsonb('social_links'),
    seoMeta: jsonb('seo_meta'),
    paysurityMarginPct: integer('paysurity_margin_pct').default(20).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    processingFeePct: integer('processing_fee_pct').default(5).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    isPublished: boolean('is_published').default(false).notNull(),
    posSyncEnabled: boolean('pos_sync_enabled').default(false).notNull(),
    lastPosSyncAt: timestamp('last_pos_sync_at'), // Nullable
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => {
    return {
      tenantIdIdx: index('microsite_settings_tenant_id_idx').on(table.tenantId),
      merchantIdIdx: index('microsite_settings_merchant_id_idx').on(table.merchantId),
      // A unique index for domain is implicitly created by .unique() on the column.
      // If a composite unique index with tenant_id was desired, it would be defined here:
      // tenantDomainUnique: unique('microsite_settings_tenant_domain_key').on(table.tenantId, table.domain),
    };
  }
);

export type MicrositeSettings = typeof micrositeSettings.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_MICROSITE_SETTINGS = `
ALTER TABLE microsite_settings ENABLE ROW LEVEL SECURITY;
`;

