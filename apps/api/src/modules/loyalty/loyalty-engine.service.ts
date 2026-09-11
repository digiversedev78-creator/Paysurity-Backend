/**
 * Loyalty Integration Service
 * PORTED FROM: PS-Platform/shared/services/LoyaltyIntegrationService.ts (873 lines)
 *
 * 4 program types (points/cashback/tier/hybrid), multi-rule earn/redeem engine,
 * tier upgrade logic, birthday/referral/signup bonus, preferred-category tracking.
 *
 * REQ-LOY-001: Points Earning Engine â€” persistPointsEarned() writes to loyalty_transactions
 * REQ-LOY-002: Redemption Engine â€” persistRedemption() debits loyalty_accounts
 * REQ-LOY-003: Tier Program â€” persistTierUpgrade() updates loyalty_accounts.tier_id
 */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { EventBusService } from '../event-bus/event-bus.service';
import { randomUUID } from 'crypto';

// â”€â”€â”€ Domain Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface LoyaltyProgram {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  programType: 'points' | 'cashback' | 'tier' | 'hybrid';
  status: 'active' | 'inactive' | 'suspended';
  rules: LoyaltyRule[];
  rewards: LoyaltyReward[];
  settings: LoyaltyProgramSettings;
}

export interface LoyaltyRule {
  id: string;
  ruleType: 'earn' | 'redeem' | 'tier_upgrade' | 'bonus';
  condition: {
    trigger: string;
    minAmount?: number;
    productCategories?: string[];
    paymentMethods?: string[];
    locations?: string[];
  };
  reward: {
    type: 'points' | 'cashback' | 'discount' | 'free_item';
    value: number;
    unit: 'fixed' | 'percentage' | 'multiplier';
    maxValue?: number;
  };
  isActive: boolean;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  rewardType: 'discount' | 'free_item' | 'cashback' | 'experience';
  cost: number;
  value: number;
  availability: { maxRedemptions?: number; currentRedemptions: number };
  restrictions: { minPurchase?: number; applicableCategories?: string[]; excludedItems?: string[] };
  isActive: boolean;
}

export interface LoyaltyProgramSettings {
  pointsExpiration: number;
  tierThresholds?: Record<string, number>;
  referralBonus: number;
  signupBonus: number;
  birthdayBonus: number;
  enableNotifications: boolean;
  enableTiers: boolean;
  enableReferrals: boolean;
  maxPointsPerTransaction?: number;
}

export interface CustomerLoyalty {
  id: string;
  customerId: string;
  tenantId: string;
  programId: string;
  currentPoints: number;
  lifetimePoints: number;
  currentTier?: string;
  joinDate: Date;
  lastActivity: Date;
  status: 'active' | 'inactive' | 'suspended';
  metadata: {
    totalSpent: number;
    totalTransactions: number;
    averageTransactionValue: number;
    lastPurchaseDate?: Date;
    preferredCategories: string[];
  };
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  tenantId: string;
  programId: string;
  transactionType: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  description: string;
  relatedTransactionId?: string;
  createdAt: Date;
}

// â”€â”€â”€ NestJS Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Injectable()
export class LoyaltyEngineService {
  private readonly logger = new Logger(LoyaltyEngineService.name);

  constructor(
    private readonly eventBus: EventBusService,
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>, // REQ-LOY-001: DB injection for loyalty persistence
  ) {}

  /**
   * REQ-LOY-001: Persist earned points to loyalty_transactions and update loyalty_accounts.
   * Must be called AFTER calculatePointsForTransaction() returns pointsEarned > 0.
   * Uses idempotency_key to prevent double-earning on retry.
   */
  async persistPointsEarned(
    tenantId: string,
    loyaltyAccountId: string,
    orderId: string,
    pointsEarned: number,
    description: string,
  ): Promise<void> {
    if (pointsEarned <= 0) return;
    const idempotencyKey = `earn:${orderId}:${loyaltyAccountId}`;
    try {
      await (this.db as any).transaction(async (tx) => {
        // Idempotency check â€” migration 012 has UNIQUE constraint on idempotency_key
        const existing = await tx.execute(sql`
          SELECT id FROM loyalty_transactions
          WHERE idempotency_key = ${idempotencyKey}
        `);
        const existingRows = ((existing as unknown) as any[]);
        if (existingRows && existingRows.length > 0) {
          this.logger.warn(`Loyalty earn already recorded for key ${idempotencyKey}`);
          return;
        }
        // Write immutable transaction record
        await tx.execute(sql`
          INSERT INTO loyalty_transactions
            (id, tenant_id, loyalty_account_id, transaction_type, points, description, related_order_id, idempotency_key, created_at)
          VALUES
            (${randomUUID()}, ${tenantId}::uuid, ${loyaltyAccountId}::uuid, 'EARN', ${pointsEarned}, ${description}, ${orderId}::uuid, ${idempotencyKey}, NOW())
        `);
        // Update account balance atomically
        await tx.execute(sql`
          UPDATE loyalty_accounts
          SET points_balance = points_balance + ${pointsEarned},
              lifetime_points = lifetime_points + ${pointsEarned},
              last_activity_at = NOW(),
              updated_at = NOW()
          WHERE id = ${loyaltyAccountId}::uuid AND tenant_id = ${tenantId}::uuid
        `);
      });
      this.logger.log(`Persisted ${pointsEarned} pts to account ${loyaltyAccountId} for order ${orderId}`);
    } catch (err) {
      this.logger.error(`persistPointsEarned failed: ${err.message}`, err.stack);
      throw err; // Do NOT swallow â€” caller must know persistence failed
    }
  }

  /**
   * REQ-LOY-002: Atomically debit loyalty_accounts for a redemption.
   */
  async persistRedemption(
    tenantId: string,
    loyaltyAccountId: string,
    orderId: string,
    pointsRedeemed: number,
    rewardName: string,
  ): Promise<void> {
    if (pointsRedeemed <= 0) return;
    const idempotencyKey = `redeem:${orderId}:${loyaltyAccountId}`;
    await (this.db as any).transaction(async (tx) => {
      const existing = await tx.execute(sql`
        SELECT id FROM loyalty_transactions WHERE idempotency_key = ${idempotencyKey}
      `);
      const existingRows2 = ((existing as unknown) as any[]);
      if (existingRows2 && existingRows2.length > 0) return; // Already redeemed
      await tx.execute(sql`
        INSERT INTO loyalty_transactions
          (id, tenant_id, loyalty_account_id, transaction_type, points, description, related_order_id, idempotency_key, created_at)
        VALUES
          (${randomUUID()}, ${tenantId}::uuid, ${loyaltyAccountId}::uuid, 'REDEEM', ${-pointsRedeemed}, ${'Redeemed: ' + rewardName}, ${orderId}::uuid, ${idempotencyKey}, NOW())
      `);
      await tx.execute(sql`
        UPDATE loyalty_accounts
        SET points_balance = points_balance - ${pointsRedeemed},
            updated_at = NOW()
        WHERE id = ${loyaltyAccountId}::uuid
          AND tenant_id = ${tenantId}::uuid
          AND points_balance >= ${pointsRedeemed}
      `);
    });
  }

  /**
   * REQ-LOY-003: Update tier after evaluation.
   */
  async persistTierUpgrade(tenantId: string, loyaltyAccountId: string, newTierId: string): Promise<void> {
    await (this.db as any).execute(sql`
      UPDATE loyalty_accounts
      SET tier_id = ${newTierId}::uuid,
          updated_at = NOW()
      WHERE id = ${loyaltyAccountId}::uuid AND tenant_id = ${tenantId}::uuid
    `);
  }

  /**
   * Calculate points earned for a transaction against program rules.
   */
  calculatePointsForTransaction(
    program: LoyaltyProgram,
    transactionData: { amount: number; paymentMethod?: string; productCategories?: string[]; locationId?: string },
  ): { pointsEarned: number; matchedRules: string[] } {
    let pointsEarned = 0;
    const matchedRules: string[] = [];

    for (const rule of program.rules) {
      if (rule.ruleType !== 'earn' || !rule.isActive) continue;

      if (this.doesTransactionMatchRule(rule, transactionData)) {
        const pts = this.calculateRulePoints(rule, transactionData.amount);
        pointsEarned += pts;
        matchedRules.push(rule.id);
      }
    }

    // Apply cap
    if (program.settings.maxPointsPerTransaction && pointsEarned > program.settings.maxPointsPerTransaction) {
      pointsEarned = program.settings.maxPointsPerTransaction;
    }

    return { pointsEarned, matchedRules };
  }

  /**
   * Attempt to redeem points for a reward.
   */
  validateRedemption(
    customerLoyalty: CustomerLoyalty,
    reward: LoyaltyReward,
    program: LoyaltyProgram,
  ): { valid: boolean; reason?: string } {
    if (customerLoyalty.status !== 'active') return { valid: false, reason: 'Loyalty account is not active' };
    if (customerLoyalty.currentPoints < reward.cost) return { valid: false, reason: 'Insufficient points' };
    if (!reward.isActive) return { valid: false, reason: 'Reward is no longer available' };
    if (reward.availability.maxRedemptions &&
        reward.availability.currentRedemptions >= reward.availability.maxRedemptions) {
      return { valid: false, reason: 'Reward has reached maximum redemptions' };
    }
    return { valid: true };
  }

  /**
   * Check if a customer qualifies for a tier upgrade.
   */
  evaluateTierUpgrade(
    customerLoyalty: CustomerLoyalty,
    settings: LoyaltyProgramSettings,
  ): { upgraded: boolean; newTier?: string; previousTier?: string } {
    if (!settings.enableTiers || !settings.tierThresholds) {
      return { upgraded: false };
    }

    const currentTier = customerLoyalty.currentTier ?? 'bronze';
    let newTier = currentTier;
    let highestThreshold = 0;

    for (const [tier, threshold] of Object.entries(settings.tierThresholds)) {
      if (customerLoyalty.lifetimePoints >= threshold && threshold > highestThreshold) {
        newTier = tier;
        highestThreshold = threshold;
      }
    }

    if (newTier !== currentTier) {
      this.logger.log(`[LOYALTY] Tier upgrade: ${currentTier} â†’ ${newTier} | cust=${customerLoyalty.customerId}`);
      return { upgraded: true, newTier, previousTier: currentTier };
    }

    return { upgraded: false };
  }

  /**
   * Build a new customer loyalty record with signup bonus.
   */
  buildEnrollment(
    customerId: string,
    tenantId: string,
    program: LoyaltyProgram,
  ): { customerLoyalty: CustomerLoyalty; signupTransaction?: LoyaltyTransaction } {
    const bonus = program.settings.signupBonus ?? 0;

    const customerLoyalty: CustomerLoyalty = {
      id: `cl_${customerId}_${program.id}`,
      customerId,
      tenantId,
      programId: program.id,
      currentPoints: bonus,
      lifetimePoints: bonus,
      joinDate: new Date(),
      lastActivity: new Date(),
      status: 'active',
      metadata: {
        totalSpent: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
        preferredCategories: [],
      },
    };

    let signupTransaction: LoyaltyTransaction | undefined;
    if (bonus > 0) {
      signupTransaction = {
        id: `lt_signup_${customerId}_${Date.now()}`,
        customerId,
        tenantId,
        programId: program.id,
        transactionType: 'earn',
        points: bonus,
        description: 'Signup bonus',
        createdAt: new Date(),
      };
    }

    return { customerLoyalty, signupTransaction };
  }

  /**
   * Update preferred categories from purchase history (top-5 by frequency).
   */
  updatePreferredCategories(existing: string[], newCategories: string[]): string[] {
    const freq = new Map<string, number>();
    existing.forEach(c => freq.set(c, (freq.get(c) ?? 0) + 1));
    newCategories.forEach(c => freq.set(c, (freq.get(c) ?? 0) + 1));
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  }

  // â”€â”€â”€ Rule Matching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private doesTransactionMatchRule(
    rule: LoyaltyRule,
    txn: { amount: number; paymentMethod?: string; productCategories?: string[]; locationId?: string },
  ): boolean {
    const { condition } = rule;
    if (condition.minAmount && txn.amount < condition.minAmount) return false;
    if (condition.paymentMethods?.length && txn.paymentMethod && !condition.paymentMethods.includes(txn.paymentMethod)) return false;
    if (condition.productCategories?.length && txn.productCategories) {
      if (!condition.productCategories.some(c => txn.productCategories!.includes(c))) return false;
    }
    if (condition.locations?.length && txn.locationId && !condition.locations.includes(txn.locationId)) return false;
    return true;
  }

  private calculateRulePoints(rule: LoyaltyRule, amount: number): number {
    const { reward } = rule;
    let points = 0;
    switch (reward.unit) {
      case 'fixed': points = reward.value; break;
      case 'percentage': points = Math.floor((amount * reward.value) / 100); break;
      case 'multiplier': points = Math.floor(amount * reward.value); break;
    }
    if (reward.maxValue && points > reward.maxValue) points = reward.maxValue;
    return points;
  }
}

