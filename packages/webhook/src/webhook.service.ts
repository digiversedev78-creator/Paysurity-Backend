import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Schema import
let webhookTable: any;
try {
  const schema = require('@paysurity/database');
  webhookTable = schema.webhooks;
} catch {}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: any,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (this.db && webhookTable) {
      try {
        return await this.db.select().from(webhookTable)
          .where(eq(webhookTable.tenantId, tenantId));
      } catch (err) {
        this.logger.warn(`[WEBHOOK] DB query failed: ${err}`);
      }
    }
    return [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (this.db && webhookTable) {
      try {
        const rows = await this.db.select().from(webhookTable)
          .where(and(eq(webhookTable.id, id), eq(webhookTable.tenantId, tenantId)))
          .limit(1);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        this.logger.warn(`[WEBHOOK] DB findById failed: ${err}`);
      }
    }
    throw new NotFoundException(`Webhook ${id} not found`);
  }

  async create(tenantId: string, data: Record<string, any>): Promise<any> {
    const id = randomUUID();
    if (this.db && webhookTable) {
      try {
        const [row] = await this.db.insert(webhookTable).values({
          id, tenantId, ...data,
        }).returning();
        return row;
      } catch (err) {
        this.logger.warn(`[WEBHOOK] DB create failed: ${err}`);
      }
    }
    // Dummy return when no db
    return { id, tenantId, ...data };
  }

  async update(id: string, tenantId: string, data: Record<string, any>): Promise<any> {
    if (this.db && webhookTable) {
      try {
        const [row] = await this.db.update(webhookTable)
          .set({ ...data })
          .where(and(eq(webhookTable.id, id), eq(webhookTable.tenantId, tenantId)))
          .returning();
        return row;
      } catch (err) {
        this.logger.warn(`[WEBHOOK] DB update failed: ${err}`);
      }
    }
    return { id, tenantId, ...data };
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    if (this.db && webhookTable) {
      try {
        await this.db.delete(webhookTable)
          .where(and(eq(webhookTable.id, id), eq(webhookTable.tenantId, tenantId)));
        return true;
      } catch (err) {
        this.logger.warn(`[WEBHOOK] DB delete failed: ${err}`);
      }
    }
    return false;
  }
}
