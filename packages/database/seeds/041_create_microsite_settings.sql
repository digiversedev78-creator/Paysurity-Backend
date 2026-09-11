-- Purpose: Creates the 'microsite_settings' table to store tenant microsite configurations.

CREATE TABLE IF NOT EXISTS microsite_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    domain TEXT,
    hero_color TEXT,
    hero_image_url TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    seo_meta JSONB DEFAULT '{}'::jsonb,
    paysurity_margin_pct NUMERIC(5, 4) DEFAULT 0.20,
    processing_fee_pct NUMERIC(5, 4) DEFAULT 0.05,
    is_published BOOLEAN DEFAULT FALSE,
    pos_sync_enabled BOOLEAN DEFAULT FALSE,
    last_pos_sync_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_merchant
        FOREIGN KEY (merchant_id)
        REFERENCES merchants (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_microsite_settings_tenant_id ON microsite_settings (tenant_id);
CREATE INDEX IF NOT EXISTS idx_microsite_settings_merchant_id ON microsite_settings (merchant_id);