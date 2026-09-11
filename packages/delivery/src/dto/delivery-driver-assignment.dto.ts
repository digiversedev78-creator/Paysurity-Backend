
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeliveryDriverAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  deliveryId!: string;

  @IsUUID()
  @IsNotEmpty()
  driverId!: string;

  @IsString()
  @IsNotEmpty()
  assignmentStatus!: string;
}

export class DeliveryDriverAssignmentIdParamDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}

export class DriverIdParamDto {
  @IsUUID()
  @IsNotEmpty()
  driverId!: string;
}

export class DeliveryIdParamDto {
  @IsUUID()
  @IsNotEmpty()
  deliveryId!: string;
}
