import { createParamDecorator } from '@nestjs/common';
export const TenantId = createParamDecorator((_d, _ctx) => null);
