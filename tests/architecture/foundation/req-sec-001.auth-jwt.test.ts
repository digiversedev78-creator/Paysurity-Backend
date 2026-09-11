/**
 * TDA AUDIT SCRIPT: REQ-SEC-001 — Authentication & JWT Flow
 * Blueprint Domain: Platform Security
 *
 * MANDATE: This test audits the physical schema against the data_invariants
 * defined in the DETERMINISTIC_MASTER_BLUEPRINT.json for REQ-SEC-001.
 *
 * INVARIANTS UNDER TEST:
 *   [INV-1] JWT must be signed using RS256 algorithm
 *   [INV-2] Access tokens must have a strict expiration <= 15 minutes
 *   [INV-3] Refresh tokens must be stored in HTTP-only, secure cookies or secure enclaves
 *   [INV-4] Passwords must be hashed using Argon2id or bcrypt
 *
 * EXPECTED RESULT: FAIL — Schema does not enforce these invariants at the DB layer.
 * These tests expose the gap between the blueprint specification and the current implementation.
 */

import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_ROOT = path.resolve(__dirname, '../../../packages/database/src/schema');
const securitySchemaPath = path.join(SCHEMA_ROOT, 'security.ts');
const usersSchemaPath = path.join(SCHEMA_ROOT, 'users.ts');

describe('TDA | REQ-SEC-001 | Platform Security — Authentication & JWT Flow', () => {
  let securitySchemaSource: string;
  let usersSchemaSource: string;

  beforeAll(() => {
    securitySchemaSource = fs.readFileSync(securitySchemaPath, 'utf-8');
    usersSchemaSource = fs.readFileSync(usersSchemaPath, 'utf-8');
  });

  // ─────────────────────────────────────────────────────────────
  // INV-1: JWT algorithm enforcement — RS256 must be defined
  // The schema layer must contain a reference to the signing algorithm
  // to enforce the JWT invariant at the infrastructure level.
  // ─────────────────────────────────────────────────────────────
  test('[INV-1] security.ts MUST reference RS256 JWT signing algorithm', () => {
    expect(securitySchemaSource).toMatch(/RS256/);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-2: Access token expiry — must enforce <= 15 minutes (900 seconds)
  // The user_sessions table must contain a column enforcing the max
  // token TTL constraint via a check constraint or a typed annotation.
  // ─────────────────────────────────────────────────────────────
  test('[INV-2] user_sessions table MUST have an access_token_expires_at column distinct from session expiresAt', () => {
    // Blueprint requires separate short-lived (<=15min) access token expiry
    // distinct from the long-lived session/refresh token expiry.
    expect(securitySchemaSource).toMatch(/access_token_expires_at|accessTokenExpiresAt/);
  });

  test('[INV-2] user_sessions table MUST enforce access token max TTL via a check constraint annotation', () => {
    // The schema must reference the 15-minute (900s) hard limit
    expect(securitySchemaSource).toMatch(/900|15.*min|accessTokenTtl|access_token_ttl/i);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-3: Refresh token storage — must be clearly separated from access tokens
  // Schema must have a dedicated refresh_token column with a comment
  // indicating secure-enclave or HTTP-only cookie storage semantics.
  // ─────────────────────────────────────────────────────────────
  test('[INV-3] user_sessions table MUST have a refresh_token column', () => {
    expect(securitySchemaSource).toMatch(/refresh_token|refreshToken/);
  });

  test('[INV-3] refresh_token storage MUST be annotated as HTTP-only or secure-enclave', () => {
    // Architectural invariant comment must be present
    expect(securitySchemaSource).toMatch(/http.?only|secure.?enclave|refreshToken.*secure|REFRESH_TOKEN_SECURE/i);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-4: Password hashing — Argon2id or bcrypt must be the only accepted algorithm
  // The users table must carry a password_hash_algorithm column or a
  // constrained enum indicating the hashing algorithm, NOT plaintext or MD5.
  // ─────────────────────────────────────────────────────────────
  test('[INV-4] users.ts MUST have a password_hash_algorithm column enforcing Argon2id or bcrypt', () => {
    expect(usersSchemaSource).toMatch(/password_hash_algorithm|passwordHashAlgorithm/);
  });

  test('[INV-4] users.ts MUST NOT store plaintext passwords — no "password" column without "hash" suffix', () => {
    // Reject any column named exactly "password" without "hash"
    expect(usersSchemaSource).not.toMatch(/['"](password)['"]/);
  });

  test('[INV-4] users.ts password_hash column MUST be annotated with Argon2id or bcrypt algorithm constraint', () => {
    expect(usersSchemaSource).toMatch(/argon2id|bcrypt|ARGON2ID|BCRYPT/i);
  });

  // ─────────────────────────────────────────────────────────────
  // STRUCTURAL: RLS enforcement markers must exist
  // Blueprint states: Refresh tokens must be stored in secure enclaves.
  // The schema must carry the RLS enable marker (not just commented SQL).
  // ─────────────────────────────────────────────────────────────
  test('[STRUCTURAL] security.ts MUST have active (uncommented) RLS enablement for user_sessions', () => {
    // RLS must be enforced — it cannot remain in commented-out SQL
    // Current schema has it commented; this test surfaces the gap.
    const hasUncommentedRls = /^\s*(ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY)/m.test(securitySchemaSource);
    expect(hasUncommentedRls).toBe(true);
  });
});
