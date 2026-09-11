import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('api-keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new API Key for the current tenant' })
  async generateApiKey(@Body() dto: { name: string; scopes?: string[] }, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return (this.apiKeysService as any).createApiKey(tenantId, dto.name, dto.scopes);
  }

  @Get()
  @ApiOperation({ summary: 'List API Keys for the current tenant' })
  async listApiKeys(@Req() req: any) {
    const tenantId = req.user?.tenantId;
    return (this.apiKeysService as any).listApiKeys(tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API Key' })
  async revokeApiKey(@Param('id') keyId: string, @Req() req: any) {
    const tenantId = req.user?.tenantId;
    return (this.apiKeysService as any).revokeApiKey(tenantId, keyId);
  }
}

