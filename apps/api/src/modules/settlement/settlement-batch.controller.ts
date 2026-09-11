import {
  Controller, Get, Post, Put, Delete, Body, Param,
  HttpCode, HttpStatus, Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { SettlementBatchService } from './settlement-batch.service';

@ApiTags('settlementbatch')
@Controller('v1/settlement') // Changed base path to '/v1/settlement' as per task specification
@ApiBearerAuth('JWT-auth')
export class SettlementBatchController {
  constructor(private readonly service: SettlementBatchService) {}

  @Get('batches') // Path now includes 'batches'
  @ApiOperation({ summary: 'List all settlement batches' })
  async findAll(@Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    const data = await (this.service as any).findAll(tenantId);
    return { data };
  }

  @Get('batches/:id') // Path now includes 'batches'
  @ApiOperation({ summary: 'Get settlement batch by ID with its items' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    const data = await (this.service as any).findById(id, tenantId); // Assuming service.findById includes associated items
    return { data };
  }

  @Post('batches') // Path now includes 'batches'
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new settlement batch' })
  async create(@Body() body: any, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    const data = await (this.service as any).create(tenantId, body);
    return { data };
  }

  @Put('batches/:id') // Path now includes 'batches'
  @ApiOperation({ summary: 'Update settlement batch' })
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    const data = await (this.service as any).update(id, tenantId, body);
    return { data };
  }

  @Delete('batches/:id') // Path now includes 'batches'
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete settlement batch' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    await (this.service as any).delete(id, tenantId);
  }

  @Post('batches/:id/process') // New endpoint: POST /settlement/batches/:id/process
  @HttpCode(HttpStatus.OK) // Or HttpStatus.ACCEPTED if processing is asynchronous
  @ApiOperation({ summary: 'Initiate settlement process for a specific batch' })
  async processBatch(@Param('id') id: string, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    // Delegate the actual processing logic to the service layer
    const result = await (this.service as any).processBatch(id, tenantId);
    return { message: `Settlement batch ${id} processing initiated successfully.`, result };
  }

  @Get('batches/:id/report') // New endpoint: GET /settlement/batches/:id/report
  @ApiOperation({ summary: 'Generate a JSON settlement report for a specific batch' })
  async getReport(@Param('id') id: string, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Rule: Extract tenantId safely
    // Delegate the actual report generation logic to the service layer
    const report = await (this.service as any).getReport(id, tenantId);
    return { data: report }; // Assuming the service returns the report data directly
  }
}



