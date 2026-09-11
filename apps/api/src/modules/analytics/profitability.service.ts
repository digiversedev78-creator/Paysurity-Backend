import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ProfitabilityAnalyticsService {
  private readonly logger = new Logger(ProfitabilityAnalyticsService.name);

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<Record<string, unknown>>) {}

  /**
   * REQ-ANA-010: Total Daily Profitability Matrix
   * Consolidates Gross Revenue, Live Labor Burden (Clocked-in Hours * Wages),
   * and Material COGS (Cost of Goods Sold via Inventory extraction).
   */
  async getDailyProfitabilityMatrix(tenantId: string, date: string) {
    this.logger.log(`Calculating precise profitability for tenant ${tenantId} on ${date}`);

    try {
      // 1. Gross Revenue from completed orders today
      const revenueRes = await (this.db as unknown as Record<string, unknown> & { execute: (q: string, p: string[]) => Promise<{ rows?: { gross_revenue?: string }[] }> }).execute(
        `SELECT COALESCE(SUM(total_cents), 0) as gross_revenue 
         FROM orders WHERE tenant_id = $1 AND created_at::DATE = $2::DATE AND status IN ('completed', 'delivered')`,
        [tenantId, date]
      );
      const grossRevenue = parseInt(revenueRes?.rows?.[0]?.gross_revenue || '0', 10);

      // 2. Exact COGS (Cost of Goods Sold)
      // Extracts the wholesale cost of every SKU sold today
      const cogsRes = await (this.db as unknown as Record<string, unknown> & { execute: (q: string, p: string[]) => Promise<{ rows?: { total_cogs?: string }[] }> }).execute(
        `SELECT COALESCE(SUM(p.cost * oli.quantity), 0) as total_cogs
         FROM order_line_items oli
         JOIN products p ON p.id = oli.product_id
         JOIN orders o ON o.id = oli.order_id
         WHERE o.tenant_id = $1 AND o.created_at::DATE = $2::DATE`,
        [tenantId, date]
      );
      const cogs = parseFloat(cogsRes?.rows?.[0]?.total_cogs || '0') * 100; // Cost is mostly numeric structure

      // 3. Real-Time Labor Cost
      // Uses EXTRACT EPOCH to calculate exact seconds clocked in times the hourly wage
      const laborRes = await (this.db as unknown as Record<string, unknown> & { execute: (q: string, p: string[]) => Promise<{ rows?: { labor_cost?: string }[] }> }).execute(
        `SELECT COALESCE(SUM(
           (EXTRACT(EPOCH FROM (COALESCE(clock_out_time, NOW()) - clock_in_time)) / 3600) 
           * hourly_rate_cents_snapshot
         ), 0) as labor_cost
         FROM shifts 
         WHERE tenant_id = $1 AND clock_in_time::DATE = $2::DATE`,
        [tenantId, date]
      );
      const laborCost = parseInt(laborRes?.rows?.[0]?.labor_cost || '0', 10);

      // 4. Matrix Generation
      const netProfitCents = grossRevenue - cogs - laborCost;
      const marginPercentage = grossRevenue > 0 ? (netProfitCents / grossRevenue) * 100 : 0;

      return {
        date,
        grossRevenueCents: grossRevenue,
        materialsCogsCents: Math.round(cogs),
        realTimeLaborCents: Math.round(laborCost),
        netProfitCents: Math.round(netProfitCents),
        marginPercentage: parseFloat(marginPercentage.toFixed(2)),
        status: netProfitCents > 0 ? 'PROFITABLE' : 'LOSS_LEADER'
      };

    } catch (e) {
      this.logger.error(`Matrix calculation failed: ${(e as Error).message}`);
      return {  grossRevenueCents: 0, materialsCogsCents: 0, realTimeLaborCents: 0, netProfitCents: 0, marginPercentage: 0 };
    }
  }
}



