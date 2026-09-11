// security-config.service.ts

import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class SecurityConfigService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  getConfig(): string {
    return 'Security configuration loaded.';
  }
}
