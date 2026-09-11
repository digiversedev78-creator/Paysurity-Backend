import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@paysurity/database';

export const PG_CONNECTION: Provider<NodePgDatabase<typeof schema>> = {
  provide: 'PG_CONNECTION',
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in the application configuration. Please set it in your .env file or configuration.');
    }

    const pool = new Pool({
      connectionString: connectionString,
    });

    try {
      await pool.query('SELECT 1');
    } catch (error) {
      console.error('Drizzle provider: Failed to connect to PostgreSQL database:', error);
      throw error;
    }

    return drizzle(pool, { schema });
  },
  inject: [ConfigService],
};
