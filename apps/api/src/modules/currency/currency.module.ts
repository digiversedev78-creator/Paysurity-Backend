import { Module, Global } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Global()
@Module({
  imports: [
    AuditLogModule,
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
