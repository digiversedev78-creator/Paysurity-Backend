/**
 * QR Code Service
 * PORTED FROM: PS-Platform/shared/services/QRCodeService.ts (224 lines)
 *
 * QR code generation for payment, menu, loyalty, contact, and URL types.
 * Supports dynamic QR codes with expiration and usage tracking.
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

// ─── Domain Interfaces ──────────────────────────────────────────────

export type QRCodeType = 'payment' | 'menu' | 'loyalty' | 'contact' | 'url';

export interface QRCodeData {
  id: string;
  type: QRCodeType;
  data: Record<string, any>;
  url?: string;
  expiresAt?: Date;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  scanCount: number;
}

export interface QRCodePaymentData {
  merchantId: string;
  merchantName: string;
  amount?: number;      // Fixed amount (optional -- dynamic if omitted)
  currency: string;
  reference?: string;
}

export interface QRCodeMenuData {
  merchantId: string;
  menuUrl: string;
  tableNumber?: number;
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);
  private readonly BASE_URL = process.env.QR_BASE_URL ?? 'https://qr.paysurity.com';

  /**
   * Generate a QR code record. The actual image is rendered client-side
   * using the returned `url` or `data` payload.
   */
  generateQRCode(input: {
    type: QRCodeType;
    data: Record<string, any>;
    tenantId: string;
    createdBy: string;
    expiresAt?: Date;
  }): QRCodeData {
    const id = randomUUID();
    const encodedPayload = Buffer.from(JSON.stringify({ id, type: input.type, data: input.data })).toString('base64url');
    const url = `${this.BASE_URL}/scan/${encodedPayload}`;

    const qr: QRCodeData = {
      id,
      type: input.type,
      data: input.data,
      url,
      expiresAt: input.expiresAt,
      tenantId: input.tenantId,
      createdBy: input.createdBy,
      createdAt: new Date(),
      isActive: true,
      scanCount: 0,
    };

    this.logger.log(`[QR] Generated ${input.type} QR | tenant=${input.tenantId} id=${id}`);
    return qr;
  }

  /**
   * Generate a payment QR code (for table-side or scan-to-pay).
   */
  generatePaymentQR(
    tenantId: string, merchantId: string, merchantName: string,
    amount?: number, currency = 'USD', createdBy = 'system',
  ): QRCodeData {
    return this.generateQRCode({
      type: 'payment',
      data: { merchantId, merchantName, amount, currency } as Record<string, any>,
      tenantId,
      createdBy,
    });
  }

  /**
   * Generate a menu QR code (for restaurant table tent cards).
   */
  generateMenuQR(
    tenantId: string, merchantId: string, menuUrl: string,
    tableNumber?: number, createdBy = 'system',
  ): QRCodeData {
    return this.generateQRCode({
      type: 'menu',
      data: { merchantId, menuUrl, tableNumber } as Record<string, any>,
      tenantId,
      createdBy,
    });
  }

  /**
   * Validate and decode a scanned QR payload.
   */
  decodeQR(encodedPayload: string): { valid: boolean; data?: { id: string; type: QRCodeType; data: Record<string, any> }; error?: string } {
    try {
      const decoded = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (!parsed.id || !parsed.type) {
        return { valid: false, error: 'Missing required QR fields' };
      }
      return { valid: true, data: parsed };
    } catch {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  /**
   * Check if a QR code has expired.
   */
  isExpired(qr: QRCodeData): boolean {
    if (!qr.expiresAt) return false;
    return new Date() > qr.expiresAt;
  }
}
