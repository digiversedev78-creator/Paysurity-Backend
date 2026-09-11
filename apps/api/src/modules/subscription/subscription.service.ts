/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SUB-004 â€” Proration on Plan Change
 * FILE TYPE:    SERVICE
 * MODULE:       subscription
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/SUB_SUBSCRIPTION_BILLING.md
 * WORKER:       CODER-106
 * GENERATED:    2026-03-18T10:36:29.502Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, Logger, BadRequestException, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';
import { addMonths, addYears, differenceInDays, format, getDaysInMonth } from 'date-fns';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Define DB Interfaces matching Canonical Schema
interface SubscriptionPlanDbRecord {
  id: string;
  plan_code: string;
  monthly_fee_cents: number;
  annual_fee_cents: number;
}

interface MerchantSubscriptionDbRecord {
  id: string;
  tenant_id: string;
  plan_id: string;
  billing_cycle: 'MONTHLY' | 'ANNUAL';
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'GRACE' | 'RESTRICTED' | 'TERMINATED';
  current_period_start: Date;
  current_period_end: Date;
  next_billing_date: Date;
  pending_plan_id: string | null;
  pending_effective_date: Date | null;
  payment_method_type: 'ACH' | 'CARD' | 'SETTLEMENT_DEDUCTION';
  payment_method_ref: string | null;
}

interface SubscriptionInvoiceDbRecord {
  id: string;
  tenant_id: string;
  subscription_id: string;
  invoice_number: string;
  period_start: Date;
  period_end: Date;
  due_date: Date;
  plan_fee_cents: number;
  proration_credit_cents: number;
  proration_charge_cents: number;
  total_cents: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOIDED' | 'DISPUTED';
}

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generates a new invoice for the upcoming billing period.
   * Typically called by a cron job N days before current period ends.
   */
  async generateInvoice(subscriptionId: string): Promise<SubscriptionInvoiceDbRecord> {
    const subResult = await (this.db as any).execute(sql`
      SELECT s.*, p.monthly_fee_cents, p.annual_fee_cents
      FROM merchant_subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ${subscriptionId};
    `);
    const sub = ((subResult as any).rows as any)[0] as MerchantSubscriptionDbRecord & SubscriptionPlanDbRecord;
    
    if (!sub) throw new NotFoundException('Subscription not found');

    const amount = sub.billing_cycle === 'MONTHLY' ? sub.monthly_fee_cents : sub.annual_fee_cents;
    const invNumber = 'INV-' + sub.tenant_id.substring(0,6) + '-' + format(new Date(), 'yyyyMMdd-HHmmss');
    
    // Future period start is next_billing_date
    const pStart = sub.next_billing_date;
    const pEnd = sub.billing_cycle === 'MONTHLY' ? addMonths(pStart, 1) : addYears(pStart, 1);
    const dDate = pStart; // Due on the billing date

    const invResult = await (this.db as any).execute(sql`
      INSERT INTO subscription_invoices (
        tenant_id, subscription_id, invoice_number, period_start, period_end, due_date,
        plan_fee_cents, proration_credit_cents, proration_charge_cents, total_cents, status
      ) VALUES (
        ${sub.tenant_id}, ${sub.id}, ${invNumber}, ${pStart}, ${pEnd}, ${dDate},
        ${amount}, 0, 0, ${amount}, 'ISSUED'
      ) RETURNING *;
    `);

    // In a full implementation, generate PDF here and upload to GCS.
    return ((invResult as any).rows as any)[0] as SubscriptionInvoiceDbRecord;
  }

  /**
   * Processes payment for an issued or overdue invoice.
   */
  async processPayment(invoiceId: string): Promise<void> {
    const invResult = await (this.db as any).execute(sql`SELECT * FROM subscription_invoices WHERE id = ${invoiceId} FOR UPDATE;`);
    const inv = ((invResult as any).rows as any)[0] as SubscriptionInvoiceDbRecord;
    if (!inv) throw new NotFoundException('Invoice not found');

    const subResult = await (this.db as any).execute(sql`SELECT * FROM merchant_subscriptions WHERE id = ${inv.subscription_id};`);
    const sub = ((subResult as any).rows as any)[0] as MerchantSubscriptionDbRecord;

    try {
      // Mock payment success based on payment method config
      // In reality, this would trigger SETTLEMENT_DEDUCTION queue or ORC payment capture
      this.logger.log(`Charging ${inv.total_cents} via ${sub.payment_method_type} for Invoice ${inv.invoice_number}`);
      
      await (this.db as any).execute(sql`
        UPDATE subscription_invoices SET status = 'PAID', paid_at = NOW(), updated_at = NOW() WHERE id = ${inv.id};
      `);
      
      // Extend subscription dates
      const newStart = inv.period_start;
      const newEnd = inv.period_end;
      await (this.db as any).execute(sql`
        UPDATE merchant_subscriptions 
        SET status = 'ACTIVE', 
            current_period_start = ${newStart}, 
            current_period_end = ${newEnd},
            next_billing_date = ${newEnd},
            overdue_since = NULL,
            updated_at = NOW()
        WHERE id = ${sub.id};
      `);
      
      this.eventEmitter.emit('subscription.payment.success', { tenantId: sub.tenant_id, invoice: inv });
    } catch (err) {
      await (this.db as any).execute(sql`
        UPDATE subscription_invoices 
        SET payment_attempt_count = payment_attempt_count + 1, last_attempt_at = NOW(), 
            last_failure_reason = ${err.message}, status = 'OVERDUE'
        WHERE id = ${inv.id};
      `);
      
      this.eventEmitter.emit('subscription.payment.failed', { tenantId: sub.tenant_id, invoice: inv });
    }
  }

  /**
   * AMBIGUITY #10 CLOSED: Upgrades happen IMMEDIATE_DAILY.
   * Calculates difference in daily rates, issues proration invoice, and changes plan immediately.
   */
  async handleUpgrade(subscriptionId: string, newPlanCode: string, requestedBy: string): Promise<void> {
    const subResult = await (this.db as any).execute(sql`
      SELECT s.*, p.monthly_fee_cents as curr_monthly, p.plan_code as curr_code
      FROM merchant_subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.id = ${subscriptionId} FOR UPDATE;
    `);
    const sub = (subResult as any).rows[0] as any;
    if (!sub) throw new NotFoundException('Subscription not found');

    const newPlanResult = await (this.db as any).execute(sql`SELECT * FROM subscription_plans WHERE plan_code = ${newPlanCode};`);
    const newPlan = (newPlanResult as any).rows[0] as any;
    if (!newPlan) throw new NotFoundException('New plan not found');

    // Only allow MONTHLY proration logic for this MVP to avoid extreme complexity
    if (sub.billing_cycle !== 'MONTHLY') throw new BadRequestException('Only monthly upgrades supported in dev prototype.');
    
    if (newPlan.monthly_fee_cents <= sub.curr_monthly) {
      throw new BadRequestException('Target plan must be more expensive to be an upgrade.');
    }

    const today = new Date();
    const daysInMonth = getDaysInMonth(sub.current_period_start);
    const unutilizedDays = differenceInDays(sub.current_period_end, today);
    if (unutilizedDays <= 0) throw new BadRequestException('Period already over, cannot prorate.');

    // Proration Math: (New Daily Rate - Old Daily Rate) * Remaining Days
    const oldDaily = sub.curr_monthly / daysInMonth;
    const newDaily = newPlan.monthly_fee_cents / daysInMonth;
    const prorationCharge = Math.round((newDaily - oldDaily) * unutilizedDays);

    const invNumber = 'PRV-' + sub.tenant_id.substring(0,6) + '-' + format(today, 'yyyyMMdd-HHmmss');

    // 1. Create Proration Invoice
    await (this.db as any).execute(sql`
      INSERT INTO subscription_invoices (
        tenant_id, subscription_id, invoice_number, period_start, period_end, due_date,
        plan_fee_cents, proration_credit_cents, proration_charge_cents, total_cents, status
      ) VALUES (
        ${sub.tenant_id}, ${sub.id}, ${invNumber}, ${format(today, 'yyyy-MM-dd')}, ${format(sub.current_period_end, 'yyyy-MM-dd')}, ${format(today, 'yyyy-MM-dd')},
        0, 0, ${prorationCharge}, ${prorationCharge}, 'ISSUED'
      );
    `);

    // 2. Upgrade immediately
    await (this.db as any).execute(sql`
      UPDATE merchant_subscriptions 
      SET plan_id = ${newPlan.id}, updated_at = NOW()
      WHERE id = ${sub.id};
    `);

    (this.auditLogService as any).record(sub.tenant_id, {
      userId: requestedBy,
      action: 'SUBSCRIPTION_UPGRADED',
      details: { oldPlan: sub.curr_code, newPlan: newPlan.plan_code, prorationCharge },
    });
    
    this.eventEmitter.emit('subscription.upgraded', { tenantId: sub.tenant_id, plan: newPlanCode });
  }

  /**
   * AMBIGUITY #10 CLOSED: Downgrades happen at PERIOD_END.
   * Sets pending_plan_id to apply on next billing cycle.
   */
  async handleDowngrade(subscriptionId: string, newPlanCode: string, requestedBy: string): Promise<void> {
    const subResult = await (this.db as any).execute(sql`SELECT * FROM merchant_subscriptions WHERE id = ${subscriptionId} FOR UPDATE;`);
    const sub = (subResult as any).rows[0] as any;
    if (!sub) throw new NotFoundException('Subscription not found');

    const newPlanResult = await (this.db as any).execute(sql`SELECT * FROM subscription_plans WHERE plan_code = ${newPlanCode};`);
    const newPlan = (newPlanResult as any).rows[0] as any;
    if (!newPlan) throw new NotFoundException('New plan not found');

    // Store pending downgrade
    await (this.db as any).execute(sql`
      UPDATE merchant_subscriptions 
      SET pending_plan_id = ${newPlan.id}, pending_effective_date = ${sub.current_period_end}, updated_at = NOW()
      WHERE id = ${sub.id};
    `);

    (this.auditLogService as any).record(sub.tenant_id, {
      userId: requestedBy,
      action: 'SUBSCRIPTION_DOWNGRADE_SCHEDULED',
      details: { effectiveDate: sub.current_period_end, newPlan: newPlan.plan_code },
    });
    
    this.eventEmitter.emit('subscription.downgrade_scheduled', { tenantId: sub.tenant_id, plan: newPlanCode });
  }

  // ==== BATCH JOBS ====

  @Cron('0 8 * * *')
  async billingCycle() {
    this.logger.log('Starting daily billing cycle...');
    const result = await (this.db as any).execute(sql`
      SELECT id FROM merchant_subscriptions 
      WHERE next_billing_date = CURRENT_DATE AND status IN ('ACTIVE', 'TRIALING');
    `);
    
    for (const row of ((result as any).rows as any[])) {
      try {
        const inv = await this.generateInvoice(row.id);
        await this.processPayment(inv.id);
      } catch (e) {
        this.logger.error(`Billing failed for ${row.id}`, e.stack);
      }
    }
  }

  @Cron('0 0 * * *')
  async applyPendingDowngrades() {
    this.logger.log('Applying pending downgrades...');
    const result = await (this.db as any).execute(sql`
      SELECT id, pending_plan_id, tenant_id FROM merchant_subscriptions 
      WHERE pending_plan_id IS NOT NULL AND pending_effective_date <= CURRENT_DATE;
    `);
    
    for (const row of ((result as any).rows as any[])) {
      await (this.db as any).execute(sql`
        UPDATE merchant_subscriptions 
        SET plan_id = ${row.pending_plan_id}, pending_plan_id = NULL, pending_effective_date = NULL
        WHERE id = ${row.id};
      `);
      this.logger.log(`Downgraded subscription ${row.id}`);
      this.eventEmitter.emit('subscription.downgraded', { tenantId: row.tenant_id });
    }
  }

  @Cron('0 9 * * *')
  async dunning() {
    this.logger.log('Running Dunning process for PAST_DUE...');
    // In production, this would query PAST_DUE and try charge again, send emails if day 1/3/5.
  }
}



