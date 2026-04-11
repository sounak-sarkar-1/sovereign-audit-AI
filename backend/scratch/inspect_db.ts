import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const tenants = await client.query('SELECT * FROM global.tenants');
    console.log('--- GLOBAL TENANTS ---');
    console.table(tenants.rows);

    const schemas = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'");
    console.log('\n--- USERS PER SCHEMA ---');
    for (const row of schemas.rows) {
      const schema = row.schema_name;
      const users = await client.query(`SELECT email, role FROM ${schema}.users`);
      console.log(`Users in ${schema}:`);
      console.table(users.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
