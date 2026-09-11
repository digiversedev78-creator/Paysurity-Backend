import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UnsupportedCurrencyException } from '../../common/exceptions/unsupported-currency.exception';

/**
 * WalletService [WAL-V2]
 * REQ-WAL-001: Strict Double-Entry Ledger and Digital Wallet limits.
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private eventEmitter: EventEmitter2,
    @Inject('REQUEST_CONTEXT') private readonly requestContext: { currentLocationId: string },
  ) {}

  /**
   * REQ-WAL-001: createWallet(params)
   * Idempotent wallet creation. Reads limits from platform config based on KYC.
   */
  async createWallet(params: {
    tenantId: string;
    consumerId: string;
    walletType?: string;
    locationId?: string;
    currency?: string;
  }) {
    const { tenantId, consumerId, walletType = 'CONSUMER', locationId, currency = 'USD' } = params;
    if (currency !== 'USD') {
      throw new UnsupportedCurrencyException('Only USD is supported');
    }
    const effectiveLocationId = locationId ?? this.requestContext.currentLocationId;
    if (!effectiveLocationId) {
      throw new BadRequestException('Location ID is required');
    }
    return (this.db as any).transaction(async (tx) => {
      const existingRes = await tx
        .execute(
          sql`
            SELECT id, currency, balance_cents, reserved_cents, status, kyc_level
            FROM digital_wallets
            WHERE tenant_id = ${tenantId}::uuid AND consumer_id = ${consumerId}::uuid AND wallet_type = ${walletType}
          `,
        )
        .catch(() => ({ rows: [] }));

      if ((existingRes as any).rows.length > 0) {
        return (existingRes as any).rows[0];
      }

      const limitsRes = await tx.execute(
        sql`
          SELECT key, value FROM platform_config WHERE key LIKE 'wallet.kyc_none.%'
        `,
      );

      let dailyLoad = 50000;
      let monthlyLoad = 200000;
      let dailySpend = 50000;

      (limitsRes as any).rows.forEach((row: any) => {
        if (row.key === 'wallet.kyc_none.daily_load_limit_cents') dailyLoad = parseInt(row.value, 10);
        if (row.key === 'wallet.kyc_none.monthly_load_limit_cents') monthlyLoad = parseInt(row.value, 10);
        if (row.key === 'wallet.kyc_none.daily_spend_limit_cents') dailySpend = parseInt(row.value, 10);
      });

      const newId = randomUUID();
      await tx.execute(
        sql`
          INSERT INTO digital_wallets (
            id, tenant_id, consumer_id, wallet_type, currency, balance_cents, reserved_cents,
            status, kyc_level, daily_load_limit_cents, monthly_load_limit_cents, daily_spend_limit_cents, location_id
          ) VALUES (
            ${newId}::uuid, ${tenantId}::uuid, ${consumerId}::uuid, ${walletType}, ${currency}, 0, 0,
            'ACTIVE', 'NONE', ${dailyLoad}, ${monthlyLoad}, ${dailySpend}, ${effectiveLocationId}::uuid
          )
        `,
      );

      this.eventEmitter.emit('wallet.created', {
        tenantId,
        consumerId,
        walletId: newId,
        locationId: effectiveLocationId,
        currency,
      });

      return {
        id: newId,
        currency,
        balance_cents: 0,
        reserved_cents: 0,
        status: 'ACTIVE',
        kyc_level: 'NONE',
        location_id: effectiveLocationId,
      };
    });
  }

  /**
   * REQ-WAL-001: credit(params)
   * Double-entry ledger addition.
   */
  async credit(params: {
    tenantId: string;
    walletId: string;
    amountCents: number;
    transactionType: string;
    referenceId?: string;
    referenceType?: string;
    description?: string;
    idempotencyKey: string;
    locationId?: string;
  }) {
    if (params.amountCents <= 0) throw new BadRequestException('Amount must be positive');
    const effectiveLocationId = params.locationId ?? this.requestContext.currentLocationId;
    if (!effectiveLocationId) throw new BadRequestException('Location ID is required');

    return (this.db as any).transaction(async (tx) => {
      const walletRes = await tx.execute(
        sql`
          SELECT id, balance_cents, status, location_id FROM digital_wallets
          WHERE id = ${params.walletId}::uuid AND tenant_id = ${params.tenantId}::uuid FOR UPDATE
        `,
      );
      if ((walletRes as any).rows.length === 0) throw new NotFoundException('Wallet not found');
      const wallet = (walletRes as any).rows[0];
      if (wallet.status !== 'ACTIVE') throw new BadRequestException('Wallet is not active');
      if (wallet.location_id !== effectiveLocationId) {
        throw new BadRequestException('Wallet location mismatch');
      }

      const existingTxRes = await tx.execute(
        sql`
          SELECT id FROM wallet_ledger WHERE idempotency_key = ${params.idempotencyKey}
        `,
      );
      if ((existingTxRes as any).rows.length > 0) return (existingTxRes as any).rows[0].id;

      const newBalance = parseInt(wallet.balance_cents as string, 10) + params.amountCents;

      await tx.execute(
        sql`
          UPDATE digital_wallets SET balance_cents = ${newBalance}, updated_at = NOW()
          WHERE id = ${params.walletId}::uuid
        `,
      );

      const txId = randomUUID();
      await tx.execute(
        sql`
          INSERT INTO wallet_ledger (
            id, tenant_id, wallet_id, transaction_type, direction, amount_cents, balance_after_cents,
            reference_id, reference_type, description, idempotency_key, status, location_id
          ) VALUES (
            ${txId}::uuid, ${params.tenantId}::uuid, ${params.walletId}::uuid, ${params.transactionType}, 'C',
            ${params.amountCents}, ${newBalance},
            ${params.referenceId ? sql`${params.referenceId}::uuid` : null},
            ${params.referenceType || null}, ${params.description || null}, ${params.idempotencyKey}, 'COMPLETED', ${effectiveLocationId}::uuid
          )
        `,
      );

      this.eventEmitter.emit('wallet.credited', {
        tenantId: params.tenantId,
        walletId: params.walletId,
        amountCents: params.amountCents,
        txId,
      });

      return txId;
    });
  }

  /**
   * REQ-WAL-001: debit(params)
   */
  async debit(params: {
    tenantId: string;
    walletId: string;
    amountCents: number;
    transactionType: string;
    referenceId?: string;
    referenceType?: string;
    description?: string;
    idempotencyKey: string;
    locationId?: string;
  }) {
    if (params.amountCents <= 0) throw new BadRequestException('Amount must be positive');
    const effectiveLocationId = params.locationId ?? this.requestContext.currentLocationId;
    if (!effectiveLocationId) throw new BadRequestException('Location ID is required');

    return (this.db as any).transaction(async (tx) => {
      const walletRes = await tx.execute(
        sql`
          SELECT id, balance_cents, reserved_cents, status, location_id FROM digital_wallets
          WHERE id = ${params.walletId}::uuid AND tenant_id = ${params.tenantId}::uuid FOR UPDATE
        `,
      );
      if ((walletRes as any).rows.length === 0) throw new NotFoundException('Wallet not found');
      const wallet = (walletRes as any).rows[0];
      if (wallet.status !== 'ACTIVE') throw new BadRequestException('Wallet is not active');
      if (wallet.location_id !== effectiveLocationId) {
        throw new BadRequestException('Wallet location mismatch');
      }

      const existingTxRes = await tx.execute(
        sql`
          SELECT id FROM wallet_ledger WHERE idempotency_key = ${params.idempotencyKey}
        `,
      );
      if ((existingTxRes as any).rows.length > 0) return (existingTxRes as any).rows[0].id;

      const balanceCents = parseInt(wallet.balance_cents as string, 10);
      const reservedCents = parseInt(wallet.reserved_cents as string, 10);

      if (balanceCents - reservedCents < params.amountCents) {
        throw new BadRequestException('Insufficient available balance');
      }

      const newBalance = balanceCents - params.amountCents;

      await tx.execute(
        sql`
          UPDATE digital_wallets SET balance_cents = ${newBalance}, updated_at = NOW()
          WHERE id = ${params.walletId}::uuid
        `,
      );

      const txId = randomUUID();
      await tx.execute(
        sql`
          INSERT INTO wallet_ledger (
            id, tenant_id, wallet_id, transaction_type, direction, amount_cents, balance_after_cents,
            reference_id, reference_type, description, idempotency_key, status, location_id
          ) VALUES (
            ${txId}::uuid, ${params.tenantId}::uuid, ${params.walletId}::uuid, ${params.transactionType}, 'D',
            ${params.amountCents}, ${newBalance},
            ${params.referenceId ? sql`${params.referenceId}::uuid` : null},
            ${params.referenceType || null}, ${params.description || null}, ${params.idempotencyKey}, 'COMPLETED', ${effectiveLocationId}::uuid
          )
        `,
      );

      this.eventEmitter.emit('wallet.debited', {
        tenantId: params.tenantId,
        walletId: params.walletId,
        amountCents: params.amountCents,
        txId,
      });

      return txId;
    });
  }

  // Additional methods omitted for brevity.

  /**
   * getLedgerMetrics â€” runs 6 parallel aggregation queries against the
   * location-isolated schema hardened by migration 0002_location_ledger_isolation.sql.
   */
  async getLedgerMetrics(locationId: string) {
    if (!locationId) {
      throw new BadRequestException('locationId is required');
    }

    const mtdStart = new Date();
    mtdStart.setUTCDate(1);
    mtdStart.setUTCHours(0, 0, 0, 0);
    const mtdStartISO = mtdStart.toISOString();

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();

    this.logger.log(`Fetching ledger metrics for location: ${locationId}`);

    const [
      escrowResult,
      mtdCreditResult,
      mtdDebitResult,
      pendingResult,
      commissionResult,
      lastEntryResult,
    ] = await Promise.allSettled([
      (this.db as any).execute(sql`
        SELECT COALESCE(SUM(reserved_cents), 0) AS escrow_balance_cents
        FROM digital_wallets
        WHERE status = 'ACTIVE'
          AND location_id = ${locationId}::uuid
      `),
      (this.db as any).execute(sql`
        SELECT COALESCE(SUM(amount_cents), 0) AS mtd_credit_cents
        FROM wallet_ledger
        WHERE direction = 'C'
          AND location_id = ${locationId}::uuid
          AND created_at >= ${mtdStartISO}::timestamptz
      `),
      (this.db as any).execute(sql`
        SELECT COALESCE(SUM(amount_cents), 0) AS mtd_debit_cents
        FROM wallet_ledger
        WHERE direction = 'D'
          AND location_id = ${locationId}::uuid
          AND created_at >= ${mtdStartISO}::timestamptz
      `),
      (this.db as any).execute(sql`
        SELECT COUNT(*) AS pending_count
        FROM wallet_ledger
        WHERE status = 'PENDING'
          AND location_id = ${locationId}::uuid
      `),
      (this.db as any).execute(sql`
        SELECT COALESCE(SUM(amount_cents), 0) AS today_commission_cents
        FROM affiliate_commissions
        WHERE location_id = ${locationId}::uuid
          AND created_at >= ${todayStartISO}::timestamptz
      `),
      (this.db as any).execute(sql`
        SELECT MAX(created_at) AS last_entry_at
        FROM wallet_ledger
        WHERE location_id = ${locationId}::uuid
      `),
    ]);

    const safeInt = (result: PromiseSettledResult<any>, field: string): number => {
      if (result.status !== 'fulfilled') return 0;
      const row = result.value?.rows?.[0];
      return row ? parseInt(String(row[field] ?? '0'), 10) : 0;
    };

    const escrowBalanceCents     = safeInt(escrowResult,     'escrow_balance_cents');
    const mtdCreditCents         = safeInt(mtdCreditResult,  'mtd_credit_cents');
    const mtdDebitCents          = safeInt(mtdDebitResult,   'mtd_debit_cents');
    const pendingTransactionCount = safeInt(pendingResult,   'pending_count');
    const todayCommissionCents   = safeInt(commissionResult, 'today_commission_cents');

    const lastRow = lastEntryResult.status === 'fulfilled' ? lastEntryResult.value?.rows?.[0] : null;
    const lastLedgerEntryAt = lastRow?.last_entry_at ? new Date(lastRow.last_entry_at as string | number | Date).toISOString() : null;

    return {
      escrowBalanceCents,
      mtdCreditCents,
      mtdDebitCents,
      pendingTransactionCount,
      todayCommissionCents,
      netPositionCents: mtdCreditCents - mtdDebitCents,
      lastLedgerEntryAt,
      locationId,
    };
  }
}


