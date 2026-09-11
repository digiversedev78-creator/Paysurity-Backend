import { Controller, Post, Body, Param, Put, Request } from '@nestjs/common';
import { CashControlService, OpenSessionDto, CloseSessionDto } from './cash-control.service';
// Note: Assuming standard PaySurity JWT Authentication Guards exist globally or via decorators

@Controller('v1/retail/cash-control')
export class CashControlController {
  constructor(private readonly cashControlService: CashControlService) {}

  @Post('open')
  async openSession(@Request() req: any, @Body() body: any) {
    const tenantId = req.tenantId || req.user?.tenantId; // Derived from Impersonation or JWT
    const dto: OpenSessionDto = {
      terminalId: body.terminalId,
      cashierUserId: req.user?.id || body.cashierUserId,
      openingCashCents: body.openingCashCents,
      maxAcceptableVarianceCents: body.maxAcceptableVarianceCents
    };
    return (this.cashControlService as any).openSession(tenantId, dto);
  }

  @Post(':id/close')
  async submitBlindCloseout(@Request() req: any, @Param('id') sessionId: string, @Body() body: any) {
    const tenantId = req.tenantId || req.user?.tenantId;
    const dto: CloseSessionDto = {
      sessionId,
      actualClosingCents: body.actualClosingCents,
      notes: body.notes
    };
    return (this.cashControlService as any).submitBlindCloseout(tenantId, dto);
  }

  @Put(':id/resolve')
  async managerOverrideReview(@Request() req: any, @Param('id') sessionId: string, @Body() body: any) {
     const tenantId = req.tenantId || req.user?.tenantId;
     const managerId = req.user?.id; // In production, RBAC Guard explicitly mandates 'MANAGER' role to reach this endpoint
     
     return (this.cashControlService as any).resolveSupervisorReview(tenantId, sessionId, managerId, body.resolutionNotes);
  }
}

