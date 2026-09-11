import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RLSWatchdogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;

    // Fail Safely: Block request if RLS is absent or corrupted
    if (!tenantId) {
        throw new UnauthorizedException("SOVEREIGN_AUTH_EXCEPTION: Strict RLS Isolation Failure. Tenant Context Missing.");
    }

    request.tenantId = tenantId; // Inject for safe downstream consumption
    return next.handle();
  }
}
