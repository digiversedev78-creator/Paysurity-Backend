
const { Pool } = require('pg');
const { createHash } = require('crypto');

const HOB_TENANT_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const TAWAKKUL_TENANT_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

function getDeterministicId(input) {
  const hash = createHash('sha256').update(input).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

const HOB_MENU = [
  {
    category: "Biryani and Rice",
    items: [
      { name: "Mutton Biryani", price_cents: 3340, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq", description: "Basmati rice cooked with goat meat with home spices." },
      { name: "Chicken dum Biryani", price_cents: 2837, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/mtojvbp03ipxbi7zq2tr", description: "Basmati rice cooked with chicken and spices." },
      { name: "Veg Dum Biryani", price_cents: 2503, image_url: "https://images.unsplash.com/photo-1512058556646-c4da40fba323?auto=format&fit=crop&w=800&q=80", description: "Seasonal vegetables and paneer slow-cooked with saffron basmati." },
      { name: "Paneer Biryani", price_cents: 2503, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ouwa84pht8n8yg2u36qq", description: "Vegetarian biryani with spiced cottage cheese cubes." },
      { name: "Jeera Rice", price_cents: 1167, description: "Fragrant cumin-tempered basmati rice." },
      { name: "Plain Rice", price_cents: 833, description: "Steamed premium long-grain basmati rice." }
    ]
  },
  {
    category: "Chicken main course",
    items: [
      { name: "Chicken Kadai", price_cents: 2503, description: "Chicken pieces cut with tomato ginger, garlic, and spices." },
      { name: "Chicken Korma", price_cents: 2503, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/vepblkuzz4eoitqfvtck", description: "Chicken pieces cooked with yogurt ginger, garlic, and spices." },
      { name: "butter chicken", price_cents: 2503, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/khprwqzfgjpryprcjmxg", description: "boneless chicken made with butter and creamy sauce with mouth watering taste" },
      { name: "chicken tikka masala", price_cents: 2503, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/ftv5jc3c4kvklhkjsjta", description: "Marinated and spiced chicken in curry." }
    ]
  },
  {
    category: "mutton main course (goat)",
    items: [
      { name: "mutton karahi", price_cents: 2837, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/xss1offiifhbvckfgoxn", description: "Mutton pieces cooked with ginger, garlic, tomato, salt, onion, and green pepper." },
      { name: "tala hua gosh (mutton fry)", price_cents: 3340, image_url: "https://media-cdn.grubhub.com/image/upload/d_search:browse-images:default.jpg/w_150,q_auto:low,fl_lossy,dpr_2.0,c_fill,f_auto,h_150/fuaxsd3taxbzisjvzbfs", description: "Deep fried mutton with spices." }
    ]
  },
  {
    category: "Grilled Dishes",
    items: [
      { name: "Chicken Tikka", price_cents: 2670, description: "Boneless chicken pieces marinated and grilled in the tandoor." },
      { name: "Mutton Seekh Kabab", price_cents: 3004, description: "Spiced ground halal mutton on skewers, charcoal-grilled." }
    ]
  },
  {
    category: "Vegetarian",
    items: [
      { name: "Paneer Tikka Masala", price_cents: 2503, description: "House-made cottage cheese in a rich spiced tomato-cream masala." },
      { name: "Daal Fry", price_cents: 1167, description: "Yellow lentils tempered with cumin, garlic, and dried red chilies." }
    ]
  },
  {
    category: "Chinese Specialties",
    items: [
      { name: "Chicken Fried Rice", price_cents: 2837, description: "Wok-fried basmati with halal chicken, egg, soy, and vegetables." },
      { name: "Veg Fried Rice", price_cents: 2503, description: "Stir-fried basmati with seasonal vegetables and soy." },
      { name: "Chicken Noodles", price_cents: 2837, description: "Stir-fried noodles with halal chicken, vegetables, and soy sauce." }
    ]
  },
  {
    category: "Bread, Naan & Roti",
    items: [
      { name: "Plain Naan", price_cents: 334, description: "Classic soft tandoor-baked flatbread." },
      { name: "Butter Naan", price_cents: 417, description: "Tandoor-baked naan brushed with butter." },
      { name: "Garlic Naan", price_cents: 501, description: "Tandoor naan topped with garlic and coriander." }
    ]
  },
  {
    category: "Sweet",
    items: [
      { name: "Double ka meetha", price_cents: 1002, description: "Bread pudding dessert of fried bread slices soaked in hot milk with spices." },
      { name: "Gulab Jamun", price_cents: 1002, description: "Milk-solid-based sweet." }
    ]
  },
  {
    category: "Drinks",
    items: [
      { name: "Mango Lassi", price_cents: 1000, description: "Thick yogurt blended with mango pulp." },
      { name: "Chai", price_cents: 334, description: "Fresh hot tea." },
      { name: "Soda", price_cents: 448, description: "Choice of canned soda." }
    ]
  },
  {
    category: "Weekly Specials",
    items: [
      { name: "Mutton Mandi", price_cents: 3338, description: "Whole halal goat slow-smoked on fragrant Mandi rice (Wed/Sun)." },
      { name: "Chicken Mandi", price_cents: 3004, description: "Whole halal chicken slow-smoked on fragrant Mandi rice (Wed)." }
    ]
  },
  {
    category: "Paan (Specialty Counter)",
    items: [
      { name: "Sweet Meetha Paan", price_cents: 599, image_url: "https://i0.wp.com/www.bharatzkitchen.com/wp-content/uploads/2021/04/Meetha-Paan.jpg", description: "Traditional sweet betel leaf with gulkand, fennel, and dates." },
      { name: "Chocolate Paan", price_cents: 699, image_url: "https://www.cookwithmanali.com/wp-content/uploads/2016/10/Chocolate-Paan.jpg", description: "Meetha paan coated in rich dark chocolate and sprinkles." },
      { name: "Fire Paan (Live)", price_cents: 899, image_url: "https://i.ytimg.com/vi/9lVoQukJ4tY/maxresdefault.jpg", description: "A flaming betel leaf experience with cooling spices." }
    ]
  },
  {
    category: "Catering",
    items: [
      { name: "Mutton Biryani — Full Tray", price_cents: 18000, image_url: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80", description: "Full catering tray (~20-25 guests). 72-hr notice required." },
      { name: "Chicken-65 Full Tray", price_cents: 18000, image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80", description: "Full catering tray of South Indian-style halal Chicken-65." }
    ]
  }
];

const TAWAKKUL_MENU = [
  {
    category: "Signature Mutton",
    items: [
      { name: "Mutton Fry (Talewa Gosh)", price_cents: 1799, description: "Authentic Hyderabadi deep-fried spiced mutton." },
      { name: "Mutton Qorma", price_cents: 1599, description: "Rich goat meat curry with yogurt and nuts." }
    ]
  }
];

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://paysurity:PaysurityStagingConfig2026!@35.232.137.88:5432/paysurity_dev',
  });

  try {
    console.log('Seeding House of Biryani...');
    await seedRestaurant(pool, HOB_TENANT_ID, HOB_MENU);
    console.log('Seeding Tawakkul...');
    await seedRestaurant(pool, TAWAKKUL_TENANT_ID, TAWAKKUL_MENU);
    console.log('Seeding complete.');
  } finally {
    await pool.end();
  }
}

async function seedRestaurant(pool, tenantId, categories) {
  for (const cat of categories) {
    const catId = getDeterministicId(`${tenantId}:${cat.category}`);
    await pool.query(
      `INSERT INTO menu_categories (id, tenant_id, name) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
      [catId, tenantId, cat.category]
    );

    for (const item of cat.items) {
      const itemId = getDeterministicId(`${tenantId}:${cat.category}:${item.name}`);
      await pool.query(
        `INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, category, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           base_price = EXCLUDED.base_price,
           display_price = EXCLUDED.display_price,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           image_url = EXCLUDED.image_url`,
        [itemId, tenantId, item.name, item.description, item.price_cents/100, item.price_cents/100, cat.category, item.image_url || null]
      );
    }
  }
}

seed().catch(console.error);
