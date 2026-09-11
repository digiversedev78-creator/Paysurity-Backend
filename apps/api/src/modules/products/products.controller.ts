// @reusable:grocerease @origin:POSR
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-001 -- SKU Product Management
 * FILE TYPE:    CONTROLLER
 * MODULE:       products
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-074
 * GENERATED:    2026-03-17T13:09:06.254Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, UsePipes, ValidationPipe, Query, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto, PaginationDto } from './dto/products.dto';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse } from '@nestjs/swagger';

// Guards are applied globally in main.ts, so @UseGuards() and related imports/definitions are removed.

@ApiBearerAuth()
@ApiTags('products')
@Controller('products')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
// @TenantAuthGuard() removed as guards are applied globally
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ description: 'The product has been successfully created.', type: ProductResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict: Product with given SKU already exists for this tenant.' })
  async create(
    @Request() req: any, // Replaced @TenantId() and @UserId()
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return (this.productsService as any).create(tenantId, userId, createProductDto);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all products for the tenant' })
  @ApiOkResponse({ description: 'List of products with pagination.', type: [ProductResponseDto] })
  async findAll(
    @Request() req: any, // Replaced @TenantId()
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: ProductResponseDto[]; total: number; page: number; pageSize: number }> {
    const tenantId = req.user.tenantId;
    return (this.productsService as any).findAll(tenantId, paginationDto);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiOkResponse({ description: 'The product details.', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(
    @Request() req: any, // Replaced @TenantId()
    @Param('id') id: string,
  ): Promise<ProductResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.productsService as any).findOne(tenantId, id);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiOkResponse({ description: 'The product has been successfully updated.', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 409, description: 'Conflict: Another product with the new SKU already exists for this tenant.' })
  async update(
    @Request() req: any, // Replaced @TenantId() and @UserId()
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return (this.productsService as any).update(tenantId, userId, id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiNoContentResponse({ description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(
    @Request() req: any, // Replaced @TenantId() and @UserId()
    @Param('id') id: string,
  ): Promise<void> {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    await (this.productsService as any).remove(tenantId, userId, id);
  }
}

