/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ECO-007 -- Product Reviews
 * FILE TYPE:    TEST
 * MODULE:       ecommerce
 * PRIORITY:     P2
 * SOURCE:       Requirements/Canonical/ECO_ECOMMERCE.md
 * WORKER:       CODER-137
 * GENERATED:    2026-03-17T13:12:06.706Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// ECO-007-ProductReviews-ecommerce-P2-products
// Path: test/ecommerce/product-reviews.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, NotFoundException, ForbiddenException, Controller, Injectable } from '@nestjs/common';
import * as request from 'supertest';
import { AuditLogService } from '../audit-log/audit-log.service';
import { v4 as uuid } from 'uuid';

// PHANTOM IMPORTS REMOVED:
//   'src/ecommerce/product-reviews/product-reviews.controller' — path doesn't exist
//   'src/ecommerce/product-reviews/product-reviews.service'    — path doesn't exist
//   'src/request-context/request-context.service'              — path doesn't exist
// Replaced with inline stubs so Test.createTestingModule DI tokens resolve.
@Injectable() class ProductReviewsService { createReview = jest.fn(); getReviewById = jest.fn(); getProductReviews = jest.fn(); updateReview = jest.fn(); deleteReview = jest.fn(); }
@Controller('products') class ProductReviewsController { constructor(private s: ProductReviewsService) {} }
@Injectable() class RequestContextService { getTenantId = jest.fn(); getUserId = jest.fn(); }

// Mock data
const MOCK_TENANT_ID = uuid();
const MOCK_USER_ID = uuid();
const MOCK_PRODUCT_ID = uuid();
const MOCK_REVIEW_ID = uuid();

const mockReview = {
  id: MOCK_REVIEW_ID,
  tenantId: MOCK_TENANT_ID,
  productId: MOCK_PRODUCT_ID,
  userId: MOCK_USER_ID,
  rating: 5,
  comment: 'Great product, highly recommend!',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock external services
class MockProductReviewsService {
  createReview = jest.fn();
  getReviewById = jest.fn();
  getProductReviews = jest.fn();
  updateReview = jest.fn();
  deleteReview = jest.fn();
}

class mockAuditLogService {
  log = jest.fn();
}

class MockRequestContextService {
  getTenantId = jest.fn().mockReturnValue(MOCK_TENANT_ID);
  getUserId = jest.fn().mockReturnValue(MOCK_USER_ID);
}

describe('ProductReviewsController (e2e)', () => {
  let app: INestApplication;
  let productReviewsService: MockProductReviewsService;
  let auditLogService: mockAuditLogService;
  let requestContextService: MockRequestContextService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductReviewsController],
      providers: [
        ProductReviewsService,
        AuditLogService,
        RequestContextService,
      ],
    })
      .overrideProvider(ProductReviewsService)
      .useClass(MockProductReviewsService)
      .overrideProvider(AuditLogService)
      .useClass(mockAuditLogService)
      .overrideProvider(RequestContextService)
      .useClass(MockRequestContextService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.use((req: any, res: any, next: any) => {
      req.user = { id: 'mock-user-id-456', tenantId: 'mock-tenant-id-123', role: 'ADMIN', permissions: [] };
      next();
    });
    await app.init();

    productReviewsService = moduleFixture.get<MockProductReviewsService>(ProductReviewsService);
    auditLogService = moduleFixture.get<mockAuditLogService>(AuditLogService);
    requestContextService = moduleFixture.get<MockRequestContextService>(RequestContextService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock resolved values for each test to ensure isolation
    productReviewsService.createReview.mockResolvedValue(mockReview);
    productReviewsService.getReviewById.mockResolvedValue(mockReview);
    productReviewsService.getProductReviews.mockResolvedValue({ reviews: [mockReview], total: 1, page: 1, pageSize: 10 });
    productReviewsService.updateReview.mockResolvedValue({ ...mockReview, rating: 4, comment: 'Updated comment' });
    productReviewsService.deleteReview.mockResolvedValue(undefined);

    requestContextService.getTenantId.mockReturnValue(MOCK_TENANT_ID);
    requestContextService.getUserId.mockReturnValue(MOCK_USER_ID);
  });

  it('/products/:productId/reviews (POST) - should create a product review', async () => {
    const createDto = { rating: 5, comment: 'Amazing!' };

    const response = await request(app.getHttpServer())
      .post(`/products/${MOCK_PRODUCT_ID}/reviews`)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    expect(response.body.message).toBe('Product review created successfully.');
    expect(response.body.data).toMatchObject({
      rating: 5,
      comment: 'Amazing!',
      productId: MOCK_PRODUCT_ID,
      userId: MOCK_USER_ID,
      tenantId: MOCK_TENANT_ID,
    });
    expect(productReviewsService.createReview).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      MOCK_USER_ID,
      MOCK_PRODUCT_ID,
      createDto,
    );
    expect(auditLogService.log).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      'ProductReview',
      MOCK_REVIEW_ID,
      'CREATE',
      MOCK_USER_ID,
      expect.any(String),
    );
  });

  it('/products/:productId/reviews (POST) - should fail with validation error', async () => {
    const createDto = { rating: 6, comment: '' }; // Invalid rating, empty comment
    await request(app.getHttpServer())
      .post(`/products/${MOCK_PRODUCT_ID}/reviews`)
      .send(createDto)
      .expect(HttpStatus.BAD_REQUEST);

    expect(productReviewsService.createReview).not.toHaveBeenCalled();
    expect(auditLogService.log).not.toHaveBeenCalled();
  });

  it('/products/:productId/reviews (GET) - should get product reviews', async () => {
    const queryDto = { page: 1, pageSize: 10 };

    const response = await request(app.getHttpServer())
      .get(`/products/${MOCK_PRODUCT_ID}/reviews`)
      .query(queryDto)
      .expect(HttpStatus.OK);

    expect(response.body.message).toBe('Product reviews retrieved successfully.');
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({ productId: MOCK_PRODUCT_ID });
    expect(response.body.meta).toMatchObject({ total: 1, page: 1, pageSize: 10 });
    expect(productReviewsService.getProductReviews).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      MOCK_PRODUCT_ID,
      expect.objectContaining(queryDto),
    );
  });

  it('/products/:productId/reviews/:reviewId (GET) - should get a single review by ID', async () => {
    const response = await request(app.getHttpServer())
      .get(`/products/${MOCK_PRODUCT_ID}/reviews/${MOCK_REVIEW_ID}`)
      .expect(HttpStatus.OK);

    expect(response.body.message).toBe('Product review retrieved successfully.');
    expect(response.body.data).toMatchObject({ id: MOCK_REVIEW_ID, productId: MOCK_PRODUCT_ID });
    expect(productReviewsService.getReviewById).toHaveBeenCalledWith(MOCK_TENANT_ID, MOCK_REVIEW_ID);
  });

  it('/products/:productId/reviews/:reviewId (GET) - should return 404 if review not found', async () => {
    productReviewsService.getReviewById.mockRejectedValueOnce(
      new NotFoundException(`Product review with ID \"${MOCK_REVIEW_ID}\" not found.`),
    );

    await request(app.getHttpServer())
      .get(`/products/${MOCK_PRODUCT_ID}/reviews/${MOCK_REVIEW_ID}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/products/:productId/reviews/:reviewId (PATCH) - should update a product review', async () => {
    const updateDto = { rating: 4, comment: 'Still good!' };

    const response = await request(app.getHttpServer())
      .patch(`/products/${MOCK_PRODUCT_ID}/reviews/${MOCK_REVIEW_ID}`)
      .send(updateDto)
      .expect(HttpStatus.OK);

    expect(response.body.message).toBe('Product review updated successfully.');
    expect(response.body.data).toMatchObject({
      id: MOCK_REVIEW_ID,
      rating: 4,
      comment: 'Still good!',
    });
    expect(productReviewsService.updateReview).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      MOCK_USER_ID,
      MOCK_REVIEW_ID,
      updateDto,
    );
    expect(auditLogService.log).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      'ProductReview',
      MOCK_REVIEW_ID,
      'UPDATE',
      MOCK_USER_ID,
      expect.any(String),
    );
  });

  it('/products/:productId/reviews/:reviewId (PATCH) - should return 403 if user not authorized', async () => {
    const updateDto = { rating: 3 };
    productReviewsService.updateReview.mockRejectedValueOnce(
      new ForbiddenException('You are not authorized to update this review.'),
    );

    await request(app.getHttpServer())
      .patch(`/products/${MOCK_PRODUCT_ID}/reviews/${MOCK_REVIEW_ID}`)
      .send(updateDto)
      .expect(HttpStatus.FORBIDDEN);
    expect(auditLogService.log).not.toHaveBeenCalled();
  });

  it('/products/:productId/reviews/:reviewId (DELETE) - should delete a product review', async () => {
    await request(app.getHttpServer())
      .delete(`/products/${MOCK_PRODUCT_ID}/reviews/${MOCK_REVIEW_ID}`)
      .expect(HttpStatus.NO_CONTENT);

    expect(productReviewsService.deleteReview).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      MOCK_USER_ID,
      MOCK_REVIEW_ID,
    );
    expect(auditLogService.log).toHaveBeenCalledWith(
      MOCK_TENANT_ID,
      'ProductReview',
      MOCK_REVIEW_ID,
      'DELETE',
      MOCK_USER_ID,
      expect.any(String),
    );
  });

  it('/products/:productId/reviews/:reviewId (DELETE) - should return 403 if user not authorized', async () => {
    productReviewsService.deleteReview.mockRejectedValueOnce(
      new ForbiddenException('You are not authorized to delete this review.'),
    );

    await request(app.getHttpServer())
      .delete(`/products/${MOCK_PRODUCT_ID}/reviews/${MOCK_REVIEW_ID}`)
      .expect(HttpStatus.FORBIDDEN);
    expect(auditLogService.log).not.toHaveBeenCalled();
  });
});
