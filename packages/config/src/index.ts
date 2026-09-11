// @paysurity/config — ConfigService
// Reads platform_config + merchant_config from DB with Redis cache.
// Usage: await ConfigService.get<number>(tenantId, 'loyalty.earning_rate_per_dollar')
// NEVER: const RATE = 10; // ← PROHIBITED

export { ConfigService } from './config.service';
