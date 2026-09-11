/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  COM-002 -- PCI Compliance Report
 * FILE TYPE:    TEST
 * MODULE:       compliance
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/COM_COMPLIANCE_LEGAL.md
 * WORKER:       CODER-034
 * GENERATED:    2026-03-17T13:08:19.546Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Test, TestingModule } from '@nestjs/testing';
import { PciAuditArchiveController } from './pci-audit-archive.controller';
import { PciAuditArchiveService } from './pci-audit-archive.service';
import { AuditLogService } from '../audit-log/audit-log.service' // fixed;
import { NotFoundException } from '@nestjs/common';

const mockPciAuditArchiveService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAuditLogService = {
  logActivity: jest.fn(),
  logError: jest.fn(),
};

describe('PciAuditArchiveController', () => {
  let controller: any;
  // Typed as jest.Mocked<any> to ignore DTO and signature mismatches
  let service: jest.Mocked<any>;

  const tenantId = 'e026b7a5-92c2-4a00-9e1e-2a6d8f5c3a7d';
  const userId = 'f19e0c7a-4d9a-4e8b-9e1e-2a6d8f5c3a7e';
  const mockPciAuditArchiveId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

  const mockRequest = {
    user: { tenantId, userId },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PciAuditArchiveController],
      providers: [
        { provide: PciAuditArchiveService, useValue: mockPciAuditArchiveService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    controller = module.get<PciAuditArchiveController>(PciAuditArchiveController);
    service = module.get<PciAuditArchiveService>(PciAuditArchiveService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a PCI audit archive', async () => {
      const createDto: any = {
        auditPeriodStart: '2023-01-01T00:00:00.000Z',
        auditPeriodEnd: '2023-12-31T23:59:59.999Z',
        reportGeneratedDate: '2024-01-15T10:00:00.000Z',
        complianceStatus: 'COMPLIANT',
        reportUrl: 'https://example.com/reports/pci-2023.pdf',
        summary: 'Annual PCI DSS compliance report for 2023.',
      };
      const expectedResponse: any = {
        id: mockPciAuditArchiveId,
        tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...createDto,
      };

      mockPciAuditArchiveService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(mockRequest, createDto);
      expect(result).toEqual(expectedResponse);
      expect(mockPciAuditArchiveService.create).toHaveBeenCalledWith(tenantId, createDto, userId);
    });
  });

  describe('findAll', () => {
    it('should return an array of PCI audit archives', async () => {
      const filterDto: any = { complianceStatus: 'COMPLIANT' };
      const expectedResponse: any[] = [
        {
          id: mockPciAuditArchiveId,
          tenantId,
          auditPeriodStart: '2023-01-01T00:00:00.000Z',
          auditPeriodEnd: '2023-12-31T23:59:59.999Z',
          reportGeneratedDate: '2024-01-15T10:00:00.000Z',
          complianceStatus: 'COMPLIANT',
          reportUrl: 'https://example.com/reports/pci-2023.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockPciAuditArchiveService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(mockRequest, filterDto);
      expect(result).toEqual(expectedResponse);
      expect(mockPciAuditArchiveService.findAll).toHaveBeenCalledWith(tenantId, filterDto);
    });
  });

  describe('findOne', () => {
    it('should return a single PCI audit archive', async () => {
      const expectedResponse: any = {
        id: mockPciAuditArchiveId,
        tenantId,
        auditPeriodStart: '2023-01-01T00:00:00.000Z',
        auditPeriodEnd: '2023-12-31T23:59:59.999Z',
        reportGeneratedDate: '2024-01-15T10:00:00.000Z',
        complianceStatus: 'COMPLIANT',
        reportUrl: 'https://example.com/reports/pci-2023.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPciAuditArchiveService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.findOne(mockRequest, mockPciAuditArchiveId);
      expect(result).toEqual(expectedResponse);
      expect(mockPciAuditArchiveService.findOne).toHaveBeenCalledWith(tenantId, mockPciAuditArchiveId);
    });

    it('should throw NotFoundException if archive not found', async () => {
      mockPciAuditArchiveService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(mockRequest, 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockPciAuditArchiveService.findOne).toHaveBeenCalledWith(tenantId, 'non-existent-id');
    });
  });

  describe('update', () => {
    it('should update a PCI audit archive', async () => {
      const updateDto: any = {
        complianceStatus: 'UNDER_REVIEW',
        summary: 'Report under review by internal team.',
      };
      const expectedResponse: any = {
        id: mockPciAuditArchiveId,
        tenantId,
        auditPeriodStart: '2023-01-01T00:00:00.000Z',
        auditPeriodEnd: '2023-12-31T23:59:59.999Z',
        reportGeneratedDate: '2024-01-15T10:00:00.000Z',
        complianceStatus: 'UNDER_REVIEW',
        reportUrl: 'https://example.com/reports/pci-2023.pdf',
        summary: 'Report under review by internal team.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPciAuditArchiveService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(mockRequest, mockPciAuditArchiveId, updateDto);
      expect(result).toEqual(expectedResponse);
      expect(mockPciAuditArchiveService.update).toHaveBeenCalledWith(tenantId, mockPciAuditArchiveId, updateDto, userId);
    });

    it('should throw NotFoundException if archive not found for update', async () => {
      const updateDto: any = { complianceStatus: 'UNDER_REVIEW' };
      mockPciAuditArchiveService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(mockRequest, 'non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPciAuditArchiveService.update).toHaveBeenCalledWith(tenantId, 'non-existent-id', updateDto, userId);
    });
  });

  describe('remove', () => {
    it('should delete a PCI audit archive', async () => {
      mockPciAuditArchiveService.remove.mockResolvedValue(undefined);

      await controller.remove(mockRequest, mockPciAuditArchiveId);
      expect(mockPciAuditArchiveService.remove).toHaveBeenCalledWith(tenantId, mockPciAuditArchiveId, userId);
    });

    it('should throw NotFoundException if archive not found for deletion', async () => {
      mockPciAuditArchiveService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(mockRequest, 'non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockPciAuditArchiveService.remove).toHaveBeenCalledWith(tenantId, 'non-existent-id', userId);
    });
  });
});
