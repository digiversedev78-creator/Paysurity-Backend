import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, eq, and, desc, gte } from 'drizzle-orm';
import * as schema from '@paysurity/database';

export interface DashboardKpis {
  revenue_today_cents: number;
  order_count_today: number;
  avg_order_value_cents: number;
  active_loyalty_members: number;
}

export interface RevenueTrendRow {
  date: string;
  revenue_cents: number;
}

export interface OrderStatusBreakdown {
  status: string;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  totalCents: number;
  status: string;
  createdAt: string;
}

export interface NLQResponse {
  query: string;
  response: string;
  data: any;
}

export interface LaborPulseMetric {
  locationId: string;
  efficiencyRatio: number;
  alert: string | null;
}

export interface AnomalyAlert {
  type: string;
  description: string;
  severity: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('PG_CONNECTION') private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getDashboardKpis(tenantId: string): Promise<DashboardKpis> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result = await this.db
      .select({
        revenue_today_cents: sql<number>`SUM(${schema.orders.totalCents})`,
        order_count_today: sql<number>`COUNT(${schema.orders.id})`,
      })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.tenantId, tenantId),
          gte(schema.orders.createdAt, today)
        )
      )
      .execute();

    const row = result[0];
    const revenue = Number(row.revenue_today_cents) || 0;
    const count = Number(row.order_count_today) || 0;
    const avg = count > 0 ? Math.floor(revenue / count) : 0;

    const loyaltyResult = await this.db
      .select({ count: sql<number>`COUNT(DISTINCT ${schema.loyalty_points.customerId})` })
      .from(schema.loyalty_points)
      .where(eq(schema.loyalty_points.tenantId, tenantId))
      .execute();
      
    const loyaltyCount = Number(loyaltyResult[0].count) || 0;

    return {
      revenue_today_cents: revenue,
      order_count_today: count,
      avg_order_value_cents: avg,
      active_loyalty_members: loyaltyCount,
    };
  }

  async getRevenueTrend(tenantId: string, period: string): Promise<RevenueTrendRow[]> {
    const past = new Date();
    past.setUTCDate(past.getUTCDate() - 7);

    const result = await this.db.execute(sql`
      SELECT
        CAST(DATE_TRUNC('day', ${schema.orders.createdAt}) AS DATE) AS date,
        SUM(${schema.orders.totalCents}) AS revenue_cents
      FROM ${schema.orders}
      WHERE ${schema.orders.tenantId} = ${tenantId}
        AND ${schema.orders.createdAt} >= ${past}
      GROUP BY 1
      ORDER BY 1
    `);

    return result.rows.map(row => ({
      date: String(row.date),
      revenue_cents: Number(row.revenue_cents) || 0,
    }));
  }

  async getOrderStatusBreakdown(tenantId: string): Promise<OrderStatusBreakdown[]> {
    const totalResult = await this.db
      .select({ total: sql<number>`COUNT(${schema.orders.id})` })
      .from(schema.orders)
      .where(eq(schema.orders.tenantId, tenantId))
      .execute();

    const total = Number(totalResult[0]?.total) || 0;
    if (total === 0) return [];

    const result = await this.db.execute(sql`
      SELECT
        ${schema.orders.status} AS status,
        COUNT(${schema.orders.id}) AS count
      FROM ${schema.orders}
      WHERE ${schema.orders.tenantId} = ${tenantId}
      GROUP BY 1
    `);

    return result.rows.map(row => ({
      status: String(row.status),
      percentage: Math.round((Number(row.count) / total) * 100),
    }));
  }

  async getRecentOrders(tenantId: string, limit: number = 10): Promise<RecentOrder[]> {
    const results = await this.db
      .select({
        id: schema.orders.id,
        orderNumber: schema.orders.orderNumber,
        totalCents: schema.orders.totalCents,
        status: schema.orders.status,
        createdAt: schema.orders.createdAt,
      })
      .from(schema.orders)
      .where(eq(schema.orders.tenantId, tenantId))
      .orderBy(desc(schema.orders.createdAt))
      .limit(limit)
      .execute();

    return results.map(row => ({
      id: row.id,
      orderNumber: row.orderNumber,
      totalCents: row.totalCents || 0,
      status: row.status || '',
      createdAt: row.createdAt ? row.createdAt.toISOString() : '',
    }));
  }

  async synthesizeIntelligence(tenantId: string, query: string, contextVector: any): Promise<NLQResponse> {
    return {
      query,
      response: "Agentic NLQ Studio response (Placeholder for actual LLM integration).",
      data: {}
    };
  }

  async calculateLaborPulse(tenantId: string, locationId: string): Promise<LaborPulseMetric> {
    return {
      locationId,
      efficiencyRatio: 1.5,
      alert: null
    };
  }

  async monitorTelemetryTriage(tenantId: string): Promise<Array<AnomalyAlert>> {
    return [];
  }
}
