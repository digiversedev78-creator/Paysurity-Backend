import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PaySurityEvent } from '../event-bus/event-bus.service';
import { LoyaltyService } from './loyalty.service';

/**
 * LoyaltyEarnConsumer -- consumes loyalty.earn events from BullMQ.
 *
 * This completes the event chain:
 *   payment.captured â†’ PaymentCapturedConsumer â†’ loyalty.earn â†’ THIS CONSUMER
 *
 * Sprint 2 Worker D [LOY-001]: Resolves the loyalty.earn "Dead End".
 */
@Processor('loyalty-events')
export class LoyaltyEarnConsumer extends WorkerHost {
  private readonly logger = new Logger(LoyaltyEarnConsumer.name);

  constructor(private readonly loyaltyService: LoyaltyService) {
    super();
  }

  async process(job: Job<PaySurityEvent>): Promise<void> {
    const event = job.data;

    if (event.eventName !== 'loyalty.earn') {
      return;
    }

    this.logger.log(
      `[LOY-CONSUMER] loyalty.earn | payment=${event.payload.paymentIntentId} | ` +
      `amount=${event.payload.amountCents}Â¢ | trace=${event.traceId}`,
    );

    // TODO Sprint 2: Look up loyalty member by consumerId
    // For now, log the earn event for Sprint 3 DB wiring
    const memberId = event.payload.consumerId as string;
    if (!memberId) {
      this.logger.debug('[LOY-CONSUMER] No consumerId in event -- skipping earn');
      return;
    }

    await (this.loyaltyService as any).earnPoints(
      {
        tenantId: event.tenantId,
        memberId,
        paymentIntentId: event.payload.paymentIntentId as string,
        orderId: event.payload.orderId as string | undefined,
        amountCents: event.payload.amountCents as number,
      },
      event.traceId,
    );
  }
}

