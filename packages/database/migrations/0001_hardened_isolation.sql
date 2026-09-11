-- PaySurity Platform — Hardened Isolation RLS Migration
-- Date: 2026-05-14
-- Requirement: REQ-SEC-005

-- 1. Helper function to check impersonation or current tenant
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::UUID;
END;
$$ LANGUAGE plpgsql;

-- 2. Bulk Enable RLS and Create Policies
-- Note: This is a representative script. In a real environment, we'd loop through tables.
-- For the audit, we explicitly harden the most sensitive tables.

DO $$ 
DECLARE 
    t text;
    has_loc boolean;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'tenant_id' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I', t);
        
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = t 
            AND column_name = 'location_id'
        ) INTO has_loc;

        IF has_loc THEN
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I
                USING (
                    (tenant_id = get_current_tenant_id() AND (current_setting(''app.current_location_id'', true) = '''' OR location_id = current_setting(''app.current_location_id'', true)::UUID))
                    OR current_setting(''app.is_super_admin'', true) = ''true''
                )
                WITH CHECK (
                    (tenant_id = get_current_tenant_id() AND (current_setting(''app.current_location_id'', true) = '''' OR location_id = current_setting(''app.current_location_id'', true)::UUID))
                    OR current_setting(''app.is_super_admin'', true) = ''true''
                )
            ', t);
        ELSE
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I
                USING (
                    tenant_id = get_current_tenant_id()
                    OR current_setting(''app.is_super_admin'', true) = ''true''
                )
                WITH CHECK (
                    tenant_id = get_current_tenant_id()
                    OR current_setting(''app.is_super_admin'', true) = ''true''
                )
            ', t);
        END IF;
    END LOOP;
END $$;
