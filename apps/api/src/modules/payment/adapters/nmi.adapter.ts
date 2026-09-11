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
 * NMI Payment Gateway Adapter
 *
 * NMI (Network Merchants Inc) -- one of the 3 required Phase-1 gateways.
 * RESTful API, token-based authentication, TSYS/First Data back-end.
 *
 * Env vars:
 *   NMI_API_KEY, NMI_BASE_URL, NMI_TIMEOUT_MS
 */

const NMI_BASE_URL = 'https://secure.nmi.com/api';

interface NMIConfig {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
}

@Injectable()
export class NMIAdapter implements IProviderAdapter {
  readonly providerName = 'NMI';
  private readonly logger = new Logger(NMIAdapter.name);
  private readonly config: NMIConfig;
  private readonly breaker: any;

  constructor() {
    this.config = {
      apiKey: process.env.NMI_API_KEY ?? '',
      baseUrl: process.env.NMI_BASE_URL ?? NMI_BASE_URL,
      timeoutMs: parseInt(process.env.NMI_TIMEOUT_MS ?? '15000', 10),
    };

    this.breaker = new CircuitBreaker(this.callGateway.bind(this), {
      timeout: this.config.timeoutMs,
      errorThresholdPercentage: 50,
      resetTimeout: 30_000,
      volumeThreshold: 5,
      name: 'nmi-circuit',
    });

    this.breaker.on('open', () => this.logger.error('[CIRCUIT] NMI circuit OPEN'));
    this.breaker.on('halfOpen', () => this.logger.warn('[CIRCUIT] NMI circuit HALF-OPEN'));
    this.breaker.on('close', () => this.logger.log('[CIRCUIT] NMI circuit CLOSED'));
  }

  // ── IProviderAdapter ────────────────────────────────────────

  async authorize(req: PaymentRequest, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[AUTHORIZE] ${req.amountCents}¢ ${req.currency} | key=${idempotencyKey}`);

    // NMI uses query-string-style POST body
    const params: Record<string, string> = {
      security_key: this.config.apiKey,
      type: req.captureMethod === 'AUTOMATIC' ? 'sale' : 'auth',
      amount: (req.amountCents / 100).toFixed(2),
      currency: req.currency,
      payment_token: req.paymentToken,
    };

    if (req.paymentMethodType === 'ACH') {
      params.type = 'sale';
      params.payment = 'check';
    }

    const response = await this.breaker.fire('POST', '/transact.php', params, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async capture(gatewayIntentId: string, amountCents: number, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[CAPTURE] ${gatewayIntentId} | ${amountCents}¢`);
    const response = await this.breaker.fire('POST', '/transact.php', {
      security_key: this.config.apiKey,
      type: 'capture',
      transactionid: gatewayIntentId,
      amount: (amountCents / 100).toFixed(2),
    }, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async void(gatewayIntentId: string, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[VOID] ${gatewayIntentId}`);
    const response = await this.breaker.fire('POST', '/transact.php', {
      security_key: this.config.apiKey,
      type: 'void',
      transactionid: gatewayIntentId,
    }, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async refund(gatewayIntentId: string, amountCents: number, idempotencyKey: string): Promise<TransactionResponse> {
    this.logger.log(`[REFUND] ${gatewayIntentId} | ${amountCents}¢`);
    const response = await this.breaker.fire('POST', '/transact.php', {
      security_key: this.config.apiKey,
      type: 'refund',
      transactionid: gatewayIntentId,
      amount: (amountCents / 100).toFixed(2),
    }, idempotencyKey) as any;
    return this.mapResponse(response);
  }

  async dispatchInstruction(instruction: SplitInstruction): Promise<LedgerResponse> {
    this.logger.log(`[SPLIT] ${instruction.gatewayIntentId} | fee=${instruction.platformFeeCents}¢`);
    // NMI handles split via sub-merchant settlement configuration
    // The split instruction is recorded and reconciled at settlement time
    return {
      success: true,
      settlementRef: `nmi_split_${instruction.gatewayIntentId}`,
      expectedSettlementDate: new Date(Date.now() + 86_400_000 * 2).toISOString().split('T')[0],
    };
  }

  async syncMerchantIdentity(metadata: ISO20022Metadata): Promise<SyncResponse> {
    this.logger.log(`[SYNC] Merchant: ${metadata.legalName} → NMI`);
    try {
      const response = await this.breaker.fire('POST', '/merchant', {
        security_key: this.config.apiKey,
        name: metadata.dbaName ?? metadata.legalName,
        legal_name: metadata.legalName,
        mcc: metadata.mcc,
        address: `${metadata.address.buildingNumber} ${metadata.address.streetName}`,
        city: metadata.address.townName,
        state: metadata.address.countrySubDivision,
        zip: metadata.address.postCode,
        country: metadata.address.country,
        phone: metadata.phone,
        email: metadata.email,
      }, `merchant-sync:${metadata.taxIdSecretRef}`) as any;

      return { synced: true, gatewayMerchantId: response?.merchant_id ?? null };
    } catch (error) {
      return { synced: false, error: { code: 'NMI_SYNC_FAILED', message: error instanceof Error ? error.message : 'Unknown' } };
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
    const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;

    // NMI uses URL-encoded form POST
    const formBody = Object.entries(body).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');

    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? formBody : undefined,
      signal: AbortSignal.timeout(this.config.timeoutMs),
    });

    const text = await response.text();
    // NMI returns key=value pairs or XML -- parse to object
    const parsed: Record<string, unknown> = {};
    text.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) parsed[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    });

    return parsed;
  }

  private mapResponse(raw: any): TransactionResponse {
    const responseCode = String(raw?.response ?? raw?.response_code ?? '');
    const isApproved = responseCode === '1';

    return {
      gatewayIntentId: String(raw?.transactionid ?? raw?.transaction_id ?? ''),
      authCode: raw?.authcode ?? undefined,
      status: isApproved ? 'CAPTURED' : responseCode === '2' ? 'DECLINED' : 'ERROR',
      lastFour: raw?.cc_number ? String(raw.cc_number).slice(-4) : undefined,
      cardBrand: raw?.cc_type ?? undefined,
      failureCode: !isApproved ? raw?.response_code : undefined,
      failureMessage: !isApproved ? raw?.responsetext : undefined,
      rawResponse: sanitizeGatewayResponse(raw as Record<string, unknown>),
    };
  }
}
