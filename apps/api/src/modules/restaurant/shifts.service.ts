import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pgTable, uuid, timestamp, varchar, numeric } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// CRITICAL RULE #9: AuditLogService
// Define a minimal interface to satisfy TypeScript without violating import rules.
// The actual implementation is expected to be provided via DI with the 'AUDIT_LOG_SERVICE' token.
interface AuditLogService {
    record(tenantId: string, payload: { userId?: string, action: string, details: any }): void;
}

// DTOs for request/response
interface ClockInDto {
    employeeId: string;
}

interface ClockOutDto {
    shiftId: string;
}

interface DistributeTipsDto {
    shiftId: string;
    totalTips: number;
}

interface GetShiftReportDto {
    startDate: Date;
    endDate: Date;
    employeeId?: string;
}

interface ShiftReportEntry {
    employeeId: string;
    employeeName: string;
    totalHoursWorked: number;
    totalOvertimeHours: number;
    totalTipsEarned: number;
}

// Drizzle Schema Definitions (CRITICAL RULE #7: UUID PKs, tenant_id)
// These are defined here to satisfy type safety requirements and adhere to the "no @paysurity/database" rule.
// In a real project, these would likely be in a shared schema file if allowed by import rules.

export const employees = pgTable('employees', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    // Add other employee fields as needed, e.g., role, email etc.
});

export const shifts = pgTable('shifts', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id').notNull(),
    employeeId: uuid('employee_id').notNull().references(() => employees.id),
    clockIn: timestamp('clock_in', { withTimezone: true }).notNull(),
    clockOut: timestamp('clock_out', { withTimezone: true }), // Nullable until shift is closed
    hoursWorked: numeric('hours_worked'), // Calculated after clock_out
    overtimeHours: numeric('overtime_hours'), // Calculated after clock_out
    tipsEarned: numeric('tips_earned').default('0'), // Tips attributed to this specific shift
});

export const tipDistributions = pgTable('tip_distributions', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id').notNull(),
    shiftId: uuid('shift_id').notNull().references(() => shifts.id),
    employeeId: uuid('employee_id').notNull().references(() => employees.id), // Employee who received the tip
    amount: numeric('amount').notNull(),
    distributedAt: timestamp('distributed_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tenantConfigs = pgTable('tenant_configs', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    tenantId: uuid('tenant_id').unique().notNull(), // One config per tenant
    overtimeThresholdHours: numeric('overtime_threshold_hours').default('40').notNull(),
    overtimeMultiplier: numeric('overtime_multiplier').default('1.5').notNull(),
    // Other tenant-specific configurations can go here
});

@Injectable()
export class ShiftsService {
    // CRITICAL RULE #2: Always use @Inject('DATABASE') private readonly db: NodePgDatabase<any>
    constructor(
        @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
        // CRITICAL RULE #9: AuditLogService
        @Inject('AUDIT_LOG_SERVICE') private readonly auditLogService: AuditLogService,
    ) {}

    // Helper to fetch tenant config
    private async getTenantConfig(tenantId: string) {
        // CRITICAL RULE #8: Use raw sql`` template literals
        const result = await (this.db as any).execute(sql`
            SELECT overtime_threshold_hours, overtime_multiplier
            FROM tenant_configs
            WHERE tenant_id = ${tenantId}
        `);

        if ((result as any).rows.length === 0) {
            // Provide sensible defaults or throw an error if config is mandatory (CRITICAL RULE #10)
            return { overtimeThresholdHours: 40, overtimeMultiplier: 1.5 }; // Default values
        }
        const config = (result as any).rows[0] as any;
        return {
            overtimeThresholdHours: parseFloat(config.overtime_threshold_hours),
            overtimeMultiplier: parseFloat(config.overtime_multiplier),
        };
    }

    // Overtime detection (part of close shift logic)
    private calculateOvertime(totalHours: number, overtimeThresholdHours: number): number {
        if (totalHours > overtimeThresholdHours) {
            return totalHours - overtimeThresholdHours;
        }
        return 0;
    }

    async openShift(tenantId: string, employeeId: string): Promise<typeof shifts.$inferSelect> {
        // Check if employee exists
        // CRITICAL RULE #8: Use raw sql`` template literals
        const employeeResult = await (this.db as any).execute(sql`
            SELECT id FROM employees
            WHERE id = ${employeeId} AND tenant_id = ${tenantId}
        `);

        if ((employeeResult as any).rows.length === 0) {
            throw new NotFoundException(`Employee with ID ${employeeId} not found for tenant ${tenantId}.`);
        }

        // Check for an existing open shift for this employee
        // CRITICAL RULE #8: Use raw sql`` template literals
        const openShiftResult = await (this.db as any).execute(sql`
            SELECT id FROM shifts
            WHERE employee_id = ${employeeId} AND tenant_id = ${tenantId} AND clock_out IS NULL
        `);

        if ((openShiftResult as any).rows.length > 0) {
            throw new BadRequestException(`Employee with ID ${employeeId} already has an open shift.`);
        }

        const clockInTime = new Date();
        // CRITICAL RULE #8: Use raw sql`` template literals
        const insertedShift = await (this.db as any).execute(sql`
            INSERT INTO shifts (tenant_id, employee_id, clock_in)
            VALUES (${tenantId}, ${employeeId}, ${clockInTime.toISOString()})
            RETURNING id, tenant_id, employee_id, clock_in, clock_out, hours_worked, overtime_hours, tips_earned
        `);

        // CRITICAL RULE #9: AuditLogService
        (this.auditLogService as any).record(tenantId, {
            userId: String(employeeId ?? ""),
            action: 'SHIFT_CLOCK_IN',
            details: { shiftId: ((insertedShift as any).rows[0] as any).id, clockIn: clockInTime.toISOString() },
        });

        return (insertedShift as any).rows[0] as any;
    }

    async closeShift(tenantId: string, shiftId: string): Promise<typeof shifts.$inferSelect> {
        // Fetch the shift
        // CRITICAL RULE #8: Use raw sql`` template literals
        const shiftResult = await (this.db as any).execute(sql`
            SELECT id, employee_id, clock_in, clock_out, hours_worked, overtime_hours, tips_earned
            FROM shifts
            WHERE id = ${shiftId} AND tenant_id = ${tenantId}
        `);

        if ((shiftResult as any).rows.length === 0) {
            throw new NotFoundException(`Shift with ID ${shiftId} not found for tenant ${tenantId}.`);
        }

        const shift = (shiftResult as any).rows[0] as any;

        if (shift.clock_out !== null) {
            throw new BadRequestException(`Shift with ID ${shiftId} is already closed.`);
        }

        const clockInDate = new Date(String(shift.clock_in));
        const clockOutDate = new Date();
        const durationMs = clockOutDate.getTime() - clockInDate.getTime();
        const totalHours = durationMs / (1000 * 60 * 60);

        // Fetch tenant config for overtime rules (CRITICAL RULE #10)
        const tenantConfig = await this.getTenantConfig(tenantId);
        const overtimeHours = this.calculateOvertime(totalHours, tenantConfig.overtimeThresholdHours);

        // CRITICAL RULE #8: Use raw sql`` template literals
        const updatedShift = await (this.db as any).execute(sql`
            UPDATE shifts
            SET clock_out = ${clockOutDate.toISOString()},
                hours_worked = ${totalHours.toFixed(2)},
                overtime_hours = ${overtimeHours.toFixed(2)}
            WHERE id = ${shiftId} AND tenant_id = ${tenantId}
            RETURNING id, tenant_id, employee_id, clock_in, clock_out, hours_worked, overtime_hours, tips_earned
        `);

        // CRITICAL RULE #9: AuditLogService
        (this.auditLogService as any).record(tenantId, {
            userId: String(shift.employee_id ?? ""),
            action: 'SHIFT_CLOCK_OUT',
            details: {
                shiftId: shiftId,
                clockOut: clockOutDate.toISOString(),
                totalHours: totalHours.toFixed(2),
                overtimeHours: overtimeHours.toFixed(2),
            },
        });

        return (updatedShift as any).rows[0] as any;
    }

    async distributeTips(tenantId: string, { shiftId, totalTips }: DistributeTipsDto): Promise<void> {
        if (totalTips <= 0) {
            throw new BadRequestException('Total tips must be a positive number.');
        }

        // Fetch the shift to ensure it exists, is closed, and get employeeId
        // CRITICAL RULE #8: Use raw sql`` template literals
        const shiftResult = await (this.db as any).execute(sql`
            SELECT id, employee_id, hours_worked, clock_out
            FROM shifts
            WHERE id = ${shiftId} AND tenant_id = ${tenantId} AND clock_out IS NOT NULL
        `);

        if ((shiftResult as any).rows.length === 0) {
            throw new NotFoundException(`Closed shift with ID ${shiftId} not found for tenant ${tenantId}.`);
        }

        const shift = (shiftResult as any).rows[0] as any;
        const employeeId = shift.employee_id;
        const hoursWorked = parseFloat(shift.hours_worked as string);

        if (!hoursWorked || hoursWorked <= 0) {
             throw new BadRequestException(`Shift ${shiftId} has no recorded hours worked, cannot distribute tips proportionally.`);
        }

        // For simplicity, we distribute all tips to the employee who worked this specific shift.
        // A more complex tip pooling system would involve distributing tips across multiple employees/shifts
        // based on hours worked, roles, etc.
        const tipAmount = totalTips;

        await (this.db as any).transaction(async (tx) => {
            // Update tips earned for the shift by adding the new tips
            // CRITICAL RULE #8: Use raw sql`` template literals
            await tx.execute(sql`
                UPDATE shifts
                SET tips_earned = (CAST(COALESCE(tips_earned, '0') AS NUMERIC) + ${tipAmount.toFixed(2)})
                WHERE id = ${shiftId} AND tenant_id = ${tenantId}
            `);

            // Insert into tip_distributions
            // CRITICAL RULE #8: Use raw sql`` template literals
            await tx.execute(sql`
                INSERT INTO tip_distributions (tenant_id, shift_id, employee_id, amount)
                VALUES (${tenantId}, ${shiftId}, ${employeeId}, ${tipAmount.toFixed(2)})
            `);
        });

        // CRITICAL RULE #9: AuditLogService
        (this.auditLogService as any).record(tenantId, {
            userId: String(employeeId ?? ""),
            action: 'TIPS_DISTRIBUTED',
            details: { shiftId: shiftId, totalTips: totalTips, distribution: [{ employeeId: employeeId, amount: tipAmount.toFixed(2) }] },
        });
    }

    async getShiftReport(
        tenantId: string,
        { startDate, endDate, employeeId }: GetShiftReportDto,
    ): Promise<ShiftReportEntry[]> {
        // CRITICAL RULE #8: Use raw sql`` template literals
        const query = sql`
            SELECT
                e.id AS employee_id,
                e.name AS employee_name,
                SUM(CAST(COALESCE(s.hours_worked, '0') AS NUMERIC)) AS total_hours_worked,
                SUM(CAST(COALESCE(s.overtime_hours, '0') AS NUMERIC)) AS total_overtime_hours,
                SUM(CAST(COALESCE(s.tips_earned, '0') AS NUMERIC)) AS total_tips_earned
            FROM shifts s
            JOIN employees e ON s.employee_id = e.id
            WHERE s.tenant_id = ${tenantId}
            AND s.clock_in >= ${startDate.toISOString()}
            AND s.clock_out <= ${endDate.toISOString()}
            ${employeeId ? sql`AND s.employee_id = ${employeeId}` : sql``}
            GROUP BY e.id, e.name
            ORDER BY e.name;
        `;

        const result = await (this.db as any).execute(query);

        return (result as any).rows.map((row: any) => ({
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            totalHoursWorked: parseFloat(row.total_hours_worked || '0'),
            totalOvertimeHours: parseFloat(row.total_overtime_hours || '0'),
            totalTipsEarned: parseFloat(row.total_tips_earned || '0'),
        }));
    }
}




