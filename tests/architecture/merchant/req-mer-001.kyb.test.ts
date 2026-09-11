import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const schemaPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/merchants.ts');
const schemaSource = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf-8') : '';

describe('TDA | REQ-MER-001 | Merchant Application & KYB Flow', () => {
  test('[INV-1] EIN must match the 9-digit US format XX-XXXXXXX', () => {
    // Blueprint states EIN must match the 9-digit US format.
    expect(schemaSource).toMatch(/check.*ein|check.*tax_id|sql.*~.*\\d\{2\}-\\d\{7\}/i);
  });

  test('[INV-2] Beneficial Ownership information must sum to exactly 100% equity distribution', () => {
    expect(schemaSource).toMatch(/beneficial_owners/i);
    expect(schemaSource).toMatch(/check.*equity.*100/i);
  });

  test('[INV-3] Application status must transition linearly', () => {
    expect(schemaSource).toMatch(/pgEnum.*DRAFT.*SUBMITTED.*IN_REVIEW/i);
  });

  test('[ERR-1] DUPLICATE_EIN: The provided tax ID is already registered in the system', () => {
    // Verify uniqueness constraint on tax_id
    expect(schemaSource).toMatch(/tax_id.*unique|ein.*unique/i);
  });
});
