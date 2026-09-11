import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
  NotFoundException,
  HttpCode,
  Headers,
  Res,
  Logger,
  InternalServerErrorException
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import * as crypto from 'crypto';

// The database type is simplified to any as per rule 2
interface NodePgDatabase<T> {}

 // 100 requests per 60 seconds (1 minute)
@Controller('store')
export class WebsiteController {
  private readonly logger = new Logger(WebsiteController.name);

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  private async getTenantIdBySlug(slug: string): Promise<string> {
    const sql = `SELECT id FROM tenants WHERE slug = $1`;
    try {
      const result = await (this.db as any).execute(sql, [slug]);
      if ((result as any).rows.length === 0) {
        throw new NotFoundException(`Store with slug "${slug}" not found.`);
      }
      return (result as any).rows[0].id;
    } catch (error) {
      this.logger.error(`Failed to get tenant ID for slug "${slug}": ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve store information.');
    }
  }

  private generateEtag(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto.createHash('md5').update(dataString).digest('hex');
  }

  @Get(':slug/products')
  @HttpCode(200)
  async getProducts(
    @Param('slug') slug: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('category_id') categoryId: string,
    @Query('min_price') minPrice: string,
    @Query('max_price') maxPrice: string,
    @Query('sort_by') sortBy: string = 'name',
    @Query('sort_order') sortOrder: string = 'asc',
    @Headers('if-none-match') ifNoneMatch: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tenantId = await this.getTenantIdBySlug(slug);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions: string[] = ['p.tenant_id = $1', 'p.is_active = TRUE'];
    const params: any[] = [tenantId];
    let paramIndex = 1;

    // Helper to add parameters and update index
    const addParam = (value: any) => {
      params.push(value);
      paramIndex++;
      return `$${paramIndex}`;
    };

    if (categoryId) {
      whereConditions.push(`p.category_id = ${addParam(categoryId)}`);
    }
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      whereConditions.push(`p.price >= ${addParam(parseFloat(minPrice))}`);
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      whereConditions.push(`p.price <= ${addParam(parseFloat(maxPrice))}`);
    }

    const orderByClause = ['name', 'price', 'created_at'].includes(sortBy)
      ? `p.${sortBy}`
      : 'p.name';
    const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const countSql = `
      SELECT COUNT(p.id)
      FROM products p
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''};
    `;

    const productsSql = `
      SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.slug,
          p.stock_quantity,
          c.id AS category_id,
          c.name AS category_name,
          p.created_at,
          p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY ${orderByClause} ${orderDirection}
      LIMIT ${addParam(limitNum)} OFFSET ${addParam(offset)};
    `;

    try {
      const [countResult, productsResult] = await Promise.all([
        (this.db as any).execute(countSql, params),
        (this.db as any).execute(productsSql, params),
      ]);

      const totalItems = parseInt((countResult as any).rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limitNum);

      const responsePayload = {
        data: (productsResult as any).rows,
        meta: {
          totalItems,
          currentPage: pageNum,
          itemsPerPage: limitNum,
          totalPages,
        },
      };

      const etag = this.generateEtag(responsePayload);
      res.set('ETag', etag);

      if (ifNoneMatch && ifNoneMatch === etag) {
        res.status(304); return null as any;
      }

      return responsePayload;
    } catch (error) {
      this.logger.error(`Failed to fetch products for store "${slug}": ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve products.');
    }
  }

  @Get(':slug/products/:productId')
  @HttpCode(200)
  async getProductById(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Headers('if-none-match') ifNoneMatch: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tenantId = await this.getTenantIdBySlug(slug);

    const sql = `
      SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.slug,
          p.stock_quantity,
          c.id AS category_id,
          c.name AS category_name,
          p.created_at,
          p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = $1 AND p.id = $2 AND p.is_active = TRUE;
    `;
    const params = [tenantId, productId];

    try {
      const result = await (this.db as any).execute(sql, params);

      if ((result as any).rows.length === 0) {
        throw new NotFoundException(`Product with ID "${productId}" not found.`);
      }

      const product = (result as any).rows[0];
      const etag = this.generateEtag(product);
      res.set('ETag', etag);

      if (ifNoneMatch && ifNoneMatch === etag) {
        res.status(304); return null as any;
      }

      return product;
    } catch (error) {
      this.logger.error(
        `Failed to fetch product "${productId}" for store "${slug}": ${error.message}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve product.');
    }
  }

  @Get(':slug/categories')
  @HttpCode(200)
  async getCategories(
    @Param('slug') slug: string,
    @Headers('if-none-match') ifNoneMatch: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tenantId = await this.getTenantIdBySlug(slug);

    const sql = `
      SELECT id, name, slug, created_at, updated_at
      FROM categories
      WHERE tenant_id = $1
      ORDER BY name ASC;
    `;
    const params = [tenantId];

    try {
      const result = await (this.db as any).execute(sql, params);
      const categories = (result as any).rows;

      const etag = this.generateEtag(categories);
      res.set('ETag', etag);

      if (ifNoneMatch && ifNoneMatch === etag) {
        res.status(304); return null as any;
      }

      return categories;
    } catch (error) {
      this.logger.error(`Failed to fetch categories for store "${slug}": ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve categories.');
    }
  }

  @Get(':slug/search')
  @HttpCode(200)
  async searchProducts(
    @Param('slug') slug: string,
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Headers('if-none-match') ifNoneMatch: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!query || query.trim().length < 2) {
      return { data: [], meta: { totalItems: 0, currentPage: 1, itemsPerPage: 0, totalPages: 0 } };
    }

    const tenantId = await this.getTenantIdBySlug(slug);

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Use to_tsvector for full-text search if available, otherwise ILIKE
    // Assuming 'english' config for tsvector on name and description
    const searchQuery = `%${query.toLowerCase()}%`;

    const whereConditions: string[] = [
      `p.tenant_id = $1`,
      `p.is_active = TRUE`,
      `(
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', $2)
        OR LOWER(p.name) LIKE $3
        OR LOWER(COALESCE(p.description, '')) LIKE $3
      )`,
    ];
    const params: any[] = [tenantId, query, searchQuery];
    let paramIndex = 3; // $1, $2, $3 are already used

    const addParam = (value: any) => {
      params.push(value);
      paramIndex++;
      return `$${paramIndex}`;
    };

    const countSql = `
      SELECT COUNT(p.id)
      FROM products p
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''};
    `;

    const productsSql = `
      SELECT
          p.id,
          p.name,
          p.description,
          p.price,
          p.slug,
          p.stock_quantity,
          c.id AS category_id,
          c.name AS category_name,
          p.created_at,
          p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      ORDER BY p.name ASC
      LIMIT ${addParam(limitNum)} OFFSET ${addParam(offset)};
    `;

    try {
      const [countResult, productsResult] = await Promise.all([
        (this.db as any).execute(countSql, params),
        (this.db as any).execute(productsSql, params),
      ]);

      const totalItems = parseInt((countResult as any).rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limitNum);

      const responsePayload = {
        data: (productsResult as any).rows,
        meta: {
          totalItems,
          currentPage: pageNum,
          itemsPerPage: limitNum,
          totalPages,
        },
      };

      const etag = this.generateEtag(responsePayload);
      res.set('ETag', etag);

      if (ifNoneMatch && ifNoneMatch === etag) {
        res.status(304); return null as any;
      }

      return responsePayload;
    } catch (error) {
      this.logger.error(`Failed to search products for store "${slug}" with query "${query}": ${error.message}`);
      throw new InternalServerErrorException('Failed to perform product search.');
    }
  }


}



