/**
 * TDA AUDIT SCRIPT: REQ-NFR-001 — Availability Architecture
 * Blueprint Domain: Non-Functional Requirements
 *
 * MANDATE: Audit the database schema layer for structural markers that
 * support or contradict the availability invariants defined in the blueprint.
 *
 * INVARIANTS UNDER TEST:
 *   [INV-1] SLA target: 99.99% monthly uptime for payment-critical paths
 *   [INV-2] SLA target: 99.9% monthly uptime for non-critical paths
 *   [INV-3] No single point of failure in payment processing or ledger write paths
 *   [INV-4] Database read replicas must be in a separate AZ from the primary write node
 *
 * EXPECTED RESULT: FAIL — Schema does not encode availability topology.
 * These tests expose architectural gaps: no replica routing annotations,
 * no HA configuration markers, no SPOF mitigation evidence at the schema layer.
 */

import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_ROOT = path.resolve(__dirname, '../../../packages/database/src/schema');

// Payment-critical schemas: ledger writes and payment authorization
const PAYMENT_CRITICAL_SCHEMAS = ['payments.ts', 'wallets.ts', 'pos.ts'];

// Database infrastructure configuration (expected but may not exist yet)
const DB_INFRA_CONFIG_PATHS = [
  path.resolve(__dirname, '../../../packages/database/src/db.ts'),
  path.resolve(__dirname, '../../../packages/database/src/connection.ts'),
  path.resolve(__dirname, '../../../packages/database/src/config.ts'),
  path.resolve(__dirname, '../../../packages/database/drizzle.config.ts'),
];

describe('TDA | REQ-NFR-001 | Availability Architecture', () => {

  // ─────────────────────────────────────────────────────────────
  // INV-3: No SPOF — payment-critical tables must have
  // replica routing annotations or connection pool configuration
  // that references replica endpoints.
  // ─────────────────────────────────────────────────────────────
  test('[INV-3] A database connection config MUST exist with read replica routing', () => {
    const configExists = DB_INFRA_CONFIG_PATHS.some(p => fs.existsSync(p));
    expect(configExists).toBe(true);
  });

  test('[INV-3] Database config MUST define separate READ_REPLICA connection', () => {
    let foundReplicaConfig = false;
    for (const configPath of DB_INFRA_CONFIG_PATHS) {
      if (fs.existsSync(configPath)) {
        const src = fs.readFileSync(configPath, 'utf-8');
        if (/READ_REPLICA|readReplica|replicaUrl|REPLICA_URL|replica.*host/i.test(src)) {
          foundReplicaConfig = true;
          break;
        }
      }
    }
    expect(foundReplicaConfig).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-3: Payment-critical schemas must be annotated with
  // a high-availability write concern marker.
  // ─────────────────────────────────────────────────────────────
  test.each(PAYMENT_CRITICAL_SCHEMAS)(
    '[INV-3] %s MUST have an @HA_WRITE_PATH or @CRITICAL_PATH annotation',
    (schemaFile) => {
      const schemaPath = path.join(SCHEMA_ROOT, schemaFile);
      expect(fs.existsSync(schemaPath)).toBe(true);
      const src = fs.readFileSync(schemaPath, 'utf-8');
      // Blueprint invariant: critical paths must be explicitly documented
      expect(src).toMatch(/@HA_WRITE_PATH|@CRITICAL_PATH|@PAYMENT_CRITICAL/);
    }
  );

  // ─────────────────────────────────────────────────────────────
  // INV-4: AZ separation — the DB config must reference
  // a separate AZ or region for read replicas vs primary.
  // ─────────────────────────────────────────────────────────────
  test('[INV-4] Database config MUST reference multi-AZ topology', () => {
    let foundAzConfig = false;
    for (const configPath of DB_INFRA_CONFIG_PATHS) {
      if (fs.existsSync(configPath)) {
        const src = fs.readFileSync(configPath, 'utf-8');
        if (/availability.?zone|multi.?az|MULTI_AZ|primaryRegion|replicaRegion/i.test(src)) {
          foundAzConfig = true;
          break;
        }
      }
    }
    expect(foundAzConfig).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-1/2: SLA documentation — a machine-readable SLA definition
  // must exist in the platform infrastructure configuration.
  // ─────────────────────────────────────────────────────────────
  test('[INV-1] A machine-readable SLA definition (99.99%) MUST exist for payment paths', () => {
    const slaConfigPaths = [
      path.resolve(__dirname, '../../../packages/database/src/sla.config.ts'),
      path.resolve(__dirname, '../../../infra/sla.json'),
      path.resolve(__dirname, '../../../docs/architecture/SLA_CONFIG.json'),
    ];
    const slaExists = slaConfigPaths.some(p => fs.existsSync(p));
    expect(slaExists).toBe(true);
  });
});
