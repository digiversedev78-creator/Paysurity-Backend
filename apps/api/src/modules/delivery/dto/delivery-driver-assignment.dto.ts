/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeliveryDriverAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  deliveryId: string;

  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @IsString()
  @IsNotEmpty()
  assignmentStatus: string;
}
