import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

// DTOs
class MicrositeSettingsDto {
  heroColor: string;
  description: string;
  processingFeePct: number; // Stored in settings
}

class CreateMenuItemDto {
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  orderIndex?: number;
}

class UpdateMenuItemDto {
  name?: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  orderIndex?: number;
}

class AnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class MicrositeService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  private async getTenantPricingConfig(tenantId: string): Promise<{ processingFeePct: number; marginPct: number }> {
    // Fetch processingFeePct from microsite_settings
    const settingsRows = await (this.db as any).execute(
      'SELECT processing_fee_pct FROM microsite_settings WHERE tenant_id = $1',
      [tenantId],
    );
    const processingFeePct = settingsRows?.[0]?.processing_fee_pct ?? 0.05; // Default 0.05

    // Fetch marginPct from price_engine_config
    const pricingRows = await (this.db as any).execute(
      'SELECT margin_pct FROM price_engine_config WHERE tenant_id = $1',
      [tenantId],
    );
    const marginPct = pricingRows?.[0]?.margin_pct ?? 0.20; // Default 0.20

    return { processingFeePct, marginPct };
  }

  private calculateDisplayPrice(basePrice: number, processingFeePct: number, marginPct: number): number {
    return parseFloat((basePrice * (1 + processingFeePct) * (1 + marginPct)).toFixed(2));
  }

  async getMicrositeSettings(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    const rows = await (this.db as any).execute(
      'SELECT hero_color AS "heroColor", description, processing_fee_pct AS "processingFeePct", last_pos_sync_at AS "lastPosSyncAt" FROM microsite_settings WHERE tenant_id = $1',
      [tenantId],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Microsite settings not found for tenant ${tenantId}`);
    }

    return { success: true, data: rows[0] };
  }

  async updateMicrositeSettings(tenantId: string, settings: MicrositeSettingsDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    const { heroColor, description, processingFeePct } = settings;

    let query = 'UPDATE microsite_settings SET ';
    const params: (string | number)[] = [];
    const fields: string[] = [];
    let paramIndex = 1;

    if (heroColor !== undefined) {
      fields.push(`hero_color = $${paramIndex++}`);
      params.push(heroColor);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (processingFeePct !== undefined) {
      fields.push(`processing_fee_pct = $${paramIndex++}`);
      params.push(processingFeePct);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields provided for update.');
    }

    query += fields.join(', ') + ` WHERE tenant_id = $${paramIndex} RETURNING hero_color AS "heroColor", description, processing_fee_pct AS "processingFeePct", last_pos_sync_at AS "lastPosSyncAt"`;
    params.push(tenantId);

    const result = await (this.db as any).execute(query, params);

    if (result.length === 0) {
      // If no row was updated, it means settings didn't exist, so insert them
      const insertQuery = `INSERT INTO microsite_settings (tenant_id, hero_color, description, processing_fee_pct) VALUES ($1, $2, $3, $4)
                           RETURNING hero_color AS "heroColor", description, processing_fee_pct AS "processingFeePct", last_pos_sync_at AS "lastPosSyncAt"`;
      const insertResult = await (this.db as any).execute(insertQuery, [tenantId, heroColor ?? null, description ?? null, processingFeePct ?? 0.05]);
      return { success: true, data: insertResult[0] };
    }

    return { success: true, data: result[0] };
  }

  async getMicrositeMenu(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    const { processingFeePct, marginPct } = await this.getTenantPricingConfig(tenantId);

    const rows = await (this.db as any).execute(
      'SELECT id, name, description, base_price AS "basePrice", image_url AS "imageUrl", order_index AS "orderIndex" FROM microsite_menu_items WHERE tenant_id = $1 ORDER BY order_index ASC',
      [tenantId],
    );

    const menuItemsWithDisplayPrice = rows.map((item: any) => ({
      ...item,
      displayPrice: this.calculateDisplayPrice(item.basePrice, processingFeePct, marginPct),
    }));

    return { success: true, data: menuItemsWithDisplayPrice };
  }

  async createMenuItem(tenantId: string, item: CreateMenuItemDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    const { name, description, basePrice, imageUrl, orderIndex } = item;

    if (basePrice === undefined || basePrice < 0) {
      throw new BadRequestException('Base price is required and must be non-negative.');
    }

    const { processingFeePct, marginPct } = await this.getTenantPricingConfig(tenantId);
    const displayPrice = this.calculateDisplayPrice(basePrice, processingFeePct, marginPct);

    const result = await (this.db as any).execute(
      'INSERT INTO microsite_menu_items (tenant_id, name, description, base_price, display_price, image_url, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, description, base_price AS "basePrice", display_price AS "displayPrice", image_url AS "imageUrl", order_index AS "orderIndex"',
      [tenantId, name, description, basePrice, displayPrice, imageUrl, orderIndex],
    );

    return { success: true, data: result[0] };
  }

  async updateMenuItem(tenantId: string, id: string, item: UpdateMenuItemDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    if (!id) {
      throw new BadRequestException('Menu item ID is required.');
    }

    const currentItemRows = await (this.db as any).execute(
      'SELECT base_price FROM microsite_menu_items WHERE id = $1 AND tenant_id = $2',
      [id, tenantId],
    );

    if (currentItemRows.length === 0) {
      throw new NotFoundException(`Menu item with ID ${id} not found for tenant ${tenantId}`);
    }

    const { name, description, basePrice, imageUrl, orderIndex } = item;
    let query = 'UPDATE microsite_menu_items SET ';
    const params: (string | number | undefined)[] = [];
    const fields: string[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (basePrice !== undefined) {
      if (basePrice < 0) {
        throw new BadRequestException('Base price must be non-negative.');
      }
      fields.push(`base_price = $${paramIndex++}`);
      params.push(basePrice);

      // Recalculate display_price if basePrice is updated
      const { processingFeePct, marginPct } = await this.getTenantPricingConfig(tenantId);
      const newDisplayPrice = this.calculateDisplayPrice(basePrice, processingFeePct, marginPct);
      fields.push(`display_price = $${paramIndex++}`);
      params.push(newDisplayPrice);
    }
    if (imageUrl !== undefined) {
      fields.push(`image_url = $${paramIndex++}`);
      params.push(imageUrl);
    }
    if (orderIndex !== undefined) {
      fields.push(`order_index = $${paramIndex++}`);
      params.push(orderIndex);
    }

    if (fields.length === 0) {
      throw new BadRequestException('No fields provided for update.');
    }

    query += fields.join(', ') + ` WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} RETURNING id, name, description, base_price AS "basePrice", display_price AS "displayPrice", image_url AS "imageUrl", order_index AS "orderIndex"`;
    params.push(id, tenantId);

    const result = await (this.db as any).execute(query, params);

    if (result.length === 0) {
      throw new NotFoundException(`Menu item with ID ${id} not found for tenant ${tenantId}`);
    }

    return { success: true, data: result[0] };
  }

  async deleteMenuItem(tenantId: string, id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    if (!id) {
      throw new BadRequestException('Menu item ID is required.');
    }

    const result = await (this.db as any).execute(
      'DELETE FROM microsite_menu_items WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Menu item with ID ${id} not found for tenant ${tenantId}`);
    }

    return { success: true, message: `Menu item ${id} deleted successfully.` };
  }

  async syncPos(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    // Simulate a POS sync operation
    // In a real application, this would trigger an external service call, a message queue event, etc.
    // For this exercise, we'll update a 'last_pos_sync_at' timestamp.
    const result = await (this.db as any).execute(
      'UPDATE microsite_settings SET last_pos_sync_at = NOW() WHERE tenant_id = $1 RETURNING last_pos_sync_at AS "lastPosSyncAt"',
      [tenantId],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Microsite settings not found for tenant ${tenantId}. Cannot record sync time.`);
    }

    return { success: true, message: 'POS sync triggered successfully.', data: result[0] };
  }

  async getAnalytics(tenantId: string, query: AnalyticsQueryDto) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required.');
    }
    // For this example, we'll return mock analytics data.
    // In a real scenario, this would query a dedicated analytics table.
    const { startDate, endDate } = query;

    // Example raw SQL structure for analytics, assuming `microsite_analytics` table
    /*
    const rows = await (this.db as any).execute(
      'SELECT visits, conversions, conversion_rate FROM microsite_analytics WHERE tenant_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date ASC',
      [tenantId, startDate, endDate],
    );
    */

    // Mock data for demonstration
    const mockData = {
      pageVisits: Math.floor(Math.random() * 1000) + 100,
      menuViews: Math.floor(Math.random() * 800) + 50,
      conversionRate: parseFloat((Math.random() * 0.15 + 0.02).toFixed(4)), // 2-17%
      totalOrders: Math.floor(Math.random() * 50) + 5,
      revenue: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
      startDate: startDate || '2023-01-01',
      endDate: endDate || '2023-12-31',
      // ... more granular data if needed
    };

    return { success: true, data: mockData };
  }
}

@Controller('microsite')
export class MicrositeController {
  constructor(private readonly micrositeService: MicrositeService) {}

  private getTenantId(req: Request): string {
    const tenantId = (req as any)?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request. User authentication is required.');
    }
    return tenantId;
  }

  @Get('settings')
  async getSettings(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).getMicrositeSettings(tenantId);
  }

  @Put('settings')
  async updateSettings(@Req() req: Request, @Body() settingsDto: MicrositeSettingsDto) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).updateMicrositeSettings(tenantId, settingsDto);
  }

  @Get('menu')
  async getMenu(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).getMicrositeMenu(tenantId);
  }

  @Post('menu-items')
  async createMenuItem(@Req() req: Request, @Body() createItemDto: CreateMenuItemDto) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).createMenuItem(tenantId, createItemDto);
  }

  @Put('menu-items/:id')
  async updateMenuItem(@Req() req: Request, @Param('id') id: string, @Body() updateItemDto: UpdateMenuItemDto) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).updateMenuItem(tenantId, id, updateItemDto);
  }

  @Delete('menu-items/:id')
  async deleteMenuItem(@Req() req: Request, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).deleteMenuItem(tenantId, id);
  }

  @Post('sync-pos')
  async syncPos(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).syncPos(tenantId);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: Request, @Body() analyticsQueryDto: AnalyticsQueryDto) { // Using Body for consistency, but typically GET uses Query
    const tenantId = this.getTenantId(req);
    return (this.micrositeService as any).getAnalytics(tenantId, analyticsQueryDto);
  }
}

