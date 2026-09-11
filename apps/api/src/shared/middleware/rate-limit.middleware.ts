/**
 * Rate Limiting Middleware
 * PORTED FROM: PS-Platform/shared/middleware/rateLimitMiddleware.ts (236 lines)
 *
 * In-memory rate limiter with configurable profiles: strict, auth, payment, admin, default.
 * Proper 429 responses with Retry-After headers. IP extraction from proxy headers.
 */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly buckets = new Map<string, RateLimitBucket>();

  // Default: 100 req / 60s
  private readonly config: RateLimitConfig = {
    windowMs: 60_000,
    maxRequests: 100,
    message: 'Too many requests, please try again later',
  };

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.extractClientKey(req);
    const now = Date.now();

    let bucket = this.buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.config.windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - bucket!.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

    if (bucket.count > this.config.maxRequests) {
      const retryAfterMs = bucket.resetAt - now;
      res.setHeader('Retry-After', Math.ceil(retryAfterMs / 1000));
      this.logger.warn(`[RATE-LIMIT] Blocked ${key} — ${bucket.count}/${this.config.maxRequests}`);
      res.status(429).json({
        statusCode: 429,
        message: this.config.message,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      });
      return;
    }

    next();
  }

  private extractClientKey(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : typeof realIp === 'string'
        ? realIp
        : req.ip ?? 'unknown';
    return `rate:${ip}`;
  }
}

// ─── Preconfigured Profiles ─────────────────────────────────────────

export const RATE_LIMIT_PROFILES = {
  strict:  { windowMs: 15 * 60_000, maxRequests: 5,   message: 'Too many attempts. Please wait 15 minutes.' },
  auth:    { windowMs: 15 * 60_000, maxRequests: 5,   message: 'Too many login attempts. Please wait 15 minutes.' },
  payment: { windowMs: 60_000,      maxRequests: 10,  message: 'Payment rate limit exceeded. Please wait.' },
  admin:   { windowMs: 60_000,      maxRequests: 100, message: 'Admin API rate limit exceeded.' },
  default: { windowMs: 60_000,      maxRequests: 100, message: 'Too many requests, please try again later.' },
} as const;
