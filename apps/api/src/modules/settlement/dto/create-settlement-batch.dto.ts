import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSettlementBatchDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
