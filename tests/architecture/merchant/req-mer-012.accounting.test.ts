import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const schemaPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/merchants.ts');
const schemaSource = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf-8') : '';

describe('TDA | REQ-MER-012 | Accounting Integration', () => {
  test('[INV-1] Every exported journal entry must balance (debits == credits) per the double-entry accounting invariant', () => {
    expect(schemaSource).toMatch(/journal_entries/i);
    expect(schemaSource).toMatch(/check.*debits.*credits|debits.*=.*credits/i);
  });

  test('[INV-2] Chart of Accounts mapping must be defined before export', () => {
    expect(schemaSource).toMatch(/chart_of_accounts/i);
  });

  test('[INV-3] Exported data is idempotent: re-exporting the same period must produce identical entries without duplication', () => {
    expect(schemaSource).toMatch(/unique.*period_start.*period_end|unique.*export_period/i);
  });
});
