/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-011 -- Employee Schedule
 * FILE TYPE:    DTO
 * MODULE:       employees
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-069
 * GENERATED:    2026-03-17T13:09:22.417Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsDateString, IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, Matches, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums for shift type and status
export enum ShiftType {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  NIGHT = 'Night',
  DAY_OFF = 'Day Off',
  CUSTOM = 'Custom',
}

export enum ScheduleStatus {
  SCHEDULED = 'Scheduled',
  CONFIRMED = 'Confirmed',
  CANCELED = 'Canceled',
  COMPLETED = 'Completed',
}

export class CreateEmployeeScheduleDto {
  @ApiProperty({ description: 'The UUID of the employee this schedule belongs to.' })
  @IsUUID('4', { message: 'employeeId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'employeeId is required.' })
  employeeId: string;

  @ApiProperty({ description: 'The date of the schedule in YYYY-MM-DD format.' })
  @IsDateString({ strict: true }, { message: 'scheduleDate must be a valid date string in YYYY-MM-DD format.' })
  @IsNotEmpty({ message: 'scheduleDate is required.' })
  scheduleDate: string; // YYYY-MM-DD

  @ApiProperty({ description: 'The start time of the shift in HH:MM format (24-hour).', example: '09:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:MM format.' })
  @IsNotEmpty({ message: 'startTime is required.' })
  startTime: string; // HH:MM

  @ApiProperty({ description: 'The end time of the shift in HH:MM format (24-hour).', example: '17:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:MM format.' })
  @IsNotEmpty({ message: 'endTime is required.' })
  endTime: string; // HH:MM

  @ApiProperty({ enum: ShiftType, description: 'The type of shift.' })
  @IsEnum(ShiftType, { message: 'Invalid shift type.' })
  @IsNotEmpty({ message: 'shiftType is required.' })
  shiftType: ShiftType;

  @ApiPropertyOptional({ enum: ScheduleStatus, description: 'The status of the schedule.', default: ScheduleStatus.SCHEDULED })
  @IsEnum(ScheduleStatus, { message: 'Invalid schedule status.' })
  @IsOptional()
  status?: ScheduleStatus = ScheduleStatus.SCHEDULED;

  @ApiPropertyOptional({ description: 'Optional notes for the schedule.' })
  @IsString({ message: 'notes must be a string.' })
  @Length(0, 500, { message: 'notes cannot exceed 500 characters.' })
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeScheduleDto {
  @ApiPropertyOptional({ description: 'The UUID of the employee this schedule belongs to.' })
  @IsUUID('4', { message: 'employeeId must be a valid UUID v4.' })
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'The date of the schedule in YYYY-MM-DD format.' })
  @IsDateString({ strict: true }, { message: 'scheduleDate must be a valid date string in YYYY-MM-DD format.' })
  @IsOptional()
  scheduleDate?: string;

  @ApiPropertyOptional({ description: 'The start time of the shift in HH:MM format (24-hour).', example: '09:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:MM format.' })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'The end time of the shift in HH:MM format (24-hour).', example: '17:00' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:MM format.' })
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ enum: ShiftType, description: 'The type of shift.' })
  @IsEnum(ShiftType, { message: 'Invalid shift type.' })
  @IsOptional()
  shiftType?: ShiftType;

  @ApiPropertyOptional({ enum: ScheduleStatus, description: 'The status of the schedule.' })
  @IsEnum(ScheduleStatus, { message: 'Invalid schedule status.' })
  @IsOptional()
  status?: ScheduleStatus;

  @ApiPropertyOptional({ description: 'Optional notes for the schedule.' })
  @IsString({ message: 'notes must be a string.' })
  @Length(0, 500, { message: 'notes cannot exceed 500 characters.' })
  @IsOptional()
  notes?: string;
}

export class EmployeeScheduleQueryParamsDto {
  @ApiPropertyOptional({ description: 'Filter schedules by employee UUID.' })
  @IsUUID('4', { message: 'employeeId must be a valid UUID v4.' })
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Filter schedules from this start date (YYYY-MM-DD).' })
  @IsDateString({ strict: true }, { message: 'startDate must be a valid date string in YYYY-MM-DD format.' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter schedules up to this end date (YYYY-MM-DD).' })
  @IsDateString({ strict: true }, { message: 'endDate must be a valid date string in YYYY-MM-DD format.' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: ShiftType, description: 'Filter schedules by shift type.' })
  @IsEnum(ShiftType, { message: 'Invalid shift type.' })
  @IsOptional()
  shiftType?: ShiftType;

  @ApiPropertyOptional({ enum: ScheduleStatus, description: 'Filter schedules by status.' })
  @IsEnum(ScheduleStatus, { message: 'Invalid schedule status.' })
  @IsOptional()
  status?: ScheduleStatus;

  @ApiPropertyOptional({ description: 'Page number for pagination.', default: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page.', default: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}
