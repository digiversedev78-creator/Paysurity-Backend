import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, Ip } from '@nestjs/common';
import { AdminMerchantApplicationsService } from './admin-merchant-applications.service';
import { RequireRole } from './decorators/require-role.decorator';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { Request } from 'express';

type CustomRequest = any;

@Controller('admin/merchant-applications')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN')
export class AdminMerchantApplicationsController {
  constructor(private readonly service: AdminMerchantApplicationsService) {}

  @Get()
  async getApplications(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.service.getApplications(limit, offset);
  }

  @Get(':id')
  async getApplicationById(@Param('id') id: string) {
    return this.service.getApplicationById(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body('reviewNotes') notes: string, @Req() req: CustomRequest, @Ip() ip: string) {
    return this.service.approveApplication(id, req.adminUser, notes, ip);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body('reviewNotes') notes: string, @Req() req: CustomRequest, @Ip() ip: string) {
    return this.service.rejectApplication(id, req.adminUser, notes, ip);
  }
}

