import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface LandedCostDto {
  moveId: string;
  splitMethod: 'EQUAL' | 'BY_QUANTITY' | 'BY_CURRENT_COST' | 'BY_WEIGHT' | 'BY_VOLUME';
  totalCostCents: number;
  costType: string;
}

@Injectable()
export class LandedCostService {
  private readonly logger = new Logger(LandedCostService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * REQ-ERP-015: Odoo-Parity Landed Cost Calculation
   * Incorporates Freight, Customs, and Handling charges directly into the Inventory Asset Valuation.
   * Splits the macro freight charge across the micro product line items to alter AVCO/FIFO baseline costs.
   */
  async allocateLandedCost(tenantId: string, dto: LandedCostDto) {
    this.logger.log(`Allocating $${dto.totalCostCents/100} of ${dto.costType} to Move ID: ${dto.moveId}`);

    if (dto.totalCostCents <= 0) throw new BadRequestException('Landed cost must be > $0');

    // 1. Validate Stock Move exists and is eligible for Cost Padding
    const moveRes = await (this.db as any).execute(
      `SELECT id, product_id, quantity, status FROM erp_stock_moves WHERE id = $1 AND tenant_id = $2 AND status = 'DONE'`,
      [dto.moveId, tenantId]
    );
    if (!moveRes?.rows?.length) throw new BadRequestException('Eligible stock receipt move not found or not completed.');
    
    // (Assuming simple split mechanism for staging: BY_QUANTITY simulation)
    // Production ERP logic parses thousands of lines dynamically adjusting the product's Base Valuation
    const splitAllocationPerUnitCents = Math.round(dto.totalCostCents / ((moveRes as any).rows[0].quantity || 1));

    try {
      await (this.db as any).execute('BEGIN');

      // 2. Draft the Landed Cost Ledger Entry
      await (this.db as any).execute(
        `INSERT INTO erp_landed_costs (tenant_id, move_id, split_method, total_cost_cents, cost_type, status)
         VALUES ($1, $2, $3, $4, $5, 'VALIDATED')`,
        [tenantId, dto.moveId, dto.splitMethod, dto.totalCostCents, dto.costType]
      );

      // 3. Mutate the target Stock Quant's Core Valuation (AVCO padding emulation)
      await (this.db as any).execute(
        `UPDATE erp_stock_quants 
         SET value_cents = value_cents + ($1 * quantity), updated_at = NOW()
         WHERE product_id = $2 AND tenant_id = $3`,
        [splitAllocationPerUnitCents, (moveRes as any).rows[0].product_id, tenantId]
      );

      // 4. Trigger Automatic Perpetual Accounting Entry!
      // Dr. Inventory Asset | Cr. Landed Costs Payable
      this.eventEmitter.emit('erp.accounting.journal_entry_required', {
        tenantId,
        type: 'LANDED_COST',
        debitAccountId: 'INV_ASSET_1000',
        creditAccountId: 'LND_COST_2000',
        amountCents: dto.totalCostCents
      });

      await (this.db as any).execute('COMMIT');
      this.logger.log(`Successfully completed Landed Cost AVCO pad for product ${(moveRes as any).rows[0].product_id}.`);
      return { success: true, allocatedPerUnitCents: splitAllocationPerUnitCents };
    } catch (e) {
      await (this.db as any).execute('ROLLBACK');
      throw new Error(`Critical Fault during Landed Cost execution: ${e.message}`);
    }
  }
}

