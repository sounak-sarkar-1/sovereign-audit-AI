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
    console.log('Connecting with 5s timeout...');
    await client.connect();
    console.log('Connected to database');
    
    const res = await client.query('SELECT nspname FROM pg_catalog.pg_namespace');
    console.log('Schemas:', res.rows.map(r => r.nspname).join(', '));
    
    await client.end();
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}

check();
