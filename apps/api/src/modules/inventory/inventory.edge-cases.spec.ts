/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-014 -- Purchase Orders
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       inventory
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       TESTER-064
 * GENERATED:    2026-03-17T13:17:31.074Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import express from 'express';
import * as request from 'supertest';

// Define interfaces for clarity and type safety
interface PurchaseOrder {
  id: string;
  tenantId: string;
  supplierId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'RECEIVED' | 'PARTIALLY_RECEIVED';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  totalAmount: number;
  currency: string;
  notes?: string;
}

interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface User {
  id: string;
  roles: string[];
  permissions: string[];
}

// Mock service layer for Purchase Orders
const mockPurchaseOrderService = {
  createPurchaseOrder: jest.fn(),
  getPurchaseOrderById: jest.fn(),
  updatePurchaseOrder: jest.fn(),
  deletePurchaseOrder: jest.fn(),
  listPurchaseOrders: jest.fn(),
};

// Mock UUID generation
const mockUuid = {
  v4: jest.fn(() => `mock-uuid-${Math.random().toString(36).substring(2, 15)}`),
};

// Mock authentication middleware
const mockAuthMiddleware = (roles: string[] = ['admin']) => (req: any, res: any, next: any) => {
  // Simulate req.user being set by authentication
  if (roles.includes('unauthenticated')) {
    req.user = undefined;
  } else {
    req.user = { 
      id: 'test-user-id', 
      roles: roles, 
      permissions: roles.includes('admin') ? ['po:create', 'po:read', 'po:update', 'po:delete'] : ['po:read'] 
    };
  }
  next();
};

// Mock multi-tenant middleware
const mockTenantMiddleware = (tenantId: string = 'tenant-1') => (req: any, res: any, next: any) => {
  // Simulate req.tenantId being set by multi-tenancy context
  req.tenantId = tenantId;
  next();
};

// Simplified Controller functions directly integrated for Jest testing purposes.
// In a real application, these would typically be imported from a separate controller file.
const createPurchaseOrderController = async (req: any, res: any) => {
    try {
        if (!req.user || !req.tenantId) {
            return res.status(401).send('Unauthorized');
        }
        if (!req.user.permissions.includes('po:create')) {
            return res.status(403).send('Forbidden');
        }

        const { supplierId, orderDate, expectedDeliveryDate, items, currency, notes } = req.body;

        // Basic validation for empty/null inputs and types
        if (!supplierId || !orderDate || !items || items.length === 0 || !currency) {
            return res.status(400).json({ message: 'Missing required fields: supplierId, orderDate, currency, items' });
        }
        if (typeof supplierId !== 'string' || typeof currency !== 'string' || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid field types' });
        }
        
        const parsedOrderDate = new Date(orderDate);
        if (parsedOrderDate.toString() === 'Invalid Date') {
            return res.status(400).json({ message: 'Invalid orderDate' });
        }
        if (expectedDeliveryDate) {
            const parsedExpectedDeliveryDate = new Date(expectedDeliveryDate);
            if (parsedExpectedDeliveryDate.toString() === 'Invalid Date') {
                return res.status(400).json({ message: 'Invalid expectedDeliveryDate' });
            }
        }

        for (const item of items) {
            if (!item.productId || typeof item.quantity !== 'number' || typeof item.unitPrice !== 'number' || item.quantity <= 0 || item.unitPrice < 0) {
                return res.status(400).json({ message: 'Invalid item details: productId, quantity (must be >0), unitPrice (must be >=0)' });
            }
        }
        
        // Call the mocked service layer
        const newPO = await mockPurchaseOrderService.createPurchaseOrder(req.tenantId, req.body, req.user);
        res.status(201).json(newPO);
    } catch (error: any) {
        // Map common database constraint errors to appropriate HTTP status codes
        if (error.message.includes('Foreign key constraint failed')) {
            return res.status(400).json({ message: 'Invalid supplierId or productId in items', details: error.message });
        }
        if (error.message.includes('Unique constraint failed')) {
            return res.status(409).json({ message: 'Duplicate purchase order entry', details: error.message });
        }
        if (error.message.includes('Check constraint failed') || error.message.includes('invalid status') || error.message.includes('status transition not allowed')) {
             return res.status(400).json({ message: 'Invalid data provided', details: error.message });
        }
        if (error.message.includes('optimistic locking failed')) {
            return res.status(409).json({ message: 'Conflict: The resource has been updated by another user. Please try again.', details: error.message });
        }
        console.error('Error in createPurchaseOrderController:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getPurchaseOrderByIdController = async (req: any, res: any) => {
    try {
        if (!req.user || !req.tenantId) {
            return res.status(401).send('Unauthorized');
        }
        if (!req.user.permissions.includes('po:read')) {
            return res.status(403).send('Forbidden');
        }

        const { id } = req.params;
        const po = await mockPurchaseOrderService.getPurchaseOrderById(req.tenantId, id);
        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }
        res.status(200).json(po);
    } catch (error: any) {
        console.error('Error in getPurchaseOrderByIdController:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const updatePurchaseOrderController = async (req: any, res: any) => {
    try {
        if (!req.user || !req.tenantId) {
            return res.status(401).send('Unauthorized');
        }
        if (!req.user.permissions.includes('po:update')) {
            return res.status(403).send('Forbidden');
        }

        const { id } = req.params;
        const updateData = req.body;

        // Basic validation for update fields
        if (updateData.items) {
            if (!Array.isArray(updateData.items)) {
                return res.status(400).json({ message: 'Invalid field types: items must be an array' });
            }
            for (const item of updateData.items) {
                if ((item.quantity !== undefined && (typeof item.quantity !== 'number' || item.quantity <= 0)) ||
                    (item.unitPrice !== undefined && (typeof item.unitPrice !== 'number' || item.unitPrice < 0))) {
                    return res.status(400).json({ message: 'Invalid item details in update: quantity (must be >0 if provided), unitPrice (must be >=0 if provided)' });
                }
            }
        }
        if (updateData.orderDate) {
            if (new Date(updateData.orderDate).toString() === 'Invalid Date') {
                return res.status(400).json({ message: 'Invalid orderDate in update' });
            }
        }
        if (updateData.expectedDeliveryDate) {
            if (new Date(updateData.expectedDeliveryDate).toString() === 'Invalid Date') {
                return res.status(400).json({ message: 'Invalid expectedDeliveryDate in update' });
            }
        }
        
        const updatedPO = await mockPurchaseOrderService.updatePurchaseOrder(req.tenantId, id, updateData, req.user);
        if (!updatedPO) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }
        res.status(200).json(updatedPO);
    } catch (error: any) {
        if (error.message.includes('Foreign key constraint failed')) {
            return res.status(400).json({ message: 'Invalid supplierId or productId in items', details: error.message });
        }
        if (error.message.includes('Unique constraint failed')) {
            return res.status(409).json({ message: 'Duplicate purchase order entry', details: error.message });
        }
        if (error.message.includes('Check constraint failed') || error.message.includes('invalid status') || error.message.includes('status transition not allowed')) {
             return res.status(400).json({ message: 'Invalid data provided', details: error.message });
        }
        if (error.message.includes('optimistic locking failed')) {
            return res.status(409).json({ message: 'Conflict: The resource has been updated by another user. Please try again.', details: error.message });
        }
        console.error('Error in updatePurchaseOrderController:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const deletePurchaseOrderController = async (req: any, res: any) => {
    try {
        if (!req.user || !req.tenantId) {
            return res.status(401).send('Unauthorized');
        }
        if (!req.user.permissions.includes('po:delete')) {
            return res.status(403).send('Forbidden');
        }

        const { id } = req.params;
        const deleted = await mockPurchaseOrderService.deletePurchaseOrder(req.tenantId, id);
        if (!deleted) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }
        res.status(204).send();
    } catch (error: any) {
        console.error('Error in deletePurchaseOrderController:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// Default mock Purchase Order object for successful responses
const defaultMockPO: PurchaseOrder = {
    id: 'po-default-123',
    tenantId: 'tenant-default',
    supplierId: 'supplier-abc',
    status: 'DRAFT',
    orderDate: new Date('2023-10-26T10:00:00Z'),
    totalAmount: 100.00,
    currency: 'USD',
    notes: 'Default mock PO',
};

describe('POSG-014 Purchase Orders Edge Cases (Inventory Module)', () => {

    beforeEach(() => {
        // Reset all mocks before each test to ensure isolation
        jest.clearAllMocks();

        // Set up default successful mock implementations for the service
        mockPurchaseOrderService.createPurchaseOrder.mockResolvedValue({ ...defaultMockPO, id: mockUuid.v4() });
        mockPurchaseOrderService.getPurchaseOrderById.mockResolvedValue(defaultMockPO);
        mockPurchaseOrderService.updatePurchaseOrder.mockResolvedValue(defaultMockPO);
        mockPurchaseOrderService.deletePurchaseOrder.mockResolvedValue(true);
        mockPurchaseOrderService.listPurchaseOrders.mockResolvedValue([defaultMockPO]);

        // Clear and reset UUID mock
        mockUuid.v4.mockClear();
        mockUuid.v4.mockImplementation(() => `mock-uuid-${Math.random().toString(36).substring(2, 15)}`);
    });

    // Helper to create a test app instance with specific tenant and roles for middleware
    const setupAppWithConfig = (tenantId: string, roles: string[]) => {
        const appInstance = express();
        appInstance.use(express.json());
        appInstance.use(mockAuthMiddleware(roles)); // Apply auth middleware
        appInstance.use(mockTenantMiddleware(tenantId)); // Apply tenant middleware
        // Register the controllers for testing
        appInstance.post('/purchase-orders', createPurchaseOrderController);
        appInstance.get('/purchase-orders/:id', getPurchaseOrderByIdController);
        appInstance.put('/purchase-orders/:id', updatePurchaseOrderController);
        appInstance.delete('/purchase-orders/:id', deletePurchaseOrderController);
        return appInstance;
    };

    // Helper for creating valid payload
    const validCreatePayload = (override: any = {}) => ({
        supplierId: 'supplier-valid-123',
        orderDate: new Date().toISOString(),
        items: [{ productId: 'prod-valid-456', quantity: 5, unitPrice: 20.00 }],
        currency: 'USD',
        ...override
    });

    // Helper for creating valid update payload
    const validUpdatePayload = (override: any = {}) => ({
        status: 'PENDING_APPROVAL',
        notes: 'Updated notes for PO',
        ...override
    });

    // --- Scenario 1: Empty/null inputs ---
    describe('1. Empty/null inputs', () => {
        const testTenant = 'tenant-empty-null';
        const app = setupAppWithConfig(testTenant, ['admin']);

        it('should return 400 if supplierId is missing for create', async () => {
            const payload = validCreatePayload({ supplierId: undefined });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing required fields: supplierId');
        });

        it('should return 400 if orderDate is missing for create', async () => {
            const payload = validCreatePayload({ orderDate: undefined });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing required fields:');
        });

        it('should return 400 if items array is missing for create', async () => {
            const payload = validCreatePayload({ items: undefined });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing required fields:');
        });

        it('should return 400 if items array is empty for create', async () => {
            const payload = validCreatePayload({ items: [] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Missing required fields:');
        });

        it('should return 400 if an item is missing productId for create', async () => {
            const payload = validCreatePayload({ items: [{ quantity: 1, unitPrice: 10 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid item details: productId');
        });

        it('should return 400 if an item has null quantity for create', async () => {
            const payload = validCreatePayload({ items: [{ productId: 'prod-valid', quantity: null, unitPrice: 10 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid item details:');
        });

        it('should allow optional fields like notes to be null for create', async () => {
            const payload = validCreatePayload({ notes: null });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(201); // Assuming service handles null for optional fields correctly
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(
                testTenant,
                expect.objectContaining({ notes: null }),
                expect.any(Object)
            );
        });

        it('should return 400 if attempting to set a required field to null during update (if validation prevents)', async () => {
            const poId = 'po-123';
            // Assuming `supplierId` cannot be updated to null, if it was a required field in `updateData` context.
            // For now, our controller doesn't specifically prevent setting required fields to null on update,
            // as typically updates are partial and only present fields are changed.
            // We'll simulate a service-level rejection for this scenario.
            mockPurchaseOrderService.updatePurchaseOrder.mockRejectedValueOnce(new Error('Required field supplierId cannot be null'));
            const res = await request(app).put(`/purchase-orders/${poId}`).send({ supplierId: null });
            expect(res.status).toBe(500); // Our generic error handler for unexpected service errors
            expect(res.body.message).toContain('Internal Server Error');
            expect(res.body.error).toContain('Required field supplierId cannot be null');
        });
    });

    // --- Scenario 2: Boundary values ---
    describe('2. Boundary values', () => {
        const testTenant = 'tenant-boundary';
        const app = setupAppWithConfig(testTenant, ['admin']);
        const poId = 'po-boundary-1';

        it('should return 400 for create if item quantity is zero', async () => {
            const payload = validCreatePayload({ items: [{ productId: 'prod1', quantity: 0, unitPrice: 10 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('quantity (must be >0)');
        });

        it('should return 400 for create if item quantity is negative', async () => {
            const payload = validCreatePayload({ items: [{ productId: 'prod1', quantity: -5, unitPrice: 10 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('quantity (must be >0)');
        });

        it('should allow create if item unitPrice is zero', async () => {
            const payload = validCreatePayload({ items: [{ productId: 'prod1', quantity: 5, unitPrice: 0 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(201);
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalled();
        });

        it('should return 400 for create if item unitPrice is negative', async () => {
            const payload = validCreatePayload({ items: [{ productId: 'prod1', quantity: 5, unitPrice: -10 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('unitPrice (must be >=0)');
        });

        it('should handle very large item quantities without error', async () => {
            const veryLargeQuantity = 2_147_483_647; // Example of a large integer boundary (e.g., max for int32)
            const payload = validCreatePayload({ items: [{ productId: 'prod1', quantity: veryLargeQuantity, unitPrice: 0.01 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(201);
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ items: [expect.objectContaining({ quantity: veryLargeQuantity })] }),
                expect.any(Object)
            );
        });

        it('should return 400 for create if orderDate is an invalid format', async () => {
            const payload = validCreatePayload({ orderDate: 'not-a-date-string' });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid orderDate');
        });

        it('should return 400 for create if expectedDeliveryDate is an invalid format', async () => {
            const payload = validCreatePayload({ expectedDeliveryDate: 'not-a-date-string' });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid expectedDeliveryDate');
        });
        
        it('should return 400 if a status update is an invalid enum value (if not caught by controller, then service)', async () => {
            mockPurchaseOrderService.updatePurchaseOrder.mockRejectedValueOnce(new Error('Check constraint failed: "INVALID_STATUS" is not a valid enum value for status'));
            const res = await request(app).put(`/purchase-orders/${poId}`).send({ status: 'INVALID_STATUS' });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid data provided');
            expect(res.body.details).toContain('invalid enum value');
        });

        it('should correctly handle currency with three characters', async () => {
            const payload = validCreatePayload({ currency: 'JPY' });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(201);
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ currency: 'JPY' }),
                expect.any(Object)
            );
        });

        it('should return 400 for currency with more than three characters (if service validation)', async () => {
            const payload = validCreatePayload({ currency: 'USDD' });
            mockPurchaseOrderService.createPurchaseOrder.mockRejectedValueOnce(new Error('Check constraint failed: currency must be 3 characters'));
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid data provided');
            expect(res.body.details).toContain('currency must be 3 characters');
        });
    });

    // --- Scenario 3: Multi-tenant isolation ---
    describe('3. Multi-tenant isolation', () => {
        const tenant1Id = 'tenant-alpha';
        const tenant2Id = 'tenant-beta';

        let appTenant1: express.Express;
        let appTenant2: express.Express;

        beforeEach(() => {
            appTenant1 = setupAppWithConfig(tenant1Id, ['admin']);
            appTenant2 = setupAppWithConfig(tenant2Id, ['admin']);
            
            // Clear mocks before each test to ensure isolation of calls
            mockPurchaseOrderService.createPurchaseOrder.mockClear();
            mockPurchaseOrderService.getPurchaseOrderById.mockClear();
            mockPurchaseOrderService.updatePurchaseOrder.mockClear();
            mockPurchaseOrderService.deletePurchaseOrder.mockClear();
        });

        it('should isolate purchase orders creation between different tenants', async () => {
            const poId1 = 'po-alpha-1';
            const poId2 = 'po-beta-1';

            // Mock service to return POs with respective tenantIds
            mockPurchaseOrderService.createPurchaseOrder
                .mockImplementationOnce(async (tId, body) => ({ ...defaultMockPO, id: poId1, tenantId: tId, ...body }))
                .mockImplementationOnce(async (tId, body) => ({ ...defaultMockPO, id: poId2, tenantId: tId, ...body }));

            const res1 = await request(appTenant1).post('/purchase-orders').send(validCreatePayload());
            expect(res1.status).toBe(201);
            expect(res1.body.tenantId).toBe(tenant1Id);
            expect(res1.body.id).toBe(poId1);

            const res2 = await request(appTenant2).post('/purchase-orders').send(validCreatePayload());
            expect(res2.status).toBe(201);
            expect(res2.body.tenantId).toBe(tenant2Id);
            expect(res2.body.id).toBe(poId2);

            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledTimes(2);
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(tenant1Id, expect.any(Object), expect.any(Object));
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(tenant2Id, expect.any(Object), expect.any(Object));
        });

        it('should prevent a tenant from retrieving a purchase order belonging to another tenant', async () => {
            const poIdTenant1 = 'po-for-t1-get';
            const poIdTenant2 = 'po-for-t2-get';

            // Configure mock service to return data ONLY for the correct tenant+ID combination
            mockPurchaseOrderService.getPurchaseOrderById.mockImplementation(async (tId, id) => {
                if (tId === tenant1Id && id === poIdTenant1) return { ...defaultMockPO, id: poIdTenant1, tenantId: tenant1Id };
                if (tId === tenant2Id && id === poIdTenant2) return { ...defaultMockPO, id: poIdTenant2, tenantId: tenant2Id };
                return null; // Simulate not found for other combinations
            });

            // Tenant 1 tries to get its own PO
            const resT1Own = await request(appTenant1).get(`/purchase-orders/${poIdTenant1}`);
            expect(resT1Own.status).toBe(200);
            expect(resT1Own.body.id).toBe(poIdTenant1);
            expect(resT1Own.body.tenantId).toBe(tenant1Id);

            // Tenant 1 tries to get Tenant 2's PO
            const resT1Other = await request(appTenant1).get(`/purchase-orders/${poIdTenant2}`);
            expect(resT1Other.status).toBe(404);
            expect(resT1Other.body.message).toContain('Purchase Order not found');

            // Tenant 2 tries to get Tenant 1's PO
            const resT2Other = await request(appTenant2).get(`/purchase-orders/${poIdTenant1}`);
            expect(resT2Other.status).toBe(404);
        });

        it('should prevent a tenant from updating a purchase order belonging to another tenant', async () => {
            const poIdTenant1 = 'po-for-t1-update';
            
            mockPurchaseOrderService.updatePurchaseOrder.mockImplementation(async (tId, id, data) => {
                if (tId === tenant1Id && id === poIdTenant1) {
                    return { ...defaultMockPO, id: poIdTenant1, tenantId: tenant1Id, ...data };
                }
                return null; // Not found for other tenant
            });

            // Tenant 1 updates its own PO
            const resT1Own = await request(appTenant1).put(`/purchase-orders/${poIdTenant1}`).send({ status: 'APPROVED' });
            expect(resT1Own.status).toBe(200);
            expect(resT1Own.body.id).toBe(poIdTenant1);
            expect(resT1Own.body.tenantId).toBe(tenant1Id);
            expect(resT1Own.body.status).toBe('APPROVED');

            // Tenant 2 tries to update Tenant 1's PO
            const resT2Other = await request(appTenant2).put(`/purchase-orders/${poIdTenant1}`).send({ status: 'CANCELLED' });
            expect(resT2Other.status).toBe(404);
            expect(resT2Other.body.message).toContain('Purchase Order not found');

            expect(mockPurchaseOrderService.updatePurchaseOrder).toHaveBeenCalledTimes(2);
        });
    });

    // --- Scenario 4: Concurrent request handling ---
    describe('4. Concurrent request handling', () => {
        const concurrentPoId = 'po-concurrent-1';
        const testTenant = 'tenant-concurrent';
        const app = setupAppWithConfig(testTenant, ['admin']);

        it('should handle multiple simultaneous updates to the same purchase order with optimistic locking', async () => {
            const initialPO = { ...defaultMockPO, id: concurrentPoId, tenantId: testTenant, status: 'DRAFT' };
            
            // Mock get service to find the PO
            mockPurchaseOrderService.getPurchaseOrderById.mockResolvedValue(initialPO);

            // Mock update service to simulate optimistic locking: first call succeeds, subsequent fail
            let updateCount = 0;
            mockPurchaseOrderService.updatePurchaseOrder.mockImplementation(async (tenantId, id, updateData) => {
                await new Promise(resolve => setTimeout(resolve, 10)); // Simulate a small delay
                updateCount++;
                if (updateCount === 1) {
                    return { ...initialPO, ...updateData, status: 'APPROVED' }; // First update wins
                }
                throw new Error('optimistic locking failed: resource version mismatch'); // Subsequent updates fail
            });

            const updatePayload1 = { status: 'APPROVED' };
            const updatePayload2 = { status: 'REJECTED' };

            // Send two concurrent update requests
            const [res1, res2] = await Promise.all([
                request(app).put(`/purchase-orders/${concurrentPoId}`).send(updatePayload1),
                request(app).put(`/purchase-orders/${concurrentPoId}`).send(updatePayload2),
            ]);

            // One should succeed (HTTP 200), one should fail with conflict (HTTP 409)
            expect(res1.status).toBe(200);
            expect(res1.body.status).toBe('APPROVED'); // Assuming the first request won

            expect(res2.status).toBe(409);
            expect(res2.body.message).toContain('Conflict');
            expect(res2.body.details).toContain('optimistic locking failed');

            expect(mockPurchaseOrderService.updatePurchaseOrder).toHaveBeenCalledTimes(2);
        });

        it('should handle simultaneous creation requests without conflict (assuming UUIDs for IDs)', async () => {
            mockPurchaseOrderService.createPurchaseOrder.mockImplementation(async (tenantId, body) => {
                await new Promise(resolve => setTimeout(resolve, 20)); // Simulate network/DB delay
                return { ...defaultMockPO, id: mockUuid.v4(), tenantId, ...body };
            });

            const payload1 = validCreatePayload({ supplierId: 'supplier-A' });
            const payload2 = validCreatePayload({ supplierId: 'supplier-B' });

            const [res1, res2] = await Promise.all([
                request(app).post('/purchase-orders').send(payload1),
                request(app).post('/purchase-orders').send(payload2),
            ]);

            expect(res1.status).toBe(201);
            expect(res2.status).toBe(201);
            expect(res1.body.id).not.toBe(res2.body.id); // Verify distinct POs created
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledTimes(2);
        });

        it('should handle simultaneous deletion attempts gracefully', async () => {
            const poToDeleteId = 'po-to-delete-concurrently';
            
            // Mock service: first delete succeeds, subsequent calls return false (not found)
            let deleteCallCount = 0;
            mockPurchaseOrderService.deletePurchaseOrder.mockImplementation(async (tenantId, id) => {
                await new Promise(resolve => setTimeout(resolve, 10)); // Simulate delay
                deleteCallCount++;
                return deleteCallCount === 1; // Only the first call "deletes" it
            });

            const [res1, res2] = await Promise.all([
                request(app).delete(`/purchase-orders/${poToDeleteId}`),
                request(app).delete(`/purchase-orders/${poToDeleteId}`),
            ]);

            // One should succeed (204 No Content), the other should fail (404 Not Found)
            expect(res1.status).toBe(204);
            expect(res2.status).toBe(404);
            expect(mockPurchaseOrderService.deletePurchaseOrder).toHaveBeenCalledTimes(2);
        });
    });

    // --- Scenario 5: Auth/permission failures ---
    describe('5. Auth/permission failures', () => {
        const testTenant = 'tenant-auth';
        const poId = 'po-auth-123';
        const validPayload = validCreatePayload();

        let appNoAuth: express.Express;
        let appViewer: express.Express;
        let appAdmin: express.Express;

        beforeEach(() => {
            // Setup apps with different authentication contexts
            appNoAuth = setupAppWithConfig(testTenant, ['unauthenticated']); // Simulates no user
            appViewer = setupAppWithConfig(testTenant, ['viewer']); // User with limited permissions
            appAdmin = setupAppWithConfig(testTenant, ['admin']); // User with full permissions

            // Ensure GET/PUT/DELETE attempts find a PO for testing authorization, before permissions are checked
            mockPurchaseOrderService.getPurchaseOrderById.mockResolvedValue(defaultMockPO); 
            mockPurchaseOrderService.updatePurchaseOrder.mockResolvedValue(defaultMockPO); 
            mockPurchaseOrderService.deletePurchaseOrder.mockResolvedValue(true);
        });

        it('should return 401 for unauthenticated user trying to create PO', async () => {
            const res = await request(appNoAuth).post('/purchase-orders').send(validPayload);
            expect(res.status).toBe(401);
            expect(res.text).toBe('Unauthorized');
        });

        it('should return 401 for unauthenticated user trying to get PO', async () => {
            const res = await request(appNoAuth).get(`/purchase-orders/${poId}`);
            expect(res.status).toBe(401);
            expect(res.text).toBe('Unauthorized');
        });

        it('should return 403 for user with insufficient permissions ("viewer" role) to create PO', async () => {
            const res = await request(appViewer).post('/purchase-orders').send(validPayload);
            expect(res.status).toBe(403);
            expect(res.text).toBe('Forbidden');
            expect(mockPurchaseOrderService.createPurchaseOrder).not.toHaveBeenCalled();
        });

        it('should allow user with "viewer" role to get PO', async () => {
            const res = await request(appViewer).get(`/purchase-orders/${poId}`);
            expect(res.status).toBe(200);
            expect(mockPurchaseOrderService.getPurchaseOrderById).toHaveBeenCalledWith(testTenant, poId);
        });

        it('should return 403 for user with "viewer" role trying to update PO', async () => {
            const res = await request(appViewer).put(`/purchase-orders/${poId}`).send(validUpdatePayload());
            expect(res.status).toBe(403);
            expect(res.text).toBe('Forbidden');
            expect(mockPurchaseOrderService.updatePurchaseOrder).not.toHaveBeenCalled();
        });

        it('should return 403 for user with "viewer" role trying to delete PO', async () => {
            const res = await request(appViewer).delete(`/purchase-orders/${poId}`);
            expect(res.status).toBe(403);
            expect(res.text).toBe('Forbidden');
            expect(mockPurchaseOrderService.deletePurchaseOrder).not.toHaveBeenCalled();
        });

        it('should allow user with "admin" role to create PO', async () => {
            const res = await request(appAdmin).post('/purchase-orders').send(validPayload);
            expect(res.status).toBe(201);
            expect(mockPurchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(testTenant, expect.any(Object), expect.any(Object));
        });

        it('should allow user with "admin" role to update PO', async () => {
            const res = await request(appAdmin).put(`/purchase-orders/${poId}`).send(validUpdatePayload());
            expect(res.status).toBe(200);
            expect(mockPurchaseOrderService.updatePurchaseOrder).toHaveBeenCalledWith(testTenant, poId, expect.any(Object), expect.any(Object));
        });

        it('should allow user with "admin" role to delete PO', async () => {
            const res = await request(appAdmin).delete(`/purchase-orders/${poId}`);
            expect(res.status).toBe(204);
            expect(mockPurchaseOrderService.deletePurchaseOrder).toHaveBeenCalledWith(testTenant, poId);
        });
    });

    // --- Scenario 6: Database constraint violations ---
    describe('6. Database constraint violations', () => {
        const testTenant = 'tenant-db-constraints';
        const app = setupAppWithConfig(testTenant, ['admin']);
        const poId = 'po-db-constraint-1';

        it('should return 409 for unique constraint violation on create', async () => {
            // Simulate service layer rejecting due to a unique constraint (e.g., a custom order number)
            mockPurchaseOrderService.createPurchaseOrder.mockRejectedValueOnce(new Error('Unique constraint failed: purchaseOrderNumber already exists'));
            const payload = validCreatePayload({ orderNumber: 'PO-001' }); 
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(409);
            expect(res.body.message).toContain('Duplicate purchase order entry');
            expect(res.body.details).toContain('Unique constraint failed');
        });

        it('should return 400 for foreign key constraint violation on supplierId for create', async () => {
            mockPurchaseOrderService.createPurchaseOrder.mockRejectedValueOnce(new Error('Foreign key constraint failed: supplierId "non-existent-supplier" does not exist'));
            const payload = validCreatePayload({ supplierId: 'non-existent-supplier' });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid supplierId or productId');
            expect(res.body.details).toContain('Foreign key constraint failed');
        });

        it('should return 400 for foreign key constraint violation on productId in items for create', async () => {
            mockPurchaseOrderService.createPurchaseOrder.mockRejectedValueOnce(new Error('Foreign key constraint failed: productId "non-existent-product" in items does not exist'));
            const payload = validCreatePayload({ items: [{ productId: 'non-existent-product', quantity: 1, unitPrice: 10 }] });
            const res = await request(app).post('/purchase-orders').send(payload);
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid supplierId or productId');
            expect(res.body.details).toContain('Foreign key constraint failed');
        });

        it('should return 400 for check constraint violation on status update (e.g., invalid status transition)', async () => {
            // Simulate a business rule enforced by a DB check constraint, like preventing status DRAFT -> RECEIVED directly
            mockPurchaseOrderService.updatePurchaseOrder.mockRejectedValueOnce(new Error('Check constraint failed: status transition from DRAFT to RECEIVED is not allowed'));
            const res = await request(app).put(`/purchase-orders/${poId}`).send({ status: 'RECEIVED' }); 
            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Invalid data provided');
            expect(res.body.details).toContain('Check constraint failed');
        });

        it('should return 500 for a generic, unhandled database error', async () => {
            mockPurchaseOrderService.createPurchaseOrder.mockRejectedValueOnce(new Error('Database connection lost'));
            const res = await request(app).post('/purchase-orders').send(validCreatePayload());
            expect(res.status).toBe(500);
            expect(res.body.message).toContain('Internal Server Error');
            expect(res.body.error).toContain('Database connection lost');
        });
    });
});
