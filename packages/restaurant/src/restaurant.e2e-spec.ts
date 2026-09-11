import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { RestaurantModule } from './restaurant.module'; // canonical module instead of AppModule
import { PgColumn, pgTable, uuid, timestamp, varchar, integer, numeric, pgEnum } from 'drizzle-orm/pg-core';
// Needed for the mock db provider

// --- MOCK DATABASE SETUP ---
let mockData: {
  orders: any[];
  order_items: any[];
  payments: any[];
};

const generateUuid = () => `mock-uuid-${Math.random().toString(36).substring(2, 11)}`;

// Define mock Drizzle-like schema objects that simulate `pgTable`
// These are minimal, only providing `name` and column objects with `name` for `eq` and `returning`
const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'voided']);
const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed']);

// Mock table schema definition (simplified for test purposes)
const orders = pgTable('orders', {
  id: uuid('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  restaurantId: uuid('restaurant_id').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).default('0.00').notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull(),
  productId: uuid('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

const payments = pgTable('payments', {
  id: uuid('id').primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Simplified mock `eq` function for WHERE clauses
// This produces an object that our mock DB can interpret
const eq = (col: PgColumn, value: any) => ({ _type: 'eq', colName: col.name, value });

// A more robust mock for NodePgDatabase that chains methods
const createMockNodePgDatabase = () => {
  let currentSchema: any = null;
  let currentFilters: any[] = [];
  let currentSetValues: any = {};
  let currentReturningColumns: any[] = [];

  const resetState = () => {
    currentSchema = null;
    currentFilters = [];
    currentSetValues = {};
    currentReturningColumns = [];
  };

  const getTableName = (schema: any) => {
    // Assuming schema objects have a 'name' property
    if (schema === orders) return 'orders';
    if (schema === orderItems) return 'order_items';
    if (schema === payments) return 'payments';
    return null;
  };

  const applyFilters = (data: any[]) => {
    if (currentFilters.length === 0) return data;
    return data.filter(row => {
      return currentFilters.every(filter => {
        if (filter._type === 'eq') {
          return row[filter.colName] === filter.value;
        }
        // Add more filter types as needed (gt, lt, like, etc.)
        return true;
      });
    });
  };

  return {
    select: (columns?: any[]) => {
      currentReturningColumns = columns || [];
      return {
        from: (schema: any) => {
          const tableName = getTableName(schema);
          if (!tableName) throw new Error(`Unknown schema for select: ${schema.name}`);
          currentSchema = schema;
          return {
            where: (filter: any) => {
              currentFilters.push(filter);
              return {
                execute: async () => {
                  const filtered = applyFilters(mockData[tableName]);
                  const results = filtered.map(row => {
                    if (currentReturningColumns.length === 0) return row; // Return all if no specific columns requested
                    const newRow: any = {};
                    currentReturningColumns.forEach((col: any) => {
                      if (typeof col === 'string') { // Simple string column name
                        newRow[col] = row[col];
                      } else if (col && typeof col === 'object' && col.name) { // Drizzle-like column object
                        newRow[col.name] = row[col.name];
                      }
                    });
                    return newRow;
                  });
                  resetState();
                  return results;
                },
              };
            },
            execute: async () => {
              const results = mockData[tableName].map(row => {
                if (currentReturningColumns.length === 0) return row;
                const newRow: any = {};
                currentReturningColumns.forEach((col: any) => {
                  if (typeof col === 'string') {
                    newRow[col] = row[col];
                  } else if (col && typeof col === 'object' && col.name) {
                    newRow[col.name] = row[col.name];
                  }
                });
                return newRow;
              });
              resetState();
              return results;
            },
          };
        },
      };
    },
    insert: (schema: any) => {
      const tableName = getTableName(schema);
      if (!tableName) throw new Error(`Unknown schema for insert: ${schema.name}`);
      currentSchema = schema;
      return {
        values: (data: any) => {
          currentSetValues = {
            ...data,
            id: data.id || generateUuid(), // Ensure ID is generated if not provided
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          // Handle default status for orders/payments if not provided
          if (tableName === 'orders' && !currentSetValues.status) {
            currentSetValues.status = 'pending';
          }
          if (tableName === 'payments' && !currentSetValues.status) {
            currentSetValues.status = 'pending';
          }
          if (tableName === 'orders' && !currentSetValues.total) {
            currentSetValues.total = '0.00';
          }
          return {
            returning: (columns?: any[]) => {
              currentReturningColumns = columns || [];
              return {
                execute: async () => {
                  const newRow = { ...currentSetValues };
                  mockData[tableName].push(newRow); // Add to mock data
                  const results = [newRow].map(row => {
                    if (currentReturningColumns.length === 0) return row;
                    const resultRow: any = {};
                    currentReturningColumns.forEach((col: any) => {
                      if (typeof col === 'string') {
                        resultRow[col] = row[col];
                      } else if (col && typeof col === 'object' && col.name) {
                        resultRow[col.name] = row[col.name];
                      }
                    });
                    return resultRow;
                  });
                  resetState();
                  return results;
                },
              };
            },
          };
        },
      };
    },
    update: (schema: any) => {
      const tableName = getTableName(schema);
      if (!tableName) throw new Error(`Unknown schema for update: ${schema.name}`);
      currentSchema = schema;
      return {
        set: (values: any) => {
          currentSetValues = { ...values, updatedAt: new Date().toISOString() };
          return {
            where: (filter: any) => {
              currentFilters.push(filter);
              return {
                returning: (columns?: any[]) => {
                  currentReturningColumns = columns || [];
                  return {
                    execute: async () => {
                      const updatedRows: any[] = [];
                      mockData[tableName] = mockData[tableName].map(row => {
                        // Check if row matches the current filters
                        if (applyFilters([row]).length > 0) {
                          const newRow = { ...row, ...currentSetValues };
                          updatedRows.push(newRow);
                          return newRow;
                        }
                        return row;
                      });

                      const results = updatedRows.map(row => {
                        if (currentReturningColumns.length === 0) return row;
                        const resultRow: any = {};
                        currentReturningColumns.forEach((col: any) => {
                          if (typeof col === 'string') {
                            resultRow[col] = row[col];
                          } else if (col && typeof col === 'object' && col.name) {
                            resultRow[col.name] = row[col.name];
                          }
                        });
                        return resultRow;
                      });
                      resetState();
                      return results;
                    },
                  };
                },
                execute: async () => { // If no returning
                  mockData[tableName] = mockData[tableName].map(row => {
                    if (applyFilters([row]).length > 0) {
                      return { ...row, ...currentSetValues };
                    }
                    return row;
                  });
                  resetState();
                  return [];
                },
              };
            },
          };
        },
      };
    },
    delete: (schema: any) => {
      const tableName = getTableName(schema);
      if (!tableName) throw new Error(`Unknown schema for delete: ${schema.name}`);
      currentSchema = schema;
      return {
        where: (filter: any) => {
          currentFilters.push(filter);
          return {
            returning: (columns?: any[]) => {
              currentReturningColumns = columns || [];
              return {
                execute: async () => {
                  const deletedRows: any[] = [];
                  mockData[tableName] = mockData[tableName].filter(row => {
                    const shouldKeep = applyFilters([row]).length === 0;
                    if (!shouldKeep) {
                      deletedRows.push(row);
                    }
                    return shouldKeep;
                  });
                  // Simulate cascade delete for order_items and payments
                  if (tableName === 'orders') {
                    const deletedOrderIds = deletedRows.map(r => r.id);
                    mockData.order_items = mockData.order_items.filter(item => !deletedOrderIds.includes(item.orderId));
                    mockData.payments = mockData.payments.filter(payment => !deletedOrderIds.includes(payment.orderId));
                  }


                  const results = deletedRows.map(row => {
                    if (currentReturningColumns.length === 0) return row;
                    const resultRow: any = {};
                    currentReturningColumns.forEach((col: any) => {
                      if (typeof col === 'string') {
                        resultRow[col] = row[col];
                      } else if (col && typeof col === 'object' && col.name) {
                        resultRow[col.name] = row[col.name];
                      }
                    });
                    return resultRow;
                  });
                  resetState();
                  return results;
                },
              };
            },
            execute: async () => { // If no returning
              const deletedRows: any[] = [];
              mockData[tableName] = mockData[tableName].filter(row => {
                const shouldKeep = applyFilters([row]).length === 0;
                if (!shouldKeep) {
                  deletedRows.push(row);
                }
                return shouldKeep;
              });
              // Simulate cascade delete
              if (tableName === 'orders') {
                const deletedOrderIds = deletedRows.map(r => r.id);
                mockData.order_items = mockData.order_items.filter(item => !deletedOrderIds.includes(item.orderId));
                mockData.payments = mockData.payments.filter(payment => !deletedOrderIds.includes(payment.orderId));
              }
              resetState();
              return [];
            },
          };
        },
      };
    },
  };
};

describe('Restaurant POS E2E', () => {
  let app: INestApplication;
  let mockDbInstance: ReturnType<typeof createMockNodePgDatabase>;

  const TENANT_ID_1 = generateUuid();
  const TENANT_ID_2 = generateUuid();
  const RESTAURANT_ID_1 = generateUuid();
  const RESTAURANT_ID_2 = generateUuid();

  const mockProducts = [
    { id: generateUuid(), name: 'Burger', price: '12.50' },
    { id: generateUuid(), name: 'Fries', price: '4.00' },
    { id: generateUuid(), name: 'Coke', price: '3.00' },
  ];

  beforeAll(async () => {
    mockDbInstance = createMockNodePgDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RestaurantModule],
    })
      .overrideProvider('DATABASE') // Target the provider token directly, assuming 'DATABASE' is the token
      .useValue(mockDbInstance)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    // Reset mock data before each test
    mockData = {
      orders: [],
      order_items: [],
      payments: [],
    };
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /restaurant/orders creates a new order', async () => {
    const createOrderDto = {
      restaurantId: RESTAURANT_ID_1,
    };

    const response = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1) // Simulate tenant context via header
      .send(createOrderDto)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.tenantId).toBe(TENANT_ID_1);
    expect(response.body.restaurantId).toBe(RESTAURANT_ID_1);
    expect(response.body.total).toBe('0.00');
    expect(response.body.status).toBe('pending');

    // Verify in mock database
    expect(mockData.orders.length).toBe(1);
    expect(mockData.orders[0].id).toBe(response.body.id);
  });

  it('GET /restaurant/orders/:orderId returns a specific order', async () => {
    // Create an order
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    const orderId = createOrderResponse.body.id;

    const response = await request(app.getHttpServer())
      .get(`/restaurant/orders/${orderId}`)
      .set('x-tenant-id', TENANT_ID_1)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(orderId);
    expect(response.body.tenantId).toBe(TENANT_ID_1);
  });

  it('POST /restaurant/orders/:orderId/items adds an item to an order', async () => {
    // First, create an order
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);

    const orderId = createOrderResponse.body.id;
    const product = mockProducts[0]; // Price: '12.50'

    const addItemDto = {
      productId: product.id,
      productName: product.name,
      quantity: 2,
      price: product.price,
    };

    const response = await request(app.getHttpServer())
      .post(`/restaurant/orders/${orderId}/items`)
      .set('x-tenant-id', TENANT_ID_1)
      .send(addItemDto)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBeDefined();
    expect(response.body.orderId).toBe(orderId);
    expect(response.body.productId).toBe(product.id);
    expect(response.body.quantity).toBe(2);
    expect(response.body.price).toBe(product.price);

    // Verify order total updated in mock DB
    const updatedOrder = mockData.orders.find(o => o.id === orderId);
    expect(updatedOrder).toBeDefined();
    // '12.50' * 2 = '25.00'
    expect(updatedOrder?.total).toBe('25.00');

    // Verify item in mock DB
    expect(mockData.order_items.length).toBe(1);
    expect(mockData.order_items[0].orderId).toBe(orderId);
    expect(mockData.order_items[0].productName).toBe(product.name);
  });

  it('POST /restaurant/orders/:orderId/checkout processes payment and updates order status', async () => {
    // First, create an order and add items
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    const orderId = createOrderResponse.body.id;

    const product1 = mockProducts[0]; // 12.50
    const product2 = mockProducts[1]; // 4.00

    await request(app.getHttpServer())
      .post(`/restaurant/orders/${orderId}/items`)
      .set('x-tenant-id', TENANT_ID_1)
      .send({ productId: product1.id, productName: product1.name, quantity: 1, price: product1.price })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/restaurant/orders/${orderId}/items`)
      .set('x-tenant-id', TENANT_ID_1)
      .send({ productId: product2.id, productName: product2.name, quantity: 2, price: product2.price }) // 4.00 * 2 = 8.00
      .expect(201);

    // Total should be 12.50 + 8.00 = 20.50
    const currentOrder = mockData.orders.find(o => o.id === orderId);
    expect(currentOrder?.total).toBe('20.50');

    const checkoutDto = {
      paymentMethod: 'credit_card', // Placeholder, not actually used by mock DB
      currency: 'USD',
    };

    const response = await request(app.getHttpServer())
      .post(`/restaurant/orders/${orderId}/checkout`)
      .set('x-tenant-id', TENANT_ID_1)
      .send(checkoutDto)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.orderId).toBe(orderId);
    expect(response.body.amount).toBe('20.50'); // Total from the order
    expect(response.body.status).toBe('completed'); // Payment confirmation status

    // Verify order status updated in mock DB
    const updatedOrder = mockData.orders.find(o => o.id === orderId);
    expect(updatedOrder?.status).toBe('paid');

    // Verify payment record in mock DB
    expect(mockData.payments.length).toBe(1);
    expect(mockData.payments[0].orderId).toBe(orderId);
    expect(mockData.payments[0].amount).toBe('20.50');
    expect(mockData.payments[0].status).toBe('completed');
  });

  it('PATCH /restaurant/orders/:orderId/void voids an order', async () => {
    // First, create an order
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    const orderId = createOrderResponse.body.id;

    const response = await request(app.getHttpServer())
      .patch(`/restaurant/orders/${orderId}/void`)
      .set('x-tenant-id', TENANT_ID_1)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(orderId);
    expect(response.body.status).toBe('voided');

    // Verify order status updated in mock DB
    const voidedOrder = mockData.orders.find(o => o.id === orderId);
    expect(voidedOrder?.status).toBe('voided');
  });

  it('GET /restaurant/orders lists orders for the current tenant', async () => {
    // Create orders for TENANT_ID_1
    await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);

    // Create an order for TENANT_ID_2
    await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_2)
      .send({ restaurantId: RESTAURANT_ID_2 })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1) // Requesting orders for TENANT_ID_1
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2); // Should only return orders for TENANT_ID_1

    response.body.forEach((order: any) => {
      expect(order.tenantId).toBe(TENANT_ID_1);
    });
  });

  it('should not allow adding items to a voided order', async () => {
    // Create and void an order
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    const orderId = createOrderResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/restaurant/orders/${orderId}/void`)
      .set('x-tenant-id', TENANT_ID_1)
      .expect(200);

    const product = mockProducts[0];
    const addItemDto = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
    };

    const response = await request(app.getHttpServer())
      .post(`/restaurant/orders/${orderId}/items`)
      .set('x-tenant-id', TENANT_ID_1)
      .send(addItemDto)
      .expect(400); // Expect a bad request or similar error

    expect(response.body.message).toContain('Order is not in a modifiable state');
  });

  it('should not allow checking out a voided order', async () => {
    // Create and void an order
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    const orderId = createOrderResponse.body.id;

    await request(app.getHttpServer())
      .patch(`/restaurant/orders/${orderId}/void`)
      .set('x-tenant-id', TENANT_ID_1)
      .expect(200);

    const checkoutDto = {
      paymentMethod: 'credit_card',
      currency: 'USD',
    };

    const response = await request(app.getHttpServer())
      .post(`/restaurant/orders/${orderId}/checkout`)
      .set('x-tenant-id', TENANT_ID_1)
      .send(checkoutDto)
      .expect(400); // Expect a bad request or similar error

    expect(response.body.message).toContain('Order is not in a checkout-ready state');
  });

  it('should prevent access to orders belonging to a different tenant', async () => {
    // Create an order for TENANT_ID_1
    const createOrderResponse = await request(app.getHttpServer())
      .post('/restaurant/orders')
      .set('x-tenant-id', TENANT_ID_1)
      .send({ restaurantId: RESTAURANT_ID_1 })
      .expect(201);
    const orderId = createOrderResponse.body.id;

    // Try to access/modify with TENANT_ID_2
    const response = await request(app.getHttpServer())
      .get(`/restaurant/orders/${orderId}`)
      .set('x-tenant-id', TENANT_ID_2)
      .expect(404); // Expect not found for the current tenant

    expect(response.body.message).toContain('Order not found');
  });
});
