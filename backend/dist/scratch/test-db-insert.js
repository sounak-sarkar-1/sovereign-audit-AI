"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
async function run() {
    const client = new pg_1.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const auditId = '9264fcd0-bc5a-4665-b1da-89a5edd29937';
    const auditorId = 'e9156763-43f5-4c27-84c7-dc1bd2c00333';
    const abuId = '2a76f6e5-4a61-460d-852a-99ae65c179c3';
    const abuRes = await client.query("SELECT id FROM audit_business_units WHERE audit_id = $1 LIMIT 1", [auditId]);
    if (abuRes.rows.length === 0) {
        console.error('No AuditBusinessUnit found for this audit');
        process.exit(1);
    }
    const validAbuId = abuRes.rows[0].id;
    try {
        console.log(`Attempting manual insert: auditId=${auditId}, auditorId=${auditorId}, abuId=${validAbuId}`);
        const res = await client.query(`
      INSERT INTO auditor_audit_assignments (audit_id, auditor_id, audit_business_unit_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [auditId, auditorId, validAbuId]);
        console.log('Insert successful:', JSON.stringify(res.rows[0], null, 2));
    }
    catch (err) {
        console.error('DATABASE ERROR:', err.message);
        if (err.detail)
            console.error('DETAIL:', err.detail);
        if (err.hint)
            console.error('HINT:', err.hint);
    }
    await client.end();
}
run().catch(console.error);
//# sourceMappingURL=test-db-insert.js.map