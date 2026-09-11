import { Module, Global } from '@nestjs/common';
import { RefundWorkflowService } from './refund-workflow.service';
import { RefundWorkflowController } from './refund-workflow.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Global()
@Module({
  imports: [AuditLogModule],
  controllers: [RefundWorkflowController],
  providers: [
    RefundWorkflowService,
    {
      provide: 'PaymentAdapterService',
      useValue: {
        processRefund: async () => ({ success: true, gatewayRefundId: 'mock-refund-id' }),
      },
    },
  ],
  exports: [RefundWorkflowService],
})
export class RefundWorkflowModule {}
