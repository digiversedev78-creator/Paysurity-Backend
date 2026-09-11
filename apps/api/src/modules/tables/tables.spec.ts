/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-012 -- Table & Seating Management
 * FILE TYPE:    TEST
 * MODULE:       tables
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Business rules preserved from original test (1:1 intent mapping):
 *
 *   Original test imported `locations` and `tables` from
 *   `@paysurity/database` â€” those are NOT exported from that package.
 *   They ARE defined in ./tables.dto.ts (local Drizzle schema).
 *
 *   Original controller tests called phantom methods:
 *     controller.getTable(), controller.update(), controller.deleteTable()
 *   Real controller methods: findAll, create, updateStatus, assignOrder, mergeTables, splitTable
 *
 *   Original service tests called:
 *     service.getTable(id, tenantId) â†’ real: getTableById(id, locationId, tenantId)
 *     service.getTables(tenantId, {}) â†’ real: getTables(queryParams, tenantId); requires locationId
 *     service.updateTable(id, dto, tenantId, userId) â†’ real: updateTable(id, locationId, dto, tenantId, userId)
 *     service.deleteTable(id, tenantId, userId) â†’ real: deleteTable(id, locationId, tenantId, userId)
 *
 *   All business rule intents are preserved:
 *     1. createTable success + audit log
 *     2. createTable NotFoundException for missing location
 *     3. getTableById success + NotFoundException
 *     4. updateTable success + audit
 *     5. updateTable NotFoundException
 *     6. deleteTable success + audit
 *     7. deleteTable NotFoundException
 *     8. Controller: findAll, create, updateStatus, assignOrder, mergeTables, splitTable dispatcher
 *
 * Contract alignment:
 *   - locations and tables imported from ./tables.dto (local schema)
 *   - TablesService uses (this.db as any).execute(sql`...`) â€” raw SQL
 *   - DB token: 'DATABASE' (via mockDbConnection.db shape)
 *   - AuditLogService method: logAudit(...)
 *   - EventEmitter2: emit(event, payload)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Import canonical DTOs from ./dto/table.dto â€” this is what TablesService.createTable expects.
// Note: ./tables.dto.ts also defines CreateTableDto but with a different shape (locationId-based);
//       ./dto/table.dto.ts has { name, location, restaurantId, capacity } which is what the
//       real TablesService consumes.
import {
  CreateTableDto,
  UpdateTableDto,
  TableStatus,
  TableShape,
  TableQueryParamsDto,
} from './dto/table.dto';

// tables/locations schema is consumed internally by TablesService â€” the spec does not
// need to import them; the DB mock intercepts execute() calls.


// â”€â”€â”€ Typed DB mock â€” TablesService uses (this.db as any).execute(sql`...`) â”€â”€â”€â”€

interface MockDb {
  execute: jest.MockedFunction<(...args: unknown[]) => Promise<unknown[]>>;
}

function buildMockDb(): MockDb {
  return { execute: jest.fn().mockResolvedValue([]) };
}

// â”€â”€â”€ Service-level mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const mockAuditLogService = {
  logAudit: jest.fn(),
  logAuditAction: jest.fn(),
  logActivity: jest.fn(),
  record: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

// â”€â”€â”€ Shared fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const tenantId    = 'tenant1';
const userId      = 'user1';
const locationId  = 'loc-tenant1-1';
const tableId     = 'table-uuid-001';

const mockLocation = {
  id: locationId,
  tenantId,
  name: 'Main Restaurant',
  addressLine1: '123 Main St',
  addressLine2: null,
  city: 'Anytown',
  state: 'CA',
  zipCode: '90210',
  phoneNumber: null,
  email: null,
};

const mockTableRecord = {
  id: tableId,
  tenantId,
  locationId,
  tableNumber: 'Table A1',
  capacity: 4,
  status: TableStatus.AVAILABLE,
  shape: TableShape.RECTANGLE,
  coordinatesX: 0,
  coordinatesY: 0,
  width: 1,
  height: 1,
  currentOrderId: null,
  mergedWithTableIds: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// â”€â”€â”€ TablesService Unit Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('TablesService', () => {
  let service: TablesService;
  let mockDb: MockDb;

  beforeEach(async () => {
    mockDb = buildMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        { provide: 'DATABASE', useValue: mockDb },
        { provide: AuditLogService, useValue: mockAuditLogService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<TablesService>(TablesService);
    jest.clearAllMocks();
    mockDb.execute = jest.fn().mockResolvedValue([]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // â”€â”€â”€ Business Rule 1 & 2: createTable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('createTable', () => {
    const createDto: CreateTableDto = {
      name: 'Table A1',
      location: 'main_dining_hall',
      restaurantId: locationId,
      capacity: 4,
      shape: TableShape.RECTANGLE,
      status: TableStatus.AVAILABLE,
    };

    it('should create a new table and log audit', async () => {
      // First execute: getLocationById (SELECT location)
      // Second execute: INSERT table
      mockDb.execute
        .mockResolvedValueOnce([mockLocation])    // location lookup
        .mockResolvedValueOnce([mockTableRecord]); // INSERT returning

      const result = await service.createTable(createDto, tenantId, userId);

      expect(result).toBeDefined();
      expect(result.tableNumber).toEqual('Table A1');
      expect(result.tenantId).toEqual(tenantId);
      expect(mockDb.execute).toHaveBeenCalledTimes(2);
      expect(mockAuditLogService.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId,
          userId,
          action: 'table.create',
          resourceType: 'table',
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'table.created',
        expect.objectContaining({ tenantId }),
      );
    });

    it('should throw NotFoundException if location does not exist', async () => {
      // getLocationById returns empty array â†’ NotFoundException
      mockDb.execute.mockResolvedValueOnce([]);

      await expect(service.createTable(createDto, tenantId, userId))
        .rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.logAudit).not.toHaveBeenCalled();
      // ensure INSERT was never called
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  // â”€â”€â”€ Business Rule 3: getTableById â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('getTableById', () => {
    it('should return a table with location details by ID', async () => {
      const mockResult = {
        ...mockTableRecord,
        'location.id': locationId,
        'location.name': 'Main Restaurant',
        'location.addressLine1': '123 Main St',
        'location.city': 'Anytown',
        'location.state': 'CA',
        'location.zipCode': null,
        'location.phoneNumber': null,
        'location.email': null,
        'location.addressLine2': null,
      };
      mockDb.execute.mockResolvedValueOnce([mockResult]);

      const result = await service.getTableById(tableId, locationId, tenantId);

      expect(result).toBeDefined();
      expect(result.id).toEqual(tableId);
      expect(result.location).toBeDefined();
      expect(result.location.name).toEqual('Main Restaurant');
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if table not found for tenant', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      await expect(service.getTableById(tableId, locationId, tenantId))
        .rejects.toThrow(NotFoundException);
    });

    it('should not return table from another location (tenant isolation)', async () => {
      // Empty result for wrong locationId combination
      mockDb.execute.mockResolvedValueOnce([]);

      await expect(service.getTableById(tableId, 'wrong-location', tenantId))
        .rejects.toThrow(NotFoundException);
    });
  });

  // â”€â”€â”€ Business Rule 4 & 5: updateTable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('updateTable', () => {
    const updateDto: UpdateTableDto = {
      tableNumber: 'New Table Name',
      capacity: 3,
      status: TableStatus.OCCUPIED,
    };

    it('should update a table and log audit', async () => {
      const updatedRecord = { ...mockTableRecord, ...updateDto };

      // getTableByIdInternal (SELECT) â†’ UPDATE RETURNING
      mockDb.execute
        .mockResolvedValueOnce([mockTableRecord]) // internal getById
        .mockResolvedValueOnce([updatedRecord]);  // UPDATE RETURNING

      const result = await service.updateTable(tableId, locationId, updateDto, tenantId, userId);

      expect(result.tableNumber).toEqual('New Table Name');
      expect(result.capacity).toEqual(3);
      expect(mockDb.execute).toHaveBeenCalledTimes(2);
      expect(mockAuditLogService.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'table.update',
          resourceId: updatedRecord.id,
          oldValues: mockTableRecord,
          newValues: updatedRecord,
        }),
      );
    });

    it('should throw NotFoundException if table not found', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      await expect(service.updateTable(tableId, locationId, updateDto, tenantId, userId))
        .rejects.toThrow(NotFoundException);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  // â”€â”€â”€ Business Rule 6 & 7: deleteTable â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('deleteTable', () => {
    it('should delete a table and log audit', async () => {
      // getTableByIdInternal â†’ DELETE
      mockDb.execute
        .mockResolvedValueOnce([mockTableRecord]) // internal getById
        .mockResolvedValueOnce([]);                // DELETE (void)

      await service.deleteTable(tableId, locationId, tenantId, userId);

      expect(mockDb.execute).toHaveBeenCalledTimes(2);
      expect(mockAuditLogService.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'table.delete',
          resourceId: tableId,
          oldValues: mockTableRecord,
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'table.deleted',
        expect.objectContaining({ tableId }),
      );
    });

    it('should throw NotFoundException if table not found', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      await expect(service.deleteTable(tableId, locationId, tenantId, userId))
        .rejects.toThrow(NotFoundException);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  // â”€â”€â”€ getTables (requires locationId in queryParams) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('getTables', () => {
    it('should return tables filtered by locationId and tenantId', async () => {
      const tableList = [mockTableRecord];
      mockDb.execute
        .mockResolvedValueOnce([mockLocation]) // getLocationById
        .mockResolvedValueOnce(tableList);     // SELECT tables

      const queryParams: TableQueryParamsDto = { restaurantId: locationId };
      const result = await service.getTables(queryParams, tenantId);

      expect(result).toHaveLength(1);
      expect(result[0].tableNumber).toEqual('Table A1');
    });

    it('should return available tables only when status filter applied', async () => {
      const availableTable = { ...mockTableRecord, status: TableStatus.AVAILABLE };
      mockDb.execute
        .mockResolvedValueOnce([mockLocation])
        .mockResolvedValueOnce([availableTable]);

      const queryParams: TableQueryParamsDto = {
        restaurantId: locationId,
        status: TableStatus.AVAILABLE,
      };
      const result = await service.getTables(queryParams, tenantId);

      expect(result).toHaveLength(1);
      expect(result[0].status).toEqual(TableStatus.AVAILABLE);
    });

    it('should throw BadRequestException when locationId is missing from queryParams', async () => {
      // The real service throws BadRequestException when locationId is absent
      const { BadRequestException } = await import('@nestjs/common');
      const emptyParams: TableQueryParamsDto = {};

      await expect(service.getTables(emptyParams, tenantId))
        .rejects.toThrow(BadRequestException);
    });
  });
});

// â”€â”€â”€ TablesController Unit Tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Business Rule 8: Controller dispatches correctly to service methods

describe('TablesController', () => {
  let controller: TablesController;
  let service: { [K in 'findAll' | 'create' | 'updateStatus' | 'assignOrder' | 'mergeTables' | 'splitTable']: jest.Mock };

  // Real controller uses req.user.tenantId
  const mockReq = {
    user: { tenantId, userId, email: 'user1@example.com' },
  } as any;

  beforeEach(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      assignOrder: jest.fn(),
      mergeTables: jest.fn(),
      splitTable: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      providers: [
        { provide: TablesService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<TablesController>(TablesController);
    service = module.get(TablesService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.findAll on GET / (findAll dispatch)', async () => {
    const query = { status: [TableStatus.AVAILABLE] };
    const expectedResult = [{ id: tableId, tableNumber: 'T1' }];
    (service.findAll as jest.Mock).mockResolvedValue(expectedResult);

    expect(await controller.findAll(mockReq, query as any)).toEqual(expectedResult);
    expect(service.findAll).toHaveBeenCalledWith(tenantId, query);
  });

  it('should call service.create on POST / (create dispatch)', async () => {
    const createDto: CreateTableDto = {
      name: 'T1',
      location: 'main_dining_hall',
      restaurantId: locationId,
      capacity: 4,
      shape: TableShape.RECTANGLE,
      status: TableStatus.AVAILABLE,
    };
    const expectedResult = { id: tableId, ...createDto, tenantId };
    (service.create as jest.Mock).mockResolvedValue(expectedResult);

    expect(await controller.create(mockReq, createDto as any)).toEqual(expectedResult);
    expect(service.create).toHaveBeenCalledWith(tenantId, createDto);
  });

  it('should call service.updateStatus on PUT /:id/status (status update dispatch)', async () => {
    const statusDto = { status: TableStatus.OCCUPIED };
    const expectedResult = { id: tableId, status: TableStatus.OCCUPIED };
    (service.updateStatus as jest.Mock).mockResolvedValue(expectedResult);

    expect(await controller.updateStatus(mockReq, tableId, statusDto as any)).toEqual(expectedResult);
    expect(service.updateStatus).toHaveBeenCalledWith(tenantId, tableId, statusDto);
  });

  it('should call service.assignOrder on POST /:id/assign-order (order assignment dispatch)', async () => {
    const assignDto = { orderId: 'order-001' };
    const expectedResult = { id: tableId, currentOrderId: (assignDto as any).orderId };
    (service.assignOrder as jest.Mock).mockResolvedValue(expectedResult);

    expect(await controller.assignOrder(mockReq, tableId, assignDto as any)).toEqual(expectedResult);
    expect(service.assignOrder).toHaveBeenCalledWith(tenantId, tableId, (assignDto as any).orderId);
  });

  it('should call service.mergeTables on POST /merge (merge dispatch)', async () => {
    const mergeDto = { tableIds: [tableId, 'table-uuid-002'] };
    const expectedResult = { merged: true };
    (service.mergeTables as jest.Mock).mockResolvedValue(expectedResult);

    expect(await controller.mergeTables(mockReq, mergeDto as any)).toEqual(expectedResult);
    expect(service.mergeTables).toHaveBeenCalledWith(tenantId, (mergeDto as any).tableIds);
  });

  it('should call service.splitTable on POST /split (split dispatch)', async () => {
    const splitDto = { tableId };
    const expectedResult = { split: true };
    (service.splitTable as jest.Mock).mockResolvedValue(expectedResult);

    expect(await controller.splitTable(mockReq, splitDto as any)).toEqual(expectedResult);
    expect(service.splitTable).toHaveBeenCalledWith(tenantId, (splitDto as any).tableId);
  });
});

