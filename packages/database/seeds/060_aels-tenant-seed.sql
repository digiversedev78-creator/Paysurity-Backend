WITH new_tenant AS (
    INSERT INTO tenants (id, name, slug, vertical, plan, status, configuration, metadata, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'American Eagle Logistics Service',
        'aels',
        'logistics',
        'professional',
        'active',
        '{}'::jsonb,
        '{"pool": "AEL-PayFactor-Seed", "priority": "P0"}'::jsonb,
        NOW(),
        NOW()
    )
    RETURNING id
)
, new_admin_user AS (
    INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, status, last_login, created_at, updated_at)
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        'aels-admin@americaneaglelogistics.net',
        -- Placeholder for a bcrypt hash of a default password (e.g., 'password123')
        -- In a production setup, this hash would be securely generated or a temporary password flow initiated.
        '$2a$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVW.XXXXXXXXXXXX',
        'AELS',
        'Admin',
        'active',
        NULL,
        NOW(),
        NOW()
    RETURNING id
)
, payfactor_prod_key AS (
    INSERT INTO api_keys (id, tenant_id, name, api_key, api_secret, type, environment, status, created_at, updated_at)
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        'PayFactor Production API Key',
        gen_random_uuid(), -- Dummy API Key
        gen_random_uuid(), -- Dummy API Secret
        'PAYFACTOR',
        'production',
        'active',
        NOW(),
        NOW()
    RETURNING id
)
, payfactor_sandbox_key AS (
    INSERT INTO api_keys (id, tenant_id, name, api_key, api_secret, type, environment, status, created_at, updated_at)
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        'PayFactor Sandbox API Key',
        gen_random_uuid(), -- Dummy API Key
        gen_random_uuid(), -- Dummy API Secret
        'PAYFACTOR',
        'sandbox',
        'active',
        NOW(),
        NOW()
    RETURNING id
)
, payfactor_config AS (
    INSERT INTO payfactor_configurations (id, tenant_id, fee_rate, advance_pct, max_credit_limit, created_at, updated_at)
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        0.035,  -- 3.5%
        0.25,   -- 25%
        5000,
        NOW(),
        NOW()
    RETURNING id
)
, new_drivers AS (
    INSERT INTO drivers (id, tenant_id, first_name, last_name, email, phone_number, status, created_at, updated_at)
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        'John',
        'Doe',
        'john.doe@aels.com',
        '+15551230001',
        'active',
        NOW(),
        NOW()
    UNION ALL
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        'Jane',
        'Smith',
        'jane.smith@aels.com',
        '+15551230002',
        'active',
        NOW(),
        NOW()
    UNION ALL
    SELECT
        gen_random_uuid(),
        (SELECT id FROM new_tenant),
        'Mike',
        'Johnson',
        'mike.johnson@aels.com',
        '+15551230003',
        'active',
        NOW(),
        NOW()
)
SELECT 1;