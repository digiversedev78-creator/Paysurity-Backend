import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TenantIdDecorator } from '../../decorators/tenant-id.decorator';

@Controller('v1/dashboard')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKpis(@TenantIdDecorator() tenantId: string) {
    return this.analyticsService.getDashboardKpis(tenantId);
  }

  @Get('revenue-trend')
  async getRevenueTrend(@TenantIdDecorator() tenantId: string, @Query('period') period: string = 'daily') {
    return this.analyticsService.getRevenueTrend(tenantId, period);
  }

  @Get('order-status')
  async getOrderStatus(@TenantIdDecorator() tenantId: string) {
    return this.analyticsService.getOrderStatusBreakdown(tenantId);
  }

  @Get('recent-orders')
  async getRecentOrders(@TenantIdDecorator() tenantId: string, @Query('limit') limit: number = 10) {
    return this.analyticsService.getRecentOrders(tenantId, limit);
  }

  @Post('nlq-synthesis')
  async synthesizeIntelligence(@TenantIdDecorator() tenantId: string, @Body() body: { query: string; contextVector: any }) {
    return this.analyticsService.synthesizeIntelligence(tenantId, body.query, body.contextVector);
  }

  @Get('labor-pulse')
  async getLaborPulse(@TenantIdDecorator() tenantId: string, @Query('locationId') locationId: string) {
    return this.analyticsService.calculateLaborPulse(tenantId, locationId);
  }

  @Get('defense-triage')
  async getDefenseTriage(@TenantIdDecorator() tenantId: string) {
    return this.analyticsService.monitorTelemetryTriage(tenantId);
  }
}
