import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Schema import
let featureflagTable: any;
try {
  const schema = require('@paysurity/database');
  featureflagTable = schema.featureFlags;
} catch {}

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (this.db && featureflagTable) {
      try {
        return await (this.db as any).select().from(featureflagTable)
          .where(eq(featureflagTable.tenantId, tenantId));
      } catch (err) {
        this.logger.warn(`[FEATUREFLAG] DB query failed: ${err}`);
      }
    }
    return [];
  }

  async findAllSystemWide(): Promise<any[]> {
    if (this.db && featureflagTable) {
      try {
        return await (this.db as any).select().from(featureflagTable).limit(100);
      } catch (err) {
        this.logger.warn(`[FEATUREFLAG] DB system wide query failed: ${err}`);
      }
    }
    return [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (this.db && featureflagTable) {
      try {
        const rows = await (this.db as any).select().from(featureflagTable)
          .where(and(eq(featureflagTable.id, id), eq(featureflagTable.tenantId, tenantId)))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        this.logger.warn(`[FEATUREFLAG] DB findById failed: ${err}`);
      }
    }
    throw new NotFoundException(`FeatureFlag ${id} not found`);
  }

  async create(tenantId: string, data: Record<string, any>): Promise<any> {
    const id = randomUUID();
    if (this.db && featureflagTable) {
      try {
        const [row] = await (this.db as any).insert(featureflagTable).values({
          id, tenantId, ...data,
        }).returning();
        return row;
      } catch (err) {
        this.logger.warn(`[FEATUREFLAG] DB create failed: ${err}`);
      }
    }
    return { id, tenantId, ...data, createdAt: new Date().toISOString() };
  }

  async update(id: string, tenantId: string, data: Record<string, any>): Promise<any> {
    if (this.db && featureflagTable) {
      try {
        const [row] = await (this.db as any).update(featureflagTable)
          .set({ ...data, updatedAt: new Date() })
          .where(and(eq(featureflagTable.id, id), eq(featureflagTable.tenantId, tenantId)))
          .returning();
        return row;
      } catch (err) {
        this.logger.warn(`[FEATUREFLAG] DB update failed: ${err}`);
      }
    }
    return { id, tenantId, ...data };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    if (this.db && featureflagTable) {
      try {
        await (this.db as any).delete(featureflagTable)
          .where(and(eq(featureflagTable.id, id), eq(featureflagTable.tenantId, tenantId)));
        return true;
      } catch (err) {
        this.logger.warn(`[FEATUREFLAG] DB delete failed: ${err}`);
      }
    }
    return false;
  }
}

