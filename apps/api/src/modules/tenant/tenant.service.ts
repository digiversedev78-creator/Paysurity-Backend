import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<Record<string, unknown>>,
  ) {}

  async findById(tenantId: string): Promise<Record<string, unknown> | null> {
    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id, name, slug, vertical, plan, status, kyb_status as "kybStatus", platform_fee_rate_bps as "platformFeeRateBps", max_terminals as "maxTerminals", max_locations as "maxLocations", default_gateway as "defaultGateway", created_at as "createdAt", updated_at as "updatedAt" FROM tenants WHERE id = $1::uuid LIMIT 1`,
        [tenantId]
      );
      return (result as any)?.rows?.[0] || result?.[0] || null;
    } catch (error: unknown) {
      this.logger.error(`findById failed: ${(error as Error).message}`);
      return null;
    }
  }

  async findBySlug(slug: string): Promise<Record<string, unknown> | null> {
    try {
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(
        `SELECT id, name, slug, vertical, plan, status, kyb_status as "kybStatus", platform_fee_rate_bps as "platformFeeRateBps", max_terminals as "maxTerminals", max_locations as "maxLocations", default_gateway as "defaultGateway", created_at as "createdAt", updated_at as "updatedAt" FROM tenants WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      return (result as any)?.rows?.[0] || result?.[0] || null;
    } catch (error: unknown) {
      this.logger.error(`findBySlug failed: ${(error as Error).message}`);
      return null;
    }
  }

  async updateConfig(tenantId: string, configUpdates: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    try {
      const existing = await this.findById(tenantId);
      if (!existing) return null;
      
      const setClauses: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      const allowedKeys = ['name', 'slug', 'vertical', 'plan', 'status', 'kybStatus', 'platformFeeRateBps', 'maxTerminals', 'maxLocations', 'defaultGateway'];
      const dbColumns: Record<string, string> = {
        name: 'name',
        slug: 'slug',
        vertical: 'vertical',
        plan: 'plan',
        status: 'status',
        kybStatus: 'kyb_status',
        platformFeeRateBps: 'platform_fee_rate_bps',
        maxTerminals: 'max_terminals',
        maxLocations: 'max_locations',
        defaultGateway: 'default_gateway'
      };

      for (const [key, val] of Object.entries(configUpdates)) {
        if (allowedKeys.includes(key) && val !== undefined) {
          setClauses.push(`${dbColumns[key]} = $${paramIndex}`);
          values.push(val);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) return existing;

      setClauses.push(`updated_at = NOW()`);
      values.push(tenantId);

      const query = `UPDATE tenants SET ${setClauses.join(', ')} WHERE id = $${paramIndex}::uuid RETURNING id, name, slug, vertical, plan, status, kyb_status as "kybStatus", platform_fee_rate_bps as "platformFeeRateBps", max_terminals as "maxTerminals", max_locations as "maxLocations", default_gateway as "defaultGateway", created_at as "createdAt", updated_at as "updatedAt"`;
      
      const result = await (this.db as unknown as { execute: (...args: unknown[]) => unknown }).execute(query, values);
      return (result as any)?.rows?.[0] || result?.[0] || null;
    } catch (error: unknown) {
      this.logger.error(`updateConfig failed: ${(error as Error).message}`);
      return null;
    }
  }
}



