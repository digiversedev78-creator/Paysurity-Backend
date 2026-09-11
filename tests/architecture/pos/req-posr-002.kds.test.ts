import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const kdsPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/kds.ts');
const posPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/pos.ts');

const kdsSource = fs.existsSync(kdsPath) ? fs.readFileSync(kdsPath, 'utf-8') : '';
const posSource = fs.existsSync(posPath) ? fs.readFileSync(posPath, 'utf-8') : '';

describe('TDA | REQ-POSR-002 | Kitchen Display System (KDS) Integration', () => {
  test('[INV-1] OrderItem.kds_status ∈ {UNFIRED, FIRED, PREPARING, READY, VOIDED}', () => {
    expect(posSource).toMatch(/pgEnum\('kds_status', \['UNFIRED', 'FIRED', 'PREPARING', 'READY', 'VOIDED'\]\)/i);
  });

  afterAll(async () => {
    await new Promise(r => setTimeout(r, 0));
  });
});
