/**
 * Savings Calculator (Competitive Analysis Engine)
 * PORTED FROM: PS-Platform/shared/services/AdvancedSavingsService.ts (435 lines)
 *
 * Industry-specific rate comparison vs Square/Stripe/PayPal/Clover/Toast.
 * Used by sales team and merchant onboarding to demonstrate PaySurity cost savings.
 */
import { Injectable, Logger } from '@nestjs/common';

export interface SavingsInput {
  businessType: 'restaurant' | 'retail' | 'grocery' | 'ecommerce' | 'professional_services';
  monthlyVolume: number;           // in dollars
  averageTicketSize: number;       // in dollars
  monthlyTransactions: number;
  currentProcessor?: string;
  currentRate?: number;            // effective rate as decimal (e.g. 0.0275)
}

export interface SavingsResult {
  currentMonthlyCost: number;
  paysurityMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  savingsPercentage: number;
  competitorComparison: Array<{
    competitor: string;
    monthlyCost: number;
    differenceVsPaysurity: number;
  }>;
}

@Injectable()
export class SavingsCalculatorService {
  private readonly logger = new Logger(SavingsCalculatorService.name);

  // PaySurity's rates by industry (interchange+ model)
  private readonly PAYSURITY_RATES: Record<string, { rate: number; perTxn: number; monthlyFee: number }> = {
    restaurant:             { rate: 0.0225, perTxn: 0.10, monthlyFee: 49 },
    retail:                 { rate: 0.0195, perTxn: 0.10, monthlyFee: 39 },
    grocery:                { rate: 0.0185, perTxn: 0.08, monthlyFee: 39 },
    ecommerce:              { rate: 0.0285, perTxn: 0.15, monthlyFee: 29 },
    professional_services:  { rate: 0.0265, perTxn: 0.10, monthlyFee: 29 },
  };

  // Competitor effective rates (publicly available pricing)
  private readonly COMPETITOR_RATES: Record<string, { rate: number; perTxn: number; monthlyFee: number }> = {
    'Square':   { rate: 0.0260, perTxn: 0.10, monthlyFee: 0 },
    'Stripe':   { rate: 0.0290, perTxn: 0.30, monthlyFee: 0 },
    'PayPal':   { rate: 0.0349, perTxn: 0.49, monthlyFee: 0 },
    'Clover':   { rate: 0.0290, perTxn: 0.10, monthlyFee: 14.95 },
    'Toast':    { rate: 0.0299, perTxn: 0.15, monthlyFee: 69 },
  };

  calculateSavings(input: SavingsInput): SavingsResult {
    const psRate = this.PAYSURITY_RATES[input.businessType] ?? this.PAYSURITY_RATES['retail']!;

    // Adjust for ticket size (higher tickets get slightly better effective rates)
    const ticketAdjustment = input.averageTicketSize > 100 ? 0.998 : input.averageTicketSize > 50 ? 0.999 : 1.0;

    const paysurityMonthlyCost = 
      (input.monthlyVolume * psRate.rate * ticketAdjustment) +
      (input.monthlyTransactions * psRate.perTxn) +
      psRate.monthlyFee;

    // Current processor cost
    const currentRate = input.currentRate ?? 0.0275;
    const currentMonthlyCost = input.monthlyVolume * currentRate + (input.monthlyTransactions * 0.15) + 25;

    const monthlySavings = currentMonthlyCost - paysurityMonthlyCost;

    // Competitor comparison
    const competitorComparison = Object.entries(this.COMPETITOR_RATES).map(([name, rates]) => {
      const cost = (input.monthlyVolume * rates.rate) + (input.monthlyTransactions * rates.perTxn) + rates.monthlyFee;
      return {
        competitor: name,
        monthlyCost: Math.round(cost * 100) / 100,
        differenceVsPaysurity: Math.round((cost - paysurityMonthlyCost) * 100) / 100,
      };
    });

    const result: SavingsResult = {
      currentMonthlyCost: Math.round(currentMonthlyCost * 100) / 100,
      paysurityMonthlyCost: Math.round(paysurityMonthlyCost * 100) / 100,
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(monthlySavings * 12 * 100) / 100,
      savingsPercentage: currentMonthlyCost > 0 ? Math.round((monthlySavings / currentMonthlyCost) * 10000) / 100 : 0,
      competitorComparison,
    };

    this.logger.log(`[SAVINGS] ${input.businessType} vol=$${input.monthlyVolume} → save $${result.monthlySavings}/mo ($${result.annualSavings}/yr)`);
    return result;
  }
}
