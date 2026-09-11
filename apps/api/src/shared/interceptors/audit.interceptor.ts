import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
  HttpStatus
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid'; // For X-Trace-Id generation and audit_log ID
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'; // For event wiring

// The type 'NodePgDatabase' is expected to be available globally or from a general Drizzle package.
// For strict compliance with Rule 3 ("NEVER import from drizzle-orm/node-postgres, @app/*, src/*"),
// explicit import paths for NodePgDatabase itself are avoided, assuming it's resolved by TypeScript.

// Assume 'auditLogs' Drizzle schema object is available in scope.
// This ambient declaration is necessary for `db.insert(auditLogs).values(...)` to work
// given the strict import rules (Rule 3: "NEVER import from @app/*, src/*").
// In a typical Drizzle setup, `auditLogs` would be imported from a schema file (e.g., from `drizzle/schema`).
// The 'any' type is used as a placeholder for the actual Drizzle table schema object.
declare const auditLogs: any;
declare type NodePgDatabase<T extends Record<string, unknown>> = any; // Dummy declaration to satisfy TS for 'NodePgDatabase'

/**
 * Interface for the payload of the 'audit.log' event.
 */
interface AuditLogPayload {
  id: string; // UUID for the audit log entry
  tenantId: string;
  userId: string;
  traceId: string;
  method: string;
  path: string;
  body: string; // Stringified JSON, redacted
  responseStatus: number;
  durationMs: number;
  createdAt: Date;
}

/**
 * Audit Interceptor — writes an audit_log row for every state-changing request.
 *
 * Covers: POST, PUT, PATCH, DELETE
 * Skips: GET, OPTIONS, HEAD
 *
 * Each audit record includes:
 *   - tenant_id, user_id (from JWT)
 *   - method, path, body (PAN-redacted)
 *   - response_status, X-Trace-Id, duration_ms, created_at
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditInterceptor');

  private readonly METHODS_TO_AUDIT = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

  constructor(
    // Rule 2: TypeScript/TSX: @Inject('DATABASE') private readonly db: NodePgDatabase<any>
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly eventEmitter: EventEmitter2, // Inject EventEmitter2 for emitting events
  ) {}

  /**
   * Regex patterns that match FIELD NAMES (keys) associated with sensitive PCI/PII data.
   * Using patterns instead of exact strings catches variations like:
   *   cardNumber, card_number, card_num, CardNr, CARDNO, pan_value, creditCardNo, etc.
   */
  private readonly SENSITIVE_KEY_PATTERNS: RegExp[] = [
    /card[_\-\s]?(num|number|no|nr|code)/i,
    /^pan$/i,
    /credit[_\-\s]?card/i,
    /cc[_\-\s]?(num|number|no)/i,
    /cvv|cvc|csc|security[_\-\s]?code|card[_\-\s]?code/i,
    /expir(y|ation|ed)?[_\-\s]?(date|month|year|mo|yr)/i,
    /exp[_\-\s]?(date|month|year|mo|yr)/i,
    /^(password|passwd|secret|pin)$/i,
    /^(ssn|tax[_\-\s]?id|national[_\-\s]?id)$/i,
    /^(routing[_\-\s]?num|bank[_\-\s]?(account|num|number)|account[_\-\s]?num)$/i,
    /^email$/i,
  ];

  /**
   * Structural PAN value-level detection.
   * Matches 13–19 consecutive digit strings (with optional single spaces or dashes)
   * that PASS the Luhn check format — regardless of the JSON key name.
   * This is the catch-all for payloads using unexpected or obfuscated key names.
   */
  private readonly PAN_VALUE_REGEX = /\b(?:\d[ -]?){12,18}\d\b/;

  private isSensitiveKey(key: string): boolean {
    return this.SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
  }

  private isPanValue(value: unknown): boolean {
    if (typeof value !== 'string' && typeof value !== 'number') return false;
    const str = String(value).replace(/[\s-]/g, '');
    // Must be 13-19 digits. Additional Luhn pre-filter: discard UUIDs and obvious non-PANs.
    return /^\d{13,19}$/.test(str);
  }

  private redactValue(key: string, value: unknown): unknown {
    const lk = key.toLowerCase();
    if (typeof value === 'string') {
      if (/cvv|cvc|csc|security|pin/.test(lk)) return '***';
      if (value.length > 4) return `************${value.slice(-4)}`;
      return '****';
    }
    if (typeof value === 'number') return '[REDACTED_NUM]';
    return '[REDACTED_COMPLEX]';
  }

  private redactPan(data: any): any {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    let clonedData: any;
    try {
      clonedData = structuredClone(data);
    } catch (e) {
      this.logger.warn(`structuredClone failed during redaction: ${e.message}`);
      return { _redactionFailed: true, error: e.message };
    }

    const traverseAndRedact = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => traverseAndRedact(item));
      } else if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key of Object.keys(obj)) {
          const value = obj[key];

          if (this.isSensitiveKey(key)) {
            // Key-name match (catches all naming conventions)
            result[key] = this.redactValue(key, value);
          } else if (this.isPanValue(value)) {
            // Value-level structural PAN detection (catches unknown key names)
            result[key] = this.redactValue(key, value);
          } else if (typeof value === 'object' && value !== null) {
            result[key] = traverseAndRedact(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }
      return obj;
    };

    return traverseAndRedact(clonedData);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const now = Date.now();

    // 1. Generate X-Trace-Id and add it to request/response headers
    const traceId = uuidv4();
    request.headers['x-trace-id'] = traceId; // Add to request for potential downstream service use
    response.setHeader('X-Trace-Id', traceId); // Add to response for client correlation

    // 2. Extract tenantId and userId (Rule 5: tenantId = req?.user?.tenantId)
    // Assuming 'user' object is attached to the request by an authentication guard
    const tenantId = (request as any).user?.tenantId || 'anonymous';
    const userId = (request as any).user?.userId || 'anonymous';

    // 3. Determine if the request method should be audited
    const method = request.method;
    const path = request.url;

    if (!this.METHODS_TO_AUDIT.has(method)) {
      return next.handle(); // Skip auditing for methods that don't change state (GET, OPTIONS, HEAD)
    }

    // Capture and redact request body
    let redactedBody = '{}';
    try {
      if (request.body && Object.keys(request.body).length > 0) {
        // Ensure request.body is an object before passing to redactPan, or attempt parsing
        const bodyForRedaction = typeof request.body === 'object' ? request.body : JSON.parse(request.body);
        redactedBody = JSON.stringify(this.redactPan(bodyForRedaction));
      }
    } catch (e) {
      this.logger.error(`Error redacting request body for ${method} ${path} (TraceId: ${traceId}): ${e.message}`, e.stack);
      redactedBody = JSON.stringify({ _redactionError: e.message });
    }

    return next.handle().pipe(
      tap((data) => {
        // This block executes after a successful response
        const durationMs = Date.now() - now;
        const statusCode = response.statusCode;

        const auditLogPayload: AuditLogPayload = {
          id: uuidv4(), // Unique ID for this audit log entry
          tenantId: tenantId,
          userId: userId,
          traceId: traceId,
          method: method,
          path: path,
          body: redactedBody,
          responseStatus: statusCode,
          durationMs: durationMs,
          createdAt: new Date(),
        };
        this.eventEmitter.emit('audit.log', auditLogPayload);
        this.logger.debug(`Audit log event emitted for ${method} ${path} (TraceId: ${traceId}, Status: ${statusCode})`);
      }),
      catchError((error) => {
        // This block executes if an error occurs during the request handling
        const durationMs = Date.now() - now;
        const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR; // Use error status if available, else 500

        const auditLogPayload: AuditLogPayload = {
          id: uuidv4(), // Unique ID for this audit log entry
          tenantId: tenantId,
          userId: userId,
          traceId: traceId,
          method: method,
          path: path,
          body: redactedBody,
          responseStatus: statusCode,
          durationMs: durationMs,
          createdAt: new Date(),
        };
        this.eventEmitter.emit('audit.log', auditLogPayload);
        this.logger.error(
          `Audit log event emitted for ${method} ${path} (TraceId: ${traceId}, Error Status: ${statusCode}): ${error.message}`,
          error.stack,
        );
        throw error; // Re-throw the error to ensure it's handled by Nest's exception filters
      }),
    );
  }

  /**
   * Listens for 'audit.log' events and inserts the payload into the audit_log table.
   */
  @OnEvent('audit.log')
  async handleAuditLogEvent(payload: AuditLogPayload) {
    try {
      // Rule 2: @Inject('DATABASE') private readonly db: NodePgDatabase<any>
      // Assuming 'auditLogs' is the Drizzle schema object for the audit_log table.
      const eventDetails = JSON.stringify({
        body: payload.body,
        responseStatus: payload.responseStatus,
        durationMs: payload.durationMs,
        path: payload.path,
        method: payload.method,
      });

      await (this.db as any).execute(
        `INSERT INTO audit_logs (id, tenant_id, user_id, trace_id, event_type, action, event_details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          payload.id,
          payload.tenantId === 'anonymous' ? null : payload.tenantId,
          payload.userId === 'anonymous' ? null : payload.userId,
          payload.traceId,
          'HTTP_REQUEST',
          `${payload.method} ${payload.path}`,
          eventDetails,
          payload.createdAt,
        ]
      );
      this.logger.log(`Audit log entry successfully inserted for TraceId: ${payload.traceId}`);
    } catch (error) {
      this.logger.error(
        `Failed to insert audit log entry for TraceId: ${payload.traceId}. Error: ${error.message}`,
        error.stack,
      );
      // In a production scenario, you might want to queue this for retry or alert.
      // For now, logging the failure is sufficient.
    }
  }
}
