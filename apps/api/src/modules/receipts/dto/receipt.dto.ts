import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Length,
  IsDateString,
  IsUUID,
  IsPositive,
  IsUrl
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiptItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number; // quantity * unitPrice
}

export class GenerateReceiptDto {
  @IsUUID()
  transactionId: string;

  @IsUUID()
  @IsOptional()
  customerId?: string; // Optional if customer details are derived from the transaction

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // e.g., 'credit_card', 'bank_transfer', 'cash'

  @IsString()
  @IsOptional()
  paymentDetails?: string; // e.g., last 4 digits of card, bank name, payment gateway reference

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @IsString()
  @Length(3)
  currency: string; // ISO 4217 currency code, e.g., "USD", "EUR"

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsNumber()
  @Min(0)
  discountAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number; // subtotal + taxAmount - discountAmount

  @IsDateString()
  @IsOptional()
  issueDate?: string; // ISO 8601 string, defaults to current date if not provided
}

export class ReceiptDetailsDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  receiptNumber: string;

  @IsUUID()
  transactionId: string;

  @IsUUID()
  customerId: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  paymentDetails?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @IsString()
  @Length(3)
  currency: string;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsNumber()
  @Min(0)
  discountAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsDateString()
  issueDate: string; // ISO 8601 string

  @IsString()
  @IsNotEmpty()
  status: string; // e.g., 'GENERATED', 'VOIDED', 'REFUNDED', 'PAID'

  @IsDateString()
  createdAt: string; // ISO 8601 string

  @IsDateString()
  @IsOptional()
  updatedAt?: string; // ISO 8601 string

  @IsUrl()
  @IsOptional()
  downloadUrl?: string; // URL to download the receipt document
}
