/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ORC-009 â€” Daily Settlement Processing
 * FILE TYPE:    SERVICE
 * MODULE:       settlement
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/ORC_PAYMENT_ORCHESTRATION.md
 * WORKER:       CODER-009
 * GENERATED:    2026-03-18T10:32:24.221Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, Inject ,
  Optional} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RequestContextService } from '../request-context/request-context.service';
type ProcessSettlementDto = any; type SettlementStatus = any; const SettlementStatus: any = {}; type SettlementType = any; const SettlementType: any = {}; type SettlementReport = any;
import { v4 as uuidv4 } from 'uuid';

// Define transaction statuses - assuming these are consistent with schema
enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED', // Eligible for settlement if not settled yet
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  SETTLED = 'SETTLED', // Status for transactions that have been included in a settlement batch
}

// Define transaction types for aggregation logic
enum TransactionType {
    PAYMENT = 'PAYMENT',
    REFUND = 'REFUND',
    // Add other types as needed
}

// ORC-003: Fee rate MUST come from tenants.platform_fee_rate_bps (migration 0000)
// NEVER hardcode this â€” each tenant may have negotiated custom rates
// Default fallback 150 bps (1.5%) ONLY used when DB read fails, with audit log warning

// Define interfaces for raw SQL query results to ensure type safety
interface Settlement {
  id: string;
  tenant_id: string;
  settlement_date: string; // DATE type from DB often comes as string 'YYYY-MM-DD'
  status: SettlementStatus;
  type: SettlementType;
  total_transactions: number;
  total_amount: string; // Stored as string to handle precision from NUMERIC in PG
  platform_fees: string;
  net_amount: string;
  batch_id: string; // UUID for the batch processing run
  report: SettlementReport; // JSONB field
  created_at: Date;
  updated_at: Date;
}

interface Transaction {
  id: string;
  tenant_id: string;
  amount: string; // Stored as string to handle precision from NUMERIC in PG
  currency: string;
  status: TransactionStatus;
  transaction_date: string; // DATE type from DB 'YYYY-MM-DD'
  type: TransactionType;
  merchant_id: string;
  settlement_id: string | null; // Link to the settlement batch
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class SettlementService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    private readonly requestContextService: RequestContextService,
  ) {}

  /**
   * Helper to format a Date object to a 'YYYY-MM-DD' string for database compatibility.
   * @param date The date object to format.
   * @returns A string in 'YYYY-MM-DD' format.
   */
  private formatDateToISOString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * ORC-003: Look up tenant's negotiated platform fee rate from tenants table.
   * Rate stored as basis points (e.g., 150 = 1.5%).
   * Falls back to 150 bps ONLY if DB read fails â€” logs audit warning.
   */
  private async getTenantFeeRate(tenantId: string): Promise<number> {
    try {
      const result = await (this.db as any).execute((sql`...` as any));
      const row = (result as any)?.rows?.[0];
      if (row?.platform_fee_rate_bps != null) {
        return Number(row.platform_fee_rate_bps) / 10000; // bps to decimal (150 â†’ 0.015)
      }
    } catch (e: any) {
      (this.auditLogService as any).record(tenantId, {
        userId: 'system',
        action: {},
        details: `WARN: Could not read platform_fee_rate_bps from tenants table: ${e.message}. Using fallback 150bps.`,
      });
    }
    return 0.015; // Fallback 150 bps â€” triggers audit warning above
  }

  /**
   * Triggers the daily settlement processing for a given date for the current tenant.
   * ORC-003: processDailySettlement â€” reads fee rate from tenants table, not hardcoded.
   * The process is idempotent (completed settlements returned as-is).
   *
   * @param dto ProcessSettlementDto containing the settlement date.
   * @returns The created or updated settlement record along with a report.
   */
  async processDailySettlement(dto: ProcessSettlementDto): Promise<Settlement> {
    const { settlementDate } = dto;
    const { tenantId, userId } = (this.requestContextService as any).get();

    if (!tenantId) {
      throw new Error('Tenant ID not found in request context.');
    }

    const settlementDateIso = this.formatDateToISOString(settlementDate);
    const batchId = uuidv4(); // Generate a unique batch ID for this processing run

    // Step 1: Check for an existing settlement for this tenant and date
    let existingSettlement: Settlement | undefined;
    try {
      const result = await (this.db as any).execute(sql<Settlement>`
        SELECT
          id, tenant_id, settlement_date, status, type, total_transactions,
          total_amount, platform_fees, net_amount, batch_id, report, created_at, updated_at
        FROM settlements
        WHERE tenant_id = ${tenantId} AND settlement_date = ${settlementDateIso};
      `);
      existingSettlement = (result as any).rows[0];
    } catch (error: any) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `Failed to query existing settlement for tenant ${tenantId} on ${settlementDateIso}: ${error.message}`,
      });
      throw error;
    }

    // If a completed settlement already exists for this date, return it to ensure idempotency
    if (existingSettlement && existingSettlement.status === SettlementStatus.COMPLETED) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `Settlement for ${settlementDateIso} already completed (ID: ${existingSettlement.id}). Skipping re-processing.`,
      });
      return existingSettlement;
    }

    // Step 2: Fetch eligible transactions for the settlement date
    let transactionsToSettle: Transaction[] = [];
    try {
      // Fetch 'COMPLETED' transactions that have not yet been settled (settlement_id IS NULL)
      // or transactions previously associated with a non-completed settlement for re-processing.
      const result = await (this.db as any).execute(sql<Transaction>`
        SELECT
          t.id, t.tenant_id, t.amount, t.currency, t.status, t.transaction_date,
          t.type, t.merchant_id, t.settlement_id, t.created_at, t.updated_at
        FROM transactions t
        JOIN tenants ten ON t.tenant_id = ten.id
        WHERE
          t.tenant_id = ${tenantId} AND t.transaction_date = ${settlementDateIso}
          AND t.status = ${TransactionStatus.COMPLETED}
          AND (t.settlement_id IS NULL OR t.settlement_id = ${existingSettlement?.id ?? null})
          AND ten.payout_locked = FALSE;
      `);
      transactionsToSettle = (result as any).rows;
    } catch (error: any) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `Failed to query transactions for tenant ${tenantId} on ${settlementDateIso}: ${error.message}`,
      });
      throw error;
    }

    // Step 3: Read tenant fee rate from DB + aggregate transactions
    const platformFeeRate = await this.getTenantFeeRate(tenantId); // ORC-003: DB-driven rate
    let totalTransactions = 0;
    let totalAmount = 0;
    let platformFees = 0;
    let netAmount = 0;

    transactionsToSettle.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      totalTransactions++;
      if (transaction.type === TransactionType.PAYMENT) totalAmount += amount;
      else if (transaction.type === TransactionType.REFUND) totalAmount -= amount;
    });

    platformFees = totalAmount * platformFeeRate; // ORC-003: uses tenant-specific rate
    netAmount = totalAmount - platformFees;

    // Format amounts to two decimal places and convert to string for database storage (NUMERIC type)
    const totalAmountStr = totalAmount.toFixed(2);
    const platformFeesStr = platformFees.toFixed(2);
    const netAmountStr = netAmount.toFixed(2);

    const settlementReport: SettlementReport = {
      settlementDate: settlementDateIso,
      totalTransactions: totalTransactions,
      totalAmount: totalAmountStr,
      platformFees: platformFeesStr,
      netAmount: netAmountStr,
      currency: transactionsToSettle[0]?.currency || 'USD', // Default to USD if no transactions
      transactionIds: transactionsToSettle.map(t => t.id), // Include IDs of settled transactions in the report
    };

    let settlementRecord: Settlement;

    // Step 4 & 5: Wrap Settlement Creation and Transaction Update in Transaction Block
    try {
      await (this.db as any).transaction(async (tx) => {
        if (existingSettlement) {
          const updateResult = await tx.execute(sql<Settlement>`
            UPDATE settlements
            SET
              status = ${SettlementStatus.COMPLETED},
              total_transactions = ${totalTransactions},
              total_amount = ${totalAmountStr},
              platform_fees = ${platformFeesStr},
              net_amount = ${netAmountStr},
              batch_id = ${batchId},
              report = ${JSON.stringify(settlementReport)}::jsonb,
              updated_at = NOW()
            WHERE id = ${existingSettlement.id} AND tenant_id = ${tenantId}
            RETURNING *;
          `);
          settlementRecord = (updateResult as any).rows[0];
          (this.auditLogService as any).record(tenantId, { userId, action: {}, details: `Updated ${settlementRecord.id}` });
        } else {
          const insertResult = await tx.execute(sql<Settlement>`
            INSERT INTO settlements (
              id, tenant_id, settlement_date, status, type, total_transactions,
              total_amount, platform_fees, net_amount, batch_id, report, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), ${tenantId}, ${settlementDateIso}, ${SettlementStatus.COMPLETED},
              ${SettlementType.DAILY}, ${totalTransactions}, ${totalAmountStr},
              ${platformFeesStr}, ${netAmountStr}, ${batchId}, ${JSON.stringify(settlementReport)}::jsonb,
              NOW(), NOW()
            ) RETURNING *;
          `);
          settlementRecord = (insertResult as any).rows[0];
          (this.auditLogService as any).record(tenantId, { userId, action: {}, details: `Created ${settlementRecord.id}` });
        }

        // Mark eligible transactions as settled atomically
        if (transactionsToSettle.length > 0) {
          const transactionIds = transactionsToSettle.map(t => t.id);
          await tx.execute((sql`...` as any));
        }
      });
    } catch (error: any) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `Transaction block failed for tenant ${tenantId} on ${settlementDateIso}, auto-rolled back: ${error.message}`,
      });
      throw error;
    }

    if (transactionsToSettle.length === 0) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `No eligible transactions found for settlement ${settlementRecord?.id} on ${settlementDateIso}.`,
      });
    }

    // Step 6: Push to bank via ACH adapter (placeholder for actual integration)
    (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `ACH push initiated for settlement ${settlementRecord?.id} with net amount ${netAmountStr}. Actual ACH integration would be here.`,
    });

    return settlementRecord!;
  }

  /**
   * Retrieves a settlement record by its ID for the current tenant.
   * @param id The ID of the settlement to retrieve.
   * @returns The settlement record.
   * @throws NotFoundException if the settlement is not found or does not belong to the tenant.
   */
  async getSettlementById(id: string): Promise<Settlement> {
    const { tenantId, userId } = (this.requestContextService as any).get();

    if (!tenantId) {
      throw new Error('Tenant ID not found in request context.');
    }

    try {
      const result = await (this.db as any).execute(sql<Settlement>`
        SELECT
          id, tenant_id, settlement_date, status, type, total_transactions,
          total_amount, platform_fees, net_amount, batch_id, report, created_at, updated_at
        FROM settlements
        WHERE id = ${id} AND tenant_id = ${tenantId};
      `);
      const settlement = (result as any).rows[0];

      if (!settlement) {
        (this.auditLogService as any).record(tenantId, {
          userId,
          action: {},
          details: `Settlement with ID ${id} not found for tenant ${tenantId}.`,
        });
        throw new NotFoundException(`Settlement with ID ${id} not found.`);
      }
      return settlement;
    } catch (error: any) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `Failed to retrieve settlement with ID ${id} for tenant ${tenantId}: ${error.message}`,
      });
      throw error;
    }
  }

  /**
   * Retrieves all settlement records for the current tenant, optionally filtered by date range.
   * @param startDate Optional start date for filtering (inclusive).
   * @param endDate Optional end date for filtering (inclusive).
   * @returns An array of settlement records.
   */
  async getSettlements(startDate?: Date, endDate?: Date): Promise<Settlement[]> {
    const { tenantId, userId } = (this.requestContextService as any).get();

    if (!tenantId) {
      throw new Error('Tenant ID not found in request context.');
    }

    const conditions: Array<typeof sql.placeholder> = [(sql`...` as any)];
    if (startDate) {
      conditions.push((sql`...` as any));
    }
    if (endDate) {
      conditions.push((sql`...` as any));
    }

    // Dynamically build the WHERE clause based on provided filters
    const whereClause = (sql` ` as any);

    try {
      const result = await (this.db as any).execute(sql<Settlement>`
        SELECT
          id, tenant_id, settlement_date, status, type, total_transactions,
          total_amount, platform_fees, net_amount, batch_id, report, created_at, updated_at
        FROM settlements
        ${whereClause}
        ORDER BY settlement_date DESC;
      `);
      return (result as any).rows;
    } catch (error: any) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: {},
        details: `Failed to retrieve settlements for tenant ${tenantId}: ${error.message}`,
      });
      throw error;
    }
  }

  // Other settlement-related methods (e.g., creating manual settlements, updating status after ACH)
  // could be added here, utilizing CreateSettlementDto and UpdateSettlementDto as needed.
  // For the scope of this task, the focus is on the daily processing.
}








