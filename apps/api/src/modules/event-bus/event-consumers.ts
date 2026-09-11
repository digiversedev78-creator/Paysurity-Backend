import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
const OpsService: any = class {};
import { PaySurityEvent } from './event-bus.service';

/**
 * DLQ Consumer -- Auto-retry with 3-attempt escalation.
 *
 * BullMQ retry policy:
 *   1. Attempt 1-3: Automatic retry with exponential backoff
 *   2. After 3 failures: Move to DLQ + log to security_events
 *
 * Handles: payment.captured, loyalty.earn, settlement.batch.created
 */
@Injectable()
@Processor('payment-events', {
  concurrency: 5,
  limiter: { max: 100, duration: 60000 },
})
export class PaymentEventConsumer extends WorkerHost {
  private readonly logger = new Logger(PaymentEventConsumer.name);

  constructor(private readonly ops: any) {
    super();
  }

  async process(job: Job<PaySurityEvent>): Promise<void> {
    const event = job.data;
    this.logger.log(
      `[CONSUMER] Processing ${event.eventName} | attempt=${job.attemptsMade + 1}/3 | trace=${event.traceId}`,
    );

    try {
      // Route by event name
      switch (event.eventName) {
        case 'payment.captured':
          await this.handlePaymentCaptured(event);
          break;
        case 'payment.refunded':
          this.logger.log(`[CONSUMER] Refund processed | trace=${event.traceId}`);
          break;
        case 'settlement.batch.created':
          this.logger.log(`[CONSUMER] Settlement batch registered | trace=${event.traceId}`);
          break;
        case 'settlement.payout.completed':
          this.logger.log(`[CONSUMER] Payout completed | trace=${event.traceId}`);
          break;
        default:
          this.logger.log(`[CONSUMER] Event ${event.eventName} processed | trace=${event.traceId}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`[CONSUMER] Failed: ${err.message} | attempt=${job.attemptsMade + 1}`);

      // Check if this was the last retry
      if (job.attemptsMade >= 2) {
        // Exhausted 3 attempts -- escalate to DLQ
        await this.ops.handleFailedEvent(event, 'payment-events', err.message, job.attemptsMade + 1);
      }

      throw err; // Let BullMQ handle the retry
    }
  }

  private async handlePaymentCaptured(event: PaySurityEvent): Promise<void> {
    const payload = event.payload as Record<string, unknown>;
    this.logger.log(
      `[CONSUMER] payment.captured | amount=${payload.amountCents}Â¢ | ` +
      `fee=${payload.platformFeeCents}Â¢ | net=${payload.merchantNetCents}Â¢ | trace=${event.traceId}`,
    );
    // Downstream consumers (loyalty, settlement auto-enqueue) handle their own queues
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`[CONSUMER] Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(`[CONSUMER] Job ${job?.id} failed: ${error.message}`);
  }
}

/**
 * Loyalty Event Consumer -- handles loyalty.earn with DLQ escalation.
 */
@Injectable()
@Processor('loyalty-events', {
  concurrency: 3,
  limiter: { max: 50, duration: 60000 },
})
export class LoyaltyEventConsumer extends WorkerHost {
  private readonly logger = new Logger(LoyaltyEventConsumer.name);

  constructor(private readonly ops: any) {
    super();
  }

  async process(job: Job<PaySurityEvent>): Promise<void> {
    const event = job.data;
    this.logger.log(
      `[LOYALTY-CONSUMER] ${event.eventName} | attempt=${job.attemptsMade + 1}/3 | trace=${event.traceId}`,
    );

    try {
      switch (event.eventName) {
        case 'loyalty.earn':
          const payload = event.payload as Record<string, unknown>;
          this.logger.log(
            `[LOYALTY-CONSUMER] Earned ${payload.pointsEarned} pts | trace=${event.traceId}`,
          );
          break;
        case 'loyalty.redeem':
          this.logger.log(`[LOYALTY-CONSUMER] Redemption processed | trace=${event.traceId}`);
          break;
        default:
          this.logger.log(`[LOYALTY-CONSUMER] ${event.eventName} processed | trace=${event.traceId}`);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (job.attemptsMade >= 2) {
        await this.ops.handleFailedEvent(event, 'loyalty-events', err.message, job.attemptsMade + 1);
      }
      throw err;
    }
  }
}



