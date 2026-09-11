/**
 * TDA AUDIT SCRIPT: REQ-NFR-002 — Performance Design Requirements
 * Blueprint Domain: Non-Functional Requirements
 *
 * MANDATE: Audit the database schema for structural markers that enforce
 * the performance invariants: index coverage, query plan constraints, and
 * SLA latency documentation on hot-path tables.
 *
 * INVARIANTS UNDER TEST:
 *   [INV-1] Payment authorization API P99 latency < 500ms under 10x peak load
 *   [INV-2] POS order creation API P99 latency < 300ms under normal load
 *   [INV-3] Dashboard LCP < 2.5s on broadband
 *   [INV-4] No sequential table scans on hot-path tables > 10k rows
 *
 * EXPECTED RESULT: FAIL — Hot-path tables lack mandatory index coverage
 * annotations and SLA latency markers required by the blueprint.
 */

import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_ROOT = path.resolve(__dirname, '../../../packages/database/src/schema');

// Hot-path tables per blueprint — must have sufficient index coverage
const HOT_PATH_TABLES = [
  { file: 'payments.ts', requiredIndexColumns: ['tenant_id', 'status', 'created_at'] },
  { file: 'pos.ts',      requiredIndexColumns: ['tenant_id', 'location_id', 'status'] },
  { file: 'wallets.ts',  requiredIndexColumns: ['user_id', 'tenant_id'] },
];

describe('TDA | REQ-NFR-002 | Performance Design Requirements', () => {

  // ─────────────────────────────────────────────────────────────
  // INV-4: No sequential scans — hot-path tables must declare
  // indexes on all high-cardinality filter columns.
  // ─────────────────────────────────────────────────────────────
  describe('[INV-4] Hot-path tables MUST have mandatory index coverage', () => {
    test.each(HOT_PATH_TABLES)(
      '$file MUST define an index on tenant_id (multi-tenant isolation)',
      ({ file, requiredIndexColumns }) => {
        const schemaPath = path.join(SCHEMA_ROOT, file);
        expect(fs.existsSync(schemaPath)).toBe(true);
        const src = fs.readFileSync(schemaPath, 'utf-8');
        // Must use drizzle index() on tenant_id
        expect(src).toMatch(/index\(['"]\w+tenant\w*['"]\)\.on\(table\.tenantId\)/);
      }
    );

    test('payments.ts MUST have a composite index on (status, created_at) for settlement queries', () => {
      const src = fs.readFileSync(path.join(SCHEMA_ROOT, 'payments.ts'), 'utf-8');
      // Settlement job queries by status + date range — must have a composite index
      expect(src).toMatch(/index.*status.*created_at|index.*created_at.*status/);
    });

    test('pos.ts MUST have an index on location_id for POS terminal scoping', () => {
      const src = fs.readFileSync(path.join(SCHEMA_ROOT, 'pos.ts'), 'utf-8');
      expect(src).toMatch(/index\(['"]\w+location\w*['"]\)\.on\(table\.locationId\)/);
    });

    test('wallets.ts MUST have an index on user_id for wallet lookup', () => {
      const src = fs.readFileSync(path.join(SCHEMA_ROOT, 'wallets.ts'), 'utf-8');
      expect(src).toMatch(/index\(['"]\w+user\w*['"]\)\.on\(table\.userId\)/);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // INV-1/2: Latency SLA annotations — blueprint-mandated
  // performance targets must be present as machine-readable markers.
  // ─────────────────────────────────────────────────────────────
  test('[INV-1] A performance SLA config MUST define payment_auth P99 < 500ms', () => {
    const slaPath = path.resolve(__dirname, '../../../docs/architecture/SLA_CONFIG.json');
    expect(fs.existsSync(slaPath)).toBe(true);
    const sla = JSON.parse(fs.readFileSync(slaPath, 'utf-8'));
    expect(sla).toHaveProperty('payment_authorization_p99_ms');
    expect(sla.payment_authorization_p99_ms).toBeLessThanOrEqual(500);
  });

  test('[INV-2] A performance SLA config MUST define pos_order_creation P99 < 300ms', () => {
    const slaPath = path.resolve(__dirname, '../../../docs/architecture/SLA_CONFIG.json');
    expect(fs.existsSync(slaPath)).toBe(true);
    const sla = JSON.parse(fs.readFileSync(slaPath, 'utf-8'));
    expect(sla).toHaveProperty('pos_order_creation_p99_ms');
    expect(sla.pos_order_creation_p99_ms).toBeLessThanOrEqual(300);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-4: Amount fields on payment-critical tables MUST use
  // integer (minor units) — no decimal/float allowed.
  // ─────────────────────────────────────────────────────────────
  test('[INV-4] payments.ts MUST NOT use decimal() or numeric() for amount fields', () => {
    const src = fs.readFileSync(path.join(SCHEMA_ROOT, 'payments.ts'), 'utf-8');
    // Architectural invariant: all financial amounts in integer minor units
    expect(src).not.toMatch(/decimal\(|numeric\(/);
  });

  test('[INV-4] wallets.ts MUST NOT use decimal() or numeric() for balance fields', () => {
    const src = fs.readFileSync(path.join(SCHEMA_ROOT, 'wallets.ts'), 'utf-8');
    expect(src).not.toMatch(/decimal\(|numeric\(/);
  });
});
