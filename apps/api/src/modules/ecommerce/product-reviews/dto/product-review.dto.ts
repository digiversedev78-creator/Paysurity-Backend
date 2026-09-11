// File: product-review.dto.ts

import { IsNumber, IsString } from 'class-validator';

export class ProductReviewDto {
  @IsNumber()
  productId: number;

  @IsString()
  reviewerName: string;

  @IsNumber()
  rating: number;

  @IsString()
  comment: string;
}
