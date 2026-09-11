import { IsUUID, IsDateString, IsEnum, IsOptional, ValidateIf, IsEmail ,
  IsUrl} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  XLSX = 'xlsx',
}

export enum ReportType {
  MERCHANT_STATEMENT = 'merchant-statement',
  // Add other report types as needed for future expansion
}

export class GenerateMerchantStatementDto {
  @ApiProperty({
    description: 'The ID of the merchant for whom the statement is being generated.',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID('4', { message: 'Merchant ID must be a valid UUID v4' })
  merchantId: string;

  @ApiProperty({
    description: 'The start date for the statement period (inclusive), in YYYY-MM-DD format.',
    type: 'string',
    format: 'date',
    example: '2023-01-01',
  })
  @IsDateString({}, { message: 'Start date must be a valid date string (YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({
    description: 'The end date for the statement period (inclusive), in YYYY-MM-DD format.',
    type: 'string',
    format: 'date',
    example: '2023-01-31',
  })
  @IsDateString({}, { message: 'End date must be a valid date string (YYYY-MM-DD)' })
  endDate: string;

  @ApiProperty({
    description: 'The desired format for the generated report.',
    enum: ReportFormat,
    example: ReportFormat.PDF,
    default: ReportFormat.PDF,
    required: false,
  })
  @IsEnum(ReportFormat, { message: 'Invalid report format' })
  @IsOptional()
  format?: ReportFormat = ReportFormat.PDF; // Default value

  @ApiProperty({
    description: 'The type of report to generate.',
    enum: ReportType,
    example: ReportType.MERCHANT_STATEMENT,
    default: ReportType.MERCHANT_STATEMENT,
    required: false,
  })
  @IsEnum(ReportType, { message: 'Invalid report type' })
  @IsOptional()
  type?: ReportType = ReportType.MERCHANT_STATEMENT; // Default value, specific to this DTO context

  @ApiProperty({
    description: 'An optional email address to send the report to. If not provided, the report will be available via API.',
    type: 'string',
    format: 'email',
    example: 'merchant@example.com',
    required: false,
  })
  @ValidateIf(o => o.deliveryEmail !== undefined && o.deliveryEmail !== null && o.deliveryEmail !== '')
  @IsEmail({}, { message: 'Delivery email must be a valid email address' })
  @IsOptional()
  deliveryEmail?: string;
}

export enum ReportGenerationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  // Add other statuses like 'in-progress', 'queued' if needed
}

export class ReportGenerationResponseDto {
  @ApiProperty({
    description: 'A unique identifier for the report generation job, allowing its status to be tracked.',
    format: 'uuid',
    example: 'f1e2d3c4-b5a6-9870-6543-2109fedcba98',
  })
  @IsUUID('4', { message: 'Job ID must be a valid UUID v4' })
  jobId: string;

  @ApiProperty({
    description: 'The current status of the report generation job.',
    enum: ReportGenerationStatus,
    example: ReportGenerationStatus.PENDING,
  })
  @IsEnum(ReportGenerationStatus, { message: 'Invalid report generation status' })
  status: ReportGenerationStatus;

  @ApiProperty({
    description: 'A descriptive message regarding the report generation process.',
    example: 'Report generation initiated successfully. You can track its status using the jobId.',
  })
  message: string;

  @ApiProperty({
    description: 'The URL to download the generated report, if it is immediately available and its status is "completed".',
    type: 'string',
    format: 'url',
    example: 'https://api.paysurity.com/reports/download/f1e2d3c4-b5a6-9870-6543-2109fedcba98.pdf',
    required: false,
  })
  @ValidateIf(o => o.downloadUrl !== undefined && o.downloadUrl !== null && o.downloadUrl !== '')
  @IsUrl({}, { message: 'Download URL must be a valid URL' })
  @IsOptional()
  downloadUrl?: string;

  @ApiProperty({
    description: 'The unique identifier of the generated report in the system, if it is saved in a reports repository.',
    format: 'uuid',
    example: '1a2b3c4d-5e6f-7080-9102-112314151617',
    required: false,
  })
  @IsUUID('4', { message: 'Report ID must be a valid UUID v4' })
  @IsOptional()
  reportId?: string;
}
