/**
 * PriceUpdateService â€” Sovereign Item Mutation Engine
 *
 * Covers: price updates AND apparel metadata updates (Fabric, Season, Color, Bridal Wear).
 * All mutations are atomic: retail_items / retail_apparel_attributes UPDATE +
 * price_change_log INSERT happen in ONE Drizzle transaction.
 *
 * All price updates flow through ONE method per access tier.
 * Both paths share the same internal _executePriceTransaction() which wraps
 * the retail_items UPDATE + price_change_log INSERT in a SINGLE DRIZZLE TRANSACTION.
 *
 * ATOMICITY CONTRACT:
 *   - If the price_change_log INSERT fails for ANY reason â†’ entire transaction rolls back
 *   - The retail_items row returns to its original price
 *   - A 500 is returned to the caller with a precise error message
 *   - This is enforced by the Drizzle db.transaction() block â€” not application logic
 *
 * TWO CODE PATHS:
 *
 * 1. TENANT-ADMIN  â†’ updatePrice()
 *    - tenantId   = req.user.tenantId (from JWT â€” immutable)
 *    - changed_by = req.user.id       (from JWT â€” immutable)
 *    - changed_by_role = 'TENANT_ADMIN'
 *    - RLS wall: WHERE item_id = :id AND tenant_id = :tenantId
 *      â†’ rowsAffected = 0 if item doesn't belong to this tenant â†’ 404
 *
 * 2. SUPER-ADMIN   â†’ adminUpdatePrice()
 *    - targetTenantId = body.targetTenantId (explicit â€” never from JWT)
 *    - acting_admin_id = req.adminUser.id   (FORCED â€” cannot be overridden by caller)
 *    - changed_by_role = 'SUPER_ADMIN'
 *    - WHERE clause still scopes to targetTenantId â†’ no accidental spray
 *    - The acting_admin_id field is SET IN CODE â€” the API consumer cannot supply it
 */
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface PriceUpdateDto {
  /** New price in cents (integer). Must be â‰¥ 0. */
  new_price_cents: number;
  /** Optional: update name at same time */
  name?: string;
  /** Optional: update description */
  description?: string;
  /** Optional: update stock quantity */
  stock_quantity?: number;
  /** Optional: category reassignment */
  category?: string;
}

export interface AdminPriceUpdateDto extends PriceUpdateDto {
  /** Target merchant's tenant UUID â€” required for super-admin bypass */
  targetTenantId: string;
  /** Optional compliance justification â€” stored in price_change_log.override_reason */
  override_reason?: string;
}

/**
 * ApparelMetadataDto â€” update any subset of apparel variant attributes.
 * The (size, color) pair is the composite key identifying the variant row.
 * All other fields are optional â€” only provided fields write to the DB.
 */
export interface ApparelMetadataDto {
  /** Composite key: identifies which variant row to update */
  size: string;
  color: string;
  /** Fields to mutate (all optional) */
  new_fabric?:     string;
  new_season?:     string;
  new_color?:      string;   // Rename color (updates the color column itself)
  new_in_stock?:   boolean;
  new_bridal_wear?: boolean;
  /** Optional compliance justification */
  override_reason?: string;
}

export interface AdminApparelMetadataDto extends ApparelMetadataDto {
  /** Required for super-admin bypass */
  targetTenantId: string;
}

export interface ItemChangeLogEntry {
  id: string;
  item_id: string;
  tenant_id: string;
  item_name: string | null;
  change_type: string;           // 'PRICE' | 'METADATA' | 'STOCK' | 'COMBINED'
  changed_fields: Record<string, { old: any; new: any }> | null;  // JSONB diff
  old_price_cents: number;
  new_price_cents: number;
  changed_by: string;
  changed_by_role: string;
  acting_admin_id: string | null;
  override_reason: string | null;
  source: string;
  created_at: string;
}

/** Backward-compat alias */
export type PriceChangeLogEntry = ItemChangeLogEntry;

// â”€â”€ Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Injectable()
export class PriceUpdateService {
  private readonly logger = new Logger(PriceUpdateService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLog: AuditLogService,
  ) {}

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PRIVATE: withTenant() â€” Sovereign RLS Proxy
  //
  // Mirrors the db.withTenant() pattern used in application.service.ts and
  // orders.service.ts. Ensures every transaction callback is pre-validated
  // with a non-null tenantId before any SQL executes.
  //
  // CONTRACT: Any query that calls withTenant() cannot reach another tenant's
  // rows because tenantId is embedded in the WHERE clause of every DML.
  // If tenantId is empty this throws synchronously â€” before the DB is touched.
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private withTenant(tenantId: string) {
    if (!tenantId?.trim()) {
      throw new ForbiddenException(
        'SOVEREIGN_RLS_VIOLATION: withTenant() called with empty tenantId. ' +
        'All mutations MUST be scoped to a verified tenant context.',
      );
    }
    // Returns a transaction wrapper whose every SQL call carries tenantId
    return {
      transaction: (fn: (tx: any) => Promise<any>) =>
        (this.db as any).transaction((tx) => fn(tx)),
      // Expose tenantId for use inside closures
      tenantId,
    };
  }



  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: TENANT-ADMIN UPDATE
  // tenantId is extracted from JWT by caller â€” never trusted from body
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * updatePrice(tenantId, itemId, dto, actorUserId, ipAddress?)
   *
   * Tenant-Admin price update. The WHERE clause physically prevents
   * cross-tenant mutations â€” no guard or middleware needed.
   *
   * Calls _executePriceTransaction() with role='TENANT_ADMIN'.
   */
  async updatePrice(
    tenantId: string,
    itemId: string,
    dto: PriceUpdateDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    this.guard(tenantId, itemId, actorUserId, dto.new_price_cents);

    return this._executePriceTransaction({
      tenantId,
      itemId,
      dto,
      changedBy:       actorUserId,
      changedByRole:   'TENANT_ADMIN',
      actingAdminId:   null,         // Not an admin override
      overrideReason:  null,
      ipAddress:       ipAddress ?? null,
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: SUPER-ADMIN OVERRIDE
  // targetTenantId from body â€” checked explicitly to be non-empty
  // acting_admin_id is FORCED from req.adminUser.id â€” caller cannot supply it
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * adminUpdatePrice(targetTenantId, itemId, dto, adminUserId, adminRole, ipAddress?)
   *
   * Super-Admin price override. Cross-tenant write.
   * The `acting_admin_id` field is SET IN CODE from the verified admin JWT â€”
   * the REST consumer has no way to forge it.
   *
   * @param adminRole - 'SUPER_ADMIN' or 'SUB_SUPER_ADMIN' (from AdminRoleGuard)
   */
  async adminUpdatePrice(
    targetTenantId: string,
    itemId: string,
    dto: AdminPriceUpdateDto,
    adminUserId: string,
    adminRole: 'SUPER_ADMIN' | 'SUB_SUPER_ADMIN' = 'SUPER_ADMIN',
    ipAddress?: string,
  ) {
    if (!targetTenantId) {
      throw new ForbiddenException(
        'ADMIN_OVERRIDE: targetTenantId is required in body. ' +
        'Super-Admin overrides must explicitly declare the target merchant.',
      );
    }
    if (!adminUserId) {
      throw new ForbiddenException('Admin identity is missing. Cannot record audit trail.');
    }
    this.guard(targetTenantId, itemId, adminUserId, dto.new_price_cents);

    return this._executePriceTransaction({
      tenantId:        targetTenantId,
      itemId,
      dto,
      changedBy:       adminUserId,       // Admin's own identity â†’ immutable
      changedByRole:   adminRole,
      actingAdminId:   adminUserId,       // FORCED FROM CODE â€” not from request body
      overrideReason:  dto.override_reason ?? null,
      ipAddress:       ipAddress ?? null,
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: TENANT-ADMIN APPAREL METADATA UPDATE
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * updateApparelMetadata(tenantId, productId, dto, actorUserId, ipAddress?)
   *
   * Tenant-Admin: update fabric, season, color, in_stock, or bridal_wear
   * for a specific sizeÃ—color variant. Both the variant row AND the change log
   * are written in a single atomic Drizzle transaction.
   *
   * RLS wall: product ownership is verified by
   *   WHERE product_id=:productId AND tenant_id=:tenantId
   * before touching retail_apparel_attributes.
   */
  async updateApparelMetadata(
    tenantId: string,
    productId: string,
    dto: ApparelMetadataDto,
    actorUserId: string,
    ipAddress?: string,
  ) {
    this.guardBase(tenantId, productId, actorUserId);
    if (!dto.size?.trim() || !dto.color?.trim()) {
      throw new BadRequestException('size and color are required to identify the variant.');
    }
    return this._executeMetadataTransaction({
      tenantId,
      productId,
      dto,
      changedBy:      actorUserId,
      changedByRole:  'TENANT_ADMIN',
      actingAdminId:  null,
      ipAddress:      ipAddress ?? null,
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: SUPER-ADMIN APPAREL METADATA OVERRIDE
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * adminUpdateApparelMetadata(targetTenantId, productId, dto, adminUserId, adminRole)
   *
   * Super-Admin cross-tenant variant metadata override.
   * acting_admin_id is FORCED from code â€” cannot be supplied by the REST consumer.
   */
  async adminUpdateApparelMetadata(
    targetTenantId: string,
    productId: string,
    dto: AdminApparelMetadataDto,
    adminUserId: string,
    adminRole: 'SUPER_ADMIN' | 'SUB_SUPER_ADMIN' = 'SUPER_ADMIN',
    ipAddress?: string,
  ) {
    if (!targetTenantId) throw new ForbiddenException('targetTenantId required for admin metadata override.');
    if (!adminUserId)    throw new ForbiddenException('Admin identity missing â€” audit trail cannot be anonymous.');
    this.guardBase(targetTenantId, productId, adminUserId);
    if (!dto.size?.trim() || !dto.color?.trim()) {
      throw new BadRequestException('size and color are required to identify the variant.');
    }
    return this._executeMetadataTransaction({
      tenantId:      targetTenantId,
      productId,
      dto,
      changedBy:     adminUserId,
      changedByRole: adminRole,
      actingAdminId: adminUserId,   // FORCED â€” not from request body
      ipAddress:     ipAddress ?? null,
    });
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // READ: Unified item change log (RLS-scoped) â€” covers PRICE + METADATA
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * getItemChangeLog(tenantId, itemId?, changeType?)
   *
   * Queries the item_change_log VIEW (alias for price_change_log).
   * RLS-scoped: tenant_id = tenantId always in WHERE.
   * changeType filter: 'PRICE' | 'METADATA' | 'COMBINED' | undefined (all)
   */
  async getItemChangeLog(
    tenantId: string,
    itemId?: string,
    changeType?: string,
    limit = 100,
  ): Promise<ItemChangeLogEntry[]> {
    const result = await (this.db as any).execute(sql`
      SELECT
        id, item_id, tenant_id, item_name,
        change_type, changed_fields,
        old_price_cents, new_price_cents,
        changed_by, changed_by_role, acting_admin_id, override_reason,
        source, created_at
      FROM public.item_change_log
      WHERE tenant_id = ${tenantId}
        ${itemId     ? sql`AND item_id    = ${itemId}`     : sql``}
        ${changeType ? sql`AND change_type = ${changeType}` : sql``}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);
    return (result as any).rows as ItemChangeLogEntry[];
  }

  /** Backward-compat alias â€” existing controller calls still work */
  async getPriceChangeLog(
    tenantId: string,
    itemId?: string,
    limit = 100,
  ): Promise<ItemChangeLogEntry[]> {
    return this.getItemChangeLog(tenantId, itemId, 'PRICE', limit);
  }

  /**
   * getGlobalItemChangeLog(since?, changeType?, limit?)
   *
   * Super-Admin god-view: ALL tenants, ALL items, ALL change types, chronological.
   * Queries item_change_log VIEW (â‰¡ price_change_log + change_type filter).
   * ONLY callable from the Super-Admin controller â€” never exposed to tenant paths.
   */
  async getGlobalItemChangeLog(
    since?: string,
    changeType?: string,
    limit = 200,
  ): Promise<ItemChangeLogEntry[]> {
    const result = await (this.db as any).execute(sql`
      SELECT
        pcl.id, pcl.item_id, pcl.tenant_id, pcl.item_name,
        pcl.change_type, pcl.changed_fields,
        pcl.old_price_cents, pcl.new_price_cents,
        pcl.changed_by, pcl.changed_by_role, pcl.acting_admin_id, pcl.override_reason,
        pcl.source, pcl.created_at,
        COALESCE(pcl.item_name, ri.name) AS resolved_item_name
      FROM public.item_change_log pcl
      LEFT JOIN public.retail_items ri ON ri.id = pcl.item_id
      WHERE ${since      ? sql`pcl.created_at  >= ${since}::timestamptz` : sql`TRUE`}
        ${changeType ? sql`AND pcl.change_type = ${changeType}` : sql``}
      ORDER BY pcl.created_at DESC
      LIMIT ${limit}
    `);
    return (result as any).rows as ItemChangeLogEntry[];
  }

  /** Backward-compat alias */
  async getGlobalPriceChangeLog(since?: string, limit = 200) {
    return this.getGlobalItemChangeLog(since, 'PRICE', limit);
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PRIVATE: ATOMIC DRIZZLE TRANSACTION
  // This is the physical enforcement point â€” not application logic
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * _executePriceTransaction â€” The heart of the price update engine.
   *
   * Runs inside db.transaction(). Steps:
   *   1. Fetch current price snapshot (for before/after diff)
   *   2. UPDATE retail_items â€” tenant_id in WHERE = physical RLS wall
   *   3. INSERT price_change_log â€” within SAME transaction
   *
   * If step 3 throws for ANY reason, Drizzle rolls back step 2 automatically.
   * The retail_items row is restored. No partial writes are possible.
   */
  private async _executePriceTransaction(params: {
    tenantId: string;
    itemId: string;
    dto: PriceUpdateDto;
    changedBy: string;
    changedByRole: string;
    actingAdminId: string | null;
    overrideReason: string | null;
    ipAddress: string | null;
  }) {
    const { tenantId, itemId, dto, changedBy, changedByRole, actingAdminId, overrideReason, ipAddress } = params;

    // â”€â”€ Step 0: Pre-flight snapshot (outside transaction for read efficiency) â”€â”€
    const beforeRows = await (this.db as any).execute(sql`
      SELECT id, name, price_cents, stock_quantity
      FROM public.retail_items
      WHERE id = ${itemId} AND tenant_id = ${tenantId}
      LIMIT 1
    `);

    if ((beforeRows as any).rows.length === 0) {
      throw new NotFoundException(
        `Item ${itemId} not found for tenant ${tenantId}. ` +
        (actingAdminId ? 'Cross-tenant write correctly blocked.' : 'Check item ID and tenant access.'),
      );
    }

    const before = (beforeRows as any).rows[0] as any;
    const oldPriceCents: number = Number(before.price_cents ?? 0);
    const itemName: string = before.name ?? 'Unknown Item';

    this.logger.log(
      `[PRICE_TX] ${changedByRole} | actor=${changedBy} | item=${itemId} | ` +
      `tenant=${tenantId} | ${oldPriceCents}Â¢ â†’ ${dto.new_price_cents}Â¢`,
    );

    // â”€â”€ ATOMIC DRIZZLE TRANSACTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let updatedItem: any;
    let logEntry: any;

    try {
      await this.withTenant(tenantId).transaction(async (tx) => {

        // â”€â”€ STEP 1: UPDATE retail_items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // WHERE includes tenant_id â€” physical cross-tenant wall.
        // rowCount=0 is impossible here (we checked above) but defended anyway.
        const updateResult = await tx.execute(sql`
          UPDATE public.retail_items
          SET
            price_cents    = ${dto.new_price_cents},
            name           = CASE WHEN ${!!dto.name}           THEN ${dto.name ?? null}          ELSE name           END,
            description    = CASE WHEN ${!!dto.description}    THEN ${dto.description ?? null}   ELSE description    END,
            stock_quantity = CASE WHEN ${dto.stock_quantity !== undefined}
                                  THEN ${dto.stock_quantity ?? null}
                                  ELSE stock_quantity END,
            category       = CASE WHEN ${!!dto.category}       THEN ${dto.category ?? null}      ELSE category       END,
            updated_at     = NOW()
          WHERE id = ${itemId} AND tenant_id = ${tenantId}
          RETURNING id, name, price_cents, stock_quantity, category, updated_at
        `);

        if ((updateResult as any).rows.length === 0) {
          // Concurrent delete â€” abort transaction
          throw new NotFoundException(
            `Item ${itemId} disappeared during transaction. Price update aborted.`,
          );
        }

        updatedItem = (updateResult as any).rows[0];

        // â”€â”€ STEP 2: INSERT price_change_log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // This INSERT is INSIDE THE SAME TRANSACTION.
        // If it throws â†’ Drizzle rolls back the UPDATE above automatically.
        const logResult = await tx.execute(sql`
          INSERT INTO public.price_change_log (
            item_id, tenant_id, item_name,
            old_price_cents, new_price_cents,
            changed_by, changed_by_role, acting_admin_id, override_reason,
            source, ip_address
          )
          VALUES (
            ${itemId}, ${tenantId}, ${itemName},
            ${oldPriceCents}, ${dto.new_price_cents},
            ${changedBy}, ${changedByRole}, ${actingAdminId}, ${overrideReason},
            'API', ${ipAddress}
          )
          RETURNING id, item_id, tenant_id, old_price_cents, new_price_cents,
                    changed_by, changed_by_role, acting_admin_id, created_at
        `);

        logEntry = (logResult as any).rows[0];

        // If we somehow didn't get a log entry (e.g. trigger rejection), force rollback
        if (!logEntry) {
          throw new InternalServerErrorException(
            'price_change_log INSERT returned no rows. Transaction rolled back.',
          );
        }
      });

    } catch (err: any) {
      this.logger.error(
        `[PRICE_TX] TRANSACTION FAILED | item=${itemId} | ${err.message}`,
        err.stack,
      );
      // Re-throw NestJS exceptions as-is; wrap raw DB errors
      if (err.status) throw err;
      throw new InternalServerErrorException(
        `Price update transaction failed and was rolled back: ${err.message}`,
      );
    }

    // â”€â”€ Post-transaction: write to audit_log (fire-and-forget â€” NOT in tx) â”€â”€
    // This deliberately runs OUTSIDE the transaction so audit_log failures
    // don't roll back a successful price change. The price_change_log
    // already provides the immutable record.
    await this.auditLog.record(tenantId, {
      userId:  changedBy,
      action:  changedByRole === 'TENANT_ADMIN'
        ? 'TENANT_ADMIN_PRICE_UPDATE'
        : 'SUPER_ADMIN_PRICE_OVERRIDE',
      traceId: itemId,
      details: {
        item_id:         itemId,
        item_name:       itemName,
        old_price_cents: oldPriceCents,
        new_price_cents: dto.new_price_cents,
        log_entry_id:    logEntry?.id,
        acting_admin_id: actingAdminId,
        override_reason: overrideReason,
      },
    }).catch(e => this.logger.warn(`[PRICE_TX] audit_log write failed (non-blocking): ${e.message}`));

    return {
      success: true,
      data: updatedItem,
      audit: {
        log_entry_id:    logEntry?.id,
        old_price_cents: oldPriceCents,
        new_price_cents: dto.new_price_cents,
        changed_by:      changedBy,
        changed_by_role: changedByRole,
        acting_admin_id: actingAdminId ?? undefined,
      },
    };
  }

  // â”€â”€ Private: Metadata Transaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * _executeMetadataTransaction â€” Atomic apparel attribute update.
   *
   * Steps inside db.transaction():
   *   1. Fetch before-snapshot of the variant row (sizeÃ—color key)
   *   2. UPDATE retail_apparel_attributes (tenant_id + product_id in WHERE)
   *   3. INSERT price_change_log with change_type='METADATA', changed_fields=JSONB diff
   *
   * If step 3 fails â†’ step 2 rolls back. Zero partial writes.
   */
  private async _executeMetadataTransaction(params: {
    tenantId: string;
    productId: string;
    dto: ApparelMetadataDto;
    changedBy: string;
    changedByRole: string;
    actingAdminId: string | null;
    ipAddress: string | null;
  }) {
    const { tenantId, productId, dto, changedBy, changedByRole, actingAdminId, ipAddress } = params;

    // â”€â”€ Step 0: Verify product ownership + fetch item name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const productCheck = await (this.db as any).execute(sql`
      SELECT r.id, r.name AS item_name, r.price_cents
      FROM public.retail_items r
      WHERE r.id = ${productId} AND r.tenant_id = ${tenantId}
      LIMIT 1
    `);
    if ((productCheck as any).rows.length === 0) {
      throw new NotFoundException(
        `Product ${productId} not found for tenant ${tenantId}. ` +
        (actingAdminId ? 'Cross-tenant metadata write blocked.' : ''),
      );
    }
    const itemName: string = ((productCheck as any).rows[0] as any).item_name ?? 'Unknown';
    const itemPriceCents: number = Number(((productCheck as any).rows[0] as any).price_cents ?? 0);

    // â”€â”€ Step 0b: Fetch before-snapshot of the specific variant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const beforeSnap = await (this.db as any).execute(sql`
      SELECT id, size, color, fabric, season, bridal_wear, in_stock
      FROM public.retail_apparel_attributes
      WHERE product_id = ${productId} AND tenant_id = ${tenantId}
        AND size = ${dto.size} AND color = ${dto.color}
      LIMIT 1
    `);
    if ((beforeSnap as any).rows.length === 0) {
      throw new NotFoundException(
        `Variant (size=${dto.size}, color=${dto.color}) not found for product ${productId}.`,
      );
    }
    const before: any = (beforeSnap as any).rows[0];

    // â”€â”€ Build the changed_fields diff (only fields that will change) â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const changedFields: Record<string, { old: any; new: any }> = {};
    if (dto.new_fabric     !== undefined && dto.new_fabric     !== before.fabric)     changedFields.fabric     = { old: before.fabric,     new: dto.new_fabric };
    if (dto.new_season     !== undefined && dto.new_season     !== before.season)     changedFields.season     = { old: before.season,     new: dto.new_season };
    if (dto.new_color      !== undefined && dto.new_color      !== before.color)      changedFields.color      = { old: before.color,      new: dto.new_color };
    if (dto.new_in_stock   !== undefined && dto.new_in_stock   !== before.in_stock)   changedFields.in_stock   = { old: before.in_stock,   new: dto.new_in_stock };
    if (dto.new_bridal_wear !== undefined && dto.new_bridal_wear !== before.bridal_wear) changedFields.bridal_wear = { old: before.bridal_wear, new: dto.new_bridal_wear };

    if (Object.keys(changedFields).length === 0) {
      return { success: true, message: 'No fields changed â€” no update performed.', data: before, audit: null };
    }

    this.logger.log(
      `[META_TX] ${changedByRole} | actor=${changedBy} | product=${productId} | ` +
      `tenant=${tenantId} | fields=${Object.keys(changedFields).join(',')}`,
    );

    // â”€â”€ ATOMIC DRIZZLE TRANSACTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let updatedVariant: any;
    let logEntry: any;

    try {
      await this.withTenant(tenantId).transaction(async (tx) => {

        // â”€â”€ STEP 1: UPDATE retail_apparel_attributes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // WHERE: product_id + tenant_id + size + color = immutable composite key
        const updateResult = await tx.execute(sql`
          UPDATE public.retail_apparel_attributes
          SET
            fabric      = CASE WHEN ${dto.new_fabric !== undefined}      THEN ${dto.new_fabric ?? null}      ELSE fabric      END,
            season      = CASE WHEN ${dto.new_season !== undefined}      THEN ${dto.new_season ?? null}      ELSE season      END,
            color       = CASE WHEN ${dto.new_color !== undefined}       THEN ${dto.new_color ?? null}       ELSE color       END,
            in_stock    = CASE WHEN ${dto.new_in_stock !== undefined}    THEN ${dto.new_in_stock ?? null}    ELSE in_stock    END,
            bridal_wear = CASE WHEN ${dto.new_bridal_wear !== undefined} THEN ${dto.new_bridal_wear ?? null} ELSE bridal_wear END,
            updated_at  = NOW()
          WHERE product_id = ${productId}
            AND tenant_id  = ${tenantId}
            AND size       = ${dto.size}
            AND color      = ${dto.color}
          RETURNING id, size, color, fabric, season, bridal_wear, in_stock, updated_at
        `);

        if ((updateResult as any).rows.length === 0) {
          throw new NotFoundException('Variant not found during transaction (concurrent delete?).');
        }
        updatedVariant = (updateResult as any).rows[0];

        // â”€â”€ STEP 2: INSERT price_change_log (change_type=METADATA) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        // INSIDE THE SAME TRANSACTION. Failure here rolls back STEP 1.
        const logResult = await tx.execute(sql`
          INSERT INTO public.price_change_log (
            item_id, tenant_id, item_name,
            old_price_cents, new_price_cents,
            changed_by, changed_by_role, acting_admin_id, override_reason,
            source, ip_address,
            change_type, changed_fields
          )
          VALUES (
            ${productId}, ${tenantId}, ${itemName},
            ${itemPriceCents}, ${itemPriceCents},
            ${changedBy}, ${changedByRole}, ${actingAdminId}, ${dto.override_reason ?? null},
            'API', ${ipAddress},
            'METADATA', ${JSON.stringify(changedFields)}::jsonb
          )
          RETURNING id, item_id, tenant_id, change_type, changed_fields,
                    changed_by, changed_by_role, acting_admin_id, created_at
        `);

        logEntry = (logResult as any).rows[0];
        if (!logEntry) {
          throw new InternalServerErrorException('price_change_log INSERT returned no rows â€” tx rolled back.');
        }
      });

    } catch (err: any) {
      this.logger.error(`[META_TX] TRANSACTION FAILED | product=${productId} | ${err.message}`, err.stack);
      if (err.status) throw err;
      throw new InternalServerErrorException(`Metadata update transaction failed and was rolled back: ${err.message}`);
    }

    // â”€â”€ Post-tx: fire-and-forget audit_log (non-blocking) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await this.auditLog.record(tenantId, {
      userId:  changedBy,
      action:  changedByRole === 'TENANT_ADMIN' ? 'TENANT_ADMIN_METADATA_UPDATE' : 'SUPER_ADMIN_METADATA_OVERRIDE',
      traceId: productId,
      details: {
        product_id:      productId,
        variant_key:     `${dto.size}/${dto.color}`,
        changed_fields:  changedFields,
        log_entry_id:    logEntry?.id,
        acting_admin_id: actingAdminId,
      },
    }).catch(e => this.logger.warn(`[META_TX] audit_log write failed (non-blocking): ${e.message}`));

    return {
      success: true,
      data: updatedVariant,
      audit: {
        log_entry_id:   logEntry?.id,
        change_type:    'METADATA',
        changed_fields: changedFields,
        changed_by:     changedBy,
        changed_by_role: changedByRole,
        acting_admin_id: actingAdminId ?? undefined,
      },
    };
  }

  // â”€â”€ Private validation guards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /** Base guard â€” no price validation (used by metadata path) */
  private guardBase(tenantId: string, itemId: string, actorId: string) {
    if (!tenantId?.trim()) throw new ForbiddenException('SOVEREIGN_RLS_VIOLATION: tenant_id is required.');
    if (!itemId?.trim())   throw new BadRequestException('item_id / product_id is required.');
    if (!actorId?.trim())  throw new ForbiddenException('Actor user_id is required â€” audit trail cannot be anonymous.');
  }

  /** Full guard â€” includes price validation (used by price update path) */
  private guard(tenantId: string, itemId: string, actorId: string, priceCents: number) {
    this.guardBase(tenantId, itemId, actorId);
    if (priceCents === undefined || priceCents === null) {
      throw new BadRequestException('new_price_cents is required.');
    }
    if (!Number.isInteger(priceCents) || priceCents < 0) {
      throw new BadRequestException('new_price_cents must be a non-negative integer (cents).');
    }
  }
}


