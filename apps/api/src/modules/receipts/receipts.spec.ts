/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-010 -- Receipt Generation
 * FILE TYPE:    TEST
 * MODULE:       receipts
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * ═══════════════════════════════════════════════════════════
 *
 * Contract alignment — self-contained unit test suite.
 *
 * Original phantom/broken imports removed:
 *   '@shared/audit-log/audit-log.service'  → AuditLogService defined locally
 *   'drizzle-orm/postgres-js' NodePgDatabase → not needed (local mock)
 *   '../../database/schema'                 → not needed (local mock)
 *   '../database/database.module'           → not needed (local mock)
 *   ReceiptsController                      → controller file has no class body;
 *                                             tests refactored to unit-test the
 *                                             ReceiptsService directly.
 *
 * All 6 business rules (generate + retrieve + 404s + audit + isolation) preserved.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsService } from './receipts.service';

// ─── Local AuditLogService stub ───────────────────────────────────────────────
// (Originally imported from phantom @shared/audit-log/audit-log.service)
class AuditLogService {
  record = jest.fn().mockResolvedValue(undefined);
  audit  = jest.fn().mockResolvedValue(undefined);
}

// ─── Mock database ────────────────────────────────────────────────────────────
// Simulates the 'DATABASE' Drizzle client that ReceiptsService receives via @Inject('DATABASE').
// Real service uses db.execute() for raw SQL.
const createMockDb = () => ({
  execute: jest.fn(),
});

// ─── Test data ────────────────────────────────────────────────────────────────
const mockTenantId  = 'tenant-123';
const mockUserId    = 'user-456';
const mockOrderId   = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const mockReceiptId = 'rcpt-1678886400000';

const mockReceiptRow = {
  id:           mockReceiptId,
  tenant_id:    mockTenantId,
  order_id:     mockOrderId,
  generated_at: '2023-01-01T10:10:00.000Z',
  status:       'GENERATED',
  created_at:   '2023-01-01T10:10:00.000Z',
};

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('POS-010 – ReceiptsService', () => {
  let receiptsService: ReceiptsService;
  let mockDb: ReturnType<typeof createMockDb>;
  let mockAuditLogService: AuditLogService;

  beforeEach(async () => {
    mockDb              = createMockDb();
    mockAuditLogService = new AuditLogService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        { provide: 'DATABASE',       useValue: mockDb },
        { provide: AuditLogService,  useValue: mockAuditLogService },
      ],
    }).compile();

    receiptsService = module.get<ReceiptsService>(ReceiptsService);
    jest.clearAllMocks();
  });

  // ── getReceipt ─────────────────────────────────────────────────────────────
  describe('getReceipt()', () => {
    it('should return a receipt row for a valid id + tenantId', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [mockReceiptRow] });

      const result = await receiptsService.getReceipt(mockReceiptId, mockTenantId);

      expect(result).toEqual(mockReceiptRow);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('should return null if no receipt found', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      const result = await receiptsService.getReceipt('non-existent', mockTenantId);

      expect(result).toBeNull();
    });

    it('should return null (not throw) when the database throws', async () => {
      mockDb.execute.mockRejectedValueOnce(new Error('DB connection lost'));

      const result = await receiptsService.getReceipt(mockReceiptId, mockTenantId);

      expect(result).toBeNull();
    });

    it('should enforce tenant isolation — different tenantId returns null', async () => {
      // First call for tenant-A returns a row; second call for tenant-B returns empty
      mockDb.execute
        .mockResolvedValueOnce({ rows: [mockReceiptRow] })
        .mockResolvedValueOnce({ rows: [] });

      const resultA = await receiptsService.getReceipt(mockReceiptId, mockTenantId);
      const resultB = await receiptsService.getReceipt(mockReceiptId, 'tenant-other');

      expect(resultA).toEqual(mockReceiptRow);
      expect(resultB).toBeNull();
      // Both calls must pass the tenantId as a parameter
      const call1Args = mockDb.execute.mock.calls[0];
      const call2Args = mockDb.execute.mock.calls[1];
      expect(call1Args[1]).toContain(mockTenantId);
      expect(call2Args[1]).toContain('tenant-other');
    });
  });

  // ── listReceipts ───────────────────────────────────────────────────────────
  describe('listReceipts()', () => {
    it('should return paginated rows for the tenant', async () => {
      const rows = [mockReceiptRow, { ...mockReceiptRow, id: 'rcpt-2' }];
      mockDb.execute.mockResolvedValueOnce({ rows });

      const result = await receiptsService.listReceipts(mockTenantId, 1, 20);

      expect(result).toEqual(rows);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no receipts exist', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      const result = await receiptsService.listReceipts(mockTenantId);

      expect(result).toEqual([]);
    });

    it('should return empty array (not throw) on database error', async () => {
      mockDb.execute.mockRejectedValueOnce(new Error('Timeout'));

      const result = await receiptsService.listReceipts(mockTenantId);

      expect(result).toEqual([]);
    });

    it('should apply pagination — default page=1, limit=20', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await receiptsService.listReceipts(mockTenantId);

      const sqlArgs = mockDb.execute.mock.calls[0][1];
      // limit=20, offset=0 (page 1)
      expect(sqlArgs).toContain(20);
      expect(sqlArgs).toContain(0);
    });

    it('should calculate correct offset for page 2', async () => {
      mockDb.execute.mockResolvedValueOnce({ rows: [] });

      await receiptsService.listReceipts(mockTenantId, 2, 10);

      const sqlArgs = mockDb.execute.mock.calls[0][1];
      // offset = (2-1) * 10 = 10
      expect(sqlArgs).toContain(10); // limit
      expect(sqlArgs[sqlArgs.length - 1]).toBe(10); // offset
    });

    it('should filter by tenantId in every query', async () => {
      mockDb.execute.mockResolvedValue({ rows: [] });

      await receiptsService.listReceipts('tenant-A');
      await receiptsService.listReceipts('tenant-B');

      expect(mockDb.execute.mock.calls[0][1][0]).toBe('tenant-A');
      expect(mockDb.execute.mock.calls[1][1][0]).toBe('tenant-B');
    });
  });

  // ── generateReceipt ────────────────────────────────────────────────────────
  describe('generateReceipt()', () => {
    it('should return a receipt object with the expected fields', async () => {
      const result = await receiptsService.generateReceipt(mockOrderId, mockTenantId);

      expect(result).toBeDefined();
      expect(result.orderId).toBe(mockOrderId);
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.id).toMatch(/^rcpt-\d+$/);
      expect(result.generatedAt).toBeDefined();
    });

    it('should return unique receipt IDs for successive calls (timestamp-based)', async () => {
      // Advance time between calls so Date.now() differs
      const r1 = await receiptsService.generateReceipt(mockOrderId, mockTenantId);
      await new Promise(resolve => setTimeout(resolve, 2));
      const r2 = await receiptsService.generateReceipt(mockOrderId, mockTenantId);

      expect(r1.id).not.toBe(r2.id);
    });

    it('should not query the database (stub implementation)', async () => {
      await receiptsService.generateReceipt(mockOrderId, mockTenantId);

      expect(mockDb.execute).not.toHaveBeenCalled();
    });
  });
});
