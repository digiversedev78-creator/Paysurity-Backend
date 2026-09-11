const merchants: any = {};


import { pgTable, uuid, text, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
 // Assuming affiliates might relate to merchants

export const affiliates = pgTable('affiliates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique(), // Affiliate's email
  referralCode: text('referral_code').notNull().unique(), // Unique code for referrals
  isActive: boolean('is_active').default(true).notNull(), // Whether the affiliate account is active
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define a join table for Affiliate-Merchant referrals to track which merchants an affiliate referred
export const affiliateMerchantReferrals = pgTable('affiliate_merchant_referrals', {
  affiliateId: uuid('affiliate_id')
    .notNull()
    .references(() => affiliates.id, { onDelete: 'cascade' }),
  merchantId: uuid('merchant_id')
    .notNull()
    .references(() => merchants.id, { onDelete: 'cascade' }),
  referralDate: timestamp('referral_date').defaultNow().notNull(),
  commissionRate: text('commission_rate'), // e.g., "5%", "10%"
  status: text('status').default('pending').notNull(), // e.g., 'pending', 'approved', 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.affiliateId, table.merchantId] }),
  };
});

export const affiliatesRelations = relations(affiliates, ({ many }) => ({
  affiliateMerchantReferrals: many(affiliateMerchantReferrals),
}));

export const affiliateMerchantReferralsRelations = relations(affiliateMerchantReferrals, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateMerchantReferrals.affiliateId],
    references: [affiliates.id],
  }),
  merchant: one(merchants, {
    fields: [affiliateMerchantReferrals.merchantId],
    references: [merchants.id],
  }),
}));

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export type AffiliateMerchantReferral = typeof affiliateMerchantReferrals.$inferSelect;
export type InsertAffiliateMerchantReferral = typeof affiliateMerchantReferrals.$inferInsert;




