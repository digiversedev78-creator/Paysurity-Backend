/**
 * PayFactorController — FAC-001 through FAC-007 (Escrow Model).
 * All endpoints are tenant-scoped through JWT auth.
 */
import {
  Controller, Post, Get, Body, Headers,
  HttpCode, HttpStatus, Logger, BadRequestException,
  Req, Param, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PayFactorService } from './pay-factor.service';
import { AelsHmacGuard } from './aels-hmac.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PayFactorApplyDto,
  PayFactorEscrowDto,
  PayFactorReleaseAdvanceDto,
  PayFactorReleaseSettlementDto,
  PayFactorWebhookDto,
} from './pay-factor.dto';

@ApiTags('PayFactor')
@Controller('v1/payfactor')
export class PayFactorController {
  private readonly logger = new Logger(PayFactorController.name);

  constructor(
    private readonly payFactorService: PayFactorService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private getTenantId(req: Request): string {
    const tenantId = (req as any).user?.tenantId || (req.headers as any)['x-tenant-id'];
    if (!tenantId) throw new BadRequestException('Tenant context missing.');
    return tenantId;
  }

  private getUserId(req: Request): string {
    return (req as any).user?.id || (req as any).user?.userId || 'system';
  }

  // ── REQ-FAC-001: Driver KYC Apply ────────
  @Post('apply')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit KYC application for PayFactor enrollment' })
  @ApiBody({ type: PayFactorApplyDto })
  @ApiResponse({ status: 202, description: 'Application submitted.' })
  async apply(@Body() applyDto: PayFactorApplyDto, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const result = await this.payFactorService.applyForKyc(tenantId, applyDto);
    await this.eventEmitter.emit('audit.record', { tenantId: tenantId, ...{ userId, action: 'PAYFACTOR_KYC_APPLY', details: { applicationId: result.applicationId } } });
    return { message: 'Application submitted.', ...result };
  }

  // ── REQ-FAC-002: KYC Status ────────
  @Get('status/:applicationId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get PayFactor KYC application status' })
  @ApiParam({ name: 'applicationId', type: String })
  async getApplicationStatus(@Param('applicationId') applicationId: string, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const status = await this.payFactorService.getApplicationStatus(tenantId, applicationId);
    await this.eventEmitter.emit('audit.record', { tenantId: tenantId, ...{ userId, action: 'PAYFACTOR_STATUS_CHECK', details: { applicationId } } });
    return status;
  }

  // ── REQ-FAC-003: Create Escrow ────────
  @Post('escrow')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an escrow account for a payment load' })
  @ApiBody({ type: PayFactorEscrowDto })
  @ApiResponse({ status: 201, description: 'Escrow created.' })
  async createEscrow(@Body() escrowDto: PayFactorEscrowDto, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const escrow = await this.payFactorService.createEscrow(tenantId, escrowDto);
    await this.eventEmitter.emit('audit.record', { tenantId: tenantId, ...{ userId, action: 'PAYFACTOR_ESCROW_CREATE', details: { escrowId: escrow.escrowId } } });
    return { message: 'Escrow created.', ...escrow };
  }

  // ── REQ-FAC-004: Release Advance ────────
  @Post('advance')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release advance from escrow' })
  @ApiBody({ type: PayFactorReleaseAdvanceDto })
  async releaseAdvance(@Body() advanceDto: PayFactorReleaseAdvanceDto, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const result = await this.payFactorService.releaseAdvance(tenantId, advanceDto);
    await this.eventEmitter.emit('audit.record', { tenantId: tenantId, ...{ userId, action: 'PAYFACTOR_ADVANCE_RELEASE', details: advanceDto } });
    return { message: 'Advance released.', ...result };
  }

  // ── REQ-FAC-005: Release Settlement ────────
  @Post('settle')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release settlement from escrow' })
  @ApiBody({ type: PayFactorReleaseSettlementDto })
  async releaseSettlement(@Body() settleDto: PayFactorReleaseSettlementDto, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    // Map to the service method that exists: releaseSettlement(tenantId, payload)
    const result = await this.payFactorService.releaseSettlement(tenantId, settleDto);
    await this.eventEmitter.emit('audit.record', { tenantId: tenantId, ...{ userId, action: 'PAYFACTOR_SETTLEMENT_RELEASE', details: settleDto } });
    return { message: 'Settlement released.', ...result };
  }

  // ── REQ-FAC-006: AELS Webhook ────────
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AelsHmacGuard)
  @ApiOperation({ summary: 'AELS webhook receiver (HMAC-verified)' })
  @ApiResponse({ status: 200, description: 'Webhook processed.' })
  async receiveWebhook(
    @Body() webhookDto: PayFactorWebhookDto,
    @Headers('x-paysurity-signature') _signature: string,
    @Req() req: Request,
  ) {
    this.logger.log(`Webhook received: ${webhookDto.eventType ?? 'unknown'}`);
    // For webhooks, use a system tenant/user since it's a server-to-server call
    const tenantId = (webhookDto as any).tenantId || 'system';
    await this.eventEmitter.emitAsync('audit.record', {
      tenantId,
      userId: 'system_webhook',
      action: 'PAYFACTOR_WEBHOOK_RECEIVED',
      details: { eventType: webhookDto.eventType, id: webhookDto.id },
    });
    return { message: 'Webhook received.' };
  }
}
