import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database';

export const DATABASE_PROVIDER_TOKEN = 'DATABASE';

export const drizzleProviders: Provider[] = [
  {
    provide: DATABASE_PROVIDER_TOKEN,
    useFactory: async (configService: ConfigService): Promise<NodePgDatabase<typeof schema>> => {
      const connectionString = configService.get<string>('DATABASE_URL');

      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set. Please provide it in your .env file or configuration.');
      }

      const pool = new Pool({
        connectionString: connectionString,
        // Enable SSL for production environments, disable for local development if not needed
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      const db = drizzle(pool, { schema: schema });

      return db;
    },
    inject: [ConfigService],
  },
];
