import { createParamDecorator } from '@nestjs/common';
export const InjectDrizzle = createParamDecorator((_d, _ctx) => null);
