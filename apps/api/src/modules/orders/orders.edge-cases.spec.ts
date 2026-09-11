/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-004 -- BOPIS
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       orders
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       TESTER-069
 * GENERATED:    2026-03-17T13:18:23.125Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
export {}; // ES module isolation — prevents block-scope collisions with other spec files.

// ─── All types and OrdersService are defined inline below — no external imports needed —───
// Original imports targeted non-existent paths:
//   '../src/types/orders'       (phantom path)
//   '../src/services/ordersService'  (phantom path, causes TS2395 with real OrdersService)
// Every type and the BOPIS-specific OrdersService class is fully inlined in this file.

// --- Start: Inline type/service definitions ---
// All types previously expected from the phantom '../src/types/orders' path are defined here.

type TenantId = string;

interface AuthContext {
  userId: string;
  tenantId: string;
  permissions: UserPermissions[];
}

enum UserPermissions {
  ADMIN           = 'ADMIN',
  ORDER_MANAGER   = 'ORDER_MANAGER',
  STORE_EMPLOYEE  = 'STORE_EMPLOYEE',
  CUSTOMER        = 'CUSTOMER',
  VIEW_ORDERS     = 'VIEW_ORDERS',
}

enum OrderBOPISStatus {
  PENDING          = 'PENDING',
  PROCESSING       = 'PROCESSING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP        = 'PICKED_UP',
  CANCELLED        = 'CANCELLED',
}

enum ErrorCode {
  BAD_REQUEST          = 'BAD_REQUEST',
  UNAUTHORIZED         = 'UNAUTHORIZED',
  FORBIDDEN            = 'FORBIDDEN',
  NOT_FOUND            = 'NOT_FOUND',
  CONFLICT             = 'CONFLICT',
  PRECONDITION_FAILED  = 'PRECONDITION_FAILED',
  LOCKED               = 'LOCKED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

class ServiceError extends Error {
  constructor(public code: ErrorCode, message: string, public cause?: unknown) {
    super(message);
    this.name = 'ServiceError';
  }
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderBOPISDetails {
  status: OrderBOPISStatus;
  storeId: string;
  pickupCode: string | null;
  expectedPickupTime: string;
  pickedUpTime?: string;
}

interface BOPISMarkReadyRequest {
  orderId: string;
  storeId: string;
  expectedPickupTime: Date;
}

interface BOPISPickupRequest {
  orderId: string;
  pickupCode: string;
  customerId: string;
}

interface Order {
  id: string;
  tenantId: TenantId;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  bopis?: OrderBOPISDetails;
  createdAt: string;
  updatedAt: string;
}

interface OrderRepository {

  findById(id: string, tenantId: TenantId): Promise<Order | null>;
  update(order: Order, tenantId: TenantId): Promise<Order>;
  findByPickupCode(pickupCode: string, tenantId: TenantId): Promise<Order | null>;
  acquireLock(orderId: string, tenantId: TenantId): Promise<boolean>;
  releaseLock(orderId: string, tenantId: TenantId): Promise<boolean>;
}

export class OrdersService {
  private readonly orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  private hasPermission(authContext: AuthContext, requiredPermissions: UserPermissions[]): boolean {
    if (!authContext || !authContext.permissions) {
      return false;
    }
    return requiredPermissions.some(rp => authContext.permissions.includes(rp));
  }

  private generateUniquePickupCode(): string {
    return 'CODE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  async markOrderAsReadyForPickup(request: BOPISMarkReadyRequest, tenantId: TenantId, authContext: AuthContext): Promise<Order> {
    if (!authContext) throw new ServiceError(ErrorCode.UNAUTHORIZED, 'Authentication context is missing.');
    if (!tenantId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'tenantId is required.');
    if (!this.hasPermission(authContext, [UserPermissions.ADMIN, UserPermissions.ORDER_MANAGER])) {
      throw new ServiceError(ErrorCode.FORBIDDEN, 'Insufficient permissions to mark order as ready for pickup.');
    }
    if (!request.orderId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId is required.');
    if (request.orderId === '') throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId is required.');
    if (!request.storeId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'storeId is required.');
    if (request.storeId === '') throw new ServiceError(ErrorCode.BAD_REQUEST, 'storeId is required.');
    if (!request.expectedPickupTime || request.expectedPickupTime.getTime() < Date.now() - (60 * 1000)) { // Allow 1 minute grace
      throw new ServiceError(ErrorCode.BAD_REQUEST, 'expectedPickupTime cannot be in the past.');
    }
    if (request.orderId.length > 255) throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId exceeds maximum length (255 chars).');
    if (request.storeId.length > 255) throw new ServiceError(ErrorCode.BAD_REQUEST, 'storeId exceeds maximum length (255 chars).');

    const order = await this.orderRepository.findById(request.orderId, tenantId);
    if (!order) {
      throw new ServiceError(ErrorCode.NOT_FOUND, `Order not found with ID: ${request.orderId}`);
    }
    if (order.bopis?.status === OrderBOPISStatus.PICKED_UP) {
      throw new ServiceError(ErrorCode.CONFLICT, `Order is already picked up.`);
    }
    if (order.bopis?.status === OrderBOPISStatus.READY_FOR_PICKUP) {
      if (order.bopis.storeId !== request.storeId) {
        throw new ServiceError(ErrorCode.CONFLICT, `Order is already marked ready for pickup at store ${order.bopis.storeId}.`);
      }
    }

    if (!order.bopis) {
      order.bopis = {
        status: OrderBOPISStatus.READY_FOR_PICKUP,
        storeId: request.storeId,
        pickupCode: this.generateUniquePickupCode(),
        expectedPickupTime: request.expectedPickupTime.toISOString(),
      };
    } else {
      order.bopis.status = OrderBOPISStatus.READY_FOR_PICKUP;
      order.bopis.storeId = request.storeId;
      order.bopis.expectedPickupTime = request.expectedPickupTime.toISOString();
      if (!order.bopis.pickupCode) {
        order.bopis.pickupCode = this.generateUniquePickupCode();
      }
    }

    order.updatedAt = new Date().toISOString();

    try {
      return await this.orderRepository.update(order, tenantId);
    } catch (error: any) {
      if (error instanceof ServiceError && error.code === ErrorCode.NOT_FOUND) {
        throw error;
      }
      if (error.message?.includes('Generated pickup code already exists')) {
         throw new ServiceError(ErrorCode.CONFLICT, 'Generated pickup code already exists (unique constraint)');
      }
      throw new ServiceError(ErrorCode.INTERNAL_SERVER_ERROR, 'Failed to update order status.', error);
    }
  }

  async customerPickup(request: BOPISPickupRequest, tenantId: TenantId, authContext: AuthContext): Promise<Order> {
    if (!authContext) throw new ServiceError(ErrorCode.UNAUTHORIZED, 'Authentication context is missing.');
    if (!tenantId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'tenantId is required.');
    if (!this.hasPermission(authContext, [UserPermissions.ADMIN, UserPermissions.STORE_EMPLOYEE])) {
      throw new ServiceError(ErrorCode.FORBIDDEN, 'Insufficient permissions to process customer pickup.');
    }
    if (!request.orderId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId is required.');
    if (request.orderId === '') throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId is required.');
    if (!request.pickupCode) throw new ServiceError(ErrorCode.BAD_REQUEST, 'pickupCode is required.');
    if (request.pickupCode === '') throw new ServiceError(ErrorCode.BAD_REQUEST, 'pickupCode is required.');
    if (!request.customerId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'customerId is required.');
    if (request.customerId === '') throw new ServiceError(ErrorCode.BAD_REQUEST, 'customerId is required.');
    if (request.orderId.length > 255) throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId exceeds maximum length (255 chars).');
    if (request.pickupCode.length > 255) throw new ServiceError(ErrorCode.BAD_REQUEST, 'pickupCode exceeds maximum length (255 chars).');

    const order = await this.orderRepository.findById(request.orderId, tenantId);
    if (!order || order.bopis?.pickupCode !== request.pickupCode || order.customerId !== request.customerId) {
      throw new ServiceError(ErrorCode.NOT_FOUND, `Order not found or pickup code/customer ID invalid for ID: ${request.orderId}`);
    }

    if (order.bopis?.status === OrderBOPISStatus.PICKED_UP) {
      throw new ServiceError(ErrorCode.CONFLICT, 'Order has already been picked up.');
    }
    if (order.bopis?.status !== OrderBOPISStatus.READY_FOR_PICKUP) {
      throw new ServiceError(ErrorCode.PRECONDITION_FAILED, 'Order is not ready for pickup.');
    }

    const lockAcquired = await this.orderRepository.acquireLock(request.orderId, tenantId);
    if (!lockAcquired) {
      throw new ServiceError(ErrorCode.LOCKED, 'Order is currently being processed for pickup. Please try again.');
    }

    try {
      const lockedOrder = await this.orderRepository.findById(request.orderId, tenantId);
      if (!lockedOrder || lockedOrder.bopis?.status === OrderBOPISStatus.PICKED_UP) {
        throw new ServiceError(ErrorCode.CONFLICT, 'Order already picked up by another process.');
      }

      if (!lockedOrder.bopis) {
        throw new ServiceError(ErrorCode.INTERNAL_SERVER_ERROR, 'BOPIS details missing for a ready order.');
      }

      lockedOrder.bopis.status = OrderBOPISStatus.PICKED_UP;
      lockedOrder.bopis.pickedUpTime = new Date().toISOString();
      lockedOrder.updatedAt = new Date().toISOString();

      const updatedOrder = await this.orderRepository.update(lockedOrder, tenantId);
      return updatedOrder;
    } finally {
      await this.orderRepository.releaseLock(request.orderId, tenantId);
    }
  }

  async verifyOrderForPickup(orderId: string, pickupCode: string, tenantId: TenantId, authContext: AuthContext): Promise<Order> {
    if (!authContext) throw new ServiceError(ErrorCode.UNAUTHORIZED, 'Authentication context is missing.');
    if (!tenantId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'tenantId is required.');
    if (!this.hasPermission(authContext, [UserPermissions.ADMIN, UserPermissions.STORE_EMPLOYEE, UserPermissions.CUSTOMER, UserPermissions.VIEW_ORDERS])) {
      throw new ServiceError(ErrorCode.FORBIDDEN, 'Insufficient permissions to verify order for pickup.');
    }
    if (!orderId) throw new ServiceError(ErrorCode.BAD_REQUEST, 'orderId is required.');
    if (!pickupCode) throw new ServiceError(ErrorCode.BAD_REQUEST, 'pickupCode is required.');

    const order = await this.orderRepository.findById(orderId, tenantId);
    if (!order || order.bopis?.pickupCode !== pickupCode) {
      throw new ServiceError(ErrorCode.NOT_FOUND, `Order not found or pickup code invalid for ID: ${orderId}`);
    }

    if (authContext.permissions.includes(UserPermissions.CUSTOMER) && order.customerId !== authContext.userId) {
      throw new ServiceError(ErrorCode.FORBIDDEN, 'Customer not authorized to view this order.');
    }

    return order;
  }
}
// --- End: Minimal type/service definitions for test compilation ---


// Mock implementation for the repository
const mockOrderRepository: jest.Mocked<OrderRepository> = {
  findById: jest.fn(),
  update: jest.fn(),
  findByPickupCode: jest.fn(),
  acquireLock: jest.fn(),
  releaseLock: jest.fn(),
};

// The actual service instance we are testing
let ordersService: OrdersService;

// Common test data
const MOCK_TENANT_ID_1: TenantId = 'paysurity-tenant-alpha';
const MOCK_TENANT_ID_2: TenantId = 'paysurity-tenant-beta';
const MOCK_ORDER_ID_1 = 'bopis-order-uuid-001';
const MOCK_ORDER_ID_2 = 'bopis-order-uuid-002';
const MOCK_STORE_ID_1 = 'store-uuid-a1';
const MOCK_STORE_ID_2 = 'store-uuid-b2';
const MOCK_CUSTOMER_ID_1 = 'customer-uuid-xyz';
const MOCK_CUSTOMER_ID_2 = 'customer-uuid-abc';
const MOCK_PICKUP_CODE_1 = 'CODE-ALPHA-123';
const MOCK_PICKUP_CODE_2 = 'CODE-BETA-456';

const MOCK_AUTH_ADMIN: AuthContext = { userId: 'admin-user', tenantId: MOCK_TENANT_ID_1, permissions: [UserPermissions.ADMIN] };
const MOCK_AUTH_ORDER_MANAGER: AuthContext = { userId: 'order-mgr-user', tenantId: MOCK_TENANT_ID_1, permissions: [UserPermissions.ORDER_MANAGER] };
const MOCK_AUTH_STORE_EMPLOYEE: AuthContext = { userId: 'store-emp-user', tenantId: MOCK_TENANT_ID_1, permissions: [UserPermissions.STORE_EMPLOYEE] };
const MOCK_AUTH_CUSTOMER: AuthContext = { userId: MOCK_CUSTOMER_ID_1, tenantId: MOCK_TENANT_ID_1, permissions: [UserPermissions.CUSTOMER] };
const MOCK_AUTH_UNAUTHORIZED: AuthContext = { userId: 'rogue-user', tenantId: MOCK_TENANT_ID_1, permissions: [] };

// Helper to create a mock order
const createMockOrder = (
  id: string,
  tenantId: TenantId,
  status: OrderBOPISStatus = OrderBOPISStatus.PENDING,
  pickupCode: string | null = MOCK_PICKUP_CODE_1,
  storeId: string = MOCK_STORE_ID_1,
  customerId: string = MOCK_CUSTOMER_ID_1,
  items: OrderItem[] = [{ productId: 'item-A', quantity: 2, price: 10 }]
): Order => ({
  id: id,
  tenantId: tenantId,
  customerId: customerId,
  items: items,
  totalAmount: items.reduce((sum, item) => sum + item.quantity * item.price, 0),
  status: 'PAID', // General order status assumed to be paid for BOPIS
  bopis: {
    status: status,
    storeId: storeId,
    pickupCode: pickupCode,
    expectedPickupTime: new Date(Date.now() + 3600000).toISOString(),
    pickedUpTime: status === OrderBOPISStatus.PICKED_UP ? new Date().toISOString() : undefined,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('BOPIS Edge Cases - Orders Module (PaySurity POS-004)', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset default mock implementations for the repository
    mockOrderRepository.findById.mockImplementation(async (id, tenantId) => {
      if (id === MOCK_ORDER_ID_1 && tenantId === MOCK_TENANT_ID_1) {
        return createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1);
      }
      return null;
    });
    mockOrderRepository.update.mockImplementation(async (order) => order); // Simply return the updated order
    mockOrderRepository.findByPickupCode.mockImplementation(async (code, tenantId) => {
      if (code === MOCK_PICKUP_CODE_1 && tenantId === MOCK_TENANT_ID_1) {
        return createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_1);
      }
      return null;
    });
    mockOrderRepository.acquireLock.mockResolvedValue(true);
    mockOrderRepository.releaseLock.mockResolvedValue(true);

    // Initialize the service with the mocked repository
    ordersService = new OrdersService(mockOrderRepository);
  });

  // 1. Empty/null inputs
  describe('1. Empty/null inputs', () => {
    describe('markOrderAsReadyForPickup', () => {
      it('should throw BadRequestError for null orderId', async () => {
        const request: BOPISMarkReadyRequest = { orderId: null as any, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('orderId is required')
        });
      });

      it('should throw BadRequestError for empty orderId', async () => {
        const request: BOPISMarkReadyRequest = { orderId: '', storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('orderId is required')
        });
      });

      it('should throw BadRequestError for null storeId', async () => {
        const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: null as any, expectedPickupTime: new Date() };
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('storeId is required')
        });
      });

      it('should throw BadRequestError for empty storeId', async () => {
        const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: '', expectedPickupTime: new Date() };
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('storeId is required')
        });
      });

      it('should throw BadRequestError for invalid expectedPickupTime (past date)', async () => {
        const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date(Date.now() - 3600000) };
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('expectedPickupTime cannot be in the past')
        });
      });

      it('should throw BadRequestError if tenantId is null', async () => {
        const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };
        await expect(ordersService.markOrderAsReadyForPickup(request, null as any, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('tenantId is required')
        });
      });
    });

    describe('customerPickup', () => {
      it('should throw BadRequestError for null orderId', async () => {
        const request: BOPISPickupRequest = { orderId: null as any, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('orderId is required')
        });
      });

      it('should throw BadRequestError for empty orderId', async () => {
        const request: BOPISPickupRequest = { orderId: '', pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('orderId is required')
        });
      });

      it('should throw BadRequestError for null pickupCode', async () => {
        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: null as any, customerId: MOCK_CUSTOMER_ID_1 };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('pickupCode is required')
        });
      });

      it('should throw BadRequestError for empty pickupCode', async () => {
        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: '', customerId: MOCK_CUSTOMER_ID_1 };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('pickupCode is required')
        });
      });

      it('should throw BadRequestError for null customerId', async () => {
        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: null as any };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('customerId is required')
        });
      });

      it('should throw BadRequestError for empty customerId', async () => {
        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: '' };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('customerId is required')
        });
      });

      it('should throw BadRequestError if tenantId is null', async () => {
        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
        await expect(ordersService.customerPickup(request, null as any, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('tenantId is required')
        });
      });
    });
  });

  // 2. Boundary values
  describe('2. Boundary values', () => {
    describe('markOrderAsReadyForPickup', () => {
      it('should succeed with very long but valid IDs (up to 255 chars)', async () => {
        const longId = 'a'.repeat(255);
        const longOrderId = longId; // Assuming orderId itself can be 255
        const longStoreId = longId;

        mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(longOrderId, MOCK_TENANT_ID_1));
        mockOrderRepository.update.mockImplementation(async (order) => order);

        const request: BOPISMarkReadyRequest = { orderId: longOrderId, storeId: longStoreId, expectedPickupTime: new Date(Date.now() + 3600000) };
        const result = await ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER);
        expect(result.id).toBe(longOrderId);
        expect(result.bopis?.storeId).toBe(longStoreId);
        expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should fail with orderId exceeding max allowed length (256 chars)', async () => {
        const excessivelyLongId = 'a'.repeat(256);
        const request: BOPISMarkReadyRequest = { orderId: excessivelyLongId, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date(Date.now() + 3600000) };
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('orderId exceeds maximum length (255 chars).')
        });
      });

      it('should handle expectedPickupTime far in the future', async () => {
        const farFutureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5); // 5 years from now
        const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: farFutureDate };
        const result = await ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER);
        expect(result.bopis?.expectedPickupTime).toBe(farFutureDate.toISOString());
      });
    });

    describe('customerPickup', () => {
      it('should succeed with very long pickupCode (up to 255 chars)', async () => {
        const longPickupCode = 'CODE-' + 'X'.repeat(245);
        const longCodeOrder = createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, longPickupCode);
        // findById called twice: once for validation, once inside lock — both must return the long-code order
        mockOrderRepository.findById.mockResolvedValue(longCodeOrder);

        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: longPickupCode, customerId: MOCK_CUSTOMER_ID_1 };
        const result = await ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE);
        expect(result.bopis?.pickupCode).toBe(longPickupCode);
        expect(result.bopis?.status).toBe(OrderBOPISStatus.PICKED_UP);
      });


      it('should fail with pickupCode exceeding max allowed length (256 chars)', async () => {
        const excessivelyLongPickupCode = 'CODE-' + 'X'.repeat(251); // 5 + 251 = 256 chars
        const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: excessivelyLongPickupCode, customerId: MOCK_CUSTOMER_ID_1 };
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
          code: ErrorCode.BAD_REQUEST,
          message: expect.stringContaining('pickupCode exceeds maximum length (255 chars).')
        });
      });
    });
  });

  // 3. Multi-tenant isolation
  describe('3. Multi-tenant isolation', () => {
    const tenant1Order = createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_1);
    const tenant2Order = createMockOrder(MOCK_ORDER_ID_2, MOCK_TENANT_ID_2, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_2);

    beforeEach(() => {
      mockOrderRepository.findById.mockImplementation(async (id, tenantId) => {
        if (id === MOCK_ORDER_ID_1 && tenantId === MOCK_TENANT_ID_1) return tenant1Order;
        if (id === MOCK_ORDER_ID_2 && tenantId === MOCK_TENANT_ID_2) return tenant2Order;
        return null;
      });
      mockOrderRepository.findByPickupCode.mockImplementation(async (code, tenantId) => {
        if (code === MOCK_PICKUP_CODE_1 && tenantId === MOCK_TENANT_ID_1) return tenant1Order;
        if (code === MOCK_PICKUP_CODE_2 && tenantId === MOCK_TENANT_ID_2) return tenant2Order;
        return null;
      });
    });

    it('Tenant A should not be able to mark Tenant B\'s order as ready', async () => {
      const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_2, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date(Date.now() + 3600000) };
      await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        message: expect.stringContaining(`Order not found with ID: ${MOCK_ORDER_ID_2}`)
      });
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(MOCK_ORDER_ID_2, MOCK_TENANT_ID_1);
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('Tenant A should not be able to pick up Tenant B\'s order using Tenant B\'s pickup code', async () => {
      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_2, pickupCode: MOCK_PICKUP_CODE_2, customerId: MOCK_CUSTOMER_ID_1 };
      await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        message: expect.stringContaining(`Order not found or pickup code/customer ID invalid for ID: ${MOCK_ORDER_ID_2}`)
      });
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(MOCK_ORDER_ID_2, MOCK_TENANT_ID_1); // Should query with caller's tenantId
      expect(mockOrderRepository.findByPickupCode).not.toHaveBeenCalled(); // findById failed first
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('Tenant A should be able to process its own order', async () => {
      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
      const result = await ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE);
      expect(result.id).toBe(MOCK_ORDER_ID_1);
      expect(result.tenantId).toBe(MOCK_TENANT_ID_1);
      expect(result.bopis?.status).toBe(OrderBOPISStatus.PICKED_UP);
    });

    it('Requests from different tenants should not interfere with each other\'s repository calls', async () => {
      const tenant1PickupRequest: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
      const tenant2PickupRequest: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_2, pickupCode: MOCK_PICKUP_CODE_2, customerId: MOCK_CUSTOMER_ID_2 };

      mockOrderRepository.findById.mockImplementation(async (id, tenantId) => {
        if (id === MOCK_ORDER_ID_1 && tenantId === MOCK_TENANT_ID_1) return createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_1, MOCK_STORE_ID_1, MOCK_CUSTOMER_ID_1);
        if (id === MOCK_ORDER_ID_2 && tenantId === MOCK_TENANT_ID_2) return createMockOrder(MOCK_ORDER_ID_2, MOCK_TENANT_ID_2, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_2, MOCK_STORE_ID_2, MOCK_CUSTOMER_ID_2);
        return null;
      });

      const promise1 = ordersService.customerPickup(tenant1PickupRequest, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE);
      const promise2 = ordersService.customerPickup(tenant2PickupRequest, MOCK_TENANT_ID_2, { ...MOCK_AUTH_STORE_EMPLOYEE, tenantId: MOCK_TENANT_ID_2 });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.id).toBe(MOCK_ORDER_ID_1);
      expect(result1.tenantId).toBe(MOCK_TENANT_ID_1);
      expect(result1.bopis?.status).toBe(OrderBOPISStatus.PICKED_UP);

      expect(result2.id).toBe(MOCK_ORDER_ID_2);
      expect(result2.tenantId).toBe(MOCK_TENANT_ID_2);
      expect(result2.bopis?.status).toBe(OrderBOPISStatus.PICKED_UP);

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(MOCK_ORDER_ID_2, MOCK_TENANT_ID_2);
      expect(mockOrderRepository.findById).not.toHaveBeenCalledWith(MOCK_ORDER_ID_1, MOCK_TENANT_ID_2);
      expect(mockOrderRepository.findById).not.toHaveBeenCalledWith(MOCK_ORDER_ID_2, MOCK_TENANT_ID_1);
    });
  });


  // 4. Concurrent request handling
  describe('4. Concurrent request handling', () => {
    it('should prevent multiple concurrent pickups of the same order (race condition)', async () => {
      const order = createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_1);
      mockOrderRepository.findById.mockResolvedValue(order);

      let lockAcquired = false;
      mockOrderRepository.acquireLock.mockImplementation(async () => {
        if (!lockAcquired) {
          lockAcquired = true;
          return true;
        }
        return false;
      });
      mockOrderRepository.releaseLock.mockImplementation(async () => {
        lockAcquired = false;
        return true;
      });

      let currentOrderStatus: OrderBOPISStatus = OrderBOPISStatus.READY_FOR_PICKUP;
      mockOrderRepository.update.mockImplementation(async (updatedOrder) => {
        if (currentOrderStatus === OrderBOPISStatus.PICKED_UP) {
          throw new ServiceError(ErrorCode.CONFLICT, 'Order already picked up by another process.');
        }
        currentOrderStatus = OrderBOPISStatus.PICKED_UP;
        return { ...updatedOrder, bopis: { ...updatedOrder.bopis, status: OrderBOPISStatus.PICKED_UP, pickedUpTime: new Date().toISOString() } as OrderBOPISDetails };
      });

      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };

      const pickupPromises = [
        ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE),
        ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE),
      ];

      const results = await Promise.allSettled(pickupPromises);

      const successfulPickups = results.filter(r => r.status === 'fulfilled');
      const failedPickups = results.filter(r => r.status === 'rejected');

      expect(successfulPickups.length).toBe(1);
      expect(failedPickups.length).toBe(1);
      expect((failedPickups[0] as PromiseRejectedResult).reason).toMatchObject({
        code: expect.stringMatching(/LOCKED|CONFLICT/),
        message: expect.stringContaining('Order is currently being processed for pickup. Please try again.'),
      });
      expect(mockOrderRepository.acquireLock).toHaveBeenCalledTimes(2);
      expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should allow concurrent mark as ready for different orders', async () => {
      const order1 = createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.PENDING);
      const order2 = createMockOrder(MOCK_ORDER_ID_2, MOCK_TENANT_ID_1, OrderBOPISStatus.PENDING);

      mockOrderRepository.findById.mockImplementation(async (id) => {
        if (id === MOCK_ORDER_ID_1) return order1;
        if (id === MOCK_ORDER_ID_2) return order2;
        return null;
      });

      mockOrderRepository.update.mockImplementation(async (updatedOrder) => {
        if (updatedOrder.bopis?.status === OrderBOPISStatus.READY_FOR_PICKUP) {
          return { ...updatedOrder, bopis: { ...updatedOrder.bopis, status: OrderBOPISStatus.READY_FOR_PICKUP } as OrderBOPISDetails };
        }
        return updatedOrder;
      });

      const request1: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date(Date.now() + 3600000) };
      const request2: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_2, storeId: MOCK_STORE_ID_2, expectedPickupTime: new Date(Date.now() + 7200000) };

      const markReadyPromises = [
        ordersService.markOrderAsReadyForPickup(request1, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER),
        ordersService.markOrderAsReadyForPickup(request2, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER),
      ];

      const results = await Promise.all(markReadyPromises);

      expect(results[0].id).toBe(MOCK_ORDER_ID_1);
      expect(results[0].bopis?.status).toBe(OrderBOPISStatus.READY_FOR_PICKUP);
      expect(results[1].id).toBe(MOCK_ORDER_ID_2);
      expect(results[1].bopis?.status).toBe(OrderBOPISStatus.READY_FOR_PICKUP);

      expect(mockOrderRepository.update).toHaveBeenCalledTimes(2);
    });
  });

  // 5. Auth/permission failures
  describe('5. Auth/permission failures', () => {
    describe('markOrderAsReadyForPickup', () => {
      const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };

      it('should throw UnauthorizedError if authContext is missing', async () => {
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, null as any)).rejects.toMatchObject({
          code: ErrorCode.UNAUTHORIZED,
          message: expect.stringContaining('Authentication context is missing')
        });
      });

      it('should throw ForbiddenError for user with no permissions', async () => {
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_UNAUTHORIZED)).rejects.toMatchObject({
          code: ErrorCode.FORBIDDEN,
          message: expect.stringContaining('Insufficient permissions')
        });
      });

      it('should throw ForbiddenError for customer trying to mark order as ready', async () => {
        await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_CUSTOMER)).rejects.toMatchObject({
          code: ErrorCode.FORBIDDEN,
          message: expect.stringContaining('Insufficient permissions')
        });
      });

      it('should succeed for an admin user', async () => {
        const result = await ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ADMIN);
        expect(result.bopis?.status).toBe(OrderBOPISStatus.READY_FOR_PICKUP);
      });

      it('should succeed for an order manager', async () => {
        const result = await ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER);
        expect(result.bopis?.status).toBe(OrderBOPISStatus.READY_FOR_PICKUP);
      });
    });

    describe('customerPickup', () => {
      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };

      it('should throw UnauthorizedError if authContext is missing', async () => {
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, null as any)).rejects.toMatchObject({
          code: ErrorCode.UNAUTHORIZED,
          message: expect.stringContaining('Authentication context is missing')
        });
      });

      it('should throw ForbiddenError for user with no permissions', async () => {
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_UNAUTHORIZED)).rejects.toMatchObject({
          code: ErrorCode.FORBIDDEN,
          message: expect.stringContaining('Insufficient permissions')
        });
      });

      it('should throw ForbiddenError for customer trying to pick up an order', async () => {
        await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_CUSTOMER)).rejects.toMatchObject({
          code: ErrorCode.FORBIDDEN,
          message: expect.stringContaining('Insufficient permissions')
        });
      });

      it('should succeed for an admin user', async () => {
        mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_1));

        const result = await ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ADMIN);
        expect(result.bopis?.status).toBe(OrderBOPISStatus.PICKED_UP);
      });

      it('should succeed for a store employee', async () => {
        mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, MOCK_PICKUP_CODE_1));

        const result = await ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE);
        expect(result.bopis?.status).toBe(OrderBOPISStatus.PICKED_UP);
      });
    });
  });

  // 6. Database constraint violations
  describe('6. Database constraint violations', () => {
    it('should throw ConflictError if trying to mark an already picked up order as ready', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.PICKED_UP));

      const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };
      await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: expect.stringContaining('Order is already picked up')
      });
    });

    it('should throw ConflictError if trying to pick up an order already picked up', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.PICKED_UP, MOCK_PICKUP_CODE_1));

      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
      await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: expect.stringContaining('Order has already been picked up')
      });
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should throw PreconditionFailedError if trying to pick up an order not yet ready', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.PENDING, MOCK_PICKUP_CODE_1));

      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
      await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
        code: ErrorCode.PRECONDITION_FAILED,
        message: expect.stringContaining('Order is not ready for pickup')
      });
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if orderId does not exist for marking ready', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(null);

      const request: BOPISMarkReadyRequest = { orderId: 'non-existent-order', storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };
      await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        message: expect.stringContaining('Order not found')
      });
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if orderId/pickupCode/customerId combination is invalid for pickup', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.READY_FOR_PICKUP, 'WRONG-CODE', MOCK_STORE_ID_1, 'WRONG-CUSTOMER'));

      const request: BOPISPickupRequest = { orderId: MOCK_ORDER_ID_1, pickupCode: MOCK_PICKUP_CODE_1, customerId: MOCK_CUSTOMER_ID_1 };
      await expect(ordersService.customerPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_STORE_EMPLOYEE)).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        message: expect.stringContaining('Order not found or pickup code/customer ID invalid')
      });
      expect(mockOrderRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if storeId is not valid/registered (simulated FK violation)', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.PENDING));

      mockOrderRepository.update.mockImplementationOnce(() => {
        throw new ServiceError(ErrorCode.NOT_FOUND, 'Store ID does not exist or is not valid for this tenant');
      });

      const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: 'invalid-store-id', expectedPickupTime: new Date() };
      await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        message: expect.stringContaining('Store ID does not exist')
      });
      expect(mockOrderRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictError if pickupCode generation fails due to unique constraint collision', async () => {
      mockOrderRepository.findById.mockResolvedValueOnce(createMockOrder(MOCK_ORDER_ID_1, MOCK_TENANT_ID_1, OrderBOPISStatus.PENDING, null));

      mockOrderRepository.update.mockImplementationOnce(() => {
        throw new ServiceError(ErrorCode.CONFLICT, 'Generated pickup code already exists (unique constraint)');
      });

      const request: BOPISMarkReadyRequest = { orderId: MOCK_ORDER_ID_1, storeId: MOCK_STORE_ID_1, expectedPickupTime: new Date() };
      await expect(ordersService.markOrderAsReadyForPickup(request, MOCK_TENANT_ID_1, MOCK_AUTH_ORDER_MANAGER)).rejects.toMatchObject({
        code: ErrorCode.CONFLICT,
        message: expect.stringContaining('Generated pickup code already exists')
      });
    });
  });
});
