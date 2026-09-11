const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api'; // Assuming default port
const ADMIN_ID = '22222222-0001-4000-a000-000000000001'; // From seed.ts

async function testEndpoint(path) {
  console.log(`\nTesting ${path}...`);
  try {
    const response = await axios.get(`${BASE_URL}${path}`, {
      headers: {
        'x-admin-id': ADMIN_ID
      }
    });
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, JSON.stringify(response.data).substring(0, 200) + '...');
  } catch (error) {
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Error:`, error.message);
    }
  }
}

async function run() {
  await testEndpoint('/admin/tenants');
  await testEndpoint('/admin/metrics');
  await testEndpoint('/tenants'); // The other tenants endpoint I found
}

run();
