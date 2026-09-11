import { Injectable, Inject } from '@nestjs/common';
import { ilike } from 'drizzle-orm';
import { tenants, users, merchants } from '@paysurity/database';

export interface SearchResultDto {
  type: 'TENANT' | 'USER' | 'MERCHANT';
  id: string;
  name: string;
  metadata?: any;
}

@Injectable()
export class AdminSearchService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async searchEcosystem(query: string): Promise<SearchResultDto[]> {
    const searchTerm = `%${query}%`;
    const limit = 20;

    // Run searches in parallel for 20-record memory cap
    const [tenantsResult, usersResult, merchantsResult] = await Promise.all([
      (this.db as any).select({ id: tenants.id, name: tenants.name, vertical: tenants.vertical })
        .from(tenants)
        .where(ilike(tenants.name, searchTerm))
        .limit(limit),

      (this.db as any).select({ id: users.id, email: users.email, role: users.roles })
        .from(users)
        .where(ilike(users.email, searchTerm))
        .limit(limit),

      (this.db as any).select({ id: merchants.id, dbaName: merchants.name, merchantType: merchants.status })
        .from(merchants)
        .where(ilike(merchants.name, searchTerm))
        .limit(limit),
    ]);

    const results: SearchResultDto[] = [
      ...tenantsResult.map(t => ({
        type: 'TENANT' as const,
        id: t.id,
        name: t.name,
        metadata: { vertical: t.vertical }
      })),
      ...usersResult.map(u => ({
        type: 'USER' as const,
        id: u.id,
        name: u.email,
        metadata: { role: u.role }
      })),
      ...merchantsResult.map(m => ({
        type: 'MERCHANT' as const,
        id: m.id,
        name: m.dbaName,
        metadata: { type: m.merchantType }
      })),
    ];

    // Optional: Return a single capped list or just return all combined segments since each is capped to 20
    return results;
  }
}

