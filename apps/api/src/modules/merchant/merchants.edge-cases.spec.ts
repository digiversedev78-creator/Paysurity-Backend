/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-010 -- Lifecycle Events
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       merchants
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       TESTER-108
 * GENERATED:    2026-03-17T13:18:52.227Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { v4 as uuid } from 'uuid';

// --- Hypothetical Types & Enums for PaySurity Platform ---
// (These would typically be imported from shared types/interfaces)

enum LifecycleEventType {
  ACTIVATE = 'ACTIVATE',
  SUSPEND = 'SUSPEND',
  DEACTIVATE = 'DEACTIVATE',
  REVIEW = 'REVIEW',
  UNSUSPEND = 'UNSUSPEND',
  // Add other lifecycle events as needed
}

enum MerchantStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  // Add other merchant statuses as needed
}

interface Merchant {
  id: string;
  tenantId: string;
  name: string;
  status: MerchantStatus;
  createdAt: Date;
  updatedAt: Date;
  // Add other merchant properties
}

interface LifecycleEvent {
  id: string;
  merchantId: string;
  tenantId: string; // Ensure events are also tenant-scoped
  eventType: LifecycleEventType;
  previousStatus: MerchantStatus;
  newStatus: MerchantStatus;
  timestamp: Date;
  initiatedBy: string; // userId
  reason?: string;
  durationInDays?: number; // e.g., for temporary suspension
  // Add other event details
}

// --- Mocked Dependencies ---
// In a real application, these would be actual service/repository classes
// imported and then mocked using `jest.mock`. Here, we define them directly
// as objects with jest.fn() for simplicity in a single file example.

const mockMerchantRepository = {
  findById: jest.fn<Promise<Merchant | null>, [string]>(),
  findByTenantAndId: jest.fn<Promise<Merchant | null>, [string, string]>(), // Crucial for multi-tenancy
  updateStatus: jest.fn<Promise<Merchant>, [string, MerchantStatus]>(), // Might be a simpler update
  save: jest.fn<Promise<Merchant>, [Merchant]>(), // Generic save for updating entire merchant object
  createLifecycleEvent: jest.fn<Promise<LifecycleEvent>, [LifecycleEvent]>(),
  // Simulate database errors directly
  _simulateError: {
    save: null as Error | null,
    createLifecycleEvent: null as Error | null,
  },
};

const mockAuthService = {
  isAuthenticated: jest.fn<boolean, [string]>(),
  hasPermission: jest.fn<boolean, [string, string]>(),
  getUserId: jest.fn<string, []>(),
  getTenantId: jest.fn<string, []>(),
};

const mockEventBusService = {
  publish: jest.fn<void, [string, any]>(),
};

// --- Hypothetical Service Under Test (simplified for example) ---
// This class would typically be in its own file (e.g., `src/modules/merchants/services/MerchantLifecycleService.ts`)
// We include a simplified version here to show how the mocks interact with the logic.

class MerchantLifecycleService {
  constructor(
    private merchantRepository: typeof mockMerchantRepository,
    private authService: typeof mockAuthService,
    private eventBusService: typeof mockEventBusService,
  ) {}

  /**
   * Applies a lifecycle event to a merchant.
   * Ensures proper authentication, authorization, tenant isolation, and state transitions.
   */
  async applyLifecycleEvent(
    merchantId: string,
    eventType: LifecycleEventType,
    payload: { reason?: string; durationInDays?: number },
    currentTenantId: string,
    currentUserId: string,
  ): Promise<Merchant> {
    // 1. Auth & Permissions
    if (!(this.authService as any).isAuthenticated(currentUserId)) {
      throw new Error('UNAUTHENTICATED');
    }
    if (!(this.authService as any).hasPermission(currentUserId, 'MERCHANT_LIFECYCLE_UPDATE')) {
      throw new Error('FORBIDDEN');
    }

    // 2. Input Validation (basic)
    if (!merchantId || !eventType || !currentTenantId) {
      throw new Error('INVALID_INPUT: Missing required fields (merchantId, eventType, tenantId)');
    }
    if (!Object.values(LifecycleEventType).includes(eventType)) {
      throw new Error('INVALID_INPUT: Invalid event type provided');
    }
    if (typeof payload !== 'object' || payload === null) {
      payload = {}; // Ensure payload is an object
    }

    // 3. Retrieve Merchant with Tenant Isolation
    // This is crucial: ensures a merchant only belongs to one tenant
    const merchant = await this.merchantRepository.findByTenantAndId(currentTenantId, merchantId);
    if (!merchant) {
      // If not found, it's either non-existent or belongs to another tenant
      throw new Error('NOT_FOUND: Merchant not found or unauthorized for this tenant');
    }

    // 4. Determine New Status & Validate State Transition
    let newStatus: MerchantStatus;
    const previousStatus = merchant.status;

    switch (eventType) {
      case LifecycleEventType.ACTIVATE:
        if (previousStatus === MerchantStatus.ACTIVE) {
          throw new Error('INVALID_STATE_TRANSITION: Merchant is already active');
        }
        newStatus = MerchantStatus.ACTIVE;
        break;
      case LifecycleEventType.SUSPEND:
        if (previousStatus === MerchantStatus.SUSPENDED || previousStatus === MerchantStatus.DEACTIVATED) {
          throw new Error('INVALID_STATE_TRANSITION: Cannot suspend a suspended or deactivated merchant');
        }
        if (!payload.reason || payload.reason.trim().length < 5) {
          throw new Error('INVALID_INPUT: A detailed reason (min 5 chars) is required for suspension');
        }
        newStatus = MerchantStatus.SUSPENDED;
        break;
      case LifecycleEventType.UNSUSPEND:
        if (previousStatus !== MerchantStatus.SUSPENDED) {
          throw new Error('INVALID_STATE_TRANSITION: Only suspended merchants can be unsuspended');
        }
        newStatus = MerchantStatus.ACTIVE; // Assuming unsuspension defaults to active
        break;
      case LifecycleEventType.DEACTIVATE:
        if (previousStatus === MerchantStatus.DEACTIVATED) {
          throw new Error('INVALID_STATE_TRANSITION: Merchant is already deactivated');
        }
        newStatus = MerchantStatus.DEACTIVATED;
        break;
      case LifecycleEventType.REVIEW:
        if (previousStatus === MerchantStatus.PENDING_REVIEW) {
          throw new Error('INVALID_STATE_TRANSITION: Merchant is already under review');
        }
        newStatus = MerchantStatus.PENDING_REVIEW;
        break;
      default:
        throw new Error('UNKNOWN_EVENT_TYPE: The provided lifecycle event type is not recognized');
    }

    // 5. Apply Status Change & Record Event (Transactional boundary in a real system)
    // In a real system, this block would be wrapped in a database transaction
    // to ensure atomicity (either both update + create event succeed, or both fail).
    try {
      merchant.status = newStatus;
      const updatedMerchant = await this.merchantRepository.save(merchant); // Updates merchant status in DB
      if (mockMerchantRepository._simulateError.save) throw mockMerchantRepository._simulateError.save;

      const lifecycleEvent: LifecycleEvent = {
        id: uuid(),
        merchantId: merchant.id,
        tenantId: merchant.tenantId,
        eventType: eventType,
        previousStatus: previousStatus,
        newStatus: newStatus,
        timestamp: new Date(),
        initiatedBy: currentUserId,
        reason: payload.reason,
        durationInDays: payload.durationInDays,
      };
      await this.merchantRepository.createLifecycleEvent(lifecycleEvent); // Records the event in DB
      if (mockMerchantRepository._simulateError.createLifecycleEvent) throw mockMerchantRepository._simulateError.createLifecycleEvent;

      // 6. Publish Event to Event Bus
      (this.eventBusService as any).publish('merchant.lifecycle.event', {
        ...lifecycleEvent,
        merchantName: merchant.name,
      });

      return updatedMerchant;
    } catch (error) {
      // In a real transaction, a `rollback` would happen here.
      // For this test, we just re-throw the error.
      throw error;
    }
  }
}

// Instantiate the service with our mocks
const merchantLifecycleService = new MerchantLifecycleService(
  mockMerchantRepository,
  mockAuthService,
  mockEventBusService,
);

// --- Jest Test Suite ---
describe('MER-010: Merchant Lifecycle Events', () => {
  const TEST_TENANT_ID = 'ps-tenant-001';
  const OTHER_TENANT_ID = 'ps-tenant-002';
  const TEST_USER_ID = 'user-admin-001';
  const UNAUTHORIZED_USER_ID = 'user-viewer-001';
  const TEST_MERCHANT_ID = uuid();
  const OTHER_TENANT_MERCHANT_ID = uuid();

  let mockMerchant: Merchant;
  let mockOtherTenantMerchant: Merchant;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset database error simulations
    mockMerchantRepository._simulateError.save = null;
    mockMerchantRepository._simulateError.createLifecycleEvent = null;

    // Initialize mock merchant data for each test
    mockMerchant = {
      id: TEST_MERCHANT_ID,
      tenantId: TEST_TENANT_ID,
      name: 'PaySurity Test Merchant',
      status: MerchantStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOtherTenantMerchant = {
      id: OTHER_TENANT_MERCHANT_ID,
      tenantId: OTHER_TENANT_ID,
      name: 'Another Tenant Merchant',
      status: MerchantStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Default mock behavior for auth
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.hasPermission.mockReturnValue(true); // Default to authorized
    mockAuthService.getUserId.mockReturnValue(TEST_USER_ID);
    mockAuthService.getTenantId.mockReturnValue(TEST_TENANT_ID);

    // Default mock behavior for repository interactions
    mockMerchantRepository.findByTenantAndId.mockImplementation((tenantId, merchantId) => {
      if (tenantId === TEST_TENANT_ID && merchantId === TEST_MERCHANT_ID) {
        return Promise.resolve(mockMerchant);
      }
      if (tenantId === OTHER_TENANT_ID && merchantId === OTHER_TENANT_MERCHANT_ID) {
        return Promise.resolve(mockOtherTenantMerchant);
      }
      return Promise.resolve(null); // Not found for given tenant/merchant
    });
    mockMerchantRepository.save.mockImplementation((merchant) => Promise.resolve({ ...merchant, updatedAt: new Date() }));
    mockMerchantRepository.createLifecycleEvent.mockImplementation((event) => Promise.resolve(event));
    mockEventBusService.publish.mockImplementation(() => {});
  });

  // --- 1. Empty/null inputs ---
  describe('1. Empty/null/invalid inputs', () => {
    test('should throw an error if merchantId is null', async () => {
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          null as any,
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_INPUT: Missing required fields (merchantId, eventType, tenantId)');
    });

    test('should throw an error if eventType is undefined', async () => {
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          undefined as any,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_INPUT: Missing required fields (merchantId, eventType, tenantId)');
    });

    test('should throw an error if eventType is an invalid string', async () => {
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          'NON_EXISTENT_EVENT' as any,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_INPUT: Invalid event type provided');
    });

    test('should throw an error if tenantId is an empty string', async () => {
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.ACTIVATE,
          {},
          '', // Empty tenant ID
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_INPUT: Missing required fields (merchantId, eventType, tenantId)');
    });

    test('should throw an error if reason is missing for SUSPEND event', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.SUSPEND,
          {}, // Missing reason
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_INPUT: A detailed reason (min 5 chars) is required for suspension');
    });

    test('should throw an error if reason is too short for SUSPEND event', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.SUSPEND,
          { reason: 'bad' }, // Too short
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_INPUT: A detailed reason (min 5 chars) is required for suspension');
    });

    test('should successfully apply event with minimal valid inputs', async () => {
      mockMerchant.status = MerchantStatus.DRAFT;
      const result = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.ACTIVATE,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(result.status).toBe(MerchantStatus.ACTIVE);
      expect(mockMerchantRepository.save).toHaveBeenCalledTimes(1);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledTimes(1);
      expect(mockEventBusService.publish).toHaveBeenCalledTimes(1);
    });
  });

  // --- 2. Boundary values & State Transitions ---
  describe('2. Boundary values', () => {
    test('should allow DRAFT to ACTIVE transition', async () => {
      mockMerchant.status = MerchantStatus.DRAFT;
      const updatedMerchant = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.ACTIVATE,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(updatedMerchant.status).toBe(MerchantStatus.ACTIVE);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledWith(
        expect.objectContaining({ previousStatus: MerchantStatus.DRAFT, newStatus: MerchantStatus.ACTIVE }),
      );
    });

    test('should throw error if trying to activate an already ACTIVE merchant', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_STATE_TRANSITION: Merchant is already active');
    });

    test('should allow ACTIVE to SUSPEND transition with valid reason', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      const reason = 'Security breach detected on merchant side affecting customer data.';
      const updatedMerchant = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.SUSPEND,
        { reason, durationInDays: 30 },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(updatedMerchant.status).toBe(MerchantStatus.SUSPENDED);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          previousStatus: MerchantStatus.ACTIVE,
          newStatus: MerchantStatus.SUSPENDED,
          reason,
          durationInDays: 30,
        }),
      );
    });

    test('should throw error if trying to SUSPEND a SUSPENDED merchant', async () => {
      mockMerchant.status = MerchantStatus.SUSPENDED;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.SUSPEND,
          { reason: 'Double suspension attempt' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_STATE_TRANSITION: Cannot suspend a suspended or deactivated merchant');
    });

    test('should throw error if trying to UNSUSPEND a non-SUSPENDED merchant', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.UNSUSPEND,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_STATE_TRANSITION: Only suspended merchants can be unsuspended');
    });

    test('should allow SUSPENDED to UNSUSPEND transition', async () => {
      mockMerchant.status = MerchantStatus.SUSPENDED;
      const updatedMerchant = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.UNSUSPEND,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(updatedMerchant.status).toBe(MerchantStatus.ACTIVE);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledWith(
        expect.objectContaining({ previousStatus: MerchantStatus.SUSPENDED, newStatus: MerchantStatus.ACTIVE }),
      );
    });

    test('should allow transition to DEACTIVATED from any non-DEACTIVATED state', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE; // Test from active
      const updatedMerchant = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.DEACTIVATE,
        { reason: 'Merchant account closed.' },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(updatedMerchant.status).toBe(MerchantStatus.DEACTIVATED);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledWith(
        expect.objectContaining({ previousStatus: MerchantStatus.ACTIVE, newStatus: MerchantStatus.DEACTIVATED }),
      );
    });

    test('should throw error if trying to DEACTIVATE an already DEACTIVATED merchant', async () => {
      mockMerchant.status = MerchantStatus.DEACTIVATED;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.DEACTIVATE,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_STATE_TRANSITION: Merchant is already deactivated');
    });

    test('should allow transition to PENDING_REVIEW from any state (except already PENDING_REVIEW)', async () => {
      mockMerchant.status = MerchantStatus.SUSPENDED;
      const updatedMerchant = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.REVIEW,
        { reason: 'Annual compliance review initiated.' },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(updatedMerchant.status).toBe(MerchantStatus.PENDING_REVIEW);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledWith(
        expect.objectContaining({ previousStatus: MerchantStatus.SUSPENDED, newStatus: MerchantStatus.PENDING_REVIEW }),
      );
    });

    test('should throw error if trying to REVIEW an already PENDING_REVIEW merchant', async () => {
      mockMerchant.status = MerchantStatus.PENDING_REVIEW;
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.REVIEW,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('INVALID_STATE_TRANSITION: Merchant is already under review');
    });
  });

  // --- 3. Multi-tenant isolation ---
  describe('3. Multi-tenant isolation', () => {
    test('should prevent a user from tenant A from modifying a merchant from tenant B', async () => {
      // User from TEST_TENANT_ID tries to modify OTHER_TENANT_MERCHANT_ID
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          OTHER_TENANT_MERCHANT_ID, // Merchant from other tenant
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID, // Current user's tenant ID
          TEST_USER_ID,
        ),
      ).rejects.toThrow('NOT_FOUND: Merchant not found or unauthorized for this tenant');

      expect(mockMerchantRepository.findByTenantAndId).toHaveBeenCalledWith(
        TEST_TENANT_ID,
        OTHER_TENANT_MERCHANT_ID,
      );
      expect(mockMerchantRepository.save).not.toHaveBeenCalled();
      expect(mockMerchantRepository.createLifecycleEvent).not.toHaveBeenCalled();
    });

    test('should allow operations on a merchant within the same tenant', async () => {
      mockMerchant.status = MerchantStatus.DRAFT;
      const updatedMerchant = await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.ACTIVATE,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(updatedMerchant).toBeDefined();
      expect(updatedMerchant.tenantId).toBe(TEST_TENANT_ID);
      expect(updatedMerchant.status).toBe(MerchantStatus.ACTIVE);
    });

    test('lifecycle event record should correctly store the merchant tenantId', async () => {
      mockMerchant.status = MerchantStatus.DRAFT;
      await merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.ACTIVATE,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TEST_TENANT_ID, merchantId: TEST_MERCHANT_ID }),
      );
    });
  });

  // --- 4. Concurrent request handling ---
  describe('4. Concurrent request handling', () => {
    test('should handle concurrent ACTIVATE requests on a DRAFT merchant, with only one succeeding', async () => {
      mockMerchant.status = MerchantStatus.DRAFT;

      // Simulate the first call updating the status, so the second call sees it as ACTIVE
      mockMerchantRepository.findByTenantAndId
        .mockResolvedValueOnce(mockMerchant) // First call to findByTenantAndId
        .mockResolvedValueOnce({ ...mockMerchant, status: MerchantStatus.ACTIVE }); // Second call to findByTenantAndId

      // Simulate save completing only after both finds have occurred
      mockMerchantRepository.save.mockImplementationOnce((m: Merchant) => {
        m.status = MerchantStatus.ACTIVE; // The 'first' request successfully updates status
        return Promise.resolve(m);
      });

      const promise1 = merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.ACTIVATE,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      const promise2 = merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.ACTIVATE,
        {},
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      const [result1, result2] = await Promise.allSettled([promise1, promise2]);

      expect(result1.status).toBe('fulfilled');
      expect((result1 as PromiseFulfilledResult<Merchant>).value.status).toBe(MerchantStatus.ACTIVE);

      expect(result2.status).toBe('rejected');
      expect((result2 as PromiseRejectedResult).reason.message).toBe(
        'INVALID_STATE_TRANSITION: Merchant is already active',
      );

      // Verify that the merchant was saved and event created only once
      expect(mockMerchantRepository.save).toHaveBeenCalledTimes(1);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledTimes(1);
    });

    test('should handle concurrent SUSPEND requests on an ACTIVE merchant, with only one succeeding', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      const suspensionReason = 'High-risk transaction patterns detected.';

      mockMerchantRepository.findByTenantAndId
        .mockResolvedValueOnce(mockMerchant) // First call sees ACTIVE
        .mockResolvedValueOnce({ ...mockMerchant, status: MerchantStatus.SUSPENDED }); // Second call sees SUSPENDED

      mockMerchantRepository.save.mockImplementationOnce((m: Merchant) => {
        m.status = MerchantStatus.SUSPENDED; // First request successfully updates status
        return Promise.resolve(m);
      });

      const promise1 = merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.SUSPEND,
        { reason: suspensionReason },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );
      const promise2 = merchantLifecycleService.applyLifecycleEvent(
        TEST_MERCHANT_ID,
        LifecycleEventType.SUSPEND,
        { reason: 'Another reason for suspension' },
        TEST_TENANT_ID,
        TEST_USER_ID,
      );

      const [result1, result2] = await Promise.allSettled([promise1, promise2]);

      expect(result1.status).toBe('fulfilled');
      expect((result1 as PromiseFulfilledResult<Merchant>).value.status).toBe(MerchantStatus.SUSPENDED);

      expect(result2.status).toBe('rejected');
      expect((result2 as PromiseRejectedResult).reason.message).toBe(
        'INVALID_STATE_TRANSITION: Cannot suspend a suspended or deactivated merchant',
      );

      expect(mockMerchantRepository.save).toHaveBeenCalledTimes(1);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledTimes(1);
    });
  });

  // --- 5. Auth/permission failures ---
  describe('5. Auth/permission failures', () => {
    test('should throw UNAUTHENTICATED error if user is not authenticated', async () => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID,
          'unauthenticated-user',
        ),
      ).rejects.toThrow('UNAUTHENTICATED');
      expect(mockAuthService.isAuthenticated).toHaveBeenCalledWith('unauthenticated-user');
      expect(mockMerchantRepository.findByTenantAndId).not.toHaveBeenCalled(); // Should fail early
    });

    test('should throw FORBIDDEN error if user lacks MERCHANT_LIFECYCLE_UPDATE permission', async () => {
      mockAuthService.hasPermission.mockReturnValue(false);
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID,
          UNAUTHORIZED_USER_ID,
        ),
      ).rejects.toThrow('FORBIDDEN');
      expect(mockAuthService.hasPermission).toHaveBeenCalledWith(
        UNAUTHORIZED_USER_ID,
        'MERCHANT_LIFECYCLE_UPDATE',
      );
      expect(mockMerchantRepository.findByTenantAndId).not.toHaveBeenCalled(); // Should fail early
    });

    test('should throw NOT_FOUND if merchant does not exist for the given tenant (acts as implicit auth)', async () => {
      mockMerchantRepository.findByTenantAndId.mockResolvedValue(null); // Simulate merchant not found/not belonging to tenant
      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('NOT_FOUND: Merchant not found or unauthorized for this tenant');
      expect(mockMerchantRepository.findByTenantAndId).toHaveBeenCalledWith(TEST_TENANT_ID, TEST_MERCHANT_ID);
      expect(mockMerchantRepository.save).not.toHaveBeenCalled();
    });
  });

  // --- 6. Database constraint violations ---
  describe('6. Database constraint violations', () => {
    test('should propagate error on unique constraint violation during createLifecycleEvent', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      const uniqueConstraintError = new Error('SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry');
      (uniqueConstraintError as any).code = 'ER_DUP_ENTRY'; // Simulate MySQL error code
      mockMerchantRepository._simulateError.createLifecycleEvent = uniqueConstraintError;

      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.DEACTIVATE,
          { reason: 'Duplicate event ID test' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry');

      // In a real system with transactions, the `save` would be rolled back.
      // Here, we just check error propagation.
      expect(mockMerchantRepository.save).toHaveBeenCalledTimes(1); // Merchant status would have been "updated"
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledTimes(1);
      expect(mockEventBusService.publish).not.toHaveBeenCalled(); // Event not published if DB operation fails
    });

    test('should propagate error on foreign key constraint violation during createLifecycleEvent', async () => {
      mockMerchant.status = MerchantStatus.ACTIVE;
      const fkConstraintError = new Error(
        'SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row: a foreign key constraint fails (`merchant_id`)',
      );
      (fkConstraintError as any).code = 'ER_NO_REFERENCED_ROW_2'; // Simulate MySQL error code
      mockMerchantRepository._simulateError.createLifecycleEvent = fkConstraintError;

      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.DEACTIVATE,
          { reason: 'FK test' },
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('SQLSTATE[23000]: Integrity constraint violation: 1452 Cannot add or update a child row');

      expect(mockMerchantRepository.save).toHaveBeenCalledTimes(1);
      expect(mockMerchantRepository.createLifecycleEvent).toHaveBeenCalledTimes(1);
      expect(mockEventBusService.publish).not.toHaveBeenCalled();
    });

    test('should propagate error on general database error during merchant status update', async () => {
      mockMerchant.status = MerchantStatus.DRAFT;
      const generalDbError = new Error('Database connection timed out during transaction commit.');
      (generalDbError as any).code = 'ER_LOCK_WAIT_TIMEOUT'; // Example general database error
      mockMerchantRepository._simulateError.save = generalDbError;

      await expect(
        merchantLifecycleService.applyLifecycleEvent(
          TEST_MERCHANT_ID,
          LifecycleEventType.ACTIVATE,
          {},
          TEST_TENANT_ID,
          TEST_USER_ID,
        ),
      ).rejects.toThrow('Database connection timed out during transaction commit.');

      expect(mockMerchantRepository.save).toHaveBeenCalledTimes(1);
      expect(mockMerchantRepository.createLifecycleEvent).not.toHaveBeenCalled(); // Should not proceed if save fails
      expect(mockEventBusService.publish).not.toHaveBeenCalled();
    });
  });
});

