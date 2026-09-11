import { IsString, IsInt, IsDate, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RestaurantZReportDto {
  @IsString()
  restaurantId: string;

  @IsDate()
  @Type(() => Date)
  reportDate: Date;

  @IsInt()
  @Min(0)
  totalOrders: number;

  @IsInt()
  @Min(0)
  totalRevenueCents: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
