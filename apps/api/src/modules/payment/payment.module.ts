/**
 * PaymentModule — re-enabled Phase 3B.
 * Provides GatewayRouter + all 3 payment adapters.
 */
import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { GatewayRouter } from './adapters/gateway-router';
import { FluidPayAdapter } from './adapters/fluidpay.adapter';
import { NMIAdapter } from './adapters/nmi.adapter';
import { ArgyleAdapter } from './adapters/argyle.adapter';
import { EventBusModule } from '../event-bus/event-bus.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { FluidPayService } from './fluidpay.service';

@Module({
  imports: [EventBusModule, AuditLogModule],
  controllers: [PaymentController],
  providers: [PaymentService, GatewayRouter, FluidPayAdapter, NMIAdapter, ArgyleAdapter, FluidPayService],
  exports: [PaymentService, GatewayRouter, FluidPayAdapter, FluidPayService],
})
export class PaymentModule {}
