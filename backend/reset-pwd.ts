import * as bcrypt from 'bcrypt';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function reset() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  const newHash = await bcrypt.hash('TemporaryPassword123!', 12);
  await client.query('UPDATE "users" SET "password_hash" = $1 WHERE "email" = $2', [newHash, 'admin@sovereign.ai']);
  console.log('Password reset successfully for admin@sovereign.ai');
  await client.end();
}

reset();
