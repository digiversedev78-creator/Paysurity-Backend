import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: 'DATABASE', useValue: null },
      ],
    }).compile();
    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns empty array without DB', async () => {
    const result = await service.findAll('test-tenant');
    expect(result).toEqual([]);
  });

  it('create returns object with ID without DB', async () => {
    const result = await (service as any).create('test-tenant', { name: 'test' });
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('test');
  });
});
