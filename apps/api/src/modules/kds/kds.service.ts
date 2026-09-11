import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { sql, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Defined here as kds.dto.ts content is not provided.
// This enum defines the possible statuses for an order item within the KDS.
export enum OrderItemStatus {
  PENDING = 'PENDING',        // Item received, waiting to be started
  PREPARING = 'PREPARING',    // Item is actively being prepared
  READY = 'READY',            // Item is ready for pickup/serving
  SERVED = 'SERVED',          // Item has been served/picked up
  CANCELLED = 'CANCELLED',    // Item has been cancelled
}

/**
 * Interface representing a KDS order item with additional contextual information
 * from related tables (products, orders) and KDS-specific fields.
 */
export interface KdsOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string; // Assumed product name from products table
  quantity: number;
  status: OrderItemStatus;
  notes: string | null;
  priority: number; // 1 (highest) to 5 (lowest), default 3
  estimatedCompletionTime: Date | null;
  actualCompletionTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
  orderStatus: string; // Status of the parent order
  orderDate: Date; // Date of the parent order
}

/**
 * DTO for receiving new KDS order items.
 */
export interface CreateKdsOrderItemDto {
  productId: string;
  quantity: number;
  notes?: string;
  priority?: number; // Optional, defaults to 3 (medium priority)
}

/**
 * DTO for updating the status of a KDS order item.
 */
export interface UpdateKdsOrderItemStatusDto {
  status: OrderItemStatus;
}

@Injectable()
export class KdsService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Constructs the common SELECT clause for KDS order items.
   */
  private getKdsOrderItemSelectClause(): SQL {
    return sql`
      oi.id, oi."orderId", oi."productId", p.name as "productName",
      oi.quantity, oi.status, oi.notes, oi.priority,
      oi."estimatedCompletionTime", oi."actualCompletionTime",
      oi."createdAt", oi."updatedAt",
      o.status as "orderStatus", o."orderDate"
    `;
  }

  /**
   * Constructs the common FROM and JOIN clause for KDS order items.
   */
  private getKdsOrderItemFromJoinClause(): SQL {
    return sql`
      FROM
        order_items oi
      JOIN
        products p ON oi."productId" = p.id AND oi."tenantId" = p."tenantId"
      JOIN
        orders o ON oi."orderId" = o.id AND oi."tenantId" = o."tenantId"
    `;
  }

  /**
   * Helper to calculate an estimated completion time based on default logic.
   * In a real system, this would involve product categories, kitchen load, etc.
   * For now, a simple fixed time offset.
   * @returns Date
   */
  private _calculateEstimatedCompletionTime(): Date {
    // Default to 15 minutes from now for demonstration purposes.
    // In a production system, this would fetch product-specific prep times
    // (e.g., from a 'product_prep_times' table linked by product category),
    // consider current kitchen capacity, existing order queue, etc.
    return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes in milliseconds
  }

  /**
   * Private helper to map a Drizzle row object to the KdsOrderItem interface.
   * Ensures consistent data types and property names.
   * @param row The raw row object from Drizzle's execute result.
   * @returns A mapped KdsOrderItem object.
   */
  private _mapDrizzleRowToKdsOrderItem(row: any): KdsOrderItem {
    return {
      id: row.id,
      orderId: row.orderId,
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      status: row.status as OrderItemStatus,
      notes: row.notes,
      priority: row.priority,
      estimatedCompletionTime: row.estimatedCompletionTime ? new Date(row.estimatedCompletionTime) : null,
      actualCompletionTime: row.actualCompletionTime ? new Date(row.actualCompletionTime) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      orderStatus: row.orderStatus,
      orderDate: new Date(row.orderDate),
    };
  }

  /**
   * Receives new order items for a specific order and tenant,
   * initializing their status to PENDING and setting estimated completion times.
   * @param tenantId The ID of the tenant.
   * @param orderId The ID of the parent order.
   * @param items An array of items to be added to the KDS.
   * @param userId The ID of the user performing the action for audit logging.
   * @returns An array of the created KDS order items.
   */
  public async publishToKDS(
    tenantId: string,
    orderId: string,
    items: CreateKdsOrderItemDto[],
    userId: string // userId is passed from the controller for audit logging
  ): Promise<KdsOrderItem[]> {
    if (!items || items.length === 0) {
      throw new BadRequestException('No order items provided to receive.');
    }

    const createdItems: KdsOrderItem[] = [];
    const now = new Date();

    for (const itemDto of items) {
      const newItemId = crypto.randomUUID(); // Generate UUID for new item
      const estimatedCompletionTime = this._calculateEstimatedCompletionTime();

      const insertQuery = sql`
        INSERT INTO order_items (
          id, "orderId", "productId", "tenantId", quantity,
          status, notes, priority, "estimatedCompletionTime",
          "createdAt", "updatedAt"
        ) VALUES (
          ${newItemId}, ${orderId}, ${(itemDto as any).productId}, ${tenantId}, ${(itemDto as any).quantity},
          ${OrderItemStatus.PENDING}, ${(itemDto as any).notes || null}, ${(itemDto as any).priority || 3}, ${estimatedCompletionTime},
          ${now}, ${now}
        );
      `;

      await (this.db as any).execute(insertQuery);

      // Fetch the newly created item with all its joined data to match KdsOrderItem interface
      const fetchedItem = await this.getOrderItemById(tenantId, newItemId);
      if (fetchedItem) {
        createdItems.push(fetchedItem);
      }

      await (this.auditLogService as any).logAuditAction({
        tenantId,
        action: 'KDS_ORDER_ITEM_RECEIVED',
        targetId: newItemId,
        actorId: userId,
        details: { orderId, productId: (itemDto as any).productId, quantity: (itemDto as any).quantity, status: OrderItemStatus.PENDING },
      });
    }

    return createdItems;
  }

  /**
   * Updates the status of a specific KDS order item.
   * Handles transitions and updates `actualCompletionTime` when applicable.
   * @param tenantId The ID of the tenant.
   * @param orderItemId The ID of the order item to update.
   * @param newStatus The new status to set for the item.
   * @param userId The ID of the user performing the action for audit logging.
   * @returns The updated KDS order item.
   * @throws NotFoundException if the item does not exist.
   * @throws BadRequestException if the status transition is invalid.
   */
  public async markItemReady(
    tenantId: string,
    orderItemId: string,
    newStatus: OrderItemStatus,
    userId: string // userId is passed from the controller for audit logging
  ): Promise<KdsOrderItem> {
    const existingItem = await this.getOrderItemById(tenantId, orderItemId);

    if (!existingItem) {
      throw new NotFoundException(`KDS Order item with ID "${orderItemId}" not found.`);
    }

    // Basic status transition validation: cannot change status from SERVED or CANCELLED
    const currentStatus = existingItem.status;
    if ((currentStatus === OrderItemStatus.SERVED || currentStatus === OrderItemStatus.CANCELLED) && newStatus !== currentStatus) {
      throw new BadRequestException(`Cannot change status from "${currentStatus}" to "${newStatus}".`);
    }

    // Prepare update fields
    let actualCompletionTime: Date | null = existingItem.actualCompletionTime;
    const now = new Date();

    if (newStatus === OrderItemStatus.READY || newStatus === OrderItemStatus.SERVED) {
      actualCompletionTime = now;
    } else if (newStatus === OrderItemStatus.PENDING || newStatus === OrderItemStatus.PREPARING) {
      // If moving back to a non-completed state, clear actual completion time
      actualCompletionTime = null;
    }

    const updateQuery = sql`
      UPDATE order_items
      SET
        status = ${newStatus},
        "actualCompletionTime" = ${actualCompletionTime},
        "updatedAt" = ${now}
      WHERE
        id = ${orderItemId} AND "tenantId" = ${tenantId};
    `;

    const result = await (this.db as any).execute(updateQuery);

    if (result.rowCount === 0) {
        // This case indicates that the item was found by getOrderItemById but not updated,
        // likely due to concurrent modification or a subtle bug.
        throw new NotFoundException(`Failed to update KDS Order item with ID "${orderItemId}". Item might have been removed.`);
    }

    const updatedItem = await this.getOrderItemById(tenantId, orderItemId);
    if (!updatedItem) {
      // Should ideally not happen if rowCount > 0, but provides type safety.
      throw new NotFoundException(`KDS Order item with ID "${orderItemId}" not found after update.`);
    }

    await (this.auditLogService as any).logAuditAction({
      tenantId,
      action: 'KDS_ORDER_ITEM_STATUS_UPDATED',
      targetId: orderItemId,
      actorId: userId,
      details: {
        oldStatus: currentStatus,
        newStatus: newStatus,
        orderId: existingItem.orderId,
        productId: existingItem.productId,
      },
    });

    return updatedItem;
  }

  /**
   * Retrieves a single KDS order item by its ID.
   * @param tenantId The ID of the tenant.
   * @param orderItemId The ID of the order item.
   * @returns The KDS order item or null if not found.
   */
  public async getOrderItemById(tenantId: string, orderItemId: string): Promise<KdsOrderItem | null> {
    const query = sql`
      SELECT
        ${this.getKdsOrderItemSelectClause()}
      ${this.getKdsOrderItemFromJoinClause()}
      WHERE
        oi.id = ${orderItemId} AND oi."tenantId" = ${tenantId};
    `;

    const result = await (this.db as any).execute(query);
    if ((result as any).rows && (result as any).rows.length > 0) {
      return this._mapDrizzleRowToKdsOrderItem((result as any).rows[0]);
    }
    return null;
  }

  /**
   * Retrieves all pending and preparing KDS order items for a tenant,
   * prioritized by 'priority' (1=highest, 5=lowest) then by 'createdAt' (oldest first/ticket age).
   * This forms the primary KDS display queue.
   * @param tenantId The ID of the tenant.
   * @returns An array of KDS order items.
   */
  public async getPendingAndPreparingItems(tenantId: string): Promise<KdsOrderItem[]> {
    const query = sql`
      SELECT
        ${this.getKdsOrderItemSelectClause()}
      ${this.getKdsOrderItemFromJoinClause()}
      WHERE
        oi."tenantId" = ${tenantId}
        AND oi.status IN (${OrderItemStatus.PENDING}, ${OrderItemStatus.PREPARING})
      ORDER BY
        oi.priority ASC, oi."createdAt" ASC;
    `;

    const result = await (this.db as any).execute(query);
    return (result as any).rows.map(this._mapDrizzleRowToKdsOrderItem);
  }

  /**
   * Retrieves all ready and served KDS order items for a tenant,
   * ordered by `actualCompletionTime` (most recent first).
   * This could be used for a "completed" or "pickup" view on the KDS.
   * @param tenantId The ID of the tenant.
   * @returns An array of KDS order items.
   */
  public async getReadyAndServedItems(tenantId: string): Promise<KdsOrderItem[]> {
    const query = sql`
      SELECT
        ${this.getKdsOrderItemSelectClause()}
      ${this.getKdsOrderItemFromJoinClause()}
      WHERE
        oi."tenantId" = ${tenantId}
        AND oi.status IN (${OrderItemStatus.READY}, ${OrderItemStatus.SERVED})
      ORDER BY
        oi."actualCompletionTime" DESC NULLS LAST; -- NULLS LAST to handle items marked READY/SERVED without an actualCompletionTime
    `;

    const result = await (this.db as any).execute(query);
    return (result as any).rows.map(this._mapDrizzleRowToKdsOrderItem);
  }
}



