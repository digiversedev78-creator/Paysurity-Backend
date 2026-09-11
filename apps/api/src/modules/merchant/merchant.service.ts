import { Injectable, Inject, Logger, NotFoundException, Optional } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

// Schema imports -- works when @paysurity/database is installed,
// falls back to dynamic require for dev
let merchantsTable: any;
let locationsTable: any;
try {
  const schema = require('@paysurity/database');
  merchantsTable = schema.merchants;
  locationsTable = schema.locations;
} catch {
  // Schema not available -- will use in-memory fallback
}

/**
 * MerchantService -- Worker B [MER-HIERARCHY]
 *
 * Manages the runtime merchants table that sits between tenants and locations.
 * Identity hierarchy: Organization (Tenant) Ã¢â€ â€™ Merchant Ã¢â€ â€™ Location
 *
 * NOW WIRED TO DATABASE (Drizzle ORM Ã¢â€ â€™ PostgreSQL)
 */

export interface MerchantDto {
  tenantId: string;
  legalName: string;
  dbaName?: string | undefined;
  mcc?: string | undefined;
  vertical: 'RESTAURANT' | 'GROCERY' | 'RETAIL' | 'ECOMMERCE' | 'SALON' | 'OTHER';
  primaryEmail: string;
  primaryPhone?: string | undefined;
  // ISO 20022 PostalAddress24 -- these are now for the *initial/primary location*
  streetName?: string | undefined;
  buildingNumber?: string | undefined;
  buildingName?: string | undefined;
  postCode?: string | undefined;
  townName?: string | undefined;
  countrySubDivision?: string | undefined;
  countryCode?: string | undefined;
}

export interface BrandingConfigDto {
  logoUrl?: string;
  primaryColor?: string; // Hex color code, e.g., "#FF0000"
}

export interface BusinessHoursDto {
  monday?: string; // e.g., "09:00-17:00" or "CLOSED"
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface LocationSetupDto {
  timezone?: string; // e.g., "America/Los_Angeles"
  businessHours?: BusinessHoursDto;
}

export interface StaffInvitationDto {
  emails: string[];
}

// Extends MerchantDto with initial onboarding details
export interface CreateMerchantOnboardingDto extends MerchantDto {
  brandingConfig?: BrandingConfigDto;
  locationSetup?: LocationSetupDto;
  staffInvitations?: StaffInvitationDto;
}

export interface MerchantRecord extends MerchantDto {
  id: string;
  status: string;
  gatewayMerchantId: string | null;
  createdAt: string;
  logoUrl?: string; // Added for branding config
  primaryColor?: string; // Added for branding config
  onboardingProgress: number; // Added for checklist tracking (0-100)
  staffInvited: boolean; // Added to track if staff invitations have been sent

  // Primary Location specific details (from locationsTable, but aggregated here for convenience)
  primaryLocationId?: string;
  primaryLocationName?: string;
  primaryLocationTimezone?: string;
  primaryLocationBusinessHours?: BusinessHoursDto; // Parsed from JSON
}

// A helper type for updates, making all fields optional
export type UpdateMerchantOnboardingDto = Partial<Omit<CreateMerchantOnboardingDto, 'tenantId' | 'legalName' | 'vertical' | 'primaryEmail'>> & {
  merchantId: string;
};


@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

  constructor(
    @Optional() @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * Calculates the onboarding progress percentage based on the current state of a merchant record.
   * This assumes the MerchantRecord has been enriched with primary location details.
   */
  private _calculateOnboardingProgress(merchant: MerchantRecord): number {
    let completedSteps = 0;
    const totalSteps = 5; // Branding, Location Address, Timezone, Business Hours, Staff Invited

    // Step 1: Branding Config (Logo URL, Primary Color)
    if (merchant.logoUrl && merchant.primaryColor) {
      completedSteps++;
    }

    // Step 2: Location Address (streetName, townName, postCode)
    if (merchant.streetName && merchant.townName && merchant.postCode) {
      completedSteps++;
    }

    // Step 3: Location Timezone (and not default 'UTC')
    if (merchant.primaryLocationTimezone && merchant.primaryLocationTimezone !== 'UTC') {
      completedSteps++;
    }

    // Step 4: Business Hours (at least one day specified)
    if (merchant.primaryLocationBusinessHours && Object.keys(merchant.primaryLocationBusinessHours).length > 0) {
      completedSteps++;
    }

    // Step 5: Staff Invitation (at least one invitation sent)
    if (merchant.staffInvited) {
      completedSteps++;
    }

    return Math.min(Math.round((completedSteps / totalSteps) * 100), 100);
  }


  /**
   * Create a new merchant under a tenant, including initial onboarding configuration.
   * This now includes branding, primary location setup, and staff invitations.
   */
  async createMerchant(dto: CreateMerchantOnboardingDto): Promise<MerchantRecord> {
    const merchantId = randomUUID();
    const locationId = randomUUID(); // For the primary location

    this.logger.log(
      `[MER] Creating merchant | tenant=${dto.tenantId} ` +
      `legal="${dto.legalName}" vertical=${dto.vertical}`,
    );

    const staffInvitedInitially = (dto.staffInvitations?.emails?.length ?? 0) > 0;

    // A stub for initial progress calculation
    const initialMerchantRecordStub: MerchantRecord = {
      ...dto,
      id: merchantId,
      status: 'pending',
      gatewayMerchantId: null,
      createdAt: new Date().toISOString(),
      logoUrl: dto.brandingConfig?.logoUrl,
      primaryColor: dto.brandingConfig?.primaryColor,
      onboardingProgress: 0, // Placeholder, will be calculated below
      staffInvited: staffInvitedInitially,
      primaryLocationId: locationId,
      primaryLocationName: `${dto.legalName} - Main Location`,
      primaryLocationTimezone: dto.locationSetup?.timezone ?? 'UTC',
      primaryLocationBusinessHours: dto.locationSetup?.businessHours,
    };
    const initialProgress = this._calculateOnboardingProgress(initialMerchantRecordStub);


    // Ã¢â€â‚¬Ã¢â€â‚¬ DB INSERT Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    if (this.db && merchantsTable && locationsTable) {
      try {
        await (this.db as any).insert(merchantsTable).values({
          id: merchantId,
          tenantId: dto.tenantId,
          legalName: dto.legalName,
          dbaName: dto.dbaName,
          mcc: dto.mcc ?? '5999',
          status: 'pending',
          email: dto.primaryEmail,
          phone: dto.primaryPhone,
          logoUrl: dto.brandingConfig?.logoUrl,
          primaryColor: dto.brandingConfig?.primaryColor,
          onboardingProgress: initialProgress,
          staffInvited: staffInvitedInitially,
        });

        // Create the primary location
        await (this.db as any).insert(locationsTable).values({
          id: locationId,
          tenantId: dto.tenantId,
          merchantId: merchantId,
          name: `${dto.legalName} - Main Location`,
          isPrimary: true,
          addressStreet: dto.streetName,
          addressBuildingNumber: dto.buildingNumber,
          addressBuildingName: dto.buildingName,
          addressPostcode: dto.postCode,
          addressCity: dto.townName,
          addressState: dto.countrySubDivision,
          addressCountry: dto.countryCode ?? 'US',
          phone: dto.primaryPhone,
          email: dto.primaryEmail,
          timezone: dto.locationSetup?.timezone ?? 'UTC',
          businessHours: dto.locationSetup?.businessHours ? JSON.stringify(dto.locationSetup.businessHours) : null,
        });

        this.logger.log(`[MER] Merchant ${merchantId} and primary location ${locationId} persisted to DB.`);

        // Handle staff invitations (simulate sending emails)
        if (staffInvitedInitially) {
          dto.staffInvitations.emails.forEach(email => {
            this.logger.log(`[MER] Simulating invitation email sent to ${email} for merchant ${merchantId}`);
          });
        }

      } catch (err: any) {
        this.logger.error(`[MER] DB insert failed for merchant or location: ${err.message}`, err.stack);
        throw new Error(`Failed to create merchant or primary location: ${err.message}`);
      }
    } else {
      this.logger.warn(`[MER] DB schema or connection not available, createMerchant failed.`);
      throw new Error('Database connection or schema not available.');
    }

    // Return the final, calculated record by fetching it to ensure consistency
    const finalMerchantRecord = await this.getMerchantById(merchantId, dto.tenantId);
    if (!finalMerchantRecord) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found after creation.`);
    }
    return finalMerchantRecord;
  }

  /**
   * Retrieves a merchant by ID, including its primary location details.
   */
  async getMerchantById(merchantId: string, tenantId: string): Promise<MerchantRecord | undefined> {
    if (!this.db || !merchantsTable) {
      this.logger.warn(`[MER] DB schema or connection not available, getMerchantById will not function.`);
      return undefined;
    }

    try {
      const merchantResult = await this.db
        .select()
        .from(merchantsTable)
        .where(and(eq(merchantsTable.id, merchantId), eq(merchantsTable.tenantId, tenantId)))
        .limit(1);

      if (merchantResult.length === 0) {
        return undefined; // Merchant not found
      }

      const merchant = merchantResult[0];

      let primaryLocation: any = {};
      if (locationsTable) {
        const locationResult = await this.db
          .select()
          .from(locationsTable)
          .where(and(eq(locationsTable.merchantId, merchantId), eq(locationsTable.isPrimary, true)))
          .limit(1);
        primaryLocation = locationResult.length > 0 ? locationResult[0] : null;
      }

      const merchantRecord: MerchantRecord = {
        id: merchant.id,
        tenantId: merchant.tenantId,
        legalName: merchant.legalName,
        dbaName: merchant.dbaName,
        mcc: merchant.mcc,
        vertical: merchant.vertical,
        primaryEmail: merchant.email,
        primaryPhone: merchant.phone,
        // Address fields derived from primary location
        streetName: primaryLocation?.addressStreet,
        buildingNumber: primaryLocation?.addressBuildingNumber,
        buildingName: primaryLocation?.addressBuildingName,
        postCode: primaryLocation?.addressPostcode,
        townName: primaryLocation?.addressCity,
        countrySubDivision: primaryLocation?.addressState,
        countryCode: primaryLocation?.addressCountry,
        status: merchant.status,
        gatewayMerchantId: merchant.gatewayMerchantId,
        createdAt: merchant.createdAt.toISOString(),
        logoUrl: merchant.logoUrl,
        primaryColor: merchant.primaryColor,
        onboardingProgress: merchant.onboardingProgress,
        staffInvited: merchant.staffInvited ?? false, // Default to false if not set in DB
        primaryLocationId: primaryLocation?.id,
        primaryLocationName: primaryLocation?.name,
        primaryLocationTimezone: primaryLocation?.timezone,
        primaryLocationBusinessHours: primaryLocation?.businessHours ? JSON.parse(primaryLocation.businessHours) : undefined,
      };

      return merchantRecord;

    } catch (err: any) {
      this.logger.error(`[MER] Failed to retrieve merchant ${merchantId}: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Updates merchant onboarding configuration (branding, primary location, staff invites).
   * This method can be called incrementally to complete the onboarding checklist.
   */
  async updateMerchantOnboarding(
    merchantId: string,
    tenantId: string,
    dto: UpdateMerchantOnboardingDto,
  ): Promise<MerchantRecord> {
    this.logger.log(`[MER] Updating onboarding config for merchant ${merchantId} | tenant=${tenantId}`);

    if (!this.db || !merchantsTable || !locationsTable) {
      this.logger.warn(`[MER] DB schema or connection not available, updateMerchantOnboarding will not function.`);
      throw new Error('Database connection or schema not available.');
    }

    // First, fetch the existing merchant and its primary location details
    const existingMerchant = await this.getMerchantById(merchantId, tenantId);
    if (!existingMerchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found for tenant ${tenantId}`);
    }

    const merchantUpdateData: any = {};
    const locationUpdateData: any = {};

    // 1. Branding Config
    if (dto.brandingConfig) {
      if (dto.brandingConfig.logoUrl !== undefined) merchantUpdateData.logoUrl = dto.brandingConfig.logoUrl;
      if (dto.brandingConfig.primaryColor !== undefined) merchantUpdateData.primaryColor = dto.brandingConfig.primaryColor;
    }

    // Update merchant-level primary contact info if provided
    if ((dto as any).primaryPhone !== undefined) merchantUpdateData.phone = (dto as any).primaryPhone;
    if ((dto as any).primaryEmail !== undefined) merchantUpdateData.email = (dto as any).primaryEmail;

    // 2. Location Setup (primary location)
    // Address fields, if provided, will update the primary location
    if (dto.streetName !== undefined) locationUpdateData.addressStreet = dto.streetName;
    if (dto.buildingNumber !== undefined) locationUpdateData.addressBuildingNumber = dto.buildingNumber;
    if (dto.buildingName !== undefined) locationUpdateData.addressBuildingName = dto.buildingName;
    if (dto.postCode !== undefined) locationUpdateData.addressPostcode = dto.postCode;
    if (dto.townName !== undefined) locationUpdateData.addressCity = dto.townName;
    if (dto.countrySubDivision !== undefined) locationUpdateData.addressState = dto.countrySubDivision;
    if (dto.countryCode !== undefined) locationUpdateData.addressCountry = dto.countryCode;
    // Location-specific phone/email (can be same as merchant's primary, or different)
    if ((dto as any).primaryPhone !== undefined) locationUpdateData.phone = (dto as any).primaryPhone;
    if ((dto as any).primaryEmail !== undefined) locationUpdateData.email = (dto as any).primaryEmail;

    if (dto.locationSetup) {
      if (dto.locationSetup.timezone !== undefined) locationUpdateData.timezone = dto.locationSetup.timezone;
      if (dto.locationSetup.businessHours !== undefined) {
        locationUpdateData.businessHours = JSON.stringify(dto.locationSetup.businessHours);
      }
    }
    
    // 3. Staff Invitations
    let newStaffInvitedStatus = existingMerchant.staffInvited;
    if (dto.staffInvitations?.emails && dto.staffInvitations.emails.length > 0) {
      dto.staffInvitations.emails.forEach(email => {
        this.logger.log(`[MER] Simulating invitation email sent to ${email} for merchant ${merchantId}`);
      });
      newStaffInvitedStatus = true; // Mark as true if invitations are sent
    }
    // Only update `staffInvited` status if it changes from false to true
    if (newStaffInvitedStatus && !existingMerchant.staffInvited) {
      merchantUpdateData.staffInvited = newStaffInvitedStatus;
    }

    try {
      // Perform merchant updates
      if (Object.keys(merchantUpdateData).length > 0) {
        await (this.db as any).update(merchantsTable)
          .set(merchantUpdateData)
          .where(and(eq(merchantsTable.id, merchantId), eq(merchantsTable.tenantId, tenantId)));
        this.logger.log(`[MER] Merchant ${merchantId} main record updated in DB.`);
      }

      // Perform primary location updates
      if (Object.keys(locationUpdateData).length > 0) {
        if (existingMerchant.primaryLocationId) {
          await (this.db as any).update(locationsTable)
            .set(locationUpdateData)
            .where(eq(locationsTable.id, existingMerchant.primaryLocationId));
          this.logger.log(`[MER] Primary location ${existingMerchant.primaryLocationId} for merchant ${merchantId} updated in DB.`);
        } else {
          // This case creates a primary location if one doesn't exist (e.g., for merchants created before this feature).
          this.logger.warn(`[MER] No primary location found for merchant ${merchantId}, creating one during update.`);
          const newLocationId = randomUUID();
          await (this.db as any).insert(locationsTable).values({
            id: newLocationId,
            tenantId: tenantId,
            merchantId: merchantId,
            name: `${existingMerchant.legalName} - Main Location`,
            isPrimary: true,
            addressStreet: locationUpdateData.addressStreet ?? existingMerchant.streetName,
            addressBuildingNumber: locationUpdateData.addressBuildingNumber ?? existingMerchant.buildingNumber,
            addressBuildingName: locationUpdateData.addressBuildingName ?? existingMerchant.buildingName,
            addressPostcode: locationUpdateData.addressPostcode ?? existingMerchant.postCode,
            addressCity: locationUpdateData.addressCity ?? existingMerchant.townName,
            addressState: locationUpdateData.addressState ?? existingMerchant.countrySubDivision,
            addressCountry: locationUpdateData.countryCode ?? existingMerchant.countryCode,
            phone: locationUpdateData.phone ?? existingMerchant.primaryPhone,
            email: locationUpdateData.email ?? existingMerchant.primaryEmail,
            timezone: locationUpdateData.timezone ?? 'UTC',
            businessHours: locationUpdateData.businessHours ?? null,
          });
        }
      }

      // Re-fetch the merchant record after all updates to get the latest state for progress calculation
      const currentMerchantState = await this.getMerchantById(merchantId, tenantId);
      if (!currentMerchantState) {
        throw new NotFoundException(`Merchant with ID ${merchantId} not found after updates for tenant ${tenantId}`);
      }

      const newProgress = this._calculateOnboardingProgress(currentMerchantState);

      // Update the onboarding progress in the database if it changed
      if (newProgress !== currentMerchantState.onboardingProgress) {
        await (this.db as any).update(merchantsTable)
          .set({ onboardingProgress: newProgress })
          .where(and(eq(merchantsTable.id, merchantId), eq(merchantsTable.tenantId, tenantId)));
        this.logger.log(`[MER] Merchant ${merchantId} onboarding progress updated to ${newProgress}%.`);
        
        // Re-fetch one last time to reflect the final progress in the returned object
        const finalMerchantRecord = await this.getMerchantById(merchantId, tenantId);
        if (!finalMerchantRecord) {
          throw new NotFoundException(`Merchant with ID ${merchantId} not found after final progress update for tenant ${tenantId}`);
        }
        return finalMerchantRecord;
      }
      
      return currentMerchantState; // No progress change, return the already fetched state

    } catch (err: any) {
      this.logger.error(`[MER] Failed to update onboarding for merchant ${merchantId}: ${err.message}`, err.stack);
      throw err;
    }
  }

  /**
   * Scaffolding for KYB Identity Verification (Know Your Business)
   */
  async verifyKYB(merchantId: string, tenantId: string, payload: any) {
    this.logger.log(`[MER] Init KYB checks for merchant ${merchantId} | tenant=${tenantId}`);
    
    // In production, this would call Persona or Stripe Identity
    // Here we scaffold the return shape for frontend consumption
    return {
      success: true,
      status: 'PENDING_DOCUMENT_REVIEW',
      verificationId: randomUUID(),
      message: 'Initial identity and EIN checks submitted. Please upload requested documentation.',
    };
  }

  /**
   * Scaffolding for KYB Document uploads
   */
  async uploadKYBDocument(merchantId: string, tenantId: string, payload: any) {
    this.logger.log(`[MER] KYB Doc Upload received for merchant ${merchantId} | tenant=${tenantId}`);
    
    // Scaffolding file handling logic
    return {
      success: true,
      status: 'UPLOADED',
      documentId: randomUUID(),
      message: 'Document successfully received and queued for compliance review.',
    };
  }
}


