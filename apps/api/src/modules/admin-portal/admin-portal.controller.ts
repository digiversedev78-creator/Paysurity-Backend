import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminSearchService, SearchResultDto } from './admin-search.service';
import { AdminFinanceService, FinanceAggregationDto } from './admin-finance.service';
import { SystemHealthCronService } from './admin-health.cron';
import { AdminTenantsService } from './admin-tenants.service';
import { RequireRole } from './decorators/require-role.decorator';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { LogAggregationService } from './log-aggregation.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';

@Controller('admin')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN')
export class AdminPortalController {
  constructor(
    private readonly searchService: AdminSearchService,
    private readonly financeService: AdminFinanceService,
    private readonly healthService: SystemHealthCronService,
    private readonly tenantsService: AdminTenantsService,
    private readonly logService: LogAggregationService,
    private readonly flagService: FeatureFlagService,
  ) {}

  @Get('search')
  async search(@Query('q') q: string): Promise<SearchResultDto[]> {
    if (!q || q.trim().length === 0) {
      return [];
    }
    return (this.searchService as any).searchEcosystem(q);
  }

  @Get('finance')
  async getFinance(): Promise<FinanceAggregationDto> {
    return (this.financeService as any).getAggregateFinancials();
  }

  @Get('health')
  async getHealth() {
    return (this.healthService as any).getLatestHealthStatus();
  }

  /**
   * GET /admin/metrics
   * Unified KPI endpoint for the Admin Portal dashboard.
   * Composes data from finance, tenants, and audit log services.
   */
  @Get('metrics')
  async getMetrics() {
    const [finance, tenantList, recentLogs, healthRows] = await Promise.allSettled([
      (this.financeService as any).getAggregateFinancials(),
      (this.tenantsService as any).getTenants(1000, 0),
      (this.logService as any).getLogs({ pageSize: 50, sortOrder: 'desc' }),
      (this.healthService as any).getLatestHealthStatus(),
    ]);

    const gpvCents = finance.status === 'fulfilled' ? finance.value.gpvCents : 0;
    const tenants  = tenantList.status === 'fulfilled' ? tenantList.value : [];
    const logs     = recentLogs.status === 'fulfilled' ? (recentLogs.value as any).data ?? [] : [];
    const health   = healthRows.status === 'fulfilled' ? (healthRows.value as any[]) : [];
    const apiUptime = health.length > 0 ? (health[0].status ?? 'UNKNOWN') : null;

    // Derive KYB queue: tenants with status indicating pending review
    const kybPending = tenants.filter((t: any) =>
      t.kybStatus === 'PENDING' || t.kybStatus === 'SUBMITTED' || t.status === 'PENDING'
    ).length;

    // Derive security alerts: count FAILED/BLOCKED events in recent logs
    const securityAlerts = logs.filter((e: any) => {
      const action: string = (e.action ?? '').toUpperCase();
      return action.includes('FAIL') || action.includes('BLOCK') || action.includes('BYPASS') || action.includes('RATE_LIMIT');
    }).length;

    // Webhook errors
    const webhookErrors = logs.filter((e: any) => {
      const action: string = (e.action ?? '').toUpperCase();
      return action.includes('WEBHOOK') && (action.includes('FAIL') || action.includes('ERROR'));
    }).length;

    return {
      activeTenants:  tenants.length,
      gpvCents,
      gpvFormatted:   gpvCents > 0 ? `$${(gpvCents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$0',
      kybQueue:       kybPending,
      securityAlerts,
      webhookErrors,
      apiUptime:      apiUptime,
    };
  }

  @Get('flags')
  async getFlags() {
    return (this.flagService as any).findAllSystemWide();
  }
}

