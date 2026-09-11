import { Module } from '@nestjs/common';
import { SettlementBatchController } from './settlement-batch.controller';
import { SettlementBatchService } from './settlement-batch.service';
// Assuming DatabaseModule is in src/database
import { AuditLogModule } from '../audit-log/audit-log.module'; // Assuming AuditLogModule is in src/modules/audit-log

@Module({
  imports: [AuditLogModule],
  controllers: [SettlementBatchController],
  providers: [SettlementBatchService],
  exports: [SettlementBatchService],
})
export class SettlementBatchModule {}
