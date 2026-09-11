import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  PAYMENT_PROCESSOR = 'payment_processor',
  MERCHANT = 'merchant',
  ANALYST = 'analyst',
  CUSTOMER_SUPPORT = 'customer_support',
}

const ROLES_KEY = 'roles';
const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific roles are defined for the route, allow access by default.
    // This implies that routes without @Roles() decorator are publicly accessible
    // or handled by other guards.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Assuming a preceding authentication guard has attached the user object
    // to the request, and that user object contains an array of roles.
    if (!user || !user.roles || !Array.isArray(user.roles)) {
      // User is not authenticated or their roles are not properly defined.
      // NestJS will automatically return a 403 Forbidden status for `false`.
      return false;
    }

    // Check if the authenticated user possesses at least one of the required roles.
    // If the user has any of the roles specified in the @Roles() decorator, access is granted.
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

    // If access is denied, NestJS will automatically return a 403 Forbidden status.
    return hasRequiredRole;
  }
}

export { RolesGuard, Roles, ROLES_KEY, UserRole };
