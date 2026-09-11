/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-011 -- Sub-Merchant / ISO
 * FILE TYPE:    MODULE
 * MODULE:       merchants
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-119
 * GENERATED:    2026-03-17T13:11:44.051Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// The user wants production-ready NestJS TypeScript code for the "Sub-Merchant / ISO" requirement (MER-011).
// This file defines the MerchantsModule, which orchestrates the MerchantsController and MerchantsService.
// It imports necessary modules like DatabaseModule and AuditLogModule to provide dependencies.

import { Module } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { MerchantsController } from './merchants.controller';
import { AuditLogModule } from '../audit-log/audit-log.module'; // Assuming AuditLogModule for audit logging

@Module({
  imports: [AuditLogModule], // Import DatabaseModule to provide  and AuditLogModule for auditing
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService], // Export MerchantsService if other modules need to interact with merchants
})
export class MerchantsModule {}
