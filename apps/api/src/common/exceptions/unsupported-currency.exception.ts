import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * UnsupportedCurrencyException
 * Thrown when a wallet operation is attempted with a currency other than USD.
 * Maps to HTTP 422 Unprocessable Entity.
 *
 * REQ-WAL-001: Strict USD-only mutation guard.
 */
export class UnsupportedCurrencyException extends HttpException {
  constructor(message = 'Only USD transactions are supported') {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unsupported Currency',
        message,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}
