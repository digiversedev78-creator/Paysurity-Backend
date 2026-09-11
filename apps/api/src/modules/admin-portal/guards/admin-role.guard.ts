import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROLE_KEY } from '../decorators/require-role.decorator';
import { eq } from 'drizzle-orm';
import { internalUsers, adminAuditLogs } from '@paysurity/database';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('DATABASE') private readonly db: any
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(REQUIRE_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    // In PaySurity, we can receive the ID either from JWT (req.user) or custom header for local dev bridging
    const adminId = request.user?.id || request.headers['x-admin-id'];

    if (!adminId) {
      throw new ForbiddenException('Admin authentication required.');
    }

    // Verify against internal_users
    const [admin] = await (this.db as any).select()
      .from(internalUsers)
      .where(eq(internalUsers.id, adminId))
      .limit(1);

    if (!admin) {
      throw new ForbiddenException('Invalid admin identity.');
    }

    // Attach to request for downstream usage
    request.adminUser = admin;

    const hasRole = requiredRoles.includes(admin.role);

    if (!hasRole) {
      // Strict Enforcer: Log the unauthorized attempt
      await (this.db as any).insert(adminAuditLogs).values({
        internalUserId: admin.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: { requiredRoles, currentRole: admin.role, path: request.path },
        ipAddress: request.ip || '0.0.0.0',
      }).catch(() => {}); // fire and forget

      throw new ForbiddenException(`Insufficient permissions. Required role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}

