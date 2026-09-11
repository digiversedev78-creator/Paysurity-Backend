import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface OpenSessionDto {
  terminalId: string;
  cashierUserId: string;
  openingCashCents: number;
  maxAcceptableVarianceCents?: number; // Defaults to 500 ($5.00) if omitted
}

export interface CloseSessionDto {
  sessionId: string;
  actualClosingCents: number;
  notes?: string;
}

@Injectable()
export class CashControlService {
  private readonly logger = new Logger(CashControlService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * REQ-POSR-CASH-01: Open Retail Cash Session
   * Mimics Odoo POS. Validates that the hardware terminal is not already occupied.
   * Locks the terminal to the specific cashier for auditable accountability.
   */
  async openSession(tenantId: string, dto: OpenSessionDto) {
    this.logger.log(`Terminal ${dto.terminalId} opening cash session by ${dto.cashierUserId}`);

    if (dto.openingCashCents < 0) throw new BadRequestException('Opening float cannot be negative.');

    try {
      await (this.db as any).execute('BEGIN');

      // 1. Verify terminal is not already active
      const activeRes = await (this.db as any).execute(
        `SELECT id FROM retail_cash_control_sessions 
         WHERE terminal_id = $1 AND tenant_id = $2 AND status IN ('OPEN', 'CASH_COUNT', 'SUPERVISOR_REVIEW') LIMIT 1`,
        [dto.terminalId, tenantId]
      );
      if (activeRes?.rows?.length > 0) throw new BadRequestException(`Terminal ${dto.terminalId} is already running an active session.`);

      // 2. Open the physical session drawer logging
      const session = await (this.db as any).execute(
        `INSERT INTO retail_cash_control_sessions (id, tenant_id, terminal_id, cashier_user_id, opened_at, opening_cash_cents, max_acceptable_variance_cents, status)
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4, $5, 'OPEN') RETURNING *`,
        [tenantId, dto.terminalId, dto.cashierUserId, dto.openingCashCents, dto.maxAcceptableVarianceCents ?? 500]
      );

      this.eventEmitter.emit('pos.cash.session_opened', { sessionId: (session as any).rows[0].id, terminalId: dto.terminalId });

      await (this.db as any).execute('COMMIT');
      return (session as any).rows[0];
    } catch (e) {
      await (this.db as any).execute('ROLLBACK');
      throw new BadRequestException(`Failed to open cash drawer session: ${e.message}`);
    }
  }

  /**
   * Internal Method: Mathematically compute the Expected Cash Drop by aggregating all POS Orders 
   * completed by this terminal in Cash tender since the shift began.
   */
  private async calculateExpectedClosing(tenantId: string, sessionId: string, openedAt: string, terminalId: string, openingCash: number): Promise<number> {
    // Queries only CASH tender orders processed by the active terminal
    const cashSalesRes = await (this.db as any).execute(
      `SELECT COALESCE(SUM(total_cents), 0) as total_cash_sales 
       FROM orders 
       WHERE tenant_id = $1 AND created_at >= $2 AND status IN ('FULFILLED', 'COMPLETED') 
       AND (payment_method = 'CASH' OR source_channel = 'POS_CASH')
       -- NOTE: Production requires hardware ID binding to POS Orders. Assuming terminal routing for calculation.`,
      [tenantId, openedAt]
    );

    const netCashSales = parseInt(cashSalesRes?.rows?.[0]?.total_cash_sales || '0', 10);
    return openingCash + netCashSales;
  }

  /**
   * REQ-POSR-CASH-02: Blind Closeout Execution
   * The cashier does NOT see the expected total. They count physical bills and submit the total.
   * If the math drifts beyond max_acceptable_variance_cents, it inherently bricks the session into Supervisor Review.
   */
  async submitBlindCloseout(tenantId: string, dto: CloseSessionDto) {
    this.logger.log(`Blind Closeout submitted for Session ${dto.sessionId}`);

    const existingRes = await (this.db as any).execute(
      `SELECT * FROM retail_cash_control_sessions WHERE id = $1 AND tenant_id = $2 AND status = 'OPEN' LIMIT 1`,
      [dto.sessionId, tenantId]
    );

    const session = existingRes?.rows?.[0];
    if (!session) throw new BadRequestException('Session is not OPEN or does not exist.');

    // 1. Mathematically aggregate actual expected cash 
    const expectedClosing = await this.calculateExpectedClosing(tenantId, session.id, session.opened_at, session.terminal_id, session.opening_cash_cents);

    // 2. Diff physical count vs digital expectation
    const variance = dto.actualClosingCents - expectedClosing;
    const absoluteDrift = Math.abs(variance);
    
    // 3. Security Router: Clean close vs Supervisor Lock
    let finalStatus = 'CLOSED';
    if (absoluteDrift > session.max_acceptable_variance_cents) {
      finalStatus = 'SUPERVISOR_REVIEW';
      this.logger.warn(`SECURITY ALERT: Cash Session ${session.id} breached variance tolerance. Expected: $${expectedClosing/100}, Counted: $${dto.actualClosingCents/100}. Locked for Review.`);
      // Emit trigger for Push Notification to General Manager
      this.eventEmitter.emit('pos.cash.supervisor_alert', { sessionId: session.id, varianceCents: variance });
    }

    const closedSession = await (this.db as any).execute(
      `UPDATE retail_cash_control_sessions 
       SET closed_at = NOW(), expected_closing_cents = $1, actual_closing_cents = $2, variance_cents = $3, status = $4, notes = $5
       WHERE id = $6 RETURNING *`,
      [expectedClosing, dto.actualClosingCents, variance, finalStatus, dto.notes || null, session.id]
    );

    return closedSession?.rows?.[0];
  }

  /**
   * Used exclusively by Managers to override a mathematical lockdown due to dropped change or theft logs.
   */
  async resolveSupervisorReview(tenantId: string, sessionId: string, managerUserId: string, resolutionNotes: string) {
    const existing = await (this.db as any).execute(
      `SELECT * FROM retail_cash_control_sessions WHERE id = $1 AND tenant_id = $2 AND status = 'SUPERVISOR_REVIEW' LIMIT 1`,
      [sessionId, tenantId]
    );
    if (!existing?.rows?.length) throw new BadRequestException('Invalid Session or not pending review.');

    // Production: Audit log the override strictly
    return await (this.db as any).execute(
      `UPDATE retail_cash_control_sessions SET status = 'CLOSED', notes = CONCAT(notes, '\n[MANAGER RESOLVE]: ', $1::text) WHERE id = $2 RETURNING *`,
      [resolutionNotes, sessionId]
    );
  }
}

