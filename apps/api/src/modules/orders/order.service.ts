import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
// New service imports for financial and affiliate integration
import { WalletService } from '../wallet/wallet.service';
import { AffiliatesService } from '../affiliates/affiliates.service';
import { MerchantService } from '../merchant/merchant.service';


// Schema imports -- graceful fallback
let ordersTable: any;
let orderItemsTable: any;
try {
  const schema = require('@paysurity/database');
  ordersTable = schema.orders;
  orderItemsTable = schema.orderItems;
} catch {
  // Schema not available
}

export interface CreateOrderDto {
  tenantId: string;
  merchantId: string;
  locationId: string;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'DRIVE_THRU' | 'CURBSIDE';
  tableNumber?: string | undefined;
  serverUserId?: string | undefined;
  customerName?: string | undefined;
  customerPhone?: string | undefined;
  items: OrderItemDto[];
  notes?: string | undefined;
}

export interface OrderItemDto {
  itemName: string;
  sku?: string | undefined;
  quantity: number;
  unitPriceCents: number;
  modifiers?: string[] | undefined;
  specialInstructions?: string | undefined;
  category?: string | undefined;
  kdsStation?: string | undefined;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  items: OrderItemDto[];
  createdAt: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private orderCounter = 1000;

  constructor(
    private readonly eventBus: EventBusService,
    @Optional() @Inject('DATABASE') private readonly db: any,
    private readonly walletService: WalletService,
    private readonly affiliatesService: AffiliatesService,
    private readonly merchantService: MerchantService,
  ) {}

  async createOrder(dto: CreateOrderDto, traceId: string): Promise<OrderRecord> {
    const orderId = randomUUID();
    const orderNumber = `ORD-${++this.orderCounter}`;
    const subtotalCents = dto.items.reduce((sum, i) => sum + (i.unitPriceCents * i.quantity), 0);
    const taxCents = Math.round(subtotalCents * 0.0825); // 8.25% default
    const totalCents = subtotalCents + taxCents;

    this.logger.log(
      `[POSR] Order ${orderNumber} | ${dto.orderType} | ${dto.items.length} items | ` +
      `total=${totalCents}Â¢ | trace=${traceId}`,
    );

    // â”€â”€ DB INSERT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (this.db && ordersTable) {
      try {
        await (this.db as any).insert(ordersTable).values({
          id: orderId,
          tenantId: dto.tenantId,
          merchantId: dto.merchantId,
          locationId: dto.locationId,
          orderNumber,
          orderType: dto.orderType.toLowerCase(),
          status: 'created',
          customerName: dto.customerName,
          tableNumber: dto.tableNumber,
          serverId: dto.serverUserId,
          subtotalCents,
          taxCents,
          totalCents,
          specialInstructions: dto.notes,
        });

        // Insert order items
        if (orderItemsTable && dto.items.length > 0) {
          await (this.db as any).insert(orderItemsTable).values(
            dto.items.map(item => ({
              orderId,
              name: item.itemName,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
              totalCents: item.unitPriceCents * item.quantity,
              modifiers: item.modifiers ?? [],
              specialInstructions: item.specialInstructions,
            })),
          );
        }

        this.logger.log(`[POSR] Order ${orderNumber} persisted to DB`);
      } catch (err) {
        this.logger.warn(`[POSR] DB insert failed, in-memory: ${err}`);
      }
    }

    // Publish event â†’ KDS consumer
    await this.eventBus.publishPaymentEvent({
      eventName: 'order.created',
      tenantId: dto.tenantId,
      merchantId: dto.merchantId,
      traceId,
      payload: {
        orderId,
        orderNumber,
        orderType: dto.orderType,
        totalCents,
        itemCount: dto.items.length,
        locationId: dto.locationId,
        tableNumber: dto.tableNumber,
      },
      publishedAt: new Date().toISOString(),
      idempotencyKey: `order:${orderId}:created`,
    });

    return {
      id: orderId,
      orderNumber,
      orderType: dto.orderType,
      status: 'OPEN',
      subtotalCents,
      taxCents,
      totalCents,
      items: dto.items,
      createdAt: new Date().toISOString(),
    };
  }

  async updateKdsStatus(
    orderId: string,
    itemIndex: number,
    status: 'PREPARING' | 'READY' | 'SERVED',
    tenantId: string,
    traceId: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`[KDS] Order ${orderId} item ${itemIndex} â†’ ${status} | trace=${traceId}`);

    // Update order status in DB
    if (this.db && ordersTable && status === 'SERVED') {
      try {
        await (this.db as any).update(ordersTable)
          .set({ kdsStatus: status.toLowerCase(), status: 'preparing' })
          .where(eq(ordersTable.id, orderId));
      } catch (err) {
        this.logger.warn(`[KDS] DB update failed: ${err}`);
      }
    }

    if (status === 'READY') {
      await this.eventBus.publishNotificationEvent({
        eventName: 'kds.item.ready',
        tenantId,
        traceId,
        payload: { orderId, itemIndex },
        publishedAt: new Date().toISOString(),
        idempotencyKey: `kds:${orderId}:${itemIndex}:ready`,
      });
    }
    return { success: true };
  }

  /**
   * List orders for a tenant, optionally filtered by status.
   */
  async listOrders(tenantId: string, status?: string, limit: number = 50): Promise<any[]> {
    if (this.db && ordersTable) {
      try {
        const conditions = [eq(ordersTable.tenantId, tenantId)];
        if (status && status !== 'ALL') {
          conditions.push(eq(ordersTable.status, status.toLowerCase()));
        }
        const rows = await this.db
          .select()
          .from(ordersTable)
          .where(and(...conditions))
          .orderBy(ordersTable.createdAt)
          .limit(limit);
        return rows;
      } catch (err) {
        this.logger.warn(`[ORDER] DB list failed: ${err}`);
      }
    }
    return [];
  }
}


