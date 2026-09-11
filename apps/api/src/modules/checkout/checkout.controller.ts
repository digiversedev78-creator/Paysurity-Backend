// @reusable:grocerease @origin:POSR
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  GE-POS-001 -- Grocery POS Checkout
 * FILE TYPE:    CONTROLLER
 * MODULE:       checkout
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/GE_POS_Checkout.md
 * WORKER:       CODER-073
 * GENERATED:    2026-03-17T13:09:27.898Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
// This file is part of PaySurity-Platform-2026.
// Copyright (C) 2026, PaySurity. All Rights Reserved.
// GE-POS-001: Grocery POS Checkout Controller

import { Controller, Post, Body, Param, HttpCode, HttpStatus, Get, Patch, Req } from '@nestjs/common';
type CheckoutService = any;
import { VerifyAgeDto } from './dto/verify-age.dto';
type StartCheckoutDto = any; type ScanItemDto = any; type ApplyPromotionDto = any; type ProcessPaymentDto = any; type VoidItemDto = any;
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express'; // Use generic Request for tenant/user context

// Assuming a CheckoutSession response DTO
interface CheckoutSessionResponse {
  checkoutId: string;
  items: any[]; // Placeholder for item details
  subtotal: number;
  discounts: number;
  tax: number;
  total: number;
  ebtEligibleTotal: number;
  snapEligibleTotal: number;
  // ... other relevant fields
}

const ReceiptResponse: any = {}; type ReceiptResponse = any;

@ApiBearerAuth()
@ApiTags('checkout-grocerease')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate a new grocery checkout session' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Checkout session started successfully.', type: Object })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input.' })
  async startCheckout(
    @Body() startCheckoutDto: StartCheckoutDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponse> {
    const tenantId = (req as any).user?.tenantId; // Extract tenantId from request context
    const userId = (req as any).user?.id;       // Extract userId from request context

    return (this.checkoutService as any).startCheckout(tenantId, userId, startCheckoutDto);
  }

  @Post(':checkoutId/scan-item')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scan an item by barcode to add to the checkout session' })
  @ApiParam({ name: 'checkoutId', type: String, description: 'The ID of the checkout session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item added successfully.', type: Object })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Checkout session or item not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input or item already scanned.' })
  async scanItem(
    @Param('checkoutId') checkoutId: string,
    @Body() scanItemDto: ScanItemDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponse> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    return (this.checkoutService as any).scanItem(tenantId, userId, checkoutId, scanItemDto);
  }

  @Post(':checkoutId/apply-promotion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a promotion code or rule to the checkout session' })
  @ApiParam({ name: 'checkoutId', type: String, description: 'The ID of the checkout session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Promotion applied successfully.', type: Object })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Checkout session or promotion not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid promotion code or rule.' })
  async applyPromotion(
    @Param('checkoutId') checkoutId: string,
    @Body() applyPromotionDto: ApplyPromotionDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponse> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    return (this.checkoutService as any).applyPromotion(tenantId, userId, checkoutId, applyPromotionDto);
  }

  @Patch(':checkoutId/verify-age')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify age for restricted items in the checkout session' })
  @ApiParam({ name: 'checkoutId', type: String, description: 'The ID of the checkout session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Age verified successfully.', type: Object })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Checkout session not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Age verification failed or not required.' })
  async verifyAge(
    @Param('checkoutId') checkoutId: string,
    @Body() verifyAgeDto: VerifyAgeDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponse> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    return (this.checkoutService as any).verifyAge(tenantId, userId, checkoutId, verifyAgeDto);
  }

  @Get(':checkoutId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve the current state of a grocery checkout session, including calculated tax by category' })
  @ApiParam({ name: 'checkoutId', type: String, description: 'The ID of the checkout session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Checkout session retrieved successfully.', type: Object })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Checkout session not found.' })
  async getCheckoutSession(
    @Param('checkoutId') checkoutId: string,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponse> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    return (this.checkoutService as any).getCheckoutSession(tenantId, userId, checkoutId);
  }

  @Post(':checkoutId/process-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process payment for the checkout session' })
  @ApiParam({ name: 'checkoutId', type: String, description: 'The ID of the checkout session' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment processed successfully.', type: Object })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Checkout session not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Payment failed or invalid details.' })
  async processPayment(
    @Param('checkoutId') checkoutId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponse> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    return (this.checkoutService as any).processPayment(tenantId, userId, checkoutId, processPaymentDto);
  }

  @Post(':checkoutId/finalize')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Finalize the checkout session and generate a receipt' })
  @ApiParam({ name: 'checkoutId', type: String, description: 'The ID of the checkout session' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Checkout finalized and receipt generated.', type: ReceiptResponse })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Checkout session not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Checkout not ready for finalization (e.g., payment pending or incomplete).' })
  async finalizeCheckout(
    @Param('checkoutId') checkoutId: string,
    @Req() req: Request,
  ): Promise<ReceiptResponse> {
    const tenantId = (req as any).user?.tenantId;
    const userId = (req as any).user?.id;

    return (this.checkoutService as any).finalizeCheckout(tenantId, userId, checkoutId);
  }
}








