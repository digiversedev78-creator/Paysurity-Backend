import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Inject } from '@nestjs/common';

@Injectable()
export class ImpersonationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ImpersonationMiddleware.name);

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * REQ-SEC-040: Super Admin Tenant Impersonation
   * Allows PAYSURITY_ADMIN or PAYSURITY_SUPPORT actors to legally bypass
   * their native User JWT restriction by injecting a target tenant_id into the context.
   * This is required for PaySurity staff to assist merchants with CRUD items, employees, etc.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    const impersonateTenantId = req.headers['x-impersonate-tenant'] as string;
    
    // 1. Pass-through if no impersonation requested
    if (!impersonateTenantId) {
      return next();
    }

    // 2. Extract standard Identity from JWT token (assuming prior AuthGuard mapped it)
    const user = (req as any).user;
    if (!user) {
      throw new ForbiddenException('Cannot impersonate. Base authentication missing.');
    }

    // 3. Strict RBAC validation to ensure ONLY Super Admins can use this
    if (user.role !== 'PAYSURITY_ADMIN' && user.role !== 'PAYSURITY_SUPPORT') {
      this.logger.warn(`ILLEGAL IMPERSONATION ATTEMPT BY USER: ${user.id}`);
      throw new ForbiddenException('You do not possess Super Admin clearance to impersonate another tenant.');
    }

    // 4. Validate Target Tenant exists
    const target = await (this.db as any).execute(
      `SELECT id, name FROM tenants WHERE id = $1 LIMIT 1`,
      [impersonateTenantId]
    );

    if (target?.rows?.length === 0) {
      throw new ForbiddenException(`Target tenant ${impersonateTenantId} does not exist.`);
    }

    // 5. Inject Impersonation Context payload into the Request Object
    // All downstream APIs will now read req.tenantId as the Target, not the platform admin.
    (req as any).tenantId = impersonateTenantId;
    (req as any).isImpersonating = true;
    (req as any).originalUserId = user.id;

    this.logger.log(`[AUDIT] Super Admin ${user.id} is now IMPERSONATING Tenant ${(target as any).rows[0].name}`);

    next();
  }
}

