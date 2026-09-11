import { Module } from '@nestjs/common';
import { MerchantOnboardingService } from './merchant-onboarding.service';
import { MerchantOnboardingController } from './merchant-onboarding.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MailerService } from './mailer.service';
import { ComplianceValidationService } from './compliance-validation.service';
import { EncryptionService } from '../../shared/encryption/encryption.service';

@Module({
  imports: [AuditLogModule],
  controllers: [MerchantOnboardingController],
  providers: [MerchantOnboardingService, MailerService, ComplianceValidationService, EncryptionService],
  exports: [MerchantOnboardingService, MailerService, ComplianceValidationService, EncryptionService],
})
export class MerchantOnboardingModule {}
