-- Seed data for BistroBeast tenant's payroll configuration and employees
DO $$
DECLARE
    bistro_beast_tenant_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

    -- Insert payroll_config for BistroBeast
    INSERT INTO payroll_config (
        id,
        tenant_id,
        pay_period_type,
        default_pay_rate_type,
        overtime_multiplier,
        holiday_pay_multiplier,
        tax_settings,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000101', -- Payroll Config ID
        bistro_beast_tenant_id,
        'bi-weekly',
        'hourly',
        1.5,
        2.0,
        '{"federal": {"version": "2023_V1", "use_standard_deduction_table": true}, "state": {"default_state": "CA", "version": "2023_CA_V1"}}'::jsonb,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert 5 payroll employees for BistroBeast

    -- Employee 1: Alice Smith (Hourly, High Rate, Basic W4, Health Benefit)
    INSERT INTO payroll_employees (
        id,
        tenant_id,
        employee_id,
        first_name,
        last_name,
        email,
        hire_date,
        pay_type,
        pay_rate,
        w4_data,
        benefits_config,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000201',
        bistro_beast_tenant_id,
        'BB-EMP-001',
        'Alice',
        'Smith',
        'alice.smith@bistrobeast.com',
        '2022-01-15',
        'hourly',
        25.00, -- $25.00/hour
        '{"filing_status": "single", "dependents_claimed": 0, "extra_withholding": 0.00, "multiple_jobs_selected": false}'::jsonb,
        '{"health_insurance": {"deduction_amount": 150.00}}'::jsonb,
        TRUE,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Employee 2: Bob Johnson (Salary, Manager, Basic W4, 401k Benefit)
    INSERT INTO payroll_employees (
        id,
        tenant_id,
        employee_id,
        first_name,
        last_name,
        email,
        hire_date,
        pay_type,
        pay_rate,
        w4_data,
        benefits_config,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000202',
        bistro_beast_tenant_id,
        'Bob',
        'Johnson',
        'bob.johnson@bistrobeast.com',
        '2021-03-01',
        'salary',
        60000.00, -- $60,000 annual salary
        '{"filing_status": "married_filing_jointly", "dependents_claimed": 2, "extra_withholding": 0.00, "multiple_jobs_selected": false}'::jsonb,
        '{"401k_contribution": {"percentage": 0.05}}'::jsonb,
        TRUE,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Employee 3: Charlie Brown (Hourly, Lower Rate, Complex W4, No Benefits)
    INSERT INTO payroll_employees (
        id,
        tenant_id,
        employee_id,
        first_name,
        last_name,
        email,
        hire_date,
        pay_type,
        pay_rate,
        w4_data,
        benefits_config,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000203',
        bistro_beast_tenant_id,
        'BB-EMP-003',
        'Charlie',
        'Brown',
        'charlie.brown@bistrobeast.com',
        '2023-04-10',
        'hourly',
        18.50, -- $18.50/hour
        '{"filing_status": "single", "dependents_claimed": 0, "extra_withholding": 25.00, "multiple_jobs_selected": true}'::jsonb,
        '{}'::jsonb,
        TRUE,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Employee 4: Diana Prince (Salary, Mid-Level, Standard W4, Health + Dental Benefits)
    INSERT INTO payroll_employees (
        id,
        tenant_id,
        employee_id,
        first_name,
        last_name,
        email,
        hire_date,
        pay_type,
        pay_rate,
        w4_data,
        benefits_config,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000204',
        bistro_beast_tenant_id,
        'BB-EMP-004',
        'Diana',
        'Prince',
        'diana.prince@bistrobeast.com',
        '2020-07-20',
        'salary',
        55000.00, -- $55,000 annual salary
        '{"filing_status": "married_filing_jointly", "dependents_claimed": 0, "extra_withholding": 0.00, "multiple_jobs_selected": false}'::jsonb,
        '{"health_insurance": {"deduction_amount": 120.00}, "dental_insurance": {"deduction_amount": 30.00}}'::jsonb,
        TRUE,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Employee 5: Eve Adams (Hourly, Mid-Rate, Simple W4, No Benefits, Inactive)
    INSERT INTO payroll_employees (
        id,
        tenant_id,
        employee_id,
        first_name,
        last_name,
        email,
        hire_date,
        pay_type,
        pay_rate,
        w4_data,
        benefits_config,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000205',
        bistro_beast_tenant_id,
        'BB-EMP-005',
        'Eve',
        'Adams',
        'eve.adams@bistrobeast.com',
        '2023-09-01',
        'hourly',
        22.00, -- $22.00/hour
        '{"filing_status": "single", "dependents_claimed": 0, "extra_withholding": 0.00, "multiple_jobs_selected": false}'::jsonb,
        '{}'::jsonb,
        FALSE, -- This employee is inactive
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

END;
$$;