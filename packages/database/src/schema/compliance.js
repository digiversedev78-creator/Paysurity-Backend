import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';
export const pci_audit_archives = pgTable('pci_audit_archives', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
    auditPeriodStart: timestamp('audit_period_start').notNull(),
    auditPeriodEnd: timestamp('audit_period_end').notNull(),
    reportGeneratedDate: timestamp('report_generated_date').notNull(),
    complianceStatus: text('compliance_status').notNull(),
    reportUrl: text('report_url'),
    summary: text('summary'),
    archivedByUserId: text('archived_by_user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        tenantIdIdx: index('pci_audit_archives_tenant_id_idx').on(table.tenantId),
    };
});
export const RLS_MIGRATION_SQL = `
ALTER TABLE pci_audit_archives ENABLE ROW LEVEL SECURITY;
`;
//# sourceMappingURL=compliance.js.map