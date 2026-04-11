"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function run() {
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const auditId = '9264fcd0-bc5a-4665-b1da-89a5edd29937';
    console.log('--- AUDIT BUSINESS UNITS ---');
    const abuRes = await client.query("SELECT id, business_unit_id FROM audit_business_units WHERE audit_id = $1", [auditId]);
    console.log(JSON.stringify(abuRes.rows, null, 2));
    console.log('\n--- AUDITOR ASSIGNMENTS ---');
    const assRes = await client.query("SELECT id, auditor_id, audit_business_unit_id, deleted_at FROM auditor_audit_assignments WHERE audit_id = $1", [auditId]);
    console.log(JSON.stringify(assRes.rows, null, 2));
    await client.end();
}
run().catch(console.error);
//# sourceMappingURL=debug-sync.js.map