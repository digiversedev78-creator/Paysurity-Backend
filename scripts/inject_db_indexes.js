const fs = require('fs');
const path = require('path');

const schemaDir = 'c:/Projects/PaySurity/packages/database/src/schema';
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(schemaDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if table has tenant_id
    if (content.includes("tenantId: uuid('tenant_id')") || content.includes("tenant_id: uuid('tenant_id')")) {
        console.log(`Processing ${file}...`);
        
        // 1. Add 'index' to imports if not present
        if (!content.includes(', index')) {
            content = content.replace("from 'drizzle-orm/pg-core';", ", index } from 'drizzle-orm/pg-core';");
        }
        
        // 2. Add index to pgTable calls
        // Matches: export const <tableName> = pgTable('<tableName>', {
        const pgTableRegex = /export const (\w+) = pgTable\('(\w+)', \{([\s\S]*?)\}\);/g;
        
        content = content.replace(pgTableRegex, (match, tableName, dbName, columns) => {
            // Check if this specific table has tenantId
            if (columns.includes("tenantId: uuid('tenant_id')") || columns.includes("tenant_id: uuid('tenant_id')")) {
                const tenantField = columns.includes("tenantId: uuid('tenant_id')") ? 'tenantId' : 'tenant_id';
                return `export const ${tableName} = pgTable('${dbName}', {${columns}}, (table) => {\n  return {\n    ${tenantField}Idx: index('${dbName}_tenant_id_idx').on(table.${tenantField}),\n  };\n});`;
            }
            return match;
        });
        
        fs.writeFileSync(filePath, content);
    }
});

console.log('Index injection complete.');
