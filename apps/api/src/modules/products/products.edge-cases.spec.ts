/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-001 -- SKU Product Management
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       products
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       TESTER-066
 * GENERATED:    2026-03-17T13:17:27.554Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
// jest is available globally via the Jest test runner â€” no import needed.
export {}; // Marks this file as an ES module, isolating its block-scoped declarations.

// Mocking the database interactions and service layer for isolation.
// In a real application, these would be actual services or repositories
// Here, we'll mock them to control behavior and simulate edge cases.
const mockProductRepository = {
  create: jest.fn(),
  findBySkuAndTenantId: jest.fn(),
  updateBySkuAndTenantId: jest.fn(),
  deleteBySkuAndTenantId: jest.fn(),
  findAllByTenantId: jest.fn(),
  // For optimistic locking simulation, a transaction/version handling might be involved
  // For simplicity, we'll simulate versioning within the service or mock directly.
  transaction: jest.fn((cb) => cb()), // Simple mock for a transaction block
};

// A simplified ProductsService class for testing purposes.
// In a real app, this would be a more complex service interacting with DB, caching, etc.
// It includes basic validation logic.
class ProductsService {
  constructor(protected productRepository: typeof mockProductRepository) {}

  async createProduct(tenantId: string, productData: { sku: string; name: string; description?: string; price: number; quantity: number }) {
    if (!tenantId || !productData.sku || !productData.name || productData.price == null || productData.quantity == null) {
      throw new Error('Invalid input: tenantId, sku, name, price, and quantity are required.');
    }
    if (productData.price < 0) {
      throw new Error('Price cannot be negative.');
    }
    if (productData.quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }
    const existing = await this.productRepository.findBySkuAndTenantId(tenantId, productData.sku);
    if (existing) {
      throw new Error('Product with this SKU already exists for this tenant.');
    }
    return this.productRepository.create({ ...productData, tenantId });
  }

  async getProductBySku(tenantId: string, sku: string) {
    if (!tenantId || !sku) {
      throw new Error('Invalid input: tenantId and sku are required.');
    }
    return this.productRepository.findBySkuAndTenantId(tenantId, sku);
  }

  async updateProduct(tenantId: string, sku: string, updateData: { name?: string; description?: string; price?: number; quantity?: number; version?: number }) {
    if (!tenantId || !sku) {
      throw new Error('Invalid input: tenantId and sku are required.');
    }
    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error('Price cannot be negative.');
    }
    if (updateData.quantity !== undefined && updateData.quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }
    const product = await this.productRepository.findBySkuAndTenantId(tenantId, sku);
    if (!product) {
      throw new Error('Product not found.');
    }
    // Simulate optimistic locking check if a version is provided
    if (updateData.version !== undefined && product.version !== updateData.version) {
        throw new Error('Concurrency conflict: Product data is stale. Please refresh and try again.');
    }
    // Increment version for successful update
    const newVersion = (product.version || 0) + 1;
    return this.productRepository.updateBySkuAndTenantId(tenantId, sku, { ...updateData, version: newVersion });
  }

  async deleteProduct(tenantId: string, sku: string) {
    if (!tenantId || !sku) {
      throw new Error('Invalid input: tenantId and sku are required.');
    }
    const product = await this.productRepository.findBySkuAndTenantId(tenantId, sku);
    if (!product) {
      throw new Error('Product not found.');
    }
    return this.productRepository.deleteBySkuAndTenantId(tenantId, sku);
  }

  async getAllProducts(tenantId: string) {
    if (!tenantId) {
      throw new Error('Invalid input: tenantId is required.');
    }
    return this.productRepository.findAllByTenantId(tenantId);
  }
}

// Auth context mock for simulating user permissions.
// In a real system, this would be an actual auth service or token decoder.
const mockAuthService = {
  checkPermission: jest.fn((userId: string, permission: string) => true), // By default, grant all permissions
  getTenantId: jest.fn((userId: string) => 'default-tenant-123'), // Default tenant
};

// A manager class to orchestrate the ProductsService with Authorization checks.
// This allows testing auth/permission failures cleanly.
class ProductManager {
    constructor(private productsService: ProductsService, private authService: typeof mockAuthService) {}

    async createProduct(userId: string, tenantId: string, productData: any) {
        if (!(this.authService as any).checkPermission(userId, 'product:write')) {
            throw new Error('Permission denied: Not authorized to create products.');
        }
        if ((this.authService as any).getTenantId(userId) !== tenantId) {
            throw new Error('Unauthorized: Cannot create products for another tenant.');
        }
        return (this.productsService as any).createProduct(tenantId, productData);
    }

    async getProductBySku(userId: string, tenantId: string, sku: string) {
        if (!(this.authService as any).checkPermission(userId, 'product:read')) {
            throw new Error('Permission denied: Not authorized to read products.');
        }
        if ((this.authService as any).getTenantId(userId) !== tenantId) {
            throw new Error('Unauthorized: Cannot read products for another tenant.');
        }
        return (this.productsService as any).getProductBySku(tenantId, sku);
    }

    async updateProduct(userId: string, tenantId: string, sku: string, updateData: any) {
        if (!(this.authService as any).checkPermission(userId, 'product:write')) {
            throw new Error('Permission denied: Not authorized to update products.');
        }
        if ((this.authService as any).getTenantId(userId) !== tenantId) {
            throw new Error('Unauthorized: Cannot update products for another tenant.');
        }
        return (this.productsService as any).updateProduct(tenantId, sku, updateData);
    }

    async deleteProduct(userId: string, tenantId: string, sku: string) {
        if (!(this.authService as any).checkPermission(userId, 'product:delete')) { // Assuming a specific delete permission
            throw new Error('Permission denied: Not authorized to delete products.');
        }
        if ((this.authService as any).getTenantId(userId) !== tenantId) {
            throw new Error('Unauthorized: Cannot delete products for another tenant.');
        }
        return (this.productsService as any).deleteProduct(tenantId, sku);
    }
}


let productsService: ProductsService;
let productManager: ProductManager;

describe('POS-001: SKU Product Management - Products Module', () => {

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    productsService = new ProductsService(mockProductRepository);
    productManager = new ProductManager(productsService, mockAuthService);

    // Default mock implementations for common scenarios
    mockProductRepository.create.mockImplementation((product) => Promise.resolve({ ...product, id: 'mock-id-' + Math.random() }));
    mockProductRepository.findBySkuAndTenantId.mockResolvedValue(null); // Default: product not found
    mockProductRepository.updateBySkuAndTenantId.mockImplementation((tenantId, sku, updateData) =>
      Promise.resolve({ ...updateData, tenantId, sku, id: 'mock-id-existing' })
    );
    mockProductRepository.deleteBySkuAndTenantId.mockResolvedValue(true);
    mockProductRepository.findAllByTenantId.mockResolvedValue([]);

    mockAuthService.checkPermission.mockReturnValue(true); // Default to authorized
    mockAuthService.getTenantId.mockReturnValue('default-tenant-123'); // Default tenant
  });

  // --- Scenario 1: Empty/null inputs ---
  describe('Scenario 1: Empty/null inputs', () => {
    it('should throw error when creating product with null tenantId', async () => {
      const productData = { sku: 'SKU001', name: 'Test Product', price: 10.00, quantity: 100 };
      await expect(productsService.createProduct(null as any, productData)).rejects.toThrow('Invalid input');
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when creating product with empty sku', async () => {
      const productData = { sku: '', name: 'Test Product', price: 10.00, quantity: 100 };
      await expect(productsService.createProduct('tenant-1', productData)).rejects.toThrow('Invalid input');
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when creating product with null name', async () => {
      const productData = { sku: 'SKU001', name: null as any, price: 10.00, quantity: 100 };
      await expect(productsService.createProduct('tenant-1', productData)).rejects.toThrow('Invalid input');
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when updating product with null sku', async () => {
      await expect(productsService.updateProduct('tenant-1', null as any, { price: 15.00 })).rejects.toThrow('Invalid input');
      expect(mockProductRepository.updateBySkuAndTenantId).not.toHaveBeenCalled();
    });

    it('should throw error when getting product with empty sku', async () => {
      await expect(productsService.getProductBySku('tenant-1', '')).rejects.toThrow('Invalid input');
      expect(mockProductRepository.findBySkuAndTenantId).not.toHaveBeenCalled();
    });

    it('should throw error when deleting product with null tenantId', async () => {
      await expect(productsService.deleteProduct(null as any, 'SKU001')).rejects.toThrow('Invalid input');
      expect(mockProductRepository.deleteBySkuAndTenantId).not.toHaveBeenCalled();
    });

    it('should handle undefined description during product creation gracefully', async () => {
      mockProductRepository.create.mockImplementationOnce((product) => Promise.resolve({ ...product, id: 'mock-id' }));
      const productData = { sku: 'SKU002', name: 'Product with no desc', price: 5.00, quantity: 50, description: undefined };
      const createdProduct = await productsService.createProduct('tenant-1', productData);
      expect(createdProduct).toEqual(expect.objectContaining({ description: undefined })); // Or expect null/'' depending on impl
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ description: undefined }));
    });
  });

  // --- Scenario 2: Boundary values ---
  describe('Scenario 2: Boundary values', () => {
    it('should allow creating product with zero price', async () => {
      const productData = { sku: 'ZERO_PRICE', name: 'Free Item', price: 0.00, quantity: 10 };
      const createdProduct = await productsService.createProduct('tenant-1', productData);
      expect(createdProduct.price).toBe(0.00);
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ price: 0.00 }));
    });

    it('should throw error when creating product with negative price', async () => {
      const productData = { sku: 'NEG_PRICE', name: 'Negative Price', price: -10.00, quantity: 10 };
      await expect(productsService.createProduct('tenant-1', productData)).rejects.toThrow('Price cannot be negative.');
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should allow creating product with zero quantity', async () => {
      const productData = { sku: 'ZERO_QTY', name: 'Out of Stock', price: 5.00, quantity: 0 };
      const createdProduct = await productsService.createProduct('tenant-1', productData);
      expect(createdProduct.quantity).toBe(0);
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ quantity: 0 }));
    });

    it('should throw error when creating product with negative quantity', async () => {
      const productData = { sku: 'NEG_QTY', name: 'Negative Qty', price: 5.00, quantity: -10 };
      await expect(productsService.createProduct('tenant-1', productData)).rejects.toThrow('Quantity cannot be negative.');
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should handle very long product names/descriptions', async () => {
      const longName = 'A'.repeat(255); // Max typical length for VARCHAR(255)
      const longDescription = 'B'.repeat(1000); // Max typical length for TEXT/VARCHAR(1000)
      const productData = { sku: 'LONG_TEXT', name: longName, description: longDescription, price: 10.00, quantity: 10 };
      const createdProduct = await productsService.createProduct('tenant-1', productData);
      expect(createdProduct.name.length).toBe(255);
      expect(createdProduct.description.length).toBe(1000);
      expect(mockProductRepository.create).toHaveBeenCalled();
    });

    it('should handle extremely large price values', async () => {
      const largePrice = 9999999999.99; // Common DECIMAL(12,2) limit
      const productData = { sku: 'LARGE_PRICE', name: 'Expensive Item', price: largePrice, quantity: 1 };
      const createdProduct = await productsService.createProduct('tenant-1', productData);
      expect(createdProduct.price).toBe(largePrice);
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ price: largePrice }));
    });

    it('should handle extremely large quantity values', async () => {
      const largeQuantity = 2147483647; // Max INT32
      const productData = { sku: 'LARGE_QTY', name: 'Massive Stock', price: 1.00, quantity: largeQuantity };
      const createdProduct = await productsService.createProduct('tenant-1', productData);
      expect(createdProduct.quantity).toBe(largeQuantity);
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ quantity: largeQuantity }));
    });
  });

  // --- Scenario 3: Multi-tenant isolation ---
  describe('Scenario 3: Multi-tenant isolation', () => {
    const tenant1Id = 'tenant-A';
    const tenant2Id = 'tenant-B';
    const sharedSku = 'SHARED_SKU';
    const tenant1Product = { sku: sharedSku, name: 'Product A', price: 10, quantity: 100, tenantId: tenant1Id, version: 1 };
    const tenant2Product = { sku: sharedSku, name: 'Product B', price: 20, quantity: 200, tenantId: tenant2Id, version: 1 };
    const uniqueTenant1Product = { sku: 'UNIQUE_SKU_A', name: 'Unique A', price: 5, quantity: 50, tenantId: tenant1Id, version: 1 };

    it('should prevent one tenant from accessing another tenant\'s product by SKU', async () => {
      mockProductRepository.findBySkuAndTenantId.mockImplementation((tenantId, sku) => {
        if (tenantId === tenant1Id && sku === sharedSku) return Promise.resolve(tenant1Product);
        return Promise.resolve(null);
      });

      const productForTenantA = await productsService.getProductBySku(tenant1Id, sharedSku);
      expect(productForTenantA).toEqual(tenant1Product);

      const productForTenantB = await productsService.getProductBySku(tenant2Id, sharedSku);
      expect(productForTenantB).toBeNull(); // Tenant B should not find it
    });

    it('should allow different tenants to create products with the same SKU', async () => {
      // Setup mock to allow creation, simulating that the SKU does not exist *for that tenant* initially.
      mockProductRepository.findBySkuAndTenantId.mockImplementation((tenantId, sku) => Promise.resolve(null));
      mockProductRepository.create.mockImplementation((product) => Promise.resolve({ ...product, id: 'new-prod-id' }));

      const createdProductA = await productsService.createProduct(tenant1Id, { ...tenant1Product });
      expect(createdProductA.sku).toBe(sharedSku);
      expect(createdProductA.tenantId).toBe(tenant1Id);
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: tenant1Id, sku: sharedSku }));

      const createdProductB = await productsService.createProduct(tenant2Id, { ...tenant2Product });
      expect(createdProductB.sku).toBe(sharedSku);
      expect(createdProductB.tenantId).toBe(tenant2Id);
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: tenant2Id, sku: sharedSku }));
    });

    it('should prevent one tenant from updating another tenant\'s product', async () => {
      mockProductRepository.findBySkuAndTenantId.mockImplementation((tenantId, sku) => {
        if (tenantId === tenant1Id && sku === sharedSku) return Promise.resolve({ ...tenant1Product });
        return Promise.resolve(null);
      });
      mockProductRepository.updateBySkuAndTenantId.mockImplementation((tenantId, sku, updateData) =>
        Promise.resolve({ ...tenant1Product, ...updateData, tenantId, sku, version: (tenant1Product.version || 0) + 1 })
      );

      await expect(productsService.updateProduct(tenant2Id, sharedSku, { price: 25 })).rejects.toThrow('Product not found.');
      expect(mockProductRepository.updateBySkuAndTenantId).not.toHaveBeenCalledWith(tenant2Id, sharedSku, expect.anything());

      // Verify tenant A can update its own product
      const updatedProduct = await productsService.updateProduct(tenant1Id, sharedSku, { price: 15, version: tenant1Product.version });
      expect(updatedProduct.price).toBe(15);
      expect(updatedProduct.version).toBe(2); // Version should be incremented
      expect(mockProductRepository.updateBySkuAndTenantId).toHaveBeenCalledWith(tenant1Id, sharedSku, expect.objectContaining({ price: 15, version: 2 }));
    });

    it('should prevent one tenant from deleting another tenant\'s product', async () => {
      mockProductRepository.findBySkuAndTenantId.mockImplementation((tenantId, sku) => {
        if (tenantId === tenant1Id && sku === sharedSku) return Promise.resolve({ ...tenant1Product });
        return Promise.resolve(null);
      });
      mockProductRepository.deleteBySkuAndTenantId.mockResolvedValueOnce(true);

      await expect(productsService.deleteProduct(tenant2Id, sharedSku)).rejects.toThrow('Product not found.');
      expect(mockProductRepository.deleteBySkuAndTenantId).not.toHaveBeenCalledWith(tenant2Id, sharedSku);

      // Verify tenant A can delete its own product
      await productsService.deleteProduct(tenant1Id, sharedSku);
      expect(mockProductRepository.deleteBySkuAndTenantId).toHaveBeenCalledWith(tenant1Id, sharedSku);
    });

    it('should only return products belonging to the requesting tenant when fetching all products', async () => {
      mockProductRepository.findAllByTenantId.mockImplementation((tenantId) => {
        if (tenantId === tenant1Id) return Promise.resolve([tenant1Product, uniqueTenant1Product]);
        if (tenantId === tenant2Id) return Promise.resolve([tenant2Product]);
        return Promise.resolve([]);
      });

      const productsForTenantA = await productsService.getAllProducts(tenant1Id);
      expect(productsForTenantA).toHaveLength(2);
      expect(productsForTenantA).toEqual(expect.arrayContaining([tenant1Product, uniqueTenant1Product]));

      const productsForTenantB = await productsService.getAllProducts(tenant2Id);
      expect(productsForTenantB).toHaveLength(1);
      expect(productsForTenantB).toEqual(expect.arrayContaining([tenant2Product]));
    });
  });

  // --- Scenario 4: Concurrent request handling ---
  describe('Scenario 4: Concurrent request handling (Simulated optimistic locking)', () => {
    const concurrentSku = 'CON_SKU';
    const initialProduct = { sku: concurrentSku, name: 'Con Prod', price: 10, quantity: 100, tenantId: 'tenant-C', version: 1 };

    it('should simulate optimistic locking failure on concurrent update', async () => {
      // Mock initial read for two concurrent requests
      mockProductRepository.findBySkuAndTenantId.mockImplementation(async (tenantId, sku) => {
        if (tenantId === 'tenant-C' && sku === concurrentSku) {
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate read delay
          return { ...initialProduct }; // Both read the same initial state (version 1)
        }
        return null;
      });

      // Mock the update operation for each concurrent request
      // First update will succeed, second should fail due to version mismatch
      let dbState = { ...initialProduct };
      let writeInProgress = false; // Mutex flag

      mockProductRepository.updateBySkuAndTenantId.mockImplementation(async (tenantId, sku, updateData) => {
        if (tenantId === 'tenant-C' && sku === concurrentSku) {
          // The service pre-increments the version before calling here, so
          // updateData.version = product.version + 1.
          // A valid update means updateData.version === dbState.version + 1.
          // A stale update means updateData.version !== dbState.version + 1.
          if (updateData.version !== dbState.version + 1) {
            throw new Error('Concurrency conflict: Product data is stale. Please refresh and try again.');
          }
          if (writeInProgress) {
            // Simulate the second writer seeing a version mismatch after the first commits
            throw new Error('Concurrency conflict: Product data is stale. Please refresh and try again.');
          }
          writeInProgress = true;
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate write delay
          dbState = { ...dbState, ...updateData };
          writeInProgress = false;
          return { ...dbState };
        }
        return null;
      });

      // Simulate two concurrent updates, both using initial version (1)
      const firstUpdatePromise = productsService.updateProduct('tenant-C', concurrentSku, { quantity: 90, version: initialProduct.version });
      const secondUpdatePromise = productsService.updateProduct('tenant-C', concurrentSku, { quantity: 80, version: initialProduct.version });

      // We expect one to succeed and one to fail.
      // The first update that reaches the `updateBySkuAndTenantId` mock will increment the `dbState.version`.
      // The second update will then find a version mismatch and throw an error.
      const allResults = await Promise.allSettled([firstUpdatePromise, secondUpdatePromise]);
      const successCount = allResults.filter(r => r.status === 'fulfilled').length;
      const failCount = allResults.filter(r => r.status === 'rejected').length;
      expect(successCount).toBe(1);
      expect(failCount).toBe(1);
      const failedResult = allResults.find(r => r.status === 'rejected') as PromiseRejectedResult;
      expect(failedResult.reason.message).toBe('Concurrency conflict: Product data is stale. Please refresh and try again.');
      const successResult = allResults.find(r => r.status === 'fulfilled') as PromiseFulfilledResult<any>;
      expect(successResult.value).toMatchObject({ version: 2 });

      // Verify final state reflects only the successful update
      // After settlement, verify the winning update is reflected in dbState via the mock
      mockProductRepository.findBySkuAndTenantId.mockResolvedValueOnce({ ...dbState });
      const finalProduct = await productsService.getProductBySku('tenant-C', concurrentSku);
      expect(finalProduct?.version).toBe(2);
    });
  });

  // --- Scenario 5: Auth/permission failures ---
  describe('Scenario 5: Auth/permission failures', () => {
    const authTenantId = 'auth-tenant';
    const authSku = 'AUTH_SKU';
    const userWithReadPermission = 'user-read';
    const userWithWritePermission = 'user-write';
    const userWithoutPermission = 'user-no-perm';
    const adminUser = 'user-admin';

    beforeEach(() => {
        jest.clearAllMocks();
        productsService = new ProductsService(mockProductRepository); // Re-initialize service
        productManager = new ProductManager(productsService, mockAuthService); // Re-initialize manager

        mockProductRepository.findBySkuAndTenantId.mockResolvedValue({ sku: authSku, name: 'Auth Prod', price: 10, quantity: 100, tenantId: authTenantId, version: 1 });
        mockProductRepository.create.mockImplementation((product) => Promise.resolve({ ...product, id: 'new-auth-prod-id' }));
        mockProductRepository.updateBySkuAndTenantId.mockImplementation((tenantId, sku, updateData) => Promise.resolve({ ...updateData, tenantId, sku, id: 'auth-prod-id', version: updateData.version }));
        mockProductRepository.deleteBySkuAndTenantId.mockResolvedValue(true);

        mockAuthService.checkPermission.mockImplementation((userId, permission) => {
            if (userId === adminUser) return true; // Admins have all
            if (userId === userWithReadPermission && permission === 'product:read') return true;
            if (userId === userWithWritePermission && (permission === 'product:read' || permission === 'product:write')) return true;
            if (userId === userWithWritePermission && permission === 'product:delete') return false; // Explicitly deny delete for write-user
            return false; // All other combinations or users have no permissions
        });
        mockAuthService.getTenantId.mockReturnValue(authTenantId);
    });

    it('should prevent user without "product:read" permission from getting a product', async () => {
      await expect(productManager.getProductBySku(userWithoutPermission, authTenantId, authSku)).rejects.toThrow('Permission denied: Not authorized to read products.');
      expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithoutPermission, 'product:read');
      expect(mockProductRepository.findBySkuAndTenantId).not.toHaveBeenCalled();
    });

    it('should allow user with "product:read" permission to get a product', async () => {
      await expect(productManager.getProductBySku(userWithReadPermission, authTenantId, authSku)).resolves.toBeDefined();
      expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithReadPermission, 'product:read');
      expect(mockProductRepository.findBySkuAndTenantId).toHaveBeenCalledWith(authTenantId, authSku);
    });

    it('should prevent user without "product:write" permission from creating a product', async () => {
      const productData = { sku: 'NEW_AUTH_SKU', name: 'New Auth Prod', price: 20, quantity: 50 };
      await expect(productManager.createProduct(userWithReadPermission, authTenantId, productData)).rejects.toThrow('Permission denied: Not authorized to create products.');
      expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithReadPermission, 'product:write');
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should allow user with "product:write" permission to create a product', async () => {
      const productData = { sku: 'NEW_AUTH_SKU', name: 'New Auth Prod', price: 20, quantity: 50 };
      // The beforeEach sets findBySkuAndTenantId to return an existing product (for tests that
      // need it to exist). For this create test, the new SKU must not exist yet.
      mockProductRepository.findBySkuAndTenantId.mockResolvedValueOnce(null);
      await expect(productManager.createProduct(userWithWritePermission, authTenantId, productData)).resolves.toBeDefined();
      expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithWritePermission, 'product:write');
      expect(mockProductRepository.create).toHaveBeenCalledWith({ ...productData, tenantId: authTenantId });
    });

    it('should prevent user without "product:write" permission from updating a product', async () => {
      await expect(productManager.updateProduct(userWithReadPermission, authTenantId, authSku, { price: 15, version: 1 })).rejects.toThrow('Permission denied: Not authorized to update products.');
      expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithReadPermission, 'product:write');
      expect(mockProductRepository.updateBySkuAndTenantId).not.toHaveBeenCalled();
    });

    it('should allow user with "product:write" permission to update a product', async () => {
      await expect(productManager.updateProduct(userWithWritePermission, authTenantId, authSku, { price: 15, version: 1 })).resolves.toBeDefined();
      expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithWritePermission, 'product:write');
      expect(mockProductRepository.updateBySkuAndTenantId).toHaveBeenCalledWith(authTenantId, authSku, expect.objectContaining({ price: 15, version: 2 }));
    });

    it('should prevent user without "product:delete" permission from deleting a product', async () => {
        await expect(productManager.deleteProduct(userWithWritePermission, authTenantId, authSku)).rejects.toThrow('Permission denied: Not authorized to delete products.');
        expect(mockAuthService.checkPermission).toHaveBeenCalledWith(userWithWritePermission, 'product:delete');
        expect(mockProductRepository.deleteBySkuAndTenantId).not.toHaveBeenCalled();
    });

    it('should allow admin user to delete a product', async () => {
        await expect(productManager.deleteProduct(adminUser, authTenantId, authSku)).resolves.toBeDefined();
        expect(mockAuthService.checkPermission).toHaveBeenCalledWith(adminUser, 'product:delete');
        expect(mockProductRepository.deleteBySkuAndTenantId).toHaveBeenCalledWith(authTenantId, authSku);
    });

    it('should prevent a user from managing products for a different tenant than their own', async () => {
        const otherTenantId = 'other-tenant-id';
        mockAuthService.getTenantId.mockReturnValueOnce(authTenantId); // User belongs to authTenantId
        await expect(productManager.createProduct(userWithWritePermission, otherTenantId, { sku: 'X', name: 'Y', price: 1, quantity: 1 }))
            .rejects.toThrow('Unauthorized: Cannot create products for another tenant.');
        expect(mockAuthService.getTenantId).toHaveBeenCalledWith(userWithWritePermission);
        expect(mockProductRepository.create).not.toHaveBeenCalled();
    });
  });

  // --- Scenario 6: Database constraint violations ---
  describe('Scenario 6: Database constraint violations', () => {
    const constraintTenantId = 'constraint-tenant';
    const uniqueSku = 'UNIQUE_SKU';
    const productData = { sku: uniqueSku, name: 'Constraint Prod', price: 10, quantity: 100 };

    it('should handle unique SKU constraint violation when creating a product (service-level check)', async () => {
      mockProductRepository.findBySkuAndTenantId.mockResolvedValueOnce(null); // First check passes
      await productsService.createProduct(constraintTenantId, productData); // First create attempt succeeds

      // Simulate product now exists for the second service-level check
      mockProductRepository.findBySkuAndTenantId.mockResolvedValueOnce({ ...productData, tenantId: constraintTenantId });

      await expect(productsService.createProduct(constraintTenantId, productData)).rejects.toThrow('Product with this SKU already exists for this tenant.');
      expect(mockProductRepository.findBySkuAndTenantId).toHaveBeenCalledTimes(2); // One for each create attempt
      expect(mockProductRepository.create).toHaveBeenCalledTimes(1); // Only the first one should go through
    });

    it('should throw error if repository fails due to unique constraint (simulating race condition DB error)', async () => {
      mockProductRepository.findBySkuAndTenantId.mockResolvedValue(null); // Service layer finds no existing product
      mockProductRepository.create.mockImplementationOnce(() => {
        // Simulate a database unique constraint error that bypasses service check (e.g., race condition)
        throw new Error('Database Error: Duplicate entry for key `products_tenantId_sku_unique`');
      });

      // Attempt to create (will throw the simulated DB error)
      await expect(productsService.createProduct(constraintTenantId, productData))
        .rejects.toThrow('Database Error: Duplicate entry for key `products_tenantId_sku_unique`');
      expect(mockProductRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should handle non-nullable field constraint violation during creation if service check is bypassed', async () => {
      // Temporarily create a service that does not validate 'name' as non-null
      class PermissiveProductsService extends ProductsService {
        async createProduct(tenantId: string, productData: { sku: string; name: string; description?: string; price: number; quantity: number }) {
          // Intentionally omit !productData.name check
          if (!tenantId || !productData.sku || productData.price == null || productData.quantity == null) {
            throw new Error('Invalid input: tenantId, sku, price, and quantity are required.');
          }
          if (productData.price < 0) {
            throw new Error('Price cannot be negative.');
          }
          if (productData.quantity < 0) {
            throw new Error('Quantity cannot be negative.');
          }
          const existing = await this.productRepository.findBySkuAndTenantId(tenantId, productData.sku);
          if (existing) {
            throw new Error('Product with this SKU already exists for this tenant.');
          }
          return this.productRepository.create({ ...productData, tenantId });
        }
      }
      const permissiveService = new PermissiveProductsService(mockProductRepository);

      mockProductRepository.findBySkuAndTenantId.mockResolvedValue(null);
      mockProductRepository.create.mockImplementationOnce(() => {
        throw new Error('Database Error: Column \'name\' cannot be null');
      });

      const invalidProductData = { sku: 'INVALID', name: null as any, price: 10, quantity: 100 };
      await expect(permissiveService.createProduct(constraintTenantId, invalidProductData)).rejects.toThrow('Database Error: Column \'name\' cannot be null');
      expect(mockProductRepository.create).toHaveBeenCalledWith(expect.objectContaining({ name: null }));
    });
  });
});

