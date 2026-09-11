import { Controller, Get, Post, Put, Param, Body, Query, HttpCode, HttpStatus, NotFoundException, Request } from '@nestjs/common';

import { PurchaseOrdersService } from './purchase-orders.service';
import { 
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto, // DTO for matching invoices
 } from './dto/purchase-order.dto'; type PurchaseOrderQueryDto = any; type ReceivePurchaseOrderDto = any;

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  /**
   * Creates a new purchase order.
   * A purchase order starts in a 'DRAFT' status.
   * @param createPurchaseOrderDto The DTO for creating a purchase order.
   * @param req The request object containing user/tenant information.
   * @returns The created purchase order.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Extract tenantId from the request user object
    return (this.purchaseOrdersService as any).create(tenantId, createPurchaseOrderDto);
  }

  /**
   * Retrieves all purchase orders for a given tenant, with optional query filters.
   * @param query The DTO for querying purchase orders.
   * @param req The request object containing user/tenant information.
   * @returns A list of purchase orders.
   */
  @Get()
  async findAll(@Query() query: PurchaseOrderQueryDto, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Extract tenantId
    return (this.purchaseOrdersService as any).findAll(tenantId, query);
  }

  /**
   * Retrieves a single purchase order by its ID.
   * @param id The ID of the purchase order.
   * @param req The request object containing user/tenant information.
   * @returns The purchase order found.
   * @throws NotFoundException if the purchase order is not found for the given ID and tenant.
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Extract tenantId
    const purchaseOrder = await (this.purchaseOrdersService as any).findOne(tenantId, id);
    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID "${id}" not found.`);
    }
    return purchaseOrder;
  }

  /**
   * Updates an existing purchase order.
   * This might be used to modify draft POs, or update details of sent POs (e.g., expected delivery date).
   * @param id The ID of the purchase order to update.
   * @param updatePurchaseOrderDto The DTO containing the updated purchase order data.
   * @param req The request object containing user/tenant information.
   * @returns The updated purchase order.
   * @throws NotFoundException if the purchase order is not found for the given ID and tenant.
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Extract tenantId
    const updatedPurchaseOrder = await (this.purchaseOrdersService as any).update(tenantId, id, updatePurchaseOrderDto);
    if (!updatedPurchaseOrder) {
      throw new NotFoundException(`Purchase Order with ID "${id}" not found.`);
    }
    return updatedPurchaseOrder;
  }

  /**
   * Marks a purchase order as received and updates inventory stock.
   * Items can be fully or partially received.
   * @param id The ID of the purchase order to mark as received.
   * @param receivePurchaseOrderDto The DTO containing details of received items.
   * @param req The request object containing user/tenant information.
   * @returns The updated purchase order.
   * @throws NotFoundException if the purchase order is not found for the given ID and tenant.
   */
  @Put(':id/receive')
  async receive(@Param('id') id: string, @Body() receivePurchaseOrderDto: ReceivePurchaseOrderDto, @Request() req: any) {
    const tenantId = req?.user?.tenantId; // Extract tenantId
    const receivedPurchaseOrder = await (this.purchaseOrdersService as any).receivePurchaseOrder(tenantId, id, receivePurchaseOrderDto);
    if (!receivedPurchaseOrder) {
      // Assuming if the service returns null, the PO was not found or could not be processed for reception.
      throw new NotFoundException(`Purchase Order with ID "${id}" not found or cannot be received.`);
    }
    return receivedPurchaseOrder;
  }
}

