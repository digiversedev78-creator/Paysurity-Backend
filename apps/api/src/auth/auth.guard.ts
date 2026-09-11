import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Auth header.');
    }

    const token = authHeader.split(' ')[1];

    try {
      // NOTE: process.env.JWT_SECRET will be securely injected in production
      const secret = process.env.JWT_SECRET || 'temp_dev_secret_123!!';
      const decodedPayload = jwt.verify(token, secret);
      
      // Attach the verified user payload to the request for downstream processing
      request.user = decodedPayload;
      return true; // Access Granted
    } catch (err) {
      throw new UnauthorizedException('Invalid or Expired Token');
    }
  }
}
