/**
 * CurrentTenant decorator — extracts tenantId from JWT payload on request.
 * Falls back to 'default' if not present (staging safety net).
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // JwtAuthGuard attaches user payload to request.user
    return request.user?.tenantId ?? request.headers['x-tenant-id'] ?? 'default';
  },
);
