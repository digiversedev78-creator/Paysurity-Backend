/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-013 -- Vendor Management
 * FILE TYPE:    TEST
 * MODULE:       vendors
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-071
 * GENERATED:    2026-03-17T13:08:22.228Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { VendorsModule } from './vendors.module';
import { VendorsService } from './vendors.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { eq, and } from 'drizzle-orm';

// AuditActionType and AuditEntityType are not exported from audit-log.service.
// Defining them locally to match the values the audit service actually uses at runtime.
const AuditActionType = { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' } as const;
type AuditActionType = typeof AuditActionType[keyof typeof AuditActionType];
const AuditEntityType = { VENDOR: 'vendor' } as const;
type AuditEntityType = typeof AuditEntityType[keyof typeof AuditEntityType];

// vendors schema is used in where-clause assertions â€” import from @paysurity/database
import * as schema from '@paysurity/database';
const vendors = (schema as any).vendors;

// Mock Drizzle ORM setup
const mockDrizzleDb = {
  query: {
    vendors: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
  insert: jest.fn(() => ({ returning: jest.fn(() => [mockVendors[0]]) })) as any,
  update: jest.fn(() => ({ where: jest.fn(() => ({ returning: jest.fn(() => [mockVendors[0]]) })) })) as any,
  delete: jest.fn(() => ({ where: jest.fn(() => ({ returning: jest.fn(() => [mockVendors[0]]) })) })) as any,
  select: jest.fn(() => ({ from: jest.fn(() => ({ where: jest.fn(() => ([{ count: 1 }])) })) })) as any,
} as unknown as any;

const mockVendors = [
  {
    id: 'vendor-1',
    tenantId: 'mock-tenant-id-123',
    name: 'Vendor A',
    contactPerson: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+15551234567',
    addressLine1: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
    status: 'ACTIVE',
    website: 'https://vendor-a.com',
    notes: 'Important client',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'vendor-2',
    tenantId: 'mock-tenant-id-123',
    name: 'Vendor B',
    contactPerson: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '+15557654321',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('VendorsController (e2e)', () => {
  let app: INestApplication;
  let service: VendorsService;
  // auditLogService is mocked with { logAction: jest.fn() } â€” define a typed interface
  // so assertions on .logAction() compile natively without as any.
  let auditLogService: { logAction: jest.Mock };
  let dbConnection: any;

  const mockTenantId = 'mock-tenant-id-123';
  const mockUserId = 'mock-user-id-456';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [VendorsModule],
    })
    .overrideProvider('DATABASE')
    .useValue(mockDrizzleDb)
    .overrideProvider(AuditLogService)
    .useValue({
      logAction: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.use((req: any, res: any, next: any) => {
      req.user = { id: 'mock-user-id-456', tenantId: 'mock-tenant-id-123', role: 'ADMIN', permissions: [] };
      next();
    });
    await app.init();

    service = moduleFixture.get<VendorsService>(VendorsService);
    auditLogService = moduleFixture.get(AuditLogService) as unknown as { logAction: jest.Mock };
    dbConnection = moduleFixture.get<any>('DATABASE');

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/vendors (POST) should create a vendor', async () => {
    const createDto = {
      name: 'New Vendor',
      email: 'new.vendor@example.com',
      contactPerson: 'Contact One',
      phoneNumber: '+12345678900',
    };

    // Mock Drizzle's insert to return the new vendor
    (dbConnection.insert as jest.Mock).mockReturnValueOnce({
      returning: jest.fn().mockResolvedValueOnce([{ id: 'new-vendor-id', tenantId: mockTenantId, ...createDto, status: 'PENDING', createdAt: new Date(), updatedAt: new Date() }]),
    });
    // Mock findFirst for email check to return null (no conflict)
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app.getHttpServer())
      .post('/vendors')
      .send(createDto)
      .expect(201);

    expect(response.body).toEqual(expect.objectContaining({
      id: 'new-vendor-id',
      tenantId: mockTenantId,
      name: 'New Vendor',
      email: 'new.vendor@example.com',
    }));

    expect(auditLogService.logAction).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: mockTenantId,
      userId: mockUserId,
      actionType: AuditActionType.CREATE,
      entityType: AuditEntityType.VENDOR,
      entityId: 'new-vendor-id',
      payload: createDto,
    }));
  });

  it('/vendors (POST) should throw ConflictException if email exists', async () => {
    const createDto = {
      name: 'Existing Vendor',
      email: 'john.doe@example.com',
    };

    // Mock findFirst to return an existing vendor (conflict)
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(mockVendors[0]);

    await request(app.getHttpServer())
      .post('/vendors')
      .send(createDto)
      .expect(409) // Conflict status
      .expect({
        statusCode: 409,
        message: `Vendor with email '${(createDto as any).email}' already exists for this tenant.`,
        error: 'Conflict',
      });

    expect(auditLogService.logAction).not.toHaveBeenCalled();
  });

  it('/vendors (GET) should return all vendors for a tenant', async () => {
    // Mock Drizzle's findMany and select count for pagination
    (dbConnection.query.vendors.findMany as jest.Mock).mockResolvedValueOnce(mockVendors);
    (dbConnection.select as jest.Mock).mockReturnValueOnce({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValueOnce([{ count: mockVendors.length }]),
    });

    const response = await request(app.getHttpServer())
      .get('/vendors')
      .expect(200);

    expect(response.body.data).toEqual(mockVendors);
    expect(response.body.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      lastPage: 1,
    });
    expect(dbConnection.query.vendors.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: and(eq(vendors.tenantId, mockTenantId)),
      limit: 10,
      offset: 0,
    }));
  });

  it('/vendors/:id (GET) should return a single vendor', async () => {
    // Mock Drizzle's findFirst
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(mockVendors[0]);

    const response = await request(app.getHttpServer())
      .get(`/vendors/${mockVendors[0].id}`)
      .expect(200);

    expect(response.body).toEqual(mockVendors[0]);
    expect(dbConnection.query.vendors.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: and(eq(vendors.id, mockVendors[0].id), eq(vendors.tenantId, mockTenantId)),
    }));
  });

  it('/vendors/:id (GET) should throw NotFoundException if vendor not found', async () => {
    // Mock Drizzle's findFirst to return null
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get(`/vendors/non-existent-id`)
      .expect(404)
      .expect({
        statusCode: 404,
        message: `Vendor with ID 'non-existent-id' not found for this tenant.`,
        error: 'Not Found',
      });
  });

  it('/vendors/:id (PUT) should update a vendor', async () => {
    const updateDto = {
      name: 'Updated Vendor A',
      status: 'INACTIVE',
    };
    const updatedVendor = { ...mockVendors[0], ...updateDto };

    // Mock findOne (used by update service method) to return existing vendor
    (dbConnection.query.vendors.findFirst as jest.Mock)
      .mockResolvedValueOnce(mockVendors[0]) // for initial findOne check
      .mockResolvedValueOnce(null); // for duplicate email check (no duplicate)

    // Mock Drizzle's update
    (dbConnection.update as jest.Mock).mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        returning: jest.fn().mockResolvedValueOnce([updatedVendor]),
      }),
    });

    const response = await request(app.getHttpServer())
      .put(`/vendors/${mockVendors[0].id}`)
      .send(updateDto)
      .expect(200);

    expect(response.body).toEqual(updatedVendor);
    expect(auditLogService.logAction).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: mockTenantId,
      userId: mockUserId,
      actionType: AuditActionType.UPDATE,
      entityType: AuditEntityType.VENDOR,
      entityId: mockVendors[0].id,
      payload: updateDto,
      previousState: mockVendors[0],
    }));
  });

  it('/vendors/:id (PUT) should throw NotFoundException if vendor not found for update', async () => {
    const updateDto = { name: 'Non Existent' };

    // Mock findOne to return null
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .put(`/vendors/non-existent-id`)
      .send(updateDto)
      .expect(404)
      .expect({
        statusCode: 404,
        message: `Vendor with ID 'non-existent-id' not found for this tenant.`,
        error: 'Not Found',
      });
  });

  it('/vendors/:id (DELETE) should delete a vendor', async () => {
    // Mock findOne to return existing vendor
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(mockVendors[0]);

    // Mock Drizzle's delete
    (dbConnection.delete as jest.Mock).mockReturnValueOnce({
      where: jest.fn().mockReturnValueOnce({
        returning: jest.fn().mockResolvedValueOnce([mockVendors[0]]),
      }),
    });

    await request(app.getHttpServer())
      .delete(`/vendors/${mockVendors[0].id}`)
      .expect(204);

    expect(auditLogService.logAction).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: mockTenantId,
      userId: mockUserId,
      actionType: AuditActionType.DELETE,
      entityType: AuditEntityType.VENDOR,
      entityId: mockVendors[0].id,
      previousState: mockVendors[0],
    }));
  });

  it('/vendors/:id (DELETE) should throw NotFoundException if vendor not found for deletion', async () => {
    // Mock findOne to return null
    (dbConnection.query.vendors.findFirst as jest.Mock).mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .delete(`/vendors/non-existent-id`)
      .expect(404)
      .expect({
        statusCode: 404,
        message: `Vendor with ID 'non-existent-id' not found for this tenant.`,
        error: 'Not Found',
      });
  });
});

