/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-007 -- QR Code Table Pay
 * FILE TYPE:    TEST
 * MODULE:       payment
 * PRIORITY:     P1
 * ═══════════════════════════════════════════════════════════
 *
 * BullMQ / Redis isolation:
 *   jest.mock is hoisted by ts-jest above all imports, so the
 *   EventBusModule is replaced with a no-op NestJS module before
 *   BullMQ can construct any Redis connection.  This keeps the
 *   test hermetic—no real infrastructure required.
 */

// ─── Hoist: replace EventBusModule & BullMQ before any import resolves ───────
jest.mock('../event-bus/event-bus.module', () => {
  const { Module } = require('@nestjs/common');
  const { EventBusService } = require('../event-bus/event-bus.service');

  @Module({
    providers: [
      {
        provide: EventBusService,
        useValue: { publishPaymentEvent: jest.fn(), publish: jest.fn() },
      },
    ],
    exports: [EventBusService],
  })
  class MockEventBusModule {}

  return { EventBusModule: MockEventBusModule };
});

// ─── Hoist: replace FluidPayService (needs DATABASE token) with a no-op ──────
jest.mock('./fluidpay.service', () => ({
  FluidPayService: jest.fn().mockImplementation(() => ({
    authorizeCard: jest.fn(),
  })),
}));

// ─── Hoist: replace gateway adapters (need DATABASE/external APIs) ────────────
jest.mock('./adapters/fluidpay.adapter', () => ({
  FluidPayAdapter: jest.fn().mockImplementation(() => ({
    authorize:  jest.fn(),
    capture:    jest.fn(),
    void:       jest.fn(),
    refund:     jest.fn(),
  })),
}));
jest.mock('./adapters/nmi.adapter', () => ({
  NMIAdapter: jest.fn().mockImplementation(() => ({
    authorize:  jest.fn(),
    capture:    jest.fn(),
    void:       jest.fn(),
    refund:     jest.fn(),
  })),
}));
jest.mock('./adapters/argyle.adapter', () => ({
  ArgyleAdapter: jest.fn().mockImplementation(() => ({
    authorize:  jest.fn(),
    capture:    jest.fn(),
    void:       jest.fn(),
    refund:     jest.fn(),
  })),
}));
jest.mock('./adapters/gateway-router', () => ({
  GatewayRouter: jest.fn().mockImplementation(() => ({
    route: jest.fn(),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  HttpStatus,
  ValidationPipe,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import * as request from 'supertest';
import { PaymentModule } from './payment.module';
import { PaymentService } from './payment.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PaymentIntentStatus, PaymentIntentResponseDto } from '../dto/qr-code-table-pay.dto';

describe('PaymentController (e2e) - QR Code Table Pay', () => {
  let app: INestApplication;
  let paymentService: PaymentService;

  const mockTenantId         = 'f9e8d7c6-b5a4-3210-fedc-ba9876543210';
  const mockQrCodeIdentifier = 'test-qr-table-123';

  // Canonical shape: matches PaymentIntentResponseDto exactly
  const mockPaymentIntent: PaymentIntentResponseDto = {
    id:           'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    clientSecret: 'pi_test_secret_abc',
    amount:       1000,
    currency:     'USD',
    status:       PaymentIntentStatus.PENDING,
    orderId:      'order-id-456',
    createdAt:    new Date('2023-01-01T00:00:00.000Z').toISOString(),
    updatedAt:    new Date('2023-01-01T00:00:00.000Z').toISOString(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentModule],
    })
      // Provide DATABASE token for any providers that weren't fully mocked
      .overrideProvider('DATABASE')
      .useValue({ execute: jest.fn() })
      .overrideProvider(PaymentService)
      .useValue({
        retrieveQrCodePaymentIntent: jest.fn(),
        createPaymentIntent:         jest.fn(),
        getPaymentIntent:            jest.fn(),
        confirmPaymentIntent:        jest.fn(),
        capturePaymentIntent:        jest.fn(),
        voidPaymentIntent:           jest.fn(),
        refundPaymentIntent:         jest.fn(),
      })
      .overrideProvider(AuditLogService)
      .useValue({ record: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist:                true,
        forbidNonWhitelisted:     true,
        transform:                true,
        transformOptions:         { enableImplicitConversion: true },
      }),
    );

    // Simulate auth middleware that injects tenantId
    app.use((req: any, _res: any, next: any) => {
      req.tenantId = mockTenantId;
      next();
    });

    await app.init();

    paymentService = moduleFixture.get<PaymentService>(PaymentService);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('/payment/qr-pay/:qrCodeIdentifier (GET) - should return a payment intent', async () => {
    jest
      .spyOn(paymentService as any, 'retrieveQrCodePaymentIntent')
      .mockResolvedValue(mockPaymentIntent);

    const response = await request(app.getHttpServer())
      .get(`/payments/qr-pay/${mockQrCodeIdentifier}`)
      .set('Authorization', `Bearer some-token`)
      .expect(HttpStatus.OK);

    expect(response.body).toBeDefined();
    expect(response.body.id).toBe(mockPaymentIntent.id);
    expect(response.body.status).toBe(mockPaymentIntent.status);
    expect((paymentService as any).retrieveQrCodePaymentIntent).toHaveBeenCalledWith(
      mockTenantId,
      mockQrCodeIdentifier,
    );
  });

  it('/payment/qr-pay/:qrCodeIdentifier (GET) - should return 404 if payment intent not found', async () => {
    jest
      .spyOn(paymentService as any, 'retrieveQrCodePaymentIntent')
      .mockRejectedValueOnce(
        new NotFoundException(
          `Payment intent not found or not active for QR code identifier "${mockQrCodeIdentifier}".`,
        ),
      );

    const response = await request(app.getHttpServer())
      .get(`/payments/qr-pay/${mockQrCodeIdentifier}`)
      .set('Authorization', `Bearer some-token`)
      .expect(HttpStatus.NOT_FOUND);

    expect(response.body.message).toBe(
      `Payment intent not found or not active for QR code identifier "${mockQrCodeIdentifier}".`,
    );
  });

  it('/payment/qr-pay/:qrCodeIdentifier (GET) - should return 500 for internal server errors', async () => {
    jest
      .spyOn(paymentService as any, 'retrieveQrCodePaymentIntent')
      .mockRejectedValueOnce(
        new InternalServerErrorException(
          'Failed to retrieve QR code payment intent due to an internal error.',
        ),
      );

    const response = await request(app.getHttpServer())
      .get(`/payments/qr-pay/${mockQrCodeIdentifier}`)
      .set('Authorization', `Bearer some-token`)
      .expect(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(response.body.message).toBe(
      'Failed to retrieve QR code payment intent due to an internal error.',
    );
  });
});
