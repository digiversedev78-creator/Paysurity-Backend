/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-011 -- Tip Management
 * FILE TYPE:    CONTROLLER
 * MODULE:       tips
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-057
 * GENERATED:    2026-03-17T13:07:46.354Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
// src/tips/tips.controller.ts
import { Body, Controller, Get, Param, Put, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { TipsService } from './tips.service';
import { CreateUpdateTipDto, TipResponseDto } from './dto/tip.dto';
 // Assuming JWT Auth Guard path
import { Request } from 'express'; // Assuming express request type
import { IsUUID } from 'class-validator'; // For path parameter validation

// Custom type for request object, assuming tenantId is attached by 
type AuthRequest = any;

@Controller('orders/:orderId/tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  async upsertTip(
    @Param('orderId') orderId: string,
    @Body() createUpdateTipDto: CreateUpdateTipDto,
    @Req() req: AuthRequest,
  ): Promise<TipResponseDto> {
    const tenantId = req.user.tenantId; // Extract tenantId from authenticated user
    return (this.tipsService as any).upsertTip(tenantId, orderId, createUpdateTipDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getTip(
    @Param('orderId') orderId: string,
    @Req() req: AuthRequest,
  ): Promise<TipResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.tipsService as any).getTipByOrderId(tenantId, orderId);
  }
}






