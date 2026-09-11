import { Controller, Get, Param, Request, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('security')
@ApiBearerAuth()
@Controller('security')
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  private getTenant(req: any): string {
    return req?.user?.tenantId || req?.headers?.['x-tenant-id'] || 'default';
  }

  @Get()
  @ApiOperation({ summary: 'List security items' })
  async findAll(@Request() req: any, @Query() query: any) {
    return { data: [], total: 0, tenantId: this.getTenant(req) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get security item by id' })
  async findOne(@Param('id') id: string) {
    return { id, status: 'ok' };
  }

  @Get('health')
  @ApiOperation({ summary: 'security health check' })
  health() { return { status: 'ok', module: 'security', ts: new Date().toISOString() }; }
}
