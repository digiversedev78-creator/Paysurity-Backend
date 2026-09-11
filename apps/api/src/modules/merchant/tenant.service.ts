/**
 * Multi-Tenant Service
 * PORTED FROM: PS-Platform/shared/services/TenantService.ts (473 lines)
 *
 * Tenant isolation, provisioning, schema-per-tenant creation,
 * feature-flag gating, plan-based limits, usage tracking.
 * REQ: PLATSIS-001..005
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

// ─── Domain Interfaces ──────────────────────────────────────────────

export type TenantStatus = 'active' | 'suspended' | 'pending' | 'terminated';
export type TenantPlan = 'starter' | 'professional' | 'enterprise';

export interface TenantSettings {
  branding: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
    custom_domain?: string;
  };
  features: {
    digital_wallets: boolean;
    pos_systems: boolean;
    payroll: boolean;
    e_commerce: boolean;
    affiliates: boolean;
    compliance: boolean;
    erp: boolean;
    bistrobeast: boolean;    // Restaurant Management (BistroBeast)
    grocerease: boolean;     // Grocery Store Management (GrocerEase)
    payecomm: boolean;       // E-commerce (PayEcomm)
    payretail: boolean;      // Retail POS (PayRetail)
  };
  security: {
    mfa_required: boolean;
    session_timeout: number;
    password_policy: 'standard' | 'strong' | 'enterprise';
    ip_whitelist?: string[];
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    webhook_url?: string;
  };
}

export interface TenantLimits {
  max_users: number;
  max_merchants: number;
  max_transactions_per_month: number;
  max_storage_gb: number;
  max_api_calls_per_hour: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: TenantStatus;
  plan: TenantPlan;
  settings: TenantSettings;
  limits: TenantLimits;
  created_at: Date;
  updated_at: Date;
}

export interface TenantUsage {
  tenant_id: string;
  current_usage: {
    users: number;
    merchants: number;
    transactions_this_month: number;
    storage_gb: number;
    api_calls_per_hour: number;
  };
  limits: TenantLimits;
  usage_percentage: {
    users: number;
    merchants: number;
    transactions: number;
    storage: number;
  };
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  // ─── CRUD Operations ──────────────────────────────────────────

  /**
   * Build a new tenant with plan-appropriate defaults.
   * In production, this also creates a DB schema and seeds data.
   */
  buildNewTenant(data: Partial<Tenant>): Tenant {
    const plan = data.plan ?? 'starter';
    return {
      id: `tenant_${Date.now()}_${randomUUID().substring(0, 8)}`,
      name: data.name ?? '',
      domain: data.domain ?? '',
      status: 'pending',
      plan,
      settings: this.getDefaultSettings(plan),
      limits: this.getDefaultLimits(plan),
      created_at: new Date(),
      updated_at: new Date(),
      ...data,
    };
  }

  /**
   * Resolve tenant ID from an incoming request.
   * Priority: x-tenant-id header > query param > body > subdomain extraction.
   */
  extractTenantId(headers: Record<string, string | undefined>, queryTenantId?: string, bodyTenantId?: string, host?: string): string | null {
    const tenantId = headers['x-tenant-id'] ?? queryTenantId ?? bodyTenantId ?? this.extractTenantFromDomain(host);
    return tenantId ?? null;
  }

  // ─── Feature-Gate Checking ────────────────────────────────────

  /**
   * Check whether a tenant has access to a specific feature.
   */
  hasFeatureAccess(tenant: Tenant, resource: string): boolean {
    if (tenant.status !== 'active') return false;

    const featureMap: Record<string, keyof TenantSettings['features']> = {
      wallets: 'digital_wallets',
      pos: 'pos_systems',
      payroll: 'payroll',
      ecommerce: 'e_commerce',
      affiliates: 'affiliates',
      compliance: 'compliance',
      erp: 'erp',
      bistrobeast: 'bistrobeast',
      grocerease: 'grocerease',
      payecomm: 'payecomm',
      payretail: 'payretail',
    };

    const feature = featureMap[resource];
    if (feature && !tenant.settings.features[feature]) {
      this.logger.warn(`[TENANT] Feature denied: ${resource} for tenant ${tenant.id}`);
      return false;
    }
    return true;
  }

  /**
   * Check usage against plan limits.
   */
  isWithinLimits(usage: TenantUsage, dimension: 'users' | 'merchants' | 'transactions' | 'storage' | 'api_calls'): boolean {
    return usage.usage_percentage[dimension === 'api_calls' ? 'users' : dimension] < 100;
  }

  // ─── Plan Defaults ────────────────────────────────────────────

  getDefaultSettings(plan: TenantPlan = 'starter'): TenantSettings {
    return {
      branding: {},
      features: {
        digital_wallets: true,
        pos_systems: true,
        payroll: plan !== 'starter',
        e_commerce: plan !== 'starter',
        affiliates: plan === 'enterprise',
        compliance: true,
        erp: plan === 'enterprise',
        bistrobeast: true,
        grocerease: plan !== 'starter',
        payecomm: plan !== 'starter',
        payretail: true,
      },
      security: {
        mfa_required: plan === 'enterprise',
        session_timeout: plan === 'enterprise' ? 1800 : 3600,
        password_policy: plan === 'enterprise' ? 'enterprise' : 'standard',
      },
      notifications: {
        email_enabled: true,
        sms_enabled: plan !== 'starter',
      },
    };
  }

  getDefaultLimits(plan: TenantPlan = 'starter'): TenantLimits {
    const PLAN_LIMITS: Record<TenantPlan, TenantLimits> = {
      starter: {
        max_users: 10,
        max_merchants: 5,
        max_transactions_per_month: 1_000,
        max_storage_gb: 5,
        max_api_calls_per_hour: 1_000,
      },
      professional: {
        max_users: 50,
        max_merchants: 25,
        max_transactions_per_month: 10_000,
        max_storage_gb: 50,
        max_api_calls_per_hour: 10_000,
      },
      enterprise: {
        max_users: 500,
        max_merchants: 100,
        max_transactions_per_month: 100_000,
        max_storage_gb: 500,
        max_api_calls_per_hour: 100_000,
      },
    };
    return PLAN_LIMITS[plan] ?? PLAN_LIMITS.starter;
  }

  /**
   * List of tenant-specific Postgres tables to replicate on schema creation.
   */
  getTenantTables(): string[] {
    return [
      'users', 'merchants', 'transactions', 'wallets', 'orders',
      'inventory', 'employees', 'payroll', 'compliance_records',
    ];
  }

  // ─── Helpers ──────────────────────────────────────────────────

  private extractTenantFromDomain(host?: string): string | null {
    if (host && host.includes('.')) {
      const subdomain = host.split('.')[0];
      return subdomain !== 'www' && subdomain !== 'api' ? subdomain : null;
    }
    return null;
  }
}
