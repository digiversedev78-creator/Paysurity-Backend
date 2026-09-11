import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Schema import
let customercrmTable: any;
try {
  const schema = require('@paysurity/database');
  customercrmTable = schema.customers;
} catch {}

@Injectable()
export class CustomerCrmService {
  private readonly logger = new Logger(CustomerCrmService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (this.db && customercrmTable) {
      try {
        return await (this.db as any).select().from(customercrmTable)
          .where(eq(customercrmTable.tenantId, tenantId));
      } catch (err) {
        this.logger.warn(`[CUSTOMERCRM] DB query failed: ${err}`);
      }
    }
    return [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (this.db && customercrmTable) {
      try {
        const rows = await (this.db as any).select().from(customercrmTable)
          .where(and(eq(customercrmTable.id, id), eq(customercrmTable.tenantId, tenantId)))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        this.logger.warn(`[CUSTOMERCRM] DB findById failed: ${err}`);
      }
    }
    throw new NotFoundException(`CustomerCrm ${id} not found`);
  }

  async create(tenantId: string, data: Record<string, any>): Promise<any> {
    const id = randomUUID();
    if (this.db && customercrmTable) {
      try {
        const [row] = await (this.db as any).insert(customercrmTable).values({
          id, tenantId, ...data,
        }).returning();
        return row;
      } catch (err) {
        this.logger.warn(`[CUSTOMERCRM] DB create failed: ${err}`);
      }
    }
    return { id, tenantId, ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, tenantId: string, data: Record<string, any>): Promise<any> {
    if (this.db && customercrmTable) {
      try {
        const [row] = await (this.db as any).update(customercrmTable)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(customercrmTable.id, id), eq(customercrmTable.tenantId, tenantId)))
          .returning();
        return row;
      } catch (err) {
        this.logger.warn(`[CUSTOMERCRM] DB update failed: ${err}`);
      }
    }
    return { id, tenantId, ...data };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    if (this.db && customercrmTable) {
      try {
        await (this.db as any).delete(customercrmTable)
          .where(and(eq(customercrmTable.id, id), eq(customercrmTable.tenantId, tenantId)));
        return true;
      } catch (err) {
        this.logger.warn(`[CUSTOMERCRM] DB delete failed: ${err}`);
      }
    }
    return false;
  }
}

