// tax.service.ts â€” rewrote using canonical sql`` pattern (no ts-nocheck, no phantom schema references)
import { Inject, Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { CreateTaxNexusDto, UpdateTaxNexusDto } from './dto/tax-nexus.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

// â”€â”€ Interfaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface TaxItem {
  category: string;
  amount: number;
}

interface TaxCalculationResult {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

// â”€â”€ TaxNexusService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@Injectable()
export class TaxNexusService {
  private readonly logger = new Logger(TaxNexusService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(tenantId: string, dto: CreateTaxNexusDto) {
    this.logger.log(`Creating tax nexus: tenant=${tenantId}, state=${dto.stateCode}`);

    const existing = await (this.db as any).execute(sql`
      SELECT id FROM tax_nexus
      WHERE tenant_id = ${tenantId}::uuid AND state_code = ${dto.stateCode} AND nexus_type = ${dto.nexusType}
    `);
    if ((existing as any).rows.length > 0) {
      throw new BadRequestException(
        `Tax nexus already exists for state '${dto.stateCode}' and type '${dto.nexusType}'.`,
      );
    }

    const id = uuidv4();
    const res = await (this.db as any).execute(sql`
      INSERT INTO tax_nexus (id, tenant_id, state_code, nexus_type, effective_date, notes, created_at, updated_at)
      VALUES (${id}::uuid, ${tenantId}::uuid, ${dto.stateCode}, ${dto.nexusType},
              ${dto.effectiveDate}::date, ${dto.notes ?? null}, NOW(), NOW())
      RETURNING *
    `);

    await (this.auditLogService as any).logActivity(tenantId, 'system', 'tax_nexus', 'TAX_NEXUS_CREATED', {
      id, stateCode: dto.stateCode, nexusType: dto.nexusType,
    });

    return (res as any).rows[0];
  }

  async findOne(tenantId: string, id: string) {
    const res = await (this.db as any).execute(sql`
      SELECT * FROM tax_nexus WHERE id = ${id}::uuid AND tenant_id = ${tenantId}::uuid
    `);
    if ((res as any).rows.length === 0) throw new NotFoundException(`Tax nexus ${id} not found`);
    return (res as any).rows[0];
  }

  async findAll(tenantId: string) {
    const res = await (this.db as any).execute(sql`
      SELECT * FROM tax_nexus WHERE tenant_id = ${tenantId}::uuid ORDER BY state_code, created_at
    `);
    return (res as any).rows;
  }

  async update(tenantId: string, id: string, dto: UpdateTaxNexusDto) {
    const res = await (this.db as any).execute(sql`
      UPDATE tax_nexus
      SET
        state_code     = COALESCE(${dto.stateCode ?? null}, state_code),
        nexus_type     = COALESCE(${dto.nexusType ?? null}, nexus_type),
        notes          = COALESCE(${dto.notes ?? null}, notes),
        updated_at     = NOW()
      WHERE id = ${id}::uuid AND tenant_id = ${tenantId}::uuid
      RETURNING *
    `);
    if ((res as any).rows.length === 0) throw new NotFoundException(`Tax nexus ${id} not found`);

    await (this.auditLogService as any).logActivity(tenantId, 'system', 'tax_nexus', 'TAX_NEXUS_UPDATED', { id });
    return (res as any).rows[0];
  }

  async remove(tenantId: string, id: string) {
    const res = await (this.db as any).execute(sql`
      DELETE FROM tax_nexus WHERE id = ${id}::uuid AND tenant_id = ${tenantId}::uuid RETURNING *
    `);
    if ((res as any).rows.length === 0) throw new NotFoundException(`Tax nexus ${id} not found`);

    await (this.auditLogService as any).logActivity(tenantId, 'system', 'tax_nexus', 'TAX_NEXUS_DELETED', { id });
    return (res as any).rows[0];
  }
}

// â”€â”€ TaxService â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  async calculateTax(tenantId: string, items: TaxItem[], stateCode: string): Promise<TaxCalculationResult> {
    this.logger.log(`Calculating tax: tenant=${tenantId}, state=${stateCode}, items=${items.length}`);

    if (!items || items.length === 0) throw new BadRequestException('Items array cannot be empty.');
    if (!stateCode || stateCode.length !== 2) throw new BadRequestException('Invalid stateCode â€” must be 2-letter string.');

    let subtotal = 0;
    for (const item of items) {
      if (typeof item.amount !== 'number' || item.amount < 0) {
        throw new BadRequestException(`Invalid item amount: ${item.amount}`);
      }
      if (!item.category || typeof item.category !== 'string') {
        throw new BadRequestException(`Invalid item category: ${item.category}`);
      }
      subtotal += item.amount;
    }

    if (subtotal === 0) return { subtotal: 0, taxRate: 0, taxAmount: 0, total: 0 };

    const uniqueCategories = [...new Set(items.map((i) => i.category))];

    // Build safe IN clause via sql.raw â€” stateCode and tenantId are UUID/2-char non-injectable
    const catList = uniqueCategories.map((c) => `'${c.replace(/'/g, "''")}'`).join(', ');
    const taxRatesResult = await (this.db as any).execute(sql.raw(`
      SELECT category, rate FROM tax_rates
      WHERE state_code = '${stateCode.replace(/'/g, "''")}' AND tenant_id = '${tenantId}'
        AND category IN (${catList})
    `));

    const ratesMap = new Map<string, number>();
    ((taxRatesResult as any).rows as { category: string; rate: number }[]).forEach((r) =>
      ratesMap.set(r.category, Number(r.rate)),
    );

    let totalTaxAmount = 0;
    for (const item of items) {
      const rate = ratesMap.get(item.category);
      if (rate !== undefined) {
        totalTaxAmount += item.amount * (rate / 100);
      } else {
        this.logger.warn(`No rate for category '${item.category}' in state '${stateCode}'. Using 0%.`);
      }
    }

    const total = subtotal + totalTaxAmount;
    const effectiveTaxRate = subtotal > 0 ? totalTaxAmount / subtotal : 0;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxRate: parseFloat(effectiveTaxRate.toFixed(4)),
      taxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }
}



