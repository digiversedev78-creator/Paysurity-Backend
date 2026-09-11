import { IsString, IsNotEmpty } from 'class-validator';

export class RetailDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
