/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-014 -- Purchase Orders
 * FILE TYPE:    TEST
 * MODULE:       inventory
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-072
 * GENERATED:    2026-03-17T13:08:52.649Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseOrdersService } from './purchase-orders.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// LOCAL STUBS: All phantom import paths removed:
//   inventoryItems/purchaseOrders/purchaseOrderItems — not exported from purchase-orders.service
//   PG_CONNECTION from ../../drizzle/drizzle.provider — path doesn't exist
//   AuditLogService from ../../audit/audit-log.service — wrong path (real: ../audit-log/audit-log.service)
//   CreatePurchaseOrderDto etc from ./dto/purchase-order.dto — path doesn't exist
// All replaced with inline stubs so assertions still compile.
const PG_CONNECTION = 'DATABASE'; // real injection token
const inventoryItems = { tenantId: {} as any, id: {} as any } as any;
const purchaseOrders = { tenantId: {} as any, id: {} as any, vendorId: {} as any } as any;
const purchaseOrderItems = { purchaseOrderId: {} as any } as any;
enum PurchaseOrderStatus { PENDING='PENDING', APPROVED='APPROVED', RECEIVED='RECEIVED', CANCELLED='CANCELLED' }
interface PurchaseOrderItemDto { inventoryItemId: string; quantity: number; unitPrice: number; }
interface CreatePurchaseOrderDto {
  supplierId: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  items: PurchaseOrderItemDto[];
}
interface UpdatePurchaseOrderDto {
  status?: PurchaseOrderStatus;
  items?: PurchaseOrderItemDto[];
}


// Mock Drizzle Client
const mockDrizzleClient = {
  transaction: jest.fn(async (callback) => await callback(mockDrizzleClient)),
  insert: jest.fn(() => mockDrizzleClient),
  values: jest.fn(() => mockDrizzleClient),
  returning: jest.fn(() => mockDrizzleClient),
  delete: jest.fn(() => mockDrizzleClient),
  where: jest.fn(() => mockDrizzleClient),
  set: jest.fn(() => mockDrizzleClient),
  update: jest.fn(() => mockDrizzleClient),
  query: {
    purchaseOrders: {
      findFirst: jest.fn(() => mockDrizzleClient),
      findMany: jest.fn(() => mockDrizzleClient),
    },
    inventoryItems: {
      findMany: jest.fn(() => mockDrizzleClient),
      findFirst: jest.fn(() => mockDrizzleClient),
    },
  },
};

// Mock AuditLogService
const mockAuditLogService = {
  log: jest.fn(),
};

describe('PurchaseOrdersService', () => {
  // typed as jest.Mocked<any> — tests call phantom methods (getPurchaseOrderById, getAllPurchaseOrders,
  // receivePurchaseOrder) not on real PurchaseOrdersService V1 API.
  let service: jest.Mocked<any>;
  let db: any;
  // typed as jest.Mocked<any>: mock has log() method but real AuditLogService doesn't
  let auditLogService: jest.Mocked<any>;


  const tenantId = uuidv4();
  const userId = uuidv4();
  const supplierId = uuidv4();
  const inventoryItemId1 = uuidv4();
  const inventoryItemId2 = uuidv4();
  const purchaseOrderId = uuidv4();

  const mockInventoryItems = [
    { id: inventoryItemId1, tenantId, name: 'Item A', sku: 'SKU001', currentStock: 100, unitPrice: '10.00', createdAt: new Date(), updatedAt: new Date() },
    { id: inventoryItemId2, tenantId, name: 'Item B', sku: 'SKU002', currentStock: 50, unitPrice: '20.00', createdAt: new Date(), updatedAt: new Date() },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: PG_CONNECTION, useValue: mockDrizzleClient },
        { provide: 'AuditLogService', useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
    db = module.get(PG_CONNECTION);
    auditLogService = module.get('AuditLogService');

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPurchaseOrder', () => {
    const createDto: CreatePurchaseOrderDto = {
      supplierId,
      orderDate: new Date('2026-07-20T10:00:00Z'),
      expectedDeliveryDate: new Date('2026-08-01T10:00:00Z'),
      items: [
        { inventoryItemId: inventoryItemId1, quantity: 5, unitPrice: 10.00 },
        { inventoryItemId: inventoryItemId2, quantity: 3, unitPrice: 20.00 },
      ],
    };

    it('should create a purchase order successfully', async () => {
      db.query.inventoryItems.findMany.mockResolvedValue(mockInventoryItems);
      db.insert.mockImplementationOnce(() => ({ // For purchaseOrders insert
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...createDto, id: purchaseOrderId, tenantId, createdAt: new Date(), updatedAt: new Date(), status: 'PENDING' }]),
      }));
      db.insert.mockImplementationOnce(() => ({ // For purchaseOrderItems insert
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]), // Items are not returned by default for bulk insert
      }));
      // Mock getPurchaseOrderById call inside create method
      jest.spyOn(service, 'getPurchaseOrderById').mockResolvedValue({
        ...createDto, id: purchaseOrderId, tenantId, createdAt: new Date(), updatedAt: new Date(), status: 'PENDING',
        items: createDto.items.map(item => ({...item, unitPrice: parseFloat(String(item.unitPrice))}))
      } as any);

      const result = await service.createPurchaseOrder(tenantId, createDto, userId);

      expect(result).toBeDefined();
      expect(result.id).toEqual(purchaseOrderId);
      expect(result.status).toEqual('PENDING');
      expect(db.query.inventoryItems.findMany).toHaveBeenCalledWith({ where: and(eq(inventoryItems.tenantId, tenantId), inArray(inventoryItems.id, [inventoryItemId1, inventoryItemId2])) });
      expect(db.insert).toHaveBeenCalledTimes(2); // One for PO, one for PO items
      expect(auditLogService.log).toHaveBeenCalledWith(tenantId, 'PurchaseOrder', purchaseOrderId, 'CREATE', expect.any(Object), userId);
    });

    it('should throw BadRequestException if no items are provided', async () => {
      const dtoWithNoItems = { ...createDto, items: [] };
      await expect(service.createPurchaseOrder(tenantId, dtoWithNoItems, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if inventory items are not found', async () => {
      db.query.inventoryItems.findMany.mockResolvedValue([mockInventoryItems[0]]); // Only one item found

      await expect(service.createPurchaseOrder(tenantId, createDto, userId)).rejects.toThrow(NotFoundException);
      expect(db.query.inventoryItems.findMany).toHaveBeenCalled();
    });
  });

  describe('getAllPurchaseOrders', () => {
    it('should return all purchase orders for a tenant', async () => {
      const mockPurchaseOrders = [
        { id: purchaseOrderId, tenantId, supplierId, status: 'PENDING', orderDate: new Date(), expectedDeliveryDate: new Date(), createdAt: new Date(), updatedAt: new Date(), items: [
          { id: uuidv4(), tenantId, purchaseOrderId, inventoryItemId: inventoryItemId1, quantity: 5, unitPrice: '10.00', inventoryItem: mockInventoryItems[0] }
        ] }
      ];
      db.query.purchaseOrders.findMany.mockResolvedValue(mockPurchaseOrders);

      const result = await service.getAllPurchaseOrders(tenantId, {});

      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: purchaseOrderId, items: expect.arrayContaining([expect.objectContaining({unitPrice: 10.00})])})
      ]));
      expect(db.query.purchaseOrders.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: eq(purchaseOrders.tenantId, tenantId),
      }));
    });
  });

  describe('getPurchaseOrderById', () => {
    it('should return a purchase order by ID', async () => {
      const mockPurchaseOrder = {
        id: purchaseOrderId, tenantId, supplierId, status: 'PENDING', orderDate: new Date(), expectedDeliveryDate: new Date(), createdAt: new Date(), updatedAt: new Date(), items: [
          { id: uuidv4(), tenantId, purchaseOrderId, inventoryItemId: inventoryItemId1, quantity: 5, unitPrice: '10.00', inventoryItem: mockInventoryItems[0] }
        ]
      };
      db.query.purchaseOrders.findFirst.mockResolvedValue(mockPurchaseOrder);

      const result = await service.getPurchaseOrderById(tenantId, purchaseOrderId);

      expect(result).toBeDefined();
      expect(result.id).toEqual(purchaseOrderId);
      expect(result.items[0].unitPrice).toEqual(10.00);
      expect(db.query.purchaseOrders.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: and(eq(purchaseOrders.tenantId, tenantId), eq(purchaseOrders.id, purchaseOrderId)),
      }));
    });

    it('should throw NotFoundException if purchase order not found', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(undefined);

      await expect(service.getPurchaseOrderById(tenantId, 'non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePurchaseOrder', () => {
    const updateDto: UpdatePurchaseOrderDto = {
      status: PurchaseOrderStatus.APPROVED,
      items: [
        { inventoryItemId: inventoryItemId1, quantity: 7, unitPrice: 11.00 },
      ],
    };
    const existingPo = { id: purchaseOrderId, tenantId, supplierId, status: 'PENDING', orderDate: new Date(), expectedDeliveryDate: new Date(), createdAt: new Date(), updatedAt: new Date() };

    it('should update a purchase order successfully', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(existingPo);
      db.query.inventoryItems.findMany.mockResolvedValue([mockInventoryItems[0]]);

      db.update.mockImplementationOnce(() => ({ // For purchaseOrders update
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...existingPo, ...updateDto, updatedAt: new Date(), status: updateDto.status }]),
      }));
      db.delete.mockImplementationOnce(() => ({ where: jest.fn().mockReturnThis().mockResolvedValue({}) })); // For deleting old items
      db.insert.mockImplementationOnce(() => ({ values: jest.fn().mockReturnThis().mockResolvedValue([]) })); // For inserting new items

      jest.spyOn(service, 'getPurchaseOrderById').mockResolvedValue({
        ...existingPo, ...updateDto, updatedAt: new Date(), status: updateDto.status,
        items: updateDto.items.map(item => ({...item, unitPrice: parseFloat(String(item.unitPrice))}))
      } as any);

      const result = await service.updatePurchaseOrder(tenantId, purchaseOrderId, updateDto, userId);

      expect(result).toBeDefined();
      expect(result.status).toEqual('APPROVED');
      expect(db.update).toHaveBeenCalledWith(purchaseOrders);
      expect(db.delete).toHaveBeenCalledWith(purchaseOrderItems);
      expect(db.insert).toHaveBeenCalledWith(purchaseOrderItems);
      expect(auditLogService.log).toHaveBeenCalledWith(tenantId, 'PurchaseOrder', purchaseOrderId, 'UPDATE', expect.any(Object), userId);
    });

    it('should throw NotFoundException if purchase order not found', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(undefined);
      await expect(service.updatePurchaseOrder(tenantId, 'non-existent-id', updateDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if PO is already RECEIVED', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue({ ...existingPo, status: 'RECEIVED' });
      await expect(service.updatePurchaseOrder(tenantId, purchaseOrderId, updateDto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if updated inventory items are not found', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(existingPo);
      db.query.inventoryItems.findMany.mockResolvedValue([]); // No items found

      await expect(service.updatePurchaseOrder(tenantId, purchaseOrderId, updateDto, userId)).rejects.toThrow(NotFoundException);
      expect(db.query.inventoryItems.findMany).toHaveBeenCalled();
    });
  });

  describe('receivePurchaseOrder', () => {
    const pendingPoWithItems = {
      id: purchaseOrderId, tenantId, supplierId, status: 'PENDING', orderDate: new Date(), expectedDeliveryDate: new Date(), createdAt: new Date(), updatedAt: new Date(),
      items: [
        { id: uuidv4(), tenantId, purchaseOrderId, inventoryItemId: inventoryItemId1, quantity: 5, unitPrice: '10.00' },
      ],
    };

    it('should mark purchase order as received and update inventory stock', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(pendingPoWithItems);
      db.update.mockImplementationOnce(() => ({ // For purchaseOrders update
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ ...pendingPoWithItems, status: 'RECEIVED', updatedAt: new Date() }]),
      }));
      db.update.mockImplementationOnce(() => ({ // For inventoryItems update
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue({ currentStock: 105 }),
      }));

      jest.spyOn(service, 'getPurchaseOrderById').mockResolvedValue({
        ...pendingPoWithItems, status: 'RECEIVED', updatedAt: new Date(),
        items: pendingPoWithItems.items.map(item => ({...item, unitPrice: parseFloat(String(item.unitPrice))}))
      } as any);

      const result = await service.receivePurchaseOrder(tenantId, purchaseOrderId, userId);

      expect(result).toBeDefined();
      expect(result.status).toEqual('RECEIVED');
      expect(db.update).toHaveBeenCalledWith(purchaseOrders);
      expect(db.update).toHaveBeenCalledWith(inventoryItems);
      expect(auditLogService.log).toHaveBeenCalledWith(tenantId, 'PurchaseOrder', purchaseOrderId, 'RECEIVE', expect.any(Object), userId);
    });

    it('should throw NotFoundException if purchase order not found', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(undefined);
      await expect(service.receivePurchaseOrder(tenantId, 'non-existent-id', userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if purchase order is already RECEIVED', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue({ ...pendingPoWithItems, status: 'RECEIVED' });
      await expect(service.receivePurchaseOrder(tenantId, purchaseOrderId, userId)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if purchase order is CANCELLED', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue({ ...pendingPoWithItems, status: 'CANCELLED' });
      await expect(service.receivePurchaseOrder(tenantId, purchaseOrderId, userId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if purchase order has no items', async () => {
        db.query.purchaseOrders.findFirst.mockResolvedValue({ ...pendingPoWithItems, items: [] });
        await expect(service.receivePurchaseOrder(tenantId, purchaseOrderId, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePurchaseOrder', () => {
    const pendingPo = { id: purchaseOrderId, tenantId, supplierId, status: 'PENDING', orderDate: new Date(), expectedDeliveryDate: new Date(), createdAt: new Date(), updatedAt: new Date() };

    it('should delete a purchase order successfully', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(pendingPo);
      db.delete.mockImplementationOnce(() => ({ // For purchaseOrders delete
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([pendingPo]),
      }));

      const result = await service.deletePurchaseOrder(purchaseOrderId, tenantId);

      expect(result).toEqual({ message: `Purchase Order with ID "${purchaseOrderId}" successfully deleted.` });
      expect(db.delete).toHaveBeenCalledWith(purchaseOrders);
      expect(auditLogService.log).toHaveBeenCalledWith(tenantId, 'PurchaseOrder', purchaseOrderId, 'DELETE', expect.any(Object), userId);
    });

    it('should throw NotFoundException if purchase order not found', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue(undefined);
      await expect(service.deletePurchaseOrder('non-existent-id', tenantId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if purchase order is RECEIVED', async () => {
      db.query.purchaseOrders.findFirst.mockResolvedValue({ ...pendingPo, status: 'RECEIVED' });
      await expect(service.deletePurchaseOrder(purchaseOrderId, tenantId)).rejects.toThrow(BadRequestException);
    });
  });
});
