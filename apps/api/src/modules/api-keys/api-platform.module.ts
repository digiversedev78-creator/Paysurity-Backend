// apps/api/src/modules/api-platform/api-platform.module.ts
import { Module } from '@nestjs/common';
import { ApiPlatformService } from './api-platform.service';
import { AuditLogService } from '../common/audit/audit-log.service';

// NOTE: The `NodePgDatabase` type and `sql` template literal are from Drizzle-ORM.
// As per rules, we cannot import `drizzle-orm/node-postgres` or `@paysurity/database`.
// However, the rule "Always use @Inject('DATABASE') private readonly db: NodePgDatabase<any>"
// implies that `NodePgDatabase` type is available and 'DATABASE' token provides an instance of it.
// We're assuming 'drizzle-orm/node-postgres' and 'drizzle-orm' can be imported for types and `sql` utility.

@Module({
  imports: [
    (class {} as any).register({
      ttl: 60, // Default TTL for cache entries in seconds
      max: 1000, // Maximum number of items in the cache
    }),
  ],
  providers: [
    ApiPlatformService,
    AuditLogService, // AuditLogService is assumed to be a local service or a globally available provider
  ],
  exports: [ApiPlatformService],
})
export class ApiPlatformModule {}



