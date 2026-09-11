import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID, createHash, randomBytes } from 'crypto';

/**
 * Hashes a given secret using SHA256.
 * This is used to store the secrets in a hashed format in the database,
 * preventing storage of plain-text secrets.
 * @param secret The plain-text secret to hash.
 * @returns The SHA256 hash of the secret in hex format.
 */
function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

@Injectable()
export class ApiKeysService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Generates a new set of API credentials for a given tenant.
   * This includes a PAYSURITY_API_KEY (UUID), PAYSURITY_API_SECRET (HMAC key),
   * and PAYSURITY_WEBHOOK_SECRET (random hex).
   * The secrets are stored as SHA256 hashes in the database, but the plain
   * values are returned once to the caller.
   *
   * @param tenantId The ID of the tenant for whom to generate the API key.
   * @param name An optional friendly name for the API key.
   * @returns An object containing the generated API key, plain secrets, and the record ID.
   * @throws BadRequestException if tenantId is missing or on database errors.
   */
  async generateApiKey(tenantId: string, name?: string): Promise<{ id: string; apiKey: string; apiSecret: string; webhookSecret: string }> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to generate an API key.');
    }

    const recordId = randomUUID(); // Unique ID for the database record
    const paysurityApiKey = randomUUID(); // Production PAYSURITY_API_KEY (uuid-based)
    const paysurityApiSecretPlain = randomBytes(32).toString('hex'); // PAYSURITY_API_SECRET (64-char hex, 32 bytes)
    const paysurityWebhookSecretPlain = randomBytes(32).toString('hex'); // PAYSURITY_WEBHOOK_SECRET (64-char hex, 32 bytes)

    // Store hashed versions of the secrets in the database
    const paysurityApiSecretHash = hashSecret(paysurityApiSecretPlain);
    const paysurityWebhookSecretHash = hashSecret(paysurityWebhookSecretPlain);

    const sql = `
      INSERT INTO api_keys (id, tenant_id, api_key, api_secret_hash, webhook_secret_hash, name, created_at, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), TRUE)
      RETURNING id;
    `;
    const params = [
      recordId,
      tenantId,
      paysurityApiKey,
      paysurityApiSecretHash,
      paysurityWebhookSecretHash,
      name || null,
    ];

    try {
      const result = await (this.db as any).execute(sql, params);

      // Assuming `execute` returns an object with a `rows` property for SELECT/INSERT RETURNING
      if (!result || !(result as any).rows || (result as any).rows.length === 0) {
        throw new Error('Failed to insert API key record into the database.');
      }

      return {
        id: (result as any).rows[0].id,
        apiKey: paysurityApiKey,
        apiSecret: paysurityApiSecretPlain,
        webhookSecret: paysurityWebhookSecretPlain,
      };
    } catch (error) {
      console.error('Database error generating API key:', error);
      throw new BadRequestException('Failed to generate API key due to a database error.');
    }
  }

  /**
   * Retrieves a list of API keys for a given tenant.
   * Note: This method does NOT return the plain secrets or their hashes.
   *
   * @param tenantId The ID of the tenant.
   * @returns An array of API key objects, without secret information.
   * @throws BadRequestException if tenantId is missing.
   */
  async getApiKeys(tenantId: string): Promise<Array<{ id: string; apiKey: string; name: string | null; createdAt: Date; isActive: boolean }>> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to retrieve API keys.');
    }

    const sql = `
      SELECT id, api_key, name, created_at, is_active
      FROM api_keys
      WHERE tenant_id = $1
      ORDER BY created_at DESC;
    `;
    const params = [tenantId];

    try {
      const result = await (this.db as any).execute(sql, params);
      if (!result || !(result as any).rows) {
        return [];
      }
      return (result as any).rows.map((row: any) => ({
        id: row.id,
        apiKey: row.api_key,
        name: row.name,
        createdAt: new Date(row.created_at),
        isActive: row.is_active,
      }));
    } catch (error) {
      console.error('Database error retrieving API keys:', error);
      throw new BadRequestException('Failed to retrieve API keys due to a database error.');
    }
  }

  /**
   * Deletes a specific API key for a given tenant.
   * Ensures that only API keys belonging to the specified tenant can be deleted.
   *
   * @param tenantId The ID of the tenant.
   * @param apiKeyId The ID of the API key record to delete.
   * @throws NotFoundException if the API key does not exist or does not belong to the tenant.
   * @throws BadRequestException on other database errors.
   */
  async deleteApiKey(tenantId: string, apiKeyId: string): Promise<void> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required to delete an API key.');
    }
    if (!apiKeyId) {
      throw new BadRequestException('API Key ID is required to delete an API key.');
    }

    const sql = `
      DELETE FROM api_keys
      WHERE id = $1 AND tenant_id = $2;
    `;
    const params = [apiKeyId, tenantId];

    try {
      const result = await (this.db as any).execute(sql, params);
      // For DELETE operations, 'rowCount' indicates the number of rows affected.
      if (!result || result.rowCount === 0) {
        throw new NotFoundException(`API key with ID "${apiKeyId}" not found or does not belong to your tenant.`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Database error deleting API key:', error);
      throw new BadRequestException('Failed to delete API key due to a database error.');
    }
  }
}

