/**
 * Payment Domain Types
 * PORTED FROM: PS-Platform/shared/types/payment.ts (218 lines)
 */

export type PaymentMethod = 'card' | 'bank_account' | 'digital_wallet' | 'crypto';

export interface CardDetails {
  number?: string;       // Tokenized / never stored raw
  lastFour: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay';
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  billingAddress?: Address;
}

export interface BankDetails {
  routingNumber: string;
  accountNumber: string; // Tokenized
  accountType: 'checking' | 'savings';
  bankName?: string;
}

export interface WalletDetails {
  walletType: 'apple_pay' | 'google_pay' | 'samsung_pay';
  token: string;
  deviceId?: string;
}

export interface CryptoDetails {
  currency: 'BTC' | 'ETH' | 'USDC' | 'USDT';
  walletAddress: string;
  network: string;
}

export interface PaymentRequest {
  tenantId: string;
  merchantId: string;
  amount: number;          // cents
  currency: string;
  paymentMethod: PaymentMethod;
  card?: CardDetails;
  bank?: BankDetails;
  wallet?: WalletDetails;
  crypto?: CryptoDetails;
  description?: string;
  metadata?: Record<string, any>;
  idempotencyKey: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fees: PaymentFees;
  netAmount: number;
  gatewayTransactionId?: string;
  processedAt: Date;
}

export interface PaymentFees {
  processingFee: number;
  interchangeFee: number;
  assessmentFee: number;
  totalFee: number;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;         // partial refund; omit for full
  reason: string;
  initiatedBy: string;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  status: TransactionStatus;
  processedAt: Date;
}

export type TransactionStatus =
  | 'pending' | 'processing' | 'authorized' | 'captured'
  | 'settled' | 'failed' | 'cancelled' | 'refunded'
  | 'partially_refunded' | 'voided' | 'disputed';

export type TransactionEventType =
  | 'payment.created' | 'payment.authorized' | 'payment.captured'
  | 'payment.settled' | 'payment.failed' | 'payment.voided'
  | 'payment.refunded' | 'payment.disputed'
  | 'settlement.initiated' | 'settlement.completed' | 'settlement.failed';

export interface GatewayConfig {
  primary: 'fluidpay' | 'nmi' | 'argyle';
  backup?: string;
  testMode: boolean;
  apiKey: string;
  webhookSecret?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
