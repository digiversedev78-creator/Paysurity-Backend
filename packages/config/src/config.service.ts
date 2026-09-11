import Redis from 'ioredis';

/**
 * ConfigService — THE canonical way to read configuration in PaySurity.
 *
 * Rules:
 * 1. NEVER hardcode values. Always use ConfigService.get().
 * 2. Platform-wide defaults live in platform_config table.
 * 3. Merchant overrides live in merchant_config table.
 * 4. Resolution: merchant_config value > platform_config value > error.
 * 5. All values are cached in Redis with 5-minute TTL.
 *
 * @example
 * const rate = await ConfigService.get<number>(tenantId, 'loyalty.earning_rate_per_dollar');
 * const maxItems = await ConfigService.get<number>(null, 'cart.max_items'); // platform-wide
 */

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6381),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

export class ConfigService {
  private static CACHE_TTL = 300; // 5 minutes

  /**
   * Get a config value. Checks Redis cache first, then DB.
   * Resolves: merchant_config > platform_config > throws ConfigNotFoundException.
   */
  static async get<T = string>(
    tenantId: string | null,
    key: string,
  ): Promise<T> {
    const cacheKey = `config:${tenantId ?? 'platform'}:${key}`;
    const r = getRedis();

    try {
      const cached = await r.get(cacheKey);
      if (cached !== null) {
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis down — fall through to DB
    }

    // TODO: Wire to actual Drizzle query in Sprint 0 task 7
    // For now, throw so callers know config is not hardcoded
    throw new Error(
      `ConfigService: key "${key}" not found. ` +
        `Ensure platform_config has this key seeded.`,
    );
  }

  /**
   * Set a merchant-level config override.
   */
  static async set(
    tenantId: string,
    key: string,
    value: string,
    setBy: string,
  ): Promise<void> {
    // TODO: Validate against platform_config.min_value / max_value
    // TODO: Write to merchant_config table
    // TODO: Invalidate Redis cache
    // TODO: Write audit event
    const cacheKey = `config:${tenantId}:${key}`;
    const r = getRedis();
    await r.set(cacheKey, JSON.stringify(value), 'EX', this.CACHE_TTL);
  }

  /**
   * Invalidate a cached config key.
   */
  static async invalidate(tenantId: string | null, key: string): Promise<void> {
    const cacheKey = `config:${tenantId ?? 'platform'}:${key}`;
    const r = getRedis();
    await r.del(cacheKey);
  }
}
