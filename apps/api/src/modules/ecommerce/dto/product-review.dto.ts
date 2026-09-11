import {
  IsUUID,
  IsString,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductReviewDto {
  @IsUUID('4')
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class UpdateProductReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class GetProductReviewsDto {
  @IsUUID('4')
  @IsOptional()
  productId?: string;

  @IsUUID('4')
  @IsOptional()
  userId?: string; // Optional: filter reviews by user

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  minRating?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  maxRating?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1; // Default page is 1

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Reasonable max limit
  @IsOptional()
  limit?: number = 10; // Default limit is 10
}
