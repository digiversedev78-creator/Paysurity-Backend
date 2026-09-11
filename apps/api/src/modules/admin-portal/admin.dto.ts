/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  OPS-006 -- Log Aggregation
 * FILE TYPE:    DTO
 * MODULE:       admin
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/OPS_MANAGEMENT.md
 * WORKER:       CODER-164
 * GENERATED:    2026-03-17T13:13:37.178Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsUUID, IsOptional, IsString, IsNumber, IsEnum, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetLogsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(LogLevel, { each: true })
  @ArrayMinSize(1)
  levels?: LogLevel[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  serviceNames?: string[];

  @IsOptional()
  @IsString()
  startDate?: string; // ISO 8601 string

  @IsOptional()
  @IsString()
  endDate?: string; // ISO 8601 string

  @IsOptional()
  @IsString()
  search?: string; // Search within message or meta

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp'; // e.g., timestamp, level, serviceName

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class LogEntryDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsString()
  timestamp: string; // ISO 8601 string

  @IsEnum(LogLevel)
  level: LogLevel;

  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsString()
  message: string;

  @IsOptional()
  meta?: Record<string, any>; // Using any for simplicity here
}

export class PaginatedLogsDto {
  @IsNumber()
  total: number;

  @IsNumber()
  page: number;

  @IsNumber()
  pageSize: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogEntryDto)
  data: LogEntryDto[];
}
