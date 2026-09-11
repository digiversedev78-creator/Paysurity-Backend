import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@ApiTags('api-keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new API Key for the current tenant' })
  async generateApiKey(@Body() dto: CreateApiKeyDto, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.apiKeysService.createApiKey(tenantId, dto.name, dto.scopes);
  }

  @Get()
  @ApiOperation({ summary: 'List API Keys for the current tenant' })
  async listApiKeys(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.apiKeysService.listApiKeys(tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API Key' })
  async revokeApiKey(@Param('id') keyId: string, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return this.apiKeysService.revokeApiKey(tenantId, keyId);
  }
}
