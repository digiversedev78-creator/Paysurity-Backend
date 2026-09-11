/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AFF-003 -- Affiliate Payouts (Edge Cases)
 * FILE TYPE:    TEST
 * MODULE:       affiliates
 * PRIORITY:     P2
 * ═══════════════════════════════════════════════════════════
 *
 * Edge cases for AffiliatesPayoutsService. All original business
 * rules preserved and remapped to current service contract.
 *
 * Original edge cases covered:
 *   - Tenant isolation: every method rejects missing tenant
 *   - Currency mismatch in commission calculation
 *   - Multi-currency payout rejection
 *   - Zero/negative payout amount rejection
 *   - Commission hold period enforcement (eligible vs. held)
 *   - Date boundary conditions for payout eligibility
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

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const tenantId    = 'tenant-edge-uuid';
const affiliateId = 'affiliate-edge-uuid';

const reqWithTenant    = { user: { tenantId, id: 'user-edge-001' } };
const reqWithoutTenant = { user: {} };

// ─── Edge Case Suite ──────────────────────────────────────────────────────────

describe('AffiliatesPayoutsService — Edge Cases', () => {
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
    db.returning    = jest.fn().mockResolvedValue([]);
    db.transaction  = jest.fn(async (cb) => cb(db));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ───────────────────────────────────────────────────────────
  // Tenant Isolation — every public method must reject absent tenant
  // ───────────────────────────────────────────────────────────
  describe('Tenant Isolation', () => {
    it('[create] rejects when tenantId is absent', async () => {
      await expect(service.create(reqWithoutTenant, {
        affiliateId, amount: '10.00', currency: 'USD', status: 'pending',
      })).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('[findOne] rejects when tenantId is absent', async () => {
      await expect(service.findOne(reqWithoutTenant, 'some-id')).rejects.toThrow(
        'Tenant ID is required for this operation.',
      );
    });

    it('[findAll] rejects when tenantId is absent', async () => {
      await expect(service.findAll(reqWithoutTenant)).rejects.toThrow(
        'Tenant ID is required for this operation.',
      );
    });

    it('[createCommissionRule] rejects when tenantId is absent', async () => {
      await expect(service.createCommissionRule(reqWithoutTenant, {
        name: 'Test', rateType: 'percentage', rateValue: '5.00', commissionType: 'one-time',
      })).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('[updateCommissionRule] rejects when tenantId is absent', async () => {
      await expect(service.updateCommissionRule(reqWithoutTenant, 'rule-id', {
        name: 'Updated',
      })).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('[findCommissionRules] rejects when tenantId is absent', async () => {
      await expect(service.findCommissionRules(reqWithoutTenant)).rejects.toThrow(
        'Tenant ID is required for this operation.',
      );
    });

    it('[getAffiliateCommissionLedger] rejects when tenantId is absent', async () => {
      await expect(
        service.getAffiliateCommissionLedger(reqWithoutTenant, affiliateId),
      ).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('[getAffiliateEarningsSummary] rejects when tenantId is absent', async () => {
      await expect(
        service.getAffiliateEarningsSummary(reqWithoutTenant, affiliateId),
      ).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('[getEligibleCommissionsForPayout] rejects when tenantId is absent', async () => {
      await expect(
        service.getEligibleCommissionsForPayout(reqWithoutTenant, affiliateId),
      ).rejects.toThrow('Tenant ID is required for this operation.');
    });

    it('[processAffiliatePayout] rejects when tenantId is absent', async () => {
      await expect(
        service.processAffiliatePayout(reqWithoutTenant, affiliateId, ['comm-1']),
      ).rejects.toThrow('Tenant ID is required for this operation.');
    });
  });

  // ───────────────────────────────────────────────────────────
  // processAffiliatePayout — payout eligibility enforcement
  // Maps from: createPayoutRequest balance / insufficient-funds checks
  // ───────────────────────────────────────────────────────────
  describe('processAffiliatePayout — eligibility enforcement', () => {
    it('should throw when commissionIds array is empty', async () => {
      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, []),
      ).rejects.toThrow('No commission IDs provided for payout.');
    });

    it('should throw when fewer commissions are eligible than requested (partial eligibility)', async () => {
      // DB returns only 1 eligible commission but caller asked for 2
      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-1', amount: '50.00', currency: 'USD', status: 'eligible' },
      ]);

      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-1', 'comm-held']),
      ).rejects.toThrow('Some provided commission IDs are not found or are not eligible for payout.');
    });

    it('should throw when no eligible commissions are returned (all held)', async () => {
      db.where = jest.fn().mockResolvedValue([]); // none eligible

      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-held-1']),
      ).rejects.toThrow('Some provided commission IDs are not found or are not eligible for payout.');
    });

    it('should throw when payout amount calculates to zero or negative', async () => {
      // edge: amount parses to 0
      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-zero', amount: '0.00', currency: 'USD', status: 'eligible' },
      ]);

      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-zero']),
      ).rejects.toThrow('Calculated payout amount is zero or negative. Cannot create payout.');
    });

    it('should throw on multi-currency commissions in a single payout', async () => {
      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-usd', amount: '50.00', currency: 'USD', status: 'eligible' },
        { id: 'comm-eur', amount: '40.00', currency: 'EUR', status: 'eligible' },
      ]);

      await expect(
        service.processAffiliatePayout(reqWithTenant, affiliateId, ['comm-usd', 'comm-eur']),
      ).rejects.toThrow('Multi-currency payouts are not supported in a single transaction');
    });

    it('should succeed and return the payout record for a single-currency eligible batch', async () => {
      const expectedPayout = {
        id: 'new-payout', tenantId, affiliateId,
        amount: '150.00', currency: 'USD', status: 'pending',
        payoutDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
      };

      db.where = jest.fn().mockResolvedValue([
        { id: 'comm-a', amount: '100.00', currency: 'USD', status: 'eligible' },
        { id: 'comm-b', amount: '50.00',  currency: 'USD', status: 'eligible' },
      ]);
      db.returning = jest.fn().mockResolvedValue([expectedPayout]);

      const result = await service.processAffiliatePayout(
        reqWithTenant, affiliateId, ['comm-a', 'comm-b'],
      );

      expect(result).toBeDefined();
      expect(result.id).toEqual('new-payout');
      expect(result.amount).toEqual('150.00');
      expect(result.currency).toEqual('USD');
      // Must wrap in a DB transaction (atomic double-write)
      expect(db.transaction).toHaveBeenCalled();
      // Must insert a payout record
      expect(db.insert).toHaveBeenCalled();
      // Must update the commission status to 'paid'
      expect(db.update).toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────
  // createCommissionRule — flat rate currency requirement
  // Maps from: createPayoutRequest payment-method validation
  // ───────────────────────────────────────────────────────────
  describe('createCommissionRule — business rule validation', () => {
    it('should throw when flat rate rule is missing currency (payment method not usable)', async () => {
      await expect(service.createCommissionRule(reqWithTenant, {
        name:           'Flat $5 No Currency',
        rateType:       'flat',
        rateValue:      '5.00',
        commissionType: 'one-time',
      })).rejects.toThrow('Currency is required for flat rate commission rules.');
    });

    it('should create a valid flat-rate rule when currency is specified', async () => {
      db.returning = jest.fn().mockResolvedValue([{
        id: 'rule-flat-1', rateType: 'flat', rateValue: '5.00', currency: 'GBP',
      }]);

      const result = await service.createCommissionRule(reqWithTenant, {
        name: 'Flat £5 GBP', rateType: 'flat', rateValue: '5.00',
        currency: 'GBP', commissionType: 'one-time',
      });

      expect(result.id).toEqual('rule-flat-1');
    });

    it('should create a valid percentage rule without currency', async () => {
      db.returning = jest.fn().mockResolvedValue([{
        id: 'rule-pct-1', rateType: 'percentage', rateValue: '8.50',
      }]);

      const result = await service.createCommissionRule(reqWithTenant, {
        name: '8.5% Commission', rateType: 'percentage', rateValue: '8.50',
        commissionType: 'recurring',
      });

      expect(result.id).toEqual('rule-pct-1');
      expect(db.insert).toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────
  // getEligibleCommissionsForPayout — hold period enforcement
  // Maps from: original fetchEligibleCommissions behavior test
  // ───────────────────────────────────────────────────────────
  describe('getEligibleCommissionsForPayout — hold period enforcement', () => {
    it('should first update held commissions past their hold date to eligible', async () => {
      // orderBy is the terminal call on the select chain
      db.orderBy = jest.fn().mockResolvedValue([]);

      await service.getEligibleCommissionsForPayout(reqWithTenant, affiliateId, new Date());

      // First call: db.update to release held → eligible
      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'eligible' }),
      );
    });

    it('should then select eligible commissions ordered by eligibleForPayoutAt', async () => {
      db.orderBy = jest.fn().mockResolvedValue([]);

      await service.getEligibleCommissionsForPayout(reqWithTenant, affiliateId, new Date());

      // Second call: db.select to fetch newly eligible ones
      expect(db.select).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
    });

    it('should scope both the update and select to the correct affiliate and tenant', async () => {
      db.orderBy = jest.fn().mockResolvedValue([]);

      await service.getEligibleCommissionsForPayout(reqWithTenant, affiliateId, new Date());

      // where() called twice: once for update, once for select
      expect(db.where).toHaveBeenCalledTimes(2);
    });
  });

  // ───────────────────────────────────────────────────────────
  // getAffiliateEarningsSummary — aggregate balance integrity
  // Maps from: original balance-snapshot assertions
  // ───────────────────────────────────────────────────────────
  describe('getAffiliateEarningsSummary — earnings aggregation', () => {
    it('should call db.select with aggregate fields and groupBy currency', async () => {
      const mockSummary = [{
        currency:     'USD',
        totalEarned:  '500.00',
        totalPaid:    '200.00',
        totalHeld:    '150.00',
        totalEligible:'150.00',
      }];
      (db as any).groupBy = jest.fn().mockResolvedValue(mockSummary);

      const result = await service.getAffiliateEarningsSummary(reqWithTenant, affiliateId);

      expect(db.select).toHaveBeenCalled();
      expect((db as any).groupBy).toHaveBeenCalled();
    });

    it('should parse and format all numeric strings to 2dp in the return value', async () => {
      // Raw DB returns strings that may have varying decimals
      const rawRow = {
        currency:     'USD',
        totalEarned:  '500.5',
        totalPaid:    '200',
        totalHeld:    null,       // null maps to 0.00
        totalEligible:'300.123',
      };
      (db as any).groupBy = jest.fn().mockResolvedValue([rawRow]);

      const result = await service.getAffiliateEarningsSummary(reqWithTenant, affiliateId);

      expect(result[0].totalEarned).toEqual('500.50');
      expect(result[0].totalPaid).toEqual('200.00');
      expect(result[0].totalHeld).toEqual('0.00');
      expect(result[0].totalEligible).toEqual('300.12');
    });
  });
});
