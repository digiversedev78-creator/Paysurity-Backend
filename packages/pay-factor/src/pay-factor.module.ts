import { Module } from '@nestjs/common';
import { PayFactorService } from './pay-factor.service';
import { PayFactorController } from './pay-factor.controller';
import { AelsHmacGuard } from './aels-hmac.guard';

@Module({
  imports: [],
  controllers: [PayFactorController],
  providers: [PayFactorService, AelsHmacGuard],
  exports: [PayFactorService],
})
export class PayFactorModule {}
