import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { payments, tenants } from '@paysurity/database';

export interface FinanceAggregationDto {
  gpvCents: number;
  spreadCents: number;
  breakdown: Array<{
    tenantId: string;
    vertical: string;
    gpvCents: number;
    spreadCents: number;
  }>;
}

@Injectable()
export class AdminFinanceService {
  constructor(@Inject('DATABASE') private readonly db: any) {}

  async getAggregateFinancials(): Promise<FinanceAggregationDto> {
    // Cumulative GPV and Spread
    const [globalAgg] = await (this.db as any).select({
      gpv: sql<string>`SUM(${payments.captureAmount})`,
      spread: sql<string>`SUM(${payments.platformFeeCents})`
    })
    .from(payments)
    .where(sql`${payments.status} = 'COMPLETED'`);

    // Drill-down by tenant and vertical
    const breakdown = await (this.db as any).select({
      tenantId: tenants.id,
      vertical: tenants.vertical,
      gpv: sql<string>`SUM(${payments.captureAmount})`,
      spread: sql<string>`SUM(${payments.platformFeeCents})`
    })
    .from(payments)
    .innerJoin(tenants, sql`${payments.tenantId} = ${tenants.id}`)
    .where(sql`${payments.status} = 'COMPLETED'`)
    .groupBy(tenants.id, tenants.vertical);

    return {
      gpvCents: parseInt(globalAgg?.gpv || '0', 10),
      spreadCents: parseInt(globalAgg?.spread || '0', 10),
      breakdown: breakdown.map(b => ({
        tenantId: b.tenantId,
        vertical: b.vertical,
        gpvCents: parseInt(b.gpv || '0', 10),
        spreadCents: parseInt(b.spread || '0', 10),
      })),
    };
  }
}

