import { IsString, IsNotEmpty } from 'class-validator';

export class SettlementDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
