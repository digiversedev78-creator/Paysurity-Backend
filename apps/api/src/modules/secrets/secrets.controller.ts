import { Controller, Get } from '@nestjs/common';

@Controller('secrets')
export class SecretsController {
  @Get()
  getSecrets(): string {
    return 'Shhh! This is a secret.';
  }
}
