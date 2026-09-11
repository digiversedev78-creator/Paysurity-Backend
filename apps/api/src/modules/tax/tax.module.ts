import { Module, forwardRef } from '@nestjs/common';
import { TaxNexusService } from './tax-nexus.service';
import { TaxNexusController } from './tax-nexus.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    forwardRef(() => AuditLogModule),
    DatabaseModule,
  ],
  controllers: [TaxNexusController],
  providers: [TaxNexusService],
  exports: [TaxNexusService],
})
export class TaxModule {}
