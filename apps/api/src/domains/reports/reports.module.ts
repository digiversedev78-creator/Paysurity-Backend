/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-008 -- Statement/1099-K
 * FILE TYPE:    MODULE
 * MODULE:       reports
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-116
 * GENERATED:    2026-03-17T13:10:57.560Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuditLogModule } from '../audit-log/audit-log.module'; // Assuming AuditLogModule provides AuditLogService
// fixed by fix-import-paths
import { PassportModule } from '@nestjs/passport';             // Required for AuthGuard('jwt')
import { BullModule } from '@nestjs/bullmq';
import { ReportsProcessor } from './reports.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reports_queue' }),
    AuditLogModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsProcessor],
  exports: [ReportsService],
})
export class ReportsModule {}
