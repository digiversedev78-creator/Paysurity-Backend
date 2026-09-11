/**
 * Mobile Payment Service (Apple Pay / Google Pay / Samsung Pay)
 * PORTED FROM: PS-Platform/shared/services/MobilePaymentService.ts (646 lines)
 *
 * Multi-provider abstraction for NFC/token-based mobile payments.
 * REQ: PLATSIS-001..005
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

// ─── Domain Interfaces ──────────────────────────────────────────────

export interface MobilePaymentRequest {
  amount: number;
  currency: string;
  merchantId: string;
  tenantId: string;
  customerId?: string;
  paymentToken: string;
  deviceId: string;
  biometricData?: string;
  provider: 'apple_pay' | 'google_pay' | 'samsung_pay';
  metadata?: Record<string, any>;
}

export interface MobilePaymentResult {
  success: boolean;
  transactionId: string;
  providerTransactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  fees?: number;
  error?: { code: string; message: string };
}

export interface ApplePayConfig {
  merchantId: string;
  merchantDisplayName: string;
  certificatePath: string;
  keyPath: string;
  environment: 'sandbox' | 'production';
}

export interface GooglePayConfig {
  merchantId: string;
  merchantName: string;
  environment: 'TEST' | 'PRODUCTION';
  gatewayMerchantId: string;
}

export interface SamsungPayConfig {
  serviceId: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
  certificatePath: string;
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class MobilePaymentService {
  private readonly logger = new Logger(MobilePaymentService.name);

  /**
   * Validate a mobile payment token.
   * In production: decode and verify token signature per provider spec.
   */
  validatePaymentToken(provider: MobilePaymentRequest['provider'], token: string): { valid: boolean; error?: string } {
    if (!token || token.length < 10) {
      return { valid: false, error: 'Invalid payment token' };
    }

    switch (provider) {
      case 'apple_pay':
        // Apple Pay: PKPaymentToken -- base64-encoded, signed by Apple
        if (!token.startsWith('eyJ')) {
          return { valid: false, error: 'Apple Pay token must be base64-encoded' };
        }
        break;
      case 'google_pay':
        // Google Pay: encrypted JSON with protocolVersion
        try { JSON.parse(atob(token)); } catch {
          return { valid: false, error: 'Google Pay token must be valid base64 JSON' };
        }
        break;
      case 'samsung_pay':
        if (!token.includes(':')) {
          return { valid: false, error: 'Samsung Pay token format invalid' };
        }
        break;
    }

    return { valid: true };
  }

  /**
   * Build the gateway-specific payload from a mobile payment request.
   * The output is ready to send to FluidPay/NMI/Argyle.
   */
  buildGatewayPayload(req: MobilePaymentRequest): Record<string, any> {
    const basePayload = {
      amount: req.amount,
      currency: req.currency,
      merchant_id: req.merchantId,
      payment_token: req.paymentToken,
      device_id: req.deviceId,
      transaction_id: randomUUID(),
    };

    switch (req.provider) {
      case 'apple_pay':
        return {
          ...basePayload,
          payment_source: 'apple_pay',
          token_type: 'PKPaymentToken',
          biometric_verified: !!req.biometricData,
        };
      case 'google_pay':
        return {
          ...basePayload,
          payment_source: 'google_pay',
          token_type: 'GooglePayToken',
        };
      case 'samsung_pay':
        return {
          ...basePayload,
          payment_source: 'samsung_pay',
          token_type: 'SamsungPayToken',
        };
      default:
        return basePayload;
    }
  }

  /**
   * Get supported providers for a merchant's configuration.
   */
  getSupportedProviders(merchantConfig: {
    applePayEnabled: boolean;
    googlePayEnabled: boolean;
    samsungPayEnabled: boolean;
  }): string[] {
    const providers: string[] = [];
    if (merchantConfig.applePayEnabled) providers.push('apple_pay');
    if (merchantConfig.googlePayEnabled) providers.push('google_pay');
    if (merchantConfig.samsungPayEnabled) providers.push('samsung_pay');
    return providers;
  }

  /**
   * Calculate processing fees for mobile payments.
   * Mobile payments typically have lower interchange rates.
   */
  calculateMobileFees(amount: number, provider: string): { interchangeFee: number; processingFee: number; totalFee: number } {
    const MOBILE_RATES: Record<string, { interchange: number; processing: number }> = {
      apple_pay:    { interchange: 0.015, processing: 0.005 }, // Lower due to tokenization
      google_pay:   { interchange: 0.018, processing: 0.005 },
      samsung_pay:  { interchange: 0.018, processing: 0.005 },
    };

    const rates = MOBILE_RATES[provider] ?? { interchange: 0.022, processing: 0.005 };
    const interchangeFee = Math.round(amount * rates.interchange);
    const processingFee = Math.round(amount * rates.processing);

    return { interchangeFee, processingFee, totalFee: interchangeFee + processingFee };
  }
}
