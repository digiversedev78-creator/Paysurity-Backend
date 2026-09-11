/**
 * OrdersController â€” Order Management API
 * Matches OrdersService API exactly.
 */
import {
  Controller, Get, Post, Patch, Param, Body,
  Query, Req, UseGuards, HttpCode, HttpStatus, Logger, Headers,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery, ApiBody,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrdersService, OrderStatus } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class CreateOrderDto {
  @ApiProperty({ description: 'Order total in cents', example: 2499 })
  @IsNumber() @Min(1) total_cents!: number;
  @ApiPropertyOptional({ example: 'purchase' }) @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional({ example: 'Jane Doe' }) @IsOptional() @IsString() customer_name?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus }) @IsIn(Object.values(OrderStatus)) status!: OrderStatus;
}

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Customer requested cancellation' })
  @IsOptional() @IsString() reason?: string;
}

// â”€â”€ Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders â€” List all orders for a tenant.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all orders for the tenant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'customerName', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns list of orders.' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerName') customerName?: string,
    @Req() req?: any,
  ) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.ordersService as any).findAll(tenantId, {
      page: Number(page || 1),
      limit: Number(limit || 20),
      status,
      startDate,
      endDate,
      customerName,
    });
  }

  /**
   * POST /orders/sovereign-checkout â€” Sovereign PQC Checkout
   */
  @Post('sovereign-checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sovereign PQC Checkout' })
  @ApiResponse({ status: 200, description: 'Order created and PQC verified.' })
  @ApiResponse({ status: 400, description: 'Invalid signature or missing metadata.' })
  async sovereignCheckout(
    @Body() payload: any,
    @Headers('x-pqc-signature') signature?: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    if (!signature) throw new Logger('OrdersController').error('Missing X-PQC-Signature header');
    return (this.ordersService as any).processSovereignCheckout(payload, signature, tenantId || 'system');
  }

  /**
   * POST /orders â€” Create a new order (standard).
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new standard order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created.' })
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.ordersService as any).create(dto, tenantId);
  }

  /**
   * GET /orders/:id â€” Get a specific order.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Returns the order.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.ordersService as any).findOne(id, tenantId);
  }

  /**
   * PATCH /orders/:id/status â€” Update order status.
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated.' })
  @ApiResponse({ status: 400, description: 'Invalid status transition.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req?: any,
  ) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.ordersService as any).updateOrderStatus(id, dto.status, tenantId);
  }

  /**
   * PATCH /orders/:id/cancel â€” Cancel an order.
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({ status: 200, description: 'Order cancelled.' })
  @ApiResponse({ status: 400, description: 'Cancellation not allowed from current status.' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
    @Req() req?: any,
  ) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.ordersService as any).cancelOrder(id, tenantId, dto.reason ?? 'No reason provided');
  }
}


