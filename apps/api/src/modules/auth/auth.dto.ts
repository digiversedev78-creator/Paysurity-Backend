/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SEC-009 -- Auth Latency SLA
 * FILE TYPE:    DTO
 * MODULE:       auth
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/SEC_SECURITY_PRIVACY.md
 * WORKER:       CODER-031
 * GENERATED:    2026-03-17T13:08:15.368Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsUUID
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsUUID('4', { message: 'Tenant ID must be a valid UUID v4.' })
  @IsOptional()
  tenantId?: string;
}

export class RegisterDto {
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  firstName: string;

  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  lastName: string;

  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  })
  password: string;

  @IsString({ message: 'Organization name must be a string.' })
  @IsNotEmpty({ message: 'Organization name cannot be empty.' })
  @IsOptional()
  organizationName?: string;

  @IsUUID('4', { message: 'Tenant ID must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Tenant ID cannot be empty.' })
  tenantId: string;

  @IsString({ message: 'Role must be a string.' })
  @IsOptional()
  role?: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email: string;
}

export class ResetPasswordDto {
  @IsUUID('4', { message: 'Token must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Token cannot be empty.' })
  token: string;

  @IsString({ message: 'New password must be a string.' })
  @IsNotEmpty({ message: 'New password cannot be empty.' })
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  })
  newPassword: string;
}

export class VerifyEmailDto {
  @IsUUID('4', { message: 'Token must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Token cannot be empty.' })
  token: string;
}

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string.' })
  @IsNotEmpty({ message: 'Refresh token cannot be empty.' })
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Old password must be a string.' })
  @IsNotEmpty({ message: 'Old password cannot be empty.' })
  oldPassword: string;

  @IsString({ message: 'New password must be a string.' })
  @IsNotEmpty({ message: 'New password cannot be empty.' })
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  })
  newPassword: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name cannot be empty.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name cannot be empty.' })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email cannot be empty.' })
  email?: string;
}

export class TwoFactorAuthSetupDto {
  @IsString({ message: 'Two-factor authentication code must be a string.' })
  @IsNotEmpty({ message: 'Two-factor authentication code cannot be empty.' })
  code: string;
}

export class TwoFactorAuthVerifyDto {
  @IsString({ message: 'Two-factor authentication code must be a string.' })
  @IsNotEmpty({ message: 'Two-factor authentication code cannot be empty.' })
  code: string;
}

export class TwoFactorAuthToggleDto {
  @IsString({ message: 'Two-factor authentication code must be a string.' })
  @IsNotEmpty({ message: 'Two-factor authentication code cannot be empty.' })
  code: string;
}
