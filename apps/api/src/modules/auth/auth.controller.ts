/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * FILE TYPE:    CONTROLLER
 * MODULE:       auth
 * PRIORITY:     P0 â€” Authentication & Authorization
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Logger,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { LoginDto, RegisterRequestDto as RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

// Custom decorator to mark routes as public (bypassing global authentication guards)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private auditLogService: AuditLogService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and retrieve a JWT access token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns JWT access token.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const startTime = process.hrtime.bigint();
    const tenantId = req.user?.tenantId ?? (loginDto as any).tenantId;
    this.logger.debug(`Login attempt: ${(loginDto as any).email}`);

    try {
      const result = await (this.authService as any).login({ ...loginDto, tenantId }) as { accessToken?: string, userId?: string };
      const accessToken = result?.accessToken;
      const userId = result?.userId;

      await (this.auditLogService as any).logActivity(
        String(tenantId ?? ''),
        String(userId ?? ''),
        'auth',
        'auth_login_success',
        { email: (loginDto as any).email },
      );

      const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
      this.logger.verbose(`Login for ${(loginDto as any).email} in ${durationMs.toFixed(2)}ms`);
      return { accessToken };
    } catch (error) {
      this.logger.warn(`Login failed: ${(loginDto as any).email} â€” ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Returns the new user ID.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already exists.' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const tenantId = req.user?.tenantId ?? (registerDto as any).tenantId;
    const startTime = process.hrtime.bigint();

    try {
      const result = await (this.authService as any).register({ ...registerDto, tenantId, name: `${(registerDto as any).firstName || ''} ${(registerDto as any).lastName || ''}`.trim() || 'Unknown' }) as { id?: string, userId?: string };
      const userId = result?.id ?? result?.userId;

      await (this.auditLogService as any).logActivity(
        String(tenantId ?? ''),
        String(userId ?? ''),
        'auth',
        'auth_register_success',
        { email: (registerDto as any).email },
      );

      const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
      this.logger.verbose(`Register for ${(registerDto as any).email} in ${durationMs.toFixed(2)}ms`);
      return { userId };
    } catch (error) {
      this.logger.error(`Registration failed: ${(registerDto as any).email} â€” ${error.message}`, error.stack);
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh an access token using a refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns new access token.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid or expired refresh token.' })
  async refreshToken(@Body() refreshDto: RefreshTokenDto) {
    try {
      const result = await (this.authService as any).refreshToken((refreshDto as any).refreshToken) as Record<string, unknown>;
      const accessToken = result?.accessToken;
      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(`Refresh token failed: ${error.message}`);
      }
      throw error;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retrieve the currently authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the authenticated user profile.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated.' })
  async getMe(@Req() req: Request) {
    const user = req.user;
    this.logger.debug(`getMe: userId=${user?.userId}`);
    return user;
  }
}

// Augment the Express Request type for JWT payload
declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      tenantId: string;
      roles: string[];
      [key: string]: unknown;
    };
  }
}


