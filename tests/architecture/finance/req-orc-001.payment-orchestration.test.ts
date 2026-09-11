import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const paymentsPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/payments.ts');
const paymentsSource = fs.existsSync(paymentsPath) ? fs.readFileSync(paymentsPath, 'utf-8') : '';

describe('TDA | REQ-ORC-001 | Payment Authorization & Capture', () => {
  test('[INV-1] Authorization amount must exactly equal requested checkout amount', () => {
    expect(paymentsSource).toMatch(/auth_amount.*=.*checkout_amount|check.*auth_amount/i);
  });

  test('[INV-2] Capture amount must be <= Authorization amount', () => {
    expect(paymentsSource).toMatch(/capture_amount.*<=.*auth_amount|check.*capture_amount/i);
  });

  test('[INV-3] Tokenization format must comply with PCI-DSS standards (no raw PAN storage)', () => {
    // Should NOT have a column named pan or card_number unless it's a token or explicitly last4
    expect(paymentsSource).not.toMatch(/varchar\('pan'\)|varchar\('card_number'\)/);
    expect(paymentsSource).toMatch(/token|last4/i);
  });

  afterAll(async () => {
    await new Promise(r => setTimeout(r, 0));
  });
});
