import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventBusService } from './event-bus.service';
import { PaymentCapturedConsumer } from './consumers/payment-captured.consumer';
import { AuditLogModule } from '../audit-log/audit-log.module';

/**
 * Global Event Bus Module -- BullMQ backed by Redis.
 *
 * Architecture:
 *   Producer -> Redis Queue -> Consumer(s)
 *   Failed jobs -> Dead Letter Queue (DLQ) after max retries
 *
 * Every cross-vertical event goes through this bus.
 * Direct service-to-service calls are ONLY for same-transaction operations.
 * 
 * Redis Configuration (via env vars):
 *   REDIS_URL  - Full Redis URL (takes precedence if set)
 *   REDIS_HOST - Redis hostname (default: localhost)
 *   REDIS_PORT - Redis port (default: 6380)
 *
 * Cloud Run: Set REDIS_HOST= to point to Memorystore instance.
 * Local dev: Needs local Redis on port 6380 (or set REDIS_HOST=disabled to skip).
 */

// Build Redis connection config from env vars
const getRedisConnection = () => {
  // Support disabling Redis for environments without it
  if (process.env.REDIS_HOST === 'disabled' || process.env.DISABLE_REDIS === 'true') {
    // Return a dummy config that effectively disables connection attempts
    return {
      host: '127.0.0.1',
      port: 6380,
      maxRetriesPerRequest: 0, // Force exit on first fail (BullMQ might complain but process won't hang)
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null, // Stop retrying immediately
    };
  }

  // Support full Redis URL (e.g. Upstash, Redis Cloud, Memorystore)
  if (process.env.REDIS_URL) {
    const url = new URL(process.env.REDIS_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 1000, 3000)),
    };
  }

  return {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6380', 10),
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
  };
};

@Global()
@Module({
  imports: [
    // -- PaySurity Platform Common Modules --------------------
    AuditLogModule,

    // -- BullMQ Configuration ---------------------------------
    BullModule.forRoot({
      connection: getRedisConnection(),
    }),

    // -- Register individual queues ---------------------------
    BullModule.registerQueue(
      {
        name: 'payment-events',
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: false,
        },
      },
      {
        name: 'loyalty-events',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: { age: 86400, count: 500 },
          removeOnFail: false,
        },
      },
      {
        name: 'notification-events',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 3600, count: 200 },
          removeOnFail: false,
        },
      },
      // -- Dead Letter Queue --------------------------------
      {
        name: 'dead-letter-queue',
        defaultJobOptions: {
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
    ),
  ],
  providers: [EventBusService, PaymentCapturedConsumer],
  exports: [EventBusService, BullModule],
})
export class EventBusModule {}
