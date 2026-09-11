
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg'; // PostgreSQL connection pool from 'pg'
import { ConfigService } from '@nestjs/config'; // For accessing environment variables in NestJS
import * as schema from '@paysurity/database'; // Import the Drizzle schema definitions for the PaySurity platform

// This constant serves as the injection token for the Drizzle ORM database instance.
// It aligns with the requirement to inject the database using `@Inject('DATABASE')`.
export const DRIZZLE_ORM_TOKEN = 'DATABASE';

// This is the custom provider definition for NestJS.
// It specifies how to create and provide the Drizzle ORM database instance.
// The `useFactory` function handles the asynchronous setup of the PostgreSQL connection pool
// and then initializes the Drizzle ORM client using that pool and the imported schema.
export const DrizzleOrmProvider = {
  provide: DRIZZLE_ORM_TOKEN, // The token under which the Drizzle instance will be provided
  useFactory: async (configService: ConfigService): Promise<NodePgDatabase<typeof schema>> => {
    // Retrieve the database connection string from environment variables
    const connectionString = configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set. Please ensure your .env file or configuration provides it for database connection.');
    }

    // Configure the PostgreSQL connection pool
    const pool = new Pool({
      connectionString: connectionString,
      // Optional: Configure connection pool settings via environment variables for flexibility
      max: parseInt(configService.get<string>('DATABASE_POOL_MAX', '10'), 10), // Maximum number of clients in the pool
      idleTimeoutMillis: parseInt(configService.get<string>('DATABASE_POOL_IDLE_TIMEOUT_MILLIS', '30000'), 10), // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: parseInt(configService.get<string>('DATABASE_POOL_CONNECTION_TIMEOUT_MILLIS', '2000'), 10), // How long to wait for a new connection from the pool
    });

    // Perform an initial connection test to ensure database accessibility at application startup.
    // This helps in early detection of configuration or connectivity issues.
    try {
      const client = await pool.connect();
      client.release(); // Release the client back to the pool immediately after testing
      console.log('[Drizzle] Database pool connected successfully and test connection passed.');
    } catch (e) {
      console.error('[Drizzle] Failed to connect or test database pool:', e);
      // It's critical for the application to have a working database connection.
      // Re-throwing the error will prevent the application from starting if the connection fails.
      throw new Error(`Failed to initialize Drizzle ORM connection: ${e.message}`);
    }

    // Initialize Drizzle ORM with the configured PostgreSQL pool and the PaySurity schema.
    // A logger is enabled in development mode to output SQL queries, which is useful for debugging.
    const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });
    return db;
  },
  inject: [ConfigService], // Declare that ConfigService is a dependency for the useFactory function
};

// Export the DrizzleOrmProvider as the default export.
// This replaces the AUTO-STUB placeholder with the actual, working Drizzle ORM provider.
export default DrizzleOrmProvider;
