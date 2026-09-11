import { pgTable, uuid, text, timestamp, index, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const auditActionEnum = pgEnum('audit_action_type', ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN']);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  action: auditActionEnum('action').notNull(),
  userId: text('user_id').notNull(),
  details: text('details'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('audit_logs_tenant_id_idx').on(table.tenantId),
  };
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
