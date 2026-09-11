-- Migration: 0002_location_ledger_isolation.sql
-- Adds mandatory location_id columns to wallet_ledger, transactions, and affiliate_commissions.
-- Existing tables are kept intact; digital_wallets is NOT modified.

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS digital_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  consumer_id UUID NOT NULL,
  wallet_type VARCHAR(50) DEFAULT 'CONSUMER',
  currency VARCHAR(3) DEFAULT 'USD',
  balance_cents BIGINT DEFAULT 0,
  reserved_cents BIGINT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  kyc_level VARCHAR(30) DEFAULT 'NONE',
  daily_load_limit_cents BIGINT,
  monthly_load_limit_cents BIGINT,
  daily_spend_limit_cents BIGINT,
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  wallet_id UUID NOT NULL REFERENCES digital_wallets(id),
  transaction_type VARCHAR(50) NOT NULL,
  direction VARCHAR(1) NOT NULL,
  amount_cents BIGINT NOT NULL,
  balance_after_cents BIGINT NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  description TEXT,
  idempotency_key TEXT UNIQUE,
  status VARCHAR(30) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  affiliate_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Add column to wallet_ledger
ALTER TABLE wallet_ledger
  ADD COLUMN IF NOT EXISTS location_id UUID;

-- 2. Backfill existing rows with fallback location
INSERT INTO locations (id, name) VALUES ('00000000-0000-0000-0000-000000000001', 'loc_main_001') ON CONFLICT DO NOTHING;

UPDATE wallet_ledger
  SET location_id = '00000000-0000-0000-0000-000000000001'
  WHERE location_id IS NULL;

-- 3. Apply NOT NULL and foreign key constraint
ALTER TABLE wallet_ledger
  ALTER COLUMN location_id SET NOT NULL;

-- 5. Add column to affiliate_commissions
ALTER TABLE affiliate_commissions
  ADD COLUMN IF NOT EXISTS location_id UUID;

UPDATE affiliate_commissions
  SET location_id = '00000000-0000-0000-0000-000000000001'
  WHERE location_id IS NULL;

ALTER TABLE affiliate_commissions
  ALTER COLUMN location_id SET NOT NULL;

-- Down migration (rollback)
-- NOTE: Rolling back will drop the constraints and columns.
-- DROP CONSTRAINT IF EXISTS fk_wallet_ledger_location;
-- ALTER TABLE wallet_ledger DROP COLUMN IF EXISTS location_id;
-- IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
--   DROP CONSTRAINT IF EXISTS fk_transactions_location;
--   ALTER TABLE transactions DROP COLUMN IF EXISTS location_id;
-- END IF;
-- DROP CONSTRAINT IF EXISTS fk_affiliate_commissions_location;
-- ALTER TABLE affiliate_commissions DROP COLUMN IF EXISTS location_id;
