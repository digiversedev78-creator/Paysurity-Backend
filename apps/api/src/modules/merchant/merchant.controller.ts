/**
 * MerchantController â€” Merchant Management API
 * Matches MerchantService API exactly.
 */
import {
  Controller, Get, Post, Put, Body, Param,
  UseGuards, HttpCode, HttpStatus, Logger, Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MerchantService,
  CreateMerchantOnboardingDto,
  MerchantRecord,
  BrandingConfigDto,
  LocationSetupDto,
  StaffInvitationDto,
} from './merchant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export class CreateMerchantDto implements CreateMerchantOnboardingDto {
  @ApiProperty() @IsString() @IsNotEmpty() tenantId!: string;
  @ApiProperty() @IsString() @IsNotEmpty() legalName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() dbaName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mcc?: string;
  @ApiProperty({ enum: ['RESTAURANT', 'GROCERY', 'RETAIL', 'ECOMMERCE', 'SALON', 'OTHER'] })
  @IsIn(['RESTAURANT', 'GROCERY', 'RETAIL', 'ECOMMERCE', 'SALON', 'OTHER'])
  vertical!: 'RESTAURANT' | 'GROCERY' | 'RETAIL' | 'ECOMMERCE' | 'SALON' | 'OTHER';
  @ApiProperty() @IsEmail() primaryEmail!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() primaryPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() streetName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() buildingNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() buildingName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() townName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() countrySubDivision?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() countryCode?: string;
  @ApiPropertyOptional() @IsOptional() brandingConfig?: BrandingConfigDto;
  @ApiPropertyOptional() @IsOptional() locationSetup?: LocationSetupDto;
  @ApiPropertyOptional() @IsOptional() staffInvitations?: StaffInvitationDto;
}

export class UpdateMerchantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() primaryPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() primaryEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() streetName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() townName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() postCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() countryCode?: string;
  @ApiPropertyOptional() @IsOptional() brandingConfig?: BrandingConfigDto;
  @ApiPropertyOptional() @IsOptional() locationSetup?: LocationSetupDto;
  @ApiPropertyOptional() @IsOptional() staffInvitations?: StaffInvitationDto;
}

// Aliases for backward compatibility
export type MerchantResponseDto = MerchantRecord;
export type GetMerchantProfileResponseDto = MerchantRecord;
export type UpdateMerchantProfileDto = UpdateMerchantDto;
export interface MerchantLocationResponseDto { id?: string; name?: string; timezone?: string; [k: string]: any; }
export type CreateMerchantLocationDto = Partial<LocationSetupDto> & { name?: string; tenantId?: string; };
export type UpdateMerchantLocationDto = Partial<LocationSetupDto>;

// â”€â”€ Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@ApiTags('merchants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchants')
export class MerchantController {
  private readonly logger = new Logger(MerchantController.name);

  constructor(private readonly merchantService: MerchantService) {}

  /**
   * POST /merchants â€” Create a new merchant (onboarding).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new merchant during onboarding' })
  @ApiResponse({ status: 201, description: 'Merchant created.' })
  async createMerchant(@Body() dto: CreateMerchantDto, @Req() req: any): Promise<MerchantRecord> {
    const tenantId = dto.tenantId || String(req.user?.tenantId ?? '');
    return (this.merchantService as any).createMerchant({ ...dto, tenantId });
  }

  /**
   * GET /merchants/:merchantId â€” Get a merchant by ID.
   */
  @Get(':merchantId')
  @ApiOperation({ summary: 'Get merchant by ID' })
  @ApiParam({ name: 'merchantId', description: 'Merchant UUID' })
  @ApiResponse({ status: 200, description: 'Returns merchant record.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  async getMerchant(@Param('merchantId') merchantId: string, @Req() req: any): Promise<MerchantRecord> {
    const tenantId = String(req.user?.tenantId ?? '');
    const merchant = await (this.merchantService as any).getMerchantById(merchantId, tenantId);
    if (!merchant) throw new NotFoundException(`Merchant ${merchantId} not found.`);
    return merchant;
  }

  /**
   * PUT /merchants/:merchantId â€” Update merchant onboarding configuration.
   */
  @Put(':merchantId')
  @ApiOperation({ summary: 'Update merchant onboarding configuration' })
  @ApiParam({ name: 'merchantId', description: 'Merchant UUID' })
  @ApiResponse({ status: 200, description: 'Merchant updated.' })
  async updateMerchant(
    @Param('merchantId') merchantId: string,
    @Body() dto: UpdateMerchantDto,
    @Req() req: any,
  ): Promise<MerchantRecord> {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.merchantService as any).updateMerchantOnboarding(merchantId, tenantId, {
      ...dto,
      merchantId,
    });
  }

  /**
   * POST /merchants/:merchantId/kyb/verify â€” Submit KYB data for verification
   */
  @Post(':merchantId/kyb/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit KYB details for onboarding verification' })
  async verifyKYB(@Param('merchantId') merchantId: string, @Body() data: any, @Req() req: any) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.merchantService as any).verifyKYB(merchantId, tenantId, data);
  }

  /**
   * POST /merchants/:merchantId/kyb/documents â€” Upload KYB entity documents
   */
  @Post(':merchantId/kyb/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload KYB documentation' })
  async uploadKYBDocument(@Param('merchantId') merchantId: string, @Body() data: any, @Req() req: any) {
    const tenantId = String(req.user?.tenantId ?? '');
    return (this.merchantService as any).uploadKYBDocument(merchantId, tenantId, data);
  }
}

