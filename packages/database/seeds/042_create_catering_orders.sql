-- Purpose: Create the 'catering_orders' table to store catering order requests.

-- Create ENUM type for order status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'catering_order_status') THEN
        CREATE TYPE catering_order_status AS ENUM ('pending', 'confirmed', 'cancelled');
    END IF;
END
$$;

-- Create the catering_orders table if it does not exist
CREATE TABLE IF NOT EXISTS catering_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    merchant_id UUID NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_type TEXT NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    items JSONB NOT NULL, -- Array of {menu_item_id, quantity, notes}
    total_base_price NUMERIC(10, 2) NOT NULL CHECK (total_base_price >= 0),
    total_display_price NUMERIC(10, 2) NOT NULL CHECK (total_display_price >= 0),
    deposit_amount NUMERIC(10, 2) NOT NULL CHECK (deposit_amount >= 0),
    deposit_paid_at TIMESTAMPTZ,
    status catering_order_status NOT NULL,
    special_instructions TEXT,
    advance_notice_hours INTEGER NOT NULL CHECK (advance_notice_hours >= 48),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on tenant_id for efficient lookup and foreign key relationships
CREATE INDEX IF NOT EXISTS idx_catering_orders_tenant_id ON catering_orders (tenant_id);

-- Create index on merchant_id for efficient lookup and foreign key relationships
CREATE INDEX IF NOT EXISTS idx_catering_orders_merchant_id ON catering_orders (merchant_id);

-- Create index on event_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_catering_orders_event_date ON catering_orders (event_date);

-- Create a compound index for tenant_id and status for common filtering patterns
CREATE INDEX IF NOT EXISTS idx_catering_orders_tenant_id_status ON catering_orders (tenant_id, status);