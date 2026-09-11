-- Merchant applications: pre-tenant record during onboarding funnel
ALTER TABLE merchant_applications
  ADD COLUMN IF NOT EXISTS application_number VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS owner_first_name_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS owner_last_name_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS owner_email_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS owner_phone_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS vertical VARCHAR(30) CHECK (vertical IN ('RESTAURANT','GROCERY','RETAIL','ECOMMERCE','SALON','OTHER')),
  ADD COLUMN IF NOT EXISTS ein VARCHAR(10),
  ADD COLUMN IF NOT EXISTS ein_secret_ref VARCHAR(255),
  ADD COLUMN IF NOT EXISTS selected_plan_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS affiliate_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS assigned_csm_user_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS rejection_category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyb_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyb_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- KYB verifications: business identity checks via Stripe Identity (or manual)
CREATE TABLE IF NOT EXISTS kyb_verifications (
  id                    VARCHAR(255) PRIMARY KEY,
  application_id        VARCHAR(255) NOT NULL REFERENCES merchant_applications(id),
  check_type            VARCHAR(30) NOT NULL
                        CHECK (check_type IN (
                          'BUSINESS_REGISTRATION',   
                          'BENEFICIAL_OWNER_ID',      
                          'SANCTIONS_SCREENING',      
                          'ADVERSE_MEDIA',            
                          'BANK_ACCOUNT_VERIFY',      
                          'EIN_VERIFY'               
                        )),
  provider              VARCHAR(30) NOT NULL DEFAULT 'STRIPE_IDENTITY'
                        CHECK (provider IN ('STRIPE_IDENTITY','MANUAL','MIDDESK','PERSONA')),
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','IN_PROGRESS','PASSED','FAILED','SKIPPED','REVIEW')),
  provider_session_id   VARCHAR(255),
  provider_report_ref   VARCHAR(255),               
  risk_score            INTEGER,                    
  failure_reason        TEXT,
  reviewed_by           VARCHAR(255),  
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kyb_application ON kyb_verifications(application_id, check_type);

-- Underwriting reviews: PaySurity risk assessment
CREATE TABLE IF NOT EXISTS underwriting_reviews (
  id                    VARCHAR(255) PRIMARY KEY,
  application_id        VARCHAR(255) NOT NULL REFERENCES merchant_applications(id) UNIQUE,
  reviewer_user_id      VARCHAR(255),
  risk_category         VARCHAR(20)
                        CHECK (risk_category IN ('LOW','MEDIUM','HIGH','PROHIBITED')),
  mcc_code              VARCHAR(4),                 
  processing_volume_estimate_cents INTEGER,         
  avg_ticket_estimate_cents INTEGER,
  card_present_pct      INTEGER,                    
  chargeback_reserve_pct INTEGER DEFAULT 0,         
  payout_delay_days     INTEGER DEFAULT 2,          
  approved_plan_code    VARCHAR(20),                
  conditions            JSONB,                      
  notes                 TEXT,
  decision              VARCHAR(20)
                        CHECK (decision IN ('APPROVED','REJECTED','DEFERRED','ADDITIONAL_INFO')),
  decided_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Onboarding workspace: tracks 5-phase progress post-approval
CREATE TABLE IF NOT EXISTS onboarding_workspaces (
  id                    VARCHAR(255) PRIMARY KEY,
  tenant_id             VARCHAR(255) NOT NULL REFERENCES tenants(id) UNIQUE,
  application_id        VARCHAR(255) NOT NULL REFERENCES merchant_applications(id),
  assigned_csm          VARCHAR(255),
  current_phase         INTEGER NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 5),
  phase1_complete       BOOLEAN NOT NULL DEFAULT FALSE,  
  phase2_complete       BOOLEAN NOT NULL DEFAULT FALSE,  
  phase3_complete       BOOLEAN NOT NULL DEFAULT FALSE,  
  phase4_complete       BOOLEAN NOT NULL DEFAULT FALSE,  
  phase5_complete       BOOLEAN NOT NULL DEFAULT FALSE,  
  go_live_date          TIMESTAMPTZ,
  hyper_care_ends_at    TIMESTAMPTZ,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE onboarding_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON onboarding_workspaces USING (tenant_id = current_setting('app.current_tenant_id'));
