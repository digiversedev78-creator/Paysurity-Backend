# Super Admin Restaurant Onboarding Guide

This guide defines the required technical protocol for provisioning and structurally seeding the Restaurant Vertical (e.g. House of Biryani, Tawakkul Restaurant) into the PaySurity PostgreSQL environment securely, adhering to POSR_POS_RESTAURANT canonical constraints.

## 1. Creating the Tenant (Sovereign Context Isolation)

Every tenant acts strictly within an RLS-partitioned boundary. The creation of a tenant reserves the deterministic UUID across the platform.

```sql
  -- Recommended: UUID injection explicitly maps the tenant ID logically to platform configuration.
  INSERT INTO public.tenants (id, name, vertical, status)
  VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'House of Biryani', 'RESTAURANT', 'ACTIVE'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tawakkul Restaurant', 'RESTAURANT', 'ACTIVE')
  ON CONFLICT DO NOTHING;
```

## 2. Setting Configuration Variables

Set physical presentation mappings linking the respective tenant ID.

```sql
  -- Set specific brand identities directly reflecting their native aesthetic (e.g., Emerald/Gold)
  INSERT INTO public.microsite_settings (tenant_id, hero_color, description, contact_email)
  VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', '#10b981', 'Emerald Gold Tawakkul', 'info@tawakkul.com');
```

## 3. Physical Extraction & Seeding Array (Retail to POS)

To natively load menus to POS Terminals or Storefront applications locally, items must be actively mapped via `microsite_menu_items`. Standard operating procedure is direct parsing from generic `retail_items`.

### Execution Pathway:
1. Pre-fetch target metadata from raw ingested table boundaries ensuring Tenant mapping restricts leakage.
2. Synchronously write mapped definitions:
```typescript
  // Example Native Mapping Pipeline
  const items = await db.execute(sql`SELECT * FROM public.retail_items WHERE tenant_id = ${targetTenantId}`);
  for (const item of items.rows) {
      // Direct assignment bypassing any potential proxy cache lag
      const price = item.price_cents / 100;
      await db.execute(sql`
          INSERT INTO public.microsite_menu_items (id, tenant_id, name, description, base_price, display_price)
          VALUES (${item.id}, ${targetTenantId}, ${item.name}, ${item.description}, ${price}, ${price})
          ON CONFLICT (id) DO UPDATE SET base_price = EXCLUDED.base_price, display_price = EXCLUDED.display_price;
      `);
  }
```

## 4. Verification Check Constraints

Always conclude seeding operations by executing malformed-context boundary queries.

```typescript
    // Validate Cross-boundary isolation using the WRONG tenant context querying the other tenant's items.
    const rlsQuery = await db.execute(sql`
      SELECT * FROM public.microsite_settings 
      WHERE tenant_id = ${hobTenantId} 
        AND id IN (SELECT id FROM public.microsite_settings WHERE tenant_id = ${tawakkulTenantId})
    `);
    // Expected: 0 rows returned.
```

**STATUS:** All new Super Admins must undergo these routines within staging environments prior to gaining `SUPER_ADMIN` write access to Production.
