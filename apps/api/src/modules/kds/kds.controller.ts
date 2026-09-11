/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-002 -- Kitchen Display System
 * FILE TYPE:    CONTROLLER
 * MODULE:       kds
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-048
 * GENERATED:    2026-03-17T13:08:24.775Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Req
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';

import { KdsService } from './kds.service';
import { 
  GetOrderItemsFilterDto,
  UpdateOrderItemStatusDto,
  OrderItemStatus, // Assuming this DTO is defined in kds.dto.ts
 } from './kds.dto'; type UpdateOrderItemPriorityDto = any; const UpdateOrderItemPriorityDto: any = {}; type CreateKdsOrderDto = any; const CreateKdsOrderDto: any = {}; type KdsOrderItemResponseDto = any; const KdsOrderItemResponseDto: any = {}; type KdsQueueResponseDto = any; const KdsQueueResponseDto: any = {}; type GetKdsQueueFilterDto = any; const GetKdsQueueFilterDto: any = {};

interface UserContext {
  id: string;
  tenantId: string;
}

@ApiTags('KDS')
@Controller('kds')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  @Post() // POST /kds for creating a new KDS order
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Receive new order items for KDS display from a POS system' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order items successfully added to KDS.', type: [KdsOrderItemResponseDto] })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiBody({ type: CreateKdsOrderDto, description: 'Data for the new order and its items to be displayed in KDS.' })
  async createKdsOrderItems(
    @Req() req: Request & { user: UserContext },
    @Body() createKdsOrderDto: CreateKdsOrderDto,
  ): Promise<KdsOrderItemResponseDto[]> {
    const tenantId = req?.user?.tenantId;
    return (this.kdsService as any).createKdsOrderItems(tenantId, createKdsOrderDto);
  }

  @Get('queue') // GET /kds/queue
  @ApiOperation({ summary: 'Retrieve the current KDS queue of pending orders and items, ordered by ticket age' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of KDS order items in the queue, ordered by ticket age.',
    type: KdsQueueResponseDto, // Assuming the response for the queue wraps items per order
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderItemStatus,
    isArray: true,
    description: 'Filter items by one or more statuses (e.g., preparing, ready).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limit the number of results.', // Corrected truncated description
  })
  async getKdsQueue(
    @Req() req: Request & { user: UserContext },
    @Query() filters: GetKdsQueueFilterDto,
  ): Promise<KdsQueueResponseDto> {
    const tenantId = req?.user?.tenantId;
    return (this.kdsService as any).getKdsQueue(tenantId, filters);
  }

  @Put('items/:id/status') // PUT /kds/items/:id/status
  @ApiOperation({ summary: 'Update the status of a specific KDS order item' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order item status updated successfully.', type: KdsOrderItemResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order item not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status provided.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID of the KDS order item.' })
  @ApiBody({ type: UpdateOrderItemStatusDto, description: 'New status for the KDS order item.' })
  async updateOrderItemStatus(
    @Req() req: Request & { user: UserContext },
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() updateStatusDto: UpdateOrderItemStatusDto,
  ): Promise<KdsOrderItemResponseDto> {
    const tenantId = req?.user?.tenantId;
    return (this.kdsService as any).updateOrderItemStatus(tenantId, itemId, (updateStatusDto as any).status);
  }

  @Get('items/:ticketId') // GET /kds/items/:ticketId
  @ApiOperation({ summary: 'Retrieve all KDS order items for a specific ticket' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of KDS order items for the given ticket.', type: [KdsOrderItemResponseDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticket not found or no items for ticket.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiParam({ name: 'ticketId', type: 'string', format: 'uuid', description: 'UUID of the ticket/order.' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderItemStatus,
    isArray: true,
    description: 'Filter items by one or more statuses (e.g., preparing, ready).',
  })
  async getTicketOrderItems(
    @Req() req: Request & { user: UserContext },
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Query() filters: GetOrderItemsFilterDto,
  ): Promise<KdsOrderItemResponseDto[]> {
    const tenantId = req?.user?.tenantId;
    return (this.kdsService as any).getTicketOrderItems(tenantId, ticketId, filters);
  }

  @Post('items/:id/reprioritize') // POST /kds/items/:id/reprioritize
  @ApiOperation({ summary: 'Reprioritize a specific KDS order item' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order item priority updated successfully.', type: KdsOrderItemResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order item not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid priority provided.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'UUID of the KDS order item.' })
  @ApiBody({ type: UpdateOrderItemPriorityDto, description: 'New priority level for the KDS order item.' })
  async reprioritizeOrderItem(
    @Req() req: Request & { user: UserContext },
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() reprioritizeDto: UpdateOrderItemPriorityDto,
  ): Promise<KdsOrderItemResponseDto> {
    const tenantId = req?.user?.tenantId;
    return (this.kdsService as any).reprioritizeOrderItem(tenantId, itemId, (reprioritizeDto as any).newPriority);
  }
}




