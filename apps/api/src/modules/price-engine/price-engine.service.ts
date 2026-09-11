import { Query } from '@nestjs/common';
// src/price-engine/dtos/price-engine.dto.ts
import { IsNumber, IsUUID, IsDecimal, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PriceConfigResponseDto {
  marginPct: number;
  processingFeePct: number;
}

export class UpdateTenantPricingDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsDecimal({ decimal_digits: '0,4' }) // Allow up to 4 decimal places for percentage
  marginPct: number;
}

export class CalculatePriceDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basePrice: number;

  @IsUUID()
  tenantId: string;
}

export class PriceBreakdownDto {
  basePrice: number;
  processingFeePct: number;
  marginPct: number;
  priceAfterProcessingFee: number;
  displayPrice: number;
}

export class PriceCalculationResultDto {
  displayPrice: number;
  breakdown: PriceBreakdownDto;
}

export class PricePreviewQueryDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  basePrice: number;
}

// src/price-engine/price-engine.service.ts
import { Injectable, Inject, BadRequestException, ForbiddenException, Controller, Get, Post, Put, Req, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
// DTOs are locally defined above

interface PriceEngineConfig {
  marginPct: number;
  processingFeePct: number;
}

@Injectable()
export class PriceEngineService {
  private readonly DEFAULT_MARGIN_PCT = 0.20; // 20%
  private readonly DEFAULT_PROCESSING_FEE_PCT = 0.05; // 5%

  constructor(@Inject('DATABASE') private readonly db: any) { }

  private async getTenantPricingConfig(tenantId: string): Promise<PriceEngineConfig> {
    const result = await (this.db as any).execute(
      `SELECT "marginPct", "processingFeePct" FROM price_engine_config WHERE "tenantId" = $1`,
      [tenantId]
    );

    // Assuming `execute` returns an array of rows, or an object with a `rows` property.
    // Given the prompt's example `await (this.db as any).execute('SELECT * FROM table WHERE id = $1', [id]);`,
    // we assume `result` directly contains the rows array or the first row if single.
    const configRow = result[0]; // Access the first row if available

    if (configRow) {
      return {
        marginPct: parseFloat(configRow.marginPct),
        processingFeePct: parseFloat(configRow.processingFeePct),
      };
    }

    // Fallback to defaults if no specific config found for the tenant
    return {
      marginPct: this.DEFAULT_MARGIN_PCT,
      processingFeePct: this.DEFAULT_PROCESSING_FEE_PCT,
    };
  }

  async getPriceConfig(tenantId: string): Promise<{ success: true; data: PriceConfigResponseDto }> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to retrieve price configuration.');
    }
    const config = await this.getTenantPricingConfig(tenantId);
    return { success: true, data: config };
  }

  async overrideTenantMargin(tenantIdToOverride: string, updateDto: UpdateTenantPricingDto, isSuperAdmin: boolean): Promise<{ success: true; data: PriceConfigResponseDto }> {
    if (!isSuperAdmin) {
      throw new ForbiddenException('Only super administrators can override tenant pricing.');
    }
    if (!tenantIdToOverride) {
      throw new BadRequestException('Tenant ID to override is required.');
    }

    const { marginPct } = updateDto;

    // Try to update existing config
    const updateResult = await (this.db as any).execute(
      `UPDATE price_engine_config SET "marginPct" = $1 WHERE "tenantId" = $2 RETURNING "marginPct", "processingFeePct"`,
      [marginPct, tenantIdToOverride]
    );

    const updatedRow = updateResult[0];

    if (updatedRow) {
      return {
        success: true,
        data: {
          marginPct: parseFloat(updatedRow.marginPct),
          processingFeePct: parseFloat(updatedRow.processingFeePct),
        },
      };
    }

    // If no row was updated, insert a new one with default processing fee
    const insertResult = await (this.db as any).execute(
      `INSERT INTO price_engine_config ("tenantId", "marginPct", "processingFeePct") VALUES ($1, $2, $3) RETURNING "marginPct", "processingFeePct"`,
      [tenantIdToOverride, marginPct, this.DEFAULT_PROCESSING_FEE_PCT]
    );

    const insertedRow = insertResult[0];
    if (!insertedRow) {
      throw new BadRequestException('Failed to override tenant margin. Please try again.');
    }

    return {
      success: true,
      data: {
        marginPct: parseFloat(insertedRow.marginPct),
        processingFeePct: parseFloat(insertedRow.processingFeePct),
      },
    };
  }

  async calculatePrice(dto: CalculatePriceDto): Promise<{ success: true; data: PriceCalculationResultDto }> {
    const { basePrice, tenantId } = dto;

    if (basePrice < 0) {
      throw new BadRequestException('Base price cannot be negative.');
    }
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for price calculation.');
    }

    const config = await this.getTenantPricingConfig(tenantId);
    const { marginPct, processingFeePct } = config;

    const priceAfterProcessingFee = basePrice * (1 + processingFeePct);
    const displayPrice = priceAfterProcessingFee * (1 + marginPct);

    const breakdown: PriceBreakdownDto = {
      basePrice,
      processingFeePct,
      marginPct,
      priceAfterProcessingFee: parseFloat(priceAfterProcessingFee.toFixed(2)),
      displayPrice: parseFloat(displayPrice.toFixed(2)),
    };

    return { success: true, data: { displayPrice: parseFloat(displayPrice.toFixed(2)), breakdown } };
  }

  async previewPrice(basePrice: number, tenantId: string): Promise<{ success: true; data: PriceCalculationResultDto }> {
    if (basePrice < 0) {
      throw new BadRequestException('Base price cannot be negative.');
    }
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required for price preview.');
    }

    const config = await this.getTenantPricingConfig(tenantId);
    const { marginPct, processingFeePct } = config;

    const priceAfterProcessingFee = basePrice * (1 + processingFeePct);
    const displayPrice = priceAfterProcessingFee * (1 + marginPct);

    const breakdown: PriceBreakdownDto = {
      basePrice,
      processingFeePct,
      marginPct,
      priceAfterProcessingFee: parseFloat(priceAfterProcessingFee.toFixed(2)),
      displayPrice: parseFloat(displayPrice.toFixed(2)),
    };

    return { success: true, data: { displayPrice: parseFloat(displayPrice.toFixed(2)), breakdown } };
  }
}

// src/price-engine/price-engine.controller.ts
// cyclic imports bypassed for nested controller
import { Request } from 'express';

// Define a custom Request type to include 'user' for internal authentication
type CustomRequest = any;

@Controller() // Use an empty prefix to allow defining full paths for each endpoint
export class PriceEngineController {
  constructor(private readonly priceEngineService: PriceEngineService) { }

  @Get('/api/price-engine/config')
  async getPriceConfig(@Req() req: CustomRequest) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context. Authentication required.');
    }
    return (this.priceEngineService as any).getPriceConfig(tenantId);
  }

  @Put('/api/admin/tenant-pricing/:id')
  @HttpCode(HttpStatus.OK)
  async overrideTenantMargin(
    @Param('id') tenantIdToOverride: string,
    @Body() updateDto: UpdateTenantPricingDto,
    @Req() req: CustomRequest
  ) {
    const isSuperAdmin = req?.user?.isSuperAdmin;

    if (!isSuperAdmin) {
      throw new ForbiddenException('You do not have administrative privileges to perform this action.');
    }

    return (this.priceEngineService as any).overrideTenantMargin(tenantIdToOverride, updateDto, isSuperAdmin);
  }

  @Post('/api/price-engine/calculate')
  @HttpCode(HttpStatus.OK)
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    return (this.priceEngineService as any).calculatePrice(dto);
  }

  @Get('/api/price-engine/preview')
  async previewPrice(@Query() query: PricePreviewQueryDto, @Req() req: CustomRequest) {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context. Authentication required.');
    }
    return (this.priceEngineService as any).previewPrice(query.basePrice, tenantId);
  }
}







