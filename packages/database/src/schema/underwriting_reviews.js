import { pgTable, varchar, timestamp, integer, text, jsonb, index } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { merchantApplications } from './merchant_applications';
export const underwritingReviews = pgTable('underwriting_reviews', {
    id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => uuidv4()),
    applicationId: varchar('application_id', { length: 255 }).references(() => merchantApplications.id).notNull().unique(),
    reviewerUserId: varchar('reviewer_user_id', { length: 255 }),
    riskCategory: varchar('risk_category', { length: 20 }),
    mccCode: varchar('mcc_code', { length: 4 }),
    processingVolumeEstimateCents: integer('processing_volume_estimate_cents'),
    avgTicketEstimateCents: integer('avg_ticket_estimate_cents'),
    cardPresentPct: integer('card_present_pct'),
    chargebackReservePct: integer('chargeback_reserve_pct').default(0),
    payoutDelayDays: integer('payout_delay_days').default(2),
    approvedPlanCode: varchar('approved_plan_code', { length: 20 }),
    conditions: jsonb('conditions'),
    notes: text('notes'),
    decision: varchar('decision', { length: 20 }),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    tenantId: varchar('tenant_id', { length: 255 }).notNull(),
}, (table) => {
    return {
        tenantIdIdx: index('underwriting_reviews_tenant_id_idx').on(table.tenantId),
    };
});
// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL_UNDERWRITING_REVIEWS = `
ALTER TABLE underwriting_reviews ENABLE ROW LEVEL SECURITY;
`;
//# sourceMappingURL=underwriting_reviews.js.map