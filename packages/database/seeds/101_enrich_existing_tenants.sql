-- ============================================================
-- Seed 101: Enrich Existing House of Biryani + Tawakkul
-- Uses EXISTING tenant/merchant UUIDs from Cloud SQL
-- Adds: menu categories, menu items, microsite settings,
--       price engine config, merchant locations
-- ============================================================

-- HOB Tenant: a1000000-0000-4000-8000-000000000002
-- HOB Merchant: b1000000-0000-4000-8000-000000000002
-- Tawakkul Tenant: a1000000-0000-4000-8000-000000000001
-- Tawakkul Merchant: b1000000-0000-4000-8000-000000000001

-- ── HOUSE OF BIRYANI — Chicago, IL ────────────────────────────────────────────
DO $$
DECLARE
  v_tenant_id   UUID := 'a1000000-0000-4000-8000-000000000002'::UUID;
  v_merchant_id UUID := 'b1000000-0000-4000-8000-000000000002'::UUID;
BEGIN

  -- Update tenant with missing fields
  UPDATE tenants SET
    plan_tier = 'professional',
    domain = 'houseofbiryanirestaurant.food',
    settings = COALESCE(settings, '{}'::jsonb) || '{"cuisine":"South Indian & Pakistani","paysurity_margin":0.20,"processing_fee":0.05}'::jsonb
  WHERE id = v_tenant_id;

  -- Update merchant with better info
  UPDATE merchants SET
    address = '2306 W Devon Ave, Chicago, IL 60659',
    phone = '(773) 465-2455',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"microsite_domain":"houseofbiryanirestaurant.food","hero_color":"#8B0000","cuisine":"South Indian & Pakistani"}'::jsonb
  WHERE id = v_merchant_id;

  -- Merchant location
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

  -- Menu items
  INSERT INTO menu_items (id, tenant_id, merchant_id, name, description, 
    category, price_cents, base_price_cents, display_price_cents, 
    is_active, is_available, is_vegetarian, is_signature, sort_order, category_id, metadata)
  VALUES
    -- Biryani
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Goat Dum Biryani', 'Slow-cooked goat, aromatic basmati, saffron & dum spices', 'Biryani', 1800, 1800, 2268, true, true, false, true, 1, 'hob-cat-biryani', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Chicken Biryani', 'Tender chicken layered with fragrant basmati rice', 'Biryani', 1400, 1400, 1764, true, true, false, true, 2, 'hob-cat-biryani', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Veg Biryani', 'Fresh vegetables and paneer in aromatic dum rice', 'Biryani', 1100, 1100, 1386, true, true, true, false, 3, 'hob-cat-biryani', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Biryani', 'Slow-cooked mutton with rich spices and basmati rice', 'Biryani', 2000, 2000, 2520, true, true, false, false, 4, 'hob-cat-biryani', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Egg Biryani', 'Fluffy eggs layered with biryani spices and basmati', 'Biryani', 1200, 1200, 1512, true, true, false, false, 5, 'hob-cat-biryani', '{"is_tobacco_free":true}'::jsonb),
    -- Haleem
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Goat Haleem', 'Slow-cooked goat with lentils & wheat, garnished with fried onions', 'Haleem & Soups', 1700, 1700, 2142, true, true, false, true, 1, 'hob-cat-haleem', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Haleem', 'Slow-cooked chicken with lentils, a protein-rich comfort dish', 'Haleem & Soups', 1300, 1300, 1638, true, true, false, false, 2, 'hob-cat-haleem', '{"is_tobacco_free":true}'::jsonb),
    -- Chicken
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken 65', 'Crispy deep-fried chicken with South Indian spices and curry leaves', 'Chicken Specials', 1800, 1800, 2268, true, true, false, false, 1, 'hob-cat-chicken', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Butter Chicken', 'Creamy tomato-based curry with tender chicken', 'Chicken Specials', 1500, 1500, 1890, true, true, false, false, 2, 'hob-cat-chicken', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Tikka Masala', 'Grilled chicken in rich tikka masala gravy', 'Chicken Specials', 1600, 1600, 2016, true, true, false, false, 3, 'hob-cat-chicken', '{"is_tobacco_free":true}'::jsonb),
    -- Mutton
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Karahi', 'Tender mutton cooked in wok with tomatoes and spices', 'Mutton & Seafood', 2000, 2000, 2520, true, true, false, false, 1, 'hob-cat-mutton', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Fish Curry', 'Fresh fish in tangy South Indian coconut curry', 'Mutton & Seafood', 1900, 1900, 2394, true, true, false, false, 2, 'hob-cat-mutton', '{"is_tobacco_free":true}'::jsonb),
    -- Vegetarian
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Paneer Tikka Masala', 'Grilled paneer in rich tikka masala curry', 'Vegetarian', 1600, 1600, 2016, true, true, true, false, 1, 'hob-cat-veg', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Daal Fry', 'Tempered yellow lentils with cumin and garlic', 'Vegetarian', 900, 900, 1134, true, true, true, false, 2, 'hob-cat-veg', '{"is_tobacco_free":true}'::jsonb),
    -- Grill
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Tikka Boti', 'Marinated chicken chargrilled in tandoor oven', 'Grill & Tandoor', 2000, 2000, 2520, true, true, false, false, 1, 'hob-cat-grill', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Lamb Chops', 'Marinated lamb chops grilled to perfection (3 pieces)', 'Grill & Tandoor', 2200, 2200, 2772, true, true, false, false, 2, 'hob-cat-grill', '{"is_tobacco_free":true}'::jsonb),
    -- Breakfast
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Masala Dosa', 'Crispy rice crepe with spiced potato masala, sambar & chutneys', 'Breakfast (7AM–1:30PM)', 899, 899, 1133, true, true, true, false, 1, 'hob-cat-breakfast', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Idli Sambar (3 Pieces)', 'Steamed rice cakes with sambar and chutney', 'Breakfast (7AM–1:30PM)', 700, 700, 882, true, true, true, false, 2, 'hob-cat-breakfast', '{"is_tobacco_free":true}'::jsonb),
    -- Breads
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Plain Naan', 'Soft leavened bread from tandoor oven', 'Breads & Rice', 250, 250, 315, true, true, true, false, 1, 'hob-cat-breads', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Garlic Naan', 'Buttered naan with roasted garlic and herbs', 'Breads & Rice', 300, 300, 378, true, true, true, false, 2, 'hob-cat-breads', '{"is_tobacco_free":true}'::jsonb),
    -- Drinks
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mango Lassi', 'Refreshing yogurt-based mango smoothie', 'Drinks & Desserts', 500, 500, 630, true, true, true, false, 1, 'hob-cat-drinks', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Masala Chai', 'Traditional Indian spiced tea', 'Drinks & Desserts', 200, 200, 252, true, true, true, false, 2, 'hob-cat-drinks', '{"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Gulab Jamun (3 Pcs)', 'Soft milk-solid dumplings in rose-cardamom syrup', 'Drinks & Desserts', 500, 500, 630, true, true, true, false, 3, 'hob-cat-drinks', '{"is_tobacco_free":true}'::jsonb),
    -- PAAN — The Famous HOB Signature!
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Regular Sweet Paan (Meetha)', 'Classic betel leaf with gulkand, coconut, fennel seeds, tutti frutti — A timeless after-meal refresher', 'Paan', 299, 299, 377, true, true, true, true, 1, 'hob-cat-paan', '{"is_paan":true,"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Special Paan', 'Premium paan with extra gulkand, rose petals and silver leaf', 'Paan', 399, 399, 503, true, true, true, true, 2, 'hob-cat-paan', '{"is_paan":true,"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Fire Paan', 'Dramatic fire-lit paan — the Devon Ave TikTok sensation', 'Paan', 499, 499, 629, true, true, true, true, 3, 'hob-cat-paan', '{"is_paan":true,"is_tobacco_free":true}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Ice Cream Paan', 'Refreshing freeze paan with ice cream filling', 'Paan', 599, 599, 755, true, true, true, true, 4, 'hob-cat-paan', '{"is_paan":true,"is_tobacco_free":true}'::jsonb)
  ON CONFLICT DO NOTHING;

  -- Price engine config
  INSERT INTO price_engine_config (tenant_id, paysurity_margin_pct, processing_fee_pct, updated_by, updated_at)
  VALUES (v_tenant_id, 0.20, 0.05, 'ffffffff-ffff-4fff-8fff-ffffffffffff'::UUID, NOW())
  ON CONFLICT (tenant_id) DO UPDATE SET paysurity_margin_pct = 0.20, processing_fee_pct = 0.05, updated_at = NOW();

  -- Microsite settings
  INSERT INTO microsite_settings (id, merchant_id, tenant_id, domain, hero_color, description,
    address, phone, social_links, seo_meta, paysurity_margin_pct, processing_fee_pct, is_published)
  SELECT
    gen_random_uuid(),
    v_merchant_id,
    v_tenant_id,
    'houseofbiryanirestaurant.food',
    '#8B0000',
    'Family-owned restaurant serving authentic Hyderabadi biryani, haleem, dosas, and traditional paan since 2008. Located on historic Devon Avenue, Chicago. Halal certified.',
    '2306 W Devon Ave, Chicago, IL 60659',
    '(773) 465-2455',
    '{"instagram":"houseofbiryani.chicago","title":"House of Biryani"}'::jsonb,
    '{"title":"House of Biryani — Authentic Hyderabadi & South Indian Cuisine","description":"Best Hyderabadi biryani, haleem, paan on Devon Ave Chicago. Halal certified."}'::jsonb,
    0.20, 0.05, true
  WHERE NOT EXISTS (SELECT 1 FROM microsite_settings WHERE tenant_id = v_tenant_id);

  RAISE NOTICE '✅ House of Biryani enriched — Tenant: %', v_tenant_id;
END $$;

-- ── TAWAKKUL RESTAURANT ────────────────────────────────────────────────────────
DO $$
DECLARE
  v_tenant_id   UUID := 'a1000000-0000-4000-8000-000000000001'::UUID;
  v_merchant_id UUID := 'b1000000-0000-4000-8000-000000000001'::UUID;
BEGIN

  UPDATE tenants SET
    plan_tier = 'starter',
    domain = 'tawakkulrestaurant.com',
    settings = COALESCE(settings, '{}'::jsonb) || '{"cuisine":"Pakistani & Hyderabadi","paysurity_margin":0.20}'::jsonb
  WHERE id = v_tenant_id;

  UPDATE merchants SET
    address = '2324 W Devon Ave, Chicago, IL 60659',
    phone = '(773) 465-9999',
    metadata = COALESCE(metadata, '{}'::jsonb) || '{"microsite_domain":"tawakkulrestaurant.com"}'::jsonb
  WHERE id = v_merchant_id;

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
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Goat Dum Biryani',  'Slow-cooked goat, saffron-infused basmati',          'Biryani',    1800, 1800, 2268, true, true, false, true, 1, 'twk-cat-biryani', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Hyderabadi Chicken Biryani',    'Tender chicken in aromatic dum biryani',              'Biryani',    1400, 1400, 1764, true, true, false, true, 2, 'twk-cat-biryani', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Biryani Family Pack',   'Serves 4-6, perfect for catering & events',           'Biryani',    4200, 4200, 5292, true, true, false, false,3, 'twk-cat-biryani', '{"serves":6}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Butter Chicken',                'Classic creamy tomato curry',                         'Curries',    1400, 1400, 1764, true, true, false, false,1, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Masala',                'Rich Pakistani-style chicken masala',                 'Curries',    1400, 1400, 1764, true, true, false, false,2, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mutton Karahi',                 'Tender mutton in wok with Pakistani spices',          'Curries',    1500, 1500, 1890, true, true, false, false,3, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Daal Makhani',                  'Slow-cooked black lentils in butter and cream',       'Curries',    1200, 1200, 1512, true, true, true, false, 4, 'twk-cat-curries', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Chicken Tikka',                 'Charcoal-grilled marinated chicken',                  'BBQ & Grill',1600, 1600, 2016, true, true, false, false,1, 'twk-cat-bbq', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Seekh Kebab',                   'Minced meat mixed with spices on skewers',            'BBQ & Grill',1400, 1400, 1764, true, true, false, false,2, 'twk-cat-bbq', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mix Grill Platter',             'Assorted grilled items for 2',                        'BBQ & Grill',3200, 3200, 4032, true, true, false, false,3, 'twk-cat-bbq', '{"serves":2}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Plain Naan',                    'Fresh tandoor baked bread',                           'Breads',     250, 250, 315, true, true, true, false, 1, 'twk-cat-breads', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Garlic Naan',                   'Buttered naan with roasted garlic',                   'Breads',     300, 300, 378, true, true, true, false, 2, 'twk-cat-breads', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Mango Lassi',                   'Sweet mango yogurt drink',                            'Drinks',     450, 450, 567, true, true, true, false, 1, 'twk-cat-drinks', '{}'::jsonb),
    (gen_random_uuid(), v_tenant_id, v_merchant_id, 'Masala Chai',                   'Pakistani-style spiced tea',                          'Drinks',     200, 200, 252, true, true, true, false, 2, 'twk-cat-drinks', '{}'::jsonb)
  ON CONFLICT DO NOTHING;

  INSERT INTO price_engine_config (tenant_id, paysurity_margin_pct, processing_fee_pct, updated_by, updated_at)
  VALUES (v_tenant_id, 0.20, 0.05, 'ffffffff-ffff-4fff-8fff-ffffffffffff'::UUID, NOW())
  ON CONFLICT (tenant_id) DO UPDATE SET paysurity_margin_pct = 0.20, updated_at = NOW();

  INSERT INTO microsite_settings (id, merchant_id, tenant_id, domain, hero_color, description,
    address, phone, social_links, seo_meta, paysurity_margin_pct, processing_fee_pct, is_published)
  SELECT
    gen_random_uuid(),
    v_merchant_id,
    v_tenant_id,
    'tawakkulrestaurant.com',
    '#1B4332',
    'Traditional recipes, halal ingredients, family dining on Devon Avenue. Dine-in, takeout, and catering available.',
    '2324 W Devon Ave, Chicago, IL 60659',
    '(773) 465-9999',
    '{"instagram":"tawakkul.chicago"}'::jsonb,
    '{"title":"Tawakkul Restaurant — Authentic Pakistani & Hyderabadi Cuisine","description":"Authentic halal Pakistani and Hyderabadi food on Devon Ave Chicago."}'::jsonb,
    0.20, 0.05, true
  WHERE NOT EXISTS (SELECT 1 FROM microsite_settings WHERE tenant_id = v_tenant_id);

  RAISE NOTICE '✅ Tawakkul Restaurant enriched — Tenant: %', v_tenant_id;
END $$;

-- Final results
SELECT 
  'Seed 101 complete!' AS status,
  (SELECT COUNT(*) FROM menu_items WHERE tenant_id IN ('a1000000-0000-4000-8000-000000000001'::UUID, 'a1000000-0000-4000-8000-000000000002'::UUID)) AS hob_twk_menu_items,
  (SELECT COUNT(*) FROM menu_categories WHERE tenant_id IN ('a1000000-0000-4000-8000-000000000001'::text, 'a1000000-0000-4000-8000-000000000002'::text)) AS categories;
