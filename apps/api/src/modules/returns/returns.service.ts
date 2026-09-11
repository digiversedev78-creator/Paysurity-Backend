/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POS-003 -- Returns
 * FILE TYPE:    SERVICE
 * MODULE:       returns
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/POS_RETAIL.md
 * WORKER:       CODER-076
 * GENERATED:    2026-03-17T13:08:27.930Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
// fixed (constants â†’ DATABASE token from DatabaseModule);
// fixed by fix-import-paths
import * as schema from '@paysurity/database' // fixed â€” schema from monorepo package;
import { CreateReturnDto, UpdateReturnDto, ReturnQueryDto } from './dto/return.dto';
// fixed;

// Mock AuditLogService for demonstration. In a real application, this would be a complete service.
class MockAuditLogService { 
  log(entityType: string, entityId: string, operation: string, userId: string, tenantId: string, details?: any) {
    // console.log(`Audit Log: EntityType=${entityType}, EntityId=${entityId}, Operation=${operation}, UserId=${userId}, TenantId=${tenantId}, Details=${JSON.stringify(details)}`);
    // In a real scenario, this would persist to an audit log database.
    return Promise.resolve();
  }
}

@Injectable()
export class ReturnsService {
  private readonly auditLogService: MockAuditLogService; // Using mock for now

  constructor(
    @Inject('DATABASE') private db: NodePgDatabase<typeof schema>,
    // @Inject(AuditLogService) private auditLogService: AuditLogService, // Use this for actual service
  ) {
    this.auditLogService = new MockAuditLogService(); // Instantiate mock for example
  }

  async create(
    tenantId: string,
    createReturnDto: CreateReturnDto,
    userId: string,
  ) {
    try {
      const [newReturn] = await (this.db as any)
        .insert((schema as any).returns)
        .values({
          tenantId,
          transactionId: (createReturnDto as any).transactionId,
          returnReason: (createReturnDto as any).returnReason,
          amount: (createReturnDto as any).amount,
          currency: (createReturnDto as any).currency,
          status: 'pending', // Initial status
          processedBy: userId,
        })
        .returning();

      if (!newReturn) {
        throw new InternalServerErrorException('Failed to create return.');
      }

      await (this.auditLogService as any).log(
        'Return',
        newReturn.id,
        'CREATE',
        userId,
        tenantId,
        createReturnDto,
      );
      return newReturn;
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error creating return:', error);
      throw new InternalServerErrorException(
        'Failed to create return due to an unexpected error.',
      );
    }
  }

  async findAll(
    tenantId: string,
    query: any,
  ) {
    try {
      const { status, transactionId } = query;

      const returns = await (this.db as any).query.returns.findMany({
        where: and(
          eq((schema as any).returns.tenantId, tenantId),
          status ? eq((schema as any).returns.status, status) : undefined,
          transactionId
            ? eq((schema as any).returns.transactionId, transactionId) : undefined,
        ),
      });
      return returns;
    } catch (error) {
      console.error('Error finding all returns:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve returns due to an unexpected error.',
      );
    }
  }

  async findOne(
    tenantId: string,
    id: string,
  ) {
    try {
      const returnItem = await (this.db as any).query.returns.findFirst({
        where: and(eq((schema as any).returns.id, id), eq((schema as any).returns.tenantId, tenantId)),
      });

      if (!returnItem) {
        throw new NotFoundException(`Return with ID ${id} not found.`);
      }
      return returnItem;
    } catch (error) {
      console.error('Error finding return by ID:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve return due to an unexpected error.',
      );
    }
  }

  async update(
    tenantId: string,
    id: string,
    updateReturnDto: UpdateReturnDto,
    userId: string,
  ) {
    try {
      const existingReturn = await this.findOne(tenantId, id); // Check existence and tenantId

      const [updatedReturn] = await (this.db as any)
        .update((schema as any).returns)
        .set({
          ...updateReturnDto,
          updatedAt: new Date(),
          // Only allow specific fields to be updated via DTO
          processedBy: (updateReturnDto as any).status ? userId : existingReturn.processedBy, // Update processedBy if status changes
          processedAt: (updateReturnDto as any).status ? new Date() : existingReturn.processedAt,
        })
        .where(and(eq((schema as any).returns.id, id), eq((schema as any).returns.tenantId, tenantId)))
        .returning();

      if (!updatedReturn) {
        throw new NotFoundException(`Return with ID ${id} not found or unable to update.`);
      }

      await (this.auditLogService as any).log(
        'Return',
        id,
        'UPDATE',
        userId,
        tenantId,
        updateReturnDto,
      );
      return updatedReturn;
    } catch (error) {
      console.error('Error updating return:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update return due to an unexpected error.',
      );
    }
  }

  async remove(
    tenantId: string,
    id: string,
    userId: string,
  ) {
    try {
      // Check existence first
      await this.findOne(tenantId, id); 

      const [deletedReturn] = await (this.db as any)
        .delete((schema as any).returns)
        .where(and(eq((schema as any).returns.id, id), eq((schema as any).returns.tenantId, tenantId)))
        .returning({ id: (schema as any).returns.id });

      if (!deletedReturn) {
        throw new NotFoundException(`Return with ID ${id} not found or already deleted.`);
      }

      await (this.auditLogService as any).log(
        'Return',
        id,
        'DELETE',
        userId,
        tenantId,
      );
      return { message: `Return with ID ${id} successfully deleted.` };
    } catch (error) {
      console.error('Error deleting return:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to delete return due to an unexpected error.',
      );
    }
  }
}
















