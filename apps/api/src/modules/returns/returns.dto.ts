/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-003 -- Returns
 * FILE TYPE:    DTO
 * MODULE:       returns
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-076
 * GENERATED:    2026-03-17T13:08:27.930Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { IsString, IsNumber, IsUUID, IsNotEmpty, IsEnum, IsOptional, Min, MaxLength } from 'class-validator';


export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum ReturnReason {
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  CUSTOMER_DISLIKE = 'customer_dislike',
  DEFECTIVE = 'defective',
  OTHER = 'other',
}

export class CreateReturnDto {
  @IsUUID('4', { message: 'transactionId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'transactionId is required' })
  transactionId: string;

  @IsEnum(ReturnReason, { message: 'returnReason must be a valid return reason' })
  @IsNotEmpty({ message: 'returnReason is required' })
  returnReason: ReturnReason;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  @IsNotEmpty({ message: 'amount is required' })
  amount: number;

  @IsString({ message: 'currency must be a string' })
  @MaxLength(3, { message: 'currency must be a 3-letter ISO code' })
  @IsNotEmpty({ message: 'currency is required' })
  currency: string; // e.g., 'USD', 'EUR'
}

export class UpdateReturnDto extends (class {} as any) {
  @IsEnum(ReturnStatus, { message: 'status must be a valid return status' })
  @IsOptional()
  status?: ReturnStatus;

  @IsEnum(ReturnReason, { message: 'returnReason must be a valid return reason' })
  @IsOptional()
  returnReason?: ReturnReason;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0.01, { message: 'amount must be greater than 0' })
  @IsOptional()
  amount?: number;

  // transactionId and currency are typically not updated directly on a return
  // after creation, so they are not explicitly exposed here in the update DTO
  // beyond what PartialType already implies.
}

export class ReturnQueryDto {
  @IsEnum(ReturnStatus, { message: 'status must be a valid return status' })
  @IsOptional()
  status?: ReturnStatus;

  @IsUUID('4', { message: 'transactionId must be a valid UUID v4' })
  @IsOptional()
  transactionId?: string;
}


