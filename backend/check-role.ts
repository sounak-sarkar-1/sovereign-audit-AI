import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT role FROM users WHERE email = 'manager1@test.com'");
    console.log('ROLE:' + res.rows[0].role);
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
