import { IsDateString, IsOptional, IsUUID, IsString, IsNumber, Min, IsArray, ValidateNested, IsInt, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTaxSummaryReportDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUUID('4')
  merchantId?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsString()
  taxType?: string; // e.g., 'SALES_TAX', 'VAT', etc.
}

export class TaxSummaryReportItemDto {
  @IsString()
  taxType: string;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsNumber()
  @Min(0)
  totalTaxAmount: number;

  @IsNumber()
  @Min(0)
  taxableAmount: number;

  @IsInt()
  @Min(0)
  numberOfTransactions: number;

  @IsOptional()
  @IsUUID('4')
  merchantId?: string;

  @IsOptional()
  @IsString()
  merchantName?: string;
}

export class TaxSummaryReportResponseDto {
  @Type(() => Date)
  reportGeneratedAt: Date;

  @Type(() => Date)
  startDate: Date;

  @Type(() => Date)
  endDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxSummaryReportItemDto)
  reportItems: TaxSummaryReportItemDto[];

  @IsNumber()
  @Min(0)
  overallTotalTaxAmount: number;

  @IsNumber()
  @Min(0)
  overallTotalTaxableAmount: number;

  @IsInt()
  @Min(0)
  overallNumberOfTransactions: number;
}
