import { IsNumber, IsString } from 'class-validator';

export class PayrollRunDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;
}
