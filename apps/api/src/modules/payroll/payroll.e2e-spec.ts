/**
 * payroll.e2e-spec.ts — PayrollController E2E Tests
 * REQ: PAY-005 — Payroll Run / ACH Generation
 *
 * Flat-provider test — does NOT import PayrollModule to avoid the
 * deep DI chain (EventBusService, ScheduleModule, AuditLogModule, etc.).
 * All service dependencies are replaced with jest mocks so that only
 * HTTP routing and controller logic is under test.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication, ValidationPipe,
  HttpStatus, NotFoundException,
} from '@nestjs/common';
const request = require('supertest');
import { v4 as uuid } from 'uuid';

import { PayrollController } from './payroll.controller';
import { PayrollRunsService } from './payroll-runs.service';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ─── Shared test data ──────────────────────────────────────────────────────────
const MOCK_TENANT_ID       = uuid();
const MOCK_PAYROLL_RUN_ID  = uuid();
const MOCK_ACH_ID          = uuid();

// ─── Mock services ─────────────────────────────────────────────────────────────
const mockPayrollRunsService = {
  getPayrollRuns:             jest.fn(),
  getPayrollRunDetail:        jest.fn(),
  storeEmployeeBankDetails:   jest.fn(),
  updateAchTransactionStatus: jest.fn(),
  processPayrollRun:          jest.fn(),
};

const mockPayrollService = {
  processPayrollRun: jest.fn(),
};

// ─── Test Suite ─────────────────────────────────────────────────────────────────
describe('PayrollController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        { provide: PayrollRunsService, useValue: mockPayrollRunsService },
        { provide: PayrollService,     useValue: mockPayrollService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    // Inject tenantId — replaces JWT guard in production
    app.use((req: any, _res: any, next: any) => {
      req.user = { tenantId: MOCK_TENANT_ID, id: uuid() };
      next();
    });

    await app.init();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /payroll/runs ─────────────────────────────────────────────────────
  describe('POST /payroll/runs', () => {
    it('should create a payroll run and return the run ID and status', async () => {
      mockPayrollService.processPayrollRun.mockResolvedValueOnce({
        runId:              MOCK_PAYROLL_RUN_ID,
        grossPayrollCents:  260000,
        totalTaxDeductionsCents: 51000,
        netPayrollCents:    209000,
        status:             'Processed & Funded Natively',
        employeeCount:      2,
      });

      const response = await request(app.getHttpServer())
        .post('/payroll/runs')
        .send({ payPeriodStart: '2023-01-01', payPeriodEnd: '2023-01-14' })
        .expect((res: any) => {
          expect([200, 201]).toContain(res.status);
        });

      expect(response.body).toBeDefined();
      expect(response.body.runId).toBe(MOCK_PAYROLL_RUN_ID);
      expect(mockPayrollService.processPayrollRun).toHaveBeenCalledWith(
        MOCK_TENANT_ID,
        expect.objectContaining({ payPeriodStart: '2023-01-01', payPeriodEnd: '2023-01-14' })
      );
    });

    it('should enforce tenant isolation — service is called with tenantId from req.user', async () => {
      mockPayrollService.processPayrollRun.mockResolvedValueOnce({
        runId: uuid(), grossPayrollCents: 0, netPayrollCents: 0,
        status: 'Processed & Funded Natively', employeeCount: 0,
      });

      await request(app.getHttpServer())
        .post('/payroll/runs')
        .send({ payPeriodStart: '2023-01-01', payPeriodEnd: '2023-01-14' })
        .expect((res: any) => expect([200, 201]).toContain(res.status));

      // service must be called (tenant isolation is enforced by the mocked call)
      expect(mockPayrollService.processPayrollRun).toHaveBeenCalled();
      const [calledTenantId] = mockPayrollService.processPayrollRun.mock.calls[0];
      expect(calledTenantId).toBe(MOCK_TENANT_ID);
    });

    it('should return 400 when payPeriodStart is missing', async () => {
      await request(app.getHttpServer())
        .post('/payroll/runs')
        .send({ payPeriodEnd: '2023-01-14' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // ─── PATCH /payroll/ach/:id/status ────────────────────────────────────────
  describe('PATCH /payroll/ach/:id/status', () => {
    it('should update the ACH status to SUBMITTED', async () => {
      mockPayrollRunsService.updateAchTransactionStatus.mockResolvedValueOnce({
        success: true,
      });

      const response = await request(app.getHttpServer())
        .patch(`/payroll/ach/${MOCK_ACH_ID}/status`)
        .send({ status: 'SUBMITTED' })
        .expect((res: any) => expect([200, 201]).toContain(res.status));

      expect(response.body.success).toBe(true);
      expect(mockPayrollRunsService.updateAchTransactionStatus).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if an invalid status value is provided', async () => {
      await request(app.getHttpServer())
        .patch(`/payroll/ach/${MOCK_ACH_ID}/status`)
        .send({ status: 'ach_invalid_status' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 if the ACH record does not exist', async () => {
      mockPayrollRunsService.updateAchTransactionStatus.mockRejectedValueOnce(
        new NotFoundException('ACH transaction not found')
      );

      const response = await request(app.getHttpServer())
        .patch(`/payroll/ach/${uuid()}/status`)
        .send({ status: 'RETURNED', returnCode: 'R01' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toBe('ACH transaction not found');
    });
  });

  // ─── GET /payroll/runs ────────────────────────────────────────────────────
  describe('GET /payroll/runs', () => {
    it('should list payroll runs for the tenant', async () => {
      mockPayrollRunsService.getPayrollRuns.mockResolvedValueOnce([
        { id: MOCK_PAYROLL_RUN_ID, status: 'ACH_GENERATED', total_gross_pay: '260000' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/payroll/runs')
        .expect(HttpStatus.OK);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(MOCK_PAYROLL_RUN_ID);
    });
  });

  // ─── GET /payroll/runs/:id ─────────────────────────────────────────────────
  describe('GET /payroll/runs/:id', () => {
    it('should return the run detail with employee line-items', async () => {
      mockPayrollRunsService.getPayrollRunDetail.mockResolvedValueOnce({
        run: { id: MOCK_PAYROLL_RUN_ID, status: 'ACH_GENERATED' },
        details: [{ employee_id: uuid(), net_pay: '2340.00' }],
      });

      const response = await request(app.getHttpServer())
        .get(`/payroll/runs/${MOCK_PAYROLL_RUN_ID}`)
        .expect(HttpStatus.OK);

      expect(response.body.run.id).toBe(MOCK_PAYROLL_RUN_ID);
      expect(response.body.details).toHaveLength(1);
    });
  });
});
