/**
 * InventorySentryService â€” OP-POSRET-03: Custom Inventory Thresholds
 *
 * Implements the "Low Stock Sentry" for Ashiana Collections and all tenants.
 *
 * Architecture:
 *   - Every tenant can set a `low_stock_threshold` per item (default=10, bridal=5)
 *   - The Sentry is triggered AFTER any stock mutation (sale, manual update)
 *   - It queries retail_items WHERE stock_quantity <= low_stock_threshold AND tenant_id = :mine
 *   - Uses the partial index: idx_retail_items_low_stock_sentry for sub-millisecond execution
 *
 * RLS Contract:
 *   - Tenant-Admin reads: scoped by WHERE tenant_id = :tenantId (never cross-tenant)
 *   - Super-Admin reads:  global feed of ALL tenants' low-stock items
 *   - Threshold writes:   scoped by WHERE id = :itemId AND tenant_id = :tenantId
 *
 * Integration points:
 *   - Called from MerchantPriceSentryController (REST)
 *   - Can be called from any service after decrementing stock (POS sale, returns)
 */
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogService } from '../audit-log/audit-log.service';

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SetThresholdDto {
  /** New low_stock_threshold â€” must be a non-negative integer */
  threshold: number;
}

export interface LowStockItem {
  id: string;
  tenant_id: string;
  name: string;
  category: string;
  stock_quantity: number;
  low_stock_threshold: number;
  /** Percentage of threshold remaining: stock/threshold * 100 */
  stock_pct: number;
  /** Severity tier: 'CRITICAL' (stock=0), 'LOW' (â‰¤50% of threshold), 'WARN' (â‰¤threshold) */
  severity: 'CRITICAL' | 'LOW' | 'WARN';
}

// â”€â”€ Service â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Injectable()
export class InventorySentryService {
  private readonly logger = new Logger(InventorySentryService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLog: AuditLogService,
  ) {}

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: Set Low-Stock Threshold (Tenant-Admin)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * setLowStockThreshold(tenantId, itemId, dto, actorUserId)
   *
   * Allows a Tenant-Admin to customize the low-stock alert threshold
   * for a specific item. The RLS wall is enforced by the WHERE clause â€”
   * the item must belong to the authenticated tenant.
   *
   * Changes are logged to item_change_log with change_type='STOCK'.
   */
  async setLowStockThreshold(
    tenantId: string,
    itemId: string,
    dto: SetThresholdDto,
    actorUserId: string,
  ) {
    // Validate
    if (!tenantId?.trim()) throw new ForbiddenException('SOVEREIGN_RLS: tenantId required.');
    if (!itemId?.trim())   throw new BadRequestException('itemId required.');
    if (!actorUserId?.trim()) throw new ForbiddenException('Actor identity required for audit trail.');
    if (!Number.isInteger(dto.threshold) || dto.threshold < 0) {
      throw new BadRequestException('threshold must be a non-negative integer.');
    }

    // Fetch before snapshot (verify ownership + get old value)
    const before = await (this.db as any).execute(sql`
      SELECT id, name, low_stock_threshold
      FROM public.retail_items
      WHERE id = ${itemId} AND tenant_id = ${tenantId}
      LIMIT 1
    `);
    if ((before as any).rows.length === 0) {
      throw new NotFoundException(`Item ${itemId} not found for tenant ${tenantId}.`);
    }
    const row = (before as any).rows[0] as any;
    const oldThreshold = Number(row.low_stock_threshold ?? 10);

    if (oldThreshold === dto.threshold) {
      return {
        success: true,
        message: 'Threshold unchanged â€” no update performed.',
        data: row,
        audit: null,
      };
    }

    // Atomic: UPDATE retail_items + INSERT item_change_log
    let updatedRow: any;
    let logEntry: any;

    await (this.db as any).transaction(async (tx) => {

      // â”€â”€ STEP 1: UPDATE low_stock_threshold â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // WHERE includes tenant_id â€” cross-tenant writes are physically blocked
      const upd = await tx.execute(sql`
        UPDATE public.retail_items
        SET low_stock_threshold = ${dto.threshold},
            updated_at          = NOW()
        WHERE id = ${itemId} AND tenant_id = ${tenantId}
        RETURNING id, name, low_stock_threshold, stock_quantity, updated_at
      `);
      if ((upd as any).rows.length === 0) {
        throw new NotFoundException('Item not found during transaction.');
      }
      updatedRow = (upd as any).rows[0];

      // â”€â”€ STEP 2: INSERT item_change_log (change_type='STOCK') â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // Inside same transaction â€” failure rolls back STEP 1
      const log = await tx.execute(sql`
        INSERT INTO public.price_change_log (
          item_id, tenant_id, item_name,
          old_price_cents, new_price_cents,
          changed_by, changed_by_role,
          source, change_type, changed_fields
        )
        VALUES (
          ${itemId}, ${tenantId}, ${row.name},
          0, 0,
          ${actorUserId}, 'TENANT_ADMIN',
          'API', 'STOCK',
          ${JSON.stringify({
            low_stock_threshold: { old: oldThreshold, new: dto.threshold },
          })}::jsonb
        )
        RETURNING id
      `);
      logEntry = (log as any).rows[0];
      if (!logEntry) throw new Error('item_change_log INSERT returned no rows â€” tx rolled back.');
    });

    this.logger.log(
      `[SENTRY] Threshold updated | item=${itemId} | tenant=${tenantId} | ` +
      `${oldThreshold} â†’ ${dto.threshold} | actor=${actorUserId}`,
    );

    // Fire-and-forget audit_log
    await this.auditLog.record(tenantId, {
      userId:  actorUserId,
      action:  'TENANT_ADMIN_THRESHOLD_UPDATE',
      traceId: itemId,
      details: { item_id: itemId, old: oldThreshold, new: dto.threshold, log_entry_id: logEntry?.id },
    }).catch(e => this.logger.warn(`[SENTRY] audit_log write failed: ${e.message}`));

    return {
      success: true,
      data: updatedRow,
      audit: {
        log_entry_id: logEntry?.id,
        change_type: 'STOCK',
        changed_fields: { low_stock_threshold: { old: oldThreshold, new: dto.threshold } },
      },
    };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: Scan for Low-Stock Items (Tenant-Admin â€” RLS scoped)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * getLowStockItems(tenantId, limit?)
   *
   * Real-time Sentry scan â€” returns all items where stock_quantity <= low_stock_threshold
   * for this specific tenant. Uses the partial index for sub-ms execution.
   *
   * Returns severity tier:
   *   CRITICAL â€” stock_quantity = 0 (completely out)
   *   LOW      â€” stock_quantity <= floor(low_stock_threshold * 0.5) (â‰¤50% of threshold)
   *   WARN     â€” stock_quantity <= low_stock_threshold (above 50% but below limit)
   */
  async getLowStockItems(tenantId: string, limit = 50): Promise<LowStockItem[]> {
    if (!tenantId?.trim()) throw new ForbiddenException('SOVEREIGN_RLS: tenantId required.');

    const result = await (this.db as any).execute(sql`
      SELECT
        id,
        tenant_id,
        name,
        category,
        COALESCE(stock_quantity, 0)    AS stock_quantity,
        COALESCE(low_stock_threshold, 10) AS low_stock_threshold,
        CASE
          WHEN COALESCE(stock_quantity, 0) = 0 THEN
            0.0
          ELSE
            ROUND(
              (COALESCE(stock_quantity, 0)::float /
               GREATEST(COALESCE(low_stock_threshold, 10), 1) * 100)::numeric,
              1
            )
        END AS stock_pct,
        CASE
          WHEN COALESCE(stock_quantity, 0) = 0
            THEN 'CRITICAL'
          WHEN COALESCE(stock_quantity, 0) <= FLOOR(COALESCE(low_stock_threshold, 10) * 0.5)
            THEN 'LOW'
          ELSE
            'WARN'
        END AS severity
      FROM public.retail_items
      WHERE tenant_id          = ${tenantId}
        AND stock_quantity     IS NOT NULL
        AND COALESCE(stock_quantity, 0) <= COALESCE(low_stock_threshold, 10)
      ORDER BY stock_quantity ASC, name ASC
      LIMIT ${limit}
    `);

    return (result as any).rows as LowStockItem[];
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: Global Low-Stock Scan (Super-Admin god-view)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * getGlobalLowStockItems(limit?)
   *
   * Super-Admin only â€” cross-tenant low-stock report.
   * Returns all items across ALL tenants that are below their threshold.
   * ONLY reachable via AdminRoleGuard-gated controller.
   */
  async getGlobalLowStockItems(limit = 200): Promise<(LowStockItem & { tenant_id: string })[]> {
    const result = await (this.db as any).execute(sql`
      SELECT
        ri.id,
        ri.tenant_id,
        ri.name,
        ri.category,
        COALESCE(ri.stock_quantity, 0)       AS stock_quantity,
        COALESCE(ri.low_stock_threshold, 10) AS low_stock_threshold,
        CASE
          WHEN COALESCE(ri.stock_quantity, 0) = 0 THEN 0.0
          ELSE ROUND(
            (COALESCE(ri.stock_quantity, 0)::float /
             GREATEST(COALESCE(ri.low_stock_threshold, 10), 1) * 100)::numeric, 1
          )
        END AS stock_pct,
        CASE
          WHEN COALESCE(ri.stock_quantity, 0) = 0                                              THEN 'CRITICAL'
          WHEN COALESCE(ri.stock_quantity, 0) <= FLOOR(COALESCE(ri.low_stock_threshold,10)*0.5) THEN 'LOW'
          ELSE 'WARN'
        END AS severity
      FROM public.retail_items ri
      WHERE ri.stock_quantity     IS NOT NULL
        AND COALESCE(ri.stock_quantity, 0) <= COALESCE(ri.low_stock_threshold, 10)
      ORDER BY ri.stock_quantity ASC, ri.tenant_id, ri.name
      LIMIT ${limit}
    `);

    return (result as any).rows as any[];
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PUBLIC: Get stock summary for a single item
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * getItemStockStatus(tenantId, itemId)
   *
   * Returns real-time stock status for a single item.
   * Called by the UI to show the sentry badge in the price manager.
   */
  async getItemStockStatus(tenantId: string, itemId: string) {
    if (!tenantId?.trim()) throw new ForbiddenException('SOVEREIGN_RLS: tenantId required.');

    const result = await (this.db as any).execute(sql`
      SELECT
        id, name, stock_quantity,
        COALESCE(low_stock_threshold, 10) AS low_stock_threshold,
        (COALESCE(stock_quantity, 0) <= COALESCE(low_stock_threshold, 10)) AS is_low_stock,
        COALESCE(stock_quantity, 0) = 0 AS is_out_of_stock
      FROM public.retail_items
      WHERE id = ${itemId} AND tenant_id = ${tenantId}
      LIMIT 1
    `);

    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Item ${itemId} not found for tenant ${tenantId}.`);
    }

    return (result as any).rows[0];
  }
}


