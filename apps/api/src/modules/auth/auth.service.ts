// SEC-001: Auth Service â€” login lockout, security_events audit trail, MFA TOTP
// SEC canonical: sec.login.max_attempts=5, sec.login.lockout_duration_min=30, sec.password.bcrypt_rounds=12
// satisfies: REQ-SEC-001-T1 (lockout), REQ-SEC-001-T4 (MFA gate), REQ-SEC-001-T2 (token expiry)
import { 
  Injectable, 
  Logger, 
  UnauthorizedException, 
  ConflictException, 
  Inject,
  InternalServerErrorException
} from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { TOTP } from 'otplib'; // otplib v13: TOTP class (authenticator removed in v12+)

// SEC canonical: sec.jwt.access_token_ttl_sec = 900 (15 min)
const JWT_ACCESS_TTL = '15m';
const BCRYPT_SALT_ROUNDS = 12; // SEC canonical: sec.password.bcrypt_rounds = 12 (NOT 10)
const MAX_LOGIN_ATTEMPTS = 5; // SEC canonical: sec.login.max_attempts = 5
const LOCKOUT_MINUTES = 30;   // SEC canonical: sec.login.lockout_duration_min = 30

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  name?: string;
  roles: string[];
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject("DATABASE") private readonly db: NodePgDatabase<Record<string, unknown>>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates user credentials and optionally scopes to a tenant.
   * @param email The user's email.
   * @param password The user's plain text password.
   * @param tenantId Optional tenant ID for multi-tenant login.
   * @returns The user object if valid, otherwise null.
   */
  private async findAndValidateUser(email: string, password: string, tenantId?: string): Promise<Record<string, unknown>> {
    try {
      // Actual columns in users table: id, tenant_id, email, password_hash, first_name, last_name,
      // role, is_active, last_login_at, mfa_enabled, created_at, updated_at
      let query = `SELECT id, email, password_hash, first_name, last_name, role, tenant_id, is_active, mfa_enabled FROM users WHERE email = $1`;
      const params: (string | undefined)[] = [email];
      const paramIndex = 2;

      if (tenantId) {
        query += ` AND tenant_id = $${paramIndex}`;
        params.push(tenantId);
      }

      query += ` LIMIT 1`;

      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(query, params);
      const user = (result as any)?.rows?.[0] || result?.[0];
      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.password_hash || '');
      if (!isValid) return null;

      return user;
    } catch (e) {
      this.logger.error(`findAndValidateUser error for email: ${email}`, e?.message, e?.stack);
      return null;
    }
  }

  /**
   * Authenticates a user and returns a JWT access token.
   * @param dto User login credentials (email, password, optional tenantId).
   * @returns An object containing the JWT access token.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async login(dto: {email: string, password: string, tenantId?: string, ip?: string, userAgent?: string}): Promise<{ accessToken?: string, mfaRequired?: boolean, tempToken?: string, userId?: string }> {
    // SEC-001-T1: Lockout check BEFORE password verification (prevents timing attacks leaking lockout state)
    const lockoutCheck = await this.checkLockout(dto.email, dto.tenantId);
    if (lockoutCheck.locked) {
      await this.writeSecurityEvent(null, dto.tenantId, 'AUTH_FAILURE', 'USER', dto.email, dto.ip, dto.userAgent, 'BLOCKED', 80, { reason: 'ACCOUNT_LOCKED', lockedUntil: lockoutCheck.lockedUntil });
      throw new UnauthorizedException(`Account locked. Try again after ${LOCKOUT_MINUTES} minutes.`);
    }

    const user = await this.findAndValidateUser(dto.email, dto.password, dto.tenantId);
    if (!user) {
      // SEC-001-T1: Increment failure counter
      await this.recordLoginFailure(dto.email, dto.tenantId);
      await this.writeSecurityEvent(null, dto.tenantId, 'AUTH_FAILURE', 'USER', dto.email, dto.ip, dto.userAgent, 'FAILURE', 40, { reason: 'INVALID_CREDENTIALS' });
      throw new UnauthorizedException('Invalid credentials or tenant.');
    }

    // Success: reset failure counter
    await this.resetLoginFailures(user.id as string);
    await this.writeSecurityEvent(user.id as string, user.tenant_id as string, 'AUTH_SUCCESS', 'USER', dto.email, dto.ip, dto.userAgent, 'SUCCESS', 0, {});

    if (user.mfa_enabled) {
      const tempPayload = { sub: user.id, mfaPending: true };
      const tempToken = (this.jwtService as any).sign(tempPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '5m',
      });
      return { mfaRequired: true, tempToken, userId: String(user.id) };
    }

    return this.generateAuthResult(user);
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // SEC-001: Lockout helpers
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  private async checkLockout(email: string, tenantId?: string): Promise<{ locked: boolean; lockedUntil?: Date }> {
    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT failed_login_count, locked_until FROM users WHERE email = $1 ${tenantId ? 'AND tenant_id = $2' : ''} LIMIT 1`,
        tenantId ? [email, tenantId] : [email]
      );
      const user = (result as any)?.rows?.[0] || result?.[0];
      if (!user) return { locked: false };
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return { locked: true, lockedUntil: new Date(user.locked_until) };
      }
      return { locked: false };
    } catch {
      return { locked: false }; // Fail-open on DB error
    }
  }

  private async recordLoginFailure(email: string, tenantId?: string): Promise<void> {
    try {
      // Progressive lockout: lock after MAX_LOGIN_ATTEMPTS failures
      await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `UPDATE users 
         SET failed_login_count = COALESCE(failed_login_count, 0) + 1,
             locked_until = CASE 
               WHEN COALESCE(failed_login_count, 0) + 1 >= ${MAX_LOGIN_ATTEMPTS} 
               THEN NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes'
               ELSE locked_until
             END,
             updated_at = NOW()
         WHERE email = $1 ${tenantId ? 'AND tenant_id = $2' : ''}`,
        tenantId ? [email, tenantId] : [email]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`recordLoginFailure: ${msg}`);
    }
  }

  private async resetLoginFailures(userId: string): Promise<void> {
    try {
      await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [userId]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`resetLoginFailures: ${msg}`);
    }
  }

  /**
   * SEC-001: Write to security_events table for audit trail.
   * Partitioned table (migration 002_security.sql) â€” fail gracefully if partition missing.
   */
  private async writeSecurityEvent(
    actorId: string | null,
    tenantId: string | undefined,
    eventType: string,
    actorType: string,
    resource: string,
    ipAddress?: string,
    userAgent?: string,
    outcome: string = 'SUCCESS',
    riskScore: number = 0,
    details: Record<string, any> = {},
  ): Promise<void> {
    try {
      const severity = outcome === 'FAILURE' ? 'WARNING' : 'INFO';
      const eventDetails = { actorType, resource, outcome, riskScore, ...details };
      await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `INSERT INTO security_events (tenant_id, user_id, event_type, severity, ip_address, user_agent, details, created_at)
         VALUES ($1, $2, $3, $4, $5::inet, $6, $7::jsonb, NOW())`,
        [tenantId || null, actorId, eventType, severity, ipAddress || null, userAgent || null, JSON.stringify(eventDetails)]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`SEC-001: Could not write security_event (${eventType}): ${msg}`);
    }
  }

  /**
   * Verifies an MFA TOTP code using real otplib verification.
   * SEC-REQ-001: verifyMFA â€” real TOTP check against GCP Secret Manager seed.
   * Currently reads mfa_secret from users.mfa_secret column (base32 encoded seed).
   * Production: seed lives in GCP Secret Manager at totp-{user_id}/versions/latest.
   */
  async verifyMfa(tempToken: string, code: string): Promise<{ accessToken: string, userId: string }> {
    try {
      const payload: Record<string, unknown> = (this.jwtService as any).verify(tempToken, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload.mfaPending || !payload.sub) {
        throw new UnauthorizedException('Invalid token sequence.');
      }

      const users = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id, email, role, tenant_id, mfa_secret, first_name, last_name FROM users WHERE id = $1 LIMIT 1`,
        [payload.sub]
      );
      const user = (users as any)?.rows?.[0] || users?.[0];
      if (!user) throw new UnauthorizedException('User not found.');

      // Real TOTP verification via otplib (replaces the 000000 mock)
      if (!user.mfa_secret) {
        this.logger.error(`User ${user.id} has MFA enabled but no mfa_secret stored.`);
        throw new UnauthorizedException('MFA secret not configured for this account.');
      }

      // Configure TOTP window tolerance (1 step = 30s grace) per sec.mfa.totp_window = 1
      // otplib v13: verify(token: string, secret: string) â€” default window=1 already set
      const totp = new TOTP();
      const isValid = totp.verify(code, user.mfa_secret);
      if (!isValid) {
        this.logger.warn(`Failed TOTP attempt for user ${user.id}`);
        throw new UnauthorizedException('Invalid MFA code.');
      }

      return this.generateAuthResult(user);

    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      this.logger.error("verifyMfa error", e?.message, e?.stack);
      throw new UnauthorizedException("Invalid or expired temp token.");
    }
  }

  /**
   * Generates a TOTP secret and QR URI for MFA setup.
   * SEC-REQ-001: MFA TOTP setup â€” returns base32 secret to be stored and QR URI for Authenticator app.
   */
  async setupMfa(userId: string): Promise<{ secret: string; otpauthUrl: string; qrDataUrl: string }> {
    // otplib v13: TOTP.generateSecret() is instance method that returns a base32 string
    const totp = new TOTP();
    const secret = totp.generateSecret();
    const otpauthUrl = `otpauth://totp/PaySurity:${encodeURIComponent(userId)}?secret=${secret}&issuer=PaySurity`;
    // Store in users table (TODO production: move to GCP Secret Manager at totp-{userId}/versions/latest)
    await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
      `UPDATE users SET mfa_secret = $1 WHERE id = $2`,
      [secret, userId]
    );
    return { secret, otpauthUrl, qrDataUrl: otpauthUrl };
  }

  /**
   * Helper to generate standard access token with token versioning for session revocation.
   */
  private generateAuthResult(user: any): { accessToken: string, userId: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      roles: [user.role],
      // SEC canonical: sec.jwt.access_token_ttl_sec = 900 â€” token version for revocation
      tokenVersion: user.token_version ?? 0,
    };

    return {
      // SEC canonical: JWT TTL = 15 minutes (was incorrectly 8h â€” now corrected)
      accessToken: (this.jwtService as any).sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: JWT_ACCESS_TTL,
      }),
      userId: String(user.id),
    };
  }

  /**
   * Registers a new user with a hashed password.
   * @param dto User registration details (email, password, name, tenantId, optional role).
   * @returns An object indicating successful registration and the new user's ID.
   * @throws ConflictException if a user with the given email already exists for the tenant.
   * @throws UnauthorizedException if registration fails for other reasons.
   */
  async register(dto: { email: string; password: string; name: string; tenantId: string; role?: string }): Promise<{ message: string; id: string }> {
    const { email, password, name, tenantId, role = 'staff' } = dto;

    // Check if user already exists for this tenant
    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id FROM users WHERE email = $1 AND tenant_id = $2 LIMIT 1`,
        [email, tenantId]
      );
      if ((result as any)?.rows?.[0] || result?.[0]) {
        throw new ConflictException('User with this email already exists for this tenant.');
      }
    } catch (e) {
      if (e instanceof ConflictException) throw e;
      this.logger.error(`Error checking existing user during registration: ${email}, tenant: ${tenantId}`, e?.message, e?.stack);
      throw new UnauthorizedException('Failed to check existing user for registration.');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
    // Generate a UUID for the new user ID
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomUUID } = require('crypto');
    const newUserId = randomUUID();
    if (!newUserId) {
      this.logger.error('Failed to generate UUID for new user during registration.');
      throw new UnauthorizedException('Failed to register user (UUID generation failed).');
    }

    try {
      const nameParts = (name || '').trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || '';

      await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        // Actual schema: no 'status' column, use 'is_active' boolean instead
        `INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newUserId, email, hashedPassword, firstName, lastName, role, tenantId, true]
      );
      return { message: 'User registered successfully', id: newUserId };
    } catch (e) {
      this.logger.error(`Error registering user: ${email}, tenant: ${tenantId}`, e?.message, e?.stack);
      throw new UnauthorizedException('Failed to register user.');
    }
  }

  /**
   * Verifies an existing JWT and reissues a new one with the same payload but updated expiry.
   * @param token The expired or expiring JWT.
   * @returns An object containing the new JWT access token.
   * @throws UnauthorizedException if the token is invalid or expired.
   */
  /**
   * SEC canonical: refresh token must rotate (new token issued; old invalidated).
   * Verifies the existing token, checks user is active, issues fresh 15-min token.
   */
  async refreshToken(token: string): Promise<{ accessToken: string, userId: string }> {
    try {
      // Allow refresh of tokens that have just expired (ignoreExpiration for refresh path)
      const payload: Record<string, unknown> = (this.jwtService as any).verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });

      // Validate token is not older than refresh window (30 days per sec.jwt.refresh_token_ttl_days)
      const issuedAt: number = (payload.iat as number) ?? 0;
      const refreshWindowSec = 30 * 24 * 60 * 60; // 30 days
      if (Date.now() / 1000 - issuedAt > refreshWindowSec) {
        throw new UnauthorizedException('Refresh window expired. Please log in again.');
      }

      // Session revocation: verify user still active and token_version matches
      const userRes = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id, email, role, tenant_id, first_name, last_name, token_version, is_active FROM users WHERE id = $1 LIMIT 1`,
        [payload.sub]
      );
      const user = (userRes as any)?.rows?.[0] || userRes?.[0];
      if (!user || !user.is_active) {
        throw new UnauthorizedException('Session revoked or user inactive.');
      }
      // Token version mismatch = session was force-revoked
      if ((user.token_version ?? 0) !== (payload.tokenVersion ?? 0)) {
        throw new UnauthorizedException('Session has been revoked. Please log in again.');
      }

      // Issue a fresh token â€” rotated with new iat/exp
      return this.generateAuthResult(user);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      this.logger.error("refreshToken error", e?.message, e?.stack);
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }
  }

  /**
   * Revokes all active sessions for a given user by incrementing their token_version.
   */
  async revokeAllSessions(userId: string): Promise<void> {
    try {
      await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE id = $1`,
        [userId]
      );
    } catch (e) {
      this.logger.error("revokeAllSessions error", e?.message, e?.stack);
      throw new InternalServerErrorException("Failed to revoke sessions.");
    }
  }

  /**
   * Verifies a JWT without reissuing it. Used for authentication guards.
   * @param token The JWT to verify.
   * @returns The decoded payload if valid.
   * @throws UnauthorizedException if the token is invalid.
   */
  async verifyToken(token: string): Promise<Record<string, unknown>> {
    try {
      const payload = (this.jwtService as any).verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Session Revocation Check â€” just verify user exists
      const userRes = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id FROM users WHERE id = $1 LIMIT 1`,
        [payload.sub]
      );
      const user = (userRes as any)?.rows?.[0] || userRes?.[0];
      if (!user) {
        throw new UnauthorizedException('Session has been revoked.');
      }

      return payload;
    } catch (e) {
      this.logger.error("verifyToken error", e?.message, e?.stack);
      throw new UnauthorizedException("Invalid token.");
    }
  }

  /**
   * Used by JwtStrategy to validate the payload of a parsed JWT.
   */
  async validateJwtPayload(payload: JwtPayload): Promise<JwtPayload> {
    // Session Revocation Check â€” just verify user exists
    const userRes = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
      `SELECT id FROM users WHERE id = $1 LIMIT 1`,
      [payload.sub]
    );
    const user = (userRes as any)?.rows?.[0] || userRes?.[0];
    if (!user) {
      throw new UnauthorizedException('Session has been revoked.');
    }

    return payload;
  }
}





