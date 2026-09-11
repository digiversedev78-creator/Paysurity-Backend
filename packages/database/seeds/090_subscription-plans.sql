INSERT INTO subscription_plans (id, name, description, monthly_price, annual_price, trial_days, created_at, updated_at) VALUES
(gen_random_uuid(), 'Starter', 'Basic Point-of-Sale (POS) features', 49.00, 470.40, 14, NOW(), NOW()),
(gen_random_uuid(), 'Professional', 'Advanced POS, payroll, and customer loyalty features', 149.00, 1430.40, 14, NOW(), NOW()),
(gen_random_uuid(), 'Enterprise', 'All features including custom integrations and dedicated support', 399.00, 3830.40, 14, NOW(), NOW());