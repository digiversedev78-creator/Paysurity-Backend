import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

import { ProductReviewsService } from './product-reviews.service';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';
import { ProductReviewDto } from './dto/product-review.dto';
import { User } from '../../../auth/decorators/user.decorator';
type AuthenticatedUser = any;

@ApiBearerAuth()
@ApiTags('Product Reviews')
@Controller('ecommerce/product-reviews')
export class ProductReviewsController {
  constructor(private readonly productReviewsService: ProductReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product review' })
  @ApiCreatedResponse({ description: 'The product review has been successfully created.', type: ProductReviewDto })
  async create(
    @User() user: AuthenticatedUser,
    @Body() createProductReviewDto: CreateProductReviewDto
  ): Promise<ProductReviewDto> {
    return (this.productReviewsService as any).create(user.id, createProductReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product reviews' })
  @ApiOkResponse({ description: 'List of all product reviews', type: [ProductReviewDto] })
  async findAll(): Promise<any> {
    return (this.productReviewsService as any).findAll();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product reviews for a specific product' })
  @ApiOkResponse({ description: 'List of product reviews for the specified product', type: [ProductReviewDto] })
  async findByProductId(@Param('productId', ParseIntPipe) productId: number): Promise<any> {
    return (this.productReviewsService as any).findByProductId(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product review by ID' })
  @ApiOkResponse({ description: 'The product review found by ID', type: ProductReviewDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductReviewDto> {
    return (this.productReviewsService as any).findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing product review' })
  @ApiOkResponse({ description: 'The product review has been successfully updated.', type: ProductReviewDto })
  async update(
    @User() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductReviewDto: UpdateProductReviewDto
  ): Promise<ProductReviewDto> {
    return (this.productReviewsService as any).update(id, user.id, updateProductReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product review' })
  @ApiNoContentResponse({ description: 'The product review has been successfully deleted.' })
  async remove(
    @User() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    await (this.productReviewsService as any).remove(id, user.id);
  }
}


