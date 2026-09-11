import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token missing.');
    }

    try {
      // Assuming JwtService is configured globally with the secret key in JwtModule.
      // If not, the secret would need to be passed here as a second argument to verifyAsync.
      const payload: any = await (this.jwtService as any).verifyAsync(token);
      
      // We're attaching the payload to the request object so that we can retrieve it in our route handlers.
      // This allows controllers to access the authenticated user's data via `req.user`.
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

