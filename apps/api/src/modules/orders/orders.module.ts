import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventBusModule } from '../event-bus/event-bus.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuditLogModule,
    EventEmitterModule.forRoot(),
    EventBusModule,
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
