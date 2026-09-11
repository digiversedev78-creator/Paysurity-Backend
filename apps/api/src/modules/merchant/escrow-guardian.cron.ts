import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { sql } from 'drizzle-orm';

@Injectable()
export class EscrowGuardianCron {
  private readonly logger = new Logger(EscrowGuardianCron.name);

  constructor(@Inject('DATABASE') private readonly db: any) {}

  @Cron(CronExpression.EVERY_HOUR)
  async enforce72HourCompliance() {
    this.logger.log('Executing 72-Hour Provisional Escrow Audit...');
    
    // Identify violating tenants
    const violators = await (this.db as any).execute(sql`
      SELECT id, status, updated_at 
      FROM tenants 
      WHERE status = 'PROVISIONAL' 
      AND payout_locked = TRUE 
      AND created_at < NOW() - INTERVAL '72 hours'
    `);

    for (const tenant of (violators as any).rows || []) {
      // Escalate Status to isolate funds and trigger manual review
      // Note: Map to Super Admin review (from 14-role RBAC matrix)
      await (this.db as any).execute(sql`
        UPDATE tenants 
        SET status = 'MANUAL_REVIEW_REQUIRED', updated_at = NOW() 
        WHERE id = ${tenant.id}
      `);
      this.logger.warn(`Tenant ${tenant.id} automatically escalated to MANUAL_REVIEW_REQUIRED due to 72H Escrow breach.`);
    }
  }
}


