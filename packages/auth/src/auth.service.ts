// SEC-001: Auth Service — login lockout, security_events audit trail, MFA TOTP
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
import { eq, and, sql, isNull, or, lte } from 'drizzle-orm';
import { TOTP } from 'otplib';
import * as schema from '@paysurity/database';
import { users } from '@paysurity/database/src/schema/users';

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
    @Inject("DATABASE") private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
  ) {}

  private async findAndValidateUser(email: string, password: string, tenantId?: string): Promise<typeof users.$inferSelect | null> {
    try {
      const condition = tenantId 
        ? and(eq(users.email, email), eq(users.tenantId, tenantId))
        : eq(users.email, email);

      const userRes = await this.db.select().from(users).where(condition).limit(1);
      const user = userRes[0];
      if (!user) return null;

      const isValid = await bcrypt.compare(password, user.passwordHash || '');
      if (!isValid) return null;

      return user;
    } catch (e: any) {
      this.logger.error(`findAndValidateUser error for email: ${email}`, e?.message, e?.stack);
      return null;
    }
  }

  async login(dto: {email: string, password: string, tenantId?: string, ip?: string, userAgent?: string}): Promise<{ accessToken?: string, mfaRequired?: boolean, tempToken?: string, userId?: string }> {
    const lockoutCheck = await this.checkLockout(dto.email, dto.tenantId);
    if (lockoutCheck.locked) {
      await this.writeSecurityEvent(null, dto.tenantId, 'AUTH_FAILURE', 'USER', dto.email, dto.ip, dto.userAgent, 'BLOCKED', 80, { reason: 'ACCOUNT_LOCKED', lockedUntil: lockoutCheck.lockedUntil });
      throw new UnauthorizedException(`Account locked. Try again after ${LOCKOUT_MINUTES} minutes.`);
    }

    const user = await this.findAndValidateUser(dto.email, dto.password, dto.tenantId);
    if (!user) {
      await this.recordLoginFailure(dto.email, dto.tenantId);
      await this.writeSecurityEvent(null, dto.tenantId, 'AUTH_FAILURE', 'USER', dto.email, dto.ip, dto.userAgent, 'FAILURE', 40, { reason: 'INVALID_CREDENTIALS' });
      throw new UnauthorizedException('Invalid credentials or tenant.');
    }

    await this.resetLoginFailures(user.id);
    await this.writeSecurityEvent(user.id, user.tenantId, 'AUTH_SUCCESS', 'USER', dto.email, dto.ip, dto.userAgent, 'SUCCESS', 0, {});

    if (user.mfaEnabled) {
      const tempPayload = { sub: user.id, mfaPending: true };
      const tempToken = this.jwtService.sign(tempPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '5m',
      });
      return { mfaRequired: true, tempToken, userId: String(user.id) };
    }

    return this.generateAuthResult(user);
  }

  private async checkLockout(email: string, tenantId?: string): Promise<{ locked: boolean; lockedUntil?: Date }> {
    try {
      const condition = tenantId 
        ? and(eq(users.email, email), eq(users.tenantId, tenantId))
        : eq(users.email, email);

      const userRes = await this.db.select({ failedLoginCount: users.failedLoginCount, lockedUntil: users.lockedUntil }).from(users).where(condition).limit(1);
      const user = userRes[0];
      
      if (!user) return { locked: false };
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return { locked: true, lockedUntil: new Date(user.lockedUntil) };
      }
      return { locked: false };
    } catch {
      return { locked: false };
    }
  }

  private async recordLoginFailure(email: string, tenantId?: string): Promise<void> {
    try {
      const condition = tenantId 
        ? and(eq(users.email, email), eq(users.tenantId, tenantId))
        : eq(users.email, email);
      
      await this.db.update(users)
        .set({
          failedLoginCount: sql`COALESCE(${users.failedLoginCount}, 0) + 1`,
          lockedUntil: sql`
            CASE 
              WHEN COALESCE(${users.failedLoginCount}, 0) + 1 >= ${MAX_LOGIN_ATTEMPTS} 
              THEN NOW() + INTERVAL '${sql.raw(LOCKOUT_MINUTES.toString())} minutes'
              ELSE ${users.lockedUntil}
            END
          `,
          updatedAt: sql`NOW()`
        })
        .where(condition);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`recordLoginFailure: ${msg}`);
    }
  }

  private async resetLoginFailures(userId: string): Promise<void> {
    try {
      await this.db.update(users)
        .set({
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: sql`NOW()`,
          updatedAt: sql`NOW()`
        })
        .where(eq(users.id, userId));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`resetLoginFailures: ${msg}`);
    }
  }

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
      await this.db.execute(sql`
        INSERT INTO security_events (tenant_id, user_id, event_type, severity, ip_address, user_agent, details, created_at)
        VALUES (${tenantId || null}, ${actorId}, ${eventType}, ${severity}, ${ipAddress || null}::inet, ${userAgent || null}, ${JSON.stringify(eventDetails)}::jsonb, NOW())
      `);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.logger.warn(`SEC-001: Could not write security_event (${eventType}): ${msg}`);
    }
  }

  async verifyMfa(tempToken: string, code: string): Promise<{ accessToken: string, userId: string }> {
    try {
      const payload: Record<string, unknown> = this.jwtService.verify(tempToken, {
        secret: process.env.JWT_SECRET,
      });

      if (!payload.mfaPending || !payload.sub) {
        throw new UnauthorizedException('Invalid token sequence.');
      }

      const userRes = await this.db.select().from(users).where(eq(users.id, payload.sub as string)).limit(1);
      const user = userRes[0];
      if (!user) throw new UnauthorizedException('User not found.');

      if (!user.mfaSecret) {
        this.logger.error(`User ${user.id} has MFA enabled but no mfa_secret stored.`);
        throw new UnauthorizedException('MFA secret not configured for this account.');
      }

      const totp = new TOTP();
      const isValid = totp.verify(code, user.mfaSecret);
      if (!isValid) {
        this.logger.warn(`Failed TOTP attempt for user ${user.id}`);
        throw new UnauthorizedException('Invalid MFA code.');
      }

      return this.generateAuthResult(user);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      this.logger.error("verifyMfa error", (e as Error)?.message, (e as Error)?.stack);
      throw new UnauthorizedException("Invalid or expired temp token.");
    }
  }

  async setupMfa(userId: string): Promise<{ secret: string; otpauthUrl: string; qrDataUrl: string }> {
    const totp = new TOTP();
    const secret = totp.generateSecret();
    const otpauthUrl = `otpauth://totp/PaySurity:${encodeURIComponent(userId)}?secret=${secret}&issuer=PaySurity`;
    await this.db.update(users).set({ mfaSecret: secret }).where(eq(users.id, userId));
    return { secret, otpauthUrl, qrDataUrl: otpauthUrl };
  }

  private generateAuthResult(user: any): { accessToken: string, userId: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      roles: user.role ? [user.role] : [],
      tokenVersion: user.tokenVersion ?? 0,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: JWT_ACCESS_TTL,
      }),
      userId: String(user.id),
    };
  }

  async register(dto: { email: string; password: string; name: string; tenantId: string; role?: string }): Promise<{ message: string; id: string }> {
    const { email, password, name, tenantId, role = 'staff' } = dto;

    try {
      const existingUser = await this.db.select({ id: users.id }).from(users).where(and(eq(users.email, email), eq(users.tenantId, tenantId))).limit(1);
      if (existingUser[0]) {
        throw new ConflictException('User with this email already exists for this tenant.');
      }
    } catch (e) {
      if (e instanceof ConflictException) throw e;
      this.logger.error(`Error checking existing user during registration: ${email}, tenant: ${tenantId}`, (e as Error)?.message, (e as Error)?.stack);
      throw new UnauthorizedException('Failed to check existing user for registration.');
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    
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

      await this.db.insert(users).values({
        id: newUserId,
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role,
        tenantId,
        isActive: true
      });
      return { message: 'User registered successfully', id: newUserId };
    } catch (e) {
      this.logger.error(`Error registering user: ${email}, tenant: ${tenantId}`, (e as Error)?.message, (e as Error)?.stack);
      throw new UnauthorizedException('Failed to register user.');
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string, userId: string }> {
    try {
      const payload: Record<string, unknown> = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: true,
      });

      const issuedAt: number = (payload.iat as number) ?? 0;
      const refreshWindowSec = 30 * 24 * 60 * 60; // 30 days
      if (Date.now() / 1000 - issuedAt > refreshWindowSec) {
        throw new UnauthorizedException('Refresh window expired. Please log in again.');
      }

      const userRes = await this.db.select().from(users).where(eq(users.id, payload.sub as string)).limit(1);
      const user = userRes[0];
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Session revoked or user inactive.');
      }
      if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
        throw new UnauthorizedException('Session has been revoked. Please log in again.');
      }

      return this.generateAuthResult(user);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      this.logger.error("refreshToken error", (e as Error)?.message, (e as Error)?.stack);
      throw new UnauthorizedException("Invalid or expired refresh token.");
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    try {
      await this.db.update(users)
        .set({ tokenVersion: sql`COALESCE(${users.tokenVersion}, 0) + 1` })
        .where(eq(users.id, userId));
    } catch (e) {
      this.logger.error("revokeAllSessions error", (e as Error)?.message, (e as Error)?.stack);
      throw new InternalServerErrorException("Failed to revoke sessions.");
    }
  }

  async verifyToken(token: string): Promise<Record<string, unknown>> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userRes = await this.db.select({ id: users.id }).from(users).where(eq(users.id, payload.sub as string)).limit(1);
      if (!userRes[0]) {
        throw new UnauthorizedException('Session has been revoked.');
      }

      return payload;
    } catch (e) {
      this.logger.error("verifyToken error", (e as Error)?.message, (e as Error)?.stack);
      throw new UnauthorizedException("Invalid token.");
    }
  }

  async validateJwtPayload(payload: JwtPayload): Promise<JwtPayload> {
    const userRes = await this.db.select({ id: users.id }).from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!userRes[0]) {
      throw new UnauthorizedException('Session has been revoked.');
    }
    return payload;
  }
}
