import { Controller, Get, Param, Req, NotFoundException } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll(@Req() req: any) {
    const tenantId = req?.user?.tenantId as string | undefined;
    if (!tenantId) {
      throw new NotFoundException('Tenant ID not found in request. Authentication required.');
    }
    return (this.auditLogService as any).findAll(tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const tenantId = req?.user?.tenantId as string | undefined;
    if (!tenantId) {
      throw new NotFoundException('Tenant ID not found in request. Authentication required.');
    }
    const auditLog = await (this.auditLogService as any).findById(id, tenantId);
    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID "${id}" not found.`);
    }
    return auditLog;
  }
}

