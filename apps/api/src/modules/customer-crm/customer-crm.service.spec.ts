import { Test, TestingModule } from '@nestjs/testing';
import { CustomerCrmService } from './customer-crm.service';

describe('CustomerCrmService', () => {
  let service: CustomerCrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerCrmService,
        { provide: 'DATABASE', useValue: null },
      ],
    }).compile();
    service = module.get<CustomerCrmService>(CustomerCrmService);
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
