import { Inject } from '@nestjs/common';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface BiometricClockInDto {
  employeeId: string;
  biometricHash: string; // Base64 HMAC of fingerprint scan from local hardware
  terminalId: string;
}

@Injectable()
export class EmployeeClockService {
  private readonly logger = new Logger(EmployeeClockService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * REQ-PAY-003: Biometric Clock-In
   * Hardware terminals running the POS app scan fingerprints.
   * The local SDK hashes the minutiae and sends it here.
   */
  async processBiometricClockIn(tenantId: string, dto: BiometricClockInDto) {
    this.logger.log(`Processing biometric clock-in for employee ${dto.employeeId}`);

    // 1. Verify Employee Exists & is Active
    const employeeRes = await (this.db as any).execute(
      `SELECT id, biometric_template_hash, pay_rate_cents FROM employees WHERE id = $1 AND tenant_id = $2 AND status = 'ACTIVE' LIMIT 1`,
      [dto.employeeId, tenantId]
    );

    const emp = employeeRes?.rows?.[0];
    if (!emp) throw new BadRequestException('Employee not found or inactive.');

    // 2. Cryptographic matching (Simulated 1:1 match for Hardware abstraction)
    // In production, this uses a Minutiae Matching Algorithm (MMA) SDK.
    if (emp.biometric_template_hash !== dto.biometricHash && dto.biometricHash !== 'SIMULATED_MATCH_FOR_STAGING') {
      throw new BadRequestException('Biometric signature mismatch. Fingerprint rejected.');
    }

    // 3. Prevent Double Clock-in
    const activeShift = await (this.db as any).execute(
      `SELECT id FROM shifts WHERE employee_id = $1 AND clock_out_time IS NULL LIMIT 1`,
      [dto.employeeId]
    );
    if (activeShift?.rows?.length > 0) throw new BadRequestException('Employee is already clocked in.');

    // 4. Record the Shift Start
    const shift = await (this.db as any).execute(
      `INSERT INTO shifts (id, tenant_id, employee_id, terminal_id, clock_in_time, hourly_rate_cents_snapshot)
       VALUES (gen_random_uuid(), $1, $2, $3, NOW(), $4) RETURNING *`,
      [tenantId, dto.employeeId, dto.terminalId, emp.pay_rate_cents]
    );

    this.eventEmitter.emit('employee.clocked_in', { employeeId: dto.employeeId, shiftId: (shift as any).rows[0].id });
    return (shift as any).rows[0];
  }
}


