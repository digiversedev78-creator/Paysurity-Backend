/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-010 -- Receipt Generation
 * FILE TYPE:    DTO
 * MODULE:       receipts
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-083
 * GENERATED:    2026-03-17T13:11:28.065Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsUUID, IsString, IsNumber, IsNotEmpty, IsArray, ValidateNested, IsDateString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReceiptDto {
  @ApiProperty({ description: 'The UUID of the order for which to generate a receipt', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID('4', { message: 'orderId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'orderId is required' })
  orderId: string;
}

export class ReceiptItemDto {
  @ApiProperty({ description: 'Name of the item', example: 'Product A' })
  @IsString({ message: 'Item name must be a string' })
  @IsNotEmpty({ message: 'Item name is required' })
  name: string;

  @ApiProperty({ description: 'Quantity of the item', example: 2 })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({ description: 'Unit price of the item', example: 10.50 })
  @IsNumber({}, { message: 'Unit price must be a number' })
  @Min(0, { message: 'Unit price cannot be negative' })
  unitPrice: number;

  @ApiProperty({ description: 'Total price for this item (quantity * unitPrice)', example: 21.00 })
  @IsNumber({}, { message: 'Total price must be a number' })
  @Min(0, { message: 'Total price cannot be negative' })
  totalPrice: number;
}

export class ReceiptDetailsDto {
  @ApiProperty({ description: 'Unique identifier for the generated receipt', example: 'PS-REC-1678886400000-A1B2C3' })
  @IsString({ message: 'Receipt number must be a string' })
  receiptNumber: string;

  @ApiProperty({ description: 'The UUID of the associated order', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID('4', { message: 'Order ID must be a valid UUID v4' })
  orderId: string;

  @ApiProperty({ description: 'Name of the merchant', example: 'PaySurity Store' })
  @IsString({ message: 'Merchant name must be a string' })
  merchantName: string;

  @ApiProperty({ description: 'Address of the merchant', example: '123 Main St, Anytown, USA' })
  @IsString({ message: 'Merchant address must be a string' })
  @IsOptional()
  merchantAddress?: string;

  @ApiProperty({ description: 'Contact information for the merchant (e.g., email or phone)', example: 'info@paysurity.com' })
  @IsString({ message: 'Merchant contact must be a string' })
  @IsOptional()
  merchantContact?: string;

  @ApiProperty({ description: 'Date and time when the transaction occurred', example: '2023-03-15T10:30:00.000Z' })
  @IsDateString({}, { message: 'Transaction date must be a valid ISO 8601 date string' })
  transactionDate: Date;

  @ApiProperty({ description: 'Method of payment', example: 'Credit Card' })
  @IsString({ message: 'Payment method must be a string' })
  paymentMethod: string;

  @ApiProperty({ description: 'Subtotal amount before taxes', example: 50.00 })
  @IsNumber({}, { message: 'Subtotal must be a number' })
  @Min(0, { message: 'Subtotal cannot be negative' })
  subtotal: number;

  @ApiProperty({ description: 'Tax amount applied to the order', example: 5.00 })
  @IsNumber({}, { message: 'Tax amount must be a number' })
  @Min(0, { message: 'Tax amount cannot be negative' })
  taxAmount: number;

  @ApiProperty({ description: 'Total amount paid for the order (subtotal + tax)', example: 55.00 })
  @IsNumber({}, { message: 'Total amount must be a number' })
  @Min(0, { message: 'Total amount cannot be negative' })
  totalAmount: number;

  @ApiProperty({ type: [ReceiptItemDto], description: 'List of items included in the receipt' })
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @ApiProperty({ description: 'Date and time when the receipt was generated', example: '2023-03-15T11:00:00.000Z' })
  @IsDateString({}, { message: 'Created at must be a valid ISO 8601 date string' })
  createdAt: Date;

  @ApiProperty({ description: 'Name of the customer (optional)', example: 'John Doe', required: false })
  @IsString({ message: 'Customer name must be a string' })
  @IsOptional()
  customerName?: string;
}
