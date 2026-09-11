import { IsString, IsDecimal, IsISO8601, IsOptional, IsUUID, IsEnum, Min, Length, MaxLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum GiftCardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
}

/**
 * DTO for creating a new gift card.
 */
export class CreateGiftCardDto {
  @IsDecimal({ decimal_digits: '2', force_decimal: true }, { message: 'initialBalance must be a decimal with exactly 2 decimal places.' })
  @Min(0.01, { message: 'initialBalance must be at least 0.01.' })
  @Type(() => Number)
  initialBalance: number;

  @IsString({ message: 'currency must be a string.' })
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code (e.g., USD).' })
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter uppercase ISO code.' })
  currency: string;

  @IsOptional()
  @IsString({ message: 'code must be a string.' })
  @Length(16, 16, { message: 'code must be 16 characters long.' })
  @Matches(/^[A-Z0-9]+$/, { message: 'code must be alphanumeric (uppercase).' })
  code?: string;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'expiryDate must be a valid ISO 8601 date string.' })
  expiryDate?: string;

  @IsOptional()
  @IsUUID('4', { message: 'issuedByUserId must be a valid UUID v4.' })
  issuedByUserId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'issuedToCustomerAccountId must be a valid UUID v4.' })
  issuedToCustomerAccountId?: string;
}

/**
 * DTO for updating an existing gift card's details.
 */
export class UpdateGiftCardDto {
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'expiryDate must be a valid ISO 8601 date string.' })
  expiryDate?: string | null; // Allow null to clear expiry date

  @IsOptional()
  @IsEnum(GiftCardStatus, { message: 'status must be a valid GiftCardStatus enum value.' })
  status?: GiftCardStatus;

  @IsOptional()
  @IsString({ message: 'currency must be a string.' })
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code (e.g., USD).' })
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter uppercase ISO code.' })
  currency?: string;

  @IsOptional()
  @IsUUID('4', { message: 'issuedByUserId must be a valid UUID v4.' })
  issuedByUserId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'issuedToCustomerAccountId must be a valid UUID v4.' })
  issuedToCustomerAccountId?: string | null;
}

/**
 * DTO for redeeming a gift card.
 */
export class RedeemGiftCardDto {
  @IsDecimal({ decimal_digits: '2', force_decimal: true }, { message: 'redemptionAmount must be a decimal with exactly 2 decimal places.' })
  @Min(0.01, { message: 'redemptionAmount must be at least 0.01.' })
  @Type(() => Number)
  redemptionAmount: number;

  @IsString({ message: 'currency must be a string.' })
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code (e.g., USD).' })
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter uppercase ISO code.' })
  currency: string;

  @IsOptional()
  @IsUUID('4', { message: 'redeemedByUserId must be a valid UUID v4.' })
  redeemedByUserId?: string;

  @IsOptional()
  @IsString({ message: 'transactionReference must be a string.' })
  @MaxLength(255, { message: 'transactionReference cannot exceed 255 characters.' })
  transactionReference?: string;
}

/**
 * DTO for fetching a list of gift cards.
 */
export class GetGiftCardsDto {
  @IsOptional()
  @IsEnum(GiftCardStatus, { message: 'status must be a valid GiftCardStatus enum value.' })
  status?: GiftCardStatus;

  @IsOptional()
  @IsUUID('4', { message: 'issuedByUserId must be a valid UUID v4.' })
  issuedByUserId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'issuedToCustomerAccountId must be a valid UUID v4.' })
  issuedToCustomerAccountId?: string;

  @IsOptional()
  @IsString({ message: 'currency must be a string.' })
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code (e.g., USD).' })
  @Matches(/^[A-Z]{3}$/, { message: 'currency must be a 3-letter uppercase ISO code.' })
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'limit must be at least 1.' })
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0, { message: 'offset must be at least 0.' })
  offset?: number;
}
