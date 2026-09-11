import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

// ─── Shifts ───────────────────────────────────────────────────────────────────
export const shifts = pgTable('shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  locationId: uuid('location_id'), // Multi-location link
  employeeId: uuid('employee_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  plannedDurationMinutes: integer('planned_duration_minutes'),
  actualDurationMinutes: integer('actual_duration_minutes'),
  status: varchar('status', { length: 30 }).default('SCHEDULED'), // SCHEDULED | IN_PROGRESS | COMPLETED | NO_SHOW | CANCELLED
  breakMinutes: integer('break_minutes').default(0),
  overtimeMinutes: integer('overtime_minutes').default(0),
  stationId: uuid('station_id'),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('shifts_tenant_id_idx').on(table.tenantId),
  };
});

// ─── Shift Templates ──────────────────────────────────────────────────────────
export const shift_templates = pgTable('shift_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  startHour: integer('start_hour').notNull(),
  startMinute: integer('start_minute').default(0),
  durationMinutes: integer('duration_minutes').notNull(),
  daysOfWeek: jsonb('days_of_week'), // [0,1,2,3,4,5,6] sun-sat
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('shift_templates_tenant_id_idx').on(table.tenantId),
  };
});

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type ShiftTemplate = typeof shift_templates.$inferSelect;

