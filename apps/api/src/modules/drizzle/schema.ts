import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const Schema = {
  users: pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }),

  // You can add more tables here if needed, e.g.:
  // posts: pgTable('posts', {
  //   id: serial('id').primaryKey(),
  //   title: text('title').notNull(),
  //   content: text('content'),
  //   authorId: integer('author_id').references(() => Schema.users.id),
  //   createdAt: timestamp('created_at').defaultNow().notNull(),
  // }),
};
