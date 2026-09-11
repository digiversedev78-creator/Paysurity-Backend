/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  PAY-002 — Payroll Run & Calculation
 * FILE TYPE:    DTO
 * MODULE:       payroll
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/PAY_PAYROLL.md
 * WORKER:       CODER-095
 * GENERATED:    2026-03-18T10:36:38.152Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import { IsDateString, IsOptional, IsArray, IsUUID, IsString, MinLength, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

enum PayrollRunStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
}

export class InitiatePayrollRunDto {
  @IsDateString()
  periodStartDate: string; // YYYY-MM-DD

  @IsDateString()
  periodEndDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true }) // Assuming UUID v4 for employee IDs
  employeeIds?: string[]; // Optional: run for specific employees

  @IsString()
  @MinLength(3)
  description: string;
}

export class PayrollRunResultDetail {
  @IsString()
  componentName: string;

  @IsNumber()
  amount: number;

  @IsString()
  type: string; // e.g., 'BASE_SALARY', 'BONUS', 'DEDUCTION', 'TAX', 'ERROR'
}

export class PayrollResultDto {
  @IsUUID('4')
  id: string;

  @IsUUID('4')
  payrollRunId: string;

  @IsUUID('4')
  employeeId: string;

  @IsNumber()
  grossPay: number;

  @IsNumber()
  netPay: number;

  @IsNumber()
  totalDeductions: number;

  @IsNumber()
  totalTaxes: number;

  @IsArray()
  @Type(() => PayrollRunResultDetail)
  details: PayrollRunResultDetail[]; // JSONB equivalent

  @IsEnum(PayrollRunStatus) // Re-using PayrollRunStatus for simplicity, could define PayrollResultStatus
  status: PayrollRunStatus; // e.g., 'CALCULATED', 'PAID', 'FAILED'
}

export class PayrollRunDto {
  @IsUUID('4')
  id: string;

  @IsUUID('4') // Tenant ID is UUID
  tenantId: string;

  @IsDateString()
  periodStartDate: string;

  @IsDateString()
  periodEndDate: string;

  @IsDateString() // ISO 8601 string
  runDate: string;

  @IsEnum(PayrollRunStatus)
  status: PayrollRunStatus;

  @IsNumber()
  totalEmployeesProcessed: number;

  @IsString()
  description: string;

  @IsUUID('4')
  createdBy: string; // User ID who initiated

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}

// For query parameters
export class ListPayrollRunsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(PayrollRunStatus)
  status?: PayrollRunStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
