import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function resetAll() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  const newHash = await bcrypt.hash('TemporaryPassword123!', 12);
  await client.query('UPDATE "users" SET "password_hash" = $1', [newHash]);
  console.log('All user passwords reset successfully');
  await client.end();
}

resetAll();
