/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-007 -- QR Code Table Pay
 * FILE TYPE:    SERVICE
 * MODULE:       payment
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-053
 * GENERATED:    2026-03-17T13:07:52.326Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, InternalServerErrorException, Logger, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PaymentIntentResponseDto, PaymentIntentStatus, CreatePaymentIntentDto, ConfirmPaymentIntentDto } from '../dto/qr-code-table-pay.dto';
import { EventBusService } from '../event-bus/event-bus.service';
import { GatewayRouter } from './adapters/gateway-router';

// Strict Rule #2: Use correct Drizzle client injection
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm'; // Import sql for raw queries

// Define interfaces for database entities for type safety after raw SQL queries
// These interfaces represent the structure of rows returned from raw SQL queries.
interface PaymentIntentDbRecord {
  id: string;
  tenant_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  client_secret: string;
  metadata: Record<string, any> | null;
  external_id: string | null;
  created_at: Date;
  updated_at: Date;
}

interface PaymentDbRecord {
  id: string;
  tenant_id: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string; // e.g., 'approved', 'captured', 'voided', 'refunded'
  type: string; // e.g., 'charge', 'refund', 'void'
  transaction_id: string;
  processor_response: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    private readonly eventBus: EventBusService,
    private readonly gatewayRouter: GatewayRouter,
  ) {}

  /**
   * Creates a new payment intent record in the database.
   * This represents the intention to collect a payment.
   */
  async createPaymentIntent(tenantId: string, userId: string, createPaymentIntentDto: CreatePaymentIntentDto): Promise<PaymentIntentResponseDto> {
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const status = PaymentIntentStatus.REQUIRES_PAYMENT_METHOD;

    try {
      const result = await (this.db as any).execute(sql`
        INSERT INTO payment_intents (
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), ${tenantId}, ${(createPaymentIntentDto as any).orderId}, ${(createPaymentIntentDto as any).amount}, 'USD',
            ${status}, ${clientSecret}, ${JSON.stringify((createPaymentIntentDto as any).metadata || {})}, NOW(), NOW()
        )
        RETURNING id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at;
      `);

      const paymentIntent: PaymentIntentDbRecord = ((result as any).rows as any)[0] as PaymentIntentDbRecord;

      if (!paymentIntent) {
        throw new InternalServerErrorException('Failed to create payment intent.');
      }

      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_CREATED',
        details: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount, orderId: paymentIntent.order_id },
      });

      await this.eventBus.publishPaymentEvent({
        eventName: 'payment.intent.created',
        tenantId,
        traceId: crypto.randomUUID(),
        payload: { paymentIntent },
        publishedAt: new Date().toISOString(),
        idempotencyKey: paymentIntent.id + '-created',
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to create payment intent for tenant ${tenantId}: ${error.message}`, error.stack);
      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_CREATION_FAILED',
        details: { orderId: (createPaymentIntentDto as any).orderId, amount: (createPaymentIntentDto as any).amount, errorMsg: error.message }
      });
      throw new InternalServerErrorException('Failed to create payment intent.');
    }
  }

  /**
   * Retrieves a payment intent by its ID for a specific tenant.
   */
  async getPaymentIntent(tenantId: string, intentId: string): Promise<PaymentIntentResponseDto> {
    try {
      const result = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at
        FROM
            payment_intents
        WHERE
            id = ${intentId} AND tenant_id = ${tenantId};
      `);

      const paymentIntent: PaymentIntentDbRecord = ((result as any).rows as any)[0] as PaymentIntentDbRecord;

      if (!paymentIntent) {
        throw new NotFoundException(`Payment Intent with ID ${intentId} not found.`);
      }

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
        externalId: paymentIntent.external_id,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve payment intent ${intentId} for tenant ${tenantId}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve payment intent.');
    }
  }

  /**
   * Confirms a payment intent by processing the payment through the FluidPay adapter.
   * This typically involves charging a payment method.
   */
  async confirmPaymentIntent(tenantId: string, userId: string, intentId: string, confirmPaymentIntentDto: ConfirmPaymentIntentDto): Promise<PaymentIntentResponseDto> {
    let paymentIntent: PaymentIntentDbRecord;

    try {
      // 1. Retrieve the payment intent
      const intentResult = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at
        FROM
            payment_intents
        WHERE
            id = ${intentId} AND tenant_id = ${tenantId} FOR UPDATE; -- Use FOR UPDATE for optimistic locking
      `);

      paymentIntent = ((intentResult as any).rows as any)[0];

      if (!paymentIntent) {
        throw new NotFoundException(`Payment Intent with ID ${intentId} not found.`);
      }

      if (paymentIntent.status !== PaymentIntentStatus.REQUIRES_PAYMENT_METHOD) {
        throw new InternalServerErrorException(`Payment Intent ${intentId} is not in a confirmable state.`);
      }

      // 2. Process payment via GatewayRouter
      const tenantContext = await (this.db as any).execute(sql`SELECT status, payout_locked FROM tenants WHERE id = ${tenantId} LIMIT 1`);
      const tenant = ((tenantContext as any).rows as any)[0];
      if (!tenant) throw new InternalServerErrorException(`Tenant ${tenantId} context missing.`);
      
      const isProvisional = tenant.status === 'PROVISIONAL';
      const captureStrategy = isProvisional ? 'AUTOMATIC' : 'MANUAL';

      const adapter = this.gatewayRouter.resolve(undefined, tenantId);
      const gatewayResponse = await adapter.authorize({
        amountCents: Math.round(paymentIntent.amount * 100), // Ensuring cents
        currency: paymentIntent.currency,
        paymentToken: (confirmPaymentIntentDto as any).paymentMethodId,
        paymentMethodType: 'CARD_NP',
        captureMethod: captureStrategy as any,
        metadata: {
          tenantId,
          orderId: paymentIntent.order_id,
          paymentIntentId: paymentIntent.id,
        } as Record<string, string>,
      }, paymentIntent.id);

      // 2.5 Cryptographic Settlement Hold
      if (isProvisional && (gatewayResponse.status === 'CAPTURED' || captureStrategy === 'AUTOMATIC')) {
        try {
          if (tenant.payout_locked !== true) {
            await (this.db as any).execute(sql`UPDATE tenants SET payout_locked = TRUE, updated_at = NOW() WHERE id = ${tenantId}`);
          }
          (this.auditLogService as any).record(tenantId, {
            userId: userId,
            action: 'PROVISIONAL_PAYOUT_LOCK_ENGAGED',
            details: { reason: "Instant Start mode dictates auto-capture. Payout locked until KYB resolves." }
          });
        } catch (dbError) {
          this.logger.error(`FATAL: DB Lock failed for tenant ${tenantId}. Initiating emergency void!`, dbError);
          if (adapter.voidPayment && gatewayResponse.gatewayIntentId) {
             await adapter.voidPayment(gatewayResponse.gatewayIntentId);
          }
          throw new InternalServerErrorException('System integrity fault during provisional capture. Transaction voided.');
        }
      }

      if (gatewayResponse.status === 'ERROR' || gatewayResponse.status === 'DECLINED') {
        // Update payment intent status to failed, log, and throw
        await (this.db as any).execute(sql`
          UPDATE payment_intents
          SET status = ${PaymentIntentStatus.FAILED}, updated_at = NOW()
          WHERE id = ${paymentIntent.id} AND tenant_id = ${tenantId};
        `);
        throw new InternalServerErrorException(`Payment processing failed: ${gatewayResponse.failureMessage || 'Unknown error'}`);
      }

      const newPaymentStatus = gatewayResponse.status === 'CAPTURED' ? PaymentIntentStatus.SUCCEEDED : PaymentIntentStatus.REQUIRES_CONFIRMATION;

      // 3. Record the payment
      const paymentResult = await (this.db as any).execute(sql`
        INSERT INTO payments (
            id, tenant_id, payment_intent_id, amount, currency, status, type, transaction_id, processor_response, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), ${tenantId}, ${paymentIntent.id}, ${(gatewayResponse.amountCents || Math.round(paymentIntent.amount * 100)) / 100}, ${paymentIntent.currency},
            ${gatewayResponse.status}, 'charge', ${gatewayResponse.gatewayIntentId},
            ${JSON.stringify(gatewayResponse.rawResponse || {})}, NOW(), NOW()
        )
        RETURNING *;
      `);
      const payment: PaymentDbRecord = ((paymentResult as any).rows as any)[0] as PaymentDbRecord;

      // 4. Update payment intent status and external_id
      const updatedIntentResult = await (this.db as any).execute(sql`
        UPDATE payment_intents
        SET
            status = ${newPaymentStatus},
            external_id = ${gatewayResponse.gatewayIntentId},
            updated_at = NOW()
        WHERE
            id = ${paymentIntent.id} AND tenant_id = ${tenantId}
        RETURNING id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at;
      `);
      paymentIntent = ((updatedIntentResult as any).rows as any)[0];

      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_CONFIRMED',
        details: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          transactionId: payment.transaction_id,
          status: paymentIntent.status,
        },
      });

      await this.eventBus.publishPaymentEvent({
        eventName: 'payment.intent.confirmed',
        tenantId,
        traceId: crypto.randomUUID(),
        payload: { paymentIntent, payment },
        publishedAt: new Date().toISOString(),
        idempotencyKey: paymentIntent.id + '-confirmed',
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
        externalId: paymentIntent.external_id,
      };
    } catch (error) {
      this.logger.error(`Failed to confirm payment intent ${intentId} for tenant ${tenantId}: ${error.message}`, error.stack);
      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_CONFIRMATION_FAILED',
        details: { paymentIntentId: intentId, errorMsg: error.message }
      });
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to confirm payment intent.');
    }
  }

  /**
   * Captures a payment intent that was previously authorized (RequiresCapture status).
   */
  async capturePaymentIntent(tenantId: string, userId: string, intentId: string): Promise<PaymentIntentResponseDto> {
    let paymentIntent: PaymentIntentDbRecord;
    let paymentRecord: PaymentDbRecord;

    try {
      // 1. Retrieve the payment intent
      const intentResult = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at
        FROM
            payment_intents
        WHERE
            id = ${intentId} AND tenant_id = ${tenantId} FOR UPDATE;
      `);
      paymentIntent = ((intentResult as any).rows as any)[0];

      if (!paymentIntent) {
        throw new NotFoundException(`Payment Intent with ID ${intentId} not found.`);
      }

      if (paymentIntent.status !== PaymentIntentStatus.REQUIRES_CONFIRMATION) {
        throw new InternalServerErrorException(`Payment Intent ${intentId} is not in a capturable state.`);
      }
      if (!paymentIntent.external_id) {
        throw new InternalServerErrorException(`Payment Intent ${intentId} does not have an associated external transaction ID for capture.`);
      }

      // 2. Retrieve the associated payment record
      const paymentResult = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, payment_intent_id, amount, currency, status, type, transaction_id, processor_response, created_at, updated_at
        FROM
            payments
        WHERE
            payment_intent_id = ${paymentIntent.id} AND tenant_id = ${tenantId} AND transaction_id = ${paymentIntent.external_id} FOR UPDATE;
      `);
      paymentRecord = ((paymentResult as any).rows as any)[0];

      if (!paymentRecord) {
        throw new InternalServerErrorException(`Payment record not found for intent ${intentId}.`);
      }
      if (paymentRecord.status !== 'approved') {
        throw new InternalServerErrorException(`Payment transaction ${paymentRecord.transaction_id} is not in an authorized state for capture.`);
      }

      // 3. Call Gateway Router capture
      const adapter = this.gatewayRouter.resolve(undefined, tenantId);
      const gatewayResponse = await adapter.capture(
        paymentRecord.transaction_id,
        Math.round(paymentRecord.amount * 100),
        crypto.randomUUID()
      );

      if (gatewayResponse.status === 'ERROR' || gatewayResponse.status === 'DECLINED') {
        await (this.db as any).execute(sql`
          UPDATE payments
          SET status = 'capture_failed', updated_at = NOW()
          WHERE id = ${paymentRecord.id} AND tenant_id = ${tenantId};
        `);
        await (this.db as any).execute(sql`
          UPDATE payment_intents
          SET status = ${PaymentIntentStatus.FAILED}, updated_at = NOW()
          WHERE id = ${paymentIntent.id} AND tenant_id = ${tenantId};
        `);
        throw new InternalServerErrorException(`Payment capture failed: ${gatewayResponse.failureMessage || 'Unknown error'}`);
      }

      // 4. Update payment record status
      await (this.db as any).execute(sql`
        UPDATE payments
        SET
            status = ${gatewayResponse.status},
            processor_response = ${JSON.stringify(gatewayResponse.rawResponse || {})},
            updated_at = NOW()
        WHERE
            id = ${paymentRecord.id} AND tenant_id = ${tenantId};
      `);

      // 5. Update payment intent status
      const updatedIntentResult = await (this.db as any).execute(sql`
        UPDATE payment_intents
        SET
            status = ${PaymentIntentStatus.SUCCEEDED},
            updated_at = NOW()
        WHERE
            id = ${paymentIntent.id} AND tenant_id = ${tenantId}
        RETURNING id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at;
      `);
      paymentIntent = ((updatedIntentResult as any).rows as any)[0];

      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_CAPTURED',
        details: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          transactionId: paymentRecord.transaction_id,
          status: paymentIntent.status,
        },
      });

      await this.eventBus.publishPaymentEvent({
        eventName: 'payment.captured',
        tenantId,
        traceId: crypto.randomUUID(),
        payload: { paymentIntent, paymentRecord, amountCents: Math.round(paymentIntent.amount * 100), paymentIntentId: paymentIntent.id },
        publishedAt: new Date().toISOString(),
        idempotencyKey: paymentIntent.id + '-captured',
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
        externalId: paymentIntent.external_id,
      };
    } catch (error) {
      this.logger.error(`Failed to capture payment intent ${intentId} for tenant ${tenantId}: ${error.message}`, error.stack);
      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_CAPTURE_FAILED',
        details: { paymentIntentId: intentId, errorMsg: error.message }
      });
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to capture payment intent.');
    }
  }

  /**
   * Voids a payment intent and its associated payment transaction.
   * Can only void payments that are authorized but not yet captured.
   */
  async voidPaymentIntent(tenantId: string, userId: string, intentId: string): Promise<PaymentIntentResponseDto> {
    let paymentIntent: PaymentIntentDbRecord;
    let paymentRecord: PaymentDbRecord;

    try {
      // 1. Retrieve the payment intent
      const intentResult = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at
        FROM
            payment_intents
        WHERE
            id = ${intentId} AND tenant_id = ${tenantId} FOR UPDATE;
      `);
      paymentIntent = ((intentResult as any).rows as any)[0];

      if (!paymentIntent) {
        throw new NotFoundException(`Payment Intent with ID ${intentId} not found.`);
      }

      // Check if voidable: RequiresPaymentMethod, RequiresCapture, or Succeeded (if still within void window)
      if (![PaymentIntentStatus.REQUIRES_PAYMENT_METHOD, PaymentIntentStatus.REQUIRES_CONFIRMATION].includes(paymentIntent.status)) {
        // A "Succeeded" payment might be voidable if it was a capture that settled the same day,
        // but typically Succeeded would imply refund. For simplicity, we limit to pre-capture states.
        throw new InternalServerErrorException(`Payment Intent ${intentId} is not in a voidable state.`);
      }

      // 2. If an external_id exists, retrieve the associated payment record
      if (paymentIntent.external_id) {
        const paymentResult = await (this.db as any).execute(sql`
          SELECT
              id, tenant_id, payment_intent_id, amount, currency, status, type, transaction_id, processor_response, created_at, updated_at
          FROM
              payments
          WHERE
              payment_intent_id = ${paymentIntent.id} AND tenant_id = ${tenantId} AND transaction_id = ${paymentIntent.external_id} FOR UPDATE;
        `);
        paymentRecord = ((paymentResult as any).rows as any)[0];

        if (!paymentRecord) {
          throw new InternalServerErrorException(`Payment record not found for intent ${intentId}.`);
        }
        if (!['approved', 'pending'].includes(paymentRecord.status)) {
          throw new InternalServerErrorException(`Payment transaction ${paymentRecord.transaction_id} is not in a voidable state.`);
        }

        // 3. Call Gateway Router void
        const adapter = this.gatewayRouter.resolve(undefined, tenantId);
        const gatewayResponse = await adapter.void(paymentRecord.transaction_id, crypto.randomUUID());

        if (gatewayResponse.status === 'ERROR' || gatewayResponse.status === 'DECLINED') {
          await (this.db as any).execute(sql`
            UPDATE payments
            SET status = 'void_failed', updated_at = NOW()
            WHERE id = ${paymentRecord.id} AND tenant_id = ${tenantId};
          `);
          throw new InternalServerErrorException(`Payment void failed: ${gatewayResponse.failureMessage || 'Unknown error'}`);
        }

        // 4. Update payment record status
        await (this.db as any).execute(sql`
          UPDATE payments
          SET
              status = ${gatewayResponse.status},
              processor_response = ${JSON.stringify(gatewayResponse.rawResponse || {})},
              updated_at = NOW()
          WHERE
              id = ${paymentRecord.id} AND tenant_id = ${tenantId};
        `);
      }

      // 5. Update payment intent status
      const updatedIntentResult = await (this.db as any).execute(sql`
        UPDATE payment_intents
        SET
            status = ${PaymentIntentStatus.CANCELED}, -- Using Canceled for voided
            updated_at = NOW()
        WHERE
            id = ${paymentIntent.id} AND tenant_id = ${tenantId}
        RETURNING id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at;
      `);
      paymentIntent = ((updatedIntentResult as any).rows as any)[0];

      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_VOIDED',
        details: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          transactionId: paymentRecord?.transaction_id,
          status: paymentIntent.status,
        },
      });

      await this.eventBus.publishPaymentEvent({
        eventName: 'payment.intent.voided',
        tenantId,
        traceId: crypto.randomUUID(),
        payload: { paymentIntent, paymentRecord },
        publishedAt: new Date().toISOString(),
        idempotencyKey: paymentIntent.id + '-voided',
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
        externalId: paymentIntent.external_id,
      };
    } catch (error) {
      this.logger.error(`Failed to void payment intent ${intentId} for tenant ${tenantId}: ${error.message}`, error.stack);
      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_VOID_FAILED',
        details: { paymentIntentId: intentId, errorMsg: error.message }
      });
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to void payment intent.');
    }
  }

  /**
   * Refunds a captured payment intent.
   * Can be a full or partial refund.
   */
  async refundPaymentIntent(tenantId: string, userId: string, intentId: string, refundAmount?: number): Promise<PaymentIntentResponseDto> {
    let paymentIntent: PaymentIntentDbRecord;
    let originalPaymentRecord: PaymentDbRecord;

    try {
      // 1. Retrieve the payment intent
      const intentResult = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at
        FROM
            payment_intents
        WHERE
            id = ${intentId} AND tenant_id = ${tenantId} FOR UPDATE;
      `);
      paymentIntent = ((intentResult as any).rows as any)[0];

      if (!paymentIntent) {
        throw new NotFoundException(`Payment Intent with ID ${intentId} not found.`);
      }

      if (paymentIntent.status !== PaymentIntentStatus.SUCCEEDED) {
        throw new InternalServerErrorException(`Payment Intent ${intentId} is not in a refundable state (must be Succeeded).`);
      }
      if (!paymentIntent.external_id) {
        throw new InternalServerErrorException(`Payment Intent ${intentId} does not have an associated external transaction ID for refund.`);
      }

      // 2. Retrieve the original successful payment record
      const paymentResult = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, payment_intent_id, amount, currency, status, type, transaction_id, processor_response, created_at, updated_at
        FROM
            payments
        WHERE
            payment_intent_id = ${paymentIntent.id} AND tenant_id = ${tenantId} AND transaction_id = ${paymentIntent.external_id} AND type = 'charge' AND status = 'captured' FOR UPDATE;
      `);
      originalPaymentRecord = ((paymentResult as any).rows as any)[0];

      if (!originalPaymentRecord) {
        throw new InternalServerErrorException(`Original captured payment record not found for intent ${intentId}.`);
      }

      const amountToRefund = refundAmount && refundAmount > 0 ? refundAmount : originalPaymentRecord.amount;
      if (amountToRefund > originalPaymentRecord.amount) {
        throw new InternalServerErrorException(`Refund amount ${amountToRefund} exceeds original payment amount ${originalPaymentRecord.amount}.`);
      }

      // 3. Call Gateway Router refund
      const adapter = this.gatewayRouter.resolve(undefined, tenantId);
      const gatewayResponse = await adapter.refund(
        originalPaymentRecord.transaction_id,
        Math.round(amountToRefund * 100),
        crypto.randomUUID()
      );

      if (gatewayResponse.status === 'ERROR' || gatewayResponse.status === 'DECLINED') {
        throw new InternalServerErrorException(`Payment refund failed: ${gatewayResponse.failureMessage || 'Unknown error'}`);
      }

      // 4. Create a new refund payment record
      const refundPaymentResult = await (this.db as any).execute(sql`
        INSERT INTO payments (
            id, tenant_id, payment_intent_id, amount, currency, status, type, transaction_id, processor_response, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), ${tenantId}, ${paymentIntent.id}, ${amountToRefund}, ${originalPaymentRecord.currency},
            ${gatewayResponse.status}, 'refund', ${gatewayResponse.gatewayIntentId || crypto.randomUUID()},
            ${JSON.stringify(gatewayResponse.rawResponse || {})}, NOW(), NOW()
        )
        RETURNING *;
      `);
      const refundPayment: PaymentDbRecord = ((refundPaymentResult as any).rows as any)[0];

      // 5. Update payment intent status (if full refund, or track partial refunds)
      // For simplicity, we mark as 'Refunded' if any refund happens.
      // A more complex system would track total refunded amount and change status to 'PartiallyRefunded'/'Refunded'.
      const updatedIntentResult = await (this.db as any).execute(sql`
        UPDATE payment_intents
        SET
            status = ${PaymentIntentStatus.REFUNDED},
            updated_at = NOW()
        WHERE
            id = ${paymentIntent.id} AND tenant_id = ${tenantId}
        RETURNING id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at;
      `);
      paymentIntent = ((updatedIntentResult as any).rows as any)[0];

      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_REFUNDED',
        details: {
          paymentIntentId: paymentIntent.id,
          originalAmount: originalPaymentRecord.amount,
          refundedAmount: refundPayment.amount,
          originalTransactionId: originalPaymentRecord.transaction_id,
          refundTransactionId: refundPayment.transaction_id,
          status: paymentIntent.status,
        },
      });

      await this.eventBus.publishPaymentEvent({
        eventName: 'payment.intent.refunded',
        tenantId,
        traceId: crypto.randomUUID(),
        payload: { paymentIntent, refundPayment },
        publishedAt: new Date().toISOString(),
        idempotencyKey: paymentIntent.id + '-refunded',
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
        externalId: paymentIntent.external_id,
      };
    } catch (error) {
      this.logger.error(`Failed to refund payment intent ${intentId} for tenant ${tenantId}: ${error.message}`, error.stack);
      (this.auditLogService as any).record(tenantId, {
        userId: userId,
        action: 'PAYMENT_INTENT_REFUND_FAILED',
        details: { paymentIntentId: intentId, refundAmount, errorMsg: error.message },
      });
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to refund payment intent.');
    }
  }

  /**
   * POSR-007: Retrieves an active payment intent by its QR code identifier.
   * The qrCodeIdentifier is stored in the payment intent's metadata JSON field.
   * Only returns intents that are in an actionable (non-terminal) state.
   */
  async retrieveQrCodePaymentIntent(tenantId: string, qrCodeIdentifier: string): Promise<PaymentIntentResponseDto> {
    try {
      const result = await (this.db as any).execute(sql`
        SELECT
            id, tenant_id, order_id, amount, currency, status, client_secret, metadata, external_id, created_at, updated_at
        FROM
            payment_intents
        WHERE
            tenant_id = ${tenantId}
            AND metadata->>'qrCodeIdentifier' = ${qrCodeIdentifier}
            AND status NOT IN ('canceled', 'failed', 'refunded')
        ORDER BY created_at DESC
        LIMIT 1;
      `);

      const paymentIntent: PaymentIntentDbRecord = ((result as any).rows as any)[0] as PaymentIntentDbRecord;

      if (!paymentIntent) {
        throw new NotFoundException(
          `Payment intent not found or not active for QR code identifier "${qrCodeIdentifier}".`
        );
      }

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        orderId: paymentIntent.order_id,
        metadata: paymentIntent.metadata,
        externalId: paymentIntent.external_id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve QR code payment intent for identifier "${qrCodeIdentifier}" tenant ${tenantId}: ${error.message}`,
        error.stack
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve QR code payment intent due to an internal error.');
    }
  }
}




