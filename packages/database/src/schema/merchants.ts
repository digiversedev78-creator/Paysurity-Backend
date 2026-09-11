import { pgTable, uuid, text, timestamp, index, pgEnum, integer, check, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';

export const applicationStatusEnum = pgEnum('application_status', ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED']);

export const merchants = pgTable('merchants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  taxId: text('tax_id').unique(),
  status: applicationStatusEnum('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('merchants_tenant_id_idx').on(table.tenantId),
    einCheck: check('check_tax_id_format', sql`${table.taxId} ~ '^\\d{2}-\\d{7}$'`),
  };
});

export const beneficialOwners = pgTable('beneficial_owners', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').notNull().references(() => merchants.id),
  name: text('name').notNull(),
  equity: integer('equity').notNull(),
}, (table) => {
  return {
    equityCheck: check('check_equity_100', sql`${table.equity} <= 100`),
  };
});

export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').notNull().references(() => merchants.id),
  accountName: text('account_name').notNull(),
  accountType: text('account_type').notNull(),
});

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  merchantId: uuid('merchant_id').notNull().references(() => merchants.id),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  debits: integer('debits').notNull(),
  credits: integer('credits').notNull(),
}, (table) => {
  return {
    balanceCheck: check('check_debits_credits', sql`${table.debits} = ${table.credits}`),
    uniqueExportPeriod: unique('unique_export_period').on(table.merchantId, table.periodStart, table.periodEnd),
  };
});

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;

