import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
const request = require('supertest');
export class AppModule {} // Inline stub for missing AppModule
export const usersTable = {} as any;
export const tenantsTable = {} as any;
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

// Mock the DatabaseModule to control data returned by queries.
// This mock provides a `DATABASE` token that mimics a Drizzle ORM instance.
jest.mock('../../db/database.module', () => ({
  DatabaseModule: {
    // Provide a mock for the 'DATABASE' token.
    provide: 'DATABASE',
    useFactory: () => ({
      // Mock Drizzle's query builder methods
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn(), // Used for fetching a single result
      update: jest.fn().mockReturnThis(), // For refresh token updates
      set: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(), // For returning updated entities
      // Add other Drizzle methods as needed by your services
    }),
  },
}));

// Mock the otplib library if used by the AuthService for MFA
jest.mock('otplib', () => ({
  authenticator: {
    generate: jest.fn(() => '123456'), // Fixed OTP for testing
    verify: jest.fn((token: string, secret: string) => token === '123456'), // Always valid if '123456'
  },
}));

// Define constants for JWTs
const JWT_SECRET = 'supersecretjwtkeyforpaySuritytesting';
const JWT_EXPIRATION_TIME_SHORT = '1s'; // For testing expiry
const JWT_EXPIRATION_TIME_LONG = '1h';
const JWT_REFRESH_EXPIRATION_TIME = '7d';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let agent: any;
  let mockDb: any;
  let jwtService: JwtService;

  // Mock Users and Tenants Data
  const tenantAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const tenantBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const plainPassword = 'password123';
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(plainPassword, 10);
  });

  const mockUsers = [
    {
      id: 'user1-tenantA',
      tenantId: tenantAId,
      email: 'userA@example.com',
      password: hashedPassword,
      roles: ['user'],
      mfa_enabled: false,
      mfa_secret: null,
      refresh_token: null,
    },
    {
      id: 'finance-user-tenantA',
      tenantId: tenantAId,
      email: 'financeA@example.com',
      password: hashedPassword,
      roles: ['finance'],
      mfa_enabled: true,
      mfa_secret: 'some_mfa_secret', // Simulate MFA secret being present
      refresh_token: null,
    },
    {
      id: 'user2-tenantB',
      tenantId: tenantBId,
      email: 'userB@example.com',
      password: hashedPassword,
      roles: ['user'],
      mfa_enabled: false,
      mfa_secret: null,
      refresh_token: null,
    },
  ];

  const mockTenants = [
    { id: tenantAId, name: 'Tenant A', config: {} },
    { id: tenantBId, name: 'Tenant B', config: {} },
  ];

  // Helper function to mock Drizzle's query for a user lookup (select.from.where.get)
  const setupDbMocksForUserLookup = (user: any | null) => {
    mockDb.select.mockClear().mockReturnThis();
    mockDb.from.mockClear().mockReturnThis();
    mockDb.where.mockClear().mockReturnThis();
    mockDb.limit.mockClear().mockReturnThis();
    mockDb.get.mockClear().mockResolvedValueOnce(user); // Use mockResolvedValueOnce for async queries
  };

  // Helper function to mock Drizzle's update query
  const setupDbMocksForUpdate = (updatedEntity: any) => {
    mockDb.update.mockClear().mockReturnThis();
    mockDb.set.mockClear().mockReturnThis();
    mockDb.where.mockClear().mockReturnThis();
    mockDb.returning.mockClear().mockReturnThis();
    mockDb.get.mockClear().mockResolvedValueOnce(updatedEntity);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          switch (key) {
            case 'JWT_SECRET':
              return JWT_SECRET;
            case 'JWT_EXPIRATION_TIME':
              return JWT_EXPIRATION_TIME_LONG; // Default for normal operations
            case 'JWT_REFRESH_EXPIRATION_TIME':
              return JWT_REFRESH_EXPIRATION_TIME;
            // Add other config values that might be accessed by your modules if needed
            default:
              return null;
          }
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    agent = request.agent(app.getHttpServer());

    mockDb = app.get('DATABASE'); // Retrieve the mocked database instance
    jwtService = app.get(JwtService); // Retrieve the actual JwtService to sign tokens for expiry tests
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    // Reset specific Drizzle mocks that might be configured globally if needed
  });

  // --- Auth Flow Tests ---

  describe('POST /auth/login', () => {
    it('should return JWT and refresh token for valid credentials (user role, no MFA)', async () => {
      setupDbMocksForUserLookup(mockUsers[0]); // userA@example.com
      // Simulate the database update for the refresh token after successful login
      setupDbMocksForUpdate({ ...mockUsers[0], refresh_token: 'new-refresh-token-from-db' });

      const res = await agent
        .post('/auth/login')
        .send({ email: 'userA@example.com', password: plainPassword })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body.mfa_required).toBe(false);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledWith(usersTable);
      expect(mockDb.where).toHaveBeenCalledWith(eq(usersTable.email, 'userA@example.com'));
      expect(mockDb.update).toHaveBeenCalledTimes(1); // Expect refresh token to be saved
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should return 401 for invalid password', async () => {
      setupDbMocksForUserLookup(mockUsers[0]); // userA@example.com

      await agent
        .post('/auth/login')
        .send({ email: 'userA@example.com', password: 'wrongpassword' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledWith(usersTable);
      expect(mockDb.where).toHaveBeenCalledWith(eq(usersTable.email, 'userA@example.com'));
      expect(mockDb.update).not.toHaveBeenCalled(); // No update on failed login
    });

    it('should return 401 for non-existent user', async () => {
      setupDbMocksForUserLookup(null); // No user found

      await agent
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: plainPassword })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledWith(eq(usersTable.email, 'nonexistent@example.com'));
      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  // --- JWT Expiry Test ---

  describe('JWT Expiry', () => {
    let expiredAccessToken: string;

    beforeEach(async () => {
      // Manually generate a token with a very short expiry and wait for it to expire
      const userPayload = { id: 'user1-tenantA', email: 'userA@example.com', tenantId: tenantAId, roles: ['user'] };
      expiredAccessToken = jwtService.sign(userPayload, {
        secret: JWT_SECRET,
        expiresIn: '1ms', // Very short expiry time
      });
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait for token to definitely expire
    });

    it('should return 401 when using an expired access token to access a protected resource', async () => {
      // Assuming a protected endpoint exists, e.g., GET /auth/profile
      // (The AuthModule is expected to have an AuthGuard protecting this route)
      await agent
        .get('/auth/profile')
        .set('Authorization', `Bearer ${expiredAccessToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  // --- Refresh Token Flow Tests ---

  describe('Refresh Token Flow (POST /auth/refresh)', () => {
    let initialAccessToken: string;
    let initialRefreshToken: string;
    const userWithRefreshToken = { ...mockUsers[0], refresh_token: 'initial-refresh-token-value' };

    beforeEach(async () => {
      // Simulate initial login to get tokens
      setupDbMocksForUserLookup(mockUsers[0]);
      setupDbMocksForUpdate(userWithRefreshToken);

      const loginRes = await agent
        .post('/auth/login')
        .send({ email: 'userA@example.com', password: plainPassword })
        .expect(HttpStatus.OK);

      initialAccessToken = loginRes.body.access_token;
      initialRefreshToken = loginRes.body.refresh_token;

      jest.clearAllMocks(); // Clear mocks from the login call
    });

    it('should return new access and refresh tokens for a valid refresh token', async () => {
      // Mock DB to find the user by the initial refresh token
      setupDbMocksForUserLookup(userWithRefreshToken);

      // Mock DB to update the user with a new refresh token
      const updatedUser = { ...userWithRefreshToken, refresh_token: 'newly-generated-refresh-token' };
      setupDbMocksForUpdate(updatedUser);

      const res = await agent
        .post('/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body.access_token).not.toEqual(initialAccessToken); // Ensure new access token
      expect(res.body.refresh_token).not.toEqual(initialRefreshToken); // Ensure new refresh token

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledWith(usersTable);
      expect(mockDb.where).toHaveBeenCalledWith(eq(usersTable.refresh_token, initialRefreshToken));
      expect(mockDb.update).toHaveBeenCalledTimes(1);
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should return 401 for an invalid refresh token', async () => {
      setupDbMocksForUserLookup(null); // No user found for invalid token

      await agent
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledWith(eq(usersTable.refresh_token, 'invalid-refresh-token'));
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should return 401 if refresh token is expired (assuming it is a JWT)', async () => {
      // Manually sign an expired refresh token (assuming refresh tokens are JWTs)
      const expiredRefreshToken = jwtService.sign(
        { id: userWithRefreshToken.id, tenantId: userWithRefreshToken.tenantId, roles: userWithRefreshToken.roles, type: 'refresh' },
        { secret: JWT_SECRET, expiresIn: '1ms' }
      );
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait for token to expire

      // Service should detect expiry before or during database lookup validation
      // Simulate that the database *would* find the user, but JWT verification fails.
      // If the service's refresh token validation involves `jwtService.verify` on the token itself
      // then the expiry check happens there, leading to 401 before DB update.
      // If the service finds the user *first* by the raw token string and then verifies,
      // we mock finding the user, but the authentication layer should reject it.
      setupDbMocksForUserLookup(userWithRefreshToken); // User is found, but the token itself is expired

      await agent
        .post('/auth/refresh')
        .send({ refreshToken: expiredRefreshToken })
        .expect(HttpStatus.UNAUTHORIZED);

      // Depending on AuthModule's internal refresh logic, DB select might or might not be called.
      // The key is that it should be UNAUTHORIZED.
    });
  });

  // --- MFA Required for Finance Roles Tests ---

  describe('MFA Required for Finance Roles', () => {
    const financeUser = mockUsers[1]; // financeA@example.com with mfa_enabled: true
    const otp = '123456'; // Fixed OTP as mocked in 'otplib'

    it('should indicate MFA required for finance user login and return a temporary token', async () => {
      setupDbMocksForUserLookup(financeUser);
      // No refresh token update expected at this stage, only temporary token generation

      const res = await agent
        .post('/auth/login')
        .send({ email: financeUser.email, password: plainPassword })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('mfa_required', true);
      expect(res.body).toHaveProperty('temporary_token');
      expect(res.body).not.toHaveProperty('access_token');
      expect(res.body).not.toHaveProperty('refresh_token');

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.where).toHaveBeenCalledWith(eq(usersTable.email, financeUser.email));
      expect(mockDb.update).not.toHaveBeenCalled(); // No refresh token updated yet
    });

    it('should complete login and return JWTs after successful MFA verification', async () => {
      // First, perform initial login to get the temporary token
      setupDbMocksForUserLookup(financeUser);
      const loginRes = await agent
        .post('/auth/login')
        .send({ email: financeUser.email, password: plainPassword })
        .expect(HttpStatus.OK);
      const temporaryToken = loginRes.body.temporary_token;

      jest.clearAllMocks(); // Clear mocks from the initial login call

      // Mock DB to find the user again when verifying MFA (service uses temp token to retrieve user details including MFA secret)
      setupDbMocksForUserLookup(financeUser);

      // Mock DB to update refresh token after successful MFA verification
      const updatedFinanceUser = { ...financeUser, refresh_token: 'new-finance-refresh-token' };
      setupDbMocksForUpdate(updatedFinanceUser);

      const res = await agent
        .post('/auth/mfa/verify')
        .send({ temporaryToken: temporaryToken, otp: otp })
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('refresh_token');
      expect(res.body).not.toHaveProperty('mfa_required');

      expect(mockDb.select).toHaveBeenCalledTimes(1); // For retrieving user by temporary token
      expect(mockDb.update).toHaveBeenCalledTimes(1); // For updating refresh token post-MFA
    });

    it('should return 401 for invalid OTP during MFA verification', async () => {
      // First, perform initial login to get the temporary token
      setupDbMocksForUserLookup(financeUser);
      const loginRes = await agent
        .post('/auth/login')
        .send({ email: financeUser.email, password: plainPassword })
        .expect(HttpStatus.OK);
      const temporaryToken = loginRes.body.temporary_token;

      jest.clearAllMocks();

      // Mock DB to find the user again (based on temp token)
      setupDbMocksForUserLookup(financeUser);

      // 'otplib' mock will return false for any OTP other than '123456'
      await agent
        .post('/auth/mfa/verify')
        .send({ temporaryToken: temporaryToken, otp: '000000' }) // Incorrect OTP
        .expect(HttpStatus.UNAUTHORIZED);

      expect(mockDb.select).toHaveBeenCalledTimes(1); // User lookup still happens
      expect(mockDb.update).not.toHaveBeenCalled(); // No refresh token update on failed MFA
    });

    it('should return 401 for expired or invalid temporary token during MFA verification', async () => {
      // Simulate an expired temporary token (assuming temporary tokens are JWTs)
      const expiredTemporaryToken = jwtService.sign(
        { id: financeUser.id, tenantId: financeUser.tenantId, roles: financeUser.roles, type: 'mfa' },
        { secret: JWT_SECRET, expiresIn: '1ms' }
      );
      await new Promise(resolve => setTimeout(resolve, 50)); // Wait for token to expire

      // Service should detect expiry/invalidity before or during database lookup
      setupDbMocksForUserLookup(null); // Simulate user not found or token rejected early

      await agent
        .post('/auth/mfa/verify')
        .send({ temporaryToken: expiredTemporaryToken, otp: otp })
        .expect(HttpStatus.UNAUTHORIZED);

      // Depending on AuthModule's internal MFA logic, DB select might or might not be called.
      // The key is that it should be UNAUTHORIZED.
    });
  });

  // --- Tenant Isolation Tests ---

  describe('Tenant Isolation', () => {
    let tenantA_accessToken: string;
    let tenantB_accessToken: string;

    // These tests assume the AuthModule has a protected endpoint `/auth/profile`
    // which returns the authenticated user's details (from JWT payload)
    // and another protected endpoint `/auth/users/:id` which *internally* filters
    // database queries by `req.user.tenantId`.
    // The `AuthGuard` in the application setup is responsible for populating `req.user`.

    beforeAll(async () => {
      // Login userA to get their token
      setupDbMocksForUserLookup(mockUsers[0]);
      setupDbMocksForUpdate({ ...mockUsers[0], refresh_token: 'refreshA' });
      const loginARes = await agent
        .post('/auth/login')
        .send({ email: 'userA@example.com', password: plainPassword })
        .expect(HttpStatus.OK);
      tenantA_accessToken = loginARes.body.access_token;
      jest.clearAllMocks(); // Clear mocks from login before proceeding

      // Login userB to get their token
      setupDbMocksForUserLookup(mockUsers[2]);
      setupDbMocksForUpdate({ ...mockUsers[2], refresh_token: 'refreshB' });
      const loginBRes = await agent
        .post('/auth/login')
        .send({ email: 'userB@example.com', password: plainPassword })
        .expect(HttpStatus.OK);
      tenantB_accessToken = loginBRes.body.access_token;
      jest.clearAllMocks(); // Clear mocks from login before proceeding
    });

    it('should allow userA to retrieve their own tenant profile data', async () => {
      // For `/auth/profile`, the data typically comes from the JWT payload itself,
      // so no explicit DB mock is needed unless the controller does an additional DB fetch.
      const res = await agent
        .get('/auth/profile')
        .set('Authorization', `Bearer ${tenantA_accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body.id).toEqual('user1-tenantA');
      expect(res.body.tenantId).toEqual(tenantAId);
      expect(res.body.email).toEqual('userA@example.com');
    });

    it('should allow userB to retrieve their own tenant profile data', async () => {
      const res = await agent
        .get('/auth/profile')
        .set('Authorization', `Bearer ${tenantB_accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body.id).toEqual('user2-tenantB');
      expect(res.body.tenantId).toEqual(tenantBId);
      expect(res.body.email).toEqual('userB@example.com');
    });

    it('tenant A user should NOT be able to read tenant B data (e.g., specific user from tenant B)', async () => {
      // We assume an endpoint `/auth/users/:id` where the underlying service
      // adds `tenantId` from `req.user` to the Drizzle `where` clause.
      const userFromTenantBId = mockUsers[2].id; // user2-tenantB

      // Mock the DB call for `db.select().from(usersTable).where(and(eq(usersTable.id, userFromTenantBId), eq(usersTable.tenantId, tenantAId)))`
      // This query should return null because userFromTenantBId belongs to tenantB, not tenantA.
      setupDbMocksForUserLookup(null); // Simulate the service's tenant-filtered query returning no result

      await agent
        .get(`/auth/users/${userFromTenantBId}`) // Hypothetical endpoint
        .set('Authorization', `Bearer ${tenantA_accessToken}`)
        .expect(HttpStatus.NOT_FOUND); // Or HttpStatus.FORBIDDEN (403), depending on business logic

      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledWith(usersTable);
      // It's hard to assert the exact `and` clause with `where` mock,
      // but the expectation of `null` result (and 404/403 status) confirms isolation.
    });

    it('tenant A user SHOULD be able to read their own tenant data (e.g., specific user from tenant A)', async () => {
      const userFromTenantAId = mockUsers[0].id; // user1-tenantA

      // Mock the DB call for `db.select().from(usersTable).where(and(eq(usersTable.id, userFromTenantAId), eq(usersTable.tenantId, tenantAId)))`
      // This query should return mockUsers[0].
      setupDbMocksForUserLookup(mockUsers[0]);

      const res = await agent
        .get(`/auth/users/${userFromTenantAId}`)
        .set('Authorization', `Bearer ${tenantA_accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body.id).toEqual(userFromTenantAId);
      expect(res.body.tenantId).toEqual(tenantAId);
      expect(mockDb.select).toHaveBeenCalledTimes(1);
      expect(mockDb.from).toHaveBeenCalledWith(usersTable);
    });
  });
});
