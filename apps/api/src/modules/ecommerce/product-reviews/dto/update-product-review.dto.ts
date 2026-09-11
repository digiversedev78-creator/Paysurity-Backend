import { IsNumber, IsOptional, IsString, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateProductReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;
}
