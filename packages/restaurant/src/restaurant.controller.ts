/**
 * RestaurantController — REST API for POS Restaurant (POSR)
 *
 * REQ-POSR-001: Core order lifecycle — open, add items, fire, split, close, void
 * REQ-POSR-002: KDS fire endpoints
 * REQ-POSR-003: Menu management (delegated to MenuService)
 * REQ-POSR-007: Shift close + reporting
 * REQ-POSR-008: Loyalty lookup at POS
 * REQ-POSR-009: Offline sync batch
 * REQ-POSR-010: Z-Report (end-of-day)
 *
 * Canonical routes (POSR_POS_RESTAURANT.md):
 *   POST   /v1/orders               → openOrder
 *   GET    /v1/orders/:id           → getOrder
 *   POST   /v1/orders/:id/items     → addItem
 *   DELETE /v1/orders/:id/items/:itemId → voidItem
 *   POST   /v1/orders/:id/fire      → fireToKDS
 *   POST   /v1/orders/:id/split     → splitCheck
 *   POST   /v1/orders/:id/close     → closeOrder
 *   POST   /v1/orders/:id/void      → voidOrder
 *   GET    /v1/locations/:id/tables → getTableGrid
 *   GET    /v1/locations/:id/orders → getOpenOrders
 *   POST   /v1/pos/offline-sync     → processBatchSync
 *   POST   /v1/pos/shifts/close     → closeShift
 *   GET    /v1/loyalty/lookup       → lookupLoyaltyByPhone
 *   GET    /restaurant/menu         → getMenu
 *   GET    /restaurant/z-report     → generateZReport (legacy)
 */

import {
  Controller, Get, Post, Delete, Body, Param, Query,
  HttpCode, HttpStatus, ParseUUIDPipe, Logger,
  BadRequestException, Headers, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RestaurantService, SplitSpec } from './restaurant.service';
import { RestaurantZReportService } from './restaurant-z-report.service';
import { MenuService } from './menu.service';

// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('POS Restaurant')
@ApiBearerAuth()
@Controller()  // root controller — routes prefixed per method
export class RestaurantController {
  private readonly logger = new Logger(RestaurantController.name);

  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly zReportService: RestaurantZReportService,
    private readonly menuService: MenuService,
  ) {}

  // ── Legacy Menu Route ─────────────────────────────────────────────────────

  @Get('restaurant/menu')
  @ApiOperation({ summary: 'Get full menu with categories, items, modifiers' })
  async getMenu(
    @Headers('x-tenant-id') tenantId: string,
    @Query('slug') slug?: string,
  ) {
    const tid = tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    if (slug) {
      // Public storefront route (slug-based lookup)
      const tenantResult = await this.menuService.getMenu(tid);
      return tenantResult;
    }
    return this.menuService.getMenu(tid);
  }

  // ── REQ-POSR-001: Order Lifecycle ─────────────────────────────────────────

  /**
   * POST /v1/orders — Open a new order
   * REQ-POSR-001: Creates order, sets table OCCUPIED, optionally looks up loyalty
   */
  @Post('v1/orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'REQ-POSR-001: Open new order (DINE_IN/TAKEOUT/DELIVERY)' })
  async openOrder(
    @Body() body: {
      locationId: string; tableId?: string; orderType?: string;
      sourceChannel?: string; serverId?: string; consumerPhone?: string;
      notes?: string; idempotencyKey?: string;
    },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.openOrder({
      tenantId,
      locationId: body.locationId,
      tableId: body.tableId,
      orderType: (body.orderType as any) || 'DINE_IN',
      sourceChannel: (body.sourceChannel as any) || 'POS',
      serverId: body.serverId,
      consumerPhone: body.consumerPhone,
      notes: body.notes,
      idempotencyKey: body.idempotencyKey,
    });
  }

  /**
   * GET /v1/orders/:id — Get full order with items
   */
  @Get('v1/orders/:id')
  @ApiOperation({ summary: 'REQ-POSR-001: Get full order state with items' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async getOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.getOrder(tenantId, orderId);
  }

  /**
   * POST /v1/orders/:id/items — Add item to open order
   * REQ-POSR-001: Price snapshot at add time; routes item to KDS station
   */
  @Post('v1/orders/:id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'REQ-POSR-001: Add item to order (routes to KDS station)' })
  async addItem(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: {
      menuItemId: string; quantity: number;
      modifiers?: Array<{ name: string; priceDeltaCents: number }>;
      notes?: string; course?: number;
    },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.addItem({
      tenantId, orderId,
      menuItemId: body.menuItemId,
      quantity: body.quantity,
      modifiers: body.modifiers,
      notes: body.notes,
      course: body.course,
    });
  }

  /**
   * DELETE /v1/orders/:id/items/:itemId — Void an item
   * REQ-POSR-001: Sets kds_status=VOIDED, KDS shows VOIDED indicator
   */
  @Delete('v1/orders/:id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-001: Void order item (KDS shows VOIDED)' })
  async voidItem(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Param('itemId', ParseUUIDPipe) orderItemId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { reason: string },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    await this.restaurantService.voidItem(tenantId, orderId, orderItemId, body.reason || 'Voided by server');
    return { success: true };
  }

  /**
   * POST /v1/orders/:id/fire — Fire unfired items to KDS
   * REQ-POSR-002: Reads kds_fire_delay_seconds from DB, groups by station
   */
  @Post('v1/orders/:id/fire')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-002: Fire items to KDS stations' })
  async fireToKDS(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { courseNumber?: number },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.fireToKDS(tenantId, orderId, body.courseNumber);
  }

  /**
   * POST /v1/orders/:id/split — Split check N ways or by items
   * REQ-POSR-001: Max ways from posr.split_check_max_ways DB config
   */
  @Post('v1/orders/:id/split')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'REQ-POSR-001: Split check (even N ways or by items)' })
  async splitCheck(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: SplitSpec,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.splitCheck(tenantId, orderId, body);
  }

  /**
   * POST /v1/orders/:id/close — Accept payment and close order
   * REQ-POSR-006: Multi-tender, auto-gratuity from DB config
   * REQ-POSR-008: LOY earning fired inside same transaction
   * REQ-POSR-010: Returns receipt payload
   */
  @Post('v1/orders/:id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-006: Process payment, close order, earn loyalty' })
  async closeOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: {
      payments: Array<{ method: string; amountCents: number; gatewayRefId?: string; idempotencyKey?: string }>;
      tipCents?: number;
      loyaltyAccountId?: string;
      loyaltyPointsToRedeem?: number;
    },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.closeOrder({
      tenantId, orderId,
      payments: body.payments.map(p => ({
        method: p.method as any,
        amountCents: p.amountCents,
        gatewayRefId: p.gatewayRefId,
        idempotencyKey: p.idempotencyKey,
      })),
      tipCents: body.tipCents,
      loyaltyAccountId: body.loyaltyAccountId,
      loyaltyPointsToRedeem: body.loyaltyPointsToRedeem,
    });
  }

  /**
   * POST /v1/orders/:id/void — Void entire order
   * REQ-POSR-001: Requires manager role; clears table; emits KDS void event
   */
  @Post('v1/orders/:id/void')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-001: Void order (manager required)' })
  async voidOrder(
    @Param('id', ParseUUIDPipe) orderId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { reason: string; managerId?: string },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    await this.restaurantService.voidOrder(tenantId, orderId, body.reason, body.managerId);
    return { success: true };
  }

  // ── REQ-POSR-004: Table + Location Management ────────────────────────────

  /**
   * GET /v1/locations/:id/tables — Table grid with live status colors
   * REQ-POSR-001: Color coding based on elapsed time vs target turn time (from DB)
   */
  @Get('v1/locations/:id/tables')
  @ApiOperation({ summary: 'REQ-POSR-001: Table grid with color-coded status' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  async getTableGrid(
    @Param('id', ParseUUIDPipe) locationId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.getTableGrid(tenantId, locationId);
  }

  /**
   * GET /v1/locations/:id/orders — All open orders for a location
   */
  @Get('v1/locations/:id/orders')
  @ApiOperation({ summary: 'REQ-POSR-001: Open orders for location' })
  @ApiParam({ name: 'id', description: 'Location UUID' })
  async getOpenOrders(
    @Param('id', ParseUUIDPipe) locationId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.getOpenOrders(tenantId, locationId);
  }

  // ── REQ-POSR-007: Shift Management ────────────────────────────────────────

  /**
   * POST /v1/pos/shifts/close — Close shift, generate shift_close_reports row
   */
  @Post('v1/pos/shifts/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-007: Close shift, generate full financial report' })
  async closeShift(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: { locationId: string; shiftStart: string },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.closeShift(
      tenantId,
      body.locationId,
      userId || '00000000-0000-0000-0000-000000000000',
      new Date(body.shiftStart),
    );
  }

  // ── REQ-POSR-009: Offline Sync ────────────────────────────────────────────

  /**
   * POST /v1/pos/offline-sync — Batch sync queued offline orders
   * REQ-POSR-009: Accepts array of orders from local SQLite queue
   */
  @Post('v1/pos/offline-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-009: Batch sync offline-queued orders on reconnect' })
  async offlineSync(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { locationId: string; orders: any[] },
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    return this.restaurantService.processBatchSync(tenantId, body.locationId, body.orders);
  }

  // ── REQ-POSR-008: Loyalty at POS ─────────────────────────────────────────

  /**
   * GET /v1/loyalty/lookup — Lookup loyalty account by phone (within 1 second)
   * REQ-POSR-008: Triggered at order open, not at close
   */
  @Get('v1/loyalty/lookup')
  @ApiOperation({ summary: 'REQ-POSR-008: Lookup loyalty account by phone (< 1s)' })
  @ApiQuery({ name: 'phone', required: true, description: 'E.164 format: +13125550199' })
  async lookupLoyalty(
    @Query('phone') phone: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new BadRequestException('X-Tenant-ID header required');
    if (!phone) throw new BadRequestException('phone query param required');
    const result = await this.restaurantService.lookupLoyaltyByPhone(tenantId, phone);
    return result ?? { found: false };
  }

  // ── REQ-POSR-010: Z-Report (Legacy) ──────────────────────────────────────

  /**
   * GET /restaurant/z-report — End-of-day Z-Report
   * REQ-POSR-010 / REQ-POSR-007
   */
  @Get('restaurant/z-report')
  @ApiOperation({ summary: 'REQ-POSR-007: End-of-day Z-Report' })
  async getZReport(
    @Headers('x-tenant-id') tenantId: string,
    @Query('locationId') locationId?: string,
  ): Promise<{ report: string }> {
    const report = await this.zReportService.generateZReport(tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    return { report };
  }

  /**
   * POST /restaurant/z-report/close — Legacy: close shift and generate Z-Report
   */
  @Post('restaurant/z-report/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'REQ-POSR-007: Close shift and generate Z-Report' })
  async closeShiftLegacy(
    @Req() req: any,
    @Body() body: { locationId: string; shiftId?: string; shiftStart?: string },
    @Headers('x-tenant-id') tenantIdHeader: string,
  ): Promise<{ report: string; closedAt: string }> {
    const tenantId = tenantIdHeader || req?.headers?.['x-tenant-id'];
    const userId = req?.user?.id || '00000000-0000-0000-0000-000000000000';
    if (tenantId && body.locationId && body.shiftStart) {
      await this.restaurantService.closeShift(
        tenantId, body.locationId, userId, new Date(body.shiftStart),
      ).catch(() => {});
    }
    const report = await this.zReportService.generateZReport(tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    return { report, closedAt: new Date().toISOString() };
  }

  // ── Legacy route: kept for backward compat ────────────────────────────────

  @Post('restaurant/orders')
  @HttpCode(HttpStatus.CREATED)
  async legacyCreateOrder(@Req() req: any, @Body() payload: any) {
    const tenantId = req?.headers?.['x-tenant-id'] || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const userId = req?.user?.id || 'pos_system';
    return this.restaurantService.createOrder(tenantId, userId, payload);
  }
}
