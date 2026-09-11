import { Injectable, Inject, Logger, Optional, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  async findAll(tenantId: string): Promise<any[]> {
    if (!this.db) { this.logger.warn('[AUDITLOG] DB unavailable'); return []; }
    const result = await (this.db as any).execute(
      `SELECT * FROM audit_log WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 500`,
      [tenantId]
    );
    return result?.rows || result || [];
  }

  async findById(id: string, tenantId: string): Promise<any> {
    if (!this.db) throw new NotFoundException(`AuditLog ${id} not found`);
    const result = await (this.db as any).execute(
      `SELECT * FROM audit_log WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [id, tenantId]
    );
    const row = result?.rows?.[0] || result?.[0];
    if (!row) throw new NotFoundException(`AuditLog ${id} not found`);
    return row;
  }

  /**
   * Primary method: record(tenantId, dto)
   * Records any state-changing action with tenant_id, user_id, action, optional financial/trace data.
   */
  async record(tenantId: string, dto: {
    userId: string;
    action: string;
    amountCents?: number | null;
    traceId?: string | null;
    details?: Record<string, any> | null;
    isImpersonating?: boolean;
    originalUserId?: string;
  }): Promise<any> {
    const id = randomUUID();
    try {
      if (this.db) {
        await (this.db as any).execute(
          `INSERT INTO audit_log (id, tenant_id, user_id, action, amount_cents, trace_id, details, is_impersonating, original_user_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [
            id, 
            tenantId, 
            dto.userId, 
            dto.action, 
            dto.amountCents ?? null, 
            dto.traceId ?? null, 
            dto.details ? JSON.stringify(dto.details) : null,
            dto.isImpersonating ?? false,
            dto.originalUserId ?? null
          ]
        );
      }
      this.logger.debug(`[AUDITLOG] ${dto.action} | tenant:${tenantId} user:${dto.userId} impersonating:${dto.isImpersonating ?? false}`);
      return { id, tenantId, ...dto };
    } catch (err) {
      this.logger.error(`[AUDITLOG] Failed: ${err.message}`);
      // Never throw â€” audit log failures must not block business operations
      return null;
    }
  }

  /**
   * Convenience alias used by many services: logActivity(tenantId, userId, resource, action, details?)
   */
  async logActivity(
    tenantId: string,
    userId: string,
    resource: string,
    action: string,
    details?: Record<string, any>,
  ): Promise<void> {
    await this.record(tenantId, {
      userId,
      action: `${resource.toUpperCase()}: ${action}`,
      details,
    }).catch(() => {});
  }

  /**
   * Alias used by some older service generations: logAuditAction(dto)
   */
  async logAuditAction(dto: {
    tenantId: string;
    actorId: string;
    action: string;
    targetId?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    await this.record(dto.tenantId, {
      userId: dto.actorId,
      action: dto.action,
      details: { targetId: dto.targetId, ...dto.details },
    }).catch(() => {});
  }
}

