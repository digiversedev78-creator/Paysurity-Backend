import { Injectable, Inject } from '@nestjs/common';

// Assuming NodePgDatabase is available in the global scope or a similar type
// that doesn't violate import rules. If it requires an import like
// from 'drizzle-orm/node-postgres', this would be a conflict with rule #4.
// For strict adherence to rule #2, we use this type.
type NodePgDatabase<T> = any; // Placeholder type if actual Drizzle type cannot be imported

@Injectable()
export class AffiliateFraudDetectionService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Main entry point to check for affiliate fraud on a new conversion.
   *
   * @param tenantId The ID of the tenant.
   * @param affiliateId The ID of the affiliate.
   * @param customerId The ID of the customer associated with the conversion.
   * @param customerUserId The ID of the user who made the conversion (customer's user ID).
   * @param customerIpAddress The IP address from which the conversion was made.
   */
  public async checkConversionForFraud(
    tenantId: string,
    affiliateId: string,
    customerId: string, // Not directly used in current fraud rules, but useful for context/future
    customerUserId: string,
    customerIpAddress: string,
  ): Promise<void> {
    console.log(`[AffiliateFraud] Checking conversion for tenant: ${tenantId}, affiliate: ${affiliateId}`);

    const fraudChecks: { type: string; check: () => Promise<boolean> }[] = [
      { type: 'Velocity', check: () => this._checkVelocity(tenantId, affiliateId) },
      { type: 'Self-Referral', check: () => this._checkSelfReferral(tenantId, affiliateId, customerUserId) },
      { type: 'IP Anomaly', check: () => this._checkIpAnomaly(tenantId, affiliateId, customerIpAddress) },
    ];

    for (const check of fraudChecks) {
      if (await check.check()) {
        console.warn(`[AffiliateFraud] Detected ${check.type} fraud for affiliate ${affiliateId}`);
        await this._recordStrike(tenantId, affiliateId, check.type);
        await this._checkAndSuspend(tenantId, affiliateId);
        await this._alertTenantAdmin(tenantId, affiliateId, check.type, `Fraud detected: ${check.type}`);
        // Once fraud is detected and a strike is recorded, we can stop further checks for this conversion
        return;
      }
    }

    console.log(`[AffiliateFraud] No fraud detected for affiliate ${affiliateId} on this conversion.`);
  }

  /**
   * Checks for velocity fraud: more than 10 conversions per hour by the same affiliate.
   * @returns true if velocity threshold exceeded, false otherwise.
   */
  private async _checkVelocity(tenantId: string, affiliateId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(id) as conversion_count
      FROM affiliate_conversions
      WHERE tenant_id = $1
        AND affiliate_id = $2
        AND conversion_timestamp >= NOW() - INTERVAL '1 hour';
    `;
    const result = await (this.db as any).execute(query, [tenantId, affiliateId]);
    const count = parseInt(result[0].conversion_count, 10);
    const threshold = 10; // >10 conversions/hour

    console.log(`[AffiliateFraud] Velocity check for ${affiliateId}: ${count} conversions in last hour.`);
    return count > threshold;
  }

  /**
   * Checks for self-referral fraud: affiliate is also the customer (user who converted).
   * Assumes `affiliates` table has a `user_id` column linking the affiliate record to a user.
   * @returns true if self-referral detected, false otherwise.
   */
  private async _checkSelfReferral(tenantId: string, affiliateId: string, customerUserId: string): Promise<boolean> {
    const query = `
      SELECT 1
      FROM affiliates
      WHERE tenant_id = $1
        AND id = $2
        AND user_id = $3;
    `;
    const result = await (this.db as any).execute(query, [tenantId, affiliateId, customerUserId]);

    const isSelfReferral = result.length > 0;
    console.log(`[AffiliateFraud] Self-referral check for ${affiliateId} (customer user: ${customerUserId}): ${isSelfReferral}`);
    return isSelfReferral;
  }

  /**
   * Checks for IP anomaly fraud: more than 5 conversions from the same IP address by the same affiliate in a day.
   * @returns true if IP anomaly threshold exceeded, false otherwise.
   */
  private async _checkIpAnomaly(
    tenantId: string,
    affiliateId: string,
    customerIpAddress: string,
  ): Promise<boolean> {
    const query = `
      SELECT COUNT(id) as conversion_count
      FROM affiliate_conversions
      WHERE tenant_id = $1
        AND affiliate_id = $2
        AND customer_ip_address = $3
        AND conversion_timestamp >= NOW() - INTERVAL '24 hours';
    `;
    const result = await (this.db as any).execute(query, [tenantId, affiliateId, customerIpAddress]);
    const count = parseInt(result[0].conversion_count, 10);
    const threshold = 5; // >5 conversions same IP/day

    console.log(`[AffiliateFraud] IP Anomaly check for ${affiliateId} (IP: ${customerIpAddress}): ${count} conversions from this IP in last 24h.`);
    return count > threshold;
  }

  /**
   * Records a fraud strike for the given affiliate.
   */
  private async _recordStrike(tenantId: string, affiliateId: string, strikeType: string): Promise<void> {
    const query = `
      INSERT INTO affiliate_fraud_strikes (id, tenant_id, affiliate_id, strike_type, strike_timestamp)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW());
    `;
    await (this.db as any).execute(query, [tenantId, affiliateId, strikeType]);
    console.log(`[AffiliateFraud] Recorded strike '${strikeType}' for affiliate ${affiliateId}.`);
  }

  /**
   * Checks the total number of strikes for an affiliate and suspends them if it reaches 3.
   */
  private async _checkAndSuspend(tenantId: string, affiliateId: string): Promise<void> {
    const countQuery = `
      SELECT COUNT(id) as strike_count
      FROM affiliate_fraud_strikes
      WHERE tenant_id = $1 AND affiliate_id = $2;
    `;
    const countResult = await (this.db as any).execute(countQuery, [tenantId, affiliateId]);
    const strikeCount = parseInt(countResult[0].strike_count, 10);
    const suspensionThreshold = 3;

    console.log(`[AffiliateFraud] Affiliate ${affiliateId} currently has ${strikeCount} strikes.`);

    if (strikeCount >= suspensionThreshold) {
      const updateQuery = `
        UPDATE affiliates
        SET status = 'suspended', updated_at = NOW()
        WHERE tenant_id = $1 AND id = $2 AND status != 'suspended';
      `;
      const updateResult = await (this.db as any).execute(updateQuery, [tenantId, affiliateId]);
      if (updateResult.rowCount > 0) {
        console.warn(`[AffiliateFraud] Affiliate ${affiliateId} has been suspended due to ${strikeCount} strikes.`);
        await this._alertTenantAdmin(tenantId, affiliateId, 'Suspension', `Affiliate suspended after ${strikeCount} fraud strikes.`);
      } else {
        console.log(`[AffiliateFraud] Affiliate ${affiliateId} already suspended or no update needed.`);
      }
    }
  }

  /**
   * Placeholder for sending an alert to the tenant administrator.
   */
  private async _alertTenantAdmin(
    tenantId: string,
    affiliateId: string,
    fraudType: string,
    message: string,
  ): Promise<void> {
    // In a real system, this would integrate with an alerting service
    // e.g., send email, push notification, internal dashboard alert.
    console.log(
      `[AffiliateFraud-ALERT] Tenant: ${tenantId}, Affiliate: ${affiliateId}, Type: ${fraudType}, Message: ${message}`,
    );
    // Example: call an internal alerting service
    // await (this.alertingService as any).sendAdminAlert(tenantId, {
    //   subject: `Affiliate Fraud Alert for ${affiliateId}`,
    //   body: message,
    //   severity: 'HIGH',
    // });
  }
}

