// @reusable:grocerease @origin:POSR
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-001 -- SKU Product Management
 * FILE TYPE:    SERVICE
 * MODULE:       products
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-074
 * GENERATED:    2026-03-17T13:09:06.254Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { Inject } from '@nestjs/common';

import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto, PaginationDto } from './dto/products.dto';
import { products } from '@paysurity/database';
type Product = any; type NewProduct = any;
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('DATABASE') private readonly db: any,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(tenantId: string, userId: string, createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const existingProduct = await this.db.query.products.findFirst({
      where: and(eq(products.tenantId, tenantId), eq(products.sku, createProductDto.sku)),
    });

    if (existingProduct) {
      throw new ConflictException(`Product with SKU '${createProductDto.sku}' already exists for this tenant.`);
    }

    const newProduct: NewProduct = {
      tenantId,
      sku: createProductDto.sku,
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price.toString(), // Drizzle numeric stores as string
      currency: createProductDto.currency,
      stockQuantity: createProductDto.stockQuantity,
      isActive: createProductDto.isActive,
      // GrocerEase Specific Fields
      category: (createProductDto as any).category,
      nutritionInfo: (createProductDto as any).nutritionInfo, // Drizzle handles jsonb directly
      allergens: (createProductDto as any).allergens,         // Drizzle handles jsonb directly
      weightUnitPricing: (createProductDto as any).weightUnitPricing, // Drizzle handles jsonb directly
      bulkPricingTiers: (createProductDto as any).bulkPricingTiers,   // Drizzle handles jsonb directly
    };

    const [createdProduct] = (await (this.db as any).insert(products).values(newProduct).returning() as any);

    if (!createdProduct) {
      throw new Error('Failed to create product.');
    }

    await (this.auditLogService as any).logAuditAction(tenantId, userId, 'products', createdProduct.id, 'CREATE', null, createdProduct);

    return plainToInstance(ProductResponseDto, {
      ...createdProduct,
      price: parseFloat(createdProduct.price), // Convert back to number for DTO
    });
  }

  async findAll(tenantId: string, { page = 1, pageSize = 10 }: any): Promise<{ data: ProductResponseDto[]; total: number; page: number; pageSize: number }> {
    const offset = (page - 1) * pageSize;

    const allProducts = await this.db.query.products.findMany({
      where: eq(products.tenantId, tenantId),
      limit: pageSize,
      offset: offset,
      orderBy: [desc(products.createdAt)], // Order by creation date, newest first
    });

    const totalItems = await this.db
      .select({ count: count(products.id) })
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const total = totalItems[0].count;

    const data = allProducts.map(product => plainToInstance(ProductResponseDto, {
      ...product,
      price: parseFloat(product.price),
    }));

    return { data, total, page, pageSize };
  }

  async findOne(tenantId: string, id: string): Promise<ProductResponseDto> {
    const product = await this.db.query.products.findFirst({
      where: and(eq(products.tenantId, tenantId), eq(products.id, id)),
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found.`);
    }

    return plainToInstance(ProductResponseDto, {
      ...product,
      price: parseFloat(product.price),
    });
  }

  async update(tenantId: string, userId: string, id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const existingProduct = await this.db.query.products.findFirst({
      where: and(eq(products.tenantId, tenantId), eq(products.id, id)),
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID '${id}' not found.`);
    }

    // Check for SKU conflict if SKU is being updated
    if (updateProductDto.sku && updateProductDto.sku !== existingProduct.sku) {
      const skuConflict = await this.db.query.products.findFirst({
        where: and(eq(products.tenantId, tenantId), eq(products.sku, updateProductDto.sku)),
      });
      if (skuConflict) {
        throw new ConflictException(`Product with SKU '${updateProductDto.sku}' already exists for this tenant.`);
      }
    }

    const updatedProductData: Partial<Product> = {
      ...updateProductDto,
      price: updateProductDto.price !== undefined ? updateProductDto.price.toString() : existingProduct.price,
      // GrocerEase Specific Fields
      category: (updateProductDto as any).category ?? existingProduct.category,
      nutritionInfo: (updateProductDto as any).nutritionInfo ?? existingProduct.nutritionInfo,
      allergens: (updateProductDto as any).allergens ?? existingProduct.allergens,
      weightUnitPricing: (updateProductDto as any).weightUnitPricing ?? existingProduct.weightUnitPricing,
      bulkPricingTiers: (updateProductDto as any).bulkPricingTiers ?? existingProduct.bulkPricingTiers,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    const [updatedProduct] = (await (this.db as any)
      .update(products)
      .set(updatedProductData)
      .where(and(eq(products.tenantId, tenantId), eq(products.id, id)))
      .returning() as any);

    if (!updatedProduct) {
      throw new Error('Failed to update product.'); // Should not happen if existingProduct was found
    }

    await (this.auditLogService as any).logAuditAction(tenantId, userId, 'products', updatedProduct.id, 'UPDATE', existingProduct, updatedProduct);

    return plainToInstance(ProductResponseDto, {
      ...updatedProduct,
      price: parseFloat(updatedProduct.price),
    });
  }

  async remove(tenantId: string, userId: string, id: string): Promise<void> {
    const existingProduct = await this.db.query.products.findFirst({
      where: and(eq(products.tenantId, tenantId), eq(products.id, id)),
    });

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID '${id}' not found.`);
    }

    const [deletedProduct] = (await (this.db as any)
      .delete(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.id, id)))
      .returning() as any);

    if (!deletedProduct) {
      throw new Error('Failed to delete product.');
    }

    await (this.auditLogService as any).logAuditAction(tenantId, userId, 'products', id, 'DELETE', existingProduct, null);
  }
}


