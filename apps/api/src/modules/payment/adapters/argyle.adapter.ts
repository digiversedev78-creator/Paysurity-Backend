import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CircuitBreaker = require('opossum');
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
 * Argyle Payments Gateway Adapter
 *
 * Third of the 3 required Phase-1 gateways (FluidPay, NMI, Argyle).
 * RESTful JSON API, Bearer-token auth.
 *
 * Env vars:
 *   ARGYLE_API_KEY, ARGYLE_API_SECRET, ARGYLE_BASE_URL, ARGYLE_TIMEOUT_MS
 */

const ARGYLE_BASE_URL = 'https://api.argylepayments.com/v1';

interface ArgyleConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  timeoutMs: number;
}

@Injectable()
export class ArgyleAdapter implements IProviderAdapter {
  readonly providerName = 'ARGYLE';
  private readonly logger = new Logger(ArgyleAdapter.name);
  private readonly config: ArgyleConfig;
  private readonly breaker: any;

  constructor() {
    this.config = {
      apiKey: process.env.ARGYLE_API_KEY ?? '',
      apiSecret: process.env.ARGYLE_API_SECRET ?? '',
      baseUrl: process.env.ARGYLE_BASE_URL ?? ARGYLE_BASE_URL,
      timeoutMs: parseInt(process.env.ARGYLE_TIMEOUT_MS ?? '15000', 10),
    };

    this.breaker = new CircuitBreaker(this.callGateway.bind(this), {
      timeout: this.config.timeoutMs,
      errorThresholdPercentage: 50,
      resetTimeout: 30_000,
      volumeThreshold: 5,
      name: 'argyle-circuit',
    });

    this.breaker.on('open', () => this.logger.error('[CIRCUIT] Argyle circuit OPEN'));
    this.breaker.on('halfOpen', () => this.logger.warn('[CIRCUIT] Argyle circuit HALF-OPEN'));
    this.breaker.on('close', () => this.logger.log('[CIRCUIT] Argyle circuit CLOSED'));
  }

  // ── IProviderAdapter ────────────────────────────────────────

  async authorize(req: PaymentRequest, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[AUTHORIZE] ${req.amountCents}¢ ${req.currency} | key=${idempotencyKey}`);

    const body: Record<string, any> = {
      amount: req.amountCents,
      currency: req.currency,
      payment_token: req.paymentToken,
      capture: req.captureMethod === 'AUTOMATIC',
      payment_type: this.mapPaymentType(req.paymentMethodType),
    };

    if (req.terminalId) body.terminal_id = req.terminalId;
    if (req.metadata) body.metadata = req.metadata;

    const response = await this.breaker.fire('POST', '/charges', body, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async capture(gatewayIntentId: string, amountCents: number, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[CAPTURE] ${gatewayIntentId} | ${amountCents}¢`);
    const response = await this.breaker.fire('POST', `/charges/${gatewayIntentId}/capture`, {
      amount: amountCents,
    }, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async void(gatewayIntentId: string, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[VOID] ${gatewayIntentId}`);
    const response = await this.breaker.fire('POST', `/charges/${gatewayIntentId}/void`, {}, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async refund(gatewayIntentId: string, amountCents: number, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[REFUND] ${gatewayIntentId} | ${amountCents}¢`);
    const response = await this.breaker.fire('POST', `/charges/${gatewayIntentId}/refund`, {
      amount: amountCents,
    }, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async dispatchInstruction(instruction: SplitInstruction): Promise<LedgerResponse> {
    this.logger.log(`[SPLIT] ${instruction.gatewayIntentId} | fee=${instruction.platformFeeCents}¢`);
    try {
      const response = await this.breaker.fire('POST', `/settlement/split`, {
        charge_id: instruction.gatewayIntentId,
        platform_fee: instruction.platformFeeCents,
        merchant_amount: instruction.merchantNetCents,
        fee_rate: instruction.feeRateApplied,
        fee_schedule_id: instruction.feeScheduleId,
      }, `split:${instruction.gatewayIntentId}`) as any;

      return {
        success: true,
        settlementRef: response?.settlement_id ?? null,
        expectedSettlementDate: response?.expected_date ?? null,
      };
    } catch (error) {
      return {
        success: false,
        error: { code: 'ARGYLE_SPLIT_FAILED', message: error instanceof Error ? error.message : 'Unknown' },
      };
    }
  }

  async syncMerchantIdentity(metadata: ISO20022Metadata): Promise<SyncResponse> {
    this.logger.log(`[SYNC] Merchant: ${metadata.legalName} → Argyle`);
    try {
      const response = await this.breaker.fire('POST', '/merchants', {
        legal_name: metadata.legalName,
        dba_name: metadata.dbaName ?? metadata.legalName,
        mcc: metadata.mcc,
        address: {
          street: `${metadata.address.buildingNumber} ${metadata.address.streetName}`,
          city: metadata.address.townName,
          state: metadata.address.countrySubDivision,
          postal_code: metadata.address.postCode,
          country: metadata.address.country,
        },
        phone: metadata.phone,
        email: metadata.email,
      }, `merchant-sync:${metadata.taxIdSecretRef}`) as any;

      return { synced: true, gatewayMerchantId: response?.id ?? null };
    } catch (error) {
      return { synced: false, error: { code: 'ARGYLE_SYNC_FAILED', message: error instanceof Error ? error.message : 'Unknown' } };
    }
  }

  async getHealthStatus(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      await this.callGateway('GET', '/health', {}, '');
      return { status: 'HEALTHY', latency: Date.now() - start, checkedAt: new Date().toISOString() };
    } catch {
      return {
        status: this.breaker.opened ? 'DOWN' : 'DEGRADED',
        latency: Date.now() - start,
        checkedAt: new Date().toISOString(),
        details: { circuitState: this.breaker.opened ? 'OPEN' : 'CLOSED' },
      };
    }
  }

  // ── Private ─────────────────────────────────────────────────

  private async callGateway(method: string, path: string, body: Record<string, any>, idempotencyKey: string): Promise<Record<string, unknown>> {
    const url = `${this.config.baseUrl}${path}`;
    const authToken = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authToken}`,
    };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeoutMs),
    };
    if (method !== 'GET' && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json() as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(`Argyle ${method} ${path}: ${(data as any)?.error?.message ?? `HTTP ${response.status}`}`);
    }
    return data;
  }

  private mapResponse(raw: any): TransactionResponse {
    const data = raw?.data ?? raw;
    const status = String(data?.status ?? '').toLowerCase();

    return {
      gatewayIntentId: data?.id ?? data?.charge_id ?? '',
      authCode: data?.auth_code ?? undefined,
      status: status === 'captured' || status === 'settled' ? 'CAPTURED'
            : status === 'authorized' ? 'AUTHORIZED'
            : status === 'declined' ? 'DECLINED'
            : 'ERROR',
      lastFour: data?.card?.last4 ?? undefined,
      cardBrand: data?.card?.brand ?? undefined,
      failureCode: status === 'declined' ? data?.decline_code : undefined,
      failureMessage: status === 'declined' ? data?.decline_message : undefined,
      rawResponse: sanitizeGatewayResponse(raw as Record<string, unknown>),
    };
  }

  private mapPaymentType(type: PaymentRequest['paymentMethodType']): string {
    const map: Record<string, string> = {
      CARD_PRESENT: 'card_present',
      CARD_NP: 'card_not_present',
      ACH: 'ach',
      APPLE_PAY: 'apple_pay',
      GOOGLE_PAY: 'google_pay',
      EBT: 'ebt',
    };
    return map[type] ?? 'card_not_present';
  }
}
