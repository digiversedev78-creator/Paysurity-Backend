import { Controller, Get, Post, Body, Request, Inject, Query, ConflictException, BadRequestException } from '@nestjs/common';
import { v4 } from 'uuid'; // v4 from uuid is not forbidden.

// DTO for tax calculation request body
class TaxCalculationItemDto {
  id: string; // Unique identifier for the item
  price: number; // Unit price of the item
  quantity: number; // Quantity of the item
  isTaxable: boolean; // Flag if the item itself is taxable
}

class LocationDto {
  state: string; // e.g., "CA"
  county?: string; // e.g., "Los Angeles"
  city?: string; // e.g., "Santa Monica"
}

class CalculateTaxDto {
  location: LocationDto;
  items: TaxCalculationItemDto[];
  isCustomerTaxExempt: boolean; // Flag if the customer is tax-exempt
}

// Interface for itemized tax breakdown in the response
interface TaxBreakdownItem {
  itemId: string;
  itemTotal: number; // price * quantity
  taxableAmount: number;
  taxRate: number; // The rate applied (e.g., 0.05 for 5%)
  taxAmount: number;
}

// Interface for the overall tax calculation response
interface TaxCalculationResponse {
  totalTaxAmount: number;
  itemBreakdown: TaxBreakdownItem[];
}

// DTO for POST /tax/nexus request body
class AddStateNexusDto {
  stateCode: string; // e.g., "CA", "NY"
}

// Interface for POST /tax/nexus response
interface AddStateNexusResponse {
  id: string; // UUID of the new nexus entry
  stateCode: string;
  createdAt: string; // ISO 8601 date string
}

// Interface for GET /tax/nexus response
interface StateNexusResponse {
  id: string;
  stateCode: string;
  createdAt: string; // ISO 8601 date string
}

// Interface for GET /tax/report response entry per state
interface MonthlyTaxReportEntry {
  stateCode: string;
  totalTaxCollected: number;
}

// Interface for the overall GET /tax/report response
interface MonthlyTaxReportResponse {
  reportMonth: string; // YYYY-MM
  totalCollectedAcrossAllStates: number;
  stateReports: MonthlyTaxReportEntry[];
}

@Controller('tax') // Changed controller base path to 'tax' to match requested URLs like /tax/nexus
export class TaxNexusController {
  // STRICT RULE COMPLIANCE:
  // @Inject('DATABASE') private readonly db: NodePgDatabase<any> is specified by strict rule 2.
  // However, strict rule 4 states "NEVER import from drizzle-orm/node-postgres".
  // If NodePgDatabase<any> requires an import from a forbidden path, these rules conflict.
  // Prioritizing "NEVER import" as a build-failure-causing rule, we use 'any' type to avoid forbidden imports.
  // In a real PaySurity project, NodePgDatabase might be globally available or re-exported via an allowed path.
  constructor(@Inject('DATABASE') private readonly db: any) {}

  /**
   * Retrieves a list of states where the tenant has a tax nexus.
   * Corresponds to GET /tax/nexus
   *
   * @param req The request object containing user information (tenantId).
   * @returns An array of StateNexusResponse objects.
   */
  @Get('nexus')
  async listStateNexus(@Request() req): Promise<StateNexusResponse[]> {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context.');
    }

    // Assumed schema for tax_nexus table: id UUID PK, tenant_id UUID, state_code TEXT, created_at TIMESTAMP WITH TIME ZONE
    const result = await (this.db as any).query(
      `SELECT id, state_code as "stateCode", created_at as "createdAt" FROM tax_nexus WHERE tenant_id = $1 ORDER BY state_code ASC`,
      [tenantId]
    );

    return (result as any).rows;
  }

  /**
   * Adds a new state nexus for the tenant.
   * Corresponds to POST /tax/nexus
   *
   * @param req The request object containing user information (tenantId).
   * @param addStateNexusDto The DTO containing the state code to add.
   * @returns The newly created nexus entry.
   */
  @Post('nexus')
  async addStateNexus(@Request() req, @Body() addStateNexusDto: AddStateNexusDto): Promise<AddStateNexusResponse> {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context.');
    }

    const { stateCode } = addStateNexusDto;

    if (!stateCode || typeof stateCode !== 'string' || stateCode.length !== 2) {
      throw new BadRequestException('Invalid state code. Must be a 2-letter string (e.g., "CA").');
    }

    const normalizedStateCode = stateCode.toUpperCase();

    // Check for existing nexus to prevent duplicates
    const existingNexus = await (this.db as any).query(
      `SELECT id FROM tax_nexus WHERE tenant_id = $1 AND state_code = $2`,
      [tenantId, normalizedStateCode]
    );

    if ((existingNexus as any).rows.length > 0) {
      throw new ConflictException(`Tax nexus already exists for state: ${normalizedStateCode}`);
    }

    const newId = v4(); // Generate a new UUID
    const createdAt = new Date().toISOString();

    // Insert new nexus entry
    await (this.db as any).query(
      `INSERT INTO tax_nexus (id, tenant_id, state_code, created_at) VALUES ($1, $2, $3, $4)`,
      [newId, tenantId, normalizedStateCode, createdAt]
    );

    return {
      id: newId,
      stateCode: normalizedStateCode,
      createdAt: createdAt,
    };
  }

  /**
   * Calculates the tax for a given set of items and location.
   * Corresponds to GET /tax/calculate (takes a Body as per task request)
   *
   * @param req The request object containing user information (tenantId).
   * @param calculateTaxDto The DTO containing location, items, and customer tax exempt status.
   * @returns An object with the total tax amount and a breakdown per item.
   */
  @Get('calculate') // Although it takes a body, the task specified GET
  async calculateTax(@Request() req, @Body() calculateTaxDto: CalculateTaxDto): Promise<TaxCalculationResponse> {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context.');
    }

    const { location, items, isCustomerTaxExempt } = calculateTaxDto;

    if (!location || !location.state || typeof location.state !== 'string' || location.state.length !== 2) {
      throw new BadRequestException('Invalid or missing state in location. Must be a 2-letter string.');
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Items array cannot be empty.');
    }

    // If customer is tax exempt, no tax is collected
    if (isCustomerTaxExempt) {
      const exemptBreakdown: TaxBreakdownItem[] = items.map(item => ({
        itemId: item.id,
        itemTotal: parseFloat((item.price * item.quantity).toFixed(2)),
        taxableAmount: 0,
        taxRate: 0,
        taxAmount: 0,
      }));
      return {
        totalTaxAmount: 0,
        itemBreakdown: exemptBreakdown,
      };
    }

    const stateCode = location.state.toUpperCase();

    // Fetch the tax rate for the state and tenant.
    // Assumed schema for tax_rates table: id UUID PK, tenant_id UUID, state_code TEXT, rate NUMERIC, effective_date DATE, is_active BOOLEAN
    // Loyalty rule: NEVER hardcode rates â€” read from tenant config
    const taxRateResult = await (this.db as any).query(
      `SELECT rate FROM tax_rates WHERE tenant_id = $1 AND state_code = $2 AND is_active = TRUE ORDER BY effective_date DESC LIMIT 1`,
      [tenantId, stateCode]
    );

    // If no active rate is found for the state, assume 0% tax for calculation.
    // In a real system, you might throw a NotFoundException if a rate *must* exist for states with nexus.
    const taxRate = (taxRateResult as any).rows.length > 0 ? parseFloat((taxRateResult as any).rows[0].rate) : 0;

    let totalTaxAmount = 0;
    const itemBreakdown: TaxBreakdownItem[] = [];

    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      const taxableAmount = item.isTaxable ? itemTotal : 0;
      const itemTaxAmount = taxableAmount * taxRate;

      totalTaxAmount += itemTaxAmount;

      itemBreakdown.push({
        itemId: item.id,
        itemTotal: parseFloat(itemTotal.toFixed(2)),
        taxableAmount: parseFloat(taxableAmount.toFixed(2)),
        taxRate: taxRate,
        taxAmount: parseFloat(itemTaxAmount.toFixed(2)),
      });
    }

    return {
      totalTaxAmount: parseFloat(totalTaxAmount.toFixed(2)),
      itemBreakdown: itemBreakdown,
    };
  }

  /**
   * Retrieves a monthly tax report by state for the tenant.
   * Corresponds to GET /tax/report?month=YYYY-MM
   *
   * @param req The request object containing user information (tenantId).
   * @param month The month in YYYY-MM format.
   * @returns A monthly tax report summarizing tax collected by state.
   */
  @Get('report')
  async getMonthlyTaxReport(@Request() req, @Query('month') month: string): Promise<MonthlyTaxReportResponse> {
    const tenantId = req?.user?.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in request context.');
    }

    // Validate month format YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('Invalid month format. Expected YYYY-MM (e.g., 2023-01).');
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    // Validate month number
    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Invalid month or year in format YYYY-MM.');
    }

    // Calculate start and end of the month in UTC
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0)); // Month is 0-indexed in JS Date
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999)); // Last day of the month

    // Assumed schema for tax_transactions table: id UUID PK, tenant_id UUID, state_code TEXT, tax_amount NUMERIC, transaction_date TIMESTAMP WITH TIME ZONE
    const result = await (this.db as any).query(
      `
      SELECT
        state_code as "stateCode",
        SUM(tax_amount) as "totalTaxCollected"
      FROM tax_transactions
      WHERE tenant_id = $1
        AND transaction_date >= $2
        AND transaction_date <= $3
      GROUP BY state_code
      ORDER BY state_code ASC
      `,
      [tenantId, startDate.toISOString(), endDate.toISOString()]
    );

    let totalCollectedAcrossAllStates = 0;
    const stateReports: MonthlyTaxReportEntry[] = (result as any).rows.map((row: any) => {
      const totalCollected = parseFloat(row.totalTaxCollected); // Cast from DB numeric string
      totalCollectedAcrossAllStates += totalCollected;
      return {
        stateCode: row.stateCode,
        totalTaxCollected: parseFloat(totalCollected.toFixed(2)),
      };
    });

    return {
      reportMonth: month,
      totalCollectedAcrossAllStates: parseFloat(totalCollectedAcrossAllStates.toFixed(2)),
      stateReports: stateReports,
    };
  }
}



