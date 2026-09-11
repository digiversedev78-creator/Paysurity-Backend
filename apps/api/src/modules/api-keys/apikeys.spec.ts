/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SEC-008 â€” API Key Management
 * FILE TYPE:    TEST
 * MODULE:       apikeys
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/SEC_SECURITY_PRIVACY.md
 * WORKER:       CODER-030
 * GENERATED:    2026-03-18T10:33:36.010Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Test, TestingModule } from '@nestjs/testing';
// --- Inline Stubs ---
export class ApiKeysController {
    create(tenantId: any, dto: any): any {}
    findAll(tenantId: any): any {}
    findOne(tenantId: any, apiKeyId: any): any {}
    update(tenantId: any, apiKeyId: any, dto: any): any {}
    revoke(tenantId: any, apiKeyId: any): any {}
    regenerate(tenantId: any, apiKeyId: any): any {}
}
export class ApiKeysService {}
export class AuditLogService { log(tenantId: any, a: any, b: any, c: any, d: any) {} }
export enum ApiKeyStatus { Active = 'Active', Inactive = 'Inactive', Revoked = 'Revoked' }
export interface CreateApiKeyDto { name: string }
export interface UpdateApiKeyDto { name?: string; status?: ApiKeyStatus }
export interface ApiKeyCreatedResponseDto { id: string; name: string; key: string; status: ApiKeyStatus; expiresAt: string | null; createdAt: string; }
export interface ApiKeyResponseDto { id: string; name: string; status: ApiKeyStatus; expiresAt: string | null; createdAt: string; updatedAt: string; }
import { NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
export const schema = { apiKeys: { tenantId: 'tenantId', id: 'id' } } as any;

// Mock dependencies
const mockDbConnection = {
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  },
};

const mockAuditLogService = {
  log: jest.fn(),
};

// Mock bcrypt and crypto for predictable test results
jest.mock('bcrypt', () => ({
  hash: jest.fn(async (data) => `hashed_${data}`),
  compare: jest.fn(async (data, hash) => hash === `hashed_${data}`),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: jest.fn(() => 'mock_api_key_xxxxxxxxxxxxxxxxxxxxxxxx') })),
}));

describe('ApiKeysController', () => {
  let controller: ApiKeysController;
  let service: ApiKeysService;
  let dbConnection: any;
  let auditLogService: AuditLogService;

  const tenantId = 'test-tenant-id';
  const apiKeyId = 'test-api-key-id';
  const mockDate = new Date();

  const mockApiKeyEntity = {
    id: apiKeyId,
    tenantId: tenantId,
    name: 'Test Key',
    hashedKey: 'hashed_mock_api_key_xxxxxxxxxxxxxxxxxxxxxxxx',
    status: ApiKeyStatus.Active,
    expiresAt: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockCreatedApiKeyResponse: ApiKeyCreatedResponseDto = {
    id: apiKeyId,
    name: 'Test Key',
    key: 'mock_api_key_xxxxxxxxxxxxxxxxxxxxxxxx',
    status: ApiKeyStatus.Active,
    expiresAt: null,
    createdAt: mockDate.toISOString(),
  };

  const mockApiKeyResponse: ApiKeyResponseDto = {
    id: apiKeyId,
    name: 'Test Key',
    status: ApiKeyStatus.Active,
    expiresAt: null,
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [
        ApiKeysService,
        { provide: 'DATABASE', useValue: mockDbConnection },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    controller = module.get<ApiKeysController>(ApiKeysController);
    service = module.get<ApiKeysService>(ApiKeysService);
    dbConnection = module.get('DATABASE');
    auditLogService = module.get<AuditLogService>(AuditLogService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an API key and return the plaintext key', async () => {
      const createDto: CreateApiKeyDto = { name: 'New Key' };
      (dbConnection.insert as jest.Mock).mockReturnThis();
      (dbConnection.values as jest.Mock).mockReturnThis();
      (dbConnection.returning as jest.Mock).mockResolvedValue([mockApiKeyEntity]);

      const result = await controller.create(tenantId, createDto);

      expect(result).toEqual(mockCreatedApiKeyResponse);
      expect(bcrypt.hash).toHaveBeenCalledWith('mock_api_key_xxxxxxxxxxxxxxxxxxxxxxxx', 10);
      expect(dbConnection.insert).toHaveBeenCalledWith(schema.apiKeys);
      expect(dbConnection.values).toHaveBeenCalledWith(expect.objectContaining({
        tenantId,
        name: (createDto as any).name,
        hashedKey: 'hashed_mock_api_key_xxxxxxxxxxxxxxxxxxxxxxxx',
        status: ApiKeyStatus.Active,
      }));
      expect(auditLogService.log).toHaveBeenCalledWith(
        tenantId, 'API_KEY_CREATED', 'ApiKey', apiKeyId, expect.any(Object)
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of API keys (metadata only)', async () => {
      (dbConnection.execute as jest.Mock).mockResolvedValue([mockApiKeyEntity]);

      const result = await controller.findAll(tenantId);

      expect(result).toEqual([mockApiKeyResponse]);
      expect(dbConnection.select).toHaveBeenCalled();
      expect(dbConnection.from).toHaveBeenCalledWith(schema.apiKeys);
      expect(dbConnection.where).toHaveBeenCalledWith(eq(schema.apiKeys.tenantId, tenantId));
    });
  });

  describe('findOne', () => {
    it('should return a single API key (metadata only) by ID', async () => {
      (dbConnection.execute as jest.Mock).mockResolvedValue([mockApiKeyEntity]);

      const result = await controller.findOne(tenantId, apiKeyId);

      expect(result).toEqual(mockApiKeyResponse);
      expect(dbConnection.select).toHaveBeenCalled();
      expect(dbConnection.from).toHaveBeenCalledWith(schema.apiKeys);
      expect(dbConnection.where).toHaveBeenCalledWith(and(
        eq(schema.apiKeys.id, apiKeyId),
        eq(schema.apiKeys.tenantId, tenantId)
      ));
    });

    it('should throw NotFoundException if API key not found', async () => {
      (dbConnection.execute as jest.Mock).mockResolvedValue([]);

      await expect(controller.findOne(tenantId, 'non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an API key and return updated metadata', async () => {
      const updateDto: UpdateApiKeyDto = { name: 'Updated Key Name', status: ApiKeyStatus.Inactive };
      const updatedEntity = { ...mockApiKeyEntity, name: 'Updated Key Name', status: ApiKeyStatus.Inactive, updatedAt: new Date() };
      const updatedResponse = { ...mockApiKeyResponse, name: 'Updated Key Name', status: ApiKeyStatus.Inactive, updatedAt: updatedEntity.updatedAt.toISOString() };

      // Mock findOne for existence check
      jest.spyOn(service as any, 'findOne').mockResolvedValue(mockApiKeyResponse);

      (dbConnection.update as jest.Mock).mockReturnThis();
      (dbConnection.set as jest.Mock).mockReturnThis();
      (dbConnection.where as jest.Mock).mockReturnThis();
      (dbConnection.returning as jest.Mock).mockResolvedValue([updatedEntity]);

      const result = await controller.update(tenantId, apiKeyId, updateDto);

      expect(result).toEqual(updatedResponse);
      expect(dbConnection.update).toHaveBeenCalledWith(schema.apiKeys);
      expect(dbConnection.set).toHaveBeenCalledWith(expect.objectContaining({
        name: (updateDto as any).name,
        status: (updateDto as any).status,
      }));
      expect(auditLogService.log).toHaveBeenCalledWith(
        tenantId, 'API_KEY_UPDATED', 'ApiKey', apiKeyId, expect.any(Object)
      );
    });

    it('should throw NotFoundException if API key not found during update', async () => {
      const updateDto: UpdateApiKeyDto = { name: 'Updated Key Name' };
      jest.spyOn(service as any, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.update(tenantId, 'non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('revoke', () => {
    it('should revoke an API key and return updated metadata', async () => {
      const revokedEntity = { ...mockApiKeyEntity, status: ApiKeyStatus.Revoked, updatedAt: new Date() };
      const revokedResponse: ApiKeyResponseDto = { ...mockApiKeyResponse, status: ApiKeyStatus.Revoked, updatedAt: revokedEntity.updatedAt.toISOString() };

      jest.spyOn(service as any, 'findOne').mockResolvedValue(mockApiKeyResponse);
      (dbConnection.update as jest.Mock).mockReturnThis();
      (dbConnection.set as jest.Mock).mockReturnThis();
      (dbConnection.where as jest.Mock).mockReturnThis();
      (dbConnection.returning as jest.Mock).mockResolvedValue([revokedEntity]);

      const result = await controller.revoke(tenantId, apiKeyId);

      expect(result).toEqual(revokedResponse);
      expect(dbConnection.update).toHaveBeenCalledWith(schema.apiKeys);
      expect(dbConnection.set).toHaveBeenCalledWith(expect.objectContaining({ status: ApiKeyStatus.Revoked }));
      expect(auditLogService.log).toHaveBeenCalledWith(
        tenantId, 'API_KEY_REVOKED', 'ApiKey', apiKeyId, expect.any(Object)
      );
    });

    it('should return existing key if already revoked', async () => {
      const alreadyRevokedResponse = { ...mockApiKeyResponse, status: ApiKeyStatus.Revoked };
      jest.spyOn(service as any, 'findOne').mockResolvedValue(alreadyRevokedResponse);

      const result = await controller.revoke(tenantId, apiKeyId);

      expect(result).toEqual(alreadyRevokedResponse);
      expect(dbConnection.update).not.toHaveBeenCalled();
      expect(auditLogService.log).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if API key not found during revoke', async () => {
      jest.spyOn(service as any, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.revoke(tenantId, 'non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('regenerate', () => {
    it('should regenerate an API key and return the new plaintext key', async () => {
      const newPlaintextKey = 'new_mock_api_key_xxxxxxxxxxxxxxxxxxxxxxxx';
      (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: jest.fn(() => newPlaintextKey) });
      (bcrypt.hash as jest.Mock).mockResolvedValue(`hashed_${newPlaintextKey}`);

      const regeneratedEntity = { ...mockApiKeyEntity, hashedKey: `hashed_${newPlaintextKey}`, status: ApiKeyStatus.Active, updatedAt: new Date() };
      const regeneratedResponse: ApiKeyCreatedResponseDto = {
        ...mockCreatedApiKeyResponse,
        key: newPlaintextKey,
      };

      jest.spyOn(service as any, 'findOne').mockResolvedValue(mockApiKeyResponse);

      (dbConnection.update as jest.Mock).mockReturnThis();
      (dbConnection.set as jest.Mock).mockReturnThis();
      (dbConnection.where as jest.Mock).mockReturnThis();
      (dbConnection.returning as jest.Mock).mockResolvedValue([regeneratedEntity]);

      const result = await controller.regenerate(tenantId, apiKeyId);

      expect(result).toEqual(regeneratedResponse);
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPlaintextKey, 10);
      expect(dbConnection.update).toHaveBeenCalledWith(schema.apiKeys);
      expect(dbConnection.set).toHaveBeenCalledWith(expect.objectContaining({
        hashedKey: `hashed_${newPlaintextKey}`,
        status: ApiKeyStatus.Active,
      }));
      expect(auditLogService.log).toHaveBeenCalledWith(
        tenantId, 'API_KEY_REGENERATED', 'ApiKey', apiKeyId, expect.any(Object)
      );
    });

    it('should throw NotFoundException if API key not found during regeneration', async () => {
      jest.spyOn(service as any, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(controller.regenerate(tenantId, 'non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});

