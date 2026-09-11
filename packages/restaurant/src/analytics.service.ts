import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pgTable, uuid, timestamp, numeric, integer, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Assuming these are external interfaces or types that are allowed to be used
interface AnalyticsQueryDto {
  startDate: string; // ISO 8601 string, e.g., '2023-01-01T00:00:00Z'
  endDate: string;   // ISO 8601 string
  tenantId: string;
  compareStartDate?: string;
  compareEndDate?: string;
  userId?: string; // For audit logging
}

import { AuditLogService } from '../audit-log/audit-log.service';

// Drizzle Schema Definition (local to this file as per critical rule 3)
// All tenant-scoped tables must include a 'tenantId' column.
const restaurants = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
});

const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  category: varchar('category', { length: 256 }),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
});

const staff = pgTable('staff', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  role: varchar('role', { length: 256 }),
});

const tables = pgTable('tables', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  capacity: integer('capacity').notNull(),
});

const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  orderDate: timestamp('order_date', { withTimezone: true }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  tipAmount: numeric('tip_amount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  staffId: uuid('staff_id').references(() => staff.id),
  tableId: uuid('table_id').references(() => tables.id),
  status: varchar('status', { length: 50 }).notNull(), // E.g., 'completed', 'pending', 'cancelled'
});

const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  priceAtSale: numeric('price_at_sale', { precision: 10, scale: 2 }).notNull(),
});

const tableSessions = pgTable('table_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  tableId: uuid('table_id').references(() => tables.id).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  partySize: integer('party_size').notNull(),
});

const tenantConfigs = pgTable('tenant_configs', {
  tenantId: uuid('tenant_id').primaryKey(),
  loyaltyRate: numeric('loyalty_rate', { precision: 5, scale: 4 }).default('0.00'), // e.g., 0.05 for 5%
});

// The Drizzle schema object for querying
const schema = {
  restaurants,
  menuItems,
  staff,
  tables,
  orders,
  orderItems,
  tableSessions,
  tenantConfigs,
};

@Injectable()
export class RestaurantAnalyticsService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<typeof schema>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private async getLoyaltyRate(tenantId: string): Promise<number> {
    const query = sql`
      SELECT loyalty_rate FROM ${tenantConfigs} WHERE tenant_id = ${tenantId}
    `;
    const result = await this.db.execute(query);
    const config = result.rows[0];
    if (config && config.loyalty_rate) {
      return parseFloat(config.loyalty_rate);
    }
    return 0; // Default to 0 if not found
  }

  // 1. Daily Revenue Summary
  async getDailyRevenueSummary(dto: AnalyticsQueryDto): Promise<any> {
    await this.auditLogService.record(dto.tenantId, {
      userId: dto.userId,
      action: 'get_daily_revenue_summary',
      details: dto,
    });

    const queryBuilder = (start: string, end: string) => sql`
      SELECT
          CAST(DATE_TRUNC('day', ${orders.orderDate}) AS DATE) AS date,
          SUM(${orders.totalAmount}) AS total_revenue
      FROM ${orders}
      WHERE ${orders.tenantId} = ${dto.tenantId}
          AND ${orders.status} = 'completed'
          AND ${orders.orderDate} BETWEEN ${start} AND ${end}
      GROUP BY 1
      ORDER BY 1;
    `;

    const currentPeriodResult = await this.db.execute(queryBuilder(dto.startDate, dto.endDate));
    let comparisonPeriodResult;

    if (dto.compareStartDate && dto.compareEndDate) {
      comparisonPeriodResult = await this.db.execute(queryBuilder(dto.compareStartDate, dto.compareEndDate));
    }

    return {
      current: currentPeriodResult.rows,
      comparison: comparisonPeriodResult?.rows,
    };
  }

  // 2. Hourly Sales for Heat Map
  async getHourlySalesHeatMap(dto: AnalyticsQueryDto): Promise<any> {
    await this.auditLogService.record(dto.tenantId, {
      userId: dto.userId,
      action: 'get_hourly_sales_heat_map',
      details: dto,
    });

    const queryBuilder = (start: string, end: string) => sql`
      SELECT
          EXTRACT(HOUR FROM ${orders.orderDate} AT TIME ZONE 'UTC') AS hour_of_day,
          EXTRACT(DOW FROM ${orders.orderDate} AT TIME ZONE 'UTC') AS day_of_week, -- 0 for Sunday, 1 for Monday, etc.
          SUM(${orders.totalAmount}) AS total_revenue
      FROM ${orders}
      WHERE ${orders.tenantId} = ${dto.tenantId}
          AND ${orders.status} = 'completed'
          AND ${orders.orderDate} BETWEEN ${start} AND ${end}
      GROUP BY 1, 2
      ORDER BY 2, 1;
    `;

    const currentPeriodResult = await this.db.execute(queryBuilder(dto.startDate, dto.endDate));
    let comparisonPeriodResult;

    if (dto.compareStartDate && dto.compareEndDate) {
      comparisonPeriodResult = await this.db.execute(queryBuilder(dto.compareStartDate, dto.compareEndDate));
    }

    return {
      current: currentPeriodResult.rows,
      comparison: comparisonPeriodResult?.rows,
    };
  }

  // 3. Top Items (by revenue and quantity)
  async getTopItems(dto: AnalyticsQueryDto): Promise<any> {
    await this.auditLogService.record(dto.tenantId, {
      userId: dto.userId,
      action: 'get_top_items',
      details: dto,
    });

    const queryBuilder = (start: string, end: string) => sql`
      SELECT
          ${menuItems.name} AS item_name,
          ${menuItems.category} AS item_category,
          SUM(${orderItems.quantity}) AS total_quantity_sold,
          SUM(${orderItems.quantity} * ${orderItems.priceAtSale}) AS total_revenue_generated
      FROM ${orderItems}
      JOIN ${orders} ON ${orderItems.orderId} = ${orders.id}
      JOIN ${menuItems} ON ${orderItems.menuItemId} = ${menuItems.id}
      WHERE ${orderItems.tenantId} = ${dto.tenantId}
          AND ${orders.status} = 'completed'
          AND ${orders.orderDate} BETWEEN ${start} AND ${end}
      GROUP BY ${menuItems.id}, ${menuItems.name}, ${menuItems.category}
      ORDER BY total_revenue_generated DESC, total_quantity_sold DESC
      LIMIT 10;
    `;

    const currentPeriodResult = await this.db.execute(queryBuilder(dto.startDate, dto.endDate));
    let comparisonPeriodResult;

    if (dto.compareStartDate && dto.compareEndDate) {
      comparisonPeriodResult = await this.db.execute(queryBuilder(dto.compareStartDate, dto.compareEndDate));
    }

    return {
      current: currentPeriodResult.rows,
      comparison: comparisonPeriodResult?.rows,
    };
  }

  // 4. Table Turn Time
  async getTableTurnTime(dto: AnalyticsQueryDto): Promise<any> {
    await this.auditLogService.record(dto.tenantId, {
      userId: dto.userId,
      action: 'get_table_turn_time',
      details: dto,
    });

    const queryBuilder = (start: string, end: string) => sql`
      SELECT
          ${tables.name} AS table_name,
          AVG(EXTRACT(EPOCH FROM (${tableSessions.endTime} - ${tableSessions.startTime}))) AS avg_turn_time_seconds
      FROM ${tableSessions}
      JOIN ${tables} ON ${tableSessions.tableId} = ${tables.id}
      WHERE ${tableSessions.tenantId} = ${dto.tenantId}
          AND ${tableSessions.startTime} BETWEEN ${start} AND ${end}
          AND ${tableSessions.endTime} IS NOT NULL
      GROUP BY ${tables.id}, ${tables.name}
      ORDER BY avg_turn_time_seconds DESC;
    `;

    const currentPeriodResult = await this.db.execute(queryBuilder(dto.startDate, dto.endDate));
    let comparisonPeriodResult;

    if (dto.compareStartDate && dto.compareEndDate) {
      comparisonPeriodResult = await this.db.execute(queryBuilder(dto.compareStartDate, dto.compareEndDate));
    }

    return {
      current: currentPeriodResult.rows,
      comparison: comparisonPeriodResult?.rows,
    };
  }

  // 5. Staff Performance (tips earned, orders taken)
  async getStaffPerformance(dto: AnalyticsQueryDto): Promise<any> {
    await this.auditLogService.record(dto.tenantId, {
      userId: dto.userId,
      action: 'get_staff_performance',
      details: dto,
    });

    const queryBuilder = (start: string, end: string) => sql`
      SELECT
          ${staff.name} AS staff_name,
          SUM(${orders.tipAmount}) AS total_tips_earned,
          COUNT(DISTINCT ${orders.id}) AS total_orders_taken,
          SUM(${orders.totalAmount}) AS total_sales_generated
      FROM ${orders}
      JOIN ${staff} ON ${orders.staffId} = ${staff.id}
      WHERE ${orders.tenantId} = ${dto.tenantId}
          AND ${orders.status} = 'completed'
          AND ${orders.orderDate} BETWEEN ${start} AND ${end}
      GROUP BY ${staff.id}, ${staff.name}
      ORDER BY total_tips_earned DESC, total_orders_taken DESC;
    `;

    const currentPeriodResult = await this.db.execute(queryBuilder(dto.startDate, dto.endDate));
    let comparisonPeriodResult;

    if (dto.compareStartDate && dto.compareEndDate) {
      comparisonPeriodResult = await this.db.execute(queryBuilder(dto.compareStartDate, dto.compareEndDate));
    }

    return {
      current: currentPeriodResult.rows,
      comparison: comparisonPeriodResult?.rows,
    };
  }

  // Example: Loyalty calculation using tenant_configs
  async calculateLoyaltyPoints(orderId: string, tenantId: string, userId?: string): Promise<{ pointsEarned: number; loyaltyRate: number }> {
    await this.auditLogService.record(tenantId, {
      userId: userId,
      action: 'calculate_loyalty_points',
      details: { orderId },
    });

    const loyaltyRate = await this.getLoyaltyRate(tenantId);

    const orderTotalQuery = sql`
      SELECT ${orders.totalAmount}
      FROM ${orders}
      WHERE ${orders.id} = ${orderId} AND ${orders.tenantId} = ${tenantId}
    `;
    const orderTotalResult = await this.db.execute(orderTotalQuery);
    const order = orderTotalResult.rows[0];

    let pointsEarned = 0;
    if (order && order.total_amount) {
      const totalAmount = parseFloat(order.total_amount);
      pointsEarned = totalAmount * loyaltyRate;
    }

    return { pointsEarned, loyaltyRate };
  }
}
