const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const menuData = [
  // PART 1 (from Scrape 1)
  {
    "category": "Chicken main course",
    "items": [
      { "name": "Chicken Kadai", "price": "25.03", "description": "Chicken pieces cut with tomato ginger, garlic, and spices.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/n2q4jhicvufoadxiiae4" },
      { "name": "Chicken Korma", "price": "25.03", "description": "Chicken pieces cooked with yogurt ginger, garlic, and spices.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/vepblkuzz4eoitqfvtck" },
      { "name": "Chicken curry", "price": "25.03", "description": "Chicken pieces cooked with yogurt onion, and spices.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ft3u6bulfyfvjx5qaoyr" },
      { "name": "Chicken kohlapuri", "price": "26.69", "description": "Chicken pieces cooked with spices.", "imageUrl": null },
      { "name": "butter chicken", "price": "25.03", "description": "boneless chicken made with butter and creamy sauce", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/khprwqzfgjpryprcjmxg" },
      { "name": "chicken tikka masala", "price": "25.03", "description": "Marinated and spiced chicken in curry.", "imageUrl": null },
      { "name": "jafrani murg masala", "price": "26.69", "description": "Saffron-infused chicken in a fragrant masala gravy.", "imageUrl": null }
    ]
  },
  {
    "category": "mutton main course (goat)",
    "items": [
      { "name": "mutton karahi", "price": "28.37", "description": "Mutton pieces cooked with ginger, garlic, tomato, salt, onion, and green pepper.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/xss1offiifhbvckfgoxn" },
      { "name": "mutton qorma", "price": "28.37", "description": "Goat meat cooked in a rich, spiced gravy.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ybjicw4c1xu8vpyfbwo1" },
      { "name": "kali mirch mutton", "price": "28.37", "description": "Sheep meat cooked with black pepper.", "imageUrl": null },
      { "name": "mutton curry", "price": "28.37", "description": "Goat meat in a spiced curry sauce.", "imageUrl": null },
      { "name": "mutton kohlapuri", "price": "30.04", "description": "Spicy goat meat in Kohlapuri masala.", "imageUrl": null },
      { "name": "mutton rogam josh", "price": "30.04", "description": "Aromatic goat curry.", "imageUrl": null },
      { "name": "tala hua gosh (mutton fry)", "price": "33.40", "description": "Spicy pan-fried goat meat.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/fuaxsd3taxbzisjvzbfs" },
      { "name": "mutton chettinad", "price": "28.37", "description": "South Indian style goat curry.", "imageUrl": null }
    ]
  },
  {
    "category": "Grilled Dishes",
    "items": [
      { "name": "Chicken Tikka", "price": "26.70", "description": "1/2 chicken cut in pieces marinated in spices", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/vepblkuzz4eoitqfvtck" },
      { "name": "mutton seekh kabab", "price": "30.04", "description": "Spiced ground mutton on skewers.", "imageUrl": null }
    ]
  },
  {
    "category": "Biryani and Rice",
    "items": [
      { "name": "Chicken dum Biryani", "price": "28.37", "description": "Basmati rice cooked with chicken and spices.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/mtojvbp03ipxbi7zq2tr" },
      { "name": "Mutton Biryani", "price": "33.40", "description": "Basmati rice cooked with goat meat", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq" },
      { "name": "Plain Basmati Rice", "price": "8.33", "description": "", "imageUrl": null },
      { "name": "jeera rice", "price": "11.67", "description": "rice with cumin seeds", "imageUrl": null },
      { "name": "chicken boneless biryani", "price": "33.40", "description": "Boneless chicken in aromatic basmati rice.", "imageUrl": null },
      { "name": "veg dum biryani", "price": "25.03", "description": "Vegetables cooked with basmati rice.", "imageUrl": null }
    ]
  },
  // PART 2 (from Scrape 2)
  {
    "category": "Bread, Naan & Roti",
    "items": [
      { "name": "plain naan", "price": "3.34", "description": "", "imageUrl": null },
      { "name": "butter naan", "price": "4.17", "description": "", "imageUrl": null },
      { "name": "garlic naan", "price": "5.01", "description": "", "imageUrl": null }
    ]
  },
  {
    "category": "Drinks",
    "items": [
      { "name": "12 oz. Canned Soda", "price": "4.48", "description": "Choice of flavor.", "imageUrl": null },
      { "name": "Bottled Water", "price": "1.67", "description": "", "imageUrl": null },
      { "name": "Mango lassi", "price": "10.00", "description": "", "imageUrl": null },
      { "name": "tea/ chai", "price": "3.34", "description": "", "imageUrl": null }
    ]
  },
  {
    "category": "Chicken entree",
    "items": [
      { "name": "Chicken 65", "price": "23.36", "description": "Spicy fried chicken.", "imageUrl": "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/wkku9gbblkudjjkmddpa" },
      { "name": "Chicken manchurian", "price": "23.36", "description": "Deep fried with spicy sauce.", "imageUrl": null },
      { "name": "Chilli chicken", "price": "23.36", "description": "", "imageUrl": null },
      { "name": "Ginger chicken", "price": "23.36", "description": "", "imageUrl": null },
      { "name": "chilli garlic chicken", "price": "23.36", "description": "", "imageUrl": null }
    ]
  },
  {
    "category": "fish entree",
    "items": [
      { "name": "chilli fish", "price": "26.70", "description": "", "imageUrl": null },
      { "name": "Fish fry", "price": "26.70", "description": "", "imageUrl": null }
    ]
  },
  {
    "category": "chinese fried rice",
    "items": [
      { "name": "chicken fried rice", "price": "28.37", "description": "", "imageUrl": null },
      { "name": "veg fried rice", "price": "26.70", "description": "", "imageUrl": null },
      { "name": "shrimp fried rice", "price": "31.71", "description": "", "imageUrl": null },
      { "name": "Chicken Fried Rice (with Egg)", "price": "41.75", "description": "We add 3 eggs", "imageUrl": null },
      { "name": "Egg Fried Rice", "price": "33.38", "description": "We add 3 eggs", "imageUrl": null }
    ]
  },
  {
    "category": "chinese noodles",
    "items": [
      { "name": "chicken noodles", "price": "28.37", "description": "", "imageUrl": null },
      { "name": "veg noodles", "price": "26.70", "description": "", "imageUrl": null },
      { "name": "shrimp noodles", "price": "31.71", "description": "", "imageUrl": null },
      { "name": "Chicken Noodles(with Egg)", "price": "41.75", "description": "We add 3 eggs", "imageUrl": null },
      { "name": "Egg Noodles", "price": "33.38", "description": "We add 3 eggs", "imageUrl": null }
    ]
  },
  {
    "category": "house of biryani special goat haleem",
    "items": [
      { "name": "goat haleem", "price": "21.69", "description": "", "imageUrl": null }
    ]
  },
  {
    "category": "Vegetarian",
    "items": [
      { "name": "Daal fry", "price": "11.67", "description": "", "imageUrl": null },
      { "name": "Mix veg curry", "price": "16.68", "description": "", "imageUrl": null },
      { "name": "Paneer tikka masala", "price": "25.03", "description": "", "imageUrl": null },
      { "name": "Paneer makhni(butter)", "price": "25.03", "description": "", "imageUrl": null }
    ]
  },
  {
    "category": "Special Item Every Week",
    "items": [
      { "name": "Mutton Mandi (Available only on Tuesday)", "price": "33.38", "description": "6.00 P.M. to 12.00 A.M.", "imageUrl": null },
      { "name": "Chicken Mandi (Available only on Wednesday)", "price": "30.04", "description": "6.00 P.M. to 12.00 A.M.", "imageUrl": null }
    ]
  },
  {
    "category": "Sweet",
    "items": [
      { "name": "Double ka meetha", "price": "10.02", "description": "", "imageUrl": null },
      { "name": "Kaddu kheer", "price": "10.02", "description": "", "imageUrl": null },
      { "name": "Gulab Jamun", "price": "10.02", "description": "", "imageUrl": null }
    ]
  }
];

let sql = `-- ══════════════════════════════════════════════════════════════════════════
-- HOUSE OF BIRYANI — HIGH-FIDELITY GRUBHUB SYNC
-- Source: https://www.grubhub.com/restaurant/house-of-biryani-2306-w-devon-ave-chicago/2122054
-- ══════════════════════════════════════════════════════════════════════════

-- Clean up ALL existing menu items for HOB to ensure 100% fidelity with source
DELETE FROM microsite_menu_items WHERE tenant_id = 'houseofbiryanirestaurant';

-- ─── CORE MENU ITEMS (GRUBHUB SCRAPE) ──────────────────────────────────────
`;

let order = 10;
menuData.forEach(cat => {
  sql += \`\\n-- Category: \${cat.category}\\n\`;
  cat.items.forEach(item => {
    const id = uuidv4();
    const desc = item.description.replace(/'/g, "''");
    const img = item.imageUrl ? \`'\${item.imageUrl}'\` : 'NULL';
    sql += \`INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('\${id}', 'houseofbiryanirestaurant', '\${item.name.replace(/'/g, "''")}', '\${desc}', \${item.price}, \${item.price}, \${img}, '\${cat.category}', \${order++}, true);
\`;
  });
});

sql += \`
-- ─── MERCHANT-SPECIFIC CONTENT (NOT ON GRUBHUB) ───────────────────────────

-- Paan Menu
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Sweet Meetha Paan', 'Traditional sweet betel leaf with gulkand, fennel, and dates.', 4.99, 4.99, 'https://i0.wp.com/www.bharatzkitchen.com/wp-content/uploads/2021/04/Meetha-Paan.jpg', 'Paan Menu', 200, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Chocolate Paan', 'Meetha paan coated in rich dark chocolate.', 5.99, 5.99, 'https://www.cookwithmanali.com/wp-content/uploads/2016/10/Chocolate-Paan.jpg', 'Paan Menu', 201, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Fire Paan (Live)', 'A flaming betel leaf experience.', 7.99, 7.99, 'https://i.ytimg.com/vi/9lVoQukJ4tY/maxresdefault.jpg', 'Paan Menu', 202, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Premium Magai Paan', 'Premium delicate Magai leaf.', 6.49, 6.49, 'https://images.slurrp.com/prod/recipe_images/better-butter/meetha-paan_1603525206.webp', 'Paan Menu', 203, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Classic Sada Paan', 'Traditional plain betel leaf.', 3.99, 3.99, 'https://4.bp.blogspot.com/-pM8_w4n5_VQ/W1_m8U_6_0I/AAAAAAAAB_M/pM8_w4n5_VQ/s1600/sada-paan.jpg', 'Paan Menu', 204, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Baba 120 (Tobacco Paan)', 'Tobacco paan — Baba 120.', 2.00, 2.00, 'https://choice-paan.com/wp-content/uploads/2021/04/baba-120.jpg', 'Paan Menu', 205, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Baba 160 (Tobacco Paan)', 'Tobacco paan — Baba 160.', 2.00, 2.00, 'https://choice-paan.com/wp-content/uploads/2021/04/baba-160.jpg', 'Paan Menu', 206, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Baba 300 (Tobacco Paan)', 'Tobacco paan — Baba 300.', 2.00, 2.00, 'https://choice-paan.com/wp-content/uploads/2021/04/baba-300.jpg', 'Paan Menu', 207, true);

-- Catering
INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Mutton Full Tray', 'Full catering tray of halal mutton (~20-25 guests).', 180.00, 180.00, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', 'Catering', 300, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Mutton Half Tray', 'Half catering tray of halal mutton.', 100.00, 100.00, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', 'Catering', 301, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Chicken Full Tray', 'Full catering tray of halal chicken (~20-25 guests).', 125.00, 125.00, 'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=800&q=80', 'Catering', 302, true),
  ('\${uuidv4()}', 'houseofbiryanirestaurant', 'Chicken Half Tray', 'Half catering tray of halal chicken.', 72.50, 72.50, 'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=800&q=80', 'Catering', 303, true);
\`;

fs.writeFileSync('seed-hob-menu.sql', sql);
console.log('Successfully generated seed-hob-menu.sql');
