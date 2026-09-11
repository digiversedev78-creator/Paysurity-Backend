import { createParamDecorator } from '@nestjs/common';
export const GetUser = createParamDecorator((_d, _ctx) => null);
