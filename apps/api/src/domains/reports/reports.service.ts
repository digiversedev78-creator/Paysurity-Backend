/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-008 -- Statement/1099-K
 * FILE TYPE:    SERVICE
 * MODULE:       reports
 * PRIORITY:     P1
 * ═══════════════════════════════════════════════════════════
 */
import { Injectable, Logger, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
import { GenerateMerchantStatementDto, ReportGenerationResponseDto, ReportGenerationStatus } from './dto/generate-merchant-statement.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { sql } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @Inject('DATABASE') private readonly db: any,
    private readonly auditLogService: AuditLogService,
    @InjectQueue('reports_queue') private readonly reportsQueue: Queue,
  ) { }

  async generateMerchantStatementReport(
    dto: GenerateMerchantStatementDto,
    tenantId: string,
    userId: string,
  ): Promise<ReportGenerationResponseDto> {
    this.logger.log(
      `Initiating report generation for merchant ${dto.merchantId}, type: ${dto.type}, tenant: ${tenantId}`,
    );

    // 1. Validate date range
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new InternalServerErrorException('Invalid date range provided.');
    }

    // 2. Validate Merchant Existence & Fetch Tenant Lock Status
    const merchantRows = await this.db.execute(
      sql`
      SELECT m.id, m.name, m.tax_id, t.payout_locked 
      FROM merchants m 
      JOIN tenants t ON m.tenant_id = t.id 
      WHERE m.id = ${dto.merchantId} AND m.tenant_id = ${tenantId} LIMIT 1`
    );

    if (!merchantRows || merchantRows.rows?.length === 0) {
      this.logger.warn(`Merchant ${dto.merchantId} not found for tenant ${tenantId}.`);
      throw new NotFoundException(`Merchant with ID "${dto.merchantId}" not found.`);
    }

    const merchant = merchantRows.rows[0];
    const isEscrowLocked = merchant.payout_locked === true;

    // 3. Fetch transaction data and perform SQL JOIN with payment_fees table
    const transactionRows = await this.db.execute(
      sql`
          SELECT 
            t.amount as gross_amount,
            COALESCE(pf.interchange_fee, 0) as interchange_fee,
            COALESCE(pf.scheme_fee, 0) as scheme_fee,
            COALESCE(pf.paysurity_markup, 0) as paysurity_markup
          FROM transactions t
          LEFT JOIN payment_fees pf ON t.id = pf.transaction_id
          WHERE t.merchant_id = ${dto.merchantId}
            AND t.tenant_id = ${tenantId}
            AND t.created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
        `,
    );

    const transactions = transactionRows?.rows ?? [];

    let totalGross = 0;
    let totalInterchange = 0;
    let totalScheme = 0;
    let totalMarkup = 0;

    transactions.forEach((tx: any) => {
      totalGross += Number(tx.gross_amount);
      totalInterchange += Number(tx.interchange_fee);
      totalScheme += Number(tx.scheme_fee);
      totalMarkup += Number(tx.paysurity_markup);
    });

    const totalFees = totalInterchange + totalScheme + totalMarkup;
    const netSettlement = totalGross - totalFees;

    // Net_Settlement = sum(Gross_Sales) - (Interchange_Fees + Scheme_Fees + PaySurity_Markup) - Provisional_Escrow
    const availableLiquidity = isEscrowLocked ? 0 : netSettlement;
    const provisionalEscrow = isEscrowLocked ? netSettlement : 0;

    // 4. Generate report reference
    const jobId = `RPT-${dto.merchantId.substring(0, 8)}-${Date.now()}`.toUpperCase();
    const downloadUrl = `/api/v1/reports/merchants/statements/${jobId}/download?format=${dto.format ?? 'pdf'}`;
    const message = `Report generation for merchant "${merchant.name}" (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}) accepted.`;

    this.logger.log(`${message} Job ID: ${jobId}`);

    await this.reportsQueue.add('generateStatement', {
      merchantId: dto.merchantId,
      availableLiquidity,
      provisionalEscrow,
      startDate: dto.startDate,
      endDate: dto.endDate,
    }, { jobId });

    // 5. Audit log (non-blocking — audit failures must never block business ops)
    await this.auditLogService.record(tenantId, {
      userId,
      action: 'REPORT_GENERATION',
      details: {
        merchantId: dto.merchantId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        reportType: dto.type,
        format: dto.format,
        jobId,
        transactionCount: transactions.length,
      },
    }).catch(() => { });

    return {
      jobId,
      message,
      downloadUrl,
      status: ReportGenerationStatus.PENDING,
    };
  }
}
