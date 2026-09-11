/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-011 -- Employee Schedule
 * FILE TYPE:    MODULE
 * MODULE:       employees
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-069
 * GENERATED:    2026-03-17T13:09:22.417Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { EmployeeSchedulesService } from './employee-schedules.service';
import { EmployeeSchedulesController } from './employee-schedules.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    // Provides Drizzle ORM instance
    AuditLogModule, // Provides AuditLogService
  ],
  controllers: [EmployeeSchedulesController],
  providers: [EmployeeSchedulesService],
  // Export EmployeeSchedulesService if other modules need to inject it
  exports: [EmployeeSchedulesService],
})
export class EmployeesModule {}
