import { pgTable, uuid, text, timestamp, boolean, jsonb, index, varchar, integer } from 'drizzle-orm/pg-core';
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    // @ARCHITECTURAL_INVARIANT: Passwords MUST NOT be stored in plaintext.
    // Must use Argon2id or bcrypt exclusively.
    passwordHash: text('password_hash'),
    // Enforces the hashing algorithm used for the passwordHash.
    passwordHashAlgorithm: varchar('password_hash_algorithm', { length: 50 }).default('argon2id'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    tenantId: uuid('tenant_id').notNull(),
    isActive: boolean('is_active').default(true),
    roles: text('roles').array().default([]),
    role: text('role'),
    tokenVersion: integer('token_version').default(0),
    mfaEnabled: boolean('mfa_enabled').default(false),
    mfaSecret: varchar('mfa_secret', { length: 255 }),
    lockedUntil: timestamp('locked_until'),
    failedLoginCount: integer('failed_login_count').default(0),
    lastLoginAt: timestamp('last_login_at'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
    return {
        tenantIdIdx: index('users_tenant_id_idx').on(table.tenantId),
    };
});
// Alias for shim compatibility
export const usersTable = users;
export const RLS_MIGRATION_SQL = `
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
`;
//# sourceMappingURL=users.js.map