import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
  Inject,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsISO8601,
  Min,
  IsOptional,
  IsEmail,
} from 'class-validator';

// DTOs
class CreateCateringOrderDto {
  @IsNotEmpty()
  @IsString()
  customer_name: string;

  @IsNotEmpty()
  @IsEmail()
  customer_email: string;

  @IsOptional()
  @IsString()
  customer_phone?: string;

  @IsNotEmpty()
  @IsISO8601({ strict: true })
  event_date: string; // ISO 8601 date string, e.g., '2023-12-31T12:00:00Z'

  @IsNotEmpty()
  @IsString()
  event_address: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  total_display_price: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paan_count?: number; // For the special Paan rule, if needed for context
}

class RecordDepositDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}

// Service
class CateringService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  private async checkTenantAccess(tenantId: string, orderId: string): Promise<any> {
    const orderResult = await (this.db as any).execute(
      'SELECT * FROM catering_orders WHERE id = $1 AND tenant_id = $2',
      [orderId, tenantId],
    );
    if ((orderResult as any).rows.length === 0) {
      throw new NotFoundException('Catering order not found or you do not have access.');
    }
    return (orderResult as any).rows[0];
  }

  async createOrder(tenantId: string, dto: CreateCateringOrderDto): Promise<any> {
    const eventDate = new Date(dto.event_date);
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 48);

    if (eventDate < minDate) {
      throw new BadRequestException('Event date must be at least 48 hours from now.');
    }

    const depositAmount = dto.total_display_price * 0.25;
    const status = 'pending';

    const insertQuery = `
      INSERT INTO catering_orders (
        tenant_id, customer_name, customer_email, customer_phone,
        event_date, event_address, total_display_price, deposit_amount,
        status, notes, paan_count, created_at, updated_at, deposit_received_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW(), 0)
      RETURNING *;
    `;
    const values = [
      tenantId,
      dto.customer_name,
      dto.customer_email,
      dto.customer_phone,
      eventDate.toISOString(),
      dto.event_address,
      dto.total_display_price,
      depositAmount,
      status,
      dto.notes,
      dto.paan_count,
    ];

    try {
      const result = await (this.db as any).execute(insertQuery, values);
      return (result as any).rows[0];
    } catch (error) {
      // Log error for debugging
      console.error('Error creating catering order:', error);
      throw new BadRequestException('Failed to create catering order.');
    }
  }

  async listOrders(tenantId: string): Promise<any[]> {
    const result = await (this.db as any).execute(
      'SELECT * FROM catering_orders WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId],
    );
    return (result as any).rows;
  }

  async getOrderDetails(tenantId: string, orderId: string): Promise<any> {
    return await this.checkTenantAccess(tenantId, orderId);
  }

  async confirmOrder(tenantId: string, orderId: string): Promise<any> {
    const order = await this.checkTenantAccess(tenantId, orderId);

    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be confirmed.');
    }

    const updateQuery = `
      UPDATE catering_orders
      SET status = 'confirmed', updated_at = NOW()
      WHERE id = $1 AND tenant_id = $2
      RETURNING *;
    `;
    try {
      const result = await (this.db as any).execute(updateQuery, [orderId, tenantId]);
      return (result as any).rows[0];
    } catch (error) {
      console.error('Error confirming catering order:', error);
      throw new BadRequestException('Failed to confirm catering order.');
    }
  }

  async recordDeposit(tenantId: string, orderId: string, dto: RecordDepositDto): Promise<any> {
    const order = await this.checkTenantAccess(tenantId, orderId);

    const currentDepositReceived = order.deposit_received_amount || 0;
    const newDepositTotal = parseFloat(currentDepositReceived) + dto.amount;

    // Check if the new deposit total exceeds the required deposit amount
    if (newDepositTotal > order.deposit_amount + 0.001) { // Add a small epsilon for floating point comparison
      throw new BadRequestException('Deposit amount exceeds the required deposit.');
    }

    const updateQuery = `
      UPDATE catering_orders
      SET deposit_received_amount = $1, updated_at = NOW()
      WHERE id = $2 AND tenant_id = $3
      RETURNING *;
    `;
    try {
      const result = await (this.db as any).execute(updateQuery, [newDepositTotal, orderId, tenantId]);
      return (result as any).rows[0];
    } catch (error) {
      console.error('Error recording deposit for catering order:', error);
      throw new BadRequestException('Failed to record deposit.');
    }
  }
}

// Controller
@Controller('catering-orders')
export class CateringController {
  constructor(private readonly cateringService: CateringService) {}

  private getTenantId(req: any): string {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not found in request. User not authorized.');
    }
    return tenantId;
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async submitCateringOrderInquiry(
    @Body() createCateringOrderDto: CreateCateringOrderDto,
    @Req() req: any,
  ): Promise<any> {
    const tenantId = this.getTenantId(req);
    const order = await (this.cateringService as any).createOrder(tenantId, createCateringOrderDto);
    return { success: true, data: order };
  }

  @Get()
  async listCateringOrders(@Req() req: any): Promise<any> {
    const tenantId = this.getTenantId(req);
    const orders = await (this.cateringService as any).listOrders(tenantId);
    return { success: true, data: orders };
  }

  @Get(':id')
  async getOrderDetails(@Param('id') orderId: string, @Req() req: any): Promise<any> {
    const tenantId = this.getTenantId(req);
    const order = await (this.cateringService as any).getOrderDetails(tenantId, orderId);
    return { success: true, data: order };
  }

  @Put(':id/confirm')
  async confirmOrder(@Param('id') orderId: string, @Req() req: any): Promise<any> {
    const tenantId = this.getTenantId(req);
    const updatedOrder = await (this.cateringService as any).confirmOrder(tenantId, orderId);
    return { success: true, data: updatedOrder };
  }

  @Post(':id/deposit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async recordDeposit(
    @Param('id') orderId: string,
    @Body() recordDepositDto: RecordDepositDto,
    @Req() req: any,
  ): Promise<any> {
    const tenantId = this.getTenantId(req);
    const updatedOrder = await (this.cateringService as any).recordDeposit(tenantId, orderId, recordDepositDto);
    return { success: true, data: updatedOrder };
  }
}


