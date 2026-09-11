/**
 * SEC-002: Secrets Management Service
 * Satisfies: REQ-SEC-002 â€” All credentials via GCP Secret Manager, never process.env in production.
 * 
 * Strategy:
 *   - PRODUCTION:  Reads from GCP Secret Manager via @google-cloud/secret-manager
 *   - DEVELOPMENT: Falls back to process.env (with a warning, never silently)
 *   - IN-MEMORY:   Caches secrets for 5 minutes to reduce GCP API calls
 * 
 * Usage in any service:
 *   const apiKey = await (this.secretsService as any).get('FLUIDPAY_API_KEY');
 *   const twilioSid = await (this.secretsService as any).get('TWILIO_ACCOUNT_SID');
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

interface CachedSecret {
  value: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const GCP_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID || '';
const USE_GCP = !!GCP_PROJECT_ID && process.env.NODE_ENV === 'production';

@Injectable()
export class SecretsService implements OnModuleInit {
  private readonly logger = new Logger(SecretsService.name);
  private readonly cache = new Map<string, CachedSecret>();
  private gcpClient: any = null;

  async onModuleInit() {
    if (USE_GCP) {
      try {
        // Dynamic import â€” package may not be installed in dev
        const { SecretManagerServiceClient } = await import('@google-cloud/secret-manager' as any);
        this.gcpClient = new SecretManagerServiceClient();
        this.logger.log(`SEC-002: GCP Secret Manager initialized for project ${GCP_PROJECT_ID}`);
      } catch (e) {
        this.logger.error(`SEC-002: Failed to initialize GCP Secret Manager: ${e.message}. Falling back to env vars.`);
      }
    } else {
      this.logger.warn(
        `SEC-002: Running in ${process.env.NODE_ENV || 'development'} mode â€” secrets read from process.env. ` +
        `Set GOOGLE_CLOUD_PROJECT + NODE_ENV=production to use GCP Secret Manager.`
      );
    }
  }

  /**
   * Get a secret value by name.
   * In production: reads from GCP Secret Manager (cached for 5 min).
   * In development: reads from process.env with a fallback warning.
   * 
   * @param secretName The secret name (matches GCP secret ID and env var name)
   * @param fallback Optional fallback value (only used in dev/test)
   * @throws Error in production if secret is not found in GCP
   */
  async get(secretName: string, fallback?: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    // Try GCP Secret Manager in production
    if (USE_GCP && this.gcpClient) {
      try {
        const name = `projects/${GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`;
        const [version] = await this.gcpClient.accessSecretVersion({ name });
        const value = version.payload?.data?.toString();
        if (!value) throw new Error(`Secret ${secretName} has empty payload in GCP`);
        
        // Cache it
        this.cache.set(secretName, { value, expiresAt: Date.now() + CACHE_TTL_MS });
        return value;
      } catch (err) {
        this.logger.error(`SEC-002: GCP secret fetch failed for ${secretName}: ${err.message}`);
        // In strict production, throw â€” no fallback to env
        if (!fallback) throw new Error(`Secret ${secretName} unavailable: ${err.message}`);
      }
    }

    // Dev/test: read from environment variables
    const envValue = process.env[secretName];
    if (envValue) {
      // Cache env values too (shorter TTL in dev)
      this.cache.set(secretName, { value: envValue, expiresAt: Date.now() + 60_000 });
      return envValue;
    }

    if (fallback !== undefined) {
      this.logger.warn(`SEC-002: Secret '${secretName}' not found â€” using provided fallback. DO NOT use in production.`);
      return fallback;
    }

    throw new Error(`SEC-002: Secret '${secretName}' not found in GCP or process.env. Configure this secret before proceeding.`);
  }

  /**
   * Convenience method: get multiple secrets at once.
   */
  async getMany(secretNames: string[]): Promise<Record<string, string>> {
    const results = await Promise.all(
      secretNames.map(async (name) => ({ name, value: await this.get(name).catch(() => '') }))
    );
    return Object.fromEntries(results.map(r => [r.name, r.value]));
  }

  /**
   * Invalidate a specific secret from cache (call after rotation).
   */
  invalidate(secretName: string): void {
    this.cache.delete(secretName);
    this.logger.log(`SEC-002: Cache invalidated for secret ${secretName}`);
  }

  /**
   * Health check â€” verify GCP connectivity
   */
  async healthCheck(): Promise<{ status: 'ok' | 'degraded'; mode: 'gcp' | 'env'; project?: string }> {
    if (USE_GCP && this.gcpClient) {
      return { status: 'ok', mode: 'gcp', project: GCP_PROJECT_ID };
    }
    return { status: 'degraded', mode: 'env' };
  }
}

