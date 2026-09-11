// apps/api/src/modules/mastercard/mastercard.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { OpenFinanceAdapter, AccountVerificationResult, BalanceCheckResult, IncomeVerificationResult } from './open-finance.adapter';
import { MastercardSendAdapter } from './mastercard-send.adapter'; type DisbursementRequest = any; type DisbursementResult = any; type TransactionStatusResult = any;
import { MatchProAdapter, MerchantScreeningRequest, MatchResult } from './match-pro.adapter';

/**
 * MastercardService -- Unified facade for all 3 Mastercard integrations.
 *
 * This service is the single entry point for any module that needs:
 *   - Open Banking (account verification, balances, income)
 *   - Instant Payouts (merchant settlements, payroll, commissions)
 *   - Merchant Screening (TMF/MATCH compliance check)
 *
 * Usage:
 *   constructor(private readonly mc: MastercardService) {}
 *   await mc.screenMerchantBeforeOnboarding(req);
 *   await mc.instantPayout(req);
 *   await mc.verifyBankAccount(customerId, accountId);
 */
@Injectable()
export class MastercardService {
  private readonly logger = new Logger(MastercardService.name);

  constructor(
    private readonly openFinance: OpenFinanceAdapter,
    private readonly send: MastercardSendAdapter,
    private readonly matchPro: MatchProAdapter,
  ) {}

  // â”€â”€ MATCH Pro: Merchant Screening â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Screen merchant against TMF BEFORE sending application to gateway.
   * Returns { approved: boolean, details: MatchResult }
   */
  async screenMerchantBeforeOnboarding(
    req: MerchantScreeningRequest,
  ): Promise<{ approved: boolean; details: MatchResult }> {
    this.logger.log(`[MC] Screening merchant "${req.merchantName}" via MATCH Pro`);

    const result = await this.matchPro.screenMerchant(req);

    this.logger.log(
      `[MC] MATCH result: riskLevel=${result.riskLevel} ` +
      `recommendation=${result.recommendation} matchCount=${result.matchCount}`,
    );

    return {
      approved: result.recommendation === 'APPROVE',
      details: result,
    };
  }

  // â”€â”€ Open Finance: Account & Income Verification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Generate a Connect URL for bank account linking.
   */
  async generateBankLinkUrl(
    customerId: string,
    redirectUrl: string,
    webhookUrl: string,
  ): Promise<{ link: string; requestId: string }> {
    return this.openFinance.createConnectUrl(customerId, redirectUrl, webhookUrl);
  }

  /**
   * Verify account ownership for ACH setup.
   */
  async verifyBankAccount(
    customerId: string,
    accountId: string,
  ): Promise<AccountVerificationResult> {
    return this.openFinance.verifyAccount(customerId, accountId);
  }

  /**
   * Check balance for BNPL/credit decisioning.
   */
  async checkAccountBalance(
    customerId: string,
    accountId: string,
  ): Promise<BalanceCheckResult> {
    return this.openFinance.checkBalance(customerId, accountId);
  }

  /**
   * Income verification for underwriting.
   */
  async verifyIncome(customerId: string): Promise<IncomeVerificationResult> {
    return this.openFinance.verifyIncome(customerId);
  }

  // â”€â”€ Mastercard Send: Instant Payouts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Send funds via Mastercard Send.
   * @param dto DisbursementRequest details.
   * @returns DisbursementResult indicating success or failure.
   */
  async sendFunds(dto: DisbursementRequest): Promise<DisbursementResult> {
    this.logger.log(`[MC Send] Initiating fund disbursement for transactionId: ${dto.merchantTransactionId}`);
    try {
      const result = await this.send.sendFunds(dto);
      this.logger.log(`[MC Send] Fund disbursement successful for transactionId: ${dto.merchantTransactionId} with API Transaction ID: ${(result as any).apiTransactionId}`);
      return result;
    } catch (error) {
      this.logger.error(`[MC Send] Fund disbursement failed for transactionId: ${dto.merchantTransactionId}: ${error.message}`, error.stack);
      throw error; // Re-throw the error after logging
    }
  }

  /**
   * Get the status of a Mastercard Send transaction.
   * @param transactionId The ID of the transaction to check.
   * @returns TransactionStatusResult.
   */
  async getTransactionStatus(transactionId: string): Promise<TransactionStatusResult> {
    this.logger.log(`[MC Send] Getting status for transactionId: ${transactionId}`);
    try {
      const result = await this.send.getTransactionStatus(transactionId);
      this.logger.log(`[MC Send] Status retrieved for transactionId: ${transactionId}. Status: ${result.status}`);
      return result;
    } catch (error) {
      this.logger.error(`[MC Send] Failed to get status for transactionId: ${transactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Verify a Mastercard Send webhook signature.
   * @param signature The `X-MCM-Signature` header value.
   * @param payload The raw request body.
   * @returns boolean indicating if the webhook is valid.
   */
  async verifyWebhook(signature: string, payload: string): Promise<boolean> {
    this.logger.debug(`[MC Send] Verifying webhook signature.`);
    const isValid = await this.send.verifyWebhook(signature, payload);
    if (!isValid) {
      this.logger.warn(`[MC Send] Webhook signature verification failed.`);
    } else {
      this.logger.debug(`[MC Send] Webhook signature verified successfully.`);
    }
    return isValid;
  }
}




