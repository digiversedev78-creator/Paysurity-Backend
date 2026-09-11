import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IsDateString, IsNotEmpty, Min, IsNumber, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// --- DTO Definitions ---

enum CateringOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

class CateringOrderItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

class CreateCateringOrderDto {
  @IsDateString()
  @IsNotEmpty()
  eventDate: string; // ISO 8601 string for validation

  @IsNumber()
  @Min(0)
  totalDisplayPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CateringOrderItemDto)
  items: CateringOrderItemDto[];

  @IsString()
  @IsNotEmpty()
  notes?: string; // Optional field
}

class RecordDepositDto {
  @IsNumber()
  @Min(0.01) // Minimum deposit amount must be positive
  amount: number;
}

// --- Service Implementation ---

@Injectable()
export class CateringService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async createCateringOrder(tenantId: string, dto: CreateCateringOrderDto): Promise<any> {
    const eventDate = new Date(dto.eventDate);
    const minEventDate = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now

    if (eventDate.getTime() < minEventDate.getTime()) {
      throw new BadRequestException('Event date must be at least 48 hours from now.');
    }

    const depositAmount = dto.totalDisplayPrice * 0.25;
    const status = CateringOrderStatus.PENDING;
    const itemsJson = JSON.stringify(dto.items);

    try {
      const result = await (this.db as any).execute(
        `INSERT INTO catering_orders (tenant_id, event_date, total_display_price, deposit_amount, status, items, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, tenant_id, event_date, total_display_price, deposit_amount, deposit_received_amount, status, items, notes, created_at, updated_at`,
        [tenantId, eventDate.toISOString(), dto.totalDisplayPrice, depositAmount, status, itemsJson, dto.notes || null]
      );
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error creating catering order:', error);
      throw new BadRequestException('Failed to create catering order.');
    }
  }

  async listCateringOrders(tenantId: string): Promise<any> {
    try {
      const orders = await (this.db as any).execute(
        `SELECT id, tenant_id, event_date, total_display_price, deposit_amount, deposit_received_amount, status, items, notes, created_at, updated_at
         FROM catering_orders
         WHERE tenant_id = $1 ORDER BY created_at DESC`,
        [tenantId]
      );
      return { success: true, data: orders };
    } catch (error) {
      console.error('Error listing catering orders:', error);
      throw new BadRequestException('Failed to retrieve catering orders.');
    }
  }

  async getCateringOrderById(tenantId: string, orderId: string): Promise<any> {
    try {
      const order = await (this.db as any).execute(
        `SELECT id, tenant_id, event_date, total_display_price, deposit_amount, deposit_received_amount, status, items, notes, created_at, updated_at
         FROM catering_orders
         WHERE id = $1 AND tenant_id = $2`,
        [orderId, tenantId]
      );

      if (!order || order.length === 0) {
        throw new NotFoundException(`Catering order with ID "${orderId}" not found or does not belong to this tenant.`);
      }
      return { success: true, data: order[0] };
    } catch (error) {
      // Re-throw if it's a NestJS exception, otherwise wrap as BadRequest
      if (error instanceof NotFoundException) {
          throw error;
      }
      console.error('Error getting catering order by ID:', error);
      throw new BadRequestException('Failed to retrieve catering order.');
    }
  }

  async confirmCateringOrder(tenantId: string, orderId: string): Promise<any> {
    try {
      // Fetch the order with a lock to prevent race conditions during status update
      const order = await (this.db as any).execute(
        `SELECT id, status FROM catering_orders WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [orderId, tenantId]
      );

      if (!order || order.length === 0) {
        throw new NotFoundException(`Catering order with ID "${orderId}" not found or does not belong to this tenant.`);
      }

      const currentOrderStatus = order[0].status;

      if (currentOrderStatus !== CateringOrderStatus.PENDING) {
        throw new BadRequestException(`Order cannot be confirmed. Current status is "${currentOrderStatus}". Only 'pending' orders can be confirmed.`);
      }

      const result = await (this.db as any).execute(
        `UPDATE catering_orders
         SET status = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING id, status, updated_at`,
        [CateringOrderStatus.CONFIRMED, orderId, tenantId]
      );
      
      return { success: true, data: result[0] };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
      }
      console.error('Error confirming catering order:', error);
      throw new BadRequestException('Failed to confirm catering order.');
    }
  }

  async recordDepositPayment(tenantId: string, orderId: string, dto: RecordDepositDto): Promise<any> {
    try {
      // Fetch the order with a lock for atomicity
      const order = await (this.db as any).execute(
        `SELECT id, status, deposit_amount, deposit_received_amount
         FROM catering_orders
         WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [orderId, tenantId]
      );

      if (!order || order.length === 0) {
        throw new NotFoundException(`Catering order with ID "${orderId}" not found or does not belong to this tenant.`);
      }

      const currentOrder = order[0];

      if (currentOrder.status === CateringOrderStatus.CANCELLED || currentOrder.status === CateringOrderStatus.COMPLETED) {
        throw new BadRequestException(`Cannot record deposit for an order with status "${currentOrder.status}".`);
      }

      const newDepositReceivedAmount = parseFloat(currentOrder.deposit_received_amount) + dto.amount;
      const requiredDepositAmount = parseFloat(currentOrder.deposit_amount);

      if (newDepositReceivedAmount > requiredDepositAmount) {
        throw new BadRequestException(`Deposit amount exceeds the required deposit of ${requiredDepositAmount}. Total received would be ${newDepositReceivedAmount}.`);
      }

      const result = await (this.db as any).execute(
        `UPDATE catering_orders
         SET deposit_received_amount = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3
         RETURNING id, deposit_received_amount, updated_at`,
        [newDepositReceivedAmount, orderId, tenantId]
      );
      
      return { success: true, data: result[0] };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
          throw error;
      }
      console.error('Error recording deposit payment:', error);
      throw new BadRequestException('Failed to record deposit payment.');
    }
  }
}
