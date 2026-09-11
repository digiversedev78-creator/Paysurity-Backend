/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getDashboardKpis: jest.fn().mockResolvedValue({ todayRevenue: 100, todayOrders: 5, activeCustomers: 10, walletBalance: 50.0 }),
    getRevenueTrend: jest.fn().mockResolvedValue([{ date: 'Jan 01', revenue: 100 }]),
    getOrderStatus: jest.fn().mockResolvedValue({ pending: 1, processing: 0, completed: 5, cancelled: 0, refunded: 0 }),
    getRecentOrders: jest.fn().mockResolvedValue([{ id: '1', time: '12:00 PM', items: 2, total: 20.0, status: 'Completed' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (_context: ExecutionContext) => true,
      })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return KPIs', async () => {
    const req = { user: { tenantId: 'tenant-123' } };
    expect(await controller.getKpis(req)).toEqual({ todayRevenue: 100, todayOrders: 5, activeCustomers: 10, walletBalance: 50.0 });
    expect(service.getDashboardKpis).toHaveBeenCalledWith('tenant-123');
  });

  it('should return revenue trend', async () => {
    const req = { user: { tenantId: 'tenant-123' } };
    expect(await controller.getRevenueTrend(req)).toEqual([{ date: 'Jan 01', revenue: 100 }]);
  });

  it('should return order status', async () => {
    const req = { user: { tenantId: 'tenant-123' } };
    expect(await controller.getOrderStatus(req)).toEqual({ pending: 1, processing: 0, completed: 5, cancelled: 0, refunded: 0 });
  });

  it('should return recent orders', async () => {
    const req = { user: { tenantId: 'tenant-123' } };
    expect(await controller.getRecentOrders(req)).toEqual([{ id: '1', time: '12:00 PM', items: 2, total: 20.0, status: 'Completed' }]);
  });
});
