/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  TAX-005 -- Tax Summary Report
 * FILE TYPE:    DTO
 * MODULE:       tax
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/TAX_ENGINE.md
 * WORKER:       CODER-021
 * GENERATED:    2026-03-17T13:07:25.582Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsNotEmpty, IsOptional, IsNumberString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTaxSummaryReportDto {
  @IsNotEmpty()
  @IsInt()
  @Min(2000) // Assuming tax years start from 2000
  @Max(2099) // Assuming tax years end by 2099
  @Type(() => Number)
  taxYear: number;

  @IsOptional()
  @IsNumberString()
  employeeId?: string;
}

export class TaxSummaryReportItemDto {
  employeeId: string;
  employeeName: string;
  taxYear: number;
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxAmountCalculated: number;
  taxPaid: number;
  taxDue: number;
  status: string;
}

export class TaxSummaryReportResponseDto {
  reportDate: Date;
  generatedBy: string;
  summaryItems: TaxSummaryReportItemDto[];
  totalRecords: number;
  totalGrossIncomeOverall: number;
  totalTaxPaidOverall: number;
  totalTaxDueOverall: number;
}
