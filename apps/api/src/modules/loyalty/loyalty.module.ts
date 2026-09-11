import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyEngineService } from './loyalty-engine.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DatabaseModule } from '../database/database.module'; // REQ-LOY-001: DATABASE token for loyalty persistence
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [AuditLogModule, DatabaseModule, EventBusModule],
  controllers: [],
  providers: [LoyaltyService, LoyaltyEngineService],
  exports: [LoyaltyService, LoyaltyEngineService],
})
export class LoyaltyModule {}
