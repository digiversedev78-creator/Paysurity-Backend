import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Schema import
let settlementbatchTable: any;
try {
  const schema = require('@paysurity/database');
  settlementbatchTable = schema.settlementBatches;
} catch {}

@Injectable()
export class SettlementBatchService {
  private readonly logger = new Logger(SettlementBatchService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (this.db && settlementbatchTable) {
      try {
        return await (this.db as any).select().from(settlementbatchTable)
          .where(eq(settlementbatchTable.tenantId, tenantId));
      } catch (err) {
        this.logger.warn(`[SETTLEMENTBATCH] DB query failed: ${err}`);
      }
    }
    return [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (this.db && settlementbatchTable) {
      try {
        const rows = await (this.db as any).select().from(settlementbatchTable)
          .where(and(eq(settlementbatchTable.id, id), eq(settlementbatchTable.tenantId, tenantId)))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        this.logger.warn(`[SETTLEMENTBATCH] DB findById failed: ${err}`);
      }
    }
    throw new NotFoundException(`SettlementBatch ${id} not found`);
  }

  async create(tenantId: string, data: Record<string, any>): Promise<any> {
    const id = randomUUID();
    if (this.db && settlementbatchTable) {
      try {
        const [row] = await (this.db as any).insert(settlementbatchTable).values({
          id, tenantId, ...data,
        }).returning();
        return row;
      } catch (err) {
        this.logger.warn(`[SETTLEMENTBATCH] DB create failed: ${err}`);
      }
    }
    return { id, tenantId, ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, tenantId: string, data: Record<string, any>): Promise<any> {
    if (this.db && settlementbatchTable) {
      try {
        const [row] = await (this.db as any).update(settlementbatchTable)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(settlementbatchTable.id, id), eq(settlementbatchTable.tenantId, tenantId)))
          .returning();
        return row;
      } catch (err) {
        this.logger.warn(`[SETTLEMENTBATCH] DB update failed: ${err}`);
      }
    }
    return { id, tenantId, ...data };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    if (this.db && settlementbatchTable) {
      try {
        await (this.db as any).delete(settlementbatchTable)
          .where(and(eq(settlementbatchTable.id, id), eq(settlementbatchTable.tenantId, tenantId)));
        return true;
      } catch (err) {
        this.logger.warn(`[SETTLEMENTBATCH] DB delete failed: ${err}`);
      }
    }
    return false;
  }
}

