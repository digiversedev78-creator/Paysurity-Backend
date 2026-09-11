/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AFR-006 -- Payout Request
 * FILE TYPE:    MODULE
 * MODULE:       affiliates
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/AFR_AFFILIATES_RESELLERS.md
 * WORKER:       CODER-126
 * GENERATED:    2026-03-17T13:14:12.240Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { AffiliatesPayoutsService } from './payouts/affiliates-payouts.service';
import { AffiliatesPayoutsController } from './payouts/affiliates-payouts.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [AffiliatesPayoutsController],
  providers: [AffiliatesPayoutsService],
  exports: [AffiliatesPayoutsService],
})
export class AffiliatesModule {}
