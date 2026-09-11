import { Module } from '@nestjs/common';
import { ErpController } from './erp.controller';
import { ErpService } from './erp.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ErpController],
  providers: [ErpService],
  exports: [ErpService],
})
export class ErpModule {}
