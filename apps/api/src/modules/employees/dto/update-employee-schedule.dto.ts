import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateEmployeeScheduleDto {
  @IsUUID()
  @IsNotEmpty()
  scheduleId: string;

  @IsDateString()
  @IsNotEmpty()
  newStartTime: string;
}
