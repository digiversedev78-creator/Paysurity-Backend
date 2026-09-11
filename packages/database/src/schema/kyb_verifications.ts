import { pgTable, varchar, timestamp, integer, text, index } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { merchantApplications } from './merchant_applications';

export const kybVerifications = pgTable('kyb_verifications', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => uuidv4()),
  applicationId: varchar('application_id', { length: 255 }).references(() => merchantApplications.id).notNull(),
  checkType: varchar('check_type', { length: 30 }).notNull(),
  provider: varchar('provider', { length: 30 }).default('STRIPE_IDENTITY').notNull(),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  providerSessionId: varchar('provider_session_id', { length: 255 }),
  providerReportRef: varchar('provider_report_ref', { length: 255 }),
  riskScore: integer('risk_score'),
  failureReason: text('failure_reason'),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  tenantId: varchar('tenant_id', { length: 255 }).notNull(),
}, (table) => {
  return {
    tenantIdIdx: index('kyb_verifications_tenant_id_idx').on(table.tenantId),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_KYB_VERIFICATIONS = `
ALTER TABLE kyb_verifications ENABLE ROW LEVEL SECURITY;
`;

