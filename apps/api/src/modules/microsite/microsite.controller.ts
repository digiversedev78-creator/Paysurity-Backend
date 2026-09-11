import { IsString, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';
import {
  Controller,
  Query,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

// DTO for updating microsite settings
class UpdateMicrositeSettingsDto {
  @IsOptional()
  @IsString()
  heroColor?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  // Add more settings fields as needed
}

// DTO for creating a new menu item
class CreateMicrositeMenuItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @IsOptional()
  @IsString()
  category?: string;
}

// DTO for updating an existing menu item
class UpdateMicrositeMenuItemDto {
  // All fields are optional for an update
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
  
  @IsOptional()
  @IsString()
  category?: string;
}

@Injectable()
class MicrositeService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  private readonly PROCESSING_FEE_PCT = 0.05; // System-wide processing fee

  /**
   * Fetches the tenant-specific pricing configuration, specifically margin_pct.
   * Defaults to 0.20 if not found.
   * @param tenantId The ID of the tenant.
   * @returns An object containing marginPct.
   */
  private async getTenantPricingConfig(tenantId: string): Promise<{ marginPct: number }> {
    try {
      const result = await (this.db as any).execute('SELECT margin_pct FROM price_engine_config WHERE tenant_id = $1', [tenantId]);
      if ((result as any).rows.length > 0) {
        return { marginPct: (result as any).rows[0].margin_pct };
      }
      return { marginPct: 0.20 }; // Default margin if no specific config is found
    } catch (error) {
      console.error('Error fetching tenant pricing config:', error);
      throw new InternalServerErrorException('Failed to retrieve tenant pricing configuration.');
    }
  }

  /**
   * Calculates the display price based on base price, processing fee, and tenant-specific margin.
   * displayPrice = basePrice * (1 + processingFeePct) * (1 + marginPct)
   * @param basePrice The base price of the item.
   * @param marginPct The tenant's margin percentage.
   * @returns The calculated display price.
   */
  private calculateDisplayPrice(basePrice: number, marginPct: number): number {
    return parseFloat((basePrice * (1 + this.PROCESSING_FEE_PCT) * (1 + marginPct)).toFixed(2));
  }

  /**
   * Retrieves microsite settings for a given tenant.
   * @param tenantId The ID of the tenant.
   * @returns The microsite settings.
   * @throws NotFoundException if settings are not found.
   */
  async getMicrositeSettings(tenantId: string) {
    const result = await (this.db as any).execute('SELECT * FROM microsite_settings WHERE tenant_id = $1', [tenantId]);
    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Microsite settings not found for tenant ${tenantId}`);
    }
    return (result as any).rows[0];
  }

  /**
   * Retrieves microsite settings using a public slug identifier.
   */
  async getSettingsBySlug(slug: string) {
    const result = await (this.db as any).execute('SELECT * FROM microsite_settings WHERE slug = $1', [slug]);
    if ((result as any).rows.length === 0) {
      // Fallback: Check if slug is just the tenant string
      const fb = await (this.db as any).execute('SELECT * FROM microsite_settings WHERE tenant_id = $1', [slug]);
      if ((fb as any).rows.length === 0) throw new NotFoundException(`Microsite not found for slug ${slug}`);
      return (fb as any).rows[0];
    }
    return (result as any).rows[0];
  }

  /**
   * Updates microsite settings for a given tenant.
   * @param tenantId The ID of the tenant.
   * @param settingsDto The DTO containing fields to update.
   * @returns The updated microsite settings.
   * @throws BadRequestException if no fields are provided for update.
   * @throws NotFoundException if settings for the tenant cannot be found.
   */
  async updateMicrositeSettings(tenantId: string, settingsDto: UpdateMicrositeSettingsDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Dynamically build SET clause for the SQL query
    if ((settingsDto as any).heroColor !== undefined) {
      fields.push(`hero_color = $${paramIndex++}`);
      values.push((settingsDto as any).heroColor);
    }
    if ((settingsDto as any).description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push((settingsDto as any).description);
    }
    if ((settingsDto as any).logoUrl !== undefined) {
      fields.push(`logo_url = $${paramIndex++}`);
      values.push((settingsDto as any).logoUrl);
    }
    
    // Add other updateable fields here following the pattern

    if (fields.length === 0) {
      throw new BadRequestException('No fields provided for update.');
    }

    values.push(tenantId); // Tenant ID is the last parameter in the WHERE clause

    const query = `
      UPDATE microsite_settings
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE tenant_id = $${paramIndex}
      RETURNING *;
    `;

    const result = await (this.db as any).execute(query, values);

    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Microsite settings not found for tenant ${tenantId} to update.`);
    }
    return (result as any).rows[0];
  }

  /**
   * Retrieves the full menu with display prices for a given tenant.
   * @param tenantId The ID of the tenant.
   * @returns An array of menu items.
   */
  async getMicrositeMenu(tenantId: string) {
    const result = await (this.db as any).execute('SELECT * FROM menu_items WHERE tenant_id = $1 ORDER BY name', [tenantId]);
    return (result as any).rows;
  }

  /**
   * Public sovereign catalog â€” reads directly from microsite_menu_items.
   * Supports ?tenant=grandtobacco slug or raw UUID.
   * Returns age_restricted so the UI can enforce ZKP gate.
   */
  async getPublicCatalog(tenantSlug: string) {
    // Accept full UUID or well-known slug mapping
    const knownSlugs: Record<string, string> = {
      'grandtobacco': 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      'houseofbiryani': 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'tawakkul': 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    };
    const tenantId = knownSlugs[tenantSlug] ?? tenantSlug;

    const result = await (this.db as any).execute(
      `SELECT
         m.id, m.tenant_id, m.name, m.description,
         m.base_price, m.display_price, m.category,
         COALESCE(r.age_restricted, false) AS age_restricted
       FROM microsite_menu_items m
       LEFT JOIN retail_items r ON r.id = m.id
       WHERE m.tenant_id = $1
       ORDER BY m.category, m.name`,
      [tenantId]
    );
    return (result as any).rows;
  }

  /**
   * Creates a new menu item for a given tenant, calculating the display price.
   * @param tenantId The ID of the tenant.
   * @param createDto The DTO containing menu item details.
   * @returns The newly created menu item.
   */
  async createMenuItem(tenantId: string, createDto: CreateMicrositeMenuItemDto) {
    const { name, description, basePrice, imageUrl, category } = createDto;

    // Fetch tenant-specific margin for price calculation
    const { marginPct } = await this.getTenantPricingConfig(tenantId);
    const displayPrice = this.calculateDisplayPrice(basePrice, marginPct);

    const result = await (this.db as any).execute(
      `INSERT INTO menu_items (tenant_id, name, description, base_price, display_price, image_url, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *;`,
      [tenantId, name, description, basePrice, displayPrice, imageUrl, category]
    );

    return (result as any).rows[0];
  }

  /**
   * Updates an existing menu item for a given tenant, recalculating the display price if base price changes.
   * @param tenantId The ID of the tenant.
   * @param itemId The ID of the menu item to update.
   * @param updateDto The DTO containing fields to update.
   * @returns The updated menu item.
   * @throws BadRequestException if no fields are provided for update.
   * @throws NotFoundException if the menu item is not found or does not belong to the tenant.
   */
  async updateMenuItem(tenantId: string, itemId: string, updateDto: UpdateMicrositeMenuItemDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Fetch existing item to validate ownership and get current base_price for calculation
    const existingItemResult = await (this.db as any).execute('SELECT base_price FROM menu_items WHERE id = $1 AND tenant_id = $2', [itemId, tenantId]);
    if ((existingItemResult as any).rows.length === 0) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found for tenant ${tenantId}.`);
    }

    let currentBasePrice = (existingItemResult as any).rows[0].base_price;
    let basePriceUpdated = false;

    if ((updateDto as any).name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push((updateDto as any).name);
    }
    if ((updateDto as any).description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push((updateDto as any).description);
    }
    if ((updateDto as any).basePrice !== undefined) {
      fields.push(`base_price = $${paramIndex++}`);
      values.push((updateDto as any).basePrice);
      currentBasePrice = (updateDto as any).basePrice; // Use the new basePrice for displayPrice calculation
      basePriceUpdated = true;
    }
    if ((updateDto as any).imageUrl !== undefined) {
      fields.push(`image_url = $${paramIndex++}`);
      values.push((updateDto as any).imageUrl);
    }
    if ((updateDto as any).category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push((updateDto as any).category);
    }

    if (fields.length === 0 && !basePriceUpdated) {
      throw new BadRequestException('No fields provided for update.');
    }

    // Recalculate displayPrice regardless if basePrice changed or not,
    // to ensure it reflects current pricing configuration (e.g., if marginPct changed globally).
    const { marginPct } = await this.getTenantPricingConfig(tenantId);
    const newDisplayPrice = this.calculateDisplayPrice(currentBasePrice, marginPct);

    // Always update display_price and updated_at
    fields.push(`display_price = $${paramIndex++}`);
    values.push(newDisplayPrice);
    fields.push(`updated_at = NOW()`); // NOW() does not require a parameter index as it's a function call

    values.push(itemId); // Item ID for WHERE clause
    values.push(tenantId); // Tenant ID for WHERE clause

    const query = `
      UPDATE menu_items
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
      RETURNING *;
    `;

    const result = await (this.db as any).execute(query, values);

    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found or does not belong to tenant ${tenantId}.`);
    }
    return (result as any).rows[0];
  }

  /**
   * Deletes a menu item for a given tenant.
   * @param tenantId The ID of the tenant.
   * @param itemId The ID of the menu item to delete.
   * @returns An object indicating deletion success.
   * @throws NotFoundException if the menu item is not found or does not belong to the tenant.
   */
  async deleteMenuItem(tenantId: string, itemId: string) {
    const result = await (this.db as any).execute('DELETE FROM menu_items WHERE id = $1 AND tenant_id = $2 RETURNING id', [itemId, tenantId]);
    if ((result as any).rows.length === 0) {
      throw new NotFoundException(`Menu item with ID ${itemId} not found or does not belong to tenant ${tenantId}.`);
    }
    return { id: itemId, deleted: true };
  }

  /**
   * Triggers a synchronization process between POS and microsite for the tenant.
   * This is a placeholder for actual integration logic.
   * @param tenantId The ID of the tenant.
   * @returns A status object for the sync operation.
   */
  async syncPos(tenantId: string) {
    console.log(`Microsite POS sync triggered for tenant: ${tenantId}`);
    // In a real application, this would involve:
    // 1. Publishing an event to a message queue (e.g., Kafka, RabbitMQ).
    // 2. Calling an internal microservice responsible for POS integration.
    // 3. Directly interacting with an external POS API.
    
    // Simulate an asynchronous operation
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return { status: 'POS sync process initiated', tenantId, timestamp: new Date().toISOString() };
  }

  /**
   * Retrieves analytics data for the microsite of a given tenant.
   * @param tenantId The ID of the tenant.
   * @returns An array of analytics data entries.
   */
  async getAnalytics(tenantId: string) {
    // This assumes a 'microsite_analytics' table with relevant data
    const result = await (this.db as any).execute('SELECT * FROM microsite_analytics WHERE tenant_id = $1 ORDER BY date DESC', [tenantId]);
    return (result as any).rows;
  }
}

// Define a custom interface for the authenticated request to get tenantId
type AuthenticatedRequest = any;

@Controller('microsite')
// Apply global validation pipe to the controller
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
class MicrositeController {
  constructor(private readonly micrositeService: MicrositeService) {}

  /**
   * Extracts the tenantId from the request object.
   * @param req The authenticated request object.
   * @returns The tenantId.
   * @throws BadRequestException if tenantId is not found.
   */
  private getTenantId(req: AuthenticatedRequest): string {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context. Authentication middleware missing or failed.');
    }
    return tenantId;
  }

  /**
   * GET /api/microsite/settings
   * Retrieves microsite configuration for the current tenant or by public slug.
   */
  @Get('settings')
  @HttpCode(HttpStatus.OK)
  async getMicrositeSettings(@Req() req: AuthenticatedRequest, @Query('slug') slug?: string) {
    if (slug) {
      // Public access using slug
      const data = await (this.micrositeService as any).getSettingsBySlug(slug);
      return { success: true, data };
    }
    // Secure tenant extraction if no slug presented
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).getMicrositeSettings(tenantId);
    return { success: true, data };
  }

  /**
   * PUT /api/microsite/settings
   * Updates microsite settings (hero color, description, etc.) for the current tenant.
   */
  @Put('settings')
  @HttpCode(HttpStatus.OK)
  async updateMicrositeSettings(@Req() req: AuthenticatedRequest, @Body() updateDto: UpdateMicrositeSettingsDto) {
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).updateMicrositeSettings(tenantId, updateDto);
    return { success: true, data };
  }

  /**
   * GET /api/microsite/menu
   * Retrieves the full menu with display prices calculated for the current tenant or by public slug.
   */
  @Get('menu')
  @HttpCode(HttpStatus.OK)
  async getMicrositeMenu(@Req() req: AuthenticatedRequest, @Query('slug') slug?: string) {
    if (slug) {
      // First fetch settings by slug to resolve the tenant ID
      const settings = await (this.micrositeService as any).getSettingsBySlug(slug);
      const data = await (this.micrositeService as any).getMicrositeMenu(settings.tenant_id);
      return { success: true, data };
    }
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).getMicrositeMenu(tenantId);
    return { success: true, data };
  }

  /**
   * GET /api/microsite/items?tenant=grandtobacco
   * Sovereign public catalog endpoint â€” no auth required.
   * Used by the Grand Tobacco Hub microsite to fetch live DB items.
   * Returns age_restricted flag for ZKP gate enforcement on the frontend.
   */
  @Get('items')
  @HttpCode(HttpStatus.OK)
  async getPublicCatalog(@Query('tenant') tenant: string) {
    if (!tenant) throw new BadRequestException('tenant query param is required');
    const data = await (this.micrositeService as any).getPublicCatalog(tenant);
    return { success: true, count: data.length, data };
  }

  /**
   * POST /api/microsite/menu-items
   * Creates a new menu item, storing base_price and calculating display_price.
   */
  @Post('menu-items')
  @HttpCode(HttpStatus.CREATED) // HTTP 201 for resource creation
  async createMenuItem(@Req() req: AuthenticatedRequest, @Body() createDto: CreateMicrositeMenuItemDto) {
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).createMenuItem(tenantId, createDto);
    return { success: true, data };
  }

  /**
   * PUT /api/microsite/menu-items/:id
   * Updates an existing menu item.
   */
  @Put('menu-items/:id')
  @HttpCode(HttpStatus.OK)
  async updateMenuItem(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string, // Validate ID as UUID
    @Body() updateDto: UpdateMicrositeMenuItemDto,
  ) {
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).updateMenuItem(tenantId, id, updateDto);
    return { success: true, data };
  }

  /**
   * DELETE /api/microsite/menu-items/:id
   * Deletes a menu item.
   */
  @Delete('menu-items/:id')
  @HttpCode(HttpStatus.OK) // Or HttpStatus.NO_CONTENT
  async deleteMenuItem(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).deleteMenuItem(tenantId, id);
    return { success: true, data };
  }

  /**
   * POST /api/microsite/sync-pos
   * Triggers a POS (Point of Sale) to microsite synchronization.
   */
  @Post('sync-pos')
  @HttpCode(HttpStatus.ACCEPTED) // HTTP 202 for accepted async operation
  async syncPos(@Req() req: AuthenticatedRequest) {
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).syncPos(tenantId);
    return { success: true, data };
  }

  /**
   * GET /api/microsite/analytics
   * Retrieves page visits and conversion statistics for the microsite.
   */
  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  async getAnalytics(@Req() req: AuthenticatedRequest) {
    const tenantId = this.getTenantId(req);
    const data = await (this.micrositeService as any).getAnalytics(tenantId);
    return { success: true, data };
  }
}






