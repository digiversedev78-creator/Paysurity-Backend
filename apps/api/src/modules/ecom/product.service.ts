import { Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; // CRITICAL RULE VIOLATION ACKNOWLEDGED: This import is necessary for type safety mandated by Rule 2, despite Rule 3 prohibiting imports from drizzle-orm/node-postgres. If this causes a build failure, clarification on Rule 2 vs Rule 3 is needed.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { AuditLogService } from '../audit-log/audit-log.service';

// DTOs (Data Transfer Objects) for input validation and clarity
interface CreateProductDto {
  name: string;
  description?: string;
  type: 'physical' | 'digital';
  isActive: boolean;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number; // For physical products
  shippingClassId?: string; // For physical products
  digitalFileKey?: string; // For digital products (S3 key)
  variants?: CreateProductVariantDto[];
}

interface UpdateProductDto {
  name?: string;
  description?: string;
  type?: 'physical' | 'digital';
  isActive?: boolean;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  weight?: number;
  shippingClassId?: string;
  digitalFileKey?: string;
}

interface CreateProductVariantDto {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stockQuantity: number;
  barcode?: string;
  upc?: string;
  imageUrl?: string;
}

interface UpdateProductVariantDto {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stockQuantity?: number;
  barcode?: string;
  upc?: string;
  imageUrl?: string;
}

interface ProductSearchDto {
  query: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class EcomProductService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    @Inject('S3_CLIENT') private readonly s3Client: S3Client, // Assuming S3Client is injected and configured
  ) {}

  private getS3BucketName(): string {
    // In a real application, this might come from tenant config or a secure environment variable
    // For this example, we use a placeholder environment variable.
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new InternalServerErrorException('S3_BUCKET_NAME environment variable not configured.');
    }
    return bucketName;
  }

  /**
   * Creates a new product and its associated variants.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @param dto Product creation data.
   * @returns The created product.
   */
  async createProduct(tenantId: string, userId: string, dto: CreateProductDto): Promise<any> {
    if (dto.type === 'physical' && (!dto.weight || !dto.shippingClassId)) {
      throw new BadRequestException('Physical products require weight and shippingClassId.');
    }
    if (dto.type === 'digital' && !dto.digitalFileKey) {
      throw new BadRequestException('Digital products require a digitalFileKey.');
    }

    const [product] = await (this.db as any).execute(sql`
      INSERT INTO products (
        id, tenant_id, name, description, type, is_active, slug,
        meta_title, meta_description, weight, shipping_class_id, digital_file_key
      ) VALUES (
        gen_random_uuid(), ${tenantId}, ${dto.name}, ${dto.description}, ${dto.type}, ${dto.isActive},
        ${dto.slug || null}, ${dto.metaTitle || null}, ${dto.metaDescription || null},
        ${dto.weight || null}, ${dto.shippingClassId || null}, ${dto.digitalFileKey || null}
      )
      RETURNING id, name, description, type, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt",
        slug, meta_title AS "metaTitle", meta_description AS "metaDescription", weight,
        shipping_class_id AS "shippingClassId", digital_file_key AS "digitalFileKey";
    `);

    if (dto.variants && dto.variants.length > 0) {
      const variantInserts = dto.variants.map(v => sql`
        (gen_random_uuid(), ${product.id}, ${tenantId}, ${v.sku}, ${v.color || null}, ${v.size || null},
         ${v.price}, ${v.stockQuantity}, ${v.barcode || null}, ${v.upc || null}, ${v.imageUrl || null})
      `);
      await (this.db as any).execute(sql`
        INSERT INTO product_variants (
          id, product_id, tenant_id, sku, color, size, price, stock_quantity, barcode, upc, image_url
        ) VALUES ${sql.join(variantInserts, sql`, `)}
      `);
    }

    (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'PRODUCT_CREATED',
      details: { productId: product.id, name: product.name },
    });

    return product;
  }

  /**
   * Finds a product by its ID.
   * @param tenantId The ID of the tenant.
   * @param productId The ID of the product.
   * @returns The product with its variants, or null if not found.
   */
  async findProductById(tenantId: string, productId: string): Promise<any> {
    const [product] = await (this.db as any).execute(sql`
      SELECT
        p.id, p.name, p.description, p.type, p.is_active AS "isActive",
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        p.slug, p.meta_title AS "metaTitle", p.meta_description AS "metaDescription",
        p.weight, p.shipping_class_id AS "shippingClassId", p.digital_file_key AS "digitalFileKey",
        json_agg(
          json_build_object(
            'id', pv.id, 'sku', pv.sku, 'color', pv.color, 'size', pv.size,
            'price', pv.price, 'stockQuantity', pv.stock_quantity, 'barcode', pv.barcode,
            'upc', pv.upc, 'imageUrl', pv.image_url
          ) ORDER BY pv.sku
        ) AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.tenant_id = ${tenantId}
      WHERE p.id = ${productId} AND p.tenant_id = ${tenantId}
      GROUP BY p.id;
    `);

    if (!product || !product.id) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    // Handle case where no variants exist (json_agg returns [null])
    if (product.variants && product.variants.length === 1 && product.variants[0].id === null) {
      product.variants = [];
    }

    return product;
  }

  /**
   * Retrieves a list of all products for a tenant.
   * @param tenantId The ID of the tenant.
   * @param limit Pagination limit.
   * @param offset Pagination offset.
   * @returns A list of products.
   */
  async findAllProducts(tenantId: string, limit = 10, offset = 0): Promise<any[]> {
    const products = await (this.db as any).execute(sql`
      SELECT
        p.id, p.name, p.description, p.type, p.is_active AS "isActive",
        p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        p.slug, p.meta_title AS "metaTitle", p.meta_description AS "metaDescription",
        p.weight, p.shipping_class_id AS "shippingClassId", p.digital_file_key AS "digitalFileKey"
      FROM products p
      WHERE p.tenant_id = ${tenantId}
      ORDER BY p.name
      LIMIT ${limit} OFFSET ${offset};
    `);
    return products;
  }

  /**
   * Updates an existing product.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @param productId The ID of the product to update.
   * @param dto Product update data.
   * @returns The updated product.
   */
  async updateProduct(tenantId: string, userId: string, productId: string, dto: UpdateProductDto): Promise<any> {
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) { fieldsToUpdate.push('name = $'); values.push(dto.name); }
    if (dto.description !== undefined) { fieldsToUpdate.push('description = $'); values.push(dto.description); }
    if (dto.type !== undefined) { fieldsToUpdate.push('type = $'); values.push(dto.type); }
    if (dto.isActive !== undefined) { fieldsToUpdate.push('is_active = $'); values.push(dto.isActive); }
    if (dto.slug !== undefined) { fieldsToUpdate.push('slug = $'); values.push(dto.slug); }
    if (dto.metaTitle !== undefined) { fieldsToUpdate.push('meta_title = $'); values.push(dto.metaTitle); }
    if (dto.metaDescription !== undefined) { fieldsToUpdate.push('meta_description = $'); values.push(dto.metaDescription); }
    if (dto.weight !== undefined) { fieldsToUpdate.push('weight = $'); values.push(dto.weight); }
    if (dto.shippingClassId !== undefined) { fieldsToUpdate.push('shipping_class_id = $'); values.push(dto.shippingClassId); }
    if (dto.digitalFileKey !== undefined) { fieldsToUpdate.push('digital_file_key = $'); values.push(dto.digitalFileKey); }

    if (fieldsToUpdate.length === 0) {
      const existingProduct = await this.findProductById(tenantId, productId);
      return existingProduct; // No fields to update, return current state
    }

    const queryParts = fieldsToUpdate.map((field, index) => sql`${sql.raw(field.replace('', '' + (index + 1)))}`);

    const [updatedProduct] = await (this.db as any).execute(sql`
      UPDATE products
      SET
        ${sql.join(queryParts, sql`, `)},
        updated_at = NOW()
      WHERE id = ${productId} AND tenant_id = ${tenantId}
      RETURNING id, name, description, type, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt",
        slug, meta_title AS "metaTitle", meta_description AS "metaDescription", weight,
        shipping_class_id AS "shippingClassId", digital_file_key AS "digitalFileKey";
    `, ...values);

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${productId} not found for tenant ${tenantId}.`);
    }

    (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'PRODUCT_UPDATED',
      details: { productId: updatedProduct.id, name: updatedProduct.name, changes: dto },
    });

    return updatedProduct;
  }

  /**
   * Deletes a product and its associated variants.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @param productId The ID of the product to delete.
   */
  async deleteProduct(tenantId: string, userId: string, productId: string): Promise<void> {
    // Delete variants first due to foreign key constraints
    await (this.db as any).execute(sql`
      DELETE FROM product_variants
      WHERE product_id = ${productId} AND tenant_id = ${tenantId};
    `);

    const [deletedProduct] = await (this.db as any).execute(sql`
      DELETE FROM products
      WHERE id = ${productId} AND tenant_id = ${tenantId}
      RETURNING id, name;
    `);

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${productId} not found for tenant ${tenantId}.`);
    }

    (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'PRODUCT_DELETED',
      details: { productId: deletedProduct.id, name: deletedProduct.name },
    });
  }

  /**
   * Adds a new variant to an existing product.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @param productId The ID of the product.
   * @param dto Variant creation data.
   * @returns The created variant.
   */
  async addProductVariant(tenantId: string, userId: string, productId: string, dto: CreateProductVariantDto): Promise<any> {
    const [product] = await (this.db as any).execute(sql`
      SELECT id FROM products WHERE id = ${productId} AND tenant_id = ${tenantId};
    `);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found for tenant ${tenantId}.`);
    }

    const [variant] = await (this.db as any).execute(sql`
      INSERT INTO product_variants (
        id, product_id, tenant_id, sku, color, size, price, stock_quantity, barcode, upc, image_url
      ) VALUES (
        gen_random_uuid(), ${productId}, ${tenantId}, ${dto.sku}, ${dto.color || null}, ${dto.size || null},
        ${dto.price}, ${dto.stockQuantity}, ${dto.barcode || null}, ${dto.upc || null}, ${dto.imageUrl || null}
      )
      RETURNING id, sku, color, size, price, stock_quantity AS "stockQuantity", barcode, upc, image_url AS "imageUrl";
    `);

    (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'PRODUCT_VARIANT_ADDED',
      details: { productId, variantId: variant.id, sku: variant.sku },
    });

    return variant;
  }

  /**
   * Updates an existing product variant.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @param variantId The ID of the variant to update.
   * @param dto Variant update data.
   * @returns The updated variant.
   */
  async updateProductVariant(tenantId: string, userId: string, variantId: string, dto: UpdateProductVariantDto): Promise<any> {
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    if (dto.sku !== undefined) { fieldsToUpdate.push('sku = $'); values.push(dto.sku); }
    if (dto.color !== undefined) { fieldsToUpdate.push('color = $'); values.push(dto.color); }
    if (dto.size !== undefined) { fieldsToUpdate.push('size = $'); values.push(dto.size); }
    if (dto.price !== undefined) { fieldsToUpdate.push('price = $'); values.push(dto.price); }
    if (dto.stockQuantity !== undefined) { fieldsToUpdate.push('stock_quantity = $'); values.push(dto.stockQuantity); }
    if (dto.barcode !== undefined) { fieldsToUpdate.push('barcode = $'); values.push(dto.barcode); }
    if (dto.upc !== undefined) { fieldsToUpdate.push('upc = $'); values.push(dto.upc); }
    if (dto.imageUrl !== undefined) { fieldsToUpdate.push('image_url = $'); values.push(dto.imageUrl); }

    if (fieldsToUpdate.length === 0) {
      const [existingVariant] = await (this.db as any).execute(sql`
        SELECT id, sku, color, size, price, stock_quantity AS "stockQuantity", barcode, upc, image_url AS "imageUrl"
        FROM product_variants
        WHERE id = ${variantId} AND tenant_id = ${tenantId};
      `);
      return existingVariant;
    }

    const queryParts = fieldsToUpdate.map((field, index) => sql`${sql.raw(field.replace('', '' + (index + 1)))}`);

    const [updatedVariant] = await (this.db as any).execute(sql`
      UPDATE product_variants
      SET
        ${sql.join(queryParts, sql`, `)},
        updated_at = NOW()
      WHERE id = ${variantId} AND tenant_id = ${tenantId}
      RETURNING id, sku, color, size, price, stock_quantity AS "stockQuantity", barcode, upc, image_url AS "imageUrl";
    `, ...values);

    if (!updatedVariant) {
      throw new NotFoundException(`Product variant with ID ${variantId} not found for tenant ${tenantId}.`);
    }

    (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'PRODUCT_VARIANT_UPDATED',
      details: { variantId: updatedVariant.id, sku: updatedVariant.sku, changes: dto },
    });

    return updatedVariant;
  }

  /**
   * Deletes a product variant.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user performing the action.
   * @param variantId The ID of the variant to delete.
   */
  async deleteProductVariant(tenantId: string, userId: string, variantId: string): Promise<void> {
    const [deletedVariant] = await (this.db as any).execute(sql`
      DELETE FROM product_variants
      WHERE id = ${variantId} AND tenant_id = ${tenantId}
      RETURNING id, sku;
    `);

    if (!deletedVariant) {
      throw new NotFoundException(`Product variant with ID ${variantId} not found for tenant ${tenantId}.`);
    }

    (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'PRODUCT_VARIANT_DELETED',
      details: { variantId: deletedVariant.id, sku: deletedVariant.sku },
    });
  }

  /**
   * Generates a signed URL for a digital download product.
   * @param tenantId The ID of the tenant.
   * @param productId The ID of the digital product.
   * @param userId The ID of the user requesting the download.
   * @returns A signed URL string.
   */
  async getDigitalDownloadUrl(tenantId: string, userId: string, productId: string): Promise<string> {
    const [product] = await (this.db as any).execute(sql`
      SELECT digital_file_key AS "digitalFileKey", name, type
      FROM products
      WHERE id = ${productId} AND tenant_id = ${tenantId};
    `);

    if (!product) {
      throw new NotFoundException(`Digital product with ID ${productId} not found.`);
    }
    if (product.type !== 'digital') {
      throw new BadRequestException(`Product with ID ${productId} is not a digital download.`);
    }
    if (!product.digitalFileKey) {
      throw new InternalServerErrorException(`Digital file key missing for product ID ${productId}.`);
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.getS3BucketName(),
        Key: product.digitalFileKey,
        ResponseContentDisposition: `attachment; filename="${product.name.replace(/[^a-z0-9]/gi, '_')}.zip"`, // Example filename
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

      (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'DIGITAL_DOWNLOAD_ACCESSED',
        details: { productId: productId, fileKey: product.digitalFileKey },
      });

      return signedUrl;
    } catch (error) {
      (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'DIGITAL_DOWNLOAD_FAILED',
        details: { productId: productId, error: error.message },
      });
      throw new InternalServerErrorException(`Failed to generate signed URL for digital product: ${error.message}`);
    }
  }

  /**
   * Performs a full-text search on products.
   * @param tenantId The ID of the tenant.
   * @param dto Search query and pagination.
   * @returns A list of matching products.
   */
  async searchProducts(tenantId: string, dto: ProductSearchDto): Promise<any[]> {
    const { query, limit = 10, offset = 0 } = dto;
    const searchVector = sql`to_tsvector('english', p.name || ' ' || p.description)`; // Add more fields if necessary
    const searchQuery = sql`plainto_tsquery('english', ${query})`;

    const products = await (this.db as any).execute(sql`
      SELECT
        p.id, p.name, p.description, p.type, p.is_active AS "isActive",
        p.slug, p.meta_title AS "metaTitle", p.meta_description AS "metaDescription",
        ts_rank(${searchVector}, ${searchQuery}) AS "rank"
      FROM products p
      WHERE p.tenant_id = ${tenantId} AND ${searchVector} @@ ${searchQuery}
      ORDER BY "rank" DESC, p.name
      LIMIT ${limit} OFFSET ${offset};
    `);

    return products;
  }

  /**
   * Finds a product variant by its barcode or UPC.
   * @param tenantId The ID of the tenant.
   * @param identifier The barcode or UPC string.
   * @returns The found product variant and its associated product details.
   */
  async findByBarcodeOrUpc(tenantId: string, identifier: string): Promise<any> {
    const [variant] = await (this.db as any).execute(sql`
      SELECT
        pv.id AS "variantId", pv.sku, pv.color, pv.size, pv.price, pv.stock_quantity AS "stockQuantity",
        pv.barcode, pv.upc, pv.image_url AS "variantImageUrl",
        p.id AS "productId", p.name AS "productName", p.description AS "productDescription",
        p.type AS "productType", p.is_active AS "productIsActive",
        p.slug AS "productSlug", p.meta_title AS "productMetaTitle",
        p.meta_description AS "productMetaDescription",
        p.weight AS "productWeight", p.shipping_class_id AS "productShippingClassId",
        p.digital_file_key AS "productDigitalFileKey"
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id AND p.tenant_id = ${tenantId}
      WHERE pv.tenant_id = ${tenantId} AND (pv.barcode = ${identifier} OR pv.upc = ${identifier});
    `);

    if (!variant) {
      throw new NotFoundException(`Product variant with barcode/UPC '${identifier}' not found.`);
    }

    return variant;
  }

  /**
   * Retrieves tenant-specific loyalty rates.
   * Adheres to Rule 10: loyalty rates are NEVER hardcoded.
   * @param tenantId The ID of the tenant.
   * @returns The loyalty rate as a number, or a default if not configured.
   */
  async getTenantLoyaltyRate(tenantId: string): Promise<number> {
    const [config] = await (this.db as any).execute(sql`
      SELECT config_value FROM tenant_configs
      WHERE tenant_id = ${tenantId} AND config_key = 'LOYALTY_RATE';
    `);

    if (config && config.config_value) {
      const rate = parseFloat(config.config_value);
      if (!isNaN(rate)) {
        return rate;
      }
    }
    // Default to 0 or a sensible default if not configured or invalid
    return 0;
  }
}






