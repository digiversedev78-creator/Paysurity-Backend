// AGG-001: Order Aggregation Webhook Endpoints — satisfies REQ-AGG-001, REQ-POSR-005
// Service logic (521L): apps/api/src/modules/aggregator/aggregator.service.ts
// DB tables: orders, order_items (migration 0000), agg_daily_snapshots (migration 018)
import {
  Controller, Post, Body, Headers, Logger,
  HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { AggregatorService } from './aggregator.service';

interface RequestWithUser extends Request {
  user?: { tenantId: string; merchantId?: string };
}

@Controller('v1/aggregator')
export class AggregatorController {
  private readonly logger = new Logger(AggregatorController.name);

  constructor(private readonly aggregator: AggregatorService) {}

  /**
   * REQ-AGG-001: DoorDash webhook receiver.
   * DoorDash signs requests with ECDSA — verify header X-DoorDash-Signature.
   * SLA: acknowledge within 60 seconds.
   */
  @Post('webhook/doordash')
  @HttpCode(HttpStatus.OK)
  async handleDoorDash(
    @Body() body: any,
    @Headers('x-doordash-signature') signature: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-merchant-id') merchantId: string,
  ) {
    this.logger.log(`DoorDash webhook received for tenant ${tenantId}`);

    if (!tenantId || !merchantId) {
      throw new BadRequestException('Missing x-tenant-id or x-merchant-id header');
    }

    // TODO (AGG-SEC-001): Verify ECDSA signature against DoorDash public key from secrets.service
    // const isValid = this.verifyDoorDashSignature(body, signature, tenantId);
    // if (!isValid) throw new UnauthorizedException('Invalid DoorDash signature');

    try {
      const orderId = await this.aggregator.processWebhook('doordash', body, tenantId, merchantId);
      return { received: true, orderId };
    } catch (err) {
      this.logger.error(`DoorDash webhook processing failed: ${err.message}`, err.stack);
      // Return 200 to DoorDash anyway to prevent delivery retry storm; log internally
      return { received: true, error: 'Processing queued for retry' };
    }
  }

  /**
   * REQ-AGG-001: UberEats webhook receiver.
   * UberEats requires acknowledgment within 20 seconds (strictest SLA).
   * Signs with HMAC-SHA256 header X-Uber-Signature.
   */
  @Post('webhook/ubereats')
  @HttpCode(HttpStatus.OK)
  async handleUberEats(
    @Body() body: any,
    @Headers('x-uber-signature') signature: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-merchant-id') merchantId: string,
  ) {
    this.logger.log(`UberEats webhook received for tenant ${tenantId}`);

    if (!tenantId || !merchantId) {
      throw new BadRequestException('Missing x-tenant-id or x-merchant-id header');
    }

    // TODO (AGG-SEC-002): Verify HMAC-SHA256 signature
    // const clientSecret = await this.secretsService.get(`ubereats_client_secret_${tenantId}`);
    // const expected = crypto.createHmac('sha256', clientSecret).update(JSON.stringify(body)).digest('hex');
    // if (signature !== expected) throw new UnauthorizedException('Invalid UberEats signature');

    try {
      const orderId = await this.aggregator.processWebhook('ubereats', body, tenantId, merchantId);
      return { received: true, orderId };
    } catch (err) {
      this.logger.error(`UberEats webhook processing failed: ${err.message}`, err.stack);
      return { received: true, error: 'Processing queued for retry' };
    }
  }

  /**
   * REQ-AGG-001: GrubHub webhook receiver.
   */
  @Post('webhook/grubhub')
  @HttpCode(HttpStatus.OK)
  async handleGrubHub(
    @Body() body: any,
    @Headers('x-grubhub-signature') signature: string,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-merchant-id') merchantId: string,
  ) {
    this.logger.log(`GrubHub webhook received for tenant ${tenantId}`);

    if (!tenantId || !merchantId) {
      throw new BadRequestException('Missing x-tenant-id or x-merchant-id header');
    }

    try {
      const orderId = await this.aggregator.processWebhook('grubhub', body, tenantId, merchantId);
      return { received: true, orderId };
    } catch (err) {
      this.logger.error(`GrubHub webhook processing failed: ${err.message}`, err.stack);
      return { received: true, error: 'Processing queued for retry' };
    }
  }

  /**
   * REQ-AGG-001: Handle explicit cancellation webhooks (all platforms).
   */
  @Post('webhook/cancel')
  @HttpCode(HttpStatus.OK)
  async handleCancellation(
    @Body() body: { aggregator: string; externalOrderId: string; merchantId: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId || !body.aggregator || !body.externalOrderId) {
      throw new BadRequestException('Missing required fields');
    }
    await this.aggregator.handleCancellation(
      body.aggregator, body.externalOrderId, tenantId, body.merchantId, body,
    );
    return { cancelled: true };
  }
}
