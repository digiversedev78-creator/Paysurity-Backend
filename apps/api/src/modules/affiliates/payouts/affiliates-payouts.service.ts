import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '@paysurity/database'; const affiliatesPayouts: any = {};

// DTO types for service methods, typically defined in separate DTO files
type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'paid' | 'cancelled';

type CreateAffiliatePayoutDto = {
  affiliateId: string;
  amount: string; // Drizzle's numeric column is typically string in TS
  currency?: string;
  paymentMethod?: string;
  notes?: string;
};

type UpdateAffiliatePayoutDto = Partial<{
  amount: string;
  currency: string;
  status: PayoutStatus;
  paymentMethod: string;
  transactionId: string;
  notes: string;
  rejectionReason: string;
}>;

@Injectable()
export class AffiliatesPayoutsService {
  constructor(
    @Inject('DATABASE') private db: NodePgDatabase<any>,
  ) {}

  /**
   * Creates a new affiliate payout request.
   * @param createPayoutDto Data for the new payout.
   * @param userId The ID of the user initiating the payout request.
   * @returns The newly created payout record.
   */
  async create(createPayoutDto: CreateAffiliatePayoutDto, userId: string) {
    const [newPayout] = await this.db
      .insert(affiliatesPayouts)
      .values({
        ...createPayoutDto,
        status: 'pending', // Payouts always start as pending
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning() as any;

    if (!newPayout) {
      throw new BadRequestException('Failed to create affiliate payout.');
    }
    return newPayout;
  }

  /**
   * Retrieves all affiliate payouts, with optional filtering and pagination.
   * @param options Filtering and pagination options.
   * @returns A list of affiliate payout records.
   */
  async findAll(options?: {
    affiliateId?: string;
    status?: PayoutStatus;
    limit?: number;
    offset?: number;
  }) {
    const whereConditions = [];
    if (options?.affiliateId) {
      whereConditions.push(eq(affiliatesPayouts.affiliateId, options.affiliateId));
    }
    if (options?.status) {
      whereConditions.push(eq(affiliatesPayouts.status, options.status));
    }

    const payouts = await (this.db as any).query.affiliatesPayouts.findMany({
      where: and(...whereConditions),
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      orderBy: desc(affiliatesPayouts.createdAt),
      with: { // Assumes relations are defined for affiliatesPayouts to affiliates in @paysurity/database
        affiliate: true,
      },
    });

    return payouts;
  }

  /**
   * Retrieves a single affiliate payout by its ID.
   * @param id The ID of the payout.
   * @returns The affiliate payout record.
   * @throws NotFoundException if the payout is not found.
   */
  async findOne(id: string) {
    const payout = await (this.db as any).query.affiliatesPayouts.findFirst({
      where: eq(affiliatesPayouts.id, id),
      with: {
        affiliate: true,
      },
    });

    if (!payout) {
      throw new NotFoundException(`Affiliate payout with ID "${id}" not found.`);
    }
    return payout;
  }

  /**
   * Updates an existing affiliate payout.
   * @param id The ID of the payout to update.
   * @param updatePayoutDto Data to update the payout with.
   * @param userId The ID of the user performing the update.
   * @returns The updated payout record.
   * @throws NotFoundException if the payout is not found or fails to update.
   */
  async update(id: string, updatePayoutDto: UpdateAffiliatePayoutDto, userId: string) {
    const [updatedPayout] = await this.db
      .update(affiliatesPayouts)
      .set({
        ...updatePayoutDto,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(affiliatesPayouts.id, id))
      .returning() as any;

    if (!updatedPayout) {
      throw new NotFoundException(`Affiliate payout with ID "${id}" not found or failed to update.`);
    }
    return updatedPayout;
  }

  /**
   * Deletes an affiliate payout record.
   * In a real-world scenario, consider soft-deletion (e.g., updating a `deletedAt` field)
   * or changing its status to 'cancelled' instead of a hard delete.
   * @param id The ID of the payout to delete.
   * @param userId The ID of the user performing the deletion.
   * @returns The ID of the deleted payout.
   * @throws NotFoundException if the payout is not found or fails to delete.
   */
  async remove(id: string, userId: string) {
    const [deletedPayout] = await this.db
      .delete(affiliatesPayouts)
      .where(eq(affiliatesPayouts.id, id))
      .returning({ id: affiliatesPayouts.id });

    if (!deletedPayout) {
      throw new NotFoundException(`Affiliate payout with ID "${id}" not found or failed to delete.`);
    }
    return deletedPayout.id;
  }

  /**
   * Approves a pending affiliate payout.
   * @param id The ID of the payout to approve.
   * @param approverId The ID of the user approving the payout.
   * @returns The approved payout record.
   * @throws NotFoundException if the payout is not found.
   * @throws BadRequestException if the payout is not in 'pending' status.
   */
  async approvePayout(id: string, approverId: string) {
    const [approvedPayout] = await this.db
      .update(affiliatesPayouts)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: approverId,
        updatedAt: new Date(),
        updatedBy: approverId,
      })
      .where(and(eq(affiliatesPayouts.id, id), eq(affiliatesPayouts.status, 'pending')))
      .returning() as any;

    if (!approvedPayout) {
      const existingPayout = await this.findOne(id); // Check why it failed
      if (existingPayout.status !== 'pending') {
        throw new BadRequestException(`Payout with ID "${id}" is not pending and cannot be approved.`);
      }
      throw new NotFoundException(`Affiliate payout with ID "${id}" not found or failed to approve.`);
    }
    return approvedPayout;
  }

  /**
   * Rejects a pending affiliate payout.
   * @param id The ID of the payout to reject.
   * @param rejectionReason The reason for rejection.
   * @param approverId The ID of the user rejecting the payout.
   * @returns The rejected payout record.
   * @throws NotFoundException if the payout is not found.
   * @throws BadRequestException if the payout is not in 'pending' status.
   */
  async rejectPayout(id: string, rejectionReason: string, approverId: string) {
    const [rejectedPayout] = await this.db
      .update(affiliatesPayouts)
      .set({
        status: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: approverId,
        updatedAt: new Date(),
        updatedBy: approverId,
      })
      .where(and(
        eq(affiliatesPayouts.id, id),
        eq(affiliatesPayouts.status, 'pending')
      ))
      .returning() as any;

    if (!rejectedPayout) {
      const existingPayout = await this.findOne(id);
      if (existingPayout.status !== 'pending') {
        throw new BadRequestException(`Payout with ID "${id}" is not pending and cannot be rejected.`);
      }
      throw new NotFoundException(`Affiliate payout with ID "${id}" not found or failed to reject.`);
    }
    return rejectedPayout;
  }

  /**
   * Marks an approved affiliate payout as paid.
   * @param id The ID of the payout to mark as paid.
   * @param processorId The ID of the user/system marking the payout as paid.
   * @param transactionId An optional transaction ID from the payment processor.
   * @returns The updated payout record marked as paid.
   * @throws NotFoundException if the payout is not found.
   * @throws BadRequestException if the payout is not in 'approved' status.
   */
  async markAsPaid(id: string, processorId: string, transactionId?: string) {
    const [paidPayout] = await this.db
      .update(affiliatesPayouts)
      .set({
        status: 'paid',
        paidAt: new Date(),
        transactionId: transactionId,
        updatedAt: new Date(),
        updatedBy: processorId,
      })
      .where(and(
        eq(affiliatesPayouts.id, id),
        eq(affiliatesPayouts.status, 'approved')
      ))
      .returning() as any;

    if (!paidPayout) {
      const existingPayout = await this.findOne(id);
      if (existingPayout.status !== 'approved') {
        throw new BadRequestException(`Payout with ID "${id}" is not approved and cannot be marked as paid.`);
      }
      throw new NotFoundException(`Affiliate payout with ID "${id}" not found or failed to mark as paid.`);
    }
    return paidPayout;
  }
}





