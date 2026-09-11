import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Tenant & Merchant Resolver Middleware — extracts tenant_id from JWT,
 * resolves the merchant_id, and sets PostgreSQL session variables for RLS.
 *
 * Identity Hierarchy: Organization (Tenant) → Merchant → Location
 *
 * Sets on request:
 *   - req.tenantId   (from JWT)
 *   - req.merchantId (resolved from tenant_id + location_id or default merchant)
 *   - req.userRole   (from JWT)
 *
 * Sets on PostgreSQL session:
 *   SET LOCAL "app.current_tenant_id" = '{tenant_id}';
 *   SET LOCAL "app.role" = '{role}';
 */
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  private readonly logger = new Logger('TenantResolver');

  use(req: Request, _res: Response, next: NextFunction): void {
    const user = (req as any).user;

    if (user?.tenantId) {
      // Store tenant context on request
      (req as any).tenantId = user.tenantId;
      (req as any).userRole = user.role;

      // Resolve merchant_id from JWT or request context
      // Priority: 1) user.merchantId from JWT  2) X-Merchant-Id header  3) auto-resolve from location
      const merchantId =
        user.merchantId ||
        (req.headers['x-merchant-id'] as string) ||
        null;

      if (merchantId) {
        (req as any).merchantId = merchantId;
      } else {
        // For single-merchant tenants, auto-resolve will be wired in Sprint 1
        // via: SELECT id FROM merchants WHERE tenant_id = $1 LIMIT 1
        // For now, log that merchant_id is not set
        this.logger.debug(
          `No merchantId resolved for tenant ${user.tenantId}. ` +
          `Single-merchant auto-resolve will be available after Sprint 1.`,
        );
      }

      // Set PostgreSQL session variables for Row Level Security
      // TODO Sprint 1: Wire to per-request DB connection via Drizzle
      // await db.execute(sql`SET LOCAL "app.current_tenant_id" = ${user.tenantId}`);
      // await db.execute(sql`SET LOCAL "app.role" = ${user.role}`);
    }

    next();
  }
}
