import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * LoginDto -- validates POST /api/v1/auth/login body.
 */
export class LoginDto {
  @ApiProperty({ example: 'admin@bistrobeest.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Test123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: '123456', description: 'TOTP code for MFA-enabled accounts' })
  @IsOptional()
  @IsString()
  mfaCode?: string | undefined;

  @ApiPropertyOptional({ example: 'uuid-tenant-id', description: 'Tenant UUID for multi-tenant auth' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

/**
 * RegisterDto -- validates POST /api/v1/auth/register body.
 */
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'uuid-tenant-id' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

// Alias for backward compatibility with generated code that used RegisterRequestDto
export { RegisterDto as RegisterRequestDto };

/**
 * RefreshTokenDto -- validates POST /api/v1/auth/refresh body.
 */
export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  @IsString()
  refreshToken!: string;
}
