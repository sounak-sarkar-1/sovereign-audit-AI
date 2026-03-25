import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('Connecting...');
    await client.connect();
    
    const tenants = await client.query('SELECT * FROM "global"."tenants"');
    console.log(JSON.stringify(tenants.rows, null, 2));
    
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
