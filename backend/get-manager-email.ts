import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const res = await client.query("SELECT email FROM users WHERE full_name = 'Manager One' LIMIT 1");
    if (res.rows.length > 0) {
      console.log('EMAIL:' + res.rows[0].email);
    } else {
      const res2 = await client.query("SELECT email FROM users WHERE role = 'manager' LIMIT 1");
      if (res2.rows.length > 0) {
        console.log('EMAIL:' + res2.rows[0].email);
      }
    }
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
