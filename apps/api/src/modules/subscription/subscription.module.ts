import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    AuditLogModule,
    ScheduleModule,
    EventEmitterModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
