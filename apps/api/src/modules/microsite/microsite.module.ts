import { Body, Controller, Delete, Get, Param, Post, Put, Req, HttpCode, Injectable, Inject, NotFoundException, BadRequestException, Module, OnModuleInit } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// DTOs
export class UpdateMicrositeSettingsDto {
  heroColor?: string;
  description?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export class CreateMicrositeMenuItemDto {
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class UpdateMicrositeMenuItemDto {
  name?: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export class MenuItemResponseDto {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    basePrice: number;
    displayPrice: number;
    imageUrl: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Service
@Injectable()
export class MicrositeService implements OnModuleInit {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async onModuleInit() {
    console.log('[MicrositeModule] Executing auto-migrations for schema...');
    try {
      // â”€â”€ Schema DDL (always idempotent) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      await (this.db as any).execute(sql`
        CREATE TABLE IF NOT EXISTS price_engine_config (
          tenant_id VARCHAR(255) PRIMARY KEY,
          margin_pct NUMERIC(5,4) DEFAULT 0.20
        );
        CREATE TABLE IF NOT EXISTS microsite_settings (
          tenant_id VARCHAR(255) PRIMARY KEY,
          hero_color VARCHAR(50) DEFAULT '#FFFFFF',
          description TEXT DEFAULT '',
          logo_url VARCHAR(255),
          contact_email VARCHAR(255),
          contact_phone VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS microsite_menu_items (
          id UUID PRIMARY KEY,
          tenant_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          base_price NUMERIC(10,2) NOT NULL,
          display_price NUMERIC(10,2) NOT NULL,
          image_url VARCHAR(255),
          category VARCHAR(100) DEFAULT 'Main',
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='microsite_menu_items' AND column_name='category'
          ) THEN
            ALTER TABLE microsite_menu_items ADD COLUMN category VARCHAR(100) DEFAULT 'Main';
          END IF;
        END $$;
      `);

      // â”€â”€ Seed real menu data from SQL file â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const seedFile = path.join(__dirname, '..', '..', 'scripts', 'seed-hob-menu.sql');
      if (fs.existsSync(seedFile)) {
        const seedSql = fs.readFileSync(seedFile, 'utf8');
        await (this.db as any).execute(sql.raw(seedSql));
        console.log('[MicrositeModule] House of Biryani real menu seeded from seed-hob-menu.sql');
      } else {
        console.warn('[MicrositeModule] seed-hob-menu.sql not found at', seedFile);
      }

      console.log('[MicrositeModule] Auto-migrations and seeding executed.');
    } catch (e) {
      console.error('[MicrositeModule] Critical auto-migration failure:', e);
    }
  }


  private readonly PROCESSING_FEE_PCT = 0.05; // 5%

  private async getTenantMarginPct(tenantId: string): Promise<number> {
    const result = await (this.db as any).execute(
      sql`SELECT margin_pct FROM price_engine_config WHERE tenant_id = ${tenantId}`
    );
    if (result && result.length > 0 && result[0].margin_pct !== undefined) {
      return parseFloat(result[0].margin_pct); // Ensure it's a number
    }
    return 0.20; // Default margin
  }

  private async calculateDisplayPrice(basePrice: number, tenantId: string): Promise<number> {
    const marginPct = await this.getTenantMarginPct(tenantId);
    // Ensure calculation is robust for potential floating point issues in JS
    return parseFloat((basePrice * (1 + this.PROCESSING_FEE_PCT) * (1 + marginPct)).toFixed(2));
  }

  // Microsite Settings
  async getMicrositeSettings(tenantId: string) {
    const result = await (this.db as any).execute(
      sql`SELECT hero_color AS "heroColor", description, logo_url AS "logoUrl", contact_email AS "contactEmail", contact_phone AS "contactPhone" FROM microsite_settings WHERE tenant_id = ${tenantId}`
    );
    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      // Return default settings if none found for the tenant
      return {
          heroColor: '#FFFFFF',
          description: '',
          logoUrl: null,
          contactEmail: null,
          contactPhone: null,
      };
    }
    return (result as any).rows[0];
  }

  async updateMicrositeSettings(tenantId: string, updateDto: UpdateMicrositeSettingsDto) {
    const existingSettings = await this.getMicrositeSettings(tenantId);

    const mergedSettings = {
      heroColor: (updateDto as any).heroColor ?? existingSettings.heroColor ?? '#FFFFFF',
      description: (updateDto as any).description ?? existingSettings.description ?? '',
      logoUrl: (updateDto as any).logoUrl ?? existingSettings.logoUrl ?? null,
      contactEmail: (updateDto as any).contactEmail ?? existingSettings.contactEmail ?? null,
      contactPhone: (updateDto as any).contactPhone ?? existingSettings.contactPhone ?? null,
    };

    const result = await (this.db as any).execute(sql`
      INSERT INTO microsite_settings (tenant_id, hero_color, description, logo_url, contact_email, contact_phone)
      VALUES (${tenantId}, ${mergedSettings.heroColor}, ${mergedSettings.description}, ${mergedSettings.logoUrl}, ${mergedSettings.contactEmail}, ${mergedSettings.contactPhone})
      ON CONFLICT (tenant_id) DO UPDATE SET
        hero_color = EXCLUDED.hero_color,
        description = EXCLUDED.description,
        logo_url = EXCLUDED.logo_url,
        contact_email = EXCLUDED.contact_email,
        contact_phone = EXCLUDED.contact_phone,
        updated_at = NOW()
      RETURNING hero_color AS "heroColor", description, logo_url AS "logoUrl", contact_email AS "contactEmail", contact_phone AS "contactPhone", updated_at AS "updatedAt"
    `);

    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      throw new BadRequestException('Failed to update microsite settings.');
    }
    return (result as any).rows[0];
  }

  // Microsite Menu Items
  async getMicrositeMenu(tenantId: string): Promise<MenuItemResponseDto[]> {
    const result = await (this.db as any).execute(
      sql`SELECT id, tenant_id AS "tenantId", name, description, base_price AS "basePrice", display_price AS "displayPrice", image_url AS "imageUrl", category, display_order AS "displayOrder", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt" FROM microsite_menu_items WHERE tenant_id = ${tenantId} AND is_active = true ORDER BY display_order ASC`
    );
    return (result as any).rows || [];
  }

  async createMicrositeMenuItem(tenantId: string, createDto: CreateMicrositeMenuItemDto): Promise<MenuItemResponseDto> {
    const displayPrice = await this.calculateDisplayPrice((createDto as any).basePrice, tenantId);
    const newItemId = uuidv4();

    const result = await (this.db as any).execute(sql`
       INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, display_order, is_active)
       VALUES (${newItemId}, ${tenantId}, ${(createDto as any).name}, ${(createDto as any).description}, ${(createDto as any).basePrice}, ${displayPrice}, ${(createDto as any).imageUrl || null}, ${(createDto as any).displayOrder || 0}, ${(createDto as any).isActive ?? true})
       RETURNING id, tenant_id AS "tenantId", name, description, base_price AS "basePrice", display_price AS "displayPrice", image_url AS "imageUrl", display_order AS "displayOrder", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
    `);

    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      throw new BadRequestException('Failed to create menu item.');
    }
    return (result as any).rows[0];
  }

  async updateMicrositeMenuItem(tenantId: string, id: string, updateDto: UpdateMicrositeMenuItemDto): Promise<MenuItemResponseDto> {
    const existingItemResult = await (this.db as any).execute(
      sql`SELECT base_price AS "basePrice" FROM microsite_menu_items WHERE id = ${id} AND tenant_id = ${tenantId}`
    );

    if (!existingItemResult || existingItemResult.length === 0) {
      throw new NotFoundException(`Menu item with ID "${id}" not found for this tenant.`);
    }

    const currentBasePrice = existingItemResult[0].basePrice;
    const basePriceForCalculation = (updateDto as any).basePrice !== undefined ? (updateDto as any).basePrice : currentBasePrice;
    const displayPrice = await this.calculateDisplayPrice(basePriceForCalculation, tenantId);

    const result = await (this.db as any).execute(sql`
      UPDATE microsite_menu_items
      SET 
        name = COALESCE(${(updateDto as any).name}, name),
        description = COALESCE(${(updateDto as any).description}, description),
        base_price = COALESCE(${(updateDto as any).basePrice}, base_price),
        image_url = COALESCE(${(updateDto as any).imageUrl}, image_url),
        display_order = COALESCE(${(updateDto as any).displayOrder}, display_order),
        is_active = COALESCE(${(updateDto as any).isActive}, is_active),
        display_price = ${displayPrice},
        updated_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId}
      RETURNING id, tenant_id AS "tenantId", name, description, base_price AS "basePrice", display_price AS "displayPrice", image_url AS "imageUrl", display_order AS "displayOrder", is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
    `);

    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      throw new BadRequestException('Failed to update menu item.');
    }
    return (result as any).rows[0];
  }

  async deleteMicrositeMenuItem(tenantId: string, id: string): Promise<void> {
    const result = await (this.db as any).execute(
      sql`DELETE FROM microsite_menu_items WHERE id = ${id} AND tenant_id = ${tenantId} RETURNING id`
    );
    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      throw new NotFoundException(`Menu item with ID "${id}" not found for this tenant or already deleted.`);
    }
  }

  // Create Public Order (Checkout)
  async createPublicOrder(tenantId: string, payload: any) {
    const orderId = uuidv4();
    const totalAmount = typeof payload.totalAmount === 'number' ? payload.totalAmount : 0;
    
    await (this.db as any).execute(sql`
      CREATE TABLE IF NOT EXISTS public_orders (
        id UUID PRIMARY KEY,
        tenant_id VARCHAR(255),
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        total_amount NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    await (this.db as any).execute(
      sql`INSERT INTO public_orders (id, tenant_id, customer_name, customer_email, total_amount)
       VALUES (${orderId}, ${tenantId}, ${payload.customerName || 'Guest Customer'}, ${payload.customerEmail || ''}, ${totalAmount})`
    );
    
    return { orderId, status: 'PENDING', totalAmount, tenantId };
  }

  // Sync POS
  async syncPosWithMicrosite(tenantId: string) {
    // In a real application, this would involve calling out to a POS system's API,
    // fetching menu items, updating inventory, prices, etc., and then updating
    // the microsite_menu_items table.
    // For this exercise, we'll simulate a successful sync.
    console.log(`Triggering POS sync for tenant: ${tenantId}`);
    // Example: fetch data from POS, transform, update DB
    // const posData = await (this.posIntegrationService as any).fetchMenu(tenantId);
    // await this.updateMicrositeMenuFromPos(tenantId, posData);
    return { status: 'Sync initiated', tenantId, timestamp: new Date() };
  }

  // Analytics
  async getMicrositeAnalytics(tenantId: string) {
    // This would typically involve querying an analytics table or service.
    // For now, let's return some mock data.
    const result = await (this.db as any).execute(
      sql`SELECT page_visits AS "pageVisits", conversion_rate AS "conversionRate", timestamp FROM microsite_analytics WHERE tenant_id = ${tenantId} ORDER BY timestamp DESC LIMIT 1`
    );

    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      return {
        tenantId,
        pageVisits: 0,
        conversionRate: 0,
        lastUpdated: new Date().toISOString(),
        message: 'No analytics data available yet.',
      };
    }
    return {
      tenantId,
      pageVisits: (result as any).rows[0].pageVisits,
      conversionRate: parseFloat((result as any).rows[0].conversionRate),
      lastUpdated: (result as any).rows[0].timestamp,
    };
  }
}

// Controller
type AuthenticatedRequest = any;

@Controller('microsite')
export class MicrositeController {
  constructor(private readonly micrositeService: MicrositeService) {}

  private getTenantId(req: AuthenticatedRequest): string {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is missing from authentication context.');
    }
    return tenantId;
  }

  @Get('settings')
  async getSettings(@Req() req: AuthenticatedRequest) {
    const tenantId = this.getTenantId(req);
    const settings = await (this.micrositeService as any).getMicrositeSettings(tenantId);
    return { success: true, data: settings };
  }

  @Put('settings')
  async updateSettings(@Req() req: AuthenticatedRequest, @Body() updateDto: UpdateMicrositeSettingsDto) {
    const tenantId = this.getTenantId(req);
    const updatedSettings = await (this.micrositeService as any).updateMicrositeSettings(tenantId, updateDto);
    return { success: true, data: updatedSettings };
  }

  @Get('menu')
  async getMenu(@Req() req: AuthenticatedRequest) {
    const tenantId = this.getTenantId(req);
    const menu = await (this.micrositeService as any).getMicrositeMenu(tenantId);
    return { success: true, data: menu };
  }

  @Post('menu-items')
  @HttpCode(201)
  async createMenuItem(@Req() req: AuthenticatedRequest, @Body() createDto: CreateMicrositeMenuItemDto) {
    const tenantId = this.getTenantId(req);
    const newItem = await (this.micrositeService as any).createMicrositeMenuItem(tenantId, createDto);
    return { success: true, data: newItem };
  }

  @Put('menu-items/:id')
  async updateMenuItem(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() updateDto: UpdateMicrositeMenuItemDto) {
    const tenantId = this.getTenantId(req);
    const updatedItem = await (this.micrositeService as any).updateMicrositeMenuItem(tenantId, id, updateDto);
    return { success: true, data: updatedItem };
  }

  @Delete('menu-items/:id')
  @HttpCode(204)
  async deleteMenuItem(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    await (this.micrositeService as any).deleteMicrositeMenuItem(tenantId, id);
    return { success: true, message: 'Menu item deleted successfully.' };
  }

  @Post('sync-pos')
  async syncPos(@Req() req: AuthenticatedRequest) {
    const tenantId = this.getTenantId(req);
    const syncResult = await (this.micrositeService as any).syncPosWithMicrosite(tenantId);
    return { success: true, data: syncResult };
  }

  @Get('analytics')
  async getAnalytics(@Req() req: AuthenticatedRequest) {
    const tenantId = this.getTenantId(req);
    const analytics = await (this.micrositeService as any).getMicrositeAnalytics(tenantId);
    return { success: true, data: analytics };
  }
}

@Controller('public/microsite')
export class PublicMicrositeController {
  private readonly slugMap: Record<string, string> = {
    'houseofbiryanirestaurant': '0f33e7e1-5474-4738-8de8-c687009f5e09',
    'house-of-biryani': '0f33e7e1-5474-4738-8de8-c687009f5e09',
    'house-of-biryani-restaurant': '0f33e7e1-5474-4738-8de8-c687009f5e09',
    'tawakkul-restaurant': 'a1000000-0000-4000-8000-000000000001',
    'tawakkul': 'a1000000-0000-4000-8000-000000000001',
    'grandtobacco': 'a1000000-0000-4000-8000-000000000003',
    'grand-tobacco-hub': 'a1000000-0000-4000-8000-000000000003',
    'ashiana': '472c9888-50e9-425e-a5d9-7a28350663a5',
    'ashiana-collections': '472c9888-50e9-425e-a5d9-7a28350663a5'
  };

  private resolveTenantId(idOrSlug: string): string {
    return this.slugMap[idOrSlug] || idOrSlug;
  }

  constructor(private readonly micrositeService: MicrositeService) {}

  @Get(':tenantId')
  async getPublicSettings(@Param('tenantId') tenantId: string) {
    const resolvedId = this.resolveTenantId(tenantId);
    const settings = await (this.micrositeService as any).getMicrositeSettings(resolvedId);
    return settings;
  }

  @Get(':tenantId/menu')
  async getPublicMenu(@Param('tenantId') tenantId: string) {
    const resolvedId = this.resolveTenantId(tenantId);
    const menu = await (this.micrositeService as any).getMicrositeMenu(resolvedId);
    return { success: true, data: menu };
  }

  @Post(':tenantId/order')
  async createPublicOrder(@Param('tenantId') tenantId: string, @Body() payload: any) {
    return await (this.micrositeService as any).createPublicOrder(tenantId, payload);
  }
}

// Module
@Module({
  controllers: [MicrositeController, PublicMicrositeController],
  providers: [MicrositeService],
  exports: [MicrositeService],
})
export class MicrositeModule {}







