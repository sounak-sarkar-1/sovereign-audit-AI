"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function run() {
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('--- AUDIT INFO ---');
    const auditRes = await client.query("SELECT id, name, manager_id, status FROM audits WHERE id = '9264fcd0-bc5a-4665-b1da-89a5edd29937'");
    console.log(JSON.stringify(auditRes.rows[0], null, 2));
    if (auditRes.rows.length > 0) {
        const managerId = auditRes.rows[0].manager_id;
        console.log('\n--- MANAGER INFO ---');
        const managerRes = await client.query("SELECT id, full_name, email FROM users WHERE id = $1", [managerId]);
        console.log(JSON.stringify(managerRes.rows[0], null, 2));
        console.log('\n--- MAPPED AUDITORS ---');
        const mappingRes = await client.query(`
      SELECT m.auditor_id, u.full_name, u.email, m.deleted_at 
      FROM manager_auditor_mappings m
      JOIN users u ON m.auditor_id = u.id
      WHERE m.manager_id = $1
    `, [managerId]);
        console.log(JSON.stringify(mappingRes.rows, null, 2));
    }
    console.log('\n--- ALL AUDITORS ---');
    const auditorRes = await client.query("SELECT id, full_name, email FROM users WHERE role = 'auditor'");
    console.log(JSON.stringify(auditorRes.rows, null, 2));
    await client.end();
}
run().catch(console.error);
//# sourceMappingURL=debug-assignment.js.map