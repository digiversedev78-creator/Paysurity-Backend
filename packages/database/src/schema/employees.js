import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
// ─── Employees ────────────────────────────────────────────────────────────────
export const employees = pgTable('employees', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id'),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    email: text('email').notNull(),
    phone: varchar('phone', { length: 30 }),
    role: varchar('role', { length: 80 }),
    department: varchar('department', { length: 100 }),
    hourlyRate: integer('hourly_rate'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    salary: integer('salary'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    employmentType: varchar('employment_type', { length: 50 }).default('FULL_TIME'),
    status: varchar('status', { length: 50 }).default('ACTIVE'),
    hireDate: timestamp('hire_date'),
    terminationDate: timestamp('termination_date'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('employees_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Employee Schedules ───────────────────────────────────────────────────────
export const employee_schedules = pgTable('employee_schedules', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    employeeId: uuid('employee_id').notNull(),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time').notNull(),
    shiftType: varchar('shift_type', { length: 50 }).default('REGULAR'),
    notes: text('notes'),
    isPublished: boolean('is_published').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('employee_schedules_tenant_id_idx').on(table.tenantId),
    };
});
// ─── Clock Events (Time & Attendance) ────────────────────────────────────────
export const clock_events = pgTable('clock_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    employeeId: uuid('employee_id').notNull(),
    eventType: varchar('event_type', { length: 30 }).notNull(), // CLOCK_IN | CLOCK_OUT | BREAK_START | BREAK_END
    eventTime: timestamp('event_time').defaultNow(),
    locationLat: integer('location_lat'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    locationLng: integer('location_lng'), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
    deviceId: varchar('device_id', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('clock_events_tenant_id_idx').on(table.tenantId),
    };
});
//# sourceMappingURL=employees.js.map