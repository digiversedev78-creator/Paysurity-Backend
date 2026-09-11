import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
  Length,
  IsArray,
  ArrayMinSize,
  IsUUID,
  IsPositive
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReturnReason {
  DAMAGED_ITEM = 'DAMAGED_ITEM',
  WRONG_ITEM = 'WRONG_ITEM',
  CUSTOMER_DISSATISFACTION = 'CUSTOMER_DISSATISFACTION',
  ITEM_NOT_AS_DESCRIBED = 'ITEM_NOT_AS_DESCRIBED',
  RECEIVED_LATE = 'RECEIVED_LATE',
  OTHER = 'OTHER',
}

export class CreateReturnDto {
  @IsUUID('4', { message: 'orderId must be a valid UUID' })
  @IsNotEmpty({ message: 'orderId is required' })
  orderId: string;

  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @IsPositive({ message: 'amount must be a positive number' })
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;

  @IsString({ message: 'currency must be a string' })
  @Length(3, 3, { message: 'currency must be a 3-letter ISO 4217 code' })
  @IsNotEmpty({ message: 'currency is required' })
  currency: string;

  @IsEnum(ReturnReason, { message: 'Invalid return reason provided' })
  @IsNotEmpty({ message: 'reason is required' })
  reason: ReturnReason;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;

  @IsOptional()
  @IsArray({ message: 'items must be an array' })
  @IsUUID('4', { each: true, message: 'Each item ID must be a valid UUID' })
  @ArrayMinSize(1, { message: 'items array cannot be empty if provided' })
  items?: string[]; // Assuming item IDs are UUIDs
}

export class UpdateReturnDto {
  @IsOptional()
  @IsEnum(ReturnStatus, { message: 'Invalid return status provided' })
  status?: ReturnStatus;

  @IsOptional()
  @IsEnum(ReturnReason, { message: 'Invalid return reason provided' })
  reason?: ReturnReason;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes?: string;

  @IsOptional()
  @IsDateString({}, { message: 'processedDate must be a valid ISO 8601 date string' })
  processedDate?: string;

  @IsOptional()
  @IsString({ message: 'refundMethod must be a string' })
  refundMethod?: string; // e.g., 'ORIGINAL_PAYMENT', 'STORE_CREDIT'
}

export class ReturnQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'orderId must be a valid UUID' })
  orderId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId?: string;

  @IsOptional()
  @IsEnum(ReturnStatus, { message: 'Invalid return status provided' })
  status?: ReturnStatus;

  @IsOptional()
  @IsEnum(ReturnReason, { message: 'Invalid return reason provided' })
  reason?: ReturnReason;

  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 date string' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 date string' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'limit must be a number' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'offset must be a number' })
  @Min(0, { message: 'offset must be at least 0' })
  offset?: number = 0;
}
