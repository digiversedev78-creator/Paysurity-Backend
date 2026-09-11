import { Controller, Post, Body, Req, Get, Param, Patch, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { PayrollRunsService } from './payroll-runs.service';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export class ProcessPayrollRunDto {
  @ApiProperty({ example: '2024-01-01' }) @IsString() @IsNotEmpty() payPeriodStart!: string;
  @ApiProperty({ example: '2024-01-15' }) @IsString() @IsNotEmpty() payPeriodEnd!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() runDate?: string;
}

export class StoreBankDetailsDto {
  @ApiProperty({ example: '021000021' }) @IsString() @IsNotEmpty() routingNumber!: string;
  @ApiProperty({ example: '1234567890' }) @IsString() @IsNotEmpty() accountNumber!: string;
}

export class UpdateAchStatusDto {
  @ApiProperty({ enum: ['SUBMITTED', 'SETTLED', 'RETURNED'] }) @IsIn(['SUBMITTED', 'SETTLED', 'RETURNED']) status!: 'SUBMITTED' | 'SETTLED' | 'RETURNED';
  @ApiPropertyOptional() @IsOptional() @IsString() traceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() returnCode?: string;
}

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll')
export class PayrollController {
  constructor(
    private readonly payrollRuns: PayrollRunsService,
    private readonly payrollService: PayrollService
  ) {}

  @Post('runs')
  @ApiOperation({ summary: 'Calculate and process a new batch payroll run' })
  @ApiResponse({ status: 201, description: 'Payroll calculated and ledgers generated natively.' })
  async processPayrollRun(@Req() req: any, @Body() dto: ProcessPayrollRunDto) {
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw new UnauthorizedException('Missing tenant context');
    return (this.payrollService as any).processPayrollRun(tenantId, dto);
  }

  @Get('runs')
  @ApiOperation({ summary: 'List all historical payroll runs' })
  async getPayrollRuns(@Req() req: any) {
    if (!req.user?.tenantId) throw new UnauthorizedException('Missing tenant context');
    return this.payrollRuns.getPayrollRuns(req);
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Get line-item calculations for a specific payroll run' })
  async getPayrollRunDetail(@Req() req: any, @Param('id') runId: string) {
    if (!req.user?.tenantId) throw new UnauthorizedException('Missing tenant context');
    return this.payrollRuns.getPayrollRunDetail(req, runId);
  }

  @Post('employees/:id/bank')
  @ApiOperation({ summary: 'Securely store encrypted employee bank routing/account details' })
  async storeEmployeeBankDetails(@Req() req: any, @Param('id') employeeId: string, @Body() dto: StoreBankDetailsDto) {
    if (!req.user?.tenantId) throw new UnauthorizedException('Missing tenant context');
    return this.payrollRuns.storeEmployeeBankDetails(req, employeeId, dto);
  }

  @Patch('ach/:id/status')
  @ApiOperation({ summary: 'Webhook target to update ACH submission status from banking provider' })
  async updateAchTransactionStatus(@Req() req: any, @Param('id') achId: string, @Body() dto: UpdateAchStatusDto) {
    if (!req.user?.tenantId) throw new UnauthorizedException('Missing tenant context');
    return this.payrollRuns.updateAchTransactionStatus(req, achId, dto);
  }
}

