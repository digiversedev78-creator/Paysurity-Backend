/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-004 -- BOPIS
 * FILE TYPE:    DTO
 * MODULE:       orders
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-077
 * GENERATED:    2026-03-17T13:08:34.888Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { IsUUID, IsString, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested, IsNumber, Min, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
type Order = any;

export enum OrderStatusEnum {
  PENDING_BOPIS_CONFIRMATION = 'PENDING_BOPIS_CONFIRMATION',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED',
  // ... other general statuses if applicable (e.g., PENDING, CONFIRMED, PROCESSING)
}

class OrderItemDto {
  @ApiProperty({ description: 'UUID of the product', format: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Price per unit of the product', minimum: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number; // Optional, might be fetched from product service
}

export class CreateBopisOrderDto {
  @ApiProperty({ description: 'UUID of the customer placing the order', format: 'uuid' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ description: 'UUID of the store location for pickup', format: 'uuid' })
  @IsUUID()
  pickupLocationId: string;

  @ApiProperty({ description: 'List of items in the order', type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Expected date for pickup', format: 'date-time', required: false })
  @IsOptional()
  @IsDateString()
  expectedPickupDate?: string;

  @ApiProperty({ description: 'Any additional notes for the order', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBopisOrderStatusDto {
  @ApiProperty({ description: 'New status for the BOPIS order', enum: OrderStatusEnum })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @ApiProperty({ description: 'Name or ID of the person who picked up the order (required for PICKED_UP status)', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'pickedUpBy is required when status is PICKED_UP' })
  pickedUpBy?: string;

  @ApiProperty({ description: 'Verification code used for pickup, if any', required: false })
  @IsOptional()
  @IsString()
  pickupCodeUsed?: string;
}

// Assuming the Drizzle 'Order' type is directly suitable for response, but adding ApiProperty for Swagger
export class BopisOrderResponseDto implements Order {
  @ApiProperty({ description: 'UUID of the order', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'UUID of the tenant', format: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'UUID of the customer', format: 'uuid' })
  customerId: string;

  @ApiProperty({ description: 'UUID of the pickup location', format: 'uuid', nullable: true })
  pickupLocationId: string | null;

  @ApiProperty({ description: 'Current status of the order', enum: OrderStatusEnum })
  status: OrderStatusEnum;

  @ApiProperty({ description: 'Date and time when the order was placed', format: 'date-time' })
  orderDate: Date;

  @ApiProperty({ description: 'Expected date and time for pickup', format: 'date-time', nullable: true })
  expectedPickupDate: Date | null;

  @ApiProperty({ description: 'Actual date and time of pickup', format: 'date-time', nullable: true })
  pickupTimestamp: Date | null;

  @ApiProperty({ description: 'Name or ID of the person who picked up the order', nullable: true })
  pickedUpBy: string | null;

  @ApiProperty({ description: 'Verification code used for pickup', nullable: true })
  pickupCodeUsed: string | null;

  @ApiProperty({ description: 'Additional notes for the order', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'List of items in the order', type: [OrderItemDto] })
  items: { productId: string; quantity: number; price: number }[];

  @ApiProperty({ description: 'Timestamp of creation', format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp of last update', format: 'date-time' })
  updatedAt: Date;

  // Add any related entities for a richer response, e.g., pickupLocation details
  @ApiProperty({ description: 'Details of the pickup location', required: false, type: 'object' })
  pickupLocation?: { id: string; name: string; address: string; tenantId: string; createdAt: Date; updatedAt: Date };
}

