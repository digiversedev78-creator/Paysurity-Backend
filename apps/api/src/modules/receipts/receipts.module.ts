const ReceiptsController: any = class {};
import { Module } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
// receipts controller removed
import { AuditLogModule } from '../audit-log/audit-log.module'; // Rule: import AuditLogModule
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres'; // Import drizzle function and NodePgDatabase type
import * as schema from '@paysurity/database'; // Rule: Import from '@paysurity/database' for schema tables
import { Pool } from 'pg'; // Import Pool type for database connection

@Module({
  imports: [
    // Required to provide 'DATABASE'
    AuditLogModule, // Rule: import AuditLogModule
  ],
  controllers: [ReceiptsController],
  providers: [
    ReceiptsService,
    // AuditLogService is expected to be provided and exported by AuditLogModule,
    // so it doesn't need to be listed directly in ReceiptsModule's providers.
    {
      provide: 'DRIZZLE_CLIENT',
      inject: ['DATABASE'], // Inject the PostgreSQL connection pool
      useFactory: (pgConnection: Pool) => {
        // Initialize Drizzle ORM client with the PostgreSQL connection pool and schema
        return drizzle(pgConnection, { schema: schema, logger: true }) as NodePgDatabase<typeof schema>;
      },
    },
  ],
  exports: [ReceiptsService], // Export ReceiptsService if other modules need to inject it
})
export class ReceiptsModule {}






