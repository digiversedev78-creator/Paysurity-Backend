/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-004 -- Auto-Provision on Approval
 * FILE TYPE:    SERVICE
 * MODULE:       merchant-onboarding
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-112
 * GENERATED:    2026-03-17T13:11:31.759Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Logger, Inject, BadRequestException, BadGatewayException ,
  Optional} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

import { AuditLogService } from '../audit-log/audit-log.service';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { EncryptionService } from '../../shared/encryption/encryption.service'; // Assuming an encryption service exists
import { MailerService } from './mailer.service';
import { ComplianceValidationService } from './compliance-validation.service';

enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

enum TenantStatus {
  ACTIVE = 'ACTIVE',
  PENDING_PROVISION = 'PENDING_PROVISION',
  INACTIVE = 'INACTIVE',
}

// Define DTO for FluidPay Gateway Config. In a real application, this would typically be a class with validation decorators.
interface FluidPayGatewayConfigDto {
  merchantId: string;
  apiKey: string; // Terminal API Key
  processingLimits: {
    dailyLimit?: number;
    transactionLimit?: number;
    // ... potentially other limits like monthly, per_card_type etc.
  };
  mccCode: string;
  settlementAccount: string; // Identifier for the settlement bank account
}


@Injectable()
export class MerchantOnboardingService {
  private readonly logger = new Logger(MerchantOnboardingService.name);

  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    private readonly auditLogService: AuditLogService,
    private readonly httpService: HttpService, // Inject HttpService for external API calls
    private readonly encryptionService: EncryptionService, // Inject EncryptionService for API key encryption
    private readonly mailerService: MailerService, // Inject Mailer logic for Secure Drafting
    private readonly complianceService: ComplianceValidationService, // Inject Underwriting Engine
  ) {}

  /**
   * Approves an onboarding application and automatically provisions a new tenant.
   * @param applicationId The ID of the onboarding application to approve.
   * @param reviewerId The ID of the administrator performing the approval.
   * @param approvalNotes Optional notes from the reviewer.
   * @returns The newly provisioned tenant details.
   */
  async approveApplicationAndProvisionTenant(
    applicationId: string,
    reviewerId: string,
    approvalNotes?: string,
  ): Promise<any> { // Return type changed to any due to raw SQL execution
    this.logger.log(`Attempting to approve application ${applicationId} by reviewer ${reviewerId}`);

    let newTenant: any; // To store the provisioned tenant details

    try {
      // Use a transaction for atomicity
      await (this.db as any).transaction(async (tx) => {
        // 1. Fetch the onboarding application
        const applicationQuery = sql`
          SELECT id, status, applicant_name, tenant_id FROM onboarding_applications
          WHERE id = ${applicationId}
          LIMIT 1;
        `;
        const applicationResult = await (tx as any).execute(applicationQuery);
        const application = (applicationResult as any).rows[0];

        if (!application) {
          throw new NotFoundException(`Onboarding application with ID "${applicationId}" not found.`);
        }

        // 2. Validate application status
        if (application.status !== ApplicationStatus.PENDING) {
          throw new ConflictException(
            `Onboarding application "${applicationId}" cannot be approved. Current status: "${application.status}".`,
          );
        }

        // 3. Provision a new tenant
        const newTenantId = uuidv4();
        const newTenantName = application.applicant_name; // Derive tenant name from applicant name

        const insertTenantQuery = sql`
          INSERT INTO tenants (id, name, status, created_at, updated_at)
          VALUES (${newTenantId}, ${newTenantName}, ${TenantStatus.PENDING_PROVISION}, NOW(), NOW())
          RETURNING id, name, status, created_at, updated_at;
        `;
        const insertedTenantResult = await (tx as any).execute(insertTenantQuery);
        newTenant = (insertedTenantResult as any).rows[0];

        if (!newTenant) {
          throw new InternalServerErrorException('Failed to provision new tenant.');
        }

        // 4. Update the onboarding application status and link to the new tenant
        const updateApplicationQuery = sql`
          UPDATE onboarding_applications
          SET status = ${ApplicationStatus.APPROVED},
              tenant_id = ${newTenantId},
              updated_at = NOW()
          WHERE id = ${applicationId};
        `;
        await (tx as any).execute(updateApplicationQuery);

        // 5. Record audit log for approval
        await (this.auditLogService as any).recordAuditLog(
          'ONBOARDING_APPLICATION_APPROVED',
          reviewerId,
          `Application ${applicationId} approved. New tenant ${newTenantId} provisioned.`,
          { applicationId, newTenantId, approvalNotes },
          newTenantId, // The tenant ID the action is associated with
        );

        this.logger.log(`Application ${applicationId} approved and tenant ${newTenantId} provisioned.`);
      });
    } catch (error) {
      this.logger.error(`Error approving application ${applicationId}: ${error.message}`, error.stack);
      // Re-throw the original exception after logging
      throw error;
    }

    return newTenant; // Return the details of the newly provisioned tenant
  }

  /**
   * Configures FluidPay gateway for a specific merchant.
   * Endpoint: POST /merchant-onboarding/gateway-config
   * Stores merchant_id, terminal API key (encrypted), processing limits, MCC code, settlement account.
   * Validates config via FluidPay API ping.
   * @param req The request object, containing `tenantId` and `userId` in `req.user`.
   * @param config The FluidPay gateway configuration details.
   * @returns The newly created gateway configuration record (excluding sensitive data).
   */
  async configureFluidPayGateway(
    req: any, // Contains req.user.tenantId and req.user.userId
    config: FluidPayGatewayConfigDto,
  ): Promise<any> {
    const tenantId = req.user.tenantId;
    const userId = req.user.userId;
    const { merchantId, apiKey, processingLimits, mccCode, settlementAccount } = config;
    const gatewayName = 'FluidPay'; // Specific gateway being configured

    this.logger.log(`Attempting to configure ${gatewayName} gateway for merchant ${merchantId} under tenant ${tenantId}.`);

    if (!tenantId) {
      // This should ideally be caught by a global auth guard, but good for defensive coding.
      throw new BadRequestException('Tenant ID is missing from request context. Cannot process gateway configuration.');
    }

    // Basic input validation
    if (!merchantId || !apiKey || !mccCode || !settlementAccount || processingLimits === undefined || processingLimits === null) {
      throw new BadRequestException('All FluidPay gateway configuration fields (merchantId, apiKey, processingLimits, mccCode, settlementAccount) are required.');
    }

    // 1. Validate merchant ownership within the current tenant
    const merchantCheckQuery = sql`
      SELECT id FROM merchants
      WHERE id = ${merchantId} AND tenant_id = ${tenantId}
      LIMIT 1;
    `;
    const merchantCheckResult = await (this.db as any).execute(merchantCheckQuery);
    if ((merchantCheckResult as any).rows.length === 0) {
      throw new NotFoundException(`Merchant with ID "${merchantId}" not found or does not belong to tenant "${tenantId}".`);
    }

    // 2. Encrypt the API key before storing it
    let encryptedApiKey: string;
    try {
      encryptedApiKey = await (this.encryptionService as any).encrypt(apiKey);
      this.logger.debug('API key encrypted successfully for storage.');
    } catch (error) {
      this.logger.error(`Failed to encrypt API key for merchant ${merchantId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to securely store API key. Encryption service error.');
    }

    // 3. Validate configuration by pinging the FluidPay API
    // The actual FluidPay API URL for a "ping" or health check would vary.
    // This example assumes a simple GET endpoint, potentially requiring the raw API key for authentication.
    const fluidPayApiBaseUrl = process.env.FLUIDPAY_API_BASE_URL;
    if (!fluidPayApiBaseUrl) {
      this.logger.error('FLUIDPAY_API_BASE_URL environment variable is not set.');
      throw new InternalServerErrorException('FluidPay API base URL is not configured.');
    }
    const fluidPayTestUrl = `${fluidPayApiBaseUrl}/api/v1/ping`; // Example health check or test endpoint

    try {
      this.logger.log(`Pinging FluidPay API at ${fluidPayTestUrl} for validation.`);
      // IMPORTANT: In a production system, carefully consider if the raw API key
      // should be used directly for a "ping" or if a more secure validation method
      // (e.g., using a test transaction with a separate set of credentials or an SDK)
      // is available. For this task, direct usage for ping demonstrates the validation step.
      await (this.httpService as any).get(fluidPayTestUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`, // Authentication header for FluidPay API
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10-second timeout for the external API call
      }).toPromise(); // Convert RxJS Observable to a Promise
      this.logger.log(`FluidPay API ping successful for merchant ${merchantId}. Configuration appears valid.`);
    } catch (error) {
      this.logger.error(`FluidPay API ping failed for merchant ${merchantId}: ${error.message}. Response data: ${JSON.stringify(error.response?.data)}`, error.stack);
      throw new BadGatewayException(`FluidPay API validation failed. Please check the API key and configuration details. Error: ${error.response?.data?.message || error.message}`);
    }

    // 4. Store the validated configuration in the database
    try {
      const configId = uuidv4();
      const insertGatewayConfigQuery = sql`
        INSERT INTO merchant_gateway_configs (
          id,
          tenant_id,
          merchant_id,
          gateway_name,
          api_key_encrypted,
          processing_limits,
          mcc_code,
          settlement_account,
          created_at,
          updated_at
        ) VALUES (
          ${configId},
          ${tenantId},
          ${merchantId},
          ${gatewayName},
          ${encryptedApiKey},
          ${JSON.stringify(processingLimits)}::jsonb, -- Store processing limits as JSONB
          ${mccCode},
          ${settlementAccount},
          NOW(),
          NOW()
        )
        RETURNING id, merchant_id, gateway_name, mcc_code, settlement_account, created_at;
      `;
      const insertResult = await (this.db as any).execute(insertGatewayConfigQuery);

      // Record audit log for the configuration
      await (this.auditLogService as any).recordAuditLog(
        'MERCHANT_GATEWAY_CONFIGURED',
        userId,
        `${gatewayName} gateway configured for merchant ${merchantId}.`,
        { configId, merchantId, gatewayName, mccCode },
        tenantId,
      );

      this.logger.log(`${gatewayName} gateway configuration successfully saved for merchant ${merchantId}.`);
      return (insertResult as any).rows[0]; // Return the non-sensitive parts of the inserted configuration
    } catch (error) {
      // Check for PostgreSQL unique constraint violation error code (23505)
      if (error.code === '23505') {
        throw new ConflictException(`FluidPay gateway configuration already exists for merchant "${merchantId}".`);
      }
      this.logger.error(`Failed to store ${gatewayName} gateway config for merchant ${merchantId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to save ${gatewayName} gateway configuration due to a database error.`);
    }
  }

  /**
   * Retrieves a full application by ID for administrative review.
   */
  async getApplicationById(id: string): Promise<any> {
    const result = await (this.db as any).execute(sql`
      SELECT * FROM merchant_applications WHERE id = ${id} LIMIT 1
    `);
    const app = result?.rows?.[0] || result?.[0];
    if (!app) throw new NotFoundException('Merchant application not found');
    return app;
  }

  /**
   * Securely reveals a sensitive field (SSN, Bank Details) for an application.
   * This action is audit-logged to maintain compliance.
   */
  async revealSensitiveField(applicationId: string, field: string, actorId: string): Promise<string> {
    const app = await this.getApplicationById(applicationId);
    
    let encryptedValue: string | undefined;

    if (field.startsWith('owner-')) {
      // Format: owner-{index}-ssn
      const match = field.match(/^owner-(\d+)-ssn$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const owners = app.beneficial_owners || app.beneficialOwners || [];
        encryptedValue = owners[index]?.ssn;
      }
    } else {
      // Root fields
      const allowList = ['ssn', 'bank_routing_number', 'bank_account_number', 'federal_tax_id'];
      if (!allowList.includes(field)) {
        throw new BadRequestException(`Access to field ${field} is restricted.`);
      }
      encryptedValue = app[field];
    }
    
    if (!encryptedValue) throw new BadRequestException(`Field ${field} is empty or not found`);

    const decrypted = await (this.encryptionService as any).decrypt(encryptedValue);
    
    // Log the reveal event
    await (this.auditLogService as any).logActivity(
      'SYSTEM', // Global tenant for onboarding
      actorId,
      'MERCHANT_APPLICATION',
      `REVEAL_PII:${field}`,
      { applicationId, field }
    );

    return decrypted;
  }

  /**
   * Upserts a draft application directly into the database.
   * If applicationId exists, it updates it, otherwise it creates a new one.
   */
  async saveDraft(applicationId: string | null, payload: any): Promise<{ id: string }> {
    const id = applicationId || uuidv4();
    const isNewDraft = !applicationId;

    // 0. Total Equity Validation (Launch-Ready Requirement)
    const primaryEquity = Number(payload.pEquity || 0);
    const coOwnerEquity = (payload.additionalOwners || []).reduce((sum: number, o: any) => sum + Number(o.equity || 0), 0);
    const totalEquity = primaryEquity + coOwnerEquity;

    if (totalEquity > 100) {
      throw new BadRequestException(`Total equity ownership cannot exceed 100% (Attempted: ${totalEquity}%)`);
    }

    try {
      // 1. Encrypt Sensitive PII for co-owners
      const additionalOwners = payload.additionalOwners || [];
      const securedOwners = await Promise.all(additionalOwners.map(async (owner: any) => ({
        ...owner,
        ssn: owner.ssn ? await (this.encryptionService as any).encrypt(owner.ssn) : null,
      })));

      // 2. Encrypt Primary PII
      const securedSsn = payload.pSsn ? await (this.encryptionService as any).encrypt(payload.pSsn) : '';
      const securedFein = payload.bFein ? await (this.encryptionService as any).encrypt(payload.bFein) : '';
      const securedAccount = payload.bAccount ? await (this.encryptionService as any).encrypt(payload.bAccount) : '';
      const securedRouting = payload.bRouting ? await (this.encryptionService as any).encrypt(payload.bRouting) : '';

      // 3. Run Underwriting Assessment
      const { score, factors } = await this.runRiskAssessment(payload);

      if (!isNewDraft) {
        // Update existing mapping explicitly relying on real backend values
        await (this.db as any).execute(sql`
          UPDATE merchant_applications SET
            application_name = ${payload.appName ?? ''},
            sales_partner = ${payload.salesPartner ?? ''},
            template = ${payload.template ?? ''},
            principal_email = ${payload.initEmail ?? ''},
            principal_phone = ${payload.initPhone ?? ''},
            first_name = ${payload.pFirstName ?? ''},
            last_name = ${payload.pLastName ?? ''},
            title = ${payload.pTitle ?? ''},
            equity_ownership_percentage = ${payload.pEquity ? Number(payload.pEquity) : 0},
            ssn = ${securedSsn},
            dob = ${payload.pDob ?? ''},
            driver_license_number = ${payload.pDlNumber ?? ''},
            driver_license_state = ${payload.pDlState ?? ''},
            dba_name = ${payload.bBusinessName ?? ''},
            legal_business_name = ${payload.bLegalName ?? ''},
            federal_tax_id = ${securedFein},
            business_type = ${payload.bType ?? ''},
            sells_cbd_products = ${payload.bCbd || false},
            mcc_sic = ${payload.bMcc ?? ''},
            average_ticket_amount = ${payload.bAvgTicket ? Number(payload.bAvgTicket) : 0},
            average_monthly_volume = ${payload.bAvgMonthly ? Number(payload.bAvgMonthly) : 0},
            highest_ticket_amount = ${payload.bHighTicket ? Number(payload.bHighTicket) : 0},
            amex_monthly_volume = ${payload.bAmexMonthly ? Number(payload.bAmexMonthly) : 0},
            business_website_url = ${payload.bWebsite ?? ''},
            bank_routing_number = ${securedRouting},
            bank_account_number = ${securedAccount},
            beneficial_owners = ${JSON.stringify(securedOwners)}::jsonb,
            risk_score = ${score},
            risk_factors = ${JSON.stringify(factors)}::jsonb,
            updated_at = NOW()
          WHERE id = ${id}
        `);
      } else {
        // Insert new draft
        await (this.db as any).execute(sql`
          INSERT INTO merchant_applications (
            id,
            status,
            application_name,
            sales_partner,
            template,
            principal_email,
            principal_phone,
            created_at,
            updated_at
          ) VALUES (
            ${id},
            'Draft',
            ${payload.appName ?? ''},
            ${payload.salesPartner ?? ''},
            ${payload.template ?? ''},
            ${payload.initEmail ?? ''},
            ${payload.initPhone ?? ''},
            NOW(),
            NOW()
          )
        `);
      }
      
      if (isNewDraft && payload.initEmail) {
        await (this.mailerService as any).sendMagicLink(payload.initEmail, id);
      }
      return { id };
    } catch (error) {
      this.logger.error(`Failed to save draft application: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to securely store merchant application draft in the database.');
    }
  }

  /**
   * Upserts a marketing lead directly into the leads database mapping.
   */
  async saveLead(payload: any): Promise<{ id: string }> {
    const id = uuidv4();
    try {
      await (this.db as any).execute(sql`
        INSERT INTO leads (
          id, first_name, last_name, email, phone, company, monthly_volume, intent, notes, source, created_at
        ) VALUES (
          ${id},
          ${payload.firstName || null},
          ${payload.lastName || null},
          ${payload.email || null},
          ${payload.phone || null},
          ${payload.company || null},
          ${payload.monthlyVolume || null},
          ${payload.intent || null},
          ${payload.notes || null},
          ${payload.source || 'Unknown'},
          NOW()
        )
      `);
      return { id };
    } catch (error) {
      this.logger.error(`Failed to securely save lead: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to capture lead securely.');
    }
  }

  /**
   * Retrieves the Sovereign Merchant Registry for the Shareholder Dashboard.
   */
  async getSovereignRegistry(): Promise<any[]> {
    try {
      const result = await (this.db as any).execute(sql`
        SELECT id, application_name as "appName", status, created_at, updated_at
        FROM merchant_applications
        ORDER BY updated_at DESC
        LIMIT 20
      `);
      return (result as any).rows.map(row => {
        // Generate pseudo-signature based on ID to simulate stored ML-DSA signature for Demo
        const canonical = JSON.stringify({ tenantId: 'admin-portal-onboarding', timestamp: row.updated_at, id: row.id });
        const stubSig = 'mldsa-fips204-stub::admin-portal-onboarding::' + new Date(row.updated_at).getTime() + '::ML-DSA-65::' + Buffer.from(canonical.slice(0, 32)).toString('base64');
        return {
          id: row.id,
          merchantName: row.appName || 'Unknown Merchant',
          status: row.status === 'Draft' ? 'DRAFT_SECURED' : row.status,
          signature: stubSig,
          updatedAt: row.updated_at
        };
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve sovereign registry: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve sovereign registry.');
    }
  }

  /**
   * Internal risk assessment engine based on compliance rules.
   */
  private async runRiskAssessment(payload: any): Promise<{ score: number; factors: string[] }> {
    let score = 15; // Base score for a clean app
    const factors: string[] = [];

    // 1. High Volume Risk
    const volume = Number(payload.bAvgMonthly || 0);
    if (volume > 500000) {
      score += 40;
      factors.push('Monthly volume exceeds $500k (High Impact)');
    } else if (volume > 100000) {
      score += 20;
      factors.push('Large merchant volume ($100k-$500k)');
    }

    // 2. High Ticket Risk
    const ticket = Number(payload.bHighTicket || 0);
    if (ticket > 5000) {
      score += 15;
      factors.push('High individual ticket amount (>$5k)');
    }

    // 3. Business Type Risk (Restricted industries)
    const highRiskTerms = ['cbd', 'crypto', 'gambling', 'adult', 'pharmacy', 'debt'];
    const bizType = (payload.bType || '').toLowerCase();
    const dba = (payload.bBusinessName || '').toLowerCase();
    if (highRiskTerms.some(term => bizType.includes(term) || dba.includes(term))) {
      score += 35;
      factors.push('Business operates in a restricted or high-risk industry');
    }

    // 4. Multi-Owner Complexity
    if ((payload.additionalOwners || []).length > 2) {
      score += 10;
      factors.push('Complex ownership structure (>3 beneficial owners)');
    }

    // Caps
    return { score: Math.min(score, 99), factors };
  }
}



