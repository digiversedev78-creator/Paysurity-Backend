/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  OPS-006 -- Log Aggregation
 * FILE TYPE:    TEST
 * MODULE:       admin-portal
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/OPS_MANAGEMENT.md
 * ═══════════════════════════════════════════════════════════
 */

// Jest mock hoists: prevent resolution of phantom decorator/enum paths
jest.mock('../../auth/decorators/roles.decorator', () => ({
  Roles: (..._roles: string[]) => (_target: any, _key?: any, _desc?: any) => {},
}), { virtual: true });
jest.mock('../../../common/enums/role.enum', () => ({
  Role: { ADMIN: 'admin', USER: 'user', SUPER_ADMIN: 'super_admin' },
}), { virtual: true });
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => () => {},
  ApiBearerAuth: () => () => {},
  ApiOperation: () => () => {},
  ApiResponse: () => () => {},
  ApiQuery: () => () => {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { auditLogs } from '@paysurity/database';
import {
  LogAggregationService,
  GetLogsDto,
  GetLogAggregationDto,
} from './log-aggregation.service';
import { LogAggregationController } from './log-aggregation.controller';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';


// ─── Typed Drizzle mock stub ───────────────────────────────
type DrizzleDb = NodePgDatabase<Record<string, never>>;

interface MockQueryChain {
  select: jest.MockedFunction<() => MockQueryChain>;
  insert: jest.MockedFunction<() => MockQueryChain>;
  update: jest.MockedFunction<() => MockQueryChain>;
  from: jest.MockedFunction<() => MockQueryChain>;
  where: jest.MockedFunction<() => MockQueryChain>;
  limit: jest.MockedFunction<() => MockQueryChain>;
  offset: jest.MockedFunction<() => MockQueryChain>;
  orderBy: jest.MockedFunction<() => MockQueryChain>;
  groupBy: jest.MockedFunction<() => MockQueryChain>;
  values: jest.MockedFunction<() => MockQueryChain>;
  set: jest.MockedFunction<() => MockQueryChain>;
  returning: jest.MockedFunction<() => MockQueryChain>;
  execute: jest.MockedFunction<() => Promise<unknown[]>>;
}

function buildMockChain(): MockQueryChain {
  const chain = {} as MockQueryChain;
  const self = () => chain;
  chain.select   = jest.fn(self);
  chain.insert   = jest.fn(self);
  chain.update   = jest.fn(self);
  chain.from     = jest.fn(self);
  chain.where    = jest.fn(self);
  chain.limit    = jest.fn(self);
  chain.offset   = jest.fn(self);
  chain.orderBy  = jest.fn(self);
  chain.groupBy  = jest.fn(self);
  chain.values   = jest.fn(self);
  chain.set      = jest.fn(self);
  chain.returning = jest.fn(self);
  chain.execute  = jest.fn().mockResolvedValue([]);
  return chain;
}

// ─── LogAggregationService Unit Tests ─────────────────────
describe('LogAggregationService', () => {
  let service: LogAggregationService;
  let mockChain: MockQueryChain;
  let dbMock: Pick<DrizzleDb, 'select' | 'insert'>;

  beforeEach(async () => {
    mockChain = buildMockChain();
    dbMock = {
      select: jest.fn(() => mockChain) as unknown as DrizzleDb['select'],
      insert: jest.fn(() => mockChain) as unknown as DrizzleDb['insert'],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogAggregationService,
        {
          provide: 'DATABASE',
          useValue: dbMock,
        },
      ],
    }).compile();

    service = module.get<LogAggregationService>(LogAggregationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getLogs ───────────────────────────────────────────
  describe('getLogs', () => {
    it('should call db.select() and chain from/where/limit/offset/orderBy', async () => {
      const queryDto: GetLogsDto = {};
      mockChain.execute.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: 0 }]);

      await service.getLogs(queryDto);

      expect(dbMock.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalledWith(auditLogs);
    });

    it('should apply search filter via ilike when search is provided', async () => {
      const queryDto: GetLogsDto = { search: 'critical' };
      mockChain.execute.mockResolvedValue([]).mockResolvedValue([{ count: 0 }]);

      await service.getLogs(queryDto);

      expect(mockChain.where).toHaveBeenCalled();
    });

    it('should apply userId filter when provided', async () => {
      const queryDto: GetLogsDto = { userId: 'user-abc' };
      mockChain.execute.mockResolvedValue([]).mockResolvedValue([{ count: 0 }]);

      await service.getLogs(queryDto);

      expect(mockChain.where).toHaveBeenCalled();
    });

    it('should apply date range filters when startDate and endDate are provided', async () => {
      const queryDto: GetLogsDto = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };
      mockChain.execute.mockResolvedValue([]).mockResolvedValue([{ count: 0 }]);

      await service.getLogs(queryDto);

      expect(mockChain.where).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalledWith(auditLogs);
    });

    it('should apply pagination via limit and offset', async () => {
      const queryDto: GetLogsDto = { page: 3, pageSize: 5 };
      mockChain.execute.mockResolvedValue([]).mockResolvedValue([{ count: 0 }]);

      await service.getLogs(queryDto);

      expect(mockChain.limit).toHaveBeenCalledWith(5);
      expect(mockChain.offset).toHaveBeenCalledWith(10); // (3-1)*5
    });

    it('should apply descending sort by default', async () => {
      const queryDto: GetLogsDto = {};
      mockChain.execute.mockResolvedValue([]).mockResolvedValue([{ count: 0 }]);

      await service.getLogs(queryDto);

      expect(mockChain.orderBy).toHaveBeenCalled();
    });

    it('should return paginated structure with total, page, pageSize, data', async () => {
      const mockLogData = [{
        id: 'log-uuid',
        action: 'api_call',
        resource: 'user',
        message: 'Hello World',
        createdAt: new Date('2024-01-01T10:00:00Z'),
      }];

      // First call for data, second for count
      mockChain.execute
        .mockResolvedValueOnce(mockLogData)
        .mockResolvedValueOnce([{ count: 1 }]);

      const result = await service.getLogs({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pageSize');
    });
  });

  // ─── getLogById ────────────────────────────────────────
  describe('getLogById', () => {
    it('should return a log entry if found', async () => {
      const mockLog = { id: 'log-1', action: 'login', resource: 'user', message: 'User logged in', createdAt: new Date() };
      mockChain.execute.mockResolvedValueOnce([mockLog]);

      const result = await service.getLogById('log-1');
      expect(result).toEqual(mockLog);
      expect(dbMock.select).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
      expect(mockChain.limit).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when log entry not found', async () => {
      mockChain.execute.mockResolvedValueOnce([]); // empty result

      await expect(service.getLogById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── createLog ─────────────────────────────────────────
  describe('createLog', () => {
    it('should insert a new log record and return it', async () => {
      // Derive the exact DTO type from the service method signature — no as any needed
      type CreateLogParams = Parameters<typeof service.createLog>[0];
      const dto: CreateLogParams = {
        actionType: 'create' as CreateLogParams['actionType'],
        entityType: 'user' as CreateLogParams['entityType'],
        entityId: 'entity-1',
        message: 'Record created',
      };
      const created = { id: 'new-log-id', ...dto, createdAt: new Date() };
      mockChain.execute.mockResolvedValueOnce([created]);

      const result = await service.createLog(dto);

      expect(result).toEqual(created);
      expect(dbMock.insert).toHaveBeenCalledWith(auditLogs);
    });
  });

  // ─── getLogAggregation ─────────────────────────────────
  describe('getLogAggregation', () => {
    it('should call db.select() with groupBy', async () => {
      const dto: GetLogAggregationDto = {};
      mockChain.execute.mockResolvedValueOnce([{ groupKey: '2024-01-01', count: 5 }]);

      await service.getLogAggregation(dto);

      expect(dbMock.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalledWith(auditLogs);
      expect(mockChain.groupBy).toHaveBeenCalled();
    });

    it('should apply date range when startDate and endDate are both provided', async () => {
      const dto: GetLogAggregationDto = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };
      mockChain.execute.mockResolvedValueOnce([]);

      await service.getLogAggregation(dto);

      expect(mockChain.where).toHaveBeenCalled();
    });
  });
});

// ─── LogAggregationController Integration Tests ────────────
describe('LogAggregationController', () => {
  let controller: LogAggregationController;

  const mockLogAggregationService = {
    getAggregatedLogs: jest.fn(),
    getLogs: jest.fn(),
    getLogById: jest.fn(),
    getLogAggregation: jest.fn(),
    createLog: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogAggregationController],
      providers: [
        {
          provide: LogAggregationService,
          useValue: mockLogAggregationService,
        },
      ],
    }).compile();

    controller = module.get<LogAggregationController>(LogAggregationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAggregatedLogs', () => {
    it('should call logAggregationService.getAggregatedLogs with the query DTO', async () => {
      const query: GetLogAggregationDto = {};
      const mockResult = [{ groupKey: '2024-01-01', count: 3 }];
      mockLogAggregationService.getAggregatedLogs.mockResolvedValue(mockResult);

      const result = await controller.getAggregatedLogs(query);

      expect(result).toEqual(mockResult);
      expect(mockLogAggregationService.getAggregatedLogs).toHaveBeenCalledWith(query);
    });

    it('should throw BadRequestException when startDate is after endDate', async () => {
      const query: GetLogAggregationDto = {
        startDate: '2024-12-31T00:00:00Z',
        endDate: '2024-01-01T00:00:00Z',
      };

      await expect(controller.getAggregatedLogs(query)).rejects.toThrow(BadRequestException);
      await expect(controller.getAggregatedLogs(query)).rejects.toThrow('startDate cannot be after endDate');
      expect(mockLogAggregationService.getAggregatedLogs).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when startDate is invalid ISO', async () => {
      const query: GetLogAggregationDto = {
        startDate: 'not-a-date',
        endDate: '2024-01-31T00:00:00Z',
      };

      await expect(controller.getAggregatedLogs(query)).rejects.toThrow(BadRequestException);
      await expect(controller.getAggregatedLogs(query)).rejects.toThrow('Invalid date format');
    });

    it('should call service when only startDate is provided (no endDate)', async () => {
      const query: GetLogAggregationDto = { startDate: '2024-01-01T00:00:00Z' };
      mockLogAggregationService.getAggregatedLogs.mockResolvedValue([]);

      await controller.getAggregatedLogs(query);

      expect(mockLogAggregationService.getAggregatedLogs).toHaveBeenCalledWith(query);
    });

    it('should call service when only endDate is provided (no startDate)', async () => {
      const query: GetLogAggregationDto = { endDate: '2024-01-31T00:00:00Z' };
      mockLogAggregationService.getAggregatedLogs.mockResolvedValue([]);

      await controller.getAggregatedLogs(query);

      expect(mockLogAggregationService.getAggregatedLogs).toHaveBeenCalledWith(query);
    });

    it('should pass through service errors', async () => {
      const query: GetLogAggregationDto = {};
      mockLogAggregationService.getAggregatedLogs.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.getAggregatedLogs(query)).rejects.toThrow('Database connection failed');
    });
  });
});
