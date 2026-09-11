/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-007 -- Gift Cards
 * FILE TYPE:    CONTROLLER
 * MODULE:       gift-cards
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-080
 * GENERATED:    2026-03-17T13:08:54.664Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { 
  CreateGiftCardDto, 
  UpdateGiftCardDto, 
  RedeemGiftCardDto, 
  AddFundsGiftCardDto, 
  ActivateGiftCardDto,
  GiftCardResponseDto
} from './dto/gift-card.dto';
import { Request } from 'express';

// Assuming a custom decorator or interceptor extracts tenantId from the request
// For this example, we'll manually get it from request.user.tenantId
type AuthenticatedRequest = any;

@Controller('gift-cards')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  /**
   * Creates a new gift card.
   * @param req The authenticated request object.
   * @param createGiftCardDto Data for creating the gift card.
   * @returns The created gift card.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() createGiftCardDto: CreateGiftCardDto): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).create(tenantId, createGiftCardDto);
  }

  /**
   * Retrieves all gift cards for the authenticated tenant.
   * @param req The authenticated request object.
   * @returns An array of gift cards.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: AuthenticatedRequest): Promise<GiftCardResponseDto[]> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).findAll(tenantId);
  }

  /**
   * Retrieves a gift card by its ID.
   * @param req The authenticated request object.
   * @param id The ID of the gift card.
   * @returns The found gift card.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).findOne(tenantId, id);
  }

  /**
   * Retrieves a gift card by its unique code.
   * @param req The authenticated request object.
   * @param code The unique code of the gift card.
   * @returns The found gift card.
   */
  @Get('by-code/:code')
  @HttpCode(HttpStatus.OK)
  async findByCode(@Req() req: AuthenticatedRequest, @Param('code') code: string): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).findByCode(tenantId, code);
  }

  /**
   * Updates an existing gift card's details.
   * @param req The authenticated request object.
   * @param id The ID of the gift card to update.
   * @param updateGiftCardDto Data for updating the gift card.
   * @returns The updated gift card.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() updateGiftCardDto: UpdateGiftCardDto): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).update(tenantId, id, updateGiftCardDto);
  }

  /**
   * Activates an inactive gift card.
   * @param req The authenticated request object.
   * @param id The ID of the gift card to activate.
   * @param activateDto An empty DTO to trigger activation (can be extended if needed).
   * @returns The activated gift card.
   */
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() activateDto: ActivateGiftCardDto): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).activate(tenantId, id);
  }

  /**
   * Deactivates an active gift card.
   * @param req The authenticated request object.
   * @param id The ID of the gift card to deactivate.
   * @returns The deactivated gift card.
   */
  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).deactivate(tenantId, id);
  }

  /**
   * Redeems a specified amount from a gift card.
   * @param req The authenticated request object.
   * @param id The ID of the gift card.
   * @param redeemDto Details for the redemption.
   * @returns The updated gift card.
   */
  @Post(':id/redeem')
  @HttpCode(HttpStatus.OK)
  async redeem(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() redeemDto: RedeemGiftCardDto): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).redeem(tenantId, id, redeemDto);
  }

  /**
   * Adds funds to a gift card.
   * @param req The authenticated request object.
   * @param id The ID of the gift card.
   * @param addFundsDto Details for adding funds.
   * @returns The updated gift card.
   */
  @Post(':id/add-funds')
  @HttpCode(HttpStatus.OK)
  async addFunds(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() addFundsDto: AddFundsGiftCardDto): Promise<GiftCardResponseDto> {
    const tenantId = req.user.tenantId;
    return (this.giftCardsService as any).addFunds(tenantId, id, addFundsDto);
  }

  /**
   * Removes (soft deletes or archives) a gift card.
   * @param req The authenticated request object.
   * @param id The ID of the gift card to remove.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    const tenantId = req.user.tenantId;
    await (this.giftCardsService as any).remove(tenantId, id);
  }
}




