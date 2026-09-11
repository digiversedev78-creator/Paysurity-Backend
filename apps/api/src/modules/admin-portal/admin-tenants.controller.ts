import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, Ip } from '@nestjs/common';
import { AdminTenantsService } from './admin-tenants.service';
import { RequireRole } from './decorators/require-role.decorator';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { Request } from 'express';

type CustomRequest = any;

@Controller('admin/tenants')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN')
export class AdminTenantsController {
  constructor(private readonly tenantsService: AdminTenantsService) {}

  @Get()
  async getTenants(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return (this.tenantsService as any).getTenants(limit, offset);
  }

  @Get(':id')
  async getTenantById(@Param('id') id: string) {
    return (this.tenantsService as any).getTenantById(id);
  }

  @Post()
  async createTenant(@Body() body: { name: string; vertical?: string }, @Req() req: CustomRequest, @Ip() ip: string) {
    return (this.tenantsService as any).createTenant(body, req.adminUser, ip);
  }

  @Put(':id')
  async updateTenant(@Param('id') id: string, @Body() body: { name?: string; vertical?: string }, @Req() req: CustomRequest, @Ip() ip: string) {
    return (this.tenantsService as any).updateTenant(id, body, req.adminUser, ip);
  }

  @Put(':id/subscription')
  async toggleSubscription(
    @Param('id') id: string,
    @Body() body: { vertical: string; isActive: boolean },
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    return (this.tenantsService as any).toggleSubscriptionVertical(id, body.vertical, body.isActive, req.adminUser, ip);
  }
}


