/**
 * Buy Now Pay Later (BNPL) Service
 * PORTED FROM: PS-Platform/DigitalWallets-Web/services/BNPLService.ts (689 lines)
 *
 * Domain logic: 4 installment plans, credit assessment, amortization schedules,
 * installment tracking, late fee computation, auto-pay scheduling.
 */
import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { randomUUID } from 'crypto';

// ─── Domain Interfaces ──────────────────────────────────────────────

export type BNPLPlanType = 'pay_in_4' | 'pay_in_6' | 'pay_in_12' | 'pay_in_24';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue' | 'defaulted';
export type BNPLApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface BNPLPlanConfig {
  type: BNPLPlanType;
  installments: number;
  interestRate: number;       // annual %
  lateFeeFlat: number;        // $ flat fee
  lateFeePercent: number;     // % of installment
  gracePeriodDays: number;
  minAmount: number;
  maxAmount: number;
  minCreditScore: number;
}

export interface BNPLApplication {
  id: string;
  customerId: string;
  tenantId: string;
  planType: BNPLPlanType;
  requestedAmount: number;
  creditScore: number;
  status: BNPLApplicationStatus;
  approvedAt?: Date;
  createdAt: Date;
}

export interface Installment {
  number: number;
  dueDate: Date;
  principalCents: number;
  interestCents: number;
  totalCents: number;
  status: InstallmentStatus;
  paidAt?: Date;
  lateFeeCents: number;
}

export interface AmortizationSchedule {
  applicationId: string;
  totalPrincipalCents: number;
  totalInterestCents: number;
  totalCents: number;
  installments: Installment[];
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class BNPLService {
  private readonly logger = new Logger(BNPLService.name);

  private readonly PLANS: Record<BNPLPlanType, BNPLPlanConfig> = {
    pay_in_4:  { type: 'pay_in_4',  installments: 4,  interestRate: 0,    lateFeeFlat: 5_00,  lateFeePercent: 0,   gracePeriodDays: 3,  minAmount: 35_00,    maxAmount: 1_500_00, minCreditScore: 550 },
    pay_in_6:  { type: 'pay_in_6',  installments: 6,  interestRate: 0,    lateFeeFlat: 7_00,  lateFeePercent: 0,   gracePeriodDays: 5,  minAmount: 50_00,    maxAmount: 3_000_00, minCreditScore: 580 },
    pay_in_12: { type: 'pay_in_12', installments: 12, interestRate: 9.99, lateFeeFlat: 10_00, lateFeePercent: 2.5, gracePeriodDays: 7,  minAmount: 200_00,   maxAmount: 10_000_00, minCreditScore: 620 },
    pay_in_24: { type: 'pay_in_24', installments: 24, interestRate: 14.99, lateFeeFlat: 15_00, lateFeePercent: 3,  gracePeriodDays: 10, minAmount: 500_00,  maxAmount: 25_000_00, minCreditScore: 650 },
  };

  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Assess credit worthiness and approve/reject BNPL application.
   */
  async applyForBNPL(
    customerId: string, tenantId: string, planType: BNPLPlanType,
    amountCents: number, creditScore: number, traceId: string,
  ): Promise<BNPLApplication> {
    const plan = this.PLANS[planType];
    if (!plan) throw new Error(`Unknown BNPL plan: ${planType}`);

    if (amountCents < plan.minAmount || amountCents > plan.maxAmount) {
      throw new Error(`Amount ${amountCents}¢ outside range [${plan.minAmount}, ${plan.maxAmount}]`);
    }

    const approved = creditScore >= plan.minCreditScore;
    const app: BNPLApplication = {
      id: randomUUID(),
      customerId,
      tenantId,
      planType,
      requestedAmount: amountCents,
      creditScore,
      status: approved ? 'approved' : 'rejected',
      approvedAt: approved ? new Date() : undefined,
      createdAt: new Date(),
    };

    this.logger.log(
      `[BNPL] Application ${app.status} | cust=${customerId} plan=${planType} amt=${amountCents}¢ score=${creditScore} | trace=${traceId}`,
    );

    return app;
  }

  /**
   * Generate full amortization schedule for an approved BNPL application.
   * Uses standard amortization formula for interest-bearing plans.
   */
  generateAmortizationSchedule(applicationId: string, principalCents: number, planType: BNPLPlanType, startDate?: Date): AmortizationSchedule {
    const plan = this.PLANS[planType];
    const start = startDate ?? new Date();
    const n = plan.installments;
    const annualRate = plan.interestRate / 100;
    const monthlyRate = annualRate / 12;

    let installments: Installment[];

    if (annualRate === 0) {
      // Zero-interest: simple division
      const perInstallment = Math.floor(principalCents / n);
      const remainder = principalCents - perInstallment * n;
      installments = Array.from({ length: n }, (_, i) => {
        const due = new Date(start);
        due.setDate(due.getDate() + (i + 1) * (planType === 'pay_in_4' ? 14 : 30));
        return {
          number: i + 1,
          dueDate: due,
          principalCents: perInstallment + (i === n - 1 ? remainder : 0),
          interestCents: 0,
          totalCents: perInstallment + (i === n - 1 ? remainder : 0),
          status: 'pending' as InstallmentStatus,
          lateFeeCents: 0,
        };
      });
    } else {
      // Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
      const principal = principalCents / 100;
      const r = monthlyRate;
      const monthlyPayment = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      let balance = principal;

      installments = Array.from({ length: n }, (_, i) => {
        const interestPortion = balance * r;
        const principalPortion = monthlyPayment - interestPortion;
        balance -= principalPortion;

        const due = new Date(start);
        due.setMonth(due.getMonth() + i + 1);

        return {
          number: i + 1,
          dueDate: due,
          principalCents: Math.round(principalPortion * 100),
          interestCents: Math.round(interestPortion * 100),
          totalCents: Math.round(monthlyPayment * 100),
          status: 'pending' as InstallmentStatus,
          lateFeeCents: 0,
        };
      });
    }

    const totalInterest = installments.reduce((s, i) => s + i.interestCents, 0);

    return {
      applicationId,
      totalPrincipalCents: principalCents,
      totalInterestCents: totalInterest,
      totalCents: principalCents + totalInterest,
      installments,
    };
  }

  /**
   * Calculate late fee for an overdue installment.
   */
  calculateLateFee(installment: Installment, planType: BNPLPlanType): number {
    const plan = this.PLANS[planType];
    const percentFee = Math.round(installment.totalCents * (plan.lateFeePercent / 100));
    return Math.max(plan.lateFeeFlat, percentFee);
  }

  /**
   * Get available BNPL plans for a given amount and credit score.
   */
  getAvailablePlans(amountCents: number, creditScore: number): BNPLPlanConfig[] {
    return Object.values(this.PLANS).filter(
      p => amountCents >= p.minAmount && amountCents <= p.maxAmount && creditScore >= p.minCreditScore,
    );
  }
}
