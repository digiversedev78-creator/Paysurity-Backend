import { Module, Global } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Global()
@Module({
  imports: [
    AuditLogModule,
  ],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
