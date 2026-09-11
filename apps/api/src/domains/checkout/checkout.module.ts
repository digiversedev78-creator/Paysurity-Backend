/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-015 -- FDA Tobacco/Age Compliance
 * FILE TYPE:    MODULE
 * MODULE:       checkout
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-073
 * GENERATED:    2026-03-17T13:09:27.898Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// This file is part of PaySurity-Platform-2026.
// Copyright (C) 2026, PaySurity. All Rights Reserved.
// POSG-015: FDA Tobacco/Age Compliance - Checkout Module

import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
// fixed by fix-import-paths
import { AuditLogModule } from '../audit-log/audit-log.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    // Provides NodePgDatabase<any> (renamed from DatabaseModule as per imports)
    AuditLogModule, // Provides AuditLogService
    TenantModule,   // Provides TenantGuard and TenantService (if needed)
  ],
  controllers: [],
  providers: [OrdersService],
  exports: [OrdersService], // Export if other modules need to use OrdersService
})
export class CheckoutModule {}
