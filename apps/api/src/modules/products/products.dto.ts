/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-001 -- SKU Product Management
 * FILE TYPE:    DTO
 * MODULE:       products
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-074
 * GENERATED:    2026-03-17T13:09:06.254Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsBoolean, IsOptional, Length, Min, IsUUID } from 'class-validator';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Unique identifier for the product (SKU)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  sku: string;

  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Currency of the product (e.g., USD, EUR)' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3) // Assuming ISO 4217 currency codes
  currency: string;

  @ApiProperty({ description: 'Current stock quantity' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stockQuantity: number;

  @ApiProperty({ description: 'Is the product active and available for sale?' })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductResponseDto {
  @ApiProperty({ description: 'Unique ID of the product' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Tenant ID to which the product belongs' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Unique identifier for the product (SKU)' })
  sku: string;

  @ApiProperty({ description: 'Name of the product' })
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price of the product' })
  price: number;

  @ApiProperty({ description: 'Currency of the product (e.g., USD, EUR)' })
  currency: string;

  @ApiProperty({ description: 'Current stock quantity' })
  stockQuantity: number;

  @ApiProperty({ description: 'Is the product active and available for sale?' })
  isActive: boolean;

  @ApiProperty({ description: 'Timestamp when the product was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the product was last updated' })
  updatedAt: Date;
}

export class PaginationDto {
  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number = 10;
}
