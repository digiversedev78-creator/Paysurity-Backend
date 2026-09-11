/**
 * NotificationConsumer â€” Phase 3C rewrite
 * 
 * Bridges event bus â†’ NotificationService.
 * Uses @nestjs/event-emitter @OnEvent pattern (NOT bullmq) for Phase 3C
 * to avoid bullmq dependency. BullMQ queue processing is Phase 4.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('notification.receipt')
  async handleReceipt(payload: any): Promise<void> {
    const { tenantId, customerEmail, amountCents, paymentIntentId } = payload;
    if (customerEmail) {
      await (this.notificationService as any).send({
        tenantId,
        channel: 'email',
        to: customerEmail,
        subject: 'Payment Receipt â€” PaySurity',
        body: `Your payment of $${((amountCents || 0) / 100).toFixed(2)} has been processed successfully. Ref: ${paymentIntentId}`,
        html: `<h2>Payment Receipt</h2><p>Amount: <strong>$${((amountCents || 0) / 100).toFixed(2)}</strong></p><p>Reference: ${paymentIntentId}</p>`,
      });
    }
  }

  @OnEvent('loyalty.points.earned')
  async handleLoyaltyEarned(payload: any): Promise<void> {
    const { tenantId, customerPhone, pointsEarned } = payload;
    if (customerPhone) {
      await (this.notificationService as any).send({
        tenantId,
        channel: 'sms',
        to: customerPhone,
        body: `You earned ${pointsEarned} loyalty points! Check your balance in the app.`,
      });
    }
  }

  @OnEvent('loyalty.points.redeemed')
  async handleLoyaltyRedeemed(payload: any): Promise<void> {
    const { tenantId, customerPhone, pointsRedeemed } = payload;
    if (customerPhone) {
      await (this.notificationService as any).send({
        tenantId,
        channel: 'sms',
        to: customerPhone,
        body: `You redeemed ${pointsRedeemed} loyalty points. Thank you!`,
      });
    }
  }

  @OnEvent('subscription.cancelled')
  async handleSubCancelled(payload: any): Promise<void> {
    const { tenantId, customerEmail, reason } = payload;
    if (customerEmail) {
      await (this.notificationService as any).send({
        tenantId,
        channel: 'email',
        to: customerEmail,
        subject: 'Subscription Cancelled',
        body: `Your subscription has been cancelled. Reason: ${reason || 'Not specified'}.`,
        html: `<h2>Subscription Cancelled</h2><p>Reason: ${reason || 'Not specified'}</p>`,
      });
    }
  }

  @OnEvent('payroll.submitted')
  async handlePayrollSubmitted(payload: any): Promise<void> {
    this.logger.log(`[NOTIF] Payroll submitted: ${JSON.stringify(payload)}`);
    // In-app event â€” emit for WebSocket layer to pick up
  }

  @OnEvent('kds.item.ready')
  async handleKdsReady(payload: any): Promise<void> {
    this.logger.log(`[NOTIF] KDS item ready: ${JSON.stringify(payload)}`);
    // In-app / push for kitchen staff app â€” Phase 4
  }
}

