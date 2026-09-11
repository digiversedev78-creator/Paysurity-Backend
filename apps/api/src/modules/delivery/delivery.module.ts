import { Module } from '@nestjs/common';
import { DeliveryDriverAssignmentService } from './delivery-driver-assignment.service';
import { DeliveryDriverAssignmentController } from './delivery-driver-assignment.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
@Module({
  imports: [AuditLogModule],
  controllers: [DeliveryDriverAssignmentController],
  providers: [DeliveryDriverAssignmentService],
  exports: [DeliveryDriverAssignmentService],
})
export class DeliveryModule {}
