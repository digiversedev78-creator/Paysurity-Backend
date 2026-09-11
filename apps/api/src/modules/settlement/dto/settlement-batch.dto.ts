import {
  IsUUID,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsOptional,
  IsPositive,
  Matches,
  IsInt,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SettlementBatchStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  READY_FOR_SETTLEMENT = 'READY_FOR_SETTLEMENT',
}

export class CreateSettlementBatchDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsUUID()
  processorId?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/) // ISO 4217 currency code, e.g., 'USD'
  currency?: string;

  @IsOptional()
  @IsString()
  batchIdentifier?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSettlementBatchDto {
  @IsOptional()
  @IsEnum(SettlementBatchStatus)
  status?: SettlementBatchStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  settlementDate?: Date;
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SettlementBatchFilterDto {
  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsUUID()
  processorId?: string;

  @IsOptional()
  @IsEnum(SettlementBatchStatus)
  status?: SettlementBatchStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDateTo?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDateTo?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  settlementDateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  settlementDateTo?: Date;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  batchIdentifier?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class SettlementBatchResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  batchIdentifier: string;

  @IsEnum(SettlementBatchStatus)
  status: SettlementBatchStatus;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsString() // ISO 4217 currency code
  currency: string;

  @IsNumber()
  @Min(0)
  totalTransactions: number;

  @IsNumber()
  @Min(0)
  processedTransactions: number;

  @IsNumber()
  @Min(0)
  failedTransactions: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  settlementDate?: Date;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  processorId: string;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;

  @Type(() => Date)
  @IsDate()
  updatedAt: Date;

  @IsUUID()
  createdBy: string;
}
