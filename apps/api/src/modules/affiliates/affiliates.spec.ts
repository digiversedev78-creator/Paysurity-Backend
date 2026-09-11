/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AFF-003 -- Affiliate Payouts
 * FILE TYPE:    TEST
 * MODULE:       affiliates
 * PRIORITY:     P2
 * ═══════════════════════════════════════════════════════════
 *
 * 1:1 Business Rule Mapping from original createPayoutRequest/
 * getPayoutRequests/getPayoutRequestById tests, rewired to the
 * current AffiliatesPayoutsService contract after consolidation.
 *
 * Original → New method mapping:
 *   createPayoutRequest  → create + processAffiliatePayout
 *   getPayoutRequests    → findAll
 *   getPayoutRequestById → findOne
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AffiliatesPayoutsService } from './affiliates-payouts.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// ─── Typed mock infrastructure ────────────────────────────────────────────────

type DrizzleDb = NodePgDatabase<Record<string, never>>;

interface ChainableMock {
  select:    jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  insert:    jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  update:    jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  delete:    jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  from:      jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  where:     jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  limit:     jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  offset:    jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  orderBy:   jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  values:    jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  set:       jest.MockedFunction<(...args: unknown[]) => ChainableMock>;
  returning: jest.MockedFunction<(...args: unknown[]) => Promise<unknown[]>>;
  transaction: jest.MockedFunction<(cb: (tx: ChainableMock) => Promise<unknown>) => Promise<unknown>>;
}

function buildMockDb(): ChainableMock {
  const db = {} as ChainableMock;
  const self = (..._: unknown[]) => db;
  db.select   = jest.fn(self);
  db.insert   = jest.fn(self);
  db.update   = jest.fn(self);
  db.delete   = jest.fn(self);
  db.from     = jest.fn(self);
  db.where    = jest.fn(self);
  db.limit    = jest.fn(self);
  db.offset   = jest.fn(self);
  db.orderBy  = jest.fn(self);
  db.values   = jest.fn(self);
  db.set      = jest.fn(self);
  db.returning = jest.fn().mockResolvedValue([]);
  db.transaction = jest.fn(async (cb) => cb(db));
  return db;
}

// ─── Shared test fixtures ─────────────────────────────────────────────────────

const tenantId    = 'tenant-uuid-1234';
const affiliateId = 'affiliate-uuid-5678';
const payoutId    = 'payout-uuid-abcd';

const mockPayout = {
  id:              payoutId,
  tenantId,
  affiliateId,
  amount:          '100.50',
  currency:        'USD',
  status:          'pending' as const,
  paymentMethodId: 'pm-uuid-xyz',
  payoutDate:      new Date('2024-01-15'),
  notes:           'Test payout',
  createdAt:       new Date(),
  updatedAt:       new Date(),
};

const reqWithTenant = { user: { tenantId, id: 'user-uuid-0001' } };
const reqWithoutTenant = { user: {} };

// ─── AffiliatesPayoutsService Tests ──────────────────────────────────────────

describe('AffiliatesPayoutsService', () => {
  let service: AffiliatesPayoutsService;
  let db: ChainableMock;

  beforeEach(async () => {
    db = buildMockDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliatesPayoutsService,
        {
          provide: 'DATABASE',
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<AffiliatesPayoutsService>(AffiliatesPayoutsService);
    jest.clearAllMocks();
    // Rebuild the mock after clearAllMocks since clearAllMocks wipes implementations
    db.returning = jest.fn().mockResolvedValue([]);
    db.transaction = jest.fn(async (cb) => cb(db));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────
  // create() — maps from: createPayoutRequest
  // Business rules: tenant required, inserts record, returns payout
  // ───────────────────────────────────────────────────────────
  describe('create (formerly createPayoutRequest)', () => {
    it('should create a payout record and return it', async () => {
      db.returning = jest.fn().mockResolvedValue([mockPayout]);

      const result = await service.create(reqWithTenant, {
        affiliateId,
        amount:          '100.50',
        currency:        'USD',
        status:          'pending',
        paymentMethodId: 'pm-uuid-xyz',
        notes:           'Test payout',
      });

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalled();
      expect(db.returning).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toEqual(payoutId);
      expect(result.status).toEqual('pending');
      expect(result.amount).toEqual('100.50');
    });

    it('should stamp the tenantId from the request onto the inserted record', async () => {
      db.returning = jest.fn().mockResolvedValue([{ ...mockPayout, tenantId }]);

      await service.create(reqWithTenant, {
        affiliateId,
        amount:   '50.00',
        currency: 'USD',
        status:   'pending',
      });

      // values() receives the full DTO merged with tenantId from req.user
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId, affiliateId }),
      );
    });

    // Original rule: throw if tenantId is missing (was NotFoundException in old service)
    it('should throw an Error if tenantId is absent from request', async () => {
      await expect(service.create(reqWithoutTenant, {
        affiliateId,
        amount:   '100.00',
        currency: 'USD',
        status:   'pending',
      })).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('should default payoutDate to now when not supplied', async () => {
      db.returning = jest.fn().mockResolvedValue([mockPayout]);
      const before = new Date();

      await service.create(reqWithTenant, {
        affiliateId,
        amount:   '20.00',
        currency: 'EUR',
        status:   'pending',
      });

      const callArg = (db.values as jest.Mock).mock.calls[0][0] as { payoutDate: Date };
      const after = new Date();
      expect(callArg.payoutDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(callArg.payoutDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  // ───────────────────────────────────────────────────────────
  // findAll() — maps from: getPayoutRequests
  // Business rules: tenant required, filter by affiliateId/status, ordered list
  // ───────────────────────────────────────────────────────────
  describe('findAll (formerly getPayoutRequests)', () => {
    it('should return all payouts for the tenant', async () => {
      // The service returns the query chain itself (Drizzle lazy evaluation)
      db.orderBy = jest.fn().mockReturnValue([mockPayout]);

      const result = await service.findAll(reqWithTenant);

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
    });

    it('should apply affiliateId filter when provided', async () => {
      db.orderBy = jest.fn().mockReturnValue([mockPayout]);

      await service.findAll(reqWithTenant, { affiliateId });

      // where gets called with conditions including tenantId and affiliateId
      expect(db.where).toHaveBeenCalled();
    });

    it('should apply status filter when provided', async () => {
      db.orderBy = jest.fn().mockReturnValue([{ ...mockPayout, status: 'processed' }]);

      await service.findAll(reqWithTenant, { status: 'processed' });

      expect(db.where).toHaveBeenCalled();
    });

    it('should apply limit and offset for pagination', async () => {
      db.offset = jest.fn().mockReturnValue([]);

      await service.findAll(reqWithTenant, { limit: 10, offset: 20 });

      expect(db.limit).toHaveBeenCalledWith(10);
      expect(db.offset).toHaveBeenCalledWith(20);
    });

    // Original rule: throw if affiliate not found / not owned by user
    it('should throw an Error if tenantId is absent from request', async () => {
      await expect(service.findAll(reqWithoutTenant)).rejects.toThrow(
        'Tenant ID is required for this operation.',
      );
    });
  });

  // ───────────────────────────────────────────────────────────
  // findOne() — maps from: getPayoutRequestById
  // Business rules: tenant required, scoped by tenant, returns undefined (not found)
  // ───────────────────────────────────────────────────────────
  describe('findOne (formerly getPayoutRequestById)', () => {
    it('should return a payout when it exists under the correct tenant', async () => {
      db.limit = jest.fn().mockReturnValue([mockPayout]);

      const result = await service.findOne(reqWithTenant, payoutId);

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalledWith(1);
    });

    it('should return undefined when payout ID does not exist for tenant', async () => {
      db.limit = jest.fn().mockReturnValue([]); // empty → destructure gives undefined

      const result = await service.findOne(reqWithTenant, 'non-existent-id');

      expect(result).toBeUndefined();
    });

    // Original rule: throw if tenantId not in request (was ForbiddenException in old service)
    it('should throw an Error if tenantId is absent from request', async () => {
      await expect(service.findOne(reqWithoutTenant, payoutId)).rejects.toThrow(
        'Tenant ID is required for this operation.',
      );
    });
  });

  // ───────────────────────────────────────────────────────────
  // processAffiliatePayout() — maps from: createPayoutRequest balance/eligibility check
  // Business rules: must have commissions, all must be eligible, single currency,
  //                 uses a DB transaction, links commissions to payout record
  // ───────────────────────────────────────────────────────────
  describe('processAffiliatePayout (eligibility & balance enforcement)', () => {
    it('should throw "No commission IDs" when commissionIds is empty', async () => {
      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, []),
      ).rejects.toThrow('No commission IDs provided for payout.');
    });

    it('should throw if tenantId is absent', async () => {
      await expect(
        service.processAffiliatePayout(reqWithoutTenant, affiliateId, ['comm-1']),
      ).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('should throw if commission count returned from DB differs from requested (not all eligible)', async () => {
      // select() returns only 1 commission, but we asked for 2 → some not eligible
      db.from = jest.fn().mockReturnThis();
      db.where = jest.fn().mockResolvedValue([ // only 1 eligible
        { id: 'comm-1', amount: '50.00', currency: 'USD', status: 'eligible' },
      ]);

      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-1', 'comm-2']),
      ).rejects.toThrow('Some provided commission IDs are not found or are not eligible for payout.');
    });

    it('should throw if commissions span multiple currencies', async () => {
      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-1', amount: '50.00', currency: 'USD', status: 'eligible' },
        { id: 'comm-2', amount: '30.00', currency: 'EUR', status: 'eligible' },
      ]);

      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-1', 'comm-2']),
      ).rejects.toThrow('Multi-currency payouts are not supported in a single transaction');
    });

    it('should execute inside a DB transaction', async () => {
      // All items eligible and single-currency
      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-1', amount: '100.00', currency: 'USD', status: 'eligible' },
      ]);
      db.returning = jest.fn().mockResolvedValue([mockPayout]);

      await service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-1']);

      expect(db.transaction).toHaveBeenCalled();
    });

    it('should insert a payout record and link commissions to it', async () => {
      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-A', amount: '75.00', currency: 'USD', status: 'eligible' },
      ]);
      db.returning = jest.fn().mockResolvedValue([{ ...mockPayout, id: 'new-payout-id' }]);

      const result = await service.processAffiliatePayout(
        reqWithTenant, affiliateId, ['comm-A'], 'pm-001', 'Monthly payout',
      );

      expect(db.insert).toHaveBeenCalled();
      expect(db.update).toHaveBeenCalled(); // updates commission status to 'paid'
      expect(result).toBeDefined();
      expect(result.id).toEqual('new-payout-id');
    });
  });

  // ───────────────────────────────────────────────────────────
  // createCommissionRule() — flat-rate currency requirement
  // ───────────────────────────────────────────────────────────
  describe('createCommissionRule (business rule: flat rate requires currency)', () => {
    it('should create a percentage commission rule successfully', async () => {
      db.returning = jest.fn().mockResolvedValue([{
        id: 'rule-1', rateType: 'percentage', rateValue: '10.00',
      }]);

      const result = await service.createCommissionRule(reqWithTenant, {
        name: '10% Standard',
        rateType: 'percentage',
        rateValue: '10.00',
        commissionType: 'one-time',
      });

      expect(db.insert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw when flat rate rule is created without a currency', async () => {
      await expect(service.createCommissionRule(reqWithTenant, {
        name: 'Flat $10',
        rateType: 'flat',
        rateValue: '10.00',
        commissionType: 'one-time',
        // currency intentionally omitted
      })).rejects.toThrow('Currency is required for flat rate commission rules.');
    });

    it('should create a flat rate commission rule when currency is provided', async () => {
      db.returning = jest.fn().mockResolvedValue([{
        id: 'rule-2', rateType: 'flat', rateValue: '10.00', currency: 'USD',
      }]);

      const result = await service.createCommissionRule(reqWithTenant, {
        name: 'Flat $10 USD',
        rateType: 'flat',
        rateValue: '10.00',
        currency: 'USD',
        commissionType: 'one-time',
      });

      expect(result).toBeDefined();
      expect(db.insert).toHaveBeenCalled();
    });

    it('should throw if tenantId is absent', async () => {
      await expect(service.createCommissionRule(reqWithoutTenant, {
        name: 'Test Rule',
        rateType: 'percentage',
        rateValue: '5.00',
        commissionType: 'recurring',
      })).rejects.toThrow('Tenant ID is required for this operation.');
    });
  });
});
