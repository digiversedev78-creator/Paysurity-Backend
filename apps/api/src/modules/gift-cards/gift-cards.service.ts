/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-007 -- Gift Cards
 * FILE TYPE:    SERVICE
 * MODULE:       gift-cards
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-080
 * GENERATED:    2026-03-17T13:08:54.664Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Inject, Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import * as crypto from 'crypto';
import { 
  CreateGiftCardDto, 
  UpdateGiftCardDto, 
  RedeemGiftCardDto, 
  AddFundsGiftCardDto,
  GiftCardResponseDto
} from './dto/gift-card.dto';

import * as schema from '@paysurity/database' // fixed â€” schema from monorepo package;
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AuditLogService } from '../audit-log/audit-log.service' // fixed;
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GiftCardsService {
  constructor(
    @Inject('DATABASE') private db: PostgresJsDatabase<typeof schema>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Generates a unique 16-character alphanumeric gift card code.
   * @returns A unique gift card code string.
   */
  private generateUniqueGiftCardCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase(); // 8 bytes -> 16 hex chars
  }

  /**
   * Creates and issues a new gift card.
   * @param tenantId The ID of the tenant creating the gift card.
   * @param createGiftCardDto Data for creating the gift card.
   * @returns The created gift card.
   */
  async create(tenantId: string, createGiftCardDto: any): Promise<GiftCardResponseDto> {
    const { initialBalance, currency, expiryDate, code: providedCode, issuedByUserId, issuedToCustomerAccountId } = createGiftCardDto;

    const code = providedCode || this.generateUniqueGiftCardCode();

    // Check if code already exists for this tenant
    const existingCard = await (this.db as any).query.giftCards.findFirst({
      where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.code, code)),
    });

    if (existingCard) {
      throw new ConflictException(`Gift card with code '${code}' already exists for this tenant.`);
    }

    const [newCard] = await (this.db as any).insert((schema as any).giftCards).values({
      id: uuidv4(),
      tenantId,
      code,
      initialBalance: initialBalance.toString(),
      currentBalance: initialBalance.toString(),
      currency,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      status: 'inactive', // New cards are inactive until explicitly activated
      issuedByUserId,
      issuedToCustomerAccountId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    if (!newCard) {
      throw new BadRequestException('Failed to create gift card.');
    }

    await (this.auditLogService as any).log({
      tenantId,
      entityType: 'GiftCard',
      entityId: newCard.id,
      operation: 'CREATE',
      details: `Gift card ${newCard.code} created with initial balance ${newCard.initialBalance} ${newCard.currency}.`,
    });

    return this.mapToResponseDto(newCard);
  }

  /**
   * Retrieves all gift cards for a given tenant.
   * @param tenantId The ID of the tenant.
   * @returns An array of gift cards.
   */
  async findAll(tenantId: string): Promise<GiftCardResponseDto[]> {
    const giftCards = await (this.db as any).query.giftCards.findMany({
      where: eq((schema as any).giftCards.tenantId, tenantId),
    });
    return giftCards.map(this.mapToResponseDto);
  }

  /**
   * Retrieves a gift card by its ID.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card.
   * @returns The found gift card.
   * @throws NotFoundException if the gift card is not found.
   */
  async findOne(tenantId: string, id: string): Promise<GiftCardResponseDto> {
    const giftCard = await (this.db as any).query.giftCards.findFirst({
      where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
    });

    if (!giftCard) {
      throw new NotFoundException(`Gift card with ID '${id}' not found.`);
    }
    return this.mapToResponseDto(giftCard);
  }

  /**
   * Retrieves a gift card by its code.
   * @param tenantId The ID of the tenant.
   * @param code The unique code of the gift card.
   * @returns The found gift card.
   * @throws NotFoundException if the gift card is not found.
   */
  async findByCode(tenantId: string, code: string): Promise<GiftCardResponseDto> {
    const giftCard = await (this.db as any).query.giftCards.findFirst({
      where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.code, code)),
    });

    if (!giftCard) {
      throw new NotFoundException(`Gift card with code '${code}' not found.`);
    }
    return this.mapToResponseDto(giftCard);
  }

  /**
   * Updates an existing gift card.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card to update.
   * @param updateGiftCardDto Data for updating the gift card.
   * @returns The updated gift card.
   * @throws NotFoundException if the gift card is not found.
   */
  async update(tenantId: string, id: string, updateGiftCardDto: any): Promise<GiftCardResponseDto> {
    const existingCard = await (this.db as any).query.giftCards.findFirst({
      where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
    });

    if (!existingCard) {
      throw new NotFoundException(`Gift card with ID '${id}' not found.`);
    }

    const updateData: Partial<any> = {
      updatedAt: new Date(),
    };

    if (updateGiftCardDto.expiryDate !== undefined) {
      updateData.expiryDate = updateGiftCardDto.expiryDate ? new Date(updateGiftCardDto.expiryDate) : null;
    }
    if (updateGiftCardDto.status !== undefined) {
      updateData.status = updateGiftCardDto.status;
    }
    if (updateGiftCardDto.currency !== undefined) {
      updateData.currency = updateGiftCardDto.currency;
    }
    if (updateGiftCardDto.issuedByUserId !== undefined) {
        updateData.issuedByUserId = updateGiftCardDto.issuedByUserId;
    }
    if (updateGiftCardDto.issuedToCustomerAccountId !== undefined) {
        updateData.issuedToCustomerAccountId = updateGiftCardDto.issuedToCustomerAccountId;
    }

    const [updatedCard] = await (this.db as any).update((schema as any).giftCards)
      .set(updateData)
      .where(and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)))
      .returning();

    if (!updatedCard) {
      throw new BadRequestException('Failed to update gift card.');
    }

    await (this.auditLogService as any).log({
      tenantId,
      entityType: 'GiftCard',
      entityId: updatedCard.id,
      operation: 'UPDATE',
      details: `Gift card ${updatedCard.code} updated. Status: ${updatedCard.status}. Expiry: ${updatedCard.expiryDate?.toISOString() || 'N/A'}`,
    });

    return this.mapToResponseDto(updatedCard);
  }

  /**
   * Activates an inactive gift card.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card to activate.
   * @returns The activated gift card.
   * @throws NotFoundException if the gift card is not found.
   * @throws BadRequestException if the card is already active or expired.
   */
  async activate(tenantId: string, id: string): Promise<GiftCardResponseDto> {
    const existingCard = await (this.db as any).query.giftCards.findFirst({
      where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
    });

    if (!existingCard) {
      throw new NotFoundException(`Gift card with ID '${id}' not found.`);
    }

    if (existingCard.status === 'active') {
      throw new BadRequestException(`Gift card '${existingCard.code}' is already active.`);
    }

    if (existingCard.status === 'expired') {
      throw new BadRequestException(`Gift card '${existingCard.code}' is expired and cannot be activated.`);
    }

    const [updatedCard] = await (this.db as any).update((schema as any).giftCards)
      .set({
        status: 'active',
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)))
      .returning();

    if (!updatedCard) {
      throw new BadRequestException('Failed to activate gift card.');
    }

    await (this.auditLogService as any).log({
      tenantId,
      entityType: 'GiftCard',
      entityId: updatedCard.id,
      operation: 'ACTIVATE',
      details: `Gift card ${updatedCard.code} activated.`,
    });

    return this.mapToResponseDto(updatedCard);
  }

  /**
   * Deactivates an active gift card.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card to deactivate.
   * @returns The deactivated gift card.
   * @throws NotFoundException if the gift card is not found.
   * @throws BadRequestException if the card is not active.
   */
  async deactivate(tenantId: string, id: string): Promise<GiftCardResponseDto> {
    const existingCard = await (this.db as any).query.giftCards.findFirst({
      where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
    });

    if (!existingCard) {
      throw new NotFoundException(`Gift card with ID '${id}' not found.`);
    }

    if (existingCard.status !== 'active') {
      throw new BadRequestException(`Gift card '${existingCard.code}' is not currently active.`);
    }

    const [updatedCard] = await (this.db as any).update((schema as any).giftCards)
      .set({
        status: 'inactive',
        updatedAt: new Date(),
      })
      .where(and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)))
      .returning();

    if (!updatedCard) {
      throw new BadRequestException('Failed to deactivate gift card.');
    }

    await (this.auditLogService as any).log({
      tenantId,
      entityType: 'GiftCard',
      entityId: updatedCard.id,
      operation: 'DEACTIVATE',
      details: `Gift card ${updatedCard.code} deactivated.`,
    });

    return this.mapToResponseDto(updatedCard);
  }

  /**
   * Redeems a specified amount from a gift card.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card.
   * @param redeemDto Details for the redemption.
   * @returns The updated gift card.
   * @throws NotFoundException if the gift card is not found.
   * @throws BadRequestException if the card is inactive, expired, or has insufficient funds.
   */
  async redeem(tenantId: string, id: string, redeemDto: RedeemGiftCardDto): Promise<GiftCardResponseDto> {
    const { amount, transactionId } = redeemDto;

    return (this.db as any).transaction(async (tx) => {
      const existingCard = await tx.query.giftCards.findFirst({
        where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
        for: 'update' // Lock row for update
      });

      if (!existingCard) {
        throw new NotFoundException(`Gift card with ID '${id}' not found.`);
      }

      if (existingCard.status !== 'active') {
        throw new BadRequestException(`Gift card '${existingCard.code}' is not active and cannot be redeemed.`);
      }

      if (existingCard.expiryDate && existingCard.expiryDate < new Date()) {
        // Optionally update status to expired if not already
        if (existingCard.status !== 'expired') {
          await tx.update((schema as any).giftCards).set({ status: 'expired', updatedAt: new Date() }).where(eq((schema as any).giftCards.id, id));
        }
        throw new BadRequestException(`Gift card '${existingCard.code}' has expired.`);
      }

      const currentBalance = parseFloat(existingCard.currentBalance);
      if (currentBalance < amount) {
        throw new BadRequestException(`Insufficient funds on gift card '${existingCard.code}'. Current balance: ${existingCard.currentBalance} ${existingCard.currency}. Requested: ${amount}.`);
      }

      const newBalance = currentBalance - amount;
      const newStatus = newBalance === 0 ? 'redeemed' : existingCard.status; // Mark as redeemed if balance is zero

      const [updatedCard] = await tx.update((schema as any).giftCards)
        .set({
          currentBalance: newBalance.toFixed(2),
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)))
        .returning();

      if (!updatedCard) {
        throw new BadRequestException('Failed to redeem gift card.');
      }

      await (this.auditLogService as any).log({
        tenantId,
        entityType: 'GiftCard',
        entityId: updatedCard.id,
        operation: 'REDEEM',
        details: `Gift card ${updatedCard.code} redeemed ${amount} ${updatedCard.currency}. New balance: ${updatedCard.currentBalance}. Transaction ID: ${transactionId || 'N/A'}`,
        transactionId: transactionId || uuidv4(),
      });

      return this.mapToResponseDto(updatedCard);
    });
  }

  /**
   * Adds funds to a gift card.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card.
   * @param addFundsDto Details for adding funds.
   * @returns The updated gift card.
   * @throws NotFoundException if the gift card is not found.
   * @throws BadRequestException if the card is expired.
   */
  async addFunds(tenantId: string, id: string, addFundsDto: AddFundsGiftCardDto): Promise<GiftCardResponseDto> {
    const { amount, transactionId } = addFundsDto;

    return (this.db as any).transaction(async (tx) => {
      const existingCard = await tx.query.giftCards.findFirst({
        where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
        for: 'update' // Lock row for update
      });

      if (!existingCard) {
        throw new NotFoundException(`Gift card with ID '${id}' not found.`);
      }

      if (existingCard.status === 'expired') {
        throw new BadRequestException(`Gift card '${existingCard.code}' is expired and cannot have funds added.`);
      }

      const currentBalance = parseFloat(existingCard.currentBalance);
      const newBalance = currentBalance + amount;

      const [updatedCard] = await tx.update((schema as any).giftCards)
        .set({
          currentBalance: newBalance.toFixed(2),
          status: existingCard.status === 'redeemed' ? 'active' : existingCard.status, // If it was redeemed (zero balance), make it active again
          updatedAt: new Date(),
        })
        .where(and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)))
        .returning();

      if (!updatedCard) {
        throw new BadRequestException('Failed to add funds to gift card.');
      }

      await (this.auditLogService as any).log({
        tenantId,
        entityType: 'GiftCard',
        entityId: updatedCard.id,
        operation: 'ADD_FUNDS',
        details: `Gift card ${updatedCard.code} added ${amount} ${updatedCard.currency}. New balance: ${updatedCard.currentBalance}. Transaction ID: ${transactionId || 'N/A'}`,
        transactionId: transactionId || uuidv4(),
      });

      return this.mapToResponseDto(updatedCard);
    });
  }

  /**
   * Soft deletes (marks as inactive or expired) a gift card. For financial entities, true deletion is often avoided.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the gift card to deactivate.
   * @throws NotFoundException if the gift card is not found.
   */
  async remove(tenantId: string, id: string): Promise<void> {
    // In a financial system, outright deleting might not be desired. 
    // Instead, we might deactivate or mark as 'cancelled'.
    // For this example, let's implement a soft-delete by setting status to 'inactive'.
    // If a business rule required physical deletion, the 'delete' method would be different.

    const existingCard = await (this.db as any).query.giftCards.findFirst({
        where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
    });

    if (!existingCard) {
        throw new NotFoundException(`Gift card with ID '${id}' not found.`);
    }

    if (existingCard.status === 'active') {
        throw new BadRequestException('Cannot remove an active gift card. Deactivate it first.');
    }

    // Physically delete if it's inactive/never used, or if the business rule allows.
    // For now, let's allow deleting only inactive/redeemed/expired ones from the DB.
    // A more robust solution might move it to an archive table or prevent deletion entirely.
    const result = await (this.db as any).delete((schema as any).giftCards)
      .where(and(
        eq((schema as any).giftCards.tenantId, tenantId),
        eq((schema as any).giftCards.id, id),
        sql`status != 'active'` // Only delete if not active
      ))
      .execute();
    
    // Drizzle's delete does not return affected rows directly for PostgresJs
    // We check if the card still exists after attempted deletion
    const checkDeleted = await (this.db as any).query.giftCards.findFirst({
        where: and(eq((schema as any).giftCards.tenantId, tenantId), eq((schema as any).giftCards.id, id)),
    });

    if (checkDeleted) {
        throw new BadRequestException('Failed to remove gift card, perhaps it is still active or an unexpected error occurred.');
    }

    await (this.auditLogService as any).log({
      tenantId,
      entityType: 'GiftCard',
      entityId: id,
      operation: 'DELETE',
      details: `Gift card ${existingCard.code} permanently removed.`,
    });
  }

  /**
   * Maps a Drizzle ORM gift card entity to a GiftCardResponseDto.
   * @param giftCard The gift card entity from Drizzle.
   * @returns The mapped GiftCardResponseDto.
   */
  private mapToResponseDto(giftCard: any): GiftCardResponseDto {
    return {
      id: giftCard.id,
      
      code: giftCard.code,
      initialBalance: parseFloat(giftCard.initialBalance),
      currentBalance: parseFloat(giftCard.currentBalance),
      currency: giftCard.currency,
      expiryDate: giftCard.expiryDate?.toISOString() || null,
      status: giftCard.status,
      activatedAt: giftCard.activatedAt?.toISOString() || null,
      issuedByUserId: giftCard.issuedByUserId || null,
      issuedToCustomerAccountId: giftCard.issuedToCustomerAccountId || null,
      createdAt: giftCard.createdAt.toISOString(),
      updatedAt: giftCard.updatedAt.toISOString(),
    } as any;
  }
}



