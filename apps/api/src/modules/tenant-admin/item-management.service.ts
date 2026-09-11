/**
 * Sovereign Item Management Service
 *
 * TWO access modes:
 *
 * 1. TENANT-ADMIN PATH  â€” called with (tenantId from JWT, null actingAdminId)
 *    - All queries hard-enforce `tenant_id = :tenantId` (RLS equivalent)
 *    - Cannot cross tenant boundaries under any circumstances
 *    - Audit trail: action=TENANT_ADMIN_PRICE_UPDATE | actor=req.user.id
 *
 * 2. SUPER-ADMIN BYPASS PATH â€” called with (targetTenantId from body, req.user.id)
 *    - tenantId is the TARGET MERCHANT, supplied explicitly by admin
 *    - Admin's own identity is stored separately as `acting_admin_id`
 *    - Audit trail: action=SUPER_ADMIN_PRICE_OVERRIDE | actor=adminId â†’ targetTenant
 *    - The WHERE clause still uses the target tenantId â€” preventing accidental spray
 */
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface UpdateItemPriceDto {
  /** New price in cents â€” prevents floating-point mutation errors */
  price_cents: number;
  /** Optional: update display name */
  name?: string;
  /** Optional: update description */
  description?: string;
  /** Optional: update stock_quantity */
  stock_quantity?: number;
  /** Optional: update category */
  category?: string;
}

export interface UpdateApparelAttributeDto {
  /** Target specific variant row by size+color key */
  size: string;
  color: string;
  /** Fields to update on the variant */
  fabric?: string;
  season?: string;
  in_stock?: boolean;
}

export interface BulkPriceAdjustmentDto {
  /** Adjust all items in a category by a percentage (-100 to +100) */
  category: string;
  adjustment_pct: number; // e.g. 10 = +10%, -5 = -5%
}

// â”€â”€ Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Injectable()
export class ItemManagementService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLog: AuditLogService,
  ) {}

  // â”€â”€ 1. TENANT-ADMIN: Read catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * getTenantCatalog(tenantId)
   *
   * Safe read-only catalog fetch for Tenant-Admins.
   * RLS enforced: tenant_id = tenantId is always in WHERE.
   */
  async getTenantCatalog(tenantId: string) {
    this.assertTenantId(tenantId);

    const result = await (this.db as any).execute(sql`
      SELECT
        r.id,
        r.name,
        r.description,
        r.price_cents,
        r.category,
        r.stock_quantity,
        r.age_restricted,
        r.updated_at,
        -- Apparel attributes (NULL for non-apparel items)
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'size',       a.size,
              'color',      a.color,
              'fabric',     a.fabric,
              'season',     a.season,
              'in_stock',   a.in_stock,
              'bridal_wear', a.bridal_wear
            ) ORDER BY a.size, a.color
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) AS apparel_variants
      FROM public.retail_items r
      LEFT JOIN public.retail_apparel_attributes a
        ON a.product_id = r.id AND a.tenant_id = r.tenant_id
      WHERE r.tenant_id = ${tenantId}
      GROUP BY r.id
      ORDER BY r.category, r.name
    `);

    return (result as any).rows;
  }

  // â”€â”€ 2. TENANT-ADMIN: Update single item price / metadata â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * updateItemPrice(tenantId, itemId, dto, actorUserId)
   *
   * TENANT-ADMIN: Update price, name, description, category, or stock
   * for a single item belonging to THIS tenant ONLY.
   *
   * RLS contract: WHERE id = :itemId AND tenant_id = :tenantId
   * If the item belongs to a different tenant, rowCount = 0 â†’ 404.
   * This is the physical cross-tenant prevention gate â€” no middleware needed.
   */
  async updateItemPrice(
    tenantId: string,
    itemId: string,
    dto: UpdateItemPriceDto,
    actorUserId: string,
  ) {
    this.assertTenantId(tenantId);
    this.assertItemId(itemId);

    if (dto.price_cents !== undefined && dto.price_cents < 0) {
      throw new BadRequestException('price_cents cannot be negative.');
    }

    // Snapshot for audit diff
    const before = await (this.db as any).execute(sql`
      SELECT id, name, price_cents, stock_quantity, category, updated_at
      FROM public.retail_items
      WHERE id = ${itemId} AND tenant_id = ${tenantId}
      LIMIT 1
    `);

    if ((before as any).rows.length === 0) {
      throw new NotFoundException(`Item ${itemId} not found for tenant ${tenantId}.`);
    }

    const snapshot = (before as any).rows[0];

    // Build partial update â€” only provided fields touch the DB
    const after = await (this.db as any).execute(sql`
      UPDATE public.retail_items
      SET
        price_cents    = CASE WHEN ${dto.price_cents !== undefined} THEN ${dto.price_cents ?? null} ELSE price_cents END,
        name           = CASE WHEN ${!!dto.name}         THEN ${dto.name ?? null}          ELSE name           END,
        description    = CASE WHEN ${!!dto.description}  THEN ${dto.description ?? null}   ELSE description    END,
        stock_quantity = CASE WHEN ${dto.stock_quantity !== undefined} THEN ${dto.stock_quantity ?? null} ELSE stock_quantity END,
        category       = CASE WHEN ${!!dto.category}     THEN ${dto.category ?? null}      ELSE category       END,
        updated_at     = NOW()
      WHERE id = ${itemId} AND tenant_id = ${tenantId}
      RETURNING id, name, price_cents, stock_quantity, category, updated_at
    `);

    if ((after as any).rows.length === 0) {
      throw new NotFoundException(`Item ${itemId} not found or update blocked by tenant isolation.`);
    }

    // Sovereign Audit Trail
    await this.auditLog.record(tenantId, {
      userId: actorUserId,
      action: 'TENANT_ADMIN_PRICE_UPDATE',
      traceId: itemId,
      details: {
        item_id:       itemId,
        before:        snapshot,
        after:         (after as any).rows[0],
        changed_by:    actorUserId,
        tenant_scoped: true,
      },
    });

    return { success: true, data: (after as any).rows[0] };
  }

  // â”€â”€ 3. SUPER-ADMIN BYPASS: Update any tenant's item price â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * superAdminUpdateItemPrice(targetTenantId, itemId, dto, adminUserId)
   *
   * SUPER-ADMIN OVERRIDE: The admin explicitly specifies the TARGET tenant.
   * This is the only function that allows cross-tenant mutation.
   *
   * Security controls:
   *   1. The calling controller MUST verify adminUserId has SUPER_ADMIN / SUB_SUPER_ADMIN role
   *      (enforced at controller level via AdminRoleGuard).
   *   2. WHERE clause still includes targetTenantId â€” prevents spray to
   *      unintended tenants even with a malformed request.
   *   3. Audit trail records BOTH adminUserId (actor) AND targetTenantId (victim)
   *      plus the before/after snapshot â€” fully immutable.
   */
  async superAdminUpdateItemPrice(
    targetTenantId: string,
    itemId: string,
    dto: UpdateItemPriceDto,
    adminUserId: string,
  ) {
    this.assertTenantId(targetTenantId);
    this.assertItemId(itemId);

    if (!adminUserId) throw new ForbiddenException('Admin identity required for price override.');
    if (dto.price_cents !== undefined && dto.price_cents < 0) {
      throw new BadRequestException('price_cents cannot be negative.');
    }

    const before = await (this.db as any).execute(sql`
      SELECT id, name, price_cents, stock_quantity, category, tenant_id, updated_at
      FROM public.retail_items
      WHERE id = ${itemId} AND tenant_id = ${targetTenantId}
      LIMIT 1
    `);

    if ((before as any).rows.length === 0) {
      throw new NotFoundException(
        `Item ${itemId} not found for tenant ${targetTenantId}. ` +
        `Cross-tenant write was correctly prevented.`,
      );
    }

    const snapshot = (before as any).rows[0];

    const after = await (this.db as any).execute(sql`
      UPDATE public.retail_items
      SET
        price_cents    = CASE WHEN ${dto.price_cents !== undefined}     THEN ${dto.price_cents ?? null}     ELSE price_cents    END,
        name           = CASE WHEN ${!!dto.name}                        THEN ${dto.name ?? null}            ELSE name           END,
        description    = CASE WHEN ${!!dto.description}                 THEN ${dto.description ?? null}     ELSE description    END,
        stock_quantity = CASE WHEN ${dto.stock_quantity !== undefined}  THEN ${dto.stock_quantity ?? null}  ELSE stock_quantity END,
        category       = CASE WHEN ${!!dto.category}                    THEN ${dto.category ?? null}        ELSE category       END,
        updated_at     = NOW()
      WHERE id = ${itemId} AND tenant_id = ${targetTenantId}
      RETURNING id, name, price_cents, stock_quantity, category, tenant_id, updated_at
    `);

    if ((after as any).rows.length === 0) {
      throw new NotFoundException('Update failed â€” item not found after snapshot (race condition).');
    }

    // Sovereign Audit Trail â€” written against the ADMIN's own tenant context (system-level)
    // AND cross-referenced to targetTenantId in details
    await this.auditLog.record('system', {
      userId: adminUserId,
      action: 'SUPER_ADMIN_PRICE_OVERRIDE',
      traceId: itemId,
      details: {
        admin_id:          adminUserId,
        target_tenant_id:  targetTenantId,
        item_id:           itemId,
        before:            snapshot,
        after:             (after as any).rows[0],
        override_type:     'CROSS_TENANT_PRICE_MUTATION',
        legal_basis:       'Super-Admin maintenance access, logged for compliance',
      },
    });

    return { success: true, data: (after as any).rows[0], auditedBy: adminUserId };
  }

  // â”€â”€ 4. TENANT-ADMIN: Update apparel variant attributes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * updateApparelVariant(tenantId, productId, dto, actorUserId)
   *
   * Updates a single sizeÃ—color variant row in retail_apparel_attributes.
   * The (product_id, size, color) triplet is the composite key.
   * Tenant boundary: product_id must belong to tenantId.
   */
  async updateApparelVariant(
    tenantId: string,
    productId: string,
    dto: UpdateApparelAttributeDto,
    actorUserId: string,
  ) {
    this.assertTenantId(tenantId);

    // Verify product belongs to tenant â€” cross-RLS guard
    const ownerCheck = await (this.db as any).execute(sql`
      SELECT id FROM public.retail_items
      WHERE id = ${productId} AND tenant_id = ${tenantId}
      LIMIT 1
    `);

    if ((ownerCheck as any).rows.length === 0) {
      throw new NotFoundException(
        `Product ${productId} not found for tenant ${tenantId}. ` +
        `Cross-tenant variant update was blocked.`,
      );
    }

    const before = await (this.db as any).execute(sql`
      SELECT * FROM public.retail_apparel_attributes
      WHERE product_id = ${productId} AND tenant_id = ${tenantId}
        AND size = ${dto.size} AND color = ${dto.color}
      LIMIT 1
    `);

    if ((before as any).rows.length === 0) {
      throw new NotFoundException(
        `Variant (size=${dto.size}, color=${dto.color}) not found for product ${productId}.`,
      );
    }

    const result = await (this.db as any).execute(sql`
      UPDATE public.retail_apparel_attributes
      SET
        fabric     = CASE WHEN ${!!dto.fabric}              THEN ${dto.fabric ?? null}    ELSE fabric     END,
        season     = CASE WHEN ${!!dto.season}              THEN ${dto.season ?? null}    ELSE season     END,
        in_stock   = CASE WHEN ${dto.in_stock !== undefined} THEN ${dto.in_stock ?? null} ELSE in_stock   END,
        updated_at = NOW()
      WHERE product_id = ${productId}
        AND tenant_id  = ${tenantId}
        AND size       = ${dto.size}
        AND color      = ${dto.color}
      RETURNING *
    `);

    await this.auditLog.record(tenantId, {
      userId: actorUserId,
      action: 'TENANT_ADMIN_VARIANT_UPDATE',
      traceId: productId,
      details: {
        product_id: productId,
        variant: `${dto.size}/${dto.color}`,
        before: (before as any).rows[0],
        after: (result as any).rows[0],
      },
    });

    return { success: true, data: (result as any).rows[0] };
  }

  // â”€â”€ 5. TENANT-ADMIN: Bulk category price adjustment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * bulkAdjustCategoryPrices(tenantId, dto, actorUserId)
   *
   * Applies a percentage adjustment to all items in a given category.
   * Uses GREATEST(price_cents + %, 0) to prevent negatives.
   * Returns a count of affected rows.
   * Full audit trail per-item snapshot is cost-prohibitive; records category-level audit.
   */
  async bulkAdjustCategoryPrices(
    tenantId: string,
    dto: BulkPriceAdjustmentDto,
    actorUserId: string,
  ) {
    this.assertTenantId(tenantId);

    if (!dto.category) throw new BadRequestException('category is required.');
    if (dto.adjustment_pct < -100 || dto.adjustment_pct > 100) {
      throw new BadRequestException('adjustment_pct must be between -100 and 100.');
    }

    const multiplier = 1 + dto.adjustment_pct / 100;

    const result = await (this.db as any).execute(sql`
      UPDATE public.retail_items
      SET
        price_cents = GREATEST(ROUND(price_cents * ${multiplier}), 0),
        updated_at  = NOW()
      WHERE tenant_id = ${tenantId} AND category = ${dto.category}
      RETURNING id, name, price_cents
    `);

    await this.auditLog.record(tenantId, {
      userId: actorUserId,
      action: 'TENANT_ADMIN_BULK_PRICE_ADJUSTMENT',
      details: {
        category:       dto.category,
        adjustment_pct: dto.adjustment_pct,
        multiplier,
        items_affected: (result as any).rows.length,
        sample:         (result as any).rows.slice(0, 3),
      },
    });

    return {
      success: true,
      items_updated: (result as any).rows.length,
      category: dto.category,
      adjustment_pct: dto.adjustment_pct,
    };
  }

  // â”€â”€ Private Guards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private assertTenantId(tenantId: string) {
    if (!tenantId || tenantId.trim() === '') {
      throw new ForbiddenException('SOVEREIGN_RLS_VIOLATION: tenant_id is required and cannot be empty.');
    }
  }

  private assertItemId(itemId: string) {
    if (!itemId || itemId.trim() === '') {
      throw new BadRequestException('item_id is required.');
    }
  }
}


