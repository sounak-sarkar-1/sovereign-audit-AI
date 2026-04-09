import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    const res = await client.query('SELECT full_name, email, role FROM users');
    console.log('Users:', JSON.stringify(res.rows));

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
