const { Client } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Try to find users table
    let res;
    try {
      res = await client.query('SELECT email, password_hash FROM test.users');
      console.log(`Found ${res.rows.length} users in test.users`);
    } catch (e) {
      console.log('test.users not found, trying public.users');
      res = await client.query('SELECT email, password_hash FROM users');
      console.log(`Found ${res.rows.length} users in public.users`);
    }
    
    const passwordsToTry = ['TemporaryPassword123!', 'Password@123', 'admin', 'password', 'Sovereign@123'];
    
    for (const row of res.rows) {
      console.log(`Checking user: ${row.email}, Hash: ${row.password_hash}`);
      for (const pwd of passwordsToTry) {
        const isMatch = await bcrypt.compare(pwd, row.password_hash);
        if (isMatch) {
          console.log(`MATCH FOUND! User: ${row.email}, Password: ${pwd}`);
        }
      }
    }

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();
