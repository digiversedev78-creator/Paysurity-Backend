/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ORC-006 -- Settlement Batches
 * FILE TYPE:    MODULE
 * MODULE:       settlement
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/ORC_PAYMENT_ORCHESTRATION.md
 * WORKER:       CODER-006
 * GENERATED:    2026-03-17T13:05:40.201Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { SettlementBatchesService } from './settlement-batches.service';
import { SettlementBatchesController } from './settlement-batches.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule], // Corrected DatabaseModule to DatabaseModule
  controllers: [SettlementBatchesController],
  providers: [SettlementBatchesService],
  exports: [SettlementBatchesService],
})
export class SettlementModule {}
