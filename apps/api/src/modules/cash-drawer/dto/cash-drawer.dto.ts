import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  Min,
  IsEnum,
  IsPositive,
  IsISO8601
} from 'class-validator';

// Define enums for cash drawer state and transaction types
// These could ideally come from a shared library or the database schema definition package.
export enum CashDrawerState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum CashDrawerTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export class CreateCashDrawerDto {
  @IsUUID()
  @IsNotEmpty()
  terminalId: string; // The terminal associated with this cash drawer

  @IsUUID()
  @IsNotEmpty()
  userId: string; // The user who is opening/responsible for this cash drawer

  @IsString()
  @IsNotEmpty()
  // In a real application, currency might be validated against a list of ISO 4217 codes.
  currency: string;

  @IsNumber()
  @Min(0) // Opening balance can be 0 (e.g., starting empty)
  @IsNotEmpty()
  openingBalance: number;

  @IsString()
  @IsOptional()
  description?: string;
}

// For updating a cash drawer, typically only certain fields are mutable.
// Balances are handled via transactions, and IDs are immutable.
export class UpdateCashDrawerDto {
  @IsString()
  @IsOptional()
  description?: string;
}

export class DepositWithdrawalDto {
  @IsNumber()
  @IsPositive() // Must be greater than 0
  @Min(0.01) // Minimum amount for a transaction
  @IsNotEmpty()
  amount: number;

  @IsEnum(CashDrawerTransactionType)
  @IsNotEmpty()
  type: CashDrawerTransactionType; // 'DEPOSIT' or 'WITHDRAWAL'

  @IsString()
  @IsNotEmpty()
  reason: string; // e.g., 'petty cash', 'change fund', 'bank drop', 'customer refund'

  @IsUUID()
  @IsNotEmpty()
  operatorId: string; // The user who performed the deposit/withdrawal
}

export class CloseCashDrawerDto {
  @IsNumber()
  @Min(0) // Actual closing balance can be 0
  @IsNotEmpty()
  actualClosingBalance: number; // The physical cash count at closing for reconciliation

  @IsString()
  @IsOptional()
  notes?: string; // Any notes regarding the closing, discrepancies, etc.

  @IsUUID()
  @IsNotEmpty()
  operatorId: string; // The user who closed the cash drawer
}

// This DTO represents the current status and details of a cash drawer.
export class CashDrawerStatus {
  @IsUUID()
  id: string;

  @IsEnum(CashDrawerState)
  status: CashDrawerState;

  @IsNumber()
  currentBalance: number;

  @IsNumber()
  openingBalance: number;

  @IsString()
  currency: string;

  @IsISO8601()
  openedAt: string; // ISO 8601 date string when the drawer was opened

  @IsISO8601()
  @IsOptional()
  closedAt?: string; // ISO 8601 date string, present if the drawer is closed

  @IsUUID()
  terminalId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @IsOptional()
  description?: string;
}
