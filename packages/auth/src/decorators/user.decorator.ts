import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** @User() — extracts user from request. @User('id') — extracts user.id */
export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    return data ? user?.[data] : user;
  },
);

/** Alias for backward compatibility */
export const CurrentUser = User;
