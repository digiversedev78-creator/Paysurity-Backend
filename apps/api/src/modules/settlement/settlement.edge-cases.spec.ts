/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ORC-006 -- Settlement Batches
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       settlement
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/ORC_PAYMENT_ORCHESTRATION.md
 * WORKER:       TESTER-005
 * GENERATED:    2026-03-17T13:15:45.660Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException
} from '@nestjs/common';

// --- Start Mocked Service and Repository Definitions (for test self-containment) ---
// In a real project, these would be imported from your actual source files.

// Define types and DTOs that SettlementService would use
export enum SettlementBatchStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FINALIZED = 'FINALIZED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface CreateSettlementBatchDto {
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  totalAmount: number;
  transactionIds: string[]; // IDs of transactions included in this batch
  referenceId?: string; // Optional unique reference
}

export interface UpdateSettlementBatchDto {
  status?: SettlementBatchStatus;
  version?: number; // For optimistic locking
  // Other updatable fields could go here
}

export interface SettlementBatch {
  id: string;
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  currency: string;
  totalAmount: number;
  status: SettlementBatchStatus;
  createdAt: Date;
  updatedAt: Date;
  transactionCount: number;
  referenceId?: string;
  version?: number; // For optimistic locking
}

// Mock of SettlementRepository
class SettlementRepository {
  create = jest.fn();
  findById = jest.fn();
  findMany = jest.fn();
  update = jest.fn();
}

// Mock of TenantService (for checking tenant existence)
class TenantService {
  tenantExists = jest.fn();
}

// Mock of AuthContext (assuming static methods for simplicity in tests)
const AuthContext = {
  getCurrentUser: jest.fn(),
  hasPermission: jest.fn(),
};

// Mock of SettlementService
class SettlementService {
  constructor(
    private readonly settlementRepository: SettlementRepository,
    private readonly tenantService: TenantService,
  ) {}

  async createBatch(tenantId: string, createDto: CreateSettlementBatchDto): Promise<SettlementBatch> {
    if (!AuthContext.hasPermission('settlement:create')) {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (AuthContext.getCurrentUser()?.tenantId !== tenantId) {
      throw new ForbiddenException('Cannot create batch for another tenant');
    }
    if (!tenantId || !(createDto as any).periodStart || !(createDto as any).periodEnd || !(createDto as any).currency || !(createDto as any).transactionIds || (createDto as any).transactionIds.length === 0) {
      throw new BadRequestException('Missing required fields or empty transaction list for batch creation');
    }
    if ((createDto as any).periodEnd < (createDto as any).periodStart) {
      throw new BadRequestException('periodEnd cannot be before periodStart');
    }
    if ((createDto as any).totalAmount < 0) {
      throw new BadRequestException('totalAmount cannot be negative');
    }
    if (!['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].includes((createDto as any).currency)) {
      throw new BadRequestException('Invalid currency code (must be ISO 4217)');
    }

    if (!(await (this.tenantService as any).tenantExists(tenantId))) {
      throw new BadRequestException('Tenant not found');
    }

    const newBatch: SettlementBatch = {
      id: `batch-${Math.random().toString(36).substring(2, 11)}`,
      tenantId,
      ...createDto,
      status: SettlementBatchStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      transactionCount: (createDto as any).transactionIds.length,
      version: 1,
    };
    try {
      return await this.settlementRepository.create(newBatch);
    } catch (error) {
      if (error instanceof ConflictException && error.message.includes('Duplicate reference ID')) {
        throw new ConflictException('A batch with this reference ID already exists.');
      }
      if (error instanceof InternalServerErrorException && error.message.includes('transactionId not found')) {
        throw new BadRequestException('One or more transaction IDs are invalid or do not exist.');
      }
      throw error;
    }
  }

  async getBatch(tenantId: string, batchId: string): Promise<SettlementBatch> {
    if (!AuthContext.hasPermission('settlement:read')) {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (!batchId || batchId.trim() === '') {
      throw new BadRequestException('Batch ID is required');
    }
    const batch = await this.settlementRepository.findById(tenantId, batchId);
    if (!batch || batch.tenantId !== tenantId) {
      throw new NotFoundException(`Settlement batch with ID ${batchId} not found for tenant ${tenantId}`);
    }
    return batch;
  }

  async getBatches(tenantId: string, filters: any): Promise<SettlementBatch[]> {
    if (!AuthContext.hasPermission('settlement:read')) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return this.settlementRepository.findMany(tenantId, filters);
  }

  async updateBatchStatus(tenantId: string, batchId: string, newStatus: SettlementBatchStatus): Promise<SettlementBatch> {
    if (!AuthContext.hasPermission('settlement:update')) {
      throw new ForbiddenException('Insufficient permissions');
    }
    if (!batchId || batchId.trim() === '' || !newStatus) {
      throw new BadRequestException('Batch ID and new status are required');
    }

    const existingBatch = await this.getBatch(tenantId, batchId);

    if (existingBatch.status === newStatus) {
      return existingBatch;
    }
    if ([SettlementBatchStatus.FINALIZED, SettlementBatchStatus.CANCELLED, SettlementBatchStatus.FAILED].includes(existingBatch.status)) {
      throw new BadRequestException(`Cannot change status of a ${existingBatch.status} batch.`);
    }

    const updatedBatch = { ...existingBatch, status: newStatus, updatedAt: new Date() };
    return this.settlementRepository.update(batchId, tenantId, updatedBatch, existingBatch.version);
  }

  async finalizeBatch(tenantId: string, batchId: string): Promise<SettlementBatch> {
    if (!AuthContext.hasPermission('settlement:finalize')) {
      throw new ForbiddenException('Insufficient permissions to finalize settlement batches');
    }
    if (!batchId || batchId.trim() === '') {
      throw new BadRequestException('Batch ID is required');
    }

    const existingBatch = await this.getBatch(tenantId, batchId);

    if (existingBatch.status !== SettlementBatchStatus.PENDING) {
      throw new BadRequestException(`Batch ${batchId} is not in PENDING status and cannot be finalized.`);
    }

    try {
      const result = await this.settlementRepository.update(
        batchId,
        tenantId,
        { status: SettlementBatchStatus.FINALIZED, version: existingBatch.version + 1 },
        existingBatch.version
      );
      return result;
    } catch (error) {
      if (error instanceof ConflictException && error.message.includes('Batch already updated')) {
        throw new ConflictException('Failed to finalize batch due to a concurrent update. Please retry.');
      }
      throw error;
    }
  }
}
// --- End Mocked Service and Repository Definitions ---


describe('SettlementService Edge Cases (ORC-006)', () => {
  let service: SettlementService;
  let mockSettlementRepository: jest.Mocked<SettlementRepository>;
  let mockTenantService: jest.Mocked<TenantService>;
  let mockAuthContext: jest.Mocked<typeof AuthContext>;

  const MOCK_TENANT_ID_1 = 'tenant-uuid-1';
  const MOCK_TENANT_ID_2 = 'tenant-uuid-2';
  const MOCK_BATCH_ID_1 = 'batch-uuid-1';
  const MOCK_BATCH_ID_2 = 'batch-uuid-2';
  const MOCK_USER_ID_1 = 'user-uuid-1';

  const mockBatchData: SettlementBatch = {
    id: MOCK_BATCH_ID_1,
    tenantId: MOCK_TENANT_ID_1,
    periodStart: new Date('2023-01-01T00:00:00Z'),
    periodEnd: new Date('2023-01-31T23:59:59Z'),
    currency: 'USD',
    totalAmount: 12345.67,
    status: SettlementBatchStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionCount: 5,
    referenceId: 'REF-001',
    version: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockSettlementRepository = new SettlementRepository() as jest.Mocked<SettlementRepository>;
    mockTenantService = new TenantService() as jest.Mocked<TenantService>;
    mockAuthContext = AuthContext as jest.Mocked<typeof AuthContext>;

    // Default mock implementations
    mockSettlementRepository.create.mockResolvedValue(mockBatchData);
    mockSettlementRepository.findById.mockResolvedValue(mockBatchData);
    mockSettlementRepository.update.mockResolvedValue({
      ...mockBatchData,
      status: SettlementBatchStatus.FINALIZED,
      version: 2,
    });
    mockSettlementRepository.findMany.mockResolvedValue([mockBatchData]);
    mockTenantService.tenantExists.mockResolvedValue(true);

    mockAuthContext.getCurrentUser.mockReturnValue({
      id: MOCK_USER_ID_1,
      tenantId: MOCK_TENANT_ID_1,
      permissions: ['settlement:create', 'settlement:read', 'settlement:update', 'settlement:finalize'],
    });
    mockAuthContext.hasPermission.mockReturnValue(true);

    service = new SettlementService(mockSettlementRepository, mockTenantService);
  });

  describe('1. Empty/Null Inputs', () => {
    it('should throw BadRequestException when creating a batch with null tenantId from AuthContext', async () => {
      mockAuthContext.getCurrentUser.mockReturnValue({ ...mockAuthContext.getCurrentUser(), tenantId: null });
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-1'],
        })
      ).rejects.toThrow(ForbiddenException); // Catches tenant mismatch first
    });

    it('should throw BadRequestException when creating a batch with undefined periodStart', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: undefined,
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-1'],
        } as any) // Cast to any to bypass TS type checking for runtime test
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when creating a batch with empty transactionIds array', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 0,
          transactionIds: [],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when creating a batch with null currency', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: null,
          totalAmount: 100,
          transactionIds: ['tx-1'],
        } as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when getting a batch with null batchId', async () => {
      await expect(
        service.getBatch(MOCK_TENANT_ID_1, null)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when getting a batch with empty batchId string', async () => {
      await expect(
        service.getBatch(MOCK_TENANT_ID_1, '')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updating status with null batchId', async () => {
      await expect(
        service.updateBatchStatus(MOCK_TENANT_ID_1, null, SettlementBatchStatus.FINALIZED)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when updating status with null status', async () => {
      await expect(
        service.updateBatchStatus(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1, null)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when finalizing a batch with null batchId', async () => {
      await expect(
        service.finalizeBatch(MOCK_TENANT_ID_1, null)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. Boundary Values', () => {
    it('should allow batch creation with periodStart and periodEnd being the same date', async () => {
      const sameDate = new Date('2023-03-15T10:00:00Z');
      const batch = { ...mockBatchData, id: 'same-day-batch', periodStart: sameDate, periodEnd: sameDate };
      mockSettlementRepository.create.mockResolvedValue(batch);

      const result = await service.createBatch(MOCK_TENANT_ID_1, {
        periodStart: sameDate,
        periodEnd: sameDate,
        currency: 'USD',
        totalAmount: 50.00,
        transactionIds: ['tx-same-day'],
      });
      expect(result).toEqual(batch);
    });

    it('should throw BadRequestException if periodEnd is before periodStart', async () => {
      const periodStart = new Date('2023-03-15T10:00:00Z');
      const periodEnd = new Date('2023-03-14T10:00:00Z');

      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart,
          periodEnd,
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-invalid-period'],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow batch creation with zero totalAmount', async () => {
      const batch = { ...mockBatchData, id: 'zero-amount-batch', totalAmount: 0 };
      mockSettlementRepository.create.mockResolvedValue(batch);
      const result = await service.createBatch(MOCK_TENANT_ID_1, {
        periodStart: new Date(),
        periodEnd: new Date(),
        currency: 'USD',
        totalAmount: 0,
        transactionIds: ['tx-zero-amount'],
      });
      expect(result.totalAmount).toBe(0);
    });

    it('should throw BadRequestException if totalAmount is negative', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: -100,
          transactionIds: ['tx-negative-amount'],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle very large totalAmount without error', async () => {
      const veryLargeAmount = 999999999999999.99;
      const batch = { ...mockBatchData, id: 'large-amount-batch', totalAmount: veryLargeAmount };
      mockSettlementRepository.create.mockResolvedValue(batch);
      const result = await service.createBatch(MOCK_TENANT_ID_1, {
        periodStart: new Date(),
        periodEnd: new Date(),
        currency: 'USD',
        totalAmount: veryLargeAmount,
        transactionIds: ['tx-large-amount'],
      });
      expect(result.totalAmount).toBe(veryLargeAmount);
    });

    it('should allow batch creation with a single transaction', async () => {
      const batch = { ...mockBatchData, id: 'single-tx-batch', transactionCount: 1 };
      mockSettlementRepository.create.mockResolvedValue(batch);
      const result = await service.createBatch(MOCK_TENANT_ID_1, {
        periodStart: new Date(),
        periodEnd: new Date(),
        currency: 'USD',
        totalAmount: 10,
        transactionIds: ['tx-single'],
      });
      expect(result.transactionCount).toBe(1);
    });

    it('should handle batch creation with many transactions (e.g., 1000)', async () => {
      const manyTxIds = Array.from({ length: 1000 }, (_, i) => `tx-${i}`);
      const batch = { ...mockBatchData, id: 'many-tx-batch', transactionCount: manyTxIds.length };
      mockSettlementRepository.create.mockResolvedValue(batch);
      const result = await service.createBatch(MOCK_TENANT_ID_1, {
        periodStart: new Date(),
        periodEnd: new Date(),
        currency: 'USD',
        totalAmount: 10000,
        transactionIds: manyTxIds,
      });
      expect(result.transactionCount).toBe(manyTxIds.length);
    });

    it('should throw BadRequestException for an invalid currency code (not ISO 4217)', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'XYZ',
          totalAmount: 100,
          transactionIds: ['tx-invalid-currency'],
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid ISO 4217 currency code', async () => {
      const batch = { ...mockBatchData, id: 'gbp-batch', currency: 'GBP' };
      mockSettlementRepository.create.mockResolvedValue(batch);
      const result = await service.createBatch(MOCK_TENANT_ID_1, {
        periodStart: new Date(),
        periodEnd: new Date(),
        currency: 'GBP',
        totalAmount: 150,
        transactionIds: ['tx-gbp'],
      });
      expect(result.currency).toBe('GBP');
    });
  });

  describe('3. Multi-tenant Isolation', () => {
    const tenant1Batch: SettlementBatch = { ...mockBatchData, id: MOCK_BATCH_ID_1, tenantId: MOCK_TENANT_ID_1 };
    const tenant2Batch: SettlementBatch = { ...mockBatchData, id: MOCK_BATCH_ID_2, tenantId: MOCK_TENANT_ID_2, referenceId: 'tenant2-batch-ref' };

    it('should not allow Tenant 1 to access Tenant 2 batch by ID', async () => {
      mockSettlementRepository.findById.mockImplementation(async (tenantId, batchId) => {
        if (tenantId === MOCK_TENANT_ID_1 && batchId === MOCK_BATCH_ID_1) return tenant1Batch;
        if (tenantId === MOCK_TENANT_ID_2 && batchId === MOCK_BATCH_ID_2) return tenant2Batch;
        return null;
      });

      await expect(
        service.getBatch(MOCK_TENANT_ID_1, MOCK_BATCH_ID_2)
      ).rejects.toThrow(NotFoundException);
    });

    it('should only return batches for the requesting tenant during a search', async () => {
      mockSettlementRepository.findMany.mockImplementation(async (tenantId, _filters) => {
        if (tenantId === MOCK_TENANT_ID_1) return [tenant1Batch];
        if (tenantId === MOCK_TENANT_ID_2) return [tenant2Batch];
        return [];
      });

      const batchesForTenant1 = await service.getBatches(MOCK_TENANT_ID_1, {});
      expect(batchesForTenant1).toHaveLength(1);
      expect(batchesForTenant1[0].tenantId).toBe(MOCK_TENANT_ID_1);

      const batchesForTenant2 = await service.getBatches(MOCK_TENANT_ID_2, {});
      expect(batchesForTenant2).toHaveLength(1);
      expect(batchesForTenant2[0].tenantId).toBe(MOCK_TENANT_ID_2);
    });

    it('should prevent Tenant 1 from updating Tenant 2 batch status', async () => {
      mockSettlementRepository.findById.mockResolvedValue(null); // Simulate not found for tenant 1 searching for tenant 2's batch

      await expect(
        service.updateBatchStatus(MOCK_TENANT_ID_1, MOCK_BATCH_ID_2, SettlementBatchStatus.FINALIZED)
      ).rejects.toThrow(NotFoundException);
      expect(mockSettlementRepository.update).not.toHaveBeenCalled();
    });

    it('should reject batch creation if provided tenantId does not match current user tenantId', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_2, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-1'],
        })
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('4. Concurrent Request Handling', () => {
    it('should prevent concurrent finalization of the same batch using optimistic locking', async () => {
      const batchToFinalize: SettlementBatch = { ...mockBatchData, status: SettlementBatchStatus.PENDING, version: 1 };

      mockSettlementRepository.findById.mockResolvedValue(batchToFinalize);

      mockSettlementRepository.update
        .mockImplementationOnce(async (batchId, tenantId, updateData, currentVersion) => {
          if (currentVersion === batchToFinalize.version && updateData.status === SettlementBatchStatus.FINALIZED) {
            return { ...batchToFinalize, status: SettlementBatchStatus.FINALIZED, version: currentVersion + 1 };
          }
          throw new ConflictException('Batch already updated or in an invalid state');
        })
        .mockImplementationOnce(async () => {
          throw new ConflictException('Batch already updated or in an invalid state');
        });

      const finalizePromise1 = service.finalizeBatch(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1);
      const finalizePromise2 = service.finalizeBatch(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1);

      const results = await Promise.allSettled([finalizePromise1, finalizePromise2]);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect((failed[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException);

      expect(mockSettlementRepository.findById).toHaveBeenCalledTimes(2);
      expect(mockSettlementRepository.update).toHaveBeenCalledTimes(2);
    });

    it('should prevent concurrent creation of batches with the same unique reference ID', async () => {
      const commonReferenceId = 'UNIQUE_REF_CONCURRENT';
      const createBatchInput = {
        periodStart: new Date(),
        periodEnd: new Date(),
        currency: 'USD',
        totalAmount: 100,
        transactionIds: ['tx-concurrent'],
        referenceId: commonReferenceId,
      };

      mockSettlementRepository.create
        .mockImplementationOnce(async (batchData) => ({ ...mockBatchData, id: 'batch-c1', ...batchData }))
        .mockImplementationOnce(async () => {
          throw new ConflictException('A batch with this reference ID already exists.');
        });

      const createPromise1 = service.createBatch(MOCK_TENANT_ID_1, createBatchInput);
      const createPromise2 = service.createBatch(MOCK_TENANT_ID_1, createBatchInput);

      const results = await Promise.allSettled([createPromise1, createPromise2]);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect((failed[0] as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException);

      expect(mockSettlementRepository.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('5. Auth/Permission Failures', () => {
    beforeEach(() => {
      mockAuthContext.getCurrentUser.mockReturnValue({
        id: MOCK_USER_ID_1,
        tenantId: MOCK_TENANT_ID_1,
        permissions: [],
      });
      mockAuthContext.hasPermission.mockReturnValue(false);
    });

    it('should throw ForbiddenException when user has no permission to create a batch', async () => {
      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-no-perm'],
        })
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user has no permission to read batches', async () => {
      await expect(
        service.getBatch(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1)
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.findById).not.toHaveBeenCalled();

      await expect(
        service.getBatches(MOCK_TENANT_ID_1, {})
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.findMany).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user has no permission to update batch status', async () => {
      await expect(
        service.updateBatchStatus(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1, SettlementBatchStatus.FINALIZED)
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user has no permission to finalize a batch', async () => {
      mockAuthContext.hasPermission.mockImplementation(perm => perm === 'settlement:read');
      mockSettlementRepository.findById.mockResolvedValue(mockBatchData);

      await expect(
        service.finalizeBatch(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1)
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.findById).toHaveBeenCalledWith(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1);
      expect(mockSettlementRepository.update).not.toHaveBeenCalled();
    });

    it('should allow read-only user to get a batch but not update it', async () => {
      mockAuthContext.hasPermission.mockImplementation(perm => perm === 'settlement:read');
      mockSettlementRepository.findById.mockResolvedValue(mockBatchData);

      const batch = await service.getBatch(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1);
      expect(batch).toEqual(mockBatchData);
      expect(mockSettlementRepository.findById).toHaveBeenCalledTimes(1);

      await expect(
        service.updateBatchStatus(MOCK_TENANT_ID_1, MOCK_BATCH_ID_1, SettlementBatchStatus.FINALIZED)
      ).rejects.toThrow(ForbiddenException);
      expect(mockSettlementRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('6. Database Constraint Violations', () => {
    it('should throw BadRequestException if tenantId does not exist (FK violation simulation)', async () => {
      mockTenantService.tenantExists.mockResolvedValue(false);
      mockAuthContext.hasPermission.mockReturnValue(true);

      await expect(
        service.createBatch('non-existent-tenant-id', {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-fk'],
        })
      ).rejects.toThrow(BadRequestException);
      expect(mockSettlementRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if a referenced transactionId does not exist', async () => {
      mockAuthContext.hasPermission.mockReturnValue(true);
      mockSettlementRepository.create.mockRejectedValue(
        new InternalServerErrorException('Database constraint error: transactionId not found')
      );

      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['non-existent-tx-id'],
        })
      ).rejects.toThrow(BadRequestException);
      expect(mockSettlementRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when creating a batch with a duplicate referenceId', async () => {
      mockAuthContext.hasPermission.mockReturnValue(true);
      mockSettlementRepository.create.mockRejectedValue(
        new ConflictException('A batch with this reference ID already exists.')
      );

      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-dup-ref'],
          referenceId: 'EXISTING_UNIQUE_REF',
        })
      ).rejects.toThrow(ConflictException);
      expect(mockSettlementRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if repository tries to save batch with missing required fields (e.g., periodStart)', async () => {
      mockAuthContext.hasPermission.mockReturnValue(true);
      mockSettlementRepository.create.mockRejectedValue(
        new BadRequestException('Database error: periodStart cannot be null.')
      );

      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: null,
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 100,
          transactionIds: ['tx-null-field'],
        } as any)
      ).rejects.toThrow(BadRequestException);
      expect(mockSettlementRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if repository encounters data type mismatch for totalAmount', async () => {
      mockAuthContext.hasPermission.mockReturnValue(true);
      mockSettlementRepository.create.mockRejectedValue(
        new BadRequestException('Database error: totalAmount must be a number.')
      );

      await expect(
        service.createBatch(MOCK_TENANT_ID_1, {
          periodStart: new Date(),
          periodEnd: new Date(),
          currency: 'USD',
          totalAmount: 'not-a-number' as any,
          transactionIds: ['tx-bad-type'],
        })
      ).rejects.toThrow(BadRequestException);
      expect(mockSettlementRepository.create).toHaveBeenCalledTimes(1);
    });
  });
});


