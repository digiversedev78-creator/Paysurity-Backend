import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { tenants, stores } from './tenants';
import { users } from './users'; // Assuming users table exists
import { payments } from './payments'; // Assuming payments or orders table exists

export const affiliate_commissions = pgTable('affiliate_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  merchantId: uuid('merchant_id').notNull().references(() => users.id),
  locationId: uuid('location_id').notNull().references(() => stores.id),
  orderId: uuid('order_id').notNull(),
  amountCents: integer('amount_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('affiliate_commissions_tenant_id_idx').on(table.tenantId),
    orderIdIdx: index('affiliate_commissions_order_id_idx').on(table.orderId),
  };
});

export const affiliate_conversions = pgTable('affiliate_conversions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  affiliateId: uuid('affiliate_id').notNull().references(() => users.id),
  customerIpAddress: text('customer_ip_address'),
  conversionTimestamp: timestamp('conversion_timestamp').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('affiliate_conversions_tenant_id_idx').on(table.tenantId),
  };
});

export const affiliate_fraud_strikes = pgTable('affiliate_fraud_strikes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  affiliateId: uuid('affiliate_id').notNull().references(() => users.id),
  strikeType: text('strike_type').notNull(),
  strikeTimestamp: timestamp('strike_timestamp').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('affiliate_fraud_strikes_tenant_id_idx').on(table.tenantId),
  };
});

export const affiliate_commission_rates = pgTable('affiliate_commission_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  brokerId: uuid('broker_id').notNull().references(() => users.id),
  tierLevel: integer('tier_level').notNull(),
  basisPoints: integer('basis_points').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('affiliate_commission_rates_tenant_id_idx').on(table.tenantId),
  };
});

export type AffiliateCommission = typeof affiliate_commissions.$inferSelect;
export type NewAffiliateCommission = typeof affiliate_commissions.$inferInsert;
export type AffiliateConversion = typeof affiliate_conversions.$inferSelect;
export type NewAffiliateConversion = typeof affiliate_conversions.$inferInsert;
export type AffiliateFraudStrike = typeof affiliate_fraud_strikes.$inferSelect;
export type NewAffiliateFraudStrike = typeof affiliate_fraud_strikes.$inferInsert;
export type AffiliateCommissionRate = typeof affiliate_commission_rates.$inferSelect;
export type NewAffiliateCommissionRate = typeof affiliate_commission_rates.$inferInsert;
