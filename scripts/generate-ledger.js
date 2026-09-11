const fs = require('fs');
const path = require('path');

const verticals = [
  { id: '01', name: 'Public Core', brand: 'PaySurity.com', file: 'requirements/01_core/WEB_PUBLIC_WEBSITE.md', status: 'GREEN', blockers: 'None' },
  { id: '02', name: 'Merchant Services', brand: 'Onboarding/KYC/AML', file: 'requirements/02_merchant/MER_MERCHANT_SERVICES_ONBOARDING.md', status: 'GREEN', blockers: 'None' },
  { id: '03', name: 'Restaurant POS', brand: 'BistroBeast', file: 'requirements/03_restaurant/POSR_POS_RESTAURANT.md', status: 'GREEN', blockers: 'None' },
  { id: '04', name: 'Grocery POS', brand: 'GrocerEase', file: 'requirements/04_grocery/POSG_POS_GROCERY.md', status: 'GREEN', blockers: 'None' },
  { id: '05', name: 'Finance: Payroll', brand: 'PayPayroll', file: 'requirements/05_payroll/PAY_PAYROLL.md', status: 'GREEN', blockers: 'None' },
  { id: '06', name: 'Finance: Digital Wallets', brand: 'PayWallet', file: 'requirements/06_wallets/WAL_DIGITAL_WALLETS.md', status: 'GREEN', blockers: 'None' },
  { id: '07', name: 'Legal Tech', brand: 'LegalEdge', file: null, status: 'DEFERRED', blockers: 'IOLTA trust account compliance' },
  { id: '08', name: 'Healthcare: Dental', brand: 'Dental PMS', file: null, status: 'DEFERRED', blockers: 'HIPAA BAA framework' },
  { id: '09', name: 'Healthcare: Chiro', brand: 'Chiro PMS', file: null, status: 'DEFERRED', blockers: 'HIPAA BAA framework' },
  { id: '10', name: 'AI Microsites', brand: 'Industry Templates', file: 'requirements/10_microsites/MST_TENANT_MICROSITE.md', status: 'GREEN', blockers: 'None' },
  { id: '11', name: 'Internal Ops', brand: 'Super-Admin', file: 'requirements/11_internal/OPS_MANAGEMENT.md', status: 'GREEN', blockers: 'None' }
];

const ledger = verticals.map(v => {
  let text = '';
  if (v.file) {
    try {
      text = fs.readFileSync(path.join('c:/Projects/PaySurity', v.file), 'utf8');
    } catch (e) {
      text = `FILE NOT FOUND: ${v.file}`;
    }
  } else {
    text = `Deferred requirement: ${v.name}. Pending ${v.blockers}.`;
  }

  return {
    vertical_id: v.id,
    name: v.name,
    brand: v.brand,
    implementation_status: v.status,
    regulatory_blockers: v.blockers,
    full_text: text
  };
});

fs.writeFileSync('c:/Projects/PaySurity/requirements/MASTER_LEDGER.json', JSON.stringify({
  version: "1.0.0",
  last_updated: "2026-05-04",
  ledger: ledger
}, null, 2));

console.log('MASTER_LEDGER.json generated successfully.');
