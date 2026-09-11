import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // In a real application, you would extract the user from the request here
    // For example, from request.user if using Passport.js
    // Or from a custom authentication middleware
    return request.user;
  },
);
