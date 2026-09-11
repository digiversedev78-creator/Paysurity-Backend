import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PayrollCalculationEngine } from './payroll-calculation.engine';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessPayrollDto {
  payPeriodStart: string;
  payPeriodEnd: string;
}

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    private readonly eventEmitter: EventEmitter2,
    private readonly calcEngine: PayrollCalculationEngine
  ) {}

  async processPayrollRun(tenantId: string, runDto: ProcessPayrollDto) {
    this.logger.log(`Initiating Payroll Run for Tenant: ${tenantId}`);
    const runId = uuidv4();

    return (this.db as any).transaction(async (tx) => {
      // 1. Fetch Users / Shift Hours
      const empRes = await tx.execute(sql`
        SELECT u.id, u.phone_number, u.hourly_rate_cents,
        COALESCE(SUM(EXTRACT(EPOCH FROM (s.clock_out - s.clock_in))/3600), 80) as hours_worked
        FROM users u
        LEFT JOIN time_entries s ON s.employee_id = u.id AND s.tenant_id = ${tenantId}
        WHERE u.tenant_id = ${tenantId} AND (u.role = 'EMPLOYEE' OR u.role = 'DRIVER')
        GROUP BY u.id
      `);

      const employees = empRes?.rows || [];
      if (employees.length === 0) {
        throw new BadRequestException('No active employees found for this pay period.');
      }

      let totalGrossCents = 0;
      let totalTaxCents = 0;
      let totalNetCents = 0;
      let totalEmployerTaxes = 0;

      const processedSlips: any[] = [];

      for (const emp of employees) {
          const rateCents = parseInt(emp.hourly_rate_cents as string, 10);
          if (!rateCents || rateCents <= 0) {
            this.logger.warn(`Skipping employee ${emp.id} â€” missing hourly_rate_cents`);
            continue;
          }
          const hoursWorked = parseFloat(emp.hours_worked as string) || 80;
          const grossPayCents = Math.round(rateCents * hoursWorked);

          // 2. Extrapolate withholdings
          const taxes = this.calcEngine.calculateWithholdings(grossPayCents);

          totalGrossCents += taxes.grossPay;
          totalTaxCents += taxes.employeeDeductions;
          totalNetCents += taxes.netPay;
          totalEmployerTaxes += taxes.employerTaxes;

          processedSlips.push({
             employeeId: emp.id,
             phone: emp.phone_number,
             hours: hoursWorked,
             rate: rateCents,
             gross: taxes.grossPay,
             net: taxes.netPay,
             deductions: taxes.breakdown
          });
      }

      const totalDeductionRequired = totalGrossCents + totalEmployerTaxes; // The physical cost to Employer

      // 3. Wallet Operations (Debit Employer via digital_wallets)
      const employerWalletRes = await tx.execute(sql`
          UPDATE digital_wallets
          SET balance_cents = balance_cents - ${totalDeductionRequired}, updated_at = NOW()
          WHERE tenant_id = ${tenantId}::uuid AND wallet_type = 'PAYROLL_DISBURSEMENT'
            AND balance_cents >= ${totalDeductionRequired}
          RETURNING id, balance_cents;
      `);
      if ((employerWalletRes as any).rows.length === 0) {
          throw new BadRequestException(`Insufficient Employer Wallet Funds. Required: $${(totalDeductionRequired / 100).toFixed(2)}`);
      }
      const employerWalletId = (employerWalletRes as any).rows[0].id;

      let slipsCreated = 0;

      // Credit Employees sequentially
      for (const slip of processedSlips) {
          if (!slip.phone) continue;

          // Find or credit employee wallet (digital_wallets)
          const employeeWalletRes = await tx.execute(sql`
              UPDATE digital_wallets
              SET balance_cents = balance_cents + ${slip.net}, updated_at = NOW()
              WHERE consumer_id = (SELECT id FROM users WHERE phone_number = ${slip.phone} LIMIT 1)
                AND tenant_id = ${tenantId}::uuid
              RETURNING id, balance_cents;
          `);
          let employeeWalletId: string;
          if ((employeeWalletRes as any).rows.length === 0) {
              // Auto-create wallet for new employee
              const newWalletRes = await tx.execute(sql`
                  INSERT INTO digital_wallets (id, tenant_id, consumer_id, wallet_type, currency, balance_cents, status, kyc_level)
                  SELECT gen_random_uuid(), ${tenantId}::uuid, u.id, 'CONSUMER', 'USD', ${slip.net}, 'ACTIVE', 'NONE'
                  FROM users u WHERE u.phone_number = ${slip.phone} AND u.tenant_id = ${tenantId}::uuid
                  RETURNING id;
              `);
              employeeWalletId = String((newWalletRes as any).rows[0]?.id ?? '');
          } else {
              employeeWalletId = String((employeeWalletRes as any).rows[0].id);
          }

          // Ledger insertions into wallet_ledger (canonical double-entry)
          await tx.execute(sql`
              INSERT INTO wallet_ledger (id, tenant_id, wallet_id, transaction_type, direction, amount_cents,
                balance_after_cents, description, idempotency_key, status)
              VALUES (gen_random_uuid(), ${tenantId}::uuid, ${employerWalletId}::uuid,
                'ORDER_PAYMENT', 'D', ${slip.gross + (slip.deductions.employerLiability || 0)},
                0, ${'Payroll funding run ' + runId}, ${'PAYROLL_OUT_' + runId + '_' + slip.employeeId}, 'COMPLETED')
          `);
          await tx.execute(sql`
              INSERT INTO wallet_ledger (id, tenant_id, wallet_id, transaction_type, direction, amount_cents,
                balance_after_cents, description, idempotency_key, status)
              VALUES (gen_random_uuid(), ${tenantId}::uuid, ${employeeWalletId}::uuid,
                'PAYROLL_CREDIT', 'C', ${slip.net},
                0, ${'Payroll Deposit ' + runId}, ${'PAYROLL_IN_' + runId + '_' + slip.employeeId}, 'COMPLETED')
          `);

          // 4. Paystubs (payroll_slips)
          await tx.execute(sql`
              INSERT INTO payroll_slips (id, tenant_id, payroll_run_id, employee_id, gross_amount_cents, net_amount_cents, deductions, status, created_at)
              VALUES (gen_random_uuid(), ${tenantId}, ${runId}, ${slip.employeeId}, ${slip.gross}, ${slip.net}, ${JSON.stringify(slip.deductions)}, 'PAID', NOW())
          `);
          slipsCreated++;

          this.eventEmitter.emit('payroll.slip.issued', { employeeId: slip.employeeId, netPay: slip.net, phone: slip.phone });
      }

      await tx.execute(sql`
          INSERT INTO payroll_runs (id, tenant_id, start_date, end_date, total_gross_cents, total_taxes_cents, total_net_cents, status, created_at)
          VALUES (${runId}, ${tenantId}, ${(runDto as any).payPeriodStart}, ${(runDto as any).payPeriodEnd}, ${totalGrossCents}, ${totalTaxCents}, ${totalNetCents}, 'PAID', NOW())
      `);

      (this.auditLogService as any).logActivity(tenantId, 'system', 'payroll', 'payroll.run.processed', { runId, slipsCreated, totalNetCents });

      return {
          runId,
          grossPayrollCents: totalGrossCents,
          totalTaxDeductionsCents: totalTaxCents,
          netPayrollCents: totalNetCents,
          status: 'Processed & Funded Natively',
          employeeCount: slipsCreated
      };
    });
  }
}




