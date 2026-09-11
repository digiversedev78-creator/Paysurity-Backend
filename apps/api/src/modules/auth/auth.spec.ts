/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SEC-004 — RBAC Enforcement
 * FILE TYPE:    TEST
 * MODULE:       auth
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/SEC_SECURITY_PRIVACY.md
 * WORKER:       CODER-026
 * GENERATED:    2026-03-18T10:33:44.555Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// --- Inline Stubs for Phantom Dependencies ---
export enum PaySurityRole { MERCHANT = 'MERCHANT', ADMIN = 'ADMIN', USER = 'USER' }
export enum PaySurityPermission { TRANSACTION_READ = 'TRANSACTION_READ', TRANSACTION_PROCESS = 'TRANSACTION_PROCESS', REPORT_VIEW = 'REPORT_VIEW', USER_WRITE = 'USER_WRITE' }
export interface UserClaims { userId: string; tenantId: string; email: string; roles: PaySurityRole[]; permissions: PaySurityPermission[]; isActive: boolean; }
export class MockJwtAuthGuard { canActivate() { return true; } }
export const PG_CONNECTION = 'DATABASE';


// Mock Drizzle DB for testing specific queries used in AuthService
const mockDb: PostgresJsDatabase<any> = {
  query: {
    users: {
      findFirst: jest.fn(),
    },
    roles: {
      findFirst: jest.fn(),
    },
    userRoles: {
      findFirst: jest.fn(),
    },
  },
  insert: jest.fn().mockReturnThis(), // Mock insert to return `this` for chaining `.values()`
  values: jest.fn().mockReturnThis(), // Mock values to return `this` for execution
  // Add mocks for other Drizzle methods (e.g., update, delete) if used by AuthService
} as unknown as PostgresJsDatabase<any>;

describe('AuthModule (RBAC Enforcement)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let reflector: Reflector;
  let auditLogService: jest.Mocked<any>;

  // Define mock user claims for different scenarios
  const mockUserClaims: UserClaims = {
    userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    tenantId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    email: 'testuser@paysurity.com',
    roles: [PaySurityRole.MERCHANT],
    permissions: [PaySurityPermission.TRANSACTION_READ],
    isActive: true,
  };

  const mockAdminClaims: UserClaims = {
    userId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03',
    tenantId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02',
    email: 'admin@paysurity.com',
    roles: [PaySurityRole.ADMIN, PaySurityRole.MERCHANT],
    permissions: [
      PaySurityPermission.TRANSACTION_READ,
      PaySurityPermission.TRANSACTION_PROCESS,
      PaySurityPermission.REPORT_VIEW,
      PaySurityPermission.USER_WRITE,
    ],
    isActive: true,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        RolesGuard,
        PermissionsGuard,
        Reflector,
        MockJwtAuthGuard,
        {
          provide: AuditLogService,
          useValue: {
            logMutation: jest.fn(), // Mock AuditLogService
          },
        },
        {
          provide: PG_CONNECTION,
          useValue: mockDb, // Provide the mock Drizzle DB
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get<AuthService>(AuthService);
    reflector = moduleFixture.get<Reflector>(Reflector);
    auditLogService = moduleFixture.get<AuditLogService>(AuditLogService);
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks(); // Clear mocks after each test to prevent pollution
    await app.close();
  });

  it('should ensure AuthService and Reflector are defined', () => {
    expect(authService).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('AuthService', () => {
    it('should find a user with roles and permissions successfully', async () => {
      const dbUser = {
        id: mockUserClaims.userId,
        tenantId: mockUserClaims.tenantId,
        email: mockUserClaims.email,
        passwordHash: 'hashedpassword',
        isActive: true,
        userRoles: [
          {
            role: {
              name: PaySurityRole.MERCHANT,
              rolePermissions: [
                { permission: { name: PaySurityPermission.TRANSACTION_READ } },
              ],
            },
          },
        ],
      };
      ((mockDb.query as any).users.findFirst as jest.Mock).mockResolvedValue(dbUser);

      const result = await (authService as any).findUserWithRolesAndPermissions(mockUserClaims.userId, mockUserClaims.tenantId);

      expect(result).toEqual(mockUserClaims);
      expect((mockDb.query as any).users.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Function),
          with: expect.objectContaining({ userRoles: expect.any(Object) }),
        }),
      );
    });

    it('should return null if user not found in the database', async () => {
      ((mockDb.query as any).users.findFirst as jest.Mock).mockResolvedValue(null);
      const result = await (authService as any).findUserWithRolesAndPermissions('non-existent-user', 'some-tenant');
      expect(result).toBeNull();
    });

    it('should assign a role to a user and log the mutation', async () => {
      const targetUserId = 'target-user-id';
      const roleName = PaySurityRole.USER;
      const roleId = 'mock-role-id';

      // Mock DB responses for the sequence of operations in assignRoleToUser
      ((mockDb.query as any).users.findFirst as jest.Mock).mockResolvedValueOnce({
        id: targetUserId,
        tenantId: mockAdminClaims.tenantId,
        email: 'target@example.com',
        isActive: true,
      }); // User exists
      ((mockDb.query as any).roles.findFirst as jest.Mock).mockResolvedValueOnce({
        id: roleId,
        tenantId: mockAdminClaims.tenantId,
        name: roleName,
      }); // Role exists
      ((mockDb.query as any).userRoles.findFirst as jest.Mock).mockResolvedValueOnce(undefined); // User does not yet have the role

      await (authService as any).assignRoleToUser(mockAdminClaims.userId, mockAdminClaims.tenantId, targetUserId, roleName);

      expect(mockDb.insert).toHaveBeenCalled();
      expect((mockDb as any).values).toHaveBeenCalledWith({
        userId: targetUserId,
        roleId: roleId,
        tenantId: mockAdminClaims.tenantId,
      });
      expect(auditLogService.logMutation).toHaveBeenCalledWith(
        'Auth.RoleAssigned',
        'UserRole',
        `${targetUserId}:${roleId}`,
        expect.objectContaining({
          assignedBy: mockAdminClaims.userId,
          targetUserId: targetUserId,
          roleName: roleName,
          tenantId: mockAdminClaims.tenantId,
        }),
        mockAdminClaims.tenantId,
      );
    });

    it('should not assign a role if the user already has it', async () => {
      const targetUserId = 'target-user-id';
      const roleName = PaySurityRole.MERCHANT;
      const roleId = 'mock-role-id';

      ((mockDb.query as any).users.findFirst as jest.Mock).mockResolvedValueOnce({ id: targetUserId, tenantId: mockAdminClaims.tenantId, email: 'target@example.com', isActive: true });
      ((mockDb.query as any).roles.findFirst as jest.Mock).mockResolvedValueOnce({ id: roleId, tenantId: mockAdminClaims.tenantId, name: roleName });
      ((mockDb.query as any).userRoles.findFirst as jest.Mock).mockResolvedValueOnce({ userId: targetUserId, roleId: roleId, tenantId: mockAdminClaims.tenantId }); // User already has the role

      await (authService as any).assignRoleToUser(mockAdminClaims.userId, mockAdminClaims.tenantId, targetUserId, roleName);

      expect(mockDb.insert).not.toHaveBeenCalled(); // No insert operation should occur
      expect(auditLogService.logMutation).not.toHaveBeenCalled(); // No audit log for no-op
    });

    it('should throw an error if target user for role assignment is not found', async () => {
      const targetUserId = 'non-existent-user-id';
      const roleName = PaySurityRole.USER;

      ((mockDb.query as any).users.findFirst as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        (authService as any).assignRoleToUser(mockAdminClaims.userId, mockAdminClaims.tenantId, targetUserId, roleName),
      ).rejects.toThrow('User not found.');
      expect(auditLogService.logMutation).not.toHaveBeenCalled();
    });
  });

  describe('RolesGuard', () => {
    let rolesGuard: RolesGuard;
    let mockExecutionContext;

    beforeEach(() => {
      rolesGuard = new RolesGuard(reflector as any);
      mockExecutionContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({ user: mockUserClaims }) }), // Default mock user for guards
      };
    });

    it('should allow access if no specific roles are required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(undefined);
      const canActivate = await rolesGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should allow access if the user has the required role', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([PaySurityRole.MERCHANT]);
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims);
      const canActivate = await rolesGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should deny access if the user does not have the required role', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([PaySurityRole.ADMIN]); // Requires ADMIN
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims); // User is MERCHANT
      const canActivate = await rolesGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);
    });

    it('should deny access if user is not found or inactive in DB', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([PaySurityRole.MERCHANT]);
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(null); // User not found
      let canActivate = await rolesGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);

      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue({ ...mockUserClaims, isActive: false }); // User is inactive
      canActivate = await rolesGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);
    });
  });

  describe('PermissionsGuard', () => {
    let permissionsGuard: PermissionsGuard;
    let mockExecutionContext;

    beforeEach(() => {
      permissionsGuard = new PermissionsGuard(reflector as any);
      mockExecutionContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({ getRequest: () => ({ user: mockUserClaims }) }),
      };
    });

    it('should allow access if no specific permissions are required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(undefined);
      const canActivate = await permissionsGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should allow access if the user has all required permissions', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([PaySurityPermission.TRANSACTION_READ]);
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims);
      const canActivate = await permissionsGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(true);
    });

    it('should deny access if the user is missing any required permission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([PaySurityPermission.TRANSACTION_READ, PaySurityPermission.TRANSACTION_PROCESS]);
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims); // User only has TRANSACTION_READ
      const canActivate = await permissionsGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);
    });

    it('should deny access if user is not found or inactive in DB', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce([PaySurityPermission.TRANSACTION_READ]);
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(null);
      let canActivate = await permissionsGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);

      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue({ ...mockUserClaims, isActive: false });
      canActivate = await permissionsGuard.canActivate(mockExecutionContext);
      expect(canActivate).toBe(false);
    });
  });

  describe('AuthController (Integration with Guards)', () => {
    it('/auth/profile (GET) should return user claims for an authenticated user', async () => {
      // MockJwtAuthGuard populates req.user. For this test, we ensure it's the `mockUserClaims`
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUserClaims;
        return true;
      }) as any);

      const response = await request(app.getHttpServer()).get('/auth/profile');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUserClaims);
    });

    it('/auth/admin-data (GET) should allow an ADMIN user', async () => {
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockAdminClaims); // User is ADMIN
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockAdminClaims;
        return true;
      }) as any);

      const response = await request(app.getHttpServer()).get('/auth/admin-data');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Welcome, Admin');
    });

    it('/auth/admin-data (GET) should forbid a non-ADMIN user', async () => {
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims); // User is MERCHANT
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUserClaims;
        return true;
      }) as any);

      const response = await request(app.getHttpServer()).get('/auth/admin-data');

      expect(response.status).toBe(403); // Forbidden
    });

    it('/auth/transaction-report (GET) should allow user with all required permissions', async () => {
      const reportUserClaims = {
        ...mockUserClaims,
        permissions: [PaySurityPermission.TRANSACTION_READ, PaySurityPermission.REPORT_VIEW],
      };
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(reportUserClaims);
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = reportUserClaims;
        return true;
      }) as any);

      const response = await request(app.getHttpServer()).get('/auth/transaction-report');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Transaction report generated');
    });

    it('/auth/transaction-report (GET) should forbid user without all required permissions', async () => {
      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims); // User only has TRANSACTION_READ
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUserClaims;
        return true;
      }) as any);

      const response = await request(app.getHttpServer()).get('/auth/transaction-report');

      expect(response.status).toBe(403);
    });

    it('/auth/assign-role/:userId/:roleName (POST) should allow ADMIN to assign a role and log it', async () => {
      const targetUserId = 'test-target-user-id';
      const roleToAssign = PaySurityRole.USER;
      const roleId = 'test-role-id';

      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockAdminClaims); // Caller is ADMIN
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockAdminClaims;
        return true;
      }) as any);

      // Mock the AuthService calls for the assignment logic
      ((mockDb.query as any).users.findFirst as jest.Mock).mockResolvedValueOnce({
        id: targetUserId,
        tenantId: mockAdminClaims.tenantId,
        email: 'target@example.com',
        isActive: true,
      });
      ((mockDb.query as any).roles.findFirst as jest.Mock).mockResolvedValueOnce({
        id: roleId,
        tenantId: mockAdminClaims.tenantId,
        name: roleToAssign,
      });
      ((mockDb.query as any).userRoles.findFirst as jest.Mock).mockResolvedValueOnce(undefined); // Role not yet assigned

      const response = await request(app.getHttpServer())
        .post(`/auth/assign-role/${targetUserId}/${roleToAssign}`);

      expect(response.status).toBe(204);
      expect(auditLogService.logMutation).toHaveBeenCalled(); // Verify audit log
    });

    it('/auth/assign-role/:userId/:roleName (POST) should forbid a non-ADMIN from assigning a role', async () => {
      const targetUserId = 'test-target-user-id';
      const roleToAssign = PaySurityRole.USER;

      jest.spyOn(authService as any, 'findUserWithRolesAndPermissions').mockResolvedValue(mockUserClaims); // Caller is MERCHANT (non-ADMIN)
      jest.spyOn(MockJwtAuthGuard.prototype, 'canActivate').mockImplementationOnce(((context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUserClaims;
        return true;
      }) as any);

      const response = await request(app.getHttpServer())
        .post(`/auth/assign-role/${targetUserId}/${roleToAssign}`);

      expect(response.status).toBe(403); // Forbidden
      expect(auditLogService.logMutation).not.toHaveBeenCalled();
    });
  });
});
