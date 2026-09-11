/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  COM-007 — Regulatory Reporting Exports
 * FILE TYPE:    DTO
 * MODULE:       compliance
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/COM_COMPLIANCE_LEGAL.md
 * WORKER:       CODER-039
 * GENERATED:    2026-03-18T10:34:32.502Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import { IsEnum, IsISO8601, IsOptional, IsUUID, IsString, IsInt, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// Enums matching Drizzle schema enums for consistency
export enum ReportType {
  AML_TRANSACTION_REPORT = 'AML_TRANSACTION_REPORT',
  FINCEN_SAR_BATCH = 'FINCEN_SAR_BATCH',
  OFAC_SANCTION_SCREENING = 'OFAC_SANCTION_SCREENING',
  DAILY_TRANSACTION_SUMMARY = 'DAILY_TRANSACTION_SUMMARY',
  // Add other regulatory report types as needed
}

export enum ReportFormat {
  CSV = 'CSV',
  XLSX = 'XLSX',
  PDF = 'PDF',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * DTO for initiating a new regulatory report export.
 */
export class InitiateRegulatoryReportExportDto {
  @IsEnum(ReportType, { message: 'Invalid report type provided.' })
  reportType: ReportType;

  @IsEnum(ReportFormat, { message: 'Invalid report format provided.' })
  format: ReportFormat;

  @IsISO8601({ strict: true }, { message: 'Start date must be a valid ISO 8601 date string.' })
  startDate: string; // ISO 8601 date string (e.g., '2023-01-01T00:00:00Z')

  @IsISO8601({ strict: true }, { message: 'End date must be a valid ISO 8601 date string.' })
  endDate: string; // ISO 8601 date string

  @IsOptional()
  @IsObject() // Assuming parameters are a JSON object
  // For more complex validation, a dedicated DTO can be nested with @ValidateNested()
  parameters?: Record<string, any>; // Specific filters or parameters for the report
}

/**
 * DTO for responding with regulatory report metadata.
 */
export class RegulatoryReportResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsUUID()
  initiatedByUserId: string;

  @IsEnum(ReportType)
  reportType: ReportType;

  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsString()
  generatedFilePath?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>; // Represents the metadata field from the DB

  @IsISO8601()
  createdAt: string;

  @IsOptional()
  @IsISO8601()
  generationStartedAt?: string;

  @IsOptional()
  @IsISO8601()
  generationCompletedAt?: string;
}

/**
 * DTO for querying regulatory reports with optional filters and pagination.
 */
export class GetRegulatoryReportsQueryDto {
  @IsOptional()
  @IsEnum(ReportType, { message: 'Invalid report type filter.' })
  reportType?: ReportType;

  @IsOptional()
  @IsEnum(ReportStatus, { message: 'Invalid report status filter.' })
  status?: ReportStatus;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'Start date filter must be a valid ISO 8601 date string.' })
  startDate?: string; // Filter reports created after this date

  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'End date filter must be a valid ISO 8601 date string.' })
  endDate?: string; // Filter reports created before this date

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Limit page size to prevent abuse
  limit?: number = 10;
}
