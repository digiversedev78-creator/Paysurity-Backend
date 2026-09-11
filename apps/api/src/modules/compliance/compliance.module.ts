/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  COM-007 — Regulatory Reporting Exports
 * FILE TYPE:    MODULE
 * MODULE:       compliance
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/COM_COMPLIANCE_LEGAL.md
 * WORKER:       CODER-039
 * GENERATED:    2026-03-18T10:34:32.502Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
// Assuming DatabaseModule provides DrizzleClient
import { AuditLogService } from '../audit-log/audit-log.service'; // Explicitly importing AuditLogService as it's a provider

@Module({
  imports: [
    // Provides DrizzleClient
  ],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    AuditLogService, // AuditLogService is now a direct provider of this module
  ],
  exports: [ComplianceService],
})
export class ComplianceModule {}
