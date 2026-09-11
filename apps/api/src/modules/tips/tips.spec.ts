/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-011 -- Tip Management
 * FILE TYPE:    TEST
 * MODULE:       tips
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Business rules preserved from original test (1:1 mapping):
 *   1. PUT /orders/:orderId/tips â†’ create tip when none exists
 *   2. PUT /orders/:orderId/tips â†’ update existing tip
 *   3. GET /orders/:orderId/tips â†’ return tip
 *   4. GET /orders/:orderId/tips â†’ 404 if not found
 *   5. PUT validation: reject invalid amount / currency / missing fields
 *   6. PUT/GET: reject invalid orderId UUID format
 *
 * Contract alignment after module consolidation:
 *   - TipsService.upsertTip() uses db.execute(sql`...`) â€” not query.tips
 *   - DB token is 'DATABASE' â€” not PG_CONNECTION
 *   - CreateUpdateTipDto (from ./dto/tip.dto) has: amount, currencyCode, recipientEntityId
 *   - AuditLogService methods: logAuditAction, logActivity, record
 *   - tenantId injected via req.user middleware (no JwtAuthGuard to override)
 */

import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import { TipsModule } from './tips.module';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateUpdateTipDto } from './dto/tip.dto';

// â”€â”€â”€ DB Mock â€” TipsService exclusively uses db.execute(sql`...`) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// First call: SELECT (checking if tip exists) â†’ rows[]
// Subsequent calls: INSERT or UPDATE
const mockDrizzleDb = {
  execute: jest.fn(),
};

// â”€â”€â”€ AuditLogService Mock â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const mockAuditLogService = {
  logAuditAction: jest.fn(),
  logActivity: jest.fn(),
  record: jest.fn(),
};

// â”€â”€â”€ Shared test fixtures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tenantId  = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
const orderId   = '00000000-0000-0000-0000-000000000001';
const tipId     = '00000000-0000-0000-0000-000000000002';

describe('TipsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TipsModule],
    })
      .overrideProvider('DATABASE')
      .useValue(mockDrizzleDb)
      .overrideProvider(AuditLogService)
      .useValue(mockAuditLogService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Inject req.user with tenantId â€” mirrors what JwtAuthGuard does in production
    app.use((req: any, _res: any, next: () => void) => {
      req.user = { tenantId };
      next();
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }));
    await app.listen(0);
  });

  afterAll(async () => {
    await app.close();
  });

  // â”€â”€â”€ Business Rule 1: Create tip when none exists â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('PUT /orders/:orderId/tips should create a tip if none exists', async () => {
    const createTipDto: CreateUpdateTipDto = {
      amount: 10.50,
      currencyCode: 'USD',
      recipientEntityId: '00000000-0000-0000-0000-000000000099',
    };

    // First execute: SELECT finds no existing tip
    // Second execute: INSERT succeeds
    // Third execute: UPDATE orders table
    mockDrizzleDb.execute
      .mockResolvedValueOnce({ rows: [] })          // SELECT tip â†’ none exists
      .mockResolvedValueOnce({ rows: [] })          // INSERT tip â†’ success
      .mockResolvedValueOnce({ rows: [] });         // UPDATE orders total â†’ success

    const response = await request(app.getHttpServer())
      .put(`/orders/${orderId}/tips`)
      .send(createTipDto)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toEqual((createTipDto as any).amount);
    expect(response.body.currencyCode).toEqual('USD');
    expect(mockDrizzleDb.execute).toHaveBeenCalled();
    expect(mockAuditLogService.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        action: 'CREATE_TIP',
      }),
    );
  });

  // â”€â”€â”€ Business Rule 2: Update an existing tip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('PUT /orders/:orderId/tips should update an existing tip', async () => {
    const updateTipDto: CreateUpdateTipDto = {
      amount: 15.75,
      currencyCode: 'EUR',
      recipientEntityId: '00000000-0000-0000-0000-000000000099',
    };

    // First execute: SELECT finds existing tip
    // Second execute: UPDATE existing tip
    // Third execute: UPDATE orders table
    mockDrizzleDb.execute
      .mockResolvedValueOnce({ rows: [{ id: tipId }] }) // SELECT â†’ existing tip found
      .mockResolvedValueOnce({ rows: [] })               // UPDATE tip â†’ success
      .mockResolvedValueOnce({ rows: [] });              // UPDATE orders total

    const response = await request(app.getHttpServer())
      .put(`/orders/${orderId}/tips`)
      .send(updateTipDto)
      .expect(HttpStatus.OK);

    expect(response.body.amount).toEqual((updateTipDto as any).amount);
    expect(response.body.currencyCode).toEqual('EUR');
    expect(mockAuditLogService.logAuditAction).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        action: 'UPDATE_TIP',
      }),
    );
  });

  // â”€â”€â”€ Business Rule 3: GET returns tip when found â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('GET /orders/:orderId/tips should return a tip if found', async () => {
    // TipsService.getTipByOrderId() calls db.execute() â†’ returns single row
    mockDrizzleDb.execute.mockResolvedValueOnce({
      rows: [{
        id: tipId,
        amount_cents: 1234,
        currency: 'JPY',
        method: 'cash',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }],
    });

    const response = await request(app.getHttpServer())
      .get(`/orders/${orderId}/tips`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('id', tipId);
    expect(response.body.amount).toEqual(12.34); // 1234 cents / 100
    expect(mockDrizzleDb.execute).toHaveBeenCalled();
  });

  // â”€â”€â”€ Business Rule 4: GET returns 404 if tip not found â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('GET /orders/:orderId/tips should return 404 if tip not found', async () => {
    mockDrizzleDb.execute.mockResolvedValueOnce({ rows: [] }); // tip not found

    await request(app.getHttpServer())
      .get(`/orders/${orderId}/tips`)
      .expect(HttpStatus.NOT_FOUND)
      .expect((res) => {
        expect(res.body.statusCode).toBe(404);
      });
  });

  // â”€â”€â”€ Business Rule 5a: Reject invalid amount (negative) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('PUT /orders/:orderId/tips should return 400 for invalid input (negative amount)', async () => {
    const invalidDto = {
      amount: -100,
      currencyCode: 'USD',
      recipientEntityId: '00000000-0000-0000-0000-000000000099',
    };

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/tips`)
      .send(invalidDto)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.statusCode).toBe(400);
      });
  });

  // â”€â”€â”€ Business Rule 5b: Reject invalid currency code (wrong length) â”€â”€â”€â”€â”€â”€â”€â”€
  it('PUT /orders/:orderId/tips should return 400 for invalid currency code', async () => {
    const invalidDto = {
      amount: 10,
      currencyCode: 'US', // Invalid: must be exactly 3 chars
      recipientEntityId: '00000000-0000-0000-0000-000000000099',
    };

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/tips`)
      .send(invalidDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  // â”€â”€â”€ Business Rule 5c: Reject missing required fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('PUT /orders/:orderId/tips should return 400 for missing amount field', async () => {
    const invalidDto = {
      currencyCode: 'USD',
      recipientEntityId: '00000000-0000-0000-0000-000000000099',
    };

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/tips`)
      .send(invalidDto)
      .expect(HttpStatus.BAD_REQUEST);
  });

  // â”€â”€â”€ Business Rule 6a: Reject invalid orderId UUID on PUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('PUT /orders/:orderId/tips should return 400 for invalid orderId format', async () => {
    const createTipDto: CreateUpdateTipDto = {
      amount: 10.50,
      currencyCode: 'USD',
      recipientEntityId: '00000000-0000-0000-0000-000000000099',
    };

    await request(app.getHttpServer())
      .put('/orders/invalid-uuid-format/tips')
      .send(createTipDto)
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toContain('Invalid orderId format');
      });
  });

  // â”€â”€â”€ Business Rule 6b: Reject invalid orderId UUID on GET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  it('GET /orders/:orderId/tips should return 400 for invalid orderId format', async () => {
    await request(app.getHttpServer())
      .get('/orders/invalid-uuid-format/tips')
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toContain('Invalid orderId format');
      });
  });
});

