/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ORC-006 -- Settlement Batches
 * FILE TYPE:    CONTROLLER
 * MODULE:       settlement
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/ORC_PAYMENT_ORCHESTRATION.md
 * WORKER:       CODER-006
 * GENERATED:    2026-03-17T13:05:40.201Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {  Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus , Patch } from '@nestjs/common';
import { SettlementBatchesService } from './settlement-batches.service';
import { 
  CreateSettlementBatchDto,
  UpdateSettlementBatchDto,
  SettlementBatchFilterDto,
  SettlementBatchResponseDto} from './dto/settlement-batch.dto'; type SettlementReportDto = any;
import { Request } from 'express';

// Define a minimal interface for the authenticated user on the request object
interface AuthenticatedUser {
  id: string; // userId
  tenantId: string;
  // Add other properties like roles if needed
}

type AuthenticatedRequest = any;

// Adjusted controller path to match the requested endpoints: /settlement/batches
// Removed @UseGuards(AuthGuard) as per strict rule 4
@Controller('settlement/batches')
export class SettlementBatchesController {
  constructor(private readonly settlementBatchesService: SettlementBatchesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createSettlementBatchDto: CreateSettlementBatchDto,
  ): Promise<SettlementBatchResponseDto> {
    const tenantId = req?.user?.tenantId; // Enforced strict rule 5
    const userId = req?.user?.id;        // Enforced strict rule 5
    return (this.settlementBatchesService as any).create(
      tenantId,
      userId,
      createSettlementBatchDto,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() filters: SettlementBatchFilterDto,
  ): Promise<SettlementBatchResponseDto[]> {
    const tenantId = req?.user?.tenantId; // Enforced strict rule 5
    return (this.settlementBatchesService as any).findAll(tenantId, filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<SettlementBatchResponseDto> { // Service is expected to return detail with items if available
    const tenantId = req?.user?.tenantId; // Enforced strict rule 5
    return (this.settlementBatchesService as any).findOne(tenantId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateSettlementBatchDto: UpdateSettlementBatchDto,
  ): Promise<SettlementBatchResponseDto> {
    const tenantId = req?.user?.tenantId; // Enforced strict rule 5
    const userId = req?.user?.id;        // Enforced strict rule 5
    return (this.settlementBatchesService as any).update(
      tenantId,
      userId,
      id,
      updateSettlementBatchDto,
    );
  }

  @Post(':id/process') // Corresponds to POST /settlement/batches/:id/process
  @HttpCode(HttpStatus.OK) // Using OK for synchronous processing success, ACCEPTED might be used for async
  async processSettlementBatch(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<SettlementBatchResponseDto> { // Returns the updated batch state after processing
    const tenantId = req?.user?.tenantId; // Enforced strict rule 5
    const userId = req?.user?.id;        // Enforced strict rule 5
    return (this.settlementBatchesService as any).processBatch(tenantId, userId, id);
  }

  @Get(':id/report') // Corresponds to GET /settlement/batches/:id/report
  @HttpCode(HttpStatus.OK)
  async getSettlementReport(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<SettlementReportDto> {
    const tenantId = req?.user?.tenantId; // Enforced strict rule 5
    return (this.settlementBatchesService as any).getReport(tenantId, id);
  }
  // No @Delete(':id') method implemented as it was not requested in the task.
}





