import { Controller, Post, Get, Put, Param, Body, Req, Ip, UseGuards } from '@nestjs/common';
import { AdminTicketsService } from './admin-tickets.service';
import { RequireRole } from './decorators/require-role.decorator';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { Request } from 'express';

type CustomRequest = any;

@Controller('admin/tickets')
@UseGuards(AdminRoleGuard)
@RequireRole('SUPER_ADMIN', 'CSR') // CSRs can access ticketing endpoints
export class AdminTicketsController {
  constructor(private readonly ticketsService: AdminTicketsService) {}

  @Post()
  async createTicket(
    @Body() body: { tenantId: string; issueContext: string },
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    return (this.ticketsService as any).createTicket(body, req.adminUser, ip);
  }

  @Get()
  async getTickets(@Req() req: CustomRequest) {
    return (this.ticketsService as any).getQueue(req.adminUser);
  }

  @Put(':ticketId/status')
  async updateStatus(
    @Param('ticketId') ticketId: string,
    @Body('status') status: 'OPEN' | 'PENDING' | 'ESCALATED' | 'CLOSED',
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    return (this.ticketsService as any).updateTicketStatus(ticketId, status, req.adminUser, ip);
  }

  @Get(':ticketId/context')
  async getContext(
    @Param('ticketId') ticketId: string,
    @Req() req: CustomRequest,
  ) {
    return (this.ticketsService as any).getTicketContext(ticketId, req.adminUser);
  }

  @Get('secure-data/:tenantId')
  async getSecureTenantData(
    @Param('tenantId') tenantId: string,
    @Req() req: CustomRequest,
    @Ip() ip: string,
  ) {
    return (this.ticketsService as any).fetchTenantDataSecure(tenantId, req.adminUser, ip);
  }
}


