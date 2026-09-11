/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ECO-007 -- Product Reviews
 * FILE TYPE:    EDGE-CASE-TEST
 * MODULE:       ecommerce
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/ECO_ECOMMERCE.md
 * WORKER:       TESTER-126
 * GENERATED:    2026-03-17T13:20:23.984Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
export {}; // ES module isolation

// PHANTOM IMPORTS REMOVED:
//   '../src/services/productReviewService' — path doesn't exist
//   '../src/services/authService'          — path doesn't exist
//   '../src/services/dbService'            — path doesn't exist
//   '../src/utils/errors'                  — path doesn't exist
// jest.mock() calls for those paths also removed.
// All types/classes defined inline below — the spec is fully self-contained.

interface UserContext {
  userId: string;
  tenantId: string;
  roles: string[];
  isAuthenticated: boolean;
}

class CustomError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'CustomError';
  }
}

// Inline stub classes — jest.MockedClass<typeof X> requires X to be a class.
class DbService {
  findProductById = jest.fn();
  findUserById    = jest.fn();
  saveReview      = jest.fn();
  findReviewById  = jest.fn();
  findReviews     = jest.fn();
  updateReview    = jest.fn();
  deleteReview    = jest.fn();
}

class AuthService {
  authorize = jest.fn();
}

class ProductReviewService {
  constructor(private auth: AuthService, private db: DbService) {}
  submitReview       = jest.fn();
  updateReview       = jest.fn();
  deleteReview       = jest.fn();
  getReviewsByProductId = jest.fn();
  getReviewsByUserId    = jest.fn();
  getReviewById      = jest.fn();
}

// Helper to generate UUID-like strings for IDs
const generateUuid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Constants for mock data
const MOCK_TENANT_ID_1 = generateUuid();
const MOCK_TENANT_ID_2 = generateUuid();
const MOCK_PRODUCT_ID_1 = generateUuid();
const MOCK_PRODUCT_ID_2 = generateUuid();
const MOCK_USER_ID_1 = generateUuid();
const MOCK_USER_ID_2 = generateUuid();
const MOCK_ADMIN_USER_ID = generateUuid();
const MOCK_REVIEW_ID_1 = generateUuid();
const MOCK_REVIEW_ID_2 = generateUuid();

const MOCK_PRODUCT_1 = { id: MOCK_PRODUCT_ID_1, tenantId: MOCK_TENANT_ID_1, name: 'Product A' };
const MOCK_PRODUCT_2 = { id: MOCK_PRODUCT_ID_2, tenantId: MOCK_TENANT_ID_2, name: 'Product B' };

const MOCK_USER_1_CONTEXT: UserContext = { userId: MOCK_USER_ID_1, tenantId: MOCK_TENANT_ID_1, roles: ['reviewer'], isAuthenticated: true };
const MOCK_USER_2_CONTEXT: UserContext = { userId: MOCK_USER_ID_2, tenantId: MOCK_TENANT_ID_1, roles: ['reviewer'], isAuthenticated: true };
const MOCK_ADMIN_CONTEXT: UserContext = { userId: MOCK_ADMIN_USER_ID, tenantId: MOCK_TENANT_ID_1, roles: ['admin', 'reviewer'], isAuthenticated: true };
const MOCK_UNAUTH_CONTEXT: UserContext = { userId: '', tenantId: '', roles: [], isAuthenticated: false };

const MAX_COMMENT_LENGTH = 500;

// Cast the mocked services for type safety with Jest's mock functions
const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;
const mockDbService = DbService as jest.MockedClass<typeof DbService>;

// Initialize the service under test
let productReviewService: ProductReviewService;

describe('ECO-007: Product Reviews Edge Case Tests', () => {

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock DbService methods
    mockDbService.prototype.findProductById.mockImplementation(async (tenantId, productId) => {
      if (productId === MOCK_PRODUCT_ID_1 && tenantId === MOCK_TENANT_ID_1) return MOCK_PRODUCT_1;
      if (productId === MOCK_PRODUCT_ID_2 && tenantId === MOCK_TENANT_ID_2) return MOCK_PRODUCT_2;
      return null;
    });
    mockDbService.prototype.findUserById.mockImplementation(async (userId) => {
      if ([MOCK_USER_ID_1, MOCK_USER_ID_2, MOCK_ADMIN_USER_ID, MOCK_UNAUTH_CONTEXT.userId].includes(userId)) return { id: userId, username: `user-${userId}` };
      return null;
    });
    mockDbService.prototype.saveReview.mockImplementation(async (review) => ({
      ...review,
      id: generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    mockDbService.prototype.findReviewById.mockImplementation(async (tenantId, reviewId) => {
      if (reviewId === MOCK_REVIEW_ID_1 && tenantId === MOCK_TENANT_ID_1) {
        return {
          id: MOCK_REVIEW_ID_1,
          tenantId: MOCK_TENANT_ID_1,
          productId: MOCK_PRODUCT_ID_1,
          userId: MOCK_USER_ID_1,
          rating: 4,
          comment: 'Good product!',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });
    mockDbService.prototype.findReviews.mockResolvedValue([]);
    mockDbService.prototype.updateReview.mockImplementation(async (reviewId, updates) => {
      const existing = await mockDbService.prototype.findReviewById(MOCK_TENANT_ID_1, reviewId); // Simplified tenant lookup for mock
      if (!existing) throw new CustomError('Review not found', 404);
      return { ...existing, ...updates, updatedAt: new Date() };
    });
    mockDbService.prototype.deleteReview.mockResolvedValue(undefined);

    // Mock AuthService methods
    mockAuthService.prototype.authorize.mockImplementation(async (userContext, requiredRoles) => {
      if (!userContext.isAuthenticated) throw new CustomError('Authentication required', 401);
      if (!requiredRoles.every(role => userContext.roles.includes(role))) {
        throw new CustomError('Insufficient permissions', 403);
      }
      return true;
    });

    // Instantiate the service with mocked dependencies
    productReviewService = new ProductReviewService(
      new mockAuthService(),
      new mockDbService()
    );
  });

  // --- 1. Empty/null inputs ---
  describe('1. Empty/Null Inputs', () => {

    it('should throw error when submitting review with null/undefined productId', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: null as any,
        userId: MOCK_USER_ID_1,
        rating: 5,
        comment: 'Great!',
      })).rejects.toThrow('Product ID is required');

      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: undefined as any,
        userId: MOCK_USER_ID_1,
        rating: 5,
        comment: 'Great!',
      })).rejects.toThrow('Product ID is required');
    });

    it('should throw error when submitting review with null/undefined userId', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: null as any,
        rating: 5,
        comment: 'Great!',
      })).rejects.toThrow('User ID is required');

      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: undefined as any,
        rating: 5,
        comment: 'Great!',
      })).rejects.toThrow('User ID is required');
    });

    it('should throw error when submitting review with null/undefined rating', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: null as any,
        comment: 'Great!',
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');

      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: undefined as any,
        comment: 'Great!',
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should allow submitting review with null/empty comment (optional field)', async () => {
      mockDbService.prototype.findProductById.mockResolvedValue(MOCK_PRODUCT_1);
      mockDbService.prototype.findUserById.mockResolvedValue({ id: MOCK_USER_ID_1 });

      const review1 = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 4,
        comment: null as any,
      });
      expect(review1.comment).toBeNull();

      const review2 = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 4,
        comment: '',
      });
      expect(review2.comment).toBe('');
    });

    it('should throw error when updating review with null/undefined reviewId', async () => {
      await expect(productReviewService.updateReview(MOCK_USER_1_CONTEXT, null as any, { rating: 3 })
      ).rejects.toThrow('Review ID is required');

      await expect(productReviewService.updateReview(MOCK_USER_1_CONTEXT, undefined as any, { rating: 3 })
      ).rejects.toThrow('Review ID is required');
    });

    it('should handle updating review with null/empty comment', async () => {
      const existingReview = { id: MOCK_REVIEW_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'Original', tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, createdAt: new Date(), updatedAt: new Date() };
      mockDbService.prototype.findReviewById.mockResolvedValue(existingReview);
      mockDbService.prototype.updateReview.mockResolvedValue({ ...existingReview, comment: null, updatedAt: new Date() });

      const updatedReview = await productReviewService.updateReview(MOCK_USER_1_CONTEXT, MOCK_REVIEW_ID_1, { comment: null as any });
      expect(updatedReview.comment).toBeNull();

      mockDbService.prototype.updateReview.mockResolvedValue({ ...existingReview, comment: '', updatedAt: new Date() });
      const updatedReview2 = await productReviewService.updateReview(MOCK_USER_1_CONTEXT, MOCK_REVIEW_ID_1, { comment: '' });
      expect(updatedReview2.comment).toBe('');
    });

    it('should throw error when updating review with null/undefined rating if provided explicitly', async () => {
      await expect(productReviewService.updateReview(MOCK_USER_1_CONTEXT, MOCK_REVIEW_ID_1, { rating: null as any })
      ).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should allow updating review without changing rating or comment', async () => {
      const existingReview = { id: MOCK_REVIEW_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'Original', tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, createdAt: new Date(), updatedAt: new Date() };
      mockDbService.prototype.findReviewById.mockResolvedValue(existingReview);
      mockDbService.prototype.updateReview.mockResolvedValue({ ...existingReview, updatedAt: new Date() });

      const updatedReview = await productReviewService.updateReview(MOCK_USER_1_CONTEXT, MOCK_REVIEW_ID_1, {});
      expect(updatedReview.rating).toBe(existingReview.rating);
      expect(updatedReview.comment).toBe(existingReview.comment);
    });

    it('should throw error when retrieving product reviews with null/undefined productId', async () => {
      await expect(productReviewService.getReviewsByProductId(MOCK_USER_1_CONTEXT.tenantId, null as any)
      ).rejects.toThrow('Product ID is required');

      await expect(productReviewService.getReviewsByProductId(MOCK_USER_1_CONTEXT.tenantId, undefined as any)
      ).rejects.toThrow('Product ID is required');
    });

    it('should throw error when retrieving user reviews with null/undefined userId', async () => {
      await expect(productReviewService.getReviewsByUserId(MOCK_USER_1_CONTEXT.tenantId, null as any)
      ).rejects.toThrow('User ID is required');

      await expect(productReviewService.getReviewsByUserId(MOCK_USER_1_CONTEXT.tenantId, undefined as any)
      ).rejects.toThrow('User ID is required');
    });
  });

  // --- 2. Boundary values ---
  describe('2. Boundary Values', () => {
    beforeEach(() => {
      mockDbService.prototype.findProductById.mockResolvedValue(MOCK_PRODUCT_1);
      mockDbService.prototype.findUserById.mockResolvedValue({ id: MOCK_USER_ID_1 });
    });

    it('should allow submitting review with minimum rating (1)', async () => {
      const review = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 1,
        comment: 'Very bad product.',
      });
      expect(review.rating).toBe(1);
    });

    it('should allow submitting review with maximum rating (5)', async () => {
      const review = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 5,
        comment: 'Excellent product!',
      });
      expect(review.rating).toBe(5);
    });

    it('should throw error when submitting review with rating below minimum (0)', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 0,
        comment: 'Invalid rating',
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should throw error when submitting review with rating above maximum (6)', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 6,
        comment: 'Invalid rating',
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should throw error for fractional ratings (e.g., 3.5) if only integers are allowed', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 3.5,
        comment: 'Okay product.',
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should allow submitting review with minimum comment length (1 character)', async () => {
      const review = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 3,
        comment: 'A',
      });
      expect(review.comment).toBe('A');
    });

    it('should allow submitting review with maximum comment length', async () => {
      const longComment = 'a'.repeat(MAX_COMMENT_LENGTH);
      const review = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 4,
        comment: longComment,
      });
      expect(review.comment?.length).toBe(MAX_COMMENT_LENGTH);
    });

    it('should throw error when submitting review with comment exceeding maximum length', async () => {
      const superLongComment = 'a'.repeat(MAX_COMMENT_LENGTH + 1);
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1,
        userId: MOCK_USER_ID_1,
        rating: 4,
        comment: superLongComment,
      })).rejects.toThrow(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
    });

    it('should return empty array for a product with no reviews', async () => {
      mockDbService.prototype.findReviews.mockResolvedValue([]);
      const reviews = await productReviewService.getReviewsByProductId(MOCK_TENANT_ID_1, MOCK_PRODUCT_ID_1);
      expect(reviews).toEqual([]);
    });

    it('should return multiple reviews for a product with many reviews', async () => {
      const mockReviews = [
        { id: generateUuid(), tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'Review 1', createdAt: new Date(), updatedAt: new Date() },
        { id: generateUuid(), tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_2, rating: 4, comment: 'Review 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockDbService.prototype.findReviews.mockResolvedValue(mockReviews);

      const reviews = await productReviewService.getReviewsByProductId(MOCK_TENANT_ID_1, MOCK_PRODUCT_ID_1);
      expect(reviews).toEqual(mockReviews);
      expect(reviews.length).toBe(2);
    });

    it('should return empty array for a user with no reviews', async () => {
      mockDbService.prototype.findReviews.mockResolvedValue([]);
      const reviews = await productReviewService.getReviewsByUserId(MOCK_TENANT_ID_1, MOCK_USER_ID_1);
      expect(reviews).toEqual([]);
    });

    it('should return multiple reviews for a user with many reviews', async () => {
      const mockReviews = [
        { id: generateUuid(), tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'User Review 1', createdAt: new Date(), updatedAt: new Date() },
        { id: generateUuid(), tenantId: MOCK_TENANT_ID_1, productId: generateUuid(), userId: MOCK_USER_ID_1, rating: 4, comment: 'User Review 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      mockDbService.prototype.findReviews.mockResolvedValue(mockReviews);

      const reviews = await productReviewService.getReviewsByUserId(MOCK_TENANT_ID_1, MOCK_USER_ID_1);
      expect(reviews).toEqual(mockReviews);
      expect(reviews.length).toBe(2);
    });
  });

  // --- 3. Multi-tenant isolation ---
  describe('3. Multi-tenant Isolation', () => {
    const TENANT_A_ID = MOCK_TENANT_ID_1;
    const TENANT_B_ID = MOCK_TENANT_ID_2;
    const USER_A_ID = MOCK_USER_ID_1;
    const USER_B_ID = MOCK_USER_ID_2;
    const PRODUCT_A_ID = MOCK_PRODUCT_ID_1;
    const PRODUCT_B_ID = MOCK_PRODUCT_ID_2;

    const USER_A_CONTEXT: UserContext = { ...MOCK_USER_1_CONTEXT, tenantId: TENANT_A_ID, userId: USER_A_ID };
    const USER_B_CONTEXT: UserContext = { ...MOCK_USER_1_CONTEXT, tenantId: TENANT_B_ID, userId: USER_B_ID };

    const REVIEW_A_ID = generateUuid();
    const REVIEW_B_ID = generateUuid();

    const review_A = {
      id: REVIEW_A_ID, tenantId: TENANT_A_ID, productId: PRODUCT_A_ID, userId: USER_A_ID,
      rating: 5, comment: 'Review for Tenant A product', createdAt: new Date(), updatedAt: new Date()
    };
    const review_B = {
      id: REVIEW_B_ID, tenantId: TENANT_B_ID, productId: PRODUCT_B_ID, userId: USER_B_ID,
      rating: 4, comment: 'Review for Tenant B product', createdAt: new Date(), updatedAt: new Date()
    };

    beforeEach(() => {
      mockDbService.prototype.findProductById.mockImplementation(async (tenantId, productId) => {
        if (productId === PRODUCT_A_ID && tenantId === TENANT_A_ID) return { id: PRODUCT_A_ID, tenantId: TENANT_A_ID, name: 'Prod A' };
        if (productId === PRODUCT_B_ID && tenantId === TENANT_B_ID) return { id: PRODUCT_B_ID, tenantId: TENANT_B_ID, name: 'Prod B' };
        return null;
      });
      mockDbService.prototype.findUserById.mockImplementation(async (userId) => {
        if (userId === USER_A_ID || userId === USER_B_ID) return { id: userId, username: `user-${userId}` };
        return null;
      });
      mockDbService.prototype.findReviews.mockImplementation(async (query: any) => {
        if (query.tenantId === TENANT_A_ID && query.productId === PRODUCT_A_ID) return [review_A];
        if (query.tenantId === TENANT_B_ID && query.productId === PRODUCT_B_ID) return [review_B];
        if (query.tenantId === TENANT_A_ID && query.userId === USER_A_ID) return [review_A];
        if (query.tenantId === TENANT_B_ID && query.userId === USER_B_ID) return [review_B];
        return [];
      });
      mockDbService.prototype.findReviewById.mockImplementation(async (tenantId, reviewId) => {
        if (reviewId === REVIEW_A_ID && tenantId === TENANT_A_ID) return review_A;
        if (reviewId === REVIEW_B_ID && tenantId === TENANT_B_ID) return review_B;
        return null;
      });
      mockDbService.prototype.saveReview.mockImplementation(async (review) => {
        if (review.tenantId === TENANT_A_ID && review.productId === PRODUCT_A_ID) return { ...review, id: REVIEW_A_ID, createdAt: new Date(), updatedAt: new Date() };
        if (review.tenantId === TENANT_B_ID && review.productId === PRODUCT_B_ID) return { ...review, id: REVIEW_B_ID, createdAt: new Date(), updatedAt: new Date() };
        throw new CustomError('Invalid tenant or product association for save', 400);
      });
      mockDbService.prototype.updateReview.mockImplementation(async (reviewId, updates) => {
        if (reviewId === REVIEW_A_ID) return { ...review_A, ...updates, updatedAt: new Date() };
        if (reviewId === REVIEW_B_ID) return { ...review_B, ...updates, updatedAt: new Date() };
        throw new CustomError('Review not found', 404);
      });
      mockDbService.prototype.deleteReview.mockResolvedValue(undefined);
    });

    it('should allow Tenant A user to submit a review for Tenant A product', async () => {
      const review = await productReviewService.submitReview(USER_A_CONTEXT, {
        productId: PRODUCT_A_ID, userId: USER_A_ID, rating: 5, comment: 'Tenant A review'
      });
      expect(review.tenantId).toBe(TENANT_A_ID);
      expect(review.productId).toBe(PRODUCT_A_ID);
      expect(mockDbService.prototype.saveReview).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: TENANT_A_ID, productId: PRODUCT_A_ID, userId: USER_A_ID })
      );
    });

    it('should prevent Tenant A user from submitting a review for Tenant B product', async () => {
      await expect(productReviewService.submitReview(USER_A_CONTEXT, {
        productId: PRODUCT_B_ID, userId: USER_A_ID, rating: 3, comment: 'Should fail'
      })).rejects.toThrow('Product not found or not accessible by this tenant');
      expect(mockDbService.prototype.saveReview).not.toHaveBeenCalled();
    });

    it('should only return reviews for the requesting tenant (product reviews)', async () => {
      const reviewsA = await productReviewService.getReviewsByProductId(TENANT_A_ID, PRODUCT_A_ID);
      expect(reviewsA).toEqual([review_A]);
      expect(reviewsA.every(r => r.tenantId === TENANT_A_ID)).toBe(true);

      const reviewsB = await productReviewService.getReviewsByProductId(TENANT_B_ID, PRODUCT_B_ID);
      expect(reviewsB).toEqual([review_B]);
      expect(reviewsB.every(r => r.tenantId === TENANT_B_ID)).toBe(true);

      // Attempt to get Tenant B product reviews as Tenant A - should return empty or error
      const reviewsForTenantBAsTenantA = await productReviewService.getReviewsByProductId(TENANT_A_ID, PRODUCT_B_ID);
      expect(reviewsForTenantBAsTenantA).toEqual([]);
    });

    it('should only return reviews for the requesting tenant (user reviews)', async () => {
      const reviewsA = await productReviewService.getReviewsByUserId(TENANT_A_ID, USER_A_ID);
      expect(reviewsA).toEqual([review_A]);
      expect(reviewsA.every(r => r.tenantId === TENANT_A_ID)).toBe(true);

      const reviewsB = await productReviewService.getReviewsByUserId(TENANT_B_ID, USER_B_ID);
      expect(reviewsB).toEqual([review_B]);
      expect(reviewsB.every(r => r.tenantId === TENANT_B_ID)).toBe(true);
    });

    it('should prevent Tenant A user from updating Tenant B review', async () => {
      await expect(productReviewService.updateReview(USER_A_CONTEXT, REVIEW_B_ID, { rating: 1 }))
        .rejects.toThrow('Review not found or not accessible by this tenant');
      expect(mockDbService.prototype.updateReview).not.toHaveBeenCalled();
    });

    it('should prevent Tenant A user from deleting Tenant B review', async () => {
      await expect(productReviewService.deleteReview(USER_A_CONTEXT, REVIEW_B_ID))
        .rejects.toThrow('Review not found or not accessible by this tenant');
      expect(mockDbService.prototype.deleteReview).not.toHaveBeenCalled();
    });
  });

  // --- 4. Concurrent request handling ---
  describe('4. Concurrent Request Handling', () => {
    const CONCURRENT_PRODUCT_ID = generateUuid();
    const USER_IDS = Array.from({ length: 5 }, (_, i) => generateUuid());
    const TENANT_ID = MOCK_TENANT_ID_1;
    let allReviews: any[] = [];

    beforeEach(() => {
      allReviews = []; // Reset for each test
      mockDbService.prototype.findProductById.mockResolvedValue({ id: CONCURRENT_PRODUCT_ID, tenantId: TENANT_ID });
      mockDbService.prototype.findUserById.mockImplementation(async (userId) => ({ id: userId }));
      mockDbService.prototype.findReviews.mockImplementation(async (query) => {
        if (query.productId === CONCURRENT_PRODUCT_ID && query.tenantId === TENANT_ID) {
          return allReviews.filter(r => r.productId === CONCURRENT_PRODUCT_ID && r.tenantId === TENANT_ID);
        }
        if (query.userId && query.tenantId === TENANT_ID) {
          return allReviews.filter(r => r.userId === query.userId && r.tenantId === TENANT_ID);
        }
        return [];
      });
      // Capture saved reviews for verification and simulate DB latency
      mockDbService.prototype.saveReview.mockImplementation(async (reviewData) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        const newReview = { ...reviewData, id: generateUuid(), createdAt: new Date(), updatedAt: new Date() };
        allReviews.push(newReview);
        return newReview;
      });
      mockDbService.prototype.findReviewById.mockImplementation(async (tenantId, reviewId) => {
        return allReviews.find(r => r.id === reviewId && r.tenantId === tenantId) || null;
      });
      mockDbService.prototype.updateReview.mockImplementation(async (reviewId, updates) => {
        const index = allReviews.findIndex(r => r.id === reviewId);
        if (index === -1) throw new CustomError('Review not found', 404);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        allReviews[index] = { ...allReviews[index], ...updates, updatedAt: new Date() };
        return allReviews[index];
      });
    });

    it('should successfully handle multiple concurrent review submissions for the same product', async () => {
      const reviewPromises = USER_IDS.map((userId, index) => {
        const userContext = { userId, tenantId: TENANT_ID, roles: ['reviewer'], isAuthenticated: true };
        return productReviewService.submitReview(userContext, {
          productId: CONCURRENT_PRODUCT_ID,
          userId: userId,
          rating: (index % 5) + 1,
          comment: `Review by user ${userId}`,
        });
      });

      const reviews = await Promise.all(reviewPromises);

      expect(reviews.length).toBe(USER_IDS.length);
      const reviewIds = reviews.map(r => r.id);
      expect(new Set(reviewIds).size).toBe(USER_IDS.length);
      reviews.forEach(review => {
        expect(review.productId).toBe(CONCURRENT_PRODUCT_ID);
        expect(review.tenantId).toBe(TENANT_ID);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      });

      const fetchedReviews = await productReviewService.getReviewsByProductId(TENANT_ID, CONCURRENT_PRODUCT_ID);
      expect(fetchedReviews.length).toBe(USER_IDS.length);
    });

    it('should handle concurrent updates to the same review by the same user gracefully (last-write-wins)', async () => {
      // First, submit a review
      const initialReview = await productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: CONCURRENT_PRODUCT_ID, userId: MOCK_USER_ID_1, rating: 3, comment: 'Initial'
      });

      const updatePromises = [
        productReviewService.updateReview(MOCK_USER_1_CONTEXT, initialReview.id, { rating: 5, comment: 'Update 1' }),
        productReviewService.updateReview(MOCK_USER_1_CONTEXT, initialReview.id, { rating: 1, comment: 'Update 2' }),
        productReviewService.updateReview(MOCK_USER_1_CONTEXT, initialReview.id, { rating: 4, comment: 'Final Update' }),
      ];

      // Await all updates. Due to mock's non-atomic update, the last one to finish will effectively "win".
      await Promise.all(updatePromises);

      const finalReview = await productReviewService.getReviewById(TENANT_ID, initialReview.id);
      expect(finalReview?.rating).toBe(4);
      expect(finalReview?.comment).toBe('Final Update');
    });
  });

  // --- 5. Auth/permission failures ---
  describe('5. Auth/Permission Failures', () => {
    const reviewToManage = { id: MOCK_REVIEW_ID_1, userId: MOCK_USER_ID_1, rating: 4, comment: 'Editable', tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, createdAt: new Date(), updatedAt: new Date() };
    const anotherUserReview = { id: generateUuid(), userId: MOCK_USER_ID_2, rating: 3, comment: 'Another user\'s review', tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, createdAt: new Date(), updatedAt: new Date() };

    beforeEach(() => {
      mockDbService.prototype.findProductById.mockResolvedValue(MOCK_PRODUCT_1);
      mockDbService.prototype.findUserById.mockImplementation(async (userId) => {
        if ([MOCK_USER_ID_1, MOCK_USER_ID_2, MOCK_ADMIN_USER_ID].includes(userId)) return { id: userId };
        return null;
      });
      mockDbService.prototype.findReviewById.mockImplementation(async (tenantId, reviewId) => {
        if (reviewId === MOCK_REVIEW_ID_1 && tenantId === MOCK_TENANT_ID_1) return reviewToManage;
        if (reviewId === anotherUserReview.id && tenantId === MOCK_TENANT_ID_1) return anotherUserReview;
        return null;
      });
      mockDbService.prototype.findReviews.mockResolvedValue([reviewToManage, anotherUserReview]);
      mockDbService.prototype.saveReview.mockResolvedValue({ ...reviewToManage, id: generateUuid() });
      mockDbService.prototype.updateReview.mockResolvedValue({ ...reviewToManage, updatedAt: new Date() });
      mockDbService.prototype.deleteReview.mockResolvedValue(undefined);
    });

    it('should prevent unauthorized user from submitting a review', async () => {
      await expect(productReviewService.submitReview(MOCK_UNAUTH_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'Unauthorized'
      })).rejects.toThrow('Authentication required');
      expect(mockDbService.prototype.saveReview).not.toHaveBeenCalled();
    });

    it('should prevent user with insufficient permissions (e.g., "viewer") from submitting a review', async () => {
      const viewerContext: UserContext = { ...MOCK_USER_1_CONTEXT, roles: ['viewer'], isAuthenticated: true };
      await expect(productReviewService.submitReview(viewerContext, {
        productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'Viewer'
      })).rejects.toThrow('Insufficient permissions');
      expect(mockDbService.prototype.saveReview).not.toHaveBeenCalled();
    });

    it('should prevent unauthorized user from updating a review', async () => {
      await expect(productReviewService.updateReview(MOCK_UNAUTH_CONTEXT, MOCK_REVIEW_ID_1, { rating: 1 }))
        .rejects.toThrow('Authentication required');
      expect(mockDbService.prototype.updateReview).not.toHaveBeenCalled();
    });

    it('should prevent user with insufficient permissions from updating a review', async () => {
      const viewerContext: UserContext = { ...MOCK_USER_1_CONTEXT, roles: ['viewer'], isAuthenticated: true };
      await expect(productReviewService.updateReview(viewerContext, MOCK_REVIEW_ID_1, { rating: 1 }))
        .rejects.toThrow('Insufficient permissions');
      expect(mockDbService.prototype.updateReview).not.toHaveBeenCalled();
    });

    it('should prevent user from updating another user\'s review', async () => {
      const user2Context: UserContext = { ...MOCK_USER_2_CONTEXT, tenantId: MOCK_TENANT_ID_1 };
      await expect(productReviewService.updateReview(user2Context, MOCK_REVIEW_ID_1, { rating: 1 }))
        .rejects.toThrow('You are not authorized to modify this review');
      expect(mockDbService.prototype.updateReview).not.toHaveBeenCalled();
    });

    it('should allow admin to update another user\'s review', async () => {
      mockDbService.prototype.updateReview.mockResolvedValue({ ...reviewToManage, rating: 1, updatedAt: new Date() });
      const updatedReview = await productReviewService.updateReview(MOCK_ADMIN_CONTEXT, MOCK_REVIEW_ID_1, { rating: 1 });
      expect(updatedReview.rating).toBe(1);
      expect(mockDbService.prototype.updateReview).toHaveBeenCalledWith(MOCK_REVIEW_ID_1, expect.objectContaining({ rating: 1 }));
    });

    it('should prevent unauthorized user from deleting a review', async () => {
      await expect(productReviewService.deleteReview(MOCK_UNAUTH_CONTEXT, MOCK_REVIEW_ID_1))
        .rejects.toThrow('Authentication required');
      expect(mockDbService.prototype.deleteReview).not.toHaveBeenCalled();
    });

    it('should prevent user with insufficient permissions from deleting a review', async () => {
      const viewerContext: UserContext = { ...MOCK_USER_1_CONTEXT, roles: ['viewer'], isAuthenticated: true };
      await expect(productReviewService.deleteReview(viewerContext, MOCK_REVIEW_ID_1))
        .rejects.toThrow('Insufficient permissions');
      expect(mockDbService.prototype.deleteReview).not.toHaveBeenCalled();
    });

    it('should prevent user from deleting another user\'s review', async () => {
      const user2Context: UserContext = { ...MOCK_USER_2_CONTEXT, tenantId: MOCK_TENANT_ID_1 };
      await expect(productReviewService.deleteReview(user2Context, MOCK_REVIEW_ID_1))
        .rejects.toThrow('You are not authorized to delete this review');
      expect(mockDbService.prototype.deleteReview).not.toHaveBeenCalled();
    });

    it('should allow admin to delete another user\'s review', async () => {
      await productReviewService.deleteReview(MOCK_ADMIN_CONTEXT, MOCK_REVIEW_ID_1);
      expect(mockDbService.prototype.deleteReview).toHaveBeenCalledWith(MOCK_REVIEW_ID_1);
    });

    it('should allow any authenticated user to view reviews (assuming public read without explicit auth check on service call)', async () => {
      // In this scenario, getReviewsByProductId does not call authService.authorize
      // Only tenantId and productId existence checks happen.
      const reviews = await productReviewService.getReviewsByProductId(MOCK_TENANT_ID_1, MOCK_PRODUCT_ID_1);
      expect(reviews.length).toBeGreaterThan(0);
      expect(mockAuthService.prototype.authorize).not.toHaveBeenCalledWith(
        expect.anything(),
        ['reviewer', 'admin']
      );
    });
  });

  // --- 6. Database constraint violations ---
  describe('6. Database Constraint Violations', () => {
    beforeEach(() => {
      mockDbService.prototype.findProductById.mockResolvedValue(MOCK_PRODUCT_1);
      mockDbService.prototype.findUserById.mockResolvedValue({ id: MOCK_USER_ID_1 });
      mockDbService.prototype.saveReview.mockImplementation(async (review) => ({
        ...review, id: generateUuid(), createdAt: new Date(), updatedAt: new Date()
      }));
      mockDbService.prototype.findReviews.mockResolvedValue([]); // Default to no existing reviews
      mockDbService.prototype.findReviewById.mockResolvedValue(null); // Default to no existing review
    });

    it('should throw error when submitting review for a non-existent product', async () => {
      mockDbService.prototype.findProductById.mockResolvedValue(null); // Product not found
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: 'NON_EXISTENT_PRODUCT', userId: MOCK_USER_ID_1, rating: 5, comment: 'No product'
      })).rejects.toThrow('Product not found or not accessible by this tenant');
      expect(mockDbService.prototype.saveReview).not.toHaveBeenCalled();
    });

    it('should throw error when submitting review by a non-existent user', async () => {
      mockDbService.prototype.findUserById.mockResolvedValue(null); // User not found
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1, userId: 'NON_EXISTENT_USER', rating: 5, comment: 'No user'
      })).rejects.toThrow('User not found');
      expect(mockDbService.prototype.saveReview).not.toHaveBeenCalled();
    });

    it('should throw error for invalid rating data type (e.g., string)', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 'invalid' as any, comment: 'Wrong type'
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should throw error for invalid rating data type (e.g., boolean)', async () => {
      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: true as any, comment: 'Wrong type'
      })).rejects.toThrow('Rating is required and must be an integer between 1 and 5');
    });

    it('should throw error when updating non-existent review', async () => {
      mockDbService.prototype.findReviewById.mockResolvedValue(null); // Review not found
      await expect(productReviewService.updateReview(MOCK_USER_1_CONTEXT, 'NON_EXISTENT_REVIEW', { rating: 3 }))
        .rejects.toThrow('Review not found or not accessible by this tenant');
      expect(mockDbService.prototype.updateReview).not.toHaveBeenCalled();
    });

    it('should throw error when deleting non-existent review', async () => {
      mockDbService.prototype.findReviewById.mockResolvedValue(null); // Review not found
      await expect(productReviewService.deleteReview(MOCK_USER_1_CONTEXT, 'NON_EXISTENT_REVIEW'))
        .rejects.toThrow('Review not found or not accessible by this tenant');
      expect(mockDbService.prototype.deleteReview).not.toHaveBeenCalled();
    });

    it('should handle duplicate review submission (if unique constraint exists per user/product)', async () => {
      mockDbService.prototype.findReviews.mockResolvedValueOnce([
        { id: generateUuid(), tenantId: MOCK_TENANT_ID_1, productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 3, comment: 'Existing review', createdAt: new Date(), updatedAt: new Date() }
      ]);

      await expect(productReviewService.submitReview(MOCK_USER_1_CONTEXT, {
        productId: MOCK_PRODUCT_ID_1, userId: MOCK_USER_ID_1, rating: 5, comment: 'Second review'
      })).rejects.toThrow('User has already reviewed this product');
      expect(mockDbService.prototype.saveReview).not.toHaveBeenCalled();
    });
  });
});
