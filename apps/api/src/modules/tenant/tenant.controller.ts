import { Controller, Get, Patch, Body, Param, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { UpdateTenantConfigDto } from './tenant.dto';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tenant by ID' })
  async getTenant(@Param('id', ParseUUIDPipe) id: string) {
    return (this.tenantService as any).findById(id);
  }

  @Patch(':id/config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tenant config' })
  async updateConfig(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() configUpdates: UpdateTenantConfigDto
  ) {
    return (this.tenantService as any).updateConfig(id, configUpdates as Record<string, unknown>);
  }
}

