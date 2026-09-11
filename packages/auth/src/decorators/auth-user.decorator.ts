import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // In a real application, you would extract the user from the request here
    // For example, if using Passport, it might be request.user
    return request.user;
  },
);
