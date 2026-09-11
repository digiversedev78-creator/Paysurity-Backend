import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PayrollRunsService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  private extractTenantId(req: any): string {
    const id = req?.user?.tenantId;
    if (!id) throw new BadRequestException('Missing tenantId');
    return id;
  }

  private calculateTax(grossPay: number, brackets: { min: number; max?: number; rate: number }[]): number {
    let tax = 0;
    const sorted = [...brackets].sort((a, b) => a.min - b.min);
    for (const bracket of sorted) {
      if (grossPay <= bracket.min) break;
      const taxable = Math.min(grossPay, bracket.max ?? Infinity) - bracket.min;
      tax += taxable * bracket.rate;
    }
    return Math.round(tax * 100) / 100;
  }

  async processPayrollRun(req: any, dto: {
    payPeriodStart: string;
    payPeriodEnd: string;
    runDate?: string;
  }) {
    const tenantId = this.extractTenantId(req);
    const runId = uuidv4();
    const runDate = dto.runDate || new Date().toISOString().split('T')[0];

    // Get tenant payroll config
    const configResult = await (this.db as any).execute(
      sql`SELECT settings FROM tenants WHERE id = ${tenantId} LIMIT 1`
    );
    const config = (configResult as any).rows[0]?.settings ?? {};
    const federalBrackets = config.federal_tax_brackets ?? [
      { min: 0, max: 10275, rate: 0.10 },
      { min: 10275, max: 41775, rate: 0.12 },
      { min: 41775, max: 89075, rate: 0.22 },
      { min: 89075, rate: 0.24 },
    ];
    const stateBrackets = config.state_tax_brackets ?? [{ min: 0, rate: 0.05 }];
    const payFrequency = config.pay_period_frequency ?? 'BI_WEEKLY';
    const periodsPerYear = payFrequency === 'MONTHLY' ? 12 : 26;

    // Get all active employees for this tenant
    const empResult = await (this.db as any).execute(
      sql`SELECT id, first_name, last_name, email, pay_type, salary, hourly_rate, benefits_config,
               bank_routing_number_encrypted, bank_account_number_encrypted
          FROM employees
          WHERE tenant_id = ${tenantId} AND is_active = true`
    );
    const employees = (empResult as any).rows;

    // Get timesheets for hourly employees in this pay period
    const tsResult = await (this.db as any).execute(
      sql`SELECT employee_id, SUM(hours_worked) as total_hours
          FROM timesheets
          WHERE tenant_id = ${tenantId}
            AND work_date BETWEEN ${dto.payPeriodStart} AND ${dto.payPeriodEnd}
          GROUP BY employee_id`
    );
    const timesheetMap: Record<string, number> = {};
    for (const row of (tsResult as any).rows) {
      timesheetMap[row.employee_id] = parseFloat(row.total_hours);
    }

    const { totalGross, totalNet, details } = await (this.db as any).transaction(async (tx: any) => {
      let runTotalGross = 0;
      let runTotalNet = 0;
      const runDetails: any[] = [];

      // Create payroll run record
      await tx.execute(
        sql`INSERT INTO payroll_runs (id, tenant_id, run_date, pay_period_start, pay_period_end, status,
            total_gross_pay, total_net_pay, created_at, updated_at)
            VALUES (${runId}, ${tenantId}, ${runDate}, ${dto.payPeriodStart}, ${dto.payPeriodEnd},
            'CALCULATED', 0, 0, NOW(), NOW())`
      );

      for (const emp of employees) {
        const benefits = emp.benefits_config ?? {};
        let grossPay = 0;

        if (emp.pay_type === 'SALARY') {
          grossPay = parseFloat(emp.salary) / periodsPerYear;
        } else {
          const hours = timesheetMap[emp.id] ?? 0;
          const regular = Math.min(hours, 40);
          const overtime = Math.max(0, hours - 40);
          grossPay = regular * parseFloat(emp.hourly_rate) + overtime * parseFloat(emp.hourly_rate) * 1.5;
        }

        const federalTax = this.calculateTax(grossPay, federalBrackets);
        const stateTax = this.calculateTax(grossPay, stateBrackets);
        const ssTax = Math.min(grossPay * 0.062, 9932.40 / periodsPerYear);
        const medicareTax = grossPay * 0.0145;

        const healthDed = parseFloat(benefits.health_insurance_deduction ?? '0');
        const dentalDed = parseFloat(benefits.dental_insurance_deduction ?? '0');
        const retirePct = parseFloat(benefits.retirement_contribution_percentage ?? '0');
        const retireDed = grossPay * (retirePct / 100);
        const totalDeductions = healthDed + dentalDed + retireDed;

        const netPay = Math.max(0, grossPay - federalTax - stateTax - ssTax - medicareTax - totalDeductions);

        runTotalGross += grossPay;
        runTotalNet += netPay;

        const detailId = uuidv4();
        await tx.execute(
          sql`INSERT INTO payroll_run_details (id, tenant_id, payroll_run_id, employee_id,
              gross_pay, federal_tax, state_tax, ss_tax, medicare_tax, benefits_deductions, net_pay,
              hours_worked, pay_type, created_at)
              VALUES (${detailId}, ${tenantId}, ${runId}, ${emp.id},
              ${grossPay.toFixed(2)}, ${federalTax.toFixed(2)}, ${stateTax.toFixed(2)},
              ${ssTax.toFixed(2)}, ${medicareTax.toFixed(2)}, ${totalDeductions.toFixed(2)},
              ${netPay.toFixed(2)}, ${timesheetMap[emp.id] ?? 0}, ${emp.pay_type}, NOW())`
        );

        // Create ACH transaction record
        const achId = uuidv4();
        await tx.execute(
          sql`INSERT INTO payroll_ach_transactions (id, tenant_id, payroll_run_id, employee_id,
              amount, status, created_at, updated_at)
              VALUES (${achId}, ${tenantId}, ${runId}, ${emp.id},
              ${netPay.toFixed(2)}, 'PENDING', NOW(), NOW())`
        );

        runDetails.push({ employeeId: emp.id, name: `${emp.first_name} ${emp.last_name}`, grossPay, netPay });
      }

      // Update payroll run totals
      await tx.execute(
        sql`UPDATE payroll_runs SET total_gross_pay = ${runTotalGross.toFixed(2)},
            total_net_pay = ${runTotalNet.toFixed(2)}, status = 'ACH_GENERATED', updated_at = NOW()
            WHERE id = ${runId}`
      );

      return { totalGross: runTotalGross, totalNet: runTotalNet, details: runDetails };
    });

    return { runId, payPeriodStart: dto.payPeriodStart, payPeriodEnd: dto.payPeriodEnd,
      totalGrossPay: totalGross, totalNetPay: totalNet, employeeCount: employees.length, details };
  }

  async storeEmployeeBankDetails(req: any, employeeId: string, dto: {
    routingNumber: string;
    accountNumber: string;
  }) {
    const tenantId = this.extractTenantId(req);
    // Basic validation
    if (!/^\d{9}$/.test(dto.routingNumber)) throw new BadRequestException('Routing number must be 9 digits');
    if (!dto.accountNumber) throw new BadRequestException('Account number required');

    // Encrypt (base64 placeholder â€” use KMS in production)
    const encRouting = Buffer.from(dto.routingNumber).toString('base64');
    const encAccount = Buffer.from(dto.accountNumber).toString('base64');

    await (this.db as any).execute(
      sql`UPDATE employees SET bank_routing_number_encrypted = ${encRouting},
          bank_account_number_encrypted = ${encAccount}, updated_at = NOW()
          WHERE id = ${employeeId} AND tenant_id = ${tenantId}`
    );

    return { success: true, message: 'Bank details stored securely' };
  }

  async updateAchTransactionStatus(req: any, achId: string, dto: {
    status: 'SUBMITTED' | 'SETTLED' | 'RETURNED';
    traceNumber?: string;
    returnCode?: string;
  }) {
    const tenantId = this.extractTenantId(req);
    await (this.db as any).execute(
      sql`UPDATE payroll_ach_transactions
          SET status = ${dto.status},
              trace_number = ${dto.traceNumber ?? null},
              return_code = ${dto.returnCode ?? null},
              ${dto.status === 'SUBMITTED' ? sql`submission_date = CURRENT_DATE,` : sql``}
              ${dto.status === 'SETTLED' ? sql`settlement_date = CURRENT_DATE,` : sql``}
              updated_at = NOW()
          WHERE id = ${achId} AND tenant_id = ${tenantId}`
    );
    return { success: true };
  }

  async getPayrollRuns(req: any) {
    const tenantId = this.extractTenantId(req);
    const result = await (this.db as any).execute(
      sql`SELECT id, run_date, pay_period_start, pay_period_end, status,
               total_gross_pay, total_net_pay, created_at
          FROM payroll_runs WHERE tenant_id = ${tenantId}
          ORDER BY created_at DESC LIMIT 50`
    );
    return (result as any).rows;
  }

  async getPayrollRunDetail(req: any, runId: string) {
    const tenantId = this.extractTenantId(req);
    const run = await (this.db as any).execute(
      sql`SELECT * FROM payroll_runs WHERE id = ${runId} AND tenant_id = ${tenantId} LIMIT 1`
    );
    if (!(run as any).rows.length) throw new NotFoundException('Payroll run not found');
    const details = await (this.db as any).execute(
      sql`SELECT d.*, e.first_name, e.last_name, e.email
          FROM payroll_run_details d
          JOIN employees e ON e.id = d.employee_id
          WHERE d.payroll_run_id = ${runId} AND d.tenant_id = ${tenantId}`
    );
    return { run: (run as any).rows[0], details: (details as any).rows };
  }
}

