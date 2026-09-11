/**
 * PaySurity Payroll Calculation Engine
 * PORTED FROM: PS-Platform/Payroll-API/src/services/PayrollCalculationEngine.ts (779 lines)
 * Comprehensive payroll processing with tax calculations, deductions, and compliance
 *
 * REQ: PAY-001, PAY-002, PAY-003, PAY-004, PAY-005
 */
import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';

// ─── Domain Interfaces ──────────────────────────────────────────────

export interface PayrollEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  ssn: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  payrollInfo: {
    payType: 'hourly' | 'salary' | 'commission';
    baseRate: number;
    payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
    exemptions: number;
    filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
    additionalWithholding: number;
    isExemptFromFederal: boolean;
    isExemptFromState: boolean;
    isExemptFromSocialSecurity: boolean;
    isExemptFromMedicare: boolean;
  };
  deductions: {
    preTax: Array<{
      type: 'health_insurance' | '401k' | 'dental' | 'vision' | 'hsa' | 'fsa' | 'parking' | 'transit';
      amount: number;
      isPercentage: boolean;
      limit?: number;
    }>;
    postTax: Array<{
      type: 'union_dues' | 'charity' | 'loan_repayment' | 'garnishment' | 'other';
      amount: number;
      isPercentage: boolean;
      priority: number;
    }>;
  };
  isActive: boolean;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  payPeriodId: string;
  date: Date;
  regularHours: number;
  overtimeHours: number;
  doubleTimeHours: number;
  sickHours: number;
  vacationHours: number;
  holidayHours: number;
  breakMinutes: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  status: 'open' | 'processing' | 'calculated' | 'approved' | 'paid' | 'closed';
}

export interface GrossPayBreakdown {
  regularPay: number;
  overtimePay: number;
  doubleTimePay: number;
  sickPay: number;
  vacationPay: number;
  holidayPay: number;
  bonusPay: number;
  commissionPay: number;
  otherPay: number;
  total: number;
}

export interface PreTaxDeductions {
  healthInsurance: number;
  dentalInsurance: number;
  visionInsurance: number;
  retirement401k: number;
  hsa: number;
  fsa: number;
  parking: number;
  transit: number;
  other: number;
  total: number;
}

export interface TaxBreakdown {
  federalIncomeTax: number;
  stateIncomeTax: number;
  localIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  sdi: number;
  sui: number;
  total: number;
}

export interface PostTaxDeductions {
  unionDues: number;
  charity: number;
  loanRepayment: number;
  garnishments: number;
  other: number;
  total: number;
}

export interface YearToDate {
  grossPay: number;
  federalTaxWithheld: number;
  stateTaxWithheld: number;
  socialSecurityTaxWithheld: number;
  medicareTaxWithheld: number;
  retirement401k: number;
  netPay: number;
}

export interface PayrollCalculation {
  id: string;
  employeeId: string;
  payPeriodId: string;
  grossPay: GrossPayBreakdown;
  preTaxDeductions: PreTaxDeductions;
  taxableIncome: number;
  taxes: TaxBreakdown;
  postTaxDeductions: PostTaxDeductions;
  netPay: number;
  yearToDate: YearToDate;
  calculatedAt: Date;
  status: 'calculated' | 'approved' | 'paid' | 'voided';
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  base: number;
}

export interface TaxTable {
  year: number;
  federalBrackets: Array<{
    filingStatus: string;
    brackets: TaxBracket[];
  }>;
  stateBrackets: Record<string, TaxBracket[]>;
  socialSecurityRate: number;
  socialSecurityWageBase: number;
  medicareRate: number;
  additionalMedicareRate: number;
  additionalMedicareThreshold: Record<string, number>;
  standardDeductions: Record<string, number>;
  personalExemption: number;
}

// ─── NestJS Injectable Service ──────────────────────────────────────

@Injectable()
export class PayrollCalculationEngine {
  private readonly logger = new Logger(PayrollCalculationEngine.name);
  private readonly taxTables = new Map<number, TaxTable>();

  constructor(private readonly eventBus: EventBusService) {
    this.initializeTaxTables();
  }

  /**
   * Calculate full payroll for one employee × one pay period.
   * Pipeline: gross → pre-tax deductions → taxable income → taxes → post-tax → net
   */
  async calculatePayroll(
    employee: PayrollEmployee,
    timeEntries: TimeEntry[],
    payPeriod: PayPeriod,
    ytdData?: { socialSecurityWages: number; totalWages: number },
    traceId?: string,
  ): Promise<PayrollCalculation> {
    if (!employee.isActive) {
      throw new Error('Employee is not active');
    }

    const grossPay = this.calculateGrossPay(employee, timeEntries, payPeriod);
    const preTaxDeductions = this.calculatePreTaxDeductions(employee, grossPay.total);
    const taxableIncome = grossPay.total - preTaxDeductions.total;
    const taxes = this.calculateTaxes(employee, taxableIncome, payPeriod, ytdData);
    const postTaxDeductions = this.calculatePostTaxDeductions(employee, taxableIncome - taxes.total);
    const netPay = taxableIncome - taxes.total - postTaxDeductions.total;

    const calcId = `calc_${employee.id}_${payPeriod.id}_${Date.now()}`;
    const calculation: PayrollCalculation = {
      id: calcId,
      employeeId: employee.id,
      payPeriodId: payPeriod.id,
      grossPay,
      preTaxDeductions,
      taxableIncome,
      taxes,
      postTaxDeductions,
      netPay,
      yearToDate: {
        grossPay: 0, federalTaxWithheld: 0, stateTaxWithheld: 0,
        socialSecurityTaxWithheld: 0, medicareTaxWithheld: 0, retirement401k: 0, netPay: 0,
      },
      calculatedAt: new Date(),
      status: 'calculated',
    };

    this.logger.log(
      `[PAY] Payroll calculated | emp=${employee.id} gross=${grossPay.total} net=${netPay} | trace=${traceId}`,
    );

    return calculation;
  }

  /**
   * Batch-process an entire pay period for all employees.
   */
  async processPayPeriod(
    employees: PayrollEmployee[],
    timeEntriesByEmployee: Map<string, TimeEntry[]>,
    payPeriod: PayPeriod,
    traceId: string,
  ): Promise<{ calculations: PayrollCalculation[]; errors: Array<{ employeeId: string; error: string }> }> {
    const calculations: PayrollCalculation[] = [];
    const errors: Array<{ employeeId: string; error: string }> = [];

    for (const employee of employees.filter(e => e.isActive)) {
      try {
        const entries = timeEntriesByEmployee.get(employee.id) || [];
        const calc = await this.calculatePayroll(employee, entries, payPeriod, undefined, traceId);
        calculations.push(calc);
      } catch (error: any) {
        errors.push({ employeeId: employee.id, error: error.message });
      }
    }

    this.logger.log(
      `[PAY] Pay period processed | total=${employees.length} ok=${calculations.length} err=${errors.length} | trace=${traceId}`,
    );

    return { calculations, errors };
  }

  // ─── Gross Pay ──────────────────────────────────────────────────

  private calculateGrossPay(
    employee: PayrollEmployee, timeEntries: TimeEntry[], payPeriod: PayPeriod,
  ): GrossPayBreakdown {
    const { payType, baseRate, payFrequency } = employee.payrollInfo;
    const totals = timeEntries.reduce(
      (acc, e) => ({
        regular: acc.regular + e.regularHours,
        overtime: acc.overtime + e.overtimeHours,
        doubleTime: acc.doubleTime + e.doubleTimeHours,
        sick: acc.sick + e.sickHours,
        vacation: acc.vacation + e.vacationHours,
        holiday: acc.holiday + e.holidayHours,
      }),
      { regular: 0, overtime: 0, doubleTime: 0, sick: 0, vacation: 0, holiday: 0 },
    );

    let regularPay = 0, overtimePay = 0, doubleTimePay = 0;
    let sickPay = 0, vacationPay = 0, holidayPay = 0;

    if (payType === 'hourly') {
      regularPay = totals.regular * baseRate;
      overtimePay = totals.overtime * baseRate * 1.5;
      doubleTimePay = totals.doubleTime * baseRate * 2.0;
      sickPay = totals.sick * baseRate;
      vacationPay = totals.vacation * baseRate;
      holidayPay = totals.holiday * baseRate * 1.5;
    } else if (payType === 'salary') {
      const periodsPerYear = this.getPeriodsPerYear(payFrequency);
      regularPay = baseRate / periodsPerYear;
      overtimePay = totals.overtime * (baseRate / (periodsPerYear * 40)) * 1.5;
    }

    const total = regularPay + overtimePay + doubleTimePay + sickPay + vacationPay + holidayPay;
    return {
      regularPay, overtimePay, doubleTimePay, sickPay, vacationPay, holidayPay,
      bonusPay: 0, commissionPay: 0, otherPay: 0, total,
    };
  }

  // ─── Pre-Tax Deductions ─────────────────────────────────────────

  private calculatePreTaxDeductions(employee: PayrollEmployee, grossPay: number): PreTaxDeductions {
    const result: PreTaxDeductions = {
      healthInsurance: 0, dentalInsurance: 0, visionInsurance: 0, retirement401k: 0,
      hsa: 0, fsa: 0, parking: 0, transit: 0, other: 0, total: 0,
    };

    for (const ded of employee.deductions.preTax) {
      let amount = ded.isPercentage ? grossPay * (ded.amount / 100) : ded.amount;
      if (ded.limit && amount > ded.limit) amount = ded.limit;

      const key = ({
        health_insurance: 'healthInsurance', dental: 'dentalInsurance', vision: 'visionInsurance',
        '401k': 'retirement401k', hsa: 'hsa', fsa: 'fsa', parking: 'parking', transit: 'transit',
      } as Record<string, keyof PreTaxDeductions>)[ded.type] || 'other';

      (result as any)[key] += amount;
    }

    result.total = result.healthInsurance + result.dentalInsurance + result.visionInsurance +
      result.retirement401k + result.hsa + result.fsa + result.parking + result.transit + result.other;
    return result;
  }

  // ─── Tax Calculation (2024 brackets) ────────────────────────────

  private calculateTaxes(
    employee: PayrollEmployee, taxableIncome: number, payPeriod: PayPeriod,
    ytdData?: { socialSecurityWages: number; totalWages: number },
  ): TaxBreakdown {
    const taxYear = payPeriod.endDate.getFullYear();
    const taxTable = this.taxTables.get(taxYear) ?? this.taxTables.get(2024)!;
    const { filingStatus, exemptions, additionalWithholding, isExemptFromFederal, isExemptFromState } = employee.payrollInfo;
    const periodsPerYear = this.getPeriodsPerYear(employee.payrollInfo.payFrequency);
    const annualizedIncome = taxableIncome * periodsPerYear;

    // Federal Income Tax
    let federalIncomeTax = 0;
    if (!isExemptFromFederal) {
      const bracket = taxTable.federalBrackets.find(b => b.filingStatus === filingStatus);
      if (bracket) {
        federalIncomeTax = this.calculateProgressiveTax(
          annualizedIncome, bracket.brackets, exemptions, taxTable.standardDeductions[filingStatus] ?? 13850,
        ) / periodsPerYear;
        federalIncomeTax += additionalWithholding;
      }
    }

    // State Income Tax
    let stateIncomeTax = 0;
    if (!isExemptFromState) {
      const stateBrackets = taxTable.stateBrackets[employee.address.state];
      if (stateBrackets) {
        stateIncomeTax = this.calculateProgressiveTax(
          annualizedIncome, stateBrackets, exemptions, taxTable.standardDeductions[filingStatus] ?? 13850,
        ) / periodsPerYear;
      }
    }

    // Social Security Tax (with wage-base cap)
    let socialSecurityTax = 0;
    if (!employee.payrollInfo.isExemptFromSocialSecurity) {
      const ytdSSWages = ytdData?.socialSecurityWages ?? 0;
      const remainingWageBase = Math.max(0, taxTable.socialSecurityWageBase - ytdSSWages);
      const taxableWages = Math.min(taxableIncome, remainingWageBase);
      socialSecurityTax = taxableWages * (taxTable.socialSecurityRate / 100);
    }

    // Medicare Tax (with additional Medicare for high earners)
    let medicareTax = 0;
    let additionalMedicareTax = 0;
    if (!employee.payrollInfo.isExemptFromMedicare) {
      medicareTax = taxableIncome * (taxTable.medicareRate / 100);
      const ytdWages = ytdData?.totalWages ?? 0;
      const threshold = taxTable.additionalMedicareThreshold[filingStatus] ?? 200_000;
      if (ytdWages + taxableIncome > threshold) {
        const excessWages = Math.max(0, ytdWages + taxableIncome - threshold);
        additionalMedicareTax = Math.min(excessWages, taxableIncome) * (taxTable.additionalMedicareRate / 100);
      }
    }

    const total = federalIncomeTax + stateIncomeTax + socialSecurityTax + medicareTax + additionalMedicareTax;
    return {
      federalIncomeTax, stateIncomeTax, localIncomeTax: 0,
      socialSecurityTax, medicareTax, additionalMedicareTax,
      sdi: 0, sui: 0, total,
    };
  }

  /**
   * Progressive tax bracket calculation.
   * Applies standard deduction + personal exemptions, then walks brackets.
   */
  private calculateProgressiveTax(
    income: number, brackets: TaxBracket[], exemptions: number, standardDeduction: number,
  ): number {
    const taxableIncome = Math.max(0, income - standardDeduction - (exemptions * 4050));
    let tax = 0;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
        tax = bracket.base + (taxableAtBracket * (bracket.rate / 100));
      }
    }
    return Math.max(0, tax);
  }

  // ─── Post-Tax Deductions (garnishment priority ordering) ────────

  private calculatePostTaxDeductions(employee: PayrollEmployee, afterTaxIncome: number): PostTaxDeductions {
    const result: PostTaxDeductions = { unionDues: 0, charity: 0, loanRepayment: 0, garnishments: 0, other: 0, total: 0 };
    const sorted = [...employee.deductions.postTax].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    let remaining = afterTaxIncome;

    for (const ded of sorted) {
      let amount = ded.isPercentage ? afterTaxIncome * (ded.amount / 100) : ded.amount;
      amount = Math.min(amount, remaining);
      remaining -= amount;

      const key = ({
        union_dues: 'unionDues', charity: 'charity', loan_repayment: 'loanRepayment', garnishment: 'garnishments',
      } as Record<string, keyof PostTaxDeductions>)[ded.type] || 'other';

      (result as any)[key] += amount;
      if (remaining <= 0) break;
    }

    result.total = result.unionDues + result.charity + result.loanRepayment + result.garnishments + result.other;
    return result;
  }

  // ─── Tax Tables (IRS 2024) ──────────────────────────────────────

  private initializeTaxTables(): void {
    this.taxTables.set(2024, {
      year: 2024,
      federalBrackets: [
        {
          filingStatus: 'single',
          brackets: [
            { min: 0, max: 11_000, rate: 10, base: 0 },
            { min: 11_000, max: 44_725, rate: 12, base: 1_100 },
            { min: 44_725, max: 95_375, rate: 22, base: 5_147 },
            { min: 95_375, max: 182_050, rate: 24, base: 16_290 },
            { min: 182_050, max: 231_250, rate: 32, base: 37_104 },
            { min: 231_250, max: 578_125, rate: 35, base: 52_832 },
            { min: 578_125, max: Infinity, rate: 37, base: 174_238.25 },
          ],
        },
        {
          filingStatus: 'married_joint',
          brackets: [
            { min: 0, max: 22_000, rate: 10, base: 0 },
            { min: 22_000, max: 89_450, rate: 12, base: 2_200 },
            { min: 89_450, max: 190_750, rate: 22, base: 10_294 },
            { min: 190_750, max: 364_200, rate: 24, base: 32_580 },
            { min: 364_200, max: 462_500, rate: 32, base: 74_208 },
            { min: 462_500, max: 693_750, rate: 35, base: 105_664 },
            { min: 693_750, max: Infinity, rate: 37, base: 186_601.50 },
          ],
        },
        {
          filingStatus: 'married_separate',
          brackets: [
            { min: 0, max: 11_000, rate: 10, base: 0 },
            { min: 11_000, max: 44_725, rate: 12, base: 1_100 },
            { min: 44_725, max: 95_375, rate: 22, base: 5_147 },
            { min: 95_375, max: 182_050, rate: 24, base: 16_290 },
            { min: 182_050, max: 231_250, rate: 32, base: 37_104 },
            { min: 231_250, max: 346_875, rate: 35, base: 52_832 },
            { min: 346_875, max: Infinity, rate: 37, base: 93_300.75 },
          ],
        },
        {
          filingStatus: 'head_of_household',
          brackets: [
            { min: 0, max: 15_700, rate: 10, base: 0 },
            { min: 15_700, max: 59_850, rate: 12, base: 1_570 },
            { min: 59_850, max: 95_350, rate: 22, base: 6_868 },
            { min: 95_350, max: 182_050, rate: 24, base: 14_678 },
            { min: 182_050, max: 231_250, rate: 32, base: 35_498 },
            { min: 231_250, max: 578_100, rate: 35, base: 51_226 },
            { min: 578_100, max: Infinity, rate: 37, base: 172_623.50 },
          ],
        },
      ],
      stateBrackets: {
        CA: [
          { min: 0, max: 10_099, rate: 1, base: 0 },
          { min: 10_099, max: 23_942, rate: 2, base: 100.99 },
          { min: 23_942, max: 37_788, rate: 4, base: 377.85 },
          { min: 37_788, max: 52_455, rate: 6, base: 931.69 },
          { min: 52_455, max: 66_295, rate: 8, base: 1_811.71 },
          { min: 66_295, max: 338_639, rate: 9.3, base: 2_918.91 },
          { min: 338_639, max: 406_364, rate: 10.3, base: 28_246.90 },
          { min: 406_364, max: 677_278, rate: 11.3, base: 35_222.58 },
          { min: 677_278, max: Infinity, rate: 12.3, base: 65_835.92 },
        ],
      },
      socialSecurityRate: 6.2,
      socialSecurityWageBase: 160_200,
      medicareRate: 1.45,
      additionalMedicareRate: 0.9,
      additionalMedicareThreshold: {
        single: 200_000, married_joint: 250_000,
        married_separate: 125_000, head_of_household: 200_000,
      },
      standardDeductions: {
        single: 13_850, married_joint: 27_700,
        married_separate: 13_850, head_of_household: 20_800,
      },
      personalExemption: 0, // Suspended 2018-2025
    });
  }

  private getPeriodsPerYear(freq: string): number {
    return ({ weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 } as Record<string, number>)[freq] ?? 26;
  }

  // ─── STUB TRIGGER FOR MICRO-SPRINT 5 (Tax Stub Simulation) ──────

  public calculateWithholdings(grossPay: number): { grossPay: number, employeeDeductions: number, employerTaxes: number, netPay: number, breakdown: any } {
    const FICA_RATE = 0.0765;
    const INCOME_TAX_RATE = 0.12;
    const EMPLOYER_LIABILITY_RATE = 0.0765; // Employer matching

    const employeeFica = Math.round(grossPay * FICA_RATE);
    const employeeIncomeTax = Math.round(grossPay * INCOME_TAX_RATE);
    const employeeTotalDeductions = employeeFica + employeeIncomeTax;
    
    const employerTaxes = Math.round(grossPay * EMPLOYER_LIABILITY_RATE);
    
    const netPay = grossPay - employeeTotalDeductions;

    return {
      grossPay,
      employeeDeductions: employeeTotalDeductions,
      employerTaxes,
      netPay,
      breakdown: {
         fica: employeeFica,
         incomeTax: employeeIncomeTax,
         employerLiability: employerTaxes
      }
    };
  }
}
