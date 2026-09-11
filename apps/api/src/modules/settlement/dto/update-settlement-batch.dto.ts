import { IsNotEmpty, IsString, IsArray, ArrayMinSize } from 'class-validator';

export class UpdateSettlementBatchDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  settlementIds: string[];
}
