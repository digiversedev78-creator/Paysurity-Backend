import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { AdminRoleGuard } from '../admin-portal/guards/admin-role.guard';
import { RequireRole } from '../admin-portal/decorators/require-role.decorator';
import { DisputeStatus } from './dto/dispute.dto';

@Controller('admin/disputes')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  async getAllDisputes() {
    // Return all disputes (system-wide for admin)
    return (this.disputesService as any).getDisputes('system', { limit: 100 });
  }

  @Get(':id')
  async getDispute(@Param('id') id: string) {
    // Find system-wide
    return (this.disputesService as any).getDisputeById('system', id);
  }

  @Post(':id/resolve')
  async resolveDispute(@Param('id') id: string, @Body() resolution: any) {
    // We update status to CLOSED
    return (this.disputesService as any).updateDisputeStatus('system', id, DisputeStatus.CLOSED);
  }
}

