/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ECO-007 -- Product Reviews
 * FILE TYPE:    CONTROLLER
 * MODULE:       ecommerce
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/ECO_ECOMMERCE.md
 * WORKER:       CODER-137
 * GENERATED:    2026-03-17T13:12:06.706Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// ECO-007-ProductReviews-ecommerce-P2-products
// Path: src/ecommerce/product-reviews/product-reviews.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ProductReviewsService } from './product-reviews.service';
import { CreateProductReviewDto, UpdateProductReviewDto, GetProductReviewsDto } from './dto/product-review.dto';
import { TenantId, UserId } from '../../common/decorators'; // Assuming custom decorators location

@Controller('products/:productId/reviews')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProductReviewsController {
  constructor(private readonly productReviewsService: ProductReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('productId') productId: string,
    @Body() createProductReviewDto: CreateProductReviewDto,
  ) {
    const review = await this.productReviewsService.createReview(
      tenantId,
      userId,
      productId,
      createProductReviewDto,
    );
    return {
      message: 'Product review created successfully.',
      data: review,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProductReviews(
    @TenantId() tenantId: string,
    @Param('productId') productId: string,
    @Query() queryDto: GetProductReviewsDto,
  ) {
    const result = await this.productReviewsService.getProductReviews(
      tenantId,
      productId,
      queryDto,
    );
    return {
      message: 'Product reviews retrieved successfully.',
      data: result.reviews,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize),
      },
    };
  }

  @Get(':reviewId') // This path segment is relative to the controller's base path: /products/:productId/reviews/:reviewId
  @HttpCode(HttpStatus.OK)
  async getReviewById(
    @TenantId() tenantId: string,
    @Param('productId') productId: string, // For context/consistency with controller path
    @Param('reviewId') reviewId: string,
  ) {
    const review = await this.productReviewsService.getReviewById(tenantId, reviewId);
    // Optional: Add a check if review.productId !== productId from param for stricter access control.
    return {
      message: 'Product review retrieved successfully.',
      data: review,
    };
  }

  @Patch(':reviewId')
  @HttpCode(HttpStatus.OK)
  async updateReview(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('productId') productId: string, // For context/consistency
    @Param('reviewId') reviewId: string,
    @Body() updateProductReviewDto: UpdateProductReviewDto,
  ) {
    const updatedReview = await this.productReviewsService.updateReview(
      tenantId,
      userId,
      reviewId,
      updateProductReviewDto,
    );
    return {
      message: 'Product review updated successfully.',
      data: updatedReview,
    };
  }

  @Delete(':reviewId')
  @HttpCode(HttpStatus.NO_CONTENT) // No content on successful delete
  async deleteReview(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('productId') productId: string, // For context/consistency
    @Param('reviewId') reviewId: string,
  ) {
    await this.productReviewsService.deleteReview(tenantId, userId, reviewId);
    // NestJS will automatically send a 204 No Content response
  }
}
