import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TenantIdDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // For demonstration, let's assume tenantId is available on the request object.
    // In a real application, this would be extracted from headers, JWT, etc.
    return request.tenantId; 
  },
);
