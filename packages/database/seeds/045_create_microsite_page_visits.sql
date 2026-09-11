-- Purpose: Stores analytics data for microsite page visits.
-- Tracks tenant, merchant, page path, visitor details, and visit timestamp.

CREATE TABLE IF NOT EXISTS microsite_page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    page_path TEXT NOT NULL,
    visitor_ip_hash TEXT NOT NULL,
    referrer TEXT,
    user_agent_hash TEXT NOT NULL,
    session_id UUID NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for efficient lookup by tenant
CREATE INDEX IF NOT EXISTS idx_microsite_page_visits_tenant_id ON microsite_page_visits (tenant_id);

-- Index for efficient lookup by merchant
CREATE INDEX IF NOT EXISTS idx_microsite_page_visits_merchant_id ON microsite_page_visits (merchant_id);

-- Index for time-series queries and ordering
CREATE INDEX IF NOT EXISTS idx_microsite_page_visits_visited_at ON microsite_page_visits (visited_at);

-- Combined index for common queries filtering by tenant and time range
CREATE INDEX IF NOT EXISTS idx_microsite_page_visits_tenant_id_visited_at ON microsite_page_visits (tenant_id, visited_at);

-- Combined index for common queries filtering by merchant and time range
CREATE INDEX IF NOT EXISTS idx_microsite_page_visits_merchant_id_visited_at ON microsite_page_visits (merchant_id, visited_at);<ctrl63>