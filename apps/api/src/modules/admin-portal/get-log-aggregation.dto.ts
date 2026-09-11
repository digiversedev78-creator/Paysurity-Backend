import { IsString, IsOptional } from 'class-validator';

export class GetLogAggregationDto {
  @IsString()
  @IsOptional()
  search?: string;
}
