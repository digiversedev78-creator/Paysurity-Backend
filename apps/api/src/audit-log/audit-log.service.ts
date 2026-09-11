import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class AuditLogServiceService {
  constructor(@Inject('DATABASE') private db: any) {}
}
