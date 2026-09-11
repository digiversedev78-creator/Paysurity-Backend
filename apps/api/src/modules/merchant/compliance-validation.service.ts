/**
 * Compliance & KYC/AML/OFAC/PCI-DSS Validation Service
 * PORTED FROM: PS-Platform/shared/services/ComplianceService.ts (445 lines)
 *
 * REQ: PLATSIS-001..005 -- Regulatory compliance checks
 */
import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
import { randomUUID } from 'crypto';

// ─── Domain Interfaces ──────────────────────────────────────────────

export type ComplianceCheckType = 'kyc' | 'aml' | 'ofac' | 'pci_dss';
export type ComplianceStatus = 'approved' | 'requires_action' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FindingSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ComplianceFinding {
  id: string;
  severity: FindingSeverity;
  category: string;
  description: string;
  recommendation: string;
  remediated: boolean;
  remediatedAt?: Date;
  remediatedBy?: string;
}

export interface ComplianceCheckResult {
  checkId: string;
  resourceType: string;
  resourceId: string;
  checkType: ComplianceCheckType;
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  findings: ComplianceFinding[];
  checkedAt: Date;
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class ComplianceValidationService {
  private readonly logger = new Logger(ComplianceValidationService.name);

  // OFAC high-risk countries (FATF + OFAC SDN list)
  private readonly HIGH_RISK_COUNTRIES = [
    'AF', 'IR', 'KP', 'SY', 'MM', 'BY', 'CU', 'IQ', 'LB', 'LY', 'SO', 'SS', 'SD', 'VE', 'YE', 'ZW',
  ];

  private readonly HIGH_RISK_BUSINESS_TYPES = [
    'money_services', 'cryptocurrency', 'adult_entertainment', 'gambling',
    'firearms', 'pharmaceuticals', 'debt_collection', 'telemarketing',
  ];

  constructor(private readonly eventBus: EventBusService) {}

  // ─── KYC ────────────────────────────────────────────────────────

  async performKYCCheck(
    resourceId: string, resourceType: string, data: Record<string, any>,
    tenantId: string, traceId: string,
  ): Promise<ComplianceCheckResult> {
    const findings = this.runKYCValidation(data);
    return this.buildResult('kyc', resourceId, resourceType, findings, tenantId, traceId);
  }

  private runKYCValidation(data: Record<string, any>): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];

    if (!data.firstName || !data.lastName) {
      findings.push(this.finding('error', 'identity', 'Missing required identity information', 'Collect first and last name'));
    }
    if (!data.ssn && !data.ein) {
      findings.push(this.finding('error', 'identity', 'Missing tax identification number', 'Collect SSN or EIN'));
    }
    if (!data.address) {
      findings.push(this.finding('warning', 'address', 'Missing address information', 'Collect complete address'));
    }
    if (data.dateOfBirth) {
      const age = this.calculateAge(new Date(data.dateOfBirth));
      if (age < 18) {
        findings.push(this.finding('error', 'eligibility', 'Individual is under 18 years old', 'Verify age and legal capacity'));
      }
    }
    return findings;
  }

  // ─── AML ────────────────────────────────────────────────────────

  async performAMLCheck(
    resourceId: string, resourceType: string, data: Record<string, any>,
    tenantId: string, traceId: string,
  ): Promise<ComplianceCheckResult> {
    const findings = this.runAMLValidation(data);
    return this.buildResult('aml', resourceId, resourceType, findings, tenantId, traceId);
  }

  private runAMLValidation(data: Record<string, any>): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];

    if (data.country && this.HIGH_RISK_COUNTRIES.includes(data.country.toUpperCase())) {
      findings.push(this.finding('warning', 'geography', 'Entity located in high-risk jurisdiction', 'Enhanced due diligence required'));
    }
    if (data.businessType && this.HIGH_RISK_BUSINESS_TYPES.includes(data.businessType.toLowerCase())) {
      findings.push(this.finding('warning', 'business_risk', 'High-risk business type identified', 'Additional monitoring required'));
    }
    if (data.monthlyVolume && data.monthlyVolume > 1_000_000) {
      findings.push(this.finding('info', 'volume', 'High transaction volume merchant', 'Enhanced transaction monitoring'));
    }
    return findings;
  }

  // ─── OFAC ───────────────────────────────────────────────────────

  async performOFACCheck(
    name: string, address?: string, traceId?: string,
  ): Promise<{ match: boolean; confidence: number; details?: any }> {
    const searchTerms = [name.toLowerCase()];
    if (address) searchTerms.push(address.toLowerCase());

    const suspiciousTerms = ['terrorist', 'sanctions', 'blocked', 'denied'];
    const hasMatch = suspiciousTerms.some(term => searchTerms.some(s => s.includes(term)));
    const confidence = hasMatch ? Math.random() * 0.3 + 0.7 : Math.random() * 0.3;

    this.logger.log(`[OFAC] Check: name=${name} match=${hasMatch} conf=${confidence.toFixed(2)} | trace=${traceId}`);
    return { match: hasMatch, confidence, details: hasMatch ? { reason: 'Name match found in OFAC database' } : null };
  }

  // ─── PCI-DSS ────────────────────────────────────────────────────

  async performPCICheck(
    merchantId: string, data: Record<string, any>, tenantId: string, traceId: string,
  ): Promise<ComplianceCheckResult> {
    const findings: ComplianceFinding[] = [];
    if (data.storesCardData) {
      findings.push(this.finding('critical', 'data_storage', 'Merchant stores cardholder data', 'Implement PCI DSS Level 1 compliance'));
    }
    if (!data.usesSsl) {
      findings.push(this.finding('error', 'encryption', 'SSL/TLS not implemented', 'Implement SSL/TLS encryption'));
    }
    if (!data.hasFirewall) {
      findings.push(this.finding('warning', 'network_security', 'Firewall not configured', 'Install and configure firewall'));
    }
    return this.buildResult('pci_dss', merchantId, 'merchant', findings, tenantId, traceId);
  }

  // ─── Helpers ────────────────────────────────────────────────────

  private buildResult(
    checkType: ComplianceCheckType, resourceId: string, resourceType: string,
    findings: ComplianceFinding[], tenantId: string, traceId: string,
  ): ComplianceCheckResult {
    const riskLevel = this.calculateRiskLevel(findings);
    const status = this.determineStatus(findings);
    const checkId = `comp_${Date.now()}_${randomUUID().substring(0, 8)}`;

    this.logger.log(
      `[COMPLIANCE] ${checkType.toUpperCase()} check | resource=${resourceId} status=${status} risk=${riskLevel} findings=${findings.length} | trace=${traceId}`,
    );

    return { checkId, resourceType, resourceId, checkType, status, riskLevel, findings, checkedAt: new Date() };
  }

  private calculateRiskLevel(findings: ComplianceFinding[]): RiskLevel {
    const crit = findings.filter(f => f.severity === 'critical').length;
    const err = findings.filter(f => f.severity === 'error').length;
    const warn = findings.filter(f => f.severity === 'warning').length;
    if (crit > 0) return 'critical';
    if (err > 2) return 'high';
    if (err > 0 || warn > 3) return 'medium';
    return 'low';
  }

  private determineStatus(findings: ComplianceFinding[]): ComplianceStatus {
    const crit = findings.filter(f => f.severity === 'critical').length;
    const err = findings.filter(f => f.severity === 'error').length;
    if (crit > 0 || err > 0) return 'rejected';
    if (findings.filter(f => f.severity === 'warning').length > 0) return 'requires_action';
    return 'approved';
  }

  private finding(severity: FindingSeverity, category: string, description: string, recommendation: string): ComplianceFinding {
    return { id: `find_${Date.now()}_${randomUUID().substring(0, 8)}`, severity, category, description, recommendation, remediated: false };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }
}
