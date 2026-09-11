import { Injectable, Inject } from '@nestjs/common';

// Define a minimal interface for NodePgDatabase as per strict rule 2,
// since we cannot import from Drizzle or drizzle-orm/node-postgres.
// This interface allows the type declaration in the constructor.
// The actual usage for queries will still follow rule 3: (this.db as any).execute.
interface NodePgDatabase<T> {
  execute(sql: string, params?: any[]): Promise<T[]>;
  // Additional methods like 'query', 'transaction', etc., could be added here
  // if they were explicitly required by other strict rules or examples.
  // For this task, 'execute' is sufficient.
}

/**
 * Represents the structure of product details retrieved from the database.
 */
interface ProductDetails {
  id: string;
  name: string;
  category: string; // e.g., 'produce', 'meat', 'dairy', 'bread', 'seeds', 'hot_prepared_food', 'general_merchandise'
  is_snap_eligible: boolean;
  is_hot_prepared_food: boolean; // Flag from product catalog
}

/**
 * Represents the structure of a tax rule retrieved from the database.
 */
interface TaxRule {
  product_category: string;
  tax_rate: number; // e.g., 0.0725 for 7.25%
  is_taxable: boolean; // Indicates if the rule makes the item taxable (true) or exempt (false)
}

/**
 * Represents a single line item in a checkout transaction for tax calculation.
 */
interface CheckoutLineItem {
  productId: string;
  quantity: number;
  unitPrice: number; // Price per unit, before any line item specific tax calculation
  isHotPreparedOverride?: boolean; // Optional: True if this specific item is prepared hot at checkout, overriding product's default
}

/**
 * Represents the result of a tax calculation for a single line item.
 */
interface LineItemTaxCalculationResult {
  productId: string;
  taxRate: number; // The effective tax rate applied (e.g., 0.0725)
  taxAmount: number; // The calculated tax amount for the line item
  lineItemTotalAmount: number; // The total base amount for the line item (quantity * unitPrice)
}

@Injectable()
export class TaxNexusService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}

  /**
   * Calculates the tax for a single line item in a checkout transaction,
   * applying EBT/SNAP rules, hot prepared food logic, and state-specific tax configurations.
   *
   * @param tenantId The UUID of the current tenant, extracted from the request context.
   * @param stateCode The 2-letter state code (e.g., 'CA', 'NY') for the transaction location.
   * @param lineItem The checkout line item details to calculate tax for.
   * @returns A promise that resolves to the tax calculation result for the line item.
   */
  async calculateLineItemTax(
    tenantId: string,
    stateCode: string,
    lineItem: CheckoutLineItem,
  ): Promise<LineItemTaxCalculationResult> {
    const lineItemTotalAmount = lineItem.quantity * lineItem.unitPrice;
    let applicableTaxRate = 0;
    let isTaxableByDefault = false; // Flag to track if a tax rule makes it taxable

    // 1. Fetch product details from the database
    const productSql = `
      SELECT
        id,
        name,
        category,
        is_snap_eligible,
        is_hot_prepared_food
      FROM products
      WHERE id = $1 AND tenant_id = $2;
    `;
    const productResult = await (this.db as any).execute(productSql, [lineItem.productId, tenantId]);

    if (!productResult || productResult.length === 0) {
      // If product not found, assume non-taxable as a safe default or throw an error based on business rules.
      console.warn(`Product with ID '${lineItem.productId}' not found for tenant '${tenantId}'. Assuming non-taxable.`);
      return {
        productId: lineItem.productId,
        taxRate: 0,
        taxAmount: 0,
        lineItemTotalAmount: lineItemTotalAmount,
      };
    }

    const product: ProductDetails = productResult[0];

    // Determine if the item is hot prepared, prioritizing any override from checkout
    const isHotPrepared = lineItem.isHotPreparedOverride ?? product.is_hot_prepared_food;

    // Determine if the item is SNAP-eligible based on product data
    const isSnapEligible = product.is_snap_eligible;

    // 2. Apply EBT/SNAP tax rules and hot prepared food logic
    if (isHotPrepared) {
      // Rule: Hot prepared food is taxable even if otherwise exempt.
      // Fetch the standard tax rate for 'hot_prepared_food' category for this state and tenant.
      const hotPreparedTaxRuleSql = `
        SELECT tax_rate, is_taxable
        FROM tax_rules
        WHERE tenant_id = $1 AND state_code = $2 AND product_category = 'hot_prepared_food';
      `;
      const hotPreparedTaxRuleResult = await (this.db as any).execute(hotPreparedTaxRuleSql, [tenantId, stateCode]);

      if (hotPreparedTaxRuleResult && hotPreparedTaxRuleResult.length > 0) {
        const rule: TaxRule = hotPreparedTaxRuleResult[0];
        applicableTaxRate = rule.is_taxable ? rule.tax_rate : 0;
        isTaxableByDefault = rule.is_taxable;
      } else {
        // Fallback 1: If no specific 'hot_prepared_food' rule, try 'general_merchandise'.
        console.warn(`No specific 'hot_prepared_food' tax rule found for tenant '${tenantId}' in ${stateCode}. Falling back to 'general_merchandise' category.`);
        const generalTaxRuleSql = `
          SELECT tax_rate, is_taxable
          FROM tax_rules
          WHERE tenant_id = $1 AND state_code = $2 AND product_category = 'general_merchandise';
        `;
        const generalTaxRuleResult = await (this.db as any).execute(generalTaxRuleSql, [tenantId, stateCode]);
        if (generalTaxRuleResult && generalTaxRuleResult.length > 0) {
          const rule: TaxRule = generalTaxRuleResult[0];
          applicableTaxRate = rule.is_taxable ? rule.tax_rate : 0;
          isTaxableByDefault = rule.is_taxable;
        } else {
          // Fallback 2 (Rule 9): If no specific or general rule, use the tenant's global default sales tax rate.
          console.warn(`No general tax rule found for tenant '${tenantId}' in ${stateCode}. Attempting to retrieve tenant default sales tax.`);
          applicableTaxRate = await this.getTenantDefaultSalesTaxRate(tenantId, stateCode);
          isTaxableByDefault = applicableTaxRate > 0;
        }
      }
    } else if (isSnapEligible) {
      // Rule: SNAP-eligible items are non-taxable in all states. This overrides all other rules if not hot prepared.
      applicableTaxRate = 0;
      isTaxableByDefault = false;
    } else {
      // Apply standard tax rules based on the product's category if not hot prepared and not SNAP-eligible
      const standardTaxRuleSql = `
        SELECT tax_rate, is_taxable
        FROM tax_rules
        WHERE tenant_id = $1 AND state_code = $2 AND product_category = $3;
      `;
      const standardTaxRuleResult = await (this.db as any).execute(standardTaxRuleSql, [tenantId, stateCode, product.category]);

      if (standardTaxRuleResult && standardTaxRuleResult.length > 0) {
        const rule: TaxRule = standardTaxRuleResult[0];
        applicableTaxRate = rule.is_taxable ? rule.tax_rate : 0;
        isTaxableByDefault = rule.is_taxable;
      } else {
        // Fallback 1: If no specific category rule, try 'general_merchandise'.
        console.warn(`No specific tax rule found for product category '${product.category}' for tenant '${tenantId}' in ${stateCode}. Falling back to 'general_merchandise'.`);
        const generalTaxRuleSql = `
          SELECT tax_rate, is_taxable
          FROM tax_rules
          WHERE tenant_id = $1 AND state_code = $2 AND product_category = 'general_merchandise';
        `;
        const generalTaxRuleResult = await (this.db as any).execute(generalTaxRuleSql, [tenantId, stateCode]);
        if (generalTaxRuleResult && generalTaxRuleResult.length > 0) {
          const rule: TaxRule = generalTaxRuleResult[0];
          applicableTaxRate = rule.is_taxable ? rule.tax_rate : 0;
          isTaxableByDefault = rule.is_taxable;
        } else {
          // Fallback 2 (Rule 9): If no specific or general rule, use the tenant's global default sales tax rate.
          console.warn(`No general tax rule found for tenant '${tenantId}' in ${stateCode}. Attempting to retrieve tenant default sales tax.`);
          applicableTaxRate = await this.getTenantDefaultSalesTaxRate(tenantId, stateCode);
          isTaxableByDefault = applicableTaxRate > 0;
        }
      }
    }

    // Calculate final tax amount, rounding to two decimal places
    const taxAmount = lineItemTotalAmount * applicableTaxRate;

    return {
      productId: lineItem.productId,
      taxRate: applicableTaxRate,
      taxAmount: parseFloat(taxAmount.toFixed(2)), // Ensure tax amount is rounded to two decimal places
      lineItemTotalAmount: lineItemTotalAmount,
    };
  }

  /**
   * Retrieves the default sales tax rate configured for a specific tenant and state.
   * This is used as a fallback when more specific product category tax rules are not found.
   * Adheres to Rule 9: "NEVER hardcode rates — always read from tenant config".
   *
   * @param tenantId The UUID of the tenant.
   * @param stateCode The 2-letter state code.
   * @returns A promise that resolves to the default sales tax rate (e.g., 0.0725), or 0 if not found.
   */
  async getTenantDefaultSalesTaxRate(tenantId: string, stateCode: string): Promise<number> {
    const sql = `
      SELECT default_sales_tax_rate
      FROM tenant_configurations
      WHERE tenant_id = $1 AND state_code = $2;
    `;
    const result = await (this.db as any).execute(sql, [tenantId, stateCode]);
    if (result && result.length > 0) {
      // Ensure the rate is parsed as a float, as it's stored as NUMERIC in DB
      return parseFloat(result[0].default_sales_tax_rate);
    }
    console.warn(`No default sales tax rate found in tenant_configurations for tenant '${tenantId}' in ${stateCode}. Returning 0.`);
    return 0; // Return 0 if no default rate is configured, implying non-taxable by default if no other rule applies.
  }
}
