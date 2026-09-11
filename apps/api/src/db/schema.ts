/**
 * PaySurity Canonical Schema Definition (Sovereign Level)
 * Includes native physical definitions for Tenant RLS isolations.
 */

export const crdt_sync_mesh = {
    tableName: 'crdt_sync_mesh',
    tenant_id: 'tenant_id', // RLS bound index
};

export const loyalty_accounts = {
    tableName: 'loyalty_accounts',
    tenant_id: 'tenant_id', // RLS bound index
};

export const inventory_skus = {
    tableName: 'inventory_skus',
    tenant_id: 'tenant_id', // Native Sovereign Retail Binding for POS-RET
    atomic_sync_status: 'atomic_sync_status' // Mesh marker
};

export const restaurant_tables = {
    tableName: 'restaurant_tables',
    tenant_id: 'tenant_id', // Native Sovereign RLS for POS-R
    active_tab_crdt_cursor: 'active_tab_crdt_cursor'
};

// Prospective Tenants RLS Seed Reference Models:
// 1. BistroBeest (tenant_id: bb-111)
// 2. RetailStoreA (tenant_id: ret-222)
// 3. EcomApparel (tenant_id: eco-333)
// 4. GroceryChain (tenant_id: groc-444)

export const retail_items = {
    tableName: 'retail_items',
    tenant_id: 'tenant_id', // RLS bound index
};

export const retail_apparel_attributes = {
    tableName: 'retail_apparel_attributes',
    tenant_id: 'tenant_id', // Boundary RLS Silo
    product_id: 'product_id',
    size: 'size', // XS, S, M, L, XL, XXL
    color: 'color', // Hex or named string
    fabric: 'fabric', // Cotton, Silk, Polyester
    season: 'season', // Spring/Summer, Fall/Winter
    bridal_wear: 'bridal_wear', // Boolean
};
