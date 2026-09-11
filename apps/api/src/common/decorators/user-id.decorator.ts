import { createParamDecorator } from '@nestjs/common';
export const UserId = createParamDecorator((_d, _ctx) => null);
