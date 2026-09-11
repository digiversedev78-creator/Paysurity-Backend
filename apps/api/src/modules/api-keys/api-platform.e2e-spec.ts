import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
export class AppModule {}
import { sign } from 'jsonwebtoken';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as crypto from 'crypto';
import * as http from 'http';
import { AddressInfo } from 'net';

// Mock Drizzle table structure for necessary columns
// These would typically come from your actual Drizzle schema definitions.
// We define them here minimally for the mock DB.

type MockPgColumn<TName extends string, TData> = {
  name: TName;
  internalName: TName; // Used by our simple `eq` helper
  _brand: 'PgColumn';
  _type: TData;
};

const uuid = (name: string): MockPgColumn<typeof name, string> => ({
  name,
  internalName: name,
  _brand: 'PgColumn',
  _type: 'string',
});

const text = (name: string): MockPgColumn<typeof name, string> => ({
  name,
  internalName: name,
  _brand: 'PgColumn',
  _type: 'string',
});

const boolean = (name: string): MockPgColumn<typeof name, boolean> => ({
  name,
  internalName: name,
  _brand: 'PgColumn',
  _type: 'boolean' as any,
});

const timestamp = (name: string): MockPgColumn<typeof name, Date> => ({
  name,
  internalName: name,
  _brand: 'PgColumn',
  _type: 'Date' as any,
});

// Minimal table object for mock DB context
type MockPgTable<TColumns extends Record<string, MockPgColumn<any, any>>> = {
  id: TColumns['id'];
  tenantId?: TColumns['tenantId']; // tenantId might not be on all tables, but typically on multi-tenant
  [key: string]: any;
};

// Interface for in-memory data records
interface ApiKeyRecord {
  id: string;
  tenantId: string;
  key: string;
  secret: string;
  isRevoked: boolean;
  createdAt: Date;
}

interface WebhookRecord {
  id: string;
  tenantId: string;
  url: string;
  secret: string;
  events: string[];
  createdAt: Date;
}

interface WebhookDeliveryRecord {
  id: string;
  webhookId: string;
  tenantId: string;
  payload: string; // Stored as string, parsed when needed
  status: string;
  statusCode: string;
  response: string;
  deliveredAt: Date;
  signature: string; // The signature sent in the header
}

// Mock Drizzle table definitions
const apiKeys: any = {
  id: uuid('id'),
  tenantId: uuid('tenant_id'),
  key: text('key'),
  secret: text('secret'),
  isRevoked: boolean('is_revoked'),
  createdAt: timestamp('created_at'),
  get internalName() { return 'api_keys'; } // Used for identifying table in mock
};

const webhooks: any = {
  id: uuid('id'),
  tenantId: uuid('tenant_id'),
  url: text('url'),
  secret: text('secret'),
  events: text('events'), // Drizzle would have a specific array type, but mock it as generic 'text'
  createdAt: timestamp('created_at'),
  get internalName() { return 'webhooks'; }
};

const webhookDeliveries: any = {
  id: uuid('id'),
  webhookId: uuid('webhook_id'),
  tenantId: uuid('tenant_id'),
  payload: text('payload'),
  status: text('status'),
  statusCode: text('status_code'),
  response: text('response'),
  deliveredAt: timestamp('delivered_at'),
  signature: text('signature'),
  get internalName() { return 'webhook_deliveries'; }
};

// In-memory data store
const mockApiKeys: ApiKeyRecord[] = [];
const mockWebhooks: WebhookRecord[] = [];
const mockWebhookDeliveries: WebhookDeliveryRecord[] = [];

// Simple mock for Drizzle's `eq` and `and` helpers
const eq = <T>(column: MockPgColumn<any, T>, value: T) => ({
  type: 'eq',
  column: column.internalName,
  value,
});

const and = (...conditions: any[]) => ({
  type: 'and',
  conditions,
});

// Mock Drizzle NodePgDatabase
class MockDrizzleDb {
  private readonly data: {
    api_keys: ApiKeyRecord[];
    webhooks: WebhookRecord[];
    webhook_deliveries: WebhookDeliveryRecord[];
  };
  private currentTable: string | null = null;
  private currentWhereConditions: any[] = [];

  constructor() {
    this.data = {
      api_keys: mockApiKeys,
      webhooks: mockWebhooks,
      webhook_deliveries: mockWebhookDeliveries,
    };
  }

  select(columns?: any) {
    // In a real mock, columns would be filtered. For simplicity, we return full objects.
    return this;
  }

  from(table: MockPgTable<any>) {
    this.currentTable = table.internalName;
    this.currentWhereConditions = []; // Reset conditions for new query
    return this;
  }

  where(condition: any) {
    this.currentWhereConditions = [condition];
    return this;
  }

  andWhere(condition: any) {
    this.currentWhereConditions.push(condition);
    return this;
  }

  private applyConditions(records: any[], conditions: any[]): any[] {
    if (!conditions || conditions.length === 0) {
      return records;
    }

    // Handle `and` condition specifically if it's the top-level
    const topLevelConditions = conditions.flatMap(cond => cond.type === 'and' ? cond.conditions : cond);

    return records.filter(record => {
      const evaluateCondition = (cond: any): boolean => {
        if (cond.type === 'eq') {
          return record[cond.column] === cond.value;
        } else if (cond.type === 'and') {
          return cond.conditions.every((subCond: any) => evaluateCondition(subCond));
        }
        return false;
      };
      return topLevelConditions.every(cond => evaluateCondition(cond));
    });
  }

  async execute(): Promise<any[]> {
    const tableData = this.data[this.currentTable as keyof typeof this.data];
    if (!tableData) {
      throw new Error(`Mock table ${this.currentTable} not found.`);
    }
    const result = this.applyConditions(tableData, this.currentWhereConditions);
    this.currentTable = null; // Reset
    this.currentWhereConditions = []; // Reset
    return result;
  }

  async insert(table: MockPgTable<any>, values: any) {
    const tableData = this.data[table.internalName as keyof typeof this.data];
    if (!tableData) {
      throw new Error(`Mock table ${table.internalName} not found.`);
    }
    // Drizzle insert returns an array of inserted values, typically just one
    const newRecord = { ...values, id: values.id || crypto.randomUUID(), createdAt: new Date() };
    tableData.push(newRecord);
    return { returning: [newRecord] };
  }

  async update(table: MockPgTable<any>, values: any) {
    const tableData = this.data[table.internalName as keyof typeof this.data];
    if (!tableData) {
      throw new Error(`Mock table ${table.internalName} not found.`);
    }

    const recordsToUpdate = this.applyConditions(tableData, this.currentWhereConditions);
    recordsToUpdate.forEach(record => {
      Object.assign(record, values);
    });
    this.currentTable = null; // Reset
    this.currentWhereConditions = []; // Reset
    return { returning: recordsToUpdate };
  }

  async delete(table: MockPgTable<any>) {
    const tableData = this.data[table.internalName as keyof typeof this.data];
    if (!tableData) {
      throw new Error(`Mock table ${table.internalName} not found.`);
    }

    const recordsToDelete = this.applyConditions(tableData, this.currentWhereConditions);
    recordsToDelete.forEach(recordToDelete => {
      const index = tableData.indexOf(recordToDelete);
      if (index > -1) {
        tableData.splice(index, 1);
      }
    });
    this.currentTable = null; // Reset
    this.currentWhereConditions = []; // Reset
    return { returning: recordsToDelete };
  }
}

// Helper to clear all mock data
const clearMockDb = () => {
  mockApiKeys.splice(0, mockApiKeys.length);
  mockWebhooks.splice(0, mockWebhooks.length);
  mockWebhookDeliveries.splice(0, mockWebhookDeliveries.length);
};

// --- JWT and Constants ---
const TEST_TENANT_ID = 'e9e8e7e6-e5e4-e3e2-e1e0-d9d8d7d6d5d4'; // Example UUID
const TEST_JWT_SECRET = 'aStrongSecretForTestingJwtSignatures'; // Must match app's secret
// TEST_API_KEY_SECRET is typically a tenant-specific or global secret used for API key signing/validation,
// but for E2E tests, we primarily check if the API key mechanism allows/denies access.

const generateJwtToken = (tenantId: string) => {
  return sign({ tenantId, sub: 'test-user', roles: ['admin'] }, TEST_JWT_SECRET, { expiresIn: '1h' });
};

// --- Webhook Receiver Mock ---
interface ReceivedWebhookRequest {
  url: string;
  method: string;
  headers: http.IncomingHttpHeaders;
  body: any;
}

let receivedWebhookRequests: ReceivedWebhookRequest[] = [];
let mockWebhookServer: http.Server;
let mockWebhookServerPort: number;

const startMockWebhookServer = async () => {
  return new Promise<void>((resolve) => {
    mockWebhookServer = http.createServer((req, res) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          receivedWebhookRequests.push({
            url: req.url || '/',
            method: req.method || 'GET',
            headers: req.headers,
            body: JSON.parse(body),
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'received' }));
        } catch (error) {
          console.error('Error parsing webhook body or handling request:', error);
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Failed to process webhook' }));
        }
      });
    });

    mockWebhookServer.listen(0, () => { // Listen on a random available port
      mockWebhookServerPort = (mockWebhookServer.address() as AddressInfo).port;
      // console.log(`Mock Webhook Server listening on port ${mockWebhookServerPort}`); // Only for debugging
      resolve();
    });
  });
};

const stopMockWebhookServer = async () => {
  return new Promise<void>((resolve, reject) => {
    if (mockWebhookServer) {
      mockWebhookServer.close(err => {
        if (err) return reject(err);
        // console.log('Mock Webhook Server stopped.'); // Only for debugging
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// --- Test Suite ---
describe('ApiPlatform (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let mockDb: MockDrizzleDb; // Declare mockDb here

  beforeAll(async () => {
    await startMockWebhookServer();

    // Initialize mockDb before overriding in Nest's testing module
    mockDb = new MockDrizzleDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NodePgDatabase) // Assuming the app uses `NodePgDatabase` directly
      .useValue(mockDb) // Provide the mock instance
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authToken = generateJwtToken(TEST_TENANT_ID);
  });

  beforeEach(async () => {
    // Clear data before each test
    clearMockDb();
    receivedWebhookRequests = [];
  });

  afterAll(async () => {
    await app.close();
    await stopMockWebhookServer();
  });

  // --- Test Case 1: POST /api-keys/generate returns key+secret (secret shown once) ---
  it('should generate an API key with key and secret, and secret should not be visible on subsequent fetches', async () => {
    const generateRes = await request(app.getHttpServer())
      .post('/api-keys/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    const { id, key, secret } = generateRes.body;
    expect(id).toBeDefined();
    expect(key).toBeDefined();
    expect(secret).toBeDefined(); // Secret should be present on creation
    expect(typeof key).toBe('string');
    expect(typeof secret).toBe('string');

    // Assert that key is stored in mock DB
    const storedKey = (await mockDb.select().from(apiKeys).where(eq(apiKeys.id, id)).execute())[0];
    expect(storedKey).toBeDefined();
    expect(storedKey.key).toBe(key);
    expect(storedKey.secret).toBe(secret); // Stored secret should be the raw one

    // Fetch the API key again (e.g., via a GET /api-keys)
    // Assuming a GET /api-keys endpoint exists to list keys for a tenant
    const listRes = await request(app.getHttpServer())
      .get('/api-keys') // Assuming this endpoint exists for listing keys
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const fetchedKey = listRes.body.find((k: any) => k.id === id);
    expect(fetchedKey).toBeDefined();
    expect(fetchedKey.key).toBe(key);
    expect(fetchedKey.secret).toBeUndefined(); // Secret should NOT be present on subsequent fetches
  });

  // --- Test Case 2: Test rate limit enforced after threshold ---
  it('should enforce rate limit for API key generation after threshold', async () => {
    // This test assumes a rate limit is active for this endpoint.
    // For a real-world scenario, you might have to configure a very low rate limit for tests.
    // Let's assume a reasonable limit like 5 requests in a short period.
    const RATE_LIMIT_THRESHOLD = 5; // Example threshold, adjust based on actual app config

    for (let i = 0; i < RATE_LIMIT_THRESHOLD; i++) {
      await request(app.getHttpServer())
        .post('/api-keys/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201); // Expect success for requests below threshold
    }

    // The (THRESHOLD + 1)th request should be rate-limited
    await request(app.getHttpServer())
      .post('/api-keys/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(429); // Expect Too Many Requests
  });

  // --- Test Case 3: Test webhook registered + test-fired + delivery logged ---
  it('should allow registering a webhook, test-firing it, and log the delivery', async () => {
    const webhookSecret = crypto.randomBytes(32).toString('hex');
    const webhookUrl = `http://127.0.0.1:${mockWebhookServerPort}/webhook-receiver`;
    const events = ['payment.completed', 'payment.failed'];

    // 1. Register webhook
    const registerRes = await request(app.getHttpServer())
      .post('/webhooks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        url: webhookUrl,
        secret: webhookSecret,
        events: events,
      })
      .expect(201);

    const { id: webhookId } = registerRes.body;
    expect(webhookId).toBeDefined();

    // Assert webhook is stored in mock DB
    const storedWebhook = (await mockDb.select().from(webhooks).where(eq(webhooks.id, webhookId)).execute())[0];
    expect(storedWebhook).toBeDefined();
    expect(storedWebhook.url).toBe(webhookUrl);
    expect(storedWebhook.secret).toBe(webhookSecret);
    expect(storedWebhook.events).toEqual(events);

    // 2. Test-fire webhook
    await request(app.getHttpServer())
      .post(`/webhooks/${webhookId}/test-fire`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Give a short moment for the async webhook delivery to happen
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert mock webhook server received the request
    expect(receivedWebhookRequests.length).toBe(1);
    const receivedRequest = receivedWebhookRequests[0];
    expect(receivedRequest.url).toBe('/webhook-receiver');
    expect(receivedRequest.method).toBe('POST');
    expect(receivedRequest.body).toEqual({
      type: 'test.event',
      data: { message: 'This is a test webhook payload.' },
    });

    // Assert delivery is logged in mock DB
    const deliveries = await mockDb.select().from(webhookDeliveries).where(eq(webhookDeliveries.webhookId, webhookId)).execute();
    expect(deliveries.length).toBe(1);
    const delivery = deliveries[0];
    expect(delivery.webhookId).toBe(webhookId);
    expect(delivery.tenantId).toBe(TEST_TENANT_ID);
    expect(delivery.status).toBe('success');
    expect(delivery.statusCode).toBe('200');
    expect(JSON.parse(delivery.payload)).toEqual({
      type: 'test.event',
      data: { message: 'This is a test webhook payload.' },
    });
    expect(delivery.response).toContain('received'); // Response from mock server
    expect(delivery.signature).toBeDefined();
  });

  // --- Test Case 4: Test webhook HMAC signature on delivery ---
  it('should deliver webhooks with a valid HMAC signature', async () => {
    const webhookSecret = 'supersecretwebhookkey';
    const webhookUrl = `http://127.0.0.1:${mockWebhookServerPort}/signed-webhook-receiver`;
    const events = ['test.signed'];

    const registerRes = await request(app.getHttpServer())
      .post('/webhooks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        url: webhookUrl,
        secret: webhookSecret,
        events: events,
      })
      .expect(201);

    const { id: webhookId } = registerRes.body;

    await request(app.getHttpServer())
      .post(`/webhooks/${webhookId}/test-fire`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 100)); // Allow async delivery

    expect(receivedWebhookRequests.length).toBe(1);
    const receivedRequest = receivedWebhookRequests[0];
    const signatureHeader = receivedRequest.headers['x-paysurity-signature'] as string;
    expect(signatureHeader).toBeDefined();

    // The header typically comes as `t=timestamp,v1=signature`. We need to parse it.
    const parts = signatureHeader.split(',');
    const v1Part = parts.find(part => part.startsWith('v1='));
    expect(v1Part).toBeDefined();
    const deliveredSignature = v1Part!.substring(3);

    const payloadBuffer = Buffer.from(JSON.stringify(receivedRequest.body), 'utf8');
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payloadBuffer).digest('hex');

    expect(deliveredSignature).toBe(expectedSignature);

    // Also assert delivery record has the signature
    const deliveries = await mockDb.select().from(webhookDeliveries).where(eq(webhookDeliveries.webhookId, webhookId)).execute();
    expect(deliveries.length).toBe(1);
    const delivery = deliveries[0];
    expect(delivery.signature).toContain(deliveredSignature); // Should contain the 'v1=' prefixed signature
  });

  // --- Test Case 5: DELETE revokes key immediately ---
  it('should revoke an API key immediately upon deletion and prevent its use', async () => {
    // 1. Generate an API key
    const generateRes = await request(app.getHttpServer())
      .post('/api-keys/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    const { id: apiKeyId, key: generatedApiKey } = generateRes.body;
    expect(apiKeyId).toBeDefined();
    expect(generatedApiKey).toBeDefined();

    // Assert key is active in DB
    let storedKey = (await mockDb.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId)).execute())[0];
    expect(storedKey.isRevoked).toBe(false);

    // 2. Delete/Revoke the API key
    await request(app.getHttpServer())
      .delete(`/api-keys/${apiKeyId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204); // No Content on successful deletion

    // Assert key is marked as revoked in DB
    storedKey = (await mockDb.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId)).execute())[0];
    expect(storedKey).toBeDefined();
    expect(storedKey.isRevoked).toBe(true);

    // 3. Try to use the revoked API key to access a protected endpoint
    // This requires the application to have an API Key authentication guard.
    // Assuming /api-keys/generate is also protected by an API Key guard if X-API-KEY header is present.
    await request(app.getHttpServer())
      .post('/api-keys/generate') // Attempt to use the revoked key
      .set('X-API-KEY', generatedApiKey) // Pass the revoked API key in header
      .expect(401); // Expect Unauthorized or Forbidden when using revoked API key

    // Ensure the original JWT token still works (not affected by API key revocation)
    await request(app.getHttpServer())
      .post('/api-keys/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201); // JWT token still works, only API key is revoked
  });
});
