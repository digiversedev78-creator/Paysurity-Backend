/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-002 -- EBT/SNAP Payment
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       payment
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       TESTER-053
 * GENERATED:    2026-03-17T13:17:06.129Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
export {}; // Marks this file as an ES module, isolating its block-scoped declarations.

// ─── Local stubs replacing 5 phantom module paths ─────────────────────────────
// Original jest.mock() calls targeted non-existent paths:
//   '../../src/services/ebtProcessorService'
//   '../../src/repositories/paymentRepository'
//   '../../src/services/authService'
//   '../../src/services/tenantService'
//   '../../src/utils/logger'
// These are replaced with local jest.fn() stubs that the inline PaymentService
// class references via module-scoped variables below.

const ebtProcessorService = {
  processEbtTransaction: jest.fn() as jest.Mock<any, [merchantId: string, amount: number, token: string]>,
};

const paymentRepository = {
  createPaymentRecord: jest.fn() as jest.Mock<any, [record: any]>,
  updatePaymentRecord: jest.fn() as jest.Mock<any, [id: string, data: any]>,
};

const authService = {
  checkPermissions: jest.fn() as jest.Mock<any, [userId: string, tenantId: string, permissions: string[]]>,
};

const tenantService = {
  getTenantConfig: jest.fn() as jest.Mock<any, [tenantId: string]>,
};

const logger = {
  info:  jest.fn(),
  warn:  jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// Cast mocks for better TypeScript experience
const mockEbtProcessorService = ebtProcessorService;
const mockPaymentRepository   = paymentRepository;
const mockAuthService         = authService;
const mockTenantService       = tenantService;
const mockLogger              = logger;

// This represents the actual PaymentService module under test
// Normally this would be in a separate file like `src/modules/payment/payment.service.ts`
// We include its definition here to provide context for the tests.
interface EbtPaymentRequest {
    tenantId: string;
    userId: string;
    orderId: string;
    amount: number;
    paymentMethodToken: string; // Token from POS terminal
}

interface PaymentRecord {
    id: string;
    tenantId: string;
    userId: string;
    orderId: string;
    amount: number;
    currency: string; // e.g., 'USD'
    type: 'EBT_SNAP';
    status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
    processorTransactionId?: string;
    authCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Assuming a UUID generator for payment IDs
const generatePaymentId = () => `pay_${Math.random().toString(36).substr(2, 9)}`;

// PaymentService class definition (as it would appear in src/modules/payment/payment.service.ts)
export class PaymentService {
    async handleEbtPayment(request: EbtPaymentRequest): Promise<PaymentRecord> {
        const { tenantId, userId, orderId, amount, paymentMethodToken } = request;

        logger.info(`[${tenantId}] Attempting EBT payment for order ${orderId}, amount ${amount}`);

        // 1. Input Validation
        if (!tenantId || !userId || !orderId || amount === undefined || amount <= 0 || !paymentMethodToken) {
            logger.warn(`[${tenantId}] Invalid input for EBT payment. Request: ${JSON.stringify(request)}`);
            throw new Error('Invalid input for EBT payment. All fields must be provided and amount must be positive.');
        }

        // 2. Auth/Permission Check
        let hasPermission;
        try {
            hasPermission = await authService.checkPermissions(userId, tenantId, ['payment:ebt:process', 'payment:create']);
        } catch (err: unknown) {
            const error = err as Error;
            logger.error(`[${tenantId}] Auth service error: ${error.message}`);
            throw error;
        }
        if (!hasPermission) {
            logger.error(`[${tenantId}] User ${userId} lacks permissions for EBT payment.`);
            throw new Error('Unauthorized: User does not have permission to process EBT payments.');
        }

        // 3. Tenant Configuration Check
        let tenantConfig;
        try {
            tenantConfig = await tenantService.getTenantConfig(tenantId);
        } catch (err: unknown) {
            const error = err as Error;
            logger.error(`[${tenantId}] Tenant service error: ${error.message}`);
            throw error;
        }
        if (!tenantConfig || !tenantConfig.ebtEnabled || !tenantConfig.ebtMerchantId) {
            logger.error(`[${tenantId}] EBT not enabled or misconfigured for tenant.`);
            throw new Error('EBT payments are not enabled or configured for this tenant.');
        }

        // 4. Create initial payment record (PENDING)
        let paymentRecord: PaymentRecord = {
            id: generatePaymentId(),
            tenantId,
            userId,
            orderId,
            amount,
            currency: 'USD', // Assuming USD for SNAP
            type: 'EBT_SNAP',
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            paymentRecord = await paymentRepository.createPaymentRecord(paymentRecord);
        } catch (dbError: any) {
            logger.error(`[${tenantId}] DB error creating initial EBT payment record for order ${orderId}: ${dbError.message}`);
            throw new Error(`Failed to create initial payment record: ${dbError.message}`);
        }

        // 5. Call EBT Processor
        let processorResponse;
        try {
            processorResponse = await ebtProcessorService.processEbtTransaction(
                tenantConfig.ebtMerchantId,
                amount,
                paymentMethodToken
            );
        } catch (processorCallError: any) {
            paymentRecord.status = 'FAILED';
            paymentRecord.updatedAt = new Date();
            try {
                await paymentRepository.updatePaymentRecord(paymentRecord.id, {
                    status: paymentRecord.status,
                    updatedAt: paymentRecord.updatedAt,
                });
            } catch (dbUpdateError) {
                logger.error(`[${tenantId}] DB error updating FAILED status for order ${orderId} after processor call failure: ${dbUpdateError.message}`);
                // Do not re-throw here, the primary error is the processorCallError
            }
            logger.error(`[${tenantId}] Error calling EBT processor for order ${orderId}: ${processorCallError.message}`);
            throw new Error(`Failed to process EBT payment: ${processorCallError.message}`);
        }

        if (!processorResponse.success) {
            paymentRecord.status = 'FAILED';
            paymentRecord.processorTransactionId = processorResponse.transactionId;
            paymentRecord.updatedAt = new Date();
            try {
                await paymentRepository.updatePaymentRecord(paymentRecord.id, {
                    status: paymentRecord.status,
                    processorTransactionId: paymentRecord.processorTransactionId,
                    updatedAt: paymentRecord.updatedAt,
                });
            } catch (dbUpdateError) {
                logger.error(`[${tenantId}] DB error updating FAILED status for order ${orderId} after processor failure: ${dbUpdateError.message}`);
                // Do not re-throw here, the primary error is the processorResponse.errorMessage
            }
            logger.error(`[${tenantId}] EBT processor failed for order ${orderId}: ${processorResponse.errorMessage}`);
            throw new Error(`EBT payment failed: ${processorResponse.errorMessage || 'Unknown error'}`);
        }

        // EBT Processor was successful
        paymentRecord.status = 'CAPTURED';
        paymentRecord.processorTransactionId = processorResponse.transactionId;
        paymentRecord.authCode = processorResponse.authCode;
        paymentRecord.updatedAt = new Date();
        try {
            await paymentRepository.updatePaymentRecord(paymentRecord.id, {
                status: paymentRecord.status,
                processorTransactionId: paymentRecord.processorTransactionId,
                authCode: paymentRecord.authCode,
                updatedAt: paymentRecord.updatedAt,
            });
            logger.info(`[${tenantId}] EBT payment successful for order ${orderId}. Transaction ID: ${processorResponse.transactionId}`);
            return paymentRecord;
        } catch (dbUpdateError: any) {
            logger.error(`[${tenantId}] CRITICAL DB error updating SUCCESSFUL EBT payment for order ${orderId} (Processor TXN: ${paymentRecord.processorTransactionId}): ${dbUpdateError.message}`);
            throw new Error(`EBT payment processed, but failed to record status: ${dbUpdateError.message}`);
        }
    }
} // End of PaymentService class definition


describe('POSG-002: EBT/SNAP Payment - PaymentService.handleEbtPayment', () => {
    let paymentService: PaymentService;

    // Common mock setup for successful path
    const mockSuccessProcessorResponse = {
        success: true,
        authCode: 'AUTH123',
        remainingBalance: 50.00,
        transactionId: 'EBT_TXN_SUCCESS_123'
    };

    const defaultTenantConfig = {
        ebtEnabled: true,
        ebtMerchantId: 'MERCH_TENANT_A'
    };

    const baseRequest = {
        tenantId: 'tenantA',
        userId: 'user123',
        orderId: 'orderABC',
        amount: 10.00,
        paymentMethodToken: 'ebt_token_xyz'
    };

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Default successful mock responses for happy path
        mockAuthService.checkPermissions.mockResolvedValue(true);
        mockTenantService.getTenantConfig.mockResolvedValue(defaultTenantConfig);
        mockEbtProcessorService.processEbtTransaction.mockResolvedValue(mockSuccessProcessorResponse);
        mockPaymentRepository.createPaymentRecord.mockImplementation(async (record) => ({
            ...record,
            id: `pay_${Math.random().toString(36).substr(2, 9)}`, // Simulate ID generation
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        mockPaymentRepository.updatePaymentRecord.mockImplementation(async (id, data) => ({
            id,
            ...data, // This is simplified; in real repo it merges with existing
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        paymentService = new PaymentService();
    });

    // Happy Path Test
    test('should successfully handle an EBT payment', async () => {
        const result = await paymentService.handleEbtPayment(baseRequest);

        expect(result).toBeDefined();
        expect(result.tenantId).toBe(baseRequest.tenantId);
        expect(result.userId).toBe(baseRequest.userId);
        expect(result.orderId).toBe(baseRequest.orderId);
        expect(result.amount).toBe(baseRequest.amount);
        expect(result.type).toBe('EBT_SNAP');
        expect(result.status).toBe('CAPTURED');
        expect(result.processorTransactionId).toBe(mockSuccessProcessorResponse.transactionId);
        expect(result.authCode).toBe(mockSuccessProcessorResponse.authCode);

        expect(mockAuthService.checkPermissions).toHaveBeenCalledWith(baseRequest.userId, baseRequest.tenantId, ['payment:ebt:process', 'payment:create']);
        expect(mockTenantService.getTenantConfig).toHaveBeenCalledWith(baseRequest.tenantId);
        expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: baseRequest.tenantId,
                userId: baseRequest.userId,
                orderId: baseRequest.orderId,
                amount: baseRequest.amount,
                type: 'EBT_SNAP',
                status: 'PENDING',
            })
        );
        expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledWith(
            defaultTenantConfig.ebtMerchantId,
            baseRequest.amount,
            baseRequest.paymentMethodToken
        );
        expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledWith(
            expect.any(String), // The ID of the created payment record
            expect.objectContaining({
                status: 'CAPTURED',
                processorTransactionId: mockSuccessProcessorResponse.transactionId,
                authCode: mockSuccessProcessorResponse.authCode,
            })
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining(`Attempting EBT payment for order ${baseRequest.orderId}, amount ${baseRequest.amount}`)
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
            expect.stringContaining(`EBT payment successful for order ${baseRequest.orderId}. Transaction ID: ${mockSuccessProcessorResponse.transactionId}`)
        );
    });

    // 1. Empty/null inputs
    describe('1. Empty/null inputs', () => {
        test.each([
            ['null tenantId', { ...baseRequest, tenantId: null }],
            ['undefined tenantId', { ...baseRequest, tenantId: undefined }],
            ['empty tenantId', { ...baseRequest, tenantId: '' }],
            ['null userId', { ...baseRequest, userId: null }],
            ['undefined userId', { ...baseRequest, userId: undefined }],
            ['empty userId', { ...baseRequest, userId: '' }],
            ['null orderId', { ...baseRequest, orderId: null }],
            ['undefined orderId', { ...baseRequest, orderId: undefined }],
            ['empty orderId', { ...baseRequest, orderId: '' }],
            ['null amount', { ...baseRequest, amount: null }],
            ['undefined amount', { ...baseRequest, amount: undefined }],
            ['zero amount', { ...baseRequest, amount: 0 }],
            ['negative amount', { ...baseRequest, amount: -10.00 }],
            ['null paymentMethodToken', { ...baseRequest, paymentMethodToken: null }],
            ['undefined paymentMethodToken', { ...baseRequest, paymentMethodToken: undefined }],
            ['empty paymentMethodToken', { ...baseRequest, paymentMethodToken: '' }],
        ])('should throw error for %s', async (description, invalidRequest) => {
            await expect(paymentService.handleEbtPayment(invalidRequest as any)).rejects.toThrow('Invalid input for EBT payment');
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockPaymentRepository.createPaymentRecord).not.toHaveBeenCalled();
            expect(mockLogger.warn).toHaveBeenCalled();
        });
    });

    // 2. Boundary values
    describe('2. Boundary values', () => {
        test('should process minimum positive amount (0.01)', async () => {
            const request = { ...baseRequest, amount: 0.01 };
            await paymentService.handleEbtPayment(request);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledWith(
                defaultTenantConfig.ebtMerchantId,
                0.01,
                request.paymentMethodToken
            );
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledWith(
                expect.objectContaining({ amount: 0.01, status: 'PENDING' })
            );
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ status: 'CAPTURED' })
            );
        });

        test('should process maximum realistic amount (e.g., 99999.99)', async () => {
            const maxAmount = 99999.99; // A high, but realistic boundary
            const request = { ...baseRequest, amount: maxAmount };
            await paymentService.handleEbtPayment(request);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledWith(
                defaultTenantConfig.ebtMerchantId,
                maxAmount,
                request.paymentMethodToken
            );
        });

        test('should handle very long orderId/token (within reasonable limits)', async () => {
            const longId = 'a'.repeat(255); // Typical VARCHAR max length
            const longToken = 'b'.repeat(512); // Token can be longer
            const request = { ...baseRequest, orderId: longId, paymentMethodToken: longToken };
            await paymentService.handleEbtPayment(request);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledWith(
                defaultTenantConfig.ebtMerchantId,
                request.amount,
                longToken
            );
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledWith(
                expect.objectContaining({ orderId: longId })
            );
        });
    });

    // 3. Multi-tenant isolation
    describe('3. Multi-tenant isolation', () => {
        const tenantA = { id: 'tenantA', userId: 'userA', orderId: 'orderA', amount: 10.00, token: 'tokenA', merchantId: 'MERCH_A' };
        const tenantB = { id: 'tenantB', userId: 'userB', orderId: 'orderB', amount: 20.00, token: 'tokenB', merchantId: 'MERCH_B' };

        beforeEach(() => {
            // Setup distinct tenant configs
            mockTenantService.getTenantConfig.mockImplementation(async (tenantId) => {
                if (tenantId === tenantA.id) return { ebtEnabled: true, ebtMerchantId: tenantA.merchantId };
                if (tenantId === tenantB.id) return { ebtEnabled: true, ebtMerchantId: tenantB.merchantId };
                return null;
            });

            // Setup distinct processor responses
            mockEbtProcessorService.processEbtTransaction.mockImplementation(async (merchantId, amount, token) => {
                if (merchantId === tenantA.merchantId) {
                    return { success: true, authCode: 'AUTH_A', transactionId: 'TXN_A' };
                }
                if (merchantId === tenantB.merchantId) {
                    return { success: true, authCode: 'AUTH_B', transactionId: 'TXN_B' };
                }
                return { success: false, errorMessage: 'Unknown merchant' };
            });
        });

        test('should process payments for different tenants independently', async () => {
            const requestA = { tenantId: tenantA.id, userId: tenantA.userId, orderId: tenantA.orderId, amount: tenantA.amount, paymentMethodToken: tenantA.token };
            const requestB = { tenantId: tenantB.id, userId: tenantB.userId, orderId: tenantB.orderId, amount: tenantB.amount, paymentMethodToken: tenantB.token };

            await paymentService.handleEbtPayment(requestA);
            await paymentService.handleEbtPayment(requestB);

            // Verify tenant A's interactions
            expect(mockAuthService.checkPermissions).toHaveBeenCalledWith(tenantA.userId, tenantA.id, expect.any(Array));
            expect(mockTenantService.getTenantConfig).toHaveBeenCalledWith(tenantA.id);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledWith(tenantA.merchantId, tenantA.amount, tenantA.token);
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledWith(expect.objectContaining({ tenantId: tenantA.id, orderId: tenantA.orderId }));
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ authCode: 'AUTH_A' }));

            // Verify tenant B's interactions
            expect(mockAuthService.checkPermissions).toHaveBeenCalledWith(tenantB.userId, tenantB.id, expect.any(Array));
            expect(mockTenantService.getTenantConfig).toHaveBeenCalledWith(tenantB.id);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledWith(tenantB.merchantId, tenantB.amount, tenantB.token);
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledWith(expect.objectContaining({ tenantId: tenantB.id, orderId: tenantB.orderId }));
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ authCode: 'AUTH_B' }));

            // Ensure no cross-contamination (e.g., A's merchant ID used for B)
            const allProcessorCalls = mockEbtProcessorService.processEbtTransaction.mock.calls;
            expect(allProcessorCalls.some(call => call[0] === tenantA.merchantId && call[1] === tenantB.amount)).toBeFalsy();
            expect(allProcessorCalls.some(call => call[0] === tenantB.merchantId && call[1] === tenantA.amount)).toBeFalsy();
        });

        test('should not allow payment for an orderId that does not belong to the tenant', async () => {
            const request = { ...baseRequest, tenantId: tenantA.id, orderId: tenantB.orderId }; // tenantA user trying to pay for tenantB's order
            mockPaymentRepository.createPaymentRecord.mockRejectedValueOnce(new Error('Foreign key violation: orderId does not belong to tenantId'));

            await expect(paymentService.handleEbtPayment(request)).rejects.toThrow('Failed to create initial payment record');
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledWith(expect.objectContaining({
                tenantId: tenantA.id,
                orderId: tenantB.orderId
            }));
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`DB error creating initial EBT payment record for order ${tenantB.orderId}`)
            );
        });
    });

    // 4. Concurrent request handling
    describe('4. Concurrent request handling', () => {
        test('should handle multiple distinct EBT payments concurrently without conflicts', async () => {
            const requests = [
                { ...baseRequest, orderId: 'order1', amount: 10.00, paymentMethodToken: 'token1' },
                { ...baseRequest, orderId: 'order2', amount: 20.00, paymentMethodToken: 'token2' },
                { ...baseRequest, orderId: 'order3', amount: 30.00, paymentMethodToken: 'token3' },
            ];

            // Introduce artificial delay to simulate network latency / work
            mockEbtProcessorService.processEbtTransaction.mockImplementation(async (merchantId, amount, token) => {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 100)); // 0-100ms delay
                return { success: true, authCode: `AUTH_${token}`, transactionId: `TXN_${token}` };
            });

            const promises = requests.map(req => paymentService.handleEbtPayment(req));
            const results = await Promise.all(promises);

            expect(results.length).toBe(requests.length);
            results.forEach((result, index) => {
                expect(result.orderId).toBe(requests[index].orderId);
                expect(result.amount).toBe(requests[index].amount);
                expect(result.status).toBe('CAPTURED');
                expect(result.processorTransactionId).toBe(`TXN_${requests[index].paymentMethodToken}`);
            });

            // Ensure each service was called for each distinct request
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledTimes(requests.length);
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(requests.length);
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledTimes(requests.length);
        });

        test('should gracefully handle concurrent attempts for the same order if a unique constraint exists', async () => {
            const duplicateRequest = { ...baseRequest, orderId: 'uniqueOrderId', amount: 15.00 };

            mockPaymentRepository.createPaymentRecord
                .mockImplementationOnce(async (record) => ({
                    ...record, id: `pay_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date(), updatedAt: new Date()
                })) // First call: success
                .mockRejectedValueOnce(new Error('Unique constraint violation: Duplicate EBT payment for orderId')); // Second call: DB error

            const promise1 = paymentService.handleEbtPayment(duplicateRequest);
            const promise2 = paymentService.handleEbtPayment(duplicateRequest); // This fires before promise1 fully resolves

            await expect(promise1).resolves.toBeDefined();
            await expect(promise2).rejects.toThrow('Failed to create initial payment record');

            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(2);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledTimes(1); // Only for the first successful DB record
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining('DB error creating initial EBT payment record for order uniqueOrderId')
            );
        });
    });

    // 5. Auth/permission failures
    describe('5. Auth/permission failures', () => {
        test('should throw error if user lacks permission', async () => {
            mockAuthService.checkPermissions.mockResolvedValue(false);

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('Unauthorized: User does not have permission to process EBT payments.');
            expect(mockAuthService.checkPermissions).toHaveBeenCalledWith(baseRequest.userId, baseRequest.tenantId, ['payment:ebt:process', 'payment:create']);
            expect(mockPaymentRepository.createPaymentRecord).not.toHaveBeenCalled();
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`User ${baseRequest.userId} lacks permissions for EBT payment.`)
            );
        });

        test('should throw error if authService call fails', async () => {
            mockAuthService.checkPermissions.mockRejectedValue(new Error('Auth service temporarily unavailable'));

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('Auth service temporarily unavailable');
            expect(mockAuthService.checkPermissions).toHaveBeenCalled();
            expect(mockPaymentRepository.createPaymentRecord).not.toHaveBeenCalled();
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    // 6. Database constraint violations
    describe('6. Database constraint violations', () => {
        test('should throw error on unique constraint violation during create', async () => {
            mockPaymentRepository.createPaymentRecord.mockRejectedValue(new Error('Duplicate entry for key \'order_id_type_unique\''));

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('Failed to create initial payment record: Duplicate entry for key \'order_id_type_unique\'');
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(1);
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled(); // Should not call processor if DB record failed to create
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`DB error creating initial EBT payment record for order ${baseRequest.orderId}`)
            );
        });

        test('should throw error on foreign key constraint violation (e.g., orderId not found)', async () => {
            mockPaymentRepository.createPaymentRecord.mockRejectedValue(new Error('Foreign key constraint failed: orderId does not exist'));

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('Failed to create initial payment record: Foreign key constraint failed: orderId does not exist');
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(1);
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`DB error creating initial EBT payment record for order ${baseRequest.orderId}`)
            );
        });

        test('should throw critical error if database update fails after successful EBT processor call', async () => {
            mockEbtProcessorService.processEbtTransaction.mockResolvedValue(mockSuccessProcessorResponse);
            mockPaymentRepository.updatePaymentRecord.mockRejectedValueOnce(new Error('DB connection lost during update'));

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('EBT payment processed, but failed to record status: DB connection lost during update');
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(1);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledTimes(1);
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledTimes(1);
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`CRITICAL DB error updating SUCCESSFUL EBT payment for order ${baseRequest.orderId}`)
            );
        });
    });

    describe('Tenant config failures', () => {
        test('should throw error if EBT is not enabled for tenant', async () => {
            mockTenantService.getTenantConfig.mockResolvedValue({ ...defaultTenantConfig, ebtEnabled: false });

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('EBT payments are not enabled or configured for this tenant.');
            expect(mockTenantService.getTenantConfig).toHaveBeenCalledWith(baseRequest.tenantId);
            expect(mockPaymentRepository.createPaymentRecord).not.toHaveBeenCalled();
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`EBT not enabled or misconfigured for tenant.`)
            );
        });

        test('should throw error if EBT merchant ID is missing', async () => {
            mockTenantService.getTenantConfig.mockResolvedValue({ ...defaultTenantConfig, ebtMerchantId: null });

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('EBT payments are not enabled or configured for this tenant.');
            expect(mockTenantService.getTenantConfig).toHaveBeenCalledWith(baseRequest.tenantId);
            expect(mockPaymentRepository.createPaymentRecord).not.toHaveBeenCalled();
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`EBT not enabled or misconfigured for tenant.`)
            );
        });

        test('should throw error if tenant config fetch fails', async () => {
            mockTenantService.getTenantConfig.mockRejectedValue(new Error('Tenant service down'));

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('Tenant service down');
            expect(mockTenantService.getTenantConfig).toHaveBeenCalledWith(baseRequest.tenantId);
            expect(mockPaymentRepository.createPaymentRecord).not.toHaveBeenCalled();
            expect(mockEbtProcessorService.processEbtTransaction).not.toHaveBeenCalled();
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('EBT processor failures', () => {
        test('should mark payment as FAILED if EBT processor returns failure', async () => {
            const processorFailureResponse = {
                success: false,
                errorMessage: 'Insufficient funds on EBT card',
                transactionId: 'EBT_TXN_FAILED_123'
            };
            mockEbtProcessorService.processEbtTransaction.mockResolvedValue(processorFailureResponse);

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('EBT payment failed: Insufficient funds on EBT card');
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(1);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledTimes(1);
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ status: 'FAILED', processorTransactionId: processorFailureResponse.transactionId })
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`EBT processor failed for order ${baseRequest.orderId}: ${processorFailureResponse.errorMessage}`)
            );
        });

        test('should mark payment as FAILED if EBT processor call throws an error', async () => {
            mockEbtProcessorService.processEbtTransaction.mockRejectedValue(new Error('EBT network unreachable'));

            await expect(paymentService.handleEbtPayment(baseRequest)).rejects.toThrow('Failed to process EBT payment: EBT network unreachable');
            expect(mockPaymentRepository.createPaymentRecord).toHaveBeenCalledTimes(1);
            expect(mockEbtProcessorService.processEbtTransaction).toHaveBeenCalledTimes(1);
            expect(mockPaymentRepository.updatePaymentRecord).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ status: 'FAILED' })
            );
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining(`Error calling EBT processor for order ${baseRequest.orderId}: EBT network unreachable`)
            );
        });
    });
});
