import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const posPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/pos.ts');
const tablesPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/restaurant_tables.ts');

const posSource = fs.existsSync(posPath) ? fs.readFileSync(posPath, 'utf-8') : '';
const tablesSource = fs.existsSync(tablesPath) ? fs.readFileSync(tablesPath, 'utf-8') : '';

describe('TDA | REQ-POSR-001 | Core Order Management & Table Workflow', () => {
  test('[INV-1] Order state must follow: OPEN -> FIRED -> BILLED -> PAID -> CLOSED', () => {
    // Assert there's a strict pgEnum or check enforcing exactly these states
    expect(posSource).toMatch(/pgEnum\('order_status', \['OPEN', 'FIRED', 'BILLED', 'PAID', 'CLOSED'\]\)|check.*OPEN.*FIRED.*BILLED.*PAID.*CLOSED/i);
  });

  test('[INV-2] Table status must be mutually exclusive', () => {
    // Assert status enum or checks
    expect(tablesSource).toMatch(/pgEnum\('table_status', \['AVAILABLE', 'OCCUPIED', 'BILLED', 'CLEANING'\]\)/i);
  });

  afterAll(async () => {
    await new Promise(r => setTimeout(r, 0));
  });
});
