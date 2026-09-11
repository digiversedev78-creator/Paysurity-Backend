import { IsDateString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested, IsNumber, Min, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { Injectable, Inject, NotFoundException, BadRequestException, Controller, Post, Get, Put, Body, Param, Req, HttpCode, HttpStatus, ParseUUIDPipe, Module } from '@nestjs/common';
import { Request } from 'express';

// src/catering/dto/catering.dto.ts
export class CreateCateringOrderItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  itemName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateCateringOrderDto {
  @IsNotEmpty()
  @IsDateString()
  eventDate: string; // ISO 8601 string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCateringOrderItemDto)
  items: CreateCateringOrderItemDto[];
}

// src/catering/catering.service.ts
@Injectable()
export class CateringService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async createOrder(tenantId: string, createCateringOrderDto: CreateCateringOrderDto): Promise<any> {
    const eventDate = new Date((createCateringOrderDto as any).eventDate);
    const minEventDate = new Date(Date.now() + 48 * 3600 * 1000); // 48 hours from now

    if (eventDate.getTime() < minEventDate.getTime()) {
      throw new BadRequestException('Event date must be at least 48 hours from now.');
    }

    let totalDisplayPrice = 0;
    for (const item of (createCateringOrderDto as any).items) {
      totalDisplayPrice += item.quantity * item.unitPrice;
    }

    const depositAmount = totalDisplayPrice * 0.25;
    const status = 'pending';
    const now = new Date();

    try {
      const orderResult = await (this.db as any).execute(
        `INSERT INTO catering_orders (
          tenant_id, 
          event_date, 
          total_display_price, 
          deposit_amount, 
          status, 
          notes, 
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          tenantId,
          eventDate.toISOString(),
          totalDisplayPrice,
          depositAmount,
          status,
          (createCateringOrderDto as any).notes,
          now.toISOString(),
          now.toISOString(),
        ],
      );

      const order = orderResult[0]; // Assuming execute returns an array of rows, first row is the inserted order
      if (!order) {
        throw new BadRequestException('Failed to create catering order (no data returned).');
      }

      const orderItems = [];
      for (const item of (createCateringOrderDto as any).items) {
        const itemResult = await (this.db as any).execute(
          `INSERT INTO catering_order_items (
            order_id, 
            item_name, 
            quantity, 
            unit_price, 
            total_price, 
            created_at, 
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            order.id,
            item.itemName,
            item.quantity,
            item.unitPrice,
            item.quantity * item.unitPrice,
            now.toISOString(),
            now.toISOString(),
          ],
        );
        orderItems.push(itemResult[0]);
      }

      return { ...order, items: orderItems };
    } catch (error) {
      // In a production scenario with raw SQL, you would manage explicit transactions (BEGIN, COMMIT, ROLLBACK) here.
      // For this exercise, we re-throw the error and assume the database handles partial inserts based on its configuration.
      throw new BadRequestException(`Error creating catering order: ${error.message}`);
    }
  }

  async findAllOrders(tenantId: string): Promise<any[]> {
    const orders = await (this.db as any).execute(
      `SELECT * FROM catering_orders WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId],
    );
    return orders;
  }

  async findOrderById(tenantId: string, id: string): Promise<any> {
    const orderResult = await (this.db as any).execute(
      `SELECT * FROM catering_orders WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId],
    );
    const order = orderResult[0];

    if (!order) {
      throw new NotFoundException(`Catering order with ID "${id}" not found for this tenant.`);
    }

    const orderItems = await (this.db as any).execute(
      `SELECT * FROM catering_order_items WHERE order_id = $1 ORDER BY id`,
      [order.id],
    );

    return { ...order, items: orderItems };
  }

  async confirmOrder(tenantId: string, id: string): Promise<any> {
    const now = new Date();
    const updateResult = await (this.db as any).execute(
      `UPDATE catering_orders 
       SET status = 'confirmed', updated_at = $3 
       WHERE id = $1 AND tenant_id = $2 AND status = 'pending' 
       RETURNING *`,
      [id, tenantId, now.toISOString()],
    );

    const updatedOrder = updateResult[0];

    if (!updatedOrder) {
      const existingOrder = await (this.db as any).execute(
        `SELECT id, status FROM catering_orders WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId],
      );
      if (existingOrder.length === 0) {
        throw new NotFoundException(`Catering order with ID "${id}" not found for this tenant.`);
      } else if (existingOrder[0].status !== 'pending') {
        throw new BadRequestException(`Catering order with ID "${id}" cannot be confirmed as its current status is "${existingOrder[0].status}". Only 'pending' orders can be confirmed.`);
      }
      throw new BadRequestException('Failed to confirm order. Please verify order ID and status.'); // Generic fallback
    }

    return updatedOrder;
  }

  async recordDeposit(tenantId: string, id: string): Promise<any> {
    const now = new Date();
    const updateResult = await (this.db as any).execute(
      `UPDATE catering_orders 
       SET status = 'deposit_paid', deposit_received_at = $3, updated_at = $3 
       WHERE id = $1 AND tenant_id = $2 AND status IN ('pending', 'confirmed') 
       RETURNING *`,
      [id, tenantId, now.toISOString()],
    );

    const updatedOrder = updateResult[0];

    if (!updatedOrder) {
      const existingOrder = await (this.db as any).execute(
        `SELECT id, status FROM catering_orders WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId],
      );
      if (existingOrder.length === 0) {
        throw new NotFoundException(`Catering order with ID "${id}" not found for this tenant.`);
      } else if (existingOrder[0].status === 'deposit_paid') {
        throw new BadRequestException(`Deposit for catering order with ID "${id}" has already been recorded.`);
      }
      throw new BadRequestException('Failed to record deposit. Please verify order ID and status.'); // Generic fallback
    }

    return updatedOrder;
  }
}

// src/catering/catering.controller.ts
type AuthenticatedRequest = any;

@Controller('catering-orders')
export class CateringController {
  constructor(private readonly cateringService: CateringService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitCateringOrderInquiry(
    @Req() req: AuthenticatedRequest,
    @Body() createCateringOrderDto: CreateCateringOrderDto,
  ) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for this operation.'); // Changed to BadRequest, as Unauthorized implies a guard
    }
    const data = await (this.cateringService as any).createOrder(tenantId, createCateringOrderDto);
    return { success: true, data };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listCateringOrdersForTenant(@Req() req: AuthenticatedRequest) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for this operation.');
    }
    const data = await (this.cateringService as any).findAllOrders(tenantId);
    return { success: true, data };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOrderDetails(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for this operation.');
    }
    const data = await (this.cateringService as any).findOrderById(tenantId, id);
    return { success: true, data };
  }

  @Put(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmOrder(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for this operation.');
    }
    const data = await (this.cateringService as any).confirmOrder(tenantId, id);
    return { success: true, data };
  }

  @Post(':id/deposit')
  @HttpCode(HttpStatus.OK)
  async recordDepositPaymentReceived(
    @Req() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for this operation.');
    }
    const data = await (this.cateringService as any).recordDeposit(tenantId, id);
    return { success: true, data };
  }
}

// src/catering/catering.module.ts
@Module({
  controllers: [CateringController],
  providers: [CateringService],
  exports: [CateringService],
})
export class CateringModule {}





