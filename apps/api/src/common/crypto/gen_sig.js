const crypto = require('crypto');

const STUB_PREFIX    = 'mldsa-fips204-stub';
const ALGORITHM_TAG  = 'ML-DSA-65';
const HASH_ALGORITHM = 'sha256';

function sign(payload, tenant = 'unknown') {
  const digest = crypto.createHash(HASH_ALGORITHM).update(payload).digest('hex');
  return `${STUB_PREFIX}::${tenant}::${digest}::${ALGORITHM_TAG}`;
}

const payload = JSON.stringify({"orderId": "FINAL-SEAL-13f291b", "amount": 10.00, "tenant": "shareholder-demo"});
const signature = sign(payload, 'shareholder-demo');

console.log('Payload:', payload);
console.log('Signature:', signature);
