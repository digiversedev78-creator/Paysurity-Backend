import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CircuitBreaker = require('opossum');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');
import {
  IProviderAdapter,
  PaymentRequest,
  TransactionResponse,
  SplitInstruction,
  LedgerResponse,
  ISO20022Metadata,
  SyncResponse,
  ProviderHealthStatus
} from '../../../interfaces/IProviderAdapter';
import { sanitizeGatewayResponse } from '../../../shared/utils/sanitize-gateway-response';

/**
 * FluidPayAdapter -- implements IProviderAdapter for FluidPay gateway.
 *
 * PAY-REMEDIATION-S0 Item 5: Decoupling layer between ORC and gateway.
 *
 * All FluidPay API calls go through this adapter. The ORC module's
 * PaymentService calls ONLY through IProviderAdapter -- never FluidPay directly.
 *
 * Circuit breaker: opossum wraps every gateway call.
 * Idempotency: X-Idempotency-Key header sent on every mutable request.
 * PCI: sanitizeGatewayResponse() called before returning rawResponse.
 */

// Polyfill: HeadersInit is global in browsers/Deno but not always in Node
type HeadersInit = Record<string, string> | [string, string][] | Headers;

const FLUIDPAY_BASE_URL = 'https://sandbox.fluidpay.com/api'; // Default sandbox URL

interface FluidPayConfig {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetMs: number;
}

@Injectable()
export class FluidPayAdapter implements IProviderAdapter {
  readonly providerName = 'FLUIDS_PAY';
  private readonly logger = new Logger(FluidPayAdapter.name);
  private readonly config: FluidPayConfig;
  private readonly breaker: any;

  constructor() {
    this.config = {
      apiKey: process.env.FLUIDPAY_PRIVATE_KEY ?? '', // Aligns with existing setup
      baseUrl: process.env.FLUIDPAY_BASE_URL ?? FLUIDPAY_BASE_URL,
      timeoutMs: parseInt(process.env.FLUIDPAY_TIMEOUT_MS ?? '15000', 10),
      circuitBreakerThreshold: 5,
      circuitBreakerResetMs: 30000,
    };

    // Circuit breaker wraps all gateway calls
    this.breaker = new CircuitBreaker(this.callGateway.bind(this), {
      timeout: this.config.timeoutMs, // Request timeout for individual calls
      errorThresholdPercentage: 50,
      resetTimeout: this.config.circuitBreakerResetMs,
      volumeThreshold: this.config.circuitBreakerThreshold,
      name: 'fluidpay-circuit',
    });

    this.breaker.on('open', () =>
      this.logger.error('[CIRCUIT BREAKER] FluidPay circuit OPEN -- gateway degraded'),
    );
    this.breaker.on('halfOpen', () =>
      this.logger.warn('[CIRCUIT BREAKER] FluidPay circuit HALF-OPEN -- testing recovery'),
    );
    this.breaker.on('close', () =>
      this.logger.log('[CIRCUIT BREAKER] FluidPay circuit CLOSED -- gateway healthy'),
    );
  }

  /**
   * Internal method to make actual HTTP calls to the FluidPay API.
   * Wrapped by the circuit breaker.
   */
  private async callGateway(
    method: string,
    path: string,
    body?: any,
    idempotencyKey?: string,
  ): Promise<any> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.config.apiKey}`, // Using the private key for authentication
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (idempotencyKey && (method === 'POST' || method === 'PUT')) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }

    const fetchOptions: RequestInit = {
      method: method,
      headers: headers,
      // The circuit breaker itself handles the timeout. Native fetch in Node.js >= 18 supports AbortSignal for timeouts.
      // For broader compatibility and reliance on opossum's timeout, we omit a specific fetch timeout here.
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    this.logger.debug(`[CALL] ${method} ${url} | Body: ${body ? JSON.stringify(body) : 'N/A'}`);

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `[GATEWAY ERROR] ${method} ${url} | Status: ${response.status} | Body: ${errorText}`,
        );
        throw new Error(
          `FluidPay API Error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data = await response.json();
      this.logger.debug(`[GATEWAY RESPONSE] ${method} ${url} | Data: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      this.logger.error(`[NETWORK ERROR] ${method} ${url} | Error: ${error.message}`);
      throw error; // Re-throw to be caught by circuit breaker or the calling method
    }
  }

  // ── IProviderAdapter Implementation ─────────────────────────

  async authorize(
    req: PaymentRequest,
    idempotencyKey: string,
  ): Promise<TransactionResponse> {
    this.logger.log(
      `[AUTHORIZE] ${req.amountCents}¢ ${req.currency} | method=${req.paymentMethodType} | key=${idempotencyKey}`,
    );

    const fluidPayBody: any = {
      type: 'auth', // For authorization only (pre-capture)
      amount: req.amountCents,
      currency: req.currency,
      token: req.paymentMethodToken, // Assuming req.paymentMethodToken is the FluidPay token
      description: req.description,
      customer: {
        id: req.customerId,
        email: req.customerEmail,
      },
      // FluidPay supports a generic 'metadata' field or custom fields.
      // Assuming 'metadata' for simplicity.
      metadata: req.metadata,
    };

    try {
      const fluidPayResponse = await this.breaker.fire(
        'POST',
        '/v1/transactions', // Endpoint for creating transactions (auth, sale, etc.)
        fluidPayBody,
        idempotencyKey,
      );

      const rawResponse = sanitizeGatewayResponse(fluidPayResponse);
      const isApproved = fluidPayResponse?.data?.status === 'authorized' || fluidPayResponse?.data?.status === 'approved';

      return {
        status: isApproved ? 'AUTHORIZED' : 'FAILED',
        processorTransactionId: fluidPayResponse?.data?.id ?? '',
        processorResponseCode: fluidPayResponse?.data?.processor_response_code,
        processorResponseText: fluidPayResponse?.data?.processor_response_text,
        amountCents: fluidPayResponse?.data?.amount ?? req.amountCents,
        currency: fluidPayResponse?.data?.currency ?? req.currency,
        rawResponse: rawResponse,
      };
    } catch (error) {
      this.logger.error(`[AUTHORIZE_ERROR] ${error.message}`);
      return {
        status: 'FAILED',
        processorTransactionId: '',
        processorResponseCode: 'PROVIDER_ERROR',
        processorResponseText: error.message,
        amountCents: req.amountCents,
        currency: req.currency,
        rawResponse: sanitizeGatewayResponse({ error: error.message }),
      };
    }
  }

  // Methods requested by the task:

  async createPaymentIntent(
    amountCents: number,
    currency: string,
    metadata?: Record<string, any>,
  ): Promise<{ intentId: string; status: 'PENDING' | 'REQUIRES_ACTION' | 'SUCCESS' | 'FAILED'; rawResponse: any }> {
    this.logger.log(
      `[CREATE_PAYMENT_INTENT] ${amountCents}¢ ${currency}`,
    );
    const idempotencyKey = uuidv4(); // Generate a new idempotency key for this operation

    const fluidPayBody: any = {
      type: 'auth', // An intent typically represents an authorization or a pre-approval
      amount: amountCents,
      currency: currency,
      metadata: metadata,
      // No payment method here; it will be provided when the intent is confirmed/captured.
    };

    try {
      const fluidPayResponse = await this.breaker.fire(
        'POST',
        '/v1/transactions', // Create an authorization transaction to act as the intent
        fluidPayBody,
        idempotencyKey,
      );

      const rawResponse = sanitizeGatewayResponse(fluidPayResponse);
      const transactionStatus = fluidPayResponse?.data?.status;

      let intentStatus: 'PENDING' | 'REQUIRES_ACTION' | 'SUCCESS' | 'FAILED' = 'FAILED';
      if (transactionStatus === 'authorized' || transactionStatus === 'approved') {
        intentStatus = 'PENDING'; // Authorized, awaiting capture
      }
      // FluidPay specific logic for REQUIRES_ACTION would go here (e.g., 3DS challenges)
      // For now, assuming direct success or failure of authorization.

      return {
        intentId: fluidPayResponse?.data?.id ?? '',
        status: intentStatus,
        rawResponse: rawResponse,
      };
    } catch (error) {
      this.logger.error(`[CREATE_PAYMENT_INTENT_ERROR] ${error.message}`);
      return {
        intentId: '',
        status: 'FAILED',
        rawResponse: sanitizeGatewayResponse({ error: error.message }),
      };
    }
  }

  async capturePayment(intentId: string): Promise<TransactionResponse> {
    this.logger.log(`[CAPTURE_PAYMENT] intentId=${intentId}`);
    const idempotencyKey = uuidv4(); // Generate a new idempotency key for this operation

    try {
      const fluidPayResponse = await this.breaker.fire(
        'POST',
        `/v1/transactions/${intentId}/capture`,
        {}, // Capture usually doesn't require a specific body, other than the ID
        idempotencyKey,
      );

      const rawResponse = sanitizeGatewayResponse(fluidPayResponse);
      const isCaptured = fluidPayResponse?.data?.status === 'captured' || fluidPayResponse?.data?.status === 'approved';

      return {
        status: isCaptured ? 'SUCCESS' : 'FAILED',
        processorTransactionId: fluidPayResponse?.data?.id ?? intentId,
        processorResponseCode: fluidPayResponse?.data?.processor_response_code,
        processorResponseText: fluidPayResponse?.data?.processor_response_text,
        amountCents: fluidPayResponse?.data?.amount ?? 0,
        currency: fluidPayResponse?.data?.currency ?? '',
        rawResponse: rawResponse,
      };
    } catch (error) {
      this.logger.error(`[CAPTURE_PAYMENT_ERROR] ${error.message}`);
      return {
        status: 'FAILED',
        processorTransactionId: intentId,
        processorResponseCode: 'PROVIDER_ERROR',
        processorResponseText: error.message,
        amountCents: 0,
        currency: '',
        rawResponse: sanitizeGatewayResponse({ error: error.message }),
      };
    }
  }

  async voidPayment(intentId: string): Promise<TransactionResponse> {
    this.logger.log(`[VOID_PAYMENT] intentId=${intentId}`);
    const idempotencyKey = uuidv4(); // Generate a new idempotency key for this operation

    try {
      const fluidPayResponse = await this.breaker.fire(
        'POST',
        `/v1/transactions/${intentId}/void`,
        {}, // Void usually doesn't require a body
        idempotencyKey,
      );

      const rawResponse = sanitizeGatewayResponse(fluidPayResponse);
      const isVoided = fluidPayResponse?.data?.status === 'voided' || fluidPayResponse?.data?.status === 'declined';

      return {
        status: isVoided ? 'SUCCESS' : 'FAILED',
        processorTransactionId: fluidPayResponse?.data?.id ?? intentId,
        processorResponseCode: fluidPayResponse?.data?.processor_response_code,
        processorResponseText: fluidPayResponse?.data?.processor_response_text,
        amountCents: fluidPayResponse?.data?.amount ?? 0,
        currency: fluidPayResponse?.data?.currency ?? '',
        rawResponse: rawResponse,
      };
    } catch (error) {
      this.logger.error(`[VOID_PAYMENT_ERROR] ${error.message}`);
      return {
        status: 'FAILED',
        processorTransactionId: intentId,
        processorResponseCode: 'PROVIDER_ERROR',
        processorResponseText: error.message,
        amountCents: 0,
        currency: '',
        rawResponse: sanitizeGatewayResponse({ error: error.message }),
      };
    }
  }

  async refundPayment(intentId: string, amountCents: number): Promise<TransactionResponse> {
    this.logger.log(
      `[REFUND_PAYMENT] intentId=${intentId} | amount=${amountCents}¢`,
    );
    const idempotencyKey = uuidv4(); // Generate a new idempotency key for this operation

    const fluidPayBody = {
      amount: amountCents, // Amount to refund
    };

    try {
      const fluidPayResponse = await this.breaker.fire(
        'POST',
        `/v1/transactions/${intentId}/refund`,
        fluidPayBody,
        idempotencyKey,
      );

      const rawResponse = sanitizeGatewayResponse(fluidPayResponse);
      const isRefunded = fluidPayResponse?.data?.status === 'refunded' || fluidPayResponse?.data?.status === 'approved';

      return {
        status: isRefunded ? 'SUCCESS' : 'FAILED',
        processorTransactionId: fluidPayResponse?.data?.id ?? intentId,
        processorResponseCode: fluidPayResponse?.data?.processor_response_code,
        processorResponseText: fluidPayResponse?.data?.processor_response_text,
        amountCents: fluidPayResponse?.data?.amount ?? amountCents, // FluidPay should return the actual refunded amount
        currency: fluidPayResponse?.data?.currency ?? '',
        rawResponse: rawResponse,
      };
    } catch (error) {
      this.logger.error(`[REFUND_PAYMENT_ERROR] ${error.message}`);
      return {
        status: 'FAILED',
        processorTransactionId: intentId,
        processorResponseCode: 'PROVIDER_ERROR',
        processorResponseText: error.message,
        amountCents: amountCents,
        currency: '',
        rawResponse: sanitizeGatewayResponse({ error: error.message }),
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<SyncResponse> {
    this.logger.log(`[GET_TRANSACTION_STATUS] transactionId=${transactionId}`);

    try {
      const fluidPayResponse = await this.breaker.fire(
        'GET',
        `/v1/transactions/${transactionId}`,
      );

      const rawResponse = sanitizeGatewayResponse(fluidPayResponse);
      let transactionStatus: SyncResponse['status'];
      switch (fluidPayResponse?.data?.status) {
        case 'approved':
        case 'authorized':
          transactionStatus = 'AUTHORIZED';
          break;
        case 'captured':
        case 'settled':
          transactionStatus = 'SUCCESS';
          break;
        case 'voided':
          transactionStatus = 'VOIDED';
          break;
        case 'refunded':
          transactionStatus = 'REFUNDED';
          break;
        case 'declined':
        case 'failed':
          transactionStatus = 'FAILED';
          break;
        default:
          transactionStatus = 'UNKNOWN';
          break;
      }

      return {
        status: transactionStatus,
        processorTransactionId: fluidPayResponse?.data?.id ?? transactionId,
        amountCents: fluidPayResponse?.data?.amount ?? 0,
        currency: fluidPayResponse?.data?.currency ?? '',
        processorResponseCode: fluidPayResponse?.data?.processor_response_code,
        processorResponseText: fluidPayResponse?.data?.processor_response_text,
        rawResponse: rawResponse,
      };
    } catch (error) {
      this.logger.error(`[GET_TRANSACTION_STATUS_ERROR] ${error.message}`);
      return {
        status: 'UNKNOWN', // If we can't even get the status, it's unknown or failed to retrieve
        processorTransactionId: transactionId,
        amountCents: 0,
        currency: '',
        processorResponseCode: 'PROVIDER_ERROR',
        processorResponseText: error.message,
        rawResponse: sanitizeGatewayResponse({ error: error.message }),
      };
    }
  }

  // ── Other IProviderAdapter methods (stubs as they are not part of the current task) ────

  async createCustomer(
    customerId: string,
    email: string,
    metadata?: Record<string, any>,
  ): Promise<any> {
    this.logger.warn(`[CREATE_CUSTOMER] Not implemented for FluidPayAdapter`);
    throw new Error('Method not implemented.');
  }

  async getPaymentMethods(customerId: string): Promise<any> {
    this.logger.warn(`[GET_PAYMENT_METHODS] Not implemented for FluidPayAdapter`);
    throw new Error('Method not implemented.');
  }

  async addPaymentMethod(customerId: string, token: string): Promise<any> {
    this.logger.warn(`[ADD_PAYMENT_METHOD] Not implemented for FluidPayAdapter`);
    throw new Error('Method not implemented.');
  }

  async removePaymentMethod(customerId: string, paymentMethodId: string): Promise<any> {
    this.logger.warn(`[REMOVE_PAYMENT_METHOD] Not implemented for FluidPayAdapter`);
    throw new Error('Method not implemented.');
  }

  async charge(
    req: PaymentRequest,
    idempotencyKey: string,
    splitInstructions?: SplitInstruction[],
    iso20022Metadata?: ISO20022Metadata,
  ): Promise<TransactionResponse> {
    this.logger.warn(`[CHARGE] Not implemented for FluidPayAdapter. Use authorize/capture flow.`);
    throw new Error('Method not implemented.');
  }

  async getHealthStatus(): Promise<ProviderHealthStatus> {
    this.logger.log(`[GET_HEALTH_STATUS] Checking FluidPay API status`);
    try {
      // Attempt a lightweight, preferably unauthenticated, GET request to check connectivity
      // Assuming FluidPay has a basic health or status endpoint. If not, a simple GET to a known path that returns quickly.
      // E.g., a non-existent path that would still hit the server and return a 404, proving connectivity.
      // For now, let's assume /v1/health or a generic GET on transactions list (with auth)
      await this.breaker.fire('GET', '/v1/transactions?limit=1', undefined, uuidv4()); // Use a valid authenticated endpoint that requires minimal processing
      return {
        status: 'HEALTHY' as const,
        latency: 0,
        checkedAt: new Date().toISOString(),
        details: { providerName: this.providerName, message: 'Successfully connected to FluidPay API' },
      };
    } catch (error) {
      this.logger.error(`[HEALTH_CHECK_ERROR] FluidPay API is DOWN: ${error.message}`);
      return {
        status: 'DOWN' as const,
        latency: -1,
        checkedAt: new Date().toISOString(),
        details: { providerName: this.providerName, message: `Failed to connect to FluidPay API: ${error.message}` },
      };
    }
  }

  async syncLedger(): Promise<LedgerResponse> {
    this.logger.warn(`[SYNC_LEDGER] Not implemented for FluidPayAdapter`);
    throw new Error('Method not implemented.');
  }
}
