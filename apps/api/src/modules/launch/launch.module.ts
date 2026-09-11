import { Module, Global } from '@nestjs/common';
import { LaunchService, OpsService, HardeningService } from './launch.service';
import { LaunchController } from './launch.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Global()
@Module({
  imports: [AuditLogModule],
  controllers: [LaunchController],
  providers: [LaunchService, OpsService, HardeningService],
  exports: [LaunchService],
})
export class LaunchModule {}
