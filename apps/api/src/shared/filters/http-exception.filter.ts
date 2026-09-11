import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP Exception Filter — maps all errors to standard PaySurity API error envelope.
 *
 * Response shape:
 * {
 *   success: false,
 *   error: {
 *     code: "ERROR_CODE",
 *     message: "Human-readable message",
 *     traceId: "uuid",
 *     timestamp: "ISO-8601"
 *   }
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let paySurityErrorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected error occurred';
    let errorDetails: string | undefined = undefined; // For potential additional details from NestJS exceptions

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        paySurityErrorCode = this.mapHttpStatusToPaySurityCode(httpStatus);
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as {
          message?: string | string[];
          error?: string;
          code?: string;
          statusCode?: number;
        };

        // Prioritize custom error codes if provided in the exception response
        paySurityErrorCode = resp.code || resp.error || this.mapHttpStatusToPaySurityCode(httpStatus);

        // Handle class-validator array of messages
        if (Array.isArray(resp.message)) {
          errorMessage = resp.message.join('; ');
        } else {
          errorMessage = resp.message || resp.error || errorMessage;
        }

        // If NestJS default validation errors include a specific 'error' field
        if (resp.error && resp.error !== paySurityErrorCode && resp.error !== errorMessage) {
            errorDetails = resp.error;
        }
      }
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      // For unhandled standard Errors, keep 500 status and INTERNAL_SERVER_ERROR code
      this.logger.error(
        `Unhandled system error: ${exception.message}`,
        exception.stack,
        this.constructor.name,
      );
    } else {
      // Catch all for non-Error, non-HttpException unknowns
      this.logger.error(
        `Caught unknown exception type: ${JSON.stringify(exception)}`,
        undefined,
        this.constructor.name,
      );
    }

    const traceId = (request.headers['x-trace-id'] as string) || 'no-trace-id';

    // Log the error for server-side debugging
    this.logger.error(
      `[${traceId}] ${request.method} ${request.url} → ${httpStatus} ${paySurityErrorCode}: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined, // Only log stack for actual Error instances
      this.constructor.name,
    );

    // Set X-Trace-Id header in the response
    response.setHeader('X-Trace-Id', traceId);

    response.status(httpStatus).json({
      success: false,
      error: {
        code: paySurityErrorCode,
        message: errorMessage,
        ...(errorDetails && { details: errorDetails }), // Include details if available
        traceId: traceId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Maps common HTTP status codes to PaySurity-specific error codes.
   * This is a fallback if no specific error code is provided by the exception.
   */
  private mapHttpStatusToPaySurityCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN', // Changed from INSUFFICIENT_PERMISSIONS for broader NestJS compatibility
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      406: 'NOT_ACCEPTABLE',
      408: 'REQUEST_TIMEOUT',
      409: 'CONFLICT',
      413: 'PAYLOAD_TOO_LARGE',
      415: 'UNSUPPORTED_MEDIA_TYPE',
      422: 'VALIDATION_FAILED', // Specific for unprocessable entity validation issues
      429: 'TOO_MANY_REQUESTS', // Changed from RATE_LIMIT_EXCEEDED
      500: 'INTERNAL_SERVER_ERROR',
      501: 'NOT_IMPLEMENTED',
      502: 'BAD_GATEWAY', // Changed from GATEWAY_ERROR
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };
    return map[status] || 'UNKNOWN_ERROR';
  }
}
