import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * A global AsyncLocalStorage instance to store request-scoped data like the X-Trace-Id.
 * Other services and logger enhancers can import this instance to access the current
 * request's trace ID for consistent logging and context propagation.
 */
export const asyncLocalStorage = new AsyncLocalStorage<Map<string, string | undefined>>();

const TRACE_HEADER = 'x-trace-id';

/**
 * Trace ID Middleware — ensures every request has an X-Trace-Id.
 * This is a NON-NEGOTIABLE platform NFR.
 *
 * If the incoming request has the header, it's forwarded.
 * If not, a new UUID v4 is generated.
 * The trace ID is set on:
 *   - req.headers['x-trace-id']
 *   - res.headers['X-Trace-Id']
 *   - AsyncLocalStorage for downstream logging context
 *   - Included in all audit log rows for request entry point
 */
@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('TraceIdMiddleware');

  // Inject the database connection as per strict rule #2 and #3.
  // NodePgDatabase<any> type cannot be imported as per strict rule #4,
  // so 'any' is used to satisfy the runtime requirement while adhering to rules.
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    let traceId = req.headers[TRACE_HEADER] as string;

    if (!traceId) {
      traceId = randomUUID();
      this.logger.debug(`Generated new trace ID: ${traceId}`);
    } else {
      this.logger.debug(`Using existing trace ID: ${traceId}`);
    }

    // Attach trace ID to request headers for consistency and potential downstream middleware
    req.headers[TRACE_HEADER] = traceId;

    // Set trace ID on response headers as per NFR
    res.setHeader('X-Trace-Id', traceId);

    // Prepare context for AsyncLocalStorage
    const store = new Map<string, string | undefined>();
    store.set(TRACE_HEADER, traceId);

    // Run the rest of the request lifecycle within the AsyncLocalStorage context.
    // This makes the traceId available to all subsequent handlers and loggers
    // that check `asyncLocalStorage.getStore()`.
    // The `await` ensures that the audit log is written before the middleware
    // officially completes, covering the full request execution.
    await asyncLocalStorage.run(store, async () => {
      // Extract tenantId and userId from req.user if available.
      // Per strict rule #6, guards are applied globally, and this middleware
      // might run before or after auth guards depending on global registration order.
      // We safely check for existence.
      let tenantId: string | undefined = undefined;
      let userId: string | undefined = undefined;

      if (req.user && typeof req.user === 'object') {
        if ('tenantId' in req.user && typeof req.user.tenantId === 'string') {
          tenantId = req.user.tenantId;
        }
        if ('id' in req.user && typeof req.user.id === 'string') {
          userId = req.user.id;
        }
      }

      try {
        // Log an audit entry for the incoming request as per NFR
        // SQL adheres to strict rule #8: UUID primary keys, tenant_id (nullable here if not identified yet).
        const auditSql = `
          INSERT INTO audit_logs (id, trace_id, tenant_id, user_id, event_type, event_details)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5::jsonb);
        `;
        const auditParams = [
          traceId,
          tenantId, // Null if not extracted from req.user
          userId,   // Null if not extracted from req.user
          'REQUEST_RECEIVED',
          JSON.stringify({
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            // Add other relevant non-sensitive request details here
          }),
        ];
        // Execute the SQL query as per strict rule #3
        await (this.db as any).execute(auditSql, auditParams);
        this.logger.debug(`Audit log entry created for trace ID: ${traceId}`);
      } catch (error) {
        // Log the error but do not block the request flow if audit logging fails
        this.logger.error(`Failed to write audit log for trace ID ${traceId}: ${error.message}`);
      }

      // Continue to the next middleware or request handler in the pipeline
      next();
    });
  }
}
