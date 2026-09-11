/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ECO-005 — Inventory Sync (POS Γåö Online)
 * FILE TYPE:    DTO
 * MODULE:       ecommerce
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/ECO_ECOMMERCE.md
 * WORKER:       CODER-142
 * GENERATED:    2026-03-18T10:37:35.711Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import { IsUUID, IsString, IsNumber, IsNotEmpty, ValidateNested, IsArray, Min, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum InventorySyncStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PARTIAL_SUCCESS = 'PARTIAL_SUCCESS',
}

export class InventoryItemUpdateDto {
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  @IsNotEmpty({ message: 'productId cannot be empty' })
  productId: string;

  @IsString({ message: 'sku must be a string' })
  @IsNotEmpty({ message: 'sku cannot be empty' })
  sku: string;

  @IsNumber({}, { message: 'quantity must be a number' })
  @Min(0, { message: 'quantity cannot be negative' })
  quantity: number;
}

export class InventorySyncRequestDto {
  @IsUUID('4', { message: 'syncRequestId must be a valid UUID' })
  @IsNotEmpty({ message: 'syncRequestId cannot be empty' })
  syncRequestId: string;

  @IsString({ message: 'sourceSystem must be a string' })
  @IsNotEmpty({ message: 'sourceSystem cannot be empty' })
  sourceSystem: string;

  @IsArray({ message: 'items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => InventoryItemUpdateDto)
  items: InventoryItemUpdateDto[];
}

export class InventorySyncResultItemDto {
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  productId: string;

  @IsString({ message: 'sku must be a string' })
  sku: string;

  @IsNumber({}, { message: 'quantity must be a number' })
  quantity: number;

  @IsBoolean({ message: 'success must be a boolean' })
  success: boolean;

  @IsOptional()
  @IsString({ message: 'errorMessage must be a string' })
  errorMessage?: string;
}

export class InventorySyncResponseDto {
  @IsUUID('4', { message: 'syncRequestId must be a valid UUID' })
  syncRequestId: string;

  @IsEnum(InventorySyncStatus, { message: 'status must be a valid InventorySyncStatus' })
  status: InventorySyncStatus;

  @IsNumber({}, { message: 'processedItemsCount must be a number' })
  processedItemsCount: number;

  @IsNumber({}, { message: 'successfulItemsCount must be a number' })
  successfulItemsCount: number;

  @IsNumber({}, { message: 'failedItemsCount must be a number' })
  failedItemsCount: number;

  @IsOptional()
  @IsString({ message: 'overallErrorMessage must be a string' })
  overallErrorMessage?: string;

  @IsArray({ message: 'itemResults must be an array' })
  @ValidateNested({ each: true })
  @Type(() => InventorySyncResultItemDto)
  itemResults: InventorySyncResultItemDto[];
}

export class InventorySyncLogDto {
  @IsUUID('4', { message: 'id must be a valid UUID' })
  id: string;

  @IsUUID('4', { message: 'syncRequestId must be a valid UUID' })
  syncRequestId: string;

  @IsString({ message: 'sourceSystem must be a string' })
  sourceSystem: string;

  @IsEnum(InventorySyncStatus, { message: 'status must be a valid InventorySyncStatus' })
  status: InventorySyncStatus;

  @IsNumber({}, { message: 'processedItemsCount must be a number' })
  processedItemsCount: number;

  @IsNumber({}, { message: 'successfulItemsCount must be a number' })
  successfulItemsCount: number;

  @IsNumber({}, { message: 'failedItemsCount must be a number' })
  failedItemsCount: number;

  @IsOptional()
  @IsString({ message: 'errorMessage must be a string' })
  errorMessage?: string;

  @IsString({ message: 'syncStartedAt must be a valid date string' })
  syncStartedAt: string;

  @IsOptional()
  @IsString({ message: 'syncFinishedAt must be a valid date string' })
  syncFinishedAt?: string;
}
