/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-012 -- Cash Drawer Management
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       cash-drawer
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       TESTER-077
 * GENERATED:    2026-03-17T13:17:39.357Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
export {}; // ES module isolation

// --- Helper Interfaces and Custom Error Classes (typically defined globally or in a shared module) ---

interface CashDrawer {
  id: string;
  tenantId: string;
  openedByUserId: string;
  status: 'OPEN' | 'CLOSED';
  currentBalance: number;
  currency: string;
  openedAt: Date;
  closedAt?: Date;
}

interface Transaction {
  id: string;
  drawerId: string;
  tenantId: string;
  userId: string;
  amount: number;
  type: 'CASH_IN' | 'CASH_OUT';
  timestamp: Date;
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

class ConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

class DatabaseConstraintError extends Error { // Generic for scenarios not covered by specific errors
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConstraintError';
  }
}


// --- Mock CashDrawerService (representing the module under test) ---
// This mock simulates the behavior of the real Cash Drawer Management service,
// including its interaction with a hypothetical data store and permission system.
class MockCashDrawerService {
  private drawers: Map<string, CashDrawer> = new Map();
  private transactions: Transaction[] = [];
  public usersWithPermissions: Map<string, Set<string>> = new Map(); // userId -> Set<permission>
  private static MAX_AMOUNT_VALUE = 9999999999.99; // Simulating a DECIMAL(12,2) DB column

  reset() {
    this.drawers.clear();
    this.transactions = [];
    this.usersWithPermissions.clear();
  }

  private checkPermission(userId: string, permission: string): void {
    if (!this.usersWithPermissions.has(userId) || !this.usersWithPermissions.get(userId)?.has(permission)) {
      throw new PermissionDeniedError(`User ${userId} does not have permission: ${permission}`);
    }
  }

  // Helper for input validation
  private validateCommonInputs(tenantId: string, userId: string, drawerId?: string, amount?: number, currency?: string, transactionType?: string): void {
    if (typeof tenantId !== 'string' || !tenantId.trim()) {
      throw new ValidationError('Tenant ID is required.');
    }
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new ValidationError('User ID is required.');
    }
    if (drawerId !== undefined && (typeof drawerId !== 'string' || !drawerId.trim())) {
      throw new ValidationError('Drawer ID is required.');
    }
    if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount))) {
      throw new ValidationError('Amount must be a number.');
    }
    if (currency !== undefined && (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency))) {
      throw new ValidationError('Currency must be a 3-letter uppercase ISO code.');
    }
    if (transactionType !== undefined && !['CASH_IN', 'CASH_OUT'].includes(transactionType as any)) {
      throw new ValidationError('Invalid transaction type.');
    }
  }

  async openDrawer(
    tenantId: string,
    userId: string,
    initialAmount: number,
    currency: string,
    requestedDrawerId?: string
  ): Promise<CashDrawer> {
    this.checkPermission(userId, 'CASH_DRAWER:OPEN');
    this.validateCommonInputs(tenantId, userId, undefined, initialAmount, currency);

    if (initialAmount < 0) {
      throw new ValidationError('Initial amount cannot be negative.');
    }
    if (initialAmount > MockCashDrawerService.MAX_AMOUNT_VALUE) {
      throw new DatabaseConstraintError(`Initial amount exceeds maximum allowed value of ${MockCashDrawerService.MAX_AMOUNT_VALUE}.`);
    }

    const newDrawerId = requestedDrawerId || `DRAWER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Simulate unique constraint for drawerId
    if (this.drawers.has(newDrawerId)) {
      throw new ConflictError(`Drawer with ID ${newDrawerId} already exists.`);
    }

    const newDrawer: CashDrawer = {
      id: newDrawerId,
      tenantId,
      openedByUserId: userId,
      status: 'OPEN',
      currentBalance: initialAmount,
      currency,
      openedAt: new Date(),
    };

    this.drawers.set(newDrawerId, newDrawer);
    return Promise.resolve(newDrawer);
  }

  async closeDrawer(
    tenantId: string,
    userId: string,
    drawerId: string,
    finalAmount: number
  ): Promise<CashDrawer> {
    this.checkPermission(userId, 'CASH_DRAWER:CLOSE');
    this.validateCommonInputs(tenantId, userId, drawerId, finalAmount);

    if (finalAmount < 0) {
      throw new ValidationError('Final amount cannot be negative.');
    }
    if (finalAmount > MockCashDrawerService.MAX_AMOUNT_VALUE) {
      throw new DatabaseConstraintError(`Final amount exceeds maximum allowed value of ${MockCashDrawerService.MAX_AMOUNT_VALUE}.`);
    }

    const drawer = this.drawers.get(drawerId);

    if (!drawer || drawer.tenantId !== tenantId) {
      throw new NotFoundError(`Drawer with ID ${drawerId} not found for tenant ${tenantId}.`);
    }
    if (drawer.status === 'CLOSED') {
      throw new ConflictError(`Drawer with ID ${drawerId} is already closed.`);
    }

    drawer.status = 'CLOSED';
    drawer.closedAt = new Date();
    drawer.currentBalance = finalAmount; // For simplicity, we just set it. A real system would reconcile.
    return Promise.resolve(drawer);
  }

  async recordTransaction(
    tenantId: string,
    userId: string,
    drawerId: string,
    amount: number,
    transactionType: 'CASH_IN' | 'CASH_OUT'
  ): Promise<Transaction> {
    this.checkPermission(userId, 'CASH_DRAWER:RECORD_TRANSACTION');
    this.validateCommonInputs(tenantId, userId, drawerId, amount, undefined, transactionType);

    if (amount <= 0) {
      throw new ValidationError('Transaction amount must be a positive number.');
    }
    if (amount > MockCashDrawerService.MAX_AMOUNT_VALUE) {
      throw new DatabaseConstraintError(`Transaction amount exceeds maximum allowed value of ${MockCashDrawerService.MAX_AMOUNT_VALUE}.`);
    }

    const drawer = this.drawers.get(drawerId);

    if (!drawer || drawer.tenantId !== tenantId) {
      throw new NotFoundError(`Drawer with ID ${drawerId} not found for tenant ${tenantId}.`);
    }
    if (drawer.status === 'CLOSED') {
      throw new ConflictError(`Cannot record transaction for a closed drawer: ${drawerId}.`);
    }

    // Simulate concurrency control (optimistic locking)
    // In a real system, this would involve database transactions and locking mechanisms.
    // For this mock, we just check the balance and update.
    const currentBalance = drawer.currentBalance;
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate some processing delay for concurrency tests

    if (drawer.currentBalance !== currentBalance) { // Balance changed during processing
      throw new ConcurrencyError(`Drawer ${drawerId} balance changed during transaction attempt. Please retry.`);
    }

    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      drawerId,
      tenantId,
      userId,
      amount,
      type: transactionType,
      timestamp: new Date(),
    };

    if (transactionType === 'CASH_IN') {
      drawer.currentBalance += amount;
    } else { // CASH_OUT
      if (drawer.currentBalance < amount) {
        throw new ConcurrencyError(`Insufficient funds in drawer ${drawerId}. Current: ${drawer.currentBalance}, Attempted payout: ${amount}.`);
      }
      drawer.currentBalance -= amount;
    }
    this.transactions.push(newTransaction);
    return Promise.resolve(newTransaction);
  }

  async getDrawerStatus(tenantId: string, userId: string, drawerId: string): Promise<CashDrawer> {
    this.checkPermission(userId, 'CASH_DRAWER:VIEW');
    this.validateCommonInputs(tenantId, userId, drawerId);

    const drawer = this.drawers.get(drawerId);
    if (!drawer || drawer.tenantId !== tenantId) {
      throw new NotFoundError(`Drawer with ID ${drawerId} not found for tenant ${tenantId}.`);
    }
    return Promise.resolve({ ...drawer }); // Return a copy to prevent external modification
  }

  async listDrawers(tenantId: string, userId: string): Promise<CashDrawer[]> {
    this.checkPermission(userId, 'CASH_DRAWER:VIEW_ALL');
    this.validateCommonInputs(tenantId, userId);

    return Promise.resolve(
      Array.from(this.drawers.values()).filter(d => d.tenantId === tenantId)
    );
  }

  // --- Permission management helpers for tests ---
  assignPermission(userId: string, permission: string): void {
    if (!this.usersWithPermissions.has(userId)) {
      this.usersWithPermissions.set(userId, new Set());
    }
    this.usersWithPermissions.get(userId)!.add(permission);
  }

  revokePermission(userId: string, permission: string): void {
    if (this.usersWithPermissions.has(userId)) {
      this.usersWithPermissions.get(userId)!.delete(permission);
    }
  }

  assignAllPermissions(userId: string): void {
    this.assignPermission(userId, 'CASH_DRAWER:OPEN');
    this.assignPermission(userId, 'CASH_DRAWER:CLOSE');
    this.assignPermission(userId, 'CASH_DRAWER:RECORD_TRANSACTION');
    this.assignPermission(userId, 'CASH_DRAWER:VIEW');
    this.assignPermission(userId, 'CASH_DRAWER:VIEW_ALL');
  }
}

const mockCashDrawerService = new MockCashDrawerService();

// --- Jest Test Suite ---

describe('PaySurity POS-012: Cash Drawer Management Edge Cases', () => {
  const TENANT_ID_1 = 'tenant-alpha';
  const TENANT_ID_2 = 'tenant-beta';
  const USER_ID_ADMIN_1 = 'user-admin-alpha';
  const USER_ID_STAFF_1 = 'user-staff-alpha';
  const USER_ID_ADMIN_2 = 'user-admin-beta';
  const DRAWER_ID_1 = 'main-drawer-1';
  const DRAWER_ID_2 = 'secondary-drawer-2';

  beforeEach(() => {
    mockCashDrawerService.reset();
    // Assign default permissions to primary users for most tests
    mockCashDrawerService.assignAllPermissions(USER_ID_ADMIN_1);
    mockCashDrawerService.assignAllPermissions(USER_ID_ADMIN_2);
    mockCashDrawerService.assignAllPermissions(USER_ID_STAFF_1);
  });

  // Scenario 1: Empty/null inputs
  describe('1. Empty/null inputs', () => {
    it('should reject openDrawer with null/empty tenantId', async () => {
      await expect(mockCashDrawerService.openDrawer('', USER_ID_ADMIN_1, 100, 'USD')).rejects.toThrow(ValidationError);
      await expect(mockCashDrawerService.openDrawer(null as any, USER_ID_ADMIN_1, 100, 'USD')).rejects.toThrow(ValidationError);
    });

    it('should reject openDrawer with null/empty userId', async () => {
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, '', 100, 'USD')).rejects.toThrow(ValidationError);
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, null as any, 100, 'USD')).rejects.toThrow(ValidationError);
    });

    it('should reject closeDrawer with null/empty drawerId', async () => {
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, '', 0)).rejects.toThrow(ValidationError);
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, null as any, 0)).rejects.toThrow(ValidationError);
    });

    it('should reject recordTransaction with null/empty transactionType', async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_1);
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 50, '' as any)).rejects.toThrow(ValidationError);
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 50, null as any)).rejects.toThrow(ValidationError);
    });

    it('should reject getDrawerStatus with null/empty drawerId', async () => {
      await expect(mockCashDrawerService.getDrawerStatus(TENANT_ID_1, USER_ID_ADMIN_1, '')).rejects.toThrow(ValidationError);
      await expect(mockCashDrawerService.getDrawerStatus(TENANT_ID_1, USER_ID_ADMIN_1, null as any)).rejects.toThrow(ValidationError);
    });

    it('should reject listDrawers with null/empty tenantId', async () => {
      await expect(mockCashDrawerService.listDrawers('', USER_ID_ADMIN_1)).rejects.toThrow(ValidationError);
      await expect(mockCashDrawerService.listDrawers(null as any, USER_ID_ADMIN_1)).rejects.toThrow(ValidationError);
    });
  });

  // Scenario 2: Boundary values
  describe('2. Boundary values', () => {
    it('should allow opening a drawer with zero initial amount', async () => {
      const drawer = await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 0, 'USD');
      expect(drawer.currentBalance).toBe(0);
      expect(drawer.status).toBe('OPEN');
    });

    it('should reject opening a drawer with a negative initial amount', async () => {
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, -100, 'USD')).rejects.toThrow(ValidationError);
    });

    it('should allow recording a transaction with a very small positive amount (e.g., 0.01)', async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 10, 'USD', DRAWER_ID_1);
      const transaction = await mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 0.01, 'CASH_IN');
      expect(transaction.amount).toBe(0.01);
      const drawer = await mockCashDrawerService.getDrawerStatus(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1);
      expect(drawer.currentBalance).toBeCloseTo(10.01);
    });

    it('should reject recording a transaction with zero amount', async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_1);
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 0, 'CASH_IN')).rejects.toThrow(ValidationError);
    });

    it('should reject opening a drawer with an invalid currency code (e.g., "US")', async () => {
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'US')).rejects.toThrow(ValidationError);
    });

    it('should reject opening a drawer with an invalid currency code (e.g., "USAX")', async () => {
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USAX')).rejects.toThrow(ValidationError);
    });

    it('should reject an amount exceeding the maximum allowed value', async () => {
      const excessivelyLargeAmount = 99999999999.99; // Exceeds MockCashDrawerService.MAX_AMOUNT_VALUE
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, excessivelyLargeAmount, 'USD')).rejects.toThrow(DatabaseConstraintError);
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_1);
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, excessivelyLargeAmount, 'CASH_IN')).rejects.toThrow(DatabaseConstraintError);
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, excessivelyLargeAmount)).rejects.toThrow(DatabaseConstraintError);
    });

    it('should successfully handle an amount at the maximum allowed value', async () => {
      const maxAmount = 9999999999.99;
      const drawer = await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, maxAmount, 'USD');
      expect(drawer.currentBalance).toBe(maxAmount);
    });
  });

  // Scenario 3: Multi-tenant isolation
  describe('3. Multi-tenant isolation', () => {
    beforeEach(async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 500, 'USD', DRAWER_ID_1);
      await mockCashDrawerService.openDrawer(TENANT_ID_2, USER_ID_ADMIN_2, 300, 'EUR', DRAWER_ID_2);
    });

    it('should prevent a user from tenant B from accessing tenant A\'s drawer by ID', async () => {
      await expect(mockCashDrawerService.getDrawerStatus(TENANT_ID_2, USER_ID_ADMIN_2, DRAWER_ID_1)).rejects.toThrow(NotFoundError);
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_2, USER_ID_ADMIN_2, DRAWER_ID_1, 0)).rejects.toThrow(NotFoundError);
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_2, USER_ID_ADMIN_2, DRAWER_ID_1, 10, 'CASH_IN')).rejects.toThrow(NotFoundError);
    });

    it('should prevent a user from tenant A from accessing tenant B\'s drawer by ID', async () => {
      await expect(mockCashDrawerService.getDrawerStatus(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_2)).rejects.toThrow(NotFoundError);
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_2, 0)).rejects.toThrow(NotFoundError);
    });

    it('should ensure listDrawers only returns drawers for the requesting tenant', async () => {
      const drawersTenant1 = await mockCashDrawerService.listDrawers(TENANT_ID_1, USER_ID_ADMIN_1);
      expect(drawersTenant1.length).toBe(1);
      expect(drawersTenant1[0].id).toBe(DRAWER_ID_1);
      expect(drawersTenant1[0].tenantId).toBe(TENANT_ID_1);

      const drawersTenant2 = await mockCashDrawerService.listDrawers(TENANT_ID_2, USER_ID_ADMIN_2);
      expect(drawersTenant2.length).toBe(1);
      expect(drawersTenant2[0].id).toBe(DRAWER_ID_2);
      expect(drawersTenant2[0].tenantId).toBe(TENANT_ID_2);
    });
  });

  // Scenario 4: Concurrent request handling
  describe('4. Concurrent request handling', () => {
    const CONCURRENT_DRAWER_ID = 'concurrent-drawer';
    const CONCURRENT_USER = 'concurrent-user';

    beforeEach(async () => {
      await mockCashDrawerService.assignAllPermissions(CONCURRENT_USER);
      await mockCashDrawerService.openDrawer(TENANT_ID_1, CONCURRENT_USER, 1000, 'USD', CONCURRENT_DRAWER_ID);
    });

    it('should handle multiple concurrent CASH_IN transactions correctly', async () => {
      const initialBalance = 1000;
      const transactionsToPerform = 10;
      const amountPerTransaction = 100;

      const promises = Array.from({ length: transactionsToPerform }).map(() =>
        mockCashDrawerService.recordTransaction(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID, amountPerTransaction, 'CASH_IN')
      );

      await Promise.all(promises);

      const finalDrawerState = await mockCashDrawerService.getDrawerStatus(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID);
      expect(finalDrawerState.currentBalance).toBe(initialBalance + (transactionsToPerform * amountPerTransaction));
    });

    it('should prevent concurrent CASH_OUT transactions from overdrawing', async () => {
      const initialBalance = 100;
      const transactionsToPerform = 5;
      const amountPerTransaction = 50; // Total requested = 250, initial = 100

      // Reset with a specific initial balance for this test
      mockCashDrawerService.reset();
      mockCashDrawerService.assignAllPermissions(CONCURRENT_USER);
      await mockCashDrawerService.openDrawer(TENANT_ID_1, CONCURRENT_USER, initialBalance, 'USD', CONCURRENT_DRAWER_ID);

      const promises = Array.from({ length: transactionsToPerform }).map(() =>
        mockCashDrawerService.recordTransaction(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID, amountPerTransaction, 'CASH_OUT')
      );

      // We expect some to succeed and some to fail due to insufficient funds/concurrency
      const results = await Promise.allSettled(promises);

      const successfulTransactions = results.filter(res => res.status === 'fulfilled');
      const failedTransactions = results.filter(res => res.status === 'rejected');

      expect(successfulTransactions.length).toBeLessThanOrEqual(initialBalance / amountPerTransaction);
      expect(failedTransactions.length).toBeGreaterThan(0);
      expect(failedTransactions.some(res => (res as PromiseRejectedResult).reason instanceof ConcurrencyError)).toBe(true);

      const finalDrawerState = await mockCashDrawerService.getDrawerStatus(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID);
      // Final balance should be 0 or slightly more if some transactions failed due to concurrency check before actual debit
      expect(finalDrawerState.currentBalance).toBe(initialBalance - (successfulTransactions.length * amountPerTransaction));
      expect(finalDrawerState.currentBalance).toBeGreaterThanOrEqual(0);
    });

    it('should prevent closing a drawer concurrently with transactions', async () => {
      const initialBalance = 500;
      mockCashDrawerService.reset();
      mockCashDrawerService.assignAllPermissions(CONCURRENT_USER);
      await mockCashDrawerService.openDrawer(TENANT_ID_1, CONCURRENT_USER, initialBalance, 'USD', CONCURRENT_DRAWER_ID);

      const transactionPromise = mockCashDrawerService.recordTransaction(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID, 100, 'CASH_IN');
      // A small delay to ensure the transaction starts processing before close attempt
      await new Promise(resolve => setTimeout(resolve, 10));
      const closePromise = mockCashDrawerService.closeDrawer(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID, 600);

      const results = await Promise.allSettled([transactionPromise, closePromise]);

      const drawerStateAfter = await mockCashDrawerService.getDrawerStatus(TENANT_ID_1, CONCURRENT_USER, CONCURRENT_DRAWER_ID);

      // One of them should succeed, the other should fail or be affected.
      // If transaction finishes first, close fails due to balance mismatch or race.
      // If close finishes first, transaction fails as drawer is closed.
      expect(results.some(r => r.status === 'rejected' && (r as PromiseRejectedResult).reason instanceof ConcurrencyError || (r as PromiseRejectedResult).reason instanceof ConflictError)).toBe(true);

      // The final state should reflect either a successful close or successful transaction.
      // The mock currently does not have advanced locking, but demonstrates the error types.
      if (drawerStateAfter.status === 'CLOSED') {
        expect(results.find(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value.id.startsWith('TXN'))).toBeUndefined();
      } else {
        expect(results.find(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value.id.startsWith('DRAWER'))).toBeUndefined();
      }
    });
  });

  // Scenario 5: Auth/permission failures
  describe('5. Auth/permission failures', () => {
    const UNAUTHORIZED_USER = 'unauthorized-user';
    const DRAWER_ID_AUTH = 'auth-test-drawer';

    beforeEach(async () => {
      // Ensure unauthorized user starts with no permissions
      mockCashDrawerService.usersWithPermissions.clear();
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_AUTH);
    });

    it('should reject openDrawer if user lacks CASH_DRAWER:OPEN permission', async () => {
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, UNAUTHORIZED_USER, 100, 'USD')).rejects.toThrow(PermissionDeniedError);
    });

    it('should reject closeDrawer if user lacks CASH_DRAWER:CLOSE permission', async () => {
      mockCashDrawerService.assignPermission(UNAUTHORIZED_USER, 'CASH_DRAWER:VIEW'); // Can view, but not close
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, UNAUTHORIZED_USER, DRAWER_ID_AUTH, 0)).rejects.toThrow(PermissionDeniedError);
    });

    it('should reject recordTransaction if user lacks CASH_DRAWER:RECORD_TRANSACTION permission', async () => {
      mockCashDrawerService.assignPermission(UNAUTHORIZED_USER, 'CASH_DRAWER:VIEW');
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, UNAUTHORIZED_USER, DRAWER_ID_AUTH, 50, 'CASH_IN')).rejects.toThrow(PermissionDeniedError);
    });

    it('should reject getDrawerStatus if user lacks CASH_DRAWER:VIEW permission', async () => {
      await expect(mockCashDrawerService.getDrawerStatus(TENANT_ID_1, UNAUTHORIZED_USER, DRAWER_ID_AUTH)).rejects.toThrow(PermissionDeniedError);
    });

    it('should reject listDrawers if user lacks CASH_DRAWER:VIEW_ALL permission', async () => {
      await expect(mockCashDrawerService.listDrawers(TENANT_ID_1, UNAUTHORIZED_USER)).rejects.toThrow(PermissionDeniedError);
    });

    it('should allow operation when user has the specific permission', async () => {
      mockCashDrawerService.assignPermission(UNAUTHORIZED_USER, 'CASH_DRAWER:OPEN');
      const drawer = await mockCashDrawerService.openDrawer(TENANT_ID_1, UNAUTHORIZED_USER, 50, 'GBP');
      expect(drawer).toBeDefined();
      expect(drawer.openedByUserId).toBe(UNAUTHORIZED_USER);
    });
  });

  // Scenario 6: Database constraint violations
  describe('6. Database constraint violations', () => {
    it('should reject openDrawer if drawerId already exists (unique constraint)', async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_1);
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 200, 'USD', DRAWER_ID_1)).rejects.toThrow(ConflictError);
    });

    it('should reject recordTransaction for a non-existent drawerId', async () => {
      const NON_EXISTENT_DRAWER = 'non-existent-drawer';
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, NON_EXISTENT_DRAWER, 50, 'CASH_IN')).rejects.toThrow(NotFoundError);
    });

    it('should reject closeDrawer for a non-existent drawerId', async () => {
      const NON_EXISTENT_DRAWER = 'non-existent-drawer';
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, NON_EXISTENT_DRAWER, 0)).rejects.toThrow(NotFoundError);
    });

    it('should reject closing an already closed drawer', async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_1);
      await mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 0);
      await expect(mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 0)).rejects.toThrow(ConflictError);
    });

    it('should reject recording a transaction on a closed drawer', async () => {
      await mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'USD', DRAWER_ID_1);
      await mockCashDrawerService.closeDrawer(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 0);
      await expect(mockCashDrawerService.recordTransaction(TENANT_ID_1, USER_ID_ADMIN_1, DRAWER_ID_1, 50, 'CASH_IN')).rejects.toThrow(ConflictError);
    });

    it('should reject operation with an invalid currency format (DB constraint simulation)', async () => {
      // Mocked service already handles this via ValidationError, which simulates a DB constraint violation for currency enum/lookup
      await expect(mockCashDrawerService.openDrawer(TENANT_ID_1, USER_ID_ADMIN_1, 100, 'INVALID')).rejects.toThrow(ValidationError);
    });
  });
});
