import { Injectable, Inject, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { pgTable, uuid, varchar, integer, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Define the IdempotencyKeys table schema
const idempotencyStatusEnum = pgEnum('idempotency_status', ['pending', 'completed', 'failed']);

export const idempotencyKeys = pgTable('idempotency_keys', {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull(),
    endpointPath: varchar('endpoint_path', { length: 500 }).notNull(),
    requestHash: varchar('request_hash', { length: 64 }), // Optional: hash of request body for strict idempotency
    status: idempotencyStatusEnum('status').notNull(),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => {
    return {
        // Unique constraint to prevent duplicate keys for the same tenant and endpoint,
        // useful for the 'ON CONFLICT' logic or catching errors
        tenantKeyPathUnique: new (require('drizzle-orm/pg-core')).UniqueConstraint('tenant_key_path_idx')
            .on(table.tenantId, table.idempotencyKey, table.endpointPath),
    };
});

// Helper function to safely parse JSON strings
function tryParseJson(str: string): any {
    try {
        if (typeof str === 'string') {
            return JSON.parse(str);
        }
        return str; // Return original if not string (already an object)
    } catch (e) {
        return str; // Return original string if not valid JSON
    }
}

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
    // In-memory cache for idempotency keys, scoped by tenantId for multi-tenancy.
    // The key format will be `${tenantId}:${idempotencyKey}` to ensure isolation.
    private readonly cache = new Map<string, {
        status: 'pending' | 'completed' | 'failed',
        response: any, // The body of the HTTP response
        statusCode: number, // The HTTP status code of the response
        expiresAt: number // Unix timestamp indicating when this entry expires (e.g., Date.now() + 24h)
    }>();

    // Adhere to the existing code's constructor signature, injecting the database.
    // This specific task focuses on an in-memory map; thus, the `db` instance is not used
    // directly for the idempotency cache logic in this implementation.
    constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

    async use(req: Request, res: Response, next: NextFunction) {
        // Idempotency middleware should only apply to POST requests as per requirements.
        if (req.method !== 'POST') {
            return next();
        }

        const idempotencyKey = req.headers['x-idempotency-key'] as string;

        // Skip idempotency check if the X-Idempotency-Key header is not provided.
        if (!idempotencyKey) {
            return next();
        }

        // CRITICAL RULE: Retrieve tenantId from `req?.user?.tenantId` and scope operations to the tenant.
        // It's assumed that an authentication middleware has already run and populated `req.user`.
        const tenantId = (req as any).user?.tenantId;

        if (!tenantId) {
            // For a multi-tenant platform like PaySurity, a missing tenantId is critical.
            // Log a warning and proceed without idempotency to prevent unexpected blocking,
            // but this indicates a potential issue in the middleware chain or authentication.
            console.warn(`IdempotencyMiddleware: tenantId not found on request for idempotency key "${idempotencyKey}". Skipping idempotency check for this request.`);
            return next();
        }

        // Create a unique cache key by combining tenantId and idempotencyKey.
        const cacheKey = `${tenantId}:${idempotencyKey}`;
        const cachedEntry = this.cache.get(cacheKey);

        // Check if a cached entry exists and has not expired.
        if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
            // If the request for this key is currently being processed, return a 409 Conflict.
            // This prevents concurrent processing of the same idempotent request.
            if (cachedEntry.status === 'pending') {
                return res.status(409).send('Conflict: An operation with this idempotency key is already in progress. Please wait or use a new key.');
            }
            // If the request has already been completed or failed, return the cached response.
            // This ensures that repeated requests with the same key yield the same result.
            return res.status(cachedEntry.statusCode).json(cachedEntry.response);
        }

        // If no valid (unexpired) cached entry is found, we proceed with the request.
        // First, mark the key as 'pending' in the cache.
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // Cache response for 24 hours
        this.cache.set(cacheKey, {
            status: 'pending',
            response: null, // Will be populated when the response is sent
            statusCode: 0,  // Will be populated when the response is sent
            expiresAt: expirationTime
        });
}
}
