INSERT INTO tenant (id, name)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 'HOB')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO loyalty_config (id, tenant_id, points_per_dollar_earned, redemption_rate_points_per_dollar, expiry_months, tiers)
VALUES (
    'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0e',
    'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d',
    10.00, -- 10 points per dollar earned
    100.00, -- 100 points per dollar redeemed
    12,    -- 12 months expiry
    '[
        {"name": "Bronze", "min_points": 0},
        {"name": "Silver", "min_points": 500},
        {"name": "Gold", "min_points": 2000}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    points_per_dollar_earned = EXCLUDED.points_per_dollar_earned,
    redemption_rate_points_per_dollar = EXCLUDED.redemption_rate_points_per_dollar,
    expiry_months = EXCLUDED.expiry_months,
    tiers = EXCLUDED.tiers;

-- Test Customers for HOB tenant with varying point balances

-- Customer 1: Bronze tier (0 points)
INSERT INTO customer (id, tenant_id, email, first_name, last_name)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c01', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 'hob.customer1.bronze@example.com', 'Brenda', 'Bronze')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, tenant_id = EXCLUDED.tenant_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO loyalty_account (id, customer_id, tenant_id, current_points, lifetime_points)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0d01', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c01', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 0, 0)
ON CONFLICT (id) DO UPDATE SET customer_id = EXCLUDED.customer_id, tenant_id = EXCLUDED.tenant_id, current_points = EXCLUDED.current_points, lifetime_points = EXCLUDED.lifetime_points;

-- Customer 2: Just below Silver tier (450 points)
INSERT INTO customer (id, tenant_id, email, first_name, last_name)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c02', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 'hob.customer2.below_silver@example.com', 'Barry', 'Nearsilver')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, tenant_id = EXCLUDED.tenant_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO loyalty_account (id, customer_id, tenant_id, current_points, lifetime_points)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0d02', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c02', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 450, 450)
ON CONFLICT (id) DO UPDATE SET customer_id = EXCLUDED.customer_id, tenant_id = EXCLUDED.tenant_id, current_points = EXCLUDED.current_points, lifetime_points = EXCLUDED.lifetime_points;

-- Customer 3: Silver tier (500 points)
INSERT INTO customer (id, tenant_id, email, first_name, last_name)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c03', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 'hob.customer3.silver@example.com', 'Sally', 'Silver')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, tenant_id = EXCLUDED.tenant_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO loyalty_account (id, customer_id, tenant_id, current_points, lifetime_points)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0d03', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c03', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 500, 500)
ON CONFLICT (id) DO UPDATE SET customer_id = EXCLUDED.customer_id, tenant_id = EXCLUDED.tenant_id, current_points = EXCLUDED.current_points, lifetime_points = EXCLUDED.lifetime_points;

-- Customer 4: Above Silver, Below Gold tier (1500 points)
INSERT INTO customer (id, tenant_id, email, first_name, last_name)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c04', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 'hob.customer4.mid_gold@example.com', 'Gary', 'Midgold')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, tenant_id = EXCLUDED.tenant_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO loyalty_account (id, customer_id, tenant_id, current_points, lifetime_points)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0d04', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c04', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 1500, 1500)
ON CONFLICT (id) DO UPDATE SET customer_id = EXCLUDED.customer_id, tenant_id = EXCLUDED.tenant_id, current_points = EXCLUDED.current_points, lifetime_points = EXCLUDED.lifetime_points;

-- Customer 5: Gold tier (2000 points)
INSERT INTO customer (id, tenant_id, email, first_name, last_name)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c05', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 'hob.customer5.gold@example.com', 'Gabriella', 'Gold')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, tenant_id = EXCLUDED.tenant_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

INSERT INTO loyalty_account (id, customer_id, tenant_id, current_points, lifetime_points)
VALUES ('a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0d05', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0c05', 'a0e2a3c9-0d12-4f31-8f92-9a3c2e1f0b0d', 2000, 2000)
ON CONFLICT (id) DO UPDATE SET customer_id = EXCLUDED.customer_id, tenant_id = EXCLUDED.tenant_id, current_points = EXCLUDED.current_points, lifetime_points = EXCLUDED.lifetime_points;