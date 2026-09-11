import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const priceEngineConfig = pgTable('price_engine_config', {
  tenantId: text('tenant_id').notNull().primaryKey(),
  paysurityMarginPct: integer('paysurity_margin_pct').notNull().default(20), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  processingFeePct: integer('processing_fee_pct').notNull().default(5), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PriceEngineConfig = InferSelectModel<typeof priceEngineConfig>;

