import {
  IsUUID,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsPositive,
  IsNotEmpty,
  IsObject,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  RECONCILED = 'RECONCILED',
}

export class ShiftResponseDto {
  @IsUUID('4', { message: 'Shift ID must be a valid UUID' })
  id: string;

  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string; // ID of the user who opened/is responsible for the shift

  @IsUUID('4', { message: 'Location ID must be a valid UUID' })
  locationId: string;

  @IsNumber({}, { message: 'Opening cash must be a number' })
  @IsPositive({ message: 'Opening cash must be a positive number' })
  openingCash: number; // Cash in the drawer at the start of the shift

  @IsOptional()
  @IsNumber({}, { message: 'Closing cash must be a number' })
  @IsPositive({ message: 'Closing cash must be a positive number' })
  closingCash?: number; // Cash in the drawer at the end of the shift (optional until closed)

  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency cannot be empty' })
  currency: string; // e.g., 'USD', 'EUR', 'GBP'

  @IsDateString({}, { message: 'Start time must be a valid ISO 8601 date string' })
  startTime: string; // ISO 8601 date string

  @IsOptional()
  @IsDateString({}, { message: 'End time must be a valid ISO 8601 date string' })
  endTime?: string; // ISO 8601 date string (optional until shift is closed)

  @IsEnum(ShiftStatus, { message: 'Invalid shift status' })
  status: ShiftStatus;

  @IsDateString({}, { message: 'Created at must be a valid ISO 8601 date string' })
  createdAt: string;

  @IsDateString({}, { message: 'Updated at must be a valid ISO 8601 date string' })
  updatedAt: string;
}

class ZReportSalesBreakdownDto {
  @IsNumber({}, { message: 'Cash sales must be a number' })
  cash: number;

  @IsNumber({}, { message: 'Card sales must be a number' })
  card: number;

  @IsOptional()
  @IsNumber({}, { message: 'Other sales must be a number' })
  other?: number; // e.g., mobile payments, gift cards, etc.
}

export class ZReportDetailsDto {
  @IsUUID('4', { message: 'Z-Report ID must be a valid UUID' })
  id: string;

  @IsUUID('4', { message: 'Shift ID must be a valid UUID' })
  shiftId: string; // The shift this Z-report is generated for

  @IsDateString({}, { message: 'Report time must be a valid ISO 8601 date string' })
  reportTime: string; // When the Z-report was generated

  @IsString({ message: 'Currency must be a string' })
  @IsNotEmpty({ message: 'Currency cannot be empty' })
  currency: string;

  @IsNumber({}, { message: 'Total sales must be a number' })
  totalSales: number; // Gross sales before returns/discounts

  @IsNumber({}, { message: 'Total returns must be a number' })
  totalReturns: number;

  @IsNumber({}, { message: 'Net sales must be a number' })
  netSales: number; // totalSales - totalReturns

  @IsNumber({}, { message: 'Total discounts must be a number' })
  totalDiscounts: number;

  @IsNumber({}, { message: 'Total taxes must be a number' })
  totalTaxes: number;

  @IsObject({ message: 'Sales breakdown must be an object' })
  @ValidateNested()
  @Type(() => ZReportSalesBreakdownDto)
  salesBreakdown: ZReportSalesBreakdownDto; // Breakdown of sales by payment type

  @IsNumber({}, { message: 'Cash in drawer at start must be a number' })
  cashInDrawerStart: number; // Corresponds to openingCash of the shift

  @IsOptional()
  @IsNumber({}, { message: 'Cash added must be a number' })
  cashAdded?: number; // Cash added to the drawer during the shift (e.g., change fund top-up)

  @IsOptional()
  @IsNumber({}, { message: 'Cash removed must be a number' })
  cashRemoved?: number; // Cash removed from the drawer during the shift (e.g., cash drop)

  @IsNumber({}, { message: 'Expected cash in drawer must be a number' })
  expectedCashInDrawer: number; // Calculated expected cash based on transactions

  @IsNumber({}, { message: 'Actual cash in drawer must be a number' })
  actualCashInDrawer: number; // Physically counted cash at shift close

  @IsNumber({}, { message: 'Cash variance must be a number' })
  cashVariance: number; // actualCashInDrawer - expectedCashInDrawer

  @IsNumber({}, { message: 'Total number of transactions must be a number' })
  totalTransactions: number;

  @IsOptional()
  @IsNumber({}, { message: 'Number of voided transactions must be a number' })
  voidedTransactions?: number;

  @IsDateString({}, { message: 'Created at must be a valid ISO 8601 date string' })
  createdAt: string;

  @IsDateString({}, { message: 'Updated at must be a valid ISO 8601 date string' })
  updatedAt: string;
}
