import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
// Assuming DatabaseModule is located here

/**
 * HealthModule — Provides health check endpoints for liveness, readiness, and overall application status.
 *
 * GET /health        → Detailed status including database connectivity, app version, and uptime.
 * GET /health/ready  → Readiness probe endpoint.
 * GET /health/live   → Liveness probe endpoint.
 *
 * This module integrates with the DatabaseModule to provide database health status.
 */
@Module({
  imports: [],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
