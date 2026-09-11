/**
 * TDA AUDIT SCRIPT: REQ-NFR-003 — Backup & Disaster Recovery
 * Blueprint Domain: Non-Functional Requirements
 *
 * MANDATE: Verify that the infrastructure layer encodes the backup and DR
 * invariants defined in the blueprint as machine-readable configuration.
 *
 * INVARIANTS UNDER TEST:
 *   [INV-1] RPO < 1 hour for all financial ledger data
 *   [INV-2] RTO < 4 hours for full platform restoration
 *   [INV-3] Backups encrypted at rest (AES-256) in a geographically separate region
 *   [INV-4] Backup integrity verified via weekly restore-and-checksum tests
 *
 * EXPECTED RESULT: FAIL — No DR configuration exists in the repository.
 * These tests document the gap between blueprint requirements and current state.
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

// Expected infrastructure files that should encode DR policy
const DR_CONFIG_CANDIDATES = [
  path.join(PROJECT_ROOT, 'infra/dr.config.json'),
  path.join(PROJECT_ROOT, 'infra/backup.config.json'),
  path.join(PROJECT_ROOT, 'docs/architecture/DR_CONFIG.json'),
  path.join(PROJECT_ROOT, '.infra/dr-policy.json'),
];

const BACKUP_SCRIPT_CANDIDATES = [
  path.join(PROJECT_ROOT, 'scripts/backup.sh'),
  path.join(PROJECT_ROOT, 'scripts/db-backup.ts'),
  path.join(PROJECT_ROOT, 'infra/scripts/backup.sh'),
];

describe('TDA | REQ-NFR-003 | Backup & Disaster Recovery', () => {

  // ─────────────────────────────────────────────────────────────
  // [INV-1] RPO — A machine-readable DR config must declare
  // the RPO for financial ledger data as < 3600 seconds (1 hour).
  // ─────────────────────────────────────────────────────────────
  test('[INV-1] A DR config file MUST exist in the repository', () => {
    const exists = DR_CONFIG_CANDIDATES.some(p => fs.existsSync(p));
    expect(exists).toBe(true);
  });

  test('[INV-1] DR config MUST define rpo_seconds <= 3600 for financial_ledger', () => {
    const drConfigPath = DR_CONFIG_CANDIDATES.find(p => fs.existsSync(p));
    expect(drConfigPath).toBeDefined();

    const config = JSON.parse(fs.readFileSync(drConfigPath!, 'utf-8'));
    expect(config).toHaveProperty('financial_ledger');
    expect(config.financial_ledger).toHaveProperty('rpo_seconds');
    expect(config.financial_ledger.rpo_seconds).toBeLessThanOrEqual(3600);
  });

  // ─────────────────────────────────────────────────────────────
  // [INV-2] RTO — DR config must declare RTO < 4 hours (14400 seconds)
  // ─────────────────────────────────────────────────────────────
  test('[INV-2] DR config MUST define rto_seconds <= 14400 for full platform recovery', () => {
    const drConfigPath = DR_CONFIG_CANDIDATES.find(p => fs.existsSync(p));
    expect(drConfigPath).toBeDefined();

    const config = JSON.parse(fs.readFileSync(drConfigPath!, 'utf-8'));
    expect(config).toHaveProperty('platform');
    expect(config.platform).toHaveProperty('rto_seconds');
    expect(config.platform.rto_seconds).toBeLessThanOrEqual(14400);
  });

  // ─────────────────────────────────────────────────────────────
  // [INV-3] Encryption — backups must specify AES-256 encryption
  // and a geographically separate storage region.
  // ─────────────────────────────────────────────────────────────
  test('[INV-3] DR config MUST specify AES-256 encryption for backups', () => {
    const drConfigPath = DR_CONFIG_CANDIDATES.find(p => fs.existsSync(p));
    expect(drConfigPath).toBeDefined();

    const config = JSON.parse(fs.readFileSync(drConfigPath!, 'utf-8'));
    expect(config).toHaveProperty('encryption');
    expect(config.encryption.algorithm).toBe('AES-256');
  });

  test('[INV-3] DR config MUST specify a geographically separate backup_region', () => {
    const drConfigPath = DR_CONFIG_CANDIDATES.find(p => fs.existsSync(p));
    expect(drConfigPath).toBeDefined();

    const config = JSON.parse(fs.readFileSync(drConfigPath!, 'utf-8'));
    expect(config).toHaveProperty('backup_region');
    // backup_region must differ from primary_region
    expect(config.backup_region).not.toBe(config.primary_region);
  });

  // ─────────────────────────────────────────────────────────────
  // [INV-4] Backup integrity — a backup script or scheduled job
  // must exist and reference checksum verification.
  // ─────────────────────────────────────────────────────────────
  test('[INV-4] A backup script MUST exist in the repository', () => {
    const exists = BACKUP_SCRIPT_CANDIDATES.some(p => fs.existsSync(p));
    expect(exists).toBe(true);
  });

  test('[INV-4] Backup script MUST reference checksum verification', () => {
    const backupScriptPath = BACKUP_SCRIPT_CANDIDATES.find(p => fs.existsSync(p));
    expect(backupScriptPath).toBeDefined();

    const src = fs.readFileSync(backupScriptPath!, 'utf-8');
    expect(src).toMatch(/checksum|md5|sha256|verify.*backup|backup.*verify/i);
  });

  test('[INV-4] DR config MUST specify weekly backup integrity testing schedule', () => {
    const drConfigPath = DR_CONFIG_CANDIDATES.find(p => fs.existsSync(p));
    expect(drConfigPath).toBeDefined();

    const config = JSON.parse(fs.readFileSync(drConfigPath!, 'utf-8'));
    expect(config).toHaveProperty('integrity_test_schedule');
    // Must be weekly or more frequent — expressed as cron or literal 'weekly'
    expect(config.integrity_test_schedule).toMatch(/weekly|0 0 \* \* 0|0 \* \* \* 0/i);
  });
});
