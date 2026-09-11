import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';

import { RefundWorkflowService, WalletType, RefundType } from './refund-workflow.service';

@Controller('v1')
export class RefundWorkflowController {
  constructor(private readonly rws: RefundWorkflowService) {}

  // â”€â”€â”€ MOBILE WALLET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  @Post('wallet/register')
  async registerWallet(@Body() body: {
    tenantId: string; walletType: WalletType; encryptedToken: string;
    deviceId: string; lastFour: string; cardBrand: string;
  }) {
    return { data: await (this.rws as any).registerWalletToken(
      body.tenantId, body.walletType, body.encryptedToken, body.deviceId, body.lastFour, body.cardBrand,
    )};
  }

  @Post('wallet/pay')
  async walletPay(
    @Body() body: { tenantId: string; tokenId: string; amountCents: number },
    @Headers('x-trace-id') traceId: string,
  ) {
    return { data: await (this.rws as any).processWalletPayment(body.tenantId, body.tokenId, body.amountCents, traceId || 'wallet-pay') };
  }

  @Get('wallet/tokens')
  async getTokens(@Query('tenantId') tenantId: string) {
    return { data: await (this.rws as any).getWalletTokens(tenantId) };
  }

  // â”€â”€â”€ ADVANCED REFUNDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  @Post('refunds/initiate') // Updated path from /refunds
  async initiateRefund(@Body() body: {
    tenantId: string; paymentIntentId: string; refundType: RefundType;
    amountCents: number; reason: string;
    items?: Array<{ name: string; quantityRefunded: number; amountCents: number }>;
  }, @Headers('x-trace-id') traceId?: string): Promise<any> {
    return { data: await (this.rws as any).initiateRefund(
      body.tenantId, body.paymentIntentId, body.refundType, body.amountCents, body.reason, body.items, traceId,
    )};
  }

  @Put('refunds/:id/approve') // Changed from @Patch to @Put
  async approve(@Param('id') id: string, @Body() body: { approvedBy: string }, @Headers('x-trace-id') traceId?: string) {
    return { data: await (this.rws as any).approveRefund(id, body.approvedBy, traceId || 'refund-approve') };
  }

  @Put('refunds/:id/deny') // Changed from @Patch to @Put, added traceId
  async deny(@Param('id') id: string, @Body() body: { reason: string }, @Headers('x-trace-id') traceId?: string) {
    return { data: await (this.rws as any).denyRefund(id, body.reason, traceId || 'refund-deny') };
  }

  @Post('refunds/:id/receive-item')
  async receiveItem(
    @Param('id') id: string,
    @Body() body: { receivedBy: string },
    @Headers('x-trace-id') traceId?: string,
  ) {
    return { data: await (this.rws as any).receiveRefundItem(id, body.receivedBy, traceId || 'refund-receive-item') };
  }

  @Post('refunds/:id/issue-refund')
  async issueRefund(
    @Param('id') id: string,
    @Body() body: { method: 'original_payment' | 'store_credit'; issuedBy: string },
    @Headers('x-trace-id') traceId?: string,
  ) {
    return { data: await (this.rws as any).issueRefund(id, body.method, body.issuedBy, traceId || 'refund-issue') };
  }

  @Get('refunds/:id')
  async getRefundById(@Param('id') id: string, @Headers('x-trace-id') traceId?: string) {
    // Assuming the service has a method to retrieve a refund by ID
    return { data: await (this.rws as any).getRefund(id, traceId || 'refund-get') };
  }
}


