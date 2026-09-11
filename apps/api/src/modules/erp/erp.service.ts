import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import { erpWarehouses, erpStockMoves, erpStockQuants, erpJournalEntries, erpJournalItems, erpAccounts } from './schema';

@Injectable()
export class ErpService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  // â”€â”€ Warehouses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getWarehouses(tenantId: string) {
    return (this.db as any).select().from(erpWarehouses).where(eq(erpWarehouses.tenantId, tenantId));
  }

  async createWarehouse(tenantId: string, body: {
    name: string; locationType?: string; parentId?: string; valuationMethod?: string;
  }) {
    const res = await (this.db as any).insert(erpWarehouses).values({
      tenantId,
      name: body.name,
      locationType: body.locationType ?? 'INTERNAL',
      parentId: body.parentId ?? null,
      valuationMethod: body.valuationMethod ?? 'STANDARD',
    } as any).returning();
    return res[0];
  }

  // â”€â”€ Stock / Inventory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getStockSnapshot(tenantId: string) {
    return (this.db as any).select().from(erpStockQuants).where(eq(erpStockQuants.tenantId, tenantId));
  }

  async getProductStock(tenantId: string, productId: string) {
    return (this.db as any).select().from(erpStockQuants)
      .where(and(eq(erpStockQuants.tenantId, tenantId), eq(erpStockQuants.productId, productId)));
  }

  async processStockMove(
    tenantId: string, productId: string, sourceWh: string, destWh: string, qty: number, lotNumber?: string,
  ): Promise<void> {
    await (this.db as any).transaction(async (tx) => {
      await tx.insert(erpStockMoves).values({
        tenantId, productId, sourceWhId: sourceWh, destWhId: destWh,
        quantity: qty.toString(), status: 'DONE', movedAt: new Date(),
      } as any);

      const sourceStock = await tx.select().from(erpStockQuants)
        .where(and(eq(erpStockQuants.tenantId, tenantId), eq(erpStockQuants.warehouseId, sourceWh), eq(erpStockQuants.productId, productId)))
        .limit(1);

      if (sourceStock.length) {
        await tx.update(erpStockQuants)
          .set({ quantity: (Number(sourceStock[0].quantity) - qty).toString(), updatedAt: new Date() } as any)
          .where(eq(erpStockQuants.id, sourceStock[0].id));
      }

      const destStock = await tx.select().from(erpStockQuants)
        .where(and(eq(erpStockQuants.tenantId, tenantId), eq(erpStockQuants.warehouseId, destWh), eq(erpStockQuants.productId, productId)))
        .limit(1);

      if (destStock.length) {
        await tx.update(erpStockQuants)
          .set({ quantity: (Number(destStock[0].quantity) + qty).toString(), updatedAt: new Date() } as any)
          .where(eq(erpStockQuants.id, destStock[0].id));
      } else {
        await tx.insert(erpStockQuants).values({
          tenantId, productId, warehouseId: destWh, lotNumber: lotNumber ?? null, quantity: qty.toString(),
        } as any);
      }
    });
  }

  // â”€â”€ Chart of Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getAccounts(tenantId: string) {
    return (this.db as any).select().from(erpAccounts).where(eq(erpAccounts.tenantId, tenantId));
  }

  async createAccount(tenantId: string, body: { code: string; name: string; accountType: string; reconcilable?: boolean }) {
    const res = await (this.db as any).insert(erpAccounts).values({
      tenantId, code: body.code, name: body.name, accountType: body.accountType,
      reconcilable: body.reconcilable ?? false, isActive: true,
    } as any).returning();
    return res[0];
  }

  /**
   * Ensures a starter 5-account chart exists for the tenant.
   * Called automatically by generatePosJournalEntry when no accounts are seeded.
   */
  private async ensureChartOfAccounts(tenantId: string) {
    const existing = await (this.db as any).select().from(erpAccounts).where(eq(erpAccounts.tenantId, tenantId)).limit(1);
    if (existing.length > 0) return;

    const starter = [
      { tenantId, code: '1000', name: 'Cash / Bank', accountType: 'ASSET', reconcilable: true, isActive: true },
      { tenantId, code: '1200', name: 'Inventory Asset', accountType: 'ASSET', reconcilable: false, isActive: true },
      { tenantId, code: '4000', name: 'Product Sales Revenue', accountType: 'INCOME', reconcilable: false, isActive: true },
      { tenantId, code: '5000', name: 'Cost of Goods Sold', accountType: 'COGS', reconcilable: false, isActive: true },
      { tenantId, code: '2000', name: 'Accounts Payable', accountType: 'LIABILITY', reconcilable: true, isActive: true },
    ];
    await (this.db as any).insert(erpAccounts).values(starter as any);
  }

  // â”€â”€ Accounting / Journals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getJournals(tenantId: string) {
    return (this.db as any).select().from(erpJournalEntries).where(eq(erpJournalEntries.tenantId, tenantId));
  }

  /**
   * REQ-ERP-001: generatePosJournalEntry â€” real double-entry with FK-valid account IDs.
   * Auto-seeds a starter chart of accounts if none exists for the tenant.
   */
  async generatePosJournalEntry(
    tenantId: string, orderId: string, revenueAmountCents: number, cogsCents: number,
  ): Promise<void> {
    await this.ensureChartOfAccounts(tenantId);

    const accounts = await (this.db as any).select().from(erpAccounts).where(eq(erpAccounts.tenantId, tenantId));
    const byCode = new Map(accounts.map((a: any) => [a.code, a.id]));

    const cashAccountId = byCode.get('1000');
    const salesAccountId = byCode.get('4000');
    const cogsAccountId  = byCode.get('5000');
    const inventoryAccountId = byCode.get('1200');

    if (!cashAccountId || !salesAccountId || !cogsAccountId || !inventoryAccountId) {
      throw new Error('Chart of Accounts incomplete â€” required accounts missing');
    }

    const entryResult = await (this.db as any).insert(erpJournalEntries).values({
      tenantId, journalType: 'SALES', ref: `POS-${orderId}`,
      date: new Date().toISOString().split('T')[0], status: 'POSTED',
    } as any).returning({ id: erpJournalEntries.id });
    const entryId = entryResult[0].id;

    await (this.db as any).insert(erpJournalItems).values([
      { tenantId, entryId, accountId: cashAccountId, name: 'POS Payment Received', debitCents: revenueAmountCents, creditCents: 0 } as any,
      { tenantId, entryId, accountId: salesAccountId, name: 'Product Sale Income', debitCents: 0, creditCents: revenueAmountCents } as any,
      { tenantId, entryId, accountId: cogsAccountId, name: 'COGS', debitCents: cogsCents, creditCents: 0 } as any,
      { tenantId, entryId, accountId: inventoryAccountId, name: 'Inventory Asset Deduction', debitCents: 0, creditCents: cogsCents } as any,
    ]);
  }

  /**
   * REQ-ERP-003: Real trial balance â€” aggregates debit/credit totals from journal items per account.
   */
  async getTrialBalance(tenantId: string) {
    const res = await (this.db as any).execute(sql`
      SELECT
        a.code,
        a.name,
        a.account_type,
        COALESCE(SUM(ji.debit_cents), 0)  AS total_debit_cents,
        COALESCE(SUM(ji.credit_cents), 0) AS total_credit_cents,
        COALESCE(SUM(ji.debit_cents), 0) - COALESCE(SUM(ji.credit_cents), 0) AS net_cents
      FROM erp_accounts a
      LEFT JOIN erp_journal_items ji ON ji.account_id = a.id AND ji.tenant_id = ${tenantId}::uuid
      WHERE a.tenant_id = ${tenantId}::uuid AND a.is_active = TRUE
      GROUP BY a.id, a.code, a.name, a.account_type
      ORDER BY a.code
    `);
    return (res as any).rows;
  }

  async generateInvoice(tenantId: string, orderId: string) {
    // URL stub â€” real PDF generation deferred to a future sprint
    return { url: `https://storage.paysurity.com/invoices/${tenantId}/${orderId}.pdf`, status: 'STUB' };
  }

  // â”€â”€ Landed Costs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async createLandedCost(tenantId: string, body: {
    moveId: string; splitMethod: string; totalCostCents: number; costType: string;
  }) {
    const res = await (this.db as any).execute(sql`
      INSERT INTO erp_landed_costs (id, tenant_id, move_id, split_method, total_cost_cents, cost_type, status)
      VALUES (gen_random_uuid(), ${tenantId}::uuid, ${body.moveId}::uuid,
              ${body.splitMethod}, ${body.totalCostCents}, ${body.costType}, 'DRAFT')
      RETURNING *
    `);
    return (res as any).rows[0];
  }
}


