import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const payrollPath = path.join(PROJECT_ROOT, 'packages/database/src/schema/payroll.ts');
const payrollSource = fs.existsSync(payrollPath) ? fs.readFileSync(payrollPath, 'utf-8') : '';

describe('TDA | REQ-PAY-001 | Payroll Processing & Compliance', () => {
  test('[INV-1] Net Pay MUST equal Gross Pay minus Deductions and Taxes', () => {
    // Assert check constraint enforcing net pay calculation
    expect(payrollSource).toMatch(/net_pay\s*=\s*gross_pay\s*-\s*federal_tax\s*-\s*state_tax\s*-\s*fica_tax\s*-\s*other_deductions|gross_pay\s*-\s*\(?federal_tax\s*\+\s*state_tax\s*\+\s*fica_tax\s*\+\s*other_deductions\)?/i);
  });

  test('[INV-2] Net Pay MUST be >= 0', () => {
    // Assert check constraint enforcing net pay >= 0
    expect(payrollSource).toMatch(/net_pay\s*>=\s*0|check.*net_pay_positive/i);
  });

  test('[INV-3] Tax line items MUST use half-up rounding logic', () => {
    // Assert rounding annotation
    expect(payrollSource).toMatch(/@ROUNDING:\s*HALF_UP/i);
  });

  afterAll(async () => {
    await new Promise(r => setTimeout(r, 0));
  });
});
