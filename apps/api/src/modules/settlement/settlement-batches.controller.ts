import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';

import { SettlementBatchesService } from './settlement-batches.service';
import { CreateSettlementBatchDto } from './dto/create-settlement-batch.dto';
import { UpdateSettlementBatchDto } from './dto/update-settlement-batch.dto';
import { PaginationDto } from '@paysurity/types';

@ApiTags('settlement-batches')
@ApiBearerAuth()
@Controller('settlement-batches')
export class SettlementBatchesController {
  constructor(private readonly settlementBatchesService: SettlementBatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new settlement batch' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The settlement batch has been successfully created.',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input.' })
  async create(@Body() createSettlementBatchDto: CreateSettlementBatchDto): Promise<any> {
    return (this.settlementBatchesService as any).create(createSettlementBatchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all settlement batches' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of settlement batches.' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<any[]> {
    return (this.settlementBatchesService as any).findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a settlement batch by ID' })
  @ApiParam({ name: 'id', description: 'ID of the settlement batch (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The found settlement batch.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Settlement batch not found.' })
  async findOne(@Param('id') id: string): Promise<any> {
    return (this.settlementBatchesService as any).findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a settlement batch by ID' })
  @ApiParam({ name: 'id', description: 'ID of the settlement batch (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The settlement batch has been successfully updated.',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Settlement batch not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input.' })
  async update(
    @Param('id') id: string,
    @Body() updateSettlementBatchDto: UpdateSettlementBatchDto,
  ): Promise<any> {
    return (this.settlementBatchesService as any).update(id, updateSettlementBatchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a settlement batch by ID' })
  @ApiParam({ name: 'id', description: 'ID of the settlement batch (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The settlement batch has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Settlement batch not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await (this.settlementBatchesService as any).remove(id);
  }
}

