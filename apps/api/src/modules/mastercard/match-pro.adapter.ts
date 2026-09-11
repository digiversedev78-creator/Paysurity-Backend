import { Injectable, Logger } from '@nestjs/common';

/**
 * Mastercard Match Pro Adapter -- Merchant Screening
 *
 * Enables PaySurity to screen merchants during onboarding:
 *   - TERMINATED MERCHANT FILE (TMF): Check if business/owner was previously
 *     terminated by another acquirer for fraud, excessive chargebacks, etc.
 *   - Combined TMF + Chargeback monitoring
 *   - MATCH inquiry before sending application to FluidPay/NMI/Argyle
 *
 * This is a CRITICAL compliance step -- Visa/Mastercard rules require acquirers
 * to check MATCH before onboarding, and PaySurity (as a payment facilitator)
 * inherits this requirement.
 *
 * Env vars:
 *   MC_MATCH_CONSUMER_KEY, MC_MATCH_PRIVATE_KEY_PATH,
 *   MC_MATCH_BASE_URL
 */

interface MatchConfig {
  consumerKey: string;
  baseUrl: string;
}

export interface MerchantScreeningRequest {
  /** Merchant legal name */
  merchantName: string;
  /** DBA name */
  dbaName?: string;
  /** Merchant Category Code */
  mcc: string;
  /** Address */
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /** Tax ID (hashed) */
  taxIdHash?: string;
  /** Principal (owner) information */
  principal?: {
    firstName: string;
    lastName: string;
    driversLicenseNumber?: string;
    dateOfBirth?: string; // YYYY-MM-DD
  };
  /** Phone */
  phone?: string;
  /** URL */
  url?: string;
}

export interface MatchResult {
  /** Whether the merchant appears in TMF */
  isOnTmf: boolean;
  /** Number of matches found */
  matchCount: number;
  /** Match details if found */
  matches: Array<{
    merchantName: string;
    terminationReasonCode: string;
    terminationReasonDescription: string;
    terminationDate: string;
    addedDate: string;
    acquirer: string;
  }>;
  /** Risk assessment */
  riskLevel: 'CLEAR' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'BLOCKED';
  /** PaySurity recommendation */
  recommendation: 'APPROVE' | 'MANUAL_REVIEW' | 'DECLINE';
  /** Inquiry reference ID */
  inquiryId: string;
  /** Timestamp */
  checkedAt: string;
}

// TMF termination reason codes
const TERMINATION_REASONS: Record<string, string> = {
  '01': 'Account Data Compromise',
  '02': 'Common Point of Purchase',
  '03': 'Laundering',
  '04': 'Excessive Chargebacks',
  '05': 'Excessive Fraud',
  '06': 'Merchant Collusion',
  '07': 'Violation of Standards',
  '08': 'Bankrupt/Liquidated/Dissolved',
  '09': 'Transaction Laundering',
  '10': 'Mastercard Fraudulent Transfers Program',
  '11': 'Illegal Transactions',
  '12': 'Identity Theft',
  '13': 'PCI-DSS Noncompliance',
  '14': 'Illegal Use of Prepaid Cards',
};

@Injectable()
export class MatchProAdapter {
  private readonly logger = new Logger(MatchProAdapter.name);
  private readonly config: MatchConfig;

  constructor() {
    this.config = {
      consumerKey: process.env.MC_MATCH_CONSUMER_KEY ?? '',
      baseUrl: process.env.MC_MATCH_BASE_URL ?? 'https://sandbox.api.mastercard.com/fraud/merchant/v3',
    };
  }

  /**
   * Screen a merchant against the Terminated Merchant File.
   * This MUST be called during onboarding before gateway submission.
   */
  async screenMerchant(req: MerchantScreeningRequest): Promise<MatchResult> {
    this.logger.log(`[MC-MATCH] Screening merchant: ${req.merchantName}`);

    const payload = {
      acquirerId: process.env.PAYSURITY_ACQUIRER_ID ?? '000000',
      inquiry: {
        merchant: {
          name: req.merchantName,
          doingBusinessAsName: req.dbaName,
          merchantCategoryCode: req.mcc,
          address: {
            line1: req.address.street,
            city: req.address.city,
            countrySubdivision: req.address.state,
            postalCode: req.address.postalCode,
            country: req.address.country,
          },
          phoneNumber: req.phone,
          url: req.url,
          nationalTaxId: req.taxIdHash,
        },
        principal: req.principal ? {
          firstName: req.principal.firstName,
          lastName: req.principal.lastName,
          driversLicense: req.principal.driversLicenseNumber,
          dateOfBirth: req.principal.dateOfBirth,
        } : undefined,
      },
    };

    const response = await this.callApi('POST', '/common/inquiry', payload);

    return this.processResponse(response);
  }

  /**
   * Re-check a previously inquired merchant (e.g., periodic review).
   */
  async reinquire(inquiryId: string): Promise<MatchResult> {
    this.logger.log(`[MC-MATCH] Re-inquiry for: ${inquiryId}`);
    const response = await this.callApi('GET', `/common/inquiry/${inquiryId}`, {});
    return this.processResponse(response);
  }

  // ── Private helpers ────────────────────────────────────────

  private processResponse(response: any): MatchResult {
    const matches = response?.possibleMerchantMatches ?? [];
    const formattedMatches = matches.map((m: any) => ({
      merchantName: m.merchantName ?? '',
      terminationReasonCode: m.terminationReasonCode ?? '',
      terminationReasonDescription: TERMINATION_REASONS[m.terminationReasonCode] ?? 'Unknown',
      terminationDate: m.dateTerminated ?? '',
      addedDate: m.dateAdded ?? '',
      acquirer: m.acquirerName ?? '',
    }));

    // Risk assessment logic
    let riskLevel: MatchResult['riskLevel'] = 'CLEAR';
    let recommendation: MatchResult['recommendation'] = 'APPROVE';

    if (formattedMatches.length > 0) {
      const hasFraud = formattedMatches.some((m: any) =>
        ['01', '03', '05', '06', '09', '10', '11'].includes(m.terminationReasonCode)
      );
      const hasChargebacks = formattedMatches.some((m: any) => m.terminationReasonCode === '04');

      if (hasFraud) {
        riskLevel = 'BLOCKED';
        recommendation = 'DECLINE';
      } else if (hasChargebacks) {
        riskLevel = 'HIGH_RISK';
        recommendation = 'MANUAL_REVIEW';
      } else {
        riskLevel = 'MEDIUM_RISK';
        recommendation = 'MANUAL_REVIEW';
      }
    }

    return {
      isOnTmf: formattedMatches.length > 0,
      matchCount: formattedMatches.length,
      matches: formattedMatches,
      riskLevel,
      recommendation,
      inquiryId: response?.inquiryId ?? `inq_${Date.now()}`,
      checkedAt: new Date().toISOString(),
    };
  }

  private async callApi(method: string, path: string, body: Record<string, any>): Promise<any> {
    const url = `${this.config.baseUrl}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.consumerKey}`,
    };

    const fetchOpts: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(15_000),
    };

    if (method !== 'GET' && Object.keys(body).length > 0) {
      fetchOpts.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOpts);
    const data = await response.json() as Record<string, any>;

    if (!response.ok) {
      this.logger.error(`[MC-MATCH] API error: ${JSON.stringify(data)}`);
      throw new Error(`MATCH Pro ${method} ${path}: ${data?.Errors?.[0]?.Description ?? `HTTP ${response.status}`}`);
    }

    return data;
  }
}
