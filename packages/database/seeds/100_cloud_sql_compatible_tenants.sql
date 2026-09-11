-- ============================================================
-- Seed 100: House of Biryani + Tawakkul Restaurant
-- 100% Cloud SQL Compatible — verified against real schema
-- Generated: 2026-03-22 (schema-matched)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===========================================================
-- HOUSE OF BIRYANI — 2306 W Devon Ave, Chicago, IL 60659
-- Domain: houseofbiryanirestaurant.food
-- ===========================================================
DO $$
DECLARE
  v_tenant_id   UUID := 'a0b1c2d3-0001-0001-0001-000000000001'::UUID;
  v_merchant_id UUID := 'a0b1c2d3-0001-0001-0001-000000000002'::UUID;
BEGIN

  -- Tenant
  INSERT INTO tenants (id, name, slug, plan, status, vertical, default_gateway, 
    gateway_merchant_id, platform_fee_rate_bps, max_locations, max_users, max_terminals,
    settings, plan_tier, domain)
  VALUES (
    v_tenant_id, 'House of Biryani', 'house-of-biryani',
    'professional', 'active', 'restaurant', 'fluidpay', 'hob-fluidpay-001',
    200, 5, 20, 10,
    '{"cuisine":"South Indian & Pakistani","paysurity_margin":0.20}'::jsonb,
    'professional', 'houseofbiryanirestaurant.food'
  )
  ON CONFLICT (id) DO UPDATE SET plan_tier = EXCLUDED.plan_tier, domain = EXCLUDED.domain;

  -- Merchant (using correct column names: legal_name, dba_name, mcc, address_street/city/etc)
  INSERT INTO merchants (id, tenant_id, legal_name, dba_name, mcc, status, 
    address_street, address_city, address_state, address_postcode, address_country,
    phone, email, website, metadata, address)
  VALUES (
    v_merchant_id, v_tenant_id,
    'House of Biryani LLC', 'House of Biryani', '5812', 'active',
    '2306 W Devon Ave', 'Chicago', 'IL', '60659', 'US',
    '(773) 465-2455', 'info@houseofbiryanirestaurant.food',
    'https://houseofbiryanirestaurant.food',
    '{"microsite_domain":"houseofbiryanirestaurant.food","hero_color":"#8B0000","cuisine":"South Indian & Pakistani"}'::jsonb,
    '2306 W Devon Ave, Chicago, IL 60659'
  )
  ON CONFLICT (id) DO UPDATE SET dba_name = EXCLUDED.dba_name, metadata = EXCLUDED.metadata;

  -- Users (first_name + last_name, role enum, is_active)
  INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active, mfa_enabled)
  VALUES
    ('a0b1c2d3-0001-0001-0001-000000000010'::UUID, v_tenant_id,
     'owner@houseofbiryanirestaurant.food', '$2b$10$K5q7Rp9LmNx1Vu8Yw2AkeKBRHRN7pFQqWSYxYFGlZ5tB3lMhY3me', 
     'House', 'of Biryani Owner', 'tenant_admin', true, false),
    ('a0b1c2d3-0001-0001-0001-000000000011'::UUID, v_tenant_id,
     'manager@houseofbiryanirestaurant.food', '$2b$10$K5q7Rp9LmNx1Vu8Yw2AkeKBRHRN7pFQqWSYxYFGlZ5tB3lMhY3me', 
     'HOB', 'Manager', 'manager', true, false)
  ON CONFLICT (id) DO NOTHING;

  -- Merchant location (our new table)
  INSERT INTO merchant_locations (id, merchant_id, tenant_id, name, address, is_primary)
  VALUES ('hob-loc-001', v_merchant_id::TEXT, v_tenant_id::TEXT, 'Devon Ave Main', '2306 W Devon Ave, Chicago, IL 60659', true)
  ON CONFLICT (id) DO NOTHING;

  -- Menu categories
  INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
  VALUES
    ('hob-cat-biryani',   v_merchant_id::TEXT, v_tenant_id::TEXT, 'Biryani',              'Aromatic slow-cooked dum biryani',    1, true),
    ('hob-cat-haleem',    v_merchant_id::TEXT, v_tenant_id::TEXT, 'Haleem & Soups',        'Traditional slow-cooked dishes',       2, true),
    ('hob-cat-chicken',   v_merchant_id::TEXT, v_tenant_id::TEXT, 'Chicken Specials',      'Signature chicken dishes',             3, true),
    ('hob-cat-mutton',    v_merchant_id::TEXT, v_tenant_id::TEXT, 'Mutton & Seafood',      'Rich meat curries',                    4, true),
    ('hob-cat-veg',       v_merchant_id::TEXT, v_tenant_id::TEXT, 'Vegetarian',            'Fresh vegetarian dishes',              5, false),
    ('hob-cat-grill',     v_merchant_id::TEXT, v_tenant_id::TEXT, 'Grill & Tandoor',       'Clay oven specialties',                6, true),
    ('hob-cat-breakfast', v_merchant_id::TEXT, v_tenant_id::TEXT, 'Breakfast (7AM–1:30PM)','Fresh South Indian breakfast',         7, false),
    ('hob-cat-breads',    v_merchant_id::TEXT, v_tenant_id::TEXT, 'Breads & Rice',         'Fresh baked breads',                   8, true),
    ('hob-cat-drinks',    v_merchant_id::TEXT, v_tenant_id::TEXT, 'Drinks & Desserts',     'Traditional beverages and sweets',     9, true),
    ('hob-cat-paan',      v_merchant_id::TEXT, v_tenant_id::TEXT, 'Paan',                  'Traditional betel leaf preparations', 10, false)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  -- Menu items (correct column names from schema)
  INSERT INTO menu_items (id, tenant_id, merchant_id, name, description, 
    category, price_cents, base_price_cents, display_price_cents, 
    is_active, is_available, is_vegetarian, is_signature, sort_order, category_id, metadata)
  VALUES
    -- Biryani
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Goat Dum Biryani',      'Slow-cooked goat, aromatic basmati, saffron & dum spices',                  'Biryani',           1800, 1800, 2268, true, true, false, true, 1, 'hob-cat-biryani',   '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Chicken Biryani',        'Tender chicken layered with fragrant basmati rice',                          'Biryani',           1400, 1400, 1764, true, true, false, true, 2, 'hob-cat-biryani',   '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Veg Biryani',                       'Fresh vegetables and paneer in aromatic dum rice',                           'Biryani',           1100, 1100, 1386, true, true, true,  false,3, 'hob-cat-biryani',   '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Biryani',                    'Slow-cooked mutton with rich spices and basmati rice',                       'Biryani',           2000, 2000, 2520, true, true, false, false,4, 'hob-cat-biryani',   '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Egg Biryani',                       'Fluffy eggs layered with biryani spices and basmati',                        'Biryani',           1200, 1200, 1512, true, true, false, false,5, 'hob-cat-biryani',   '{"is_tobacco_free":true}'::jsonb),
    -- Haleem & Soups
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Goat Haleem',                       'Slow-cooked goat with lentils & wheat, garnished with fried onions',         'Haleem & Soups',    1700, 1700, 2142, true, true, false, true, 1, 'hob-cat-haleem',    '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Haleem',                    'Slow-cooked chicken with lentils, a protein-rich comfort dish',              'Haleem & Soups',    1300, 1300, 1638, true, true, false, false,2, 'hob-cat-haleem',    '{"is_tobacco_free":true}'::jsonb),
    -- Chicken Specials
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken 65',                        'Crispy deep-fried chicken with South Indian spices and curry leaves',        'Chicken Specials',  1800, 1800, 2268, true, true, false, false,1, 'hob-cat-chicken',   '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Butter Chicken',                    'Creamy tomato-based curry with tender chicken',                              'Chicken Specials',  1500, 1500, 1890, true, true, false, false,2, 'hob-cat-chicken',   '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Tikka Masala',              'Grilled chicken in rich tikka masala gravy',                                 'Chicken Specials',  1600, 1600, 2016, true, true, false, false,3, 'hob-cat-chicken',   '{"is_tobacco_free":true}'::jsonb),
    -- Mutton
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Karahi',                     'Tender mutton cooked in wok with tomatoes and spices',                       'Mutton & Seafood',  2000, 2000, 2520, true, true, false, false,1, 'hob-cat-mutton',    '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Korma',                      'Rich mughlai-style mutton in creamy korma sauce',                            'Mutton & Seafood',  2000, 2000, 2520, true, true, false, false,2, 'hob-cat-mutton',    '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Fish Curry',                        'Fresh fish in tangy South Indian coconut curry',                             'Mutton & Seafood',  1900, 1900, 2394, true, true, false, false,3, 'hob-cat-mutton',    '{"is_tobacco_free":true}'::jsonb),
    -- Vegetarian
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Paneer Tikka Masala',               'Grilled paneer in rich tikka masala curry',                                  'Vegetarian',        1600, 1600, 2016, true, true, true,  false,1, 'hob-cat-veg',       '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Daal Fry',                          'Tempered yellow lentils with cumin and garlic',                              'Vegetarian',        900,  900,  1134, true, true, true,  false,2, 'hob-cat-veg',       '{"is_tobacco_free":true}'::jsonb),
    -- Grill & Tandoor
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Tikka Boti',                'Marinated chicken chargrilled in tandoor oven',                              'Grill & Tandoor',   2000, 2000, 2520, true, true, false, false,1, 'hob-cat-grill',     '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Seekh Kebab',               'Minced chicken with herbs and spices, grilled on skewers',                  'Grill & Tandoor',   1700, 1700, 2142, true, true, false, false,2, 'hob-cat-grill',     '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Lamb Chops',                        'Marinated lamb chops grilled to perfection (3 pieces)',                      'Grill & Tandoor',   2200, 2200, 2772, true, true, false, false,3, 'hob-cat-grill',     '{"is_tobacco_free":true}'::jsonb),
    -- Breakfast
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Masala Dosa',                       'Crispy rice crepe filled with spiced potato masala, served with sambar & chutneys', 'Breakfast (7AM–1:30PM)', 899, 899, 1133, true, true, true, false, 1, 'hob-cat-breakfast', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Palak Cheese Dosa',                 'Spinach and cheese stuffed crispy dosa',                                     'Breakfast (7AM–1:30PM)', 1200, 1200, 1512, true, true, true, false, 2, 'hob-cat-breakfast', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Idli Sambar (3 Pieces)',             'Steamed rice cakes with sambar and coconut chutney',                         'Breakfast (7AM–1:30PM)', 700, 700, 882, true, true, true, false, 3, 'hob-cat-breakfast', '{"is_tobacco_free":true}'::jsonb),
    -- Breads
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Plain Naan',                        'Soft leavened bread from tandoor oven',                                      'Breads & Rice',     250,  250,  315,  true, true, true,  false,1, 'hob-cat-breads',    '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Garlic Naan',                       'Buttered naan with roasted garlic and herbs',                                'Breads & Rice',     300,  300,  378,  true, true, true,  false,2, 'hob-cat-breads',    '{"is_tobacco_free":true}'::jsonb),
    -- Drinks & Desserts
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mango Lassi',                       'Refreshing yogurt-based mango smoothie',                                     'Drinks & Desserts', 500,  500,  630,  true, true, true,  false,1, 'hob-cat-drinks',    '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Masala Chai',                       'Traditional Indian spiced tea',                                              'Drinks & Desserts', 200,  200,  252,  true, true, true,  false,2, 'hob-cat-drinks',    '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Gulab Jamun (3 Pcs)',               'Soft milk-solid dumplings in rose-cardamom syrup',                           'Drinks & Desserts', 500,  500,  630,  true, true, true,  false,3, 'hob-cat-drinks',    '{"is_tobacco_free":true}'::jsonb),
    -- Paan (signature signature!)
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Regular Sweet Paan (Meetha)',        'Classic betel leaf with gulkand, coconut, fennel seeds, tutti frutti — A timeless after-meal refresher', 'Paan', 299, 299, 377, true, true, true, true, 1, 'hob-cat-paan', '{"is_paan":true,"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Special Paan',                      'Premium paan with extra gulkand, rose petals and silver leaf',               'Paan',              399,  399,  503,  true, true, true,  true, 2, 'hob-cat-paan',    '{"is_paan":true,"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Fire Paan',                         'Dramatic fire-lit paan experience, a TikTok viral sensation',                'Paan',              499,  499,  629,  true, true, true,  true, 3, 'hob-cat-paan',    '{"is_paan":true,"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Ice Cream Paan',                    'Refreshing freeze paan with ice cream filling',                              'Paan',              599,  599,  755,  true, true, true,  true, 4, 'hob-cat-paan',    '{"is_paan":true,"is_tobacco_free":true}'::jsonb)
  ON CONFLICT DO NOTHING;

  -- Price engine config
  INSERT INTO price_engine_config (tenant_id, base_margin, processing_fee)
  VALUES (v_tenant_id::TEXT, 0.20, 0.05)
  ON CONFLICT (tenant_id) DO UPDATE SET base_margin = 0.20, processing_fee = 0.05;

  -- Microsite settings
  INSERT INTO microsite_settings (merchant_id, tenant_id, primary_color, tagline, description, instagram_handle)
  VALUES (v_merchant_id::TEXT, v_tenant_id::TEXT, '#8B0000', 
    'Authentic Hyderabadi & South Indian Cuisine',
    'Family-owned restaurant serving authentic Hyderabadi biryani, haleem, dosas, and traditional paan since 2008. Located on historic Devon Avenue, Chicago. Halal certified.',
    'houseofbiryani.chicago'
  )
  ON CONFLICT (merchant_id, tenant_id) DO UPDATE SET tagline = EXCLUDED.tagline;

  RAISE NOTICE '✅ House of Biryani seeded — Tenant: %, Merchant: %', v_tenant_id, v_merchant_id;
END $$;

-- ===========================================================
-- TAWAKKUL RESTAURANT — 2324 W Devon Ave, Chicago, IL 60659
-- ===========================================================
DO $$
DECLARE
  v_tenant_id   UUID := 'b1c2d3e4-0002-0002-0002-000000000001'::UUID;
  v_merchant_id UUID := 'b1c2d3e4-0002-0002-0002-000000000002'::UUID;
BEGIN

  INSERT INTO tenants (id, name, slug, plan, status, vertical, default_gateway, 
    gateway_merchant_id, platform_fee_rate_bps, max_locations, max_users, max_terminals,
    settings, plan_tier, domain)
  VALUES (
    v_tenant_id, 'Tawakkul Restaurant', 'tawakkul-restaurant',
    'starter', 'active', 'restaurant', 'fluidpay', 'tawakkul-fluidpay-001',
    200, 2, 10, 5,
    '{"cuisine":"Pakistani & Hyderabadi","paysurity_margin":0.20}'::jsonb,
    'starter', 'tawakkulrestaurant.com'
  )
  ON CONFLICT (id) DO UPDATE SET plan_tier = EXCLUDED.plan_tier, settings = EXCLUDED.settings;

  INSERT INTO merchants (id, tenant_id, legal_name, dba_name, mcc, status,
    address_street, address_city, address_state, address_postcode, address_country,
    phone, email, metadata, address)
  VALUES (
    v_merchant_id, v_tenant_id,
    'Tawakkul Restaurant Inc', 'Tawakkul Restaurant', '5812', 'active',
    '2324 W Devon Ave', 'Chicago', 'IL', '60659', 'US',
    '(773) 465-9999', 'info@tawakkulrestaurant.com',
    '{"microsite_domain":"tawakkulrestaurant.com","description":"Authentic Pakistani and Hyderabadi cuisine."}'::jsonb,
    '2324 W Devon Ave, Chicago, IL 60659'
  )
  ON CONFLICT (id) DO UPDATE SET dba_name = EXCLUDED.dba_name;

  INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, role, is_active, mfa_enabled)
  VALUES ('b1c2d3e4-0002-0002-0002-000000000010'::UUID, v_tenant_id, 
    'owner@tawakkulrestaurant.com', '$2b$10$K5q7Rp9LmNx1Vu8Yw2AkeKBRHRN7pFQqWSYxYFGlZ5tB3lMhY3me',
    'Tawakkul', 'Owner', 'tenant_admin', true, false)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO merchant_locations (id, merchant_id, tenant_id, name, address, is_primary)
  VALUES ('twk-loc-001', v_merchant_id::TEXT, v_tenant_id::TEXT, 'Devon Ave Location', '2324 W Devon Ave, Chicago, IL 60659', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order)
  VALUES
    ('twk-cat-biryani', v_merchant_id::TEXT, v_tenant_id::TEXT, 'Biryani',      'Signature dum biryanis',         1),
    ('twk-cat-curries', v_merchant_id::TEXT, v_tenant_id::TEXT, 'Curries',       'Rich Pakistani curries',         2),
    ('twk-cat-bbq',     v_merchant_id::TEXT, v_tenant_id::TEXT, 'BBQ & Grill',   'Charcoal-grilled specialties',   3),
    ('twk-cat-breads',  v_merchant_id::TEXT, v_tenant_id::TEXT, 'Breads',        'Fresh tandoor breads',           4),
    ('twk-cat-drinks',  v_merchant_id::TEXT, v_tenant_id::TEXT, 'Drinks',        'Beverages',                      5)
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  INSERT INTO menu_items (id, tenant_id, merchant_id, name, description, category,
    price_cents, base_price_cents, display_price_cents, is_active, is_available, is_vegetarian, is_signature, sort_order, category_id, metadata)
  VALUES
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Goat Dum Biryani',    'Slow-cooked goat, saffron-infused basmati',      'Biryani', 1800, 1800, 2268, true, true, false, true, 1, 'twk-cat-biryani', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Chicken Biryani',      'Tender chicken in aromatic dum biryani',          'Biryani', 1400, 1400, 1764, true, true, false, true, 2, 'twk-cat-biryani', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Biryani Family Pack',     'Serves 4-6, perfect for catering & events',       'Biryani', 4200, 4200, 5292, true, true, false, false,3, 'twk-cat-biryani', '{"is_catering_friendly":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Butter Chicken',                  'Classic creamy tomato curry',                     'Curries', 1400, 1400, 1764, true, true, false, false,1, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Masala',                  'Rich Pakistani-style chicken masala',             'Curries', 1400, 1400, 1764, true, true, false, false,2, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Karahi',                   'Tender mutton in wok with Pakistani spices',      'Curries', 1500, 1500, 1890, true, true, false, false,3, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Daal Makhani',                    'Slow-cooked black lentils in butter and cream',   'Curries', 1200, 1200, 1512, true, true, true, false, 4, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Tikka',                   'Charcoal-grilled marinated chicken',              'BBQ & Grill', 1600, 1600, 2016, true, true, false, false,1, 'twk-cat-bbq', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Seekh Kebab',                     'Minced meat mixed with spices on skewers',        'BBQ & Grill', 1400, 1400, 1764, true, true, false, false,2, 'twk-cat-bbq', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mix Grill Platter',               'Assorted grilled items for 2',                    'BBQ & Grill', 3200, 3200, 4032, true, true, false, false,3, 'twk-cat-bbq', '{"serves":2}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Plain Naan',                      'Fresh tandoor baked bread',                       'Breads', 250, 250, 315, true, true, true, false, 1, 'twk-cat-breads', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Garlic Naan',                     'Buttered naan with roasted garlic',               'Breads', 300, 300, 378, true, true, true, false, 2, 'twk-cat-breads', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mango Lassi',                     'Sweet mango yogurt drink',                        'Drinks', 450, 450, 567, true, true, true, false, 1, 'twk-cat-drinks', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Masala Chai',                     'Pakistani-style spiced tea',                      'Drinks', 200, 200, 252, true, true, true, false, 2, 'twk-cat-drinks', '{}'::jsonb)
  ON CONFLICT DO NOTHING;

  INSERT INTO price_engine_config (tenant_id, base_margin, processing_fee)
  VALUES (v_tenant_id::TEXT, 0.20, 0.05)
  ON CONFLICT (tenant_id) DO UPDATE SET base_margin = 0.20;

  INSERT INTO microsite_settings (merchant_id, tenant_id, primary_color, tagline, description, instagram_handle)
  VALUES (v_merchant_id::TEXT, v_tenant_id::TEXT, '#1B4332',
    'Authentic Pakistani & Hyderabadi Flavors',
    'Traditional recipes, halal ingredients, family dining on Devon Avenue. Dine-in, takeout, and catering available.',
    'tawakkul.chicago'
  )
  ON CONFLICT (merchant_id, tenant_id) DO UPDATE SET tagline = EXCLUDED.tagline;

  RAISE NOTICE '✅ Tawakkul Restaurant seeded — Tenant: %, Merchant: %', v_tenant_id, v_merchant_id;
END $$;

-- Final count
SELECT 'Seed complete!' AS result, 
       (SELECT COUNT(*) FROM tenants WHERE id IN ('a0b1c2d3-0001-0001-0001-000000000001'::UUID, 'b1c2d3e4-0002-0002-0002-000000000001'::UUID)) AS tenants_seeded,
       (SELECT COUNT(*) FROM menu_items WHERE tenant_id IN ('a0b1c2d3-0001-0001-0001-000000000001'::UUID, 'b1c2d3e4-0002-0002-0002-000000000001'::UUID)) AS menu_items_seeded;
