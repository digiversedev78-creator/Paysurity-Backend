import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MinLength,
  MaxLength,
  IsUUID,
  IsEnum,
  IsDateString,
  IsISO4217CurrencyCode,
  IsObject,
  IsNotEmpty
} from 'class-validator';
// Although Type is not directly used, it's a common companion for class-validator in DTOs for nested objects, so keeping it for completeness if future DTOs involve nested structures.

export enum GiftCardStatus {
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVE = 'ACTIVE',
  REDEEMED = 'REDEEMED',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

export class CreateGiftCardDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  initialBalance: number;

  @IsString()
  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  currency: string; // e.g., 'USD', 'EUR'

  @IsOptional()
  @IsDateString() // YYYY-MM-DD or ISO 8601 string
  expirationDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  activationCode?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;
}

export class UpdateGiftCardDto {
  @IsOptional()
  @IsEnum(GiftCardStatus)
  status?: GiftCardStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsDateString() // YYYY-MM-DD or ISO 8601 string
  expirationDate?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class RedeemGiftCardDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsUUID()
  transactionId?: string; // Optional ID for the redemption transaction

  @IsString()
  @MinLength(6) // Example min length for a redemption code/PIN
  @MaxLength(100) // Example max length for a redemption code/PIN
  @IsNotEmpty()
  redemptionCode: string; // The code/PIN used to redeem the gift card
}

export class AddFundsGiftCardDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsUUID()
  transactionId?: string; // Optional ID for the add funds transaction

  @IsUUID()
  @IsNotEmpty()
  sourceAccountId: string; // The ID of the account or payment method from which funds are added
}

export class ActivateGiftCardDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsNotEmpty()
  activationCode: string;

  @IsOptional()
  @IsUUID()
  customerId?: string; // Optional customer to link the card to upon activation
}

export class GiftCardResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  // For security, 'code' might be a masked version or an internal identifier.
  // Assuming it's the full code for clarity in a response DTO structure.
  code: string;

  @IsNumber()
  balance: number;

  @IsString()
  @IsISO4217CurrencyCode()
  currency: string;

  @IsEnum(GiftCardStatus)
  status: GiftCardStatus;

  @IsDateString()
  issueDate: string; // ISO 8601 string

  @IsOptional()
  @IsDateString() // ISO 8601 string
  expirationDate?: string;

  @IsOptional()
  @IsDateString() // ISO 8601 string
  activationDate?: string;

  @IsNumber()
  redeemedAmount: number;

  @IsNumber()
  initialBalance: number;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
