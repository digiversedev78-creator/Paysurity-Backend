import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { sql } from 'drizzle-orm';
import { systemHealthLogs } from '@paysurity/database';

@Injectable()
export class SystemHealthCronService {
  private readonly logger = new Logger(SystemHealthCronService.name);

  constructor(@Inject('DATABASE') private readonly db: any) {}

  @Cron('0,30 * * * *') // Execute every 30 minutes
  async checkSystemHealth() {
    this.logger.log('Executing asynchronous System Health Checks...');

    // We execute these asynchronously so as not to block the event loop
    Promise.allSettled([
      this.checkDatabaseHealth(),
      // Add checkRedisHealth() or checkPaymentGateway() here similarly
    ]).catch(err => {
      this.logger.error('Failed to execute health checks', err);
    });
  }

  private async checkDatabaseHealth() {
    const start = performance.now();
    let status: 'GREEN' | 'YELLOW' | 'RED' = 'RED';
    
    try {
      await (this.db as any).execute(sql`SELECT 1`);
      
      const latency = Math.round(performance.now() - start);
      if (latency < 100) {
        status = 'GREEN';
      } else if (latency <= 500) {
        status = 'YELLOW';
      } else {
        status = 'RED';
      }

      await (this.db as any).insert(systemHealthLogs).values({
        component: 'POSTGRES_DB',
        pingLatencyMs: latency,
        status,
      });

      this.logger.log(`Database Health: ${status} (${latency}ms)`);
    } catch (error) {
       this.logger.error('Database Health check failed', error);
       await (this.db as any).insert(systemHealthLogs).values({
         component: 'POSTGRES_DB',
         pingLatencyMs: -1,
         status: 'RED',
       }).catch(() => {}); // ignore insertion error if DB is totally down
    }
  }

  async getLatestHealthStatus() {
    // Return latest health status for the admin portal dashboard
    return (this.db as any).select().from(systemHealthLogs).orderBy(sql`${systemHealthLogs.checkedAt} DESC`).limit(5);
  }
}

