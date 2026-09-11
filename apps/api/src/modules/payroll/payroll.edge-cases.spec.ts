/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  PAY-008 -- Earned Wage Access
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       payroll
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/PAY_PAYROLL.md
 * WORKER:       TESTER-085
 * GENERATED:    2026-03-17T13:18:25.900Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import 'jest';

// --- Mock Interfaces and Classes for the payroll module ---

/**
 * Represents an Earned Wage Access transaction.
 */
interface EWA_Transaction {
    id: string;
    employeeId: string;
    tenantId: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    processedAt?: Date;
    notes?: string;
}

/**
 * Represents an employee's relevant payroll data for EWA.
 */
interface EmployeePayrollData {
    employeeId: string;
    tenantId: string;
    currentEarnedWage: number; // Total earned but not yet paid
    availableEWA: number; // Maximum amount eligible for EWA (e.g., 50% of currentEarnedWage)
    lastEWAWithdrawal?: Date;
    totalWithdrawnThisPeriod: number;
}

/**
 * Mock Payroll Repository to simulate database interactions.
 */
class PayrollRepository {
    // In-memory store for employee data and transactions
    private employees: Map<string, EmployeePayrollData> = new Map();
    private transactions: Map<string, EWA_Transaction> = new Map();

    constructor() {
        this.reset(); // Initialize with seed data
    }

    /**
     * Retrieves an employee's payroll data, scoped by tenant.
     */
    async getEmployeePayrollData(employeeId: string, tenantId: string): Promise<EmployeePayrollData | null> {
        const data = this.employees.get(employeeId);
        if (data && data.tenantId === tenantId) {
            return { ...data }; // Return a clone to prevent direct modification of internal state
        }
        return null;
    }

    /**
     * Updates an employee's available EWA balance.
     * Re-reads the record from the map inside the method (atomic CAS simulation)
     * to prevent the last-write-wins race condition under concurrent JS Promises.
     * Throws an error if the new balance would be negative (simulating DB constraint).
     */
    async updateEmployeeAvailableEWA(employeeId: string, tenantId: string, _newAvailableEWA: number, amountWithdrawn: number): Promise<void> {
        // Re-read current state atomically (simulates DB SELECT FOR UPDATE)
        const data = this.employees.get(employeeId);
        if (data && data.tenantId === tenantId) {
            const newAvailableEWA = data.availableEWA - amountWithdrawn;
            if (newAvailableEWA < 0) {
                 throw new Error('DatabaseConstraintViolation: Available EWA cannot be negative.');
            }
            data.availableEWA = newAvailableEWA;
            data.totalWithdrawnThisPeriod += amountWithdrawn;
            this.employees.set(employeeId, data);
        } else {
             throw new Error('DatabaseError: Employee not found or tenant mismatch during update.');
        }
    }

    /**
     * Creates a new EWA transaction.
     * Throws an error if employee/tenant IDs are invalid or amount is non-positive (simulating DB constraints).
     */
    async createEwaTransaction(transaction: Omit<EWA_Transaction, 'id'>): Promise<EWA_Transaction> {
        const employeeData = this.employees.get(transaction.employeeId);
        if (!employeeData) {
            throw new Error('DatabaseConstraintViolation: Employee does not exist (FK violation).');
        }
        if (employeeData.tenantId !== transaction.tenantId) {
             throw new Error('DatabaseConstraintViolation: Tenant mismatch for employee (FK violation).');
        }
        if (transaction.amount <= 0) {
            throw new Error('DatabaseConstraintViolation: EWA amount must be positive.');
        }

        const id = `ewa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; // Unique ID
        const newTransaction: EWA_Transaction = { ...transaction, id };
        this.transactions.set(id, newTransaction);
        return newTransaction;
    }

    /**
     * Resets the repository to its initial seeded state.
     */
    reset() {
        this.employees.clear();
        this.transactions.clear();
        // Seed data for consistent tests
        this.employees.set('emp-tenantA-123', { employeeId: 'emp-tenantA-123', tenantId: 'tenantA-1', currentEarnedWage: 1000, availableEWA: 500, totalWithdrawnThisPeriod: 0 });
        this.employees.set('emp-tenantA-456', { employeeId: 'emp-tenantA-456', tenantId: 'tenantA-1', currentEarnedWage: 800, availableEWA: 400, totalWithdrawnThisPeriod: 0 });
        this.employees.set('emp-tenantB-789', { employeeId: 'emp-tenantB-789', tenantId: 'tenantB-1', currentEarnedWage: 1200, availableEWA: 600, totalWithdrawnThisPeriod: 0 });
        this.employees.set('emp-tenantA-low-balance', { employeeId: 'emp-tenantA-low-balance', tenantId: 'tenantA-1', currentEarnedWage: 100, availableEWA: 50, totalWithdrawnThisPeriod: 0 });
        this.employees.set('emp-tenantA-zero-balance', { employeeId: 'emp-tenantA-zero-balance', tenantId: 'tenantA-1', currentEarnedWage: 0, availableEWA: 0, totalWithdrawnThisPeriod: 0 });
        this.employees.set('emp-tenantA-high-balance', { employeeId: 'emp-tenantA-high-balance', tenantId: 'tenantA-1', currentEarnedWage: 2000, availableEWA: 1000, totalWithdrawnThisPeriod: 0 });
    }

    /**
     * Helper method for tests to inspect internal employee data.
     * Returns a CLONE so that mutations inside the service cannot corrupt
     * the snapshot captured before a service call.
     */
    _getEmployeeDataForTest(employeeId: string): EmployeePayrollData | undefined {
        const data = this.employees.get(employeeId);
        return data ? { ...data } : undefined;
    }
}

/**
 * Mock Authentication Service to simulate user authentication and authorization.
 */
class AuthService {
    private users: Map<string, { permissions: string[], employeeId?: string }> = new Map();

    constructor() {
        this.reset(); // Initialize with seed data
    }

    /**
     * Checks if a user has a specific permission.
     */
    async hasPermission(userId: string, permission: string): Promise<boolean> {
        const user = this.users.get(userId);
        return !!user && user.permissions.includes(permission);
    }

    /**
     * Gets the employee ID associated with a user, if any.
     */
    async getAssociatedEmployeeId(userId: string): Promise<string | null> {
        const user = this.users.get(userId);
        return user?.employeeId || null;
    }

    /**
     * Checks if a user is authenticated (exists in the system).
     */
    async isAuthenticated(userId: string): Promise<boolean> {
        return this.users.has(userId);
    }

    /**
     * Resets the authentication service to its initial seeded state.
     */
    reset() {
        this.users.clear();
        this.users.set('user-admin-A', { permissions: ['EWA_REQUEST_ALL', 'EWA_VIEW_ALL'], employeeId: 'emp-tenantA-123' });
        this.users.set('user-emp-A1', { permissions: ['EWA_REQUEST_SELF'], employeeId: 'emp-tenantA-123' });
        this.users.set('user-emp-A2', { permissions: ['EWA_REQUEST_SELF'], employeeId: 'emp-tenantA-456' });
        this.users.set('user-emp-B1', { permissions: ['EWA_REQUEST_SELF'], employeeId: 'emp-tenantB-789' });
        this.users.set('user-no-permission', { permissions: ['VIEW_PROFILE'], employeeId: 'emp-tenantA-low-balance' });
        this.users.set('user-unlinked', { permissions: ['EWA_REQUEST_SELF'] }); // User without an associated employeeId
    }
}

/**
 * The Earned Wage Access (EWA) service under test.
 * Implements the business logic for PAY-008.
 */
class EarnedWageAccessService {
    constructor(
        private payrollRepository: PayrollRepository,
        private authService: AuthService
    ) {}

    /**
     * Handles a request for Earned Wage Access.
     * Performs validation, authorization, balance checks, and records the transaction.
     */
    async requestEarnedWageAccess(
        employeeId: string,
        amount: number,
        tenantId: string,
        userId: string // User making the request
    ): Promise<EWA_Transaction> {
        // 1. Authentication Check
        if (!userId) {
            throw new Error('AuthenticationError: User ID cannot be empty.');
        }
        if (!await (this.authService as any).isAuthenticated(userId)) {
            throw new Error('AuthenticationError: User not authenticated.');
        }

        // 2. Input Validation
        if (!employeeId || !tenantId) {
            throw new Error('ValidationError: Employee ID and Tenant ID cannot be empty.');
        }
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            throw new Error('ValidationError: Amount must be a positive number.');
        }
        if (amount < 0.01) { // Example: Minimum EWA amount
            throw new Error('ValidationError: Minimum EWA amount is 0.01.');
        }

        // 3. Authorization Check
        const hasSelfPermission = await (this.authService as any).hasPermission(userId, 'EWA_REQUEST_SELF');
        const hasAllPermission = await (this.authService as any).hasPermission(userId, 'EWA_REQUEST_ALL');
        const associatedEmployeeId = await (this.authService as any).getAssociatedEmployeeId(userId);

        if (!hasSelfPermission && !hasAllPermission) {
            throw new Error('AuthorizationError: User lacks permission to request EWA.');
        }

        if (hasSelfPermission && !hasAllPermission && associatedEmployeeId !== employeeId) {
            throw new Error('AuthorizationError: User can only request EWA for themselves.');
        }
        // If hasAllPermission is true, the user can request for any employee,
        // overriding the self-request constraint.

        // 4. Retrieve employee payroll data
        const employeeData = await this.payrollRepository.getEmployeePayrollData(employeeId, tenantId);
        if (!employeeData) {
            throw new Error('NotFoundError: Employee not found or tenant mismatch for the given ID.');
        }

        // 5. Check available balance
        if (amount > employeeData.availableEWA) {
            throw new Error('InsufficientFundsError: Requested amount exceeds available EWA.');
        }

        // 6. Create transaction and update balance
        const newAvailableEWA = employeeData.availableEWA - amount;
        const transaction: Omit<EWA_Transaction, 'id'> = {
            employeeId,
            tenantId,
            amount,
            status: 'approved', // Simplified: assume instant approval for this test
            requestedAt: new Date(),
        };

        try {
            // In a real system, this sequence would ideally be wrapped in a database transaction
            // or utilize robust locking mechanisms to prevent race conditions.
            // For this mock, we rely on the repository's internal state checks.
            await this.payrollRepository.updateEmployeeAvailableEWA(employeeId, tenantId, newAvailableEWA, amount);
            const createdTransaction = await this.payrollRepository.createEwaTransaction(transaction);
            return createdTransaction;
        } catch (error: any) {
            // Log the error and re-throw with a generic TransactionError,
            // or implement rollback logic if necessary.
            console.error('Error during EWA transaction processing:', error.message);
            throw new Error(`TransactionError: Could not process EWA due to an internal error. ${error.message}`);
        }
    }
}

// --- Jest Test Suite for PAY-008 Earned Wage Access ---

describe('PAY-008: Earned Wage Access (payroll module)', () => {
    let payrollRepository: PayrollRepository;
    let authService: AuthService;
    let ewaService: EarnedWageAccessService;

    beforeEach(() => {
        // Initialize new instances for each test to ensure isolation
        payrollRepository = new PayrollRepository();
        authService = new AuthService();
        ewaService = new EarnedWageAccessService(payrollRepository, authService);

        // Reset any spies and mock internal state
        jest.clearAllMocks();
        payrollRepository.reset();
        authService.reset();
    });

    // Scenario 1: Empty/null inputs
    describe('1. Empty/null inputs', () => {
        it('should throw ValidationError for null employeeId', async () => {
            await expect(ewaService.requestEarnedWageAccess(null as any, 100, 'tenantA-1', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Employee ID and Tenant ID cannot be empty.');
        });

        it('should throw ValidationError for empty employeeId string', async () => {
            await expect(ewaService.requestEarnedWageAccess('', 100, 'tenantA-1', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Employee ID and Tenant ID cannot be empty.');
        });

        it('should throw ValidationError for null amount', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', null as any, 'tenantA-1', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Amount must be a positive number.');
        });

        it('should throw ValidationError for undefined amount', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', undefined as any, 'tenantA-1', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Amount must be a positive number.');
        });

        it('should throw ValidationError for null tenantId', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', 100, null as any, 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Employee ID and Tenant ID cannot be empty.');
        });

        it('should throw ValidationError for empty tenantId string', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', 100, '', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Employee ID and Tenant ID cannot be empty.');
        });

        it('should throw AuthenticationError for null userId', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', 100, 'tenantA-1', null as any))
                .rejects.toThrow('AuthenticationError: User ID cannot be empty.');
        });

        it('should throw AuthenticationError for empty userId string', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', 100, 'tenantA-1', ''))
                .rejects.toThrow('AuthenticationError: User ID cannot be empty.');
        });
    });

    // Scenario 2: Boundary values
    describe('2. Boundary values', () => {
        it('should successfully process request for minimum allowed amount (0.01)', async () => {
            const employeeId = 'emp-tenantA-low-balance'; // Has 50 available EWA
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1'; // Re-assign user to this employee for the test
            (authService as any).users.get(userId).employeeId = employeeId;

            const initialData = payrollRepository._getEmployeeDataForTest(employeeId)!;
            const amount = 0.01;

            const transaction = await ewaService.requestEarnedWageAccess(employeeId, amount, tenantId, userId);

            expect(transaction).toBeDefined();
            expect(transaction.amount).toBe(amount);
            expect(transaction.employeeId).toBe(employeeId);
            expect(transaction.tenantId).toBe(tenantId);

            const finalData = payrollRepository._getEmployeeDataForTest(employeeId);
            expect(finalData?.availableEWA).toBeCloseTo(initialData.availableEWA - amount, 10); // Use toBeCloseTo for floating point
        });

        it('should successfully process request for exactly available EWA', async () => {
            const employeeId = 'emp-tenantA-123'; // Has 500 available EWA
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1';
            const initialData = payrollRepository._getEmployeeDataForTest(employeeId)!;
            const amount = initialData.availableEWA; // Request exact amount

            const transaction = await ewaService.requestEarnedWageAccess(employeeId, amount, tenantId, userId);

            expect(transaction).toBeDefined();
            expect(transaction.amount).toBe(amount);
            const finalData = payrollRepository._getEmployeeDataForTest(employeeId);
            expect(finalData?.availableEWA).toBe(0);
        });

        it('should throw InsufficientFundsError if amount slightly exceeds available EWA', async () => {
            const employeeId = 'emp-tenantA-123'; // Has 500 available EWA
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1';
            const initialData = payrollRepository._getEmployeeDataForTest(employeeId)!;
            const amount = initialData.availableEWA + 0.01; // Slightly more

            await expect(ewaService.requestEarnedWageAccess(employeeId, amount, tenantId, userId))
                .rejects.toThrow('InsufficientFundsError: Requested amount exceeds available EWA.');

            const finalData = payrollRepository._getEmployeeDataForTest(employeeId);
            expect(finalData?.availableEWA).toBe(initialData.availableEWA); // Balance should be unchanged
        });

        it('should throw ValidationError for zero amount', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', 0, 'tenantA-1', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Amount must be a positive number.');
        });

        it('should throw ValidationError for negative amount', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', -50, 'tenantA-1', 'user-emp-A1'))
                .rejects.toThrow('ValidationError: Amount must be a positive number.');
        });

        it('should throw InsufficientFundsError when employee has zero available EWA and requests non-zero amount', async () => {
            const employeeId = 'emp-tenantA-zero-balance'; // Has 0 available EWA
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1';
            (authService as any).users.get(userId).employeeId = employeeId; // Associate user with this employee

            await expect(ewaService.requestEarnedWageAccess(employeeId, 0.01, tenantId, userId))
                .rejects.toThrow('InsufficientFundsError: Requested amount exceeds available EWA.');

            const finalData = payrollRepository._getEmployeeDataForTest(employeeId);
            expect(finalData?.availableEWA).toBe(0); // Should remain zero
        });
    });

    // Scenario 3: Multi-tenant isolation
    describe('3. Multi-tenant isolation', () => {
        it('should successfully process EWA for tenantA employee without affecting tenantB', async () => {
            const empA_id = 'emp-tenantA-123';
            const tenantA_id = 'tenantA-1';
            const userA_id = 'user-emp-A1';
            const amountA = 100;

            const empB_id = 'emp-tenantB-789';
            const tenantB_id = 'tenantB-1';

            const initialDataA = payrollRepository._getEmployeeDataForTest(empA_id)!;
            const initialDataB = payrollRepository._getEmployeeDataForTest(empB_id)!;

            await ewaService.requestEarnedWageAccess(empA_id, amountA, tenantA_id, userA_id);

            const finalDataA = payrollRepository._getEmployeeDataForTest(empA_id);
            const finalDataB = payrollRepository._getEmployeeDataForTest(empB_id);

            expect(finalDataA?.availableEWA).toBe(initialDataA.availableEWA - amountA);
            expect(finalDataB?.availableEWA).toBe(initialDataB.availableEWA); // Tenant B unaffected
        });

        it('should throw NotFoundError if employeeId belongs to a different tenant', async () => {
            const empA_id = 'emp-tenantA-123';
            const tenantB_id = 'tenantB-1'; // Incorrect tenantId for empA_id
            const userA_id = 'user-emp-A1'; // User associated with empA_id

            await expect(ewaService.requestEarnedWageAccess(empA_id, 100, tenantB_id, userA_id))
                .rejects.toThrow('NotFoundError: Employee not found or tenant mismatch for the given ID.');

            // Ensure no state change for empA_id
            const initialDataA = payrollRepository._getEmployeeDataForTest(empA_id)!;
            expect(initialDataA.availableEWA).toBe(500);
        });

        it('should throw NotFoundError if attempting to access employee from another tenant, even as an admin', async () => {
            const empA_id = 'emp-tenantA-123';
            const tenantB_id = 'tenantB-1'; // Incorrect tenant for empA_id
            const userAdminA_id = 'user-admin-A'; // Admin for tenantA, but still cannot cross tenants

            await expect(ewaService.requestEarnedWageAccess(empA_id, 100, tenantB_id, userAdminA_id))
                .rejects.toThrow('NotFoundError: Employee not found or tenant mismatch for the given ID.');
        });
    });

    // Scenario 4: Concurrent request handling
    describe('4. Concurrent request handling', () => {
        it('should correctly handle two concurrent requests from the same employee when balance is sufficient for both', async () => {
            const employeeId = 'emp-tenantA-high-balance'; // Has 1000 available
            const tenantId = 'tenantA-1';
            const userId = 'user-admin-A'; // Admin user for flexible testing
            (authService as any).users.get(userId).employeeId = employeeId; // Associate admin for self-request test

            const initialBalance = payrollRepository._getEmployeeDataForTest(employeeId)!.availableEWA; // 1000
            const amount1 = 200;
            const amount2 = 300;

            const promise1 = ewaService.requestEarnedWageAccess(employeeId, amount1, tenantId, userId);
            const promise2 = ewaService.requestEarnedWageAccess(employeeId, amount2, tenantId, userId);

            // Using Promise.all ensures both requests are initiated "concurrently"
            const [result1, result2] = await Promise.all([promise1, promise2]);

            expect(result1).toBeDefined();
            expect(result2).toBeDefined();

            const finalBalance = payrollRepository._getEmployeeDataForTest(employeeId)!.availableEWA;
            expect(finalBalance).toBe(initialBalance - amount1 - amount2); // Both should succeed
        });

        it('should correctly handle two concurrent requests from the same employee when balance is sufficient for only one', async () => {
            const employeeId = 'emp-tenantA-123'; // Has 500 available
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1';

            const initialBalance = payrollRepository._getEmployeeDataForTest(employeeId)!.availableEWA; // 500
            const amount1 = 300;
            const amount2 = 300; // Total 600, exceeds 500

            // Spy on the repository methods to observe interactions
            const updateSpy = jest.spyOn(payrollRepository, 'updateEmployeeAvailableEWA');
            const createSpy = jest.spyOn(payrollRepository, 'createEwaTransaction');

            // Initiate requests concurrently
            const promise1 = ewaService.requestEarnedWageAccess(employeeId, amount1, tenantId, userId);
            const promise2 = ewaService.requestEarnedWageAccess(employeeId, amount2, tenantId, userId);

            // Use Promise.allSettled to ensure both promises run to completion (resolve or reject)
            const [result1, result2] = await Promise.allSettled([promise1, promise2]);

            // Expect one success and one failure
            let successfulTransactions = 0;
            let failedTransactions = 0;

            if (result1.status === 'fulfilled') successfulTransactions++;
            if (result1.status === 'rejected') failedTransactions++;

            if (result2.status === 'fulfilled') successfulTransactions++;
            if (result2.status === 'rejected') failedTransactions++;

            expect(successfulTransactions).toBe(1);
            expect(failedTransactions).toBe(1);

            // The failed request should have an InsufficientFundsError or a TransactionError
            const failedReason = (result1 as PromiseRejectedResult).reason || (result2 as PromiseRejectedResult).reason;
            expect(failedReason.message).toMatch(/(InsufficientFundsError|TransactionError)/);

            // Final balance should reflect only one successful withdrawal
            const finalBalance = payrollRepository._getEmployeeDataForTest(employeeId)!.availableEWA;
            expect(finalBalance).toBe(initialBalance - Math.min(amount1, amount2)); // One transaction completed.

            // Verify repository interactions
            expect(updateSpy).toHaveBeenCalledTimes(2); // Both attempts to update the balance
            expect(createSpy).toHaveBeenCalledTimes(1); // Only one successful transaction created
        });

        it('should correctly handle concurrent requests from different employees in the same tenant', async () => {
            const empA_id = 'emp-tenantA-123'; // 500 available
            const empB_id = 'emp-tenantA-456'; // 400 available
            const tenantId = 'tenantA-1';

            const userA_id = 'user-emp-A1';
            const userB_id = 'user-emp-A2';

            const initialBalanceA = payrollRepository._getEmployeeDataForTest(empA_id)!.availableEWA;
            const initialBalanceB = payrollRepository._getEmployeeDataForTest(empB_id)!.availableEWA;

            const amountA = 100;
            const amountB = 50;

            const promiseA = ewaService.requestEarnedWageAccess(empA_id, amountA, tenantId, userA_id);
            const promiseB = ewaService.requestEarnedWageAccess(empB_id, amountB, tenantId, userB_id);

            // Both should process independently and succeed
            const [resultA, resultB] = await Promise.all([promiseA, promiseB]);

            expect(resultA).toBeDefined();
            expect(resultB).toBeDefined();

            const finalBalanceA = payrollRepository._getEmployeeDataForTest(empA_id)!.availableEWA;
            const finalBalanceB = payrollRepository._getEmployeeDataForTest(empB_id)!.availableEWA;

            expect(finalBalanceA).toBe(initialBalanceA - amountA);
            expect(finalBalanceB).toBe(initialBalanceB - amountB);
        });
    });

    // Scenario 5: Auth/permission failures
    describe('5. Auth/permission failures', () => {
        it('should throw AuthenticationError for non-existent userId', async () => {
            await expect(ewaService.requestEarnedWageAccess('emp-tenantA-123', 100, 'tenantA-1', 'non-existent-user'))
                .rejects.toThrow('AuthenticationError: User not authenticated.');
        });

        it('should throw AuthorizationError for user without EWA permission', async () => {
            const employeeId = 'emp-tenantA-low-balance';
            const userId = 'user-no-permission'; // This user exists but has only 'VIEW_PROFILE'

            await expect(ewaService.requestEarnedWageAccess(employeeId, 10, 'tenantA-1', userId))
                .rejects.toThrow('AuthorizationError: User lacks permission to request EWA.');
        });

        it('should throw AuthorizationError when user attempts to request EWA for another employee (self-only permission)', async () => {
            const employeeId = 'emp-tenantA-456'; // Employee A2
            const userId = 'user-emp-A1'; // User A1, associated with employee A1, has EWA_REQUEST_SELF

            await expect(ewaService.requestEarnedWageAccess(employeeId, 100, 'tenantA-1', userId))
                .rejects.toThrow('AuthorizationError: User can only request EWA for themselves.');
        });

        it('should successfully allow admin user to request EWA for another employee', async () => {
            const employeeId = 'emp-tenantA-456'; // Employee A2
            const tenantId = 'tenantA-1';
            const userId = 'user-admin-A'; // Admin, has EWA_REQUEST_ALL
            const amount = 50;

            const initialData = payrollRepository._getEmployeeDataForTest(employeeId)!;

            const transaction = await ewaService.requestEarnedWageAccess(employeeId, amount, tenantId, userId);

            expect(transaction).toBeDefined();
            expect(transaction.employeeId).toBe(employeeId);
            const finalData = payrollRepository._getEmployeeDataForTest(employeeId);
            expect(finalData?.availableEWA).toBe(initialData.availableEWA - amount);
        });

        it('should throw AuthorizationError when user linked to no employee attempts self-request', async () => {
            const employeeId = 'emp-tenantA-123'; // Some valid employee ID
            const tenantId = 'tenantA-1';
            const userId = 'user-unlinked'; // User exists, has EWA_REQUEST_SELF, but no employeeId link

            await expect(ewaService.requestEarnedWageAccess(employeeId, 100, tenantId, userId))
                .rejects.toThrow('AuthorizationError: User can only request EWA for themselves.');
        });
    });

    // Scenario 6: Database constraint violations (simulated via mock repository)
    describe('6. Database constraint violations', () => {
        it('should throw TransactionError if PayrollRepository.updateEmployeeAvailableEWA throws a negative balance constraint error', async () => {
            const employeeId = 'emp-tenantA-123';
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1';
            const amount = 100; // A valid amount

            // Mock the repository to simulate a DB constraint violation during update,
            // even if the service's balance check passed (e.g., due to a race condition or an edge case not caught by application logic).
            jest.spyOn(payrollRepository, 'updateEmployeeAvailableEWA').mockRejectedValueOnce(
                new Error('DatabaseConstraintViolation: Available EWA cannot be negative.')
            );

            await expect(ewaService.requestEarnedWageAccess(employeeId, amount, tenantId, userId))
                .rejects.toThrow('TransactionError: Could not process EWA due to an internal error. DatabaseConstraintViolation: Available EWA cannot be negative.');
        });

        it('should throw TransactionError if PayrollRepository.createEwaTransaction throws due to invalid employeeId (FK violation)', async () => {
            const invalidEmployeeId = 'non-existent-employee-id'; // This ID is NOT in the seeded data
            const tenantId = 'tenantA-1';
            const userId = 'user-admin-A'; // Admin user for flexible testing
            const amount = 50;

            // Mock getEmployeePayrollData to return a value for the *invalid* employee ID.
            // This simulates a scenario where an employee's existence check passes (e.g., data inconsistency, cache issue)
            // but the underlying database foreign key constraint fails during the transaction creation.
            jest.spyOn(payrollRepository, 'getEmployeePayrollData').mockResolvedValueOnce({
                employeeId: invalidEmployeeId, tenantId, currentEarnedWage: 1000, availableEWA: 500, totalWithdrawnThisPeriod: 0
            });
            // Mock updateEmployeeAvailableEWA to succeed, as it would if the employee data was retrieved.
            jest.spyOn(payrollRepository, 'updateEmployeeAvailableEWA').mockResolvedValueOnce(undefined);
            // Mock createEwaTransaction to fail due to the FK violation for the invalid ID.
            jest.spyOn(payrollRepository, 'createEwaTransaction').mockRejectedValueOnce(
                new Error('DatabaseConstraintViolation: Employee does not exist (FK violation).')
            );

            await expect(ewaService.requestEarnedWageAccess(invalidEmployeeId, amount, tenantId, userId))
                .rejects.toThrow('TransactionError: Could not process EWA due to an internal error. DatabaseConstraintViolation: Employee does not exist (FK violation).');
        });

        it('should throw TransactionError if PayrollRepository.createEwaTransaction throws due to tenant mismatch (FK violation)', async () => {
            const employeeId = 'emp-tenantA-123';
            const userId = 'user-emp-A1';
            const amount = 50;

            // Mock getEmployeePayrollData to simulate it returning employee data
            jest.spyOn(payrollRepository, 'getEmployeePayrollData').mockResolvedValueOnce({
                employeeId, tenantId: 'tenantA-1', currentEarnedWage: 1000, availableEWA: 500, totalWithdrawnThisPeriod: 0
            });
            jest.spyOn(payrollRepository, 'updateEmployeeAvailableEWA').mockResolvedValueOnce(undefined);
            // Mock createEwaTransaction to specifically fail due to a tenant mismatch.
            // This could happen if the transaction object's tenantId somehow differs from the employee's actual tenantId
            // during the final write to a transaction-specific table.
            jest.spyOn(payrollRepository, 'createEwaTransaction').mockRejectedValueOnce(
                new Error('DatabaseConstraintViolation: Tenant mismatch for employee (FK violation).')
            );

            await expect(ewaService.requestEarnedWageAccess(employeeId, amount, 'tenantA-1', userId))
                .rejects.toThrow('TransactionError: Could not process EWA due to an internal error. DatabaseConstraintViolation: Tenant mismatch for employee (FK violation).');
        });

        it('should throw TransactionError if PayrollRepository.createEwaTransaction throws due to non-positive amount constraint', async () => {
            const employeeId = 'emp-tenantA-123';
            const tenantId = 'tenantA-1';
            const userId = 'user-emp-A1';
            const amount = 0.01; // This amount is validated as positive by the service.

            // Mock `createEwaTransaction` to fail with a specific DB constraint error.
            // This simulates a scenario where the application-level validation might have been bypassed
            // or a subtle bug allowed a non-positive amount to reach the repository, which then relies on DB for final check.
            jest.spyOn(payrollRepository, 'createEwaTransaction').mockRejectedValueOnce(
                new Error('DatabaseConstraintViolation: EWA amount must be positive.')
            );
            // Ensure preceding steps pass
            jest.spyOn(payrollRepository, 'getEmployeePayrollData').mockResolvedValueOnce({
                employeeId, tenantId, currentEarnedWage: 1000, availableEWA: 500, totalWithdrawnThisPeriod: 0
            });
            jest.spyOn(payrollRepository, 'updateEmployeeAvailableEWA').mockResolvedValueOnce(undefined);

            await expect(ewaService.requestEarnedWageAccess(employeeId, amount, tenantId, userId))
                .rejects.toThrow('TransactionError: Could not process EWA due to an internal error. DatabaseConstraintViolation: EWA amount must be positive.');
        });
    });
});

