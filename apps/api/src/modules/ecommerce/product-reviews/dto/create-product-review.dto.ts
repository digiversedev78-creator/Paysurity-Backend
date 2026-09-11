// create-product-review.dto.ts

import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProductReviewDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @Min(1)
  rating: number;
}
