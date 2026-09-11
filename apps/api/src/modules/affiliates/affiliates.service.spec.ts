/**
 * ═══════════════════════════════════════════════════════════
 * UNIT TEST: AffiliatesService – Tiered Commission Engine
 * Validates REQ-AFF-001 / REQ-AFF-002 / REQ-AFF-003:
 *   - location_id binding
 *   - basis_points matrix calculation
 *   - idempotency guard
 * ═══════════════════════════════════════════════════════════
 */
/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';

// ---------------------------------------------------------------------------
// Shared mock DB – reset mocks in beforeEach
// ---------------------------------------------------------------------------
const mockDb = {
  execute: jest.fn(),
};

const BASE_PARAMS = {
  orderId:    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  merchantId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  tenantId:   'cccccccc-cccc-cccc-cccc-cccccccccccc',
  locationId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  amountCents: 10000, // $100.00
};

describe('AffiliatesService', () => {
  let service: AffiliatesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliatesService,
        { provide: 'DATABASE', useValue: mockDb },
      ],
    }).compile();

    service = module.get<AffiliatesService>(AffiliatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────
  // Validation guards
  // ──────────────────────────────────────────────────────────
  describe('input validation', () => {
    it('throws BadRequestException when locationId is empty', async () => {
      await expect(
        service.processCommission({ ...BASE_PARAMS, locationId: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when amountCents is zero', async () => {
      await expect(
        service.processCommission({ ...BASE_PARAMS, amountCents: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when amountCents is negative', async () => {
      await expect(
        service.processCommission({ ...BASE_PARAMS, amountCents: -500 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Idempotency
  // ──────────────────────────────────────────────────────────
  describe('idempotency', () => {
    it('returns { existing: true } without re-inserting when commission already recorded', async () => {
      // existing commission check → found
      mockDb.execute.mockResolvedValueOnce({ rows: [{ id: 'existing-commission-id' }] });

      const result = await service.processCommission(BASE_PARAMS);

      expect(result.success).toBe(true);
      expect((result as any).existing).toBe(true);
      // Must NOT hit the rates query or INSERT
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Commission matrix calculation
  // ──────────────────────────────────────────────────────────
  describe('commission calculation', () => {
    it('calculates single-tier commission correctly (basis_points=200 → 2%)', async () => {
      mockDb.execute
        .mockResolvedValueOnce({ rows: [] })                                 // idempotency: no existing
        .mockResolvedValueOnce({ rows: [{ tier_level: 1, basis_points: 200 }] }) // rates
        .mockResolvedValueOnce({ rows: [] });                                // INSERT ok

      const result = await service.processCommission(BASE_PARAMS);

      // 10000 * 200 / 10000 = 200 cents ($2.00)
      expect(result.amount_cents).toBe(200);
      expect(result.success).toBe(true);
    });

    it('sums multi-tier commissions: tier1=200bp + tier2=100bp on $100 → 300 cents', async () => {
      mockDb.execute
        .mockResolvedValueOnce({ rows: [] })  // idempotency: no existing
        .mockResolvedValueOnce({
          rows: [
            { tier_level: 2, basis_points: 200 }, // 2.0%
            { tier_level: 1, basis_points: 100 }, // 1.0%
          ],
        })
        .mockResolvedValueOnce({ rows: [] }); // INSERT ok

      const result = await service.processCommission(BASE_PARAMS);

      // (10000 * 200 / 10000) + (10000 * 100 / 10000) = 200 + 100 = 300 cents
      expect(result.amount_cents).toBe(300);
      expect(result.success).toBe(true);
      expect(mockDb.execute).toHaveBeenCalledTimes(3);
    });

    it('uses Math.floor for fractional cent truncation (no rounding up)', async () => {
      mockDb.execute
        .mockResolvedValueOnce({ rows: [] })                                       // idem
        .mockResolvedValueOnce({ rows: [{ tier_level: 1, basis_points: 333 }] })  // 3.33%
        .mockResolvedValueOnce({ rows: [] });                                      // INSERT

      // 10000 * 333 / 10000 = 333.0 — exact, but try with 9999
      const result = await service.processCommission({ ...BASE_PARAMS, amountCents: 9999 });

      // 9999 * 333 / 10000 = 332.9667 → floor → 332
      expect(result.amount_cents).toBe(332);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Missing rates configuration
  // ──────────────────────────────────────────────────────────
  describe('error handling', () => {
    it('throws NotFoundException when no rates are configured for the affiliate', async () => {
      mockDb.execute
        .mockResolvedValueOnce({ rows: [] })  // idem: no existing
        .mockResolvedValueOnce({ rows: [] }); // rates: empty

      await expect(
        service.processCommission(BASE_PARAMS),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
