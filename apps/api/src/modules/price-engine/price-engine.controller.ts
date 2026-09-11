import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

// Define custom Request type to include user property
type AuthenticatedRequest = any;

// DTOs for request bodies and queries
export class CalculatePriceDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @IsString()
  @IsOptional()
  tenantId?: string; // Optional if inferred from user context for specific override
}

export class OverrideTenantPricingDto {
  @IsNumber({ maxDecimalPlaces: 4 }) // Allow for higher precision for percentages
  @Min(0)
  @Max(1) // Assuming marginPct is a fraction (e.g., 0.20 for 20%)
  marginPct: number;
}

export class PricePreviewQueryDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;
}

// Service layer
export class PriceEngineService {
  private readonly DEFAULT_MARGIN_PCT = 0.20; // 20%
  private readonly DEFAULT_PROCESSING_FEE_PCT = 0.05; // 5%

  constructor(@Inject('DATABASE') private readonly db: any) { }

  private async getDefaultConfig() {
    return {
      marginPct: this.DEFAULT_MARGIN_PCT,
      processingFeePct: this.DEFAULT_PROCESSING_FEE_PCT,
    };
  }

  async getConfig(tenantId: string) {
    if (!tenantId) {
      // If no tenantId is provided (e.g., for a general unauthenticated request),
      // we can return defaults, or throw an error if config is always tenant-specific.
      // Given the 'preview' endpoint might be generic, returning defaults makes sense here.
      return this.getDefaultConfig();
    }

    // Attempt to fetch tenant-specific config from the database
    // Using parameterized raw SQL as required.
    const result = await (this.db as any).execute(
      'SELECT margin_pct, processing_fee_pct FROM price_engine_config WHERE tenant_id = $1',
      [tenantId],
    );

    if (result && (result as any).rows && (result as any).rows.length > 0) {
      const config = (result as any).rows[0];
      return {
        // Ensure values are numbers and fall back to defaults if null/undefined in DB
        marginPct: config.margin_pct !== null ? parseFloat(config.margin_pct) : this.DEFAULT_MARGIN_PCT,
        processingFeePct: config.processing_fee_pct !== null ? parseFloat(config.processing_fee_pct) : this.DEFAULT_PROCESSING_FEE_PCT,
      };
    }

    // If no tenant-specific config found, return system defaults
    return this.getDefaultConfig();
  }

  async overrideTenantMargin(tenantId: string, marginPct: number) {
    if (marginPct < 0 || marginPct > 1) {
      throw new BadRequestException('Margin percentage must be between 0 and 1 (inclusive).');
    }
    if (!tenantId) {
      throw new BadRequestException('Tenant ID must be provided to override pricing.');
    }

    try {
      // To ensure processing_fee_pct is not overwritten to null or default if it exists
      // and is not being updated by this specific admin action (which only targets margin),
      // we first retrieve the existing configuration (resolved to tenant-specific or default).
      const existingConfig = await this.getConfig(tenantId);

      // Using PostgreSQL UPSERT syntax to either insert a new config or update an existing one.
      // This query updates `margin_pct` and explicitly re-sets `processing_fee_pct` to its
      // existing value (or the default if it didn't exist) to prevent unintended changes.
      const query = `
        INSERT INTO price_engine_config (tenant_id, margin_pct, processing_fee_pct)
        VALUES ($1, $2, $3)
        ON CONFLICT (tenant_id) DO UPDATE
        SET margin_pct = EXCLUDED.margin_pct,
            processing_fee_pct = EXCLUDED.processing_fee_pct
        RETURNING tenant_id, margin_pct, processing_fee_pct;
      `;
      const result = await (this.db as any).execute(query, [
        tenantId,
        marginPct,
        existingConfig.processingFeePct, // Use the resolved existing processingFeePct
      ]);

      if (!result || !(result as any).rows || (result as any).rows.length === 0) {
        throw new BadRequestException('Failed to override tenant pricing configuration.');
      }

      const updatedConfig = (result as any).rows[0];
      return {
        tenantId: updatedConfig.tenant_id,
        marginPct: parseFloat(updatedConfig.margin_pct),
        processingFeePct: parseFloat(updatedConfig.processing_fee_pct),
      };
    } catch (error) {
      console.error('Error overriding tenant margin:', error);
      throw new BadRequestException('Failed to update tenant pricing configuration due to an internal error.');
    }
  }

  async calculatePrice(basePrice: number, tenantId: string) {
    if (basePrice < 0) {
      throw new BadRequestException('Base price cannot be negative.');
    }
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for price calculation.');
    }

    const config = await this.getConfig(tenantId);
    const { marginPct, processingFeePct } = config;

    // Price calculation: displayPrice = basePrice * (1 + processingFeePct) * (1 + marginPct)
    const priceAfterProcessingFee = basePrice * (1 + processingFeePct);
    const displayPrice = priceAfterProcessingFee * (1 + marginPct);

    // Prepare a detailed breakdown of the calculation
    const breakdown = {
      basePrice: parseFloat(basePrice.toFixed(2)),
      processingFeePct: parseFloat(processingFeePct.toFixed(4)),
      processingFeeAmount: parseFloat((basePrice * processingFeePct).toFixed(2)),
      marginPct: parseFloat(marginPct.toFixed(4)),
      marginAmount: parseFloat((priceAfterProcessingFee * marginPct).toFixed(2)),
      displayPrice: parseFloat(displayPrice.toFixed(2)), // Final price rounded to 2 decimal places
      tenantId,
    };

    return { displayPrice: breakdown.displayPrice, breakdown };
  }

  async previewPrice(basePrice: number, tenantId: string) {
    // The preview logic is identical to the calculation logic,
    // as it also provides a breakdown based on a tenant's config.
    // The tenantId here refers to the user requesting the preview.
    return this.calculatePrice(basePrice, tenantId);
  }
}

// Controller for the 'price-engine' module's public/tenant-facing endpoints
@Controller('price-engine')
export class PriceEngineController {
  constructor(private readonly priceEngineService: PriceEngineService) { }

  @Get('config')
  async getPriceConfig(@Req() req: AuthenticatedRequest) {
    // CRITICAL STRICT RULE: NEVER use @UseGuards() in controllers. Protect operations internally by validating 'const tenantId = req?.user?.tenantId'.
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Authentication required: Tenant ID not found in user context.');
    }

    const config = await (this.priceEngineService as any).getConfig(tenantId);
    return { success: true, data: config };
  }

  @Post('calculate')
  async calculatePrice(
    @Body() calculatePriceDto: CalculatePriceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { basePrice, tenantId: dtoTenantId } = calculatePriceDto;
    // Prioritize tenantId from DTO if provided (e.g., for specific calculations an authorized user might perform for another tenant)
    // otherwise, use the tenantId from the authenticated user context.
    const effectiveTenantId = dtoTenantId || req.user?.tenantId;

    if (!effectiveTenantId) {
      throw new BadRequestException('Tenant ID must be provided in the request body or user context for calculation.');
    }

    const result = await (this.priceEngineService as any).calculatePrice(
      basePrice,
      effectiveTenantId,
    );
    return { success: true, data: result };
  }

  @Get('preview')
  async previewPrice(
    @Query() query: PricePreviewQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { basePrice } = query;
    // Preview endpoint should use the requesting user's tenantId to show relevant pricing.
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Authentication required: Tenant ID not found in user context for price preview.');
    }

    const result = await (this.priceEngineService as any).previewPrice(basePrice, tenantId);
    return { success: true, data: result };
  }
}

// Controller for super admin operations on tenant pricing
// This controller uses a different base path as specified in the requirements: /api/admin/tenant-pricing
@Controller('admin/tenant-pricing')
export class AdminTenantPricingController {
  constructor(private readonly priceEngineService: PriceEngineService) { }

  @Put(':id')
  async overrideTenantPricing(
    @Param('id') tenantId: string, // The tenantId whose pricing is being overridden
    @Body() overrideDto: OverrideTenantPricingDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // CRITICAL STRICT RULE: NEVER use @UseGuards() in controllers. Protect operations internally by validating 'const tenantId = req?.user?.tenantId'.
    // Ensure the requesting user has super admin privileges
    if (!req.user?.isAdmin) {
      throw new ForbiddenException('Access denied: Only super admins can override tenant pricing configurations.');
    }
    if (!tenantId) {
      throw new BadRequestException('Target Tenant ID must be provided in the URL parameter.');
    }

    const { marginPct } = overrideDto;
    const result = await (this.priceEngineService as any).overrideTenantMargin(
      tenantId,
      marginPct,
    );
    return { success: true, data: result };
  }
}





