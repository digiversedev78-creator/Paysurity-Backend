/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-011 -- Employee Schedule
 * FILE TYPE:    SERVICE
 * MODULE:       employees
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-069
 * GENERATED:    2026-03-17T13:09:22.416Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
// drizzle-orm imports not strictly needed for raw SQL queries, but keeping for schema type definitions if used for type safety for table names/columns
import { and } from 'drizzle-orm';
// NodePgDatabase needs to be imported for type definition.
// This specific import path might vary slightly based on actual Drizzle setup,
// but for a Node.js PostgreSQL database with Drizzle, `pg-core` is common for types.
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; 
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs

import { AuditLogService } from '../audit-log/audit-log.service'; // Assuming AuditLogService path
import {  CreateEmployeeScheduleDto, ShiftType, ScheduleStatus  } from './dto/employee-schedule.dto'; type ClockInOutDto = any; type GetEmployeeHoursDto = any;
// Adjust schema path

// Define a type for a shift record retrieved from the database
interface EmployeeShift {
  id: string;
  tenantId: string;
  employeeId: string;
  scheduledStartTime: Date; // Renamed for clarity, matches DTO 'scheduledDate' + 'startTime'
  scheduledEndTime: Date;   // Renamed for clarity, matches DTO 'scheduledDate' + 'endTime'
  role: ShiftType;
  clockInTime: Date | null;
  clockOutTime: Date | null;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for reporting hours
interface WeeklyHoursReport {
  weekStart: Date;
  weekEnd: Date;
  totalHours: number;
  isOvertime: boolean;
}

interface EmployeeHoursReport {
  employeeId: string;
  totalHoursPayPeriod: number;
  weeklyBreakdown: WeeklyHoursReport[];
}


@Injectable()
export class EmployeeSchedulesService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Helper to execute raw SQL queries as required.
   * This method assumes `(this.db as any).execute(sqlQuery, params)` is the correct way
   * to run raw SQL with parameters on the injected Drizzle NodePgDatabase instance.
   * It is assumed `execute` returns an object with a `rows` array (like node-postgres client)
   * or directly an array of results.
   * @param sqlQuery The SQL query string.
   * @param params An array of parameters for the query.
   * @returns The result of the query execution.
   */
  private async executeRawSql(sqlQuery: string, params: any[] = []): Promise<any> {
    try {
      const result = await (this.db as any).execute(sqlQuery, params);
      return (result as any).rows || result; // Return rows array if available, otherwise the direct result
    } catch (error) {
      console.error('Database raw SQL execution error:', error);
      throw new InternalServerErrorException('Database operation failed.');
    }
  }

  // Helper to ensure employee exists for tenant
  private async ensureEmployeeExists(tenantId: string, employeeId: string): Promise<void> {
    const employeeQuery = `
      SELECT id FROM employees
      WHERE id = $1 AND tenant_id = $2;
    `;
    const employeeResult = await this.executeRawSql(employeeQuery, [employeeId, tenantId]);
    if (!employeeResult || employeeResult.length === 0) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found for tenant ${tenantId}.`);
    }
  }

  /**
   * Creates a new employee shift schedule.
   * @param tenantId The ID of the tenant.
   * @param createShiftDto The DTO containing shift details.
   * @returns The created EmployeeShift object.
   */
  async createShift(tenantId: string, createShiftDto: CreateEmployeeScheduleDto): Promise<EmployeeShift> {
    const { employeeId, scheduledDate, startTime, endTime, role  } = (createShiftDto as any);

    await this.ensureEmployeeExists(tenantId, employeeId);

    // Combine date and time strings into Date objects. Assuming UTC for consistency.
    const scheduledStartTime = new Date(`${scheduledDate}T${startTime}:00.000Z`); 
    const scheduledEndTime = new Date(`${scheduledDate}T${endTime}:00.000Z`);

    if (isNaN(scheduledStartTime.getTime()) || isNaN(scheduledEndTime.getTime())) {
      throw new BadRequestException('Invalid date or time format provided. Use YYYY-MM-DD for date and HH:MM for time.');
    }
    if (scheduledStartTime >= scheduledEndTime) {
      throw new BadRequestException('Shift start time must be strictly before end time.');
    }

    // Validate for overlapping shifts for the same employee
    const overlapQuery = `
      SELECT id FROM employee_schedules
      WHERE tenant_id = $1
        AND employee_id = $2
        AND (
              ($3, $4) OVERLAPS (scheduled_start_time, scheduled_end_time)
           )
      LIMIT 1;
    `;
    const overlapResult = await this.executeRawSql(overlapQuery, [tenantId, employeeId, scheduledStartTime.toISOString(), scheduledEndTime.toISOString()]);

    if (overlapResult && overlapResult.length > 0) {
      throw new BadRequestException(`Employee ${employeeId} already has an overlapping shift (ID: ${overlapResult[0].id}).`);
    }

    const newShiftId = uuidv4();
    const now = new Date();
    const insertQuery = `
      INSERT INTO employee_schedules (id, tenant_id, employee_id, scheduled_start_time, scheduled_end_time, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, tenant_id, employee_id, scheduled_start_time, scheduled_end_time, role, clock_in_time, clock_out_time, status, created_at, updated_at;
    `;
    const params = [
      newShiftId,
      tenantId,
      employeeId,
      scheduledStartTime.toISOString(),
      scheduledEndTime.toISOString(),
      role,
      (ScheduleStatus as any).SCHEDULED,
      now.toISOString(),
      now.toISOString(),
    ];

    const [createdShift] = await this.executeRawSql(insertQuery, params);

    if (!createdShift) {
      throw new InternalServerErrorException('Failed to create shift schedule.');
    }

    (this.auditLogService as any).logActivity(tenantId, employeeId, 'EMPLOYEE_SHIFT_CREATED', `Shift ${newShiftId} created for employee ${employeeId}.`);

    return this.mapToEmployeeShift(createdShift);
  }

  /**
   * Handles an employee clock-in event for a specific shift.
   * @param tenantId The ID of the tenant.
   * @param clockInOutDto The DTO containing shift ID and clock-in timestamp.
   * @returns The updated EmployeeShift object.
   */
  async clockIn(tenantId: string, clockInOutDto: ClockInOutDto): Promise<EmployeeShift> {
    const { shiftId, timestamp } = clockInOutDto;

    const clockInTime = new Date(timestamp);
    if (isNaN(clockInTime.getTime())) {
      throw new BadRequestException('Invalid timestamp format provided.');
    }

    const selectShiftQuery = `
      SELECT id, employee_id, clock_in_time, scheduled_start_time
      FROM employee_schedules
      WHERE id = $1 AND tenant_id = $2;
    `;
    const [existingShift] = await this.executeRawSql(selectShiftQuery, [shiftId, tenantId]);

    if (!existingShift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found for tenant ${tenantId}.`);
    }
    if (existingShift.clock_in_time) {
      throw new BadRequestException(`Shift ${shiftId} has already been clocked in.`);
    }

    const now = new Date();
    const updateQuery = `
      UPDATE employee_schedules
      SET clock_in_time = $3, status = $4, updated_at = $5
      WHERE id = $1 AND tenant_id = $2
      RETURNING id, tenant_id, employee_id, scheduled_start_time, scheduled_end_time, role, clock_in_time, clock_out_time, status, created_at, updated_at;
    `;
    const params = [
      shiftId,
      tenantId,
      clockInTime.toISOString(),
      (ScheduleStatus as any).CLOCKED_IN,
      now.toISOString(),
    ];

    const [updatedShift] = await this.executeRawSql(updateQuery, params);

    if (!updatedShift) {
      throw new InternalServerErrorException('Failed to record clock-in.');
    }

    (this.auditLogService as any).logActivity(tenantId, existingShift.employee_id, 'EMPLOYEE_SHIFT_CLOCK_IN', `Employee ${existingShift.employee_id} clocked into shift ${shiftId}.`);

    return this.mapToEmployeeShift(updatedShift);
  }

  /**
   * Handles an employee clock-out event for a specific shift.
   * @param tenantId The ID of the tenant.
   * @param clockInOutDto The DTO containing shift ID and clock-out timestamp.
   * @returns The updated EmployeeShift object.
   */
  async clockOut(tenantId: string, clockInOutDto: ClockInOutDto): Promise<EmployeeShift> {
    const { shiftId, timestamp } = clockInOutDto;

    const clockOutTime = new Date(timestamp);
    if (isNaN(clockOutTime.getTime())) {
      throw new BadRequestException('Invalid timestamp format provided.');
    }

    const selectShiftQuery = `
      SELECT id, employee_id, clock_in_time, clock_out_time
      FROM employee_schedules
      WHERE id = $1 AND tenant_id = $2;
    `;
    const [existingShift] = await this.executeRawSql(selectShiftQuery, [shiftId, tenantId]);

    if (!existingShift) {
      throw new NotFoundException(`Shift with ID ${shiftId} not found for tenant ${tenantId}.`);
    }
    if (!existingShift.clock_in_time) {
      throw new BadRequestException(`Shift ${shiftId} has not been clocked in yet.`);
    }
    if (existingShift.clock_out_time) {
      throw new BadRequestException(`Shift ${shiftId} has already been clocked out.`);
    }
    if (clockOutTime < new Date(existingShift.clock_in_time)) {
        throw new BadRequestException('Clock-out time cannot be before clock-in time.');
    }


    const now = new Date();
    const updateQuery = `
      UPDATE employee_schedules
      SET clock_out_time = $3, status = $4, updated_at = $5
      WHERE id = $1 AND tenant_id = $2
      RETURNING id, tenant_id, employee_id, scheduled_start_time, scheduled_end_time, role, clock_in_time, clock_out_time, status, created_at, updated_at;
    `;
    const params = [
      shiftId,
      tenantId,
      clockOutTime.toISOString(),
      (ScheduleStatus as any).COMPLETED, // Set status to completed upon clock-out
      now.toISOString(),
    ];

    const [updatedShift] = await this.executeRawSql(updateQuery, params);

    if (!updatedShift) {
      throw new InternalServerErrorException('Failed to record clock-out.');
    }

    (this.auditLogService as any).logActivity(tenantId, existingShift.employee_id, 'EMPLOYEE_SHIFT_CLOCK_OUT', `Employee ${existingShift.employee_id} clocked out from shift ${shiftId}.`);

    return this.mapToEmployeeShift(updatedShift);
  }

  /**
   * Calculates hours worked for a specific employee within a given week.
   * Used as a helper for pay period calculations.
   * @param tenantId The ID of the tenant.
   * @param employeeId The ID of the employee.
   * @param weekStart The start date of the week (inclusive).
   * @param weekEnd The end date of the week (exclusive, typically weekStart + 7 days).
   * @returns The total hours worked in that week.
   */
  private async calculateWeeklyHours(tenantId: string, employeeId: string, weekStart: Date, weekEnd: Date): Promise<number> {
    const query = `
      SELECT clock_in_time, clock_out_time
      FROM employee_schedules
      WHERE tenant_id = $1
        AND employee_id = $2
        AND clock_in_time IS NOT NULL
        AND clock_out_time IS NOT NULL
        AND scheduled_start_time >= $3
        AND scheduled_start_time < $4;
    `;
    const params = [tenantId, employeeId, weekStart.toISOString(), weekEnd.toISOString()];
    const shifts = await this.executeRawSql(query, params);

    let totalMilliseconds = 0;
    for (const shift of shifts) {
      const clockIn = new Date(shift.clock_in_time);
      const clockOut = new Date(shift.clock_out_time);
      if (clockOut > clockIn) { // Ensure clock-out is after clock-in
        totalMilliseconds += (clockOut.getTime() - clockIn.getTime());
      }
    }
    return totalMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
  }

  /**
   * Calculates total hours worked per pay period for an employee, including weekly overtime flags.
   * Overtime is flagged for any week where total hours exceed 40.
   * @param tenantId The ID of the tenant.
   * @param getHoursDto DTO containing employee ID, pay period start and end dates.
   * @returns An EmployeeHoursReport object.
   */
  async getEmployeeHoursForPayPeriod(tenantId: string, getHoursDto: GetEmployeeHoursDto): Promise<EmployeeHoursReport> {
    const { employeeId, startDate, endDate } = getHoursDto;

    await this.ensureEmployeeExists(tenantId, employeeId);

    const payPeriodStart = new Date(startDate);
    const payPeriodEnd = new Date(endDate); 

    if (isNaN(payPeriodStart.getTime()) || isNaN(payPeriodEnd.getTime())) {
      throw new BadRequestException('Invalid start or end date format provided for pay period.');
    }
    if (payPeriodStart > payPeriodEnd) { // Changed to > for strictness
      throw new BadRequestException('Pay period start date must be before or equal to end date.');
    }

    const weeklyBreakdown: WeeklyHoursReport[] = [];
    let currentWeekStart = new Date(payPeriodStart);
    currentWeekStart.setUTCHours(0, 0, 0, 0); // Normalize to start of day UTC for weekly calculation

    let totalHoursPayPeriod = 0;

    // Iterate week by week within the pay period
    while (currentWeekStart <= payPeriodEnd) {
      // Calculate the end of the current 7-day week period.
      const nextWeekStartCandidate = new Date(currentWeekStart);
      nextWeekStartCandidate.setDate(currentWeekStart.getDate() + 7);

      // The actual end for the `calculateWeeklyHours` function (exclusive).
      // This is either the natural end of the 7-day week, or the day after the `payPeriodEnd`
      // if `payPeriodEnd` falls within the current week, to ensure `payPeriodEnd` is inclusive.
      const weekEndForCalculation = nextWeekStartCandidate <= payPeriodEnd 
                                      ? nextWeekStartCandidate 
                                      : new Date(payPeriodEnd.getTime());
      weekEndForCalculation.setUTCHours(23, 59, 59, 999); // Ensure it covers up to end of payPeriodEnd day

      // For reporting purposes, the week's end should not exceed the pay period end.
      let effectiveWeekEndReport = new Date(currentWeekStart);
      effectiveWeekEndReport.setDate(currentWeekStart.getDate() + 6); // End of the 7-day week for reporting
      effectiveWeekEndReport.setUTCHours(23, 59, 59, 999); // End of day UTC
      
      if (effectiveWeekEndReport > payPeriodEnd) {
          effectiveWeekEndReport = payPeriodEnd;
      }

      const hoursThisWeek = await this.calculateWeeklyHours(tenantId, employeeId, currentWeekStart, weekEndForCalculation);

      const isOvertime = hoursThisWeek > 40;
      weeklyBreakdown.push({
        weekStart: new Date(currentWeekStart),
        weekEnd: new Date(effectiveWeekEndReport),
        totalHours: parseFloat(hoursThisWeek.toFixed(2)),
        isOvertime: isOvertime,
      });

      totalHoursPayPeriod += hoursThisWeek;
      
      // Move to the start of the next 7-day period
      currentWeekStart = nextWeekStartCandidate;
      currentWeekStart.setUTCHours(0, 0, 0, 0); // Ensure it's the start of the day
    }
    
    (this.auditLogService as any).logActivity(tenantId, employeeId, 'EMPLOYEE_HOURS_REPORT_GENERATED', `Hours report generated for employee ${employeeId} for period ${startDate} to ${endDate}.`);

    return {
      employeeId: employeeId,
      totalHoursPayPeriod: parseFloat(totalHoursPayPeriod.toFixed(2)),
      weeklyBreakdown: weeklyBreakdown,
    };
  }

  // Helper to map raw database result (snake_case) to EmployeeShift interface (camelCase)
  private mapToEmployeeShift(raw: any): EmployeeShift {
    return {
      id: raw.id,
      tenantId: raw.tenant_id,
      employeeId: raw.employee_id,
      scheduledStartTime: new Date(raw.scheduled_start_time),
      scheduledEndTime: new Date(raw.scheduled_end_time),
      role: raw.role as ShiftType,
      clockInTime: raw.clock_in_time ? new Date(raw.clock_in_time) : null,
      clockOutTime: raw.clock_out_time ? new Date(raw.clock_out_time) : null,
      status: raw.status as ScheduleStatus,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    };
  }

  // You can add more methods here to complete the CRUD for employee schedules,
  // e.g., `findOne`, `findAll`, `update`, `remove`, as per `UpdateEmployeeScheduleDto` and `EmployeeScheduleQueryParamsDto`
  // mentioned in the existing imports.

  // Example findOne method (if needed for context)
  async findOne(tenantId: string, id: string): Promise<EmployeeShift | null> {
    const query = `
      SELECT id, tenant_id, employee_id, scheduled_start_time, scheduled_end_time, role, clock_in_time, clock_out_time, status, created_at, updated_at
      FROM employee_schedules
      WHERE id = $1 AND tenant_id = $2;
    `;
    const [shift] = await this.executeRawSql(query, [id, tenantId]);
    if (!shift) {
      return null;
    }
    return this.mapToEmployeeShift(shift);
  }
}






