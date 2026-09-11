import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * EventBusService -- publish events to BullMQ queues.
 *
 * IMPORTANT: This is the ONLY way to publish cross-vertical events.
 * Direct service-to-service imports across verticals are PROHIBITED.
 *
 * Event naming convention:
 *   {domain}.{action}  -- e.g., "payment.captured", "order.created"
 */

export interface PaySurityEvent {
  eventName: string;
  tenantId: string;
  merchantId?: string | undefined;
  traceId: string;
  payload: Record<string, unknown>;
  publishedAt: string;           // ISO 8601
  idempotencyKey: string;        // Prevents double-processing
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    @InjectQueue('payment-events') private paymentQueue: Queue,
    @InjectQueue('loyalty-events') private loyaltyQueue: Queue,
    @InjectQueue('notification-events') private notificationQueue: Queue,
    @InjectQueue('dead-letter-queue') private dlq: Queue,
  ) {}

  /**
   * Publish a payment event (e.g., payment.captured, payment.failed).
   */
  async publishPaymentEvent(event: PaySurityEvent): Promise<void> {
    this.logger.log(
      `[EVENT] ${event.eventName} | tenant=${event.tenantId} | trace=${event.traceId}`,
    );
    await this.paymentQueue.add(event.eventName, event, {
      jobId: event.idempotencyKey.replace(/:/g, '-'),
    });
  }

  /**
   * Publish a loyalty event (e.g., loyalty.earn, loyalty.redeem).
   */
  async publishLoyaltyEvent(event: PaySurityEvent): Promise<void> {
    this.logger.log(
      `[EVENT] ${event.eventName} | tenant=${event.tenantId} | trace=${event.traceId}`,
    );
    await this.loyaltyQueue.add(event.eventName, event, {
      jobId: event.idempotencyKey.replace(/:/g, '-'),
    });
  }

  /**
   * Publish a notification event (e.g., notification.receipt, notification.alert).
   */
  async publishNotificationEvent(event: PaySurityEvent): Promise<void> {
    this.logger.log(
      `[EVENT] ${event.eventName} | tenant=${event.tenantId} | trace=${event.traceId}`,
    );
    await this.notificationQueue.add(event.eventName, event, {
      jobId: event.idempotencyKey.replace(/:/g, '-'),
    });
  }

  /**
   * Move a failed job to the Dead Letter Queue for manual investigation.
   * Called by consumers when a job exhausts all retries.
   */
  async sendToDeadLetter(
    failedEvent: PaySurityEvent,
    originalQueue: string,
    failureReason: string,
  ): Promise<void> {
    this.logger.error(
      `[DLQ] ${failedEvent.eventName} from ${originalQueue} | reason: ${failureReason}`,
    );
    await this.dlq.add('dead-letter', {
      ...failedEvent,
      _dlq: {
        originalQueue,
        failureReason,
        movedAt: new Date().toISOString(),
      },
    });
  }
}
