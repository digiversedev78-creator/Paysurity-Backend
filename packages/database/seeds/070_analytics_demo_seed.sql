-- ============================================================
-- SEED: Analytics Spoofer (Illusion of Life for Staging)
-- Description: Generates dense historical chart data for Investor Demo
-- ============================================================
BEGIN;

DO $$ 
DECLARE
  v_tenant VARCHAR := 'house-of-biryani-chicago-2026';
  v_merchant VARCHAR := 'hob-merchant-001';
  v_date DATE;
  v_orders_per_day INT;
  v_total_cents INT;
  i INT;
  j INT;
  v_status VARCHAR;
BEGIN

  -- 1. Create a Staging Wallet if missing (required for the wallet KPI)
  -- The ID must be a UUID format, but we simply check if a wallet exists before inserting
  IF NOT EXISTS (SELECT 1 FROM wallets WHERE tenant_id = v_tenant) THEN
    INSERT INTO wallets (id, tenant_id, balance_cents, currency) 
    VALUES (gen_random_uuid(), v_tenant, 1548200, 'USD');
  ELSE
    UPDATE wallets SET balance_cents = 1548200 WHERE tenant_id = v_tenant;
  END IF;

  -- 2. Spoofer Loop: 7 rolling days of dense order history
  FOR i IN 0..6 LOOP
    v_date := CURRENT_DATE - i;
    
    -- Weekend SPIKE, Weekday LULL simulation
    IF EXTRACT(DOW FROM v_date) IN (0, 6) THEN
      v_orders_per_day := floor(random() * 20 + 30)::int; -- 30-50 orders
    ELSE
      v_orders_per_day := floor(random() * 15 + 15)::int; -- 15-30 orders
    END IF;

    FOR j IN 1..v_orders_per_day LOOP
      -- Generate random order total between $25.00 and $120.00
      v_total_cents := floor(random() * 9500 + 2500)::int;
      
      -- 80% Completed, 15% Processing, 5% Cancelled/Refunded
      v_status := CASE 
        WHEN random() < 0.80 THEN 'completed'
        WHEN random() < 0.95 THEN 'processing'
        ELSE 'refunded'
      END;

      INSERT INTO orders (id, tenant_id, merchant_id, customer_name, order_type, status, subtotal_cents, tax_cents, total_cents, created_at) 
      VALUES (
        gen_random_uuid(), 
        v_tenant, 
        v_merchant, 
        'Demo Client ' || j, 
        'dine_in', 
        v_status, 
        v_total_cents - floor(v_total_cents * 0.1)::int, 
        floor(v_total_cents * 0.1)::int, 
        v_total_cents, 
        -- Stagger precisely throughout the day to look natural in a raw stream
        v_date + (random() * interval '12 hours') + interval '10 hours'
      );
      
    END LOOP;
  END LOOP;

END $$;

COMMIT;
