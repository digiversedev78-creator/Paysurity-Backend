const fs = require('fs');
const path = require('path');

const csvPath = 'C:/Projects/PaySurity/HouseOfBiryani/category-item-77.csv';
const sqlPath = 'C:/Projects/PaySurity/apps/api/src/scripts/seed-hob-menu.sql';
const oldSqlContent = fs.readFileSync(sqlPath, 'utf8');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0];
const dataLines = lines.slice(1);

const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const itemsByCategory = {};
for (const line of dataLines) {
  // Simple CSV parser for quoted fields
  const row = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  row.push(current.trim());
  
  if (row.length >= 4) {
    const category = row[0];
    const name = row[1];
    let description = row[2] === '—' || row[2] === '-' ? '' : row[2];
    description = description.replace(/'/g, "''"); // escape single quotes
    const priceStr = row[3].replace('+', '').trim();
    const price = parseFloat(priceStr);
    
    if (!itemsByCategory[category]) {
      itemsByCategory[category] = [];
    }
    itemsByCategory[category].push({ name, description, price });
  }
}

// Extract image mappings from old SQL
const imageMap = {};
const oldLines = oldSqlContent.split('\n');
for (const line of oldLines) {
  if (line.includes('INSERT INTO microsite_menu_items') && line.includes('VALUES')) continue;
  const match = line.match(/\('?[a-f0-9\-]*'?, 'houseofbiryanirestaurant', '([^']+)', '[^']*', [\d.]+, [\d.]+, (NULL|'[^']+'),/);
  if (match) {
    const name = match[1];
    const imageUrl = match[2];
    if (imageUrl !== 'NULL') {
      imageMap[name.toLowerCase()] = imageUrl;
    }
  }
}

let newSql = `-- ══════════════════════════════════════════════════════════════════════════
-- HOUSE OF BIRYANI — HIGH-FIDELITY GRUBHUB SYNC (Updated from CSV)
-- ══════════════════════════════════════════════════════════════════════════

-- Clean up ALL existing menu items for HOB to ensure 100% fidelity with source
DELETE FROM microsite_menu_items WHERE tenant_id = 'houseofbiryanirestaurant';

-- ─── CORE MENU ITEMS (FROM CSV) ──────────────────────────────────────
`;

let displayOrder = 10;
for (const category of Object.keys(itemsByCategory)) {
  newSql += `\n-- Category: ${category}\n`;
  newSql += `INSERT INTO microsite_menu_items (id, tenant_id, name, description, base_price, display_price, image_url, category, display_order, is_active) VALUES\n`;
  
  const items = itemsByCategory[category];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = generateUuid();
    const imageUrl = imageMap[item.name.toLowerCase()] || 'NULL';
    const isLast = i === items.length - 1;
    newSql += `  ('${id}', 'houseofbiryanirestaurant', '${item.name.replace(/'/g, "''")}', '${item.description}', ${item.price}, ${item.price}, ${imageUrl}, '${category.replace(/'/g, "''")}', ${displayOrder++}, true)${isLast ? ';' : ','}\n`;
  }
}

// Add the Paan Menu and Catering from old SQL
const paanCateringIndex = oldSqlContent.indexOf('-- ─── MERCHANT-SPECIFIC CONTENT');
if (paanCateringIndex !== -1) {
  newSql += '\n' + oldSqlContent.substring(paanCateringIndex);
}

fs.writeFileSync(sqlPath, newSql);
console.log('Successfully generated updated seed-hob-menu.sql');
