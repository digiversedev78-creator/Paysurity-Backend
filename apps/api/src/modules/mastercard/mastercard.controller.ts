import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { MastercardService } from './mastercard.service';
import { MerchantScreeningRequest } from './match-pro.adapter';

/**
 * MastercardController -- REST endpoints for Mastercard integrations.
 *
 * Routes:
 *   POST /mastercard/screen              -- Screen merchant via MATCH Pro
 *   POST /mastercard/bank-link           -- Generate bank account link URL
 *   POST /mastercard/verify-account      -- Verify bank account
 *   POST /mastercard/payout              -- Create instant payout
 *   GET  /mastercard/payout/:id/status   -- Check payout status
 */
@Controller('mastercard')
export class MastercardController {
  private readonly logger = new Logger(MastercardController.name);

  constructor(private readonly mc: MastercardService) {}

  /**
   * Screen a merchant against TMF before onboarding.
   */
  @Post('screen')
  async screenMerchant(@Body() body: MerchantScreeningRequest) {
    this.logger.log(`[MC-API] Screening merchant: ${body.merchantName}`);
    return (this.mc as any).screenMerchantBeforeOnboarding(body);
  }

  /**
   * Generate a Finicity Connect URL for bank account linking.
   */
  @Post('bank-link')
  async generateBankLink(
    @Body() body: { customerId: string; redirectUrl: string; webhookUrl: string },
  ) {
    return (this.mc as any).generateBankLinkUrl(body.customerId, body.redirectUrl, body.webhookUrl);
  }

  /**
   * Verify a bank account.
   */
  @Post('verify-account')
  async verifyAccount(
    @Body() body: { customerId: string; accountId: string },
  ) {
    return (this.mc as any).verifyBankAccount(body.customerId, body.accountId);
  }

  /**
   * Instant payout via Mastercard Send.
   */
  @Post('payout')
  async createPayout(
    @Body() body: {
      recipientId: string;
      tenantId: string;
      amountCents: number;
      destinationToken: string;
      purpose: 'MERCHANT_PAYOUT' | 'PAYROLL' | 'COMMISSION';
    },
  ) {
    switch (body.purpose) {
      case 'MERCHANT_PAYOUT':
        return (this.mc as any).instantMerchantPayout(body.recipientId, body.tenantId, body.amountCents, body.destinationToken);
      case 'PAYROLL':
        return (this.mc as any).instantPayrollPayout(body.recipientId, body.tenantId, body.amountCents, body.destinationToken);
      case 'COMMISSION':
        return (this.mc as any).instantCommissionPayout(body.recipientId, body.tenantId, body.amountCents, body.destinationToken);
    }
  }

  /**
   * Check the status of a payout.
   */
  @Get('payout/:id/status')
  async getPayoutStatus(@Param('id') id: string) {
    return (this.mc as any).getDisbursementStatus(id);
  }

  /**
   * Check payout eligibility for a destination.
   */
  @Post('payout/eligibility')
  async checkEligibility(
    @Body() body: { destinationToken: string; amountCents: number },
  ) {
    return (this.mc as any).checkPayoutEligibility(body.destinationToken, body.amountCents);
  }
}


