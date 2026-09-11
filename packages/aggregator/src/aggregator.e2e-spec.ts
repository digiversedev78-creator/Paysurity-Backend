import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
const request = require('supertest');
import { AggregatorModule } from './aggregator.module';
// import removed
import * as crypto from 'crypto';

// --- Mock Drizzle Schema for Test Environment (due to 'src/*' import restriction) ---
const mockOrdersTable = {
  // Mimics properties needed for Drizzle's `eq` function and query builder interaction
  getSQL: () => 'orders', // Used by the mockDb to identify the table
  $inferSelect: {} as any, // Placeholder for type inference
  $inferInsert: {} as any, // Placeholder for type inference

  id: { name: 'id', getSQL: () => 'id' },
  tenantId: { name: 'tenant_id', getSQL: () => 'tenant_id' },
  externalOrderId: { name: 'external_order_id', getSQL: () => 'external_order_id' },
  sourcePlatform: { name: 'source_platform', getSQL: () => 'source_platform' },
  amount: { name: 'amount', getSQL: () => 'amount' },
  status: { name: 'status', getSQL: () => 'status' },
  createdAt: { name: 'created_at', getSQL: () => 'created_at' },
  updatedAt: { name: 'updated_at', getSQL: () => 'updated_at' },
};

type MockOrder = {
  id: string;
  tenant_id: string;
  external_order_id: string;
  source_platform: string;
  amount: string; // Drizzle's numeric type usually maps to string in TS
  status: string;
  created_at: Date;
  updated_at: Date;
};

// --- Mock Drizzle `eq` and `and` functions ---
// These mocks are crucial because the service will call the real `drizzle-orm` functions,
// and the `mockDb` needs to be able to "parse" the resulting condition objects.
const mockEq = (left: any, right: any) => ({
  type: 'eq',
  left: { column: { name: left.name } }, // Simulating column object
  right: { value: right }, // The value to compare against
});

const mockAnd = (...expressions: any[]) => ({
  type: 'and',
  _: { expressions: expressions }, // Drizzle stores sub-expressions here
});

// --- In-memory store for mock database ---
const mockOrders: MockOrder[] = [];
const MOCK_TENANT_ID = crypto.randomUUID(); // A consistent tenant ID for all E2E tests

// --- Mock Database Implementation ---
const mockDb = {
  // Expose the mock schema table for service calls like `db.insert(db.orders)`
  orders: mockOrdersTable,

  // Mock `insert` method
  insert: jest.fn((table: any) => {
    return {
      values: jest.fn((values: any[]) => {
        const newRecords = values.map(v => {
          const record: MockOrder = {
            id: crypto.randomUUID(),
            tenant_id: v.tenant_id || MOCK_TENANT_ID,
            created_at: new Date(),
            updated_at: new Date(),
            ...v,
            amount: v.amount.toString(), // Ensure amount is string for numeric type
          };
          mockOrders.push(record);
          return record;
        });
        return {
          returning: jest.fn(() => newRecords),
        };
      }),
    };
  }),

  // Mock 'select' method
  select: jest.fn((columns: any[]) => {
    return {
      from: jest.fn((table: any) => {
        return {
          where: jest.fn((condition: any) => {
            let filteredOrders = [...mockOrders];

            // Helper to evaluate conditions
            const evaluateCondition = (order: MockOrder, cond: any): boolean => {
              if (cond.type === 'eq') {
                const columnValue = (order as any)[cond.left.column.name];
                return columnValue == cond.right.value; // Use == for loose comparison as types might differ
              } else if (cond.type === 'and') {
                return cond._.expressions.every((expr: any) => evaluateCondition(order, expr));
              }
              return false; // Unknown condition type
            };

            if (condition) {
              filteredOrders = filteredOrders.filter(order => evaluateCondition(order, condition));
            }

            return {
              limit: jest.fn(() => ({ // Allow for limit, though not strictly needed for these E2E tests
                execute: jest.fn(() => filteredOrders),
              })),
              execute: jest.fn(() => filteredOrders),
            };
          }),
          execute: jest.fn(() => mockOrders), // If no where clause, return all
        };
      }),
    };
  }),

  // Mock 'update' method
  update: jest.fn((table: any) => {
    return {
      set: jest.fn((values: any) => {
        return {
          where: jest.fn((condition: any) => {
            const updatedRecords: MockOrder[] = [];

            // Helper to evaluate conditions (same as select)
            const evaluateCondition = (order: MockOrder, cond: any): boolean => {
              if (cond.type === 'eq') {
                const columnValue = (order as any)[cond.left.column.name];
                return columnValue == cond.right.value;
              } else if (cond.type === 'and') {
                return cond._.expressions.every((expr: any) => evaluateCondition(order, expr));
              }
              return false;
            };

            for (let i = 0; i < mockOrders.length; i++) {
              const currentOrder = mockOrders[i];
              if (currentOrder && evaluateCondition(currentOrder, condition)) {
                const updatedOrder = { ...currentOrder, ...values, updated_at: new Date() } as MockOrder;
                mockOrders[i] = updatedOrder; // Update in place
                updatedRecords.push(updatedOrder);
              }
            }
            return {
              returning: jest.fn(() => updatedRecords),
            };
          }),
        };
      }),
    };
  }),

  // Expose mock functions for Drizzle's eq and and
  eq: mockEq,
  and: mockAnd,
};

describe('AggregatorController (e2e)', () => {
  let app: INestApplication;
  let httpClient: any;

  beforeEach(async () => {
    // Clear mock database before each test
    mockOrders.splice(0, mockOrders.length);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AggregatorModule],
    })
      .overrideProvider('DATABASE') // This matches the @Inject('DATABASE') token
      .useValue(mockDb) // Provide our mock database
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // Ensure validation pipes are active
    await app.init();
    httpClient = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  // --- Test Cases ---

  it('should process a DoorDash webhook and create an internal order with source_platform=doordash', async () => {
    const doordashWebhookPayload = {
      event_name: 'ORDER_PLACED',
      store_id: 'dd_store_123',
      order_id: 'dd_order_abc-123',
      consumer: {
        id: 'dd_consumer_1',
      },
      line_items: [
        { item_price: 1000 }, // $10.00
        { item_price: 500 },  // $5.00
      ],
      fees: {
        delivery_fee: 200,    // $2.00
        service_fee: 100,     // $1.00
      },
      subtotal_amount: 1500,  // $15.00
      total_amount: 1800,     // $18.00 (1500 + 200 + 100)
      currency: 'USD',
    };

    const response = await httpClient
      .post('/aggregator/webhook/doordash')
      .set('x-tenant-id', MOCK_TENANT_ID) // Simulate tenant ID from auth guard
      .send(doordashWebhookPayload)
      .expect(201);

    expect(response.body).toEqual({
      message: 'Webhook processed successfully',
      orderId: expect.any(String),
      externalOrderId: doordashWebhookPayload.order_id,
    });

    expect(mockOrders.length).toBe(1);
    const createdOrder = mockOrders[0]!;
    expect(createdOrder.tenant_id).toBe(MOCK_TENANT_ID);
    expect(createdOrder.source_platform).toBe('doordash');
    expect(createdOrder.external_order_id).toBe(doordashWebhookPayload.order_id);
    expect(createdOrder.amount).toBe(doordashWebhookPayload.total_amount.toString()); // Amount should be total_amount from payload
    expect(createdOrder.status).toBe('pending');
  });

  it('should process an Uber Eats webhook and create an internal order with source_platform=ubereats', async () => {
    const uberEatsWebhookPayload = {
      event_type: 'orders.create',
      meta: {
        resource_id: 'ue_order_xyz-456',
        user_id: 'ue_user_2',
      },
      data: {
        order: {
          id: 'ue_order_xyz-456',
          current_state: 'CREATED',
          display_id: 'UE-12345',
          eater: {
            id: 'ue_eater_abc',
          },
          payments: [
            {
              id: 'payment_1',
              amount: {
                total_charge: {
                  amount: 2575, // $25.75
                  currency_code: 'USD',
                  formatted_amount: '$25.75',
                },
              },
            },
          ],
        },
      },
    };

    const response = await httpClient
      .post('/aggregator/webhook/ubereats')
      .set('x-tenant-id', MOCK_TENANT_ID) // Simulate tenant ID from auth guard
      .send(uberEatsWebhookPayload)
      .expect(201);

    expect(response.body).toEqual({
      message: 'Webhook processed successfully',
      orderId: expect.any(String),
      externalOrderId: uberEatsWebhookPayload.data.order.id,
    });

    expect(mockOrders.length).toBe(1);
    const createdOrder = mockOrders[0]!;
    expect(createdOrder.tenant_id).toBe(MOCK_TENANT_ID);
    expect(createdOrder.source_platform).toBe('ubereats');
    expect(createdOrder.external_order_id).toBe(uberEatsWebhookPayload.data.order.id);
    expect(createdOrder.amount).toBe(uberEatsWebhookPayload.data.order.payments[0].amount.total_charge.amount.toString());
    expect(createdOrder.status).toBe('pending');
  });

  it('should mark an existing DoorDash order as cancelled when a cancellation webhook is received', async () => {
    const externalOrderId = 'dd_order_cancel-789';
    const initialAmount = 2000;

    // 1. Create an initial order
    await httpClient
      .post('/aggregator/webhook/doordash')
      .set('x-tenant-id', MOCK_TENANT_ID)
      .send({
        event_name: 'ORDER_PLACED',
        store_id: 'dd_store_123',
        order_id: externalOrderId,
        total_amount: initialAmount,
        currency: 'USD',
      })
      .expect(201);

    expect(mockOrders.length).toBe(1);
    expect(mockOrders[0].external_order_id).toBe(externalOrderId);
    expect(mockOrders[0].status).toBe('pending');
    const initialCreatedAt = mockOrders[0].created_at;

    // 2. Send cancellation webhook for the same order
    const cancellationPayload = {
      event_name: 'ORDER_CANCELED',
      store_id: 'dd_store_123',
      order_id: externalOrderId,
      total_amount: initialAmount,
      currency: 'USD',
    };

    const response = await httpClient
      .post('/aggregator/webhook/doordash')
      .set('x-tenant-id', MOCK_TENANT_ID)
      .send(cancellationPayload)
      .expect(200); // Expect 200 OK for an update

    expect(response.body).toEqual({
      message: 'Webhook processed successfully',
      orderId: expect.any(String), // The ID of the updated order
      externalOrderId: externalOrderId,
    });

    expect(mockOrders.length).toBe(1); // Still only one order
    const updatedOrder = mockOrders[0]!;
    expect(updatedOrder.external_order_id).toBe(externalOrderId);
    expect(updatedOrder.source_platform).toBe('doordash');
    expect(updatedOrder.status).toBe('cancelled');
    expect(updatedOrder.created_at).toEqual(initialCreatedAt); // Created date should be the same
    expect(updatedOrder.updated_at.getTime()).toBeGreaterThan(initialCreatedAt.getTime()); // Updated date should be newer
  });

  it('should return 400 Bad Request for an unknown platform webhook', async () => {
    const unknownWebhookPayload = {
      some_event: 'data',
      id: 'unknown_order_123',
    };

    const response = await httpClient
      .post('/aggregator/webhook/unknown_platform')
      .set('x-tenant-id', MOCK_TENANT_ID)
      .send(unknownWebhookPayload)
      .expect(400);

    expect(response.body.message).toContain('Unsupported platform');
  });

  it('should handle duplicate webhooks idempotently for DoorDash (no new order, no redundant status change)', async () => {
    const externalOrderId = 'dd_order_idempotent-456';
    const doordashWebhookPayload = {
      event_name: 'ORDER_PLACED',
      store_id: 'dd_store_123',
      order_id: externalOrderId,
      total_amount: 3000,
      currency: 'USD',
    };

    // 1. Send initial webhook
    const initialResponse = await httpClient
      .post('/aggregator/webhook/doordash')
      .set('x-tenant-id', MOCK_TENANT_ID)
      .send(doordashWebhookPayload)
      .expect(201);

    expect(mockOrders.length).toBe(1);
    const firstOrder = mockOrders[0]!;
    expect(firstOrder.external_order_id).toBe(externalOrderId);
    expect(firstOrder.status).toBe('pending');
    expect(initialResponse.body.orderId).toBe(firstOrder.id);
    const initialUpdatedAt = firstOrder.updated_at;

    // 2. Send the exact same webhook again
    const duplicateResponse = await httpClient
      .post('/aggregator/webhook/doordash')
      .set('x-tenant-id', MOCK_TENANT_ID)
      .send(doordashWebhookPayload)
      .expect(200); // Expect 200 OK, indicating it was handled

    expect(duplicateResponse.body).toEqual({
      message: 'Webhook processed successfully',
      orderId: firstOrder.id, // Should return the ID of the existing order
      externalOrderId: externalOrderId,
    });

    // Verify no new order was created
    expect(mockOrders.length).toBe(1);
    const secondOrder = mockOrders[0]!; // Still the same order
    expect(secondOrder.id).toBe(firstOrder.id);
    expect(secondOrder.external_order_id).toBe(externalOrderId);
    expect(secondOrder.status).toBe('pending'); // Should still be pending

    // If no meaningful data changed (like status), updated_at should ideally not change.
    // However, if the service performs an UPDATE query regardless, Drizzle's `updated_at` might be set by a database trigger/default.
    // The crucial part is that no *new* record is created and no *incorrect* state change occurs.
    expect(secondOrder.updated_at).toEqual(initialUpdatedAt);
  });
});
