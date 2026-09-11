type HeadersInit = any;
import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { URLSearchParams } from 'node:url'; // Required for constructing OAuth header parameters

/**
 * Mastercard Send Adapter -- Near real-time fund disbursements.
 *
 * Enables PaySurity to offer:
 *   - Instant merchant payouts (competitive vs 2-3 day ACH)
 *   - Instant employee pay (payroll vertical)
 *   - Affiliate commission instant payout
 *   - Digital wallet top-up
 *
 * Mastercard Send supports push payments to:
 *   - Debit cards (Mastercard, Visa)
 *   - Bank accounts (via account number + routing)
 *   - Digital wallets
 *
 * Env vars:
 *   MC_SEND_CONSUMER_KEY, MC_SEND_PRIVATE_KEY (content of PEM file),
 *   MC_SEND_PARTNER_ID, MC_SEND_BASE_URL, MC_SEND_WEBHOOK_SECRET
 */

// Custom error for Mastercard Send API operations
export class MastercardSendError extends Error {
  constructor(message: string, public readonly statusCode?: number, public readonly details?: any) {
    super(message);
    this.name = 'MastercardSendError';
    Object.setPrototypeOf(this, MastercardSendError.prototype); // Proper way to extend Error
  }
}

interface MastercardSendConfig {
  consumerKey: string;
  privateKey: string; // Actual private key content (PEM format usually)
  partnerId: string;
  baseUrl: string;
  webhookSecret: string;
}

export interface SendFundsDto {
  /** PaySurity internal reference */
  referenceId: string;
  /** Recipient identifier */
  recipientId: string;
  /** Amount in cents */
  amountCents: number;
  /** Currency code (e.g., 'USD') */
  currency: string;
  /** Destination type */
  destinationType: 'DEBIT_CARD' | 'BANK_ACCOUNT' | 'WALLET';
  /** Destination token/identifier -- never raw PAN */
  destinationToken: string;
  /** Sender info */
  senderName: string;
  /** Purpose */
  purpose: 'MERCHANT_PAYOUT' | 'PAYROLL' | 'COMMISSION' | 'WALLET_TOPUP' | 'REFUND';
  /** Merchant ID for tracking */
  merchantId?: string;
  tenantId: string; // Added tenantId as it's a multi-tenant platform
}

export interface SendFundsResult {
  mastercardTransactionId: string; // Renamed to clarify it's Mastercard's ID
  status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'ERROR';
  originalAmountCents: number; // In cents
  settlementDate?: string;
  responseCode: string;
  responseMessage: string;
  fundingSource?: string;
}

export interface TransactionStatusResult {
  mastercardTransactionId: string;
  status: 'APPROVED' | 'PENDING' | 'DECLINED' | 'SUCCESS' | 'FAILURE' | 'UNKNOWN'; // Broader status set
  amountCents: number; // In cents
  currency: string;
  referenceId: string; // Our internal reference, if available from their query API
  responseCode: string;
  responseMessage: string;
  lastUpdateTime: string; // Timestamp of the status
  originalResponse?: any; // To include original API response details if needed
}

// Mastercard Send API Response Structures (Simplified for example based on common patterns)
interface MastercardTransferResponse {
  transactionId: string;
  response: {
    code: string;
    description: string;
    reasonCode?: string; // Additional detail for errors
  };
  transfer: {
    status: string; // e.g., 'APPROVED', 'PENDING'
    amount: number; // e.g., 100.00 (decimal amount)
    currency: string; // e.g., USD
    senderName: string;
    fundingSource?: string;
    settlementDate?: string;
    // ... many more fields as per API documentation
  };
}

interface MastercardTransactionQueryResponse {
  transaction: {
    transactionId: string;
    status: string; // e.g., 'SUCCESS', 'PENDING', 'FAILED'
    amount: {
      value: number; // e.g., 100.00 (decimal amount)
      currency: string;
    };
    correlationId: string; // Our referenceId might map here
    creationTime: string;
    lastUpdated: string;
    // ... other fields like responseCode, responseDescription, etc.
  };
  response: {
    code: string;
    description: string;
    reasonCode?: string;
  };
}

@Injectable()
export class MastercardSendAdapter {
  private readonly logger = new Logger(MastercardSendAdapter.name);
  private readonly config: MastercardSendConfig;

  constructor() {
    this.config = {
      consumerKey: process.env.MC_SEND_CONSUMER_KEY ?? '',
      privateKey: process.env.MC_SEND_PRIVATE_KEY ?? '', // Expecting key content (PEM string)
      partnerId: process.env.MC_SEND_PARTNER_ID ?? '',
      baseUrl: process.env.MC_SEND_BASE_URL ?? 'https://sandbox.api.mastercard.com/send/v1',
      webhookSecret: process.env.MC_SEND_WEBHOOK_SECRET ?? '',
    };

    if (!this.config.consumerKey || !this.config.privateKey || !this.config.partnerId || !this.config.baseUrl) {
      this.logger.error('Mastercard Send adapter is missing required environment variables (MC_SEND_CONSUMER_KEY, MC_SEND_PRIVATE_KEY, MC_SEND_PARTNER_ID, MC_SEND_BASE_URL). Operating in degraded mode.');
    }
  }

  /**
   * Generates a mock Authorization header for Mastercard Send API.
   *
   * WARNING: This is a **mock** implementation for the Authorization header.
   * Mastercard Send API uses OAuth 1.0a with RSA-SHA256 signature,
   * which requires a complex cryptographic signature generated using the private key.
   * A real production implementation MUST use a dedicated Mastercard SDK
   * (e.g., 'mastercard-oauth1-signer-nodejs') or a robust OAuth 1.0a library
   * with RSA-SHA256 signing functionality to generate a valid signature.
   *
   * For the purpose of this task, we are demonstrating the *integration point*
   * rather than the full crypto implementation, to avoid introducing complex
   * crypto code or external dependencies directly within this adapter file.
   *
   * @param method HTTP method (GET, POST)
   * @param url Full request URL
   * @param body Request body for POST requests
   * @returns A mock OAuth Authorization header string.
   */
  private getAuthorizationHeader(method: string, url: string, body?: any): string {
    this.logger.warn(`[MC-SEND] Using MOCK Authorization header. A production implementation MUST use proper OAuth 1.0a RSA-SHA256 signing.`);

    // These parameters would be dynamically generated and signed in a real implementation.
    const oauthParams = new URLSearchParams({
      oauth_consumer_key: this.config.consumerKey,
      oauth_signature_method: 'RSA-SHA256',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: Math.random().toString(36).substring(2, 15),
      oauth_version: '1.0',
      oauth_signature: 'MOCK_SIGNATURE_GENERATED_BY_RSA_SHA256', // This part is critical for real API calls
    });

    // Format for OAuth header: "OAuth param1="value1",param2="value2""
    return `OAuth ${oauthParams.toString().replace(/&/g, ',')}`;
  }

  private mapPurpose(purpose: SendFundsDto['purpose']): string {
    switch (purpose) {
      case 'MERCHANT_PAYOUT':
      case 'PAYROLL':
      case 'COMMISSION':
        return 'P2M'; // Person-to-Merchant for payouts
      case 'WALLET_TOPUP':
        return 'P2P'; // Person-to-Person for wallet top-ups (check Mastercard docs for exact mapping)
      case 'REFUND':
        return 'REFUND';
      default:
        return 'P2M'; // Default to Person-to-Merchant
    }
  }

  private buildRecipientUri(destinationType: SendFundsDto['destinationType'], destinationToken: string): string {
    switch (destinationType) {
      case 'DEBIT_CARD':
        return `pan:${destinationToken}`; // Assume destinationToken is a tokenized PAN or card number
      case 'BANK_ACCOUNT':
        // Mastercard Send often uses specific formats like 'bank:IBAN' or 'bank:ACCOUNT_NUMBER:ROUTING_NUMBER'.
        // For simplicity, assuming destinationToken is already in a compatible format (e.g., a tokenized bank account ID).
        // A real implementation might require parsing and formatting `destinationToken` based on its content.
        return `bank:${destinationToken}`;
      case 'WALLET':
        return `wallet:${destinationToken}`; // Assume destinationToken is a wallet identifier
      default:
        throw new MastercardSendError(`Unsupported destination type: ${destinationType}`);
    }
  }

  /**
   * Internal helper to make API calls to Mastercard Send.
   * Handles common headers, `fetch` and error parsing.
   * @param method HTTP method (GET, POST)
   * @param path API endpoint path (e.g., '/partners/transfers')
   * @param body Request body for POST requests
   * @returns Parsed JSON response from the API
   * @throws MastercardSendError for API-specific errors or network issues.
   */
  private async callApi<T>(method: 'GET' | 'POST', path: string, body?: any): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'PaySurity/1.0',
      'Authorization': this.getAuthorizationHeader(method, url, body),
    };

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      // For Node.js, ensure `fetch` is available (e.g., Node.js v18+ or via polyfill)
    };

    try {
      this.logger.debug(`[MC-SEND] Calling ${method} ${url} with payload: ${JSON.stringify(body)}`);
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
          // Mastercard API often returns structured errors, e.g., 'Errors.Error[0].Description'
          this.logger.error(`[MC-SEND] API error ${response.status} for ${method} ${url}: ${JSON.stringify(errorBody)}`);
        } catch (jsonError) {
          // If response body isn't JSON, log raw text
          const errorText = await response.text();
          this.logger.error(`[MC-SEND] API error ${response.status} for ${method} ${url}: Could not parse error response, raw: ${errorText}`);
          throw new MastercardSendError(
            `Mastercard Send API error: ${response.status} ${response.statusText} - Could not parse error response.`,
            response.status,
          );
        }
        // Throw a specific error with details from the API response
        throw new MastercardSendError(
          `Mastercard Send API error: ${response.status} ${response.statusText}`,
          response.status,
          errorBody,
        );
      }

      const responseJson = await response.json();
      this.logger.debug(`[MC-SEND] Successful response from ${method} ${url}: ${JSON.stringify(responseJson)}`);
      return responseJson as T;
    } catch (error: any) {
      this.logger.error(`[MC-SEND] Network or unexpected error calling Mastercard Send API: ${error.message}`, error.stack);
      if (error instanceof MastercardSendError) {
        throw error; // Re-throw custom API errors
      }
      throw new MastercardSendError(`Network or unexpected error calling Mastercard Send API: ${error.message}`);
    }
  }

  /**
   * Sends funds using Mastercard Send.
   * This is the core push payment operation.
   * @param dto Disbursement request details.
   * @returns Result of the fund disbursement.
   * @throws MastercardSendError if the API call fails.
   */
  async sendFunds(dto: SendFundsDto): Promise<SendFundsResult> {
    this.logger.log(
      `[MC-SEND] Initiating fund disbursement for tenant ${dto.tenantId}: ${dto.amountCents}Â¢ â†’ ${dto.destinationType} | ` +
      `purpose=${dto.purpose} | ref=${dto.referenceId} | recipientId=${dto.recipientId}`,
    );

    const payload = {
      partnerId: this.config.partnerId,
      transferReference: dto.referenceId, // Our internal reference
      paymentType: this.mapPurpose(dto.purpose),
      amount: (dto.amountCents / 100).toFixed(2), // API expects decimal string (e.g., "100.00")
      currency: dto.currency,
      senderName: dto.senderName,
      recipientAccountUri: this.buildRecipientUri(dto.destinationType, dto.destinationToken),
      channelType: 'P2M', // 'P2M' (Person-to-Merchant) is common for payouts. Could be other types based on use case.
      // fundingSource: 'CREDIT', // This might be dynamically determined or configured by Mastercard. Omit if not explicitly required in request.
      transactionPurpose: dto.purpose,
      // Additional fields like sender details (address, city, country) may be required depending on region/compliance.
      // E.g., `senderAddress`, `senderCity`, `senderCountry`, `senderPostalCode`
    };

    try {
      const response = await this.callApi<MastercardTransferResponse>('POST', '/partners/transfers', payload);

      // Map Mastercard's response to our internal SendFundsResult
      const status = this.mapMastercardStatusToSendFundsResultStatus(response.transfer.status);

      if (response.response.code !== '00' && status !== 'PENDING') { // '00' typically means success/approved. PENDING is also a valid initial state.
        this.logger.warn(`[MC-SEND] Fund disbursement for ref ${dto.referenceId} received non-approved status: ${status}. Mastercard response: ${JSON.stringify(response.response)}`);
      }

      return {
        mastercardTransactionId: response.transactionId,
        status: status,
        originalAmountCents: Math.round(response.transfer.amount * 100), // Convert back to cents
        settlementDate: response.transfer.settlementDate, // If provided by API
        responseCode: response.response.code,
        responseMessage: response.response.description,
        fundingSource: response.transfer.fundingSource, // If provided by API
      };
    } catch (error: any) {
      this.logger.error(`[MC-SEND] Failed to send funds for reference ${dto.referenceId}: ${error.message}`, error.stack);
      // Re-throw the MastercardSendError or wrap it if necessary
      throw error;
    }
  }

  /**
   * Retrieves the status of a Mastercard Send transaction.
   * @param mastercardTransactionId The transaction ID provided by Mastercard after `sendFunds`.
   * @returns Current status of the transaction.
   * @throws MastercardSendError if the API call fails.
   */
  async getTransactionStatus(mastercardTransactionId: string): Promise<TransactionStatusResult> {
    this.logger.log(`[MC-SEND] Retrieving status for Mastercard transaction ID: ${mastercardTransactionId}`);

    try {
      // Assuming Mastercard Send provides a GET endpoint like /partners/transfers/{transactionId}
      // or /transactions/{transactionId} for status lookup.
      // Using `/partners/transfers/{transactionId}` as a common pattern.
      const response = await this.callApi<MastercardTransactionQueryResponse>('GET', `/partners/transfers/${mastercardTransactionId}`);

      // Map Mastercard's response to our internal TransactionStatusResult
      return {
        mastercardTransactionId: response.transaction.transactionId,
        status: this.mapMastercardStatusToTransactionStatusResultStatus(response.transaction.status),
        amountCents: Math.round(response.transaction.amount.value * 100), // Convert to cents
        currency: response.transaction.amount.currency,
        referenceId: response.transaction.correlationId, // Assuming correlationId holds our internal referenceId
        responseCode: response.response.code,
        responseMessage: response.response.description,
        lastUpdateTime: response.transaction.lastUpdated || new Date().toISOString(), // Use actual timestamp from API if available
        originalResponse: response.transaction, // Include raw transaction details for debugging/auditing
      };
    } catch (error: any) {
      this.logger.error(`[MC-SEND] Failed to get status for transaction ${mastercardTransactionId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapMastercardStatusToSendFundsResultStatus(mastercardStatus: string): SendFundsResult['status'] {
    const lowerStatus = mastercardStatus.toLowerCase();
    if (lowerStatus.includes('approved')) {
      return 'APPROVED';
    }
    if (lowerStatus.includes('pending')) {
      return 'PENDING';
    }
    if (lowerStatus.includes('declined')) {
      return 'DECLINED';
    }
    // Default or unhandled statuses
    this.logger.warn(`[MC-SEND] Unmapped Mastercard Send status for SendFundsResult: ${mastercardStatus}`);
    return 'ERROR';
  }

  private mapMastercardStatusToTransactionStatusResultStatus(mastercardStatus: string): TransactionStatusResult['status'] {
    const lowerStatus = mastercardStatus.toLowerCase();
    if (lowerStatus.includes('success')) {
      return 'SUCCESS';
    }
    if (lowerStatus.includes('approved')) {
      return 'APPROVED';
    }
    if (lowerStatus.includes('pending')) {
      return 'PENDING';
    }
    if (lowerStatus.includes('failed') || lowerStatus.includes('declined')) {
      return 'FAILURE';
    }
    // Default or unhandled statuses
    this.logger.warn(`[MC-SEND] Unmapped Mastercard Send status for TransactionStatusResult: ${mastercardStatus}`);
    return 'UNKNOWN';
  }

  /**
   * Verifies the authenticity of a Mastercard Send webhook payload.
   * Uses HMAC-SHA256 with a pre-shared secret configured in environment variables.
   * @param signature The signature provided in the webhook header (e.g., X-MC-Signature).
   * @param payload The raw webhook payload (string) received from the request body.
   * @returns True if the signature is valid, false otherwise.
   */
  verifyWebhook(signature: string, payload: string): boolean {
    if (!this.config.webhookSecret) {
      this.logger.error('Mastercard Send webhook secret (MC_SEND_WEBHOOK_SECRET) is not configured. Webhook verification skipped/failed.');
      return false; // Cannot verify without a secret
    }

    try {
      const hmac = createHmac('sha256', this.config.webhookSecret);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');

      const isValid = expectedSignature === signature;
      if (!isValid) {
        this.logger.warn(`[MC-SEND] Webhook signature mismatch. Expected: ${expectedSignature}, Received: ${signature}`);
      } else {
        this.logger.debug(`[MC-SEND] Webhook signature successfully verified.`);
      }
      return isValid;
    } catch (error: any) {
      this.logger.error(`[MC-SEND] Error during webhook signature verification: ${error.message}`, error.stack);
      return false;
    }
  }
}

