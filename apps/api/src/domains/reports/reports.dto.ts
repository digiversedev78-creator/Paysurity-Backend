/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-008 -- Statement/1099-K
 * FILE TYPE:    DTO
 * MODULE:       reports
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-116
 * GENERATED:    2026-03-17T13:10:57.560Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsUUID, IsInt, Min, Max, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  STATEMENT = 'STATEMENT',
  _1099K = '1099K',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV', // For tabular data, less common for full statements
  JSON = 'JSON', // For API consumption of summary data or meta-data
}

export class GenerateMerchantStatementDto {
  @ApiProperty({
    description: 'Unique identifier of the merchant for whom the report is being generated.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'merchantId must be a valid UUID v4' })
  merchantId: string;

  @ApiProperty({
    description: 'The year for which the report should be generated (e.g., tax year for 1099-K).',
    example: 2023,
    minimum: 2000,
    maximum: new Date().getFullYear(),
  })
  @IsInt({ message: 'year must be an integer' })
  @Min(2000, { message: 'year must be at least 2000' })
  @Max(new Date().getFullYear(), { message: 'year cannot be in the future' })
  @Type(() => Number) // Ensures the year is transformed to a number from string query/body param
  year: number;

  @ApiProperty({
    enum: ReportType,
    description: 'The type of report to generate, either a financial STATEMENT or a 1099-K tax form.',
    example: ReportType._1099K,
  })
  @IsEnum(ReportType, { message: 'reportType must be either STATEMENT or 1099K' })
  reportType: ReportType;

  @ApiPropertyOptional({
    enum: ReportFormat,
    description: 'The desired output format for the report.',
    example: ReportFormat.PDF,
    default: ReportFormat.PDF,
  })
  @IsOptional()
  @IsEnum(ReportFormat, { message: 'format must be either PDF, CSV, or JSON' })
  format?: ReportFormat = ReportFormat.PDF; // Default to PDF if not specified

  @ApiPropertyOptional({
    description: 'Optional period for statements (e.g., \"Q1\", \"JANUARY\", \"FULL_YEAR\"). Applicable mainly to STATEMENT type.',
    example: 'FULL_YEAR',
    type: 'string'
  })
  @IsOptional()
  @IsString({ message: 'period must be a string if provided' })
  period?: string; // e.g., 'Q1', 'JANUARY', 'FULL_YEAR'. Logic for this would be handled in service.
}

export class ReportGenerationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the generated report or the report generation job.',
    example: 'RPT-A1B2C3D4-2023-1099K-1678886400000',
  })
  @IsString()
  reportId: string;

  @ApiProperty({
    description: 'A descriptive message regarding the report generation status.',
    example: 'Request for 1099K report for merchant \"Merchant Name\" (a1b2c3d4-e5f6-7890-1234-567890abcdef) for year 2023 has been accepted.',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'A URL where the generated report can be downloaded, if immediately available.',
    example: '/api/v1/reports/merchants/statements/RPT-A1B2C3D4-2023-1099K-1678886400000/download',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({
    description: 'The current status of the report generation process.',
    example: 'GENERATED',
    enum: ['PENDING', 'GENERATED', 'FAILED', 'ERROR']
  })
  @IsOptional()
  @IsString()
  status?: string; // e.g., 'PENDING', 'GENERATED', 'FAILED', 'ERROR'
}
