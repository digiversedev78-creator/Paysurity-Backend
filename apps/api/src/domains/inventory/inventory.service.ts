import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { products, inventory_items } from '@paysurity/database';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Unified Price Update
   * Detects if the item is a Retail Product or Restaurant Menu Item
   */
  async updatePrice(tenantId: string, userId: string, itemId: string, newPrice: number, type: 'RETAIL' | 'RESTAURANT') {
    const table = type === 'RETAIL' ? products : (inventory_items as any);
    const priceField = type === 'RETAIL' ? 'price' : 'currentPrice';
    
    // 1. Fetch current state for audit
    const existing = await this.db.select().from(table).where(and(eq(table.id, itemId), eq(table.tenantId, tenantId))).limit(1);
    if (!existing.length) throw new NotFoundException(`Item ${itemId} not found in ${type} inventory.`);

    // 2. Perform Update
    const updateData = type === 'RETAIL' 
      ? { price: newPrice.toString() } 
      : { currentPrice: newPrice };

    const [updated] = await this.db.update(table)
      .set(updateData)
      .where(and(eq(table.id, itemId), eq(table.tenantId, tenantId)))
      .returning();

    // 3. Audit Log (with Impersonation awareness if needed)
    await this.auditLogService.logActivity(tenantId, userId, 'INVENTORY', `UPDATE_PRICE_${type}`, {
      itemId,
      oldPrice: existing[0][priceField],
      newPrice,
      isImpersonating: (global as any).isImpersonating || false
    });

    return updated;
  }

  /**
   * Unified Toggle Active Status
   */
  async toggleActive(tenantId: string, userId: string, itemId: string, isActive: boolean, type: 'RETAIL' | 'RESTAURANT') {
    const table = type === 'RETAIL' ? products : (inventory_items as any);
    
    const [updated] = await this.db.update(table)
      .set({ isActive: isActive } as any)
      .where(and(eq(table.id, itemId), eq(table.tenantId, tenantId)))
      .returning();

    if (!updated) throw new NotFoundException(`Item ${itemId} not found in ${type} inventory.`);

    await this.auditLogService.logActivity(tenantId, userId, 'INVENTORY', `TOGGLE_ACTIVE_${type}`, {
      itemId,
      isActive,
      isImpersonating: (global as any).isImpersonating || false
    });

    return updated;
  }
}
