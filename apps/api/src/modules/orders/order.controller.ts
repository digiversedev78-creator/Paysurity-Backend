import {
  Controller, Post, Get, Patch, Body, Param,
  HttpCode, HttpStatus, Request, Headers, Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  IsString, IsNumber, IsOptional, IsEnum, IsArray,
  ValidateNested, Min, ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';

import { OrderService, OrderRecord } from './order.service';

class OrderItemRequestDto {
  @IsString() itemName!: string;
  @IsOptional() @IsString() sku?: string | undefined;
  @IsNumber() @Min(1) quantity!: number;
  @IsNumber() @Min(0) unitPriceCents!: number;
  @IsOptional() @IsArray() modifiers?: string[] | undefined;
  @IsOptional() @IsString() specialInstructions?: string | undefined;
  @IsOptional() @IsString() category?: string | undefined;
  @IsOptional() @IsString() kdsStation?: string | undefined;
}

class CreateOrderRequestDto {
  @IsEnum(['DINE_IN', 'TAKEOUT', 'DELIVERY', 'DRIVE_THRU', 'CURBSIDE'])
  orderType!: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'DRIVE_THRU' | 'CURBSIDE';

  @IsOptional() @IsString() locationId?: string | undefined;
  @IsOptional() @IsString() tableNumber?: string | undefined;
  @IsOptional() @IsString() customerName?: string | undefined;
  @IsOptional() @IsString() customerPhone?: string | undefined;
  @IsOptional() @IsString() notes?: string | undefined;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemRequestDto)
  items!: OrderItemRequestDto[];
}

class UpdateKdsDto {
  @IsEnum(['PREPARING', 'READY', 'SERVED'])
  status!: 'PREPARING' | 'READY' | 'SERVED';

  @IsNumber() @Min(0) itemIndex!: number;
}

@ApiTags('orders')
@Controller('v1/orders')
@ApiBearerAuth('JWT-auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List orders for the current tenant' })
  async listOrders(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ): Promise<{ data: any[] }> {
    const orders = await this.orderService.listOrders?.(
      req.user.tenantId, status, limit ?? 50,
    ) ?? [];
    return { data: orders };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order (POSR/POSG/POS-R)' })
  async createOrder(
    @Body() body: CreateOrderRequestDto,
    @Request() req: any,
    @Headers('x-trace-id') traceId?: string,
  ): Promise<{ data: OrderRecord }> {
    const result = await (this.orderService as any).createOrder(
      {
        tenantId: req.user.tenantId,
        merchantId: (req as any).merchantId ?? req.user.tenantId,
        locationId: body.locationId ?? '',
        orderType: body.orderType,
        tableNumber: body.tableNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        items: body.items,
        notes: body.notes,
      },
      traceId ?? 'no-trace',
    );
    return { data: result };
  }

  @Patch(':orderId/kds')
  @ApiOperation({ summary: 'Update KDS item status (Kitchen Display System)' })
  async updateKds(
    @Param('orderId') orderId: string,
    @Body() body: UpdateKdsDto,
    @Request() req: any,
    @Headers('x-trace-id') traceId?: string,
  ): Promise<{ data: { success: boolean } }> {
    const result = await (this.orderService as any).updateKdsStatus(
      orderId, body.itemIndex, body.status, req.user.tenantId, traceId ?? 'no-trace',
    );
    return { data: result };
  }
}

