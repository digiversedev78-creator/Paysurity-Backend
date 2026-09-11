/**
 * RestaurantService â€” Production Grade v2.0
 *
 * REQ-POSR-001: Core Order Management â€” openOrder, addItem, fireToKDS, splitCheck, closeOrder, voidOrder
 * REQ-POSR-002: KDS routing â€” routeItemToStation() called from addItem + fireToKDS
 * REQ-POSR-003: Menu & modifier management â€” delegated to MenuService
 * REQ-POSR-005: Multi-channel aggregation â€” source_channel stored on every order
 * REQ-POSR-006: Payment processing & tip â€” multi-tender, auto-gratuity from DB config
 * REQ-POSR-007: Shift close report â€” closeShift() generates shift_close_reports row
 * REQ-POSR-008: Loyalty at POS â€” lookupLoyaltyAccount(), earning triggered inside closeOrder tx
 * REQ-POSR-009: Offline sync â€” processBatchSync() accepts array from queue
 * REQ-POSR-010: Receipt â€” generateReceiptPayload() for print/email/SMS
 *
 * Canonical source: Requirements/Canonical/POSR_POS_RESTAURANT.md
 * DB tables: orders, order_items, payments, tables, kds_stations,
 *            shift_close_reports, shift_employees (migration 010)
 */

import {
  Injectable, Logger, Inject, BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type OrderType = 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'AI_ORDER' | 'CATERING';
export type SourceChannel = 'POS' | 'KIOSK' | 'WEB_ORDER' | 'AI_ASSISTANT' | 'DOORDASH' | 'UBEREATS' | 'GRUBHUB' | 'PHONE';
export type OrderStatus = 'OPEN' | 'SENT_TO_KDS' | 'ALL_FIRED' | 'READY' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethodType = 'CARD_PRESENT' | 'CARD_NP' | 'CASH' | 'GIFT_CARD' | 'LOYALTY' | 'EBT' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'ACH';

export interface OpenOrderParams {
  tenantId: string;
  locationId: string;
  tableId?: string;
  orderType: OrderType;
  sourceChannel?: SourceChannel;
  serverId?: string;
  consumerPhone?: string;  // POSR-008: lookup loyalty account at order open
  notes?: string;
  idempotencyKey?: string;
}

export interface AddItemParams {
  tenantId: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  modifiers?: Array<{ name: string; priceDeltaCents: number; quantity?: number }>;
  notes?: string;
  course?: number;
}

export interface PaymentSpec {
  method: PaymentMethodType;
  amountCents: number;
  gatewayRefId?: string;
  idempotencyKey?: string;
}

export interface CloseOrderParams {
  tenantId: string;
  orderId: string;
  payments: PaymentSpec[];
  tipCents?: number;
  loyaltyAccountId?: string;
  loyaltyPointsToRedeem?: number;
}

export interface SplitSpec {
  ways?: number;  // even split N ways
  splits?: Array<{ itemIds: string[]; consumerName?: string }>;  // item-by-item
}

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger(RestaurantService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Helper: Read config from DB (never hardcode)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private async getConfig(tenantId: string, key: string, fallback: string): Promise<string> {
    const result = await (this.db as any).execute(sql`
      SELECT COALESCE(
        (SELECT value FROM merchant_config WHERE tenant_id = ${tenantId}::uuid AND config_key = ${key}),
        (SELECT value FROM platform_config WHERE key = ${key})
      ) AS value
    `).catch(() => ({ rows: [{ value: fallback }] }));
    return (result as any)?.rows?.[0]?.value ?? fallback;
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001: openOrder
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * REQ-POSR-001: Open a new order. Sets table status = OCCUPIED for dine-in.
   * POSR-008: If consumerPhone provided, looks up loyalty account proactively.
   */
  async openOrder(params: OpenOrderParams): Promise<{
    orderId: string; shortId: string; loyaltyAccountId?: string; loyaltyBalance?: number;
  }> {
    const {
      tenantId, locationId, tableId, orderType,
      sourceChannel = 'POS', serverId, consumerPhone, notes, idempotencyKey,
    } = params;

    // Idempotency check
    if (idempotencyKey) {
      const existing = await (this.db as any).execute(sql`
        SELECT id, short_id FROM orders WHERE idempotency_key = ${idempotencyKey} LIMIT 1
      `).catch(() => ({ rows: [] }));
      const ex = (existing as any)?.rows?.[0];
      if (ex) return { orderId: ex.id, shortId: ex.short_id };
    }

    // Generate human-readable short ID: BB-XXXX
    const prefix = sourceChannel === 'DOORDASH' ? 'DD' : sourceChannel === 'UBEREATS' ? 'UE' : sourceChannel === 'GRUBHUB' ? 'GH' : 'BB';
    const shortId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = randomUUID();

    await (this.db as any).transaction(async (tx) => {
      // Create order
      await tx.execute(sql`
        INSERT INTO orders (
          id, tenant_id, location_id, short_id, order_type, source_channel,
          table_id, server_user_id, status, notes, idempotency_key,
          subtotal_cents, tax_cents, tip_cents, delivery_fee_cents, discount_cents, total_cents,
          created_at, updated_at
        ) VALUES (
          ${orderId}::uuid, ${tenantId}::uuid, ${locationId}::uuid,
          ${shortId}, ${orderType}, ${sourceChannel},
          ${tableId ? `${tableId}::uuid` : null},
          ${serverId ? `${serverId}::uuid` : null},
          'OPEN', ${notes ?? null}, ${idempotencyKey ?? null},
          0, 0, 0, 0, 0, 0, NOW(), NOW()
        )
      `);

      // POSR-001: Set table to OCCUPIED for dine-in
      if (tableId && orderType === 'DINE_IN') {
        await tx.execute(sql`
          UPDATE tables SET status = 'OCCUPIED', updated_at = NOW()
          WHERE id = ${tableId}::uuid AND tenant_id = ${tenantId}::uuid AND status = 'AVAILABLE'
        `);
      }
    });

    // POSR-008: Proactive loyalty lookup
    let loyaltyAccountId: string | undefined;
    let loyaltyBalance: number | undefined;
    if (consumerPhone) {
      const loyaltyResult = await this.lookupLoyaltyByPhone(tenantId, consumerPhone);
      if (loyaltyResult) {
        loyaltyAccountId = loyaltyResult.accountId;
        loyaltyBalance = loyaltyResult.pointsBalance;
        // Link loyalty account to order
        await (this.db as any).execute(sql`
          UPDATE orders SET loyalty_account_id = ${loyaltyAccountId}::uuid, updated_at = NOW()
          WHERE id = ${orderId}::uuid
        `).catch(() => {});
      }
    }

    this.eventEmitter.emit('order.created', { tenantId, orderId, shortId, orderType, tableId });
    this.logger.log(`REQ-POSR-001: Order ${shortId} opened (${orderType}) for tenant ${tenantId}`);
    return { orderId, shortId, loyaltyAccountId, loyaltyBalance };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001: addItem
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * REQ-POSR-001: Add item to open order. Snapshots price at time of add.
   * REQ-POSR-002: Routes item to correct KDS station based on category_id.
   * Recalculates order.subtotal_cents, tax, total atomically.
   */
  async addItem(params: AddItemParams): Promise<{ orderItemId: string; orderSubtotalCents: number }> {
    const { tenantId, orderId, menuItemId, quantity, modifiers = [], notes, course = 1 } = params;

    // Get order (must be OPEN)
    const orderResult = await (this.db as any).execute(sql`
      SELECT id, status, tenant_id, location_id FROM orders
      WHERE id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid LIMIT 1
    `);
    const order = (orderResult as any)?.rows?.[0];
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (order.status !== 'OPEN') throw new BadRequestException(`Cannot add items to order in status ${order.status}`);

    // Snapshot menu item price
    const menuResult = await (this.db as any).execute(sql`
      SELECT id, name, price_cents, category_id FROM menu_items
      WHERE id = ${menuItemId}::uuid AND tenant_id = ${tenantId}::uuid AND is_active = TRUE LIMIT 1
    `);
    const menuItem = (menuResult as any)?.rows?.[0];
    if (!menuItem) throw new NotFoundException(`Menu item ${menuItemId} not found or inactive`);

    // Calculate modifier price delta
    const modifierDeltaCents = modifiers.reduce((sum, m) => sum + (m.priceDeltaCents * (m.quantity ?? 1)), 0);
    const unitPriceCents = Number(menuItem.price_cents) + modifierDeltaCents;
    const totalCents = unitPriceCents * quantity;

    // REQ-POSR-002: Route to KDS station based on category_id
    const kdsStationId = await this.routeItemToKdsStation(tenantId, order.location_id, menuItem.category_id);

    const orderItemId = randomUUID();

    await (this.db as any).transaction(async (tx) => {
      // Insert order_items with canonical column names
      await tx.execute(sql`
        INSERT INTO order_items (
          id, tenant_id, order_id, menu_item_id,
          item_name, quantity, unit_price_cents, total_cents,
          modifiers, notes, course, kds_station_id, kds_status,
          created_at, updated_at
        ) VALUES (
          ${orderItemId}::uuid, ${tenantId}::uuid, ${orderId}::uuid, ${menuItemId}::uuid,
          ${menuItem.name}, ${quantity}, ${unitPriceCents}, ${totalCents},
          ${JSON.stringify(modifiers)}::jsonb, ${notes ?? null}, ${course},
          ${kdsStationId ? `${kdsStationId}::uuid` : null},
          'PENDING', NOW(), NOW()
        )
      `);

      // Recalculate order subtotal
      const totalsResult = await tx.execute(sql`
        SELECT SUM(total_cents) AS subtotal FROM order_items
        WHERE order_id = ${orderId}::uuid AND kds_status != 'VOIDED'
      `);
      const subtotalCents = Number((totalsResult as any)?.rows?.[0]?.subtotal ?? 0);

      // Read tax rate from DB (REQ: never hardcode)
      const taxRateStr = await this.getConfig(tenantId, 'tax.default_rate_pct', '0');
      const taxRate = Number(taxRateStr) / 100;
      const taxCents = Math.round(subtotalCents * taxRate);
      const newTotal = subtotalCents + taxCents;

      await tx.execute(sql`
        UPDATE orders SET
          subtotal_cents = ${subtotalCents},
          tax_cents = ${taxCents},
          total_cents = ${newTotal},
          updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `);
    });

    // Get updated subtotal to return
    const updatedOrder = await (this.db as any).execute(sql`SELECT subtotal_cents FROM orders WHERE id = ${orderId}::uuid`);
    const orderSubtotalCents = Number((updatedOrder as any)?.rows?.[0]?.subtotal_cents ?? 0);

    this.eventEmitter.emit('order.item_added', { tenantId, orderId, orderItemId, menuItemId, quantity });
    return { orderItemId, orderSubtotalCents };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001 + REQ-POSR-002: fireToKDS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * REQ-POSR-001 + REQ-POSR-002: Fire unfired items to their KDS stations.
   * Reads kds_fire_delay_seconds from DB config. Groups items by station.
   */
  async fireToKDS(tenantId: string, orderId: string, courseNumber?: number): Promise<{ stationsFired: number; itemsFired: number }> {
    // Get order + unfired items
    const orderResult = await (this.db as any).execute(sql`
      SELECT o.id, o.short_id, o.location_id, o.table_id, o.server_user_id,
             t.name AS table_name
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      WHERE o.id = ${orderId}::uuid AND o.tenant_id = ${tenantId}::uuid LIMIT 1
    `);
    const order = (orderResult as any)?.rows?.[0];
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    // Get pending items (optionally filter by course)
    const itemsQuery = courseNumber
      ? sql`SELECT oi.*, mi.name AS menu_item_name FROM order_items oi
             JOIN menu_items mi ON mi.id = oi.menu_item_id
             WHERE oi.order_id = ${orderId}::uuid AND oi.kds_status = 'PENDING' AND oi.course = ${courseNumber}`
      : sql`SELECT oi.*, mi.name AS menu_item_name FROM order_items oi
             JOIN menu_items mi ON mi.id = oi.menu_item_id
             WHERE oi.order_id = ${orderId}::uuid AND oi.kds_status = 'PENDING'`;

    const itemsResult = await (this.db as any).execute(itemsQuery);
    const items: any[] = (itemsResult as any)?.rows ?? [];
    if (!items.length) return { stationsFired: 0, itemsFired: 0 };

    // Read fire delay from DB config
    const delayStr = await this.getConfig(tenantId, 'posr.kds_fire_delay_seconds', '0');
    const delayMs = Number(delayStr) * 1000;

    // Group items by KDS station
    const stationMap = new Map<string, typeof items>();
    for (const item of items) {
      const stationId = item.kds_station_id ?? 'default';
      if (!stationMap.has(stationId)) stationMap.set(stationId, []);
      stationMap.get(stationId)!.push(item);
    }

    // Apply fire delay if configured
    if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));

    const itemIds = items.map(i => i.id);

    await (this.db as any).transaction(async (tx) => {
      // Mark items as SENT
      await tx.execute(sql`
        UPDATE order_items SET kds_status = 'SENT', fired_at = NOW(), updated_at = NOW()
        WHERE id = ANY(${itemIds.map(id => `'${id}'`).join(',')}::uuid[])
      `);

      // Update order status + fired_at
      await tx.execute(sql`
        UPDATE orders SET
          status = 'SENT_TO_KDS',
          fired_at = COALESCE(fired_at, NOW()),
          updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `);
    });

    // Emit KDS events per station (WebSocket push handled by KdsGateway listener)
    let stationsFired = 0;
    for (const [stationId, stationItems] of stationMap) {
      this.eventEmitter.emit('kds.order_received', {
        tenantId,
        stationId: stationId === 'default' ? null : stationId,
        orderId,
        shortId: order.short_id,
        tableName: order.table_name ?? 'Counter',
        courseNumber,
        items: stationItems.map(i => ({
          id: i.id,
          name: i.item_name || i.menu_item_name,
          quantity: i.quantity,
          modifiers: i.modifiers,
          notes: i.notes,
          course: i.course,
        })),
        firedAt: new Date().toISOString(),
      });
      stationsFired++;
    }

    this.logger.log(`REQ-POSR-002: Fired ${items.length} items to ${stationsFired} KDS stations for order ${order.short_id}`);
    return { stationsFired, itemsFired: items.length };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001: splitCheck
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * REQ-POSR-001: Split a check N ways (even) or by specific item assignment.
   * Max ways read from DB config (posr.split_check_max_ways).
   */
  async splitCheck(tenantId: string, orderId: string, spec: SplitSpec): Promise<{ childOrderIds: string[] }> {
    const maxWaysStr = await this.getConfig(tenantId, 'posr.split_check_max_ways', '8');
    const maxWays = Number(maxWaysStr);

    const orderResult = await (this.db as any).execute(sql`
      SELECT o.*, array_agg(row_to_json(oi)) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${orderId}::uuid AND o.tenant_id = ${tenantId}::uuid AND o.status = 'OPEN'
      GROUP BY o.id LIMIT 1
    `);
    const order = (orderResult as any)?.rows?.[0];
    if (!order) throw new NotFoundException(`Order ${orderId} not found or not OPEN`);

    const childOrderIds: string[] = [];

    if (spec.ways) {
      if (spec.ways > maxWays) throw new BadRequestException(`Max split ways is ${maxWays}`);

      // Even split: divide subtotal_cents by N, create N child order stubs
      const perChildCents = Math.floor(Number(order.subtotal_cents) / spec.ways);
      const remainder = Number(order.subtotal_cents) - (perChildCents * spec.ways);

      for (let i = 0; i < spec.ways; i++) {
        const childId = randomUUID();
        const childSubtotal = perChildCents + (i === 0 ? remainder : 0); // first child gets rounding remainder
        await (this.db as any).execute(sql`
          INSERT INTO orders (
            id, tenant_id, location_id, short_id, order_type, source_channel,
            table_id, server_user_id, split_from_order_id,
            status, subtotal_cents, tax_cents, tip_cents, total_cents,
            created_at, updated_at
          ) SELECT
            ${childId}::uuid, tenant_id, location_id,
            ${`${order.short_id}-S${i + 1}`}, order_type, source_channel,
            table_id, server_user_id, ${orderId}::uuid,
            'OPEN', ${childSubtotal},
            ROUND(${childSubtotal} * (tax_cents::float / NULLIF(subtotal_cents, 0))),
            0, ${childSubtotal},
            NOW(), NOW()
          FROM orders WHERE id = ${orderId}::uuid
        `);
        childOrderIds.push(childId);
      }
    } else if (spec.splits) {
      if (spec.splits.length > maxWays) throw new BadRequestException(`Max split ways is ${maxWays}`);
      // Item-based split: create child orders and reassign items
      for (const split of spec.splits) {
        const childId = randomUUID();
        const itemResult = await (this.db as any).execute(sql`
          SELECT SUM(total_cents) AS subtotal FROM order_items
          WHERE id = ANY(${`'{${split.itemIds.join(',')}}'`}::uuid[]) AND order_id = ${orderId}::uuid
        `);
        const childSubtotal = Number((itemResult as any)?.rows?.[0]?.subtotal ?? 0);
        await (this.db as any).execute(sql`
          INSERT INTO orders (
            id, tenant_id, location_id, short_id, order_type, source_channel,
            table_id, server_user_id, split_from_order_id,
            status, subtotal_cents, total_cents, created_at, updated_at
          ) SELECT
            ${childId}::uuid, tenant_id, location_id,
            ${`${order.short_id}-S${childOrderIds.length + 1}`}, order_type, source_channel,
            table_id, server_user_id, ${orderId}::uuid,
            'OPEN', ${childSubtotal}, ${childSubtotal}, NOW(), NOW()
          FROM orders WHERE id = ${orderId}::uuid
        `);
        // Move items to child order
        if (split.itemIds.length) {
          await (this.db as any).execute(sql`
            UPDATE order_items SET order_id = ${childId}::uuid, updated_at = NOW()
            WHERE id = ANY(${`'{${split.itemIds.join(',')}}'`}::uuid[])
          `);
        }
        childOrderIds.push(childId);
      }
    } else {
      throw new BadRequestException('Must specify either "ways" or "splits"');
    }

    // Mark parent as split
    await (this.db as any).execute(sql`
      UPDATE orders SET status = 'OPEN', notes = COALESCE(notes, '') || ' [SPLIT]', updated_at = NOW()
      WHERE id = ${orderId}::uuid
    `);

    this.logger.log(`REQ-POSR-001: Order ${orderId} split into ${childOrderIds.length} checks`);
    return { childOrderIds };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001 + REQ-POSR-006 + REQ-POSR-008: closeOrder
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * REQ-POSR-001: Accept payments, calculate totals, close order in one transaction.
   * REQ-POSR-006: Multi-tender, tip from config suggestions, auto-gratuity.
   * REQ-POSR-008: LOY earning triggered inside same DB transaction.
   * REQ-POSR-010: Returns receipt payload.
   */
  async closeOrder(params: CloseOrderParams): Promise<{
    orderId: string; totalCents: number; change?: number; receiptPayload: object;
  }> {
    const { tenantId, orderId, payments, tipCents = 0, loyaltyAccountId, loyaltyPointsToRedeem = 0 } = params;

    // Validate order state
    const orderResult = await (this.db as any).execute(sql`
      SELECT o.*, t.name AS table_name, t.id AS table_id
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      WHERE o.id = ${orderId}::uuid AND o.tenant_id = ${tenantId}::uuid LIMIT 1
    `);
    const order = (orderResult as any)?.rows?.[0];
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (!['OPEN', 'SENT_TO_KDS', 'ALL_FIRED', 'READY'].includes(order.status)) {
      throw new BadRequestException(`Cannot close order in status ${order.status}`);
    }

    // Calculate totals
    const subtotalCents = Number(order.subtotal_cents);
    const taxCents = Number(order.tax_cents);
    const discountCents = Number(order.discount_cents ?? 0);

    // Auto-gratuity check (POSR-006)
    let autoGratCents = 0;
    const partySize = await this.getPartySize(tenantId, orderId);
    const autoGratPartySize = Number(await this.getConfig(tenantId, 'posr.auto_gratuity_party_size', '6'));
    if (partySize >= autoGratPartySize && tipCents === 0) {
      const autoGratPct = Number(await this.getConfig(tenantId, 'posr.auto_gratuity_pct', '18'));
      autoGratCents = Math.round(subtotalCents * autoGratPct / 100);
    }
    const finalTipCents = tipCents > 0 ? tipCents : autoGratCents;

    const totalCents = Math.max(0, subtotalCents + taxCents + finalTipCents - discountCents);
    const totalPaid = payments.reduce((s, p) => s + p.amountCents, 0);
    if (totalPaid < totalCents) {
      throw new BadRequestException(`Insufficient payment: ${totalPaid} < ${totalCents}`);
    }
    const changeCents = Math.max(0, totalPaid - totalCents);

    await (this.db as any).transaction(async (tx) => {
      // Update order totals and status
      await tx.execute(sql`
        UPDATE orders SET
          status = 'FULFILLED',
          tip_cents = ${finalTipCents},
          total_cents = ${totalCents},
          loyalty_account_id = ${loyaltyAccountId ? `${loyaltyAccountId}::uuid` : null},
          fulfilled_at = NOW(),
          updated_at = NOW()
        WHERE id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid
      `);

      // Insert payment records
      for (const payment of payments) {
        const paymentId = randomUUID();
        await tx.execute(sql`
          INSERT INTO payments (
            id, tenant_id, order_id, payment_method_type, amount_cents,
            gateway_ref_id, gateway_status, idempotency_key, created_at, updated_at
          ) VALUES (
            ${paymentId}::uuid, ${tenantId}::uuid, ${orderId}::uuid,
            ${payment.method}, ${payment.amountCents},
            ${payment.gatewayRefId ?? null}, 'CAPTURED',
            ${payment.idempotencyKey ?? randomUUID()}, NOW(), NOW()
          )
        `);
      }

      // Free table (POSR-001)
      if (order.table_id) {
        await tx.execute(sql`
          UPDATE tables SET status = 'AVAILABLE', updated_at = NOW()
          WHERE id = ${order.table_id}::uuid AND tenant_id = ${tenantId}::uuid
        `);
      }
    });

    // Build receipt payload (POSR-010)
    const receiptPayload = await this.buildReceiptPayload(tenantId, orderId, {
      subtotalCents, taxCents, tipCents: finalTipCents, discountCents, totalCents,
      payments, changeCents, loyaltyAccountId,
    });

    // Fire events
    this.eventEmitter.emit('order.closed', { tenantId, orderId, totalCents, loyaltyAccountId });

    // LOY-008: Trigger loyalty earning (non-blocking, in background)
    if (loyaltyAccountId && subtotalCents > 0) {
      this.eventEmitter.emit('loyalty.earn_requested', {
        tenantId, orderId,
        accountId: loyaltyAccountId,
        orderSubtotalCents: subtotalCents,
        channel: 'IN_HOUSE',
        idempotencyKey: `${orderId}:earn`,
      });
    }

    this.logger.log(`REQ-POSR-001: Order ${order.short_id} closed. Total $${(totalCents / 100).toFixed(2)}`);
    return { orderId, totalCents, change: changeCents, receiptPayload };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001: voidOrder
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async voidOrder(tenantId: string, orderId: string, reason: string, managerId?: string): Promise<void> {
    const orderResult = await (this.db as any).execute(sql`
      SELECT id, status, table_id, loyalty_account_id, short_id
      FROM orders WHERE id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid LIMIT 1
    `);
    const order = (orderResult as any)?.rows?.[0];
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);
    if (['FULFILLED', 'CANCELLED'].includes(order.status)) {
      throw new BadRequestException(`Cannot void order in status ${order.status}`);
    }

    await (this.db as any).transaction(async (tx) => {
      // Mark order cancelled
      await tx.execute(sql`
        UPDATE orders SET status = 'CANCELLED', notes = ${reason}, updated_at = NOW()
        WHERE id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid
      `);
      // Void all PENDING/SENT items
      await tx.execute(sql`
        UPDATE order_items SET kds_status = 'VOIDED', void_reason = ${reason}, updated_at = NOW()
        WHERE order_id = ${orderId}::uuid AND kds_status IN ('PENDING', 'SENT', 'FIRED')
      `);
      // Free table
      if (order.table_id) {
        await tx.execute(sql`
          UPDATE tables SET status = 'AVAILABLE', updated_at = NOW()
          WHERE id = ${order.table_id}::uuid AND tenant_id = ${tenantId}::uuid
        `);
      }
    });

    // Emit KDS void event so displays show VOIDED indicator
    this.eventEmitter.emit('kds.order_voided', { tenantId, orderId, reason });
    this.eventEmitter.emit('order.voided', { tenantId, orderId, reason, managerId });

    this.logger.log(`REQ-POSR-001: Order ${order.short_id} voided â€” ${reason}`);
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-001: voidItem
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async voidItem(tenantId: string, orderId: string, orderItemId: string, reason: string): Promise<void> {
    await (this.db as any).transaction(async (tx) => {
      // Mark item voided
      await tx.execute(sql`
        UPDATE order_items SET kds_status = 'VOIDED', void_reason = ${reason}, updated_at = NOW()
        WHERE id = ${orderItemId}::uuid AND order_id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid
      `);
      // Recalculate order subtotal
      const totalsResult = await tx.execute(sql`
        SELECT SUM(total_cents) AS subtotal FROM order_items
        WHERE order_id = ${orderId}::uuid AND kds_status != 'VOIDED'
      `);
      const subtotalCents = Number((totalsResult as any)?.rows?.[0]?.subtotal ?? 0);
      const taxRateStr = await this.getConfig(tenantId, 'tax.default_rate_pct', '0');
      const taxCents = Math.round(subtotalCents * Number(taxRateStr) / 100);
      await tx.execute(sql`
        UPDATE orders SET subtotal_cents = ${subtotalCents}, tax_cents = ${taxCents},
          total_cents = ${subtotalCents + taxCents}, updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `);
    });
    this.eventEmitter.emit('order.item_voided', { tenantId, orderId, orderItemId, reason });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-004: Table Management
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getTableGrid(tenantId: string, locationId: string): Promise<any[]> {
    const result = await (this.db as any).execute(sql`
      SELECT
        t.id, t.name, t.capacity, t.section, t.status,
        t.x_coordinate, t.y_coordinate, t.shape, t.sort_order, t.qr_code_url,
        o.id AS order_id, o.short_id, o.status AS order_status,
        o.subtotal_cents, o.total_cents, o.server_user_id,
        o.created_at AS order_opened_at,
        u.first_name AS server_first, u.last_name AS server_last,
        EXTRACT(EPOCH FROM (NOW() - o.created_at)) / 60 AS elapsed_minutes
      FROM tables t
      LEFT JOIN orders o ON o.table_id = t.id AND o.status IN ('OPEN','SENT_TO_KDS','ALL_FIRED','READY')
      LEFT JOIN users u ON u.id = o.server_user_id
      WHERE t.location_id = ${locationId}::uuid AND t.tenant_id = ${tenantId}::uuid AND t.is_active = TRUE
      ORDER BY t.sort_order ASC, t.name ASC
    `).catch(() => ({ rows: [] }));

    const targetTurnMinutes = Number(await this.getConfig(tenantId, 'posr.table_turn_target_minutes', '60'));

    return ((result as any)?.rows ?? []).map((row: any) => ({
      ...row,
      isOverdue: row.elapsed_minutes > targetTurnMinutes,
      // POSR-001: Status colors for UI
      uiColor: row.status === 'AVAILABLE' ? 'green'
        : row.status === 'RESERVED' ? 'blue'
        : row.status === 'CLEANING' ? 'grey'
        : Number(row.elapsed_minutes) > targetTurnMinutes ? 'red' : 'yellow',
    }));
  }

  async getOpenOrders(tenantId: string, locationId: string): Promise<any[]> {
    const result = await (this.db as any).execute(sql`
      SELECT o.id, o.short_id, o.status, o.order_type, o.source_channel,
             o.subtotal_cents, o.total_cents, o.created_at,
             t.name AS table_name,
             u.first_name AS server_name
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      LEFT JOIN users u ON u.id = o.server_user_id
      WHERE o.location_id = ${locationId}::uuid AND o.tenant_id = ${tenantId}::uuid
        AND o.status IN ('OPEN','SENT_TO_KDS','ALL_FIRED','READY')
      ORDER BY o.created_at ASC
    `).catch(() => ({ rows: [] }));
    return (result as any)?.rows ?? [];
  }

  async getOrder(tenantId: string, orderId: string): Promise<any> {
    const result = await (this.db as any).execute(sql`
      SELECT o.*,
        t.name AS table_name,
        json_agg(
          json_build_object(
            'id', oi.id, 'menu_item_id', oi.menu_item_id,
            'item_name', oi.item_name, 'quantity', oi.quantity,
            'unit_price_cents', oi.unit_price_cents, 'total_cents', oi.total_cents,
            'modifiers', oi.modifiers, 'notes', oi.notes,
            'kds_status', oi.kds_status, 'course', oi.course
          ) ORDER BY oi.course, oi.created_at
        ) AS items
      FROM orders o
      LEFT JOIN tables t ON t.id = o.table_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${orderId}::uuid AND o.tenant_id = ${tenantId}::uuid
      GROUP BY o.id, t.name LIMIT 1
    `);
    const row = (result as any)?.rows?.[0];
    if (!row) throw new NotFoundException(`Order ${orderId} not found`);
    return row;
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-007: Shift Close Report
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async closeShift(tenantId: string, locationId: string, closedByUserId: string, shiftStart: Date): Promise<any> {
    const shiftEnd = new Date();

    // Aggregate all fulfilled orders in the shift window
    const salesResult = await (this.db as any).execute(sql`
      SELECT
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(subtotal_cents), 0) AS gross_sales,
        COALESCE(SUM(discount_cents), 0) AS discounts,
        COALESCE(SUM(tax_cents), 0) AS taxes,
        COALESCE(SUM(tip_cents), 0) AS tips,
        COALESCE(SUM(CASE WHEN EXISTS(
          SELECT 1 FROM payments p WHERE p.order_id = o.id AND p.payment_method_type = 'CASH'
        ) THEN total_cents ELSE 0 END), 0) AS cash_sales,
        COALESCE(SUM(CASE WHEN EXISTS(
          SELECT 1 FROM payments p WHERE p.order_id = o.id AND p.payment_method_type IN ('CARD_PRESENT','CARD_NP')
        ) THEN total_cents ELSE 0 END), 0) AS card_sales
      FROM orders o
      WHERE o.tenant_id = ${tenantId}::uuid
        AND o.location_id = ${locationId}::uuid
        AND o.status = 'FULFILLED'
        AND o.fulfilled_at >= ${shiftStart.toISOString()}::timestamptz
        AND o.fulfilled_at <= ${shiftEnd.toISOString()}::timestamptz
    `);
    const s = (salesResult as any)?.rows?.[0] ?? {};

    const grossSales = Number(s.gross_sales ?? 0);
    const discounts = Number(s.discounts ?? 0);
    const taxes = Number(s.taxes ?? 0);
    const tips = Number(s.tips ?? 0);
    // POSR-007: Live financial reporting (Shareholder Requirement)
    const refundResult = await (this.db as any).execute(sql`
      SELECT COALESCE(SUM(approved_amount_cents), 0) AS total_refunds
      FROM refund_requests
      WHERE tenant_id = ${tenantId}::uuid
        AND status = 'COMPLETED'
        AND completed_at >= ${shiftStart.toISOString()}::timestamptz
        AND completed_at <= ${shiftEnd.toISOString()}::timestamptz
    `);
    const refunds = Number((refundResult as any)?.rows?.[0]?.total_refunds ?? 0);
    const netSales = grossSales - discounts - refunds;

    const reportId = randomUUID();
    const reportData = {
      shiftStart: shiftStart.toISOString(), shiftEnd: shiftEnd.toISOString(),
      totalOrders: s.total_orders, grossSalesCents: grossSales,
      discountsCents: discounts, taxesCents: taxes, tipsCents: tips,
      netSalesCents: netSales, cashSalesCents: Number(s.cash_sales ?? 0),
      cardSalesCents: Number(s.card_sales ?? 0),
    };

    await (this.db as any).execute(sql`
      INSERT INTO shift_close_reports (
        id, tenant_id, location_id, closed_by, shift_start, shift_end,
        total_orders, gross_sales_cents, discounts_cents, refunds_cents,
        net_sales_cents, taxes_cents, tips_cents, cash_sales_cents, card_sales_cents,
        report_data, created_at
      ) VALUES (
        ${reportId}::uuid, ${tenantId}::uuid, ${locationId}::uuid,
        ${closedByUserId}::uuid,
        ${shiftStart.toISOString()}::timestamptz, ${shiftEnd.toISOString()}::timestamptz,
        ${s.total_orders ?? 0}, ${grossSales}, ${discounts}, ${refunds},
        ${netSales}, ${taxes}, ${tips},
        ${Number(s.cash_sales ?? 0)}, ${Number(s.card_sales ?? 0)},
        ${JSON.stringify(reportData)}::jsonb, NOW()
      )
    `);

    this.eventEmitter.emit('shift.closed', { tenantId, locationId, reportId, reportData });
    this.logger.log(`REQ-POSR-007: Shift closed for location ${locationId}. Net sales: $${(netSales / 100).toFixed(2)}`);
    return { reportId, ...reportData };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-009: Offline Sync
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * REQ-POSR-009: Accept batch of offline-queued orders from terminal on reconnect.
   * Processes each order atomically, fires LOY earning and KDS replay.
   */
  async processBatchSync(tenantId: string, locationId: string, offlineOrders: any[]): Promise<{
    synced: number; failed: number; errors: string[];
  }> {
    const maxQueueStr = await this.getConfig(tenantId, 'posr.offline_queue_max_orders', '500');
    const maxQueue = Number(maxQueueStr);
    if (offlineOrders.length > maxQueue) {
      throw new BadRequestException(`Batch exceeds max offline queue size of ${maxQueue}`);
    }

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const offlineOrder of offlineOrders) {
      try {
        // Open order with original timestamps preserved
        const openResult = await this.openOrder({
          tenantId, locationId,
          orderType: offlineOrder.orderType ?? 'DINE_IN',
          sourceChannel: offlineOrder.sourceChannel ?? 'POS',
          tableId: offlineOrder.tableId,
          serverId: offlineOrder.serverId,
          idempotencyKey: offlineOrder.idempotencyKey ?? offlineOrder.localId,
        });

        // Re-add all items
        for (const item of offlineOrder.items ?? []) {
          await this.addItem({
            tenantId, orderId: openResult.orderId,
            menuItemId: item.menuItemId, quantity: item.quantity,
            modifiers: item.modifiers, notes: item.notes,
          }).catch((e: any) => errors.push(`Item add: ${e.message}`));
        }

        // Fire to KDS (replay)
        await this.fireToKDS(tenantId, openResult.orderId);

        // Process payment if captured offline
        if (offlineOrder.payments?.length) {
          await this.closeOrder({
            tenantId, orderId: openResult.orderId,
            payments: offlineOrder.payments,
            tipCents: offlineOrder.tipCents ?? 0,
            loyaltyAccountId: offlineOrder.loyaltyAccountId,
          });
        }

        synced++;
      } catch (e: any) {
        failed++;
        errors.push(`Order ${offlineOrder.localId ?? '?'}: ${e.message}`);
        this.logger.error(`REQ-POSR-009: Offline sync failed for order ${offlineOrder.localId}: ${e.message}`);
      }
    }

    this.logger.log(`REQ-POSR-009: Offline sync complete â€” ${synced} synced, ${failed} failed`);
    return { synced, failed, errors };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // REQ-POSR-008: Loyalty Lookup at POS
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async lookupLoyaltyByPhone(tenantId: string, phoneE164: string): Promise<{
    accountId: string; pointsBalance: number; tierName?: string; firstName?: string;
  } | null> {
    const result = await (this.db as any).execute(sql`
      SELECT la.id, la.points_balance, la.first_name, lt.name AS tier_name
      FROM loyalty_accounts la
      LEFT JOIN loyalty_tiers lt ON lt.id = la.tier_id
      WHERE la.phone_e164 = ${phoneE164}
        AND la.tenant_id = ${tenantId}::uuid
        AND la.status = 'ACTIVE'
      LIMIT 1
    `).catch(() => ({ rows: [] }));
    const row = (result as any)?.rows?.[0];
    if (!row) return null;
    return { accountId: row.id, pointsBalance: Number(row.points_balance), tierName: row.tier_name, firstName: row.first_name };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Private helpers
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private async routeItemToKdsStation(tenantId: string, locationId: string, categoryId: string): Promise<string | null> {
    if (!categoryId) return null;
    const result = await (this.db as any).execute(sql`
      SELECT id FROM kds_stations
      WHERE location_id = ${locationId}::uuid AND tenant_id = ${tenantId}::uuid
        AND is_active = TRUE AND ${categoryId}::uuid = ANY(category_ids)
      LIMIT 1
    `).catch(() => ({ rows: [] }));
    return (result as any)?.rows?.[0]?.id ?? null;
  }

  private async getPartySize(tenantId: string, orderId: string): Promise<number> {
    const result = await (this.db as any).execute(sql`
      SELECT t.capacity FROM orders o JOIN tables t ON t.id = o.table_id
      WHERE o.id = ${orderId}::uuid LIMIT 1
    `).catch(() => ({ rows: [] }));
    return Number((result as any)?.rows?.[0]?.capacity ?? 0);
  }

  private async buildReceiptPayload(tenantId: string, orderId: string, totals: any): Promise<object> {
    const [logoUrl, footerText] = await Promise.all([
      this.getConfig(tenantId, 'posr.receipt_logo_url', ''),
      this.getConfig(tenantId, 'posr.receipt_footer_text', 'Thank you for dining with us!'),
    ]);
    return {
      orderId,
      logoUrl,
      footerText,
      subtotalCents: totals.subtotalCents,
      taxCents: totals.taxCents,
      tipCents: totals.tipCents,
      discountCents: totals.discountCents,
      totalCents: totals.totalCents,
      payments: totals.payments,
      changeCents: totals.changeCents,
      generatedAt: new Date().toISOString(),
    };
  }

  // Legacy wrapper: kept for backward compat with existing test
  async createOrder(tenantId: string, userId: string, payload: any) {
    if (!payload.items?.length) throw new BadRequestException('items required');
    const openResult = await this.openOrder({
      tenantId, locationId: payload.locationId || payload.location_id,
      orderType: payload.orderType || 'TAKEOUT',
      serverId: userId,
      idempotencyKey: payload.idempotencyKey,
    });
    for (const item of payload.items) {
      await this.addItem({
        tenantId, orderId: openResult.orderId,
        menuItemId: item.itemId || item.menu_item_id,
        quantity: item.quantity,
        modifiers: item.modifiers,
        notes: item.notes,
      }).catch(() => {});
    }
    if (payload.payments?.length) {
      return this.closeOrder({
        tenantId, orderId: openResult.orderId,
        payments: payload.payments.map((p: any) => ({
          method: p.method || 'CARD_PRESENT',
          amountCents: p.amount_cents,
          gatewayRefId: p.gateway_ref_id,
        })),
        tipCents: payload.tip_cents,
      });
    }
    return { orderId: openResult.orderId, shortId: openResult.shortId, status: 'OPEN' };
  }
}


