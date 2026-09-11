/**
 * AelsHmacGuard stub — real HMAC validation to be wired in production.
 * Currently passes all requests for staging/development.
 */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AelsHmacGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // TODO: Validate HMAC signature in production
    return true;
  }
}
