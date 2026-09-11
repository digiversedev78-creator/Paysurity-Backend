DO $$
DECLARE
    tawakkul_tenant_id UUID;
    tawakkul_microsite_id UUID;
    
    category_appetizers_id UUID;
    category_main_courses_id UUID;
    category_shawarma_wraps_id UUID; -- New category for Shawarma
    category_desserts_id UUID;
    category_drinks_id UUID;
    category_catering_id UUID; -- New category for Catering Platters
BEGIN
    -- 1. Insert Tawakkul Restaurant tenant
    INSERT INTO tenants (id, name, slug)
    VALUES (gen_random_uuid(), 'Tawakkul Restaurant', 'tawakkul-restaurant')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO tawakkul_tenant_id;

    -- 2. Insert Tawakkul Restaurant microsite settings
    INSERT INTO microsites (id, tenant_id, slug, name, settings)
    VALUES (
        gen_random_uuid(),
        tawakkul_tenant_id,
        'tawakkul-restaurant',
        'Tawakkul Restaurant Online Menu',
        '{"theme": "middle_eastern_gold", "currency": "USD", "language": "en", "contact_email": "info@tawakkul.com", "hero_image": "https://example.com/images/tawakkul_hero.jpg", "about_us": "Experience authentic Middle Eastern cuisine at Tawakkul Restaurant, where tradition meets taste. Our dishes are prepared with the freshest ingredients and authentic recipes passed down through generations.", "phone_number": "+1-555-TAWAKKUL"}'::jsonb
    )
    ON CONFLICT (slug) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        name = EXCLUDED.name,
        settings = EXCLUDED.settings
    RETURNING id INTO tawakkul_microsite_id;

    -- 3. Insert Menu Categories for Tawakkul Restaurant (idempotent insert/update)
    -- Assumes a unique constraint on (tenant_id, name) for menu_categories table.
    INSERT INTO menu_categories (id, tenant_id, name, display_order)
    VALUES (gen_random_uuid(), tawakkul_tenant_id, 'Appetizers', 1)
    ON CONFLICT (tenant_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO category_appetizers_id;

    INSERT INTO menu_categories (id, tenant_id, name, display_order)
    VALUES (gen_random_uuid(), tawakkul_tenant_id, 'Main Courses', 2)
    ON CONFLICT (tenant_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO category_main_courses_id;

    INSERT INTO menu_categories (id, tenant_id, name, display_order)
    VALUES (gen_random_uuid(), tawakkul_tenant_id, 'Shawarma & Wraps', 3)
    ON CONFLICT (tenant_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO category_shawarma_wraps_id;

    INSERT INTO menu_categories (id, tenant_id, name, display_order)
    VALUES (gen_random_uuid(), tawakkul_tenant_id, 'Desserts', 4)
    ON CONFLICT (tenant_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO category_desserts_id;

    INSERT INTO menu_categories (id, tenant_id, name, display_order)
    VALUES (gen_random_uuid(), tawakkul_tenant_id, 'Drinks', 5)
    ON CONFLICT (tenant_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO category_drinks_id;

    INSERT INTO menu_categories (id, tenant_id, name, display_order)
    VALUES (gen_random_uuid(), tawakkul_tenant_id, 'Catering Platters', 6)
    ON CONFLICT (tenant_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO category_catering_id;

    -- 4. Insert Menu Items for Tawakkul Restaurant (idempotent insert/update)
    -- Appetizers (5 items)
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_appetizers_id, 'Hummus with Pita', 'Creamy chickpea dip blended with tahini, lemon juice, and garlic, served with warm pita bread.', 7.99, TRUE, 'https://pay-surity.com/images/tawakkul/hummus.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_appetizers_id, 'Baba Ghanoush', 'Smoky roasted eggplant dip blended with tahini, lemon juice, and olive oil, served with pita bread.', 8.49, TRUE, 'https://pay-surity.com/images/tawakkul/babaghanoush.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_appetizers_id, 'Falafel Plate', 'Crispy fried chickpea patties, seasoned with herbs and spices, served with tahini sauce, pickles, and pita bread.', 9.99, TRUE, 'https://pay-surity.com/images/tawakkul/falafel_plate.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_appetizers_id, 'Tabbouleh Salad', 'Finely chopped parsley, tomatoes, mint, onion, and bulgur, dressed with olive oil and lemon juice.', 8.99, TRUE, 'https://pay-surity.com/images/tawakkul/tabbouleh.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_appetizers_id, 'Fattoush Salad', 'Mixed greens, tomatoes, cucumbers, radishes, bell peppers, topped with toasted pita bread and sumac dressing.', 9.49, TRUE, 'https://pay-surity.com/images/tawakkul/fattoush.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    -- Main Courses (6 items)
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_main_courses_id, 'Shish Tawook Kebab', 'Grilled marinated chicken cubes, served with garlic sauce, rice, and grilled vegetables.', 17.99, TRUE, 'https://pay-surity.com/images/tawakkul/shishtawook.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_main_courses_id, 'Kofta Kebab', 'Seasoned ground lamb and beef skewers, grilled to perfection, served with rice and grilled vegetables.', 18.99, TRUE, 'https://pay-surity.com/images/tawakkul/koftakebab.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_main_courses_id, 'Lamb Shish Kebab', 'Tender lamb cubes marinated and grilled, served with rice and grilled vegetables.', 21.99, TRUE, 'https://pay-surity.com/images/tawakkul/lambshishkebab.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_main_courses_id, 'Mixed Grill Platter', 'A generous platter featuring shish tawook, kofta, and lamb shish kebabs, served with rice and grilled vegetables.', 28.99, TRUE, 'https://pay-surity.com/images/tawakkul/mixedgrill.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;
    
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_main_courses_id, 'Mandi Lamb', 'Slow-cooked spiced lamb served over aromatic basmati rice with toasted nuts and raisins, a Yemeni specialty.', 24.99, TRUE, 'https://pay-surity.com/images/tawakkul/mandilamb.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_main_courses_id, 'Chicken Biryani', 'Fragrant basmati rice cooked with tender chicken pieces, aromatic spices, and herbs, a classic Indian-Middle Eastern fusion.', 19.99, TRUE, 'https://pay-surity.com/images/tawakkul/chickenbiryani.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    -- Shawarma & Wraps (4 items)
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_shawarma_wraps_id, 'Chicken Shawarma Wrap', 'Grilled marinated chicken, garlic sauce, pickles, and fries wrapped in warm pita bread.', 12.99, TRUE, 'https://pay-surity.com/images/tawakkul/chickenshawarmawrap.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_shawarma_wraps_id, 'Beef Shawarma Wrap', 'Seasoned beef slices, tahini sauce, tomatoes, onions, and pickles wrapped in warm pita bread.', 13.99, TRUE, 'https://pay-surity.com/images/tawakkul/beefshawarmawrap.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_shawarma_wraps_id, 'Falafel Wrap', 'Crispy falafel, hummus, lettuce, tomatoes, and tahini sauce wrapped in warm pita bread.', 10.99, TRUE, 'https://pay-surity.com/images/tawakkul/falafelwrap.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_shawarma_wraps_id, 'Shawarma Platter (Mixed)', 'A generous serving of chicken and beef shawarma, served with rice, hummus, and pita bread.', 20.99, TRUE, 'https://pay-surity.com/images/tawakkul/shawarmaplatter.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    -- Desserts (3 items)
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_desserts_id, 'Baklava (Pistachio)', 'Layers of flaky phyllo pastry, finely ground pistachios, baked to golden perfection and drenched in sweet syrup.', 6.99, TRUE, 'https://pay-surity.com/images/tawakkul/baklava.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_desserts_id, 'Knafeh Nabulsiyeh', 'Sweet cheese pastry soaked in sugar syrup, topped with crushed pistachios, served warm (prepared fresh).', 8.99, TRUE, 'https://pay-surity.com/images/tawakkul/knafeh.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;
    
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_desserts_id, 'Umm Ali', 'Egyptian bread pudding made with puff pastry, milk, nuts, and raisins, baked to golden perfection, served warm.', 7.49, TRUE, 'https://pay-surity.com/images/tawakkul/ummali.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    -- Drinks (5 items)
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_drinks_id, 'Ayran (Yogurt Drink)', 'Traditional Middle Eastern savory yogurt drink, refreshing and cooling.', 3.99, TRUE, 'https://pay-surity.com/images/tawakkul/ayran.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_drinks_id, 'Mint Lemonade', 'Freshly squeezed lemonade infused with refreshing mint leaves.', 4.49, TRUE, 'https://pay-surity.com/images/tawakkul/mintlemonade.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_drinks_id, 'Turkish Coffee', 'Strong, rich, and aromatic Turkish coffee, prepared traditionally and served in a demitasse cup.', 4.99, TRUE, 'https://pay-surity.com/images/tawakkul/turkishcoffee.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_drinks_id, 'Hibiscus Iced Tea', 'Sweet and tangy iced tea made from dried hibiscus flowers, a refreshing Middle Eastern favorite.', 3.99, TRUE, 'https://pay-surity.com/images/tawakkul/hibiscustea.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_drinks_id, 'Bottled Water', 'Premium bottled still water.', 2.50, TRUE, 'https://pay-surity.com/images/tawakkul/water.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    -- Catering Platters (2 items)
    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_catering_id, 'Large Mezze Platter (Serves 8-10)', 'A grand assortment of hummus, baba ghanoush, tabbouleh, fattoush, falafel, and a generous supply of pita bread.', 59.99, TRUE, 'https://pay-surity.com/images/tawakkul/largemezzeplatter.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    INSERT INTO menu_items (id, tenant_id, category_id, name, description, price, is_available, image_url) VALUES
    (gen_random_uuid(), tawakkul_tenant_id, category_catering_id, 'Family Kebab Feast (Serves 6-8)', 'An impressive selection of Shish Tawook, Kofta, and Lamb Shish Kebabs, served with large portions of aromatic rice, grilled vegetables, and various sauces.', 99.99, TRUE, 'https://pay-surity.com/images/tawakkul/familykebabfeast.jpg')
    ON CONFLICT (tenant_id, name) DO UPDATE SET
        category_id = EXCLUDED.category_id, description = EXCLUDED.description, price = EXCLUDED.price, is_available = EXCLUDED.is_available, image_url = EXCLUDED.image_url;

    -- Update microsite settings to include catering information
    -- This adds a 'catering_info' object to the existing JSONB settings for the microsite.
    UPDATE microsites
    SET settings = JSONB_SET(
        settings,
        '{catering_info}',
        '{"enabled": true, "email": "catering@tawakkul.com", "phone": "+1-555-CATER", "details_page_slug": "/catering", "menu_category_id": "' || category_catering_id || '"}'::jsonb,
        true -- create_missing
    )
    WHERE slug = 'tawakkul-restaurant' AND tenant_id = tawakkul_tenant_id;

END $$;