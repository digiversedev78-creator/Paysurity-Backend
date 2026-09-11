import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { DashboardController } from './dashboard.controller';
import { TenantService } from './tenant.service';
import { CRMService } from './crm.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { EscrowGuardianCron } from './escrow-guardian.cron';
import { PriceUpdateService } from './price-update.service';
import { MerchantPriceController, AdminPriceController } from './price-update.controller';
import { InventorySentryService } from './inventory-sentry.service';
import { MerchantSentryController, AdminSentryController } from './inventory-sentry.controller';
import { ApplicationService } from './application.service';
import { 
  ApplicationController, 
  AdminApplicationController, 
  OnboardingController, 
  StripeIdentityWebhookController 
} from './application.controller';

@Module({
  imports: [
    AuditLogModule,
  ],
  providers: [
    MerchantService,
    TenantService,
    CRMService,
    EscrowGuardianCron,
    PriceUpdateService,
    InventorySentryService,
    ApplicationService,
  ],
  controllers: [
    MerchantController,
    DashboardController,
    MerchantPriceController,
    AdminPriceController,
    MerchantSentryController,
    AdminSentryController,
    ApplicationController,
    AdminApplicationController,
    OnboardingController,
    StripeIdentityWebhookController,
  ],
  exports: [MerchantService, TenantService, PriceUpdateService, InventorySentryService, ApplicationService],
})
export class MerchantModule {}
