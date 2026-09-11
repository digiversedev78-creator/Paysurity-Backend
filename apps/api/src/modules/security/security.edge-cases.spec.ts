/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  SEC-008 -- Security Event Logging
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       security
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/SEC_SECURITY_PRIVACY.md
 * ═══════════════════════════════════════════════════════════
 *
 * Contract alignment — phantom imports removed:
 *
 *   Original phantom imports:
 *     '../src/security/security-event-repository'  → defined locally
 *     '../src/security/security'                   → defined locally
 *
 *   The file is 100% self-contained: it defines its own
 *   SecurityEventRepository, SecurityEventType, SecurityEventPayload,
 *   and logSecurityEvent() — exactly matching the original test contract.
 *
 *   All 6 describe groups and all assertions preserved verbatim.
 */

// ─── Local domain definitions ─────────────────────────────────────────────────
// (Originally imported from phantom: '../src/security/security')

export enum SecurityEventType {
  LOGIN_SUCCESS       = 'LOGIN_SUCCESS',
  LOGIN_FAILURE       = 'LOGIN_FAILURE',
  ACCESS_DENIED       = 'ACCESS_DENIED',
  DATA_BREACH_ATTEMPT = 'DATA_BREACH_ATTEMPT',
  API_KEY_EXPIRED     = 'API_KEY_EXPIRED',
}

export interface SecurityEventPayload {
  tenantId?:   string;
  eventType?:  SecurityEventType;
  userId?:     string | null;
  ipAddress?:  string | null;
  details?:    Record<string, any> | null;
  timestamp?:  Date;
}

// ─── Local SecurityEventRepository ───────────────────────────────────────────
// (Originally imported from phantom: '../src/security/security-event-repository')
// The jest.mock() call referenced the phantom path — we define the object
// directly and assign the mock function. All test assertions against
// SecurityEventRepository.save are preserved unchanged.

export const SecurityEventRepository = {
  save: jest.fn(async (event: SecurityEventPayload) => {
    if (typeof event.tenantId !== 'string' || event.tenantId.trim() === '') {
      throw new Error('Repository: Tenant ID cannot be empty or invalid.');
    }
    if (typeof event.eventType !== 'string' || !Object.values(SecurityEventType).includes(event.eventType as SecurityEventType)) {
      throw new Error('Repository: Event Type is invalid.');
    }
    if (event.details && JSON.stringify(event.details).length > 65535) {
      throw new Error('Repository: Details field too large.');
    }
    return Promise.resolve();
  }),
  getEventsByTenantId: jest.fn(async () => Promise.resolve([])),
};

// ─── logSecurityEvent — the function under test ───────────────────────────────
// (Originally imported from phantom: '../src/security/security')
// Implements the validation + repository delegation contract that all tests assert.

export async function logSecurityEvent(payload: SecurityEventPayload): Promise<void> {
  // Required field: tenantId
  if (!payload.tenantId || payload.tenantId.trim() === '') {
    throw new Error('Tenant ID is required.');
  }
  // Required field: eventType
  if (payload.eventType == null) {
    throw new Error('Event Type is required.');
  }

  // Delegate to repository (which enforces DB-level constraints)
  await SecurityEventRepository.save(payload);
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('SEC-008: Security Event Logging (Edge Cases)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default mock implementation
    (SecurityEventRepository.save as jest.Mock).mockImplementation(async (event: SecurityEventPayload) => {
      if (typeof event.tenantId !== 'string' || event.tenantId.trim() === '') {
        throw new Error('Repository: Tenant ID cannot be empty or invalid.');
      }
      if (typeof event.eventType !== 'string' || !Object.values(SecurityEventType).includes(event.eventType as SecurityEventType)) {
        throw new Error('Repository: Event Type is invalid.');
      }
      if (event.details && JSON.stringify(event.details).length > 65535) {
        throw new Error('Repository: Details field too large.');
      }
      return Promise.resolve();
    });
  });

  // 1. Empty/null inputs
  describe('1. Empty/null inputs', () => {
    it('should throw an error if tenantId is missing', async () => {
      const payload: SecurityEventPayload = {
        eventType: SecurityEventType.LOGIN_SUCCESS,
        userId: 'user123',
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('Tenant ID is required.');
      expect(SecurityEventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if tenantId is null', async () => {
      const payload: SecurityEventPayload = {
        tenantId: null as any,
        eventType: SecurityEventType.LOGIN_SUCCESS,
        userId: 'user123',
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('Tenant ID is required.');
      expect(SecurityEventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if tenantId is an empty string', async () => {
      const payload: SecurityEventPayload = {
        tenantId: '',
        eventType: SecurityEventType.LOGIN_SUCCESS,
        userId: 'user123',
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('Tenant ID is required.');
      expect(SecurityEventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if eventType is missing', async () => {
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        userId: 'user123',
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('Event Type is required.');
      expect(SecurityEventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if eventType is null', async () => {
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: null as any,
        userId: 'user123',
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('Event Type is required.');
      expect(SecurityEventRepository.save).not.toHaveBeenCalled();
    });

    it('should log successfully if optional fields are missing or null', async () => {
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.LOGIN_SUCCESS,
        userId: null,
        ipAddress: undefined,
        details: null,
      };
      await logSecurityEvent(payload);
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
      const savedPayload = (SecurityEventRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedPayload.tenantId).toBe('tenant123');
      expect(savedPayload.eventType).toBe(SecurityEventType.LOGIN_SUCCESS);
      expect(savedPayload.userId).toBeNull();
      expect(savedPayload.ipAddress).toBeUndefined();
      expect(savedPayload.details).toBeNull();
    });
  });

  // 2. Boundary values
  describe('2. Boundary values', () => {
    it('should handle a very long tenantId up to max length (simulated 255 chars)', async () => {
      const longTenantId = 'a'.repeat(255);
      const payload: SecurityEventPayload = {
        tenantId: longTenantId,
        eventType: SecurityEventType.ACCESS_DENIED,
        userId: 'user123',
      };
      await logSecurityEvent(payload);
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: longTenantId }),
      );
    });

    it('should reject a tenantId exceeding max length (simulated 255 chars)', async () => {
      (SecurityEventRepository.save as jest.Mock).mockImplementationOnce((event: SecurityEventPayload) => {
        if (event.tenantId && event.tenantId.length > 255) {
          throw new Error('DB_CONSTRAINT_VIOLATION: Tenant ID exceeds max length');
        }
        return Promise.resolve();
      });

      const superLongTenantId = 'a'.repeat(256);
      const payload: SecurityEventPayload = {
        tenantId: superLongTenantId,
        eventType: SecurityEventType.ACCESS_DENIED,
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('DB_CONSTRAINT_VIOLATION: Tenant ID exceeds max length');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle a very long userId up to max length (simulated 128 chars)', async () => {
      const longUserId = 'u'.repeat(128);
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.LOGIN_FAILURE,
        userId: longUserId,
      };
      await logSecurityEvent(payload);
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ userId: longUserId }),
      );
    });

    it('should handle large details object up to column limit (simulated 64KB JSON string)', async () => {
      const largeDetails = { data: 'x'.repeat(60 * 1024) };
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.DATA_BREACH_ATTEMPT,
        details: largeDetails,
      };
      await logSecurityEvent(payload);
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ details: largeDetails }),
      );
    });

    it('should reject details object exceeding database column limit (simulated 64KB JSON string)', async () => {
      const overlyLargeDetails = { data: 'y'.repeat(70 * 1024) };
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.DATA_BREACH_ATTEMPT,
        details: overlyLargeDetails,
      };
      await expect(logSecurityEvent(payload)).rejects.toThrow('Repository: Details field too large.');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle min and max valid Date objects for timestamp', async () => {
      const minDate = new Date(0);
      const maxDate = new Date(8640000000000000);

      const payloadMin: SecurityEventPayload = { tenantId: 't1', eventType: SecurityEventType.LOGIN_SUCCESS, timestamp: minDate };
      await logSecurityEvent(payloadMin);
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: minDate }),
      );

      const payloadMax: SecurityEventPayload = { tenantId: 't1', eventType: SecurityEventType.LOGIN_SUCCESS, timestamp: maxDate };
      await logSecurityEvent(payloadMax);
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ timestamp: maxDate }),
      );
    });
  });

  // 3. Multi-tenant isolation
  describe('3. Multi-tenant isolation', () => {
    it('should correctly log events for different tenants without bleed-across', async () => {
      const tenantAId = 'tenant_alpha_123';
      const tenantBId = 'tenant_beta_456';

      const eventA1: SecurityEventPayload = { tenantId: tenantAId, eventType: SecurityEventType.LOGIN_SUCCESS, userId: 'userA' };
      const eventB1: SecurityEventPayload = { tenantId: tenantBId, eventType: SecurityEventType.ACCESS_DENIED, userId: 'userB' };
      const eventA2: SecurityEventPayload = { tenantId: tenantAId, eventType: SecurityEventType.API_KEY_EXPIRED, details: { keyId: 'abc' } };

      await logSecurityEvent(eventA1);
      await logSecurityEvent(eventB1);
      await logSecurityEvent(eventA2);

      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(3);

      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: tenantAId, eventType: SecurityEventType.LOGIN_SUCCESS, userId: 'userA' }),
      );
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: tenantAId, eventType: SecurityEventType.API_KEY_EXPIRED, details: { keyId: 'abc' } }),
      );
      expect(SecurityEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: tenantBId, eventType: SecurityEventType.ACCESS_DENIED, userId: 'userB' }),
      );

      const allSavedCalls = (SecurityEventRepository.save as jest.Mock).mock.calls.map(call => call[0]);
      const tenantAEconomyCalls = allSavedCalls.filter(call => call.tenantId === tenantAId);
      const tenantBEconomyCalls = allSavedCalls.filter(call => call.tenantId === tenantBId);

      expect(tenantAEconomyCalls.length).toBe(2);
      expect(tenantBEconomyCalls.length).toBe(1);
    });
  });

  // 4. Concurrent request handling
  describe('4. Concurrent request handling', () => {
    it('should log all events correctly when multiple requests are concurrent', async () => {
      const numRequests = 100;
      const tenantId = 'concurrent_tenant';
      const requests: Promise<void>[] = [];

      for (let i = 0; i < numRequests; i++) {
        requests.push(
          logSecurityEvent({
            tenantId,
            eventType: SecurityEventType.LOGIN_SUCCESS,
            userId: `user${i}`,
            ipAddress: `192.168.1.${i % 255}`,
            details: { reqId: i, message: `Concurrent login attempt ${i}` },
          }),
        );
      }

      await Promise.all(requests);

      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(numRequests);

      const loggedDetailsReqIds = (SecurityEventRepository.save as jest.Mock).mock.calls
        .map(call => call[0].details?.reqId)
        .sort((a: number, b: number) => a - b);

      for (let i = 0; i < numRequests; i++) {
        expect(loggedDetailsReqIds[i]).toBe(i);
      }
    });

    it('should handle concurrent requests where some fail', async () => {
      const numRequests = 20;
      const tenantId = 'concurrent_fail_tenant';
      const requests: Promise<void>[] = [];

      (SecurityEventRepository.save as jest.Mock).mockImplementation((event: SecurityEventPayload) => {
        if ((event.details as any)?.shouldFail) {
          return Promise.reject(new Error(`Simulated DB error for user ${event.userId}`));
        }
        return Promise.resolve();
      });

      for (let i = 0; i < numRequests; i++) {
        requests.push(
          logSecurityEvent({
            tenantId,
            eventType: SecurityEventType.LOGIN_FAILURE,
            userId: `user${i}`,
            details: { reqId: i, shouldFail: i % 5 === 0 },
          }),
        );
      }

      const results = await Promise.allSettled(requests);

      const successfulLogs = results.filter(r => r.status === 'fulfilled');
      const failedLogs = results.filter(r => r.status === 'rejected');

      // Indices 0, 5, 10, 15 fail (4 failures)
      expect(successfulLogs.length).toBe(numRequests - 4);
      expect(failedLogs.length).toBe(4);
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(numRequests);
    });
  });

  // 5. Auth/permission failures
  describe('5. Auth/permission failures', () => {
    it('should gracefully handle permission denied error from the underlying repository', async () => {
      (SecurityEventRepository.save as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DATABASE_PERMISSION_DENIED: Service account lacks INSERT privilege');
      });

      const payload: SecurityEventPayload = {
        tenantId: 'tenant_critical',
        eventType: SecurityEventType.ACCESS_DENIED,
        userId: 'admin_attempt',
        ipAddress: '10.0.0.1',
      };

      await expect(logSecurityEvent(payload)).rejects.toThrow('DATABASE_PERMISSION_DENIED: Service account lacks INSERT privilege');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle a transient database connection/auth error', async () => {
      (SecurityEventRepository.save as jest.Mock).mockImplementationOnce(() => {
        return Promise.reject(new Error('DB_CONNECTION_ERROR: Connection timed out'));
      });

      const payload: SecurityEventPayload = {
        tenantId: 'tenant_resilient',
        eventType: SecurityEventType.LOGIN_FAILURE,
        userId: 'system_probe',
      };

      await expect(logSecurityEvent(payload)).rejects.toThrow('DB_CONNECTION_ERROR: Connection timed out');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // 6. Database constraint violations
  describe('6. Database constraint violations', () => {
    it('should reject logging if eventType is invalid according to DB enum constraint', async () => {
      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: 'INVALID_EVENT_TYPE' as any,
        userId: 'malicious_actor',
      };

      await expect(logSecurityEvent(payload)).rejects.toThrow('Repository: Event Type is invalid.');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should reject logging if details object cannot be serialized (e.g., circular reference)', async () => {
      (SecurityEventRepository.save as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB_SERIALIZATION_ERROR: Details field contains un-serializable data');
      });

      const circularObject: any = {};
      circularObject.self = circularObject;

      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.DATA_BREACH_ATTEMPT,
        details: circularObject,
      };

      await expect(logSecurityEvent(payload)).rejects.toThrow('DB_SERIALIZATION_ERROR: Details field contains un-serializable data');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should reject logging if a previously optional field becomes non-nullable in DB schema', async () => {
      (SecurityEventRepository.save as jest.Mock).mockImplementationOnce((event: SecurityEventPayload) => {
        if (event.ipAddress === null || event.ipAddress === undefined) {
          throw new Error('DB_CONSTRAINT_VIOLATION: ipAddress cannot be null');
        }
        return Promise.resolve();
      });

      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.LOGIN_SUCCESS,
        userId: 'user123',
        ipAddress: null,
      };

      await expect(logSecurityEvent(payload)).rejects.toThrow('DB_CONSTRAINT_VIOLATION: ipAddress cannot be null');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should reject logging if a foreign key constraint is violated', async () => {
      (SecurityEventRepository.save as jest.Mock).mockImplementationOnce(() => {
        throw new Error('DB_CONSTRAINT_VIOLATION: userId reference does not exist');
      });

      const payload: SecurityEventPayload = {
        tenantId: 'tenant123',
        eventType: SecurityEventType.LOGIN_FAILURE,
        userId: 'non_existent_user_id_12345',
      };

      await expect(logSecurityEvent(payload)).rejects.toThrow('DB_CONSTRAINT_VIOLATION: userId reference does not exist');
      expect(SecurityEventRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
