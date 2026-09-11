import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateEmployeeScheduleDto {
  @IsNotEmpty()
  employeeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
