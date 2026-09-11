// price-engine.module.ts
import { Module } from '@nestjs/common';
// Excised duplicate cyclic imports



// price-engine.dto.ts
import { IsNumber, IsString, Min, IsNotEmpty } from 'class-validator';

export class ConfigResponseDto {
  @IsNumber()
  marginPct: number;

  @IsNumber()
  processingFeePct: number;
}

export class CalculatePriceRequestDto {
  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsString()
  @IsNotEmpty()
  tenantId: string; // Made mandatory for calculation as per service logic
}

export class PriceBreakdownDto {
  @IsNumber()
  basePrice: number;

  @IsNumber()
  processingFeeAmount: number;

  @IsNumber()
  marginAmount: number;

  @IsNumber()
  displayPrice: number;
}

export class CalculatePriceResponseDto {
  @IsNumber()
  displayPrice: number;

  breakdown: PriceBreakdownDto;
}

export class PreviewPriceResponseDto extends CalculatePriceResponseDto { }

export class OverrideTenantMarginRequestDto {
  @IsNumber()
  @Min(0)
  marginPct: number;
}

// price-engine.service.ts
import { Inject, Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
// Excised duplicate cyclic DTO imports
const DEFAULT_MARGIN_PCT = 0.20; // 20%
const DEFAULT_PROCESSING_FEE_PCT = 0.05; // 5%

interface PriceConfig {
  marginPct: number;
  processingFeePct: number;
}

interface UserRequest {
  user?: {
    tenantId?: string;
    isSuperAdmin?: boolean;
    // other user properties
  };
}

@Injectable()
export class PriceEngineService {
  constructor(@Inject('DATABASE') private readonly db: any) { }

  private async getPriceConfigFromDb(tenantId: string): Promise<PriceConfig | null> {
    try {
      const result = await (this.db as any).execute(
        'SELECT margin_pct, processing_fee_pct FROM price_engine_config WHERE tenant_id = $1',
        [tenantId],
      );
      if (result && (result as any).rows && (result as any).rows.length > 0) {
        const row = (result as any).rows[0];
        return {
          marginPct: parseFloat(row.margin_pct),
          processingFeePct: parseFloat(row.processing_fee_pct),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching price config from DB:', error);
      throw new InternalServerErrorException('Failed to retrieve price configuration.');
    }
  }

  private async getTenantConfigOrDefault(tenantId: string): Promise<PriceConfig> {
    if (!tenantId) {
      // This should ideally be caught by validation or earlier checks
      // but provides a safe fallback or error for missing tenantId
      return {
        marginPct: DEFAULT_MARGIN_PCT,
        processingFeePct: DEFAULT_PROCESSING_FEE_PCT,
      };
    }

    const config = await this.getPriceConfigFromDb(tenantId);
    if (config) {
      return config;
    }

    return {
      marginPct: DEFAULT_MARGIN_PCT,
      processingFeePct: DEFAULT_PROCESSING_FEE_PCT,
    };
  }

  public async getConfigForTenant(req: UserRequest): Promise<ConfigResponseDto> {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context.');
    }

    const config = await this.getTenantConfigOrDefault(tenantId);
    return {
      marginPct: config.marginPct,
      processingFeePct: config.processingFeePct,
    };
  }

  public async overrideTenantMargin(
    tenantId: string,
    body: OverrideTenantMarginRequestDto,
    req: UserRequest, // For internal admin check
  ): Promise<void> {
    // CRITICAL STRICT RULE: NEVER use @UseGuards(). Protect operations internally.
    // Assuming 'isSuperAdmin' is populated by a prior middleware or authentication layer.
    if (!req?.user?.isSuperAdmin) {
      throw new BadRequestException('Access denied: User is not a super admin.');
    }

    const { marginPct } = body;
    if (typeof marginPct !== 'number' || marginPct < 0) {
      throw new BadRequestException('Invalid margin percentage provided.');
    }

    try {
      const existingConfig = await this.getPriceConfigFromDb(tenantId);

      if (existingConfig) {
        // Update existing config
        await (this.db as any).execute(
          'UPDATE price_engine_config SET margin_pct = $1 WHERE tenant_id = $2',
          [marginPct, tenantId],
        );
      } else {
        // Insert new config with default processing_fee_pct
        await (this.db as any).execute(
          'INSERT INTO price_engine_config (tenant_id, margin_pct, processing_fee_pct) VALUES ($1, $2, $3)',
          [tenantId, marginPct, DEFAULT_PROCESSING_FEE_PCT],
        );
      }
    } catch (error) {
      console.error('Error overriding tenant margin:', error);
      throw new InternalServerErrorException('Failed to override tenant margin.');
    }
  }

  public async calculatePrice(body: CalculatePriceRequestDto): Promise<CalculatePriceResponseDto> {
    const { basePrice, tenantId } = body;

    if (typeof basePrice !== 'number' || basePrice < 0) {
      throw new BadRequestException('Invalid base price provided.');
    }
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for price calculation.');
    }

    const config = await this.getTenantConfigOrDefault(tenantId);
    const { marginPct, processingFeePct } = config;

    // Calculation: displayPrice = basePrice * (1 + processingFeePct) * (1 + marginPct)
    const processingFeeAmount = basePrice * processingFeePct;
    const priceAfterProcessingFee = basePrice + processingFeeAmount;
    const marginAmount = priceAfterProcessingFee * marginPct;
    const displayPrice = priceAfterProcessingFee + marginAmount;

    const breakdown: PriceBreakdownDto = {
      basePrice,
      processingFeeAmount: parseFloat(processingFeeAmount.toFixed(2)),
      marginAmount: parseFloat(marginAmount.toFixed(2)),
      displayPrice: parseFloat(displayPrice.toFixed(2)),
    };

    return {
      displayPrice: parseFloat(displayPrice.toFixed(2)),
      breakdown,
    };
  }

  public async previewPrice(basePrice: number, req: UserRequest): Promise<PreviewPriceResponseDto> {
    if (typeof basePrice !== 'number' || basePrice < 0) {
      throw new BadRequestException('Invalid base price provided.');
    }

    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context for price preview.');
    }

    const config = await this.getTenantConfigOrDefault(tenantId);
    const { marginPct, processingFeePct } = config;

    // Calculation: displayPrice = basePrice * (1 + processingFeePct) * (1 + marginPct)
    const processingFeeAmount = basePrice * processingFeePct;
    const priceAfterProcessingFee = basePrice + processingFeeAmount;
    const marginAmount = priceAfterProcessingFee * marginPct;
    const displayPrice = priceAfterProcessingFee + marginAmount;

    const breakdown: PriceBreakdownDto = {
      basePrice,
      processingFeeAmount: parseFloat(processingFeeAmount.toFixed(2)),
      marginAmount: parseFloat(marginAmount.toFixed(2)),
      displayPrice: parseFloat(displayPrice.toFixed(2)),
    };

    return {
      displayPrice: parseFloat(displayPrice.toFixed(2)),
      breakdown,
    };
  }
}

// price-engine.controller.ts
import { Controller, Get, Post, Put, Body, Param, Query, Req, HttpCode, HttpStatus } from '@nestjs/common';
// Excised duplicate cyclic Service and DTO imports
import { Request } from 'express';

type CustomRequest = any;

@Controller('api') // Base path for all endpoints as per requirements
export class PriceEngineController {
  constructor(private readonly priceEngineService: PriceEngineService) { }

  @Get('price-engine/config')
  @HttpCode(HttpStatus.OK)
  async getConfig(@Req() req: CustomRequest): Promise<{ success: true; data: ConfigResponseDto }> {
    const config = await (this.priceEngineService as any).getConfigForTenant(req);
    return { success: true, data: config };
  }

  @Put('admin/tenant-pricing/:id') // This path is now relative to 'api', resulting in /api/admin/tenant-pricing/:id
  @HttpCode(HttpStatus.OK)
  async overrideTenantMargin(
    @Param('id') tenantId: string,
    @Body() body: OverrideTenantMarginRequestDto,
    @Req() req: CustomRequest,
  ): Promise<{ success: true }> {
    // Service will handle the super admin check internally as per CRITICAL STRICT RULE
    await (this.priceEngineService as any).overrideTenantMargin(tenantId, body, req);
    return { success: true };
  }

  @Post('price-engine/calculate')
  @HttpCode(HttpStatus.OK)
  async calculatePrice(
    @Body() body: CalculatePriceRequestDto,
  ): Promise<{ success: true; data: CalculatePriceResponseDto }> {
    const result = await (this.priceEngineService as any).calculatePrice(body);
    return { success: true, data: result };
  }

  @Get('price-engine/preview')
  @HttpCode(HttpStatus.OK)
  async previewPrice(
    @Query('basePrice') basePrice: number,
    @Req() req: CustomRequest,
  ): Promise<{ success: true; data: PreviewPriceResponseDto }> {
    // Convert basePrice to number, as @Query parameters are strings
    const parsedBasePrice = parseFloat(basePrice as any); // Type assertion, validation happens in service
    const result = await (this.priceEngineService as any).previewPrice(parsedBasePrice, req);
    return { success: true, data: result };
  }
}

@Module({
  controllers: [PriceEngineController],
  providers: [PriceEngineService],
  exports: [PriceEngineService],
})
export class PriceEngineModule { }





