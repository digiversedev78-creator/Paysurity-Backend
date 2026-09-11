/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AI-003 -- Smart Reorder
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       ai
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/AI_EXPERIENCE.md
 * WORKER:       TESTER-142
 * GENERATED:    2026-03-17T13:20:32.008Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
export class SmartReorderService { constructor(authService: any, orderService: any, productService: any, aiService: any, dbService: any) {} async reorder(tenantId: any, userId: any, orderId: any, options?: any): Promise<any> {} }

// Define custom error classes for better assertion
class ValidationError extends Error { constructor(message: string) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message: string) { super(message); this.name = 'NotFoundError'; } }
class UnauthorizedError extends Error { constructor(message: string) { super(message); this.name = 'UnauthorizedError'; } }
class ServiceError extends Error { constructor(message: string) { super(message); this.name = 'ServiceError'; } }

// Define types used in the service (these would ideally be in a shared types file)
interface SmartReorderOptions {
  includeOutOfStock?: boolean;
  reorderQuantityMap?: Map<string, number>; // productId -> quantity
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  tenantId: string;
  userId: string;
  items: OrderItem[];
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'DRAFT';
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface AIRecommendation {
  productId: string;
  quantity: number;
  reason: string;
}

interface NewOrderSummary {
  id: string;
  tenantId: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'DRAFT';
}

// Mock external dependencies
const mockAuthService = {
  hasPermission: jest.fn<Promise<boolean>, [string, string, string]>(),
};

const mockOrderService = {
  getOrderBySourceId: jest.fn<Promise<Order | null>, [string, string, string]>(),
  createDraftOrder: jest.fn<Promise<{ id: string; tenantId: string; userId: string; items: OrderItem[]; status: 'DRAFT' }>, [string, string]>(),
  updateOrder: jest.fn<Promise<Order>, [string, Partial<Order>]>(),
  // Add other methods if your service uses them, e.g., getOrderDetails, etc.
};

const mockProductService = {
  getProductsByIds: jest.fn<Promise<Product[]>, [string[]]>(),
  // checkProductAvailability: jest.fn<Promise<boolean>, [string]>(), // If separate check is needed
};

const mockAIRecommenderService = {
  getSmartReorderRecommendations: jest.fn<Promise<AIRecommendation[] | null>, [string, string, string]>(),
};

const mockDatabaseService = {
  beginTransaction: jest.fn<Promise<void>, []>(),
  commitTransaction: jest.fn<Promise<void>, []>(),
  rollbackTransaction: jest.fn<Promise<void>, []>(),
};

// Instantiate the service under test
let smartReorderService: SmartReorderService;

// Helper for default successful mocks
const defaultSourceOrder: Order = {
  id: 'prev-order-123',
  tenantId: 'tenant-1',
  userId: 'user-1',
  items: [
    { productId: 'prod-A', quantity: 2, price: 10 },
    { productId: 'prod-B', quantity: 1, price: 20 },
  ],
  status: 'COMPLETED',
};

const defaultAIRecommendations: AIRecommendation[] = [
  { productId: 'prod-A', quantity: 2, reason: 'frequent purchase' },
  { productId: 'prod-B', quantity: 1, reason: 'frequent purchase' },
];

const defaultProducts: Product[] = [
  { id: 'prod-A', name: 'Product A', price: 10, stock: 100 },
  { id: 'prod-B', name: 'Product B', price: 20, stock: 100 },
];

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test

  // Set up default successful mock implementations
  mockAuthService.hasPermission.mockResolvedValue(true);
  mockOrderService.getOrderBySourceId.mockResolvedValue(defaultSourceOrder);
  mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue(defaultAIRecommendations);
  mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
    Promise.resolve(defaultProducts.filter(p => ids.includes(p.id)))
  );
  mockOrderService.createDraftOrder.mockImplementation((tenantId: string, userId: string) =>
    Promise.resolve({
      id: `new-draft-order-${Math.random().toString(36).substring(7)}`, // Unique ID for each call
      tenantId,
      userId,
      items: [],
      status: 'DRAFT',
    })
  );
  mockOrderService.updateOrder.mockImplementation((orderId, updateData) => Promise.resolve({
    ...defaultSourceOrder, // Base from a default, but update ID, tenant, user, items, status
    id: orderId,
    tenantId: updateData.tenantId || defaultSourceOrder.tenantId,
    userId: updateData.userId || defaultSourceOrder.userId,
    items: updateData.items || [],
    status: updateData.status || 'DRAFT',
  }));
  mockDatabaseService.beginTransaction.mockResolvedValue(undefined);
  mockDatabaseService.commitTransaction.mockResolvedValue(undefined);
  mockDatabaseService.rollbackTransaction.mockResolvedValue(undefined);


  // Re-instantiate the service with fresh mocks for each test
  smartReorderService = new SmartReorderService(
    mockAuthService as any,
    mockOrderService as any,
    mockProductService as any,
    mockAIRecommenderService as any,
    mockDatabaseService as any
  );
});

describe('AI-003: Smart Reorder Edge Cases', () => {

  describe('1. Empty/null inputs', () => {
    test('should throw ValidationError for null tenantId', async () => {
      await expect(smartReorderService.reorder(null as any, 'user-1', 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder(null as any, 'user-1', 'order-1')).rejects.toThrow('Tenant ID cannot be empty');
    });

    test('should throw ValidationError for undefined tenantId', async () => {
      await expect(smartReorderService.reorder(undefined as any, 'user-1', 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder(undefined as any, 'user-1', 'order-1')).rejects.toThrow('Tenant ID cannot be empty');
    });

    test('should throw ValidationError for empty string tenantId', async () => {
      await expect(smartReorderService.reorder('', 'user-1', 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('', 'user-1', 'order-1')).rejects.toThrow('Tenant ID cannot be empty');
    });

    test('should throw ValidationError for null userId', async () => {
      await expect(smartReorderService.reorder('tenant-1', null as any, 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', null as any, 'order-1')).rejects.toThrow('User ID cannot be empty');
    });

    test('should throw ValidationError for undefined userId', async () => {
      await expect(smartReorderService.reorder('tenant-1', undefined as any, 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', undefined as any, 'order-1')).rejects.toThrow('User ID cannot be empty');
    });

    test('should throw ValidationError for empty string userId', async () => {
      await expect(smartReorderService.reorder('tenant-1', '', 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', '', 'order-1')).rejects.toThrow('User ID cannot be empty');
    });

    test('should throw ValidationError for null sourceOrderId', async () => {
      await expect(smartReorderService.reorder('tenant-1', 'user-1', null as any)).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', null as any)).rejects.toThrow('Source Order ID cannot be empty');
    });

    test('should throw ValidationError for undefined sourceOrderId', async () => {
      await expect(smartReorderService.reorder('tenant-1', 'user-1', undefined as any)).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', undefined as any)).rejects.toThrow('Source Order ID cannot be empty');
    });

    test('should throw ValidationError for empty string sourceOrderId', async () => {
      await expect(smartReorderService.reorder('tenant-1', 'user-1', '')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', '')).rejects.toThrow('Source Order ID cannot be empty');
    });

    test('should throw NotFoundError if source order is not found', async () => {
      mockOrderService.getOrderBySourceId.mockResolvedValue(null);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'non-existent-order')).rejects.toThrow(NotFoundError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'non-existent-order')).rejects.toThrow('Source order not found for user');
    });

    test('should return an empty reorder if AI recommends no items', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([]);
      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items).toEqual([]);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledTimes(1);
      expect(mockOrderService.updateOrder).toHaveBeenCalledTimes(1);
    });

    test('should return an empty reorder if AI recommends null items', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue(null);
      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items).toEqual([]);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledTimes(1);
      expect(mockOrderService.updateOrder).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Boundary values', () => {
    const MAX_ITEMS_IN_REORDER = 100; // Assuming a system limit for a single reorder

    test('should handle reorder with a single recommended item successfully', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-C', quantity: 1, reason: 'single item' },
      ]);
      mockProductService.getProductsByIds.mockResolvedValue([{ id: 'prod-C', name: 'Prod C', price: 50, stock: 10 }]);

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(1);
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-C', quantity: 1 })])
      );
    });

    test('should handle reorder with max allowed items successfully', async () => {
      const largeItemList = Array.from({ length: MAX_ITEMS_IN_REORDER }, (_, i) => ({
        productId: `prod-X${i}`,
        quantity: 1,
        price: 10 + i,
      }));
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue(
        largeItemList.map(item => ({ ...item, reason: 'bulk reorder' }))
      );
      mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
        Promise.resolve(ids.map(id => ({ id, name: `Prod ${id}`, price: 10, stock: 100 })))
      );

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(MAX_ITEMS_IN_REORDER);
    });

    test('should correctly reorder product with min quantity (1)', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-D', quantity: 1, reason: 'min quantity' },
      ]);
      mockProductService.getProductsByIds.mockResolvedValue([{ id: 'prod-D', name: 'Prod D', price: 10, stock: 10 }]);

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-D', quantity: 1 })])
      );
    });

    test('should handle very long but valid IDs (up to 255 chars for example)', async () => {
      const longId = 'a'.repeat(255);
      mockOrderService.getOrderBySourceId.mockResolvedValue({
        ...defaultSourceOrder,
        id: longId,
        tenantId: longId,
        userId: longId,
        items: [{ productId: 'prod-A', quantity: 1, price: 10 }],
      });
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 1, reason: 'test' },
      ]);
      mockProductService.getProductsByIds.mockResolvedValue([{ id: 'prod-A', name: 'Prod A', price: 10, stock: 100 }]);

      const result = await smartReorderService.reorder(longId, longId, longId);
      expect(result).toBeDefined();
      expect(mockOrderService.getOrderBySourceId).toHaveBeenCalledWith(longId, longId, longId);
      expect(result.tenantId).toBe(longId);
      expect(result.userId).toBe(longId);
    });

    test('should filter out products recommended with zero quantity', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 2, reason: 'valid' },
        { productId: 'prod-E', quantity: 0, reason: 'zero quantity' },
      ]);
      const products = [...defaultProducts, { id: 'prod-E', name: 'Prod E', price: 5, stock: 10 }];
      mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
        Promise.resolve(products.filter(p => ids.includes(p.id)))
      );

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(2); // default prod-A, prod-B + prod-A from AI. AI only has prod-A. So 1.
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-A', quantity: 2 })])
      );
      expect(result.items.some(item => item.productId === 'prod-E')).toBeFalsy();
    });

    test('should filter out products recommended with negative quantity', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 2, reason: 'valid' },
        { productId: 'prod-F', quantity: -1, reason: 'negative quantity' },
      ]);
      const products = [...defaultProducts, { id: 'prod-F', name: 'Prod F', price: 5, stock: 10 }];
      mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
        Promise.resolve(products.filter(p => ids.includes(p.id)))
      );

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(2); // default prod-A, prod-B + prod-A from AI. AI only has prod-A. So 1.
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-A', quantity: 2 })])
      );
      expect(result.items.some(item => item.productId === 'prod-F')).toBeFalsy();
    });

    test('should exclude out-of-stock items by default', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 2, reason: 'in-stock' },
        { productId: 'prod-OOS', quantity: 1, reason: 'out-of-stock' },
      ]);
      mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
        Promise.resolve(ids.map(id => ({
          id,
          name: `Product ${id}`,
          price: 10,
          stock: id === 'prod-OOS' ? 0 : 100,
        })))
      );

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(1);
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-A', quantity: 2 })])
      );
      expect(result.items.some(item => item.productId === 'prod-OOS')).toBeFalsy();
    });

    test('should include out-of-stock items if "includeOutOfStock" option is true', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 2, reason: 'in-stock' },
        { productId: 'prod-OOS', quantity: 1, reason: 'out-of-stock' },
      ]);
      mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
        Promise.resolve(ids.map(id => ({
          id,
          name: `Product ${id}`,
          price: 10,
          stock: id === 'prod-OOS' ? 0 : 100,
        })))
      );

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1', { includeOutOfStock: true });
      expect(result.items.length).toBe(2);
      expect(result.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ productId: 'prod-A', quantity: 2 }),
          expect.objectContaining({ productId: 'prod-OOS', quantity: 1 }),
        ])
      );
    });

    test('should handle product ID from AI being too long and filter it out with warning', async () => {
      const invalidProductId = 'a'.repeat(300); // Exceeds assumed 255 char limit
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 1, reason: 'valid' },
        { productId: invalidProductId, quantity: 1, reason: 'invalid id' },
      ]);
      // Mock ProductService to only return valid products
      mockProductService.getProductsByIds.mockImplementation((ids: string[]) =>
        Promise.resolve(ids.filter(id => id.length <= 255).map(id => ({ id, name: `Prod ${id}`, price: 10, stock: 100 })))
      );

      // We expect the service to filter out the long ID, not necessarily throw an error specific to length
      // It should process the valid ones and return them, while logging a warning.
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(1);
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-A', quantity: 1 })])
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Product ID') && expect.stringContaining('is too long, skipping.'));
      consoleWarnSpy.mockRestore();
    });
  });

  describe('3. Multi-tenant isolation', () => {
    test('should only fetch and process orders for the specified tenantId', async () => {
      const tenant1Id = 'tenant-alpha';
      const tenant2Id = 'tenant-beta';
      const user1Id = 'user-alpha';
      const order1Id = 'order-alpha-123';
      const order2Id = 'order-beta-456';

      // Mock `getOrderBySourceId` to return specific orders based on tenantId
      mockOrderService.getOrderBySourceId.mockImplementation((tenantId: string, userId: string, sourceOrderId: string) => {
        if (tenantId === tenant1Id && userId === user1Id && sourceOrderId === order1Id) {
          return Promise.resolve({ ...defaultSourceOrder, id: order1Id, tenantId: tenant1Id, userId: user1Id });
        }
        if (tenantId === tenant2Id && userId === user1Id && sourceOrderId === order2Id) {
          return Promise.resolve({ ...defaultSourceOrder, id: order2Id, tenantId: tenant2Id, userId: user1Id, items: [{ productId: 'prod-Y', quantity: 2, price: 20 }] });
        }
        return Promise.resolve(null);
      });

      // Mocks for AI and Products
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValueOnce([
        { productId: 'prod-A', quantity: 1, reason: 'test' },
      ]).mockResolvedValueOnce([
        { productId: 'prod-Y', quantity: 2, reason: 'test' },
      ]);
      mockProductService.getProductsByIds.mockResolvedValueOnce([{ id: 'prod-A', name: 'Prod A', price: 10, stock: 100 }])
        .mockResolvedValueOnce([{ id: 'prod-Y', name: 'Prod Y', price: 20, stock: 100 }]);

      // Simulate a request for tenant-alpha
      const resultAlpha = await smartReorderService.reorder(tenant1Id, user1Id, order1Id);
      expect(resultAlpha.tenantId).toBe(tenant1Id);
      expect(mockOrderService.getOrderBySourceId).toHaveBeenCalledWith(tenant1Id, user1Id, order1Id);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledWith(tenant1Id, user1Id);

      // Simulate a request for tenant-beta
      const resultBeta = await smartReorderService.reorder(tenant2Id, user1Id, order2Id);
      expect(resultBeta.tenantId).toBe(tenant2Id);
      expect(mockOrderService.getOrderBySourceId).toHaveBeenCalledWith(tenant2Id, user1Id, order2Id);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledWith(tenant2Id, user1Id);

      // Attempt to reorder tenant-alpha's order using tenant-beta's ID (should fail due to tenant isolation)
      mockOrderService.getOrderBySourceId.mockResolvedValue(null); // Ensure it returns null if tenantId mismatch
      await expect(smartReorderService.reorder(tenant2Id, user1Id, order1Id)).rejects.toThrow(NotFoundError);
      expect(mockOrderService.getOrderBySourceId).toHaveBeenCalledWith(tenant2Id, user1Id, order1Id);
      expect(mockAIRecommenderService.getSmartReorderRecommendations).not.toHaveBeenCalledWith(
        expect.anything(), tenant1Id, expect.anything() // AI should not be called with wrong tenant data
      );
    });
  });

  describe('4. Concurrent request handling', () => {
    test('should handle multiple concurrent reorder requests for different users without interference', async () => {
      const tenantId = 'tenant-concurrency';
      const user1Id = 'user-conc-1';
      const user2Id = 'user-conc-2';
      const orderId = 'order-conc-123';

      // Ensure mocks are set to return distinct draft order IDs for each call
      mockOrderService.createDraftOrder.mockImplementation((tenantId: string, userId: string) =>
        Promise.resolve({
          id: `new-draft-order-${userId}-${Math.random().toString(36).substring(7)}`,
          tenantId,
          userId,
          items: [],
          status: 'DRAFT',
        })
      );

      // Simulate two concurrent requests
      const promise1 = smartReorderService.reorder(tenantId, user1Id, orderId);
      const promise2 = smartReorderService.reorder(tenantId, user2Id, orderId);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.userId).toBe(user1Id);
      expect(result2.userId).toBe(user2Id);
      expect(result1.id).not.toBe(result2.id); // Verify distinct new order IDs

      expect(mockOrderService.createDraftOrder).toHaveBeenCalledTimes(2);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledWith(tenantId, user1Id);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledWith(tenantId, user2Id);
      expect(mockOrderService.updateOrder).toHaveBeenCalledTimes(2);
    });

    test('should handle concurrent requests for the same user, creating multiple draft orders if requested multiple times', async () => {
      const tenantId = 'tenant-concurrency-user';
      const userId = 'user-conc-same';
      const orderId = 'order-conc-456';

      mockOrderService.createDraftOrder.mockImplementation((tenantId: string, userId: string) =>
        Promise.resolve({
          id: `new-draft-order-${userId}-${Math.random().toString(36).substring(7)}`,
          tenantId,
          userId,
          items: [],
          status: 'DRAFT',
        })
      );

      // Simulate two concurrent requests from the same user
      const promise1 = smartReorderService.reorder(tenantId, userId, orderId);
      const promise2 = smartReorderService.reorder(tenantId, userId, orderId);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.userId).toBe(userId);
      expect(result2.userId).toBe(userId);
      expect(result1.id).not.toBe(result2.id); // Distinct new orders for same user

      expect(mockOrderService.createDraftOrder).toHaveBeenCalledTimes(2);
      expect(mockOrderService.createDraftOrder).toHaveBeenCalledWith(tenantId, userId);
      expect(mockOrderService.updateOrder).toHaveBeenCalledTimes(2);
    });

    test('should isolate failures between concurrent requests', async () => {
      const tenantId = 'tenant-isolated-failure';
      const user1Id = 'user-fail-1';
      const user2Id = 'user-fail-2';
      const orderId = 'order-fail-789';

      mockOrderService.getOrderBySourceId.mockResolvedValue({
        ...defaultSourceOrder,
        id: orderId,
        tenantId: tenantId,
        userId: user1Id,
      });

      // Request 1 mocks: success
      mockOrderService.createDraftOrder.mockResolvedValueOnce({ id: 'new-order-success', tenantId, userId: user1Id, items: [], status: 'DRAFT' });
      mockOrderService.updateOrder.mockResolvedValueOnce({ id: 'new-order-success', tenantId, userId: user1Id, items: [{ productId: 'prod-A', quantity: 1, price: 10 }], status: 'DRAFT' });

      // Request 2 mocks: failure during draft order creation
      mockOrderService.createDraftOrder.mockRejectedValueOnce(new Error('DB connection lost for second request'));

      const promise1 = smartReorderService.reorder(tenantId, user1Id, orderId);
      const promise2 = smartReorderService.reorder(tenantId, user2Id, orderId);

      const [result1, error2] = await Promise.allSettled([promise1, promise2]);

      // Check that the first request succeeded
      expect(result1.status).toBe('fulfilled');
      expect((result1 as PromiseFulfilledResult<NewOrderSummary>).value.userId).toBe(user1Id);

      // Check that the second request failed
      expect(error2.status).toBe('rejected');
      expect((error2 as PromiseRejectedResult).reason).toBeInstanceOf(ServiceError);
      expect((error2 as PromiseRejectedResult).reason.message).toContain('DB connection lost');

      // Verify that begin/rollback/commit are called correctly for both attempts
      expect(mockDatabaseService.beginTransaction).toHaveBeenCalledTimes(2);
      expect(mockDatabaseService.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.rollbackTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('5. Auth/permission failures', () => {
    test('should throw UnauthorizedError if user lacks "ai:smartReorder" permission', async () => {
      mockAuthService.hasPermission.mockResolvedValue(false);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(UnauthorizedError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('User unauthorized to perform smart reorder');
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith('user-1', 'ai:smartReorder', 'tenant-1');
    });

    test('should throw UnauthorizedError if source order belongs to a different user', async () => {
      mockOrderService.getOrderBySourceId.mockResolvedValue({
        ...defaultSourceOrder,
        userId: 'another-user-id', // Source order belongs to a different user
      });
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(UnauthorizedError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('Source order not found for user');
      expect(mockOrderService.getOrderBySourceId).toHaveBeenCalledWith('tenant-1', 'user-1', 'order-1');
    });

    test('should throw ValidationError if source order status is not eligible for reorder (e.g., PENDING)', async () => {
      mockOrderService.getOrderBySourceId.mockResolvedValue({
        ...defaultSourceOrder,
        status: 'PENDING', // Cannot reorder a pending order
      });
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('Source order status is not eligible for reorder');
      expect(mockOrderService.getOrderBySourceId).toHaveBeenCalledWith('tenant-1', 'user-1', 'order-1');
    });

    test('should throw ValidationError if source order status is CANCELLED', async () => {
      mockOrderService.getOrderBySourceId.mockResolvedValue({
        ...defaultSourceOrder,
        status: 'CANCELLED',
      });
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(ValidationError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('Source order status is not eligible for reorder');
    });
  });

  describe('6. Database constraint violations and service failures', () => {
    test('should handle ProductService not finding a recommended product (simulated FK violation prevention)', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockResolvedValue([
        { productId: 'prod-A', quantity: 2, reason: 'valid' },
        { productId: 'prod-NONEXISTENT', quantity: 1, reason: 'oops' },
      ]);
      // ProductService only returns existing products, effectively filtering out 'prod-NONEXISTENT'
      mockProductService.getProductsByIds.mockResolvedValue([{ id: 'prod-A', name: 'Prod A', price: 10, stock: 100 }]);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await smartReorderService.reorder('tenant-1', 'user-1', 'order-1');
      expect(result.items.length).toBe(1);
      expect(result.items).toEqual(
        expect.arrayContaining([expect.objectContaining({ productId: 'prod-A', quantity: 2 })])
      );
      expect(result.items.some(item => item.productId === 'prod-NONEXISTENT')).toBeFalsy();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Product ID prod-NONEXISTENT not found, skipping for reorder.'));
      consoleWarnSpy.mockRestore();
    });

    test('should throw ServiceError if database error occurs during draft order creation', async () => {
      mockOrderService.createDraftOrder.mockRejectedValue(new Error('DB Unique Constraint Violation (simulated)'));
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(ServiceError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('DB Unique Constraint Violation');
      expect(mockDatabaseService.beginTransaction).toHaveBeenCalled();
      expect(mockDatabaseService.rollbackTransaction).toHaveBeenCalled();
      expect(mockDatabaseService.commitTransaction).not.toHaveBeenCalled();
      expect(mockOrderService.updateOrder).not.toHaveBeenCalled();
    });

    test('should rollback transaction if an error occurs during order update', async () => {
      mockOrderService.updateOrder.mockRejectedValue(new Error('DB Foreign Key Constraint Violation (product ID missing)'));
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(ServiceError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('DB Foreign Key Constraint Violation');
      expect(mockDatabaseService.beginTransaction).toHaveBeenCalled();
      expect(mockOrderService.createDraftOrder).toHaveBeenCalled();
      expect(mockOrderService.updateOrder).toHaveBeenCalled();
      expect(mockDatabaseService.rollbackTransaction).toHaveBeenCalled();
      expect(mockDatabaseService.commitTransaction).not.toHaveBeenCalled();
    });

    test('should throw ServiceError if AI service fails', async () => {
      mockAIRecommenderService.getSmartReorderRecommendations.mockRejectedValue(new Error('AI service unavailable'));
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(ServiceError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('AI service failed: AI service unavailable');
      expect(mockAIRecommenderService.getSmartReorderRecommendations).toHaveBeenCalled();
      expect(mockOrderService.createDraftOrder).not.toHaveBeenCalled(); // No draft order if AI fails.
    });

    test('should throw ServiceError if ProductService fails during product retrieval', async () => {
      mockProductService.getProductsByIds.mockRejectedValue(new Error('Product catalog DB error'));
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow(ServiceError);
      await expect(smartReorderService.reorder('tenant-1', 'user-1', 'order-1')).rejects.toThrow('Product catalog DB error');
      expect(mockProductService.getProductsByIds).toHaveBeenCalled();
      expect(mockOrderService.createDraftOrder).not.toHaveBeenCalled(); // Should fail before creating draft order
    });
  });
});
