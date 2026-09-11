import { Injectable, Logger, BadRequestException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export interface ParsedBarcodeResult {
  originalBarcode: string;
  isEmbedded: boolean;
  resolvedProductId?: string;
  embeddedWeightOrPrice?: number; // Depending on GS1 Prefix
  measurementMode?: 'WEIGHT' | 'PRICE' | 'STANDARD';
}

@Injectable()
export class BarcodeParserService {
  private readonly logger = new Logger(BarcodeParserService.name);

  // Standard Odoo GS1 Prefix Emulation overrides
  private readonly GS1_WEIGHT_PREFIX = '21';
  private readonly GS1_PRICE_PREFIX = '23';

  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * REQ-POSG-010: Variable Measure Barcode Parsing
   * Replaces simple 1:1 barcode string lookups.
   * If a barcode scanned is '210123000150', the scanner knows:
   * '21' = Weighable Item
   * '0123' = The physical Internal Item Code (e.g. Ribeye Steak)
   * '00150' = 1.50 lbs payload
   */
  async parseScannedBarcode(tenantId: string, rawBarcode: string): Promise<ParsedBarcodeResult> {
    this.logger.log(`Parsing Barcode Payload: [${rawBarcode}] for tenant ${tenantId}`);

    if (!rawBarcode || rawBarcode.length < 3) {
      throw new BadRequestException('Invalid barcode scan payload.');
    }

    const prefix = rawBarcode.substring(0, 2);

    // 1. Embedded GS1 Weight Decoding
    if (prefix === this.GS1_WEIGHT_PREFIX && rawBarcode.length === 12) {
      const itemCode = rawBarcode.substring(2, 7); // '01234'
      const weightPayload = rawBarcode.substring(7, 12); // '00150' = 1.50

      const parsedWeight = parseInt(weightPayload, 10) / 100; // 1.50 lbs
      this.logger.log(`GS1 Target Triggered: Weight Matrix detected for Item Code: ${itemCode}. Decoded: ${parsedWeight} units.`);

      return {
        originalBarcode: rawBarcode,
        isEmbedded: true,
        resolvedProductId: await this.lookupSkuByInternalCode(tenantId, itemCode),
        embeddedWeightOrPrice: parsedWeight,
        measurementMode: 'WEIGHT'
      };
    }

    // 2. Embedded GS1 Price Decoding (e.g. Variable Deli Meats)
    if (prefix === this.GS1_PRICE_PREFIX && rawBarcode.length === 12) {
        const itemCode = rawBarcode.substring(2, 7); 
        const pricePayload = rawBarcode.substring(7, 12); // '01499' = $14.99
  
        const parsedPriceCents = parseInt(pricePayload, 10);
        
        return {
          originalBarcode: rawBarcode,
          isEmbedded: true,
          resolvedProductId: await this.lookupSkuByInternalCode(tenantId, itemCode),
          embeddedWeightOrPrice: parsedPriceCents,
          measurementMode: 'PRICE'
        };
    }

    // 3. Fallback to standard explicit SKU extraction
    // Uses the retail_multi_barcodes table injected heavily from Odoo Parity Canonical
    const standardLookup = await (this.db as any).execute(
        `SELECT product_id FROM retail_multi_barcodes WHERE barcode = $1 AND tenant_id = $2 LIMIT 1`,
        [rawBarcode, tenantId]
    );

    if (standardLookup?.rows?.length > 0) {
        return {
            originalBarcode: rawBarcode,
            isEmbedded: false,
            resolvedProductId: (standardLookup as any).rows[0].product_id,
            measurementMode: 'STANDARD'
        };
    }

    throw new BadRequestException('BARCODE_NOT_FOUND');
  }

  private async lookupSkuByInternalCode(tenantId: string, internalCode: string): Promise<string> {
      // In production, maps the 5-digit PLU/internal code cross-referenced to the master menu_items table
      // e.g. mapping "04011" back to the UUID of Bananas
      const res = await (this.db as any).execute(
          `SELECT menu_item_id FROM grocery_item_attributes WHERE plu_code = $1 AND tenant_id = $2 LIMIT 1`,
          [internalCode, tenantId]
      );
      if (!res?.rows?.length) throw new BadRequestException(`Unmapped PLU inner-code: ${internalCode}`);
      return (res as any).rows[0].menu_item_id;
  }
}

