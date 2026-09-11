import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class HmacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    return true; // stub — real HMAC validation to be implemented
  }
}
