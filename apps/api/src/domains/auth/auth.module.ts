import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  imports: [
    ConfigModule,
    AuditLogModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'paysurity-jwt-secret-2026'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
