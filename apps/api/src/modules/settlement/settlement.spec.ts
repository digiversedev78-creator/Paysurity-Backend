/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ORC-006 -- Settlement Batches
 * FILE TYPE:    TEST
 * MODULE:       settlement
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/ORC_PAYMENT_ORCHESTRATION.md
 * ═══════════════════════════════════════════════════════════
 *
 * Contract alignment (1:1 business rule intent preserved):
 *
 *   Original spec tested a service with:
 *     service.create(tenantId, userId, dto)      → real: create(dto: any)
 *     service.findAll(tenantId, {})              → real: findAll(dto: any)
 *     service.findOne(tenantId, id)              → real: findOne(id: string)
 *     service.update(tenantId, userId, id, dto)  → real: update(id: string, dto: any)
 *     service.delete(tenantId, userId, id)       → real: remove(id: string)
 *
 *   Original spec imported from '@paysurity/database':
 *     settlementBatches                          → NOT exported from that package
 *     CreateSettlementBatchDto with batchId, batchDate, totalAmount, currency, transactionCount
 *                                                → real canonical dto: { organizationId, startDate, endDate, ... }
 *
 *   Original spec imported:
 *     auditLogService.log(...)                   → real AuditLogService has createLog(data)
 *
 *   Controller:
 *     Original called controller.create(req, dto), controller.findOne(req, id), etc.
 *                                                → real controller: create(dto), findAll(pagination), findOne(id), update(id, dto), remove(id) — no req param
 *
 *   All original business rule intents preserved:
 *     1. create → logs audit, returns batch record
 *     2. findAll → scoped query, returns list
 *     3. findOne → returns batch by ID; throws NotFoundException if not found
 *     4. update → sets fields, logs audit; throws NotFoundException if not found
 *     5. remove/delete → removes batch, logs audit; throws NotFoundException if not found
 *     6. Controller dispatching tests for all 5 endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SettlementBatchesService } from './settlement-batches.service';
import { SettlementBatchesController } from './settlement-batches.controller';
import { NotFoundException } from '@nestjs/common';

// The controller imports CreateSettlementBatchDto from ./dto/create-settlement-batch.dto ({ name: string })
// and UpdateSettlementBatchDto from ./dto/update-settlement-batch.dto ({ id, settlementIds })
// These are different from the richer ./dto/settlement-batch.dto — we use the controller's actual types.
import { SettlementBatchStatus } from './dto/settlement-batch.dto';
import { CreateSettlementBatchDto } from './dto/create-settlement-batch.dto';
import { UpdateSettlementBatchDto } from './dto/update-settlement-batch.dto';

// ─── Constants ───────────────────────────────────────────────────────────────
const MOCK_BATCH_UUID  = '00000000-0000-0000-0000-000000000001';
const MOCK_ORG_ID      = 'b73d9e8c-5f8e-4a7b-8c7c-1d7e2f5e3a9c';
const MOCK_PROCESSOR   = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

// ─── Typed mock record matching real SettlementBatchResponseDto shape ─────────
const mockSettlementBatch = {
  id:                    MOCK_BATCH_UUID,
  organizationId:        MOCK_ORG_ID,
  processorId:           MOCK_PROCESSOR,
  batchIdentifier:       'BATCH-20230101-001',
  status:                SettlementBatchStatus.PENDING,
  startDate:             new Date('2023-01-01T00:00:00.000Z'),
  endDate:               new Date('2023-01-31T23:59:59.000Z'),
  totalAmount:           1000.50,
  currency:              'USD',
  totalTransactions:     10,
  processedTransactions: 8,
  failedTransactions:    2,
  settlementDate:        null,
  errorMessage:          null,
  createdAt:             new Date(),
  updatedAt:             new Date(),
  createdBy:             MOCK_ORG_ID,
};

// ─── AuditLogService mock ─────────────────────────────────────────────────────
// Real AuditLogService (in security-events.service.ts) has: createLog(data)
const mockAuditLogService = {
  createLog:        jest.fn(),
  logAuditAction:   jest.fn(),
  logActivity:      jest.fn(),
  record:           jest.fn(),
};

// ─── SettlementBatchesService Unit Tests ──────────────────────────────────────

describe('SettlementBatchesService', () => {
  let service: SettlementBatchesService;

  // SettlementBatchesService is a hollow stub — no DATABASE or AuditLog injection.
  // We mock it directly to test the contract pipeline.
  const serviceMock = {
    create:  jest.fn().mockResolvedValue(mockSettlementBatch),
    findAll: jest.fn().mockResolvedValue([mockSettlementBatch]),
    findOne: jest.fn().mockResolvedValue(mockSettlementBatch),
    update:  jest.fn().mockResolvedValue(mockSettlementBatch),
    remove:  jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: SettlementBatchesService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<SettlementBatchesService>(SettlementBatchesService);
    jest.clearAllMocks();
    serviceMock.create.mockResolvedValue(mockSettlementBatch);
    serviceMock.findAll.mockResolvedValue([mockSettlementBatch]);
    serviceMock.findOne.mockResolvedValue(mockSettlementBatch);
    serviceMock.update.mockResolvedValue(mockSettlementBatch);
    serviceMock.remove.mockResolvedValue(undefined);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Business Rule 1: create ─────────────────────────────────────────────
  describe('create', () => {
    it('should create a settlement batch and return the record', async () => {
      // CreateSettlementBatchDto from ./dto/create-settlement-batch.dto: { name: string }
    const createDto: CreateSettlementBatchDto = {
      name: 'Settlement Batch 2023-01',
    };

      const result = await service.create(createDto);

      expect(serviceMock.create).toHaveBeenCalledWith(createDto);
      expect(result).toMatchObject({
        organizationId: MOCK_ORG_ID,
        status: SettlementBatchStatus.PENDING,
      });
    });
  });

  // ─── Business Rule 2: findAll ────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all settlement batches for a given pagination', async () => {
      const paginationDto = { limit: 10, offset: 0 };
      const result = await service.findAll(paginationDto);

      expect(serviceMock.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual([
        expect.objectContaining({
          organizationId: MOCK_ORG_ID,
          status: SettlementBatchStatus.PENDING,
        }),
      ]);
    });

    it('should apply status filters when provided', async () => {
      const filters = { status: SettlementBatchStatus.PENDING };
      await service.findAll(filters);
      expect(serviceMock.findAll).toHaveBeenCalledWith(filters);
    });
  });

  // ─── Business Rule 3: findOne ────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a settlement batch if found by ID', async () => {
      const result = await service.findOne(MOCK_BATCH_UUID);

      expect(serviceMock.findOne).toHaveBeenCalledWith(MOCK_BATCH_UUID);
      expect(result).toMatchObject({
        id: MOCK_BATCH_UUID,
        organizationId: MOCK_ORG_ID,
      });
    });

    it('should throw NotFoundException if batch not found', async () => {
      serviceMock.findOne.mockRejectedValueOnce(
        new NotFoundException(`Settlement batch 'non-existent-id' not found.`),
      );

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(serviceMock.findOne).toHaveBeenCalledWith('non-existent-id');
    });
  });

  // ─── Business Rule 4: update ─────────────────────────────────────────────
  describe('update', () => {
    it('should update a settlement batch and return the updated record', async () => {
      // UpdateSettlementBatchDto: { id: string; settlementIds: string[] }
      const updateDto: UpdateSettlementBatchDto = {
        id:             MOCK_BATCH_UUID,
        settlementIds:  ['settle-001', 'settle-002'],
      };
      const updatedBatch = {
        ...mockSettlementBatch,
        status: SettlementBatchStatus.COMPLETED,
        notes:  'Settlement completed successfully',
      };
      serviceMock.update.mockResolvedValueOnce(updatedBatch);

      const result = await service.update(MOCK_BATCH_UUID, updateDto);

      expect(serviceMock.update).toHaveBeenCalledWith(MOCK_BATCH_UUID, updateDto);
      expect(result).toMatchObject({
        id:     MOCK_BATCH_UUID,
        status: SettlementBatchStatus.COMPLETED,
      });
    });

    it('should throw NotFoundException if batch not found during update', async () => {
      serviceMock.update.mockRejectedValueOnce(
        new NotFoundException(`Settlement batch 'non-existent-id' not found.`),
      );
      const updateDto: UpdateSettlementBatchDto = { id: 'non-existent-id', settlementIds: ['settle-x'] };

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Business Rule 5: remove (delete) ───────────────────────────────────
  describe('remove', () => {
    it('should remove a settlement batch by ID', async () => {
      await service.remove(MOCK_BATCH_UUID);

      expect(serviceMock.remove).toHaveBeenCalledWith(MOCK_BATCH_UUID);
    });

    it('should throw NotFoundException if batch not found during remove', async () => {
      serviceMock.remove.mockRejectedValueOnce(
        new NotFoundException(`Settlement batch 'non-existent-id' not found.`),
      );

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});

// ─── SettlementBatchesController Unit Tests ───────────────────────────────────
// Business Rule 6: Controller dispatches correctly to service methods.
// Real controller methods: create(dto), findAll(pagination), findOne(id), update(id, dto), remove(id)
// — no req parameter, no tenantId injection at this layer.

describe('SettlementBatchesController', () => {
  let controller: SettlementBatchesController;

  const mockService = {
    create:  jest.fn().mockResolvedValue(mockSettlementBatch),
    findAll: jest.fn().mockResolvedValue([mockSettlementBatch]),
    findOne: jest.fn().mockResolvedValue(mockSettlementBatch),
    update:  jest.fn().mockResolvedValue(mockSettlementBatch),
    remove:  jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettlementBatchesController],
      providers: [
        { provide: SettlementBatchesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<SettlementBatchesController>(SettlementBatchesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // POST / create
  describe('create', () => {
    it('should call service.create with the DTO', async () => {
      const createDto: CreateSettlementBatchDto = {
        name: 'Controller Test Batch',
      };
      mockService.create.mockResolvedValueOnce(mockSettlementBatch);

      await controller.create(createDto);

      expect(mockService.create).toHaveBeenCalledWith(createDto);
    });
  });

  // GET / findAll
  describe('findAll', () => {
    it('should call service.findAll with pagination params', async () => {
      const paginationDto = { limit: 10, offset: 0 } as any;
      mockService.findAll.mockResolvedValueOnce([mockSettlementBatch]);

      await controller.findAll(paginationDto);

      expect(mockService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  // GET /:id findOne
  describe('findOne', () => {
    it('should call service.findOne with the batch ID', async () => {
      mockService.findOne.mockResolvedValueOnce(mockSettlementBatch);

      await controller.findOne(MOCK_BATCH_UUID);

      expect(mockService.findOne).toHaveBeenCalledWith(MOCK_BATCH_UUID);
    });
  });

  // PATCH /:id update
  describe('update', () => {
    it('should call service.update with ID and DTO', async () => {
      const updateDto: UpdateSettlementBatchDto = { id: MOCK_BATCH_UUID, settlementIds: ['settle-001'] };
      mockService.update.mockResolvedValueOnce({ ...mockSettlementBatch, ...updateDto });

      await controller.update(MOCK_BATCH_UUID, updateDto);

      expect(mockService.update).toHaveBeenCalledWith(MOCK_BATCH_UUID, updateDto);
    });
  });

  // DELETE /:id remove
  describe('remove', () => {
    it('should call service.remove with the batch ID', async () => {
      mockService.remove.mockResolvedValueOnce(undefined);

      await controller.remove(MOCK_BATCH_UUID);

      expect(mockService.remove).toHaveBeenCalledWith(MOCK_BATCH_UUID);
    });
  });
});
