import { Injectable, Logger, Inject, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { sanitizeGatewayResponse } from '../../shared/utils/sanitize-gateway-response';
import { randomUUID } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; // Keep as per critical rule 2
import { sql } from 'drizzle-orm'; // Import sql for raw queries

// Removed Drizzle-specific imports:
// - pgTable, uuid, varchar, timestamp, boolean, integer, jsonb, pgEnum from 'drizzle-orm/pg-core'
// - eq, and from 'drizzle-orm'

// Define TypeScript types for enums (replacing Drizzle's pgEnum definitions)
export type WalletType = 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY';
export type RefundType = 'FULL' | 'PARTIAL' | 'ITEM_LEVEL' | 'STORE_CREDIT' | 'ADJUSTMENT'; // Added ADJUSTMENT as a common refund type
export type RefundStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'DENIED' | 'FAILED';
export type ReturnStatus =
  'INITIATED' | 'PENDING_MERCHANT_APPROVAL' | 'APPROVED_PENDING_SHIPMENT' | 'DENIED' | 'CANCELED' |
  'SHIPPED_BY_CUSTOMER' | 'RECEIVED_BY_MERCHANT' | 'INSPECTION_IN_PROGRESS' | 'INSPECTION_PASSED' |
  'INSPECTION_FAILED' | 'REFUND_ISSUED' | 'COMPLETED';

// DTOs and Interfaces (assuming these exist or are defined elsewhere if not in this file's fragment)
interface InitiateRefundDto {
  paymentIntentId: string;
  returnRequestId?: string;
  refundType: RefundType;
  amountCents: number;
  reason?: string;
  items?: Array<{ name: string; quantityRefunded: number; amountCents: number }>;
  idempotencyKey?: string;
}

interface ApproveDenyRefundDto {
  refundId: string;
  status: 'APPROVED' | 'DENIED';
  managerId: string; // User ID of the manager performing the approval/denial
  reason?: string; // Reason for denial
}

interface PaymentAdapterResponse {
  success: boolean;
  gatewayRefundId?: string;
  gatewayResponse?: any;
  errorMessage?: string;
}

interface RefundRequestRecord {
  id: string;
  tenant_id: string;
  payment_intent_id: string;
  return_request_id: string | null;
  refund_type: RefundType;
  amount_cents: number;
  reason: string | null;
  status: RefundStatus;
  approved_by: string | null;
  gateway_refund_id: string | null;
  store_credit_id: string | null;
  items: any | null; // JSONB field
  idempotency_key: string;
  created_at: Date;
  completed_at: Date | null;
  updated_at: Date;
}

interface PaymentIntentRecord {
  id: string;
  tenant_id: string;
  amount_cents: number;
  currency: string;
  status: string; // e.g., 'SUCCEEDED', 'PENDING', 'FAILED', 'PARTIALLY_REFUNDED'
  gateway_payment_id: string;
  payment_method_id: string;
  customer_id: string;
  merchant_id: string;
  processor_name: string;
  // ... other fields as needed for refund processing
}

import { AuditLogService } from '../audit-log/audit-log.service';

interface PaymentAdapterService {
  processRefund(options: {
    tenantId: string;
    paymentIntentId: string;
    amountCents: number;
    currency: string;
    reason?: string;
    paymentMethodId?: string; // May be needed for some gateways
    gatewayPaymentId?: string; // Original transaction ID
  }): Promise<PaymentAdapterResponse>;
}

@Injectable()
export class RefundWorkflowService {
  private readonly logger = new Logger(RefundWorkflowService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>, // As per critical rule 2
    private readonly eventBusService: EventBusService,
    @Inject('PaymentAdapterService') private readonly paymentAdapterService: PaymentAdapterService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Initiates a new refund request.
   * A refund request is created with PENDING status. Approval is a separate step.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user initiating the request.
   * @param dto The data for the refund request.
   * @returns The created refund request.
   */
  async initiateRefund(tenantId: string, userId: string, dto: InitiateRefundDto): Promise<RefundRequestRecord> {
    const idempotencyKey = dto.idempotencyKey || randomUUID();
    this.logger.log(`Initiating refund request for tenant ${tenantId}, paymentIntentId: ${dto.paymentIntentId}`);

    // Check for existing refund request with the same idempotency key
    const existingRefund = await (this.db as any).query.session(sql`
      SELECT id, status FROM refund_requests
      WHERE tenant_id = ${tenantId} AND idempotency_key = ${idempotencyKey}
      LIMIT 1;
    `);

    if (existingRefund.length > 0) {
      this.logger.warn(`Refund request with idempotency key ${idempotencyKey} already exists. Returning existing.`);
      // Fetch the full existing record if only minimal details were returned initially
      const existingFullRefund = await (this.db as any).query.session(sql`
        SELECT * FROM refund_requests
        WHERE id = ${existingRefund[0].id} AND tenant_id = ${tenantId}
        LIMIT 1;
      `);
      if (existingFullRefund.length > 0) {
        return existingFullRefund[0] as RefundRequestRecord;
      }
    }

    // Fetch the original payment intent to validate amount and currency
    const paymentIntent = await (this.db as any).query.session(sql`
      SELECT id, tenant_id, amount_cents, currency, status, gateway_payment_id, payment_method_id, customer_id, merchant_id, processor_name
      FROM payment_intents
      WHERE id = ${dto.paymentIntentId} AND tenant_id = ${tenantId}
      LIMIT 1;
    `);

    if (paymentIntent.length === 0) {
      throw new NotFoundException(`Payment intent with ID ${dto.paymentIntentId} not found.`);
    }

    const originalIntent = paymentIntent[0] as PaymentIntentRecord;

    if (originalIntent.status !== 'SUCCEEDED' && originalIntent.status !== 'PARTIALLY_REFUNDED') {
      throw new BadRequestException(`Cannot refund a payment intent with status ${originalIntent.status}. It must be 'SUCCEEDED' or 'PARTIALLY_REFUNDED'.`);
    }

    // Calculate total refunded amount for this payment intent to prevent over-refunding
    const totalRefundedResult = await (this.db as any).query.session(sql`
      SELECT COALESCE(SUM(amount_cents), 0) as total_refunded_cents
      FROM refund_requests
      WHERE payment_intent_id = ${dto.paymentIntentId}
        AND tenant_id = ${tenantId}
        AND (status = 'APPROVED' OR status = 'PROCESSING' OR status = 'COMPLETED');
    `);

    const totalRefundedCents = (totalRefundedResult[0] as { total_refunded_cents: number }).total_refunded_cents;
    const availableForRefund = originalIntent.amount_cents - totalRefundedCents;

    if (dto.amountCents <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero.');
    }

    if (dto.amountCents > availableForRefund) {
      throw new BadRequestException(
        `Requested refund amount (${dto.amountCents} cents) exceeds available amount for refund ` +
        `(${availableForRefund} cents) for payment intent ${dto.paymentIntentId}.`,
      );
    }

    try {
      const newRefundId = randomUUID(); // Generate UUID for the new refund request

      const [newRefund] = await (this.db as any).execute(sql`
        INSERT INTO refund_requests (
          id, tenant_id, payment_intent_id, return_request_id,
          refund_type, amount_cents, reason, status, items, idempotency_key, created_at, updated_at
        ) VALUES (
          ${newRefundId}, ${tenantId}, ${dto.paymentIntentId}, ${dto.returnRequestId || null},
          ${dto.refundType}, ${dto.amountCents}, ${dto.reason || null}, 'PENDING',
          ${JSON.stringify(dto.items || [])}::jsonb, ${idempotencyKey}, NOW(), NOW()
        )
        RETURNING *;
      `);

      this.logger.log(`Refund request ${newRefundId} created for tenant ${tenantId}. Status: PENDING`);
      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'refund.initiated',
        details: { refundId: (newRefund as any).id, paymentIntentId: dto.paymentIntentId, amountCents: dto.amountCents, status: 'PENDING', reason: dto.reason },
      });

      return newRefund as RefundRequestRecord;
    } catch (error: any) {
      this.logger.error(`Failed to initiate refund for tenant ${tenantId}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to initiate refund request.');
    }
  }

  /**
   * Approves or denies a refund request. Only a manager can perform this action.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user (manager) approving/denying the request.
   * @param dto The data for approval/denial.
   * @param isManager A flag indicating if the userId has manager roles.
   * @returns The updated refund request.
   */
  async approveDenyRefund(
    tenantId: string,
    userId: string, // This is the managerId
    dto: ApproveDenyRefundDto,
    isManager: boolean, // Assume this is passed from a guard or context
  ): Promise<RefundRequestRecord> {
    if (!isManager) {
      throw new UnauthorizedException('Only managers can approve or deny refund requests.');
    }

    this.logger.log(`Manager ${userId} is attempting to ${dto.status} refund request ${dto.refundId} for tenant ${tenantId}.`);

    const refundRequest = await (this.db as any).query.session(sql`
      SELECT * FROM refund_requests
      WHERE id = ${dto.refundId} AND tenant_id = ${tenantId}
      LIMIT 1;
    `);

    if (refundRequest.length === 0) {
      throw new NotFoundException(`Refund request with ID ${dto.refundId} not found for tenant ${tenantId}.`);
    }

    const currentRefund = refundRequest[0] as RefundRequestRecord;

    if (currentRefund.status !== 'PENDING') {
      throw new BadRequestException(`Refund request ${dto.refundId} is already ${currentRefund.status}. Cannot ${dto.status}.`);
    }

    if (dto.status === 'DENIED') {
      const [updatedRefund] = await (this.db as any).execute(sql`
        UPDATE refund_requests
        SET status = 'DENIED', approved_by = ${userId}, reason = ${dto.reason || currentRefund.reason}, updated_at = NOW()
        WHERE id = ${dto.refundId} AND tenant_id = ${tenantId}
        RETURNING *;
      `);

      this.logger.log(`Refund request ${dto.refundId} for tenant ${tenantId} DENIED by manager ${userId}.`);
      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'refund.denied',
        details: { refundId: dto.refundId, status: 'DENIED', reason: dto.reason },
      });
      return updatedRefund as RefundRequestRecord;
    } else if (dto.status === 'APPROVED') {
      const [updatedRefund] = await (this.db as any).execute(sql`
        UPDATE refund_requests
        SET status = 'APPROVED', approved_by = ${userId}, updated_at = NOW()
        WHERE id = ${dto.refundId} AND tenant_id = ${tenantId}
        RETURNING *;
      `);
      this.logger.log(`Refund request ${dto.refundId} for tenant ${tenantId} APPROVED by manager ${userId}.`);
      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'refund.approved',
        details: { refundId: dto.refundId, status: 'APPROVED' },
      });

      // Immediately attempt to execute the refund via the payment adapter
      return this.executeRefund(tenantId, userId, (updatedRefund as RefundRequestRecord).id);
    }

    throw new BadRequestException('Invalid status provided for refund approval/denial.');
  }

  /**
   * Executes a refund request by interacting with the payment adapter.
   * This method assumes the refund request has already been approved.
   * @param tenantId The ID of the tenant.
   * @param userId The ID of the user executing the refund (could be manager or system).
   * @param refundId The ID of the refund request to execute.
   * @returns The completed refund request.
   */
  async executeRefund(tenantId: string, userId: string, refundId: string): Promise<RefundRequestRecord> {
    this.logger.log(`Executing refund request ${refundId} for tenant ${tenantId}.`);

    const refundRequest = await (this.db as any).query.session(sql`
      SELECT * FROM refund_requests
      WHERE id = ${refundId} AND tenant_id = ${tenantId}
      LIMIT 1;
    `);

    if (refundRequest.length === 0) {
      throw new NotFoundException(`Refund request with ID ${refundId} not found for tenant ${tenantId}.`);
    }

    let currentRefund = refundRequest[0] as RefundRequestRecord;

    if (currentRefund.status === 'COMPLETED' || currentRefund.status === 'FAILED') {
      this.logger.warn(`Refund request ${refundId} is already ${currentRefund.status}. Skipping execution.`);
      return currentRefund;
    }

    // Allow 'APPROVED' to start processing, or 'PROCESSING' to allow retries in case of transient failures
    if (currentRefund.status !== 'APPROVED' && currentRefund.status !== 'PROCESSING') {
      throw new BadRequestException(`Refund request ${refundId} is not in an APPROVED or PROCESSING state. Current status: ${currentRefund.status}.`);
    }

    // If APPROVED, transition to PROCESSING
    if (currentRefund.status === 'APPROVED') {
      const [processingRefund] = await (this.db as any).execute(sql`
        UPDATE refund_requests
        SET status = 'PROCESSING', updated_at = NOW()
        WHERE id = ${refundId} AND tenant_id = ${tenantId}
        RETURNING *;
      `);
      currentRefund = processingRefund as RefundRequestRecord;
      this.logger.log(`Refund request ${refundId} status updated to PROCESSING.`);
      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'refund.processing',
        details: { refundId: refundId, status: 'PROCESSING' },
      });
    }

    const paymentIntent = await (this.db as any).query.session(sql`
      SELECT id, tenant_id, amount_cents, currency, status, gateway_payment_id, payment_method_id, customer_id, merchant_id, processor_name
      FROM payment_intents
      WHERE id = ${currentRefund.payment_intent_id} AND tenant_id = ${tenantId}
      LIMIT 1;
    `);

    if (paymentIntent.length === 0) {
      throw new NotFoundException(`Associated payment intent ${currentRefund.payment_intent_id} not found.`);
    }
    const originalIntent = paymentIntent[0] as PaymentIntentRecord;

    let gatewayResponse: PaymentAdapterResponse;
    try {
      gatewayResponse = await (this.paymentAdapterService as any).processRefund({
        tenantId,
        paymentIntentId: originalIntent.id,
        amountCents: currentRefund.amount_cents,
        currency: originalIntent.currency,
        reason: currentRefund.reason || 'Requested by customer',
        gatewayPaymentId: originalIntent.gateway_payment_id,
        paymentMethodId: originalIntent.payment_method_id,
      });
    } catch (adapterError: any) {
      this.logger.error(`Payment adapter failed for refund ${refundId}: ${adapterError.message}`, adapterError.stack);
      // Update refund status to FAILED if the adapter call itself throws an error
      const [failedRefund] = await (this.db as any).execute(sql`
        UPDATE refund_requests
        SET status = 'FAILED', completed_at = NOW(), updated_at = NOW()
        WHERE id = ${refundId} AND tenant_id = ${tenantId}
        RETURNING *;
      `);
      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'refund.failed',
        details: { refundId: refundId, error: adapterError.message, gatewayResponse: null, paymentIntentId: currentRefund.payment_intent_id },
      });
      throw new BadRequestException(`Refund execution failed at payment adapter: ${adapterError.message}`);
    }

    let finalRefundStatus: RefundStatus;
    let gatewayRefundId: string | null = null;
    let completedAt: Date | null = null;

    if (gatewayResponse.success) {
      finalRefundStatus = 'COMPLETED';
      gatewayRefundId = gatewayResponse.gatewayRefundId || null;
      completedAt = new Date();
      this.logger.log(`Refund request ${refundId} successfully processed by gateway. Gateway Refund ID: ${gatewayRefundId}`);
    } else {
      finalRefundStatus = 'FAILED';
      this.logger.error(`Refund request ${refundId} failed at gateway: ${gatewayResponse.errorMessage}`);
    }

    try {
      const [finalRefund] = await (this.db as any).execute(sql`
        UPDATE refund_requests
        SET
          status = ${finalRefundStatus},
          gateway_refund_id = ${gatewayRefundId},
          completed_at = ${completedAt},
          updated_at = NOW()
        WHERE id = ${refundId} AND tenant_id = ${tenantId}
        RETURNING *;
      `);

      currentRefund = finalRefund as RefundRequestRecord;

      if (finalRefundStatus === 'COMPLETED') {
        (this.eventBusService as any).emit('refund.completed', {
          tenantId,
          refundId: currentRefund.id,
          paymentIntentId: currentRefund.payment_intent_id,
          amountCents: currentRefund.amount_cents,
          gatewayRefundId: currentRefund.gateway_refund_id,
          status: currentRefund.status,
          // Include other relevant details for downstream services
        });
        await (this.auditLogService as any).record(tenantId, {
          userId,
          action: 'refund.completed',
          details: { refundId: currentRefund.id, status: 'COMPLETED', gatewayRefundId: gatewayRefundId, paymentIntentId: currentRefund.payment_intent_id },
        });
      } else { // Handle FAILED status from gateway response
         await (this.auditLogService as any).record(tenantId, {
          userId,
          action: 'refund.failed',
          details: { refundId: currentRefund.id, status: 'FAILED', errorMessage: gatewayResponse.errorMessage, gatewayResponse: sanitizeGatewayResponse(gatewayResponse.gatewayResponse), paymentIntentId: currentRefund.payment_intent_id },
        });
      }

      return currentRefund;
    } catch (dbError: any) {
      this.logger.error(`Failed to update refund request ${refundId} status to ${finalRefundStatus} after gateway response: ${dbError.message}`, dbError.stack);
      // This is a critical error where the gateway processed the refund but our DB update failed.
      // Manual intervention might be required. Log and throw.
      throw new BadRequestException(`Refund processed by gateway but failed to update database: ${dbError.message}`);
    }
  }

  /**
   * Helper method to fetch a refund request by ID and tenant ID.
   * @param tenantId The ID of the tenant.
   * @param refundId The ID of the refund request.
   * @returns The refund request record, or undefined if not found.
   */
  async getRefundRequest(tenantId: string, refundId: string): Promise<RefundRequestRecord | undefined> {
    const refundRequest = await (this.db as any).query.session(sql`
      SELECT * FROM refund_requests
      WHERE id = ${refundId} AND tenant_id = ${tenantId}
      LIMIT 1;
    `);
    return refundRequest.length > 0 ? (refundRequest[0] as RefundRequestRecord) : undefined;
  }
}



