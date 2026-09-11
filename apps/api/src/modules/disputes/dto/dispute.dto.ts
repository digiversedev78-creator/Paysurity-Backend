import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUUID,
  Min,
  IsArray,
  ArrayMaxSize,
  IsObject,
  IsDateString,
  IsPositive,
  IsCurrency,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DisputeStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WON = 'WON',
  LOST = 'LOST',
  CLOSED = 'CLOSED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED',
  REQUIRED_ACTION = 'REQUIRED_ACTION',
}

export class CreateDisputeDto {
  @IsUUID('4')
  transactionId: string;

  @IsString()
  @IsIn([
    'FRAUDULENT',
    'UNAUTHORIZED',
    'PRODUCT_NOT_RECEIVED',
    'SERVICE_NOT_RENDERED',
    'DUPLICATE_TRANSACTION',
    'CREDIT_NOT_PROCESSED',
    'INCORRECT_AMOUNT',
    'CANCELLED_RECURRING',
    'OTHER',
  ])
  reason: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsCurrency()
  currency: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  evidenceFileIds?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateDisputeDto {
  @IsOptional()
  @IsString()
  @IsIn([
    'FRAUDULENT',
    'UNAUTHORIZED',
    'PRODUCT_NOT_RECEIVED',
    'SERVICE_NOT_RENDERED',
    'DUPLICATE_TRANSACTION',
    'CREDIT_NOT_PROCESSED',
    'INCORRECT_AMOUNT',
    'CANCELLED_RECURRING',
    'OTHER',
  ])
  reason?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10)
  evidenceFileIds?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class DisputeQueryDto {
  @IsOptional()
  @IsUUID('4')
  transactionId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(DisputeStatus, { each: true })
  @Type(() => String) // Ensure array elements are treated as strings for enum validation
  status?: DisputeStatus[];

  @IsOptional()
  @IsString()
  reasonKeyword?: string;

  @IsOptional()
  @IsUUID('4')
  merchantId?: string;

  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

export class UpdateDisputeStatusDto {
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @IsOptional()
  @IsString()
  resolutionDetails?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(5)
  resolutionEvidenceFileIds?: string[];
}
