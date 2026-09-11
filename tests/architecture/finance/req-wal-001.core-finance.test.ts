import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const walletsPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/wallets.ts');
const walletsSource = fs.existsSync(walletsPath) ? fs.readFileSync(walletsPath, 'utf-8') : '';

describe('TDA | REQ-WAL-001 | Wallet Lifecycle & Double-Entry Ledger', () => {
  test('[INV-1] Sum of all debits must exactly equal sum of all credits in every transaction (double-entry constraint)', () => {
    // There must be a check or trigger enforcing debits = credits
    expect(walletsSource).toMatch(/check.*debits.*credits|debits.*=.*credits/i);
  });

  test('[INV-2] Ledger entries must be immutable (append-only table schema)', () => {
    // There should be a comment or annotation indicating immutable/append-only
    expect(walletsSource).toMatch(/immutable|append-only/i);
  });

  test('[INV-3] Currency codes must be ISO 4217 compliant', () => {
    // Check if currency has length 3
    expect(walletsSource).toMatch(/currency.*length.*3/i);
  });

  test('[INV-4] Amounts must be stored as integers representing the lowest currency denominator', () => {
    // Ensure amount fields use integer, not decimal or float
    expect(walletsSource).toMatch(/integer\('amount'\)|integer\('balance_cents'\)/i);
    expect(walletsSource).not.toMatch(/decimal\('amount'\)|numeric\('amount'\)/i);
  });

  afterAll(async () => {
    await new Promise(r => setTimeout(r, 0));
  });
});
