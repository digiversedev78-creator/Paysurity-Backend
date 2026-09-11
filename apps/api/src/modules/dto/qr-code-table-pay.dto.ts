import { IsEnum, IsString, IsNumber, IsUUID, IsOptional, IsUrl, IsPositive } from 'class-validator';

export enum PaymentIntentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  REQUIRES_CONFIRMATION = 'requires_confirmation',
  REQUIRES_ACTION = 'requires_action',
  PROCESSING = 'processing',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  VOIDED = 'voided',
}

export class PaymentIntentResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  clientSecret: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentIntentStatus)
  status: PaymentIntentStatus;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  externalId?: string | null;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @IsUrl()
  qrCodeUrl?: string;

  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}
export class CreatePaymentIntentDto {
  orderId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export class ConfirmPaymentIntentDto {
  paymentMethodId?: string;
  paymentMethodType?: string;
  returnUrl?: string;
}
