import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * AffiliatesService â€“ handles commission calculations for affiliate payouts.
 * Implements dynamic tiered commission matrix based on affiliate_commission_rates.
 */
@Injectable()
export class AffiliatesService {
  private readonly logger = new Logger(AffiliatesService.name);

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * processCommission â€“ Called after order creation to calculate and record affiliate commission.
   * Parameters:
   *   orderId: UUID of the order
   *   merchantId: UUID of the affiliate broker/merchant
   *   tenantId: UUID of the tenant
   *   locationId: UUID of the location (must be provided)
   *   amountCents: Total order amount in cents (processing fee basis)
   */
  async processCommission(params: {
    orderId: string;
    merchantId: string;
    tenantId: string;
    locationId: string;
    amountCents: number;
  }) {
    // Basic validation
    if (!params.locationId) {
      throw new BadRequestException('Location ID is required');
    }
    if (params.amountCents <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    // Idempotency â€“ check if commission already recorded for this order
    const existingRes = await this.db
      .execute(sql`
        SELECT id FROM affiliate_commissions WHERE order_id = ${params.orderId}::uuid AND tenant_id = ${params.tenantId}::uuid
      `)
      .catch(() => ({ rows: [] }));
    if ((existingRes as any).rows.length > 0) {
      this.logger.log(`Commission already exists for order ${params.orderId}`);
      return { success: true, existing: true };
    }

    // Retrieve tiered commission rates for the given merchant/broker
    const ratesRes = await this.db
      .execute(sql`
        SELECT tier_level, basis_points FROM affiliate_commission_rates
        WHERE tenant_id = ${params.tenantId}::uuid AND broker_id = ${params.merchantId}::uuid
        ORDER BY tier_level DESC
      `)
      .catch(() => ({ rows: [] }));

    if ((ratesRes as any).rows.length === 0) {
      throw new NotFoundException('No commission rates configured for this affiliate');
    }

    // Calculate total commission based on rates (basis_points are stored as integer, e.g., 250 = 2.5%)
    let totalCommissionCents = 0;
    for (const rate of (ratesRes as any).rows) {
      const commission = Math.floor((params.amountCents * rate.basis_points) / 10000);
      totalCommissionCents += commission;
    }

    // Insert commission record
    const commissionId = uuidv4();
    await (this.db as any).execute(sql`
      INSERT INTO affiliate_commissions (
        id, tenant_id, merchant_id, location_id, order_id, amount_cents, created_at
      ) VALUES (
        ${commissionId}::uuid,
        ${params.tenantId}::uuid,
        ${params.merchantId}::uuid,
        ${params.locationId}::uuid,
        ${params.orderId}::uuid,
        ${totalCommissionCents},
        NOW()
      )
    `);

    this.logger.log(`Affiliate commission of ${totalCommissionCents} cents recorded for order ${params.orderId}`);
    return { success: true, commissionId, amount_cents: totalCommissionCents };
  }
}


