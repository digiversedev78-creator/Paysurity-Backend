/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-001 -- SKU Product Management
 * FILE TYPE:    TEST
 * MODULE:       products
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-074
 * GENERATED:    2026-03-17T13:09:06.255Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ProductsModule } from './products.module';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { eq, and } from 'drizzle-orm';

// Local type definitions for in-memory mock tracking
// (The real Product/NewProduct types come from @paysurity/database, but the
// spec only uses these as plain objects for its own in-memory array.)
type Product = {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
};
type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// Local products schema stub (only used for eq() assertions in the spec)
const products = {
  id:        { name: 'id' }        as any,
  tenantId:  { name: 'tenant_id' } as any,
  sku:       { name: 'sku' }       as any,
  createdAt: { name: 'created_at' } as any,
};

// Mock Drizzle and AuditLog services
const mockProducts: Product[] = [];
const mockAuditLogs: any[] = [];
const mockTenantId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const mockOtherTenantId = 'b1e0c7a5-d8f9-4e32-9c10-2f1d4a0e9c87';
const mockUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

// A mock implementation of dbConnection with simplified in-memory behavior
const mockDbConnection = {
  db: {
    insert: jest.fn().mockImplementation((table) => ({
      values: jest.fn().mockImplementation((data: NewProduct[]) => ({
        returning: jest.fn().mockImplementation(() => {
          const newProduct = { ...data[0], id: `prod-${mockProducts.length + 1}`, createdAt: new Date(), updatedAt: new Date() };
          mockProducts.push(newProduct as Product);
          return [newProduct];
        }),
      })),
    })),
    update: jest.fn().mockImplementation((table) => ({
      set: jest.fn().mockImplementation((data: Partial<NewProduct>) => ({
        where: jest.fn().mockImplementation((condition) => ({
          returning: jest.fn().mockImplementation(() => {
            // Extract product ID from the condition (simplified for test, assumes 'eq(products.id, productId)')
            const productId = condition.expressions?.[0]?.right?.value || condition.right.value; 
            const productIndex = mockProducts.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
              const updatedProduct = { ...mockProducts[productIndex], ...data, updatedAt: new Date() };
              // Drizzle stores numeric as string, so simulate that for tests
              if (data.price) updatedProduct.price = data.price.toString();
              mockProducts[productIndex] = updatedProduct;
              return [updatedProduct];
            }
            return [];
          }),
        })),
      })),
    })),
    delete: jest.fn().mockImplementation((table) => ({
      where: jest.fn().mockImplementation((condition) => {
        // Extract product ID from the condition (simplified for test, assumes 'eq(products.id, productId)')
        const productId = condition.expressions?.[0]?.right?.value || condition.right.value;
        const initialLength = mockProducts.length;
        const indexToDelete = mockProducts.findIndex(p => p.id === productId);
        if (indexToDelete !== -1) {
          mockProducts.splice(indexToDelete, 1);
        }
        return { rowCount: initialLength - mockProducts.length };
      }),
    })),
    query: {
      products: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          let filteredProducts = mockProducts;

          // Apply conditions (simplified parsing for test)
          const idCondition = where.expressions?.find(exp => exp.left?.name === 'id');
          const skuCondition = where.expressions?.find(exp => exp.left?.name === 'sku');
          const tenantCondition = where.expressions?.find(exp => exp.left?.name === 'tenant_id');

          if (tenantCondition) filteredProducts = filteredProducts.filter(p => p.tenantId === tenantCondition.right.value);
          if (idCondition) filteredProducts = filteredProducts.filter(p => p.id === idCondition.right.value);
          if (skuCondition) filteredProducts = filteredProducts.filter(p => p.sku === skuCondition.right.value);
          
          return filteredProducts[0]; // Return the first matching product
        }),
        findMany: jest.fn().mockImplementation(({ where, limit, offset, orderBy }) => {
          let filteredProducts = mockProducts;
          const tenantCondition = where.expressions?.find(exp => exp.left?.name === 'tenant_id');
          if (tenantCondition) {
            filteredProducts = filteredProducts.filter(p => p.tenantId === tenantCondition.right.value);
          }

          // Apply ordering, offset, limit (simplified)
          if (orderBy === products.createdAt) {
            filteredProducts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          }

          return filteredProducts.slice(offset, offset + limit);
        }),
      },
    },
    select: jest.fn().mockImplementation(() => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation((condition) => {
          let count = mockProducts.length;
          const tenantCondition = condition.expressions?.find(exp => exp.left?.name === 'tenant_id');
          if (tenantCondition) {
            count = mockProducts.filter(p => p.tenantId === tenantCondition.right.value).length;
          }
          return [{ count }];
        }),
      })),
    })),
  },
};

// A mock implementation of AuditLogService
const mockAuditLogService = {
  logAudit: jest.fn().mockImplementation((tenantId, userId, entityType, entityId, operation, oldValue, newValue) => {
    mockAuditLogs.push({ tenantId, userId, entityType, entityId, operation, oldValue, newValue, timestamp: new Date() });
  }),
};

// Mock the custom decorators for testing purposes
jest.mock('../src/common/decorators', () => ({
  TenantId: () => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => { /* no-op in test */ },
  UserId: () => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => { /* no-op in test */ },
}));

// Mock AuthGuard to simply pass through, injecting mock tenant/user info into req.user
jest.mock('@nestjs/passport', () => ({
  AuthGuard: (type: string) => {
    return class MockAuthGuard {
      canActivate(context: any): boolean {
        const req = context.switchToHttp().getRequest();
        // Mock authenticated user and tenant context
        req.user = { tenantId: mockTenantId, id: mockUserId }; 
        return true;
      }
    };
  },
}));

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Clear mocks and reset in-memory data before each test
    mockProducts.splice(0, mockProducts.length);
    mockAuditLogs.splice(0, mockAuditLogs.length);
    mockDbConnection.db.insert.mockClear();
    mockDbConnection.db.update.mockClear();
    mockDbConnection.db.delete.mockClear();
    mockDbConnection.db.query.products.findFirst.mockClear();
    mockDbConnection.db.query.products.findMany.mockClear();
    mockDbConnection.db.select.mockClear();
    mockAuditLogService.logAudit.mockClear();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProductsModule],
    })
      .overrideProvider('DATABASE')
      .useValue(mockDbConnection)
      .overrideProvider(AuditLogService)
      .useValue(mockAuditLogService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper to simulate authorization header, though req.user is mocked directly by AuthGuard for simplicity
  const getAuthHeader = () => ({
    authorization: `Bearer dummy-token`,
  });

  it('/products (POST) - should create a product', async () => {
    const createDto: CreateProductDto = {
      sku: 'PROD001',
      name: 'Test Product 1',
      description: 'A test product description',
      price: 19.99,
      currency: 'USD',
      stockQuantity: 100,
      isActive: true,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .set(getAuthHeader())
      .send(createDto)
      .expect(201);

    expect(response.body).toBeInstanceOf(Object);
    expect(response.body.id).toBeDefined();
    expect(response.body.sku).toBe((createDto as any).sku);
    expect(response.body.name).toBe((createDto as any).name);
    expect(response.body.price).toBe((createDto as any).price);
    expect(response.body.tenantId).toBe(mockTenantId);
    expect(mockProducts).toHaveLength(1);

    expect(mockDbConnection.db.insert).toHaveBeenCalledTimes(1);
    expect(mockAuditLogService.logAudit).toHaveBeenCalledTimes(1);
    expect(mockAuditLogService.logAudit).toHaveBeenCalledWith(
      mockTenantId,
      mockUserId,
      'products',
      expect.any(String),
      'CREATE',
      null,
      expect.objectContaining({ sku: (createDto as any).sku })
    );
  });

  it('/products (POST) - should not create a product with duplicate SKU for the same tenant', async () => {
    const createDto: CreateProductDto = {
      sku: 'PROD002',
      name: 'Test Product 2',
      description: 'Another test product',
      price: 29.99,
      currency: 'EUR',
      stockQuantity: 50,
      isActive: true,
    };

    await request(app.getHttpServer())
      .post('/products')
      .set(getAuthHeader())
      .send(createDto)
      .expect(201);

    await request(app.getHttpServer())
      .post('/products')
      .set(getAuthHeader())
      .send(createDto) // Same SKU, same tenant
      .expect(409); // Conflict

    expect(mockProducts).toHaveLength(1); // Only one product should be created successfully
    expect(mockDbConnection.db.insert).toHaveBeenCalledTimes(2); // First successful, second attempted
    // Verify findFirst was called to check for existing SKU
    expect(mockDbConnection.db.query.products.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: and(eq(products.tenantId, mockTenantId), eq(products.sku, (createDto as any).sku)) })
    );
  });

  it('/products (GET) - should return all products for the tenant', async () => {
    const product1: Product = { id: 'p1', tenantId: mockTenantId, sku: 'SKU001', name: 'P1', description: null, price: '10.00', currency: 'USD', stockQuantity: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const product2: Product = { id: 'p2', tenantId: mockTenantId, sku: 'SKU002', name: 'P2', description: null, price: '20.00', currency: 'USD', stockQuantity: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const product3: Product = { id: 'p3', tenantId: mockOtherTenantId, sku: 'SKU003', name: 'P3', description: null, price: '30.00', currency: 'USD', stockQuantity: 30, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    mockProducts.push(product1, product2, product3);

    const response = await request(app.getHttpServer())
      .get('/products')
      .set(getAuthHeader())
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.some(p => p.id === 'p1')).toBe(true);
    expect(response.body.data.some(p => p.id === 'p2')).toBe(true);
    expect(response.body.data.some(p => p.id === 'p3')).toBe(false); // Product from other tenant should not be returned
    expect(response.body.total).toBe(2);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(10);
  });

  it('/products/:id (GET) - should return a single product by ID for the correct tenant', async () => {
    const product: Product = { id: 'p1', tenantId: mockTenantId, sku: 'SKU001', name: 'P1', description: null, price: '10.00', currency: 'USD', stockQuantity: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    mockProducts.push(product);

    const response = await request(app.getHttpServer())
      .get(`/products/${product.id}`)
      .set(getAuthHeader())
      .expect(200);

    expect(response.body.id).toBe(product.id);
    expect(response.body.tenantId).toBe(mockTenantId);
    expect(response.body.price).toBe(parseFloat(product.price));
  });

  it('/products/:id (GET) - should return 404 if product not found for tenant', async () => {
    const product: Product = { id: 'p1', tenantId: mockOtherTenantId, sku: 'SKU001', name: 'P1', description: null, price: '10.00', currency: 'USD', stockQuantity: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    mockProducts.push(product);

    await request(app.getHttpServer())
      .get(`/products/some-invalid-id`)
      .set(getAuthHeader())
      .expect(404);

    await request(app.getHttpServer())
      .get(`/products/${product.id}`) // Correct ID, but belongs to another tenant
      .set(getAuthHeader())
      .expect(404);
  });

  it('/products/:id (PUT) - should update a product', async () => {
    const product: Product = { id: 'p1', tenantId: mockTenantId, sku: 'SKU001', name: 'P1', description: 'original description', price: '10.00', currency: 'USD', stockQuantity: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    mockProducts.push(product);

    const updateDto: UpdateProductDto = {
      name: 'Updated P1 Name',
      price: 15.50,
      isActive: false,
    };

    const response = await request(app.getHttpServer())
      .put(`/products/${product.id}`)
      .set(getAuthHeader())
      .send(updateDto)
      .expect(200);

    expect(response.body.id).toBe(product.id);
    expect(response.body.name).toBe('Updated P1 Name');
    expect(response.body.price).toBe(15.50);
    expect(response.body.isActive).toBe(false);
    expect(response.body.description).toBe(product.description); // Unchanged

    expect(mockAuditLogService.logAudit).toHaveBeenCalledTimes(1);
    expect(mockAuditLogService.logAudit).toHaveBeenCalledWith(
      mockTenantId,
      mockUserId,
      'products',
      product.id,
      'UPDATE',
      expect.objectContaining({ name: product.name, price: product.price }), // Old state
      expect.objectContaining({ name: 'Updated P1 Name', price: '15.50', isActive: false }) // New state (price as string)
    );
  });

  it('/products/:id (PUT) - should return 404 if product not found for tenant during update', async () => {
    const updateDto: UpdateProductDto = { name: 'Nonexistent product' };
    await request(app.getHttpServer())
      .put(`/products/some-invalid-id`)
      .set(getAuthHeader())
      .send(updateDto)
      .expect(404);
  });

  it('/products/:id (PUT) - should not update SKU to an existing one in the same tenant', async () => {
    const product1: Product = { id: 'p1', tenantId: mockTenantId, sku: 'SKU001', name: 'P1', description: null, price: '10.00', currency: 'USD', stockQuantity: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    const product2: Product = { id: 'p2', tenantId: mockTenantId, sku: 'SKU002', name: 'P2', description: null, price: '20.00', currency: 'USD', stockQuantity: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    mockProducts.push(product1, product2);

    const updateDto: UpdateProductDto = {
      sku: 'SKU002', // Attempt to change SKU001 to SKU002
    };

    await request(app.getHttpServer())
      .put(`/products/${product1.id}`)
      .set(getAuthHeader())
      .send(updateDto)
      .expect(409); // Conflict

    // Verify product1's SKU is not changed in mockProducts
    const p1 = mockProducts.find(p => p.id === product1.id);
    expect(p1.sku).toBe('SKU001');
    expect(mockAuditLogService.logAudit).not.toHaveBeenCalled();
  });

  it('/products/:id (DELETE) - should delete a product', async () => {
    const product: Product = { id: 'p1', tenantId: mockTenantId, sku: 'SKU001', name: 'P1', description: null, price: '10.00', currency: 'USD', stockQuantity: 10, isActive: true, createdAt: new Date(), updatedAt: new Date() };
    mockProducts.push(product);

    await request(app.getHttpServer())
      .delete(`/products/${product.id}`)
      .set(getAuthHeader())
      .expect(204);

    expect(mockProducts).toHaveLength(0);
    expect(mockAuditLogService.logAudit).toHaveBeenCalledTimes(1);
    expect(mockAuditLogService.logAudit).toHaveBeenCalledWith(
      mockTenantId,
      mockUserId,
      'products',
      product.id,
      'DELETE',
      expect.objectContaining({ id: product.id }), // Old state
      null // New state is null after deletion
    );
  });

  it('/products/:id (DELETE) - should return 404 if product not found for tenant during delete', async () => {
    await request(app.getHttpServer())
      .delete(`/products/some-invalid-id`)
      .set(getAuthHeader())
      .expect(404);
    expect(mockAuditLogService.logAudit).not.toHaveBeenCalled();
  });

  it('/products (POST) - should return 400 for invalid DTO', async () => {
    const invalidDto = {
      sku: 'SHORT', // Too short
      name: null,    // Not a string
      description: 'a'.repeat(501), // Too long
      price: -10,    // Not positive
      currency: 'US', // Too short
      stockQuantity: -5, // Not min 0
      isActive: 'not a boolean', // Invalid type
      extraField: 'should be forbidden' // Not whitelisted
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .set(getAuthHeader())
      .send(invalidDto)
      .expect(400);

    expect(response.body.message).toBeInstanceOf(Array);
    const messages = response.body.message.sort();
    expect(messages).toEqual(expect.arrayContaining([
      'isActive must be a boolean value',
      'currency must be exactly 3 characters long',
      'currency should not be empty',
      'currency must be a string',
      'description must be shorter than or equal to 500 characters',
      'name must be a string',
      'name should not be empty',
      'price must be a positive number',
      'sku must be longer than or equal to 3 characters',
      'stockQuantity must not be less than 0',
      'stockQuantity must be a number conforming to the specified constraints',
      'property extraField should not exist'
    ]).sort()); // Sort to ensure order independence
  });
});

