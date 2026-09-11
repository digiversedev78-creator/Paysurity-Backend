import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  Max,
  IsInt, // Not used but often useful
} from 'class-validator';
import { Type } from 'class-transformer';
// mapped-types removed

export enum PciComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export class CreatePciAuditArchiveDto {
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  auditReference: string;

  @IsEnum(PciComplianceStatus)
  @IsNotEmpty()
  complianceStatus: PciComplianceStatus;

  @IsUrl()
  @IsNotEmpty()
  documentUrl: string;

  @IsString()
  @IsNotEmpty()
  version: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsNotEmpty()
  archivedBy: string; // User ID of the person who archived it

  @IsDateString()
  @IsNotEmpty()
  archiveDate: string; // Date when the audit was officially archived

  @IsDateString()
  @IsNotEmpty()
  auditPeriodStart: string; // Start date of the audit period covered by this archive

  @IsDateString()
  @IsNotEmpty()
  auditPeriodEnd: string; // End date of the audit period covered by this archive
}

export class UpdatePciAuditArchiveDto extends (class {} as any) {}

export class PciAuditArchiveFilterDto {
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @IsEnum(PciComplianceStatus)
  @IsOptional()
  complianceStatus?: PciComplianceStatus;

  @IsDateString()
  @IsOptional()
  archiveDateStart?: string; // Filter archives created on or after this date

  @IsDateString()
  @IsOptional()
  archiveDateEnd?: string; // Filter archives created on or before this date

  @IsDateString()
  @IsOptional()
  auditPeriodStart?: string; // Filter audits covering periods starting on or after this date

  @IsDateString()
  @IsOptional()
  auditPeriodEnd?: string; // Filter audits covering periods ending on or before this date

  @IsUUID()
  @IsOptional()
  archivedBy?: string;

  @IsString()
  @IsOptional()
  auditReference?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  sortBy?: string = 'archiveDate'; // e.g., 'archiveDate', 'complianceStatus', 'auditReference'

  @IsString()
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PciAuditArchiveResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  organizationId: string;

  @IsString()
  auditReference: string;

  @IsEnum(PciComplianceStatus)
  complianceStatus: PciComplianceStatus;

  @IsUrl()
  documentUrl: string;

  @IsString()
  version: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  archivedBy: string;

  @IsDateString()
  archiveDate: string;

  @IsDateString()
  auditPeriodStart: string;

  @IsDateString()
  auditPeriodEnd: string;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}



