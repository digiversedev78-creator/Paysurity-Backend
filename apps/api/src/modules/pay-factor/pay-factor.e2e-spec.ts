import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { PayFactorModule } from './pay-factor.module';
import { AuthGuard } from '@nestjs/passport';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

// Mock AuthGuard to attach a user object with tenantId
@Injectable()
class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { tenantId: 'test-tenant-id-123', userId: 'test-user-id-456' };
    return true;
  }
}

// Mock WebhookSignatureGuard for HMAC validation
@Injectable()
class MockWebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const signature = req.headers['x-signature'];
    if (!signature) {
      return false; // No signature provided
    }
    // For testing invalid signature, we'll return false if a specific invalid signature is sent.
    // In a real scenario, this would compute and compare.
    if (signature === 'invalid-signature') {
      return false;
    }
    return true; // Assume valid for other cases
  }
}

const TEST_TENANT_ID = 'test-tenant-id-123';
const TEST_USER_ID = 'test-user-id-456';
const TEST_PAY_FACTOR_ID = 'pf-uuid-1';
const TEST_FACTOR_RATE_ID = 'fr-uuid-1';
const TEST_ESCROW_ID = 'escrow-uuid-1';
const TEST_ADVANCE_ID = 'advance-uuid-1';
const TEST_SETTLEMENT_ID = 'settlement-uuid-1';
const TEST_SOURCE_TRANSACTION_ID = 'txn-uuid-1';
const WEBHOOK_SECRET = 'supersecret'; // Consistent with webhook generation

const BASE_PAYFACTOR_PATH = '/v1/payfactor';

// Helper to generate HMAC signature for webhooks
const generateHmac = (payload: any, secret: string): string => {
  const body = JSON.stringify(payload);
  return createHmac('sha256', secret).update(body).digest('hex');
};

describe('PayFactor E2E Tests', () => {
  let app: INestApplication;
  let mockDb: Record<string, jest.Mock>;

  beforeAll(async () => {
    mockDb = {
      // Drizzle ORM mock structure
      insert: jest.fn(() => ({
        values: jest.fn(() => ({
          returning: jest.fn((fields?: any[]) => [
            { id: 'mock-id-1', tenantId: TEST_TENANT_ID, ...fields },
          ]),
        })),
      })),
      select: jest.fn(() => ({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn(() => []), // Default to empty, specific tests override
        execute: jest.fn(() => []), // Default to empty
      })),
      update: jest.fn(() => ({
        set: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          returning: jest.fn((fields?: any[]) => [
            { id: 'mock-id-1', tenantId: TEST_TENANT_ID, ...fields },
          ]),
        })),
      })),
      transaction: jest.fn(async (cb) => {
        // Provide a transactional context that uses the same mocks
        return cb(mockDb);
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PayFactorModule],
    })
      .overrideProvider('DATABASE')
      .useValue(mockDb) // Use the mocked database
      .overrideGuard(AuthGuard) // Override the default AuthGuard
      .useClass(MockAuthGuard) // Use our mock
      // Override MockWebhookSignatureGuard itself to ensure its logic is applied for webhook tests
      .overrideGuard(MockWebhookSignatureGuard)
      .useClass(MockWebhookSignatureGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // Apply global validation pipes
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/payfactor/apply', () => {
    const applyPayload = {
      amount: 100000, // cents
      currency: 'USD',
      sourceTransactionId: TEST_SOURCE_TRANSACTION_ID,
      factorRateId: TEST_FACTOR_RATE_ID,
      description: 'Test PayFactor Application',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          id: TEST_PAY_FACTOR_ID,
          tenantId: TEST_TENANT_ID,
          status: 'pending',
          ...applyPayload,
        }]),
      });
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([]),
        execute: jest.fn().mockReturnValueOnce([]),
      });
    });

    it('should successfully apply for PayFactor with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/apply`)
        .send(applyPayload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: TEST_PAY_FACTOR_ID,
          tenantId: TEST_TENANT_ID,
          status: 'pending',
          amount: applyPayload.amount,
        }),
      );
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      const insertCallArgs = mockDb.insert.mock.calls[0][0]; // First arg of insert
      expect(insertCallArgs.tenantId).toBe(TEST_TENANT_ID);
      expect(insertCallArgs.amount).toBe(applyPayload.amount);
      expect(insertCallArgs.sourceTransactionId).toBe(applyPayload.sourceTransactionId);
    });

    it('should return 400 if required fields are missing for apply', async () => {
      const invalidPayload = {
        currency: 'USD',
        factorRateId: TEST_FACTOR_RATE_ID,
        description: 'Missing amount and sourceTransactionId',
      };

      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/apply`)
        .send(invalidPayload)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              'amount must be a number conforming to the specified constraints',
              'sourceTransactionId should not be empty',
            ]),
          );
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('POST /v1/payfactor/escrow', () => {
    const escrowDepositPayload = {
      payFactorId: TEST_PAY_FACTOR_ID,
      amount: 50000, // cents
      currency: 'USD',
      sourceTransactionId: 'txn-escrow-1',
      description: 'Escrow deposit',
    };

    const existingPayFactor = {
      id: TEST_PAY_FACTOR_ID,
      tenantId: TEST_TENANT_ID,
      status: 'approved',
      amount: 100000,
      currency: 'USD',
      escrowBalance: 0, // Initial balance
      advancedAmount: 0,
      settledAmount: 0,
      factorRateId: TEST_FACTOR_RATE_ID,
      sourceTransactionId: 'source-txn-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([existingPayFactor]),
        execute: jest.fn().mockReturnValueOnce([existingPayFactor]),
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          id: TEST_ESCROW_ID,
          tenantId: TEST_TENANT_ID,
          ...escrowDepositPayload,
          type: 'deposit',
        }]),
      });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          ...existingPayFactor,
          escrowBalance: existingPayFactor.escrowBalance + escrowDepositPayload.amount,
        }]),
      });
    });

    it('should successfully deposit funds into escrow', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/escrow`)
        .send(escrowDepositPayload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: TEST_ESCROW_ID,
          payFactorId: escrowDepositPayload.payFactorId,
          amount: escrowDepositPayload.amount,
          type: 'deposit',
        }),
      );

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      const updateCallArgs = mockDb.update.mock.calls[0][0];
      expect(updateCallArgs.escrowBalance).toBe(existingPayFactor.escrowBalance + escrowDepositPayload.amount);
    });

    it('should return 404 if PayFactor application not found', async () => {
      jest.clearAllMocks();
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([]),
        execute: jest.fn().mockReturnValueOnce([]),
      });

      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/escrow`)
        .send(escrowDepositPayload)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('PayFactor application not found');
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return 400 if escrow amount is zero or negative', async () => {
      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/escrow`)
        .send({ ...escrowDepositPayload, amount: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              'amount must not be less than 1',
            ]),
          );
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /v1/payfactor/release-advance', () => {
    const advanceReleasePayload = {
      payFactorId: TEST_PAY_FACTOR_ID,
      amount: 25000, // cents
      currency: 'USD',
      sourceTransactionId: 'txn-advance-1',
      description: 'Advance release',
    };

    const existingPayFactorWithEscrow = {
      id: TEST_PAY_FACTOR_ID,
      tenantId: TEST_TENANT_ID,
      status: 'approved',
      amount: 100000,
      currency: 'USD',
      escrowBalance: 50000, // Sufficient escrow
      advancedAmount: 0,
      settledAmount: 0,
      factorRateId: TEST_FACTOR_RATE_ID,
      sourceTransactionId: 'source-txn-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([existingPayFactorWithEscrow]),
        execute: jest.fn().mockReturnValueOnce([existingPayFactorWithEscrow]),
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          id: TEST_ADVANCE_ID,
          tenantId: TEST_TENANT_ID,
          ...advanceReleasePayload,
          type: 'advance',
        }]),
      });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          ...existingPayFactorWithEscrow,
          escrowBalance: existingPayFactorWithEscrow.escrowBalance - advanceReleasePayload.amount,
          advancedAmount: existingPayFactorWithEscrow.advancedAmount + advanceReleasePayload.amount,
        }]),
      });
    });

    it('should successfully release an advance with sufficient escrow', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-advance`)
        .send(advanceReleasePayload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: TEST_ADVANCE_ID,
          payFactorId: advanceReleasePayload.payFactorId,
          amount: advanceReleasePayload.amount,
          type: 'advance',
        }),
      );

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.update).toHaveBeenCalledTimes(1);

      const updateCallArgs = mockDb.update.mock.calls[0][0];
      expect(updateCallArgs.escrowBalance).toBe(existingPayFactorWithEscrow.escrowBalance - advanceReleasePayload.amount);
      expect(updateCallArgs.advancedAmount).toBe(existingPayFactorWithEscrow.advancedAmount + advanceReleasePayload.amount);
    });

    it('should return 400 if escrow balance is insufficient for the advance', async () => {
      const insufficientEscrowPayFactor = {
        ...existingPayFactorWithEscrow,
        escrowBalance: 10000, // Less than advanceReleasePayload.amount (25000)
      };

      jest.clearAllMocks();
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([insufficientEscrowPayFactor]),
        execute: jest.fn().mockReturnValueOnce([insufficientEscrowPayFactor]),
      });

      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-advance`)
        .send(advanceReleasePayload)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Insufficient escrow balance for the requested advance amount.');
        });

      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return 404 if PayFactor application not found', async () => {
      jest.clearAllMocks();
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([]),
        execute: jest.fn().mockReturnValueOnce([]),
      });

      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-advance`)
        .send(advanceReleasePayload)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('PayFactor application not found');
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return 400 if advance amount is zero or negative', async () => {
      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-advance`)
        .send({ ...advanceReleasePayload, amount: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              'amount must not be less than 1',
            ]),
          );
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /v1/payfactor/release-settlement', () => {
    const settlementPayload = {
      payFactorId: TEST_PAY_FACTOR_ID,
      amount: 75000, // cents
      currency: 'USD',
      dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      sourceTransactionId: 'txn-settlement-1',
      description: 'Settlement release',
    };

    const existingPayFactorForSettlement = {
      id: TEST_PAY_FACTOR_ID,
      tenantId: TEST_TENANT_ID,
      status: 'approved',
      amount: 100000,
      currency: 'USD',
      escrowBalance: 0,
      advancedAmount: 0,
      settledAmount: 0,
      factorRateId: TEST_FACTOR_RATE_ID,
      sourceTransactionId: 'source-txn-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([existingPayFactorForSettlement]),
        execute: jest.fn().mockReturnValueOnce([existingPayFactorForSettlement]),
      });
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          id: TEST_SETTLEMENT_ID,
          tenantId: TEST_TENANT_ID,
          ...settlementPayload,
          type: 'settlement',
        }]),
      });
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          ...existingPayFactorForSettlement,
          settledAmount: existingPayFactorForSettlement.settledAmount + settlementPayload.amount,
        }]),
      });
    });

    it('should successfully release a settlement with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-settlement`)
        .send(settlementPayload)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: TEST_SETTLEMENT_ID,
          payFactorId: settlementPayload.payFactorId,
          amount: settlementPayload.amount,
          type: 'settlement',
        }),
      );

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).toHaveBeenCalledTimes(1);
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      const updateCallArgs = mockDb.update.mock.calls[0][0];
      expect(updateCallArgs.settledAmount).toBe(existingPayFactorForSettlement.settledAmount + settlementPayload.amount);
    });

    it('should return 400 if due_date is in the past', async () => {
      const pastDatePayload = {
        ...settlementPayload,
        dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };

      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-settlement`)
        .send(pastDatePayload)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              'dueDate must be a future date',
            ]),
          );
        });

      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return 404 if PayFactor application not found', async () => {
      jest.clearAllMocks();
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([]),
        execute: jest.fn().mockReturnValueOnce([]),
      });

      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-settlement`)
        .send(settlementPayload)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('PayFactor application not found');
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return 400 if settlement amount is zero or negative', async () => {
      await request(app.getHttpServer())
        .post(`${BASE_PAYFACTOR_PATH}/release-settlement`)
        .send({ ...settlementPayload, amount: 0 })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              'amount must not be less than 1',
            ]),
          );
        });
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('Webhook HMAC rejection', () => {
    const webhookPayload = {
      eventType: 'payfactor.status_updated',
      payFactorId: TEST_PAY_FACTOR_ID,
      newStatus: 'approved',
      timestamp: new Date().toISOString(),
    };
    const webhookEndpoint = `${BASE_PAYFACTOR_PATH}/webhook`; // Assuming a webhook endpoint for PayFactor

    beforeEach(() => {
      jest.clearAllMocks();
      // Default mock for select PayFactor for webhook processing
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce([{
          id: TEST_PAY_FACTOR_ID,
          tenantId: TEST_TENANT_ID,
          status: 'pending', // Initial status before webhook update
        }]),
        execute: jest.fn().mockReturnValueOnce([{
          id: TEST_PAY_FACTOR_ID,
          tenantId: TEST_TENANT_ID,
          status: 'pending',
        }]),
      });
      // Default mock for update PayFactor status after webhook processing
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnValueOnce([{
          id: TEST_PAY_FACTOR_ID,
          tenantId: TEST_TENANT_ID,
          status: webhookPayload.newStatus,
        }]),
      });
    });

    it('should reject webhook request with invalid HMAC signature', async () => {
      const invalidSignature = 'invalid-signature'; // This triggers the mock guard to return false

      await request(app.getHttpServer())
        .post(webhookEndpoint)
        .set('x-signature', invalidSignature)
        .send(webhookPayload)
        .expect(403); // Guards returning false typically lead to 403 Forbidden
    });

    it('should accept webhook request with a seemingly valid (mocked) HMAC signature', async () => {
      const validSignature = generateHmac(webhookPayload, WEBHOOK_SECRET); // Will be considered valid by the mock

      await request(app.getHttpServer())
        .post(webhookEndpoint)
        .set('x-signature', validSignature)
        .send(webhookPayload)
        .expect(200); // Assuming 200 OK for successful webhook processing

      // Verify DB interactions for the webhook's effect (e.g., status update)
      expect(mockDb.select).toHaveBeenCalledTimes(1); // To find the PayFactor
      expect(mockDb.update).toHaveBeenCalledTimes(1); // To update its status
      const updateCallArgs = mockDb.update.mock.calls[0][0];
      expect(updateCallArgs.status).toBe(webhookPayload.newStatus);
    });

    it('should reject webhook request with missing HMAC signature', async () => {
      await request(app.getHttpServer())
        .post(webhookEndpoint)
        .send(webhookPayload)
        .expect(403); // Guard returns false if no signature
    });
  });
});
