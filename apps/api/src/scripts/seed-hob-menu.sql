-- ══════════════════════════════════════════════════════════════════════════
-- HOUSE OF BIRYANI — HIGH-FIDELITY GRUBHUB SYNC (Updated from CSV)
-- ══════════════════════════════════════════════════════════════════════════

-- Clean up ALL existing menu items for HOB to ensure 100% fidelity with source
DELETE FROM microsite_menu_items WHERE tenant_id = 'houseofbiryanirestaurant';

-- ─── CORE MENU ITEMS (FROM CSV) ──────────────────────────────────────

-- Category: Chicken Main Course
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('17cddcb3-b339-457b-aaee-c2ee79792a4d', 'houseofbiryanirestaurant', 'Chicken Curry', '', 23.36, 23.36, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ft3u6bulfyfvjx5qaoyr', 'Chicken Main Course', 10, true),
  ('77673130-f0a2-487f-ac2e-e4ba069e7cf9', 'houseofbiryanirestaurant', 'Chicken Masala', '', 23.36, 23.36, NULL, 'Chicken Main Course', 11, true),
  ('8861eb15-1373-4277-888f-c83a002cd575', 'houseofbiryanirestaurant', 'Chicken Kadai', '', 23.36, 23.36, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/n2q4jhicvufoadxiiae4', 'Chicken Main Course', 12, true),
  ('b345bc38-598a-4051-86c5-0f340c1febd7', 'houseofbiryanirestaurant', 'Chicken Hyderabadi', '', 23.36, 23.36, NULL, 'Chicken Main Course', 13, true),
  ('2500d740-997c-4598-b1df-dc5cc1281de2', 'houseofbiryanirestaurant', 'Chicken Mughlai', '', 23.36, 23.36, NULL, 'Chicken Main Course', 14, true),
  ('bfffc082-c332-428d-8f0a-6db56bcd31ba', 'houseofbiryanirestaurant', 'Chicken Handi', '', 23.36, 23.36, NULL, 'Chicken Main Course', 15, true),
  ('ecd61616-9093-4538-8694-83b6bdb8ebef', 'houseofbiryanirestaurant', 'Chicken Achari', '', 23.36, 23.36, NULL, 'Chicken Main Course', 16, true),
  ('31f2948f-f2b3-4565-b482-553ff23eeb10', 'houseofbiryanirestaurant', 'Chicken Do Pyaza', '', 23.36, 23.36, NULL, 'Chicken Main Course', 17, true),
  ('2db82717-c85e-40bf-b1cd-a41255da66c8', 'houseofbiryanirestaurant', 'Chicken Palak', '', 23.36, 23.36, NULL, 'Chicken Main Course', 18, true),
  ('5570db56-c2f7-4116-b628-ba15628eea77', 'houseofbiryanirestaurant', 'Chicken Vindaloo', '', 23.36, 23.36, NULL, 'Chicken Main Course', 19, true),
  ('d1efac84-8398-43fe-a58e-591b3e617d40', 'houseofbiryanirestaurant', 'Chicken Rogan Josh', '', 23.36, 23.36, NULL, 'Chicken Main Course', 20, true),
  ('d0a28869-47df-46e8-bf12-3ae7c1b3da9b', 'houseofbiryanirestaurant', 'Chicken Jalfrezi', '', 23.36, 23.36, NULL, 'Chicken Main Course', 21, true),
  ('31305f27-27f0-4e70-973e-c10a83154f4d', 'houseofbiryanirestaurant', 'Chicken Tawa', '', 23.36, 23.36, NULL, 'Chicken Main Course', 22, true),
  ('4ce21fe9-a495-46de-aeca-0774edfa905d', 'houseofbiryanirestaurant', 'Chicken Bhuna', '', 23.36, 23.36, NULL, 'Chicken Main Course', 23, true),
  ('7a15b827-5de8-4ea2-afbd-ee0d4fca1321', 'houseofbiryanirestaurant', 'Chicken Korma', '', 23.36, 23.36, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/vepblkuzz4eoitqfvtck', 'Chicken Main Course', 24, true),
  ('811abad8-6021-43fe-9ee7-b9192d710982', 'houseofbiryanirestaurant', 'Chicken Tikka Masala', '', 25.03, 25.03, NULL, 'Chicken Main Course', 25, true),
  ('5db904e3-f5ae-42a9-a9e8-34c626848ecb', 'houseofbiryanirestaurant', 'Butter Chicken', '', 25.03, 25.03, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/khprwqzfgjpryprcjmxg', 'Chicken Main Course', 26, true),
  ('46d5c1be-1d9a-454e-9abb-f32fe53fe6c1', 'houseofbiryanirestaurant', 'Chicken Makhni', '', 25.03, 25.03, NULL, 'Chicken Main Course', 27, true),
  ('66cba711-c6c1-4027-8832-b42b1f4644c1', 'houseofbiryanirestaurant', 'Chicken Karahi', '', 25.03, 25.03, NULL, 'Chicken Main Course', 28, true),
  ('b9ad2cb2-44cb-4c65-8209-60334558c185', 'houseofbiryanirestaurant', 'Chicken Haleem', '', 25.03, 25.03, NULL, 'Chicken Main Course', 29, true);

-- Category: Mutton Main Course
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('c4e705d0-098c-4fd6-8f60-ffc079e5caca', 'houseofbiryanirestaurant', 'Mutton Curry', '', 30.04, 30.04, NULL, 'Mutton Main Course', 30, true),
  ('de5694e2-a1ea-4224-a8ba-6d7f1b37e711', 'houseofbiryanirestaurant', 'Mutton Masala', '', 30.04, 30.04, NULL, 'Mutton Main Course', 31, true),
  ('c2372227-68a2-4fff-8377-82c9247c3ac2', 'houseofbiryanirestaurant', 'Mutton Kadai', '', 30.04, 30.04, NULL, 'Mutton Main Course', 32, true),
  ('51c94b45-47a0-4621-a33f-d6c0d6abc9e9', 'houseofbiryanirestaurant', 'Mutton Hyderabadi', '', 30.04, 30.04, NULL, 'Mutton Main Course', 33, true),
  ('c5d9b763-5381-471e-8821-e29cfb6fe141', 'houseofbiryanirestaurant', 'Mutton Mughlai', '', 30.04, 30.04, NULL, 'Mutton Main Course', 34, true),
  ('78dc7d8a-7026-451c-a923-37ed447cb3a6', 'houseofbiryanirestaurant', 'Mutton Handi', '', 30.04, 30.04, NULL, 'Mutton Main Course', 35, true),
  ('cddfa364-108f-4730-a37b-e9512e600ab5', 'houseofbiryanirestaurant', 'Mutton Achari', '', 30.04, 30.04, NULL, 'Mutton Main Course', 36, true),
  ('6a11f0c8-6d7d-4ede-8de2-a0adaa28282a', 'houseofbiryanirestaurant', 'Mutton Do Pyaza', '', 30.04, 30.04, NULL, 'Mutton Main Course', 37, true),
  ('dc24ab47-2e2e-4994-9dac-3e1429edb02f', 'houseofbiryanirestaurant', 'Mutton Palak', '', 30.04, 30.04, NULL, 'Mutton Main Course', 38, true),
  ('3c2a167d-d942-40a8-b8c9-71234e964b31', 'houseofbiryanirestaurant', 'Mutton Vindaloo', '', 30.04, 30.04, NULL, 'Mutton Main Course', 39, true),
  ('128579cd-9944-4d37-97ae-618e97c7b518', 'houseofbiryanirestaurant', 'Mutton Rogan Josh', '', 30.04, 30.04, NULL, 'Mutton Main Course', 40, true),
  ('d2d7eff9-2267-4369-b413-4d8b6051a2c4', 'houseofbiryanirestaurant', 'Mutton Jalfrezi', '', 30.04, 30.04, NULL, 'Mutton Main Course', 41, true),
  ('5a26f65a-e883-467e-9786-256d2728af43', 'houseofbiryanirestaurant', 'Mutton Tawa', '', 30.04, 30.04, NULL, 'Mutton Main Course', 42, true),
  ('05523eb9-1978-4bd0-b2d8-7e466d868880', 'houseofbiryanirestaurant', 'Mutton Bhuna', '', 30.04, 30.04, NULL, 'Mutton Main Course', 43, true),
  ('36ca5621-c0b2-42c0-bdb6-e736c525d3f1', 'houseofbiryanirestaurant', 'Mutton Korma', '', 30.04, 30.04, NULL, 'Mutton Main Course', 44, true);

-- Category: Grilled Dishes
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('89e68df0-55b8-40ff-a659-3c35e52c0af2', 'houseofbiryanirestaurant', 'Chicken Tikka', '1/2 chicken cut in pieces marinated in spices cooked in tandoor', 26.7, 26.7, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/vepblkuzz4eoitqfvtck', 'Grilled Dishes', 45, true),
  ('f5e53fe6-8d8e-4c61-919a-42a7e6575341', 'houseofbiryanirestaurant', 'Mutton Seekh Kabab', '', 30.04, 30.04, NULL, 'Grilled Dishes', 46, true);

-- Category: Biryani and Rice
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('2adbaf4d-cad1-4728-a2f9-b37f49d0e1f2', 'houseofbiryanirestaurant', 'Chicken Dum Biryani', 'Basmati rice cooked with chicken and spices.', 28.37, 28.37, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/mtojvbp03ipxbi7zq2tr', 'Biryani and Rice', 47, true),
  ('3b549083-3ab8-4390-892d-52a38587458c', 'houseofbiryanirestaurant', 'Mutton Biryani', 'Basmati rice cooked with goat meat with home spices.', 33.4, 33.4, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq', 'Biryani and Rice', 48, true),
  ('94fc6087-9de0-479d-a572-669a4ed9802b', 'houseofbiryanirestaurant', 'Plain Basmati Rice', '', 8.33, 8.33, NULL, 'Biryani and Rice', 49, true),
  ('4ee16996-60a1-4d65-8175-8a5e27fb5369', 'houseofbiryanirestaurant', 'Jeera Rice', 'Rice with cumin seeds', 11.67, 11.67, NULL, 'Biryani and Rice', 50, true),
  ('63d409d2-8f4d-433f-aa58-8554ec25cd53', 'houseofbiryanirestaurant', 'Chicken Boneless Biryani', '', 33.4, 33.4, NULL, 'Biryani and Rice', 51, true),
  ('128fbf01-3c5d-4b5d-9239-18d6b9053103', 'houseofbiryanirestaurant', 'Veg Dum Biryani', '', 25.03, 25.03, NULL, 'Biryani and Rice', 52, true);

-- Category: Bread, Naan & Roti
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('74112abc-7b5f-4a4d-873d-59a4f4a4aa1e', 'houseofbiryanirestaurant', 'Plain Naan', '', 3.34, 3.34, NULL, 'Bread, Naan & Roti', 53, true),
  ('ad259a6c-8b4f-49fe-9f09-2d32ffce2b92', 'houseofbiryanirestaurant', 'Butter Naan', '', 4.17, 4.17, NULL, 'Bread, Naan & Roti', 54, true),
  ('c19b688d-adf4-4de3-bc81-4b61ce025fd3', 'houseofbiryanirestaurant', 'Garlic Naan', '', 5.01, 5.01, NULL, 'Bread, Naan & Roti', 55, true);

-- Category: Drinks
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('e5c4d5c2-02b3-4e6f-8728-65e0228f3d10', 'houseofbiryanirestaurant', '12 oz. Canned Soda', 'Choice of flavor.', 4.48, 4.48, NULL, 'Drinks', 56, true),
  ('bfb42e59-ceff-408c-9968-929254297a69', 'houseofbiryanirestaurant', 'Bottled Water', '', 1.67, 1.67, NULL, 'Drinks', 57, true),
  ('8eaad258-499f-4078-bf14-ada910857091', 'houseofbiryanirestaurant', 'Mango Lassi', '', 10, 10, NULL, 'Drinks', 58, true),
  ('b4d04c35-db41-46a5-8d80-b86dc293fa67', 'houseofbiryanirestaurant', 'Tea / Chai', '', 3.34, 3.34, NULL, 'Drinks', 59, true);

-- Category: Chicken Entrée
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('ec81fead-d0f6-45f3-9825-1e8284649072', 'houseofbiryanirestaurant', 'Chicken 65', 'Spicy fried chicken.', 23.36, 23.36, 'https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/wkku9gbblkudjjkmddpa', 'Chicken Entrée', 60, true),
  ('c4172a3e-36c1-40a4-b2a4-ad1c21dc1818', 'houseofbiryanirestaurant', 'Chicken Manchurian', 'Deep fried with spicy sauce.', 23.36, 23.36, NULL, 'Chicken Entrée', 61, true),
  ('e87007bc-bb3a-4b50-adce-a78e2039ee60', 'houseofbiryanirestaurant', 'Chilli Chicken', '', 23.36, 23.36, NULL, 'Chicken Entrée', 62, true),
  ('49236549-7db9-4210-8e5b-d65c06f1864d', 'houseofbiryanirestaurant', 'Ginger Chicken', '', 23.36, 23.36, NULL, 'Chicken Entrée', 63, true),
  ('553519b4-4e5b-423d-98e3-ee3e31ad80cb', 'houseofbiryanirestaurant', 'Chilli Garlic Chicken', '', 23.36, 23.36, NULL, 'Chicken Entrée', 64, true);

-- Category: Fish Entrée
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('3dace4bc-6301-40b8-b05e-85b8b48b1836', 'houseofbiryanirestaurant', 'Chilli Fish', '', 26.7, 26.7, NULL, 'Fish Entrée', 65, true),
  ('73d049a6-d69b-431c-9df8-df8a924ab7ab', 'houseofbiryanirestaurant', 'Fish Fry', '', 26.7, 26.7, NULL, 'Fish Entrée', 66, true);

-- Category: Chinese Fried Rice
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('8f1356fb-ea04-4164-a2dd-9d042a83d3ab', 'houseofbiryanirestaurant', 'Chicken Fried Rice', '', 28.37, 28.37, NULL, 'Chinese Fried Rice', 67, true),
  ('9fda88f0-18a7-44bd-966f-14829e8c5e8b', 'houseofbiryanirestaurant', 'Veg Fried Rice', '', 26.7, 26.7, NULL, 'Chinese Fried Rice', 68, true),
  ('14e922dc-67b4-4ec5-9d04-c9c168d476d7', 'houseofbiryanirestaurant', 'Shrimp Fried Rice', '', 31.71, 31.71, NULL, 'Chinese Fried Rice', 69, true),
  ('69fcdb7c-a2af-445c-a312-124a83016679', 'houseofbiryanirestaurant', 'Chicken Fried Rice (with Egg)', 'We add 3 eggs', 41.75, 41.75, NULL, 'Chinese Fried Rice', 70, true),
  ('d8815388-badd-4310-af05-99fce6824f27', 'houseofbiryanirestaurant', 'Egg Fried Rice', 'We add 3 eggs', 33.38, 33.38, NULL, 'Chinese Fried Rice', 71, true);

-- Category: Chinese Noodles
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('a9c12377-1c19-4cdb-9e75-8f938d2c5a5b', 'houseofbiryanirestaurant', 'Chicken Noodles', '', 28.37, 28.37, NULL, 'Chinese Noodles', 72, true),
  ('8afe9a53-8c91-4741-8126-1e458788a0d9', 'houseofbiryanirestaurant', 'Veg Noodles', '', 26.7, 26.7, NULL, 'Chinese Noodles', 73, true),
  ('81f1c58b-7b18-4140-9090-f9076f27033e', 'houseofbiryanirestaurant', 'Shrimp Noodles', '', 31.71, 31.71, NULL, 'Chinese Noodles', 74, true),
  ('eeaa3d48-5ab3-4db8-9087-6359fc0064e7', 'houseofbiryanirestaurant', 'Chicken Noodles (with Egg)', 'We add 3 eggs', 41.75, 41.75, NULL, 'Chinese Noodles', 75, true),
  ('47a94c1c-e683-41db-b634-cb1b0818761c', 'houseofbiryanirestaurant', 'Egg Noodles', 'We add 3 eggs', 33.38, 33.38, NULL, 'Chinese Noodles', 76, true);

-- Category: Vegetarian
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('27aaf537-2a0e-4f1a-9fef-58985cb9f04d', 'houseofbiryanirestaurant', 'Daal Fry', '', 11.67, 11.67, NULL, 'Vegetarian', 77, true),
  ('ba058dfc-9c47-4738-9d34-6bb508be9bda', 'houseofbiryanirestaurant', 'Mix Veg Curry', '', 16.68, 16.68, NULL, 'Vegetarian', 78, true),
  ('8652bba1-6bd9-42cd-a8ab-fa1a9c93ca7e', 'houseofbiryanirestaurant', 'Paneer Tikka Masala', '', 25.03, 25.03, NULL, 'Vegetarian', 79, true),
  ('d7c127f9-fc53-4776-b161-af072a675cc5', 'houseofbiryanirestaurant', 'Paneer Makhni (Butter)', '', 25.03, 25.03, NULL, 'Vegetarian', 80, true);

-- Category: Special Item Every Week
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('09a02480-facb-4fd6-b61d-3e780160ea9e', 'houseofbiryanirestaurant', 'Mutton Mandi (Available only on Tuesday)', '6.00 P.M. to 12.00 A.M.', 33.38, 33.38, NULL, 'Special Item Every Week', 81, true),
  ('73cddb88-3f64-4460-a18b-71313ff54ae3', 'houseofbiryanirestaurant', 'Chicken Mandi (Available only on Wednesday)', '6.00 P.M. to 12.00 A.M.', 30.04, 30.04, NULL, 'Special Item Every Week', 82, true);

-- Category: Sweet
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('7dd13900-30f9-4de4-8cba-6d702df0116e', 'houseofbiryanirestaurant', 'Double ka Meetha', '', 10.02, 10.02, NULL, 'Sweet', 83, true),
  ('c1d3b3bd-2d66-492b-9920-b8cb268def1e', 'houseofbiryanirestaurant', 'Kaddu Kheer', '', 10.02, 10.02, NULL, 'Sweet', 84, true),
  ('3b7fa3f7-0ed3-4620-af32-c7855e27960b', 'houseofbiryanirestaurant', 'Gulab Jamun', '', 10.02, 10.02, NULL, 'Sweet', 85, true);

-- Category: House of Biryani Special
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('925979d6-1deb-4c3f-a2a0-32262ffeee28', 'houseofbiryanirestaurant', 'Goat Haleem', '', 21.69, 21.69, NULL, 'House of Biryani Special', 86, true);

-- ─── MERCHANT-SPECIFIC CONTENT (NOT ON GRUBHUB) ───────────────────────────

-- Paan Menu
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('bb000001-0000-0000-0000-000000000001', 'houseofbiryanirestaurant', 'Sweet Meetha Paan', 'Traditional sweet betel leaf with gulkand, fennel, and dates.', 2.75, 2.75, 'https://i0.wp.com/www.bharatzkitchen.com/wp-content/uploads/2021/04/Meetha-Paan.jpg', 'Paan Menu', 200, true),
  ('bb000001-0000-0000-0000-000000000002', 'houseofbiryanirestaurant', 'Chocolate Paan', 'Meetha paan coated in rich dark chocolate.', 2.75, 2.75, 'https://www.cookwithmanali.com/wp-content/uploads/2016/10/Chocolate-Paan.jpg', 'Paan Menu', 201, true),
  ('bb000001-0000-0000-0000-000000000003', 'houseofbiryanirestaurant', 'Fire Paan (Live)', 'A flaming betel leaf experience.', 2.99, 2.99, 'https://i.ytimg.com/vi/9lVoQukJ4tY/maxresdefault.jpg', 'Paan Menu', 202, true),
  ('bb000001-0000-0000-0000-000000000004', 'houseofbiryanirestaurant', 'Premium Magai Paan', 'Premium delicate Magai leaf.', 6.49, 6.49, 'https://images.slurrp.com/prod/recipe_images/better-butter/meetha-paan_1603525206.webp', 'Paan Menu', 203, true),
  ('bb000001-0000-0000-0000-000000000005', 'houseofbiryanirestaurant', 'Classic Sada Paan', 'Traditional plain betel leaf.', 3.99, 3.99, 'https://4.bp.blogspot.com/-pM8_w4n5_VQ/W1_m8U_6_0I/AAAAAAAAB_M/pM8_w4n5_VQ/s1600/sada-paan.jpg', 'Paan Menu', 204, true),
  ('bb000001-0000-0000-0000-000000000006', 'houseofbiryanirestaurant', 'Baba 120 (Tobacco Paan)', 'Tobacco paan — Baba 120.', 2.00, 2.00, 'https://choice-paan.com/wp-content/uploads/2021/04/baba-120.jpg', 'Paan Menu', 205, true),
  ('bb000001-0000-0000-0000-000000000007', 'houseofbiryanirestaurant', 'Baba 160 (Tobacco Paan)', 'Tobacco paan — Baba 160.', 2.00, 2.00, 'https://choice-paan.com/wp-content/uploads/2021/04/baba-160.jpg', 'Paan Menu', 206, true),
  ('bb000001-0000-0000-0000-000000000008', 'houseofbiryanirestaurant', 'Baba 300 (Tobacco Paan)', 'Tobacco paan — Baba 300.', 2.00, 2.00, 'https://choice-paan.com/wp-content/uploads/2021/04/baba-300.jpg', 'Paan Menu', 207, true),
  ('bb000001-0000-0000-0000-000000000009', 'houseofbiryanirestaurant', 'Sada Khusboo', 'Khusboo Paan.', 2.50, 2.50, NULL, 'Paan Menu', 208, true),
  ('bb000001-0000-0000-0000-000000000010', 'houseofbiryanirestaurant', 'Ram Piyari', 'Ram Piyari Paan.', 2.50, 2.50, NULL, 'Paan Menu', 209, true),
  ('bb000001-0000-0000-0000-000000000011', 'houseofbiryanirestaurant', 'Minakshi', 'Minakshi Paan.', 2.50, 2.50, NULL, 'Paan Menu', 210, true);

-- Catering
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('bc000001-0000-0000-0000-000000000001', 'houseofbiryanirestaurant', 'Mutton Full Tray', 'Full catering tray of halal mutton (~20-25 guests).', 180.00, 180.00, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', 'Catering', 300, true),
  ('bc000001-0000-0000-0000-000000000002', 'houseofbiryanirestaurant', 'Mutton Half Tray', 'Half catering tray of halal mutton.', 100.00, 100.00, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', 'Catering', 301, true),
  ('bc000001-0000-0000-0000-000000000003', 'houseofbiryanirestaurant', 'Chicken Full Tray', 'Full catering tray of halal chicken (~20-25 guests).', 125.00, 125.00, 'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=800&q=80', 'Catering', 302, true),
  ('bc000001-0000-0000-0000-000000000004', 'houseofbiryanirestaurant', 'Chicken Half Tray', 'Half catering tray of halal chicken.', 72.50, 72.50, 'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=800&q=80', 'Catering', 303, true);
