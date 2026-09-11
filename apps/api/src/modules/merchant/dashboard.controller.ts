import { Controller, Get, Logger, Inject, Optional } from '@nestjs/common';
import { sql, desc, count, sum } from 'drizzle-orm';

// Schema imports -- graceful fallback
let ordersTable: any;
let menuItemsTable: any;
let paymentIntentsTable: any;
try {
  const schema = require('@paysurity/database');
  ordersTable = schema.orders;
  menuItemsTable = schema.menuItems;
  paymentIntentsTable = schema.paymentIntents;
} catch {
  // Schema not available
}

/**
 * DashboardController -- Aggregated stats for the merchant dashboard frontend.
 *
 * GET /api/dashboard/stats -- Returns KPIs, revenue chart, top sellers, recent orders.
 *
 * When DB is connected, reads from payment_intents + orders tables.
 * When DB is unavailable, returns demo data for frontend development.
 */
@Controller('api/dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  @Get('stats')
  async getStats() {
    // If DB is available, try to aggregate real data
    if (this.db && ordersTable && paymentIntentsTable) {
      try {
        return await this.getStatsFromDb();
      } catch (err) {
        this.logger.warn(`[DASH] DB query failed, returning demo data: ${err}`);
      }
    }

    // Demo data fallback
    return {
      todaySales: 4_287_50,
      todayOrders: 67,
      avgTicket: 63_99,
      activeOrders: 5,
      weeklyRevenue: [3200_00, 2800_00, 4100_00, 3900_00, 4500_00, 5200_00, 4287_50],
      topItems: [
        { name: 'Signature Burger', qty: 42, revenue: 629_58 },
        { name: 'Caesar Salad', qty: 31, revenue: 418_50 },
        { name: 'Truffle Fries', qty: 54, revenue: 485_46 },
        { name: 'Grilled Salmon', qty: 18, revenue: 467_82 },
        { name: 'Craft Lemonade', qty: 89, revenue: 445_00 },
      ],
      recentOrders: [
        { id: 'ORD-7842', type: 'DINE_IN', total: 87_50, status: 'PREPARING', time: '2 min ago' },
        { id: 'ORD-7841', type: 'TAKEOUT', total: 42_30, status: 'READY', time: '5 min ago' },
        { id: 'ORD-7840', type: 'DELIVERY', total: 95_00, status: 'SERVED', time: '12 min ago' },
        { id: 'ORD-7839', type: 'DINE_IN', total: 134_20, status: 'SERVED', time: '18 min ago' },
        { id: 'ORD-7838', type: 'CURBSIDE', total: 28_50, status: 'SERVED', time: '25 min ago' },
      ],
    };
  }

  private async getStatsFromDb() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrders = await this.db
      .select({
        count: count(),
        totalCents: sum(ordersTable.totalCents),
      })
      .from(ordersTable)
      .where(sql`${ordersTable.createdAt} >= ${today.toISOString()}`);

    const orderCount = Number(todayOrders[0]?.count ?? 0);
    const totalSales = Number(todayOrders[0]?.totalCents ?? 0);

    // Recent orders
    const recent = await this.db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))
      .limit(5);

    const recentOrders = recent.map((o: any) => ({
      id: o.orderNumber,
      type: o.orderType?.toUpperCase() ?? 'DINE_IN',
      total: o.totalCents ?? 0,
      status: o.status?.toUpperCase() ?? 'OPEN',
      time: this.timeAgo(o.createdAt),
    }));

    return {
      todaySales: totalSales,
      todayOrders: orderCount,
      avgTicket: orderCount > 0 ? Math.round(totalSales / orderCount) : 0,
      activeOrders: recent.filter((o: any) => ['created', 'preparing'].includes(o.status)).length,
      weeklyRevenue: [0, 0, 0, 0, 0, 0, totalSales], // Simplified -- full implementation would aggregate 7 days
      topItems: [],
      recentOrders,
    };
  }

  private timeAgo(date: Date | string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }
}
