import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

/**
 * Response Transform Interceptor — wraps all successful responses in standard envelope:
 *
 * Success: { success: true, data: <original>, timestamp: <iso> }
 *
 * Skips: Health endpoints, Swagger endpoints, already-enveloped responses (those with a 'success' key).
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  private readonly SKIP_PATHS = ['/health', '/api/docs'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Don't wrap health/docs endpoints or endpoints that should pass through
    if (this.SKIP_PATHS.some((p) => request.url.startsWith(p))) {
      return next.handle();
    }

    return next.handle().pipe(
      map((responseBody) => {
        // If the response already has a 'success' key, it's considered already wrapped.
        // Pass it through without modification.
        if (responseBody && typeof responseBody === 'object' && 'success' in responseBody) {
          return responseBody;
        }

        // Wrap all other successful responses in the specified envelope.
        return {
          success: true,
          data: responseBody,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
