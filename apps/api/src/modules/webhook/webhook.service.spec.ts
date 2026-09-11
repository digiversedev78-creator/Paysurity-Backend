import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: 'DATABASE', useValue: null },
      ],
    }).compile();
    service = module.get<WebhookService>(WebhookService);
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
