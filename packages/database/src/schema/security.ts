import { pgTable, integer, varchar, timestamp, text } from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// REQ-SEC-001 | Platform Security — Authentication & JWT Flow
// @JWT_SIGNING_ALGORITHM: RS256
// All JWTs issued by this platform MUST be signed using RS256 (RSA + SHA-256).
// Symmetric (HS256) is explicitly prohibited per the architectural blueprint.
// ─────────────────────────────────────────────────────────────────────────────

// Zero-Trust & MFA Modules (Enforces Domain 18 Blueprint)
export const security_events = pgTable("security_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  riskScore: integer("risk_score").default(0),
  actorType: varchar("actor_type", { length: 50 }),
  outcome: varchar("outcome", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const user_sessions = pgTable("user_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull(),
  userId: integer("user_id").notNull(),

  // @ARCHITECTURAL_INVARIANT: sessionToken is the long-lived refresh-token handle.
  // Its raw value MUST never be transmitted in a response body.
  // Storage: HTTP-only, Secure cookie or platform Secure Enclave exclusively.
  // @REFRESH_TOKEN_SECURE — do NOT relax this constraint.
  sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),

  // @ARCHITECTURAL_INVARIANT: refreshToken stores the opaque refresh token value.
  // Must be transmitted only via HTTP-only Secure cookie (never in JSON body).
  // Secure Enclave storage required for native mobile clients.
  refreshToken: varchar("refresh_token", { length: 512 }),

  // @ARCHITECTURAL_INVARIANT: accessTokenExpiresAt enforces the 15-minute (900s)
  // hard ceiling on access token validity per REQ-SEC-001 [INV-2].
  // Max TTL = 900 seconds. Any token beyond this window MUST be rejected.
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),

  status: varchar("status", { length: 20 }).default("ACTIVE"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const user_mfa_configs = pgTable("user_mfa_configs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  tenantId: integer("tenant_id").notNull(),
  userId: integer("user_id").notNull().unique(),
  mfaType: varchar("mfa_type", { length: 20 }).notNull(),
  seed: varchar("seed", { length: 255 }),
  isEnabled: integer("is_enabled").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Row-Level Security (RLS) Enforcement
// @ARCHITECTURAL_INVARIANT: RLS must be ACTIVE on all security-domain tables.
// The following statements are the authoritative RLS migration source.
// They MUST be executed by the migration runner on every fresh deployment.
// ─────────────────────────────────────────────────────────────────────────────
export const RLS_MIGRATION_SQL = `
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_configs ENABLE ROW LEVEL SECURITY;
`;

