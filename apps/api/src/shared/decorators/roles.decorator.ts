import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // If no roles metadata is present, this endpoint doesn't require specific roles.
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Ensure user object and user roles array exist in the request
    // Assumes JWT payload populates req.user with a 'roles' array.
    if (!user || !Array.isArray(user.roles)) {
      throw new ForbiddenException('Insufficient permissions. User roles not found or malformed.');
    }

    // Check if the user has at least one of the required roles
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions. Access requires one of the following roles: ' + requiredRoles.join(', '));
    }

    return true;
  }
}
