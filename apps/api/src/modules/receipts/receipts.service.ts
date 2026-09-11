import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  async getReceipt(id: string, tenantId: string) {
    try {
      const result = await (this.db as any).execute(
        `SELECT * FROM receipts WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
        [id, tenantId]
      );
      return result?.rows?.[0] || null;
    } catch(e) {
      this.logger.error('getReceipt error', e?.message);
      return null;
    }
  }

  async listReceipts(tenantId: string, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const result = await (this.db as any).execute(
        `SELECT * FROM receipts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [tenantId, limit, offset]
      );
      return result?.rows || [];
    } catch(e) {
      this.logger.error('listReceipts error', e?.message);
      return [];
    }
  }

  async generateReceipt(orderId: string, tenantId: string) {
    this.logger.log(`Generating receipt for order ${orderId}`);
    return { id: `rcpt-${Date.now()}`, orderId, tenantId, generatedAt: new Date().toISOString() };
  }
}

