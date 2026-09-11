import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class ScaleDeviceDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  weightCapacity: number;
}
