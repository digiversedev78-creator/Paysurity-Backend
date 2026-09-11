import { IsString, IsNumberString, Length, IsEnum, IsISO8601, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePayrollRunDto {
  @IsISO8601()
  @IsNotEmpty()
  payPeriodStart: string;

  @IsISO8601()
  @IsNotEmpty()
  payPeriodEnd: string;

  @IsOptional()
  @IsISO8601()
  runDate?: string;
}

export class StoreBankDetailsDto {
  @IsNumberString()
  @Length(9, 9)
  @IsNotEmpty()
  routingNumber: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}

export enum AchStatus {
  SUBMITTED = 'SUBMITTED',
  SETTLED = 'SETTLED',
  RETURNED = 'RETURNED',
}

export class UpdateAchStatusDto {
  @IsEnum(AchStatus)
  @IsNotEmpty()
  status: AchStatus;

  @IsOptional()
  @IsString()
  traceNumber?: string;

  @IsOptional()
  @IsString()
  returnCode?: string;
}
