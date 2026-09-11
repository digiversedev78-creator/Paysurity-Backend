/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-001 -- SKU Product Management
 * FILE TYPE:    MODULE
 * MODULE:       products
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-074
 * GENERATED:    2026-03-17T13:09:06.254Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule], // Correctly import DatabaseModule (which provides Drizzle ORM) and AuditLogModule
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], // Export ProductsService if other modules depend on it
})
export class ProductsModule {}
