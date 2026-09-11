-- Per-tenant price configuration: tenant_id (PK), paysurity_margin_pct, processing_fee_pct, updated_by, updated_at.
-- Super admin can override per tenant via admin dashboard.

CREATE TABLE IF NOT EXISTS price_engine_config (
    tenant_id UUID PRIMARY KEY,
    paysurity_margin_pct NUMERIC(5,4) NOT NULL DEFAULT 0.20,
    processing_fee_pct NUMERIC(5,4) NOT NULL DEFAULT 0.05,
    updated_by UUID NOT NULL, -- Assuming this is a foreign key to a 'users' table or similar for the user who last updated
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for the updated_by column, as it's likely a foreign key and will be used in queries.
CREATE INDEX IF NOT EXISTS idx_price_engine_config_updated_by ON price_engine_config (updated_by);

-- No initial data inserts requested, thus no ON CONFLICT DO NOTHING for INSERT.
-- CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS ensure idempotency for DDL.