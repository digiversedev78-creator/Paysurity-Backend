type CreateDeliveryDriverAssignmentDto = any; type UpdateDeliveryDriverAssignmentDto = any; type DeliveryDriverAssignmentIdParamDto = any; type DriverIdParamDto = any; type DeliveryIdParamDto = any;
import { Controller, Post, Get, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { DeliveryDriverAssignmentService } from './delivery-driver-assignment.service';

 

@Controller('delivery-driver-assignments')
export class DeliveryDriverAssignmentController {
  constructor(private readonly deliveryDriverAssignmentService: DeliveryDriverAssignmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDeliveryDriverAssignmentDto: CreateDeliveryDriverAssignmentDto) {
    return (this.deliveryDriverAssignmentService as any).create(createDeliveryDriverAssignmentDto);
  }

  @Get()
  findAll() {
    return (this.deliveryDriverAssignmentService as any).findAll();
  }

  @Get('driver/:driverId')
  findByDriver(@Param() { driverId }: DriverIdParamDto) {
    return (this.deliveryDriverAssignmentService as any).findByDriverId(driverId);
  }

  @Get('delivery/:deliveryId')
  findByDelivery(@Param() { deliveryId }: DeliveryIdParamDto) {
    return (this.deliveryDriverAssignmentService as any).findByDeliveryId(deliveryId);
  }

  @Get(':id')
  findOne(@Param() { id }: DeliveryDriverAssignmentIdParamDto) {
    return (this.deliveryDriverAssignmentService as any).findOne(id);
  }

  @Patch(':id')
  update(
    @Param() { id }: DeliveryDriverAssignmentIdParamDto,
    @Body() updateDeliveryDriverAssignmentDto: UpdateDeliveryDriverAssignmentDto,
  ) {
    return (this.deliveryDriverAssignmentService as any).update(id, updateDeliveryDriverAssignmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param() { id }: DeliveryDriverAssignmentIdParamDto) {
    return (this.deliveryDriverAssignmentService as any).remove(id);
  }
}





