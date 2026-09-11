import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  async createApiKey(tenantId: string, name: string, scopes: string[] = ['*']) {
    const rawKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 12);

    const result = await (this.db as any).execute(sql`
      INSERT INTO api_keys (
        id, tenant_id, name, prefix, key_hash, scopes, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), ${tenantId}, ${name}, ${prefix}, ${keyHash}, ${JSON.stringify(scopes)}::jsonb, NOW(), NOW()
      ) RETURNING id, tenant_id, name, prefix, scopes, created_at;
    `);

    // Only return the raw key once upon creation
    return {
      ...((result as any).rows as any)[0],
      rawKey,
    };
  }

  async listApiKeys(tenantId: string) {
    const result = await (this.db as any).execute(sql`
      SELECT id, name, prefix, scopes, last_used_at, created_at
      FROM api_keys
      WHERE tenant_id = ${tenantId} AND revoked_at IS NULL
      ORDER BY created_at DESC;
    `);
    return (result as any).rows || result;
  }

  async revokeApiKey(tenantId: string, keyId: string) {
    const result = await (this.db as any).execute(sql`
      UPDATE api_keys
      SET revoked_at = NOW(), updated_at = NOW()
      WHERE id = ${keyId} AND tenant_id = ${tenantId} AND revoked_at IS NULL
      RETURNING id;
    `);
    if (!((result as any).rows as any)?.[0]) throw new NotFoundException('API Key not found or already revoked');
    return { success: true };
  }
}


