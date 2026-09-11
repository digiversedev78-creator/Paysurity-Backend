/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { format } from 'date-fns';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockDb = {
    execute: jest.fn().mockResolvedValue({
      rows: []
    })
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: 'DATABASE', useValue: mockDb }
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get Dashboard KPIs gracefully when DB is empty', async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [{ revenue: 10000, orders: 10 }] }); // rev
    mockDb.execute.mockResolvedValueOnce({ rows: [{ active_customers: 25 }] }); // crm
    mockDb.execute.mockResolvedValueOnce({ rows: [{ wallet_balance: 50000 }] }); // wallet
    
    const kpis = await service.getDashboardKpis('tenant-123');
    expect(kpis.todayRevenue).toBe(100);
    expect(kpis.todayOrders).toBe(10);
    expect(kpis.activeCustomers).toBe(25);
    expect(kpis.walletBalance).toBe(500);
  });

  it('should get accurate order status arrays', async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [
      { status: 'COMPLETED', count: 5 },
      { status: 'PENDING', count: 2 },
      { status: 'REFUNDED', count: 1 }
    ] });
    
    const statuses = await service.getOrderStatus('tenant-123');
    expect(statuses.completed).toBe(5);
    expect(statuses.pending).toBe(2);
    expect(statuses.refunded).toBe(1);
    expect(statuses.cancelled).toBe(0);
  });

  it('should get 7 days of 0 revenue trend when DB is empty', async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [] });
    const trend = await service.getRevenueTrend('tenant-123');
    expect(trend).toHaveLength(7);
    expect(trend[6].date).toBe(format(new Date(), 'MMM dd'));
    expect(trend[6].revenue).toBe(0);
  });

  it('should parse recent orders with normalized states', async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [{
      id: 'uuid-full-123',
      created_at: new Date('2026-03-24T12:00:00Z'),
      items: 3,
      total_cents: 1545,
      status: 'PAID',
    }] });
    
    const recent = await service.getRecentOrders('tenant-123');
    expect(recent[0].id).toBe('UUID'); // String(row.id).split('-')[0].toUpperCase()
    expect(recent[0].items).toBe(3);
    expect(recent[0].total).toBe(15.45);
    expect(recent[0].status).toBe('Completed');
  });
});
