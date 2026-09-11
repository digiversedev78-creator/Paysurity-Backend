import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';

import { EmployeeSchedulesService } from './employee-schedules.service';
import { CreateEmployeeScheduleDto } from './dto/create-employee-schedule.dto';
import { UpdateEmployeeScheduleDto } from './dto/update-employee-schedule.dto';

@Controller('employees/:employeeId/schedules')
export class EmployeeSchedulesController {
  constructor(private readonly employeeSchedulesService: EmployeeSchedulesService) {}

  @Post()
  async create(
    @Param('employeeId') employeeId: string,
    @Body() createEmployeeScheduleDto: CreateEmployeeScheduleDto,
  ) {
    return (this.employeeSchedulesService as any).create(employeeId, createEmployeeScheduleDto);
  }

  @Get()
  async findAll(@Param('employeeId') employeeId: string) {
    return (this.employeeSchedulesService as any).findAll(employeeId);
  }

  @Get(':id')
  async findOne(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ) {
    return (this.employeeSchedulesService as any).findOne(employeeId, id);
  }

  @Put(':id')
  async update(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
    @Body() updateEmployeeScheduleDto: UpdateEmployeeScheduleDto,
  ) {
    return (this.employeeSchedulesService as any).update(employeeId, id, updateEmployeeScheduleDto);
  }

  @Delete(':id')
  async remove(
    @Param('employeeId') employeeId: string,
    @Param('id') id: string,
  ) {
    return (this.employeeSchedulesService as any).remove(employeeId, id);
  }
}


