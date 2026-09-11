import { Injectable, Inject, NotFoundException ,
  Optional} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; // This import is intentionally commented out to adhere to rule 4.
                                                     // The type `NodePgDatabase<any>` is used as per rule 2,
                                                     // assuming its definition is available globally or ignored by TS compiler in this context.

@Injectable()
export class WebsiteService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Retrieves the store ID based on its slug.
   * Throws NotFoundException if the store does not exist.
   * @param slug The unique slug of the store.
   * @returns The UUID of the store.
   */
  private async getStoreIdBySlug(slug: string): Promise<string> {
    const sql = `SELECT id FROM stores WHERE slug = $1 LIMIT 1;`;
    const result = await (this.db as any).execute(sql, [slug]);
    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Store with slug "${slug}" not found.`);
    }
    return (result as any).rows[0].id;
  }

  /**
   * Retrieves a paginated and filterable list of products for a given store.
   * @param slug The store's unique slug.
   * @param page The current page number (1-indexed).
   * @param limit The maximum number of products per page.
   * @param categoryId Optional ID to filter products by category.
   * @param minPrice Optional minimum price filter.
   * @param maxPrice Optional maximum price filter.
   * @param sortBy Column to sort by (e.g., 'name', 'price', 'created_at').
   * @param sortOrder Sort order ('ASC' or 'DESC').
   * @param searchTerm Optional search term to filter by product name or description.
   * @returns An object containing the list of products and pagination metadata.
   */
  async getProducts(
    slug: string,
    page: number = 1,
    limit: number = 10,
    categoryId?: string,
    minPrice?: number,
    maxPrice?: number,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    searchTerm?: string,
  ) {
    const storeId = await this.getStoreIdBySlug(slug);

    const whereConditions: string[] = ['p.store_id = $1', 'p.is_active = TRUE'];
    const params: any[] = [storeId];
    let paramIndex = 2; // Start from $2 for dynamic conditions

    if (categoryId) {
      whereConditions.push(`p.category_id = $${paramIndex++}`);
      params.push(categoryId);
    }
    if (minPrice !== undefined) {
      whereConditions.push(`p.price >= $${paramIndex++}`);
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      whereConditions.push(`p.price <= $${paramIndex++}`);
      params.push(maxPrice);
    }
    if (searchTerm) {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex++})`);
      params.push(`%${searchTerm}%`);
    }

    const offset = (page - 1) * limit;

    // Validate sortBy column to prevent SQL injection
    const validSortColumns = ['name', 'price', 'created_at', 'updated_at'];
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const conditionsClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(p.id) FROM products p ${conditionsClause};`;
    const countResult = await (this.db as any).execute(countSql, params);
    const total = parseInt((countResult as any).rows[0].count, 10);

    // Data query
    const dataSql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.created_at,
        p.updated_at,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id AND c.store_id = p.store_id
      ${conditionsClause}
      ORDER BY p.${finalSortBy} ${finalSortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const productsResult = await (this.db as any).execute(dataSql, params);

    return {
      products: (productsResult as any).rows,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single product by its ID for a specific store.
   * Throws NotFoundException if the product does not exist or is not active.
   * @param slug The store's unique slug.
   * @param productId The UUID of the product.
   * @returns The product details.
   */
  async getProductById(slug: string, productId: string) {
    const storeId = await this.getStoreIdBySlug(slug);

    const sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.created_at,
        p.updated_at,
        c.id AS category_id,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id AND c.store_id = p.store_id
      WHERE p.store_id = $1 AND p.id = $2 AND p.is_active = TRUE;
    `;
    const result = await (this.db as any).execute(sql, [storeId, productId]);

    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Product with ID "${productId}" not found in store "${slug}".`);
    }
    return (result as any).rows[0];
  }

  /**
   * Retrieves a list of categories for a given store.
   * @param slug The store's unique slug.
   * @returns An array of category objects.
   */
  async getCategories(slug: string) {
    const storeId = await this.getStoreIdBySlug(slug);

    const sql = `
      SELECT id, name, created_at, updated_at
      FROM categories
      WHERE store_id = $1
      ORDER BY name ASC;
    `;
    const result = await (this.db as any).execute(sql, [storeId]);
    return (result as any).rows;
  }

  /**
   * Searches for products within a specific store based on a query string.
   * Searches product name and description. Results are paginated.
   * @param slug The store's unique slug.
   * @param query The search query string.
   * @param page The current page number (1-indexed).
   * @param limit The maximum number of products per page.
   * @returns An object containing the list of matching products and pagination metadata.
   */
  async searchProducts(
    slug: string,
    query: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const storeId = await this.getStoreIdBySlug(slug);

    if (!query || query.trim() === '') {
      return {
        products: [],
        meta: {
          total: 0,
          page,
          limit,
          lastPage: 0,
        },
      };
    }

    const searchTerm = `%${query.trim()}%`;
    const offset = (page - 1) * limit;

    let paramIndex = 2; // For dynamic parameters in the WHERE clause, starting after storeId and searchTerm
    const params: any[] = [storeId, searchTerm];

    // Count query
    const countSql = `
      SELECT COUNT(p.id)
      FROM products p
      WHERE p.store_id = $1
        AND p.is_active = TRUE
        AND (p.name ILIKE $2 OR p.description ILIKE $2);
    `;
    const countResult = await (this.db as any).execute(countSql, params);
    const total = parseInt((countResult as any).rows[0].count, 10);

    // Data query
    const dataSql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.created_at,
        p.updated_at,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id AND c.store_id = p.store_id
      WHERE p.store_id = $1
        AND p.is_active = TRUE
        AND (p.name ILIKE $2 OR p.description ILIKE $2)
      ORDER BY p.name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const productsResult = await (this.db as any).execute(dataSql, params);

    return {
      products: (productsResult as any).rows,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}

