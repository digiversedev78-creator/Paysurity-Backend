import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, Min, Max, IsUUID, IsEnum, Length, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PartialType } from '@nestjs/swagger'; // Used for Update DTOs to make all fields optional

// Define a local enum for product status if not available directly from @paysurity/database
// In a real scenario, this might be imported from a shared schema definition.
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Min(0)
  price: number; // Stored as a number, typically representing a decimal value

  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency must be a 3-letter ISO 4217 code.' })
  currency: string; // e.g., 'USD', 'EUR'

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  sku?: string; // Stock Keeping Unit, often unique

  @IsOptional()
  @IsUUID() // Assuming category IDs are UUIDs
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  productStatus?: ProductStatus; // e.g., ACTIVE, DRAFT, INACTIVE
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // All fields inherited from CreateProductDto are automatically made optional by PartialType
}

export class ProductResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsNumber()
  stockQuantity: number;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsEnum(ProductStatus)
  productStatus: ProductStatus;

  createdAt: Date;

  updatedAt: Date;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
