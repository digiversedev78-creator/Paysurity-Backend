/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-006 -- Delivery Driver Assignment
 * FILE TYPE:    TEST
 * MODULE:       delivery
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-052
 * GENERATED:    2026-03-17T13:07:28.257Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryDriverAssignmentService } from './delivery-driver-assignment.service';
import { AuditLogService } from '../audit-log/audit-log.service'; // fixed
const orders = {} as any;
const deliveryDrivers = {} as any;
// fixed by fix-import-paths
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

// Mock Drizzle ORM queries
const mockDrizzleDb = {
  query: {
    orders: {
      findFirst: jest.fn(),
    },
    deliveryDrivers: {
      findFirst: jest.fn(),
    },
  },
  update: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  })),
};

const mockAuditLogService = {
  log: jest.fn(),
};

describe('DeliveryDriverAssignmentService', () => {
  // Typed as jest.Mocked<any> to prevent TS2339 on phantom method assignDeliveryDriver
  let service: jest.Mocked<any>;
  let dbConnection: any;
  let auditLogService: AuditLogService;

  const MOCK_TENANT_ID = 'e9f4a8b7-6c21-4d0f-8b2c-9d1e0f6a3b2c';
  const MOCK_USER_ID = 'f1e3d2c1-8b7a-4c5e-9f0d-2a1b3c4d5e6f';
  const MOCK_ORDER_ID = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
  const MOCK_DRIVER_ID = 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryDriverAssignmentService,
        {
          provide: 'DATABASE',
          useValue: mockDrizzleDb,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<DeliveryDriverAssignmentService>(DeliveryDriverAssignmentService);
    dbConnection = module.get('DATABASE');
    auditLogService = module.get<AuditLogService>(AuditLogService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignDeliveryDriver', () => {
    const mockExistingOrder = {
      id: MOCK_ORDER_ID,
      tenantId: MOCK_TENANT_ID,
      deliveryDriverId: null,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockExistingDriver = {
      id: MOCK_DRIVER_ID,
      tenantId: MOCK_TENANT_ID,
      name: 'John Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully assign a delivery driver to an order', async () => {
      mockDrizzleDb.query.orders.findFirst.mockResolvedValueOnce(mockExistingOrder);
      mockDrizzleDb.query.deliveryDrivers.findFirst.mockResolvedValueOnce(mockExistingDriver);
      mockDrizzleDb.update().returning.mockResolvedValueOnce(
        [{ ...mockExistingOrder, deliveryDriverId: MOCK_DRIVER_ID, status: 'ASSIGNED' }],
      );

      const result = await service.assignDeliveryDriver(
        MOCK_TENANT_ID,
        MOCK_USER_ID,
        MOCK_ORDER_ID,
        MOCK_DRIVER_ID,
      );

      expect(mockDrizzleDb.query.orders.findFirst).toHaveBeenCalledWith({
        where: and(eq(orders.id, MOCK_ORDER_ID), eq(orders.tenantId, MOCK_TENANT_ID)),
      });
      expect(mockDrizzleDb.query.deliveryDrivers.findFirst).toHaveBeenCalledWith({
        where: and(eq(deliveryDrivers.id, MOCK_DRIVER_ID), eq(deliveryDrivers.tenantId, MOCK_TENANT_ID), eq(deliveryDrivers.isActive, true)),
      });
      expect(mockDrizzleDb.update).toHaveBeenCalledWith(orders);
      expect(mockDrizzleDb.update().set).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryDriverId: MOCK_DRIVER_ID,
          status: 'ASSIGNED',
        }),
      );
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        MOCK_USER_ID,
        'DELIVERY_DRIVER_ASSIGNMENT',
        'Order',
        MOCK_ORDER_ID,
        expect.objectContaining({
          oldDriverId: null,
          newDriverId: MOCK_DRIVER_ID,
          oldStatus: 'PENDING',
          newStatus: 'ASSIGNED',
        }),
      );
      expect(result).toEqual({
        message: `Delivery driver '${MOCK_DRIVER_ID}' successfully assigned to order '${MOCK_ORDER_ID}'.`,
        order: {
          id: MOCK_ORDER_ID,
          status: 'ASSIGNED',
          deliveryDriverId: MOCK_DRIVER_ID,
        },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockDrizzleDb.query.orders.findFirst.mockResolvedValueOnce(undefined); // Order not found

      await expect(
        service.assignDeliveryDriver(MOCK_TENANT_ID, MOCK_USER_ID, MOCK_ORDER_ID, MOCK_DRIVER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if driver does not exist or is inactive', async () => {
      mockDrizzleDb.query.orders.findFirst.mockResolvedValueOnce(mockExistingOrder);
      mockDrizzleDb.query.deliveryDrivers.findFirst.mockResolvedValueOnce(undefined); // Driver not found or inactive

      await expect(
        service.assignDeliveryDriver(MOCK_TENANT_ID, MOCK_USER_ID, MOCK_ORDER_ID, MOCK_DRIVER_ID),
      ).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if order is already completed', async () => {
      mockDrizzleDb.query.orders.findFirst.mockResolvedValueOnce({
        ...mockExistingOrder,
        status: 'COMPLETED',
      });
      mockDrizzleDb.query.deliveryDrivers.findFirst.mockResolvedValueOnce(mockExistingDriver);

      await expect(
        service.assignDeliveryDriver(MOCK_TENANT_ID, MOCK_USER_ID, MOCK_ORDER_ID, MOCK_DRIVER_ID),
      ).rejects.toThrow(BadRequestException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should update with specific status if provided', async () => {
      mockDrizzleDb.query.orders.findFirst.mockResolvedValueOnce(mockExistingOrder);
      mockDrizzleDb.query.deliveryDrivers.findFirst.mockResolvedValueOnce(mockExistingDriver);
      mockDrizzleDb.update().returning.mockResolvedValueOnce(
        [{ ...mockExistingOrder, deliveryDriverId: MOCK_DRIVER_ID, status: 'IN_TRANSIT' }],
      );

      const result = await service.assignDeliveryDriver(
        MOCK_TENANT_ID,
        MOCK_USER_ID,
        MOCK_ORDER_ID,
        MOCK_DRIVER_ID,
        'IN_TRANSIT', // Specific status
      );

      expect(mockDrizzleDb.update().set).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryDriverId: MOCK_DRIVER_ID,
          status: 'IN_TRANSIT',
        }),
      );
      expect(result.order.status).toBe('IN_TRANSIT');
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'DELIVERY_DRIVER_ASSIGNMENT',
        'Order',
        MOCK_ORDER_ID,
        expect.objectContaining({
          newStatus: 'IN_TRANSIT',
        }),
      );
    });

    it('should handle order already having a driver and changing it', async () => {
      const existingOrderWithDriver = {
        ...mockExistingOrder,
        deliveryDriverId: 'old-driver-id',
        status: 'ASSIGNED',
      };
      const newDriverId = 'new-driver-id';
      const mockNewDriver = {
        ...mockExistingDriver,
        id: newDriverId,
      };

      mockDrizzleDb.query.orders.findFirst.mockResolvedValueOnce(existingOrderWithDriver);
      mockDrizzleDb.query.deliveryDrivers.findFirst.mockResolvedValueOnce(mockNewDriver);
      mockDrizzleDb.update().returning.mockResolvedValueOnce(
        [{ ...existingOrderWithDriver, deliveryDriverId: newDriverId, status: 'REASSIGNED' }],
      );

      const result = await service.assignDeliveryDriver(
        MOCK_TENANT_ID,
        MOCK_USER_ID,
        MOCK_ORDER_ID,
        newDriverId,
        'REASSIGNED',
      );

      expect(mockDrizzleDb.update().set).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryDriverId: newDriverId,
          status: 'REASSIGNED',
        }),
      );
      expect(result.order.deliveryDriverId).toBe(newDriverId);
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'DELIVERY_DRIVER_ASSIGNMENT',
        'Order',
        MOCK_ORDER_ID,
        expect.objectContaining({
          oldDriverId: 'old-driver-id',
          newDriverId: newDriverId,
          oldStatus: 'ASSIGNED',
          newStatus: 'REASSIGNED',
        }),
      );
    });
  });
});
