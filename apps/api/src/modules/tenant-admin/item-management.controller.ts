/**
 * Item Management Controller
 *
 * Exposes TWO controller groups on the same service:
 *
 * ─── Tenant-Admin paths (/tenant-admin/items/*) ───────────────────────────
 *   Requires: JWT with req.user.tenantId populated (standard merchant JWT)
 *   RLS:      tenantId is always taken from JWT — never from request body
 *   Access:   OWNER, MANAGER roles
 *
 * ─── Super-Admin paths (/admin/items/*) ────────────────────────────────────
 *   Requires: AdminRoleGuard + SUPER_ADMIN / SUB_SUPER_ADMIN role
 *   Bypass:   targetTenantId supplied in request body by the admin
 *   Audit:    SUPER_ADMIN_PRICE_OVERRIDE recorded immutably
 */
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ItemManagementService,
  UpdateItemPriceDto,
  UpdateApparelAttributeDto,
  BulkPriceAdjustmentDto,
} from './item-management.service';
import { AdminRoleGuard } from '../admin-portal/guards/admin-role.guard';
import { RequireRole } from '../admin-portal/decorators/require-role.decorator';

// ══════════════════════════════════════════════════════════════════════════════
//  1. TENANT-ADMIN CONTROLLER
//     Path prefix: /api/tenant-admin/items
//     tenantId ALWAYS from JWT — never from body or params
// ══════════════════════════════════════════════════════════════════════════════
@Controller('tenant-admin/items')
export class TenantAdminItemsController {
  constructor(private readonly itemMgmt: ItemManagementService) {}

  private getTenantContext(req: any): { tenantId: string; userId: string } {
    const tenantId = req?.user?.tenantId;
    const userId = req?.user?.id || req?.user?.userId || 'unknown';
    if (!tenantId) {
      throw new ForbiddenException(
        'SOVEREIGN_RLS: tenantId not found in JWT. Are you authenticated?',
      );
    }
    return { tenantId, userId };
  }

  /**
   * GET /api/tenant-admin/items
   * Returns the full item catalog for the authenticated merchant.
   * Includes apparel variant aggregation.
   */
  @Get()
  async getCatalog(@Req() req: Request) {
    const { tenantId } = this.getTenantContext(req);
    const data = await this.itemMgmt.getTenantCatalog(tenantId);
    return { success: true, count: data.length, data };
  }

  /**
   * PATCH /api/tenant-admin/items/:id/price
   *
   * Update price, name, description, stock, or category for a single item.
   * The item must belong to the authenticated tenant — enforced by WHERE clause.
   *
   * Body: { price_cents, name?, description?, stock_quantity?, category? }
   */
  @Patch(':id/price')
  async updatePrice(
    @Req() req: Request,
    @Param('id') itemId: string,
    @Body() dto: UpdateItemPriceDto,
  ) {
    const { tenantId, userId } = this.getTenantContext(req);
    return this.itemMgmt.updateItemPrice(tenantId, itemId, dto, userId);
  }

  /**
   * PATCH /api/tenant-admin/items/:id/variant
   *
   * Update a specific size×color apparel variant (fabric, season, in_stock).
   * Verifies product ownership before touching retail_apparel_attributes.
   *
   * Body: { size, color, fabric?, season?, in_stock? }
   */
  @Patch(':id/variant')
  async updateVariant(
    @Req() req: Request,
    @Param('id') productId: string,
    @Body() dto: UpdateApparelAttributeDto,
  ) {
    const { tenantId, userId } = this.getTenantContext(req);
    return this.itemMgmt.updateApparelVariant(tenantId, productId, dto, userId);
  }

  /**
   * POST /api/tenant-admin/items/bulk-price-adjust
   *
   * Apply a percentage adjustment to all items in a category.
   * Body: { category: "Bridal Wear", adjustment_pct: -10 }
   * Audit trail records category-level change, not per-item.
   */
  @Post('bulk-price-adjust')
  async bulkPriceAdjust(
    @Req() req: Request,
    @Body() dto: BulkPriceAdjustmentDto,
  ) {
    const { tenantId, userId } = this.getTenantContext(req);
    return this.itemMgmt.bulkAdjustCategoryPrices(tenantId, dto, userId);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  2. SUPER-ADMIN OVERRIDE CONTROLLER
//     Path prefix: /api/admin/items
//     Gated by AdminRoleGuard + SUPER_ADMIN role
//     targetTenantId comes from request body — NEVER from JWT
// ══════════════════════════════════════════════════════════════════════════════
@Controller('admin/items')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN', 'SUB_SUPER_ADMIN')
export class SuperAdminItemsController {
  constructor(private readonly itemMgmt: ItemManagementService) {}

  private getAdminUserId(req: any): string {
    const userId = req?.adminUser?.id || req?.user?.id;
    if (!userId) {
      throw new ForbiddenException('Admin identity not found. Are you authenticated as Super Admin?');
    }
    return userId;
  }

  /**
   * GET /api/admin/items?tenantId=<uuid>
   * Super-Admin reads any merchant's full catalog (with apparel variants).
   */
  @Get()
  async getCatalog(
    @Req() req: any,
    @Body() body: { tenantId: string },
  ) {
    const adminId = this.getAdminUserId(req);
    const targetTenantId = body?.tenantId;
    if (!targetTenantId) {
      throw new ForbiddenException('targetTenantId is required in body for Super-Admin catalog access.');
    }
    const data = await this.itemMgmt.getTenantCatalog(targetTenantId);
    return { success: true, count: data.length, data, viewedBy: adminId };
  }

  /**
   * PATCH /api/admin/items/:id/price
   *
   * Super-Admin price override. FULL audit trail auto-recorded.
   *
   * Body: {
   *   targetTenantId: "<merchant-uuid>",   ← explicit, never from JWT
   *   price_cents: 4999,
   *   name?, description?, stock_quantity?, category?
   * }
   */
  @Patch(':id/price')
  async overridePrice(
    @Req() req: any,
    @Param('id') itemId: string,
    @Body() body: UpdateItemPriceDto & { targetTenantId: string },
  ) {
    const adminId = this.getAdminUserId(req);
    const { targetTenantId, ...dto } = body;

    if (!targetTenantId) {
      throw new ForbiddenException(
        'SUPER_ADMIN_OVERRIDE: targetTenantId is required. ' +
        'This endpoint mutates a merchant\'s item — tenant must be explicit.',
      );
    }

    return this.itemMgmt.superAdminUpdateItemPrice(targetTenantId, itemId, dto, adminId);
  }

  /**
   * PATCH /api/admin/items/:id/variant
   *
   * Super-Admin: update apparel variant attributes for any tenant.
   *
   * Body: { targetTenantId, size, color, fabric?, season?, in_stock? }
   */
  @Patch(':id/variant')
  async overrideVariant(
    @Req() req: any,
    @Param('id') productId: string,
    @Body() body: UpdateApparelAttributeDto & { targetTenantId: string },
  ) {
    const adminId = this.getAdminUserId(req);
    const { targetTenantId, ...dto } = body;

    if (!targetTenantId) {
      throw new ForbiddenException('targetTenantId required for Super-Admin variant override.');
    }

    return this.itemMgmt.updateApparelVariant(targetTenantId, productId, dto, adminId);
  }
}
