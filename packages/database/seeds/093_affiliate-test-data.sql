INSERT INTO tenants (id, name, created_at, updated_at)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Fixed tenantId for consistent testing
    'PaySurity Affiliate Test Tenant',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
    tenant_id_1 UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    affiliate_id_1 UUID;
    affiliate_id_2 UUID;
    affiliate_id_3 UUID;
    commission_rate_id_global UUID;
    commission_rate_id_aff1 UUID;
BEGIN

    -- 1. Create 3 affiliates with referral_codes
    -- Affiliate 1: Active, will have a specific commission rate
    affiliate_id_1 := gen_random_uuid();
    INSERT INTO affiliates (id, tenant_id, name, referral_code, status, created_at, updated_at)
    VALUES (
        affiliate_id_1,
        tenant_id_1,
        'Happy Marketer',
        'HAPPYMARKET',
        'ACTIVE',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '15 days'
    ) ON CONFLICT (referral_code) DO UPDATE SET
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at;

    -- Affiliate 2: Active, will use the global commission rate
    affiliate_id_2 := gen_random_uuid();
    INSERT INTO affiliates (id, tenant_id, name, referral_code, status, created_at, updated_at)
    VALUES (
        affiliate_id_2,
        tenant_id_1,
        'Success Partner',
        'SUCCESSPARTNER',
        'ACTIVE',
        NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '10 days'
    ) ON CONFLICT (referral_code) DO UPDATE SET
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at;

    -- Affiliate 3: Suspended for fraud testing
    affiliate_id_3 := gen_random_uuid();
    INSERT INTO affiliates (id, tenant_id, name, referral_code, status, suspension_reason, created_at, updated_at)
    VALUES (
        affiliate_id_3,
        tenant_id_1,
        'Fraudster Affiliate',
        'FRAUDSTER',
        'SUSPENDED',
        'Repeated click fraud detected, violating terms of service.',
        NOW() - INTERVAL '90 days',
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (referral_code) DO UPDATE SET
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        suspension_reason = EXCLUDED.suspension_reason,
        updated_at = EXCLUDED.updated_at;

    -- 2. Commission Rate Configurations
    -- Global commission rate for the tenant (applies to affiliates without specific rates)
    commission_rate_id_global := gen_random_uuid();
    INSERT INTO affiliate_commission_rates (id, tenant_id, rate_percentage, currency, start_date, created_at, updated_at)
    VALUES (
        commission_rate_id_global,
        tenant_id_1,
        10.00, -- 10%
        'USD',
        NOW() - INTERVAL '1 year',
        NOW() - INTERVAL '1 year',
        NOW() - INTERVAL '1 year'
    ) ON CONFLICT (tenant_id, affiliate_id, start_date) DO UPDATE SET rate_percentage = EXCLUDED.rate_percentage;

    -- Specific commission rate for Affiliate 1, overriding the global rate
    commission_rate_id_aff1 := gen_random_uuid();
    INSERT INTO affiliate_commission_rates (id, tenant_id, affiliate_id, rate_percentage, currency, start_date, end_date, created_at, updated_at)
    VALUES (
        commission_rate_id_aff1,
        tenant_id_1,
        affiliate_id_1,
        15.00, -- 15%
        'USD',
        NOW() - INTERVAL '6 months',
        NOW() + INTERVAL '6 months', -- Active for a year from start_date
        NOW() - INTERVAL '6 months',
        NOW() - INTERVAL '6 months'
    ) ON CONFLICT (tenant_id, affiliate_id, start_date) DO UPDATE SET
        rate_percentage = EXCLUDED.rate_percentage,
        end_date = EXCLUDED.end_date,
        updated_at = EXCLUDED.updated_at;

    -- 3. 20 Affiliate Clicks records
    -- Affiliate 1 (Happy Marketer) - 8 clicks
    INSERT INTO affiliate_clicks (id, tenant_id, affiliate_id, referral_code, ip_address, user_agent, created_at)
    VALUES
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36', NOW() - INTERVAL '29 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15', NOW() - INTERVAL '28 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.3', 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.58 Mobile Safari/537.36', NOW() - INTERVAL '27 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.4', 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.83 Mobile/15E148 Safari/604.1', NOW() - INTERVAL '26 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.5', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:97.0) Gecko/20100101 Firefox/97.0', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/100.0.1185.39 Safari/537.36', NOW() - INTERVAL '24 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1', NOW() - INTERVAL '23 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 'HAPPYMARKET', '192.168.1.8', 'Googlebot/2.1 (+http://www.google.com/bot.html)', NOW() - INTERVAL '22 days');

    -- Affiliate 2 (Success Partner) - 8 clicks
    INSERT INTO affiliate_clicks (id, tenant_id, affiliate_id, referral_code, ip_address, user_agent, created_at)
    VALUES
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36', NOW() - INTERVAL '59 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36', NOW() - INTERVAL '58 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.3', 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36', NOW() - INTERVAL '57 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.4', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36', NOW() - INTERVAL '56 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.5', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1', NOW() - INTERVAL '55 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.6', 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36', NOW() - INTERVAL '54 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.7', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36', NOW() - INTERVAL '53 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 'SUCCESSPARTNER', '172.16.0.8', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36', NOW() - INTERVAL '52 days');

    -- Affiliate 3 (Fraudster Affiliate) - 4 clicks (before suspension)
    INSERT INTO affiliate_clicks (id, tenant_id, affiliate_id, referral_code, ip_address, user_agent, created_at)
    VALUES
    (gen_random_uuid(), tenant_id_1, affiliate_id_3, 'FRAUDSTER', '10.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; rv:98.0) Gecko/20100101 Firefox/98.0', NOW() - INTERVAL '89 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_3, 'FRAUDSTER', '10.0.0.2', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Safari/605.1.15', NOW() - INTERVAL '88 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_3, 'FRAUDSTER', '10.0.0.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36', NOW() - INTERVAL '87 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_3, 'FRAUDSTER', '10.0.0.4', 'Mozilla/5.0 (iPad; CPU OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/99.0.4844.83 Mobile/15E148 Safari/604.1', NOW() - INTERVAL '86 days');


    -- 4. 8 Conversions (mix of pending/approved)
    -- Affiliate 1 (Happy Marketer) - 4 conversions (3 approved, 1 pending)
    INSERT INTO affiliate_conversions (id, tenant_id, affiliate_id, conversion_amount, currency, commission_rate_percentage, commission_amount, status, created_at, converted_at, approved_at)
    VALUES
    -- Approved conversions for Affiliate 1 (15% rate)
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 100.00, 'USD', 15.00, 15.00, 'APPROVED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 250.00, 'USD', 15.00, 37.50, 'APPROVED', NOW() - INTERVAL '17 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 50.00, 'USD', 15.00, 7.50, 'APPROVED', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days'),
    -- Pending conversion for Affiliate 1
    (gen_random_uuid(), tenant_id_1, affiliate_id_1, 120.00, 'USD', 15.00, 18.00, 'PENDING', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', NULL);

    -- Affiliate 2 (Success Partner) - 3 conversions (2 approved, 1 pending)
    INSERT INTO affiliate_conversions (id, tenant_id, affiliate_id, conversion_amount, currency, commission_rate_percentage, commission_amount, status, created_at, converted_at, approved_at)
    VALUES
    -- Approved conversions for Affiliate 2 (10% global rate)
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 300.00, 'USD', 10.00, 30.00, 'APPROVED', NOW() - INTERVAL '50 days', NOW() - INTERVAL '49 days', NOW() - INTERVAL '48 days'),
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 80.00, 'USD', 10.00, 8.00, 'APPROVED', NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days', NOW() - INTERVAL '43 days'),
    -- Pending conversion for Affiliate 2
    (gen_random_uuid(), tenant_id_1, affiliate_id_2, 150.00, 'USD', 10.00, 15.00, 'PENDING', NOW() - INTERVAL '40 days', NOW() - INTERVAL '39 days', NULL);

    -- Affiliate 3 (Fraudster Affiliate) - 1 conversion (to test suspended affiliate conversions, should likely be REJECTED in a real scenario, but PENDING/APPROVED to test data visibility)
    INSERT INTO affiliate_conversions (id, tenant_id, affiliate_id, conversion_amount, currency, commission_rate_percentage, commission_amount, status, created_at, converted_at, approved_at)
    VALUES
    (gen_random_uuid(), tenant_id_1, affiliate_id_3, 75.00, 'USD', 10.00, 7.50, 'PENDING', NOW() - INTERVAL '80 days', NOW() - INTERVAL '79 days', NULL);

END $$;