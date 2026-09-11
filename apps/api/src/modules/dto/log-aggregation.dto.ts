import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUUID,
  IsDate,
  IsObject,
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  FATAL = 'FATAL',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetLogsDto {
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsUUID('4')
  correlationId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class LogEntryDto {
  @IsUUID('4')
  id: string;

  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @IsEnum(LogLevel)
  level: LogLevel;

  @IsString()
  message: string;

  @IsString()
  source: string;

  @IsOptional()
  @IsUUID('4')
  correlationId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaginatedLogsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogEntryDto)
  data: LogEntryDto[];

  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @Min(1)
  page: number;

  @IsInt()
  @Min(1)
  limit: number;
}
