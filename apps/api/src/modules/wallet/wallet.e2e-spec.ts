/**
 * wallet.e2e-spec.ts — WalletModule E2E Tests
 * REQ-WAL-001/003: Digital Wallet Double-Entry Ledger Business Logic
 *
 * Infrastructure hoisted to avoid Redis/DB connections in tests.
 * Tests the real WalletController at /v1/wallets/ with mocked WalletService.
 */

// ─── Hoist: prevent EventBusModule / PaymentModule from connecting to Redis ──
jest.mock('../event-bus/event-bus.module', () => {
  const { Module } = require('@nestjs/common');
  @Module({})
  class MockEventBusModule {}
  return { EventBusModule: MockEventBusModule };
});

jest.mock('../payment/payment.module', () => {
  const { Module } = require('@nestjs/common');
  @Module({})
  class MockPaymentModule {}
  return { PaymentModule: MockPaymentModule };
});

jest.mock('@nestjs/event-emitter', () => {
  const { Module, Injectable } = require('@nestjs/common');
  @Injectable()
  class MockEventEmitter2 {
    emit = jest.fn();
    on = jest.fn();
    off = jest.fn();
  }
  @Module({ providers: [MockEventEmitter2], exports: [MockEventEmitter2] })
  class MockEventEmitterModule {
    static forRoot() { return MockEventEmitterModule; }
  }
  return { EventEmitterModule: MockEventEmitterModule, EventEmitter2: MockEventEmitter2 };
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, NotFoundException } from '@nestjs/common';
const request = require('supertest');
import { v4 as uuidv4 } from 'uuid';
import { WalletModule } from './wallet.module';
import { WalletService } from './wallet.service';
import { WalletFiatService } from './wallet-fiat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ─── Mock wallet IDs ─────────────────────────────────────────────────────────
const TENANT_ID = uuidv4();
const WALLET_A   = uuidv4();
const WALLET_B   = uuidv4();
const TX_ID      = uuidv4();

// ─── Shared mock wallet response ─────────────────────────────────────────────
const mockWalletA = {
  id: WALLET_A,
  tenant_id: TENANT_ID,
  consumer_id: uuidv4(),
  wallet_type: 'CONSUMER',
  currency: 'USD',
  balance_cents: 10000,
  reserved_cents: 0,
  status: 'ACTIVE',
  kyc_level: 'NONE',
};

// ─── MockWalletService ────────────────────────────────────────────────────────
const mockWalletService = {
  createWallet:       jest.fn(),
  credit:             jest.fn(),
  debit:              jest.fn(),
  getWallet:          jest.fn(),
  getTransactions:    jest.fn(),
  reserve:            jest.fn(),
  releaseReservation: jest.fn(),
  linkChild:          jest.fn(),
  getChildren:        jest.fn(),
  toggleChildStatus:  jest.fn(),
  disburseFunds:      jest.fn(),
  linkEmployee:       jest.fn(),
  getEmployees:       jest.fn(),
};

const mockWalletFiatService = {
  linkBankAccount:    jest.fn(),
  fundWalletViaCard:  jest.fn(),
  withdrawToBank:     jest.fn(),
};

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('WalletModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WalletModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(WalletService)
      .useValue(mockWalletService)
      .overrideProvider(WalletFiatService)
      .useValue(mockWalletFiatService)
      .overrideProvider('DATABASE')
      .useValue({ execute: jest.fn(), transaction: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    // Inject tenant context — replaces JWT guard
    app.use((req: any, _res: any, next: any) => {
      req.user = { tenantId: TENANT_ID, userId: uuidv4() };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── REQ-WAL-001: Load funds (topup) creates a ledger credit ─────────────
  it('should load funds into wallet (POST /v1/wallets/:id/load)', async () => {
    mockWalletService.credit.mockResolvedValueOnce(TX_ID);

    const response = await request(app.getHttpServer())
      .post(`/v1/wallets/${WALLET_A}/load`)
      .send({ amountCents: 5000, idempotencyKey: uuidv4() })
      .expect(HttpStatus.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.txId).toBe(TX_ID);
    expect(mockWalletService.credit).toHaveBeenCalledTimes(1);
    expect(mockWalletService.credit).toHaveBeenCalledWith(
      expect.objectContaining({ walletId: WALLET_A, amountCents: 5000, tenantId: TENANT_ID })
    );
  });

  // ─── REQ-WAL-001: Transfer debits sender and credits receiver ─────────────
  it('should transfer funds between wallets (POST /v1/wallets/:id/transfer)', async () => {
    mockWalletService.debit.mockResolvedValueOnce(uuidv4());
    mockWalletService.credit.mockResolvedValueOnce(uuidv4());

    const response = await request(app.getHttpServer())
      .post(`/v1/wallets/${WALLET_A}/transfer`)
      .send({ amountCents: 3000, targetWalletId: WALLET_B, idempotencyKey: uuidv4() })
      .expect(HttpStatus.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.debitTxId).toBeDefined();
    expect(response.body.creditTxId).toBeDefined();
    expect(mockWalletService.debit).toHaveBeenCalledTimes(1);
    expect(mockWalletService.credit).toHaveBeenCalledTimes(1);
  });

  // ─── REQ-WAL-001: Get wallet returns current balance ──────────────────────
  it('should retrieve wallet details (GET /v1/wallets/:id)', async () => {
    mockWalletService.getWallet.mockResolvedValueOnce(mockWalletA);

    const response = await request(app.getHttpServer())
      .get(`/v1/wallets/${WALLET_A}`)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(WALLET_A);
    expect(response.body.balance_cents).toBe(10000);
    expect(mockWalletService.getWallet).toHaveBeenCalledWith(TENANT_ID, WALLET_A);
  });

  // ─── REQ-WAL-001: Get transactions returns ledger history ─────────────────
  it('should retrieve wallet transactions (GET /v1/wallets/:id/transactions)', async () => {
    const mockLedger = [
      { id: uuidv4(), transaction_type: 'LOAD_CARD', direction: 'C', amount_cents: 5000, balance_after_cents: 5000 },
      { id: uuidv4(), transaction_type: 'TRANSFER_OUT', direction: 'D', amount_cents: 2000, balance_after_cents: 3000 },
    ];
    mockWalletService.getTransactions.mockResolvedValueOnce(mockLedger);

    const response = await request(app.getHttpServer())
      .get(`/v1/wallets/${WALLET_A}/transactions`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveLength(2);
    expect(response.body[0].direction).toBe('C');
    expect(response.body[1].direction).toBe('D');
    expect(mockWalletService.getTransactions).toHaveBeenCalledWith(TENANT_ID, WALLET_A, 50);
  });

  // ─── REQ-WAL-001: Insufficient funds — debit throws BadRequestException ───
  it('should propagate InsufifcientFunds error on failed debit transfer', async () => {
    const { BadRequestException } = require('@nestjs/common');
    mockWalletService.debit.mockRejectedValueOnce(
      new BadRequestException('Insufficient available balance')
    );

    const response = await request(app.getHttpServer())
      .post(`/v1/wallets/${WALLET_A}/transfer`)
      .send({ amountCents: 999999, targetWalletId: WALLET_B, idempotencyKey: uuidv4() })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe('Insufficient available balance');
  });

  // ─── REQ-WAL-001: Idempotency — duplicate load returns same txId ──────────
  it('should return the same txId for idempotent duplicate load requests', async () => {
    const idempotencyKey = uuidv4();
    // Both calls return the same TX_ID — idempotent
    mockWalletService.credit.mockResolvedValue(TX_ID);

    const [res1, res2] = await Promise.all([
      request(app.getHttpServer())
        .post(`/v1/wallets/${WALLET_A}/load`)
        .send({ amountCents: 1000, idempotencyKey }),
      request(app.getHttpServer())
        .post(`/v1/wallets/${WALLET_A}/load`)
        .send({ amountCents: 1000, idempotencyKey }),
    ]);

    expect(res1.status).toBe(HttpStatus.OK);
    expect(res2.status).toBe(HttpStatus.OK);
    expect(res1.body.txId).toBe(TX_ID);
    expect(res2.body.txId).toBe(TX_ID);
  });

  // ─── REQ-WAL-001: Wallet not found propagates NotFoundException ───────────
  it('should return 404 when wallet does not exist', async () => {
    mockWalletService.getWallet.mockRejectedValueOnce(
      new NotFoundException('Wallet not found')
    );

    const response = await request(app.getHttpServer())
      .get(`/v1/wallets/${uuidv4()}`)
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.message).toBe('Wallet not found');
  });

  // ─── REQ-WAL-EMPLOYER: Payroll disbursement double-entry ─────────────────
  it('should disburse funds from employer to employee wallet (POST /v1/wallets/:id/disburse)', async () => {
    const outId = uuidv4();
    const inId  = uuidv4();
    mockWalletService.disburseFunds.mockResolvedValueOnce({
      success: true, outLedgerTxId: outId, inLedgerTxId: inId,
    });

    const response = await request(app.getHttpServer())
      .post(`/v1/wallets/${WALLET_A}/disburse`)
      .send({
        employeeWalletId: WALLET_B,
        amountCents: 50000,
        idempotencyKey: uuidv4(),
        description: 'Payroll - Week 1',
      })
      .expect(HttpStatus.OK);

    expect(response.body.success).toBe(true);
    expect(response.body.outLedgerTxId).toBe(outId);
    expect(response.body.inLedgerTxId).toBe(inId);
    expect(mockWalletService.disburseFunds).toHaveBeenCalledWith(
      TENANT_ID, WALLET_A, WALLET_B, 50000, expect.any(String), 'Payroll - Week 1'
    );
  });
});
