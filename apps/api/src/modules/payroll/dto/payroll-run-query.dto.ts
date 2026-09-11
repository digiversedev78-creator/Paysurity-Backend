import { IsString, IsOptional } from 'class-validator';

export class PayrollRunQueryDto {
  @IsString()
  @IsOptional()
  payrollCycleId?: string;
}
