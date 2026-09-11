import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
