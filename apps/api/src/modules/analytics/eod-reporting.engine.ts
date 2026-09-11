/**
 * End-of-Day Reporting Engine
 * PORTED FROM: PS-Platform/shared/services/EODReportingService.ts (728 lines)
 *
 * Batch reporting for: merchant transactions, payroll summary, POS sales,
 * digital wallet activity, compliance audit, affiliate commissions, consolidated.
 * REQ: PLATSIS-001..005
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

// â”€â”€â”€ Domain Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type EODReportType =
  | 'merchant_transactions' | 'payroll_summary' | 'pos_sales'
  | 'digital_wallet_activity' | 'compliance_audit'
  | 'affiliate_commissions' | 'consolidated_summary';

export interface EODReport {
  id: string;
  tenantId: string;
  reportDate: Date;
  reportType: EODReportType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: Record<string, unknown>;
  filePath?: string;
  generatedAt?: Date;
  metadata: {
    totalTransactions: number;
    totalAmount: number;
    errorCount: number;
    processingTimeMs: number;
  };
}

export interface ReportSchedule {
  id: string;
  tenantId: string;
  reportType: EODReportType;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  recipients: string[];
  format: 'pdf' | 'csv' | 'json' | 'excel';
}

// â”€â”€â”€ Report Data Shapes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface MerchantTransactionReport {
  merchantId: string;
  merchantName: string;
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  netSettlement: number;
  chargebacks: number;
  chargebackAmount: number;
  averageTicketSize: number;
  byPaymentMethod: Array<{ method: string; count: number; volume: number }>;
}

export interface PayrollSummaryReport {
  totalEmployees: number;
  totalGrossPay: number;
  totalTaxes: number;
  totalDeductions: number;
  totalNetPay: number;
  byDepartment: Array<{ department: string; employees: number; grossPay: number; netPay: number }>;
}

export interface POSSalesReport {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalItemsSold: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  byHour: Array<{ hour: number; orders: number; revenue: number }>;
  voidCount: number;
  voidAmount: number;
  discountCount: number;
  discountAmount: number;
}

// â”€â”€â”€ NestJS Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Injectable()
export class EODReportingEngine {
  private readonly logger = new Logger(EODReportingEngine.name);

  /**
   * Generate a merchant transactions EOD report.
   */
  generateMerchantTransactionsReport(
    tenantId: string,
    reportDate: Date,
    data: MerchantTransactionReport[],
  ): EODReport {
    const start = Date.now();
    const totalAmount = data.reduce((s, m) => s + m.totalVolume, 0);
    const totalTxns = data.reduce((s, m) => s + m.totalTransactions, 0);
    const totalChargebacks = data.reduce((s, m) => s + m.chargebacks, 0);

    return this.buildReport(tenantId, reportDate, 'merchant_transactions', {
      merchants: data as any,
      summary: {
        totalMerchants: data.length,
        totalTransactions: totalTxns,
        totalVolume: totalAmount,
        totalFees: data.reduce((s, m) => s + m.totalFees, 0),
        totalNetSettlement: data.reduce((s, m) => s + m.netSettlement, 0),
        totalChargebacks,
        chargebackRate: totalTxns > 0 ? (totalChargebacks / totalTxns) * 100 : 0,
      },
    }, totalTxns, totalAmount, Date.now() - start);
  }

  /**
   * Generate payroll summary EOD report.
   */
  generatePayrollReport(
    tenantId: string, reportDate: Date, data: PayrollSummaryReport,
  ): EODReport {
    return this.buildReport(tenantId, reportDate, 'payroll_summary', data as any,
      data.totalEmployees, data.totalGrossPay, 0);
  }

  /**
   * Generate POS sales EOD report.
   */
  generatePOSSalesReport(
    tenantId: string, reportDate: Date, data: POSSalesReport,
  ): EODReport {
    return this.buildReport(tenantId, reportDate, 'pos_sales', data as any,
      data.totalOrders, data.totalRevenue, 0);
  }

  /**
   * Generate a consolidated summary combining all report types.
   */
  generateConsolidatedReport(
    tenantId: string, reportDate: Date,
    merchantData: MerchantTransactionReport[],
    payrollData?: PayrollSummaryReport,
    posData?: POSSalesReport,
  ): EODReport {
    const start = Date.now();
    return this.buildReport(tenantId, reportDate, 'consolidated_summary', {
      merchantSummary: {
        totalMerchants: merchantData.length,
        totalVolume: merchantData.reduce((s, m) => s + m.totalVolume, 0),
      },
      payrollSummary: payrollData ? {
        totalEmployees: payrollData.totalEmployees,
        totalNetPay: payrollData.totalNetPay,
      } : null,
      posSummary: posData ? {
        totalOrders: posData.totalOrders,
        totalRevenue: posData.totalRevenue,
      } : null,
    }, 0, 0, Date.now() - start);
  }

  /**
   * Determine which reports should run based on schedule and current time.
   */
  getScheduledReports(schedules: ReportSchedule[], now: Date): ReportSchedule[] {
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();

    return schedules.filter(s => {
      if (!s.enabled) return false;
      if (s.time !== currentTime) return false;
      if (s.frequency === 'weekly' && dayOfWeek !== 0) return false;
      if (s.frequency === 'monthly' && dayOfMonth !== 1) return false;
      return true;
    });
  }

  // â”€â”€â”€ Private â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private buildReport(
    tenantId: string, reportDate: Date, reportType: EODReportType,
    data: Record<string, unknown>, txnCount: number, totalAmount: number, processingTimeMs: number,
  ): EODReport {
    const report: EODReport = {
      id: `eod_${reportType}_${randomUUID().substring(0, 8)}`,
      tenantId,
      reportDate,
      reportType,
      status: 'completed',
      data: data as any,
      generatedAt: new Date(),
      metadata: { totalTransactions: txnCount, totalAmount, errorCount: 0, processingTimeMs },
    };

    this.logger.log(
      `[EOD] Generated ${reportType} report | tenant=${tenantId} txns=${txnCount} amt=${totalAmount} | ${processingTimeMs}ms`,
    );
    return report;
  }
}







