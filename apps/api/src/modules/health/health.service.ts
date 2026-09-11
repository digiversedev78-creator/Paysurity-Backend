import { Injectable, Inject } from '@nestjs/common';

// To satisfy the type hint `@Inject('DATABASE') private readonly db: NodePgDatabase<any>`
// without importing from forbidden paths (like `drizzle-orm/node-postgres` or `drizzle-orm/*`),
// we define a minimal interface that represents the expected database client.
// This assumes the injected 'DATABASE' object has a `query` method for executing raw SQL.
interface NodePgDatabase<T> {
  // The `query` method for 'pg' usually returns a Promise<QueryResult>.
  // For a simple 'SELECT 1', the actual return value isn't critical, just success/failure.
  query(sql: string, values?: any[]): Promise<any>;
}

@Injectable()
export class HealthService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Performs a comprehensive health check on the PaySurity application.
   * This includes checking database connectivity, application version,
   * system uptime, and provides a current timestamp.
   *
   * @returns An object detailing the application's health status.
   *          - status: 'ok' if all critical services are healthy, 'degraded' otherwise.
   *          - db: 'connected', 'disconnected', or 'timeout' indicating database status.
   *          - version: The application version (from package.json or fallback).
   *          - uptime: The application uptime in seconds.
   *          - timestamp: The time of the health check in milliseconds since epoch.
   */
  public async checkHealth(): Promise<{
    status: 'ok' | 'degraded';
    db: 'connected' | 'disconnected' | 'timeout';
    version: string;
    uptime: number;
    timestamp: number;
  }> {
    const timestamp = Date.now();
    const version = process.env.npm_package_version || '2026.1.0';
    const uptime = process.uptime(); // Returns uptime in seconds

    let dbStatus: 'connected' | 'disconnected' | 'timeout';

    try {
      // Create a promise that rejects after 3 seconds for the database check timeout
      const dbTimeoutPromise = new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timed out')), 3000)
      );

      // Race the database query against the timeout promise
      // As per rules, we cannot import `sql` template literal function,
      // so we pass the raw SQL string directly.
      await Promise.race([
        (this.db as any).query('SELECT 1;'),
        dbTimeoutPromise,
      ]);
      dbStatus = 'connected';
    } catch (error: any) {
      if (error.message === 'Database query timed out') {
        dbStatus = 'timeout';
        console.error('HealthService: Database connection check failed: Query timed out (3s).');
      } else {
        dbStatus = 'disconnected';
        console.error('HealthService: Database connection check failed:', error.message);
      }
    }

    // Determine overall status based on critical service health (currently only DB)
    const overallStatus = dbStatus === 'connected' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      db: dbStatus,
      version,
      uptime,
      timestamp,
    };
  }
}

