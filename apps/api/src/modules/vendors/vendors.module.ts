/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-013 -- Vendor Management
 * FILE TYPE:    MODULE
 * MODULE:       vendors
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-071
 * GENERATED:    2026-03-17T13:08:22.227Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

// As per rules, Drizzle ORM schema definitions (vendorStatusEnum, vendors, auditLog)
// should be imported from '@paysurity/database' or managed centrally by DatabaseModule.
// They are removed from this module file to keep it clean and adhere to the project structure.

@Module({
  imports: [AuditLogModule], // Corrected DatabaseModule to DatabaseModule as per common practice
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService], // Exporting VendorsService for potential use by other modules
})
export class VendorsModule {}
