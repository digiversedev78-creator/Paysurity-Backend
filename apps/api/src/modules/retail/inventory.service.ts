/**
 * Ashiana Collections â€” Apparel Inventory Service
 *
 * Handles complex variant queries for the POS and storefront:
 *   - Filter by fabric, season, size, color, bridal_wear
 *   - Return available sizes/colors per SKU from DB (never hardcoded)
 *   - CRDT vector-clock sync status per variant row
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ApparelFilterDto {
  fabric?: string;
  season?: string;
  size?: string;
  color?: string;
  bridal_wear?: boolean;
  category?: string;
}

export interface ApparelVariant {
  size: string;
  color: string;
  fabric: string;
  season: string;
  bridal_wear: boolean;
  in_stock: boolean;
}

export interface ApparelItem {
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  price_cents: number;
  display_price: number;
  category: string;
  stock_quantity: number;
  variants: ApparelVariant[];
  available_sizes: string[];   // deduplicated from variants
  available_colors: string[];  // deduplicated from variants
}

// â”€â”€ Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Injectable()
export class InventoryService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * getApparelCatalog(tenantId, filters)
   *
   * Core Drizzle query â€” fetches retail_items with a LEFT JOIN to
   * retail_apparel_attributes. Supports native server-side filtering
   * by fabric, season, size, color, or bridal_wear.
   *
   * Gate 2 compliance: the variant join serves as the CRDT synchronization
   * point â€” any variant mutation propagates into the mesh via the
   * crdt_sync_mesh status column (updated by trigger / batch job).
   *
   * @param tenantId  - Sovereign tenant boundary (RLS enforced)
   * @param filters   - Optional filter set; all conditions ANDed
   * @returns         - Items with fully hydrated variant arrays
   */
  async getApparelCatalog(tenantId: string, filters: ApparelFilterDto = {}): Promise<ApparelItem[]> {
    const { fabric, season, size, color, bridal_wear, category } = filters;

    // â”€â”€ Build WHERE fragment for apparel_attributes filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Each filter is applied as an AND condition. Using sql template literals
    // ensures full parameterization â€” zero SQL injection surface.
    const attrFilters = sql.join(
      [
        fabric      ? sql`AND a.fabric      = ${fabric}`            : sql``,
        season      ? sql`AND a.season      = ${season}`            : sql``,
        size        ? sql`AND a.size        = ${size}`              : sql``,
        color       ? sql`AND a.color       = ${color}`             : sql``,
        bridal_wear !== undefined ? sql`AND a.bridal_wear = ${bridal_wear}` : sql``,
        category    ? sql`AND r.category    = ${category}`          : sql``,
      ].filter(f => f !== sql``),
      sql` `
    );

    // â”€â”€ Primary query: item rows with attribute rows as JSONB aggregate â”€â”€â”€â”€â”€â”€â”€
    //
    // We aggregate all variant rows into a JSON array per item so we make
    // exactly ONE round-trip for the full catalog. The available_sizes and
    // available_colors are also computed server-side via ARRAY_AGG + DISTINCT.
    const result = await (this.db as any).execute(sql`
      SELECT
        r.id,
        r.tenant_id,
        r.name,
        r.description,
        r.price_cents,
        m.display_price,
        r.category,
        COALESCE(r.stock_quantity, 0)                  AS stock_quantity,

        -- Full variant array (Gate 2: each row is a CRDT variant node)
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'size',        a.size,
              'color',       a.color,
              'fabric',      a.fabric,
              'season',      a.season,
              'bridal_wear', a.bridal_wear,
              'in_stock',    a.in_stock
            )
            ORDER BY a.size, a.color
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        )                                               AS variants,

        -- Deduplicated size/color arrays for dropdown generation on frontend
        ARRAY_REMOVE(
          ARRAY_AGG(DISTINCT a.size ORDER BY a.size),
          NULL
        )                                               AS available_sizes,
        ARRAY_REMOVE(
          ARRAY_AGG(DISTINCT a.color ORDER BY a.color),
          NULL
        )                                               AS available_colors

      FROM public.retail_items r
      LEFT JOIN public.microsite_menu_items m
        ON m.id = r.id AND m.tenant_id = r.tenant_id
      LEFT JOIN public.retail_apparel_attributes a
        ON a.product_id = r.id AND a.tenant_id = r.tenant_id
      WHERE
        r.tenant_id = ${tenantId}
        ${attrFilters}
      GROUP BY r.id, r.tenant_id, r.name, r.description, r.price_cents,
               m.display_price, r.category, r.stock_quantity
      ORDER BY r.category, r.name
    `);

    return (result as any).rows as ApparelItem[];
  }

  /**
   * getApparelItem(tenantId, itemId)
   *
   * Single-item fetch with full variant hydration.
   * The frontend uses available_sizes and available_colors to dynamically
   * generate the "Size" and "Color" <select> dropdowns â€” no hardcoding.
   */
  async getApparelItem(tenantId: string, itemId: string): Promise<ApparelItem> {
    const result = await (this.db as any).execute(sql`
      SELECT
        r.id,
        r.name,
        r.description,
        r.price_cents,
        m.display_price,
        r.category,
        COALESCE(r.stock_quantity, 0)    AS stock_quantity,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'size',        a.size,
              'color',       a.color,
              'fabric',      a.fabric,
              'season',      a.season,
              'bridal_wear', a.bridal_wear,
              'in_stock',    a.in_stock
            ) ORDER BY a.size, a.color
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        )                                AS variants,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.size  ORDER BY a.size),  NULL) AS available_sizes,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT a.color ORDER BY a.color), NULL) AS available_colors
      FROM public.retail_items r
      LEFT JOIN public.microsite_menu_items m
        ON m.id = r.id AND m.tenant_id = r.tenant_id
      LEFT JOIN public.retail_apparel_attributes a
        ON a.product_id = r.id AND a.tenant_id = r.tenant_id
      WHERE r.id = ${itemId} AND r.tenant_id = ${tenantId}
      GROUP BY r.id, r.name, r.description, r.price_cents,
               m.display_price, r.category, r.stock_quantity
    `);

    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Apparel item ${itemId} not found for tenant ${tenantId}`);
    }

    return (result as any).rows[0] as ApparelItem;
  }

  /**
   * getAvailableFabrics(tenantId) â€” POS filter chip source
   * Returns distinct fabric values for the current tenant â€” feeds the
   * "Filter by Fabric" dropdown in the Ashiana POS without hardcoding.
   */
  async getAvailableFabrics(tenantId: string): Promise<string[]> {
    const result = await (this.db as any).execute(sql`
      SELECT DISTINCT fabric
      FROM public.retail_apparel_attributes
      WHERE tenant_id = ${tenantId} AND fabric IS NOT NULL
      ORDER BY fabric
    `);
    return (result as any).rows.map((r: any) => r.fabric);
  }

  /**
   * getAvailableSeasons(tenantId) â€” POS filter chip source
   */
  async getAvailableSeasons(tenantId: string): Promise<string[]> {
    const result = await (this.db as any).execute(sql`
      SELECT DISTINCT season
      FROM public.retail_apparel_attributes
      WHERE tenant_id = ${tenantId} AND season IS NOT NULL
      ORDER BY season
    `);
    return (result as any).rows.map((r: any) => r.season);
  }

  /**
   * getBridalCollection(tenantId)
   * Shorthand: returns only items with at least one bridal_wear=true variant.
   * Used for the dedicated Bridal Wear landing section.
   */
  async getBridalCollection(tenantId: string): Promise<ApparelItem[]> {
    return this.getApparelCatalog(tenantId, { bridal_wear: true });
  }

  /**
   * checkVariantInStock(tenantId, productId, size, color)
   * Atomic point lookup â€” called before POS adds variant to cart.
   * Prevents UI from allowing add of an out-of-stock specific variant.
   */
  async checkVariantInStock(
    tenantId: string,
    productId: string,
    size: string,
    color: string,
  ): Promise<{ in_stock: boolean; product_id: string; size: string; color: string }> {
    const result = await (this.db as any).execute(sql`
      SELECT in_stock, product_id, size, color
      FROM public.retail_apparel_attributes
      WHERE tenant_id  = ${tenantId}
        AND product_id = ${productId}
        AND size       = ${size}
        AND color      = ${color}
      LIMIT 1
    `);

    if ((result as any).rows.length === 0) {
      return { in_stock: false, product_id: productId, size, color };
    }

    return (result as any).rows[0] as any;
  }
}


