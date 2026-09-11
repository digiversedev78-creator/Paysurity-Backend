import { Injectable, Inject} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql, desc, asc, gte, lte, inArray, isNull } from 'drizzle-orm';
import { pgTable, uuid, text, numeric, timestamp, varchar, boolean } from 'drizzle-orm/pg-core'; // Temporarily include Drizzle types for new schemas

// ASSUMED Drizzle Schema Definitions (in a real project, these would be imported from @paysurity/database)
// Existing:
export const affiliatePayouts = pgTable('affiliate_payouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(), // Added tenantId, assuming existing table is multi-tenant
  affiliateId: uuid('affiliate_id').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: varchar('status', { enum: ['pending', 'processed', 'failed', 'cancelled', 'reversed'] }).notNull(),
  paymentMethodId: uuid('payment_method_id'),
  transactionId: varchar('transaction_id', { length: 255 }),
  payoutDate: timestamp('payout_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// New schemas for commission engine:
export const affiliateCommissionRules = pgTable('affiliate_commission_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  productId: uuid('product_id'), // Optional, for product-specific rules
  categoryId: uuid('category_id'), // Optional, for category-specific rules
  rateType: varchar('rate_type', { enum: ['percentage', 'flat'] }).notNull(),
  rateValue: numeric('rate_value', { precision: 10, scale: 4 }).notNull(), // e.g., 0.10 for 10% or 10.00 for $10
  currency: varchar('currency', { length: 3 }), // Required for flat rates
  commissionType: varchar('commission_type', { enum: ['one-time', 'recurring'] }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const affiliateCommissions = pgTable('affiliate_commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  affiliateId: uuid('affiliate_id').notNull(),
  orderId: uuid('order_id').notNull(),
  paymentId: uuid('payment_id').notNull(), // The specific payment that triggered this commission
  commissionRuleId: uuid('commission_rule_id').notNull().references(() => affiliateCommissionRules.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: varchar('status', { enum: ['earned', 'held', 'eligible', 'paid', 'reversed'] }).default('earned').notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
  eligibleForPayoutAt: timestamp('eligible_for_payout_at').notNull(), // Based on hold period
  payoutId: uuid('payout_id').references(() => affiliatePayouts.id), // Link to actual payout disbursement
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// END ASSUMED Drizzle Schema Definitions

// Infer types from schemas
type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
type NewAffiliatePayout = typeof affiliatePayouts.$inferInsert;
type AffiliateCommissionRule = typeof affiliateCommissionRules.$inferSelect;
type NewAffiliateCommissionRule = typeof affiliateCommissionRules.$inferInsert;
type AffiliateCommission = typeof affiliateCommissions.$inferSelect;
type NewAffiliateCommission = typeof affiliateCommissions.$inferInsert;

// DTOs for existing Payouts service
interface CreateAffiliatePayoutDto {
  affiliateId: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processed' | 'failed' | 'cancelled' | 'reversed';
  paymentMethodId?: string;
  transactionId?: string;
  payoutDate?: Date;
  notes?: string;
}

interface UpdateAffiliatePayoutDto {
  amount?: string;
  currency?: string;
  status?: 'pending' | 'processed' | 'failed' | 'cancelled' | 'reversed';
  paymentMethodId?: string;
  transactionId?: string;
  payoutDate?: Date;
  notes?: string;
}

interface FindAllAffiliatePayoutsDto {
  affiliateId?: string;
  status?: 'pending' | 'processed' | 'failed' | 'cancelled' | 'reversed';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'amount' | 'payoutDate' | 'status';
  orderDirection?: 'asc' | 'desc';
}

// New DTOs for Commission Rules
interface CreateAffiliateCommissionRuleDto {
  name: string;
  productId?: string;
  categoryId?: string;
  rateType: 'percentage' | 'flat';
  rateValue: string; // Use string for numeric types with Drizzle
  currency?: string; // Required for flat rates
  commissionType: 'one-time' | 'recurring';
  isActive?: boolean;
}

interface UpdateAffiliateCommissionRuleDto {
  name?: string;
  productId?: string;
  categoryId?: string;
  rateType?: 'percentage' | 'flat';
  rateValue?: string;
  currency?: string;
  commissionType?: 'one-time' | 'recurring';
  isActive?: boolean;
}

interface FindAllAffiliateCommissionRulesDto {
  productId?: string;
  categoryId?: string;
  isActive?: boolean;
  commissionType?: 'one-time' | 'recurring';
  limit?: number;
  offset?: number;
}

// New DTOs for Affiliate Commissions (ledger entries)
interface FindAllAffiliateCommissionsDto {
  affiliateId?: string;
  orderId?: string;
  paymentId?: string;
  status?: 'earned' | 'held' | 'eligible' | 'paid' | 'reversed';
  earnedStartDate?: Date;
  earnedEndDate?: Date;
  eligibleStartDate?: Date;
  eligibleEndDate?: Date;
  payoutId?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'earnedAt' | 'amount' | 'eligibleForPayoutAt' | 'status';
  orderDirection?: 'asc' | 'desc';
}

// Interface for settled payment details (comes from Payments service typically)
interface SettledPaymentDetails {
  id: string; // paymentId
  orderId: string;
  productId?: string; // Product that was paid for (if single product)
  categoryId?: string; // Category of product (if single category)
  // Note: For multi-item orders, this might need to be an array or processed per line item.
  // For simplicity here, assuming a single product/category context for commission calculation.
  amount: string; // Total amount paid for this item/payment
  currency: string;
  settledAt: Date;
  // Assume we can derive the affiliate ID from the order/product context,
  // or it's passed explicitly if an order can have multiple referring affiliates.
  // For simplicity, affiliateId is passed to `calculateCommissionForPaymentSettlement`.
}


@Injectable()
export class AffiliatesPayoutsService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  // Helper to get tenant-specific configuration, e.g., commission hold period
  // In a real application, this would query a tenant_config table.
  private async _getTenantConfig(tenantId: string): Promise<{ commissionHoldDays: number }> {
    // For demonstration, hardcode. Replace with actual config retrieval.
    return {
      commissionHoldDays: 30, // 30 days hold period before a commission is eligible for payout
    };
  }

  /*
   * Existing Affiliate Payouts (disbursements) methods
   */

  async create(req: any, data: CreateAffiliatePayoutDto): Promise<AffiliatePayout> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const newPayout: NewAffiliatePayout = {
      ...data,
      tenantId,
      payoutDate: data.payoutDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdPayout] = await (this.db as any).insert(affiliatePayouts).values(newPayout).returning();
    return createdPayout;
  }

  async findOne(req: any, id: string): Promise<AffiliatePayout | undefined> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const [payout] = await (this.db as any).select()
      .from(affiliatePayouts)
      .where((and as any)((eq as any)(affiliatePayouts.id, id), (eq as any)(affiliatePayouts.tenantId, tenantId)))
      .limit(1);
    return payout;
  }

  async findAll(req: any, filter?: FindAllAffiliatePayoutsDto): Promise<AffiliatePayout[]> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const conditions = [(eq as any)(affiliatePayouts.tenantId, tenantId)];

    if (filter?.affiliateId) {
      conditions.push((eq as any)(affiliatePayouts.affiliateId, filter.affiliateId));
    }
    if (filter?.status) {
      conditions.push((eq as any)(affiliatePayouts.status, filter.status));
    }
    if (filter?.startDate) {
      conditions.push((gte as any)(affiliatePayouts.payoutDate, filter.startDate.toISOString()));
    }
    if (filter?.endDate) {
      conditions.push((lte as any)(affiliatePayouts.payoutDate, filter.endDate.toISOString()));
    }

    const query = (this.db as any).select().from(affiliatePayouts);

    if (conditions.length > 0) {
      query.where((and as any)(...conditions));
    }

    const orderByColumn = filter?.orderBy && affiliatePayouts[filter.orderBy] ? affiliatePayouts[filter.orderBy] : affiliatePayouts.createdAt;
    const orderDirection = filter?.orderDirection === 'asc' ? asc : desc;

    query.orderBy(orderDirection(orderByColumn as any));

    if (filter?.limit) {
      query.limit(filter.limit);
    }
    if (filter?.offset !== undefined) {
      query.offset(filter.offset);
    }

    return query;
  }

  /*
   * Affiliate Commission Rules methods
   */

  async createCommissionRule(req: any, data: CreateAffiliateCommissionRuleDto): Promise<AffiliateCommissionRule> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const newRule: NewAffiliateCommissionRule = {
      ...data,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Ensure currency is set for flat rate types
    if (newRule.rateType === 'flat' && !newRule.currency) {
      throw new Error('Currency is required for flat rate commission rules.');
    }

    const [createdRule] = await (this.db as any).insert(affiliateCommissionRules).values(newRule).returning();
    return createdRule;
  }

  async updateCommissionRule(req: any, id: string, data: UpdateAffiliateCommissionRuleDto): Promise<AffiliateCommissionRule | undefined> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const [updatedRule] = await (this.db as any).update(affiliateCommissionRules)
      .set({ ...data, updatedAt: new Date() })
      .where((and as any)((eq as any)(affiliateCommissionRules.id, id), (eq as any)(affiliateCommissionRules.tenantId, tenantId)))
      .returning();
    return updatedRule;
  }

  async findCommissionRules(req: any, filter?: FindAllAffiliateCommissionRulesDto): Promise<AffiliateCommissionRule[]> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const conditions = [(eq as any)(affiliateCommissionRules.tenantId, tenantId)];

    if (filter?.productId) {
      conditions.push((eq as any)(affiliateCommissionRules.productId, filter.productId));
    }
    if (filter?.categoryId) {
      conditions.push((eq as any)(affiliateCommissionRules.categoryId, filter.categoryId));
    }
    if (filter?.isActive !== undefined) {
      conditions.push((eq as any)(affiliateCommissionRules.isActive, filter.isActive));
    }
    if (filter?.commissionType) {
      conditions.push((eq as any)(affiliateCommissionRules.commissionType, filter.commissionType));
    }

    const query = (this.db as any).select().from(affiliateCommissionRules);

    if (conditions.length > 0) {
      query.where((and as any)(...conditions));
    }

    query.orderBy(desc(affiliateCommissionRules.createdAt));

    if (filter?.limit) {
      query.limit(filter.limit);
    }
    if (filter?.offset !== undefined) {
      query.offset(filter.offset);
    }

    return query;
  }


  /*
   * Commission Engine Core Logic
   */

  async calculateCommissionForPaymentSettlement(req: any, payment: SettledPaymentDetails, affiliateId: string): Promise<AffiliateCommission | undefined> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    if (!payment || !affiliateId) {
      throw new Error('Payment details and affiliate ID are required.');
    }

    const { id: paymentId, orderId, productId, categoryId, amount, currency, settledAt } = payment;

    // 1. Check for existing commission for this payment to prevent duplicates (especially for one-time commissions)
    const existingCommission = await (this.db as any).select()
      .from(affiliateCommissions)
      .where((and as any)(
        (eq as any)(affiliateCommissions.tenantId, tenantId),
        (eq as any)(affiliateCommissions.paymentId, paymentId),
        (eq as any)(affiliateCommissions.affiliateId, affiliateId)
      ))
      .limit(1);

    if (existingCommission.length > 0) {
      // For recurring, multiple commissions per payment are possible if logic allows (e.g., subscription renewals).
      // For one-time, this means it's already processed.
      if (existingCommission[0].commissionType === 'one-time') { // Need commission type on commission table or check rule
         console.warn(`Commission already processed for payment ${paymentId} for affiliate ${affiliateId}. Skipping.`);
         return undefined;
      }
      // If recurring and a new commission is intended for a new billing cycle for the same payment ID (e.g., subscription renewal using same payment ID placeholder),
      // then further logic is needed to differentiate. For now, assuming payment ID is unique per commission event.
    }


    // 2. Find applicable commission rules
    const conditions = [
      (eq as any)(affiliateCommissionRules.tenantId, tenantId),
      (eq as any)(affiliateCommissionRules.isActive, true),
    ];

    // Prioritize product-specific rules, then category-specific, then general
    const rulePriorities = [];
    if (productId) {
      rulePriorities.push((eq as any)(affiliateCommissionRules.productId, productId));
    }
    if (categoryId) {
      rulePriorities.push((eq as any)(affiliateCommissionRules.categoryId, categoryId));
    }
    // General rules will have neither product nor category ID set
    rulePriorities.push((and as any)(isNull(affiliateCommissionRules.productId), isNull(affiliateCommissionRules.categoryId)));


    let applicableRule: AffiliateCommissionRule | undefined;
    for (const ruleCondition of rulePriorities) {
      const rules = await (this.db as any).select().from(affiliateCommissionRules)
        .where((and as any)(...conditions, ruleCondition))
        .orderBy(desc(affiliateCommissionRules.createdAt)) // Latest rule takes precedence if multiple match
        .limit(1);
      if (rules.length > 0) {
        applicableRule = rules[0];
        break; // Found the most specific rule, stop searching
      }
    }

    if (!applicableRule) {
      console.log(`No active commission rule found for tenant ${tenantId}, product ${productId}, category ${categoryId}.`);
      return undefined; // No rule, no commission
    }

    // 3. Calculate commission amount
    let commissionAmount: number;
    const paymentAmount = parseFloat(amount);
    const rateValue = parseFloat(applicableRule.rateValue);

    if (applicableRule.currency && applicableRule.currency !== currency) {
      console.warn(`Currency mismatch: Rule ${applicableRule.id} currency ${applicableRule.currency} does not match payment currency ${currency}. Skipping commission calculation.`);
      return undefined; // Or implement currency conversion
    }

    if (applicableRule.rateType === 'percentage') {
      commissionAmount = paymentAmount * (rateValue / 100);
    } else { // flat rate
      commissionAmount = rateValue;
      if (applicableRule.currency !== currency) {
        throw new Error(`Flat rate commission rule currency (${applicableRule.currency}) mismatch with payment currency (${currency}).`);
      }
    }

    if (commissionAmount <= 0) {
      return undefined; // Don't record zero or negative commissions
    }

    // 4. Determine hold period and eligible payout date
    const tenantConfig = await this._getTenantConfig(tenantId);
    const holdDays = tenantConfig.commissionHoldDays;
    const eligibleForPayoutAt = new Date(settledAt);
    eligibleForPayoutAt.setDate(eligibleForPayoutAt.getDate() + holdDays);

    const commissionStatus: AffiliateCommission['status'] = holdDays > 0 ? 'held' : 'eligible';

    // 5. Record commission in the ledger
    const newCommission: NewAffiliateCommission = {
      tenantId,
      affiliateId,
      orderId,
      paymentId,
      commissionRuleId: applicableRule.id,
      amount: commissionAmount.toFixed(2), // Store as string with 2 decimal places
      currency: currency,
      status: commissionStatus,
      earnedAt: settledAt,
      eligibleForPayoutAt: eligibleForPayoutAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `Commission for payment ${paymentId} (rule: ${applicableRule.name})`,
    };

    const [createdCommission] = await (this.db as any).insert(affiliateCommissions).values(newCommission).returning();
    return createdCommission;
  }

  /*
   * Affiliate Commission Ledger methods
   */

  async getAffiliateCommissionLedger(req: any, affiliateId: string, filter?: FindAllAffiliateCommissionsDto): Promise<AffiliateCommission[]> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const conditions = [
      (eq as any)(affiliateCommissions.tenantId, tenantId),
      (eq as any)(affiliateCommissions.affiliateId, affiliateId)
    ];

    if (filter?.orderId) {
      conditions.push((eq as any)(affiliateCommissions.orderId, filter.orderId));
    }
    if (filter?.paymentId) {
      conditions.push((eq as any)(affiliateCommissions.paymentId, filter.paymentId));
    }
    if (filter?.status) {
      conditions.push((eq as any)(affiliateCommissions.status, filter.status));
    }
    if (filter?.earnedStartDate) {
      conditions.push((gte as any)(affiliateCommissions.earnedAt, filter.earnedStartDate.toISOString()));
    }
    if (filter?.earnedEndDate) {
      conditions.push((lte as any)(affiliateCommissions.earnedAt, filter.earnedEndDate.toISOString()));
    }
    if (filter?.eligibleStartDate) {
      conditions.push((gte as any)(affiliateCommissions.eligibleForPayoutAt, filter.eligibleStartDate.toISOString()));
    }
    if (filter?.eligibleEndDate) {
      conditions.push((lte as any)(affiliateCommissions.eligibleForPayoutAt, filter.eligibleEndDate.toISOString()));
    }
    if (filter?.payoutId) {
      conditions.push((eq as any)(affiliateCommissions.payoutId, filter.payoutId));
    }

    const query = (this.db as any).select().from(affiliateCommissions);

    if (conditions.length > 0) {
      query.where((and as any)(...conditions));
    }

    const orderByColumn = filter?.orderBy && affiliateCommissions[filter.orderBy] ? affiliateCommissions[filter.orderBy] : affiliateCommissions.earnedAt;
    const orderDirection = filter?.orderDirection === 'asc' ? asc : desc;

    query.orderBy(orderDirection(orderByColumn as any));

    if (filter?.limit) {
      query.limit(filter.limit);
    }
    if (filter?.offset !== undefined) {
      query.offset(filter.offset);
    }

    return query;
  }

  async getAffiliateEarningsSummary(req: any, affiliateId: string): Promise<{ totalEarned: string; totalPaid: string; totalHeld: string; totalEligible: string; currency: string }[]> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    const result = await (this.db as any).select({
      currency: affiliateCommissions.currency,
      totalEarned: sql<string>`sum(${affiliateCommissions.amount})`.as('total_earned'),
      totalPaid: sql<string>`sum(case when ${affiliateCommissions.status} = 'paid' then ${affiliateCommissions.amount} else 0 end)`.as('total_paid'),
      totalHeld: sql<string>`sum(case when ${affiliateCommissions.status} = 'held' then ${affiliateCommissions.amount} else 0 end)`.as('total_held'),
      totalEligible: sql<string>`sum(case when ${affiliateCommissions.status} = 'eligible' then ${affiliateCommissions.amount} else 0 end)`.as('total_eligible'),
    })
    .from(affiliateCommissions)
    .where((and as any)(
      (eq as any)(affiliateCommissions.tenantId, tenantId),
      (eq as any)(affiliateCommissions.affiliateId, affiliateId)
    ))
    .groupBy(affiliateCommissions.currency);

    return result.map(row => ({
      ...row,
      totalEarned: parseFloat(row.totalEarned || '0').toFixed(2),
      totalPaid: parseFloat(row.totalPaid || '0').toFixed(2),
      totalHeld: parseFloat(row.totalHeld || '0').toFixed(2),
      totalEligible: parseFloat(row.totalEligible || '0').toFixed(2),
    }));
  }

  async getEligibleCommissionsForPayout(req: any, affiliateId: string, asOfDate: Date = new Date()): Promise<AffiliateCommission[]> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    // First, update the status of 'held' commissions to 'eligible' if their hold period has passed
    await (this.db as any).update(affiliateCommissions)
      .set({ status: 'eligible', updatedAt: new Date() })
      .where((and as any)(
        (eq as any)(affiliateCommissions.tenantId, tenantId),
        (eq as any)(affiliateCommissions.affiliateId, affiliateId),
        (eq as any)(affiliateCommissions.status, 'held'),
        (lte as any)(affiliateCommissions.eligibleForPayoutAt, asOfDate.toISOString())
      ));

    // Then, fetch all eligible commissions
    return (this.db as any).select()
      .from(affiliateCommissions)
      .where((and as any)(
        (eq as any)(affiliateCommissions.tenantId, tenantId),
        (eq as any)(affiliateCommissions.affiliateId, affiliateId),
        (eq as any)(affiliateCommissions.status, 'eligible'),
        (lte as any)(affiliateCommissions.eligibleForPayoutAt, asOfDate.toISOString()) // Ensure still eligible if date changes
      ))
      .orderBy(asc(affiliateCommissions.eligibleForPayoutAt), asc(affiliateCommissions.earnedAt));
  }

  async processAffiliatePayout(req: any, affiliateId: string, commissionIds: string[], paymentMethodId?: string, notes?: string): Promise<AffiliatePayout> {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      throw new Error('Tenant ID is required for this operation.');
    }

    if (!commissionIds || commissionIds.length === 0) {
      throw new Error('No commission IDs provided for payout.');
    }

    // Use a transaction for consistency
    return (this.db as any).transaction(async (tx) => {
      // 1. Fetch and sum the eligible commissions
      const commissionsToPayout = await tx.select()
        .from(affiliateCommissions)
        .where((and as any)(
          (eq as any)(affiliateCommissions.tenantId, tenantId),
          (eq as any)(affiliateCommissions.affiliateId, affiliateId),
          (inArray as any)(affiliateCommissions.id, commissionIds),
          (eq as any)(affiliateCommissions.status, 'eligible') // Only payout truly eligible ones
        ));

      if (commissionsToPayout.length !== commissionIds.length) {
        throw new Error('Some provided commission IDs are not found or are not eligible for payout.');
      }

      // Group by currency and calculate total for each
      const payoutTotals: { [currency: string]: number } = {};
      commissionsToPayout.forEach(c => {
        const amount = parseFloat(c.amount);
        payoutTotals[c.currency] = (payoutTotals[c.currency] || 0) + amount;
      });

      // For simplicity, this method assumes a single currency payout.
      // In a real multi-currency scenario, you might create multiple payouts.
      const currencies = Object.keys(payoutTotals);
      if (currencies.length === 0) {
        throw new Error('No valid commissions found for payout total calculation.');
      }
      if (currencies.length > 1) {
        throw new Error('Multi-currency payouts are not supported in a single transaction by this method. Please process per currency.');
      }

      const payoutCurrency = currencies[0];
      const totalPayoutAmount = payoutTotals[payoutCurrency].toFixed(2);

      if (parseFloat(totalPayoutAmount) <= 0) {
        throw new Error('Calculated payout amount is zero or negative. Cannot create payout.');
      }

      // 2. Create the AffiliatePayout entry
      const newPayout: NewAffiliatePayout = {
        tenantId,
        affiliateId,
        amount: totalPayoutAmount,
        currency: payoutCurrency,
        status: 'pending', // Initial status, will be 'processed' upon actual fund transfer
        paymentMethodId,
        payoutDate: new Date(),
        notes: notes || `Payout for ${commissionsToPayout.length} commissions.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [createdPayout] = await tx.insert(affiliatePayouts).values(newPayout).returning();
      if (!createdPayout) {
        throw new Error('Failed to create affiliate payout record.');
      }

      // 3. Link commissions to the new payout and update their status
      await tx.update(affiliateCommissions)
        .set({
          status: 'paid',
          payoutId: createdPayout.id,
          updatedAt: new Date(),
        })
        .where((and as any)(
          (eq as any)(affiliateCommissions.tenantId, tenantId),
          (inArray as any)(affiliateCommissions.id, commissionIds),
          (eq as any)(affiliateCommissions.affiliateId, affiliateId)
        ));

      // In a real system, here you'd also trigger the actual payment processing (e.g., via a Payment Service)
      // and update the payout status to 'processed'/'failed' based on the outcome.
      // For this task, we assume the record creation is sufficient.

      return createdPayout;
    });
  }

}




