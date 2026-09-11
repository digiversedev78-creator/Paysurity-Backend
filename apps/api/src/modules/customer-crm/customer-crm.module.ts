import { Module } from '@nestjs/common';
import { CustomerCrmController } from './customer-crm.controller';
import { CustomerCrmService } from './customer-crm.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [CustomerCrmController],
  providers: [CustomerCrmService],
  exports: [CustomerCrmService],
})
export class CustomerCrmModule {}
