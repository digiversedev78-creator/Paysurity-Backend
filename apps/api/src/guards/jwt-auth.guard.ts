import { Injectable} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // You can override canActivate to add custom logic before or after JWT validation.
  // For instance, if you want to add role-based authorization after successful authentication.
  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   // Call the parent AuthGuard's canActivate method to validate the JWT
  //   const authenticated = (await super.canActivate(context)) as boolean;
  //
  //   if (authenticated) {
  //     // If authenticated, you can add further authorization logic here
  //     const request = context.switchToHttp().getRequest();
  //     // Example: Check if the user has a specific role
  //     // if (request.user && request.user.roles.includes('admin')) {
  //     //   return true;
  //     // }
  //     return true; // Or return false based on your additional logic
  //   }
  //   return false;
  // }

  // You can override handleRequest to customize error handling or user object.
  // handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
  //   // If authentication failed, throw an exception
  //   if (err || !user) {
  //     throw err || new UnauthorizedException('Invalid or missing token');
  //   }
  //   return user;
  // }
}
