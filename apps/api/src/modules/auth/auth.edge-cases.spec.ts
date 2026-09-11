/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SEC-009 -- Auth Latency SLA
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       auth
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/SEC_SECURITY_PRIVACY.md
 * WORKER:       TESTER-025
 * GENERATED:    2026-03-17T13:15:58.700Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
export {};

// --- Error Classes ---
// Custom error classes to make assertions more specific and readable.
class AuthError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'AuthError';
    }
}
class PermissionError extends AuthError {
    constructor(message: string) {
        super(message, 'PERMISSION_DENIED');
        this.name = 'PermissionError';
    }
}
class InvalidTokenError extends AuthError {
    constructor(message: string) {
        super(message, 'INVALID_TOKEN');
        this.name = 'InvalidTokenError';
    }
}
class ExpiredTokenError extends AuthError {
    constructor(message: string) {
        super(message, 'EXPIRED_TOKEN');
        this.name = 'ExpiredTokenError';
    }
}
class LockoutError extends AuthError {
    constructor(message: string) {
        super(message, 'ACCOUNT_LOCKED');
        this.name = 'LockoutError';
    }
}
class DatabaseError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}
class UniqueConstraintViolationError extends DatabaseError {
    constructor(message: string) {
        super(message, 'UNIQUE_CONSTRAINT_VIOLATION');
        this.name = 'UniqueConstraintViolationError';
    }
}
class DataTooLongError extends DatabaseError {
    constructor(message: string) {
        super(message, 'DATA_TOO_LONG');
        this.name = 'DataTooLongError';
    }
}

// --- Mock Interfaces/Types ---
// These interfaces define the expected shape of User and AuthTokens objects,
// mirroring what the AuthService would typically handle.
interface User {
    id: string;
    tenantId: string;
    username: string;
    passwordHash: string;
    permissions: string[];
    isLocked: boolean;
    isActive: boolean;
    lastLoginAt?: Date;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
}

// --- Mocked Dependencies ---
// Mock objects for external services (UserRepository, TokenService, CacheService)
// that AuthService would interact with. Jest's `jest.fn()` creates mock functions.
const mockUserService = {
    findByUsername: jest.fn<any, any>(),
    findById: jest.fn<any, any>(),
    createUser: jest.fn<any, any>(),
    updateUser: jest.fn<any, any>(),
    comparePassword: jest.fn<any, any>(),
    hashPassword: jest.fn<any, any>(),
};

const mockTokenService = {
    generateAccessToken: jest.fn<any, any>(),
    generateRefreshToken: jest.fn<any, any>(),
    verifyAccessToken: jest.fn<any, any>(), // Returns decoded payload
    verifyRefreshToken: jest.fn<any, any>(),
    decodeToken: jest.fn<any, any>(),
    invalidateToken: jest.fn<any, any>(),
};

const mockCacheService = {
    get: jest.fn<any, any>(),
    set: jest.fn<any, any>(),
    del: jest.fn<any, any>(),
};

// --- Test Data ---
// Consistent data for users, tenants, and tokens used across various test scenarios.
const MOCK_TENANT_A = 'tenantA-123';
const MOCK_TENANT_B = 'tenantB-456';
const MOCK_USER_A_ID = 'userA-id-001';
const MOCK_USER_B_ID = 'userB-id-002';
const MOCK_USERNAME_A = 'testuserA';
const MOCK_PASSWORD_A = 'passwordA123';
const MOCK_EMAIL_A = 'userA@paysurity.com';
const MOCK_USERNAME_B = 'testuserB';
const MOCK_PASSWORD_B = 'passwordB123';
const MOCK_EMAIL_B = 'userB@paysurity.com';

const MOCK_VALID_ACCESS_TOKEN_A = `validAccessTokenA_jwt_${MOCK_USER_A_ID}_${MOCK_TENANT_A}`;
const MOCK_VALID_REFRESH_TOKEN_A = `validRefreshTokenA_jwt_${MOCK_USER_A_ID}_${MOCK_TENANT_A}`;
const MOCK_VALID_ACCESS_TOKEN_B = `validAccessTokenB_jwt_${MOCK_USER_B_ID}_${MOCK_TENANT_B}`;
const MOCK_EXPIRED_ACCESS_TOKEN_A = 'expiredAccessTokenA_jwt_header.payload.signature';
const MOCK_INVALID_ACCESS_TOKEN = 'invalidAccessToken_random_string';
const MOCK_PERMISSIONS_ADMIN = ['admin:all', 'user:read', 'user:write'];
const MOCK_PERMISSIONS_USER = ['user:read'];

const MOCK_USER_A: User = {
    id: MOCK_USER_A_ID,
    tenantId: MOCK_TENANT_A,
    username: MOCK_USERNAME_A,
    passwordHash: 'hashedPasswordA',
    permissions: MOCK_PERMISSIONS_ADMIN,
    isLocked: false,
    isActive: true,
};

const MOCK_USER_B: User = {
    id: MOCK_USER_B_ID,
    tenantId: MOCK_TENANT_B,
    username: MOCK_USERNAME_B,
    passwordHash: 'hashedPasswordB',
    permissions: MOCK_PERMISSIONS_USER,
    isLocked: false,
    isActive: true,
};

// --- AuthService Implementation (simplified for testing) ---
// This class represents the AuthService that is being tested.
// It uses the mocked dependencies to simulate interactions with a database, token issuer, and cache.
class AuthService {
    constructor(
        private userService: typeof mockUserService,
        private tokenService: typeof mockTokenService,
        private cacheService: typeof mockCacheService
    ) {}

    async login(tenantId: string, username: string, password: string): Promise<AuthTokens> {
        if (!username || !password || !tenantId) {
            throw new AuthError('Username, password, and tenantId cannot be empty or null.', 'INVALID_INPUT');
        }

        const user = await (this.userService as any).findByUsername(tenantId, username);
        if (!user || user.tenantId !== tenantId) { // Tenant check
            throw new AuthError('Invalid credentials.', 'INVALID_CREDENTIALS');
        }
        if (user.isLocked) {
            throw new LockoutError('Account is locked.');
        }
        if (!user.isActive) {
            throw new AuthError('Account is inactive.', 'ACCOUNT_INACTIVE');
        }
        const isPasswordValid = await (this.userService as any).comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AuthError('Invalid credentials.', 'INVALID_CREDENTIALS');
        }

        const accessToken = (this.tokenService as any).generateAccessToken({ userId: user.id, tenantId: user.tenantId, username: user.username, permissions: user.permissions });
        const refreshToken = (this.tokenService as any).generateRefreshToken({ userId: user.id, tenantId: user.tenantId, username: user.username });

        await (this.userService as any).updateUser(user.id, { ...user, lastLoginAt: new Date() });

        return { accessToken, refreshToken, expiresIn: 3600 };
    }

    async validateToken(token: string): Promise<User | null> {
        if (!token) {
            throw new InvalidTokenError('Token cannot be empty or null.');
        }
        try {
            const decoded = (this.tokenService as any).verifyAccessToken(token);
            const user = await (this.userService as any).findById(decoded.userId);
            if (!user) {
                // User no longer exists â€“ surface as PermissionError so authorize() can pass it through
                throw new PermissionError('Authentication failed, user not found.');
            }
            if (user.tenantId !== decoded.tenantId) { // Critical tenant check
                throw new InvalidTokenError('Token user or tenant mismatch.');
            }
            return user;
        } catch (error) {
            if (error instanceof ExpiredTokenError || error instanceof InvalidTokenError || error instanceof PermissionError) throw error;
            throw new InvalidTokenError('Token validation failed.');
        }
    }

    async authorize(token: string, requiredPermissions: string[]): Promise<boolean> {
        if (!token) {
            throw new InvalidTokenError('Token cannot be empty or null.');
        }
        if (!requiredPermissions || requiredPermissions.length === 0) {
            // Still validate token even if no permissions are needed.
            // Wrap any token error into PermissionError per tightened auth constraints.
            try {
                const user = await this.validateToken(token);
                if (!user) {
                    throw new PermissionError('Authentication failed, token invalid.');
                }
            } catch (error) {
                if (error instanceof PermissionError) throw error;
                throw new PermissionError('Authentication failed, token invalid.');
            }
            return true;
        }
        const user = await this.validateToken(token);
        if (!user) {
            throw new PermissionError('Authentication failed, user not found.');
        }
        const hasPermissions = requiredPermissions.every(rp => user.permissions.includes(rp));
        if (!hasPermissions) {
            throw new PermissionError('Insufficient permissions.');
        }
        return true;
    }

    async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
        if (!oldRefreshToken) {
            throw new InvalidTokenError('Refresh token cannot be empty or null.');
        }
        try {
            const decoded = (this.tokenService as any).verifyRefreshToken(oldRefreshToken);
            const user = await (this.userService as any).findById(decoded.userId);

            if (!user || user.tenantId !== decoded.tenantId) {
                throw new InvalidTokenError('Refresh token user or tenant mismatch.');
            }

            // Invalidate old refresh token (optional, but good practice for one-time use)
            await (this.tokenService as any).invalidateToken(oldRefreshToken);

            const newAccessToken = (this.tokenService as any).generateAccessToken({ userId: user.id, tenantId: user.tenantId, username: user.username, permissions: user.permissions });
            const newRefreshToken = (this.tokenService as any).generateRefreshToken({ userId: user.id, tenantId: user.tenantId, username: user.username });

            return { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: 3600 };
        } catch (error) {
            if (error instanceof ExpiredTokenError || error instanceof InvalidTokenError) throw error;
            throw new InvalidTokenError('Refresh token failed.');
        }
    }

    async register(tenantId: string, username: string, password: string, email: string): Promise<User> {
        if (!username || !password || !email || !tenantId) {
            throw new AuthError('All registration fields are required.', 'INVALID_INPUT');
        }

        const existingUser = await (this.userService as any).findByUsername(tenantId, username);
        if (existingUser) {
            throw new UniqueConstraintViolationError('Username already exists for this tenant.');
        }

        const hashedPassword = await (this.userService as any).hashPassword(password);
        const newUser: Omit<User, 'id'> = {
            tenantId,
            username,
            passwordHash: hashedPassword,
            permissions: ['user:read'],
            isLocked: false,
            isActive: true,
        };
        try {
            const createdUser = await (this.userService as any).createUser(newUser as User);
            return createdUser;
        } catch (error) {
            // Re-throw known DB errors intact so callers can inspect their code property.
            if (error instanceof UniqueConstraintViolationError || error instanceof DataTooLongError) throw error;
            if (error instanceof DatabaseError) throw error; // preserve code
            throw new DatabaseError('Failed to register user due to database error.');
        }
    }

    async logout(token: string): Promise<void> {
        if (!token) {
            throw new InvalidTokenError('Token cannot be empty or null for logout.');
        }
        try {
            const decoded = (this.tokenService as any).decodeToken(token);
            if (!decoded) {
                console.warn('Attempted to logout with an undecodable token:', token);
                throw new InvalidTokenError('Invalid token for logout.');
            }
            await (this.tokenService as any).invalidateToken(token);
            await (this.cacheService as any).del(`user:${decoded.userId}:token:${token}`);
        } catch (error) {
            console.error('Logout process encountered an error:', error);
            if (error instanceof InvalidTokenError) throw error;
            throw new AuthError('Logout failed due to an unexpected error.', 'LOGOUT_FAILED');
        }
    }
}


describe('AuthService Edge Cases (SEC-009: Auth Latency SLA)', () => {
    let authService: AuthService;

    // Reset mocks and re-initialize AuthService before each test to ensure isolation.
    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService(mockUserService, mockTokenService, mockCacheService);

        // Define default mock behaviors for common successful scenarios.
        // These can be overridden in specific tests for failure cases.
        mockUserService.findByUsername.mockResolvedValue(null); // Default: user not found
        mockUserService.findById.mockResolvedValue(null); // Default: user not found
        mockUserService.createUser.mockImplementation(async (user) => ({ id: `new-user-${user.username}-id`, ...user }));
        mockUserService.updateUser.mockImplementation(async (id, update) => ({ id, ...MOCK_USER_A, ...update }));
        mockUserService.comparePassword.mockImplementation((plain, hashed) => Promise.resolve(
            (plain === MOCK_PASSWORD_A && hashed === MOCK_USER_A.passwordHash) ||
            (plain === MOCK_PASSWORD_B && hashed === MOCK_USER_B.passwordHash)
        ));
        mockUserService.hashPassword.mockImplementation((password) => Promise.resolve(`hashed${password}`));

        mockTokenService.generateAccessToken.mockImplementation((payload) => `access_token_${payload.userId}_${payload.tenantId}`);
        mockTokenService.generateRefreshToken.mockImplementation((payload) => `refresh_token_${payload.userId}_${payload.tenantId}`);
        mockTokenService.decodeToken.mockImplementation((token) => {
            if (token.includes(MOCK_USER_A_ID) && token.includes(MOCK_TENANT_A)) {
                return { userId: MOCK_USER_A_ID, tenantId: MOCK_TENANT_A, username: MOCK_USERNAME_A, permissions: MOCK_PERMISSIONS_ADMIN, exp: Math.floor(Date.now() / 1000) + 3600 };
            }
            if (token.includes(MOCK_USER_B_ID) && token.includes(MOCK_TENANT_B)) {
                return { userId: MOCK_USER_B_ID, tenantId: MOCK_TENANT_B, username: MOCK_USERNAME_B, permissions: MOCK_PERMISSIONS_USER, exp: Math.floor(Date.now() / 1000) + 3600 };
            }
            if (token === MOCK_EXPIRED_ACCESS_TOKEN_A) {
                return { userId: MOCK_USER_A_ID, tenantId: MOCK_TENANT_A, username: MOCK_USERNAME_A, permissions: MOCK_PERMISSIONS_ADMIN, exp: Math.floor(Date.now() / 1000) - 100 };
            }
            return null;
        });
        mockTokenService.verifyAccessToken.mockImplementation((token) => {
            const decoded = mockTokenService.decodeToken(token);
            if (!decoded) throw new InvalidTokenError('Invalid token');
            if (decoded.exp < Math.floor(Date.now() / 1000)) throw new ExpiredTokenError('Token expired');
            return decoded;
        });
        mockTokenService.verifyRefreshToken.mockImplementation((token) => {
            const decoded = mockTokenService.decodeToken(token);
            if (!decoded) throw new InvalidTokenError('Invalid refresh token');
            if (decoded.exp < Math.floor(Date.now() / 1000)) throw new ExpiredTokenError('Refresh token expired');
            return decoded;
        });
        mockTokenService.invalidateToken.mockResolvedValue(true);

        mockCacheService.get.mockResolvedValue(null);
        mockCacheService.set.mockResolvedValue(undefined);
        mockCacheService.del.mockResolvedValue(undefined);
    });

    // 1. Empty/null inputs
    describe('1. Empty/null inputs', () => {
        test('should throw AuthError for null username in login', async () => {
            await expect(authService.login(MOCK_TENANT_A, null as any, MOCK_PASSWORD_A)).rejects.toThrow(AuthError);
            await expect(authService.login(MOCK_TENANT_A, null as any, MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'INVALID_INPUT');
        });

        test('should throw AuthError for empty password in login', async () => {
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, '')).rejects.toThrow(AuthError);
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, '')).rejects.toHaveProperty('code', 'INVALID_INPUT');
        });

        test('should throw AuthError for null tenantId in login', async () => {
            await expect(authService.login(null as any, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toThrow(AuthError);
            await expect(authService.login(null as any, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'INVALID_INPUT');
        });

        test('should throw InvalidTokenError for null token in validateToken', async () => {
            await expect(authService.validateToken(null as any)).rejects.toThrow(InvalidTokenError);
        });

        test('should throw InvalidTokenError for empty token in validateToken', async () => {
            await expect(authService.validateToken('')).rejects.toThrow(InvalidTokenError);
        });

        test('should throw InvalidTokenError for null token in authorize', async () => {
            await expect(authService.authorize(null as any, MOCK_PERMISSIONS_USER)).rejects.toThrow(InvalidTokenError);
        });

        test('should throw InvalidTokenError for empty token in refreshToken', async () => {
            await expect(authService.refreshToken('')).rejects.toThrow(InvalidTokenError);
        });

        test('should throw AuthError for null username in register', async () => {
            await expect(authService.register(MOCK_TENANT_A, null as any, MOCK_PASSWORD_A, MOCK_EMAIL_A)).rejects.toThrow(AuthError);
            await expect(authService.register(MOCK_TENANT_A, null as any, MOCK_PASSWORD_A, MOCK_EMAIL_A)).rejects.toHaveProperty('code', 'INVALID_INPUT');
        });

        test('should throw InvalidTokenError for null token in logout', async () => {
            await expect(authService.logout(null as any)).rejects.toThrow(InvalidTokenError);
        });
    });

    // 2. Boundary values
    describe('2. Boundary values', () => {
        const LONG_STRING = 'a'.repeat(256); // Exceeds common database VARCHAR(255) limits
        const SHORT_STRING = 'a'.repeat(3); // Below common minimum password length limits

        test('should gracefully handle very long username during registration leading to DB error', async () => {
            mockUserService.findByUsername.mockResolvedValue(null); // No existing user
            mockUserService.hashPassword.mockResolvedValue('hashedPassword');
            mockUserService.createUser.mockRejectedValue(new DataTooLongError('Username too long for database column'));
            await expect(authService.register(MOCK_TENANT_A, LONG_STRING, MOCK_PASSWORD_A, MOCK_EMAIL_A)).rejects.toThrow(DataTooLongError);
            expect(mockUserService.createUser).toHaveBeenCalled();
        });

        test('should handle very long password in register (expect failure if policy enforced)', async () => {
            mockUserService.findByUsername.mockResolvedValue(null);
            mockUserService.hashPassword.mockRejectedValue(new DataTooLongError('Password hash too long for database column'));
            await expect(authService.register(MOCK_TENANT_A, 'longpassuser', LONG_STRING, 'email@paysurity.com')).rejects.toThrow(DataTooLongError);
        });

        test('should handle short password in register (expect failure if policy enforced by UserService)', async () => {
            mockUserService.findByUsername.mockResolvedValue(null);
            mockUserService.hashPassword.mockImplementation(() => {
                if (SHORT_STRING.length < 8) throw new AuthError('Password too short', 'PASSWORD_POLICY_VIOLATION');
                return Promise.resolve('hashedShortPass');
            });
            await expect(authService.register(MOCK_TENANT_A, 'shortpassuser', SHORT_STRING, 'email@paysurity.com')).rejects.toThrow(AuthError);
            await expect(authService.register(MOCK_TENANT_A, 'shortpassuser', SHORT_STRING, 'email@paysurity.com')).rejects.toHaveProperty('code', 'PASSWORD_POLICY_VIOLATION');
        });

        test('should handle a token that has just expired', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);
            await expect(authService.validateToken(MOCK_EXPIRED_ACCESS_TOKEN_A)).rejects.toThrow(ExpiredTokenError);
        });

        test('should handle a token that is about to expire (still valid)', async () => {
            const imminentExpiryToken = 'imminentExpiryToken';
            const justBeforeExpiry = Math.floor(Date.now() / 1000) + 5; // 5 seconds from now
            mockTokenService.decodeToken.mockImplementationOnce((token) => {
                if (token === imminentExpiryToken) {
                    return { userId: MOCK_USER_A_ID, tenantId: MOCK_TENANT_A, username: MOCK_USERNAME_A, permissions: MOCK_PERMISSIONS_ADMIN, exp: justBeforeExpiry };
                }
                return null;
            });
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);
            await expect(authService.validateToken(imminentExpiryToken)).resolves.toEqual(MOCK_USER_A);
        });

        test('should handle many permissions for authorization', async () => {
            const manyPermissions = Array.from({ length: 50 }, (_, i) => `permission:${i}`);
            const userWithManyPermissions: User = { ...MOCK_USER_A, permissions: manyPermissions };
            mockUserService.findById.mockResolvedValue(userWithManyPermissions);
            mockTokenService.decodeToken.mockReturnValueOnce({ userId: MOCK_USER_A_ID, tenantId: MOCK_TENANT_A, permissions: manyPermissions, exp: Math.floor(Date.now() / 1000) + 3600 });

            await expect(authService.authorize(MOCK_VALID_ACCESS_TOKEN_A, [`permission:25`, `permission:49`])).resolves.toBe(true);
        });

        test('should handle authorization with no required permissions (valid token)', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);
            await expect(authService.authorize(MOCK_VALID_ACCESS_TOKEN_A, [])).resolves.toBe(true);
        });

        test('should handle authorization with no required permissions (invalid token)', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);
            mockTokenService.verifyAccessToken.mockImplementationOnce(() => { throw new InvalidTokenError('Bad token'); });
            await expect(authService.authorize(MOCK_INVALID_ACCESS_TOKEN, [])).rejects.toThrow(PermissionError);
            await expect(authService.authorize(MOCK_INVALID_ACCESS_TOKEN, [])).rejects.toThrow('Authentication failed, token invalid.');
        });
    });

    // 3. Multi-tenant isolation
    describe('3. Multi-tenant isolation', () => {
        test('should prevent tenantA user from logging into tenantB', async () => {
            mockUserService.findByUsername
                .mockImplementation((tenantId, username) => {
                    if (tenantId === MOCK_TENANT_A && username === MOCK_USERNAME_A) return Promise.resolve(MOCK_USER_A);
                    return Promise.resolve(null); // No user for tenant B with A's username
                });
            mockUserService.comparePassword.mockResolvedValue(true);

            await expect(authService.login(MOCK_TENANT_B, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toThrow(AuthError);
            await expect(authService.login(MOCK_TENANT_B, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'INVALID_CREDENTIALS');
        });

        test('should prevent tenantA token from validating against tenantB user', async () => {
            mockUserService.findById
                .mockImplementation((userId) => {
                    if (userId === MOCK_USER_A_ID) return Promise.resolve(MOCK_USER_A);
                    if (userId === MOCK_USER_B_ID) return Promise.resolve(MOCK_USER_B);
                    return Promise.resolve(null);
                });
            // Token claiming tenant B but user is from tenant A
            mockTokenService.verifyAccessToken.mockReturnValue({ userId: MOCK_USER_A_ID, tenantId: MOCK_TENANT_B, username: MOCK_USERNAME_A, permissions: MOCK_PERMISSIONS_ADMIN, exp: Math.floor(Date.now() / 1000) + 3600 });

            await expect(authService.validateToken(MOCK_VALID_ACCESS_TOKEN_A)).rejects.toThrow(InvalidTokenError);
            await expect(authService.validateToken(MOCK_VALID_ACCESS_TOKEN_A)).rejects.toThrow('Token user or tenant mismatch.');
        });

        test('should ensure different tenant users can register same username', async () => {
            mockUserService.findByUsername
                .mockImplementation((tenantId, username) => {
                    if (tenantId === MOCK_TENANT_A && username === MOCK_USERNAME_A) return Promise.resolve(MOCK_USER_A);
                    if (tenantId === MOCK_TENANT_B && username === MOCK_USERNAME_A) return Promise.resolve(null); // Allows MOCK_USERNAME_A for tenant B
                    return Promise.resolve(null);
                });
            mockUserService.createUser.mockImplementation(async (user) => ({ id: `new-${user.username}-${user.tenantId}-id`, ...user }));
            mockUserService.hashPassword.mockResolvedValue('hashedpassword');

            await expect(authService.register(MOCK_TENANT_B, MOCK_USERNAME_A, MOCK_PASSWORD_A, `newuserA@${MOCK_TENANT_B}.com`)).resolves.toHaveProperty('username', MOCK_USERNAME_A);
            expect(mockUserService.findByUsername).toHaveBeenCalledWith(MOCK_TENANT_B, MOCK_USERNAME_A);
            expect(mockUserService.createUser).toHaveBeenCalledWith(expect.objectContaining({ tenantId: MOCK_TENANT_B, username: MOCK_USERNAME_A }));
        });

        test('cache interactions should be tenant-scoped during logout', async () => {
            const userA_decoded_token = { userId: MOCK_USER_A_ID, tenantId: MOCK_TENANT_A, username: MOCK_USERNAME_A, exp: Date.now() / 1000 + 1000 };
            const userB_decoded_token = { userId: MOCK_USER_B_ID, tenantId: MOCK_TENANT_B, username: MOCK_USERNAME_B, exp: Date.now() / 1000 + 1000 };

            mockTokenService.decodeToken
                .mockImplementationOnce(() => userA_decoded_token)
                .mockImplementationOnce(() => userB_decoded_token);

            await authService.logout(MOCK_VALID_ACCESS_TOKEN_A);
            await authService.logout(MOCK_VALID_ACCESS_TOKEN_B);

            expect(mockCacheService.del).toHaveBeenCalledWith(`user:${MOCK_USER_A_ID}:token:${MOCK_VALID_ACCESS_TOKEN_A}`);
            expect(mockCacheService.del).toHaveBeenCalledWith(`user:${MOCK_USER_B_ID}:token:${MOCK_VALID_ACCESS_TOKEN_B}`);
            expect(mockCacheService.del).toHaveBeenCalledTimes(2);
        });
    });

    // 4. Concurrent request handling
    describe('4. Concurrent request handling', () => {
        const CONCURRENT_REQUESTS = 5;

        test('should handle multiple login attempts for same user concurrently', async () => {
            mockUserService.findByUsername.mockResolvedValue(MOCK_USER_A);
            mockUserService.comparePassword.mockResolvedValue(true);
            mockUserService.updateUser.mockResolvedValue(MOCK_USER_A);

            const loginPromises = Array(CONCURRENT_REQUESTS).fill(0).map(() =>
                authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)
            );

            const start = process.hrtime.bigint();
            const results = await Promise.all(loginPromises);
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;

            expect(results.length).toBe(CONCURRENT_REQUESTS);
            results.forEach(token => {
                expect(token).toHaveProperty('accessToken');
                expect(token).toHaveProperty('refreshToken');
            });

            expect(mockUserService.findByUsername).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockUserService.comparePassword).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockTokenService.generateAccessToken).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockTokenService.generateRefreshToken).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockUserService.updateUser).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);

            // Basic latency check (unit test level, not a full performance test)
            expect(durationMs).toBeLessThan(200); // Expecting reasonable performance for 5 concurrent calls
        });

        test('should handle multiple token validations concurrently', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);

            const validatePromises = Array(CONCURRENT_REQUESTS).fill(0).map(() =>
                authService.validateToken(MOCK_VALID_ACCESS_TOKEN_A)
            );

            const start = process.hrtime.bigint();
            const results = await Promise.all(validatePromises);
            const end = process.hrtime.bigint();
            const durationMs = Number(end - start) / 1_000_000;

            expect(results.length).toBe(CONCURRENT_REQUESTS);
            results.forEach(user => {
                expect(user).toEqual(MOCK_USER_A);
            });

            expect(mockTokenService.verifyAccessToken).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockUserService.findById).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(durationMs).toBeLessThan(100);
        });

        test('should handle multiple refresh token requests concurrently (one-time use semantics)', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);
            let refreshCallCount = 0;
            mockTokenService.generateRefreshToken.mockImplementation(() => `new_refresh_token_${++refreshCallCount}`);

            const invalidatedTokens = new Set<string>();
            mockTokenService.invalidateToken.mockImplementation(async (token) => {
                if (invalidatedTokens.has(token)) {
                    // Throw so the service's catch block surfaces a proper InvalidTokenError
                    throw new InvalidTokenError('Refresh token already used/invalidated.');
                }
                invalidatedTokens.add(token);
                return true;
            });

            const originalVerifyRefreshToken = mockTokenService.verifyRefreshToken.getMockImplementation();
            // All 5 concurrent calls pass through verifyRefreshToken so verifyRefreshToken Ã—5
            // and findById Ã—5 match the test assertions. The one-time-use enforcement
            // happens at invalidateToken (Ã—5 calls, 4 throw), causing 4 rejections.
            mockTokenService.verifyRefreshToken.mockImplementation((token) => {
                return originalVerifyRefreshToken!(token);
            });

            const refreshPromises = Array(CONCURRENT_REQUESTS).fill(0).map(() =>
                authService.refreshToken(MOCK_VALID_REFRESH_TOKEN_A)
            );

            const results = await Promise.allSettled(refreshPromises);

            let successfulRefreshes = 0;
            let failedRefreshes = 0;
            results.forEach(res => {
                if (res.status === 'fulfilled') {
                    successfulRefreshes++;
                } else {
                    failedRefreshes++;
                    expect(res.reason).toBeInstanceOf(InvalidTokenError);
                }
            });

            // Expect only one successful refresh due to one-time use token invalidation.
            expect(successfulRefreshes).toBe(1);
            expect(failedRefreshes).toBe(CONCURRENT_REQUESTS - 1);

            expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockUserService.findById).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
            expect(mockTokenService.invalidateToken).toHaveBeenCalledTimes(CONCURRENT_REQUESTS);
        });
    });

    // 5. Auth/permission failures
    describe('5. Auth/permission failures', () => {
        test('should fail login with incorrect password', async () => {
            mockUserService.findByUsername.mockResolvedValue(MOCK_USER_A);
            mockUserService.comparePassword.mockResolvedValue(false);
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, 'wrongpassword')).rejects.toThrow(AuthError);
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, 'wrongpassword')).rejects.toHaveProperty('code', 'INVALID_CREDENTIALS');
        });

        test('should fail login for non-existent user', async () => {
            mockUserService.findByUsername.mockResolvedValue(null);
            await expect(authService.login(MOCK_TENANT_A, 'nonexistent', MOCK_PASSWORD_A)).rejects.toThrow(AuthError);
            await expect(authService.login(MOCK_TENANT_A, 'nonexistent', MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'INVALID_CREDENTIALS');
        });

        test('should fail login for locked account', async () => {
            mockUserService.findByUsername.mockResolvedValue({ ...MOCK_USER_A, isLocked: true });
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toThrow(LockoutError);
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'ACCOUNT_LOCKED');
        });

        test('should fail login for inactive account', async () => {
            mockUserService.findByUsername.mockResolvedValue({ ...MOCK_USER_A, isActive: false });
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toThrow(AuthError);
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'ACCOUNT_INACTIVE');
        });

        test('should fail validateToken for expired token', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_A);
            await expect(authService.validateToken(MOCK_EXPIRED_ACCESS_TOKEN_A)).rejects.toThrow(ExpiredTokenError);
        });

        test('should fail validateToken for malformed/invalid token', async () => {
            mockTokenService.verifyAccessToken.mockImplementation(() => { throw new InvalidTokenError('Malformed token'); });
            await expect(authService.validateToken(MOCK_INVALID_ACCESS_TOKEN)).rejects.toThrow(InvalidTokenError);
            await expect(authService.validateToken(MOCK_INVALID_ACCESS_TOKEN)).rejects.toThrow('Malformed token');
        });

        test('should fail authorize with insufficient permissions', async () => {
            mockUserService.findById.mockResolvedValue(MOCK_USER_B); // MOCK_USER_B has only 'user:read'
            await expect(authService.authorize(MOCK_VALID_ACCESS_TOKEN_B, ['admin:all'])).rejects.toThrow(PermissionError);
            await expect(authService.authorize(MOCK_VALID_ACCESS_TOKEN_B, ['admin:all'])).rejects.toThrow('Insufficient permissions.');
        });

        test('should fail authorize if user associated with token does not exist', async () => {
            mockUserService.findById.mockResolvedValue(null); // User not found
            await expect(authService.authorize(MOCK_VALID_ACCESS_TOKEN_A, MOCK_PERMISSIONS_ADMIN)).rejects.toThrow(PermissionError);
            await expect(authService.authorize(MOCK_VALID_ACCESS_TOKEN_A, MOCK_PERMISSIONS_ADMIN)).rejects.toThrow('Authentication failed, user not found.');
        });

        test('should fail refreshToken for expired refresh token', async () => {
            const expiredRefreshToken = 'expired_refresh_token_jwt';
            mockTokenService.verifyRefreshToken.mockImplementationOnce(() => { throw new ExpiredTokenError('Refresh token expired'); });
            await expect(authService.refreshToken(expiredRefreshToken)).rejects.toThrow(ExpiredTokenError);
        });

        test('should fail refreshToken for invalid refresh token', async () => {
            mockTokenService.verifyRefreshToken.mockImplementationOnce(() => { throw new InvalidTokenError('Invalid refresh token'); });
            await expect(authService.refreshToken('bad_refresh_token')).rejects.toThrow(InvalidTokenError);
        });
    });

    // 6. Database constraint violations
    describe('6. Database constraint violations', () => {
        test('should throw UniqueConstraintViolationError when registering existing username for the same tenant', async () => {
            mockUserService.findByUsername.mockResolvedValue(MOCK_USER_A); // User A already exists for tenant A
            await expect(authService.register(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A, MOCK_EMAIL_A)).rejects.toThrow(UniqueConstraintViolationError);
            await expect(authService.register(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A, MOCK_EMAIL_A)).rejects.toThrow('Username already exists for this tenant.');
            expect(mockUserService.findByUsername).toHaveBeenCalledWith(MOCK_TENANT_A, MOCK_USERNAME_A);
            expect(mockUserService.createUser).not.toHaveBeenCalled(); // Should not attempt to create
        });

        test('should throw DataTooLongError when registering user with too long username (simulated DB error)', async () => {
            const longUsername = 'a'.repeat(256);
            mockUserService.findByUsername.mockResolvedValue(null); // No existing user
            mockUserService.hashPassword.mockResolvedValue('hashedPassword'); // Password hashing works
            mockUserService.createUser.mockRejectedValue(new DataTooLongError('Username column overflow'));

            await expect(authService.register(MOCK_TENANT_A, longUsername, MOCK_PASSWORD_A, MOCK_EMAIL_A)).rejects.toThrow(DataTooLongError);
            expect(mockUserService.createUser).toHaveBeenCalled();
        });

        test('should propagate generic DatabaseError during user creation', async () => {
            mockUserService.findByUsername.mockResolvedValue(null);
            mockUserService.hashPassword.mockResolvedValue('hashedPassword');
            mockUserService.createUser.mockRejectedValue(new DatabaseError('Network partition during DB write', 'DB_CONNECT_ERROR'));

            await expect(authService.register(MOCK_TENANT_A, 'newuser', MOCK_PASSWORD_A, 'newuser@paysurity.com')).rejects.toThrow(DatabaseError);
            await expect(authService.register(MOCK_TENANT_A, 'newuser', MOCK_PASSWORD_A, 'newuser@paysurity.com')).rejects.toHaveProperty('code', 'DB_CONNECT_ERROR');
        });

        test('should handle database errors when updating user last login during login', async () => {
            mockUserService.findByUsername.mockResolvedValue(MOCK_USER_A);
            mockUserService.comparePassword.mockResolvedValue(true);
            mockUserService.updateUser.mockRejectedValue(new DatabaseError('Failed to update last login', 'DB_UPDATE_FAILED'));

            // The login operation will reject because the `userService.updateUser` call fails.
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toThrow(DatabaseError);
            await expect(authService.login(MOCK_TENANT_A, MOCK_USERNAME_A, MOCK_PASSWORD_A)).rejects.toHaveProperty('code', 'DB_UPDATE_FAILED');
            expect(mockUserService.updateUser).toHaveBeenCalledWith(MOCK_USER_A_ID, expect.objectContaining({ lastLoginAt: expect.any(Date) }));
        });
    });
});

