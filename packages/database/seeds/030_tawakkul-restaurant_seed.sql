-- ============================================================
-- SEED: Tawakkul Restaurant
-- Domain: tawakkulrestaurant.food
-- Generated: 2026-03-22T01:50:04.917Z
-- ============================================================
BEGIN;

INSERT INTO tenants (id, name, slug, plan_tier, status, settings, created_at)
VALUES (
  'tawakkul-restaurant-chicago-2026',
  'Tawakkul Restaurant',
  'tawakkul-restaurant',
  'growth',
  'active',
  '{"cuisine":"Halal Pakistani & Indian, Hyderabadi","domain":"tawakkulrestaurant.food","paysurity_margin":0.20,"processing_fee":0.05}'::jsonb,
  NOW()
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, settings=EXCLUDED.settings;

INSERT INTO users (id, tenant_id, email, password_hash, name, role, status)
VALUES
  ('tawakkul-restaurant-owner-001', 'tawakkul-restaurant-chicago-2026', 'owner@tawakkulrestaurant.food', '$2b$10$placeholder', 'Tawakkul Restaurant Owner', 'owner', 'active'),
  ('tawakkul-restaurant-manager-001', 'tawakkul-restaurant-chicago-2026', 'manager@tawakkulrestaurant.food', '$2b$10$placeholder', 'Manager', 'manager', 'active'),
  ('tawakkul-restaurant-staff-001', 'tawakkul-restaurant-chicago-2026', 'staff@tawakkulrestaurant.food', '$2b$10$placeholder', 'Staff', 'staff', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO merchants (id, tenant_id, business_name, slug, vertical, status, address, phone, settings)
VALUES (
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Tawakkul Restaurant',
  'tawakkul-restaurant',
  'restaurant',
  'active',
  '6410 N Claremont Ave, Chicago, IL 60659',
  '(773) 743-5555',
  '{"microsite_domain":"tawakkulrestaurant.food","hero_color":"#1a472a","description":"HMS-certified Halal Pakistani & Indian cuisine. Famous for our Hyderabadi Biryani, Karahi, and authentic street food."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET business_name=EXCLUDED.business_name, settings=EXCLUDED.settings;

INSERT INTO merchant_locations (id, merchant_id, tenant_id, name, address, is_primary)
VALUES ('tawakkul-restaurant-location-001', 'tawakkul-restaurant-merchant-001', 'tawakkul-restaurant-chicago-2026', 'Main Location', '6410 N Claremont Ave, Chicago, IL 60659', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-001',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Biryani',
  '',
  1,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-001',
  'tawakkul-restaurant-cat-001',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Hyderabadi Goat Dum Biryani',
  'Authentic slow-cooked goat biryani with saffron and dum spices',
  1800,
  2268,
  true,
  false,
  true,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-002',
  'tawakkul-restaurant-cat-001',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Hyderabadi Chicken Biryani',
  'Tender chicken layered with fragrant basmati and biryani masala',
  1400,
  1764,
  true,
  false,
  true,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-003',
  'tawakkul-restaurant-cat-001',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken Biryani Family Pack',
  'Chicken biryani with haleem, 2 roti, chicken 65 and dessert — feeds 4',
  4200,
  5292,
  true,
  false,
  true,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Curries',
  '',
  2,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-004',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Butter Chicken',
  'Classic creamy tomato butter chicken — Best Seller',
  1400,
  1764,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-005',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken Masala',
  'Authentic South Asian spiced chicken curry',
  1400,
  1764,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-006',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Mutton Karahi',
  'Tender mutton cooked in wok with tomatoes and spices',
  1500,
  1890,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-007',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Mutton Mughlai',
  'Rich mughlai curry with aromatic spices',
  1500,
  1890,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-008',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Paneer Masala',
  'Fresh cottage cheese in spiced masala gravy',
  1400,
  1764,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-009',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Bhendi Masala',
  'Crispy okra in spiced masala',
  1100,
  1386,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-010',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Alu-Gobi Masala',
  'Potato and cauliflower with dry spices',
  1100,
  1386,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-011',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Daal Tadka',
  'Tempered yellow lentils with cumin and ghee',
  900,
  1134,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-012',
  'tawakkul-restaurant-cat-002',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Mutton Fry (Talewa Gosht)',
  'Pan-fried mutton with traditional spices',
  1900,
  2394,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-003',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Desi Chinese',
  'Indo-Chinese fusion — Best Sellers',
  3,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-013',
  'tawakkul-restaurant-cat-003',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken 65',
  'Crispy spiced fried chicken — Best Seller',
  1400,
  1764,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-014',
  'tawakkul-restaurant-cat-003',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chilly Chicken',
  'Indo-Chinese chilli chicken with bell peppers',
  1400,
  1764,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-015',
  'tawakkul-restaurant-cat-003',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken Noodles',
  'Stir-fried Indo-Chinese chicken noodles — Best Seller',
  1500,
  1890,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-016',
  'tawakkul-restaurant-cat-003',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken Fried Rice',
  'Indo-Chinese style chicken fried rice',
  1500,
  1890,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-004',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Hyderabadi Specialties',
  '',
  4,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-017',
  'tawakkul-restaurant-cat-004',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Hyderabadi Haleem',
  'Slow-cooked wheat and meat haleem with garnishes',
  1300,
  1638,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-005',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Grilled Specials',
  '',
  5,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-018',
  'tawakkul-restaurant-cat-005',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken Tikka',
  'Marinated chicken tikka grilled in tandoor',
  1400,
  1764,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-019',
  'tawakkul-restaurant-cat-005',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Lamb Chops',
  'Tender marinated lamb chops grilled to perfection',
  1200,
  1512,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-006',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Appetizers & Sides',
  '',
  6,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-020',
  'tawakkul-restaurant-cat-006',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Samosa (4 Pieces Veg)',
  'Crispy pastry filled with spiced potatoes and peas',
  800,
  1008,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-021',
  'tawakkul-restaurant-cat-006',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Chicken Pakoda',
  'Crispy battered chicken fritters with green chutney',
  1200,
  1512,
  true,
  false,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-022',
  'tawakkul-restaurant-cat-006',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Khatti Daal',
  'Tangy tamarind-spiced lentil preparation',
  500,
  630,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-023',
  'tawakkul-restaurant-cat-006',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Paratha',
  'Whole wheat flaky layered flatbread',
  250,
  315,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_categories (id, merchant_id, tenant_id, name, description, sort_order, is_catering)
VALUES (
  'tawakkul-restaurant-cat-007',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Desserts',
  '',
  7,
  false
) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-024',
  'tawakkul-restaurant-cat-007',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Kaddu ka Halwa',
  'Sweet pumpkin halwa with cardamom and nuts',
  700,
  882,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-025',
  'tawakkul-restaurant-cat-007',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Gajar ka Halwa',
  'Carrot halwa with khoya and dry fruits',
  700,
  882,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-026',
  'tawakkul-restaurant-cat-007',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Gulab Jamun (3 Pcs)',
  'Soft milk-solid dumplings in rose syrup',
  700,
  882,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

INSERT INTO menu_items (id, category_id, merchant_id, tenant_id, name, description, base_price_cents, display_price_cents, is_available, is_vegetarian, is_signature, metadata)
VALUES (
  'tawakkul-restaurant-item-027',
  'tawakkul-restaurant-cat-007',
  'tawakkul-restaurant-merchant-001',
  'tawakkul-restaurant-chicago-2026',
  'Rabdi',
  'Thickened sweetened milk with cardamom and saffron',
  700,
  882,
  true,
  true,
  false,
  '{"is_tobacco_free":true,"is_catering":false}'::jsonb
) ON CONFLICT (id) DO UPDATE SET display_price_cents=EXCLUDED.display_price_cents, name=EXCLUDED.name;

COMMIT;

-- Price calculation reference for Tawakkul Restaurant:
-- Display Price = Base Price × 1.05 (processing) × 1.20 (PaySurity margin) = Base × 1.26
-- Margin is configurable via admin dashboard per tenant