import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
// This module provides Drizzle ORM instance
import { AuditLogModule } from '../audit-log/audit-log.module'; // Assuming AuditLogModule exists
import { AuthModule } from '../auth/auth.module'; // Assuming AuthModule exists and provides AuthGuard

@Module({
  imports: [AuditLogModule, AuthModule], // Use DatabaseModule to provide Drizzle ORM
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService], // Export if other modules might need to use TablesService
})
export class TablesModule {}
