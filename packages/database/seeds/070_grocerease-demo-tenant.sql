DO $$
DECLARE
    grocerease_tenant_id UUID;
    freshmart_store_id UUID;
    -- Category IDs
    produce_category_id UUID;
    dairy_category_id UUID;
    bakery_category_id UUID;
    meat_category_id UUID;
    frozen_category_id UUID;
    -- Supplier IDs
    supplier1_id UUID;
    supplier2_id UUID;
    supplier3_id UUID;
    supplier4_id UUID;
    supplier5_id UUID;
    -- Product IDs
    -- Produce (10)
    prod_apples_id UUID; prod_bananas_id UUID; prod_carrots_id UUID; prod_lettuce_id UUID; prod_oranges_id UUID;
    prod_avocados_id UUID; prod_strawberries_id UUID; prod_blueberries_id UUID; prod_bellpeppers_id UUID; prod_potatoes_id UUID;
    -- Dairy & Eggs (8)
    prod_milk_id UUID; prod_eggs_id UUID; prod_yogurt_id UUID; prod_cheddar_id UUID; prod_butter_id UUID;
    prod_sourcream_id UUID; prod_creamcheese_id UUID; prod_heavycream_id UUID;
    -- Bakery (7)
    prod_wwbread_id UUID; prod_sourdough_id UUID; prod_croissants_id UUID; prod_muffins_id UUID; prod_birthdaycake_id UUID;
    prod_ryebread_id UUID; prod_chocchipcookies_id UUID;
    -- Meat & Seafood (7)
    prod_chickenbreast_id UUID; prod_groundbeef_id UUID; prod_salmon_id UUID; prod_porkchops_id UUID; prod_sausages_id UUID;
    prod_steak_id UUID; prod_shrimp_id UUID;
    -- Frozen Foods (8)
    prod_frozenpeas_id UUID; prod_frozenpizza_id UUID; prod_icecream_id UUID; prod_frozenberries_id UUID; prod_fishsticks_id UUID;
    prod_waffles_id UUID; prod_frozendinners_id UUID; prod_frenchfries_id UUID;

BEGIN
    -- Insert GrocerEase Demo Tenant
    grocerease_tenant_id := gen_random_uuid();
    INSERT INTO tenants (id, name, slug, created_at, updated_at)
    VALUES (grocerease_tenant_id, 'GrocerEase Demo', 'grocerease-demo', NOW(), NOW());

    -- Insert Categories
    produce_category_id := gen_random_uuid();
    dairy_category_id := gen_random_uuid();
    bakery_category_id := gen_random_uuid();
    meat_category_id := gen_random_uuid();
    frozen_category_id := gen_random_uuid();

    INSERT INTO categories (id, tenant_id, name, description, created_at, updated_at) VALUES
    (produce_category_id, grocerease_tenant_id, 'Produce', 'Fresh fruits and vegetables', NOW(), NOW()),
    (dairy_category_id, grocerease_tenant_id, 'Dairy & Eggs', 'Milk, cheese, yogurt, and eggs', NOW(), NOW()),
    (bakery_category_id, grocerease_tenant_id, 'Bakery', 'Freshly baked bread, pastries, and cakes', NOW(), NOW()),
    (meat_category_id, grocerease_tenant_id, 'Meat & Seafood', 'Fresh cuts of meat and seafood', NOW(), NOW()),
    (frozen_category_id, grocerease_tenant_id, 'Frozen Foods', 'Frozen meals, vegetables, and desserts', NOW(), NOW());

    -- Insert Suppliers
    supplier1_id := gen_random_uuid();
    supplier2_id := gen_random_uuid();
    supplier3_id := gen_random_uuid();
    supplier4_id := gen_random_uuid();
    supplier5_id := gen_random_uuid();

    INSERT INTO suppliers (id, tenant_id, name, contact_name, contact_email, phone, address, created_at, updated_at) VALUES
    (supplier1_id, grocerease_tenant_id, 'Fresh Farms Produce', 'Anna Lee', 'anna.lee@freshfarms.com', '555-1001', '123 Farm Rd, Rural Town, CA', NOW(), NOW()),
    (supplier2_id, grocerease_tenant_id, 'Dairy Delights Co.', 'Ben Smith', 'ben.smith@dairydelights.com', '555-1002', '45 Dairy Ln, Creamville, WI', NOW(), NOW()),
    (supplier3_id, grocerease_tenant_id, 'Golden Grain Bakery', 'Carla Diaz', 'carla.diaz@goldengrain.com', '555-1003', '789 Wheat St, Bakerstown, NY', NOW(), NOW()),
    (supplier4_id, grocerease_tenant_id, 'Prime Cuts Meats', 'David Chen', 'david.chen@primecuts.com', '555-1004', '10 Butcher Way, Meatropolis, TX', NOW(), NOW()),
    (supplier5_id, grocerease_tenant_id, 'Arctic Foods Inc.', 'Emily White', 'emily.white@arcticfoods.com', '555-1005', '50 Freeze Blvd, Ice City, MN', NOW(), NOW());

    -- Insert Store
    freshmart_store_id := gen_random_uuid();
    INSERT INTO stores (id, tenant_id, name, address, phone, created_at, updated_at)
    VALUES (freshmart_store_id, grocerease_tenant_id, 'FreshMart', '101 Main St, Anytown, CA 90210', '555-2000', NOW(), NOW());

    -- Insert Products (40 products)
    -- Produce (10 products)
    prod_apples_id := gen_random_uuid();
    prod_bananas_id := gen_random_uuid();
    prod_carrots_id := gen_random_uuid();
    prod_lettuce_id := gen_random_uuid();
    prod_oranges_id := gen_random_uuid();
    prod_avocados_id := gen_random_uuid();
    prod_strawberries_id := gen_random_uuid();
    prod_blueberries_id := gen_random_uuid();
    prod_bellpeppers_id := gen_random_uuid();
    prod_potatoes_id := gen_random_uuid();

    INSERT INTO products (id, tenant_id, category_id, supplier_id, name, description, barcode_upc, cost_price, selling_price, stock_quantity, reorder_level, ebt_eligible, created_at, updated_at) VALUES
    (prod_apples_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Fuji Apples (per lb)', 'Crisp and sweet Fuji apples', '000000000001', 0.80, 1.49, 150, 20, TRUE, NOW(), NOW()),
    (prod_bananas_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Bananas (per lb)', 'Fresh ripe bananas', '000000000002', 0.40, 0.79, 200, 30, TRUE, NOW(), NOW()),
    (prod_carrots_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Organic Carrots 1lb Bag', 'Fresh organic carrots, 1lb bag', '000000000003', 1.20, 2.29, 80, 15, TRUE, NOW(), NOW()),
    (prod_lettuce_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Romaine Lettuce Head', 'Crisp romaine lettuce for salads', '000000000004', 1.00, 1.89, 8, 10, TRUE, NOW(), NOW()), -- Low stock
    (prod_oranges_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Navel Oranges (per lb)', 'Juicy navel oranges', '000000000005', 0.90, 1.69, 120, 25, TRUE, NOW(), NOW()),
    (prod_avocados_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Avocado', 'Ripe Hass avocado', '000000000006', 1.10, 2.00, 60, 10, TRUE, NOW(), NOW()),
    (prod_strawberries_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Strawberries 1lb', 'Sweet fresh strawberries', '000000000007', 2.50, 4.99, 5, 12, TRUE, NOW(), NOW()), -- Low stock
    (prod_blueberries_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Blueberries 6oz', 'Fresh blueberries, 6oz container', '000000000008', 2.00, 3.99, 40, 10, TRUE, NOW(), NOW()),
    (prod_bellpeppers_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Red Bell Pepper', 'Sweet red bell pepper', '000000000009', 1.00, 1.79, 70, 15, TRUE, NOW(), NOW()),
    (prod_potatoes_id, grocerease_tenant_id, produce_category_id, supplier1_id, 'Russet Potatoes 5lb Bag', 'Versatile russet potatoes, 5lb bag', '000000000010', 2.00, 3.49, 90, 20, TRUE, NOW(), NOW());

    -- Dairy & Eggs (8 products)
    prod_milk_id := gen_random_uuid();
    prod_eggs_id := gen_random_uuid();
    prod_yogurt_id := gen_random_uuid();
    prod_cheddar_id := gen_random_uuid();
    prod_butter_id := gen_random_uuid();
    prod_sourcream_id := gen_random_uuid();
    prod_creamcheese_id := gen_random_uuid();
    prod_heavycream_id := gen_random_uuid();

    INSERT INTO products (id, tenant_id, category_id, supplier_id, name, description, barcode_upc, cost_price, selling_price, stock_quantity, reorder_level, ebt_eligible, created_at, updated_at) VALUES
    (prod_milk_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Whole Milk Gallon', 'Fresh whole milk, 1 gallon', '000000000011', 2.50, 3.99, 70, 15, TRUE, NOW(), NOW()),
    (prod_eggs_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Large Eggs Dozen', 'Farm fresh large eggs, 1 dozen', '000000000012', 1.80, 2.99, 60, 10, TRUE, NOW(), NOW()),
    (prod_yogurt_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Greek Yogurt Plain 32oz', 'Plain Greek yogurt, 32oz tub', '000000000013', 3.00, 4.79, 40, 8, TRUE, NOW(), NOW()),
    (prod_cheddar_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Sharp Cheddar Cheese 8oz', 'Block of sharp cheddar cheese, 8oz', '000000000014', 2.80, 4.49, 35, 7, TRUE, NOW(), NOW()),
    (prod_butter_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Salted Butter 1lb', 'Creamy salted butter, 1lb sticks', '000000000015', 3.20, 5.29, 7, 10, TRUE, NOW(), NOW()), -- Low stock
    (prod_sourcream_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Sour Cream 16oz', 'Tangy sour cream, 16oz container', '000000000016', 1.50, 2.59, 30, 6, TRUE, NOW(), NOW()),
    (prod_creamcheese_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Cream Cheese 8oz', 'Classic cream cheese block, 8oz', '000000000017', 2.00, 3.29, 25, 5, TRUE, NOW(), NOW()),
    (prod_heavycream_id, grocerease_tenant_id, dairy_category_id, supplier2_id, 'Heavy Whipping Cream Pint', 'Heavy whipping cream, 1 pint', '000000000018', 2.20, 3.69, 20, 4, TRUE, NOW(), NOW());

    -- Bakery (7 products)
    prod_wwbread_id := gen_random_uuid();
    prod_sourdough_id := gen_random_uuid();
    prod_croissants_id := gen_random_uuid();
    prod_muffins_id := gen_random_uuid();
    prod_birthdaycake_id := gen_random_uuid();
    prod_ryebread_id := gen_random_uuid();
    prod_chocchipcookies_id := gen_random_uuid();

    INSERT INTO products (id, tenant_id, category_id, supplier_id, name, description, barcode_upc, cost_price, selling_price, stock_quantity, reorder_level, ebt_eligible, created_at, updated_at) VALUES
    (prod_wwbread_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Whole Wheat Bread Loaf', 'Freshly baked whole wheat bread', '000000000019', 2.00, 3.50, 50, 10, TRUE, NOW(), NOW()),
    (prod_sourdough_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Artisan Sourdough Loaf', 'Hand-crafted sourdough bread', '000000000020', 3.50, 5.99, 30, 7, TRUE, NOW(), NOW()),
    (prod_croissants_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Butter Croissants (4-pack)', 'Flaky butter croissants', '000000000021', 3.00, 5.50, 20, 5, FALSE, NOW(), NOW()),
    (prod_muffins_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Blueberry Muffins (6-pack)', 'Soft blueberry muffins', '000000000022', 2.80, 4.99, 4, 8, FALSE, NOW(), NOW()), -- Low stock
    (prod_birthdaycake_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Chocolate Birthday Cake 8in', 'Delicious 8-inch chocolate cake', '000000000023', 15.00, 24.99, 10, 2, FALSE, NOW(), NOW()),
    (prod_ryebread_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Marbled Rye Bread', 'Classic marbled rye bread loaf', '000000000024', 2.20, 3.89, 25, 5, TRUE, NOW(), NOW()),
    (prod_chocchipcookies_id, grocerease_tenant_id, bakery_category_id, supplier3_id, 'Chocolate Chip Cookies (Dozen)', 'Freshly baked chocolate chip cookies', '000000000025', 4.00, 6.99, 6, 10, FALSE, NOW(), NOW()); -- Low stock

    -- Meat & Seafood (7 products)
    prod_chickenbreast_id := gen_random_uuid();
    prod_groundbeef_id := gen_random_uuid();
    prod_salmon_id := gen_random_uuid();
    prod_porkchops_id := gen_random_uuid();
    prod_sausages_id := gen_random_uuid();
    prod_steak_id := gen_random_uuid();
    prod_shrimp_id := gen_random_uuid();

    INSERT INTO products (id, tenant_id, category_id, supplier_id, name, description, barcode_upc, cost_price, selling_price, stock_quantity, reorder_level, ebt_eligible, created_at, updated_at) VALUES
    (prod_chickenbreast_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Boneless Chicken Breast (per lb)', 'Fresh boneless, skinless chicken breast', '000000000026', 3.50, 5.99, 45, 10, TRUE, NOW(), NOW()),
    (prod_groundbeef_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Ground Beef 80/20 1lb', '80% lean ground beef, 1lb pack', '000000000027', 4.00, 6.49, 50, 12, TRUE, NOW(), NOW()),
    (prod_salmon_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Salmon Fillet (per lb)', 'Fresh Atlantic salmon fillet', '000000000028', 8.00, 14.99, 6, 8, TRUE, NOW(), NOW()), -- Low stock
    (prod_porkchops_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Bone-in Pork Chops (2-pack)', 'Two bone-in pork chops', '000000000029', 5.00, 8.99, 30, 7, TRUE, NOW(), NOW()),
    (prod_sausages_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Italian Sausages (5-pack)', 'Spicy Italian sausages, 5 count', '000000000030', 4.50, 7.50, 25, 5, TRUE, NOW(), NOW()),
    (prod_steak_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Ribeye Steak (per lb)', 'Premium ribeye steak', '000000000031', 10.00, 18.99, 15, 3, FALSE, NOW(), NOW()),
    (prod_shrimp_id, grocerease_tenant_id, meat_category_id, supplier4_id, 'Cooked Shrimp 16oz', 'Cooked and peeled shrimp, 16oz bag', '000000000032', 7.00, 12.99, 20, 4, FALSE, NOW(), NOW());

    -- Frozen Foods (8 products)
    prod_frozenpeas_id := gen_random_uuid();
    prod_frozenpizza_id := gen_random_uuid();
    prod_icecream_id := gen_random_uuid();
    prod_frozenberries_id := gen_random_uuid();
    prod_fishsticks_id := gen_random_uuid();
    prod_waffles_id := gen_random_uuid();
    prod_frozendinners_id := gen_random_uuid();
    prod_frenchfries_id := gen_random_uuid();

    INSERT INTO products (id, tenant_id, category_id, supplier_id, name, description, barcode_upc, cost_price, selling_price, stock_quantity, reorder_level, ebt_eligible, created_at, updated_at) VALUES
    (prod_frozenpeas_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Frozen Green Peas 16oz', 'Quick frozen green peas, 16oz bag', '000000000033', 1.00, 1.99, 60, 10, TRUE, NOW(), NOW()),
    (prod_frozenpizza_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Pepperoni Frozen Pizza', 'Classic pepperoni frozen pizza', '000000000034', 4.00, 6.99, 30, 8, TRUE, NOW(), NOW()),
    (prod_icecream_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Vanilla Bean Ice Cream Half Gallon', 'Rich vanilla bean ice cream', '000000000035', 3.50, 5.99, 20, 5, FALSE, NOW(), NOW()),
    (prod_frozenberries_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Mixed Berries Frozen 12oz', 'Frozen mixed berries for smoothies', '000000000036', 3.00, 5.49, 8, 10, TRUE, NOW(), NOW()), -- Low stock
    (prod_fishsticks_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Crispy Fish Sticks 10oz', 'Breaded fish sticks, 10oz box', '000000000037', 2.50, 4.29, 25, 7, TRUE, NOW(), NOW()),
    (prod_waffles_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Frozen Waffles (10 count)', 'Classic frozen waffles, 10 count box', '000000000038', 2.00, 3.79, 40, 8, TRUE, NOW(), NOW()),
    (prod_frozendinners_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Chicken Pot Pie Frozen Dinner', 'Hearty chicken pot pie frozen meal', '000000000039', 3.00, 4.99, 18, 5, TRUE, NOW(), NOW()),
    (prod_frenchfries_id, grocerease_tenant_id, frozen_category_id, supplier5_id, 'Crinkle Cut French Fries 2lb', 'Crispy crinkle cut french fries, 2lb bag', '000000000040', 2.20, 3.89, 35, 10, TRUE, NOW(), NOW());

END $$;