import { pgTable, varchar, timestamp, integer, text, boolean } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { merchantApplications } from './merchant_applications';
import { tenants } from './tenants';

export const onboardingWorkspaces = pgTable('onboarding_workspaces', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => uuidv4()),
  tenantId: varchar('tenant_id', { length: 255 }).references(() => tenants.id).notNull().unique(),
  applicationId: varchar('application_id', { length: 255 }).references(() => merchantApplications.id).notNull(),
  assignedCsm: varchar('assigned_csm', { length: 255 }),
  currentPhase: integer('current_phase').default(1).notNull(),
  phase1Complete: boolean('phase1_complete').default(false).notNull(),
  phase2Complete: boolean('phase2_complete').default(false).notNull(),
  phase3Complete: boolean('phase3_complete').default(false).notNull(),
  phase4Complete: boolean('phase4_complete').default(false).notNull(),
  phase5Complete: boolean('phase5_complete').default(false).notNull(),
  goLiveDate: timestamp('go_live_date', { mode: 'string' }),
  hyperCareEndsAt: timestamp('hyper_care_ends_at', { mode: 'string' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

