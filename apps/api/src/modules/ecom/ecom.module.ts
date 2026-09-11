import { Module } from '@nestjs/common';
import { PriceEngineModule } from '../price-engine/price-engine.module';
import { TaxModule } from '../tax/tax.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';
import { EcomProductService } from './product.service';
import { ShippingService } from './shipping.service';
import { CheckoutController } from './checkout.controller';
import { ShippingController } from './shipping.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    AuditLogModule,
    PriceEngineModule,
    TaxModule,
    PaymentModule,
    NotificationModule,
  ],
  providers: [
    EcomProductService,
    ShippingService,
    {
      provide: 'S3_CLIENT',
      useValue: {}, // Mock S3Client
    },
  ],
  controllers: [
    CheckoutController,
    ShippingController,
  ],
})
export class EcomModule { }
