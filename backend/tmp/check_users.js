const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: "postgresql://postgres:electrical@localhost:5432/sovereign_audit"
  });
  
  try {
    await client.connect();
    
    console.log("--- TENANTS ---");
    const tenantsRes = await client.query('SELECT name, slug FROM global.tenants');
    console.table(tenantsRes.rows);
    
    console.log("\n--- USERS ---");
    const usersRes = await client.query('SELECT email, role, full_name FROM users LIMIT 10');
    console.table(usersRes.rows);
    
  } catch (err) {
    console.error("Error querying database:", err);
  } finally {
    await client.end();
  }
}

checkUsers();
