import { IsNumber, IsOptional, IsString, IsDate, IsPositive, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CloseShiftDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  finalCashBalance?: number; // The reported final cash balance for the shift

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  closingNotes?: string; // Any additional notes related to the shift closure

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  actualEndTime?: Date; // The actual end time of the shift, if different from the system's current time
}
