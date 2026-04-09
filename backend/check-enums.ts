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
    
    const res = await client.query("SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'notification_type'");
    console.log('Enum values:', JSON.stringify(res.rows.map(r => r.enumlabel)));

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
