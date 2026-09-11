import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletFiatService } from './wallet-fiat.service';
import { WalletController } from './wallet.controller';
import { WalletCompatController } from './wallet-compat.controller';
import { WalletAdminController } from './wallet-admin.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DatabaseModule } from '../database/database.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [AuditLogModule, DatabaseModule, EventBusModule, PaymentModule],
  controllers: [WalletController, WalletCompatController, WalletAdminController],
  providers: [WalletService, WalletFiatService, { provide: 'REQUEST_CONTEXT', useValue: { currentLocationId: '' } }],
  exports: [WalletService, WalletFiatService],
})
export class WalletModule {}

