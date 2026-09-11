/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  ORC-007 -- Dispute Management
 * FILE TYPE:    SERVICE
 * MODULE:       disputes
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/ORC_PAYMENT_ORCHESTRATION.md
 * WORKER:       CODER-007
 * GENERATED:    2026-03-17T11:38:25.090Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
// fixed by fix-import-paths
import { AuditLogService } from '../audit-log/audit-log.service' // fixed; // Assuming AuditLogService exists
import * as schema from '@paysurity/database' // fixed; // Assuming Drizzle schema file
import { eq, and, asc, desc, ilike, gte, lte } from 'drizzle-orm';
import { CreateDisputeDto, UpdateDisputeDto, DisputeQueryDto, DisputeStatus } from './dto/dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
        @Inject('DATABASE') private readonly db: any,
        private readonly auditLogService: AuditLogService,
  ) {}

  private readonly disputesTable = (schema as any).disputes;
  private readonly entityType = 'Dispute';

  /**
   * Creates a new dispute.
   * @param tenantId The ID of the tenant.
   * @param createDisputeDto Data for creating the dispute.
   * @returns The newly created dispute.
   */
  async createDispute(
    tenantId: string,
    createDisputeDto: CreateDisputeDto,
  ): Promise<any> {
    const newDispute = {
      ...createDisputeDto,
      tenantId,
      status: DisputeStatus.PENDING, // Default status
    };

    const [dispute] = await this.db
      .insert(this.disputesTable)
      .values(newDispute)
      .returning();

    if (!dispute) {
      throw new BadRequestException('Failed to create dispute.');
    }

    await (this.auditLogService as any).logAuditAction(
      tenantId,
      this.entityType,
      dispute.id,
      'CREATE',
      { newValues: dispute },
    );

    return dispute;
  }

  /**
   * Retrieves a dispute by its ID.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the dispute.
   * @returns The found dispute.
   */
  async getDisputeById(
    tenantId: string,
    id: string,
  ): Promise<any> {
    const [dispute] = await this.db
      .select()
      .from(this.disputesTable)
      .where(and(eq(this.disputesTable.id, id), eq(this.disputesTable.tenantId, tenantId)));

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found.`);
    }
    return dispute;
  }

  /**
   * Retrieves a list of disputes based on query parameters.
   * @param tenantId The ID of the tenant.
   * @param queryDto Query parameters for filtering and pagination.
   * @returns An array of disputes.
   */
  async getDisputes(
    tenantId: string,
    queryDto: DisputeQueryDto,
  ): Promise<any[]> {
    const { status, transactionId, amountMin, amountMax, startDate, endDate, limit = 10, offset = 0, sortBy = 'createdAt', sortOrder = 'desc'  } = (queryDto as any);

    const conditions = [eq(this.disputesTable.tenantId, tenantId)];

    if (status) {
      conditions.push(eq(this.disputesTable.status, status));
    }
    if (transactionId) {
      conditions.push(ilike(this.disputesTable.transactionId, `%${transactionId}%`));
    }
    if (amountMin !== undefined) {
      conditions.push(gte(this.disputesTable.amount, amountMin.toString()));
    }
    if (amountMax !== undefined) {
      conditions.push(lte(this.disputesTable.amount, amountMax.toString()));
    }
    if (startDate) {
      conditions.push(gte(this.disputesTable.createdAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(this.disputesTable.createdAt, new Date(endDate)));
    }

    const orderByField = this.disputesTable[sortBy];
    if (!orderByField) {
      throw new BadRequestException(`Invalid sortBy field: ${sortBy}`);
    }
    const orderBy = sortOrder === 'asc' ? asc(orderByField) : desc(orderByField);

    return this.db
      .select()
      .from(this.disputesTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);
  }

  /**
   * Updates an existing dispute.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the dispute to update.
   * @param updateDisputeDto Data for updating the dispute.
   * @returns The updated dispute.
   */
  async updateDispute(
    tenantId: string,
    id: string,
    updateDisputeDto: UpdateDisputeDto,
  ): Promise<any> {
    const existingDispute = await this.getDisputeById(tenantId, id);

    const [updatedDispute] = await this.db
      .update(this.disputesTable)
      .set({ ...updateDisputeDto, updatedAt: new Date() })
      .where(and(eq(this.disputesTable.id, id), eq(this.disputesTable.tenantId, tenantId)))
      .returning();

    if (!updatedDispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found or failed to update.`);
    }

    await (this.auditLogService as any).logAuditAction(
      tenantId,
      this.entityType,
      id,
      'UPDATE',
      { oldValues: existingDispute, newValues: updatedDispute },
    );

    return updatedDispute;
  }

  /**
   * Updates the status of a dispute.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the dispute to update.
   * @param newStatus The new status for the dispute.
   * @returns The updated dispute.
   */
  async updateDisputeStatus(
    tenantId: string,
    id: string,
    newStatus: DisputeStatus,
  ): Promise<any> {
    const existingDispute = await this.getDisputeById(tenantId, id);

    if (existingDispute.status === newStatus) {
      return existingDispute; // No change needed
    }

    const [updatedDispute] = await this.db
      .update(this.disputesTable)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(this.disputesTable.id, id), eq(this.disputesTable.tenantId, tenantId)))
      .returning();

    if (!updatedDispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found or failed to update status.`);
    }

    await (this.auditLogService as any).logAuditAction(
      tenantId,
      this.entityType,
      id,
      'STATUS_CHANGE',
      { oldStatus: existingDispute.status, newStatus: updatedDispute.status },
    );

    return updatedDispute;
  }

  /**
   * Deletes a dispute.
   * @param tenantId The ID of the tenant.
   * @param id The ID of the dispute to delete.
   */
  async deleteDispute(tenantId: string, id: string): Promise<void> {
    const existingDispute = await this.getDisputeById(tenantId, id); // Ensure dispute exists for tenant

    const result = await this.db
      .delete(this.disputesTable)
      .where(and(eq(this.disputesTable.id, id), eq(this.disputesTable.tenantId, tenantId)))
      .returning({ id: this.disputesTable.id });

    if (result.length === 0) {
      throw new NotFoundException(`Dispute with ID ${id} not found or already deleted.`);
    }

    await (this.auditLogService as any).logAuditAction(
      tenantId,
      this.entityType,
      id,
      'DELETE',
      { deletedValues: existingDispute },
    );
  }
}




