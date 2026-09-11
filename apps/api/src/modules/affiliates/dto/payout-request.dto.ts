import { IsUUID, IsNumber, IsString, IsEnum, IsPositive, IsOptional, ValidateNested, IsEmail, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export enum PayoutRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum PayoutPaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  // Add other payment methods as necessary for PaySurity
}

/**
 * DTO for bank account details, used for BANK_TRANSFER payouts.
 */
export class BankDetailsDto {
  @IsString()
  bankName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  accountHolderName: string;

  @IsString()
  ifscCode: string; // Indian Financial System Code, or SWIFT/BIC for international
}

/**
 * DTO for creating a new payout request.
 */
export class CreatePayoutRequestDto {
  @IsUUID()
  affiliateId: string; // The ID of the affiliate requesting the payout

  @IsNumber()
  @IsPositive()
  amount: number; // The amount to be paid out

  @IsString()
  // A custom validator could be added for ISO 4217 currency codes if strict validation is needed
  currency: string; // e.g., 'USD', 'INR', 'EUR'

  @IsEnum(PayoutPaymentMethod)
  paymentMethod: PayoutPaymentMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto; // Required if paymentMethod is BANK_TRANSFER

  @IsOptional()
  @IsEmail()
  paypalEmail?: string; // Required if paymentMethod is PAYPAL

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for responding with details of a payout request.
 */
export class PayoutRequestResponseDto {
  @IsUUID()
  id: string; // Unique ID for the payout request

  @IsUUID()
  affiliateId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PayoutRequestStatus)
  status: PayoutRequestStatus; // Current status of the request

  @IsEnum(PayoutPaymentMethod)
  paymentMethod: PayoutPaymentMethod;

  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;

  @IsOptional()
  @IsEmail()
  paypalEmail?: string;

  @Type(() => Date)
  @IsDateString() // Validates if the string is a valid ISO 8601 date string
  requestedAt: Date; // Timestamp when the request was made

  @Type(() => Date)
  @IsDateString()
  updatedAt: Date; // Last updated timestamp of the request

  @IsOptional()
  @IsString()
  notes?: string;
}
