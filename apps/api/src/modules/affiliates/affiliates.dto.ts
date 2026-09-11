/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AFR-010 — Affiliate Fraud Detection
 * FILE TYPE:    DTO
 * MODULE:       affiliates
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/AFR_AFFILIATES_RESELLERS.md
 * WORKER:       CODER-137
 * GENERATED:    2026-03-18T10:38:36.274Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsUUID, IsEnum, Min, Max, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum defining the types of affiliate fraud detection rules.
 */
export enum AffiliateFraudRuleType {
  IP_BLACKLIST = 'IP_BLACKLIST',
  VELOCITY_CHECK = 'VELOCITY_CHECK',
  TRANSACTION_THRESHOLD = 'TRANSACTION_THRESHOLD',
  GEO_FENCE_VIOLATION = 'GEO_FENCE_VIOLATION',
  DEVICE_FINGERPRINT_MISMATCH = 'DEVICE_FINGERPRINT_MISMATCH',
}

/**
 * Base interface for all rule configurations.
 */
interface BaseRuleConfig {
  blockAction: boolean; // Whether the rule should automatically block the action or just flag for review
}

/**
 * Configuration for an IP_BLACKLIST rule.
 */
export class IpBlacklistRuleConfig implements BaseRuleConfig {
  @IsNotEmpty()
  @IsString({ each: true })
  ipAddresses: string[]; // List of IP addresses to blacklist

  @IsBoolean()
  blockAction: boolean; // Whether to block transactions from these IPs
}

/**
 * Configuration for a VELOCITY_CHECK rule.
 */
export class VelocityCheckRuleConfig implements BaseRuleConfig {
  @IsNumber()
  @Min(1)
  transactionsLimit: number; // Maximum number of transactions allowed

  @IsNumber()
  @Min(1)
  periodHours: number; // Within this many hours

  @IsBoolean()
  blockAction: boolean; // Whether to block if velocity limit is exceeded
}

/**
 * Configuration for a TRANSACTION_THRESHOLD rule.
 */
export class TransactionThresholdRuleConfig implements BaseRuleConfig {
  @IsNumber()
  @Min(0)
  amountThreshold: number; // Maximum transaction amount allowed

  @IsBoolean()
  blockAction: boolean; // Whether to block if transaction amount exceeds threshold
}

/**
 * DTO for creating a new Affiliate Fraud Rule.
 */
export class CreateAffiliateFraudRuleDto {
  @IsString()
  @IsNotEmpty()
  name: string; // A human-readable name for the rule

  @IsString()
  @IsOptional()
  description?: string; // Detailed description of the rule

  @IsEnum(AffiliateFraudRuleType)
  ruleType: AffiliateFraudRuleType; // The type of fraud rule

  @IsObject()
  @IsNotEmpty()
  ruleConfig: any; // Flexible configuration object specific to the ruleType. Validated in service.

  @IsNumber()
  @Min(1)
  @Max(100)
  priority: number; // Priority of the rule (1 = highest, 100 = lowest)

  @IsBoolean()
  isActive: boolean; // Whether the rule is currently active
}

/**
 * DTO for updating an existing Affiliate Fraud Rule (partial update).
 */
export class UpdateAffiliateFraudRuleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AffiliateFraudRuleType)
  ruleType?: AffiliateFraudRuleType;

  @IsOptional()
  @IsObject()
  @IsNotEmpty()
  ruleConfig?: any;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for responding with Affiliate Fraud Rule details.
 */
export class AffiliateFraudRuleResponseDto {
  @IsUUID()
  id: string;

  @IsUUID()
  tenantId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AffiliateFraudRuleType)
  ruleType: AffiliateFraudRuleType;

  @IsObject()
  ruleConfig: any;

  @IsNumber()
  priority: number;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

/**
 * DTO for providing data to evaluate against fraud rules.
 */
export class EvaluateAffiliateActivityDto {
  @IsUUID()
  @IsNotEmpty()
  affiliateId: string; // The ID of the affiliate performing the activity

  @IsString()
  @IsNotEmpty()
  transactionId: string; // A unique identifier for the specific activity/transaction

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number; // Transaction amount, if applicable (for threshold checks)

  @IsString()
  @IsOptional()
  ipAddress?: string; // IP address of the user performing the action (for IP blacklist/geolocation)

  @IsString()
  @IsOptional()
  countryCode?: string; // Country code derived from IP or user data (for geo-fencing)

  @IsString()
  @IsOptional()
  deviceFingerprint?: string; // Unique identifier for the device (for device checks)

  @IsString()
  @IsOptional()
  userEmail?: string; // Email of the user (can be used for specific blacklists)

  @IsString()
  @IsOptional()
  payoutMethod?: string; // Method of payout (e.g., 'BANK_TRANSFER', 'PAYPAL', for specific rule types)
}

/**
 * DTO for details about a single rule hit during fraud detection.
 */
export class FraudRuleHitDetails {
  @IsUUID()
  ruleId: string;

  @IsString()
  ruleName: string;

  @IsEnum(AffiliateFraudRuleType)
  ruleType: AffiliateFraudRuleType;

  @IsBoolean()
  triggered: boolean; // Whether this specific rule was triggered

  @IsString()
  @IsOptional()
  message?: string; // A message explaining why the rule was triggered

  @IsBoolean()
  blockedAction: boolean; // Whether this rule's configuration specifies blocking the action
}

/**
 * DTO for the overall result of a fraud detection evaluation.
 */
export class FraudDetectionResultDto {
  @IsBoolean()
  isFraudulent: boolean; // True if any active rule triggered fraud

  @IsString()
  @IsOptional()
  reason?: string; // A consolidated reason for the fraud detection outcome

  @ValidateNested({ each: true })
  @Type(() => FraudRuleHitDetails)
  ruleHits: FraudRuleHitDetails[]; // Details of all rules that were evaluated and potentially triggered
}
