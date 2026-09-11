import { IsUUID, IsNumber, IsString, IsNotEmpty, IsPositive, Length, IsOptional, MaxLength, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class CreateUpdateTipDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currencyCode: string; // e.g., "USD", "EUR"

  @IsUUID('4')
  @IsNotEmpty()
  recipientEntityId: string; // The ID of the entity receiving the tip (e.g., employee ID, merchant ID)

  @IsUUID('4')
  @IsOptional()
  payerEntityId?: string; // The ID of the entity paying the tip (e.g., customer ID)

  @IsUUID('4')
  @IsOptional()
  transactionId?: string; // Optional: Link to a specific transaction

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class TipResponseDto {
  @IsUUID('4')
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  currencyCode: string;

  @IsUUID('4')
  @IsNotEmpty()
  recipientEntityId: string;

  @IsUUID('4')
  @IsOptional()
  payerEntityId?: string;

  @IsUUID('4')
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(TipStatus)
  @IsNotEmpty()
  status: TipStatus;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  updatedAt: Date;
}
