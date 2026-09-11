import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AelsHmacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-paysurity-signature'];
    
    if (!signature) {
      throw new UnauthorizedException('Missing HMAC signature.');
    }

    const payload = JSON.stringify(request.body);
    const secret = process.env.AELS_WEBHOOK_SECRET || 'dev-secret';
    
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (computedSignature !== signature) {
      throw new UnauthorizedException('Invalid HMAC signature.');
    }

    return true;
  }
}
