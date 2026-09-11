import { Injectable, Logger } from '@nestjs/common';

/**
 * Mastercard Open Finance Adapter (via Finicity APIs)
 *
 * PaySurity acts as a "Direct Partner" (Distributor) in the Open Finance
 * Partner Direct Model. This adapter provides sub-merchants with:
 *   - Account Verification: Validate bank accounts before ACH payroll/settlements
 *   - Balance Checks: Verify customer funds before BNPL approval
 *   - Income Verification: Support merchant underwriting decisions
 *   - Transaction History: Access for credit decisioning
 *
 * Env vars:
 *   MC_OPEN_FINANCE_PARTNER_ID, MC_OPEN_FINANCE_PARTNER_SECRET,
 *   MC_OPEN_FINANCE_APP_KEY, MC_OPEN_FINANCE_BASE_URL
 *
 * Registration: mastercard.com/open-banking → Partner Direct
 */

interface OpenFinanceConfig {
  partnerId: string;
  partnerSecret: string;
  appKey: string;
  baseUrl: string;
}

// ── Response types ───────────────────────────────────────────
export interface AccountVerificationResult {
  verified: boolean;
  accountId: string;
  institutionName: string;
  accountType: string; // checking | savings
  accountNumberLast4: string;
  routingNumber: string;
  realAccountNumber?: string; // only if permissioned
}

export interface BalanceCheckResult {
  available: number; // cents
  current: number;   // cents
  currency: string;
  asOf: string;      // ISO timestamp
}

export interface IncomeVerificationResult {
  verified: boolean;
  annualIncome: number; // cents
  incomeStreams: Array<{
    employer: string;
    monthlyIncome: number;
    confidence: number; // 0-100
  }>;
}

@Injectable()
export class OpenFinanceAdapter {
  private readonly logger = new Logger(OpenFinanceAdapter.name);
  private readonly config: OpenFinanceConfig;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor() {
    this.config = {
      partnerId: process.env.MC_OPEN_FINANCE_PARTNER_ID ?? '',
      partnerSecret: process.env.MC_OPEN_FINANCE_PARTNER_SECRET ?? '',
      appKey: process.env.MC_OPEN_FINANCE_APP_KEY ?? '',
      baseUrl: process.env.MC_OPEN_FINANCE_BASE_URL ?? 'https://api.finicity.com',
    };
  }

  /**
   * Generate an authentication token for the Finicity/Open Finance API.
   * Tokens are cached and refreshed automatically.
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    this.logger.log('[MC-OF] Authenticating with Open Finance API');

    const response = await fetch(`${this.config.baseUrl}/aggregation/v2/partners/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Finicity-App-Key': this.config.appKey,
      },
      body: JSON.stringify({
        partnerId: this.config.partnerId,
        partnerSecret: this.config.partnerSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Open Finance auth failed: HTTP ${response.status}`);
    }

    const data = await response.json() as { token: string };
    this.accessToken = data.token;
    this.tokenExpiry = Date.now() + 7_200_000; // 2-hour expiry
    return this.accessToken;
  }

  /**
   * Create a consumer link -- redirects user to bank selection.
   * Used during merchant onboarding, payroll direct deposit setup, etc.
   */
  async createConnectUrl(
    customerId: string,
    redirectUrl: string,
    webhook: string,
  ): Promise<{ link: string; requestId: string }> {
    const token = await this.authenticate();

    const response = await fetch(`${this.config.baseUrl}/connect/v2/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Finicity-App-Key': this.config.appKey,
        'Finicity-App-Token': token,
      },
      body: JSON.stringify({
        partnerId: this.config.partnerId,
        customerId,
        redirectUri: redirectUrl,
        webhook,
        type: 'aggregation',
        institutionSettings: { filters: { country: 'US' } },
      }),
    });

    const data = await response.json() as { link: string; requestId: string };
    this.logger.log(`[MC-OF] Connect URL generated for customer ${customerId}`);
    return data;
  }

  /**
   * Verify account ownership -- essential before ACH transactions.
   * Used in payroll setup, settlement bank verification.
   */
  async verifyAccount(
    customerId: string,
    accountId: string,
  ): Promise<AccountVerificationResult> {
    const token = await this.authenticate();

    const response = await fetch(
      `${this.config.baseUrl}/aggregation/v1/customers/${customerId}/accounts/${accountId}`,
      {
        headers: {
          'Finicity-App-Key': this.config.appKey,
          'Finicity-App-Token': token,
        },
      },
    );

    const data = await response.json() as any;

    return {
      verified: data.status === 'active',
      accountId: data.id,
      institutionName: data.institutionId ?? 'Unknown',
      accountType: data.type ?? 'checking',
      accountNumberLast4: data.accountNumberDisplay?.slice(-4) ?? '****',
      routingNumber: data.routingNumber ?? '',
      realAccountNumber: data.realAccountNumber, // only with permission
    };
  }

  /**
   * Check account balance -- used before BNPL approval.
   */
  async checkBalance(
    customerId: string,
    accountId: string,
  ): Promise<BalanceCheckResult> {
    const token = await this.authenticate();

    const response = await fetch(
      `${this.config.baseUrl}/aggregation/v1/customers/${customerId}/accounts/${accountId}/details`,
      {
        headers: {
          'Finicity-App-Key': this.config.appKey,
          'Finicity-App-Token': token,
        },
      },
    );

    const data = await response.json() as any;

    return {
      available: Math.round((data.availableBalance ?? 0) * 100),
      current: Math.round((data.currentBalance ?? 0) * 100),
      currency: 'USD',
      asOf: new Date().toISOString(),
    };
  }

  /**
   * Income verification -- used for merchant underwriting.
   */
  async verifyIncome(customerId: string): Promise<IncomeVerificationResult> {
    const token = await this.authenticate();

    const response = await fetch(
      `${this.config.baseUrl}/decisioning/v2/customers/${customerId}/voiHistory`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Finicity-App-Key': this.config.appKey,
          'Finicity-App-Token': token,
        },
        body: JSON.stringify({ reportId: 'voi' }),
      },
    );

    const data = await response.json() as any;
    const streams = data.incomeStreams ?? [];

    return {
      verified: streams.length > 0,
      annualIncome: Math.round((data.estimatedAnnualIncome ?? 0) * 100),
      incomeStreams: streams.map((s: any) => ({
        employer: s.employer ?? 'Unknown',
        monthlyIncome: Math.round((s.avgMonthlyIncome ?? 0) * 100),
        confidence: s.confidenceScore ?? 0,
      })),
    };
  }
}
