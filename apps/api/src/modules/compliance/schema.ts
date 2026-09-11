import { pgTable, uuid, timestamp, varchar, text, pgEnum, jsonb, boolean } from 'drizzle-orm/pg-core';
// If core tables like 'users' or 'merchants' existed in @paysurity/database, they would be imported here for relations.
// Example: import { users, merchants } from '@paysurity/database';

// Define enums specific to the Compliance module
export const kycApplicationStatusEnum = pgEnum('kyc_application_status', ['pending', 'approved', 'rejected', 'under_review', 'on_hold']);
export const sanctionScreeningStatusEnum = pgEnum('sanction_screening_status', ['pending', 'passed', 'failed', 'review_required']);
export const complianceDocumentTypeEnum = pgEnum('compliance_document_type', ['proof_of_id', 'proof_of_address', 'business_registration', 'source_of_funds', 'other']);
export const amlReportStatusEnum = pgEnum('aml_report_status', ['draft', 'submitted', 'reviewed', 'closed']);

// Define Compliance KYC Applications table
export const complianceKycApplications = pgTable('compliance_kyc_applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(), // Foreign key to users.id, but not defining relation here without 'users' schema
  status: kycApplicationStatusEnum('status').notNull().default('pending'),
  applicationData: jsonb('application_data'), // Stores details of the KYC application, e.g., personal info, documents submitted
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewerId: uuid('reviewer_id'), // ID of the admin/user who reviewed it
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Define Compliance Sanction Screenings table
export const complianceSanctionScreenings = pgTable('compliance_sanction_screenings', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityId: uuid('entity_id').notNull(), // Can be userId or merchantId
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'user' or 'merchant'
  status: sanctionScreeningStatusEnum('status').notNull().default('pending'),
  screeningProvider: varchar('screening_provider', { length: 100 }), // e.g., 'World-Check', 'ComplyAdvantage'
  screeningResult: jsonb('screening_result'), // Raw result from the screening provider
  screenedAt: timestamp('screened_at', { withTimezone: true }).defaultNow().notNull(),
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }).defaultNow().notNull(),
  nextCheckAt: timestamp('next_check_at', { withTimezone: true }), // For periodic re-screening
  flags: jsonb('flags'), // Any specific flags or alerts from the screening
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Define Compliance Documents table (for storing uploaded documents associated with KYC/AML)
export const complianceDocuments = pgTable('compliance_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityId: uuid('entity_id').notNull(), // userId or merchantId
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'user' or 'merchant'
  documentType: complianceDocumentTypeEnum('document_type').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 2048 }).notNull(), // URL to S3 bucket or similar storage
  mimeType: varchar('mime_type', { length: 100 }),
  isVerified: boolean('is_verified').default(false).notNull(),
  verifiedBy: uuid('verified_by'), // Admin/reviewer ID
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // For documents with expiry dates (e.g., ID)
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Define AML Reports table (e.g., Suspicious Activity Reports - SARs)
export const complianceAmlReports = pgTable('compliance_aml_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id').notNull(), // ID of the user/admin creating the report
  involvedEntityId: uuid('involved_entity_id'), // User or Merchant ID involved in the suspicious activity
  involvedEntityType: varchar('involved_entity_type', { length: 50 }), // 'user' or 'merchant'
  reportType: varchar('report_type', { length: 100 }), // e.g., 'SAR', 'STR'
  status: amlReportStatusEnum('status').notNull().default('draft'),
  reportDetails: jsonb('report_details'), // Detailed JSON payload of the report
  submittedToRegulatorAt: timestamp('submitted_to_regulator_at', { withTimezone: true }),
  regulatorReferenceId: varchar('regulator_reference_id', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
