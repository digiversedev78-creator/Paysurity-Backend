import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

@Injectable()
export class SeedGrocereaseTenantService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  async seed() {
    const tenantSlug = 'grocerease-demo';
    const tenantName = 'GrocerEase Demo Store';
    const tenantPlan = 'professional';

    console.log(`Starting to seed tenant: ${tenantName} (${tenantSlug})`);

    await this.db.transaction(async (tx) => {
      // 1. Insert Tenant
      const [tenantRow] = await tx.execute(sql`
        INSERT INTO tenants (id, slug, name, plan, created_at, updated_at)
        VALUES (gen_random_uuid(), ${tenantSlug}, ${tenantName}, ${tenantPlan}, now(), now())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          plan = EXCLUDED.plan,
          updated_at = now()
        RETURNING id;
      `);
      const tenantId = tenantRow.id;
      console.log(`Tenant '${tenantName}' seeded with ID: ${tenantId}`);

      // 2. Seed Products
      const productsToSeed = [
        // Produce (EBT-eligible = true)
        { name: 'Organic Bananas', category: 'produce', price: 0.79, sku: 'PROD001', ebt: true, description: 'Fresh organic bananas per pound.' },
        { name: 'Gala Apples', category: 'produce', price: 1.29, sku: 'PROD002', ebt: true, description: 'Crisp and sweet Gala apples per pound.' },
        { name: 'Broccoli Crown', category: 'produce', price: 2.49, sku: 'PROD003', ebt: true, description: 'Fresh broccoli crowns, each.' },
        { name: 'Avocado', category: 'produce', price: 1.99, sku: 'PROD004', ebt: true, description: 'Ripe Hass avocado.' },
        { name: 'Baby Carrots (1lb)', category: 'produce', price: 1.79, sku: 'PROD005', ebt: true, description: 'One pound bag of baby carrots.' },
        { name: 'Roma Tomatoes', category: 'produce', price: 0.99, sku: 'PROD006', ebt: true, description: 'Firm Roma tomatoes per pound.' },
        { name: 'Red Onion', category: 'produce', price: 0.89, sku: 'PROD007', ebt: true, description: 'Large red onion.' },
        { name: 'Spinach (5oz)', category: 'produce', price: 3.29, sku: 'PROD008', ebt: true, description: 'Fresh baby spinach, 5oz bag.' },
        { name: 'Sweet Potatoes', category: 'produce', price: 1.19, sku: 'PROD009', ebt: true, description: 'Sweet potatoes per pound.' },
        { name: 'Green Bell Pepper', category: 'produce', price: 1.50, sku: 'PROD010', ebt: true, description: 'Fresh green bell pepper.' },

        // Dairy (EBT-eligible = true)
        { name: 'Whole Milk (Gallon)', category: 'dairy', price: 3.99, sku: 'DAIRY001', ebt: true, description: 'One gallon of whole milk.' },
        { name: 'Organic Eggs (Dozen)', category: 'dairy', price: 4.89, sku: 'DAIRY002', ebt: true, description: 'One dozen organic large brown eggs.' },
        { name: 'Greek Yogurt (Plain)', category: 'dairy', price: 1.50, sku: 'DAIRY003', ebt: true, description: '6oz cup of plain Greek yogurt.' },
        { name: 'Cheddar Cheese Block (8oz)', category: 'dairy', price: 4.29, sku: 'DAIRY004', ebt: true, description: '8oz block of sharp cheddar cheese.' },
        { name: 'Unsalted Butter (1lb)', category: 'dairy', price: 5.49, sku: 'DAIRY005', ebt: true, description: 'One pound of unsalted butter.' },

        // Meat (EBT-eligible = true)
        { name: 'Ground Beef (80/20, 1lb)', category: 'meat', price: 6.99, sku: 'MEAT001', ebt: true, description: 'One pound of 80/20 ground beef.' },
        { name: 'Chicken Breast (Boneless, Skinless, 1lb)', category: 'meat', price: 7.49, sku: 'MEAT002', ebt: true, description: 'One pound boneless, skinless chicken breast.' },
        { name: 'Pork Chops (Bone-in, 1lb)', category: 'meat', price: 5.99, sku: 'MEAT003', ebt: true, description: 'One pound of bone-in pork chops.' },

        // Bakery (EBT-eligible = false)
        { name: 'Artisan Sourdough Bread', category: 'bakery', price: 4.99, sku: 'BAKERY001', ebt: false, description: 'Freshly baked artisan sourdough loaf.' },
        { name: 'Chocolate Chip Cookies (6-pack)', category: 'bakery', price: 3.79, sku: 'BAKERY002', ebt: false, description: 'Six count pack of chocolate chip cookies.' },
        { name: 'Whole Wheat Sandwich Bread', category: 'bakery', price: 3.29, sku: 'BAKERY003', ebt: false, description: 'Loaf of whole wheat sandwich bread.' },

        // Beverages (EBT-eligible = false)
        { name: 'Orange Juice (Half Gallon)', category: 'beverages', price: 4.50, sku: 'BEV001', ebt: false, description: 'Half gallon of 100% orange juice.' },
        { name: 'Sparkling Water (12-pack)', category: 'beverages', price: 5.99, sku: 'BEV002', ebt: false, description: '12-pack of assorted sparkling water.' },
        { name: 'Coffee Beans (12oz)', category: 'beverages', price: 8.99, sku: 'BEV003', ebt: false, description: '12oz bag of whole bean coffee.' },
        { name: 'Diet Cola (6-pack cans)', category: 'beverages', price: 4.29, sku: 'BEV004', ebt: false, description: 'Six pack of diet cola cans.' },
        { name: 'Apple Juice (64oz)', category: 'beverages', price: 3.89, sku: 'BEV005', ebt: false, description: '64oz bottle of 100% apple juice.' },

        // Frozen (EBT-eligible = false)
        { name: 'Frozen Peas (16oz)', category: 'frozen', price: 2.19, sku: 'FROZEN001', ebt: false, description: '16oz bag of frozen green peas.' },
        { name: 'Frozen Pizza (Pepperoni)', category: 'frozen', price: 7.99, sku: 'FROZEN002', ebt: false, description: 'Classic pepperoni frozen pizza.' },
        { name: 'Ice Cream (Vanilla, Pint)', category: 'frozen', price: 3.50, sku: 'FROZEN003', ebt: false, description: 'One pint of vanilla bean ice cream.' },
        { name: 'Frozen Berries Medley (12oz)', category: 'frozen', price: 4.79, sku: 'FROZEN004', ebt: false, description: '12oz bag of mixed frozen berries.' },
      ];

      const productIdsMap = new Map<string, string>(); // To map product names to their IDs for PLU codes

      for (const product of productsToSeed) {
        const [insertedProduct] = await tx.execute(sql`
          INSERT INTO products (id, tenant_id, name, description, category, price, sku, ebt_eligible, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            ${tenantId},
            ${product.name},
            ${product.description},
            ${product.category},
            ${product.price},
            ${product.sku},
            ${product.ebt},
            now(),
            now()
          )
          ON CONFLICT (tenant_id, sku) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            price = EXCLUDED.price,
            ebt_eligible = EXCLUDED.ebt_eligible,
            updated_at = now()
          RETURNING id;
        `);
        productIdsMap.set(product.name, insertedProduct.id);
      }
      console.log(`Seeded ${productsToSeed.length} products for tenant '${tenantName}'.`);

      // 3. Seed PLU Codes
      const pluCodes = [
        { code: '4000', productName: 'Organic Bananas' },
        { code: '4011', productName: 'Gala Apples' },
        { code: '4065', productName: 'Broccoli Crown' },
        { code: '4046', productName: 'Avocado' },
        { code: '4500', productName: 'Baby Carrots (1lb)' },
        { code: '4060', productName: 'Roma Tomatoes' },
        { code: '4061', productName: 'Red Onion' },
        { code: '4090', productName: 'Spinach (5oz)' },
        { code: '4030', productName: 'Sweet Potatoes' },
        { code: '4063', productName: 'Green Bell Pepper' },
      ];

      for (const plu of pluCodes) {
        const productId = productIdsMap.get(plu.productName);
        if (productId) {
          await tx.execute(sql`
            INSERT INTO product_plus (id, tenant_id, product_id, plu_code, created_at, updated_at)
            VALUES (gen_random_uuid(), ${tenantId}, ${productId}, ${plu.code}, now(), now())
            ON CONFLICT (tenant_id, plu_code) DO UPDATE SET
              product_id = EXCLUDED.product_id,
              updated_at = now();
          `);
        } else {
          console.warn(`Product not found for PLU code ${plu.code}: ${plu.productName}. PLU will not be seeded.`);
        }
      }
      console.log(`Seeded ${pluCodes.length} PLU codes for tenant '${tenantName}'.`);

      // 4. Seed State Tax Rates
      const taxRates = [
        { state: 'TX', rate: 0.0825 }, // 8.25%
        { state: 'CA', rate: 0.1025 }, // 10.25%
        { state: 'NY', rate: 0.0400 }, // 4.00%
      ];

      for (const tax of taxRates) {
        await tx.execute(sql`
          INSERT INTO tax_rates (id, tenant_id, state_code, rate, is_active, created_at, updated_at)
          VALUES (gen_random_uuid(), ${tenantId}, ${tax.state}, ${tax.rate}, TRUE, now(), now())
          ON CONFLICT (tenant_id, state_code) DO UPDATE SET
            rate = EXCLUDED.rate,
            is_active = EXCLUDED.is_active,
            updated_at = now();
        `);
      }
      console.log(`Seeded ${taxRates.length} tax rates for tenant '${tenantName}'.`);

      // 5. Seed Promotions
      const promotions = [
        {
          name: 'BOGO Bananas',
          description: 'Buy one bunch of bananas, get one free!',
          type: 'bogo',
          discount_value: null,
          min_purchase_amount: null,
          applies_to_category: 'produce',
          start_date: new Date(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Active for 7 days
        },
        {
          name: '10% Off Dairy',
          description: 'Get 10% off all items in the Dairy category.',
          type: 'percentage_off_category',
          discount_value: 0.10,
          min_purchase_amount: null,
          applies_to_category: 'dairy',
          start_date: new Date(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Active for 14 days
        },
        {
          name: '$5 Off $50+ Purchase',
          description: 'Save $5 when you spend $50 or more on groceries.',
          type: 'fixed_amount_off_total',
          discount_value: 5.00,
          min_purchase_amount: 50.00,
          applies_to_category: null,
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Active for 30 days
        },
      ];

      for (const promo of promotions) {
        await tx.execute(sql`
          INSERT INTO promotions (id, tenant_id, name, description, type, discount_value, min_purchase_amount, applies_to_category, is_active, start_date, end_date, created_at, updated_at)
          VALUES (
            gen_random_uuid(),
            ${tenantId},
            ${promo.name},
            ${promo.description},
            ${promo.type},
            ${promo.discount_value},
            ${promo.min_purchase_amount},
            ${promo.applies_to_category},
            TRUE,
            ${promo.start_date.toISOString()},
            ${promo.end_date.toISOString()},
            now(),
            now()
          )
          ON CONFLICT (tenant_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            type = EXCLUDED.type,
            discount_value = EXCLUDED.discount_value,
            min_purchase_amount = EXCLUDED.min_purchase_amount,
            applies_to_category = EXCLUDED.applies_to_category,
            is_active = EXCLUDED.is_active,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            updated_at = now();
        `);
      }
      console.log(`Seeded ${promotions.length} promotions for tenant '${tenantName}'.`);
    });

    console.log(`Finished seeding GrocerEase Demo tenant.`);
  }
}