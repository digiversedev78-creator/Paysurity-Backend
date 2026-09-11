import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, lte } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { AuditLogService } from '../audit-log/audit-log.service';

// Local stub â€” replaces phantom '@paysurity/database'
export const employeeSchedules = pgTable('employee_schedules', {
  id:           uuid('id').defaultRandom().primaryKey(),
  tenantId:     uuid('tenant_id').notNull(),
  employeeId:   uuid('employee_id').notNull(),
  scheduleDate: varchar('schedule_date', { length: 10 }).notNull(),
  startTime:    varchar('start_time',    { length: 8  }).notNull(),
  endTime:      varchar('end_time',      { length: 8  }).notNull(),
  shiftType:    varchar('shift_type',    { length: 20 }).notNull(),
  status:       varchar('status',        { length: 20 }).notNull(),
  notes:        text('notes'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

export const employees = pgTable('users', {
  id:       uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
});

export type NewEmployeeSchedule = typeof employeeSchedules.$inferInsert;
export type EmployeeSchedule    = typeof employeeSchedules.$inferSelect;

@Injectable()
export class EmployeeSchedulesService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  // â”€â”€â”€ createSchedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async createSchedule(tenantId: string, userId: string, data: any): Promise<EmployeeSchedule> {
    // Verify employee exists within tenant
    const emp = await (this.db as any).query.employees.findFirst(
      and(eq(employees.id, data.employeeId), eq(employees.tenantId, tenantId))
    );
    if (!emp) throw new NotFoundException(`Employee ${data.employeeId} not found in tenant ${tenantId}`);

    try {
      const [schedule] = await this.db
        .insert(employeeSchedules)
        .values({ ...data, tenantId, createdAt: new Date(), updatedAt: new Date() })
        .returning();

      (this.auditLogService as any).log(tenantId, 'CREATE', 'EmployeeSchedule', schedule.id, userId, schedule);
      return schedule;
    } catch (err: any) {
      throw new BadRequestException(`Failed to create schedule: ${err.message}`);
    }
  }

  // â”€â”€â”€ findSchedules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async findSchedules(tenantId: string, params: any): Promise<{ data: EmployeeSchedule[]; total: number }> {
    const { page = 1, limit = 10, employeeId, startDate, endDate } = params;
    const conditions: any[] = [eq(employeeSchedules.tenantId, tenantId)];
    if (employeeId) conditions.push(eq(employeeSchedules.employeeId, employeeId));
    if (startDate)  conditions.push(gte((employeeSchedules as any).scheduleDate, startDate));
    if (endDate)    conditions.push(lte((employeeSchedules as any).scheduleDate, endDate));

    const data = await (this.db as any).query.employeeSchedules.findMany({
      where: and(...conditions),
      limit,
      offset: (page - 1) * limit,
    });

    const [{ count }] = await (this.db
      .select()
      .from(employeeSchedules)
      .where(and(...conditions)) as any);

    return { data, total: count ?? data.length };
  }

  // â”€â”€â”€ findScheduleById â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async findScheduleById(tenantId: string, scheduleId: string): Promise<EmployeeSchedule> {
    const schedule = await (this.db as any).query.employeeSchedules.findFirst({
      where: and(eq(employeeSchedules.id, scheduleId), eq(employeeSchedules.tenantId, tenantId)),
    });
    if (!schedule) throw new NotFoundException(`Schedule ${scheduleId} not found`);
    return schedule;
  }

  // â”€â”€â”€ updateSchedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async updateSchedule(tenantId: string, userId: string, scheduleId: string, data: any): Promise<EmployeeSchedule> {
    const existing = await this.findScheduleById(tenantId, scheduleId);

    // If changing employee, verify the new employee exists
    if (data.employeeId && data.employeeId !== existing.employeeId) {
      const emp = await (this.db as any).query.employees.findFirst(
        and(eq(employees.id, data.employeeId), eq(employees.tenantId, tenantId))
      );
      if (!emp) throw new NotFoundException(`Employee ${data.employeeId} not found`);
    }

    const [updated] = await this.db
      .update(employeeSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(employeeSchedules.id, scheduleId), eq(employeeSchedules.tenantId, tenantId)))
      .returning();

    if (!updated) throw new NotFoundException(`Schedule ${scheduleId} not found after update`);

    (this.auditLogService as any).log(tenantId, 'UPDATE', 'EmployeeSchedule', scheduleId, userId, {
      previousData: existing,
      updatedData: updated,
    });
    return updated;
  }

  // â”€â”€â”€ deleteSchedule â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async deleteSchedule(tenantId: string, userId: string, scheduleId: string): Promise<{ message: string }> {
    const existing = await this.findScheduleById(tenantId, scheduleId);

    const [deleted] = await this.db
      .delete(employeeSchedules)
      .where(and(eq(employeeSchedules.id, scheduleId), eq(employeeSchedules.tenantId, tenantId)))
      .returning();

    if (!deleted) throw new NotFoundException(`Schedule ${scheduleId} could not be deleted`);

    (this.auditLogService as any).log(tenantId, 'DELETE', 'EmployeeSchedule', scheduleId, userId, { deletedData: existing });
    return { message: `Employee schedule with ID "${scheduleId}" deleted successfully.` };
  }

  // â”€â”€â”€ Legacy methods (used by EmployeeSchedulesController) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /** @deprecated use createSchedule instead */
  async create(data: NewEmployeeSchedule): Promise<EmployeeSchedule> {
    const [s] = await (this.db as any).insert(employeeSchedules)
      .values({ ...data, createdAt: new Date(), updatedAt: new Date() })
      .returning();
    return s;
  }

  async findAll(filters?: { employeeId?: string; startDate?: Date; endDate?: Date }): Promise<EmployeeSchedule[]> {
    const conds: any[] = [];
    if (filters?.employeeId) conds.push(eq(employeeSchedules.employeeId, filters.employeeId));
    if (filters?.startDate)  conds.push(gte((employeeSchedules as any).scheduleDate, filters.startDate));
    if (filters?.endDate)    conds.push(lte((employeeSchedules as any).scheduleDate, filters.endDate));
    return (this.db as any).select().from(employeeSchedules).where(and(...conds));
  }

  async findOne(id: string): Promise<EmployeeSchedule | undefined> {
    const [s] = await (this.db as any).select().from(employeeSchedules).where(eq(employeeSchedules.id, id));
    return s;
  }

  async update(id: string, data: Partial<NewEmployeeSchedule>): Promise<EmployeeSchedule> {
    const [s] = await (this.db as any).update(employeeSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employeeSchedules.id, id))
      .returning();
    if (!s) throw new NotFoundException(`Employee schedule with ID ${id} not found.`);
    return s;
  }

  async remove(id: string): Promise<EmployeeSchedule> {
    const [s] = await (this.db as any).delete(employeeSchedules).where(eq(employeeSchedules.id, id)).returning();
    if (!s) throw new NotFoundException(`Employee schedule with ID ${id} not found.`);
    return s;
  }
}




