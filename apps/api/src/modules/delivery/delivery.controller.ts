/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-006 -- Delivery Driver Assignment
 * FILE TYPE:    CONTROLLER
 * MODULE:       delivery
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-052
 * GENERATED:    2026-03-17T13:07:28.257Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {
  Controller,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { AssignDeliveryDriverDto } from './dto/assign-delivery-driver.dto';
import { DeliveryDriverAssignmentService } from './delivery-driver-assignment.service';
import { IsUUID } from 'class-validator';

// DTO for orderId parameter
class OrderIdParamDto {
  @IsUUID('4', { message: 'orderId must be a valid UUID v4' })
  orderId: string;
}

@Controller('delivery/orders')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class DeliveryDriverAssignmentController {
  constructor(
    private readonly deliveryDriverAssignmentService: DeliveryDriverAssignmentService,
  ) {}

  @Patch(':orderId/assign-driver')
  @HttpCode(HttpStatus.OK)
  async assignDriver(
    @Param() { orderId }: OrderIdParamDto,
    @Body() assignDeliveryDriverDto: AssignDeliveryDriverDto,
  ) {
    // In a production setup, tenantId and userId would typically be extracted
    // from authentication (e.g., JWT payload) via custom decorators or guards,
    // rather than being directly provided in the request body for security reasons.
    // For this example, we're using them from the DTO to demonstrate the service's API.

    const { driverId, tenantId, userId, status  } = (assignDeliveryDriverDto as any);

    return (this.deliveryDriverAssignmentService as any).assignDeliveryDriver(
      tenantId,
      userId,
      orderId,
      driverId,
      status,
    );
  }
}




