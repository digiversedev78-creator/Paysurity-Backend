CREATE TABLE loyalty_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Core Loyalty Program Settings
    points_per_dollar DECIMAL(10, 4) NOT NULL, -- How many loyalty points are earned per dollar spent (e.g., 1.0 for 1 point per $1)
    redemption_points_per_dollar DECIMAL(10, 4) NOT NULL, -- How many points are required to redeem $1 (e.g., 100.0 if 100 points = $1)
    expiry_policy_months INTEGER, -- Number of months until points expire, NULL if points do not expire

    -- Loyalty Tiers Configuration
    -- JSONB array of objects like: [{"name": "Bronze", "threshold_points": 0}, {"name": "Silver", "threshold_points": 1000}]
    loyalty_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Reward Catalog Items
    -- JSONB array of objects like: [{"id": "uuid", "name": "Free Coffee", "description": "Redeem for a free coffee", "points_cost": 500}]
    reward_catalog JSONB NOT NULL DEFAULT '[]'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key to the global tenants table
    CONSTRAINT fk_loyalty_config_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    -- Ensure only one loyalty config exists per tenant
    CONSTRAINT uq_loyalty_config_tenant UNIQUE (tenant_id)
);

-- Index for efficient lookup by tenant_id
CREATE INDEX idx_loyalty_config_tenant_id ON loyalty_config (tenant_id);

-- Trigger to automatically update the 'updated_at' column on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loyalty_config_updated_at
BEFORE UPDATE ON loyalty_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();