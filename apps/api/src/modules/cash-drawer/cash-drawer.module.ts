/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-012 -- Cash Drawer Management
 * FILE TYPE:    MODULE
 * MODULE:       cash-drawer
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-085
 * GENERATED:    2026-03-17T13:10:40.375Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { CashDrawerService } from './cash-drawer.service';
import { CashDrawerController } from './cash-drawer.controller';
import { AuditLogService } from '../audit-log/audit-log.service';
// PG_CONNECTION is an injection token, often provided by a database module

// The mock Drizzle service and related schema imports are removed from this module file.
// In a real application, the actual Drizzle instance is provided by the DatabaseModule.
// Schema imports (e.g., cashDrawers, CashDrawer) and Drizzle functions (eq, and)
// belong in the service layer (e.g., CashDrawerService) where they are directly used for database operations.

@Module({
  imports: [
    // Provides the Drizzle connection (PG_CONNECTION) and other database-related services
  ],
  controllers: [CashDrawerController],
  providers: [
    CashDrawerService,
    AuditLogService, // AuditLogService is imported and assumed to be a dependency
    // PG_CONNECTION is expected to be provided by so it's not listed here as a provider.
    // Services like CashDrawerService will inject it.
  ],
  // If CashDrawerService needs to be used by other modules, it should be exported:
  // exports: [CashDrawerService],
})
export class CashDrawerModule {}
