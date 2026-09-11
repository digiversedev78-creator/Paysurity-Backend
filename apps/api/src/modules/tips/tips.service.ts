import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { CreateUpdateTipDto, TipResponseDto } from './dto/tip.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class TipsService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async upsertTip(tenantId: string, orderId: string, dto: CreateUpdateTipDto): Promise<TipResponseDto> {
    if (!orderId || !dto.amount) {
      throw new BadRequestException('Order ID and amount are required for tips.');
    }
    
    // Convert to cents
    const amountCents = Math.round(dto.amount * 100);

    const result = await (this.db as any).execute(sql`
      SELECT id FROM tips WHERE order_id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid LIMIT 1
    `).catch(() => ({ rows: [] }));
    
    const existingTip = (result as any)?.rows?.[0];

    let tipId = existingTip?.id;
    const now = new Date();

    if (existingTip) {
      await (this.db as any).execute(sql`
        UPDATE tips SET 
          amount_cents = ${amountCents},
          currency = ${dto.currencyCode || 'USD'},
          updated_at = NOW()
        WHERE id = ${tipId}::uuid
      `);
      await (this.auditLogService as any).logAuditAction({ tenantId, actorId: 'system', action: 'UPDATE_TIP', targetId: tipId, details: { orderId, amountCents } });
    } else {
      tipId = randomUUID();
      await (this.db as any).execute(sql`
        INSERT INTO tips (id, tenant_id, order_id, amount_cents, currency, created_at, updated_at)
        VALUES (
          ${tipId}::uuid, ${tenantId}::uuid, ${orderId}::uuid, ${amountCents}, 
          ${dto.currencyCode || 'USD'}, NOW(), NOW()
        )
      `).catch((e) => {
        throw new BadRequestException(`Failed to create tip: ${e.message}`);
      });
      await (this.auditLogService as any).logAuditAction({ tenantId, actorId: 'system', action: 'CREATE_TIP', targetId: tipId, details: { orderId, amountCents } });
    }

    // Refresh order totals directly through raw SQL (which POSR needs)
    await (this.db as any).execute(sql`
      UPDATE orders SET tip_cents = ${amountCents}, total_cents = subtotal_cents + tax_cents + ${amountCents} - discount_cents, updated_at = NOW()
      WHERE id = ${orderId}::uuid
    `).catch(() => {});

    return {
      id: tipId,
      amount: dto.amount,
      currencyCode: dto.currencyCode || 'USD',
      recipientEntityId: dto.recipientEntityId || '',
      status: 'PAID' as any,
      createdAt: now,
      updatedAt: now
    };
  }

  async getTipByOrderId(tenantId: string, orderId: string): Promise<TipResponseDto> {
    const result = await (this.db as any).execute(sql`
      SELECT id, amount_cents, currency, method, created_at, updated_at 
      FROM tips WHERE order_id = ${orderId}::uuid AND tenant_id = ${tenantId}::uuid LIMIT 1
    `).catch(() => ({ rows: [] }));

    const tip = (result as any)?.rows?.[0];
    if (!tip) {
      throw new NotFoundException(`Tip for order ID ${orderId} not found`);
    }

    return {
      id: tip.id,
      amount: Number(tip.amount_cents) / 100,
      currencyCode: tip.currency,
      recipientEntityId: tip.recipientEntityId || '',
      status: 'PAID' as any,
      createdAt: new Date(tip.created_at),
      updatedAt: new Date(tip.updated_at)
    };
  }
}



