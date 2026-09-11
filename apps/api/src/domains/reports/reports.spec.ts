/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-008 -- Statement/1099-K
 * FILE TYPE:    TEST
 * MODULE:       reports
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-116
 * GENERATED:    2026-03-17T13:10:57.560Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as request from 'supertest';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { GenerateMerchantStatementDto, ReportFormat, ReportGenerationResponseDto, ReportGenerationStatus } from './dto/generate-merchant-statement.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from '../audit-log/audit-log.service' // fixed; // For mocking

describe('ReportsController', () => {
  let app: INestApplication;
  let reportsService: ReportsService;

  // Mock implementations for dependencies
  const mockReportsService = {
    generateMerchantStatementReport: jest.fn(),
  };

  const mockAuditLogService = {
    log: jest.fn(),
  };

  // Mock data for tenant, user, and merchant IDs
  const mockTenantId = 'f7e9b1c3-d5a8-4e2f-8b0d-1e7c9a6f3b2d';
  const mockUserId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  const mockMerchantId = 'b8c7a6d5-e4f3-2109-8765-43210fedcba9';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        { provide: AuditLogService, useValue: mockAuditLogService }, // Mock AuditLogService
        // No need to mock JwtService if AuthGuard is overridden
      ],
    })
    .overrideGuard(AuthGuard('jwt')) // Override the JWT AuthGuard to simulate authentication
    .useValue({
      canActivate: (context) => {
        const req = context.switchToHttp().getRequest();
        // Populate req.user with mock authenticated user data
        req.user = { id: mockUserId, tenantId: mockTenantId, roles: ['admin'] };
        return true; // Allow access
      },
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true })); // Enable DTO validation globally
    await app.init();

    reportsService = moduleFixture.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(reportsService).toBeDefined();
  });

  describe('POST /reports/merchants/statements/generate', () => {
    const generateDto: GenerateMerchantStatementDto = {
      merchantId: mockMerchantId,
      startDate:  '2023-01-01',
      endDate:    '2023-12-31',
      // type defaults to MERCHANT_STATEMENT
      format: ReportFormat.PDF,
    };

    const serviceResponse: ReportGenerationResponseDto = {
      jobId: 'RPT-MOCKMERC-1234567890',
      message: 'Report generation initiated successfully.',
      downloadUrl: `/api/v1/reports/merchants/statements/RPT-MOCKMERC-1234567890/download?format=pdf`,
      status: ReportGenerationStatus.PENDING,
    };

    it('should successfully initiate report generation and return 202 Accepted', async () => {
      mockReportsService.generateMerchantStatementReport.mockResolvedValue(serviceResponse);

      const response = await request(app.getHttpServer())
        .post('/reports/merchants/statements/generate')
        .set('Authorization', 'Bearer mock-jwt-token') // Mock auth header
        .send(generateDto)
        .expect(HttpStatus.ACCEPTED);

      expect(response.body).toEqual(serviceResponse);
      expect(mockReportsService.generateMerchantStatementReport).toHaveBeenCalledWith(
        generateDto,
        mockTenantId,
        mockUserId
      );
    });

    it('should return 400 Bad Request for invalid merchantId format', async () => {
      // reportType/year are not fields in the canonical DTO — use invalid enum value for 'type'
      const invalidDto = { ...generateDto, type: 'UNKNOWN_TYPE' as any };

      const response = await request(app.getHttpServer())
        .post('/reports/merchants/statements/generate')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(expect.arrayContaining(['Merchant ID must be a valid UUID v4']));
      expect(mockReportsService.generateMerchantStatementReport).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request for a missing startDate', async () => {
      const invalidDto = { merchantId: mockMerchantId, endDate: '2023-12-31', format: ReportFormat.PDF };

      const response = await request(app.getHttpServer())
        .post('/reports/merchants/statements/generate')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(expect.arrayContaining(['Start date must be a valid date string (YYYY-MM-DD)']));
      expect(mockReportsService.generateMerchantStatementReport).not.toHaveBeenCalled();
    });


    it('should return 404 Not Found if ReportsService throws NotFoundException', async () => {
      mockReportsService.generateMerchantStatementReport.mockRejectedValueOnce(
        new NotFoundException(`Merchant with ID \"${generateDto.merchantId}\" not found for the given tenant.`)
      );

      const response = await request(app.getHttpServer())
        .post('/reports/merchants/statements/generate')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(generateDto)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toBe(`Merchant with ID \"${generateDto.merchantId}\" not found for the given tenant.`);
      expect(mockReportsService.generateMerchantStatementReport).toHaveBeenCalledTimes(1);
    });

    it('should return 500 Internal Server Error if ReportsService throws InternalServerErrorException', async () => {
      mockReportsService.generateMerchantStatementReport.mockRejectedValueOnce(
        new InternalServerErrorException('Failed to generate report due to an unexpected issue.')
      );

      const response = await request(app.getHttpServer())
        .post('/reports/merchants/statements/generate')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(generateDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body.message).toBe('Failed to generate report due to an unexpected issue.');
      expect(mockReportsService.generateMerchantStatementReport).toHaveBeenCalledTimes(1);
    });

    it('should return 500 Internal Server Error if tenantId is missing from auth context', async () => {
      // Temporarily override AuthGuard again to simulate missing tenantId
      await app.close(); // Close existing app to re-configure testing module
      const moduleFixtureWithoutTenantId: TestingModule = await Test.createTestingModule({
        controllers: [ReportsController],
        providers: [
          { provide: ReportsService, useValue: mockReportsService },
          { provide: AuditLogService, useValue: mockAuditLogService },
        ],
      })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: mockUserId, roles: ['admin'] }; // Simulate missing tenantId
          return true;
        },
      })
      .compile();

      app = moduleFixtureWithoutTenantId.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
      await app.init();

      const response = await request(app.getHttpServer())
        .post('/reports/merchants/statements/generate')
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(generateDto)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body.message).toBe('Tenant ID is missing. Cannot process request.');
      expect(mockReportsService.generateMerchantStatementReport).not.toHaveBeenCalled();
    });
  });
});
