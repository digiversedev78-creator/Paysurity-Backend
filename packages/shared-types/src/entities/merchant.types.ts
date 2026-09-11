/**
 * Merchant Domain Types
 * PORTED FROM: PS-Platform/shared/types/merchant.ts (258 lines)
 */

export type BusinessType =
  | 'restaurant' | 'retail' | 'grocery' | 'ecommerce'
  | 'professional_services' | 'healthcare' | 'hospitality'
  | 'automotive' | 'education' | 'nonprofit' | 'government';

export type MerchantState =
  | 'pending' | 'under_review' | 'approved' | 'active'
  | 'suspended' | 'terminated' | 'declined' | 'dormant';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Merchant {
  id: string;
  tenantId: string;
  legalName: string;
  dba: string;
  businessType: BusinessType;
  industry: string;
  taxId: string;
  phone: string;
  email: string;
  website?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: MerchantState;
  riskLevel: RiskLevel;
  processingVolume: {
    monthlyVolume: number;
    averageTicket: number;
    highTicket: number;
  };
  bankingInfo: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
    accountType: 'checking' | 'savings';
  };
  principals: Principal[];
  pricingModel: PricingModel;
  equipment: Equipment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Principal {
  firstName: string;
  lastName: string;
  title: string;
  ownershipPercentage: number;
  ssn: string;
  dateOfBirth: Date;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface PricingModel {
  type: 'interchange_plus' | 'flat_rate' | 'tiered';
  interchangeMarkup?: number;
  flatRate?: number;
  perTransactionFee: number;
  monthlyFee: number;
  annualFee?: number;
  pciFee?: number;
  batchFee?: number;
  chargebackFee?: number;
}

export interface Equipment {
  id: string;
  type: 'terminal' | 'pos_system' | 'mobile_reader' | 'gateway' | 'pin_pad';
  model: string;
  serialNumber?: string;
  status: 'active' | 'inactive' | 'returned' | 'lost';
  assignedAt: Date;
}

export interface MerchantApplication {
  id: string;
  tenantId: string;
  merchant: Partial<Merchant>;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'declined';
  underwritingDecision?: UnderwritingDecision;
  documents: MerchantDocument[];
  submittedAt?: Date;
  decidedAt?: Date;
}

export interface UnderwritingDecision {
  decision: 'approved' | 'declined' | 'conditional';
  riskScore: number;
  riskLevel: RiskLevel;
  conditions?: string[];
  declinedReasons?: string[];
  reviewedBy: string;
  reviewedAt: Date;
}

export interface MerchantDocument {
  id: string;
  type: 'business_license' | 'tax_return' | 'bank_statement' | 'void_check' | 'id_front' | 'id_back' | 'other';
  filename: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
}

export interface ChargebackCase {
  id: string;
  merchantId: string;
  transactionId: string;
  amount: number;
  reason: string;
  reasonCode: string;
  status: 'open' | 'representment' | 'won' | 'lost' | 'expired';
  deadline: Date;
  evidence?: string[];
  openedAt: Date;
  resolvedAt?: Date;
}
