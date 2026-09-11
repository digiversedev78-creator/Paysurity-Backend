import { pgTable, uuid, text, timestamp, boolean, integer, varchar, index } from 'drizzle-orm/pg-core';

export const menuItemImages = pgTable('menu_item_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  menuItemId: uuid('menu_item_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  isPrimary: boolean('is_primary').notNull().default(false),
  width: integer('width'),
  height: integer('height'),
  fileSizeBytes: integer('file_size_bytes'),
  source: varchar('source', { enum: ['uploaded', 'ai_generated', 'stock'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => {
  return {
    tenantIdIdx: index('tenant_id_idx').on(table.tenantId),
    menuItemIdIdx: index('menu_item_id_idx').on(table.menuItemId),
    tenantMenuItemIdIdx: index('tenant_menu_item_id_idx').on(table.tenantId, table.menuItemId),
  };
});

export type MenuItemImages = typeof menuItemImages.$inferSelect;

