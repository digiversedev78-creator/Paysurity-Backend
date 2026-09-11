import { Controller, Post, Get, Delete, Param, Body, Request, HttpStatus, HttpException, Injectable ,
  Optional} from '@nestjs/common';
import * as crypto from 'crypto';

// Note: The type NodePgDatabase<any> is used as specified in rule 2.
// Per rule 4, imports from 'drizzle-orm/node-postgres' (where this type typically originates) are forbidden.
// It is assumed this type is either globally available or correctly resolved by the build system.
type NodePgDatabase<T> = any; // Placeholder for compilation, as actual import is forbidden

// Mock sql template tag as per rule 4, since actual import is forbidden.
// This will stringify the parts to simulate a raw SQL query with basic type handling.
const sql = (strings: TemplateStringsArray, ...values: any[]): string => {
  let result = '';
  strings.forEach((str, i) => {
    result += str;
    if (i < values.length) {
      const value = values[i];
      // Basic type handling for SQL escaping and formatting
      if (typeof value === 'string') {
        result += `'${value.replace(/'/g, "''")}'`; // Basic string escaping
      } else if (value === null || value === undefined) {
        result += 'NULL';
      } else if (Array.isArray(value)) {
        // For TEXT[] or other array types, assuming PostgreSQL array literal syntax
        result += `ARRAY[${value.map(v => {
          if (typeof v === 'string') return `'${String(v).replace(/'/g, "''")}'`;
          return String(v); // For non-string elements within an array, convert to string
        }).join(', ')}]`;
      } else if (typeof value === 'object') {
        // For JSONB types, convert to JSON string and cast
        result += `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
      } else {
        result += String(value); // Default to string conversion for numbers, booleans etc.
      }
    }
  });
  return result;
};


// DTOs for request bodies
class CreateWebhookDto {
  url: string;
  events: string[];
}

class TestWebhookDto {
  payload?: Record<string, any>;
}

// Helper function to generate HMAC signature
function generateHmacSignature(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// AuditLogService class to handle auditing operations
@Injectable() // Mark as injectable for NestJS Dependency Injection
class AuditLogService {
  constructor( private readonly db: NodePgDatabase<any>) {}

  async record(tenantId: string, logDetails: { userId?: string; action: string; details: Record<string, any> }) {
    console.log(`AUDIT LOG for Tenant ${tenantId}:`, logDetails); // For local debugging/visibility

    try {
      // Rule 9: PostgreSQL, gen_random_uuid() PKs, all tables have tenant_id
      // Rule 4: Use raw sql`` template literals
      await (this.db as any).execute(sql`
        INSERT INTO audit_logs (id, tenant_id, user_id, action, details, created_at)
        VALUES (gen_random_uuid(), ${tenantId}, ${logDetails.userId || null}, ${logDetails.action}, ${logDetails.details}, NOW());
      `);
    } catch (error) {
      console.error('Failed to record audit log:', error);
      // In a production system, this might trigger alerts or use a more robust logging mechanism.
    }
  }
}

// Controller for API Platform functionalities
@Controller('api-platform')
export class ApiPlatformController {
  constructor(
     private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService, // Inject AuditLogService
  ) {}

  /**
   * Extracts the tenant ID from the request object.
   * Assumes `req.user.tenantId` is populated by authentication guards.
   * @param req The incoming request object.
   * @returns The tenant ID.
   * @throws HttpException if tenant ID is not found.
   */
  private getTenantId(req: any): string {
    // Rule 6: tenantId from req?.user?.tenantId â€” always scope queries to tenant
    if (!req.user || !req.user.tenantId) {
      throw new HttpException('Tenant ID not found in request. Authentication is required.', HttpStatus.UNAUTHORIZED);
    }
    return req.user.tenantId;
  }

  /**
   * Extracts the user ID from the request object for audit logging.
   * @param req The incoming request object.
   * @returns The user ID or undefined if not present.
   */
  private getUserId(req: any): string | undefined {
    return req.user?.userId;
  }

  /**
   * POST /api-platform/keys
   * Generates a new API key for the current tenant.
   * The generated secret key is returned once only upon creation. A hashed version
   * is stored in the database for secure verification.
   *
   * @param req The incoming request object, containing tenant context.
   * @returns An object containing the new API key's ID, the secret key, and creation timestamp.
   */
  @Post('keys')
  async generateApiKey(@Request() req: any) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);

    // Generate a strong random secret key
    const secretKey = crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex characters
    // Hash the secret for storage (never store plain secrets)
    const hashedKey = crypto.createHash('sha256').update(secretKey).digest('hex');

    // Rule 9: gen_random_uuid() PKs, all tables have tenant_id
    // Rule 4: Use raw sql`` template literals
    const [result] = await (this.db as any).execute(sql`
      INSERT INTO api_keys (id, tenant_id, hashed_key, created_at)
      VALUES (gen_random_uuid(), ${tenantId}, ${hashedKey}, NOW())
      RETURNING id, created_at;
    `);

    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      throw new HttpException('Failed to generate API key due to a database error.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { id, created_at } = (result as any).rows[0];

    // Rule 8: AuditLogService: call (this.auditLogService as any).record(tenantId, {userId, action, details})
    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'api_key.generated',
      details: { keyId: id },
    });

    // Return the plain secret key ONLY once upon creation.
    return { id, secret: secretKey, createdAt: created_at };
  }

  /**
   * GET /api-platform/keys
   * Lists API keys (IDs and metadata) for the current tenant.
   * The secret key and full hash are never exposed.
   *
   * @param req The incoming request object.
   * @returns An array of API key objects, including ID, creation and revocation timestamps.
   */
  @Get('keys')
  async listApiKeys(@Request() req: any) {
    const tenantId = this.getTenantId(req);

    // Rule 6: Scope query to tenantId
    const [result] = await (this.db as any).execute(sql`
      SELECT id, created_at, revoked_at
      FROM api_keys
      WHERE tenant_id = ${tenantId}
      ORDER BY created_at DESC;
    `);

    const keys = (result as any).rows.map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      revokedAt: row.revoked_at,
      status: row.revoked_at ? 'revoked' : 'active',
    }));

    await (this.auditLogService as any).record(tenantId, {
      userId: this.getUserId(req),
      action: 'api_keys.listed',
      details: { count: keys.length },
    });

    return keys;
  }

  /**
   * DELETE /api-platform/keys/:id
   * Revokes an existing API key for the current tenant by setting its `revoked_at` timestamp.
   *
   * @param req The incoming request object.
   * @param id The ID of the API key to revoke.
   * @returns A success message upon successful revocation.
   * @throws HttpException if the key is not found or already revoked.
   */
  @Delete('keys/:id')
  async revokeApiKey(@Request() req: any, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);

    // Only revoke if the key is active (revoked_at IS NULL) and belongs to the tenant
    const [result] = await (this.db as any).execute(sql`
      UPDATE api_keys
      SET revoked_at = NOW()
      WHERE id = ${id} AND tenant_id = ${tenantId} AND revoked_at IS NULL
      RETURNING id;
    `);

    if (!result || !(result as any).rows || (result as any).rows.length === 0) {
      throw new HttpException('API key not found or already revoked.', HttpStatus.NOT_FOUND);
    }

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'api_key.revoked',
      details: { keyId: id },
    });

    return { message: `API key ${id} revoked successfully.` };
  }

  /**
   * POST /api-platform/webhooks
   * Registers a new webhook endpoint for the current tenant.
   * A unique secret is generated for HMAC signing webhook payloads.
   *
   * @param req The incoming request object.
   * @param body Contains the URL and event types for the webhook.
   * @returns The registered webhook's details (excluding the secret).
   */
  @Post('webhooks')
  async registerWebhook(@Request() req: any, @Body() body: CreateWebhookDto) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);
    const { url, events } = body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      throw new HttpException('URL and events (as a non-empty array) are required.', HttpStatus.BAD_REQUEST);
    }
    // Basic URL format validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new HttpException('Webhook URL must be a valid HTTP/HTTPS URL.', HttpStatus.BAD_REQUEST);
    }

    const webhookSecret = crypto.randomBytes(20).toString('hex'); // Generate a secret for HMAC signing payloads

    try {
      const [result] = await (this.db as any).execute(sql`
        INSERT INTO webhooks (id, tenant_id, url, events, secret, created_at)
        VALUES (gen_random_uuid(), ${tenantId}, ${url}, ${events}, ${webhookSecret}, NOW())
        RETURNING id, url, events, created_at;
      `);

      if (!result || !(result as any).rows || (result as any).rows.length === 0) {
        throw new HttpException('Failed to register webhook due to a database error.', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const newWebhook = (result as any).rows[0];

      await (this.auditLogService as any).record(tenantId, {
        userId,
        action: 'webhook.registered',
        details: { webhookId: newWebhook.id, url: newWebhook.url, events: newWebhook.events },
      });

      // Return the webhook details, but never the secret again after creation.
      return {
        id: newWebhook.id,
        url: newWebhook.url,
        events: newWebhook.events,
        createdAt: newWebhook.created_at,
      };
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw new HttpException('Failed to register webhook due to an internal error.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * POST /api-platform/webhooks/:id/test
   * Fires a test event to a registered webhook endpoint to verify its configuration.
   *
   * @param req The incoming request object.
   * @param id The ID of the webhook to test.
   * @param body Optional payload for the test event; a default is used if none provided.
   * @returns The result of the test delivery, including status and response.
   * @throws HttpException if the webhook is not found.
   */
  @Post('webhooks/:id/test')
  async testWebhook(@Request() req: any, @Param('id') id: string, @Body() body: TestWebhookDto) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);

    // Retrieve webhook details, including the secret for signing
    const [webhookResult] = await (this.db as any).execute(sql`
      SELECT id, url, secret
      FROM webhooks
      WHERE id = ${id} AND tenant_id = ${tenantId};
    `);

    if (!webhookResult || !(webhookResult as any).rows || (webhookResult as any).rows.length === 0) {
      throw new HttpException('Webhook not found or does not belong to your tenant.', HttpStatus.NOT_FOUND);
    }

    const webhook = (webhookResult as any).rows[0];
    const testPayload = body.payload || {
      eventType: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test event from PaySurity API Platform.',
        webhookId: webhook.id,
        tenantId: tenantId,
      },
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = generateHmacSignature(webhook.secret, payloadString);

    let deliveryStatus: string;
    let responseStatusCode: number | null = null;
    let responseBody: string | null = null;
    let errorMessage: string | null = null;

    try {
      // Use standard fetch API for HTTP requests, with a timeout
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PaySurity-Signature': signature, // Custom header for HMAC signature verification
          'User-Agent': 'PaySurity/1.0 (Webhook Tester)',
        },
        body: payloadString,
        signal: AbortSignal.timeout(5000), // 5 seconds timeout for the request
      });

      responseStatusCode = response.status;
      responseBody = await response.text();
      deliveryStatus = response.ok ? 'success' : 'failed';
    } catch (error: any) {
      deliveryStatus = 'failed';
      // Handle AbortError for timeouts specifically
      if (error.name === 'AbortError') {
        errorMessage = `Webhook delivery timed out after 5 seconds: ${error.message}`;
      } else {
        errorMessage = `Failed to send webhook request: ${error.message}`;
      }
      console.error(`Error sending test webhook to ${webhook.url}:`, error);
    }

    // Log the delivery attempt, regardless of success or failure
    await (this.db as any).execute(sql`
      INSERT INTO webhook_delivery_logs (id, webhook_id, tenant_id, event_type, payload, signature, response_status, response_body, error_message, delivered_at)
      VALUES (gen_random_uuid(), ${webhook.id}, ${tenantId}, 'webhook.test', ${testPayload}, ${signature}, ${responseStatusCode}, ${responseBody}, ${errorMessage}, NOW());
    `);

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'webhook.test_fired',
      details: { webhookId: id, status: deliveryStatus, statusCode: responseStatusCode, errorMessage },
    });

    return {
      status: deliveryStatus,
      statusCode: responseStatusCode,
      responseBody: responseBody,
      errorMessage: errorMessage,
      webhookId: webhook.id,
      url: webhook.url,
    };
  }

  /**
   * GET /api-platform/webhooks/:id/logs
   * Retrieves delivery logs for a specific webhook belonging to the current tenant.
   *
   * @param req The incoming request object.
   * @param id The ID of the webhook whose logs are to be retrieved.
   * @returns An array of webhook delivery log entries.
   * @throws HttpException if the webhook is not found.
   */
  @Get('webhooks/:id/logs')
  async getWebhookLogs(@Request() req: any, @Param('id') id: string) {
    const tenantId = this.getTenantId(req);

    // First, verify the webhook exists and belongs to the tenant
    const [webhookCheck] = await (this.db as any).execute(sql`
      SELECT id FROM webhooks WHERE id = ${id} AND tenant_id = ${tenantId};
    `);

    if (!webhookCheck || !(webhookCheck as any).rows || (webhookCheck as any).rows.length === 0) {
      throw new HttpException('Webhook not found or does not belong to your tenant.', HttpStatus.NOT_FOUND);
    }

    // Retrieve delivery logs for the specified webhook and tenant
    const [logsResult] = await (this.db as any).execute(sql`
      SELECT
        id,
        event_type,
        payload,
        response_status,
        response_body,
        error_message,
        delivered_at
      FROM webhook_delivery_logs
      WHERE webhook_id = ${id} AND tenant_id = ${tenantId}
      ORDER BY delivered_at DESC
      LIMIT 100; -- Limit to the 100 most recent logs for performance
    `);

    const logs = (logsResult as any).rows.map((row: any) => ({
      id: row.id,
      eventType: row.event_type,
      payload: row.payload,
      responseStatus: row.response_status,
      responseBody: row.response_body,
      errorMessage: row.error_message,
      deliveredAt: row.delivered_at,
    }));

    await (this.auditLogService as any).record(tenantId, {
      userId: this.getUserId(req),
      action: 'webhook.logs_viewed',
      details: { webhookId: id, count: logs.length },
    });

    return logs;
  }

  /**
   * GET /api-platform/usage
   * Retrieves API usage metrics for the current tenant.
   * This assumes an 'api_requests_log' table tracks individual API calls.
   *
   * @param req The incoming request object.
   * @returns An object containing various API usage statistics for a defined period.
   */
  @Get('usage')
  async getApiUsage(@Request() req: any) {
    const tenantId = this.getTenantId(req);
    const userId = this.getUserId(req);

    // Query for API usage metrics over the last 30 days
    // This query assumes an `api_requests_log` table exists with `tenant_id`, `status_code`, `endpoint`, and `requested_at`.
    const [usageResult] = await (this.db as any).execute(sql`
      SELECT
        COUNT(id) AS total_requests,
        COUNT(CASE WHEN status_code BETWEEN 200 AND 299 THEN 1 END) AS successful_requests,
        COUNT(CASE WHEN status_code >= 400 AND status_code <= 599 THEN 1 END) AS failed_requests,
        (SELECT COUNT(DISTINCT endpoint) FROM api_requests_log WHERE tenant_id = ${tenantId} AND requested_at >= NOW() - INTERVAL '30 days') AS unique_endpoints,
        MAX(requested_at) AS last_request_at
      FROM api_requests_log
      WHERE tenant_id = ${tenantId} AND requested_at >= NOW() - INTERVAL '30 days';
    `);

    // Handle case where no usage data is found
    const metrics = (usageResult as any).rows[0] || {
      total_requests: '0',
      successful_requests: '0',
      failed_requests: '0',
      unique_endpoints: '0',
      last_request_at: null,
    };

    await (this.auditLogService as any).record(tenantId, {
      userId,
      action: 'api_usage.viewed',
      details: { period: 'last 30 days', metrics },
    });

    // Parse numeric values which might come as strings from DB drivers
    return {
      period: 'last 30 days',
      totalRequests: parseInt(metrics.total_requests, 10),
      successfulRequests: parseInt(metrics.successful_requests, 10),
      failedRequests: parseInt(metrics.failed_requests, 10),
      uniqueEndpoints: parseInt(metrics.unique_endpoints, 10),
      lastRequestAt: metrics.last_request_at,
    };
  }
}






