-- ============================================================
-- SEED: House of Biryani
-- Domain: houseofbiryanirestaurant.food
-- Generated: 2026-03-22T01:50:04.911Z
-- ============================================================
BEGIN;

INSERT INTO tenants (id, name, slug, plan_tier, status, settings, created_at)
VALUES (
  'house-of-biryani-chicago-2026',
  'House of Biryani',
  'house-of-biryani',
  'growth',
  'active',
  '{"cuisine":"South Indian & Pakistani","domain":"houseofbiryanirestaurant.food","paysurity_margin":0.20,"processing_fee":0.05}'::jsonb,
  NOW()
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, settings=EXCLUDED.settings;

INSERT INTO users (id, tenant_id, email, password_hash, name, role, status)
VALUES
  ('house-of-biryani-owner-001', 'house-of-biryani-chicago-2026', 'owner@houseofbiryanirestaurant.food', '$2b$10$placeholder', 'House of Biryani Owner', 'owner', 'active'),
  ('house-of-biryani-manager-001', 'house-of-biryani-chicago-2026', 'manager@houseofbiryanirestaurant.food', '$2b$10$placeholder', 'Manager', 'manager', 'active'),
  ('house-of-biryani-staff-001', 'house-of-biryani-chicago-2026', 'staff@houseofbiryanirestaurant.food', '$2b$10$placeholder', 'Staff', 'staff', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO merchants (id, tenant_id, business_name, slug, vertical, status, address, phone, settings)
VALUES (
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'House of Biryani',
  'house-of-biryani',
  'restaurant',
  'active',
  '2306 W Devon Ave, Chicago, IL 60659',
  '(773) 465-2455',
  '{"microsite_domain":"houseofbiryanirestaurant.food","hero_color":"#8B0000","description":"Authentic Hyderabadi, South Indian & Pakistani cuisine. Famous for our signature Dum Biryani, Haleem, and fresh Paan."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET business_name=EXCLUDED.business_name, settings=EXCLUDED.settings;

INSERT INTO merchant_locations (id, merchant_id, tenant_id, name, address, is_primary)
VALUES ('house-of-biryani-location-001', 'house-of-biryani-merchant-001', 'house-of-biryani-chicago-2026', 'Main Location', '2306 W Devon Ave, Chicago, IL 60659', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-001',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Biryani',
  'Aromatic slow-cooked dum biryani',
  1,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-001',
  'house-of-biryani-cat-001',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Hyderabadi Goat Dum Biryani',
  'Slow-cooked goat with aromatic basmati rice, saffron & dum spices',
  1800,
  2268,
  true,
  false,
  true,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-002',
  'house-of-biryani-cat-001',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Hyderabadi Chicken Biryani',
  'Tender chicken layered with fragrant basmati rice',
  1400,
  1764,
  true,
  false,
  true,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-003',
  'house-of-biryani-cat-001',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Veg Biryani',
  'Fresh vegetables and paneer in aromatic dum rice',
  1100,
  1386,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-004',
  'house-of-biryani-cat-001',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mutton Biryani',
  'Slow-cooked mutton with rich spices and basmati rice',
  2000,
  2520,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-005',
  'house-of-biryani-cat-001',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Egg Biryani',
  'Fluffy eggs layered with biryani spices and basmati',
  1200,
  1512,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-002',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Haleem & Soups',
  'Traditional slow-cooked dishes',
  2,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-006',
  'house-of-biryani-cat-002',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Goat Haleem',
  'Slow-cooked goat with lentils & wheat, garnished with fried onions & ginger',
  1700,
  2142,
  true,
  false,
  true,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-007',
  'house-of-biryani-cat-002',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Haleem',
  'Slow-cooked chicken with lentils, a protein-rich comfort dish',
  1300,
  1638,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-008',
  'house-of-biryani-cat-002',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Paya Soup',
  'Traditional trotters slow-cooked in aromatic spices',
  1500,
  1890,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Specials',
  'Signature chicken dishes',
  3,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-009',
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken 65',
  'Crispy deep-fried chicken with South Indian spices and curry leaves',
  1800,
  2268,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-010',
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Manchurian',
  'Indo-Chinese style chicken in tangy manchurian sauce',
  1800,
  2268,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-011',
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Butter Chicken',
  'Creamy tomato-based curry with tender chicken',
  1500,
  1890,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-012',
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Tikka Masala',
  'Grilled chicken in rich tikka masala gravy',
  1600,
  2016,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-013',
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chilli Chicken',
  'Spicy Indo-Chinese style fried chicken with bell peppers',
  1600,
  2016,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-014',
  'house-of-biryani-cat-003',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chilli Garlic Chicken',
  'Fiery garlic-infused chicken tossed with green chillies',
  1600,
  2016,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-004',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mutton & Seafood',
  'Rich meat curries',
  4,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-015',
  'house-of-biryani-cat-004',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mutton Karahi',
  'Tender mutton cooked in wok with tomatoes and spices',
  2000,
  2520,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-016',
  'house-of-biryani-cat-004',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mutton Korma',
  'Rich mughlai-style mutton in creamy korma sauce',
  2000,
  2520,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-017',
  'house-of-biryani-cat-004',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Fish Curry',
  'Fresh fish in tangy South Indian coconut curry',
  1900,
  2394,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-018',
  'house-of-biryani-cat-004',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chilli Fish',
  'Crispy fried fish tossed in Indo-Chinese chilli sauce',
  1900,
  2394,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-005',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Vegetarian',
  'Fresh vegetarian dishes',
  5,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-019',
  'house-of-biryani-cat-005',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Paneer Tikka Masala',
  'Grilled paneer in rich tikka masala curry',
  1600,
  2016,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-020',
  'house-of-biryani-cat-005',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Daal Fry',
  'Tempered yellow lentils with cumin and garlic',
  900,
  1134,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-021',
  'house-of-biryani-cat-005',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mix Veg Curry',
  'Seasonal vegetables in aromatic sauce',
  1200,
  1512,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-022',
  'house-of-biryani-cat-005',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Bhendi Masala',
  'Crispy okra stir-fried with Indian spices',
  1100,
  1386,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-023',
  'house-of-biryani-cat-005',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Alu Gobi',
  'Potato and cauliflower with dry spices',
  1100,
  1386,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-006',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Grill & Tandoor',
  'Clay oven specialties',
  6,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-024',
  'house-of-biryani-cat-006',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Tikka Boti',
  'Marinated chicken chargrilled in tandoor oven',
  2000,
  2520,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-025',
  'house-of-biryani-cat-006',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Seekh Kebab',
  'Minced chicken with herbs and spices, grilled on skewers',
  1700,
  2142,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-026',
  'house-of-biryani-cat-006',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Tandoori Chicken (Half)',
  'Classic tandoor-roasted half chicken with naan',
  1700,
  2142,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-027',
  'house-of-biryani-cat-006',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Lamb Chops',
  'Marinated lamb chops grilled to perfection (3 pieces)',
  2200,
  2772,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-007',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Breakfast (7AM–1:30PM)',
  'Fresh South Indian breakfast',
  7,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-028',
  'house-of-biryani-cat-007',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Masala Dosa',
  'Crispy rice crepe filled with spiced potato masala, served with sambar & chutneys',
  899,
  1133,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-029',
  'house-of-biryani-cat-007',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Palak Cheese Dosa',
  'Spinach and cheese stuffed crispy dosa',
  1200,
  1512,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-030',
  'house-of-biryani-cat-007',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Omelette Dosa',
  'Crispy dosa with spiced egg omelette filling',
  1100,
  1386,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-031',
  'house-of-biryani-cat-007',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Idli Sambar (3 Pieces)',
  'Steamed rice cakes with sambar and coconut chutney',
  700,
  882,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-032',
  'house-of-biryani-cat-007',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Masala Chai',
  'Traditional Indian spiced tea',
  200,
  252,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-008',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Breads & Rice',
  'Fresh baked breads',
  8,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-033',
  'house-of-biryani-cat-008',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Plain Naan',
  'Soft leavened bread from tandoor oven',
  250,
  315,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-034',
  'house-of-biryani-cat-008',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Garlic Naan',
  'Buttered naan with roasted garlic and herbs',
  300,
  378,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-035',
  'house-of-biryani-cat-008',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Paratha',
  'Whole wheat layered flatbread',
  250,
  315,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-036',
  'house-of-biryani-cat-008',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Steamed Basmati Rice',
  'Fragrant long-grain basmati rice',
  300,
  378,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-009',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Drinks & Desserts',
  'Traditional beverages and sweets',
  9,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-037',
  'house-of-biryani-cat-009',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mango Lassi',
  'Refreshing yogurt-based mango smoothie',
  500,
  630,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-038',
  'house-of-biryani-cat-009',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Masala Chai',
  'Spiced Indian tea',
  200,
  252,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-039',
  'house-of-biryani-cat-009',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Gulab Jamun (3 Pcs)',
  'Soft milk-solid dumplings in rose-cardamom syrup',
  500,
  630,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-040',
  'house-of-biryani-cat-009',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Fruit Cake Salad',
  'Fresh seasonal fruits with cream',
  600,
  756,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-010',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Paan',
  'Traditional betel leaf preparations — a South Asian after-meal tradition for mouth freshening and refreshment',
  10,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-041',
  'house-of-biryani-cat-010',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Regular Sweet Paan (Meetha)',
  'Classic betel leaf with gulkand, coconut, fennel seeds, tutti frutti and sweet fillings. A timeless after-meal refresher.',
  150,
  189,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-042',
  'house-of-biryani-cat-010',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Saada Paan Khushboo',
  'Fragrant plain paan with aromatic spices, chuna and katha — the traditional Saada preparation with a delightful khushboo (fragrance)',
  150,
  189,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-043',
  'house-of-biryani-cat-010',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Raam Piyari',
  'Special sweet paan blend named after a famous Paan preparation — with gulkand, rose petals, cardamom, and mixed sweet fillings',
  150,
  189,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-044',
  'house-of-biryani-cat-010',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Minakshi',
  'A delicately flavored paan with a unique blend of sweet coconut, saffron, and aromatic spices — named after the goddess of beauty',
  150,
  189,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Catering Menu',
  '⚠️ Minimum 48-hour advance notice required. Minimum 25% payment at time of order. Half-trays available at (full tray price ÷ 2) + $10.Catering: 48h notice + 25% prepayment required',
  11,
  true
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-045',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mutton Biryani — Full Tray',
  'Serves 20-25 guests. Fragrant dum mutton biryani with raita and salan. Half Tray: $100.',
  18000,
  18000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-046',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Mutton Biryani — Half Tray',
  'Serves 10-12 guests. Full Tray ÷ 2 + $10.',
  10000,
  10000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-047',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Biryani — Full Tray',
  'Serves 20-25 guests. Aromatic Hyderabadi chicken dum biryani. Half Tray: $72.50.',
  12500,
  12500,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-048',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Biryani — Half Tray',
  'Serves 10-12 guests.',
  7250,
  7250,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-049',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Goat Haleem — Full Tray',
  'Serves 20-25 guests. Slow-cooked Hyderabadi goat haleem. Half Tray: $90.',
  16000,
  16000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-050',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Goat Haleem — Half Tray',
  'Serves 10-12 guests.',
  9000,
  9000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-051',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken 65 — Full Tray',
  'Serves 20-25 guests. Crispy deep-fried chicken 65 with curry leaves. Half Tray: $100.',
  18000,
  18000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-052',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken 65 — Half Tray',
  'Serves 10-12 guests.',
  10000,
  10000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-053',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Manchurian — Full Tray',
  'Serves 20-25 guests. Indo-Chinese chicken manchurian. Half Tray: $100.',
  18000,
  18000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-054',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Chicken Manchurian — Half Tray',
  'Serves 10-12 guests.',
  10000,
  10000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-055',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Veg Biryani — Full Tray',
  'Serves 20-25 guests. Fresh vegetarian dum biryani. Half Tray: $70.',
  12000,
  12000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'house-of-biryani-item-056',
  'house-of-biryani-cat-011',
  'house-of-biryani-merchant-001',
  'house-of-biryani-chicago-2026',
  'Veg Biryani — Half Tray',
  'Serves 10-12 guests.',
  7000,
  7000,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":true}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

COMMIT;

-- Price calculation reference for House of Biryani:
-- Display Price = Base Price × 1.05 (processing) × 1.20 (PaySurity margin) = Base × 1.26
-- Margin is configurable via admin dashboard per tenant