/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-012 -- Cash Drawer Management
 * FILE TYPE:    DTO
 * MODULE:       cash-drawer
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-085
 * GENERATED:    2026-03-17T13:10:40.375Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { IsUUID, IsString, IsNumber, IsPositive, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CashDrawerStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export class CreateCashDrawerDto {
  @ApiProperty({ description: 'The UUID of the location this cash drawer belongs to.', example: 'c8728a0b-1f6e-4e4b-9e0a-1a2b3c4d5e6f' })
  @IsUUID('4', { message: 'Location ID must be a valid UUID v4' })
  locationId: string;

  @ApiProperty({ description: 'A user-friendly name for the cash drawer.', example: 'Main Counter Drawer' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ description: 'The initial balance of the cash drawer.', example: 100.50, type: 'number', format: 'float' })
  @IsNumber({}, { message: 'Initial balance must be a number' })
  
  initialBalance: number;

  @ApiProperty({ description: 'The 3-letter currency code (ISO 4217).', example: 'USD' })
  @IsString({ message: 'Currency must be a string' })
  currency: string;
}

export class UpdateCashDrawerDto {
  @ApiProperty({ description: 'The UUID of the location this cash drawer belongs to.', example: 'c8728a0b-1f6e-4e4b-9e0a-1a2b3c4d5e6f', required: false })
  @IsOptional()
  @IsUUID('4', { message: 'Location ID must be a valid UUID v4' })
  locationId?: string;

  @ApiProperty({ description: 'A user-friendly name for the cash drawer.', example: 'Main Counter Drawer A', required: false })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiProperty({ description: 'The status of the cash drawer.', enum: CashDrawerStatus, example: CashDrawerStatus.OPEN, required: false })
  @IsOptional()
  @IsIn([CashDrawerStatus.OPEN, CashDrawerStatus.CLOSED], { message: 'Status must be either OPEN or CLOSED' })
  status?: CashDrawerStatus;
}

export class DepositWithdrawalDto {
  @ApiProperty({ description: 'The amount to deposit or withdraw.', example: 50.00, type: 'number', format: 'float' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  amount: number;
}

export class CloseCashDrawerDto {
  @ApiProperty({ description: 'The final balance of the cash drawer when closing.', example: 150.75, type: 'number', format: 'float' })
  @IsNumber({}, { message: 'Final balance must be a number' })
  
  finalBalance: number;
}

