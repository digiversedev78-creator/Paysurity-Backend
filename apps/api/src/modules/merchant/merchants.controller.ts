import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto, UpdateMerchantDto, MerchantResponseDto, ApplicationStatus } from './merchants.dto';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { UserId } from '../common/decorators/user-id.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({ status: 201, description: 'The merchant has been successfully created.', type: MerchantResponseDto })
  async create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createMerchantDto: CreateMerchantDto,
  ): Promise<Record<string, unknown>> {
    return (this.merchantsService as any).createMerchant(tenantId, userId, createMerchantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all merchants' })
  @ApiResponse({ status: 200, description: 'List of merchants.', type: [MerchantResponseDto] })
  @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false, description: 'Filter by status.' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: ApplicationStatus,
  ): Promise<Record<string, unknown>[]> {
    return (this.merchantsService as any).findAllMerchants(tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a merchant by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Merchant ID (UUID)' })
  @ApiResponse({ status: 200, description: 'The merchant details.', type: MerchantResponseDto })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<Record<string, unknown>> {
    return (this.merchantsService as any).findMerchantById(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing merchant' })
  @ApiParam({ name: 'id', type: String, description: 'Merchant ID (UUID)' })
  @ApiResponse({ status: 200, description: 'The merchant has been successfully updated.', type: MerchantResponseDto })
  async update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ): Promise<Record<string, unknown>> {
    return (this.merchantsService as any).updateMerchant(tenantId, userId, id, updateMerchantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate (soft-delete) a merchant by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Merchant ID (UUID)' })
  @ApiResponse({ status: 204, description: 'The merchant has been successfully deactivated.' })
  async delete(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await (this.merchantsService as any).deleteMerchant(tenantId, userId, id);
  }
}

