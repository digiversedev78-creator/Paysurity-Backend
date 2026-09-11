import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '@paysurity/database'; // Assuming all Drizzle schemas (tables and relations) are exported from this module

// Infer Drizzle types for better type safety and to represent DTO structures
// Assumed Drizzle schema definitions for purchaseOrders, purchaseOrderItems, inventoryItems, and vendors:
// - purchaseOrders: id (uuid), tenantId (uuid), vendorId (uuid), orderNumber (text), orderDate (date), expectedDeliveryDate (date), status (enum: 'draft'|'sent'|'partial'|'complete'|'cancelled'), totalAmount (numeric), notes (text), invoiceId (uuid, nullable), createdAt (timestamp), updatedAt (timestamp)
// - purchaseOrderItems: id (uuid), purchaseOrderId (uuid), inventoryItemId (uuid), orderedQuantity (integer), receivedQuantity (integer), unitPrice (numeric), subtotal (numeric), createdAt (timestamp), updatedAt (timestamp)
// - inventoryItems: id (uuid), tenantId (uuid), name (text), currentStock (integer), etc.
// - vendors: id (uuid), tenantId (uuid), name (text), etc.

type PurchaseOrder = typeof schema.purchaseOrders.$inferSelect;
type NewPurchaseOrder = typeof schema.purchaseOrders.$inferInsert;
type UpdatePurchaseOrder = Partial<NewPurchaseOrder>;

type PurchaseOrderItem = typeof schema.purchaseOrderItems.$inferSelect;
type NewPurchaseOrderItem = typeof schema.purchaseOrderItems.$inferInsert;
type UpdatePurchaseOrderItem = Partial<NewPurchaseOrderItem>;

// DTO interfaces for method parameters. In a real app, these would be separate DTO classes
// with class-validator decorators, likely located in a `dto` subfolder.

// Omit 'id', 'createdAt', 'updatedAt', 'tenantId', 'status', 'totalAmount', 'orderNumber' (handled by service logic)
interface CreatePurchaseOrderDto extends Omit<NewPurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'status' | 'totalAmount' | 'orderNumber'> {
  vendorId: string; // Must be provided
  items?: CreatePurchaseOrderItemDto[];
  status?: 'draft' | 'sent'; // Allow initial status override, defaults to 'draft'
  orderNumber?: string; // Optional, can be auto-generated
}

interface UpdatePurchaseOrderDto extends Partial<Omit<NewPurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'vendorId' | 'orderNumber'>> {}

// Omit 'id', 'purchaseOrderId', 'receivedQuantity', 'subtotal' (calculated by service logic)
interface CreatePurchaseOrderItemDto extends Omit<NewPurchaseOrderItem, 'id' | 'purchaseOrderId' | 'receivedQuantity' | 'subtotal'> {
  inventoryItemId: string;
  orderedQuantity: number;
  unitPrice: number;
}
interface UpdatePurchaseOrderItemDto extends Partial<Omit<NewPurchaseOrderItem, 'id' | 'purchaseOrderId'>> {}

interface ReceiveItemsDto {
  purchaseOrderItemId: string;
  quantityReceived: number;
}

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>, // STRICT RULE: use NodePgDatabase<any>
  ) {}

  /**
   * Creates a new purchase order, optionally with associated items, in a transaction.
   * Automatically sets tenantId, calculates totalAmount, and sets initial status.
   * @param tenantId The ID of the tenant creating the PO.
   * @param data The purchase order data.
   * @returns The newly created purchase order.
   * @throws BadRequestException if the PO creation fails.
   */
  async createPurchaseOrder(tenantId: string, data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    return (this.db as any).transaction(async (tx) => {
      const { items, ...orderData } = data;

      // Calculate total amount from items if provided, or set to 0
      let totalAmount = '0.00';
      if (items && items.length > 0) {
        totalAmount = items.reduce((sum, item) => sum + (item.orderedQuantity * parseFloat(item.unitPrice as any)), 0).toFixed(2);
      }

      const orderToInsert: NewPurchaseOrder = {
        ...orderData,
        tenantId,
        status: data.status || 'draft', // Default to 'draft'
        totalAmount,
        orderNumber: data.orderNumber || `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Simple auto-generation
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newOrder] = await tx.insert(schema.purchaseOrders).values(orderToInsert).returning();

      if (!newOrder) {
        throw new BadRequestException('Failed to create purchase order.');
      }

      if (items && items.length > 0) {
        const orderItemsToInsert = items.map(item => {
          const subtotal = (item.orderedQuantity * parseFloat(item.unitPrice as any)).toFixed(2);
          return {
            ...item,
            purchaseOrderId: newOrder.id,
            receivedQuantity: 0, // Initially 0
            subtotal,
          };
        });
        await tx.insert(schema.purchaseOrderItems).values(orderItemsToInsert).returning();
      }
      return newOrder;
    });
  }

  /**
   * Retrieves all purchase orders for a specific tenant, including their associated items and vendor details.
   * @param tenantId The ID of the tenant.
   * @returns A list of all purchase orders for the tenant.
   */
  async findAllPurchaseOrders(tenantId: string): Promise<PurchaseOrder[]> {
    return this.db.query.purchaseOrders.findMany({
      where: eq(schema.purchaseOrders.tenantId, tenantId),
      with: {
        items: true, // Eager load associated items
        vendor: true, // Assuming a vendor relation exists
      },
    });
  }

  /**
   * Finds a purchase order by its ID, including its associated items and the inventory item details for each item.
   * @param id The ID of the purchase order.
   * @param tenantId The ID of the tenant.
   * @returns The found purchase order.
   * @throws NotFoundException if the purchase order does not exist or does not belong to the tenant.
   */
  async findPurchaseOrderById(id: string, tenantId: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.db.query.purchaseOrders.findFirst({
      where: and(eq(schema.purchaseOrders.id, id), eq(schema.purchaseOrders.tenantId, tenantId)),
      with: {
        items: {
          with: {
            inventoryItem: true, // Eager load associated inventory item details
          },
        },
        vendor: true, // Assuming a vendor relation
      },
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found.`);
    }
    return purchaseOrder;
  }

  /**
   * Updates an existing purchase order.
   * @param id The ID of the purchase order to update.
   * @param tenantId The ID of the tenant.
   * @param data The partial purchase order data to update.
   * @returns The updated purchase order.
   * @throws NotFoundException if the purchase order does not exist or does not belong to the tenant.
   */
  async updatePurchaseOrder(id: string, tenantId: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const [updatedOrder] = await (this.db as any) // STRICT RULE: (this.db as any) for Drizzle updates
      .update(schema.purchaseOrders)
      .set({ ...data, updatedAt: new Date() }) // Always update updatedAt
      .where(and(eq(schema.purchaseOrders.id, id), eq(schema.purchaseOrders.tenantId, tenantId)))
      .returning();

    if (!updatedOrder) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found or not authorized.`);
    }
    return updatedOrder;
  }

  /**
   * Adds new items to an existing purchase order.
   * @param purchaseOrderId The ID of the purchase order.
   * @param tenantId The ID of the tenant.
   * @param items An array of purchase order item data to add.
   * @returns The newly created purchase order items.
   * @throws NotFoundException if the purchase order does not exist or does not belong to the tenant.
   * @throws BadRequestException if items fail to create.
   */
  async addItemsToPurchaseOrder(
    purchaseOrderId: string,
    tenantId: string,
    items: CreatePurchaseOrderItemDto[],
  ): Promise<PurchaseOrderItem[]> {
    return (this.db as any).transaction(async (tx) => {
      const existingOrder = await tx.query.purchaseOrders.findFirst({
        where: and(eq(schema.purchaseOrders.id, purchaseOrderId), eq(schema.purchaseOrders.tenantId, tenantId)),
      });

      if (!existingOrder) {
        throw new NotFoundException(`Purchase Order with ID ${purchaseOrderId} not found.`);
      }

      if (items.length === 0) {
        return [];
      }

      const orderItemsToInsert = items.map((item) => ({
        ...item,
        purchaseOrderId: purchaseOrderId,
        receivedQuantity: 0, // Set receivedQuantity to 0 initially
        subtotal: (item.orderedQuantity * parseFloat(item.unitPrice as any)).toFixed(2), // Calculate subtotal
      }));

      const newItems = await tx.insert(schema.purchaseOrderItems).values(orderItemsToInsert).returning();

      if (!newItems || newItems.length === 0) {
        throw new BadRequestException('Failed to add items to purchase order.');
      }

      // Recalculate totalAmount for the parent PO
      const currentItems = await tx.query.purchaseOrderItems.findMany({
        where: eq(schema.purchaseOrderItems.purchaseOrderId, purchaseOrderId),
      });
      const newTotalAmount = currentItems.reduce((sum, item) => sum + parseFloat(item.subtotal as any), 0).toFixed(2);

      await tx.update(schema.purchaseOrders)
        .set({ totalAmount: newTotalAmount, updatedAt: new Date() })
        .where(eq(schema.purchaseOrders.id, purchaseOrderId));

      return newItems;
    });
  }

  /**
   * Updates an existing item within a purchase order.
   * @param purchaseOrderId The ID of the purchase order.
   * @param itemId The ID of the purchase order item.
   * @param tenantId The ID of the tenant.
   * @param data The partial purchase order item data to update.
   * @returns The updated purchase order item.
   * @throws NotFoundException if the purchase order or item does not exist or does not belong to the tenant.
   */
  async updatePurchaseOrderItem(
    purchaseOrderId: string,
    itemId: string,
    tenantId: string,
    data: UpdatePurchaseOrderItemDto,
  ): Promise<PurchaseOrderItem> {
    return (this.db as any).transaction(async (tx) => {
      // Ensure the PO exists and belongs to the tenant
      const existingOrder = await tx.query.purchaseOrders.findFirst({
        where: and(eq(schema.purchaseOrders.id, purchaseOrderId), eq(schema.purchaseOrders.tenantId, tenantId)),
      });

      if (!existingOrder) {
        throw new NotFoundException(`Purchase Order with ID ${purchaseOrderId} not found or not authorized.`);
      }

      let subtotal: string | undefined;
      if (data.orderedQuantity !== undefined && data.unitPrice !== undefined) {
        subtotal = (data.orderedQuantity * parseFloat(data.unitPrice as any)).toFixed(2);
      } else if (data.orderedQuantity !== undefined || data.unitPrice !== undefined) {
        // If only one is provided, fetch the other to calculate new subtotal
        const currentItem = await tx.query.purchaseOrderItems.findFirst({
          where: and(eq(schema.purchaseOrderItems.id, itemId), eq(schema.purchaseOrderItems.purchaseOrderId, purchaseOrderId)),
        });
        if (!currentItem) {
          throw new NotFoundException(`Purchase Order Item with ID ${itemId} not found.`);
        }
        const effectiveOrderedQuantity = data.orderedQuantity ?? currentItem.orderedQuantity;
        const effectiveUnitPrice = data.unitPrice ?? currentItem.unitPrice;
        subtotal = (effectiveOrderedQuantity * parseFloat(effectiveUnitPrice as any)).toFixed(2);
      }

      const [updatedItem] = await tx
        .update(schema.purchaseOrderItems)
        .set({ ...data, subtotal })
        .where(and(eq(schema.purchaseOrderItems.id, itemId), eq(schema.purchaseOrderItems.purchaseOrderId, purchaseOrderId)))
        .returning();

      if (!updatedItem) {
        throw new NotFoundException(`Purchase Order Item with ID ${itemId} not found.`);
      }

      // Recalculate totalAmount for the parent PO
      const currentItems = await tx.query.purchaseOrderItems.findMany({
        where: eq(schema.purchaseOrderItems.purchaseOrderId, purchaseOrderId),
      });
      const newTotalAmount = currentItems.reduce((sum, item) => sum + parseFloat(item.subtotal as any), 0).toFixed(2);

      await tx.update(schema.purchaseOrders)
        .set({ totalAmount: newTotalAmount, updatedAt: new Date() })
        .where(eq(schema.purchaseOrders.id, purchaseOrderId));

      return updatedItem;
    });
  }

  /**
   * Receives items for a purchase order, updating received quantities and inventory.
   * This method handles full or partial receipts and updates the PO status.
   * @param purchaseOrderId The ID of the purchase order.
   * @param tenantId The ID of the tenant.
   * @param receivedItems An array of items with quantities received.
   * @returns The updated purchase order.
   * @throws NotFoundException if the purchase order or an item is not found.
   * @throws BadRequestException if received quantity exceeds ordered quantity or for invalid status.
   */
  async receiveItems(
    purchaseOrderId: string,
    tenantId: string,
    receivedItems: ReceiveItemsDto[],
  ): Promise<PurchaseOrder> {
    return (this.db as any).transaction(async (tx) => {
      // 1. Fetch the purchase order and its items
      const purchaseOrder = await tx.query.purchaseOrders.findFirst({
        where: and(eq(schema.purchaseOrders.id, purchaseOrderId), eq(schema.purchaseOrders.tenantId, tenantId)),
        with: {
          items: true,
        },
      });

      if (!purchaseOrder) {
        throw new NotFoundException(`Purchase Order with ID ${purchaseOrderId} not found or not authorized.`);
      }

      if (purchaseOrder.status === 'complete' || purchaseOrder.status === 'cancelled') {
        throw new BadRequestException(`Cannot receive items for a ${purchaseOrder.status} purchase order.`);
      }

      // Use a map for efficient lookup of order items
      const orderItemsMap = new Map<string, PurchaseOrderItem>(
        purchaseOrder.items.map((item) => [item.id, item]),
      );

      // 2. Process each received item
      for (const receivedItem of receivedItems) {
        const orderItem = orderItemsMap.get(receivedItem.purchaseOrderItemId);

        if (!orderItem) {
          throw new NotFoundException(
            `Purchase Order Item with ID ${receivedItem.purchaseOrderItemId} not found in PO ${purchaseOrderId}.`,
          );
        }

        if (receivedItem.quantityReceived <= 0) {
          throw new BadRequestException('Quantity received must be positive.');
        }

        const newReceivedQuantity = orderItem.receivedQuantity + receivedItem.quantityReceived;

        if (newReceivedQuantity > orderItem.orderedQuantity) {
          throw new BadRequestException(
            `Received quantity (${newReceivedQuantity}) for item ${orderItem.id} exceeds ordered quantity (${orderItem.orderedQuantity}).`,
          );
        }

        // 3. Update purchase order item's received quantity
        await tx
          .update(schema.purchaseOrderItems)
          .set({ receivedQuantity: newReceivedQuantity })
          .where(eq(schema.purchaseOrderItems.id, orderItem.id));

        // 4. Update inventory item's current stock
        await tx
          .update(schema.inventoryItems)
          .set({ currentStock: sql`${schema.inventoryItems.currentStock} + ${receivedItem.quantityReceived}` })
          .where(and(eq(schema.inventoryItems.id, orderItem.inventoryItemId), eq(schema.inventoryItems.tenantId, tenantId))); // Ensure tenant isolation for inventory update

        // Update the in-memory item for correct status evaluation later in this transaction
        orderItem.receivedQuantity = newReceivedQuantity;
      }

      // 5. Determine new purchase order status based on all items in the PO
      let newPOStatus: PurchaseOrder['status'] = purchaseOrder.status;

      // Fetch the latest state of all items in the PO within the current transaction
      const allItemsInPO = await tx.query.purchaseOrderItems.findMany({
        where: eq(schema.purchaseOrderItems.purchaseOrderId, purchaseOrderId),
      });

      const allOrderedItemsFullyReceived = allItemsInPO.every(item => item.receivedQuantity >= item.orderedQuantity);
      const anyItemsReceived = allItemsInPO.some(item => item.receivedQuantity > 0);

      if (allOrderedItemsFullyReceived) {
        newPOStatus = 'complete';
      } else if (anyItemsReceived) {
        newPOStatus = 'partial';
      } else if (purchaseOrder.status !== 'draft') { // If it was already sent, and no items received, keep it 'sent'
        newPOStatus = 'sent';
      } else { // If it was draft and no items received, keep it 'draft'
        newPOStatus = 'draft';
      }

      // If status changed, update the purchase order
      let updatedPurchaseOrder: PurchaseOrder | undefined;
      if (newPOStatus !== purchaseOrder.status) {
        [updatedPurchaseOrder] = await tx
          .update(schema.purchaseOrders)
          .set({ status: newPOStatus, updatedAt: new Date() })
          .where(eq(schema.purchaseOrders.id, purchaseOrderId))
          .returning();
      } else {
        // If status didn't change, just fetch the current state, potentially including items and vendor
        updatedPurchaseOrder = await tx.query.purchaseOrders.findFirst({
          where: and(eq(schema.purchaseOrders.id, purchaseOrderId), eq(schema.purchaseOrders.tenantId, tenantId)),
          with: { items: true, vendor: true },
        });
      }

      if (!updatedPurchaseOrder) {
        // This case should ideally not be reached if previous updates were successful
        throw new BadRequestException('Failed to update purchase order status or retrieve final PO state.');
      }

      return updatedPurchaseOrder;
    });
  }

  /**
   * Associates an invoice with a purchase order.
   * @param purchaseOrderId The ID of the purchase order.
   * @param tenantId The ID of the tenant.
   * @param invoiceId The ID of the invoice to link.
   * @returns The updated purchase order.
   * @throws NotFoundException if the purchase order does not exist or does not belong to the tenant.
   * @throws BadRequestException if an invoice is already linked.
   */
  async matchInvoiceToPO(
    purchaseOrderId: string,
    tenantId: string,
    invoiceId: string,
  ): Promise<PurchaseOrder> {
    const purchaseOrder = await this.db.query.purchaseOrders.findFirst({
      where: and(eq(schema.purchaseOrders.id, purchaseOrderId), eq(schema.purchaseOrders.tenantId, tenantId)),
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID ${purchaseOrderId} not found or not authorized.`);
    }

    if (purchaseOrder.invoiceId) {
      throw new BadRequestException(`Purchase Order ${purchaseOrderId} is already linked to invoice ${purchaseOrder.invoiceId}.`);
    }

    const [updatedOrder] = await (this.db as any) // STRICT RULE: (this.db as any) for Drizzle updates
      .update(schema.purchaseOrders)
      .set({ invoiceId: invoiceId, updatedAt: new Date() })
      .where(and(eq(schema.purchaseOrders.id, purchaseOrderId), eq(schema.purchaseOrders.tenantId, tenantId)))
      .returning();

    if (!updatedOrder) {
      throw new BadRequestException('Failed to link invoice to purchase order.');
    }
    return updatedOrder;
  }

  /**
   * Retrieves all purchase orders for a specific vendor and tenant.
   * @param vendorId The ID of the vendor.
   * @param tenantId The ID of the tenant.
   * @returns A list of purchase orders for the vendor.
   * @throws NotFoundException if the vendor is not found or does not belong to the tenant.
   */
  async findPurchaseOrdersByVendor(vendorId: string, tenantId: string): Promise<PurchaseOrder[]> {
    // Optionally, verify vendor existence first
    const vendorExists = await this.db.query.vendors.findFirst({
      where: and(eq(schema.vendors.id, vendorId), eq(schema.vendors.tenantId, tenantId)),
    });

    if (!vendorExists) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found or not authorized.`);
    }

    return this.db.query.purchaseOrders.findMany({
      where: and(eq(schema.purchaseOrders.vendorId, vendorId), eq(schema.purchaseOrders.tenantId, tenantId)),
      with: {
        items: true,
        vendor: true, // Assuming a vendor relation
      },
    });
  }

  /**
   * Deletes a purchase order. Only allowed if in 'draft' or 'cancelled' status and no items have been received.
   * @param id The ID of the purchase order to delete.
   * @param tenantId The ID of the tenant.
   * @throws NotFoundException if the purchase order does not exist or does not belong to the tenant.
   * @throws BadRequestException if the purchase order cannot be deleted due to its status or received items.
   */
  async deletePurchaseOrder(id: string, tenantId: string): Promise<void> {
    return (this.db as any).transaction(async (tx) => {
      const purchaseOrder = await tx.query.purchaseOrders.findFirst({
        where: and(eq(schema.purchaseOrders.id, id), eq(schema.purchaseOrders.tenantId, tenantId)),
        with: {
          items: true,
        },
      });

      if (!purchaseOrder) {
        throw new NotFoundException(`Purchase Order with ID ${id} not found or not authorized.`);
      }

      if (purchaseOrder.status !== 'draft' && purchaseOrder.status !== 'cancelled') {
        throw new BadRequestException(`Purchase Order status '${purchaseOrder.status}' does not allow deletion. Only 'draft' or 'cancelled' orders can be deleted.`);
      }

      const anyItemsReceived = purchaseOrder.items.some(item => item.receivedQuantity > 0);
      if (anyItemsReceived) {
        throw new BadRequestException(`Purchase Order with ID ${id} cannot be deleted because some items have already been received.`);
      }

      // Delete associated items first (if cascade delete is not set up, or to be explicit)
      await tx.delete(schema.purchaseOrderItems)
        .where(eq(schema.purchaseOrderItems.purchaseOrderId, id));

      // Then delete the purchase order
      const [deletedOrder] = await tx.delete(schema.purchaseOrders)
        .where(and(eq(schema.purchaseOrders.id, id), eq(schema.purchaseOrders.tenantId, tenantId)))
        .returning({ id: schema.purchaseOrders.id });

      if (!deletedOrder) {
        throw new BadRequestException(`Failed to delete purchase order with ID ${id}.`);
      }
    });
  }
}
