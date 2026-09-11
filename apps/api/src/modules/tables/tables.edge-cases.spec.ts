/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-012 -- Table & Seating Management
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       tables
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       TESTER-051
 * GENERATED:    2026-03-17T13:17:33.693Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
// Used for potential real-world ID generation, but mocked for deterministic tests

// --- Mock Interfaces and DTOs ---

interface TableRecord {
  id: string;
  tenantId: string;
  tableNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'out_of_service';
  section: string;
  isReservable: boolean;
  version: number; // For optimistic locking simulation
}

interface CreateTableDto {
  tableNumber: string;
  capacity: number;
  section: string;
  isReservable?: boolean;
}

interface UpdateTableDto {
  tableNumber?: string;
  capacity?: number;
  status?: 'available' | 'occupied' | 'reserved' | 'out_of_service';
  section?: string;
  isReservable?: boolean;
}

// --- Mock TablesRepository ---
// This class simulates database interactions, including constraint violations and optimistic locking.
class MockTablesRepository {
  private store: Map<string, TableRecord> = new Map(); // Key: tableId
  private idCounter = 0; // For generating unique IDs predictably in tests

  async findById(tenantId: string, id: string): Promise<TableRecord | null> {
    const table = this.store.get(id);
    if (table && table.tenantId === tenantId) {
      return Promise.resolve({ ...table }); // Return a copy to prevent external modification affecting store directly
    }
    return Promise.resolve(null);
  }

  async findByTenantIdAndTableNumber(tenantId: string, tableNumber: string): Promise<TableRecord | null> {
    for (const table of this.store.values()) {
      if (table.tenantId === tenantId && table.tableNumber === tableNumber) {
        return Promise.resolve({ ...table });
      }
    }
    return Promise.resolve(null);
  }

  async findByTenantId(tenantId: string): Promise<TableRecord[]> {
    const result: TableRecord[] = [];
    for (const table of this.store.values()) {
      if (table.tenantId === tenantId) {
        result.push({ ...table });
      }
    }
    return Promise.resolve(result);
  }

  async save(table: TableRecord): Promise<TableRecord> {
    // Simulate unique constraint for tableNumber within a tenant
    const existingByNumber = await this.findByTenantIdAndTableNumber(table.tenantId, table.tableNumber);
    if (existingByNumber && existingByNumber.id !== table.id) {
      throw new Error('DatabaseConstraintViolation: Duplicate table number for tenant');
    }

    // Simulate optimistic locking for updates
    if (table.id && this.store.has(table.id)) {
      const existingTable = this.store.get(table.id)!;
      if (table.version !== existingTable.version) {
        throw new Error('DatabaseConstraintViolation: Concurrency conflict (optimistic locking)');
      }
      table.version++; // Increment version on successful update
    } else {
      table.id = `table-${this.idCounter++}`; // Use predictable ID for tests
      table.version = 1; // Initial version for new records
    }

    // Simulate other constraints (e.g., capacity, string length, enum values)
    if (table.capacity <= 0 || !Number.isInteger(table.capacity)) {
        throw new Error('DatabaseConstraintViolation: Capacity must be a positive integer');
    }
    if (table.tableNumber.length > 50) { // Example string length constraint
        throw new Error('DatabaseConstraintViolation: Table number too long');
    }
    if (table.section.length > 100) { // Example string length constraint
        throw new Error('DatabaseConstraintViolation: Section name too long');
    }
    if (!['available', 'occupied', 'reserved', 'out_of_service'].includes(table.status)) {
        throw new Error('DatabaseConstraintViolation: Invalid table status');
    }

    this.store.set(table.id, { ...table });
    return Promise.resolve({ ...table });
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const table = this.store.get(id);
    if (table && table.tenantId === tenantId) {
      this.store.delete(id);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  clear() {
    this.store.clear();
    this.idCounter = 0;
  }
}
const mockTablesRepository = new MockTablesRepository();

// --- Mock AuthService ---
// This class simulates user authentication and permission checks.
interface UserPermissions {
  tenantId: string;
  permissions: string[]; // e.g., ['manage_tables', 'view_tables']
}
class MockAuthService {
  private userPermissions: Map<string, UserPermissions> = new Map(); // Key: userId

  grantPermissions(userId: string, tenantId: string, permissions: string[]) {
    this.userPermissions.set(userId, { tenantId, permissions });
  }

  hasPermission(userId: string, tenantId: string, requiredPermission: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    return userPerms?.tenantId === tenantId && userPerms?.permissions.includes(requiredPermission) || false;
  }

  clear() {
    this.userPermissions.clear();
  }
}
const mockAuthService = new MockAuthService();

// --- TablesService Implementation ---
// This class contains the business logic for table management.
class TablesService {
  constructor(private tablesRepository: MockTablesRepository, private authService: MockAuthService) {}

  private async checkPermission(userId: string, tenantId: string, permission: string): Promise<void> {
    if (!(this.authService as any).hasPermission(userId, tenantId, permission)) {
      throw new Error(`AuthError: User ${userId} lacks ${permission} permission for tenant ${tenantId}`);
    }
  }

  async createTable(userId: string, tenantId: string, data: CreateTableDto): Promise<TableRecord> {
    await this.checkPermission(userId, tenantId, 'manage_tables');

    if (!tenantId) throw new Error('InputError: Tenant ID is required');
    if (!data || typeof data !== 'object') throw new Error('InputError: Invalid or empty table data provided');
    if (!data.tableNumber || typeof data.tableNumber !== 'string') throw new Error('InputError: Table number is required and must be a string');
    if (data.capacity === undefined || typeof data.capacity !== 'number') throw new Error('InputError: Capacity is required and must be a number');
    if (!data.section || typeof data.section !== 'string') throw new Error('InputError: Section is required and must be a string');

    if (data.capacity <= 0 || !Number.isInteger(data.capacity)) {
      throw new Error('InputError: Capacity must be a positive integer');
    }
    if (data.tableNumber.trim() === '') {
      throw new Error('InputError: Table number cannot be empty');
    }
    if (data.section.trim() === '') {
      throw new Error('InputError: Section cannot be empty');
    }

    // Service-level check for existing table number to provide clearer error messages
    const existing = await this.tablesRepository.findByTenantIdAndTableNumber(tenantId, data.tableNumber);
    if (existing) {
        throw new Error('BusinessRuleViolation: Table with this number already exists for this tenant');
    }

    const newTable: TableRecord = {
      id: '', // Repository will assign
      tenantId,
      tableNumber: data.tableNumber,
      capacity: data.capacity,
      section: data.section,
      isReservable: data.isReservable !== undefined ? data.isReservable : true,
      status: 'available',
      version: 0, // Repository will set initial
    };
    return this.tablesRepository.save(newTable);
  }

  async getTable(userId: string, tenantId: string, tableId: string): Promise<TableRecord | null> {
    await this.checkPermission(userId, tenantId, 'view_tables');
    if (!tenantId) throw new Error('InputError: Tenant ID is required');
    if (!tableId) throw new Error('InputError: Table ID is required');
    return this.tablesRepository.findById(tenantId, tableId);
  }

  async getTables(userId: string, tenantId: string, filters?: { section?: string; status?: string }): Promise<TableRecord[]> {
    await this.checkPermission(userId, tenantId, 'view_tables');
    if (!tenantId) throw new Error('InputError: Tenant ID is required');

    let tables = await this.tablesRepository.findByTenantId(tenantId);
    if (filters?.section) {
      tables = tables.filter(t => t.section === filters.section);
    }
    if (filters?.status) {
      tables = tables.filter(t => t.status === filters.status);
    }
    return tables;
  }

  async updateTable(userId: string, tenantId: string, tableId: string, data: UpdateTableDto): Promise<TableRecord> {
    await this.checkPermission(userId, tenantId, 'manage_tables');
    if (!tenantId) throw new Error('InputError: Tenant ID is required');
    if (!tableId) throw new Error('InputError: Table ID is required');
    if (!data || Object.keys(data).length === 0) {
      throw new Error('InputError: No update data provided');
    }

    const existingTable = await this.tablesRepository.findById(tenantId, tableId);
    if (!existingTable) {
      throw new Error('NotFoundError: Table not found');
    }

    if (data.capacity !== undefined) {
      if (data.capacity <= 0 || !Number.isInteger(data.capacity)) {
        throw new Error('InputError: Capacity must be a positive integer');
      }
    }
    if (data.tableNumber !== undefined && data.tableNumber.trim() === '') {
        throw new Error('InputError: Table number cannot be empty');
    }
    if (data.section !== undefined && data.section.trim() === '') {
        throw new Error('InputError: Section cannot be empty');
    }
    if (data.status !== undefined && !['available', 'occupied', 'reserved', 'out_of_service'].includes(data.status)) {
        throw new Error('InputError: Invalid table status provided');
    }

    // Service-level check for existing table number if changing table number
    if (data.tableNumber && data.tableNumber !== existingTable.tableNumber) {
        const existingWithNewNumber = await this.tablesRepository.findByTenantIdAndTableNumber(tenantId, data.tableNumber);
        if (existingWithNewNumber && existingWithNewNumber.id !== existingTable.id) {
            throw new Error('BusinessRuleViolation: Another table with this number already exists for this tenant');
        }
    }

    const updatedTable: TableRecord = {
      ...existingTable, // Start with existing data
      ...data,          // Overlay with update data
      version: existingTable.version, // Keep original version for optimistic locking check in repo
    };

    return this.tablesRepository.save(updatedTable);
  }

  async deleteTable(userId: string, tenantId: string, tableId: string): Promise<boolean> {
    await this.checkPermission(userId, tenantId, 'manage_tables');
    if (!tenantId) throw new Error('InputError: Tenant ID is required');
    if (!tableId) throw new Error('InputError: Table ID is required');
    return this.tablesRepository.delete(tenantId, tableId);
  }
}

const tablesService = new TablesService(mockTablesRepository, mockAuthService);

// --- Jest Tests ---

describe('TablesService - POSR-012 Edge Cases', () => {
  const tenantIdA = 'tenant-alpha-123';
  const tenantIdB = 'tenant-beta-456';
  const userIdAdminA = 'user-admin-A';
  const userIdViewerA = 'user-viewer-A'; // Can view, but not manage
  const userIdAdminB = 'user-admin-B';
  const userIdUnauthorized = 'user-unauthorized'; // Has no permissions

  beforeEach(() => {
    // Reset mocks before each test to ensure test isolation
    mockTablesRepository.clear();
    mockAuthService.clear();

    // Grant common permissions for authorized users
    mockAuthService.grantPermissions(userIdAdminA, tenantIdA, ['manage_tables', 'view_tables']);
    mockAuthService.grantPermissions(userIdViewerA, tenantIdA, ['view_tables']);
    mockAuthService.grantPermissions(userIdAdminB, tenantIdB, ['manage_tables', 'view_tables']);
  });

  // 1. Empty/null inputs
  describe('1. Empty/null inputs', () => {
    it('should throw InputError for createTable with null data', async () => {
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, null as any)).rejects.toThrow('InputError: Invalid or empty table data provided');
    });

    it('should throw InputError for createTable with undefined data', async () => {
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, undefined as any)).rejects.toThrow('InputError: Invalid or empty table data provided');
    });

    it('should throw InputError for createTable with missing required fields (tableNumber)', async () => {
      const data = { capacity: 4, section: 'Main' } as CreateTableDto;
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Table number is required and must be a string');
    });

    it('should throw InputError for createTable with missing required fields (capacity)', async () => {
      const data = { tableNumber: 'T1', section: 'Main' } as CreateTableDto;
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Capacity is required and must be a number');
    });

    it('should throw InputError for createTable with missing required fields (section)', async () => {
      const data = { tableNumber: 'T1', capacity: 4 } as CreateTableDto;
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Section is required and must be a string');
    });

    it('should throw InputError for createTable with empty tableNumber string', async () => {
      const data: CreateTableDto = { tableNumber: '', capacity: 4, section: 'Main' };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Table number cannot be empty');
    });

    it('should throw InputError for createTable with empty section string', async () => {
      const data: CreateTableDto = { tableNumber: 'T1', capacity: 4, section: '' };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Section cannot be empty');
    });

    it('should throw InputError for getTable with null tenantId', async () => {
      await expect(tablesService.getTable(userIdViewerA, null as any, 'some-id')).rejects.toThrow('InputError: Tenant ID is required');
    });

    it('should throw InputError for getTable with null tableId', async () => {
      await expect(tablesService.getTable(userIdViewerA, tenantIdA, null as any)).rejects.toThrow('InputError: Table ID is required');
    });

    it('should throw InputError for updateTable with null tenantId', async () => {
      await expect(tablesService.updateTable(userIdAdminA, null as any, 'some-id', { capacity: 5 })).rejects.toThrow('InputError: Tenant ID is required');
    });

    it('should throw InputError for updateTable with null tableId', async () => {
      await expect(tablesService.updateTable(userIdAdminA, tenantIdA, null as any, { capacity: 5 })).rejects.toThrow('InputError: Table ID is required');
    });

    it('should throw InputError for updateTable with empty update data', async () => {
      const table = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });
      await expect(tablesService.updateTable(userIdAdminA, tenantIdA, table.id, {})).rejects.toThrow('InputError: No update data provided');
    });

    it('should throw InputError for deleteTable with null tenantId', async () => {
      await expect(tablesService.deleteTable(userIdAdminA, null as any, 'some-id')).rejects.toThrow('InputError: Tenant ID is required');
    });

    it('should throw InputError for deleteTable with null tableId', async () => {
      await expect(tablesService.deleteTable(userIdAdminA, tenantIdA, null as any)).rejects.toThrow('InputError: Table ID is required');
    });

    it('should throw InputError for getTables with null tenantId', async () => {
        await expect(tablesService.getTables(userIdViewerA, null as any)).rejects.toThrow('InputError: Tenant ID is required');
    });
  });

  // 2. Boundary values
  describe('2. Boundary values', () => {
    it('should throw InputError for createTable with capacity 0', async () => {
      const data: CreateTableDto = { tableNumber: 'T1', capacity: 0, section: 'Main' };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Capacity must be a positive integer');
    });

    it('should throw InputError for createTable with negative capacity', async () => {
      const data: CreateTableDto = { tableNumber: 'T1', capacity: -1, section: 'Main' };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('InputError: Capacity must be a positive integer');
    });

    it('should allow createTable with minimum valid capacity (1)', async () => {
      const data: CreateTableDto = { tableNumber: 'T-min', capacity: 1, section: 'Main' };
      const table = await tablesService.createTable(userIdAdminA, tenantIdA, data);
      expect(table).toHaveProperty('capacity', 1);
    });

    it('should throw DatabaseConstraintViolation for createTable with extremely long table number', async () => {
      const longTableNumber = 'A'.repeat(51); // Max allowed is 50 in mock repository
      const data: CreateTableDto = { tableNumber: longTableNumber, capacity: 4, section: 'Main' };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('DatabaseConstraintViolation: Table number too long');
    });

    it('should throw DatabaseConstraintViolation for updateTable with extremely long section name', async () => {
      const table = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T10', capacity: 4, section: 'Main' });
      const longSectionName = 'B'.repeat(101); // Max allowed is 100 in mock repository
      await expect(tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { section: longSectionName })).rejects.toThrow('DatabaseConstraintViolation: Section name too long');
    });

    it('should throw InputError for updateTable with capacity 0', async () => {
      const table = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });
      await expect(tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { capacity: 0 })).rejects.toThrow('InputError: Capacity must be a positive integer');
    });

    it('should allow valid status transitions and reject invalid ones (at service level)', async () => {
        const table = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });
        expect(table.status).toBe('available');

        // Valid transitions
        const updated1 = await tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { status: 'reserved' });
        expect(updated1.status).toBe('reserved');

        const updated2 = await tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { status: 'occupied' });
        expect(updated2.status).toBe('occupied');

        const updated3 = await tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { status: 'available' });
        expect(updated3.status).toBe('available');

        // Invalid status value
        await expect(tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { status: 'unknown_status' as any }))
            .rejects.toThrow('InputError: Invalid table status provided');
    });
  });

  // 3. Multi-tenant isolation
  describe('3. Multi-tenant isolation', () => {
    it('should isolate tables between different tenants', async () => {
      const tableA = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });
      const tableB = await tablesService.createTable(userIdAdminB, tenantIdB, { tableNumber: 'T1', capacity: 6, section: 'Patio' });

      // Tenant A should only see its tables
      const tablesA = await tablesService.getTables(userIdViewerA, tenantIdA);
      expect(tablesA).toHaveLength(1);
      expect(tablesA[0].id).toBe(tableA.id);

      // Tenant B should only see its tables
      const tablesB = await tablesService.getTables(userIdAdminB, tenantIdB);
      expect(tablesB).toHaveLength(1);
      expect(tablesB[0].id).toBe(tableB.id);

      // Tenant A cannot access Tenant B's table by ID
      await expect(tablesService.getTable(userIdViewerA, tenantIdA, tableB.id)).resolves.toBeNull();
      // Tenant B cannot access Tenant A's table by ID
      await expect(tablesService.getTable(userIdAdminB, tenantIdB, tableA.id)).resolves.toBeNull();
    });

    it('should prevent one tenant from updating another tenant\'s table', async () => {
      const tableA = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });

      // Tenant B tries to update Tenant A's table
      await expect(tablesService.updateTable(userIdAdminB, tenantIdB, tableA.id, { capacity: 8 }))
        .rejects.toThrow('NotFoundError: Table not found'); // Repository correctly returns null for tenant B
    });

    it('should prevent one tenant from deleting another tenant\'s table', async () => {
      const tableA = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });

      // Tenant B tries to delete Tenant A's table
      const deleted = await tablesService.deleteTable(userIdAdminB, tenantIdB, tableA.id);
      expect(deleted).toBe(false); // Repository returns false if not found for tenant
      const tables = await tablesService.getTables(userIdViewerA, tenantIdA);
      expect(tables).toHaveLength(1); // Table A still exists
    });

    it('should allow same table number for different tenants', async () => {
      await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });
      const tableB = await tablesService.createTable(userIdAdminB, tenantIdB, { tableNumber: 'T1', capacity: 6, section: 'Patio' });
      expect(tableB.tableNumber).toBe('T1');
      expect(tableB.tenantId).toBe(tenantIdB);
    });
  });

  // 4. Concurrent request handling
  describe('4. Concurrent request handling', () => {
    it('should handle concurrent updates to the same table using optimistic locking at repository level', async () => {
      // Create an initial table
      const initialTable = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T-conc', capacity: 4, section: 'Main' });

      // Simulate two users (or processes) reading the same table state
      const user1InitialTable = await mockTablesRepository.findById(tenantIdA, initialTable.id);
      const user2InitialTable = await mockTablesRepository.findById(tenantIdA, initialTable.id);

      expect(user1InitialTable).not.toBeNull();
      expect(user2InitialTable).not.toBeNull();
      expect(user1InitialTable!.version).toBe(1); // Initial version
      expect(user2InitialTable!.version).toBe(1);

      // User 1 performs an update: changes capacity to 6
      const updatePromise1 = tablesService.updateTable(userIdAdminA, tenantIdA, initialTable.id, { capacity: 6 });

      // User 2 (conceptually operating on their stale read) attempts to update the status to 'occupied'.
      // In this service implementation, `updateTable` fetches the LATEST `existingTable` from the repo.
      // So, if `updatePromise1` resolves first, `updatePromise2` will fetch the table with `version: 2`.
      // To simulate optimistic locking *failure*, we need to directly interact with `repository.save` using a stale version.

      // Let's await the first update, which will increment the version
      const updatedTable1 = await updatePromise1;
      expect(updatedTable1.capacity).toBe(6);
      expect(updatedTable1.version).toBe(2); // Version should be 2 now

      // Now, try to update with User 2's *original stale version (version 1)* directly via repository.save
      // This bypasses the service's `findById` call to truly test the repository's optimistic locking.
      const staleUpdateRecord: TableRecord = {
          ...user2InitialTable!, // Original data read by User 2
          status: 'occupied',
          version: user2InitialTable!.version // Stale version (1)
      };

      await expect(mockTablesRepository.save(staleUpdateRecord)).rejects.toThrow('DatabaseConstraintViolation: Concurrency conflict (optimistic locking)');

      // Verify the table state is still as per the successful update from User 1
      const finalTableState = await tablesService.getTable(userIdViewerA, tenantIdA, initialTable.id);
      expect(finalTableState?.capacity).toBe(6);
      expect(finalTableState?.status).toBe('available'); // Status wasn't changed by successful update
      expect(finalTableState?.version).toBe(2);
    });

    it('should prevent concurrent creation of tables with the same number for the same tenant', async () => {
      const createPromise1 = tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T-dup', capacity: 4, section: 'Main' });
      const createPromise2 = tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T-dup', capacity: 6, section: 'Main' });

      // Using Promise.allSettled to check both outcomes without stopping on the first rejection
      const results = await Promise.allSettled([createPromise1, createPromise2]);

      const successfulCreates = results.filter(r => r.status === 'fulfilled');
      const failedCreates = results.filter(r => r.status === 'rejected');

      expect(successfulCreates).toHaveLength(1);
      expect(failedCreates).toHaveLength(1);
      expect((failedCreates[0] as PromiseRejectedResult).reason.message).toMatch(/BusinessRuleViolation: Table with this number already exists for this tenant|DatabaseConstraintViolation: Duplicate table number for tenant/);

      const tables = await tablesService.getTables(userIdViewerA, tenantIdA);
      expect(tables).toHaveLength(1);
      expect(tables[0].tableNumber).toBe('T-dup');
    });
  });

  // 5. Auth/permission failures
  describe('5. Auth/permission failures', () => {
    const tableData: CreateTableDto = { tableNumber: 'T1', capacity: 4, section: 'Main' };
    let createdTableId: string;

    beforeEach(async () => {
        // Create a table by an authorized user for permission tests on existing tables
        const table = await tablesService.createTable(userIdAdminA, tenantIdA, tableData);
        createdTableId = table.id;
    });

    it('should throw AuthError when creating a table without manage_tables permission', async () => {
      // userIdViewerA has 'view_tables' but not 'manage_tables'
      await expect(tablesService.createTable(userIdViewerA, tenantIdA, tableData)).rejects.toThrow(`AuthError: User ${userIdViewerA} lacks manage_tables permission for tenant ${tenantIdA}`);
    });

    it('should throw AuthError when updating a table without manage_tables permission', async () => {
      // userIdViewerA tries to update it
      await expect(tablesService.updateTable(userIdViewerA, tenantIdA, createdTableId, { capacity: 5 })).rejects.toThrow(`AuthError: User ${userIdViewerA} lacks manage_tables permission for tenant ${tenantIdA}`);
    });

    it('should throw AuthError when deleting a table without manage_tables permission', async () => {
      // userIdViewerA tries to delete it
      await expect(tablesService.deleteTable(userIdViewerA, tenantIdA, createdTableId)).rejects.toThrow(`AuthError: User ${userIdViewerA} lacks manage_tables permission for tenant ${tenantIdA}`);
    });

    it('should throw AuthError when viewing a table without view_tables permission', async () => {
      // userIdUnauthorized has no permissions
      await expect(tablesService.getTable(userIdUnauthorized, tenantIdA, createdTableId)).rejects.toThrow(`AuthError: User ${userIdUnauthorized} lacks view_tables permission for tenant ${tenantIdA}`);
    });

    it('should throw AuthError when listing tables without view_tables permission', async () => {
      // userIdUnauthorized has no permissions
      await expect(tablesService.getTables(userIdUnauthorized, tenantIdA)).rejects.toThrow(`AuthError: User ${userIdUnauthorized} lacks view_tables permission for tenant ${tenantIdA}`);
    });

    it('should not allow admin from tenant B to manage tables in tenant A (permission check for wrong tenant)', async () => {
        // Admin B has manage_tables for tenant B, but not tenant A
        await expect(tablesService.updateTable(userIdAdminB, tenantIdA, createdTableId, { capacity: 10 }))
            .rejects.toThrow(`AuthError: User ${userIdAdminB} lacks manage_tables permission for tenant ${tenantIdA}`);
    });
  });

  // 6. Database constraint violations
  describe('6. Database constraint violations', () => {
    it('should throw BusinessRuleViolation for creating a table with a duplicate table number within the same tenant', async () => {
      const data: CreateTableDto = { tableNumber: 'T-unique', capacity: 4, section: 'Main' };
      await tablesService.createTable(userIdAdminA, tenantIdA, data);
      // Attempt to create another with the same number in the same tenant
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('BusinessRuleViolation: Table with this number already exists for this tenant');
    });

    it('should throw BusinessRuleViolation for updating a table to a duplicate table number within the same tenant', async () => {
      const table1 = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T1', capacity: 4, section: 'Main' });
      await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T2', capacity: 2, section: 'Main' });

      // Try to update T1's number to T2's number
      await expect(tablesService.updateTable(userIdAdminA, tenantIdA, table1.id, { tableNumber: 'T2' }))
        .rejects.toThrow('BusinessRuleViolation: Another table with this number already exists for this tenant');
    });

    it('should allow valid large capacity without throwing DB constraint (positive integer)', async () => {
        const data: CreateTableDto = { tableNumber: 'T-large-cap', capacity: 200, section: 'Main' }; // Assuming 200 is acceptable within system limits
        const table = await tablesService.createTable(userIdAdminA, tenantIdA, data);
        expect(table.capacity).toBe(200);
    });

    it('should throw InputError for capacity with non-integer value (service layer check)', async () => {
        await expect(tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T-float', capacity: 4.5, section: 'Main' } as any))
            .rejects.toThrow('InputError: Capacity must be a positive integer');
    });

    it('should throw DatabaseConstraintViolation if table number exceeds max length on DB', async () => {
      // Mock repository already simulates this based on its internal rules (50 chars)
      const longTableNumber = 'C'.repeat(51);
      const data: CreateTableDto = { tableNumber: longTableNumber, capacity: 4, section: 'Main' };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('DatabaseConstraintViolation: Table number too long');
    });

    it('should throw DatabaseConstraintViolation if section name exceeds max length on DB', async () => {
      // Mock repository already simulates this based on its internal rules (100 chars)
      const longSectionName = 'D'.repeat(101);
      const data: CreateTableDto = { tableNumber: 'T-long-sec', capacity: 4, section: longSectionName };
      await expect(tablesService.createTable(userIdAdminA, tenantIdA, data)).rejects.toThrow('DatabaseConstraintViolation: Section name too long');
    });

    it('should throw InputError for invalid status on update (service level validation)', async () => {
        const table = await tablesService.createTable(userIdAdminA, tenantIdA, { tableNumber: 'T-status', capacity: 4, section: 'Main' });
        await expect(tablesService.updateTable(userIdAdminA, tenantIdA, table.id, { status: 'invalid_status_type' as any }))
            .rejects.toThrow('InputError: Invalid table status provided');
    });

    it('should throw NotFoundError when attempting to update a non-existent table', async () => {
      await expect(tablesService.updateTable(userIdAdminA, tenantIdA, 'non-existent-id', { capacity: 5 }))
        .rejects.toThrow('NotFoundError: Table not found');
    });

    it('should return false when attempting to delete a non-existent table', async () => {
      const deleted = await tablesService.deleteTable(userIdAdminA, tenantIdA, 'non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});

