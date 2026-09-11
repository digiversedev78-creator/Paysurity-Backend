/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-002 -- Kitchen Display System
 * FILE TYPE:    DTO
 * MODULE:       kds
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-048
 * GENERATED:    2026-03-17T13:08:24.775Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsEnum, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class UpdateOrderItemStatusDto {
  @ApiProperty({ enum: OrderItemStatus, description: 'New status for the order item' })
  @IsEnum(OrderItemStatus, { message: 'status must be a valid OrderItemStatus enum value' })
  status: OrderItemStatus;
}

export class GetOrderItemsFilterDto {
  @ApiProperty({ enum: OrderItemStatus, required: false, description: 'Filter by order item status' })
  @IsOptional()
  @IsEnum(OrderItemStatus, { message: 'status must be a valid OrderItemStatus enum value' })
  status?: OrderItemStatus;

  @ApiProperty({ type: 'string', format: 'uuid', required: false, description: 'Filter by order ID' })
  @IsOptional()
  @IsUUID('4', { message: 'orderId must be a valid UUID' })
  orderId?: string;

  @ApiProperty({ type: 'string', required: false, description: 'Optional search term for item notes or product names' })
  @IsOptional()
  @IsString({ message: 'searchTerm must be a string' })
  searchTerm?: string;
}
