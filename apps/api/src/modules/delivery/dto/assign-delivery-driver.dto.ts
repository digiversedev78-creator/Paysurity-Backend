import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignDeliveryDriverDto {
  @ApiProperty({
    description: 'The unique identifier of the delivery to which the driver will be assigned.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID('4', { message: 'Delivery ID must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Delivery ID is required.' })
  deliveryId: string;

  @ApiProperty({
    description: 'The unique identifier of the driver to assign to the delivery.',
    example: 'f6e5d4c3-b2a1-0987-6543-210fedcba987',
  })
  @IsUUID('4', { message: 'Driver ID must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Driver ID is required.' })
  driverId: string;
}
