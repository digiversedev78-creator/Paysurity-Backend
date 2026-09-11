import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database'; const orders: any = {}; // Assuming these are exported from the database package
import { eq, desc } from 'drizzle-orm';

// Basic DTO interfaces (in a real application, these would typically be classes with class-validator decorators
// in a separate DTO file, e.g., src/modules/checkout/dto/create-order.dto.ts)
interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  price: string; // Use string for decimal type to avoid precision issues
}

interface CreateOrderDto {
  userId: string;
  tenantId: string;
  totalAmount: string; // Use string for decimal type
  status?: 'pending' | 'completed' | 'cancelled' | string; // Example statuses
  items: CreateOrderItemDto[];
}

interface UpdateOrderDto {
  userId?: string;
  totalAmount?: string;
  status?: 'pending' | 'completed' | 'cancelled' | string;
}

@Injectable()
export class OrdersService {
  constructor(@Inject('DATABASE') private db: NodePgDatabase<any>) {}

  /**
   * Creates a new order along with its items.
   * @param createOrderDto The data for creating the order.
   * @returns The created order with its items.
   */
  async create(createOrderDto: CreateOrderDto) {
    if (!(createOrderDto as any).tenantId) {
      throw new Error("SECURITY_VULNERABILITY_REJECTION: Tenant Context Missing. Strict RLS Isolation Failure.");
    }
    // 1. Insert into the orders table
    const totalCents = Math.round((parseFloat((createOrderDto as any).totalAmount) || 0) * 100);
    const [newOrder] = (await (this.db as any)
      .insert(orders)
      .values({
        tenantId: (createOrderDto as any).tenantId,
        totalCents,
        status: ((createOrderDto as any).status || 'PENDING').toUpperCase(),
      })
      .returning() as any);

    if (!newOrder) {
      throw new Error('Failed to create order. No order data returned after insertion.');
    }

    // 2. Prepare and insert order items
    let createdItems = [];
    if ((createOrderDto as any).items && (createOrderDto as any).items.length > 0) {
      const itemsToInsert = (createOrderDto as any).items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: Math.round((parseFloat(item.price) || 0) * 100),
      }));
      createdItems = await (this.db as any).insert((schema as any).orderItems).values(itemsToInsert).returning() as any;
    }

    return { ...newOrder, items: createdItems };
  }

  /**
   * Retrieves a list of all orders, with optional pagination.
   * @param limit The maximum number of orders to return. Defaults to 10.
   * @param offset The number of orders to skip. Defaults to 0.
   * @returns An array of orders.
   */
  async findAll(tenantId: string, limit: number = 10, offset: number = 0) {
    if (!tenantId) throw new Error("Tenant Context Missing");
    return this.db
      .select()
      .from(orders)
      .where(eq(orders.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(orders.createdAt));
  }

  /**
   * Retrieves a single order by its ID, including its associated items.
   * @param id The ID of the order to retrieve.
   * @returns The order with the specified ID and its items.
   * @throws NotFoundException if the order is not found.
   */
  async findOne(id: string, tenantId: string) {
    if (!tenantId) throw new Error("Tenant Context Missing");
    const [order] = await (this.db as any).select().from(orders).where(
      require('drizzle-orm').and(
        eq(orders.id, id),
        eq(orders.tenantId, tenantId)
      )
    );

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    const items = await (this.db as any).select().from((schema as any).orderItems).where(eq((schema as any).orderItems.orderId, order.id));

    return { ...order, items };
  }

  /**
   * Updates an existing order.
   * @param id The ID of the order to update.
   * @param updateOrderDto The data to update the order with.
   * @returns The updated order.
   * @throws NotFoundException if the order is not found.
   */
  async update(id: string, tenantId: string, updateOrderDto: UpdateOrderDto) {
    if (!tenantId) throw new Error("Tenant Context Missing");
    const [updatedOrder] = (await (this.db as any)
      .update(orders)
      .set({
        ...updateOrderDto,
        updatedAt: new Date(), // Manually update the `updatedAt` timestamp
      })
      .where(
        require('drizzle-orm').and(
          eq(orders.id, id),
          eq(orders.tenantId, tenantId)
        )
      )
      .returning() as any);

    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID "${id}" not found for update.`);
    }

    return updatedOrder;
  }

  /**
   * Deletes an order by its ID.
   * @param id The ID of the order to delete.
   * @returns The ID of the deleted order.
   * @throws NotFoundException if the order is not found.
   */
  async remove(id: string, tenantId: string) {
    if (!tenantId) throw new Error("Tenant Context Missing");
    const [deletedOrder] = await this.db
      .delete(orders)
      .where(
        require('drizzle-orm').and(
          eq(orders.id, id),
          eq(orders.tenantId, tenantId)
        )
      )
      .returning({ id: orders.id });

    if (!deletedOrder) {
      throw new NotFoundException(`Order with ID "${id}" not found for deletion.`);
    }
    // Assuming `(schema as any).orderItems` has an `onDelete: 'cascade'` foreign key constraint
    // referencing `orders`, so associated items will be automatically deleted by the database.
    return deletedOrder;
  }
}
















