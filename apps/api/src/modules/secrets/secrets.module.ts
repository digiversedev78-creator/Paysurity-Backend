import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';


@Module({
  imports: [AuditLogModule],
  controllers: [SecretsController],
  providers: [SecretsService],
  exports: [SecretsService], // Potentially export if other modules need to retrieve secrets
})
export class SecretsModule {}
