/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-011 -- Tip Management
 * FILE TYPE:    MODULE
 * MODULE:       tips
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-057
 * GENERATED:    2026-03-17T13:07:46.354Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// src/tips/tips.module.ts
import { Module } from '@nestjs/common';
import { TipsService } from './tips.service';
import { TipsController } from './tips.controller';
// Provides the Drizzle ORM instance (PG_CONNECTION)
import { AuditLogModule } from '../audit-log/audit-log.module'; // Provides AuditLogService

@Module({
  imports: [
    // Provides the Drizzle ORM instance (PG_CONNECTION)
    AuditLogModule,   // Provides AuditLogService
  ],
  controllers: [TipsController],
  providers: [TipsService],
  exports: [TipsService], // Export TipsService if other modules need to inject it
})
export class TipsModule {}
