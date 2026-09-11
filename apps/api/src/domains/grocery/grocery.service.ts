import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GroceryService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private eventEmitter: EventEmitter2
  ) {}

  async getProducts(tenantId: string) {
    const taxRes = await this.db.execute(sql`SELECT rate FROM tax_nexus WHERE tenant_id = ${tenantId} LIMIT 1`);
    const taxRate = taxRes?.rows?.[0]?.rate || 0.0825;

    const result = await this.db.execute(sql`
      SELECT
        id,
        name,
        description,
        unit_price_cents as "unitPriceCents",
        sku,
        barcode,
        metadata->>'stock' as "stockQuantity",
        category,
        image_url as "imageUrl",
        is_weighable as "isWeighable",
        is_age_restricted as "isAgeRestricted"
      FROM products
      WHERE tenant_id = ${tenantId} AND is_active = true
      ORDER BY name ASC
    `);

    const items = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price_cents: row.unitPriceCents || 0,
      sku: row.sku || '',
      barcode: row.barcode || '',
      stock_quantity: parseInt(row.stockQuantity || '0', 10),
      category: row.category || 'Grocery',
      image: row.imageUrl || '🛒',
      is_weighted: row.isWeighable || false,
      price_per_lb_cents: row.isWeighable ? row.unitPriceCents : null,
      age_restricted: row.isAgeRestricted || false
    }));

    return { items, taxRate };
  }

  async createOrder(tenantId: string, userId: string, payload: any) {
    // 1. Age Gate Verification
    const hasAgeRestricted = payload.items.some((item: any) => item.age_restricted);
    if (hasAgeRestricted && !payload.cashier_age_verified) {
      throw new BadRequestException('Cashier MUST physically verify ID for age restricted items in this cart.');
    }

    return this.db.transaction(async (tx) => {
      // 2. Fetch specific dynamic Tax Rate
      const taxRes = await tx.execute(sql`SELECT rate FROM tax_nexus WHERE tenant_id = ${tenantId} LIMIT 1`);
      const payloadTaxRate = taxRes?.rows?.[0]?.rate || 0.0825;

      let subtotalCents = 0;
      for (const item of payload.items) {
          let lineItemCostCents = 0;

          if (item.is_weighted) {
              if (!item.weight_oz || item.weight_oz <= 0) {
                 throw new BadRequestException(`Weighted item ${item.name} requires weight_oz parameter.`);
              }
              lineItemCostCents = Math.round((item.price_per_lb_cents / 16) * item.weight_oz);
          } else {
              lineItemCostCents = item.price_cents * item.quantity;
          }

          subtotalCents += lineItemCostCents;
          
          // ATOMIC INVENTORY DECREMENT PREVENTING OVERSELLING (UPDATING JSONB METADATA)
          const qtyToDecrement = item.is_weighted ? 1 : item.quantity;
          const updateRes = await tx.execute(sql`
              UPDATE products 
              SET metadata = jsonb_set(
                COALESCE(metadata, '{}'::jsonb), 
                '{stock}', 
                ((COALESCE(metadata->>'stock', '0')::int - ${qtyToDecrement})::text)::jsonb
              ),
              updated_at = NOW()
              WHERE id = ${item.itemId} AND tenant_id = ${tenantId} AND (COALESCE(metadata->>'stock', '0')::int) >= ${qtyToDecrement}
          `);
          if (updateRes.rowCount === 0) {
              throw new BadRequestException(`Insufficient stock or invalid product ${item.name || item.itemId}`);
          }
      }

      const discountCents = payload.discount_cents || 0;
      const computedTaxCents = Math.round((subtotalCents - discountCents) * payloadTaxRate);
      const totalCents = Math.max(0, subtotalCents - discountCents + computedTaxCents);

      const totalPaid = payload.payments?.reduce((sum: number, p: any) => sum + p.amount_cents, 0) || 0;
      if (totalPaid < totalCents) {
          throw new BadRequestException('Insufficient payment splits for multi-tender checkout.');
      }

      const orderId = uuidv4();
      await tx.execute(sql`
          INSERT INTO orders (id, tenant_id, source, status, sub_total, discount_amount, total_amount, created_at, updated_at)
          VALUES (${orderId}, ${tenantId}, 'GROCERY_POS', 'COMPLETED', ${subtotalCents}, ${discountCents}, ${totalCents}, NOW(), NOW())
      `);

      if (payload.items?.length > 0) {
          for (const item of payload.items) {
              const lineCost = item.is_weighted ? Math.round((item.price_per_lb_cents / 16) * item.weight_oz) : item.price_cents * item.quantity;
              await tx.execute(sql`
                  INSERT INTO order_items (id, tenant_id, order_id, product_id, quantity, price_at_sale, item_total, created_at, updated_at)
                  VALUES (gen_random_uuid(), ${tenantId}, ${orderId}, ${item.itemId}, ${item.quantity || 1}, ${item.price_cents || item.price_per_lb_cents}, ${lineCost}, NOW(), NOW())
              `);
          }
      }

      if (payload.payments?.length > 0) {
          for (const split of payload.payments) {
              await tx.execute(sql`
                  INSERT INTO payments (id, tenant_id, order_id, method, amount, status, created_at)
                  VALUES (gen_random_uuid(), ${tenantId}, ${orderId}, ${split.method}, ${split.amount_cents}, 'COMPLETED', NOW())
              `);
          }
      }

      this.eventEmitter.emit('grocery.order.created', { tenantId, orderId, items: payload.items, userId });

      return { status: 'success', orderId, verifiedTaxRate: payloadTaxRate, totalCaptured: totalCents };
    });
  }
}
