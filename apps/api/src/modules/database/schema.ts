import { InferSelectModel } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pgTable, uuid, text, varchar, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Local stub — replaces phantom '@paysurity/database'
export const merchants = pgTable('merchants', {
  id:          uuid('id').defaultRandom().primaryKey(),
  tenantId:    uuid('tenant_id').notNull(),
  name:        varchar('name', { length: 255 }).notNull(),
  slug:        varchar('slug', { length: 255 }),
  email:       varchar('email', { length: 255 }),
  phone:       varchar('phone', { length: 50 }),
  address:     text('address'),
  city:        varchar('city', { length: 100 }),
  state:       varchar('state', { length: 100 }),
  country:     varchar('country', { length: 100 }),
  postalCode:  varchar('postal_code', { length: 20 }),
  status:      varchar('status', { length: 50 }).default('active'),
  metadata:    jsonb('metadata'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
});

export const merchantRelations = relations(merchants, ({ many }) => ({}));

export const schema = { merchants, merchantRelations };

// Re-export for backwards compat
export type Merchant = InferSelectModel<typeof merchants>;
export type Db = NodePgDatabase<typeof schema>;
