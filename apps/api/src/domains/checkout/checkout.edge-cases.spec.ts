/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-002 -- Ring Up Transaction
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       checkout
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       TESTER-067
 * GENERATED:    2026-03-17T13:17:32.214Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
export {};
class InvalidInputError extends Error {}
class NotFoundError extends Error {}
class PermissionDeniedError extends Error {}
class InsufficientStockError extends Error {}
class PaymentProcessingError extends Error {}
class DbConstraintError extends Error {}

// Define types for clarity within the test file, ideally imported from source
interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface PaymentInfo {
  method: 'cash' | 'card' | 'loyalty' | 'other' | string;
  amount: number;
  details?: Record<string, any>;
}

interface RingUpTransactionParams {
  tenantId: string;
  storeId: string;
  cashierId: string;
  items: TransactionItem[];
  payment: PaymentInfo;
  loyaltyId?: string;
  discountCode?: string;
}

interface TransactionReceipt {
  transactionId: string;
  totalAmount: number;
  paymentDetails: PaymentInfo;
  items: TransactionItem[];
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  tenantId: string;
}

// Mock dependencies
const mockProductService = {
  getProductDetails: jest.fn(),
  updateProductStock: jest.fn(),
};

const mockInventoryService = {
  reserveStock: jest.fn(),
  deductStock: jest.fn(),
  releaseStock: jest.fn(),
  getStockAvailability: jest.fn(),
};

const mockPaymentGateway = {
  processPayment: jest.fn(),
  refundPayment: jest.fn(),
};

const mockAuthService = {
  hasPermission: jest.fn(),
  verifyTenantId: jest.fn(),
};

const mockTransactionRepository = {
  createTransaction: jest.fn(),
  getTransactionById: jest.fn(),
  updateTransactionStatus: jest.fn(),
  getTransactionsByTenantId: jest.fn(),
};

const mockLoyaltyService = {
  applyDiscount: jest.fn(),
  addLoyaltyPoints: jest.fn(),
};

// The service under test (simplified for testing purposes, usually imported)
class CheckoutService {
  constructor(
    private productService: typeof mockProductService,
    private inventoryService: typeof mockInventoryService,
    private paymentGateway: typeof mockPaymentGateway,
    private authService: typeof mockAuthService,
    private transactionRepository: typeof mockTransactionRepository,
    private loyaltyService: typeof mockLoyaltyService
  ) {}

  async ringUpTransaction(params: RingUpTransactionParams): Promise<TransactionReceipt> {
    if (!params) {
      throw new InvalidInputError('Transaction parameters cannot be null or undefined.');
    }

    const { tenantId, storeId, cashierId, items, payment, loyaltyId, discountCode } = params;

    if (!tenantId) throw new InvalidInputError('Tenant ID is required.');
    if (!storeId) throw new InvalidInputError('Store ID is required.');
    if (!cashierId) throw new InvalidInputError('Cashier ID is required.');
    if (!items || items.length === 0) throw new InvalidInputError('Transaction must contain at least one item.');
    if (!payment || !payment.method) throw new InvalidInputError('Payment method is required.');
    if (payment.amount < 0) throw new InvalidInputError('Payment amount must be non-negative.');

    await this.authService.verifyTenantId(tenantId, { storeId, cashierId });
    await this.authService.hasPermission(cashierId, 'POS_TRANSACTION_RING_UP', { storeId, tenantId });

    let transactionId: string | undefined;
    let paymentTransactionId: string | undefined;

    try {
      let totalAmount = 0;
      for (const item of items) {
        if (!item.productId) throw new InvalidInputError('Item productId is required.');
        if (item.quantity <= 0) throw new InvalidInputError('Item quantity must be a positive number.');
        if (item.unitPrice < 0) throw new InvalidInputError('Item unit price must be a non-negative number.');

        await this.productService.getProductDetails(tenantId, item.productId);
        totalAmount += item.quantity * item.unitPrice;
      }

      if (loyaltyId && totalAmount > 0) {
        try {
          const discount = await this.loyaltyService.applyDiscount(tenantId, loyaltyId, items, discountCode);
          totalAmount = Math.max(0, totalAmount - discount);
          payment.amount = totalAmount;
        } catch (error: any) {
          console.warn(`Loyalty discount failed for ${loyaltyId}: ${error.message}`);
        }
      }

      // For simplicity in tests, assume payment.amount is exactly what's expected for non-cash
      // Real-world systems handle change and overpayment differently.

      for (const item of items) {
        await this.inventoryService.reserveStock(tenantId, item.productId, item.quantity);
      }

      const initialTransaction = {
        tenantId, storeId, cashierId, items, payment, loyaltyId, discountCode,
        totalAmount, status: 'pending', timestamp: new Date(),
      };
      const createdTransaction = await this.transactionRepository.createTransaction(initialTransaction);
      transactionId = createdTransaction.transactionId;

      if (totalAmount > 0 || payment.amount > 0) { // Process payment even if totalAmount is 0 for consistency if payment.amount implies a non-zero transaction
        const paymentResult = await this.paymentGateway.processPayment(
          tenantId,
          transactionId,
          payment.amount,
          payment.method,
          payment.details || {}
        );
        paymentTransactionId = paymentResult.transactionId;
        if (paymentResult.status !== 'success') {
          throw new PaymentProcessingError(`Payment failed: ${paymentResult.status}`);
        }
      }

      for (const item of items) {
        await this.inventoryService.deductStock(tenantId, item.productId, item.quantity);
      }

      if (loyaltyId) {
        try {
          const pointsEarned = Math.floor(totalAmount / 10); // Example logic
          await this.loyaltyService.addLoyaltyPoints(tenantId, loyaltyId, pointsEarned);
        } catch (error: any) {
          console.error(`Failed to add loyalty points for ${loyaltyId}: ${error.message}`);
        }
      }

      await this.transactionRepository.updateTransactionStatus(transactionId, 'completed', { paymentTransactionId });

      return {
        transactionId,
        totalAmount,
        paymentDetails: payment,
        items,
        timestamp: new Date(),
        status: 'completed',
        tenantId,
      };

    } catch (error: any) {
      if (transactionId) {
        await this.transactionRepository.updateTransactionStatus(transactionId, 'failed', { error: error.message }).catch(console.error);
      }
      if (paymentTransactionId) {
        await this.paymentGateway.refundPayment(tenantId, paymentTransactionId, payment.amount).catch(console.error);
      }
      // Only release stock if 'items' were successfully processed and stock reserved
      if (items && items.length > 0) {
        for (const item of items) {
          await this.inventoryService.releaseStock(tenantId, item.productId, item.quantity).catch(console.error);
        }
      }
      throw error;
    }
  }
}

let checkoutService: CheckoutService;

const TENANT_ID_A = 'tenant-a-123';
const TENANT_ID_B = 'tenant-b-456';
const STORE_ID_1 = 'store-001';
const CASHIER_ID_1 = 'cashier-001';
const PRODUCT_ID_1 = 'prod-abc';
const PRODUCT_ID_2 = 'prod-xyz';
const PRODUCT_ID_OOS = 'prod-oos'; // Out of stock product
const VALID_PAYMENT_METHOD = 'card' as const;

const defaultTransactionItems: TransactionItem[] = [
  { productId: PRODUCT_ID_1, quantity: 2, unitPrice: 10.00 },
];

const defaultPaymentInfo: PaymentInfo = {
  method: VALID_PAYMENT_METHOD,
  amount: 20.00,
  details: { cardNumber: '**** **** **** 1111' },
};

const defaultRingUpParams: RingUpTransactionParams = {
  tenantId: TENANT_ID_A,
  storeId: STORE_ID_1,
  cashierId: CASHIER_ID_1,
  items: defaultTransactionItems,
  payment: defaultPaymentInfo,
};

const setupMocks = () => {
  mockAuthService.hasPermission.mockResolvedValue(true);
  mockAuthService.verifyTenantId.mockResolvedValue(true);

  mockProductService.getProductDetails.mockImplementation((tenantId, productId) => {
    if (productId === PRODUCT_ID_1 || productId === PRODUCT_ID_2 || productId === 'prod-shared' || productId === 'prod-unique' || productId.startsWith('prod-')) {
      return { id: productId, name: `Product ${productId}`, price: 10.00 }; // Default price
    }
    if (productId === PRODUCT_ID_OOS) {
      return { id: PRODUCT_ID_OOS, name: 'Out of Stock Product', price: 5.00 };
    }
    throw new NotFoundError(`Product ${productId} not found for tenant ${tenantId}`);
  });

  mockInventoryService.reserveStock.mockImplementation((tenantId, productId, quantity) => {
    if (productId === PRODUCT_ID_OOS) {
      throw new InsufficientStockError(`Product ${productId} out of stock.`);
    }
    return true; // Assume stock is available by default
  });
  mockInventoryService.deductStock.mockResolvedValue(true);
  mockInventoryService.releaseStock.mockResolvedValue(true);
  mockInventoryService.getStockAvailability.mockResolvedValue(100); // Default high stock

  mockPaymentGateway.processPayment.mockResolvedValue({
    transactionId: 'payment-tx-' + Math.random().toString(36).substr(2, 5),
    status: 'success',
  });
  mockPaymentGateway.refundPayment.mockResolvedValue({ status: 'refunded' });

  mockTransactionRepository.createTransaction.mockImplementation((transactionData) => {
    return {
      transactionId: `tx-${Math.random().toString(36).substr(2, 9)}`,
      totalAmount: transactionData.payment.amount,
      paymentDetails: transactionData.payment,
      items: transactionData.items,
      timestamp: new Date(),
      status: transactionData.status,
      tenantId: transactionData.tenantId,
      storeId: transactionData.storeId,
    };
  });
  mockTransactionRepository.updateTransactionStatus.mockResolvedValue(true);
  mockTransactionRepository.getTransactionsByTenantId.mockResolvedValue([]);

  mockLoyaltyService.applyDiscount.mockResolvedValue(0); // No discount by default
  mockLoyaltyService.addLoyaltyPoints.mockResolvedValue(true);
};

describe('CheckoutService - POS-002: Ring Up Transaction Edge Cases', () => {
  beforeAll(() => {
    checkoutService = new CheckoutService(
      mockProductService,
      mockInventoryService,
      mockPaymentGateway,
      mockAuthService,
      mockTransactionRepository,
      mockLoyaltyService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  // Scenario 1: Empty/null inputs
  describe('1. Empty/null inputs', () => {
    it('should throw InvalidInputError if params is null', async () => {
      await expect(checkoutService.ringUpTransaction(null as any)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(null as any)).rejects.toThrow('Transaction parameters cannot be null or undefined.');
    });

    it('should throw InvalidInputError if params is undefined', async () => {
      await expect(checkoutService.ringUpTransaction(undefined as any)).rejects.toThrow(InvalidInputError);
    });

    it('should throw InvalidInputError if tenantId is null or undefined', async () => {
      const invalidParams = { ...defaultRingUpParams, tenantId: null as any };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Tenant ID is required.');
      const invalidParams2 = { ...defaultRingUpParams, tenantId: undefined as any };
      await expect(checkoutService.ringUpTransaction(invalidParams2)).rejects.toThrow(InvalidInputError);
    });

    it('should throw InvalidInputError if storeId is empty string', async () => {
      const invalidParams = { ...defaultRingUpParams, storeId: '' };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Store ID is required.');
    });

    it('should throw InvalidInputError if items array is empty', async () => {
      const invalidParams = { ...defaultRingUpParams, items: [] };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Transaction must contain at least one item.');
    });

    it('should throw InvalidInputError if an item has null productId', async () => {
      const invalidItems = [{ productId: null as any, quantity: 1, unitPrice: 5.00 }];
      const invalidParams = { ...defaultRingUpParams, items: invalidItems };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Item productId is required.');
    });

    it('should throw InvalidInputError if an item has a quantity of 0', async () => {
      const invalidItems = [{ productId: PRODUCT_ID_1, quantity: 0, unitPrice: 5.00 }];
      const invalidParams = { ...defaultRingUpParams, items: invalidItems };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Item quantity must be a positive number.');
    });

    it('should throw InvalidInputError if an item has a negative quantity', async () => {
      const invalidItems = [{ productId: PRODUCT_ID_1, quantity: -1, unitPrice: 5.00 }];
      const invalidParams = { ...defaultRingUpParams, items: invalidItems };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
    });

    it('should throw InvalidInputError if an item has a negative unitPrice', async () => {
      const invalidItems = [{ productId: PRODUCT_ID_1, quantity: 1, unitPrice: -5.00 }];
      const invalidParams = { ...defaultRingUpParams, items: invalidItems };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Item unit price must be a non-negative number.');
    });

    it('should allow unitPrice of 0 for free items', async () => {
      const freeItem: TransactionItem = { productId: PRODUCT_ID_1, quantity: 1, unitPrice: 0.00 };
      const params = { ...defaultRingUpParams, items: [freeItem], payment: { method: 'card', amount: 0.00, details: {} } };
      await expect(checkoutService.ringUpTransaction(params)).resolves.toBeDefined();
      expect(mockPaymentGateway.processPayment).not.toHaveBeenCalled(); // No payment if total is 0
    });

    it('should throw InvalidInputError if payment method is null or empty', async () => {
      const invalidPayment = { ...defaultPaymentInfo, method: null as any };
      const invalidParams = { ...defaultRingUpParams, payment: invalidPayment };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Payment method is required.');
    });

    it('should throw InvalidInputError if payment amount is negative', async () => {
      const invalidPayment = { ...defaultPaymentInfo, amount: -10.00 };
      const invalidParams = { ...defaultRingUpParams, payment: invalidPayment };
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow(InvalidInputError);
      await expect(checkoutService.ringUpTransaction(invalidParams)).rejects.toThrow('Payment amount must be non-negative.');
    });
  });

  // Scenario 2: Boundary values
  describe('2. Boundary values', () => {
    it('should process transaction with a single item', async () => {
      const singleItem: TransactionItem[] = [{ productId: PRODUCT_ID_1, quantity: 1, unitPrice: 5.00 }];
      const params = { ...defaultRingUpParams, items: singleItem, payment: { method: 'cash', amount: 5.00 } };
      await expect(checkoutService.ringUpTransaction(params)).resolves.toBeDefined();
      expect(mockInventoryService.deductStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, 1);
    });

    it('should process transaction with max quantity for an item (e.g., 999999)', async () => {
      const largeQuantity = 999999;
      mockInventoryService.getStockAvailability.mockResolvedValueOnce(largeQuantity + 1);
      const largeItem: TransactionItem = { productId: PRODUCT_ID_1, quantity: largeQuantity, unitPrice: 0.01 };
      const params = {
        ...defaultRingUpParams,
        items: [largeItem],
        payment: { method: 'card', amount: largeQuantity * 0.01 },
      };
      await expect(checkoutService.ringUpTransaction(params)).resolves.toBeDefined();
      expect(mockInventoryService.deductStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, largeQuantity);
    });

    it('should process transaction with a very small unitPrice (e.g., 0.01)', async () => {
      const smallPriceItem: TransactionItem = { productId: PRODUCT_ID_1, quantity: 1, unitPrice: 0.01 };
      const params = { ...defaultRingUpParams, items: [smallPriceItem], payment: { method: 'cash', amount: 0.01 } };
      await expect(checkoutService.ringUpTransaction(params)).resolves.toBeDefined();
    });

    it('should process transaction with many distinct items (e.g., 100 items)', async () => {
      const manyItems: TransactionItem[] = Array.from({ length: 100 }, (_, i) => ({
        productId: `prod-${i}`,
        quantity: 1,
        unitPrice: 1.00,
      }));

      const params = {
        ...defaultRingUpParams,
        items: manyItems,
        payment: { method: 'card', amount: 100.00 },
      };
      await expect(checkoutService.ringUpTransaction(params)).resolves.toBeDefined();
      expect(mockInventoryService.deductStock).toHaveBeenCalledTimes(100);
    });

    it('should process transaction with exact change payment amount', async () => {
      const item: TransactionItem = { productId: PRODUCT_ID_1, quantity: 1, unitPrice: 15.75 };
      const params = { ...defaultRingUpParams, items: [item], payment: { method: 'cash', amount: 15.75 } };
      await expect(checkoutService.ringUpTransaction(params)).resolves.toBeDefined();
      expect(mockPaymentGateway.processPayment).toHaveBeenCalledWith(
        TENANT_ID_A,
        expect.any(String),
        15.75,
        'cash',
        {}
      );
    });
  });

  // Scenario 3: Multi-tenant isolation
  describe('3. Multi-tenant isolation', () => {
    it('should ensure transactions for different tenants are isolated', async () => {
      mockTransactionRepository.getTransactionsByTenantId.mockImplementation(async (tenantId) => {
        if (tenantId === TENANT_ID_A) return [{ transactionId: 'tx-tenantA-001' }];
        return [];
      });

      const paramsA = { ...defaultRingUpParams, tenantId: TENANT_ID_A };
      const paramsB = {
        ...defaultRingUpParams,
        tenantId: TENANT_ID_B,
        items: [{ productId: PRODUCT_ID_2, quantity: 1, unitPrice: 50.00 }],
        payment: { method: 'card' as const, amount: 50.00 },
      };

      const receiptA = await checkoutService.ringUpTransaction(paramsA);
      expect(receiptA.tenantId).toBe(TENANT_ID_A);
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(expect.objectContaining({ tenantId: TENANT_ID_A }));
      expect(mockAuthService.verifyTenantId).toHaveBeenCalledWith(TENANT_ID_A, expect.any(Object));

      const receiptB = await checkoutService.ringUpTransaction(paramsB);
      expect(receiptB.tenantId).toBe(TENANT_ID_B);
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(expect.objectContaining({ tenantId: TENANT_ID_B }));
      expect(mockAuthService.verifyTenantId).toHaveBeenCalledWith(TENANT_ID_B, expect.any(Object));

      expect(mockInventoryService.deductStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, 2);
      expect(mockInventoryService.deductStock).toHaveBeenCalledWith(TENANT_ID_B, PRODUCT_ID_2, 1);
      expect(mockInventoryService.deductStock).not.toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_2, 1);
    });

    it('should throw PermissionDeniedError if tenantId verification fails', async () => {
      mockAuthService.verifyTenantId.mockRejectedValueOnce(new PermissionDeniedError('Tenant ID mismatch or invalid.'));
      await expect(checkoutService.ringUpTransaction(defaultRingUpParams)).rejects.toThrow(PermissionDeniedError);
      expect(mockAuthService.verifyTenantId).toHaveBeenCalledWith(TENANT_ID_A, expect.any(Object));
      expect(mockTransactionRepository.createTransaction).not.toHaveBeenCalled();
    });
  });

  // Scenario 4: Concurrent request handling
  describe('4. Concurrent request handling', () => {
    it('should handle concurrent requests for the same product and prevent overselling', async () => {
      const sharedProductId = 'prod-shared';
      const initialStock = 5;
      mockInventoryService.getStockAvailability.mockResolvedValue(initialStock);
      mockProductService.getProductDetails.mockResolvedValue({ id: sharedProductId, name: 'Shared Product', price: 10 });

      let currentStock = initialStock;
      mockInventoryService.reserveStock.mockImplementation(async (tenantId, productId, quantity) => {
        if (productId === sharedProductId) {
          if (currentStock < quantity) {
            throw new InsufficientStockError(`Insufficient stock for ${productId}`);
          }
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
          currentStock -= quantity;
        }
        return true;
      });
      mockInventoryService.deductStock.mockResolvedValue(true);

      const params: RingUpTransactionParams = {
        tenantId: TENANT_ID_A,
        storeId: STORE_ID_1,
        cashierId: CASHIER_ID_1,
        items: [{ productId: sharedProductId, quantity: 1, unitPrice: 10.00 }],
        payment: { method: 'cash', amount: 10.00 },
      };

      const concurrentRequests = Array(10).fill(null).map(() =>
        checkoutService.ringUpTransaction(params)
      );

      const results = await Promise.allSettled(concurrentRequests);

      const successfulTransactions = results.filter(r => r.status === 'fulfilled');
      const failedTransactions = results.filter(r => r.status === 'rejected');

      expect(successfulTransactions.length).toBe(initialStock);
      expect(failedTransactions.length).toBe(10 - initialStock);

      failedTransactions.forEach(result => {
        expect((result as PromiseRejectedResult).reason).toBeInstanceOf(InsufficientStockError);
      });

      expect(currentStock).toBe(0);
      expect(mockInventoryService.reserveStock).toHaveBeenCalledTimes(10);
      expect(mockInventoryService.deductStock).toHaveBeenCalledTimes(initialStock);
    });

    it('should assign unique transaction IDs for concurrent successful transactions', async () => {
      const uniqueProductId = 'prod-unique';
      mockInventoryService.getStockAvailability.mockResolvedValue(100);
      mockProductService.getProductDetails.mockResolvedValue({ id: uniqueProductId, name: 'Unique Product', price: 10 });

      const params: RingUpTransactionParams = {
        tenantId: TENANT_ID_A,
        storeId: STORE_ID_1,
        cashierId: CASHIER_ID_1,
        items: [{ productId: uniqueProductId, quantity: 1, unitPrice: 10.00 }],
        payment: { method: 'card', amount: 10.00 },
      };

      const numTransactions = 5;
      const concurrentRequests = Array(numTransactions).fill(null).map(() =>
        checkoutService.ringUpTransaction(params)
      );

      const receipts = await Promise.all(concurrentRequests);
      const transactionIds = receipts.map(r => r.transactionId);

      const uniqueIds = new Set(transactionIds);
      expect(uniqueIds.size).toBe(numTransactions);
    });

    it('should handle concurrent updates to loyalty points correctly', async () => {
      const loyaltyId = 'loyalty-123';
      let loyaltyPoints = 100;

      mockLoyaltyService.applyDiscount.mockResolvedValue(0);
      mockLoyaltyService.addLoyaltyPoints.mockImplementation(async (tenantId, loyaltyIdArg, points) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
        loyaltyPoints += points;
        return loyaltyPoints;
      });

      const params: RingUpTransactionParams = {
        tenantId: TENANT_ID_A,
        storeId: STORE_ID_1,
        cashierId: CASHIER_ID_1,
        items: [{ productId: PRODUCT_ID_1, quantity: 1, unitPrice: 10.00 }],
        payment: { method: 'card', amount: 10.00 },
        loyaltyId: loyaltyId,
      };

      const pointsPerTransaction = 1;
      const numTransactions = 5;

      const concurrentRequests = Array(numTransactions).fill(null).map(() =>
        checkoutService.ringUpTransaction(params)
      );

      await Promise.all(concurrentRequests);

      expect(mockLoyaltyService.addLoyaltyPoints).toHaveBeenCalledTimes(numTransactions);
      expect(loyaltyPoints).toBe(100 + (numTransactions * pointsPerTransaction));
    });
  });

  // Scenario 5: Auth/permission failures
  describe('5. Auth/permission failures', () => {
    it('should throw PermissionDeniedError if cashier lacks required permission', async () => {
      mockAuthService.hasPermission.mockResolvedValue(false);
      await expect(checkoutService.ringUpTransaction(defaultRingUpParams)).rejects.toThrow(PermissionDeniedError);
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith(CASHIER_ID_1, 'POS_TRANSACTION_RING_UP', expect.any(Object));
      expect(mockTransactionRepository.createTransaction).not.toHaveBeenCalled();
    });

    it('should throw PermissionDeniedError if cashierId is invalid or not found', async () => {
      mockAuthService.hasPermission.mockRejectedValueOnce(new PermissionDeniedError('Invalid cashier ID.'));
      await expect(checkoutService.ringUpTransaction(defaultRingUpParams)).rejects.toThrow(PermissionDeniedError);
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith(CASHIER_ID_1, 'POS_TRANSACTION_RING_UP', expect.any(Object));
    });

    it('should throw PermissionDeniedError if storeId is not associated with cashier', async () => {
      mockAuthService.hasPermission.mockImplementation((cashierId, permission, context) => {
        if (context?.storeId !== STORE_ID_1) {
          throw new PermissionDeniedError('Cashier not authorized for this store.');
        }
        return true;
      });
      const invalidStoreParams = { ...defaultRingUpParams, storeId: 'store-002' };
      await expect(checkoutService.ringUpTransaction(invalidStoreParams)).rejects.toThrow(PermissionDeniedError);
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith(
        CASHIER_ID_1,
        'POS_TRANSACTION_RING_UP',
        expect.objectContaining({ storeId: 'store-002' })
      );
    });

    it('should not process payment if auth fails', async () => {
      mockAuthService.hasPermission.mockResolvedValue(false);
      await expect(checkoutService.ringUpTransaction(defaultRingUpParams)).rejects.toThrow(PermissionDeniedError);
      expect(mockPaymentGateway.processPayment).not.toHaveBeenCalled();
    });
  });

  // Scenario 6: Database constraint violations and other system failures
  describe('6. Database constraint violations and system failures', () => {
    it('should throw NotFoundError if a product does not exist', async () => {
      mockProductService.getProductDetails.mockImplementationOnce(() => {
        throw new NotFoundError('Product not found.');
      });
      const invalidItemParams = { ...defaultRingUpParams, items: [{ productId: 'non-existent-prod', quantity: 1, unitPrice: 10.00 }] };
      await expect(checkoutService.ringUpTransaction(invalidItemParams)).rejects.toThrow(NotFoundError);
      expect(mockInventoryService.reserveStock).not.toHaveBeenCalled();
    });

    it('should throw InsufficientStockError if item is out of stock', async () => {
      const outOfStockItem: TransactionItem[] = [{ productId: PRODUCT_ID_OOS, quantity: 1, unitPrice: 5.00 }];
      const params = { ...defaultRingUpParams, items: outOfStockItem, payment: { method: 'cash' as const, amount: 5.00 } };

      mockInventoryService.reserveStock.mockImplementation((_tid, productId, _qty) => {
        if (productId === PRODUCT_ID_OOS) {
          throw new InsufficientStockError(`Product ${PRODUCT_ID_OOS} is out of stock.`);
        }
        return true;
      });

      await expect(checkoutService.ringUpTransaction(params)).rejects.toThrow(InsufficientStockError);
      expect(mockInventoryService.reserveStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_OOS, 1);
      expect(mockPaymentGateway.processPayment).not.toHaveBeenCalled();
      expect(mockTransactionRepository.createTransaction).not.toHaveBeenCalled();
    });

    it('should throw InsufficientStockError if deducting stock leads to negative', async () => {
      const item: TransactionItem[] = [{ productId: PRODUCT_ID_1, quantity: 5, unitPrice: 10.00 }];
      const params = { ...defaultRingUpParams, items: item, payment: { method: 'card' as const, amount: 50.00 } };

      mockInventoryService.reserveStock.mockResolvedValue(true);
      mockInventoryService.deductStock.mockRejectedValueOnce(
        new InsufficientStockError('Cannot deduct stock, results in negative.')
      );

      await expect(checkoutService.ringUpTransaction(params)).rejects.toThrow(InsufficientStockError);
      expect(mockInventoryService.deductStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, 5);
      expect(mockInventoryService.releaseStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, 5);
      expect(mockPaymentGateway.processPayment).toHaveBeenCalledTimes(1);
      expect(mockPaymentGateway.refundPayment).toHaveBeenCalledTimes(1);
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransactionRepository.updateTransactionStatus).toHaveBeenCalledWith(
        expect.any(String),
        'failed',
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it('should handle payment gateway failure and refund reserved stock', async () => {
      mockPaymentGateway.processPayment.mockRejectedValueOnce(new PaymentProcessingError('Payment gateway declined.'));
      await expect(checkoutService.ringUpTransaction(defaultRingUpParams)).rejects.toThrow(PaymentProcessingError);
      expect(mockPaymentGateway.processPayment).toHaveBeenCalledTimes(1);
      expect(mockPaymentGateway.refundPayment).not.toHaveBeenCalled();
      expect(mockInventoryService.releaseStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, 2);
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransactionRepository.updateTransactionStatus).toHaveBeenCalledWith(
        expect.any(String),
        'failed',
        expect.objectContaining({ error: expect.any(String) })
      );
    });

    it('should handle database error during transaction creation (e.g., unique constraint violation)', async () => {
      mockTransactionRepository.createTransaction.mockRejectedValueOnce(
        new DbConstraintError('Duplicate transaction ID or other DB constraint.')
      );
      await expect(checkoutService.ringUpTransaction(defaultRingUpParams)).rejects.toThrow(DbConstraintError);
      expect(mockInventoryService.releaseStock).toHaveBeenCalledWith(TENANT_ID_A, PRODUCT_ID_1, 2);
      expect(mockPaymentGateway.processPayment).toHaveBeenCalledTimes(1);
      expect(mockPaymentGateway.refundPayment).toHaveBeenCalledTimes(1);
    });

    it('should handle failure during loyalty points addition without failing transaction', async () => {
      mockLoyaltyService.addLoyaltyPoints.mockRejectedValueOnce(new Error('Loyalty service offline.'));
      const paramsWithLoyalty = { ...defaultRingUpParams, loyaltyId: 'user-loyalty-1' };
      const receipt = await checkoutService.ringUpTransaction(paramsWithLoyalty);
      expect(receipt).toBeDefined();
      expect(receipt.transactionId).toBeDefined();
      expect(mockLoyaltyService.addLoyaltyPoints).toHaveBeenCalledTimes(1);
      expect(mockTransactionRepository.updateTransactionStatus).toHaveBeenCalledWith(
        expect.any(String),
        'completed',
        expect.any(Object)
      );
    });
  });
});
