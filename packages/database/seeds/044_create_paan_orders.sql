-- Special Paan orders for events. Stores details about event-specific paan orders,
-- including customer information, event date, quantity, paan types, and deposit details.

CREATE TABLE IF NOT EXISTS paan_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    event_date DATE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 50),
    paan_types JSONB NOT NULL,
    deposit_pct NUMERIC(5, 2) NOT NULL CHECK (deposit_pct = 0.25),
    deposit_amount NUMERIC(10, 2) NOT NULL,
    deposit_paid_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paan_orders_tenant_id ON paan_orders (tenant_id);
CREATE INDEX IF NOT EXISTS idx_paan_orders_merchant_id ON paan_orders (merchant_id);
CREATE INDEX IF NOT EXISTS idx_paan_orders_event_date ON paan_orders (event_date);
CREATE INDEX IF NOT EXISTS idx_paan_orders_status ON paan_orders (status);