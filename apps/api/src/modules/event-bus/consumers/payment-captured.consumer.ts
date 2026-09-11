import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventBusService, PaySurityEvent } from '../event-bus.service';

/**
 * PaymentCapturedConsumer -- the first functional consumer in the event pipeline.
 *
 * Listens to: payment-events queue
 * Triggers: loyalty.earn job on the loyalty-events queue
 *
 * PAY-REMEDIATION-S0 Item 4: Resolves "Dead End" event syndrome.
 *
 * Flow:
 *   ORC.capturePayment() → publishes "payment.captured" to payment-events queue
 *   → This consumer picks it up
 *   → Publishes "loyalty.earn" to loyalty-events queue
 *   → (Sprint 1: LOY consumer picks up loyalty.earn and credits points)
 *
 * DLQ: If this consumer fails after 5 retries, the job lands in dead-letter-queue.
 */
@Processor('payment-events')
export class PaymentCapturedConsumer extends WorkerHost {
  private readonly logger = new Logger(PaymentCapturedConsumer.name);

  constructor(private readonly eventBus: EventBusService) {
    super();
  }

  async process(job: Job<PaySurityEvent>): Promise<void> {
    const event = job.data;

    // Only handle payment.captured events
    if (event.eventName !== 'payment.captured') {
      this.logger.debug(`Skipping event: ${event.eventName}`);
      return;
    }

    this.logger.log(
      `[CONSUMER] payment.captured | ` +
      `tenant=${event.tenantId} | ` +
      `paymentId=${event.payload.paymentIntentId} | ` +
      `amount=${event.payload.amountCents} | ` +
      `trace=${event.traceId}`,
    );

    try {
      // ── Trigger loyalty.earn ───────────────────────────────
      const loyaltyEvent: PaySurityEvent = {
        eventName: 'loyalty.earn',
        tenantId: event.tenantId,
        merchantId: event.merchantId,
        traceId: event.traceId,
        payload: {
          paymentIntentId: event.payload.paymentIntentId,
          orderId: event.payload.orderId,
          amountCents: event.payload.amountCents,
          consumerId: event.payload.consumerId,
          locationId: event.payload.locationId,
        },
        publishedAt: new Date().toISOString(),
        idempotencyKey: `${event.payload.paymentIntentId}:loyalty:earn`,
      };

      await this.eventBus.publishLoyaltyEvent(loyaltyEvent);

      this.logger.log(
        `[CONSUMER] loyalty.earn published | ` +
        `paymentId=${event.payload.paymentIntentId} | ` +
        `trace=${event.traceId}`,
      );

      // ── Trigger notification (receipt) ─────────────────────
      const notifEvent: PaySurityEvent = {
        eventName: 'notification.receipt',
        tenantId: event.tenantId,
        merchantId: event.merchantId,
        traceId: event.traceId,
        payload: {
          paymentIntentId: event.payload.paymentIntentId,
          orderId: event.payload.orderId,
          amountCents: event.payload.amountCents,
          consumerId: event.payload.consumerId,
        },
        publishedAt: new Date().toISOString(),
        idempotencyKey: `${event.payload.paymentIntentId}:notification:receipt`,
      };

      await this.eventBus.publishNotificationEvent(notifEvent);

    } catch (error) {
      this.logger.error(
        `[CONSUMER] Failed processing payment.captured | trace=${event.traceId}`,
        error instanceof Error ? error.stack : String(error),
      );

      // If this is the last attempt, move to DLQ
      if (job.attemptsMade >= (job.opts.attempts ?? 5) - 1) {
        await this.eventBus.sendToDeadLetter(
          event,
          'payment-events',
          error instanceof Error ? error.message : 'Unknown error',
        );
      }

      throw error; // Re-throw so BullMQ retries
    }
  }
}
