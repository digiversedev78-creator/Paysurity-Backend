import { Module } from '@nestjs/common';
import { PayFactorService } from './pay-factor.service';
import { PayFactorController } from './pay-factor.controller';
import { AelsHmacGuard } from './aels-hmac.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [PayFactorController],
  providers: [PayFactorService, AelsHmacGuard],
  exports: [PayFactorService],
})
export class PayFactorModule {}
