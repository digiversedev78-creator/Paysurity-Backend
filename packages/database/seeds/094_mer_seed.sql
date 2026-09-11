INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('mer.kyb.required_checks',          '["BUSINESS_REGISTRATION","BENEFICIAL_OWNER_ID","SANCTIONS_SCREENING","EIN_VERIFY"]', 'json', 'KYB check types run for every application', FALSE),
  ('mer.kyb.high_risk_checks',         '["ADVERSE_MEDIA","BANK_ACCOUNT_VERIFY"]', 'json', 'Additional checks for HIGH risk category', FALSE),
  ('mer.kyb.provider',                 'STRIPE_IDENTITY', 'string', 'KYB provider (Stripe Identity primary)', FALSE),
  ('mer.kyb.stripe_base_url',          'https://api.stripe.com/v1', 'string', 'Stripe API base URL for identity', FALSE),
  ('mer.underwriting.auto_approve_threshold', '50', 'integer', 'Risk score 0-50: auto-approve; 51-75: manual review; 76+: reject', FALSE),
  ('mer.underwriting.auto_reject_threshold','76', 'integer', 'Risk score >= this → auto-reject', FALSE),
  ('mer.onboarding.hyper_care_days',   '30',    'integer', 'Days of post-go-live CSM hyper-care support', FALSE),
  ('mer.fluidpay.underwriting_path',   '/api/v1/merchant/register', 'string', 'FluidPay endpoint to register approved merchant', FALSE),
  ('mer.application.expiry_days',      '30',    'integer', 'Days before incomplete application expires', FALSE)
ON CONFLICT (key) DO NOTHING;
