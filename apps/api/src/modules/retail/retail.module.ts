import { Module } from '@nestjs/common';
import { RetailService } from './retail.service';
import { CashControlService } from './cash-control.service';
import { CashControlController } from './cash-control.controller';
import { RetailController } from './retail.controller';
import { InventoryService } from './inventory.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [AuditLogModule, EventBusModule],
  controllers: [CashControlController, RetailController],
  providers: [RetailService, CashControlService, InventoryService],
  exports: [RetailService, CashControlService, InventoryService],
})
export class RetailModule {}
