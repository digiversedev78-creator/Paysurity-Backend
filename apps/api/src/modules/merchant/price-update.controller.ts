/**
 * Price Update Controller
 *
 * Exposes the PriceUpdateService through two distinct route groups:
 *
 * GROUP 1 — Tenant-Admin  (/api/merchant/items/:id/price)
 *   Guard : JwtAuthGuard (standard merchant JWT)
 *   RLS   : tenantId extracted from req.user.tenantId — never from body
 *   Role  : Any authenticated merchant user (owner/manager roles enforced by JWT subject)
 *
 * GROUP 2 — Super-Admin   (/api/admin/price/:id)
 *   Guard : AdminRoleGuard + @RequireRole('SUPER_ADMIN', 'SUB_SUPER_ADMIN')
 *   Bypass: targetTenantId supplied in request body
 *   Audit : acting_admin_id FORCED from req.adminUser.id — caller cannot supply it
 */
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  Ip,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  PriceUpdateService,
  PriceUpdateDto,
  AdminPriceUpdateDto,
  ApparelMetadataDto,
  AdminApparelMetadataDto,
} from './price-update.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoleGuard } from '../admin-portal/guards/admin-role.guard';
import { RequireRole } from '../admin-portal/decorators/require-role.decorator';

// ══════════════════════════════════════════════════════════════════════════════
//  1. TENANT-ADMIN CONTROLLER
//     Prefix: /api/merchant/items
//     All tenantId values sourced from JWT — never from request body.
// ══════════════════════════════════════════════════════════════════════════════

@ApiTags('merchant-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchant/items')
export class MerchantPriceController {
  constructor(private readonly priceUpdate: PriceUpdateService) {}

  private ctx(req: any): { tenantId: string; userId: string } {
    const tenantId = req?.user?.tenantId;
    const userId   = req?.user?.id || req?.user?.userId || req?.user?.sub;
    if (!tenantId) {
      throw new ForbiddenException(
        'SOVEREIGN_RLS: tenantId not found in JWT. Authentication required.',
      );
    }
    if (!userId) {
      throw new ForbiddenException(
        'AUDIT_TRAIL: userId not found in JWT. Cannot record who made this change.',
      );
    }
    return { tenantId, userId };
  }

  /**
   * PATCH /api/merchant/items/:id/price
   *
   * Update the price (and optionally name/description/stock/category) of an item.
   * The item MUST belong to the authenticated merchant.
   *
   * Body: {
   *   new_price_cents: 4999,          ← required, integer
   *   name?: "New Name",              ← optional
   *   description?: "...",            ← optional
   *   stock_quantity?: 250,           ← optional
   *   category?: "Bridal Wear"        ← optional
   * }
   *
   * Response includes:
   *   - data: updated retail_items row
   *   - audit.log_entry_id: the price_change_log UUID
   *   - audit.old_price_cents / new_price_cents
   */
  @Patch(':id/price')
  @ApiOperation({ summary: 'Update item price — creates immutable audit log entry atomically' })
  @ApiParam({ name: 'id', description: 'Item UUID from retail_items' })
  async updatePrice(
    @Req() req: any,
    @Param('id') itemId: string,
    @Body() dto: PriceUpdateDto,
    @Ip() ip: string,
  ) {
    const { tenantId, userId } = this.ctx(req);
    return this.priceUpdate.updatePrice(tenantId, itemId, dto, userId, ip);
  }

  /**
   * GET /api/merchant/items/price-log
   *
   * Returns the full item change history (PRICE + METADATA) for this merchant.
   * RLS-scoped: only this tenant's log entries are returned.
   *
   * Query params:
   *   - item_id?:     filter to a specific item
   *   - change_type?: 'PRICE' | 'METADATA' (default: all)
   *   - limit?:       max rows (default 100)
   */
  @Get('price-log')
  @ApiOperation({ summary: 'Get item change history for authenticated merchant (RLS-scoped)' })
  @ApiQuery({ name: 'item_id',     required: false })
  @ApiQuery({ name: 'change_type', required: false, enum: ['PRICE', 'METADATA', 'COMBINED'] })
  @ApiQuery({ name: 'limit',       required: false })
  async getPriceLog(
    @Req() req: any,
    @Query('item_id')     itemId?:     string,
    @Query('change_type') changeType?: string,
    @Query('limit')       limit?:      number,
  ) {
    const { tenantId } = this.ctx(req);
    const data = await this.priceUpdate.getItemChangeLog(tenantId, itemId, changeType, limit ?? 100);
    return { success: true, count: data.length, data };
  }

  /**
   * PATCH /api/merchant/items/:id/variant-meta
   *
   * Update apparel variant attributes (fabric, season, color, in_stock, bridal_wear)
   * for a specific size×color variant. Atomic with item_change_log INSERT.
   *
   * Body: {
   *   size:            "M",            ← REQUIRED: identifies variant row
   *   color:           "Crimson Red",  ← REQUIRED: identifies variant row
   *   new_fabric?:     "Silk",
   *   new_season?:     "Fall/Winter",
   *   new_color?:      "Burgundy",
   *   new_in_stock?:   true,
   *   new_bridal_wear?: true
   * }
   *
   * Response includes:
   *   - data: updated retail_apparel_attributes row
   *   - audit.changed_fields: JSONB diff { fabric: { old, new }, season: { old, new }, ... }
   *   - audit.log_entry_id: the item_change_log UUID
   */
  @Patch(':id/variant-meta')
  @ApiOperation({ summary: 'Update apparel variant metadata — atomic with change log INSERT' })
  @ApiParam({ name: 'id', description: 'Product UUID from retail_items' })
  async updateVariantMeta(
    @Req() req: any,
    @Param('id') productId: string,
    @Body() dto: ApparelMetadataDto,
    @Ip() ip: string,
  ) {
    const { tenantId, userId } = this.ctx(req);
    return this.priceUpdate.updateApparelMetadata(tenantId, productId, dto, userId, ip);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  2. SUPER-ADMIN CONTROLLER
//     Prefix: /api/admin/price
//     AdminRoleGuard + RequireRole enforced at class level.
//     acting_admin_id is pulled from req.adminUser.id — NOT from request body.
// ══════════════════════════════════════════════════════════════════════════════

@ApiTags('admin-price')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN', 'SUB_SUPER_ADMIN')
@Controller('admin/price')
export class AdminPriceController {
  constructor(private readonly priceUpdate: PriceUpdateService) {}

  private adminCtx(req: any): { adminId: string; adminRole: 'SUPER_ADMIN' | 'SUB_SUPER_ADMIN' } {
    const adminId   = req?.adminUser?.id || req?.user?.id;
    const adminRole = req?.adminUser?.role || req?.user?.role || 'SUPER_ADMIN';
    if (!adminId) {
      throw new ForbiddenException(
        'Admin identity not found. AdminRoleGuard should have populated req.adminUser.',
      );
    }
    return { adminId, adminRole };
  }

  /**
   * PATCH /api/admin/price/:id
   *
   * Super-Admin price override for any merchant.
   * The `acting_admin_id` is SET IN CODE from the admin's verified JWT —
   * the REST consumer CANNOT supply or forge it.
   *
   * Body: {
   *   targetTenantId: "<merchant-uuid>",   ← REQUIRED — explicit merchant target
   *   new_price_cents: 2999,
   *   override_reason?: "Promotional event approved by board",
   *   name?, description?, stock_quantity?, category?
   * }
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Super-Admin price override — cross-tenant, forced audit trail' })
  @ApiParam({ name: 'id', description: 'Item UUID from retail_items' })
  async adminOverridePrice(
    @Req() req: any,
    @Param('id') itemId: string,
    @Body() body: AdminPriceUpdateDto,
    @Ip() ip: string,
  ) {
    const { adminId, adminRole } = this.adminCtx(req);

    if (!body.targetTenantId) {
      throw new ForbiddenException(
        'ADMIN_OVERRIDE: targetTenantId is REQUIRED. ' +
        'Super-Admin must explicitly declare the target merchant — no implicit tenant assumption.',
      );
    }

    return this.priceUpdate.adminUpdatePrice(
      body.targetTenantId,
      itemId,
      body,
      adminId,    // ← FORCED from admin JWT — caller cannot provide this
      adminRole,
      ip,
    );
  }

  /**
   * GET /api/admin/price/global-log
   *
   * God-view: All item changes (PRICE + METADATA) across ALL tenants.
   * Query params:
   *   - since?:       ISO timestamp
   *   - change_type?: 'PRICE' | 'METADATA' (default: all)
   *   - limit?:       max rows (default 200)
   */
  @Get('global-log')
  @ApiOperation({ summary: 'Super-Admin god-view: global item change feed across all tenants' })
  @ApiQuery({ name: 'since',       required: false, description: 'ISO timestamp filter' })
  @ApiQuery({ name: 'change_type', required: false, enum: ['PRICE', 'METADATA', 'COMBINED'] })
  @ApiQuery({ name: 'limit',       required: false })
  async getGlobalLog(
    @Req() req: any,
    @Query('since')       since?:      string,
    @Query('change_type') changeType?: string,
    @Query('limit')       limit?:      number,
  ) {
    const { adminId } = this.adminCtx(req);
    const data = await this.priceUpdate.getGlobalItemChangeLog(since, changeType, limit ?? 200);
    return { success: true, count: data.length, viewedBy: adminId, data };
  }

  /**
   * PATCH /api/admin/price/:id/variant-meta
   *
   * Super-Admin variant metadata override for any merchant.
   * acting_admin_id is SET IN CODE from the admin JWT — cannot be forged.
   *
   * Body: {
   *   targetTenantId:  "<merchant-uuid>",  ← REQUIRED
   *   size:            "M",
   *   color:           "Crimson Red",
   *   new_fabric?:     "Silk",
   *   new_season?:     "Fall/Winter",
   *   new_bridal_wear?: true,
   *   override_reason?: "..."
   * }
   */
  @Patch(':id/variant-meta')
  @ApiOperation({ summary: 'Super-Admin variant metadata override — cross-tenant, forced audit trail' })
  @ApiParam({ name: 'id', description: 'Product UUID from retail_items' })
  async adminOverrideVariantMeta(
    @Req() req: any,
    @Param('id') productId: string,
    @Body() body: AdminApparelMetadataDto,
    @Ip() ip: string,
  ) {
    const { adminId, adminRole } = this.adminCtx(req);
    if (!body.targetTenantId) {
      throw new ForbiddenException('ADMIN_OVERRIDE: targetTenantId is REQUIRED in body.');
    }
    return this.priceUpdate.adminUpdateApparelMetadata(
      body.targetTenantId,
      productId,
      body,
      adminId,    // FORCED from admin JWT
      adminRole,
      ip,
    );
  }
}
