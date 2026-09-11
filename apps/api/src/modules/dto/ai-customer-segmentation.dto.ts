import { IsString, IsNotEmpty } from 'class-validator';

export class AiCustomerSegmentationDto {
  @IsString()
  @IsNotEmpty()
  customerType: string;
}
