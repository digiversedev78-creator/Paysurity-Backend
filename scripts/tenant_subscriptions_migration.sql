-- =========================================================================
-- PaySurity Tenant Subscriptions Migration (Hardened RLS Version)
-- Status: AUDITED & SECURED
-- =========================================================================

-- 1. Create the Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Subscriptions Table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 3. Enable RLS and FORCE RLS (Security Auditor Fix)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions FORCE ROW LEVEL SECURITY;

-- =========================================================================
-- SECURE ROW LEVEL SECURITY POLICIES
-- =========================================================================

-- Policy: Anyone can read ACTIVE subscription plans (Security Auditor Fix)
CREATE POLICY read_active_subscription_plans ON subscription_plans 
    FOR SELECT 
    USING (is_active = TRUE);

-- Policy: Super Admins can manage all subscription plans
CREATE POLICY super_admin_manage_plans ON subscription_plans
    FOR ALL
    USING (current_setting('app.current_role', true) = 'super_admin');

-- Policy: Tenants can ONLY READ their own subscription (Security Auditor Fix)
-- Tenant users cannot UPDATE or DELETE their subscription to prevent "Free Upgrades"
CREATE POLICY tenant_read_own_subscription ON tenant_subscriptions
    FOR SELECT
    USING (
        current_setting('app.current_role', true) IN ('tenant_admin', 'tenant_user') 
        AND 
        tenant_id = (SELECT NULLIF(current_setting('app.current_tenant_id', true), ''))::uuid
    );

-- Policy: ONLY the Backend Billing Service or Super Admins can UPDATE/INSERT subscriptions
CREATE POLICY backend_service_manage_subscriptions ON tenant_subscriptions
    FOR ALL
    USING (
        current_setting('app.current_role', true) IN ('super_admin', 'billing_service_account')
    );

-- Policy: Support Staff (CSR) can read subscriptions to help customers
CREATE POLICY csr_read_subscriptions ON tenant_subscriptions
    FOR SELECT
    USING (current_setting('app.current_role', true) = 'csr');
