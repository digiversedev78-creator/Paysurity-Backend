import { Injectable, NotFoundException, InternalServerErrorException, Inject, BadRequestException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';

interface PciAuditArchiveResponseDto { id: string; tenantId: string; complianceStatus: string; [key: string]: any; }
interface CreatePciAuditArchiveDto  { auditPeriodStart: string; auditPeriodEnd: string; reportGeneratedDate: string; complianceStatus: string; reportUrl?: string; summary?: string; archivedByUserId?: string; }
interface UpdatePciAuditArchiveDto  { auditPeriodStart?: string; auditPeriodEnd?: string; reportGeneratedDate?: string; complianceStatus?: string; reportUrl?: string; summary?: string; }
interface PciAuditArchiveFilterDto  { complianceStatus?: string; auditPeriodStartGte?: string; auditPeriodEndLte?: string; }
interface PayrollComplianceCheckResultDto { overallPass: boolean; minWageCheck: { passed: boolean; violations: any[] }; overtimeCheck: { passed: boolean; violations: any[] }; payStubDeliveryCheck: { passed: boolean; violations: any[] }; }
interface TenantConfigData { overtimeThresholdHours?: string; overtimeMultiplier?: string; [key: string]: string | undefined; }
interface FullEmployeePayoutDetail { employeeId: string; wageRate: number; totalHoursWorked: number; totalAmountPaid: number; stateCode: string; }

@Injectable()
export class ComplianceService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  // â”€â”€â”€ PCI Audit Archive â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async createPciAuditArchive(tenantId: string, dto: CreatePciAuditArchiveDto, userId: string): Promise<PciAuditArchiveResponseDto> {
    const id = require('crypto').randomUUID();
    const result = await (this.db as any).execute(
      sql`INSERT INTO pci_audit_archives (id, tenant_id, audit_period_start, audit_period_end,
          report_generated_date, compliance_status, report_url, summary, archived_by_user_id, created_at, updated_at)
          VALUES (${id}, ${tenantId}, ${dto.auditPeriodStart}, ${dto.auditPeriodEnd},
          ${dto.reportGeneratedDate}, ${dto.complianceStatus}, ${dto.reportUrl||null},
          ${dto.summary||null}, ${dto.archivedByUserId||userId}, NOW(), NOW())
          RETURNING *`
    );
    if (!(result as any).rows[0]) throw new InternalServerErrorException('Failed to create PCI audit archive.');
    (this.auditLogService as any).logActivity(tenantId, userId, 'Compliance', `Created PCI audit archive`, { archiveId: id }).catch(() => {});
    return (result as any).rows[0];
  }

  async updatePciAuditArchive(tenantId: string, id: string, dto: UpdatePciAuditArchiveDto, userId: string): Promise<PciAuditArchiveResponseDto> {
    const existing = await (this.db as any).execute(
      sql`SELECT id FROM pci_audit_archives WHERE id = ${id} AND tenant_id = ${tenantId} LIMIT 1`
    );
    if (!(existing as any).rows[0]) throw new NotFoundException(`PCI Audit Archive ${id} not found.`);
    const result = await (this.db as any).execute(
      sql`UPDATE pci_audit_archives SET
          audit_period_start = COALESCE(${dto.auditPeriodStart||null}, audit_period_start),
          audit_period_end   = COALESCE(${dto.auditPeriodEnd||null}, audit_period_end),
          compliance_status  = COALESCE(${dto.complianceStatus||null}, compliance_status),
          report_url         = COALESCE(${dto.reportUrl||null}, report_url),
          summary            = COALESCE(${dto.summary||null}, summary),
          updated_at = NOW()
          WHERE id = ${id} AND tenant_id = ${tenantId} RETURNING *`
    );
    return (result as any).rows[0];
  }

  async findPciAuditArchiveById(tenantId: string, id: string): Promise<PciAuditArchiveResponseDto> {
    const result = await (this.db as any).execute(
      sql`SELECT * FROM pci_audit_archives WHERE id = ${id} AND tenant_id = ${tenantId} LIMIT 1`
    );
    if (!(result as any).rows[0]) throw new NotFoundException(`PCI Audit Archive ${id} not found.`);
    return (result as any).rows[0];
  }

  async findPciAuditArchives(tenantId: string, filter: PciAuditArchiveFilterDto): Promise<PciAuditArchiveResponseDto[]> {
    const conditions = [sql`tenant_id = ${tenantId}`];

    if (filter.complianceStatus) {
      conditions.push(sql`compliance_status = ${filter.complianceStatus}`);
    }
    if (filter.auditPeriodStartGte) {
      conditions.push(sql`audit_period_start >= ${filter.auditPeriodStartGte}`);
    }
    if (filter.auditPeriodEndLte) {
      conditions.push(sql`audit_period_end <= ${filter.auditPeriodEndLte}`);
    }
    
    // Join conditions with AND
    const whereClause = sql.join(conditions, sql` AND `);

    const query = sql`SELECT * FROM pci_audit_archives WHERE ${whereClause} ORDER BY created_at DESC`;
    const result = await (this.db as any).execute(query);
    return (result as any).rows;
  }

  // â”€â”€â”€ Payroll Compliance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async checkPayrollCompliance(tenantId: string, runId: string): Promise<PayrollComplianceCheckResultDto> {
    const report: PayrollComplianceCheckResultDto = {
      overallPass: true,
      minWageCheck:        { passed: true, violations: [] },
      overtimeCheck:       { passed: true, violations: [] },
      payStubDeliveryCheck:{ passed: true, violations: [] },
    };

    // 1. Fetch payroll run
    const runResult = await (this.db as any).execute(
      sql`SELECT * FROM payroll_runs WHERE id = ${runId} AND tenant_id = ${tenantId} LIMIT 1`
    );
    if (!(runResult as any).rows[0]) throw new NotFoundException(`Payroll run ${runId} not found.`);
    const run = (runResult as any).rows[0];
    if (!run.pay_period_start || !run.pay_period_end) throw new BadRequestException('Payroll run has incomplete period dates.');

    // 2. Fetch employee payout details
    const payoutResult = await (this.db as any).execute(
      sql`SELECT d.employee_id, d.net_pay, d.hours_worked, e.hourly_rate, e.pay_type,
               COALESCE(e.state_code, 'US') as state_code
          FROM payroll_run_details d
          JOIN employees e ON e.id = d.employee_id
          WHERE d.payroll_run_id = ${runId} AND d.tenant_id = ${tenantId}`
    );
    const payouts: FullEmployeePayoutDetail[] = (payoutResult as any).rows.map((r: any) => ({
      employeeId:       r.employee_id,
      wageRate:         parseFloat(r.hourly_rate || '0'),
      totalHoursWorked: parseFloat(r.hours_worked || '0'),
      totalAmountPaid:  parseFloat(r.net_pay || '0'),
      stateCode:        r.state_code,
    }));
    if (payouts.length === 0) return report;

    // 3. Tenant config for overtime
    const configResult = await (this.db as any).execute(
      sql`SELECT key, value FROM tenant_configs WHERE tenant_id = ${tenantId} AND key IN ('overtimeThresholdHours','overtimeMultiplier')`
    );
    const cfg: TenantConfigData = (configResult as any).rows.reduce((a: any, r: any) => { a[r.key]=r.value; return a; }, {});
    const overtimeThresh = parseFloat(cfg.overtimeThresholdHours || '40');
    const overtimeMult   = parseFloat(cfg.overtimeMultiplier || '1.5');

    // 4. Min wage map
    const minWageResult = await (this.db as any).execute(
      sql`SELECT DISTINCT ON (state_code) state_code, min_wage_rate FROM state_min_wages
          WHERE effective_date <= ${run.pay_period_start} ORDER BY state_code, effective_date DESC`
    );
    const minWageMap: Record<string, number> = {};
    for (const r of (minWageResult as any).rows) minWageMap[r.state_code] = parseFloat(r.min_wage_rate);

    // 5. Min wage check
    for (const p of payouts) {
      if (p.totalHoursWorked <= 0) continue;
      const minWage = minWageMap[p.stateCode];
      if (!minWage) continue;
      const effectiveRate = p.totalAmountPaid / p.totalHoursWorked;
      if (effectiveRate < minWage - 0.001) {
        report.minWageCheck.passed = false;
        report.overallPass = false;
        report.minWageCheck.violations.push({ employeeId: p.employeeId, actualHourlyRate: effectiveRate, requiredMinimumRate: minWage });
      }
    }

    // 6. Overtime check
    for (const p of payouts) {
      if (p.totalHoursWorked <= overtimeThresh) continue;
      const regularHours  = overtimeThresh;
      const overtimeHours = p.totalHoursWorked - overtimeThresh;
      const expectedPay   = regularHours * p.wageRate + overtimeHours * p.wageRate * overtimeMult;
      if (p.totalAmountPaid < expectedPay - 0.01) {
        report.overtimeCheck.passed = false;
        report.overallPass = false;
        report.overtimeCheck.violations.push({ employeeId: p.employeeId, hoursWorked: p.totalHoursWorked, expectedPay, actualPay: p.totalAmountPaid });
      }
    }

    // 7. Pay stub delivery check
    const stubResult = await (this.db as any).execute(
      sql`SELECT employee_id, delivery_timestamp FROM payroll_pay_stub_delivery_logs
          WHERE payroll_run_id = ${runId} AND tenant_id = ${tenantId}`
    );
    const stubMap: Record<string, Date> = {};
    for (const r of (stubResult as any).rows) stubMap[r.employee_id] = new Date(r.delivery_timestamp);
    const deadline = new Date(new Date(run.pay_period_end).getTime() + 24*60*60*1000);

    for (const p of payouts) {
      const delivery = stubMap[p.employeeId];
      if (!delivery) {
        report.payStubDeliveryCheck.passed = false; report.overallPass = false;
        report.payStubDeliveryCheck.violations.push({ employeeId: p.employeeId, issue: 'Pay stub not delivered.' });
      } else if (delivery > deadline) {
        report.payStubDeliveryCheck.passed = false; report.overallPass = false;
        report.payStubDeliveryCheck.violations.push({ employeeId: p.employeeId, issue: 'Pay stub delivered late.', deliveredAt: delivery });
      }
    }

    (this.auditLogService as any).logActivity(tenantId, 'SYSTEM', 'Compliance', `Payroll compliance check: ${report.overallPass ? 'PASS' : 'FAIL'}`, { runId, report }).catch(() => {});
    return report;
  }
}


