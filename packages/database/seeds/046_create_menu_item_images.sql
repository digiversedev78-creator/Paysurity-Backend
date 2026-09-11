-- Migration for the 'menu_item_images' table
-- Purpose: Stores images associated with menu items, including metadata like URL, alt text, dimensions, and source.

CREATE TABLE IF NOT EXISTS menu_item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    source TEXT NOT NULL CONSTRAINT chk_menu_item_images_source CHECK (source IN ('uploaded', 'ai_generated', 'stock')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_menu_item_images_tenant_id ON menu_item_images (tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_images_menu_item_id ON menu_item_images (menu_item_id);