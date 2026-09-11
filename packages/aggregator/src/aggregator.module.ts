// AGG-001: Aggregator Module — satisfies REQ-AGG-001, REQ-POSR-005
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // Required by AggregatorService.syncOrderStatus()
import { AggregatorService } from './aggregator.service';
import { AggregatorController } from './aggregator.controller';
import { NotificationModule } from '../notification/notification.module';
import { EventBusModule } from '../event-bus/event-bus.module';

@Module({
  imports: [HttpModule, NotificationModule, EventBusModule],
  controllers: [AggregatorController],
  providers: [AggregatorService],
  exports: [AggregatorService],
})
export class AggregatorModule {}
