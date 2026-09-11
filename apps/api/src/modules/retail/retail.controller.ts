import { Controller, Get, Post, Body, Req, Query, Param } from '@nestjs/common';
import { RetailService } from './retail.service';
import { InventoryService } from './inventory.service';

const ASHIANA_TENANT_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

@Controller('retail')
export class RetailController {
  constructor(
    private readonly retailService: RetailService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Get('products')
  async getProducts(@Req() req: any) {
    const tenantId = req?.headers?.['x-tenant-id'] || req?.user?.tenantId || 'retailpro';
    return (this.retailService as any).getProducts(tenantId);
  }

  @Post('orders')
  async createOrder(@Req() req: any, @Body() payload: any) {
    const tenantId = req?.headers?.['x-tenant-id'] || req?.user?.tenantId || 'retailpro';
    const userId = req?.user?.id || 'pos_system';
    return (this.retailService as any).createOrder(tenantId, userId, payload);
  }

  /**
   * GET /api/retail/apparel?tenant=<id>&fabric=Silk&season=Fall%2FWinter&category=Bridal+Wear
   *
   * Sovereign public apparel catalog with variant hydration.
   * Returns items joined with retail_apparel_attributes:
   *   - variants[]         (full size Ã— color matrix per item)
   *   - available_sizes[]  (DB-derived ARRAY_AGG â€” drives Size <select> on frontend)
   *   - available_colors[] (DB-derived ARRAY_AGG â€” drives Color <select> on frontend)
   */
  @Get('apparel')
  async getApparelCatalog(
    @Query('tenant')      tenantParam?: string,
    @Query('fabric')      fabric?: string,
    @Query('season')      season?: string,
    @Query('size')        size?: string,
    @Query('color')       color?: string,
    @Query('category')    category?: string,
    @Query('bridal_wear') bridalWear?: string,
  ) {
    const tenantId = tenantParam ?? ASHIANA_TENANT_ID;
    const bridal_wear =
      bridalWear === 'true' ? true : bridalWear === 'false' ? false : undefined;
    const data = await (this.inventoryService as any).getApparelCatalog(tenantId, {
      fabric, season, size, color, category, bridal_wear,
    });
    return { success: true, count: data.length, data };
  }

  /**
   * GET /api/retail/apparel/:id?tenant=<id>
   * Single item with full variant hydration.
   */
  @Get('apparel/:id')
  async getApparelItem(
    @Param('id')     itemId: string,
    @Query('tenant') tenantParam?: string,
  ) {
    const tenantId = tenantParam ?? ASHIANA_TENANT_ID;
    const data = await (this.inventoryService as any).getApparelItem(tenantId, itemId);
    return { success: true, data };
  }
}

