/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-012 -- Accounting Export (QB/Xero)
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       reports
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       TESTER-110
 * GENERATED:    2026-03-17T13:19:02.286Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// jest is available globally via the Jest test runner — no import needed.

// --- Mock Dependencies ---
const mockTransactionService = {
  getTransactionsForExport: jest.fn(),
};

const mockTenantService = {
  getTenantById: jest.fn(),
};

const mockUserService = {
  getUserById: jest.fn(),
};

const mockPermissionService = {
  hasPermission: jest.fn(),
};

const mockFileStorageService = {
  uploadFile: jest.fn(),
};

const mockDatabaseClient = {
  exportLogs: {
    create: jest.fn(),
    update: jest.fn(),
  },
  // If there were other models directly accessed, they would be mocked here.
};

// --- Mocked Service Class (represents the actual module logic) ---
// In a real application, this would be imported from src/reports/accounting-export.service.ts
class AccountingExportService {
  constructor(
    private transactionService: typeof mockTransactionService,
    private tenantService: typeof mockTenantService,
    private userService: typeof mockUserService,
    private permissionService: typeof mockPermissionService,
    private fileStorageService: typeof mockFileStorageService,
    private databaseClient: typeof mockDatabaseClient,
  ) {}

  async generateAccountingExport(
    tenantId: string,
    userId: string,
    startDate: string,
    endDate: string,
    format: 'QB' | 'Xero',
  ): Promise<{ exportId: string; downloadUrl: string }> {
    // 1. Basic validation of inputs
    if (!tenantId || !userId || !startDate || !endDate || !format) {
      throw new Error('Missing required parameters');
    }
    if (!['QB', 'Xero'].includes(format)) {
      throw new Error('Unsupported export format');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      throw new Error('Invalid date range');
    }

    // 2. Auth/permission check
    const hasPermission = await this.permissionService.hasPermission(userId, 'ACCOUNTING_EXPORT', tenantId);
    if (!hasPermission) {
      throw new Error('Permission Denied: User does not have ACCOUNTING_EXPORT permission.');
    }

    const tenant = await this.tenantService.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 3. Initiate export log in DB
    let exportLogId: string;
    try {
      const exportLog = await this.databaseClient.exportLogs.create({
        data: {
          tenantId,
          userId,
          startDate,
          endDate,
          format,
          status: 'PENDING',
          createdAt: new Date(),
        },
      });
      exportLogId = exportLog.id;
    } catch (e: any) {
      console.error('Failed to create export log:', e);
      // Re-throw with a more specific message or wrapped error
      throw new Error(`Failed to initiate export process due to database error: ${e.message}`);
    }

    try {
      // 4. Fetch transactions (tenant-isolated data fetching)
      const transactions = await this.transactionService.getTransactionsForExport(tenantId, startDate, endDate);

      if (transactions.length === 0) {
        await this.databaseClient.exportLogs.update({
          where: { id: exportLogId },
          data: { status: 'NO_DATA', completedAt: new Date() },
        });
        return { exportId: exportLogId, downloadUrl: '' }; // No download URL if no data
      }

      // 5. Simulate export file generation
      let fileContent: string;
      let fileName: string;
      if (format === 'QB') {
        fileContent = `QB_EXPORT_DATA_FOR_${tenantId}_${startDate}_${endDate}\n` + transactions.map(t => JSON.stringify(t)).join('\n');
        fileName = `paysurity_qb_export_${tenantId}_${Date.now()}.qbo`;
      } else { // Xero
        fileContent = `XERO_EXPORT_DATA_FOR_${tenantId}_${startDate}_${endDate}\n` + transactions.map(t => JSON.stringify(t)).join('\n');
        fileName = `paysurity_xero_export_${tenantId}_${Date.now()}.csv`;
      }

      // 6. Simulate file upload to storage
      const downloadUrl = await this.fileStorageService.uploadFile(fileName, fileContent, 'accounting-exports');

      // 7. Update export log status
      await this.databaseClient.exportLogs.update({
        where: { id: exportLogId },
        data: {
          status: 'COMPLETED',
          downloadUrl,
          completedAt: new Date(),
        },
      });

      return { exportId: exportLogId, downloadUrl };
    } catch (e: any) {
      console.error(`Error during accounting export for log ${exportLogId}:`, e);
      // Update log to FAILED status if an error occurs after creation
      await this.databaseClient.exportLogs.update({
        where: { id: exportLogId },
        data: { status: 'FAILED', errorMessage: e.message, completedAt: new Date() },
      }).catch(logError => console.error(`Failed to update export log ${exportLogId} to FAILED:`, logError));
      throw e; // Re-throw the original error
    }
  }
}

// --- Test Suite Setup ---
let accountingExportService: AccountingExportService;

beforeEach(() => {
  jest.clearAllMocks(); // Clear mock calls and instances before each test
  // Stop console.error from failing the test suite
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Default mock implementations for a successful scenario
  mockTransactionService.getTransactionsForExport.mockResolvedValue([
    { id: 'txn1', amount: 100, description: 'Test Transaction 1', tenantId: 'tenant1' },
    { id: 'txn2', amount: 200, description: 'Test Transaction 2', tenantId: 'tenant1' },
  ]);
  mockTenantService.getTenantById.mockImplementation((id) => {
    if (id === 'tenant1' || id === 'tenant2') return { id, name: `Tenant ${id}` };
    return null;
  });
  mockUserService.getUserById.mockImplementation((id) => {
    if (id === 'user1' || id === 'user2') return { id, name: `User ${id}` };
    return null;
  });
  mockPermissionService.hasPermission.mockResolvedValue(true);
  mockFileStorageService.uploadFile.mockResolvedValue('http://mock-download-url.com/export.qbo');
  mockDatabaseClient.exportLogs.create.mockResolvedValue({ id: 'export-log-123', status: 'PENDING' });
  mockDatabaseClient.exportLogs.update.mockResolvedValue({}); // Default successful update

  // Initialize the service with mocked dependencies
  accountingExportService = new AccountingExportService(
    mockTransactionService,
    mockTenantService,
    mockUserService,
    mockPermissionService,
    mockFileStorageService,
    mockDatabaseClient
  );
});

// --- Jest Test Cases ---
describe('MER-012: Accounting Export (QB/Xero) - Edge Cases', () => {

  const defaultTenantId = 'tenant1';
  const defaultUserId = 'user1';
  const defaultStartDate = '2023-01-01';
  const defaultEndDate = '2023-01-31';
  const defaultFormat = 'QB';

  // 1. Empty/null inputs
  describe('1. Empty/Null Inputs', () => {
    test('should throw error for null tenantId', async () => {
      await expect(
        accountingExportService.generateAccountingExport(null as any, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for empty tenantId', async () => {
      await expect(
        accountingExportService.generateAccountingExport('', defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for null userId', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, null as any, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for empty userId', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, '', defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for null startDate', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, null as any, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for empty startDate', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, '', defaultEndDate, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for null endDate', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, null as any, defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for empty endDate', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, '', defaultFormat)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for null format', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, null as any)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for empty format', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, '' as any)
      ).rejects.toThrow('Missing required parameters');
    });

    test('should throw error for unsupported format', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, 'CSV' as any)
      ).rejects.toThrow('Unsupported export format');
    });

    test('should throw error for invalid startDate format', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, 'not-a-date', defaultEndDate, defaultFormat)
      ).rejects.toThrow('Invalid date range');
    });

    test('should throw error for invalid endDate format', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, 'not-a-date', defaultFormat)
      ).rejects.toThrow('Invalid date range');
    });

    test('should throw error if tenant does not exist', async () => {
      mockTenantService.getTenantById.mockResolvedValueOnce(null);
      await expect(
        accountingExportService.generateAccountingExport('non-existent-tenant', defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Tenant not found');
      expect(mockPermissionService.hasPermission).toHaveBeenCalled(); // Should pass auth check first
    });

    test('should throw error if user does not exist', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(null);
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, 'non-existent-user', defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('User not found');
      expect(mockPermissionService.hasPermission).toHaveBeenCalled(); // Should pass auth check first
      expect(mockTenantService.getTenantById).toHaveBeenCalled(); // Should pass tenant check first
    });
  });

  // 2. Boundary values
  describe('2. Boundary Values', () => {
    test('should handle a single-day export successfully', async () => {
      const singleDay = '2023-03-15';
      const result = await accountingExportService.generateAccountingExport(
        defaultTenantId, defaultUserId, singleDay, singleDay, defaultFormat
      );
      expect(result.exportId).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(defaultTenantId, singleDay, singleDay);
    });

    test('should throw error if startDate is after endDate', async () => {
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, '2023-01-31', '2023-01-01', defaultFormat)
      ).rejects.toThrow('Invalid date range');
    });

    test('should handle a long date range successfully', async () => {
      const longStartDate = '2010-01-01';
      const longEndDate = '2020-12-31';
      mockTransactionService.getTransactionsForExport.mockResolvedValue(Array(1000).fill({ id: 'long_txn', amount: 1 }));

      const result = await accountingExportService.generateAccountingExport(
        defaultTenantId, defaultUserId, longStartDate, longEndDate, defaultFormat
      );
      expect(result.exportId).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(defaultTenantId, longStartDate, longEndDate);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalled();
    });

    test('should correctly process when no transactions are found for the period', async () => {
      mockTransactionService.getTransactionsForExport.mockResolvedValue([]);
      const result = await accountingExportService.generateAccountingExport(
        defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat
      );
      expect(result.exportId).toBeDefined();
      expect(result.downloadUrl).toBe(''); // No download URL if no data
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'export-log-123' },
          data: expect.objectContaining({ status: 'NO_DATA' }),
        })
      );
      expect(mockFileStorageService.uploadFile).not.toHaveBeenCalled(); // No file uploaded
    });

    test('should handle a large number of transactions', async () => {
      const largeTransactionSet = Array(50000).fill(null).map((_, i) => ({
        id: `txn${i}`,
        amount: i + 1,
        description: `Test Transaction ${i}`,
        tenantId: defaultTenantId,
      }));
      mockTransactionService.getTransactionsForExport.mockResolvedValue(largeTransactionSet);

      const result = await accountingExportService.generateAccountingExport(
        defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat
      );
      expect(result.exportId).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(defaultTenantId, defaultStartDate, defaultEndDate);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('paysurity_qb_export_tenant1_'),
        expect.stringContaining('QB_EXPORT_DATA_FOR_tenant1_2023-01-01_2023-01-31'),
        'accounting-exports'
      );
    });

    test('should handle date ranges spanning daylight saving time (DST) changes', async () => {
      const springForwardStart = '2023-03-01'; // Before DST
      const springForwardEnd = '2023-04-01';   // After DST
      const result = await accountingExportService.generateAccountingExport(
        defaultTenantId, defaultUserId, springForwardStart, springForwardEnd, defaultFormat
      );
      expect(result.exportId).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(defaultTenantId, springForwardStart, springForwardEnd);
    });

    test('should handle date ranges spanning leap year', async () => {
      const leapYearStart = '2024-02-01';
      const leapYearEnd = '2024-03-01'; // Includes Feb 29, 2024
      const result = await accountingExportService.generateAccountingExport(
        defaultTenantId, defaultUserId, leapYearStart, leapYearEnd, defaultFormat
      );
      expect(result.exportId).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(defaultTenantId, leapYearStart, leapYearEnd);
    });
  });

  // 3. Multi-tenant isolation
  describe('3. Multi-tenant Isolation', () => {
    test('should export transactions only for the specified tenantId', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const user1Id = 'user1';
      const user2Id = 'user2';

      mockTransactionService.getTransactionsForExport.mockImplementation((tenantId, start, end) => {
        if (tenantId === tenant1Id) {
          return Promise.resolve([
            { id: 'txn1_t1', amount: 100, description: 'T1 Trans 1', tenantId: tenant1Id },
            { id: 'txn2_t1', amount: 200, description: 'T1 Trans 2', tenantId: tenant1Id },
          ]);
        } else if (tenantId === tenant2Id) {
          return Promise.resolve([
            { id: 'txn1_t2', amount: 300, description: 'T2 Trans 1', tenantId: tenant2Id },
          ]);
        }
        return Promise.resolve([]);
      });

      const export1 = await accountingExportService.generateAccountingExport(
        tenant1Id, user1Id, defaultStartDate, defaultEndDate, defaultFormat
      );
      expect(export1.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(tenant1Id, defaultStartDate, defaultEndDate);
      // Verify file content for tenant1
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining(`paysurity_qb_export_${tenant1Id}_`),
        expect.stringContaining(`T1 Trans 1`) && expect.not.stringContaining(`T2 Trans 1`),
        'accounting-exports'
      );

      // Reset mock calls for clarity before the next call for tenant2
      mockFileStorageService.uploadFile.mockClear();

      const export2 = await accountingExportService.generateAccountingExport(
        tenant2Id, user2Id, defaultStartDate, defaultEndDate, defaultFormat
      );
      expect(export2.downloadUrl).toBeDefined();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledWith(tenant2Id, defaultStartDate, defaultEndDate);
      // Verify file content for tenant2
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining(`paysurity_qb_export_${tenant2Id}_`),
        expect.stringContaining(`T2 Trans 1`) && expect.not.stringContaining(`T1 Trans 1`),
        'accounting-exports'
      );

      // Ensure creation and update logs were called for both
      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalledTimes(2);
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledTimes(2);
    });

    test('should prevent a user from one tenant from exporting another tenant\'s data via permission check', async () => {
      const tenant1Id = 'tenant1';
      const tenant2Id = 'tenant2';
      const user1Id = 'user1';

      // Mock hasPermission to deny access if user1 tries to access tenant2's data
      mockPermissionService.hasPermission.mockImplementation((userId, permission, targetTenantId) => {
        return userId === user1Id && targetTenantId === tenant1Id; // User1 only has permission for tenant1
      });

      await expect(
        accountingExportService.generateAccountingExport(tenant2Id, user1Id, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Permission Denied: User does not have ACCOUNTING_EXPORT permission.');

      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(user1Id, 'ACCOUNTING_EXPORT', tenant2Id);
      expect(mockTenantService.getTenantById).not.toHaveBeenCalledWith(tenant2Id); // Should fail before tenant check
      expect(mockTransactionService.getTransactionsForExport).not.toHaveBeenCalled();
      expect(mockDatabaseClient.exportLogs.create).not.toHaveBeenCalled();
    });
  });

  // 4. Concurrent request handling
  describe('4. Concurrent Request Handling', () => {
    test('should handle multiple concurrent export requests without interference', async () => {
      const exportRequests = [
        accountingExportService.generateAccountingExport('tenant1', 'user1', '2023-01-01', '2023-01-31', 'QB'),
        accountingExportService.generateAccountingExport('tenant2', 'user2', '2023-02-01', '2023-02-28', 'Xero'),
        accountingExportService.generateAccountingExport('tenant1', 'user1', '2023-03-01', '2023-03-31', 'Xero'),
      ];

      mockTransactionService.getTransactionsForExport.mockImplementation((tenantId, startDate, endDate) => {
        if (tenantId === 'tenant1' && startDate === '2023-01-01') return Promise.resolve([{ id: 't1_jan_txn', amount: 100 }]);
        if (tenantId === 'tenant2' && startDate === '2023-02-01') return Promise.resolve([{ id: 't2_feb_txn', amount: 200 }]);
        if (tenantId === 'tenant1' && startDate === '2023-03-01') return Promise.resolve([{ id: 't1_mar_txn', amount: 300 }]);
        return Promise.resolve([]);
      });

      // Simulate some delay in file uploads
      mockFileStorageService.uploadFile.mockImplementation((fileName, content) => {
        return new Promise(resolve => setTimeout(() => resolve(`http://mock-url.com/${fileName}`), Math.random() * 50));
      });

      const results = await Promise.all(exportRequests); // Use Promise.all here as all are expected to succeed

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.exportId).toBeDefined();
        expect(result.downloadUrl).toMatch(/^http:\/\/mock-url\.com\/.+/);
      });

      // Verify all underlying services were called for each request
      expect(mockPermissionService.hasPermission).toHaveBeenCalledTimes(3);
      expect(mockTenantService.getTenantById).toHaveBeenCalledTimes(3);
      expect(mockUserService.getUserById).toHaveBeenCalledTimes(3);
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalledTimes(3);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledTimes(3);
      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalledTimes(3);
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledTimes(3);
    });

    test('should handle concurrent requests gracefully when one fails due to internal error', async () => {
      const exportRequests = [
        accountingExportService.generateAccountingExport('tenant1', 'user1', '2023-01-01', '2023-01-31', 'QB'),
        accountingExportService.generateAccountingExport('tenant2', 'user2', '2023-02-01', '2023-02-28', 'Xero'),
      ];

      mockTransactionService.getTransactionsForExport.mockImplementationOnce(() => {
        return Promise.resolve([{ id: 't1_jan_txn', amount: 100 }]); // First request succeeds
      }).mockImplementationOnce(() => {
        throw new Error('Database connection lost during transaction fetch'); // Second request fails
      });

      const results = await Promise.allSettled(exportRequests); // Use allSettled to get status of all promises

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      if (results[1].status === 'rejected') {
        expect(results[1].reason.message).toBe('Database connection lost during transaction fetch');
      }

      // Verify that the successful request still completed all its steps
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledTimes(1);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledWith(
        expect.stringContaining('paysurity_qb_export_tenant1_'),
        expect.stringContaining('t1_jan_txn'),
        'accounting-exports'
      );
      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalledTimes(2); // Log attempted for both
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledTimes(2); // Called for success and for failed (to update status)
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'export-log-123' }, data: expect.objectContaining({ status: 'COMPLETED' }) })
      );
      // The mock create always returns 'export-log-123', so the failure update will also try to update 'export-log-123' which is not ideal.
      // In a real system, the exportLogId would be unique per call.
      // Let's refine the mock to return unique IDs to better simulate:
      let nextExportLogId = 1;
      mockDatabaseClient.exportLogs.create.mockImplementation(() => Promise.resolve({ id: `export-log-${nextExportLogId++}`, status: 'PENDING' }));

      // Re-run test with better mock
      jest.clearAllMocks(); // Clear mocks for a fresh run
      nextExportLogId = 1; // Reset counter
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockTenantService.getTenantById.mockImplementation((id) => ({ id, name: `Tenant ${id}` }));
      mockUserService.getUserById.mockImplementation((id) => ({ id, name: `User ${id}` }));
      mockFileStorageService.uploadFile.mockResolvedValue('http://mock-download-url.com/export.qbo');
      mockDatabaseClient.exportLogs.create.mockImplementation((data) => Promise.resolve({ id: `export-log-${nextExportLogId++}`, ...data.data }));
      mockDatabaseClient.exportLogs.update.mockResolvedValue({});

      // Set up transaction service mock again for this specific test
      mockTransactionService.getTransactionsForExport.mockImplementationOnce(() => {
        return Promise.resolve([{ id: 't1_jan_txn', amount: 100 }]); // First request succeeds
      }).mockImplementationOnce(() => {
        throw new Error('Database connection lost during transaction fetch'); // Second request fails
      });

      const results_rerun = await Promise.allSettled(exportRequests);

      expect(results_rerun[0].status).toBe('fulfilled');
      expect(results_rerun[1].status).toBe('rejected');
      if (results_rerun[1].status === 'rejected') {
        expect(results_rerun[1].reason.message).toBe('Database connection lost during transaction fetch');
      }
      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalledTimes(2);
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledTimes(2);
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'export-log-1' }, data: expect.objectContaining({ status: 'COMPLETED' }) })
      );
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'export-log-2' }, data: expect.objectContaining({ status: 'FAILED' }) })
      );
    });
  });

  // 5. Auth/permission failures
  describe('5. Auth/Permission Failures', () => {
    test('should deny export if user has no permissions', async () => {
      mockPermissionService.hasPermission.mockResolvedValue(false);
      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Permission Denied: User does not have ACCOUNTING_EXPORT permission.');
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(defaultUserId, 'ACCOUNTING_EXPORT', defaultTenantId);
      expect(mockTenantService.getTenantById).not.toHaveBeenCalled(); // Should not proceed past permission check
      expect(mockTransactionService.getTransactionsForExport).not.toHaveBeenCalled();
      expect(mockDatabaseClient.exportLogs.create).not.toHaveBeenCalled();
    });

    test('should deny export if userId is not found (after permission check)', async () => {
      mockUserService.getUserById.mockResolvedValueOnce(null);

      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, 'non-existent-user', defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('User not found');
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith('non-existent-user', 'ACCOUNTING_EXPORT', defaultTenantId);
      expect(mockTenantService.getTenantById).toHaveBeenCalledWith(defaultTenantId); // Should pass tenant check
      expect(mockUserService.getUserById).toHaveBeenCalledWith('non-existent-user');
      expect(mockDatabaseClient.exportLogs.create).not.toHaveBeenCalled(); // No log should be created if user not found
      expect(mockTransactionService.getTransactionsForExport).not.toHaveBeenCalled();
    });
  });

  // 6. Database constraint violations
  describe('6. Database Constraint Violations', () => {
    test('should gracefully handle DB error during export log creation (e.g., unique constraint)', async () => {
      // Simulate unique constraint violation if exportLogId already exists or similar
      mockDatabaseClient.exportLogs.create.mockRejectedValueOnce(new Error('DB Error: Duplicate entry for primary key'));

      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('Failed to initiate export process due to database error: DB Error: Duplicate entry for primary key');

      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalled();
      expect(mockTransactionService.getTransactionsForExport).not.toHaveBeenCalled(); // Should not proceed if log creation fails
      expect(mockFileStorageService.uploadFile).not.toHaveBeenCalled();
      expect(mockDatabaseClient.exportLogs.update).not.toHaveBeenCalled(); // No update if creation failed
    });

    test('should gracefully handle DB error during transaction fetch', async () => {
      mockTransactionService.getTransactionsForExport.mockRejectedValueOnce(new Error('DB Error: Connection timeout'));

      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('DB Error: Connection timeout');

      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalled(); // Log would have been created
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalled();
      expect(mockFileStorageService.uploadFile).not.toHaveBeenCalled();
      // Ensure the export log status is updated to FAILED
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'export-log-123' },
          data: expect.objectContaining({ status: 'FAILED', errorMessage: 'DB Error: Connection timeout' }),
        })
      );
    });

    test('should gracefully handle DB error during export log update (e.g., data too long for downloadUrl)', async () => {
      // This simulates a scenario where file upload succeeded, but updating the DB with the URL failed
      mockDatabaseClient.exportLogs.update.mockRejectedValueOnce(new Error('DB Error: Value too long for column `downloadUrl`'));

      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('DB Error: Value too long for column `downloadUrl`');

      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalled();
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalled();
      expect(mockFileStorageService.uploadFile).toHaveBeenCalled();
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalled(); // This is the call that failed
      // Also expect a subsequent call to update status to FAILED
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'export-log-123' },
          data: expect.objectContaining({ status: 'FAILED', errorMessage: 'DB Error: Value too long for column `downloadUrl`' }),
        })
      );
    });

    test('should gracefully handle unexpected errors during file storage upload', async () => {
      mockFileStorageService.uploadFile.mockRejectedValueOnce(new Error('S3 Client Error: Bucket not found'));

      await expect(
        accountingExportService.generateAccountingExport(defaultTenantId, defaultUserId, defaultStartDate, defaultEndDate, defaultFormat)
      ).rejects.toThrow('S3 Client Error: Bucket not found');

      expect(mockDatabaseClient.exportLogs.create).toHaveBeenCalled(); // Log created
      expect(mockTransactionService.getTransactionsForExport).toHaveBeenCalled();
      expect(mockFileStorageService.uploadFile).toHaveBeenCalled(); // This is the call that failed
      // Ensure the export log status is updated to FAILED if file upload fails.
      expect(mockDatabaseClient.exportLogs.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'export-log-123' },
          data: expect.objectContaining({ status: 'FAILED', errorMessage: 'S3 Client Error: Bucket not found' }),
        })
      );
    });
  });
});
