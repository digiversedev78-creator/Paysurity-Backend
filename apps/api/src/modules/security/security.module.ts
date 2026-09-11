/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SEC-007 - Rate Limiting & DDoS Protection
 * FILE TYPE:    MODULE
 * MODULE:       security
 * ═══════════════════════════════════════════════════════════
 */
import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Rate limiting is handled at the Cloud Run / load balancer level.
// Application-level rate limiting can be added via @nestjs/throttler
// when the package is installed: pnpm add @nestjs/throttler

@Module({
  imports: [
    AuditLogModule,
    // Configure application-level rate limiting as a fallback or for specific endpoints
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 30,  // 30 requests per minute per IP address
    }]),
  ],
  providers: [
    // Apply ThrottlerGuard globally to enforce rate limiting on all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Additional security providers like custom guards (e.g., IP whitelisting, role-based guards)
    // or services for managing security configurations could be added here.
  ],
  exports: [
    // If any security services or custom guards need to be exposed to other modules,
    // they should be listed here. ThrottlerGuard is applied globally, so no explicit
    // export is typically needed for it unless a specific module needs to override behavior.
  ],
})
export class SecurityModule {}
