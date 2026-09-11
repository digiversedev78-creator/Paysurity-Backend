import { pgTable, uuid, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants'; // assuming tenants table exists
export const webhooks = pgTable('webhooks', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    eventTypes: jsonb('event_types').notNull().default('[]'),
    secret: varchar('secret', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});
//# sourceMappingURL=webhooks.js.map