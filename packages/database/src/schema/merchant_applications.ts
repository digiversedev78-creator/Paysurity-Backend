import { pgTable, varchar, timestamp, boolean, jsonb, text, integer } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

export const merchantApplications = pgTable('merchant_applications', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => uuidv4()),
  tenantId: varchar('tenant_id', { length: 255 }), 
  status: varchar('status', { length: 50 }).default('Draft').notNull(),
  
  // Create Application fields
  applicationName: varchar('application_name', { length: 255 }).default('').notNull(),
  salesPartner: varchar('sales_partner', { length: 255 }),
  template: varchar('template', { length: 255 }),
  
  // Principal Info
  principalVaultRef: varchar('principal_vault_ref', { length: 255 }).notNull(), // Vault-Reference Pointer
  title: varchar('title', { length: 100 }).default('').notNull(),
  equityOwnershipPercentage: integer('equity_ownership_percentage').default(0).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  principalAddress: text('principal_address').default('').notNull(),
  principalSuite: varchar('principal_suite', { length: 100 }),
  principalCity: varchar('principal_city', { length: 100 }).default('').notNull(),
  principalState: varchar('principal_state', { length: 50 }).default('').notNull(),
  principalZipCode: varchar('principal_zip_code', { length: 20 }).default('').notNull(),
  beneficialOwners: jsonb('beneficial_owners').default([]),
  
  // Business Info
  dbaName: varchar('dba_name', { length: 255 }).default('').notNull(),
  legalBusinessName: varchar('legal_business_name', { length: 255 }).default('').notNull(),
  federalTaxId: varchar('federal_tax_id', { length: 255 }).default('').notNull(),
  businessType: varchar('business_type', { length: 100 }).default('').notNull(),
  sellsCbdProducts: boolean('sells_cbd_products').default(false),
  mccSic: varchar('mcc_sic', { length: 100 }),
  merchandiseSold: text('merchandise_sold').default('').notNull(),
  averageTicketAmount: integer('average_ticket_amount').default(0).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  averageMonthlyVolume: integer('average_monthly_volume').default(0).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  highestTicketAmount: integer('highest_ticket_amount').default(0).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  amexMonthlyVolume: integer('amex_monthly_volume').default(0).notNull(), // @ARCHITECTURAL_INVARIANT: ISO 4217 minor_units precision (Integer Mapping). expected currency_code: USD
  ebtProcessingCash: boolean('ebt_processing_cash').default(false),
  ebtProcessingFood: boolean('ebt_processing_food').default(false),
  
  // Business Websites / Contact
  businessWebsiteUrl: varchar('business_website_url', { length: 500 }),
  businessAddress: text('business_address').default('').notNull(),
  businessSuite: varchar('business_suite', { length: 100 }),
  businessCity: varchar('business_city', { length: 100 }).default('').notNull(),
  businessState: varchar('business_state', { length: 50 }).default('').notNull(),
  businessZip: varchar('business_zip', { length: 20 }).default('').notNull(),
  businessFax: varchar('business_fax', { length: 50 }),
  statementType: varchar('statement_type', { length: 50 }),
  yearsInBusiness: integer('years_in_business').default(0).notNull(),
  monthsInBusiness: integer('months_in_business'),
  
  // Banking Information
  bankRoutingNumber: varchar('bank_routing_number', { length: 255 }).default('').notNull(),
  bankAccountNumber: varchar('bank_account_number', { length: 255 }).default('').notNull(),
  
  // Attachments / Documentation URLs
  ownerSelfieUrl: varchar('owner_selfie_url', { length: 500 }),
  bankStatementUrl1: varchar('bank_statement_url_1', { length: 500 }),
  bankStatementUrl2: varchar('bank_statement_url_2', { length: 500 }),
  bankStatementUrl3: varchar('bank_statement_url_3', { length: 500 }),
  articlesOfIncorporationUrl: varchar('articles_of_incorporation_url', { length: 500 }),
  feinDocumentUrl: varchar('fein_document_url', { length: 500 }),
  municipalityLicensureUrl: varchar('municipality_licensure_url', { length: 500 }),
  
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewNotes: text('review_notes'),
  riskScore: integer('risk_score').default(0),
  riskFactors: jsonb('risk_factors').default([]),
  
  // --- New Vertical 01 Fields ---
  applicationNumber: varchar('application_number', { length: 20 }).unique(),
  ownerFirstNameHash: varchar('owner_first_name_hash', { length: 255 }),
  ownerLastNameHash: varchar('owner_last_name_hash', { length: 255 }),
  ownerEmailHash: varchar('owner_email_hash', { length: 255 }),
  ownerPhoneHash: varchar('owner_phone_hash', { length: 255 }),
  vertical: varchar('vertical', { length: 30 }),
  ein: varchar('ein', { length: 10 }),
  einSecretRef: varchar('ein_secret_ref', { length: 255 }),
  selectedPlanCode: varchar('selected_plan_code', { length: 20 }),
  billingCycle: varchar('billing_cycle', { length: 10 }).default('MONTHLY'),
  referralCode: varchar('referral_code', { length: 50 }),
  affiliateId: varchar('affiliate_id', { length: 255 }),
  assignedCsmUserId: varchar('assigned_csm_user_id', { length: 255 }),
  rejectionReason: text('rejection_reason'),
  rejectionCategory: varchar('rejection_category', { length: 50 }),
  
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  kybStartedAt: timestamp('kyb_started_at', { withTimezone: true }),
  kybCompletedAt: timestamp('kyb_completed_at', { withTimezone: true }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectedAt: timestamp('rejected_at', { withTimezone: true }),
  activatedAt: timestamp('activated_at', { withTimezone: true }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

