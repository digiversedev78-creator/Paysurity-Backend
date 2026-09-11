import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FluidPayAdapter } from '../payment/adapters/fluidpay.adapter';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletFiatService {
  private readonly logger = new Logger(WalletFiatService.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly fluidpay: FluidPayAdapter
  ) {}

  /**
   * Mock Plaid Linking
   * Exchanges a public_token from the frontend for a processor_token
   */
  async linkBankAccount(tenantId: string, consumerPhone: string, publicToken: string) {
    this.logger.log(`[Plaid Mock] Exchanging public_token ${publicToken} for tenant ${tenantId}`);
    
    if (!publicToken) {
      throw new BadRequestException('public_token is required');
    }

    // Connect to Plaid API (Mocked using config)
    const plaidClientId = process.env.PLAID_CLIENT_ID || 'mock_client_id';
    const plaidSecret = process.env.PLAID_SECRET_SANDBOX || 'mock_secret';
    this.logger.debug(`[Plaid Config] Client: ${plaidClientId}`);

    const mockProcessorToken = `processor-mock-${Math.random().toString(36).substring(7)}`;
    this.logger.log(`[Plaid Mock] Successfully linked bank account. Processor Token: ${mockProcessorToken}`);

    // In a real app, you save the processorToken to the user's profile in the DB.
    return {
      message: 'Bank account successfully linked',
      processorToken: mockProcessorToken,
      last4: '4321',
      bankName: 'Plaid Test Bank'
    };
  }

  /**
   * Fiat Funding (Deposit via FluidPay)
   */
  async fundWalletViaCard(tenantId: string, consumerPhone: string, amount: string, cardToken: string) {
    this.logger.log(`[FluidPay LIVE] Processing real credit card charge of $${amount} via token ${cardToken}`);

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const amountCents = Math.round(numericAmount * 100);
    const idempotencyKey = uuidv4();

    try {
      // 1. Authorize the funds via live Gateway
      const authRes = await this.fluidpay.authorize({
        amountCents,
        currency: 'USD',
        paymentMethodType: 'CARD', // Native map to FluidPay transaction object
        paymentMethodToken: cardToken,
        description: 'Digital Wallet Fiat Origin Load',
        customerId: consumerPhone,
        customerEmail: `${consumerPhone}@paysurity.app`
      } as any, idempotencyKey);

      if (authRes.status !== 'AUTHORIZED') {
        this.logger.error(`FluidPay Gateway Rejected: ${authRes.processorResponseText}`);
        throw new BadRequestException(`Gateway Declined: ${authRes.processorResponseText || 'Unknown Provider Error'}`);
      }

      // 2. Liquidate and Capture the funds dynamically
      const captureRes = await this.fluidpay.capturePayment(authRes.processorTransactionId);
      if (captureRes.status !== 'SUCCESS') {
         this.logger.error(`FluidPay Capture Failed: ${captureRes.processorResponseText}`);
         // Highly problematic scenario (Auth passed, capture failed). You might want alerts here.
         throw new BadRequestException(`Capture Failed: ${captureRes.processorResponseText || 'Unknown Gateway Error'}`);
      }

      const transactionId = authRes.processorTransactionId;
      this.logger.log(`FluidPay Charge successful! TX: ${transactionId}. Crediting digital wallet...`);

      // 3. Call internal secure wallet service to push the real funds to the ledger core
      const wallet = await (this.walletService as any).createWallet({ tenantId, consumerId: consumerPhone, walletType: 'CONSUMER' });
      const txId = await (this.walletService as any).credit({
        tenantId,
        walletId: wallet.id,
        amountCents,
        transactionType: 'LOAD_CARD',
        description: `Loaded via FluidPay ${transactionId}`,
        idempotencyKey: transactionId
      });

      return {
        success: true,
        message: 'Wallet funded successfully via Live Gateway',
        transactionId,
        newBalance: wallet.balance_cents + amountCents
      };
    } catch (error) {
       this.logger.error(`Fiat Funding Critical Error: ${error.message}`);
       throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Fiat Withdrawal (Payout via FluidPay ACH with Plaid Token)
   */
  async withdrawToBank(tenantId: string, consumerPhone: string, amount: string, processorToken: string) {
    this.logger.log(`[FluidPay ACH Mock] Processing payout of $${amount} to processor_token ${processorToken}`);

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) throw new BadRequestException('Amount must be positive');

    // Perform the internal ledger deduction
    const wallet = await (this.walletService as any).createWallet({ tenantId, consumerId: consumerPhone, walletType: 'CONSUMER' });
    const txId = await (this.walletService as any).debit({
      tenantId,
      walletId: wallet.id,
      amountCents: Math.round(numericAmount * 100),
      transactionType: 'TRANSFER_OUT',
      description: 'Withdrawal to linked bank',
      idempotencyKey: `withdraw-${Date.now()}`
    });

    // Inform FluidPay to issue ACH Credit.
    const achTransactionId = `fluidpay-ach-${Date.now()}`;
    this.logger.log(`[FluidPay Mock] Issued ACH Credit of $${amount}. Settling in 1-2 business days. TX: ${achTransactionId}`);

    return {
      success: true,
      message: 'Withdrawal initiated successfully via ACH',
      achTransactionId,
      remainingBalance: wallet.balance_cents - Math.round(numericAmount * 100)
    };
  }
}

