import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class FluidPayService {
  private readonly logger = new Logger(FluidPayService.name);
  private readonly apiKey = process.env.FLUIDPAY_PRIVATE_KEY;
  private readonly baseUrl = process.env.FLUIDPAY_BASE_URL || 'https://sandbox.y2pconduit.com/api';
  private readonly breaker: any;

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {
    const CircuitBreaker = require('opossum');
    this.breaker = new CircuitBreaker(this.callFluidPay.bind(this), {
      timeout: 15000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });
    this.breaker.fallback(() => ({ success: false, status: 'CIRCUIT_OPEN', message: 'Gateway temporarily unavailable' }));
  }

  private async callFluidPay(endpoint: string, payload: any = null) {
    const method = payload ? 'POST' : 'GET';
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID()
      },
      body: payload ? JSON.stringify(payload) : undefined
    });
    
    if (!response.ok) {
       throw new Error(`FluidPay API returned ${response.status}`);
    }
    return response.json();
  }

  async authorizeCard(tenantId: string, intentId: string, cardDetails: { number: string; expiry: string; cvc: string; zip: string }) {
    this.logger.log(`[FluidPayService] Processing real credit card for Intent: ${intentId}`);

    // 1. Fetch the intent
    const intentResult = await (this.db as any).execute(sql`
      SELECT id, amount, currency, status FROM payment_intents
      WHERE id = ${intentId} AND tenant_id = ${tenantId} FOR UPDATE;
    `);
    
    const intent = ((intentResult as any).rows as any)[0];
    if (!intent) {
      throw new NotFoundException(`Payment Intent ${intentId} not found.`);
    }

    const { number, expiry, cvc, zip } = cardDetails;
    
    const payload = {
      type: 'auth', // pure auth
      amount: Math.round(intent.amount * 100),
      currency: 'USD',
      payment_method: {
        card: { number: number.replace(/\s/g, ''), expiration_date: expiry.replace('/', ''), cvc },
        billing_address: { postal_code: zip }
      },
      create_vault_record: true 
    };

    try {
      // Use Circuit Breaker
      const responseData = await this.breaker.fire('/v1/transactions', payload);
      
      if (responseData.status === 'CIRCUIT_OPEN') {
         throw new InternalServerErrorException(responseData.message);
      }
      
      if (responseData.data && responseData.data.status === 'declined') {
         this.logger.error(`FluidPay Auth Declined: ${JSON.stringify(responseData)}`);
         await (this.db as any).execute(sql`UPDATE payment_intents SET status = 'failed', updated_at = NOW() WHERE id = ${intentId};`);
         return { success: false, status: 'DECLINED', message: responseData.msg || 'Card Declined' };
      }

      const transactionId = responseData.data.id;

      // Immediately Capture the funds (Step 2)
      const captureData = await this.breaker.fire(`/v1/transactions/${transactionId}/capture`, {});

      if (captureData.status === 'CIRCUIT_OPEN') {
         throw new InternalServerErrorException(captureData.message);
      }

      if (captureData.data && captureData.data.status !== 'captured') {
         throw new Error('Capture failed after successful Auth');
      }

      // Record success in DB
      await (this.db as any).execute(sql`
         UPDATE payment_intents SET status = 'succeeded', external_id = ${transactionId}, updated_at = NOW()
         WHERE id = ${intentId};
      `);

      return { success: true, status: 'SUCCESS', transactionId };
      
    } catch (e: any) {
      this.logger.error(`FluidPay Connection Error: ${e.message}`);
      throw new InternalServerErrorException(`Gateway Error: ${e.message}`);
    }
  }
}


