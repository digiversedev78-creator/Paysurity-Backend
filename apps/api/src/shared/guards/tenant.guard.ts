import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Assuming request.user is populated by a prior authentication guard (e.g., JWTGuard)
    // and contains a tenantId property.
    const tenantId = request?.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    return true;
  }
}
