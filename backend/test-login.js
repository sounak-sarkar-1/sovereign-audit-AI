
const axios = require('axios');

const TEST_USERS = {
  admin: { email: 'admin@test.com', password: 'TestPassword123!' },
  manager: { email: 'manager@test.com', password: 'TestPassword123!' },
  auditor: { email: 'auditor@test.com', password: 'TestPassword123!' },
  client: { email: 'client@test.com', password: 'TestPassword123!' },
};

async function testAllLogins() {
  for (const [role, creds] of Object.entries(TEST_USERS)) {
    try {
      console.log(`Testing ${role} login...`);
      const res = await axios.post('http://127.0.0.1:3000/api/v1/auth/login', {
        email: creds.email,
        password: creds.password
      }, {
        headers: {
          'X-Tenant-Slug': 'gt-bharat'
        }
      });
      console.log(`${role} Login Success:`, res.data.success);
    } catch (err) {
      console.error(`${role} Login Failed:`, err.response?.status || err.message);
    }
  }
}

testAllLogins();
