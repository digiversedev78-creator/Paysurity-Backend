import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, varchar, integer, boolean, timestamp, jsonb, index, check } from 'drizzle-orm/pg-core';

// ─── Payroll Runs ─────────────────────────────────────────────────────────────
export const payroll_runs = pgTable('payroll_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  payDate: timestamp('pay_date'),
  status: varchar('status', { length: 40 }).default('DRAFT'), // DRAFT | PROCESSING | APPROVED | PAID | FAILED
  totalGrossPay: integer('total_gross_pay').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  totalNetPay: integer('total_net_pay').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  totalTaxWithheld: integer('total_tax_withheld').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  employeeCount: integer('employee_count').default(0),
  notes: text('notes'),
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('payroll_runs_tenant_id_idx').on(table.tenantId),
  };
});

// ─── Payroll Line Items ───────────────────────────────────────────────────────
export const payroll_line_items = pgTable('payroll_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  payrollRunId: uuid('payroll_run_id').notNull(),
  tenantId: uuid('tenant_id').notNull(),
  employeeId: uuid('employee_id').notNull(),
  regularHours: integer('regular_hours').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision
  overtimeHours: integer('overtime_hours').default(0), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision
  grossPay: integer('gross_pay').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision
  federalTax: integer('federal_tax').default(0), // @ROUNDING: HALF_UP
  stateTax: integer('state_tax').default(0), // @ROUNDING: HALF_UP
  ficaTax: integer('fica_tax').default(0), // @ROUNDING: HALF_UP
  otherDeductions: integer('other_deductions').default(0), // @ROUNDING: HALF_UP
  netPay: integer('net_pay').notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision
  paymentMethod: varchar('payment_method', { length: 30 }).default('DIRECT_DEPOSIT'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('payroll_line_items_tenant_id_idx').on(table.tenantId),
    netPayCalc: check('net_pay_calc', sql`net_pay = gross_pay - federal_tax - state_tax - fica_tax - other_deductions`),
    netPayPositive: check('net_pay_positive', sql`net_pay >= 0`),
  };
});

export type PayrollRun = typeof payroll_runs.$inferSelect;
export type NewPayrollRun = typeof payroll_runs.$inferInsert;
export type PayrollLineItem = typeof payroll_line_items.$inferSelect;

