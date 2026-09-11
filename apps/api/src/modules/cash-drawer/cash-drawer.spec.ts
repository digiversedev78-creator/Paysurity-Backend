/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-012 -- Cash Drawer Management
 * FILE TYPE:    TEST
 * MODULE:       cash-drawer
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-085
 * GENERATED:    2026-03-17T13:10:40.375Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { CashDrawerModule } from './cash-drawer.module';
import { CashDrawerService } from './cash-drawer.service';
import { AuditLogService } from '../audit-log/audit-log.service' // fixed;
import { PG_CONNECTION } from '../db/drizzle.config';
import { CreateCashDrawerDto, UpdateCashDrawerDto, DepositWithdrawalDto, CloseCashDrawerDto, CashDrawerState, CashDrawerTransactionType } from './dto/cash-drawer.dto';
import { AuthGuard } from '@nestjs/passport';

// Mocks for Drizzle and AuditLogService for demonstration purposes.
// These would typically be in separate files like 'src/test/mocks'.
import { pgTable, uuid, text, numeric, timestamp, varchar } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

// Drizzle Schema Definitions (repeated for test file clarity, normally imported)
const cashDrawers = pgTable('cash_drawers', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  locationId: uuid('location_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
const cashDrawerTransactions = pgTable('cash_drawer_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  cashDrawerId: uuid('cash_drawer_id').references(() => cashDrawers.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  newBalance: numeric('new_balance', { precision: 12, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  description: text('description'),
});
type CashDrawer = InferSelectModel<typeof cashDrawers>;
type CashDrawerTransaction = InferSelectModel<typeof cashDrawerTransactions>;

class MockdbConnection {
  private cashDrawers: CashDrawer[] = [];
  private cashDrawerTransactions: CashDrawerTransaction[] = [];

  query = {
    cashDrawers: {
      findMany: (options?: { where?: any }) => {
        const tenantId = options?.where && options.where[Object.keys(options.where)[0]] && options.where[Object.keys(options.where)[0]]._value;
        return this.cashDrawers.filter(d => tenantId ? d.tenantId === tenantId : true);
      },
      findFirst: (options?: { where?: any }) => {
        const conditions = options?.where?.$and || [];
        let id: string | undefined;
        let tenantId: string | undefined;
        for (const condition of conditions) {
          if (condition.left.columnName === 'id') id = condition.right._value;
          if (condition.left.columnName === 'tenant_id') tenantId = condition.right._value;
        }
        return this.cashDrawers.find(d => (id ? d.id === id : true) && (tenantId ? d.tenantId === tenantId : true));
      }
    },
    cashDrawerTransactions: {
      findMany: (options?: { where?: any }) => {
        const conditions = options?.where?.$and || [];
        let tenantId: string | undefined;
        let cashDrawerId: string | undefined;
        for (const condition of conditions) {
          if (condition.left.columnName === 'tenant_id') tenantId = condition.right._value;
          if (condition.left.columnName === 'cash_drawer_id') cashDrawerId = condition.right._value;
        }
        return this.cashDrawerTransactions.filter(
          t => (tenantId ? t.tenantId === tenantId : true) && (cashDrawerId ? t.cashDrawerId === cashDrawerId : true)
        );
      }
    }
  };

  insert<T extends { tenantId: string }>(table: any, values: T | T[]): { returning: () => T[] } {
    const records = Array.isArray(values) ? values : [values];
    records.forEach((record: any) => {
      if (table.name === 'cash_drawers' && !record.id) {
        record.id = 'mock-drawer-' + Math.random().toString(36).substring(2, 15);
        record.createdAt = new Date();
        record.updatedAt = new Date();
        record.status = record.status || 'OPEN';
        this.cashDrawers.push(record as CashDrawer);
      } else if (table.name === 'cash_drawer_transactions' && !record.id) {
        record.id = 'mock-transaction-' + Math.random().toString(36).substring(2, 15);
        record.timestamp = new Date();
        this.cashDrawerTransactions.push(record as CashDrawerTransaction);
      }
    });
    return { returning: () => records };
  }

  update(table: any) {
    return {
      set: (values: Partial<CashDrawer>) => {
        return {
          where: (condition: any) => {
            const conditions = condition.$and || [];
            let id: string | undefined;
            let tenantId: string | undefined;
            for (const cond of conditions) {
              if (cond.left.columnName === 'id') id = cond.right._value;
              if (cond.left.columnName === 'tenant_id') tenantId = cond.right._value;
            }
            const index = this.cashDrawers.findIndex(d => d.id === id && d.tenantId === tenantId);
            if (index !== -1) {
              const currentDrawer = this.cashDrawers[index];
              this.cashDrawers[index] = {
                ...currentDrawer,
                ...values,
                updatedAt: new Date(),
                balance: values.balance !== undefined ? parseFloat(values.balance as string).toFixed(2) : currentDrawer.balance,
              };
              return { returning: () => [this.cashDrawers[index]] };
            }
            return { returning: () => [] };
          }
        };
      }
    };
  }

  transaction = async (callback: (tx: MockdbConnection) => Promise<any>) => {
    return callback(this);
  };

  reset() {
    this.cashDrawers = [];
    this.cashDrawerTransactions = [];
  }
}
// --- End Mocks Definitions ---

describe('CashDrawerController (e2e)', () => {
  let app: INestApplication;
  let cashDrawerService: CashDrawerService;
  let auditLogService: jest.Mocked<any>;
  let mockDbConnection: MockdbConnection;

  const tenantId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const userId = 'user-test-id';
  const mockJwtToken = 'mock-jwt-token';

  const mockAuthGuard = {
    canActivate: jest.fn((context) => {
      const req = context.switchToHttp().getRequest();
      req.user = { tenantId, userId };
      return true;
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CashDrawerModule],
    })
      .overrideProvider(PG_CONNECTION)
      .useClass(MockdbConnection)
      .overrideProvider(AuditLogService)
      .useValue({ log: jest.fn() })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    cashDrawerService = moduleFixture.get<CashDrawerService>(CashDrawerService);
    auditLogService = moduleFixture.get<AuditLogService>(AuditLogService);
    mockDbConnection = moduleFixture.get<MockdbConnection>(PG_CONNECTION);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnection.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a cash drawer (POST /cash-drawers)', async () => {
    const createDto: CreateCashDrawerDto = {
      terminalId: 'c8728a0b-1f6e-4e4b-9e0a-1a2b3c4d5e6f',
      userId: userId,
      description: 'Test Drawer 1',
      openingBalance: 100.00,
      currency: 'USD',
    };

    const response = await request(app.getHttpServer())
      .post('/cash-drawers')
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toBeDefined();
    expect(response.body.description).toBe((createDto as any).description);
    expect(response.body.balance).toBe((createDto as any).openingBalance.toFixed(2));
    expect(response.body.status).toBe(CashDrawerState.OPEN);
    expect(auditLogService.log).toHaveBeenCalledWith(
      'CREATE_CASH_DRAWER',
      'CashDrawer',
      expect.any(String),
      tenantId,
      userId,
      expect.objectContaining({ description: (createDto as any).description, openingBalance: (createDto as any).openingBalance }),
    );
  });

  it('should get all cash drawers for the tenant (GET /cash-drawers)', async () => {
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: 'test-drawer-1',
        tenantId,
        locationId: 'loc-1',
        name: 'Existing Drawer',
        currency: 'USD',
        balance: '200.00',
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const response = await request(app.getHttpServer())
      .get('/cash-drawers')
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0].tenantId).toBe(tenantId);
    expect(response.body[0].name).toBe('Existing Drawer');
  });

  it('should get a specific cash drawer by ID (GET /cash-drawers/:id)', async () => {
    const drawerId = 'specific-drawer-id';
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-2',
        name: 'Specific Drawer',
        currency: 'EUR',
        balance: '500.00',
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const response = await request(app.getHttpServer())
      .get(`/cash-drawers/${drawerId}`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .expect(HttpStatus.OK);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(drawerId);
    expect(response.body.name).toBe('Specific Drawer');
  });

  it('should return 404 for a non-existent cash drawer (GET /cash-drawers/:id)', async () => {
    const nonExistentId = 'non-existent-id';
    await request(app.getHttpServer())
      .get(`/cash-drawers/${nonExistentId}`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should update a cash drawer (PUT /cash-drawers/:id)', async () => {
    const drawerId = 'update-drawer-id';
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-3',
        name: 'Old Name',
        currency: 'USD',
        balance: '300.00',
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const updateDto: UpdateCashDrawerDto = {
      description: 'New Name',
    };

    const response = await request(app.getHttpServer())
      .put(`/cash-drawers/${drawerId}`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .send(updateDto)
      .expect(HttpStatus.OK);

    expect(response.body).toBeDefined();
    expect(response.body.description).toBe((updateDto as any).description);
    expect(auditLogService.log).toHaveBeenCalledWith(
      'UPDATE_CASH_DRAWER',
      'CashDrawer',
      drawerId,
      tenantId,
      userId,
      expect.objectContaining({ changedFields: expect.arrayContaining(['name', 'status']) }),
    );
  });

  it('should deposit funds into a cash drawer (PATCH /cash-drawers/:id/deposit)', async () => {
    const drawerId = 'deposit-drawer-id';
    const initialBalance = 100.00;
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-4',
        name: 'Deposit Drawer',
        currency: 'USD',
        balance: initialBalance.toFixed(2),
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const depositAmount = 50.00;
    const depositDto: DepositWithdrawalDto = { amount: depositAmount, type: CashDrawerTransactionType.DEPOSIT, reason: 'test deposit', operatorId: userId };

    const response = await request(app.getHttpServer())
      .patch(`/cash-drawers/${drawerId}/deposit`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .send(depositDto)
      .expect(HttpStatus.OK);

    expect(response.body.balance).toBe((initialBalance + depositAmount).toFixed(2));
    expect(auditLogService.log).toHaveBeenCalledWith(
      'CASH_DRAWER_DEPOSIT',
      'CashDrawer',
      drawerId,
      tenantId,
      userId,
      expect.objectContaining({ amount: depositAmount, oldBalance: initialBalance, newBalance: initialBalance + depositAmount }),
    );
  });

  it('should withdraw funds from a cash drawer (PATCH /cash-drawers/:id/withdraw)', async () => {
    const drawerId = 'withdraw-drawer-id';
    const initialBalance = 200.00;
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-5',
        name: 'Withdraw Drawer',
        currency: 'USD',
        balance: initialBalance.toFixed(2),
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const withdrawalAmount = 75.00;
    const withdrawalDto: DepositWithdrawalDto = { amount: withdrawalAmount, type: CashDrawerTransactionType.WITHDRAWAL, reason: 'test withdrawal', operatorId: userId };

    const response = await request(app.getHttpServer())
      .patch(`/cash-drawers/${drawerId}/withdraw`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .send(withdrawalDto)
      .expect(HttpStatus.OK);

    expect(response.body.balance).toBe((initialBalance - withdrawalAmount).toFixed(2));
    expect(auditLogService.log).toHaveBeenCalledWith(
      'CASH_DRAWER_WITHDRAWAL',
      'CashDrawer',
      drawerId,
      tenantId,
      userId,
      expect.objectContaining({ amount: withdrawalAmount, oldBalance: initialBalance, newBalance: initialBalance - withdrawalAmount }),
    );
  });

  it('should prevent withdrawal of insufficient funds', async () => {
    const drawerId = 'insufficient-funds-drawer-id';
    const initialBalance = 50.00;
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-6',
        name: 'Insufficient Funds Drawer',
        currency: 'USD',
        balance: initialBalance.toFixed(2),
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const withdrawalAmount = 100.00;
    const withdrawalDto: DepositWithdrawalDto = { amount: withdrawalAmount, type: CashDrawerTransactionType.WITHDRAWAL, reason: 'test withdrawal', operatorId: userId };

    await request(app.getHttpServer())
      .patch(`/cash-drawers/${drawerId}/withdraw`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .send(withdrawalDto)
      .expect(HttpStatus.BAD_REQUEST)
      .expect({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Insufficient funds in cash drawer for withdrawal.',
        error: 'Bad Request',
      });

    expect(auditLogService.log).not.toHaveBeenCalledWith(
      'CASH_DRAWER_WITHDRAWAL',
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.any(Object),
    );
  });

  it('should close a cash drawer (PATCH /cash-drawers/:id/close)', async () => {
    const drawerId = 'close-drawer-id';
    const initialBalance = 300.00;
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-7',
        name: 'Close Me Drawer',
        currency: 'USD',
        balance: initialBalance.toFixed(2),
        status: CashDrawerState.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const finalBalance = 299.50;
    const closeDto: CloseCashDrawerDto = { actualClosingBalance: finalBalance, operatorId: userId, notes: 'closing drawer' };

    const response = await request(app.getHttpServer())
      .patch(`/cash-drawers/${drawerId}/close`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .send(closeDto)
      .expect(HttpStatus.OK);

    expect(response.body.status).toBe(CashDrawerState.CLOSED);
    expect(response.body.balance).toBe(finalBalance.toFixed(2));
    expect(auditLogService.log).toHaveBeenCalledWith(
      'CASH_DRAWER_CLOSE',
      'CashDrawer',
      drawerId,
      tenantId,
      userId,
      expect.objectContaining({
        oldStatus: CashDrawerState.OPEN,
        newStatus: CashDrawerState.CLOSED,
        reportedFinalBalance: finalBalance,
        actualBalanceAtClose: initialBalance,
        balanceDiscrepancy: (finalBalance - initialBalance).toFixed(2)
      }),
    );
  });

  it('should open a cash drawer (PATCH /cash-drawers/:id/open)', async () => {
    const drawerId = 'open-drawer-id';
    mockDbConnection.insert(
      { name: 'cash_drawers', _type: 'table' },
      {
        id: drawerId,
        tenantId,
        locationId: 'loc-8',
        name: 'Open Me Drawer',
        currency: 'USD',
        balance: '0.00',
        status: CashDrawerState.CLOSED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    );

    const response = await request(app.getHttpServer())
      .patch(`/cash-drawers/${drawerId}/open`)
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.status).toBe(CashDrawerState.OPEN);
    expect(auditLogService.log).toHaveBeenCalledWith(
      'CASH_DRAWER_OPEN',
      'CashDrawer',
      drawerId,
      tenantId,
      userId,
      expect.objectContaining({ oldStatus: CashDrawerState.CLOSED, newStatus: CashDrawerState.OPEN }),
    );
  });
});

