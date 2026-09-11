/**
 * ═══════════════════════════════════════════════════════════
 * UNIT TEST: WalletService Core Ledger Ops
 * Validates REQ-WAL-001: Double-Entry Ledger and Digital Wallet limits.
 * ═══════════════════════════════════════════════════════════
 */
/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WalletService } from './wallet.service';
import { UnsupportedCurrencyException } from '../../common/exceptions/unsupported-currency.exception';

const LOCATION_ID = 'loc00000-0000-0000-0000-000000000001';

/**
 * Creates a strongly-typed stub for NodePgDatabase.
 * transaction() immediately executes the callback with the same mock.
 * execute() returns controllable rows via mockResolvedValueOnce chains.
 */
function createMockDb() {
  const executeMock = jest.fn();
  const mockDbInstance: any = {
    execute: executeMock,
    transaction: jest.fn().mockImplementation(async (cb: (tx: any) => Promise<unknown>) => {
      return cb(mockDbInstance);
    }),
  };
  return mockDbInstance;
}

describe('WalletService', () => {
  let service: WalletService;
  let db: ReturnType<typeof createMockDb>;
  let eventEmitter: { emit: jest.Mock };

  const TENANT_ID   = 'b7372d24-3c87-4340-bb7f-94d5b248467d';
  const WALLET_ID   = 'a7372d24-3c87-4340-bb7f-94d5b248467d';
  const IDEM_KEY    = 'idem-test-key-001';
  const CONSUMER_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  beforeEach(async () => {
    db           = createMockDb();
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: 'DATABASE',        useValue: db },
        { provide: EventEmitter2,     useValue: eventEmitter },
        { provide: 'REQUEST_CONTEXT', useValue: { currentLocationId: LOCATION_ID } },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  // ──────────────────────────────────────────────────────────
  // SERVICE BOOTSTRAP
  // ──────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────
  // createWallet
  // ──────────────────────────────────────────────────────────
  describe('createWallet', () => {
    it('creates a new wallet and emits wallet.created', async () => {
      // 1: no existing wallet
      db.execute.mockResolvedValueOnce({ rows: [] } as never);
      // 2: platform_config limits
      db.execute.mockResolvedValueOnce({
        rows: [{ key: 'wallet.kyc_none.daily_spend_limit_cents', value: '50000' }],
      } as never);
      // 3: INSERT wallet
      db.execute.mockResolvedValueOnce({ rows: [] } as never);

      const result = await service.createWallet({
        tenantId:   TENANT_ID,
        consumerId: CONSUMER_ID,
        walletType: 'CONSUMER',
        locationId: LOCATION_ID,
        currency:   'USD',
      });

      expect(db.execute).toHaveBeenCalledTimes(3);
      expect(result.balance_cents).toBe(0);
      expect(result.status).toBe('ACTIVE');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'wallet.created',
        expect.objectContaining({ tenantId: TENANT_ID, consumerId: CONSUMER_ID }),
      );
    });

    it('returns idempotently if wallet already exists', async () => {
      // 1: wallet exists
      db.execute.mockResolvedValueOnce({
        rows: [{ id: WALLET_ID, balance_cents: '0', status: 'ACTIVE' }],
      } as never);

      const result = await service.createWallet({
        tenantId:   TENANT_ID,
        consumerId: CONSUMER_ID,
        walletType: 'CONSUMER',
        locationId: LOCATION_ID,
      });

      expect(db.execute).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(WALLET_ID);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rejects non-USD currency with UnsupportedCurrencyException', async () => {
      await expect(
        service.createWallet({
          tenantId:   TENANT_ID,
          consumerId: CONSUMER_ID,
          currency:   'EUR',
          locationId: LOCATION_ID,
        }),
      ).rejects.toThrow(UnsupportedCurrencyException);
    });

    it('rejects if no locationId is available from params or context', async () => {
      // Override the module so REQUEST_CONTEXT has no location
      const module2 = await Test.createTestingModule({
        providers: [
          WalletService,
          { provide: 'DATABASE',        useValue: db },
          { provide: EventEmitter2,     useValue: eventEmitter },
          { provide: 'REQUEST_CONTEXT', useValue: { currentLocationId: '' } },
        ],
      }).compile();
      const svc2 = module2.get<WalletService>(WalletService);

      await expect(
        svc2.createWallet({ tenantId: TENANT_ID, consumerId: CONSUMER_ID }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────
  // credit
  // ──────────────────────────────────────────────────────────
  describe('credit', () => {
    it('creates a credit transaction and increments balance', async () => {
      // wallet with matching location_id
      db.execute.mockResolvedValueOnce({
        rows: [{ id: WALLET_ID, balance_cents: '1000', status: 'ACTIVE', location_id: LOCATION_ID }],
      } as never);
      db.execute.mockResolvedValueOnce({ rows: [] } as never); // idem: no existing
      db.execute.mockResolvedValueOnce({ rows: [] } as never); // UPDATE wallet
      db.execute.mockResolvedValueOnce({ rows: [] } as never); // INSERT ledger

      const result = await service.credit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     5000,
        transactionType: 'DEPOSIT',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      });

      expect(db.execute).toHaveBeenCalledTimes(4);
      expect(typeof result).toBe('string');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'wallet.credited',
        expect.objectContaining({ tenantId: TENANT_ID, walletId: WALLET_ID, amountCents: 5000 }),
      );
    });

    it('returns idempotently if transaction already exists', async () => {
      db.execute.mockResolvedValueOnce({
        rows: [{ id: WALLET_ID, balance_cents: '1000', status: 'ACTIVE', location_id: LOCATION_ID }],
      } as never);
      db.execute.mockResolvedValueOnce({ rows: [{ id: 'existing-tx-id' }] } as never);

      const result = await service.credit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     5000,
        transactionType: 'DEPOSIT',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      });

      expect(result).toBe('existing-tx-id');
      expect(db.execute).toHaveBeenCalledTimes(2);
    });

    it('throws BadRequestException for non-positive amount', async () => {
      await expect(service.credit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     -500,
        transactionType: 'DEPOSIT',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException if wallet does not exist', async () => {
      db.execute.mockResolvedValueOnce({ rows: [] } as never);

      await expect(service.credit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     1000,
        transactionType: 'DEPOSIT',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if wallet is suspended', async () => {
      db.execute.mockResolvedValueOnce({
        rows: [{ id: WALLET_ID, balance_cents: '1000', status: 'SUSPENDED', location_id: LOCATION_ID }],
      } as never);

      await expect(service.credit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     1000,
        transactionType: 'DEPOSIT',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on location_id mismatch', async () => {
      db.execute.mockResolvedValueOnce({
        rows: [{ id: WALLET_ID, balance_cents: '1000', status: 'ACTIVE', location_id: 'different-loc-id' }],
      } as never);

      await expect(service.credit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     1000,
        transactionType: 'DEPOSIT',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────
  // debit
  // ──────────────────────────────────────────────────────────
  describe('debit', () => {
    it('creates a debit transaction and decrements balance', async () => {
      db.execute.mockResolvedValueOnce({
        rows: [{ id: WALLET_ID, balance_cents: '5000', reserved_cents: '0', status: 'ACTIVE', location_id: LOCATION_ID }],
      } as never);
      db.execute.mockResolvedValueOnce({ rows: [] } as never); // idem
      db.execute.mockResolvedValueOnce({ rows: [] } as never); // UPDATE
      db.execute.mockResolvedValueOnce({ rows: [] } as never); // INSERT ledger

      const result = await service.debit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     1000,
        transactionType: 'WITHDRAWAL',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      });

      expect(db.execute).toHaveBeenCalledTimes(4);
      expect(typeof result).toBe('string');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'wallet.debited',
        expect.objectContaining({ tenantId: TENANT_ID, walletId: WALLET_ID, amountCents: 1000 }),
      );
    });

    it('throws BadRequestException if balance is insufficient', async () => {
      db.execute.mockImplementation(async (...args: any[]) => {
        if (args.length && JSON.stringify(args[0]).includes('idempotency_key')) return { rows: [] };
        return { rows: [{ id: WALLET_ID, balance_cents: '500', reserved_cents: '0', status: 'ACTIVE', location_id: LOCATION_ID }] };
      });

      await expect(service.debit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     1000,
        transactionType: 'WITHDRAWAL',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow('Insufficient available balance');
    });

    it('throws BadRequestException if reserved funds block the debit', async () => {
      db.execute.mockImplementation(async (...args: any[]) => {
        if (args.length && JSON.stringify(args[0]).includes('idempotency_key')) return { rows: [] };
        // balance=5000, reserved=4500 → available=500, want 1000
        return { rows: [{ id: WALLET_ID, balance_cents: '5000', reserved_cents: '4500', status: 'ACTIVE', location_id: LOCATION_ID }] };
      });

      await expect(service.debit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     1000,
        transactionType: 'WITHDRAWAL',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for non-positive amount', async () => {
      await expect(service.debit({
        tenantId:        TENANT_ID,
        walletId:        WALLET_ID,
        amountCents:     -100,
        transactionType: 'WITHDRAWAL',
        idempotencyKey:  IDEM_KEY,
        locationId:      LOCATION_ID,
      })).rejects.toThrow(BadRequestException);
    });
  });
});
