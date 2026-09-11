import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Schema import
let locationTable: any;
try {
  const schema = require('@paysurity/database');
  locationTable = schema.locations;
} catch {}

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (this.db && locationTable) {
      try {
        return await (this.db as any).select().from(locationTable)
          .where(eq(locationTable.tenantId, tenantId));
      } catch (err) {
        this.logger.warn(`[LOCATION] DB query failed: ${err}`);
      }
    }
    return [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (this.db && locationTable) {
      try {
        const rows = await (this.db as any).select().from(locationTable)
          .where(and(eq(locationTable.id, id), eq(locationTable.tenantId, tenantId)))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        this.logger.warn(`[LOCATION] DB findById failed: ${err}`);
      }
    }
    throw new NotFoundException(`Location ${id} not found`);
  }

  async create(tenantId: string, data: Record<string, any>): Promise<any> {
    const id = randomUUID();
    if (this.db && locationTable) {
      try {
        const [row] = await (this.db as any).insert(locationTable).values({
          id, tenantId, ...data,
        }).returning();
        return row;
      } catch (err) {
        this.logger.warn(`[LOCATION] DB create failed: ${err}`);
      }
    }
    return { id, tenantId, ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, tenantId: string, data: Record<string, any>): Promise<any> {
    if (this.db && locationTable) {
      try {
        const [row] = await (this.db as any).update(locationTable)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(locationTable.id, id), eq(locationTable.tenantId, tenantId)))
          .returning();
        return row;
      } catch (err) {
        this.logger.warn(`[LOCATION] DB update failed: ${err}`);
      }
    }
    return { id, tenantId, ...data };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    if (this.db && locationTable) {
      try {
        await (this.db as any).delete(locationTable)
          .where(and(eq(locationTable.id, id), eq(locationTable.tenantId, tenantId)));
        return true;
      } catch (err) {
        this.logger.warn(`[LOCATION] DB delete failed: ${err}`);
      }
    }
    return false;
  }
}

