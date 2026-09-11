import { Module } from '@nestjs/common';
import { SecretsService } from '../modules/secrets/secrets.service';
import { AuthController } from './auth.controller';
import { SecretsService } from '../modules/secrets/secrets.service';
import { AuthService } from './auth.service';
import { SecretsService } from '../modules/secrets/secrets.service';

@Module({
  controllers: [AuthController],
  providers: [SecretsService, AuthService],
  exports: [AuthService],
})
export class AuthModule {}

