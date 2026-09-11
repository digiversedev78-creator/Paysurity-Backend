import { Module, Global } from '@nestjs/common';
import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
/**
 * A mock AuditLogService for demonstration purposes.
 * In a production environment, this would be replaced by a real AuditLogService
 * provided from its dedicated module.
 */
class MockAuditLogService { 
  log(entityType: string, entityId: string, operation: string, userId: string, tenantId: string, details?: any) {
    // console.log(`AUDIT LOG: ${operation} on ${entityType}:${entityId} by ${userId} (Tenant: ${tenantId})`, details);
    return Promise.resolve();
  }
}

/**
 * This module provides the `AUDIT_LOG_SERVICE` globally.
 * It uses a mock implementation for demonstration.
 * In a real application, you would import and provide the actual AuditLogService from its own module.
 */
@Global()
@Module({
  providers: [
    {
      provide: 'AUDIT_LOG_SERVICE',
      useClass: MockAuditLogService,
    },
  ],
  exports: ['AUDIT_LOG_SERVICE'],
})
export class AuditLogServiceModule {}

/**
 * Returns Module: Handles all operations related to product returns.
 * This module orchestrates the controllers and services for the returns domain.
 */
@Module({
  imports: [
    // Provides the Drizzle ORM connection
    AuditLogServiceModule, // Provides the global AUDIT_LOG_SERVICE
  ],
  controllers: [ReturnsController],
  providers: [
    ReturnsService,
  ],
  exports: [
    ReturnsService, // Export ReturnsService if other modules need to inject it
  ],
})
export class ReturnsModule {}
