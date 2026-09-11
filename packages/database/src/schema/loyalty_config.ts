import { pgTable, uuid, text, boolean, timestamp, jsonb, index, integer } from 'drizzle-orm/pg-core';

export const loyalty_config = pgTable('loyalty_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').unique(),
  pointsExpiryDays: integer('points_expiry_days').default(365), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  redemptionRate: integer('redemption_rate').default(1), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  minimumRedeemPoints: integer('minimum_redeem_points').default(100), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  isEnabled: boolean('is_enabled').default(true),
  config: jsonb('config'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('loyalty_config_tenant_id_idx').on(table.tenantId),
  };
});

export type LoyaltyConfig = typeof loyalty_config.$inferSelect;
export type NewLoyaltyConfig = typeof loyalty_config.$inferInsert;


