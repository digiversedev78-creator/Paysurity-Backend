import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
const request = require('supertest');
import { MicrositeModule } from './microsite.module'; // real local module
import { eq } from 'drizzle-orm';

// LOCAL SCHEMA STUB: The real schema path (../../../../drizzle/schema) is phantom.
// These table descriptor objects are used only as matcher arguments in
// `.toHaveBeenCalledWith(schema.X)` assertions — plain objects satisfy the matcher.
const schema = {
  menuItems:  { slug: 'menuItems_slug', isCatering: 'menuItems_isCatering' } as any,
  orders:     {} as any,
  orderItems: {} as any,
};


// Define mock objects for each level of the Drizzle chain
const mockExecute = jest.fn();
const mockReturning = jest.fn(() => ({ execute: mockExecute }));
const mockValues = jest.fn(() => ({ returning: mockReturning, execute: mockExecute }));
const mockInsert = jest.fn(() => ({ values: mockValues }));

const mockOrderBy = jest.fn().mockReturnThis(); // Mock orderBy
const mockWhere = jest.fn(() => ({ execute: mockExecute, orderBy: mockOrderBy }));
const mockFrom = jest.fn(() => ({ where: mockWhere, execute: mockExecute, orderBy: mockOrderBy }));
const mockSelect = jest.fn(() => ({ from: mockFrom }));

// The root `db` object
const mockDb = {
  select: mockSelect,
  insert: mockInsert,
  transaction: jest.fn(async (callback) => {
    // For simplicity, within a transaction, we'll just use the main mockDb methods.
    // In a real scenario, `tx` might have its own instance of these methods.
    return await callback(mockDb);
  }),
  // Add other methods (update, delete, etc.) if your services use them.
  // Although not explicitly tested here, they might be part of the Drizzle setup.
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

describe('Microsite E2E Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Reset all mock functions before each test
    mockExecute.mockClear();
    mockReturning.mockClear();
    mockValues.mockClear();
    mockInsert.mockClear();
    mockWhere.mockClear();
    mockFrom.mockClear();
    mockSelect.mockClear();
    mockOrderBy.mockClear();
    mockDb.transaction.mockClear();
    mockDb.transaction.mockImplementation(async (callback) => await callback(mockDb)); // Re-implement transaction

    // Ensure all chainable methods are reset to return their respective mock objects
    mockSelect.mockImplementation(() => ({ from: mockFrom }));
    mockFrom.mockImplementation(() => ({ where: mockWhere, execute: mockExecute, orderBy: mockOrderBy }));
    mockWhere.mockImplementation(() => ({ execute: mockExecute, orderBy: mockOrderBy }));
    mockInsert.mockImplementation(() => ({ values: mockValues }));
    mockValues.mockImplementation(() => ({ returning: mockReturning, execute: mockExecute }));
    mockReturning.mockImplementation(() => ({ execute: mockExecute }));

    // For other methods that just return `this` for chaining
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockDb.delete.mockReturnThis();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MicrositeModule],
    })
      .overrideProvider('DATABASE')
      .useValue(mockDb)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0);
  });

  afterEach(async () => {
    await app.close();
  });

  // Mock data for tests
  const HOB_TENANT_ID = 'hob-tenant-id';
  const ANOTHER_TENANT_ID = 'another-tenant-id';

  const mockMenuHob = [
    {
      id: 'paan-item-1',
      tenantId: HOB_TENANT_ID,
      slug: 'hob',
      category: 'Paan',
      name: 'Meetha Paan',
      description: 'Sweet Paan',
      price: '1.50',
      isCatering: false,
      cateringPrice: null,
      unit: 'each',
      imageUrl: 'some-url',
    },
    {
      id: 'paan-item-2',
      tenantId: HOB_TENANT_ID,
      slug: 'hob',
      category: 'Paan',
      name: 'Saada Paan',
      description: 'Plain Paan',
      price: '1.50',
      isCatering: false,
      cateringPrice: null,
      unit: 'each',
      imageUrl: 'some-url',
    },
    {
      id: 'catering-item-1',
      tenantId: HOB_TENANT_ID,
      slug: 'hob',
      category: 'Snacks',
      name: 'Samosa Tray',
      description: 'Tray of Samosas',
      price: '25.00',
      isCatering: true,
      cateringPrice: '25.00',
      unit: 'tray',
      imageUrl: 'some-url',
    },
  ];

  const mockMenuAnotherTenant = [
    {
      id: 'burger-item-1',
      tenantId: ANOTHER_TENANT_ID,
      slug: 'another-tenant',
      category: 'Burgers',
      name: 'Classic Burger',
      description: 'Beef patty',
      price: '8.00',
      isCatering: false,
      cateringPrice: null,
      unit: 'each',
      imageUrl: 'some-other-url',
    },
  ];

  // Helper to mock a successful select for menu items
  const mockMenuSelect = (data: any[]) => {
    mockSelect.mockReturnThis();
    mockFrom.mockReturnThis();
    mockWhere.mockReturnThis();
    mockOrderBy.mockReturnThis(); // Ensure orderBy is also chained correctly
    mockExecute.mockResolvedValueOnce(data);
  };

  // Helper to mock a successful insert for orders
  const mockOrderInsert = (orderId: string, orderData: any) => {
    mockInsert.mockReturnThis();
    mockValues.mockReturnThis();
    mockReturning.mockReturnThis();
    mockExecute.mockResolvedValueOnce([{ id: orderId, ...orderData }]);
  };


  it('should return paan category with correct prices ($1.50 each) for GET /microsite/hob/menu', async () => {
    mockMenuSelect(mockMenuHob.filter(item => item.tenantId === HOB_TENANT_ID && !item.isCatering)); // Only regular menu items

    const response = await request(app.getHttpServer())
      .get('/microsite/hob/menu')
      .expect(HttpStatus.OK);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    const paanItems = response.body.filter(item => item.category === 'Paan');
    expect(paanItems.length).toBe(2);
    paanItems.forEach(item => {
      expect(item.price).toBe('1.50');
      expect(item.unit).toBe('each');
      expect(item.isCatering).toBe(false);
    });

    // Verify DB call for menu items
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith(schema.menuItems);
    expect(mockWhere).toHaveBeenCalledWith(
      eq(schema.menuItems.slug, 'hob'),
      eq(schema.menuItems.isCatering, false),
    );
  });

  it('should return catering menu with tray prices for GET /microsite/hob/menu?type=catering', async () => {
    // Mock the DB call to return only catering items for hob
    mockMenuSelect(mockMenuHob.filter(item => item.tenantId === HOB_TENANT_ID && item.isCatering));

    const response = await request(app.getHttpServer())
      .get('/microsite/hob/menu?type=catering')
      .expect(HttpStatus.OK);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    const cateringItem = response.body[0];
    expect(cateringItem.name).toBe('Samosa Tray');
    expect(cateringItem.cateringPrice).toBe('25.00');
    expect(cateringItem.unit).toBe('tray');
    expect(cateringItem.isCatering).toBe(true);

    // Verify DB call
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith(schema.menuItems);
    expect(mockWhere).toHaveBeenCalledWith(
      eq(schema.menuItems.slug, 'hob'),
      eq(schema.menuItems.isCatering, true),
    );
  });

  it('should create an order in the DB when POST /microsite/hob/order is called with valid data', async () => {
    const orderId = 'test-order-id-123';
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() + 3); // 3 days in future

    const orderPayload = {
      items: [
        { itemId: 'paan-item-1', quantity: 2, price: '1.50' },
        { itemId: 'paan-item-2', quantity: 1, price: '1.50' },
      ],
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      deliveryAddress: '123 Main St',
      orderDate: orderDate.toISOString(),
      totalAmount: '4.50',
      isCateringOrder: false,
    };

    // Mock menu item retrieval for order validation first
    mockMenuSelect(mockMenuHob.filter(item => orderPayload.items.some(orderItem => orderItem.itemId === item.id)));
    
    // Mock the insert operation for the order
    mockOrderInsert(orderId, orderPayload);

    // Mock the insert for order items (will be called in the same transaction)
    mockExecute.mockResolvedValueOnce([]); // For order_items insert returning nothing

    const response = await request(app.getHttpServer())
      .post('/microsite/hob/order')
      .send(orderPayload)
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      id: orderId,
      customerName: orderPayload.customerName,
      tenantId: HOB_TENANT_ID,
    });

    // Verify `db.insert` was called for orders table
    expect(mockInsert).toHaveBeenCalledWith(schema.orders);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: orderId, // The service should generate this UUID
        tenantId: HOB_TENANT_ID,
        customerName: orderPayload.customerName,
        customerEmail: orderPayload.customerEmail,
        deliveryAddress: orderPayload.deliveryAddress,
        orderDate: expect.any(Date),
        totalAmount: '4.50',
        isCateringOrder: false,
        status: 'pending', // Assuming default status
      })
    );
    // Verify `db.insert` was called for order_items table
    expect(mockInsert).toHaveBeenCalledWith(schema.orderItems);
    expect(mockValues).toHaveBeenCalledWith(
        expect.arrayContaining([
            expect.objectContaining({ orderId: orderId, itemId: 'paan-item-1', quantity: 2, price: '1.50' }),
            expect.objectContaining({ orderId: orderId, itemId: 'paan-item-2', quantity: 1, price: '1.50' }),
        ])
    );
  });

  it('should isolate tenants based on slug-based routing', async () => {
    // Mock select for 'hob' menu
    mockMenuSelect(mockMenuHob.filter(item => item.tenantId === HOB_TENANT_ID && !item.isCatering));

    const hobResponse = await request(app.getHttpServer())
      .get('/microsite/hob/menu')
      .expect(HttpStatus.OK);

    expect(hobResponse.body).toBeInstanceOf(Array);
    expect(hobResponse.body.length).toBe(2); // Paan items for hob
    expect(hobResponse.body[0].slug).toBe('hob');
    expect(hobResponse.body.some(item => item.category === 'Paan')).toBe(true);
    expect(hobResponse.body.some(item => item.category === 'Burgers')).toBe(false);

    // Reset mocks for the next call to accurately test the second tenant's DB call
    mockExecute.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockWhere.mockClear();
    mockOrderBy.mockClear();

    // Mock select for 'another-tenant' menu
    mockMenuSelect(mockMenuAnotherTenant.filter(item => item.tenantId === ANOTHER_TENANT_ID && !item.isCatering));

    const anotherTenantResponse = await request(app.getHttpServer())
      .get('/microsite/another-tenant/menu')
      .expect(HttpStatus.OK);

    expect(anotherTenantResponse.body).toBeInstanceOf(Array);
    expect(anotherTenantResponse.body.length).toBe(1); // Burger item for another-tenant
    expect(anotherTenantResponse.body[0].slug).toBe('another-tenant');
    expect(anotherTenantResponse.body.some(item => item.category === 'Burgers')).toBe(true);
    expect(anotherTenantResponse.body.some(item => item.category === 'Paan')).toBe(false);

    // Verify 'another-tenant' call
    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith(schema.menuItems);
    expect(mockWhere).toHaveBeenCalledWith(
      eq(schema.menuItems.slug, 'another-tenant'),
      eq(schema.menuItems.isCatering, false),
    );
  });

  it('should enforce 48h catering notice for catering orders', async () => {
    const orderId = 'catering-order-id-456';
    const now = new Date();

    // Test case 1: Order date less than 48 hours in the future (should fail)
    const lessThan48Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const cateringOrderPayloadInvalid = {
      items: [
        { itemId: 'catering-item-1', quantity: 1, price: '25.00' },
      ],
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      deliveryAddress: '456 Oak Ave',
      orderDate: lessThan48Hours.toISOString(),
      totalAmount: '25.00',
      isCateringOrder: true,
    };

    // Mock menu item retrieval for order validation
    mockMenuSelect(mockMenuHob.filter(item => item.id === 'catering-item-1'));

    await request(app.getHttpServer())
      .post('/microsite/hob/order')
      .send(cateringOrderPayloadInvalid)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toContain('Catering orders require at least 48 hours notice');
      });

    expect(mockInsert).not.toHaveBeenCalledWith(schema.orders); // Ensure no order was created


    // Reset mocks for the successful call scenario
    mockExecute.mockClear();
    mockInsert.mockClear();
    mockValues.mockClear();
    mockReturning.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockWhere.mockClear();
    mockOrderBy.mockClear();

    // Test case 2: Order date more than 48 hours in the future (should succeed)
    const moreThan48Hours = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 hours from now
    const cateringOrderPayloadValid = {
      items: [
        { itemId: 'catering-item-1', quantity: 1, price: '25.00' },
      ],
      customerName: 'Jane Doe',
      customerEmail: 'jane.doe@example.com',
      deliveryAddress: '456 Oak Ave',
      orderDate: moreThan48Hours.toISOString(),
      totalAmount: '25.00',
      isCateringOrder: true,
    };

    // Mock menu item retrieval for order validation again
    mockMenuSelect(mockMenuHob.filter(item => item.id === 'catering-item-1'));

    // Mock successful order insert
    mockOrderInsert(orderId, cateringOrderPayloadValid);
    // Mock successful order items insert
    mockExecute.mockResolvedValueOnce([]); 

    const response = await request(app.getHttpServer())
      .post('/microsite/hob/order')
      .send(cateringOrderPayloadValid)
      .expect(HttpStatus.CREATED);

    expect(response.body).toMatchObject({
      id: orderId,
      customerName: cateringOrderPayloadValid.customerName,
      isCateringOrder: true,
    });

    expect(mockInsert).toHaveBeenCalledWith(schema.orders); // Ensure order was created
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        id: orderId,
        tenantId: HOB_TENANT_ID,
        isCateringOrder: true,
        orderDate: expect.any(Date),
      })
    );
    expect(mockInsert).toHaveBeenCalledWith(schema.orderItems);
    expect(mockValues).toHaveBeenCalledWith(
        expect.arrayContaining([
            expect.objectContaining({ orderId: orderId, itemId: 'catering-item-1', quantity: 1, price: '25.00' }),
        ])
    );
  });
});
