/**
 * TDA AUDIT SCRIPT: REQ-NFR-004 — Observability Stack
 * Blueprint Domain: Non-Functional Requirements
 *
 * MANDATE: Audit the platform schema and log infrastructure for the
 * structural markers that enforce the observability invariants.
 *
 * INVARIANTS UNDER TEST:
 *   [INV-1] Every inbound API request must have a globally unique Trace ID
 *            propagated through all downstream calls
 *   [INV-2] Logs must be structured JSON with mandatory fields:
 *            trace_id, service, severity, timestamp (UTC ISO8601)
 *   [INV-3] Business-critical alerts must have a defined SLO burn rate trigger
 *   [INV-4] Log retention: 90 days hot, 1 year cold (archived)
 *
 * EXPECTED RESULT: FAIL — Current logs table lacks trace_id and service fields.
 * The platform schema does not enforce structured-log mandatory fields.
 */

import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_ROOT = path.resolve(__dirname, '../../../packages/database/src/schema');
const PROJECT_ROOT = path.resolve(__dirname, '../../..');

describe('TDA | REQ-NFR-004 | Observability Stack', () => {

  let platformSchemaSource: string;

  beforeAll(() => {
    platformSchemaSource = fs.readFileSync(
      path.join(SCHEMA_ROOT, 'platform.ts'),
      'utf-8'
    );
  });

  // ─────────────────────────────────────────────────────────────
  // INV-1: Trace ID propagation — the logs table MUST have a
  // trace_id column to store distributed trace identifiers.
  // ─────────────────────────────────────────────────────────────
  test('[INV-1] platform.ts logs table MUST have a trace_id column', () => {
    expect(platformSchemaSource).toMatch(/trace_id|traceId/);
  });

  test('[INV-1] logs table trace_id MUST be non-nullable (every request is traced)', () => {
    // The trace_id field must be .notNull() — no optional tracing
    expect(platformSchemaSource).toMatch(/traceId.*notNull|trace_id.*notNull/);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-2: Structured log mandatory fields — logs table must enforce
  // trace_id, service, severity (not just level), timestamp columns.
  // ─────────────────────────────────────────────────────────────
  test('[INV-2] logs table MUST have a "service" column', () => {
    // Current schema has service — this should pass
    expect(platformSchemaSource).toMatch(/service.*text|service.*varchar/);
  });

  test('[INV-2] logs table MUST have a "severity" column (not just "level")', () => {
    // Blueprint specifies "severity" field — current schema only has "level"
    // This gap is intentional — the test will fail to expose it.
    expect(platformSchemaSource).toMatch(/severity.*text|severity.*varchar/);
  });

  test('[INV-2] logs table "severity" MUST be constrained to valid values: DEBUG, INFO, WARN, ERROR, CRITICAL', () => {
    // Must use a check constraint or pgEnum to enforce valid severity values
    expect(platformSchemaSource).toMatch(/pgEnum|check.*severity|severity.*enum/i);
  });

  test('[INV-2] logs table MUST have a "service" column that is non-nullable', () => {
    // All log entries must identify their origin service — nullable is a gap
    expect(platformSchemaSource).toMatch(/service.*notNull/);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-3: SLO burn rate alerts — a machine-readable SLO config
  // must exist defining burn rate thresholds for critical alerts.
  // ─────────────────────────────────────────────────────────────
  test('[INV-3] An SLO configuration file MUST exist defining burn rate thresholds', () => {
    const sloCandidates = [
      path.join(PROJECT_ROOT, 'docs/architecture/SLO_CONFIG.json'),
      path.join(PROJECT_ROOT, 'infra/slo.json'),
      path.join(PROJECT_ROOT, '.infra/slo-config.json'),
    ];
    const exists = sloCandidates.some(p => fs.existsSync(p));
    expect(exists).toBe(true);
  });

  test('[INV-3] SLO config MUST define burn_rate_multiplier for payment_authorization SLO', () => {
    const sloPath = path.join(PROJECT_ROOT, 'docs/architecture/SLO_CONFIG.json');
    expect(fs.existsSync(sloPath)).toBe(true);
    const slo = JSON.parse(fs.readFileSync(sloPath, 'utf-8'));
    expect(slo).toHaveProperty('payment_authorization');
    expect(slo.payment_authorization).toHaveProperty('burn_rate_multiplier');
    // Standard SRE: burn rate of 14.4x over 1h signals SLO is 100% consumed in 30 days
    expect(slo.payment_authorization.burn_rate_multiplier).toBeGreaterThanOrEqual(14);
  });

  // ─────────────────────────────────────────────────────────────
  // INV-4: Log retention — the logs table or an associated config
  // must document the 90-day hot / 1-year cold retention policy.
  // ─────────────────────────────────────────────────────────────
  test('[INV-4] platform.ts logs table MUST carry an @RETENTION annotation', () => {
    // Blueprint: 90 days hot, 1 year cold — must be documented on the schema
    expect(platformSchemaSource).toMatch(/@RETENTION|retention.*90|hot.*90|90.*day/i);
  });

  test('[INV-4] An observability config MUST define hot_retention_days = 90', () => {
    const obsCandidates = [
      path.join(PROJECT_ROOT, 'docs/architecture/OBSERVABILITY_CONFIG.json'),
      path.join(PROJECT_ROOT, 'infra/observability.json'),
    ];
    const obsPath = obsCandidates.find(p => fs.existsSync(p));
    expect(obsPath).toBeDefined();
    const config = JSON.parse(fs.readFileSync(obsPath!, 'utf-8'));
    expect(config.log_retention.hot_days).toBe(90);
    expect(config.log_retention.cold_days).toBeGreaterThanOrEqual(365);
  });
});
