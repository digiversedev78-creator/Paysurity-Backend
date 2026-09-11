import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';

// SEC canonical: sec.jwt.access_token_ttl_sec = 900 (15 min)
const JWT_ACCESS_TTL = '15m';
const BCRYPT_SALT_ROUNDS = 12; // SEC canonical: sec.password.bcrypt_rounds = 12
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

export class AuthService {
  private db: any;
  private jwtSecret: string;

  constructor(db: any, jwtSecret: string) {
    this.db = db;
    this.jwtSecret = jwtSecret;
  }

  private async checkLockout(email: string, tenantId?: string) {
    const params = tenantId ? [email, tenantId] : [email];
    const query = `SELECT failed_login_count, locked_until FROM users WHERE email = $1 ${tenantId ? 'AND tenant_id = $2' : ''} LIMIT 1`;
    const result = await this.db.execute(query, params);
    const user = result?.rows?.[0] || result?.[0];
    if (!user) return { locked: false };
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { locked: true, lockedUntil: new Date(user.locked_until) };
    }
    return { locked: false };
  }

  private async recordLoginFailure(email: string, tenantId?: string) {
    const params = tenantId ? [email, tenantId] : [email];
    await this.db.execute(
      `UPDATE users 
       SET failed_login_count = COALESCE(failed_login_count, 0) + 1,
           locked_until = CASE 
             WHEN COALESCE(failed_login_count, 0) + 1 >= ${MAX_LOGIN_ATTEMPTS} 
             THEN NOW() + INTERVAL '${LOCKOUT_MINUTES} minutes'
             ELSE locked_until
           END,
           updated_at = NOW()
       WHERE email = $1 ${tenantId ? 'AND tenant_id = $2' : ''}`,
      params
    );
  }

  private async resetLoginFailures(userId: string) {
    await this.db.execute(
      `UPDATE users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [userId]
    );
  }

  async login(dto: LoginDto & { ip?: string; userAgent?: string }) {
    if (!dto.tenantId) {
       throw new Error('Tenant ID is required per Zero Tech Debt rule');
    }

    const lockout = await this.checkLockout(dto.email, dto.tenantId);
    if (lockout.locked) {
      throw new Error(`Account locked. Try again after ${LOCKOUT_MINUTES} minutes.`);
    }

    const query = `SELECT id, email, password_hash, first_name, last_name, role, tenant_id, is_active, mfa_enabled FROM users WHERE email = $1 AND tenant_id = $2 LIMIT 1`;
    const result = await this.db.execute(query, [dto.email, dto.tenantId]);
    const user = result?.rows?.[0] || result?.[0];

    if (!user) {
      await this.recordLoginFailure(dto.email, dto.tenantId);
      throw new Error('Invalid credentials or tenant.');
    }

    const isValid = await bcrypt.compare(dto.password, user.password_hash || '');
    if (!isValid) {
      await this.recordLoginFailure(dto.email, dto.tenantId);
      throw new Error('Invalid credentials or tenant.');
    }

    await this.resetLoginFailures(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      roles: [user.role],
      tokenVersion: user.token_version ?? 0,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: JWT_ACCESS_TTL });
    return { accessToken, userId: String(user.id) };
  }

  async register(dto: RegisterDto) {
    if (!dto.tenantId) {
      throw new Error('Tenant ID is required per Zero Tech Debt rule');
    }

    const checkQuery = `SELECT id FROM users WHERE email = $1 AND tenant_id = $2 LIMIT 1`;
    const result = await this.db.execute(checkQuery, [dto.email, dto.tenantId]);
    if (result?.rows?.[0] || result?.[0]) {
      throw new Error('User with this email already exists for this tenant.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const newUserId = crypto.randomUUID();

    const role = 'staff';
    const firstName = dto.firstName || 'Unknown';
    const lastName = dto.lastName || '';

    await this.db.execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [newUserId, dto.email, hashedPassword, firstName, lastName, role, dto.tenantId, true]
    );

    return { message: 'User registered successfully', id: newUserId };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = jwt.verify(dto.refreshToken, this.jwtSecret, { ignoreExpiration: true }) as any;
    const issuedAt = payload.iat || 0;
    const refreshWindowSec = 30 * 24 * 60 * 60;
    if (Date.now() / 1000 - issuedAt > refreshWindowSec) {
      throw new Error('Refresh window expired.');
    }

    const userRes = await this.db.execute(
      `SELECT id, email, role, tenant_id, first_name, last_name, token_version, is_active FROM users WHERE id = $1 LIMIT 1`,
      [payload.sub]
    );
    const user = userRes?.rows?.[0] || userRes?.[0];
    if (!user || !user.is_active) {
      throw new Error('Session revoked or user inactive.');
    }

    if ((user.token_version ?? 0) !== (payload.tokenVersion ?? 0)) {
      throw new Error('Session has been revoked.');
    }

    const newPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      roles: [user.role],
      tokenVersion: user.token_version ?? 0,
    };

    const accessToken = jwt.sign(newPayload, this.jwtSecret, { expiresIn: JWT_ACCESS_TTL });
    return { accessToken, userId: String(user.id) };
  }
}
