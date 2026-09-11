import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PayrollService } from './payroll.service';
import { PayrollRunsService } from './payroll-runs.service';
import { PayrollController } from './payroll.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DatabaseModule } from '../database/database.module';
import { PayrollCalculationEngine } from './payroll-calculation.engine';

@Module({
  imports: [
    AuditLogModule,
    DatabaseModule,
    ScheduleModule,
  ],
  controllers: [PayrollController],
  providers: [
    PayrollCalculationEngine,
    PayrollService,
    PayrollRunsService,
  ],
  exports: [PayrollService, PayrollRunsService],
})
export class PayrollModule {}
