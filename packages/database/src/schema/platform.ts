import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, index, pgEnum } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

export const audit_logs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  userId: uuid('user_id'),
  action: text('action').notNull(),
  resource: text('resource'),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  isImpersonating: boolean('is_impersonating').default(false),
  originalUserId: uuid('original_user_id'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('audit_logs_tenant_id_idx').on(table.tenantId),
  };
});

export const auditLogs = audit_logs;

export const affiliates = pgTable('affiliates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  status: text('status').default('PENDING'),
  commissionRateBps: integer('commission_rate_bps').default(500),
  createdAt: timestamp('created_at').defaultNow(),
});

export const driverStatusEnum = pgEnum('driver_status', ['available', 'on-load', 'off-duty', 'inactive', 'INACTIVE']);

export const delivery_drivers = pgTable('delivery_drivers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  cdlNumber: text('cdl_number'),
  cdlExpiryDate: timestamp('cdl_expiry_date'),
  insuranceProvider: text('insurance_provider'),
  insurancePolicyNumber: text('insurance_policy_number'),
  insuranceExpiryDate: timestamp('insurance_expiry_date'),
  status: driverStatusEnum('status').default('off-duty'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('delivery_drivers_tenant_id_idx').on(table.tenantId),
  };
});

export const deliveryDrivers = delivery_drivers;

export const ai_chat_sessions = pgTable('ai_chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  sessionId: text('session_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('ai_chat_sessions_tenant_id_idx').on(table.tenantId),
  };
});

export const aiChatSessions = ai_chat_sessions;

export const ai_chat_messages = pgTable('ai_chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => ai_chat_sessions.id),
  role: text('role').notNull(), // user | bot
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiChatMessages = ai_chat_messages;

export const webhook_events = pgTable('webhook_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload'),
  status: text('status').default('PENDING'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('webhook_events_tenant_id_idx').on(table.tenantId),
  };
});

export const webhookEvents = webhook_events;

export const logs = pgTable('logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: text('level').notNull(), // INFO | WARN | ERROR
  service: text('service'),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type AuditLog = typeof audit_logs.$inferSelect;
export type Affiliate = typeof affiliates.$inferSelect;
export type DeliveryDriver = typeof delivery_drivers.$inferSelect;
export type WebhookEvent = typeof webhook_events.$inferSelect;

