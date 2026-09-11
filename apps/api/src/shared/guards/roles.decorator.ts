import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator — specifies which roles can access an endpoint.
 *
 * Usage:
 *   @Roles('MERCHANT_ADMIN', 'STORE_MANAGER')
 *    *   @Get('/dashboard')
 *   getDashboard() { ... }
 *
 * Role values MUST match RBAC_PERMISSION_MATRIX.md exactly.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
