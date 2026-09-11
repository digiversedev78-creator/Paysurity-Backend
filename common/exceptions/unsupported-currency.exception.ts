import { BadRequestException } from '@nestjs/common';

export class UnsupportedCurrencyException extends BadRequestException {
  constructor(message?: string) {
    super(message ?? 'Unsupported currency');
  }
}
