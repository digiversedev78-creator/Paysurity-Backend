import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';

const AuthUser = (...args: any[]) => () => {};
type UserContext = any;
import { PayrollRunsService } from '../services/payroll-runs.service';
 type CreatePayrollRunDto = any; type UpdatePayrollRunDto = any; type PayrollRunIdParamDto = any;
type GetPayrollRunsQueryDto = any;

@Controller('payroll-runs')
export class PayrollRunsController {
  constructor(private readonly payrollRunsService: PayrollRunsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPayrollRunDto: CreatePayrollRunDto,
    user: any,
  ) {
    return (this.payrollRunsService as any).create(createPayrollRunDto, user);
  }

  @Get()
  async findAll(
    @Query() query: GetPayrollRunsQueryDto,
    user: any,
  ) {
    return (this.payrollRunsService as any).findAll(query, user);
  }

  @Get(':id')
  async findOne(
    @Param() params: PayrollRunIdParamDto,
    user: any,
  ) {
    return (this.payrollRunsService as any).findOne(params.id, user);
  }

  @Put(':id')
  async update(
    @Param() params: PayrollRunIdParamDto,
    @Body() updatePayrollRunDto: UpdatePayrollRunDto,
    user: any,
  ) {
    return (this.payrollRunsService as any).update(params.id, updatePayrollRunDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param() params: PayrollRunIdParamDto,
    user: any,
  ) {
    await (this.payrollRunsService as any).remove(params.id, user);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param() params: PayrollRunIdParamDto,
    user: any,
  ) {
    return (this.payrollRunsService as any).submitPayrollRun(params.id, user);
  }
}






