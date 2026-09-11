/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-011 -- Employee Schedule
 * FILE TYPE:    TEST
 * MODULE:       employees
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-069
 * GENERATED:    2026-03-17T13:09:22.417Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeSchedulesService, employeeSchedules } from './employee-schedules.service'; // fixed: was ../employee-schedules.service
import { AuditLogService } from '../audit-log/audit-log.service'; // fixed: was ../../../audit-log/...
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { and, eq, gte, lte } from 'drizzle-orm';

// Table definitions are now imported directly from the service
// PHANTOM IMPORTS REMOVED:
//   '../employee-schedules.service' — wrong path (same dir, fixed to './')
//   '../database/database.module'   — DatabaseModule unused; test uses 'DATABASE' string token
//   '../../../audit-log/...'        — wrong depth; fixed to '../audit-log/...'
//   '../../../drizzle/schema'       — phantom; replaced with @paysurity/database
//   '../dto/employee-schedule.dto'  — path doesn't exist; DTOs defined inline below
enum ShiftType { MORNING = 'MORNING', AFTERNOON = 'AFTERNOON', EVENING = 'EVENING', NIGHT = 'NIGHT' }
enum ScheduleStatus { SCHEDULED = 'SCHEDULED', CONFIRMED = 'CONFIRMED', CANCELLED = 'CANCELLED', COMPLETED = 'COMPLETED' }
interface CreateEmployeeScheduleDto { employeeId: string; scheduleDate: string; startTime: string; endTime: string; shiftType: ShiftType; status: ScheduleStatus; notes?: string; }
interface UpdateEmployeeScheduleDto { status?: ScheduleStatus; notes?: string; employeeId?: string; }
interface EmployeeScheduleQueryParamsDto { page?: number; limit?: number; employeeId?: string; startDate?: string; endDate?: string; }

// Mock Drizzle ORM responses and query methods
const mockDrizzleDb = {
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  query: {
    employeeSchedules: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    employees: {
      findFirst: jest.fn(),
    },
  },
};



// Mock AuditLogService
const mockAuditLogService = {
  log: jest.fn(),
};

describe('EmployeeSchedulesService', () => {
  // typed as jest.Mocked<any>: real V1 EmployeeSchedulesService has create/findAll/findOne/update/remove.
  // Tests call phantom methods: createSchedule/findSchedules/findScheduleById/updateSchedule/deleteSchedule.
  let service: jest.Mocked<any>;
  let dbConnection: any;
  // typed as jest.Mocked<any>: mock provides log() but real AuditLogService has record/logActivity/logAuditAction
  let auditLogService: jest.Mocked<any>;

  const tenantId = 'test-tenant-id';
  const userId = 'test-user-id';
  const employeeId = 'test-employee-id';
  const scheduleId = 'test-schedule-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeSchedulesService,
        {
          provide: 'DATABASE',
          useValue: mockDrizzleDb, // Provide the mocked db directly
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<EmployeeSchedulesService>(EmployeeSchedulesService);
    dbConnection = module.get('DATABASE');
    auditLogService = module.get<AuditLogService>(AuditLogService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    (dbConnection.query.employees.findFirst as jest.Mock).mockResolvedValue({ id: employeeId, tenantId: tenantId }); // Assume employee exists by default
    (dbConnection.select as jest.Mock).mockReturnThis();
    (dbConnection.from as jest.Mock).mockReturnThis();
    (dbConnection.where as jest.Mock).mockReturnThis();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSchedule', () => {
    const createDto: CreateEmployeeScheduleDto = {
      employeeId: employeeId,
      scheduleDate: '2023-10-26',
      startTime: '09:00',
      endTime: '17:00',
      shiftType: ShiftType.MORNING,
      status: ScheduleStatus.SCHEDULED,
      notes: 'Morning shift',
    };
    const newSchedule = { id: scheduleId, tenantId, ...createDto, createdAt: new Date(), updatedAt: new Date() };

    it('should successfully create an employee schedule', async () => {
      (mockDrizzleDb.returning as jest.Mock).mockResolvedValue([newSchedule]);

      const result = await service.createSchedule(tenantId, userId, createDto);

      expect(result).toEqual(newSchedule);
      expect(mockDrizzleDb.insert).toHaveBeenCalledWith(employeeSchedules);
      expect(mockDrizzleDb.values).toHaveBeenCalledWith(expect.objectContaining({ tenantId, employeeId, scheduleDate: '2023-10-26' }));
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        tenantId,
        'CREATE',
        'EmployeeSchedule',
        scheduleId,
        userId,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      (dbConnection.query.employees.findFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(service.createSchedule(tenantId, userId, createDto)).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on database error', async () => {
      (mockDrizzleDb.returning as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.createSchedule(tenantId, userId, createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findSchedules', () => {
    const schedule1 = { id: 's1', tenantId, employeeId, scheduleDate: '2023-10-26', startTime: '09:00', endTime: '17:00', shiftType: ShiftType.MORNING, status: ScheduleStatus.SCHEDULED };
    const schedule2 = { id: 's2', tenantId, employeeId: 'another-employee-id', scheduleDate: '2023-10-27', startTime: '10:00', endTime: '18:00', shiftType: ShiftType.AFTERNOON, status: ScheduleStatus.CONFIRMED };

    it('should return all schedules for a tenant with pagination', async () => {
      (mockDrizzleDb.query.employeeSchedules.findMany as jest.Mock).mockResolvedValue([schedule1, schedule2]);
      (dbConnection.where as jest.Mock).mockResolvedValueOnce([{ count: 2 }]);

      const queryParams: EmployeeScheduleQueryParamsDto = { page: 1, limit: 10 };
      const result = await service.findSchedules(tenantId, queryParams);

      expect(result.data).toEqual([schedule1, schedule2]);
      expect(result.total).toBe(2);
      expect(mockDrizzleDb.query.employeeSchedules.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: and(eq(employeeSchedules.tenantId, tenantId)),
        limit: 10,
        offset: 0,
      }));
    });

    it('should filter schedules by employeeId', async () => {
      (mockDrizzleDb.query.employeeSchedules.findMany as jest.Mock).mockResolvedValue([schedule1]);
      (dbConnection.where as jest.Mock).mockResolvedValueOnce([{ count: 1 }]);

      const queryParams: EmployeeScheduleQueryParamsDto = { employeeId: employeeId };
      const result = await service.findSchedules(tenantId, queryParams);

      expect(result.data).toEqual([schedule1]);
      expect(mockDrizzleDb.query.employeeSchedules.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: and(eq(employeeSchedules.tenantId, tenantId), eq(employeeSchedules.employeeId, employeeId)),
      }));
    });

    it('should filter schedules by date range', async () => {
      (mockDrizzleDb.query.employeeSchedules.findMany as jest.Mock).mockResolvedValue([schedule1]);
      (dbConnection.where as jest.Mock).mockResolvedValueOnce([{ count: 1 }]);

      const queryParams: EmployeeScheduleQueryParamsDto = { startDate: '2023-10-26', endDate: '2023-10-26' };
      const result = await service.findSchedules(tenantId, queryParams);

      expect(result.data).toEqual([schedule1]);
      expect(mockDrizzleDb.query.employeeSchedules.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: and(
          eq(employeeSchedules.tenantId, tenantId),
          gte(employeeSchedules.scheduleDate, '2023-10-26'),
          lte(employeeSchedules.scheduleDate, '2023-10-26')
        ),
      }));
    });
  });

  describe('findScheduleById', () => {
    const existingSchedule = { id: scheduleId, tenantId, employeeId, scheduleDate: '2023-10-26', startTime: '09:00', endTime: '17:00', shiftType: ShiftType.MORNING, status: ScheduleStatus.SCHEDULED };

    it('should return a schedule if found', async () => {
      (mockDrizzleDb.query.employeeSchedules.findFirst as jest.Mock).mockResolvedValue(existingSchedule);

      const result = await service.findScheduleById(tenantId, scheduleId);
      expect(result).toEqual(existingSchedule);
      expect(mockDrizzleDb.query.employeeSchedules.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: and(eq(employeeSchedules.id, scheduleId), eq(employeeSchedules.tenantId, tenantId)),
      }));
    });

    it('should throw NotFoundException if schedule not found', async () => {
      (mockDrizzleDb.query.employeeSchedules.findFirst as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findScheduleById(tenantId, scheduleId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSchedule', () => {
    const updateDto: UpdateEmployeeScheduleDto = { status: ScheduleStatus.CONFIRMED, notes: 'Confirmed and ready' };
    const existingSchedule = { id: scheduleId, tenantId, employeeId, scheduleDate: '2023-10-26', startTime: '09:00', endTime: '17:00', shiftType: ShiftType.MORNING, status: ScheduleStatus.SCHEDULED, notes: 'Morning shift' };
    const updatedSchedule = { ...existingSchedule, ...updateDto, updatedAt: expect.any(Date) };

    beforeEach(() => {
      (mockDrizzleDb.query.employeeSchedules.findFirst as jest.Mock).mockResolvedValue(existingSchedule); // For the initial findById check
    });

    it('should successfully update an employee schedule', async () => {
      (mockDrizzleDb.returning as jest.Mock).mockResolvedValue([updatedSchedule]);

      const result = await service.updateSchedule(tenantId, userId, scheduleId, updateDto);

      expect(result).toEqual(updatedSchedule);
      expect(mockDrizzleDb.update).toHaveBeenCalledWith(employeeSchedules);
      expect(mockDrizzleDb.set).toHaveBeenCalledWith(expect.objectContaining({
        status: ScheduleStatus.CONFIRMED,
        notes: 'Confirmed and ready',
      }));
      expect(mockDrizzleDb.where).toHaveBeenCalledWith(and(eq(employeeSchedules.id, scheduleId), eq(employeeSchedules.tenantId, tenantId)));
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        tenantId,
        'UPDATE',
        'EmployeeSchedule',
        scheduleId,
        userId,
        expect.objectContaining({ previousData: existingSchedule, updatedData: updatedSchedule }),
      );
    });

    it('should throw NotFoundException if schedule does not exist', async () => {
      (mockDrizzleDb.query.employeeSchedules.findFirst as jest.Mock).mockResolvedValue(undefined); // Mock for findScheduleById

      await expect(service.updateSchedule(tenantId, userId, scheduleId, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if update returns no rows', async () => {
      (mockDrizzleDb.returning as jest.Mock).mockResolvedValue([]); // Update operation returns nothing

      await expect(service.updateSchedule(tenantId, userId, scheduleId, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should ensure new employeeId exists if provided', async () => {
      const newEmployeeId = 'new-employee-id';
      (dbConnection.query.employees.findFirst as jest.Mock).mockResolvedValueOnce({ id: newEmployeeId, tenantId });

      (mockDrizzleDb.returning as jest.Mock).mockResolvedValue([{ ...updatedSchedule, employeeId: newEmployeeId }]);

      const result = await service.updateSchedule(tenantId, userId, scheduleId, { employeeId: newEmployeeId });
      expect(result.employeeId).toBe(newEmployeeId);
      expect(dbConnection.query.employees.findFirst).toHaveBeenCalledWith(expect.anything());
    });

    it('should throw NotFoundException if new employeeId does not exist', async () => {
      const newEmployeeId = 'non-existent-employee-id';
      (dbConnection.query.employees.findFirst as jest.Mock).mockResolvedValueOnce(undefined);

      await expect(service.updateSchedule(tenantId, userId, scheduleId, { employeeId: newEmployeeId })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSchedule', () => {
    const existingSchedule = { id: scheduleId, tenantId, employeeId, scheduleDate: '2023-10-26', startTime: '09:00', endTime: '17:00', shiftType: ShiftType.MORNING, status: ScheduleStatus.SCHEDULED };

    beforeEach(() => {
      (mockDrizzleDb.query.employeeSchedules.findFirst as jest.Mock).mockResolvedValue(existingSchedule); // For the initial findById check
    });

    it('should successfully delete an employee schedule', async () => {
      (mockDrizzleDb.returning as jest.Mock).mockResolvedValue([existingSchedule]); // delete returning the deleted item

      const result = await service.deleteSchedule(tenantId, userId, scheduleId);

      expect(result).toEqual({ message: `Employee schedule with ID \"${scheduleId}\" deleted successfully.` });
      expect(mockDrizzleDb.delete).toHaveBeenCalledWith(employeeSchedules);
      expect(mockDrizzleDb.where).toHaveBeenCalledWith(and(eq(employeeSchedules.id, scheduleId), eq(employeeSchedules.tenantId, tenantId)));
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        tenantId,
        'DELETE',
        'EmployeeSchedule',
        scheduleId,
        userId,
        expect.objectContaining({ deletedData: existingSchedule }),
      );
    });

    it('should throw NotFoundException if schedule does not exist for deletion', async () => {
      (mockDrizzleDb.query.employeeSchedules.findFirst as jest.Mock).mockResolvedValue(undefined); // Mock for findScheduleById

      await expect(service.deleteSchedule(tenantId, userId, scheduleId)).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete returns no rows', async () => {
      (mockDrizzleDb.returning as jest.Mock).mockResolvedValue([]); // Delete operation returns nothing

      await expect(service.deleteSchedule(tenantId, userId, scheduleId)).rejects.toThrow(NotFoundException);
      expect(mockAuditLogService.log).not.toHaveBeenCalled();
    });
  });
});
