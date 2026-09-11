import { IsUUID, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsString, Matches, IsNumber, Min, Max, IsIn } from 'class-validator';

import { Type } from 'class-transformer';

export enum ShiftType {
  REGULAR = 'REGULAR',
  OVERTIME = 'OVERTIME',
  BREAK = 'BREAK',
  OFF = 'OFF',
  VACATION = 'VACATION',
  SICK = 'SICK',
  TRAINING = 'TRAINING',
  FLEX = 'FLEX',
}

export enum ScheduleStatus {
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  MODIFIED = 'MODIFIED',
  PUBLISHED = 'PUBLISHED',
}

export class CreateEmployeeScheduleDto {
  @IsUUID()
  @IsNotEmpty()
  employeeId: string; // Foreign key to employee

  @IsDateString() // YYYY-MM-DD format for date
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:MM format' })
  startTime: string; // Time in HH:MM format

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:MM format' })
  endTime: string; // Time in HH:MM format

  @IsEnum(ShiftType)
  @IsNotEmpty()
  shiftType: ShiftType;

  @IsEnum(ScheduleStatus)
  @IsNotEmpty()
  scheduleStatus: ScheduleStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string; // Optional foreign key to location
}

export class UpdateEmployeeScheduleDto extends (class {} as any) {}

export class EmployeeScheduleQueryParamsDto {
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string; // Filter schedules from this date (YYYY-MM-DD)

  @IsOptional()
  @IsDateString()
  endDate?: string; // Filter schedules up to this date (YYYY-MM-DD)

  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  scheduleStatus?: ScheduleStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Default limit for pagination

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0; // Default offset for pagination

  @IsOptional()
  @IsString()
  @IsIn(['date', 'employeeId', 'startTime', 'endTime', 'shiftType', 'scheduleStatus'])
  sortField?: string = 'date'; // Field to sort by

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC'; // Sort order
}


