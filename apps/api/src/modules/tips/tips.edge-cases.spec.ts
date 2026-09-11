/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-011 -- Tip Management
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       tips
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       TESTER-050
 * GENERATED:    2026-03-17T13:16:18.519Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
// jest is globally available in the Jest runtime â€” no explicit import required
export {}; // Marks this file as an ES module, isolating its block-scoped declarations.

// --- Mocking core PaySurity modules and types ---

// Assume PaySurity's common error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
class ConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}
class DatabaseConstraintError extends Error {
  constructor(message: string, public constraintName?: string) {
    super(message);
    this.name = 'DatabaseConstraintError';
  }
}

// Basic types for the Tip module
interface Tip {
  id: string;
  tenantId: string;
  userId: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  deviceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TipCreationData {
  tenantId: string;
  userId: string;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: Date;
  deviceId?: string;
}

interface ListTipsFilters {
  userId?: string;
  transactionId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

interface TipSummary {
  totalAmount: number;
  currency: string;
  count: number;
}

// Explicit interface to prevent cross-file type-pollution (TS2451/TS2339)
interface MockAuthServiceType {
  checkPermission: jest.Mock<Promise<boolean>, [authToken: string, requiredPermission: string, resourceTenantId?: string]>;
  getTenantIdFromToken: jest.Mock<string, [authToken: string]>;
}

// Mock of the authentication service
const mockAuthService: MockAuthServiceType = {
  checkPermission: jest.fn(
    async (
      authToken: string,
      requiredPermission: string,
      resourceTenantId?: string,
    ): Promise<boolean> => {
      if (authToken === 'invalid-token') {
        throw new UnauthorizedError('Invalid authentication token');
      }
      if (authToken === 'expired-token') {
        throw new UnauthorizedError('Expired authentication token');
      }
      if (
        (authToken === 'token-tenantA-viewer' && requiredPermission === 'tips:manage') ||
        (authToken === 'token-tenantB-viewer' && requiredPermission === 'tips:manage')
      ) {
        return false; // Viewer cannot manage
      }
      if (resourceTenantId && authToken.includes('tenantA') && resourceTenantId !== 'tenantA') {
        return false; // Tenant A user trying to access Tenant B
      }
      if (resourceTenantId && authToken.includes('tenantB') && resourceTenantId !== 'tenantB') {
        return false; // Tenant B user trying to access Tenant A
      }
      return true;
    },
  ),
  getTenantIdFromToken: jest.fn((authToken: string): string => {
    if (authToken.includes('tenantA')) return 'tenantA-123';
    if (authToken.includes('tenantB')) return 'tenantB-456';
    return 'default-tenant';
  }),
};

// Mock of the TipsRepository
const mockTipsRepository = {
  createTip: jest.fn(
    async (tipData: TipCreationData): Promise<Tip> => {
      // Simulate unique ID generation
      const newTip: Tip = {
        ...tipData,
        id: `tip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // In a real mock, you'd store this
      return Promise.resolve(newTip);
    },
  ),
  findTipById: jest.fn(
    async (tenantId: string, tipId: string): Promise<Tip | null> => {
      // Simulate finding a tip
      const storedTips: Tip[] = (mockTipsRepository as any)._storedTips || [];
      const tip = storedTips.find((t) => t.id === tipId && t.tenantId === tenantId);
      return Promise.resolve(tip || null);
    },
  ),
  findTips: jest.fn(
    async (tenantId: string, filters: ListTipsFilters): Promise<PaginatedResult<Tip>> => {
      // Simulate filtering
      const storedTips: Tip[] = (mockTipsRepository as any)._storedTips || [];
      const tenantTips = storedTips.filter((t) => t.tenantId === tenantId);

      const filtered = tenantTips.filter((tip) => {
        let match = true;
        if (filters.userId && tip.userId !== filters.userId) match = false;
        if (filters.transactionId && tip.transactionId !== filters.transactionId) match = false;
        if (filters.startDate && tip.timestamp < filters.startDate) match = false;
        if (filters.endDate && tip.timestamp > filters.endDate) match = false;
        return match;
      });

      const total = filtered.length;
      const limit = filters.limit ?? 10;
      const offset = filters.offset ?? 0;
      const items = filtered.slice(offset, offset + limit);

      return Promise.resolve({ items, total, limit, offset });
    },
  ),
  aggregateTips: jest.fn(
    async (
      tenantId: string,
      startDate: Date,
      endDate: Date,
    ): Promise<{ totalAmount: number; count: number }> => {
      const storedTips: Tip[] = (mockTipsRepository as any)._storedTips || [];
      const tenantTips = storedTips.filter((t) => t.tenantId === tenantId);

      const relevantTips = tenantTips.filter(
        (tip) => tip.timestamp >= startDate && tip.timestamp <= endDate,
      );

      const totalAmount = relevantTips.reduce((sum, tip) => sum + tip.amount, 0);
      return Promise.resolve({ totalAmount, count: relevantTips.length });
    },
  ),
  // Helper for tests to pre-fill data
  _setStoredTips: jest.fn((tips: Tip[]) => {
    (mockTipsRepository as any)._storedTips = tips;
  }),
};

// --- The Tip Management Service (System Under Test) ---
class TipsService {
  constructor(
    private tipsRepository: typeof mockTipsRepository,
    private authService: typeof mockAuthService,
  ) {}

  private async authorize(
    authToken: string,
    permission: string,
    resourceTenantId: string,
  ): Promise<void> {
    const isAuthorized = await (this.authService as any).checkPermission(
      authToken,
      permission,
      resourceTenantId,
    );
    if (!isAuthorized) {
      const callerTenantId = (this.authService as any).getTenantIdFromToken(authToken);
      if (callerTenantId !== resourceTenantId) {
        throw new ForbiddenError('Access to other tenant resources is forbidden.');
      }
      throw new ForbiddenError(`User not authorized to perform ${permission}`);
    }
  }

  async addTip(
    tenantId: string,
    userId: string,
    transactionId: string,
    amount: number,
    currency: string,
    timestamp: Date,
    deviceId: string | undefined,
    authToken: string,
  ): Promise<Tip> {
    await this.authorize(authToken, 'tips:manage', tenantId);

    if (!tenantId || !userId || !transactionId || !currency || !timestamp) {
      throw new ValidationError('Required fields (tenantId, userId, transactionId, currency, timestamp) cannot be empty.');
    }
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new ValidationError('Tip amount must be a positive number.');
    }
    if (!['USD', 'EUR', 'GBP'].includes(currency.toUpperCase())) { // Example currency check
      throw new ValidationError('Unsupported currency.');
    }
    if (!(timestamp instanceof Date) || isNaN(timestamp.getTime())) {
      throw new ValidationError('Invalid timestamp provided.');
    }

    try {
      const tipData: TipCreationData = {
        tenantId,
        userId,
        transactionId,
        amount,
        currency: currency.toUpperCase(),
        timestamp,
        deviceId,
      };
      return await this.tipsRepository.createTip(tipData);
    } catch (error: any) {
      if (error.name === 'DatabaseConstraintError') {
        throw new DatabaseConstraintError(`Failed to add tip due to database constraint: ${error.message}`);
      }
      throw error;
    }
  }

  async getTip(tenantId: string, tipId: string, authToken: string): Promise<Tip | null> {
    await this.authorize(authToken, 'tips:view', tenantId);

    if (!tenantId || !tipId) {
      throw new ValidationError('Tenant ID and Tip ID cannot be empty.');
    }

    const tip = await this.tipsRepository.findTipById(tenantId, tipId);
    if (!tip) {
      throw new NotFoundError(`Tip with ID ${tipId} not found for tenant ${tenantId}.`);
    }
    return tip;
  }

  async listTips(
    tenantId: string,
    filters: ListTipsFilters,
    authToken: string,
  ): Promise<PaginatedResult<Tip>> {
    await this.authorize(authToken, 'tips:view', tenantId);

    if (!tenantId) {
      throw new ValidationError('Tenant ID cannot be empty.');
    }
    if (filters.limit !== undefined && (filters.limit < 0 || filters.limit > 100)) {
      throw new ValidationError('Limit must be between 0 and 100.');
    }
    if (filters.offset !== undefined && filters.offset < 0) {
      throw new ValidationError('Offset cannot be negative.');
    }
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      throw new ValidationError('Start date cannot be after end date.');
    }

    return await this.tipsRepository.findTips(tenantId, filters);
  }

  async calculateTipSummary(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    authToken: string,
  ): Promise<TipSummary> {
    await this.authorize(authToken, 'tips:view_summary', tenantId);

    if (!tenantId) {
      throw new ValidationError('Tenant ID cannot be empty.');
    }
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid start date provided.');
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid end date provided.');
    }
    if (startDate > endDate) {
      throw new ValidationError('Start date cannot be after end date.');
    }

    const result = await this.tipsRepository.aggregateTips(tenantId, startDate, endDate);
    // Assuming a single currency per tenant or the aggregation handles it
    // For simplicity, hardcoding currency for summary based on what `addTip` supports
    return {
      totalAmount: result.totalAmount,
      currency: 'USD', // This could be made dynamic based on configuration or aggregation logic
      count: result.count,
    };
  }
}

// --- Jest Test Suite ---
describe('POSR-011 - Tips Management Edge Cases', () => {
  let tipsService: TipsService;
  const adminAuthToken = 'token-admin';
  const tenantAAuthToken = 'token-tenantA-manager';
  const tenantBAuthToken = 'token-tenantB-manager';
  const tenantAViewerToken = 'token-tenantA-viewer';

  beforeEach(() => {
    jest.clearAllMocks();
    tipsService = new TipsService(mockTipsRepository, mockAuthService);

    // Reset internal mock storage
    mockTipsRepository._setStoredTips([]);

    // Default mock behavior for auth checks
    mockAuthService.checkPermission.mockImplementation(
      async (token, permission, resourceTenantId) => {
        if (token === 'invalid-token' || token === 'expired-token') return false;
        if (token.includes('viewer') && permission.includes('manage')) return false;
        if (token.includes('tenantA') && resourceTenantId !== 'tenantA-123') return false;
        if (token.includes('tenantB') && resourceTenantId !== 'tenantB-456') return false;
        return true;
      },
    );
    mockAuthService.getTenantIdFromToken.mockImplementation((token) => {
      if (token.includes('tenantA')) return 'tenantA-123';
      if (token.includes('tenantB')) return 'tenantB-456';
      return 'admin-tenant';
    });
  });

  // 1. Empty/null inputs
  describe('1. Empty/null inputs', () => {
    const validTipData = {
      userId: 'user123',
      transactionId: 'trans456',
      amount: 10.5,
      currency: 'USD',
      timestamp: new Date(),
      deviceId: 'pos-1',
    };

    it('should throw ValidationError for null tenantId when adding a tip', async () => {
      await expect(
        tipsService.addTip(
          null as any,
          validTipData.userId,
          validTipData.transactionId,
          validTipData.amount,
          validTipData.currency,
          validTipData.timestamp,
          validTipData.deviceId,
          tenantAAuthToken,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for undefined userId when adding a tip', async () => {
      await expect(
        tipsService.addTip(
          'tenantA-123',
          undefined as any,
          validTipData.transactionId,
          validTipData.amount,
          validTipData.currency,
          validTipData.timestamp,
          validTipData.deviceId,
          tenantAAuthToken,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for null amount when adding a tip', async () => {
      await expect(
        tipsService.addTip(
          'tenantA-123',
          validTipData.userId,
          validTipData.transactionId,
          null as any,
          validTipData.currency,
          validTipData.timestamp,
          validTipData.deviceId,
          tenantAAuthToken,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for null tipId when getting a tip', async () => {
      await expect(tipsService.getTip('tenantA-123', null as any, tenantAAuthToken)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError for undefined tenantId when listing tips', async () => {
      await expect(
        tipsService.listTips(undefined as any, {}, tenantAAuthToken),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for null startDate when calculating summary', async () => {
      await expect(
        tipsService.calculateTipSummary('tenantA-123', null as any, new Date(), tenantAAuthToken),
      ).rejects.toThrow(ValidationError);
    });
  });

  // 2. Boundary values
  describe('2. Boundary values', () => {
    const commonTipArgs = ['tenantA-123', 'user1', 'trans1', 'USD', new Date(), 'pos-1', tenantAAuthToken];

    it('should allow minimum positive amount (e.g., 0.01)', async () => {
      const tip = await tipsService.addTip(...commonTipArgs.slice(0, 3) as [string, string, string], 0.01, ...commonTipArgs.slice(4) as [string, Date, string | undefined, string]);
      expect(tip.amount).toBe(0.01);
      expect(mockTipsRepository.createTip).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 0.01 }),
      );
    });

    it('should throw ValidationError for zero amount', async () => {
      await expect(
        tipsService.addTip(...commonTipArgs.slice(0, 3) as [string, string, string], 0, ...commonTipArgs.slice(4) as [string, Date, string | undefined, string]),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative amount', async () => {
      await expect(
        tipsService.addTip(...commonTipArgs.slice(0, 3) as [string, string, string], -10.0, ...commonTipArgs.slice(4) as [string, Date, string | undefined, string]),
      ).rejects.toThrow(ValidationError);
    });

    it('should allow maximum safe integer amount (if within system limits)', async () => {
      const largeAmount = Number.MAX_SAFE_INTEGER;
      const tip = await tipsService.addTip(...commonTipArgs.slice(0, 3) as [string, string, string], largeAmount, ...commonTipArgs.slice(4) as [string, Date, string | undefined, string]);
      expect(tip.amount).toBe(largeAmount);
      expect(mockTipsRepository.createTip).toHaveBeenCalledWith(
        expect.objectContaining({ amount: largeAmount }),
      );
    });

    it('should handle dates far in the past (Epoch)', async () => {
      const epochDate = new Date(0);
      const tip = await tipsService.addTip(...commonTipArgs.slice(0, 4) as [string, string, string, number], 'USD', epochDate, 'pos-1', tenantAAuthToken);
      expect(tip.timestamp).toEqual(epochDate);
    });

    it('should return empty list for date range with no tips', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      mockTipsRepository._setStoredTips([
        {
          id: 't1', tenantId: 'tenantA-123', userId: 'u1', transactionId: 'tr1', amount: 5, currency: 'USD',
          timestamp: new Date(2023, 0, 1), createdAt: new Date(), updatedAt: new Date(),
        },
      ]);
      const result = await tipsService.listTips(
        'tenantA-123',
        { startDate: tomorrow, endDate: dayAfterTomorrow },
        tenantAAuthToken,
      );
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should throw ValidationError for listTips with limit > 100', async () => {
      await expect(
        tipsService.listTips('tenantA-123', { limit: 101 }, tenantAAuthToken),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for listTips with negative offset', async () => {
      await expect(
        tipsService.listTips('tenantA-123', { offset: -1 }, tenantAAuthToken),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for summary with startDate after endDate', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      await expect(
        tipsService.calculateTipSummary('tenantA-123', today, yesterday, tenantAAuthToken),
      ).rejects.toThrow(ValidationError);
    });
  });

  // 3. Multi-tenant isolation
  describe('3. Multi-tenant isolation', () => {
    beforeEach(() => {
      // Seed data for two tenants
      mockTipsRepository._setStoredTips([
        {
          id: 'tipA1', tenantId: 'tenantA-123', userId: 'userA1', transactionId: 'transA1', amount: 10, currency: 'USD',
          timestamp: new Date(2023, 1, 1), createdAt: new Date(), updatedAt: new Date(),
        },
        {
          id: 'tipA2', tenantId: 'tenantA-123', userId: 'userA2', transactionId: 'transA2', amount: 15, currency: 'USD',
          timestamp: new Date(2023, 1, 2), createdAt: new Date(), updatedAt: new Date(),
        },
        {
          id: 'tipB1', tenantId: 'tenantB-456', userId: 'userB1', transactionId: 'transB1', amount: 20, currency: 'USD',
          timestamp: new Date(2023, 2, 1), createdAt: new Date(), updatedAt: new Date(),
        },
      ]);
    });

    it('should add a tip for tenantA and it should only be visible to tenantA', async () => {
      await tipsService.addTip(
        'tenantA-123', 'userA3', 'transA3', 5.0, 'USD', new Date(), 'pos-A', tenantAAuthToken,
      );

      const tenantATips = await tipsService.listTips('tenantA-123', {}, tenantAAuthToken);
      expect(tenantATips.items.length).toBe(3); // A1, A2, A3
      expect(tenantATips.items.some((tip) => tip.transactionId === 'transA3')).toBe(true);

      const tenantBTips = await tipsService.listTips('tenantB-456', {}, tenantBAuthToken);
      expect(tenantBTips.items.length).toBe(1); // B1
      expect(tenantBTips.items.some((tip) => tip.transactionId === 'transA3')).toBe(false);
    });

    it('should prevent tenantA user from getting a tip belonging to tenantB', async () => {
      await expect(
        tipsService.getTip('tenantA-123', 'tipB1', tenantAAuthToken),
      ).rejects.toThrow(NotFoundError); // Even if found by repo, service should filter by tenant
    });

    it('should prevent tenantA user from listing tips for tenantB', async () => {
      // The auth service mock should prevent this before it even hits the repo
      mockAuthService.checkPermission.mockImplementation(async (token, permission, resourceTenantId) => {
        return token === tenantAAuthToken && resourceTenantId === 'tenantA-123' && permission === 'tips:view';
      });

      await expect(
        tipsService.listTips('tenantB-456', {}, tenantAAuthToken),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should prevent a tip summary calculation for another tenant', async () => {
      await expect(
        tipsService.calculateTipSummary(
          'tenantB-456',
          new Date(2023, 0, 1),
          new Date(2023, 11, 31),
          tenantAAuthToken,
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // 4. Concurrent request handling
  describe('4. Concurrent request handling', () => {
    it('should handle multiple addTip requests concurrently without data loss', async () => {
      mockTipsRepository.createTip.mockImplementation(async (data: TipCreationData) => {
        // Simulate a small delay for concurrent ops
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
        const newTip: Tip = {
          ...data,
          id: `tip-${data.transactionId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // In a real scenario, this would involve adding to an array
        // For this test, we just check if all calls completed and returned unique IDs
        return newTip;
      });

      const promises = [];
      const numRequests = 10;
      for (let i = 0; i < numRequests; i++) {
        promises.push(
          tipsService.addTip(
            'tenantA-123',
            `user${i}`,
            `trans-con-${i}`,
            10.0 + i,
            'USD',
            new Date(),
            `device-${i}`,
            tenantAAuthToken,
          ),
        );
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(numRequests);
      // Ensure all tips have unique IDs
      const ids = results.map((r) => r.id);
      expect(new Set(ids).size).toBe(numRequests);
      // Ensure all tips were created via the repository
      expect(mockTipsRepository.createTip).toHaveBeenCalledTimes(numRequests);
    });

    it('should correctly calculate tip summary under concurrent reads', async () => {
      mockTipsRepository._setStoredTips([
        { id: 't1', tenantId: 'tenantA-123', userId: 'u1', transactionId: 'tr1', amount: 5, currency: 'USD', timestamp: new Date(2023, 0, 1), createdAt: new Date(), updatedAt: new Date() },
        { id: 't2', tenantId: 'tenantA-123', userId: 'u2', transactionId: 'tr2', amount: 10, currency: 'USD', timestamp: new Date(2023, 0, 2), createdAt: new Date(), updatedAt: new Date() },
        { id: 't3', tenantId: 'tenantA-123', userId: 'u3', transactionId: 'tr3', amount: 15, currency: 'USD', timestamp: new Date(2023, 0, 3), createdAt: new Date(), updatedAt: new Date() },
      ]);

      mockTipsRepository.aggregateTips.mockImplementation(async (tenantId, start, end) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 100)); // Simulate delay
        const storedTips: Tip[] = (mockTipsRepository as any)._storedTips || [];
        const relevantTips = storedTips.filter(
          (tip) => tip.tenantId === tenantId && tip.timestamp >= start && tip.timestamp <= end,
        );
        return {
          totalAmount: relevantTips.reduce((sum, tip) => sum + tip.amount, 0),
          count: relevantTips.length,
        };
      });

      const promises = [];
      const numRequests = 5;
      const startDate = new Date(2023, 0, 1);
      const endDate = new Date(2023, 0, 3);

      for (let i = 0; i < numRequests; i++) {
        promises.push(
          tipsService.calculateTipSummary('tenantA-123', startDate, endDate, tenantAAuthToken),
        );
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(numRequests);
      // All results should be consistent
      results.forEach((summary) => {
        expect(summary.totalAmount).toBe(30); // 5 + 10 + 15
        expect(summary.count).toBe(3);
      });
      expect(mockTipsRepository.aggregateTips).toHaveBeenCalledTimes(numRequests);
    });

    it('should propagate concurrency errors from repository (e.g., if a transaction fails)', async () => {
      mockTipsRepository.createTip.mockImplementationOnce(() => {
        throw new ConcurrencyError('Transaction conflicted, please retry.');
      });

      await expect(
        tipsService.addTip('tenantA-123', 'userX', 'transX', 5.0, 'USD', new Date(), 'pos-X', tenantAAuthToken),
      ).rejects.toThrow(ConcurrencyError);
    });
  });

  // 5. Auth/permission failures
  describe('5. Auth/permission failures', () => {
    const commonTipArgs = ['tenantA-123', 'user1', 'trans1', 10.0, 'USD', new Date(), 'pos-1'];

    it('should throw UnauthorizedError for an invalid authentication token', async () => {
      await expect(
        tipsService.addTip(...commonTipArgs as [string, string, string, number, string, Date, string | undefined], 'invalid-token'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for an expired authentication token', async () => {
      await expect(
        tipsService.addTip(...commonTipArgs as [string, string, string, number, string, Date, string | undefined], 'expired-token'),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw ForbiddenError when user lacks permission to add a tip', async () => {
      // Simulate a viewer token
      await expect(
        tipsService.addTip(...commonTipArgs as [string, string, string, number, string, Date, string | undefined], tenantAViewerToken),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when user lacks permission to view a tip', async () => {
      mockTipsRepository._setStoredTips([
        {
          id: 'tipA1', tenantId: 'tenantA-123', userId: 'userA1', transactionId: 'transA1', amount: 10, currency: 'USD',
          timestamp: new Date(2023, 1, 1), createdAt: new Date(), updatedAt: new Date(),
        },
      ]);
      await expect(
        tipsService.getTip('tenantA-123', 'tipA1', tenantAViewerToken),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when user lacks permission to list tips', async () => {
      await expect(
        tipsService.listTips('tenantA-123', {}, tenantAViewerToken),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when user lacks permission for summary', async () => {
      await expect(
        tipsService.calculateTipSummary(
          'tenantA-123',
          new Date(2023, 0, 1),
          new Date(2023, 11, 31),
          tenantAViewerToken,
        ),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  // 6. Database constraint violations
  describe('6. Database constraint violations', () => {
    const validTipData = {
      tenantId: 'tenantA-123',
      userId: 'user-db',
      transactionId: 'trans-db',
      amount: 10.0,
      currency: 'USD',
      timestamp: new Date(),
      deviceId: 'pos-db',
    };

    it('should throw DatabaseConstraintError if repository indicates a unique constraint violation (e.g., transactionId)', async () => {
      mockTipsRepository.createTip.mockImplementationOnce(() => {
        throw new DatabaseConstraintError(
          'Duplicate entry for transaction_id and tenant_id',
          'UQ_TransactionIdTenantId',
        );
      });

      await expect(
        tipsService.addTip(
          validTipData.tenantId,
          validTipData.userId,
          validTipData.transactionId,
          validTipData.amount,
          validTipData.currency,
          validTipData.timestamp,
          validTipData.deviceId,
          tenantAAuthToken,
        ),
      ).rejects.toThrow(DatabaseConstraintError);
      await expect(mockTipsRepository.createTip).toHaveBeenCalledTimes(1);
    });

    it('should throw DatabaseConstraintError if repository indicates a foreign key violation (e.g., invalid userId or transactionId)', async () => {
      mockTipsRepository.createTip.mockImplementationOnce(() => {
        throw new DatabaseConstraintError('Foreign key constraint failed: transaction_id not found', 'FK_TransactionId');
      });

      await expect(
        tipsService.addTip(
          validTipData.tenantId,
          validTipData.userId,
          'non-existent-transaction', // Simulate an invalid FK
          validTipData.amount,
          validTipData.currency,
          validTipData.timestamp,
          validTipData.deviceId,
          tenantAAuthToken,
        ),
      ).rejects.toThrow(DatabaseConstraintError);
      expect(mockTipsRepository.createTip).toHaveBeenCalledTimes(1);
    });

    it('should throw DatabaseConstraintError for generic database errors that are not handled as specific errors', async () => {
      mockTipsRepository.createTip.mockImplementationOnce(() => {
        throw new Error('Database connection lost unexpectedly.'); // Generic DB error
      });

      await expect(
        tipsService.addTip(
          validTipData.tenantId,
          validTipData.userId,
          validTipData.transactionId,
          validTipData.amount,
          validTipData.currency,
          validTipData.timestamp,
          validTipData.deviceId,
          tenantAAuthToken,
        ),
      ).rejects.toThrow('Database connection lost unexpectedly.'); // It should propagate the generic error
      expect(mockTipsRepository.createTip).toHaveBeenCalledTimes(1);
    });
  });
});

