import { createParamDecorator } from '@nestjs/common';
export const TenantId = createParamDecorator(
  (_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user?.tenantId ?? req.headers['x-tenant-id'] ?? 'default';
  },
);
