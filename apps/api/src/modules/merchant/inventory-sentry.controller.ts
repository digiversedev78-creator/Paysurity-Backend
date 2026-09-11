/**
 * Inventory Sentry Controller
 *
 * OP-POSRET-03: Custom Inventory Thresholds
 *
 * Exposes:
 *   Tenant-Admin:
 *     GET  /api/merchant/inventory/low-stock                 → Sentry scan (own tenant)
 *     GET  /api/merchant/inventory/:id/stock-status          → Single item status
 *     PATCH /api/merchant/inventory/:id/threshold            → Set low_stock_threshold
 *
 *   Super-Admin:
 *     GET  /api/admin/inventory/global-low-stock             → Global low-stock god-view
 */
import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard }   from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../admin-portal/guards/admin-role.guard';
import { RequireRole }    from '../admin-portal/decorators/require-role.decorator';
import { InventorySentryService, SetThresholdDto } from './inventory-sentry.service';

// ── Tenant-Admin Controller ───────────────────────────────────────────────────

@ApiTags('Merchant — Inventory Sentry')
@Controller('merchant/inventory')
@UseGuards(JwtAuthGuard)
export class MerchantSentryController {
  private readonly logger = new Logger(MerchantSentryController.name);

  constructor(private readonly sentry: InventorySentryService) {}

  /** Extract tenantId + userId from JWT — called at every endpoint */
  private ctx(req: any) {
    const user     = req.user ?? {};
    const tenantId = user.tenantId ?? user.tenant_id ?? user.merchantId;
    const userId   = user.id ?? user.sub ?? user.userId;
    if (!tenantId) throw new ForbiddenException('JWT missing tenantId — RLS cannot be established.');
    if (!userId)   throw new ForbiddenException('JWT missing userId — actor identity required.');
    return { tenantId, userId };
  }

  /**
   * GET /api/merchant/inventory/low-stock
   *
   * Real-time Sentry scan — returns all items below their threshold
   * for the authenticated merchant. RLS-scoped — no cross-tenant leakage.
   *
   * Response: { success, count, data: LowStockItem[], scanned_at }
   * Each item includes:
   *   - severity: 'CRITICAL' | 'LOW' | 'WARN'
   *   - stock_pct: percentage of threshold remaining
   *   - low_stock_threshold: the merchant-set limit
   */
  @Get('low-stock')
  @ApiOperation({ summary: 'Real-time low-stock Sentry scan — RLS scoped to authenticated merchant' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max items to return (default 50)' })
  async getLowStock(@Req() req: any, @Query('limit') limit?: number) {
    const { tenantId } = this.ctx(req);
    const data = await this.sentry.getLowStockItems(tenantId, limit ?? 50);
    return {
      success:    true,
      count:      data.length,
      scanned_at: new Date().toISOString(),
      data,
    };
  }

  /**
   * GET /api/merchant/inventory/:id/stock-status
   *
   * Single-item stock status with threshold + severity badge.
   * UI uses this to show the ⚠ / 🔴 badge in the price manager grid.
   */
  @Get(':id/stock-status')
  @ApiOperation({ summary: 'Get real-time stock status and sentry badge for a single item' })
  @ApiParam({ name: 'id', description: 'Product UUID from retail_items' })
  async getStockStatus(@Req() req: any, @Param('id') itemId: string) {
    const { tenantId } = this.ctx(req);
    const data = await this.sentry.getItemStockStatus(tenantId, itemId);
    return { success: true, data };
  }

  /**
   * PATCH /api/merchant/inventory/:id/threshold
   *
   * Set the low-stock alert threshold for a specific item.
   * Atomic: UPDATE retail_items + INSERT item_change_log (change_type=STOCK).
   * If the log INSERT fails → threshold update rolls back.
   *
   * Body: { threshold: 10 }   — must be non-negative integer
   *
   * Response includes:
   *   - data: updated retail_items row (stock_quantity, low_stock_threshold)
   *   - audit.log_entry_id: the item_change_log UUID
   *   - audit.changed_fields: { low_stock_threshold: { old, new } }
   */
  @Patch(':id/threshold')
  @ApiOperation({ summary: 'Set low-stock threshold for an item — atomic with item_change_log INSERT' })
  @ApiParam({ name: 'id', description: 'Product UUID from retail_items' })
  async setThreshold(
    @Req() req: any,
    @Param('id') itemId: string,
    @Body() dto: SetThresholdDto,
  ) {
    const { tenantId, userId } = this.ctx(req);
    return this.sentry.setLowStockThreshold(tenantId, itemId, dto, userId);
  }
}

// ── Super-Admin Controller ────────────────────────────────────────────────────

@ApiTags('Super-Admin — Global Inventory Sentry')
@Controller('admin/inventory')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN', 'SUB_SUPER_ADMIN')
export class AdminSentryController {
  constructor(private readonly sentry: InventorySentryService) {}

  private adminCtx(req: any) {
    const admin   = req.adminUser ?? {};
    const adminId = admin.id ?? admin.sub ?? admin.adminId;
    if (!adminId) throw new ForbiddenException('Admin JWT missing. Cannot access god-view.');
    return { adminId };
  }

  /**
   * GET /api/admin/inventory/global-low-stock
   *
   * God-view: all tenants' items that are below their threshold.
   * Only reachable by SUPER_ADMIN or SUB_SUPER_ADMIN.
   */
  @Get('global-low-stock')
  @ApiOperation({ summary: 'Super-Admin god-view: global low-stock feed across ALL tenants' })
  @ApiQuery({ name: 'limit', required: false })
  async getGlobalLowStock(@Req() req: any, @Query('limit') limit?: number) {
    const { adminId } = this.adminCtx(req);
    const data = await this.sentry.getGlobalLowStockItems(limit ?? 200);
    return {
      success:    true,
      count:      data.length,
      scanned_at: new Date().toISOString(),
      viewedBy:   adminId,
      data,
    };
  }
}
