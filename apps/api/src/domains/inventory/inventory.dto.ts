/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-014 -- Purchase Orders
 * FILE TYPE:    DTO
 * MODULE:       inventory
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-072
 * GENERATED:    2026-03-17T13:08:52.649Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { 
  IsUUID, IsNotEmpty, IsDateString, IsNumber, Min, IsArray, ValidateNested, IsOptional, IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export class PurchaseOrderItemDto {
  @ApiProperty({ description: 'UUID of the inventory item', format: 'uuid' })
  @IsUUID('4', { message: 'inventoryItemId must be a valid UUID.' })
  @IsNotEmpty({ message: 'inventoryItemId cannot be empty.' })
  inventoryItemId: string;

  @ApiProperty({ description: 'Quantity of the item in the purchase order', example: 10 })
  @IsNumber({}, { message: 'quantity must be a number.' })
  @Min(1, { message: 'quantity must be at least 1.' })
  @IsNotEmpty({ message: 'quantity cannot be empty.' })
  quantity: number;

  @ApiProperty({ description: 'Unit price of the item at the time of purchase order', example: 15.50 })
  @IsNumber({}, { message: 'unitPrice must be a number.' })
  @Min(0, { message: 'unitPrice cannot be negative.' })
  @IsNotEmpty({ message: 'unitPrice cannot be empty.' })
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'UUID of the supplier', format: 'uuid' })
  @IsUUID('4', { message: 'supplierId must be a valid UUID.' })
  @IsNotEmpty({ message: 'supplierId cannot be empty.' })
  supplierId: string;

  @ApiProperty({ description: 'Date the purchase order was placed (ISO 8601 string)', example: '2026-07-20T10:00:00Z' })
  @IsDateString({}, { message: 'orderDate must be a valid ISO 8601 date string.' })
  @IsNotEmpty({ message: 'orderDate cannot be empty.' })
  orderDate: Date;

  @ApiProperty({ description: 'Expected date of delivery (ISO 8601 string)', example: '2026-08-01T10:00:00Z' })
  @IsDateString({}, { message: 'expectedDeliveryDate must be a valid ISO 8601 date string.' })
  @IsNotEmpty({ message: 'expectedDeliveryDate cannot be empty.' })
  expectedDeliveryDate: Date;

  @ApiProperty({ type: [PurchaseOrderItemDto], description: 'List of items included in the purchase order' })
  @IsArray({ message: 'items must be an array.' })
  @ValidateNested({ each: true }) // Ensures each item in the array is validated
  @Type(() => PurchaseOrderItemDto)
  @IsNotEmpty({ message: 'items array cannot be empty.' })
  items: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'UUID of the supplier', format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'supplierId must be a valid UUID.' })
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Date the purchase order was placed (ISO 8601 string)', example: '2026-07-20T10:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'orderDate must be a valid ISO 8601 date string.' })
  orderDate?: Date;

  @ApiPropertyOptional({ description: 'Expected date of delivery (ISO 8601 string)', example: '2026-08-01T10:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'expectedDeliveryDate must be a valid ISO 8601 date string.' })
  expectedDeliveryDate?: Date;

  @ApiPropertyOptional({ description: 'Current status of the purchase order', enum: PurchaseOrderStatus, example: PurchaseOrderStatus.APPROVED })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus, { message: 'Invalid purchase order status.' })
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ type: [PurchaseOrderItemDto], description: 'List of items included in the purchase order' })
  @IsOptional()
  @IsArray({ message: 'items must be an array.' })
  @ValidateNested({ each: true }) // Ensures each item in the array is validated
  @Type(() => PurchaseOrderItemDto)
  items?: PurchaseOrderItemDto[];
}

export class FilterPurchaseOrdersDto {
  @ApiPropertyOptional({ description: 'Filter by purchase order status', enum: PurchaseOrderStatus, example: PurchaseOrderStatus.PENDING })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus, { message: 'Invalid purchase order status.' })
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ description: 'Filter by supplier ID', format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'supplierId must be a valid UUID.' })
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Start date for filtering orders (inclusive, ISO 8601)', example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string.' })
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering orders (inclusive, ISO 8601)', example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string.' })
  endDate?: string;

  // Add pagination/sorting fields if required
}

