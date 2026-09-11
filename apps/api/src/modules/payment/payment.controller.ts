/**
 * PaymentController â€” re-wired to match PaymentService method signatures.
 * All controller methods extract userId from req.user and delegate to service.
 */
import {
  Controller, Get, Post, Body, Param, Request, Headers,
  HttpCode, HttpStatus, Logger
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiHeader } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { FluidPayService } from './fluidpay.service';
import {
  CreatePaymentIntentDto,
  ConfirmPaymentIntentDto,
  PaymentIntentResponseDto,
} from '../dto/qr-code-table-pay.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly fluidpayService: FluidPayService
  ) {}

  private getTenantAndUser(req: any): { tenantId: string; userId: string } {
    const tenantId = req?.user?.tenantId || req?.headers?.['x-tenant-id'] || req?.tenantId;
    const userId   = req?.user?.id       || req?.user?.userId || 'system';
    if (!tenantId) throw new Error('Forbidden: tenantId missing from request context.');
    return { tenantId, userId };
  }

  @Get('qr-pay/:qrCodeIdentifier')
  @ApiOperation({ summary: 'Retrieve an active payment intent for a QR code table pay session' })
  @ApiParam({ name: 'qrCodeIdentifier', type: String })
  @ApiResponse({ status: 200, description: 'Payment intent for QR code', type: PaymentIntentResponseDto })
  @ApiResponse({ status: 404, description: 'QR payment intent not found or inactive' })
  async retrieveQrCodePaymentIntent(
    @Request() req: any,
    @Param('qrCodeIdentifier') qrCodeIdentifier: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId } = this.getTenantAndUser(req);
    return (this.paymentService as any).retrieveQrCodePaymentIntent(tenantId, qrCodeIdentifier);
  }

  @Post('intent')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Payment Intent' })
  @ApiBody({ type: CreatePaymentIntentDto })
  @ApiHeader({ name: 'X-Idempotency-Key', required: true })
  @ApiResponse({ status: 201, description: 'Payment intent created', type: PaymentIntentResponseDto })
  async createPaymentIntent(
    @Request() req: any,
    @Body() dto: CreatePaymentIntentDto,
    @Headers('x-idempotency-key') _idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId, userId } = this.getTenantAndUser(req);
    this.logger.log(`[${tenantId}] Creating payment intent`);
    return (this.paymentService as any).createPaymentIntent(tenantId, userId, dto);
  }

  @Get('intent/:id')
  @ApiOperation({ summary: 'Get a Payment Intent by ID' })
  @ApiParam({ name: 'id', type: String })
  async getPaymentIntent(
    @Request() req: any,
    @Param('id') intentId: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId } = this.getTenantAndUser(req);
    return (this.paymentService as any).getPaymentIntent(tenantId, intentId);
  }

  @Post('intent/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm a Payment Intent' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: ConfirmPaymentIntentDto })
  @ApiHeader({ name: 'X-Idempotency-Key', required: true })
  async confirmPaymentIntent(
    @Request() req: any,
    @Param('id') intentId: string,
    @Body() dto: ConfirmPaymentIntentDto,
    @Headers('x-idempotency-key') _idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId, userId } = this.getTenantAndUser(req);
    return (this.paymentService as any).confirmPaymentIntent(tenantId, userId, intentId, dto);
  }

  @Post('intent/:id/capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capture a Payment Intent' })
  @ApiParam({ name: 'id', type: String })
  @ApiHeader({ name: 'X-Idempotency-Key', required: true })
  async capturePaymentIntent(
    @Request() req: any,
    @Param('id') intentId: string,
    @Headers('x-idempotency-key') _idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId, userId } = this.getTenantAndUser(req);
    return (this.paymentService as any).capturePaymentIntent(tenantId, userId, intentId);
  }

  @Post('intent/:id/void')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void a Payment Intent' })
  @ApiParam({ name: 'id', type: String })
  @ApiHeader({ name: 'X-Idempotency-Key', required: true })
  async voidPaymentIntent(
    @Request() req: any,
    @Param('id') intentId: string,
    @Headers('x-idempotency-key') _idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId, userId } = this.getTenantAndUser(req);
    return (this.paymentService as any).voidPaymentIntent(tenantId, userId, intentId);
  }

  @Post('intent/:id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a Payment Intent' })
  @ApiParam({ name: 'id', type: String })
  @ApiHeader({ name: 'X-Idempotency-Key', required: true })
  async refundPaymentIntent(
    @Request() req: any,
    @Param('id') intentId: string,
    @Body() body: { amount?: number },
    @Headers('x-idempotency-key') _idempotencyKey: string,
  ): Promise<PaymentIntentResponseDto> {
    const { tenantId, userId } = this.getTenantAndUser(req);
    return (this.paymentService as any).refundPaymentIntent(tenantId, userId, intentId, body?.amount);
  }

  @Post('intent/:id/confirm-card')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'UI integration: confirm intent natively via raw card data' })
  async confirmWithCard(
    @Request() req: any,
    @Param('id') intentId: string,
    @Body() body: any
  ) {
    const { tenantId } = this.getTenantAndUser(req);
    if (!body.card) throw new Error("Missing Card Payload");
    return (this.fluidpayService as any).authorizeCard(tenantId, intentId, body.card);
  }

  @Post('webhook/fluidpay')
  @HttpCode(HttpStatus.OK)
  async handleFluidPayWebhook(@Body() payload: any) {
    this.logger.log(`Received FluidPay Webhook: ${JSON.stringify(payload)}`);
    // Placeholder for BullMQ queue injection
    return { received: true };
  }

  @Post('webhook/nmi')
  @HttpCode(HttpStatus.OK)
  async handleNMIWebhook(@Body() payload: any) {
    this.logger.log(`Received NMI Webhook: ${JSON.stringify(payload)}`);
    // Placeholder for BullMQ queue injection
    return { received: true };
  }
}

