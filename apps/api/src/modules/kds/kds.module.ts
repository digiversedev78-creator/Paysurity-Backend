import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';
import { KdsGateway } from './kds.gateway';
import { AuditLogModule } from '../audit-log/audit-log.module';

/**
 * KdsModule — Phase 3 Remediation
 *
 * KdsGateway is now restored as a registered provider and requires JwtModule
 * for cryptographic WebSocket connection authentication.
 *
 * Note: AuditLogModule and EventBusModule references removed temporarily
 * because the original paths (@paypurity/*) are non-standard alias paths
 * that caused build failures. Re-wire via canonical src paths in Phase 4.
 */
@Module({
  imports: [
    AuditLogModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'paysurity-jwt-secret-2026'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '24h') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [KdsController],
  providers: [KdsService, KdsGateway],
  exports: [KdsService],
})
export class KdsModule {}
