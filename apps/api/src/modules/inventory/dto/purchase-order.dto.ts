import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  ArrayMinSize,
  IsIn,
  Length
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  PLACED = 'PLACED',
  RECEIVED = 'RECEIVED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

export class PurchaseOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitPrice: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3) // e.g., USD, EUR
  currency: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

export class UpdatePurchaseOrderItemDto {
  @IsUUID()
  @IsOptional()
  id?: string; // Optional: If provided, it's an update to an existing item; otherwise, it's a new item

  @IsUUID()
  @IsOptional()
  productId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePurchaseOrderDto {
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => UpdatePurchaseOrderItemDto)
  items?: UpdatePurchaseOrderItemDto[];
}

export class FilterPurchaseOrdersDto {
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsDateString()
  @IsOptional()
  startDate?: string; // Filter by orderDate >= startDate

  @IsDateString()
  @IsOptional()
  endDate?: string; // Filter by orderDate <= endDate

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minTotalAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxTotalAmount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsString()
  @IsOptional()
  @IsIn(['orderDate', 'totalAmount', 'status', 'vendorId', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
