/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  GE-001 -- Grocery Inventory Management
 * FILE TYPE:    CONTROLLER
 * MODULE:       inventory
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GE_GROCERY_INVENTORY.md
 * WORKER:       CODER-072
 * GENERATED:    2024-07-30T10:30:00.000Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// @reusable:grocerease @origin:POSR
import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, HttpStatus, Query, Request, Inject, NotFoundException, Put, ConflictException, HttpCode, BadRequestException, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { NodePgDatabase } from 'drizzle-orm/pg-core';
import { and, eq, lt } from 'drizzle-orm';
import { IsString, IsNumber, IsOptional, Min, IsUUID, IsNotEmpty, IsEnum } from 'class-validator';

// Drizzle ORM Schema definitions (defined inline as per rules to avoid forbidden imports)
import { pgTable, uuid, varchar, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { unique } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(), // Primary key, auto-generated UUID
  tenantId: uuid('tenant_id').notNull(), // Tenant identifier for multi-tenancy
  barcode: varchar('barcode', { length: 255 }).notNull(), // UPC or EAN
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1024 }),
  stockLevel: integer('stock_level').notNull().default(0),
  reorderPoint: integer('reorder_point').notNull().default(0),
  supplierId: uuid('supplier_id').notNull(), // Assuming suppliers have UUIDs
  cost: numeric('cost', { precision: 10, scale: 2 }).notNull(), // Cost price
  price: numeric('price', { precision: 10, scale: 2 }).notNull(), // Selling price
  category: varchar('category', { length: 255 }),
  locationBin: varchar('location_bin', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(), // Automatically updates on record modification
}, (table) => {
  return {
    // Composite unique constraint to ensure barcode uniqueness per tenant
    tenantBarcodeIdx: unique('tenant_barcode_idx').on(table.tenantId, table.barcode),
  };
});

// @reusable:grocerease
// DTOs for Product management
export class CreateProductDto {
  @ApiProperty({ description: 'Unique identifier for the product, e.g., UPC or EAN', example: '012345678905' })
  @IsString() @IsNotEmpty()
  barcode: string; // UPC or EAN

  @ApiProperty({ description: 'Name of the product', example: 'Organic Apples Gala' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, description: 'Detailed description of the product', example: 'Fresh organic Gala apples, sweet and crisp.' })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ description: 'Current stock level of the product', example: 100, default: 0 })
  @IsNumber() @Min(0) @IsOptional() // Use IsOptional because default is handled by DB schema if not provided
  stockLevel?: number;

  @ApiProperty({ description: 'Reorder point for the product. An alert is triggered if stock falls below this level.', example: 20, default: 0 })
  @IsNumber() @Min(0) @IsOptional() // Use IsOptional because default is handled by DB schema if not provided
  reorderPoint?: number;

  @ApiProperty({ description: 'UUID of the supplier for this product', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID() @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ description: 'Cost price of the product', example: 1.50 })
  @IsNumber() @Min(0) @IsNotEmpty()
  cost: number;

  @ApiProperty({ description: 'Selling price of the product', example: 2.99 })
  @IsNumber() @Min(0) @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false, description: 'Product category', example: 'Fruits' })
  @IsOptional() @IsString()
  category?: string;

  @ApiProperty({ required: false, description: 'Physical location bin or shelf number', example: 'Aisle 3, Shelf B' })
  @IsOptional() @IsString()
  locationBin?: string;
}

// DTO for updating a product (all fields optional)
export class UpdateProductDto {
  @ApiProperty({ required: false, description: 'Unique identifier for the product, e.g., UPC or EAN', example: '012345678905' })
  @IsOptional() @IsString() @IsNotEmpty()
  barcode?: string;

  @ApiProperty({ required: false, description: 'Name of the product', example: 'Organic Fuji Apples' })
  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false, description: 'Detailed description of the product', example: 'Crisp, sweet, and tangy organic Fuji apples.' })
  @IsOptional() @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Current stock level of the product', example: 90 })
  @IsOptional() @IsNumber() @Min(0)
  stockLevel?: number;

  @ApiProperty({ required: false, description: 'Reorder point for the product', example: 25 })
  @IsOptional() @IsNumber() @Min(0)
  reorderPoint?: number;

  @ApiProperty({ required: false, description: 'UUID of the supplier for this product', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsOptional() @IsUUID()
  supplierId?: string;

  @ApiProperty({ required: false, description: 'Cost price of the product', example: 1.60 })
  @IsOptional() @IsNumber() @Min(0)
  cost?: number;

  @ApiProperty({ required: false, description: 'Selling price of the product', example: 3.10 })
  @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @ApiProperty({ required: false, description: 'Product category', example: 'Fruits & Vegetables' })
  @IsOptional() @IsString()
  category?: string;

  @ApiProperty({ required: false, description: 'Physical location bin or shelf number', example: 'Aisle 3, Shelf C' })
  @IsOptional() @IsString()
  locationBin?: string;
}

// Enum for stock adjustment operation
export enum StockOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
}

// DTO for stock adjustment
export class StockAdjustDto {
  @ApiProperty({ description: 'Quantity to add or subtract from stock', example: 10, minimum: 1 })
  @IsNumber() @Min(1) @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Operation type: "add" or "subtract"', enum: StockOperation, example: StockOperation.ADD })
  @IsEnum(StockOperation) @IsNotEmpty()
  operation: StockOperation;
}

@ApiTags('Inventory')
@Controller('inventory')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Enforce DTO validation
export class InventoryController {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  private getTenantId(req: Request): string {
    // req.user is populated by authentication guards, which are applied globally in main.ts per rules.
    const tenantId = (req as any)?.user?.tenantId;
    if (!tenantId) {
      // In a real application, this would typically be caught by an auth guard before reaching the controller.
      // However, as per rule 5, we ensure this check is present.
      throw new BadRequestException('Tenant ID not found in request context. Ensure authentication is applied.');
    }
    return tenantId;
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all inventory items or search by barcode for the current tenant' })
  @ApiQuery({ name: 'barcode', required: false, description: 'Optional: Filter items by barcode' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of inventory items.', isArray: true })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Tenant ID not found in request context.' })
  async findAll(@Request() req, @Query('barcode') barcode?: string) {
    const tenantId = this.getTenantId(req);

    let query = this.db.select().from(products).where(eq(products.tenantId, tenantId)).$dynamic();

    if (barcode) {
      query = query.where(and(eq(products.tenantId, tenantId), eq(products.barcode, barcode)));
    }

    const items = await query.execute();
    return items;
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new inventory item for the current tenant' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The item has been successfully created.', type: CreateProductDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product with this barcode already exists for this tenant.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or Tenant ID not found.' })
  async create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const tenantId = this.getTenantId(req);

    try {
      const [newProduct] = await this.db.insert(products).values({
        ...createProductDto,
        tenantId: tenantId,
        // Drizzle numeric type expects string representation for cost and price
        cost: String(createProductDto.cost),
        price: String(createProductDto.price),
      }).returning().execute();

      return newProduct;
    } catch (error) {
      // Check for Drizzle error indicating a unique constraint violation
      if (error instanceof Error && error.message.includes('tenant_barcode_idx')) {
        throw new ConflictException(`Product with barcode "${createProductDto.barcode}" already exists for this tenant.`);
      }
      throw error; // Re-throw other errors
    }
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update an existing inventory item for the current tenant' })
  @ApiParam({ name: 'id', description: 'UUID of the product to update', type: 'string' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'The item has been successfully updated.', type: UpdateProductDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or Tenant ID not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Product with updated barcode already exists for this tenant.' })
  async update(@Request() req, @Param('id', new ParseUUIDPipe()) id: string, @Body() updateProductDto: UpdateProductDto) {
    const tenantId = this.getTenantId(req);

    const updateData: Partial<typeof products.$inferInsert> = { ...updateProductDto };
    if (updateProductDto.cost !== undefined) {
        updateData.cost = String(updateProductDto.cost);
    }
    if (updateProductDto.price !== undefined) {
        updateData.price = String(updateProductDto.price);
    }

    try {
      const [updatedProduct] = await this.db.update(products)
        .set(updateData)
        .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
        .returning()
        .execute();

      if (!updatedProduct) {
        throw new NotFoundException(`Product with ID "${id}" not found for this tenant.`);
      }
      return updatedProduct;
    } catch (error) {
      if (error instanceof Error && error.message.includes('tenant_barcode_idx')) {
        throw new ConflictException(`Product with barcode "${updateProductDto.barcode}" already exists for this tenant.`);
      }
      throw error;
    }
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an inventory item for the current tenant' })
  @ApiParam({ name: 'id', description: 'UUID of the product to delete', type: 'string' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The item has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Tenant ID not found in request context.' })
  async remove(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    const tenantId = this.getTenantId(req);

    const [deletedProduct] = await this.db.delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning({ id: products.id })
      .execute();

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found for this tenant.`);
    }
    // No content response, so no return value needed.
  }

  @Post('items/:id/stock-adjust')
  @ApiOperation({ summary: 'Adjust stock level for an inventory item (add or subtract)' })
  @ApiParam({ name: 'id', description: 'UUID of the product to adjust stock for', type: 'string' })
  @ApiBody({ type: StockAdjustDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Stock level successfully adjusted.', type: CreateProductDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid adjustment quantity or operation, or Tenant ID not found.' })
  async adjustStock(@Request() req, @Param('id', new ParseUUIDPipe()) id: string, @Body() stockAdjustDto: StockAdjustDto) {
    const tenantId = this.getTenantId(req);

    const productToUpdate = await this.db.select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .limit(1)
      .execute();

    if (productToUpdate.length === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found for this tenant.`);
    }

    const currentStock = productToUpdate[0].stockLevel;
    let newStock: number;

    if (stockAdjustDto.operation === StockOperation.ADD) {
      newStock = currentStock + stockAdjustDto.quantity;
    } else { // StockOperation.SUBTRACT
      if (currentStock < stockAdjustDto.quantity) {
        throw new BadRequestException(`Cannot subtract ${stockAdjustDto.quantity} from current stock level of ${currentStock}. Resulting stock would be negative.`);
      }
      newStock = currentStock - stockAdjustDto.quantity;
    }

    const [updatedProduct] = await this.db.update(products)
      .set({ stockLevel: newStock, updatedAt: new Date() }) // Explicitly update `updatedAt` for Drizzle
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning()
      .execute();

    return updatedProduct;
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get all inventory items that are below their reorder point for the current tenant' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of low stock inventory items.', isArray: true })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Tenant ID not found in request context.' })
  async getLowStock(@Request() req) {
    const tenantId = this.getTenantId(req);

    const lowStockItems = await this.db.select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), lt(products.stockLevel, products.reorderPoint)))
      .execute();

    return lowStockItems;
  }
}
