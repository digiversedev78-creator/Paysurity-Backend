import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';


export const internalRoleEnum = pgEnum('internal_role', ['SUPER_ADMIN', 'CSR']);
export const supportTicketStatusEnum = pgEnum('support_ticket_status', ['OPEN', 'PENDING', 'ESCALATED', 'CLOSED']);
export const systemHealthStatusEnum = pgEnum('system_health_status', ['GREEN', 'YELLOW', 'RED']);

export const internalUsers = pgTable('internal_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  role: internalRoleEnum('role').notNull().default('CSR'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const csrSpecialties = pgTable('csr_specialties', {
  id: uuid('id').primaryKey().defaultRandom(),
  internalUserId: uuid('internal_user_id').notNull().references(() => internalUsers.id),
  vertical: varchar('vertical', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const supportTickets = pgTable('support_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  csrId: uuid('csr_id').references(() => internalUsers.id),
  status: supportTicketStatusEnum('status').notNull().default('OPEN'),
  issueContext: text('issue_context').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
}, (table) => {
  return {
    tenantIdIdx: index('support_tickets_tenant_id_idx').on(table.tenantId),
  };
});

export const systemHealthLogs = pgTable('system_health_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  component: varchar('component', { length: 100 }).notNull(),
  pingLatencyMs: integer('ping_latency_ms').notNull(),
  status: systemHealthStatusEnum('status').notNull(),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  internalUserId: uuid('internal_user_id').notNull().references(() => internalUsers.id),
  tenantId: uuid('tenant_id'), // optional since it could be global action
  action: varchar('action', { length: 255 }).notNull(),
  details: jsonb('details').default({}),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('admin_audit_logs_tenant_id_idx').on(table.tenantId),
  };
});

