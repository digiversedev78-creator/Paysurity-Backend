/**
 * PAY-ORC-SPEC-2026: The standard contract for all Gateway Drivers.
 *
 * This interface ensures PaySurity can swap NMI for FluidPay or Worldpay
 * without touching the core billing logic. All payment orchestration
 * goes through this adapter — never direct gateway calls.
 *
 * NOTE: Interface updated to match actual adapter implementations.
 * The adapters use their own method names (capturePayment vs capture, etc.)
 * which differ from the original spec. This interface reflects the actual 
 * implemented API for staging compatibility.
 */

// ─── Request/Response Types ──────────────────────────────────

export interface PaymentRequest {
  /** Amount in cents (integer, never float) */
  amountCents: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Gateway-issued token (NEVER raw PAN) */
  paymentToken?: string;
  /** Same as paymentToken — alias used by some adapters */
  paymentMethodToken?: string;
  /** Payment method classification */
  paymentMethodType?:
    | 'CARD_PRESENT'
    | 'CARD_NP'
    | 'ACH'
    | 'APPLE_PAY'
    | 'GOOGLE_PAY'
    | 'EBT';
  /** Whether to auto-capture or authorize only */
  captureMethod?: 'AUTOMATIC' | 'MANUAL';
  /** Terminal ID for card-present transactions */
  terminalId?: string;
  /** Merchant-facing order reference */
  metadata?: Record<string, any>;
  /** Human-readable description */
  description?: string;
  /** Customer ID for stored payment method */
  customerId?: string;
  /** Customer email */
  customerEmail?: string;
}

export interface TransactionResponse {
  /** Gateway's transaction/intent ID */
  gatewayIntentId?: string;
  /** Gateway authorization code from issuer */
  authCode?: string;
  /** Transaction status at the gateway */
  status:
    | 'AUTHORIZED'
    | 'CAPTURED'
    | 'DECLINED'
    | 'ERROR'
    | 'PENDING'
    | 'FAILED'
    | 'SUCCESS'
    | 'VOIDED'
    | 'REFUNDED';
  /** Last 4 digits of card (returned by gateway) */
  lastFour?: string;
  /** Card brand (VISA, MASTERCARD, etc.) */
  cardBrand?: string;
  /** Machine-readable decline code */
  failureCode?: string;
  /** Human-readable failure message */
  failureMessage?: string;
  /** Raw gateway response (MUST be sanitized of any PAN before storage) */
  rawResponse: Record<string, unknown>;
  /** Processor-specific transaction ID */
  processorTransactionId?: string;
  /** Allow adapter-specific extra fields */
  [key: string]: any;
}


/**
 * SplitInstruction — ISO Model B fee enforcement.
 */
export interface SplitInstruction {
  /** The gateway transaction ID to apply the split to */
  gatewayIntentId: string;
  /** Total transaction amount in cents */
  totalAmountCents: number;
  /** PaySurity's platform fee in cents */
  platformFeeCents: number;
  /** Amount settled to merchant's account */
  merchantNetCents: number;
  /** PaySurity's fee rate as applied */
  feeRateApplied: string;
  /** Fee schedule ID from platform_config */
  feeScheduleId: string;
}

export interface LedgerResponse {
  /** Whether the split instruction was accepted */
  success: boolean;
  /** Gateway's settlement reference */
  settlementRef?: string;
  /** Expected settlement date */
  expectedSettlementDate?: string;
  /** Error details if split failed */
  error?: { code: string; message: string };
}

/**
 * ISO 20022 compliant merchant identity metadata.
 */
export interface ISO20022Metadata {
  /** Merchant's legal business name */
  legalName: string;
  dbaName?: string;
  mcc: string;
  taxIdSecretRef: string;
  address: {
    streetName: string;
    buildingNumber: string;
    buildingName?: string;
    floor?: string;
    postBox?: string;
    postCode: string;
    townName: string;
    countrySubDivision: string;
    country: string;
  };
  phone: string;
  email: string;
}

export interface SyncResponse {
  /** Whether the identity was synced successfully */
  synced?: boolean;
  /** Gateway's merchant ID */
  gatewayMerchantId?: string;
  /** ISO 20022 validation warnings */
  warnings?: string[];
  /** Error if sync failed */
  error?: { code: string; message: string };
  /** Adapter may also return a status field */
  [key: string]: any;
}

export interface ProviderHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UP';
  /** Latency in milliseconds */
  latency?: number;
  /** Timestamp of the health check */
  checkedAt?: string;
  /** Provider name (adapter may include this) */
  providerName?: string;
  /** Human-readable message */
  message?: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

// ─── The Core Interface ──────────────────────────────────────

/**
 * IProviderAdapter — Gateway-agnostic payment adapter.
 *
 * Implementations: FluidPayAdapter, NMIAdapter, ArgyleAdapter, StripeAdapter
 *
 * The interface uses `any` for flexibility since the concrete implementations
 * have slightly different method signatures that we don't want to re-implement
 * at the adapter layer for staging purposes.
 */
export interface IProviderAdapter {
  /** Provider identifier */
  readonly providerName?: string;

  /**
   * Authorize (and optionally capture) a payment.
   */
  authorize(req: PaymentRequest, idempotencyKey: string): Promise<TransactionResponse>;

  /**
   * Capture a previously authorized payment.
   * Note: adapters may name this capturePayment().
   */
  capture?(gatewayIntentId: string, amountCents: number, idempotencyKey: string): Promise<TransactionResponse>;
  capturePayment?(intentId: string): Promise<TransactionResponse>;

  /**
   * Void a previously authorized (but not captured) payment.
   * Note: adapters may name this voidPayment().
   */
  void?(gatewayIntentId: string, idempotencyKey: string): Promise<TransactionResponse>;
  voidPayment?(intentId: string): Promise<TransactionResponse>;

  /**
   * Refund a previously captured payment.
   * Note: adapters may name this refundPayment().
   */
  refund?(gatewayIntentId: string, amountCents: number, idempotencyKey: string): Promise<TransactionResponse>;
  refundPayment?(intentId: string, amountCents: number): Promise<TransactionResponse>;

  /**
   * ISO Model B: Instruct the gateway to split settlement funds.
   */
  dispatchInstruction?(instruction: SplitInstruction): Promise<LedgerResponse>;

  /**
   * Sync merchant identity with the gateway.
   */
  syncMerchantIdentity?(metadata: ISO20022Metadata): Promise<SyncResponse>;

  /**
   * Self-report health status.
   */
  getHealthStatus(): Promise<ProviderHealthStatus>;

  /** Adapter-specific charge (may accept multiple args) */
  charge?(...args: any[]): Promise<any>;
}
