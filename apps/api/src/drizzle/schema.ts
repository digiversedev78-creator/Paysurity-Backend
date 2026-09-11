import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const Schema = pgTable('grocery', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
