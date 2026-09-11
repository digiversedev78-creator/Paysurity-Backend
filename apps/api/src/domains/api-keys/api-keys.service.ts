import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, sql } from 'drizzle-orm';
import * as crypto from 'crypto';
import { api_keys } from '@paysurity/database/src/schema/api_keys';

@Injectable()
export class ApiKeysService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  async createApiKey(tenantId: string, name: string, scopes: string[] = ['*']) {
    const rawKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = rawKey.substring(0, 12);

    const result = await this.db.insert(api_keys).values({
      tenantId,
      name,
      keyHash,
      prefix,
      scopes,
      isActive: true,
    }).returning({
      id: api_keys.id,
      tenantId: api_keys.tenantId,
      name: api_keys.name,
      prefix: api_keys.prefix,
      scopes: api_keys.scopes,
      createdAt: api_keys.createdAt,
    });

    const inserted = result[0];
    if (!inserted) {
      throw new Error('Failed to create API key');
    }

    return {
      ...inserted,
      rawKey,
    };
  }

  async listApiKeys(tenantId: string) {
    const result = await this.db
      .select({
        id: api_keys.id,
        name: api_keys.name,
        prefix: api_keys.prefix,
        scopes: api_keys.scopes,
        lastUsedAt: api_keys.lastUsedAt,
        createdAt: api_keys.createdAt,
      })
      .from(api_keys)
      .where(and(eq(api_keys.tenantId, tenantId), isNull(api_keys.revokedAt)))
      .orderBy(api_keys.createdAt);

    return result;
  }

  async revokeApiKey(tenantId: string, keyId: string) {
    const result = await this.db
      .update(api_keys)
      .set({
        revokedAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .where(and(eq(api_keys.id, keyId), eq(api_keys.tenantId, tenantId), isNull(api_keys.revokedAt)))
      .returning({ id: api_keys.id });

    if (!result[0]) {
      throw new NotFoundException('API Key not found or already revoked');
    }

    return { success: true };
  }
}
