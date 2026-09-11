import { Test, TestingModule } from '@nestjs/testing';
import { SettlementBatchService } from './settlement-batch.service';

describe('SettlementBatchService', () => {
  let service: SettlementBatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementBatchService,
        { provide: 'DATABASE', useValue: null },
      ],
    }).compile();
    service = module.get<SettlementBatchService>(SettlementBatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll returns empty array without DB', async () => {
    const result = await service.findAll('test-tenant');
    expect(result).toEqual([]);
  });

  it('create returns object with ID without DB', async () => {
    const result = await service.create('test-tenant', { name: 'test' });
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('test');
  });
});
