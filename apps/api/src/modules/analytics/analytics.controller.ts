import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assume standard auth guard exists

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('v1/dashboard')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKpis(@Request() req: Record<string, unknown> & { user?: { tenantId?: string } }) {
    // Extract tenantId from JWT (injected via standard auth guard)
    // Fallback to a test tenant if no JWT tenant is mapped during staging
    const tenantId = req.user?.tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return (this.analyticsService as any).getDashboardKpis(tenantId);
  }

  @Get('revenue-trend')
  async getRevenueTrend(@Request() req: Record<string, unknown> & { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return (this.analyticsService as any).getRevenueTrend(tenantId);
  }

  @Get('order-status')
  async getOrderStatus(@Request() req: Record<string, unknown> & { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return (this.analyticsService as any).getOrderStatus(tenantId);
  }

  @Get('recent-orders')
  async getRecentOrders(@Request() req: Record<string, unknown> & { user?: { tenantId?: string } }) {
    const tenantId = req.user?.tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    return (this.analyticsService as any).getRecentOrders(tenantId);
  }
}

