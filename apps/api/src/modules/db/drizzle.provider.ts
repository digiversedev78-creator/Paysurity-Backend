import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@paysurity/database'; // Assuming this exports the Drizzle schema object

export const InjectDrizzle = 'DATABASE';

export type DrizzlePgType = NodePgDatabase<typeof schema>;

export const drizzleProvider: Provider = {
  provide: InjectDrizzle,
  useFactory: async (configService: ConfigService) => {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const databaseSsl = configService.get<string>('DATABASE_SSL');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in the configuration.');
    }

    const sslConfig = databaseSsl === 'true'
      ? { rejectUnauthorized: false }
      : false;

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: sslConfig,
    });

    try {
      await pool.query('SELECT 1');
      console.log('Drizzle provider: Successfully connected to the database.');
    } catch (error) {
      console.error('Drizzle provider: Failed to connect to the database.', error);
      throw new Error('Drizzle provider: Database connection failed.');
    }

    return drizzle(pool, { schema, logger: true }) as DrizzlePgType;
  },
  inject: [ConfigService],
};
