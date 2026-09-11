import { Module } from '@nestjs/common';
import { DeliveryDriverAssignmentService } from './delivery-driver-assignment.service';
import { DeliveryDriverAssignmentController } from './delivery.controller';

@Module({
  imports: [],
  controllers: [DeliveryDriverAssignmentController],
  providers: [DeliveryDriverAssignmentService],
  exports: [DeliveryDriverAssignmentService],
})
export class DeliveryModule {}
