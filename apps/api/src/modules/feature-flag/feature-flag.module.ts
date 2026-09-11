import { Module } from '@nestjs/common';
import { FeatureFlagController } from './feature-flag.controller';
import { FeatureFlagService } from './feature-flag.service';
// Assuming path
import { AuditLogModule } from '../audit-log/audit-log.module'; // Assuming path

@Module({
  imports: [AuditLogModule],
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
