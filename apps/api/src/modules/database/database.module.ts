/**
 * DatabaseModule — provides the 'DATABASE' Drizzle-ORM token to any module
 * that imports it. Uses the existing database.provider.ts which reads from
 * the DATABASE_URL env var.  This module is the canonical way to inject the
 * NodePgDatabase client across all vertical modules.
 */
import { Module, Global } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const DATABASE_PROVIDER = {
  provide: 'DATABASE',
  useFactory: async (): Promise<NodePgDatabase<any>> => {
    const connectionString = process.env.DATABASE_URL ?? 
      'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev';
    const pool = new pg.Pool({ connectionString, max: 10 });
    return drizzle(pool);
  },
};

@Global()
@Module({
  providers: [DATABASE_PROVIDER],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}
