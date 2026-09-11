import { Module } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { GroceryController } from './grocery.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [AuditLogModule, EventBusModule],
  controllers: [GroceryController],
  providers: [GroceryService],
  exports: [GroceryService],
})
export class GroceryModule {}
